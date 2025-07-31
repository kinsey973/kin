---
title: '[b01lers2020]Welcome to Earth'
date: 2024-06-08 17:04:15
tags: 题解
categories: 刷题笔记
---

### [b01lers2020]Welcome to Earth（排列组合库的使用）

打开页面发现好像跳转了一下

![image-20240602210717176](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022107740.png)

我们把url的/die/删了不就复活了吗，我们看看之前的页面是什么

<!-- more -->

![image-20240602210855770](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022108448.png)

发现了之前的页面，我们查看源码

![image-20240602210934020](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022109089.png)

发现了个新路径/chase/，我们访问它

啊，又跳走了

我们趁网页不注意，赶紧用ctrl+u打开了源码

![image-20240602211108427](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022111467.png)

我们又又发现了个新路径/leftt/，我们访问它，看到新的页面了![image-20240602211154419](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022111909.png)

我们访问源码

![image-20240602211220324](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022112353.png)

又又又发现了个新路径/shoot/，继续访问

![image-20240602211305957](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022113238.png)

新页面，点击右下角的continue又来到了一个新的页面

![image-20240602211356059](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022113517.png)

但我发现无论选哪个好像都会die掉，我们查看源码

![image-20240602211458632](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022114675.png)

发现了个check_door()方法，我们查看js文件

![image-20240602211525811](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022115842.png)

又又又又发现了个新路径/open/，我们访问它，发现了一扇门

![image-20240602211616166](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022116212.png)

我们查看源码，没发现有啥信息，我们查看js文件

![image-20240602211648693](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022116712.png)

又又又又又发现了个新路径/fight/，我们接着访问

![image-20240602211735482](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022117830.png)

让我们开始战斗了，但输东西进去没反应，我们先访问源码，打开js文件

![image-20240602211822698](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022118727.png)

发现了个flag，不过好像是乱序的，接着我们就一个一个试吧

算了，上脚本

```
from itertools import permutations
import re

flag = ["{hey", "_boy", "aaaa", "s_im", "ck!}", "_baa", "aaaa", "pctf"]
# 对flag字典里的内容进行排列组合
item = permutations(flag)
# 遍历
for a in item:
    k = ''.join(list(a))
    # 匹配
    if re.search('^pctf\{hey_boys[a-zA-z_]+ck!\}$', k):
        print(k)
```

![image-20210824151824335](https://img-blog.csdnimg.cn/img_convert/8d0e182d1d8fe31634741e8531353895.png)

flag在第一个

一个排列组合的库 `from itertools import permutations`
