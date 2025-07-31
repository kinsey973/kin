---
title: '[极客大挑战 2020]Roamphp1-Welcome'
date: 2024-07-18 19:36:49
tags: 题解
categories: 刷题笔记
---

## [极客大挑战 2020]Roamphp1-Welcome（405报错）

我们打开页面，发现提示该页面无法正常运作（我还以为我网络出问题了呢）

![image-20240723175809368](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231758465.png)

经过查询，我们发现是405报错，405的报错原因是由于请求方法不对，我们对页面进行抓包

<!--more-->

![image-20240723180153188](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231801268.png)

将get请求改为post请求，这样页面内容就成功回显

![image-20240723180237947](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231802993.png)

我们进行代码审计

```
<?php
error reporting(0);
if (S SERVERL'REQUEST METHOD']!=='POST')
header("HTTP/1.1 405 Method Not Allowed");
exit();
} else
if(!isset($ PosT['roam1'])|l !isset($ PosT['roam2'])){
show_source(_FILE_);
else if ($_POST['roam1'] !==$_POST['roam2'] && sha1($_POST['roam1'])=== sha1($_POST['roam2'])){
phpinfo();
}
//collect information from phpinfo!
```

意思是要post传roam1和roam2的值要不同，但他们的sha1加密要相同

我们可以用数组进行绕过

roam1[]=1&roam2[]=2

最后在phpinfo页面中找到flag

![image-20240723181001886](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231810032.png)
