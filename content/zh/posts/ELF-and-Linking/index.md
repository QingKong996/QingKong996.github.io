---
title: 'ELF and Linking'
date: '2026-09-07T16:19:29+08:00'
lastmod: '2026-09-07T16:19:29+08:00'
summary: ""
hideSummary: true
draft: true
author: "QingKong996"
categories:
  - ""
tags:
  - ""
---

```
本文为人工撰写，仅使用生成式AI校对。
```

我们使用`Hello World!`来进行研究。

```c
#include <stdio.h>

int main(){
	printf("Hello world!\n");
	return 0;
}
```

编译。

```shell
gcc main.c -o main.out -O0 -g -no-pie
```

使用`readelf`先查看`ELF Header`有什么。

```shell
readelf -h main.out
```

得到:

```
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x401050
  Start of program headers:          64 (bytes into file)
  Start of section headers:          14632 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         13
  Size of section headers:           64 (bytes)
  Number of section headers:         37
  Section header string table index: 36
```

>  `ELF Header`数据结构[^ELF Header]，这里不再赘述。

注意到这里存放了`Program Header Table`和`Section Header Table`的起始地址和每条键值对的大小与数量。



我们下面来查看`Program Header`和`Section Header`。

首先是`Program Header`:

```
readelf -l main.out
```

```
Elf file type is EXEC (Executable file)
Entry point 0x401050
There are 13 program headers, starting at offset 64

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x00000000000002d8 0x00000000000002d8  R      0x8
  INTERP         0x0000000000000318 0x0000000000400318 0x0000000000400318
                 0x000000000000001c 0x000000000000001c  R      0x1
      [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000004f8 0x00000000000004f8  R      0x1000
  LOAD           0x0000000000001000 0x0000000000401000 0x0000000000401000
                 0x0000000000000179 0x0000000000000179  R E    0x1000
  LOAD           0x0000000000002000 0x0000000000402000 0x0000000000402000
                 0x00000000000000ec 0x00000000000000ec  R      0x1000
  LOAD           0x0000000000002df8 0x0000000000403df8 0x0000000000403df8
                 0x0000000000000220 0x0000000000000228  RW     0x1000
  DYNAMIC        0x0000000000002e08 0x0000000000403e08 0x0000000000403e08
                 0x00000000000001d0 0x00000000000001d0  RW     0x8
  NOTE           0x0000000000000338 0x0000000000400338 0x0000000000400338
                 0x0000000000000030 0x0000000000000030  R      0x8
  NOTE           0x0000000000000368 0x0000000000400368 0x0000000000400368
                 0x0000000000000044 0x0000000000000044  R      0x4
  GNU_PROPERTY   0x0000000000000338 0x0000000000400338 0x0000000000400338
                 0x0000000000000030 0x0000000000000030  R      0x8
  GNU_EH_FRAME   0x0000000000002014 0x0000000000402014 0x0000000000402014
                 0x0000000000000034 0x0000000000000034  R      0x4
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     0x10
  GNU_RELRO      0x0000000000002df8 0x0000000000403df8 0x0000000000403df8
                 0x0000000000000208 0x0000000000000208  R      0x1

 Section to Segment mapping:
  Segment Sections...
   00
   01     .interp
   02     .interp .note.gnu.property .note.gnu.build-id .note.ABI-tag .gnu.hash .dynsym .dynstr .gnu.version .gnu.version_r .rela.dyn .rela.plt
   03     .init .plt .plt.sec .text .fini
   04     .rodata .eh_frame_hdr .eh_frame
   05     .init_array .fini_array .dynamic .got .got.plt .data .bss
   06     .dynamic
   07     .note.gnu.property
   08     .note.gnu.build-id .note.ABI-tag
   09     .note.gnu.property
   10     .eh_frame_hdr
   11
   12     .init_array .fini_array .dynamic .got
```

> `Program Header`数据结构[^Program Header]，这里不再赘述。
>
> 下面的` Section to Segment mapping:`给出每个`Segment`覆盖了哪些`Section`。

然后是`Section Header`:

```shell
readelf -S main.out
```

```
There are 37 section headers, starting at offset 0x3928:

Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .interp           PROGBITS         0000000000400318  00000318
       000000000000001c  0000000000000000   A       0     0     1
  [ 2] .note.gnu.pr[...] NOTE             0000000000400338  00000338
       0000000000000030  0000000000000000   A       0     0     8
  [ 3] .note.gnu.bu[...] NOTE             0000000000400368  00000368
       0000000000000024  0000000000000000   A       0     0     4
  [ 4] .note.ABI-tag     NOTE             000000000040038c  0000038c
       0000000000000020  0000000000000000   A       0     0     4
  [ 5] .gnu.hash         GNU_HASH         00000000004003b0  000003b0
       000000000000001c  0000000000000000   A       6     0     8
  [ 6] .dynsym           DYNSYM           00000000004003d0  000003d0
       0000000000000060  0000000000000018   A       7     1     8
  [ 7] .dynstr           STRTAB           0000000000400430  00000430
       0000000000000048  0000000000000000   A       0     0     1
  [ 8] .gnu.version      VERSYM           0000000000400478  00000478
       0000000000000008  0000000000000002   A       6     0     2
  [ 9] .gnu.version_r    VERNEED          0000000000400480  00000480
       0000000000000030  0000000000000000   A       7     1     8
  [10] .rela.dyn         RELA             00000000004004b0  000004b0
       0000000000000030  0000000000000018   A       6     0     8
  [11] .rela.plt         RELA             00000000004004e0  000004e0
       0000000000000018  0000000000000018  AI       6    24     8
  [12] .init             PROGBITS         0000000000401000  00001000
       000000000000001b  0000000000000000  AX       0     0     4
  [13] .plt              PROGBITS         0000000000401020  00001020
       0000000000000020  0000000000000010  AX       0     0     16
  [14] .plt.sec          PROGBITS         0000000000401040  00001040
       0000000000000010  0000000000000010  AX       0     0     16
  [15] .text             PROGBITS         0000000000401050  00001050
       000000000000011b  0000000000000000  AX       0     0     16
  [16] .fini             PROGBITS         000000000040116c  0000116c
       000000000000000d  0000000000000000  AX       0     0     4
  [17] .rodata           PROGBITS         0000000000402000  00002000
       0000000000000011  0000000000000000   A       0     0     4
  [18] .eh_frame_hdr     PROGBITS         0000000000402014  00002014
       0000000000000034  0000000000000000   A       0     0     4
  [19] .eh_frame         PROGBITS         0000000000402048  00002048
       00000000000000a4  0000000000000000   A       0     0     8
  [20] .init_array       INIT_ARRAY       0000000000403df8  00002df8
       0000000000000008  0000000000000008  WA       0     0     8
  [21] .fini_array       FINI_ARRAY       0000000000403e00  00002e00
       0000000000000008  0000000000000008  WA       0     0     8
  [22] .dynamic          DYNAMIC          0000000000403e08  00002e08
       00000000000001d0  0000000000000010  WA       7     0     8
  [23] .got              PROGBITS         0000000000403fd8  00002fd8
       0000000000000010  0000000000000008  WA       0     0     8
  [24] .got.plt          PROGBITS         0000000000403fe8  00002fe8
       0000000000000020  0000000000000008  WA       0     0     8
  [25] .data             PROGBITS         0000000000404008  00003008
       0000000000000010  0000000000000000  WA       0     0     8
  [26] .bss              NOBITS           0000000000404018  00003018
       0000000000000008  0000000000000000  WA       0     0     1
  [27] .comment          PROGBITS         0000000000000000  00003018
       000000000000002d  0000000000000001  MS       0     0     1
  [28] .debug_aranges    PROGBITS         0000000000000000  00003045
       0000000000000030  0000000000000000           0     0     1
  [29] .debug_info       PROGBITS         0000000000000000  00003075
       00000000000000ac  0000000000000000           0     0     1
  [30] .debug_abbrev     PROGBITS         0000000000000000  00003121
       000000000000005d  0000000000000000           0     0     1
  [31] .debug_line       PROGBITS         0000000000000000  0000317e
       0000000000000066  0000000000000000           0     0     1
  [32] .debug_str        PROGBITS         0000000000000000  000031e4
       00000000000000dd  0000000000000001  MS       0     0     1
  [33] .debug_line_str   PROGBITS         0000000000000000  000032c1
       0000000000000021  0000000000000001  MS       0     0     1
  [34] .symtab           SYMTAB           0000000000000000  000032e8
       0000000000000330  0000000000000018          35    18     8
  [35] .strtab           STRTAB           0000000000000000  00003618
       00000000000001a0  0000000000000000           0     0     1
  [36] .shstrtab         STRTAB           0000000000000000  000037b8
       000000000000016f  0000000000000000           0     0     1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), O (extra OS processing required), G (group), T (TLS),
  C (compressed), x (unknown), o (OS specific), E (exclude),
  D (mbind), l (large), p (processor specific)
```

>  Section Header数据结构[^Section Header]。

​	到这里大致的ELF的结构和构成已经差不多了，下面探究一些细节。



#### 动态链接

依旧是`Hello World!`示例程序。

但这里我们循环输出10次。

```c
#include <stdio.h>

int main(){

    for(int i = 0; i < 10; ++i){
        printf("Hello world!\n");
    }

	return 0;
}
```

其中`printf()`函数是调用了`libc.so.6`的`put()`函数。

我们使用`pwngdb`来跟踪整个过程。

```assembly
   0x40113e <main+8>     lea    rax, [rip + 0xebf]     RAX => 0x402004 ◂— 'Hello world!'
b+ 0x401145 <main+15>    mov    rdi, rax               RDI => 0x402004 ◂— 'Hello world!'
 ► 0x401148 <main+18>    call   puts@plt                    <puts@plt>
        s: 0x402004 ◂— 'Hello world!'

   0x40114d <main+23>    mov    eax, 0                 EAX => 0
   0x401152 <main+28>    pop    rbp
   0x401153 <main+29>    ret
```

步入`puts@plt`。

```
 0x401040       <puts@plt>                        endbr64
   0x401044       <puts@plt+4>                      jmp    qword ptr [rip + 0x2fb6]    <0x401030>
    ↓
   0x401030                                         endbr64
   0x401034                                         push   0
   0x401039                                         jmp    0x401020                    <0x401020>
    ↓
   0x401020                                         push   qword ptr [rip + 0x2fca]
   0x401026                                         jmp    qword ptr [rip + 0x2fcc]    <_dl_runtime_resolve_xsavec>
    ↓
   0x7ffff7fda2f0 <_dl_runtime_resolve_xsavec>      endbr64
   0x7ffff7fda2f4 <_dl_runtime_resolve_xsavec+4>    push   rbx
   0x7ffff7fda2f5 <_dl_runtime_resolve_xsavec+5>    mov    rbx, rsp                    RBX => 0x7fffffffd660 —▸ 0x7fffffffd7b8 —▸ 0x7fffffffda74 ◂— ...
   0x7ffff7fda2f8 <_dl_runtime_resolve_xsavec+8>    and    rsp, 0xffffffffffffffc0     RSP => 0x7fffffffd640 (0x7fffffffd660 & -0x40)
```

可以清楚的看到第一次的调用过程。

首先跳转到`puts@plt`。

然后。

```assembly
   0x401044       <puts@plt+4>                      jmp    qword ptr [rip + 0x2fb6]    <0x401030>
```

> 这里的目标地址`rip + 0x2fb6 = 0x401044 + 0x2fb6 = 0x403ffa`。
>
> ```assembly
>   [24] .got.plt          PROGBITS         0000000000403fe8  00002fe8
>        0000000000000020  0000000000000008  WA       0     0     8
> ```
>
> 处于`.got.plt`节。	

读取 `puts@GOT` 表项中保存的地址，并跳转到该地址。

注意到随后两次跳转都处于`.plt`节中。

> ```assembly
> [13] .plt              PROGBITS         0000000000401020  00001020
>        0000000000000020  0000000000000010  AX       0     0     16
> ```
>
> 其中第一次跳转到`lazy-binding stub`，第二次跳转到`PLT0`(动态函数共享的入口，最终跳转到`_dl_runtime_resolve`)

> `.plt` , `.got` , `.plt.got`, `.got.plt`, `.plt.sec`
>
> `.plt`即`Procedure Linkage Table`:
>
> > 大概是这样的:
> >
> > ```assembly
> > puts@plt:
> >  jmp qword ptr [puts@GOTPLT]
> >  push relocation_index
> >  jmp PLT0
> > ```
> >
> > 读取 `puts@GOT` 表项中保存的地址，并跳转到该地址。
> >
> > > 第一次调用时，`puts@GOTPLT` 还没有保存真正的 `puts` 地址。动态链接器会预先把这个 GOTPLT 表项设置为：`puts@plt `中第一条 `jmp 后面的那个位置，也就是` push relocation_index`的地址。
> > >
> > > 动态链接器解析符号后，将真实函数地址写入对应 `GOT` 表项；后续执行 `PLT entry`(如:`puts@plt`) 时会直接转移到目标函数，不再进入动态链接器。
> >
> > `PLT0`是`PLT`中一个特殊的公共入口，专门服务于`lazy binding`。
> >
> > > 典型示例:
> > >
> > > ```assembly
> > > PLT0:
> > >     push [GOTPLT + ...]
> > >     jmp  [GOTPLT + ...]
> > > ```
> > >
> > > 会把`GOTPLT[1] 中保存的 struct link_map * 指针`压栈。
> > >
> > > 然后跳转到动态链接器 `resolver`。
>
> `.got`即`Global Offest Table`，把运行时的绝对地址放在数据表中，让位置无关代码通过相对寻址取得它们。
>
> `.got.plt`是`GOT`中专门服务于`PLT`的部分。
>
> > 一般形式为:
> >
> > ```
> > .got.plt
> > 低地址
> > ┌──────────────────────────────┐
> > │ GOTPLT[0]  _DYNAMIC          │
> > ├──────────────────────────────┤
> > │ GOTPLT[1]  link_map *        │
> > ├──────────────────────────────┤
> > │ GOTPLT[2]  resolver          │
> > ├──────────────────────────────┤
> > │ GOTPLT[3]  puts 的槽位        │
> > ├──────────────────────────────┤
> > │ GOTPLT[4]  printf 的槽位      │
> > ├──────────────────────────────┤
> > │ GOTPLT[5]  read 的槽位        │
> > └──────────────────────────────┘
> > 高地址
> > ```
> >
> > 





[^ELF Header]:[ELF Header](https://refspecs.linuxfoundation.org/elf/gabi4+/ch4.eheader.html)
[^Program Header]:[Program Header](https://refspecs.linuxbase.org/elf/gabi4+/ch5.pheader.html)
[^Section Header]:[`**Section Header**`](https://refspecs.linuxbase.org/elf/gabi4+/ch4.sheader.html)
