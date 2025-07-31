---
title: '[FireshellCTF2020]URL TO PDF'
date: 2024-12-09 21:01:53
tags: WeasyPrint
categories: 刷题笔记
---

#### [FireshellCTF2020]URL TO PDF

题目给了一个输入框，我们可以把网址转为pdf下载

![image-20241209213256009](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092132165.png)

下载完

![image-20241209213402111](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092134140.png)

我们打开自己的服务器，监听，然后在提交框里输入ip和端口，看下此题的请求                                                                                                                                                                                                                                                                                                                                                                                                                                  

![image-20241209214814918](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092148961.png)

 

我们发现user-agent非常奇怪

```
User-Agent: WeasyPrint 51 (http://weasyprint.org/)
```

> WeasyPrint重新定义了一组html标签，包括img，embed，object等。根据我们之前的测试，我们已经知道javascript不是利用这一点的选项。在这一点上，我们的希望很低，我们开始认为PDF生成器不再可利用，直到我们发现对<链接>内部的几个文件的引用，包括pdf.py。这使我们能够通过使用 将任何网页或本地文件的内容附加到我们的 PDF 中。<link rel=attachment href="file:///root/secret.txt">
> 
>

问题就出在了`<link>`标签上。WeasyPrint会把所有你给它的东西(前提是它支持的)都请求一遍然后放在PDF里，虽然有些东西可能不可见，但是确实是存在的。于是就有了这样的攻击方式：

![image-20241209215046442](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092150476.png)

它不会渲染js，但是加在file://可以实现ssrf+任意文件读取。我们在靶机里写入一个简单的html，引入payload

原文链接：https://blog.csdn.net/RABCDXB/article/details/122659054

```
<html>
<body>
<link rel='attachment' href='file:///flag'>
</body>
</html>
```

下载得到pdf文件，然后我们用pdfdetach查看flag，它是Xpdf工具包的命令行工具之一，可以从PDF文件中提取附件。

```
pdfdetach -list xxx.pdf
pdfdetach 1 xxx.pdf
```

![img](https://s1.ax1x.com/2020/08/12/axrGhd.png)

参考https://www.shawroot.cc/1128.html
