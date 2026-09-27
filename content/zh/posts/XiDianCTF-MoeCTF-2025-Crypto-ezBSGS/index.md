---
title: 'XiDianCTF MoeCTF 2025 Crypto EzBSGS'
date: '2026-09-16T20:29:31+08:00'
lastmod: '2026-09-16T20:29:31+08:00'
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

[题目链接](https://ctf.xidian.edu.cn/training/22?challenge=927)

题目:

>西小电注意到，第一周的题目中出现了若干神秘数字，并且他还发现这些神秘数字与神秘Flag有关，具体地，x*x* 是能够满足神秘式子 13x=114514mod  10000000000009913*x*=114514mod100000000000099 的最小整数，flag内容即为 x*x* ，你能帮助西小电求出正确的 Flag 吗？
>
>*“好奇怪的标题啊，BSGS是什么？北上广深吗？”*

注意到`BSGS`为**大步小步算法**(baby-step giant-step)，是[丹尼尔·尚克斯](https://zh.wikipedia.org/w/index.php?title=丹尼尔·尚克斯&action=edit&redlink=1)发明的一种[中途相遇](https://zh.wikipedia.org/wiki/中途相遇攻擊)[算法](https://zh.wikipedia.org/wiki/算法)，用于计算[离散对数](https://zh.wikipedia.org/wiki/离散对数)或者有限[阿贝尔群](https://zh.wikipedia.org/wiki/阿贝尔群)的[阶](https://zh.wikipedia.org/wiki/阶_(群论))。[^BSGS]



代码如下:

```python
import math


mod = 100000000000099
a = 13
b = 114514


n = mod - 1
m = math.isqrt(n) + 1

baby = {}

cur = 1
for j in range(m):
    baby[cur] = j
    cur = cur * a % mod

f = pow(a, -m, mod)

cur = b
for i in range(m):
    if cur in baby:
        print(i * m + baby[cur])
        break
    cur = cur * f % mod
```

输出:

```
18272162371285
```





[^BSGS]:[大步小步算法](https://zh.wikipedia.org/zh-cn/%E5%A4%A7%E6%AD%A5%E5%B0%8F%E6%AD%A5%E7%AE%97%E6%B3%95)
