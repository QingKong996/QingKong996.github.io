import html
import json
import os
import re
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUILD_DIR = ROOT / ".tmp-seo-test"
CACHE_DIR = ROOT / ".hugo_cache_test"


def run_hugo_build() -> None:
    if BUILD_DIR.exists():
        shutil.rmtree(BUILD_DIR)

    CACHE_DIR.mkdir(exist_ok=True)
    env = os.environ.copy()
    env["HUGO_CACHEDIR"] = str(CACHE_DIR)

    subprocess.run(
        [
            "hugo",
            "--environment",
            "production",
            "--destination",
            str(BUILD_DIR),
        ],
        cwd=ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_meta(html_text: str, attr_name: str, attr_value: str) -> str:
    pattern = rf'<meta[^>]+{attr_name}="{re.escape(attr_value)}"[^>]+content="([^"]*)"'
    match = re.search(pattern, html_text)
    if not match:
        raise AssertionError(f"missing meta tag: {attr_name}={attr_value}")
    return html.unescape(match.group(1))


def extract_canonical(html_text: str) -> str:
    match = re.search(r'<link rel="canonical" href="([^"]+)"', html_text)
    if not match:
        raise AssertionError("missing canonical link")
    return html.unescape(match.group(1))


def extract_json_ld(html_text: str) -> list[dict]:
    blocks = re.findall(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
        html_text,
        flags=re.S,
    )
    if not blocks:
        raise AssertionError("missing JSON-LD blocks")

    return [json.loads(html.unescape(block)) for block in blocks]


class SeoOutputTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        run_hugo_build()
        cls.home_html = read_text(BUILD_DIR / "index.html")
        cls.post_html = read_text(BUILD_DIR / "posts" / "hello-world" / "index.html")

    @classmethod
    def tearDownClass(cls) -> None:
        if BUILD_DIR.exists():
            shutil.rmtree(BUILD_DIR)
        if CACHE_DIR.exists():
            shutil.rmtree(CACHE_DIR)

    def test_cname_matches_custom_domain(self) -> None:
        cname = read_text(ROOT / "static" / "CNAME").strip()
        self.assertEqual(cname, "qingkong996.com")

    def test_homepage_uses_custom_domain_and_descriptive_meta(self) -> None:
        self.assertEqual(extract_canonical(self.home_html), "https://qingkong996.com/")
        self.assertEqual(
            extract_meta(self.home_html, "property", "og:url"),
            "https://qingkong996.com/",
        )
        self.assertIn(
            "<title>QingKong996 | 开发实践、工具折腾与值得留下来的想法</title>",
            self.home_html,
        )
        description = extract_meta(self.home_html, "name", "description")
        self.assertIn("记录开发实践、工具折腾和一些值得留下来的想法", description)
        self.assertNotIn("用于展示和验证 LaTeX", self.home_html)

    def test_homepage_json_ld_is_valid_and_author_centric(self) -> None:
        payloads = extract_json_ld(self.home_html)
        by_type = {payload["@type"]: payload for payload in payloads}

        person = by_type["Person"]
        self.assertEqual(person["name"], "QingKong996")
        self.assertEqual(person["url"], "https://qingkong996.com/")
        self.assertNotIn("mailto:qingkong996@gmail.com", person.get("sameAs", []))

        website = by_type["WebSite"]
        self.assertEqual(website["url"], "https://qingkong996.com/")
        self.assertIn("开发实践", website["description"])

    def test_post_json_ld_is_valid_and_uses_custom_domain(self) -> None:
        self.assertEqual(
            extract_canonical(self.post_html),
            "https://qingkong996.com/posts/hello-world/",
        )

        payloads = extract_json_ld(self.post_html)
        by_type = {payload["@type"]: payload for payload in payloads}

        breadcrumb = by_type["BreadcrumbList"]
        self.assertEqual(breadcrumb["itemListElement"][-1]["item"], "https://qingkong996.com/posts/hello-world/")

        blog_post = by_type["BlogPosting"]
        self.assertEqual(
            blog_post["mainEntityOfPage"]["@id"],
            "https://qingkong996.com/posts/hello-world/",
        )
        self.assertEqual(blog_post["author"]["name"], "QingKong996")
        self.assertEqual(blog_post["publisher"]["@type"], "Person")


if __name__ == "__main__":
    unittest.main()
