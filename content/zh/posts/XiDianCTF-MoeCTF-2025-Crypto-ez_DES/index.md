---
title: 'XiDianCTF MoeCTF 2025 Crypto Ez_DES'
date: '2026-09-15T21:54:13+08:00'
lastmod: '2026-09-15T21:54:13+08:00'
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
本文为人工撰写，仅使用生成式AI校对。
```

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=903)

题目附件`ez_des.py`:

```python
from Crypto.Cipher import DES
import secrets
import string

flag = 'moectf{???}'
characters = string.ascii_letters + string.digits + string.punctuation
key = 'ezdes'+''.join(secrets.choice(characters) for _ in range(3))
assert key[:5] == 'ezdes'
key = key.encode('utf-8')
l = 8

def encrypt(text, key):
    cipher = DES.new(key, DES.MODE_ECB)
    padded_text = text + (l - len(text) % l) * chr(len(text))
    data = cipher.encrypt(padded_text.encode('utf-8'))
    return data

c = encrypt(flag, key)
print('c =', c)

# c = b'\xe6\x8b0\xc8m\t?\x1d\xf6\x99sA>\xce \rN\x83z\xa0\xdc{\xbc\xb8X\xb2\xe2q\xa4"\xfc\x07'
```

注意到key之后后三位随机，并且flag头部特征已给出，所以可以尝试爆破。



脚本如下:

```python
import string
import itertools
from Crypto.Cipher import DES

characters = string.ascii_letters + string.digits + string.punctuation

c = b'\xe6\x8b0\xc8m\t?\x1d\xf6\x99sA>\xce \rN\x83z\xa0\xdc{\xbc\xb8X\xb2\xe2q\xa4"\xfc\x07'

for suffix in itertools.product(characters, repeat=3):
    key = ("ezdes" + "".join(suffix)).encode("utf-8")
    cipher = DES.new(key, DES.MODE_ECB)
    data = cipher.decrypt(c)
    if(data[:6] == b'moectf'):
        print(f'Key:{key.decode()}')
        print(data.decode())
        break

```

输出:

```
Key:ezdes8br
moectf{THIS_IS_FLAG}
```

