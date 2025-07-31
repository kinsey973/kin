---
title: '[NewStarCTF 2023 公开赛道]泄漏的秘密'
date: 2024-11-08 19:29:25
tags: 源码泄露
categories: 刷题笔记
---

### [NewStarCTF 2023 公开赛道]泄漏的秘密

题目提示目录，我们访问robots.txt，发现了flag第一部分

```
flag{r0bots_1s_s0_us3ful
```

![image-20241108193110089](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411081931188.png)

然后我们访问www.zip，发现有文件可以下载

![image-20241108193157379](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411081931411.png)

在index.php里找到了flag的第二部分

![image-20241108193247704](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411081932740.png)

结合一下得到flag

```
flag{r0bots_1s_s0_us3ful_4nd_www.zip_1s_s0_d4ng3rous}
```

