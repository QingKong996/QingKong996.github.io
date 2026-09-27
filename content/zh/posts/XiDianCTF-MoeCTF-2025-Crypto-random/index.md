---
title: 'XiDianCTF MoeCTF 2025 Crypto Random'
date: '2026-09-19T21:09:47+08:00'
lastmod: '2026-09-19T21:09:47+08:00'
summary: ""
hideSummary: true
draft: false
author: "QingKong996"
categories:
  - "CTF"
tags:
  - "CTF"
  - "Crypto"
---

```
本文人工撰写；生成式AI用于校对和润色。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=948)	

题目附件`random.py`:

```python
from Crypto.Util.number import bytes_to_long

def lfsr(data, mask):
    mask = mask.zfill(len(data))
    res_int = int(data, base=2)^int(mask, base=2)
    bit = 0
    while res_int > 0:
        bit ^= res_int % 2
        res_int >>= 1

    res = data[1:]+str(bit)
    return res

def lcg(x, a, b, m):
    return (a*x+b)%m

flag = b'moectf{???}'

x = bin(bytes_to_long(flag))[2:].zfill(len(flag)*8)
l = len(x)//2
L, R = x[:l], x[l:]
b = -233
m = 1<<l

for _ in range(2025):
    mask = R
    seed = int(L, base=2)
    L = lfsr(L, mask)
    R = bin(lcg(int(R, base=2), b, seed, m))[2:].zfill(l)
    L, R = R, L

en_flag = L+R
print(int(en_flag, base=2))
# en_flag = 4567941593066862873653209393990031966807270114415459425382356207107640
```

改写成更易读的形式:

```python
from sympy import Matrix, nextprime, symbols, solve
from Crypto.Util.number import long_to_bytes, bytes_to_long
flag = b'moectf{???}'

x = bin(bytes_to_long(flag))[2:].zfill(len(flag)*8)
l = len(x)//2
L, R = int(x[:l], 2), int(x[l:], 2)
m = 1<<l

def lcg(x: int, b: int) -> int:
    return ((-233)*x+b)%m

def lfsr(data: int, mask: int) ->int:
    bit = (data ^ mask).bit_count() & 1
    return ((data << 1) & (m - 1)) | bit

for _ in range(2025):
    R, L = lfsr(L, R), lcg(R, L)

en_flag = L+R
print(en_flag)

# en_flag = 4567941593066862873653209393990031966807270114415459425382356207107640
```

对每次循环，已知

$$
(L_{n+1}, R_{n+1})
$$

由 `lfsr()`：

$$
R_{n+1} = \left(2L_n \bmod 2^l\right) + \mathrm{bit}
$$

因此可以通过

$$
R_{n+1} \gg 1
$$

得到 $L_n$ 的低 $l-1$ 位，再枚举最高位的两种可能，得到两个 $L_n$。

然后使用 `lcg()` 的逆函数 `rev_lcg()`，根据已知的 $L_{n+1}$ 和枚举得到的 $L_n$，求出对应的 $R_n$。

如果每轮都保留两个候选，理论上会产生

$$
2^{2025}
$$

条路径，因此需要进行剪枝。

利用 `lfsr()` 的性质：

$$
\operatorname{parity}(L_n \oplus R_n) = R_{n+1} \bmod 2
$$

因此可以检查两者是否相等，不满足条件的分支直接剪掉。

exp:

```python
from sympy import Matrix, nextprime, symbols, solve
from Crypto.Util.number import long_to_bytes, bytes_to_long
import sys

flag = b'moectf{???}'
en_flag = 4567941593066862873653209393990031966807270114415459425382356207107640

x = bin(en_flag)[2:].zfill(len(flag)*8)
l = len(x)//2
L, R = int(x[:l], 2), int(x[l:], 2)
m = 1<<l

def lcg(x: int, b: int) -> int:
    return ((-233)*x+b)%m

def lfsr(data: int, mask: int) ->int:
    bit = (data ^ mask).bit_count() & 1
    return ((data << 1) & (m - 1)) | bit

# for _ in range(2025):
#     R, L = lfsr(L, R), lcg(R, L)

# en_flag = L+R
# print(en_flag)

sys.setrecursionlimit(3000)
def rev(L, R, counter):
    if(counter == 2025):
        x = (L << l) | R
        res = long_to_bytes(x)
        if(res[:7] == b'moectf{'):
           print(res)
        return
    ol1 = R >> 1 | 1 << (l - 1)
    ol2 = R >> 1
    or1 = rev_lcg(L, ol1)
    or2 = rev_lcg(L, ol2)
    # print(lcg1, lcg2)
    # print(lfsr1, lfsr2)
    # print((lcg1 ^ lfsr1).bit_count() & 1 == lcg & 1)
    # print((lcg2 ^ lfsr2).bit_count() & 1 == lcg & 1)
    if((ol1 ^ or1).bit_count() & 1 == R & 1):
        rev(ol1, or1, counter + 1)
    if((ol2 ^ or2).bit_count() & 1 == R & 1):
        rev(ol2, or2, counter + 1)

def rev_lcg(x, b):
    rev_a = pow((-233), -1, m)
    return rev_a * (x - b) % m;

def rev_lfsr(res, mask):
    data = res >> 1
    if((data ^ mask).bit_count() & 1 != res & 1):
        data = data | 1 << (l - 1)
    return data

x = bin(en_flag)[2:]
l = len(x) // 2
L = int(x[:l], 2)
R = int(x[l:], 2)
print(L, R)
rev(L, R, 0)
```

输出:

```
54984596864371279762573338417053914 3943682268225361731553210539015736
b'moectf{THIS_IS_FLAG}'
```

