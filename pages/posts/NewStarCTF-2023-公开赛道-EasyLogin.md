---
title: '[NewStarCTF 2023 公开赛道]EasyLogin'
date: 2025-01-05 14:15:11
tags: http重定向
categories: 刷题笔记
---

### [NewStarCTF 2023 公开赛道]EasyLogin

刚进入页面，我们发现一个登录框，一般有这玩意的是爆破管理员或者sql注入之类的

我们先来爆破管理员密码，我们先试试admin，123456，抓包发现密码被md5加密了

![image-20250105142539573](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051425669.png)

我们进行爆破密码，将加密方式设为md5加密

![image-20250105142710901](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051427969.png)

爆出出来密码的md5为670b14728ad9902aecba32e22fa4f6bd

![image-20250105143302520](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051433570.png)

解密得到密码为000000

我们登陆成功后也没发现flag

这时我们注意到在bp的http历史中出现了个302定向页面

![image-20250105144424707](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051444899.png)

我们查看响应，得到flag

![image-20250105144946368](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501051449430.png)

(想不到根本想不到)

参考：

https://www.cnblogs.com/NozoMizo/articles/17973591/NEWSTARCTF2023#easylogin
