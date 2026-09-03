---
title: '西电CTF MoeCTF 2025 PWN 3 认识libc'
date: '2026-09-03T21:06:05+08:00'
lastmod: '2026-09-03T21:06:05+08:00'
summary: ""
hideSummary: true
draft: true
author: "QingKong996"
categories:
  - ""
tags:
  - ""
---

```
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=928)

根据题目提示，本题是ret2libc[^CTF Wiki]

依旧还是塞进IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  setup(argc, argv, envp);
  puts("The Oracle speaks...");
  puts("There is no system function in the .text segment.");
  printf("A gift of forbidden knowledge, the location of 'printf': %p\n", &printf);
  vuln();
  return 0;
}
```

```c
ssize_t vuln()
{
  char buf[64]; // [rsp+0h] [rbp-40h] BYREF

  puts("\nNow, show me what you can do with this knowledge:");
  printf("> ");
  return read(0, buf, 0x100uLL);
}
```



这里给定了printf的地址，可以算出libc的基址然后再次偏移













[^CTF Wiki]:[ret2libc](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/#ret2libc)
