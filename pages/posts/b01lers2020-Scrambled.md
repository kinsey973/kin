---
title: '[b01lers2020]Scrambled'
date: 2025-02-01 22:39:50
tags: 脑洞
categories: 刷题笔记
---

## [b01lers2020]Scrambled

打开网页，我们发现了一个非常可疑的cookie

![image-20250202224043518](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022240853.png)

暂时不知道有啥用，但我们多次刷新页面，发现cookie的kxkxkxkxsh一直不变，只有中间的数字有变化

看了大佬的wp发现

- `5c32`表示flag第`32`位是`c`，而它的前一位为`5`
- `cd26`表示flag第`26`位是`d`，而它的前一位为`c`
- 等等……

由此，我们可以编写脚本

```
import requests as rq
import re, urllib

flag = ['_'] * 42
url = "http://7f46b512-f523-4788-8e86-e6c8b3deb002.node3.buuoj.cn/"
cookies = {"frequency":"1","transmissions":"x"}

while True:
    res = rq.get(url, cookies=cookies)
    cookie = res.headers["Set-Cookie"].split(';')[3].split('=')[2].replace("kxkxkxkxsh","")
    cookie = urllib.parse.unquote(cookie)

    if len(cookie) == 4:
        index = int(cookie[-2:])
    else:
        index = int(cookie[-1])
    flag[index] = cookie[0]
    flag[index + 1] = cookie[1]

    print(''.join(flag))
    if '_' not in flag:
        break
```

得到flag

![image-20250202224749363](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022247402.png)
