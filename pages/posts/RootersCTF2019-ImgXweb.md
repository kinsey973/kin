---
+title: '[RootersCTF2019]ImgXweb'
date: 2024-09-24 21:29:41
tags: jwt
categories: 刷题笔记
---

## [RootersCTF2019]ImgXweb

我们先进行注册登录

![image-20240924213036697](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242130828.png)

看到这，一般也就排除了二次注入，我们进行传文件

不能传.htaccess类似的。但是php啥的都可以传，不解析

<!--more-->

我们抓包看看

![image-20240924213751509](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242137631.png)

我们发现这个session有点像jwt加密

我们放到解密网站看看

<!--more-->

![image-20240924214247363](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242142439.png)

我们的用户名储存在session里，那我们可以通过session伪造来登录admin

但我们还需要密钥，我们访问robots.txt

![image-20240924214348316](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242143390.png)

发现密钥在这里

![image-20240924214429495](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242144556.png)

```
you-will-never-guess 
```

我们进行session伪造



得到伪造后的session，我们抓包传上去

成功登录admin账号

![image-20240924215815806](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242158861.png)

我们发现有flag.png，但是无法打开

我们可以使用curl 连接，他会返回响应值：

```
curl -i http://83a88da0-a4e9-414e-af03-e916c084b106.node5.buuoj.cn/static/128e8ea7ce4a37b7100fb40b28c01280/flag.png
```

得到flag

![image-20240924215946102](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242159150.png)
