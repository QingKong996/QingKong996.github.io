# Blog

Static blog built with Next.js 16, MDX content, and Pagefind search.

## Stack

- Next.js App Router, React 19, TypeScript
- Tailwind CSS 4, MDX, KaTeX
- Pagefind, RSS 2.0

## Structure

- `content/posts/`: posts
- `content/works/`: projects
- `src/app/`: routes and pages
- `src/lib/`: content loading, MDX rendering, RSS generation

## Development

Node.js 22 is required.

```bash
npm ci
npm run dev
```

## Commands

```bash
npm run lint
npm run test
npm run build
```

`npm run build` exports the static site to `out/` and generates the Pagefind index in `out/pagefind/`.

## Output

- `out/`: static site
- `out/pagefind/`: search index
- `/rss.xml`: RSS 2.0 feed
- `public/CNAME`: custom domain
