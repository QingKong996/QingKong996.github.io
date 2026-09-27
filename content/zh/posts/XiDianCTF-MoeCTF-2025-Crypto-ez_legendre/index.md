---
title: 'XiDianCTF MoeCTF 2025 Crypto Ez_legendre'
date: '2026-09-17T20:35:23+08:00'
lastmod: '2026-09-17T20:35:23+08:00'
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
本文人工撰写；生成式AI仅用于校对和手写公式转 LaTeX。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=881)



题目附件`ezlegendre.py`:

```python
from Crypto.Util.number import getPrime, bytes_to_long
from secret import flag

p = 258669765135238783146000574794031096183
a = 144901483389896508632771215712413815934

def encrypt_flag(flag):
    ciphertext = []
    plaintext = ''.join([bin(i)[2:].zfill(8) for i in flag])
    for b in plaintext:
        e = getPrime(16)
        d = randint(1,10)
        n = pow(a+int(b)*d, e, p)
        ciphertext.append(n)
    return ciphertext

print(encrypt_flag(flag))
```

$$
e = \operatorname{getPrime}(16)
$$

$$
d \xleftarrow{\$} [1,10]
$$

$$
h = \left(a + \operatorname{int}(b)\cdot d\right)^e \bmod p
$$

当 \(b=0\) 时：

$$
h = a^e \bmod p
$$

当 \(b=1\) 时：

$$
h = (a+d)^e \bmod p
$$

注意到：

$$
e=\operatorname{getPrime}(16)
$$

仅有 \(16\text{ bit}\)，搜索空间约为：

$$
2^{16}
$$

并且：

$$
d\in[1,10]
$$

因此可以构造爆破字典，根据 \(h\) 反推出：

$$
h\longmapsto b\in\{0,1\}
$$




脚本:

```python
from sympy import Matrix, nextprime, symbols, solve
from Crypto.Util.number import long_to_bytes

p = 258669765135238783146000574794031096183
a = 144901483389896508632771215712413815934

ans = [省略，太长了]

mp = {}

cur = 2
while(True):
    if(cur > (1 << 16)): break
    for i in range(11):
        s0 = pow(a, cur, p)
        s1 = pow(a + i, cur, p)
        mp[s0] = 0
        mp[s1] = 1
    cur = nextprime(cur)



res = ""
for i in ans:
    if(i in mp):
        res += str(mp[i])
    else:
        print("不兑")
        break

print(res)

flag = bytes(int(res[i:i + 8], 2) for i in range(0, len(res), 8))
print(flag)
```

输出:

```
01101101011011110110010101100011011101000110011001111011010110010011000001110101010111110110100001000000011101100011001101011111011010100111010100110101011101000101111101110011001100000011000101110110001100110110010001011111001101110110100000110001
0111001101011111011100000111001000110000011000100011000100110011011011010010000101111101
b'moectf{THIS_IS_FLAG}'
```

