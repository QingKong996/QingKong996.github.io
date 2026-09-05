---
title: 'XiDianCTF MoeCTF 2025 PWN Randomlock'
date: '2026-09-05T08:48:03+08:00'
lastmod: '2026-09-05T08:48:03+08:00'
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

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=893)

As usual, open the binary in IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v4; // [rsp+Ch] [rbp-14h] BYREF
  unsigned int i; // [rsp+10h] [rbp-10h]
  int v6; // [rsp+14h] [rbp-Ch]
  unsigned __int64 v7; // [rsp+18h] [rbp-8h]

  v7 = __readfsqword(0x28u);
  init(argc, argv, envp);
  initseed();
  srand(seed);
  puts("My lock looks strange—can you help me?");
  for ( i = 1; (int)i <= 10; ++i )
  {
    printf("password %d\n>", i);
    v6 = rand() % 10000;
    __isoc99_scanf("%d", &v4);
    if ( v6 != v4 )
      lose();
  }
  win();
  return 0;
}
```

Examine `initseed()`.

```c
__int64 initseed()
{
  __int64 result; // rax
  int i; // [rsp+8h] [rbp-8h]
  int fd; // [rsp+Ch] [rbp-4h]

  fd = open("/dev/urandom", 0, 0LL);
  if ( fd < 0 )
  {
    puts("urandom");
    exit(1);
  }
  read(fd, &seed, 3uLL);
  close(fd);
  seed = seed % 0x64 + 1;
  for ( i = 1; i <= 120; ++i )
    change();
  while ( 1 )
  {
    result = seed & 1;
    if ( (seed & 1) != 0 )
      break;
    change();
  }
  return result;
}
```

Notice `seed = seed % 0x64 + 1`.

Also:

```c
__int64 change()
{
  __int64 result; // rax

  if ( (seed & 1) != 0 )
  {
    result = 3 * seed + 1;
    seed = 3 * seed + 1;
  }
  else
  {
    result = seed >> 1;
    seed >>= 1;
  }
  return result;
}
```

Here, `seed` has only `0x64` possible values, and the subsequent `change()` operation is deterministic, so we can brute-force the seed.

We can then use the `ctypes` library to generate the random numbers.

> Halfway through writing the brute-force code, I noticed:
>
> ```c
>   while ( 1 )
>   {
>     result = seed & 1;
>     if ( (seed & 1) != 0 )
>       break;
>     change();
>   }
> 	return result;
> ```
>
> This can only return `1`. We had been tricked all along!



So we can simply use `1` as the seed.

Pwntools script:

```python
from pwn import *
import ctypes
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 38141)


libc = ctypes.CDLL("libc.so.6")

libc.srand(1)

for i in range(10):
    rand = libc.rand() % 10000;
    print(rand)
    io.sendline(str(rand).encode())



io.interactive()
```

Output:

```
9383
886
2777
6915
7793
8335
5386
492
6649
1421
My lock looks strange—can you help me?
password 1
>password 2
>password 3
>password 4
>password 5
>password 6
>password 7
>password 8
>password 9
>password 10
>It opened—how did you do that?
moectf{THIS_IS_FLAG}
```

