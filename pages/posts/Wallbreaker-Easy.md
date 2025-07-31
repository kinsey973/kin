---
title: Wallbreaker_Easy
date: 2024-11-03 14:22:41
tags: disable_functions绕过
categories: 刷题笔记
---

## Wallbreaker_Easy

页面给了提示，需要我们绕过disable_functions，并且给了个后面 Hint: eval($_POST["backdoor"]);

![image-20241103145122641](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031451739.png)

我们查看phpinfo()

```
backdoor=phpinfo();
```

我们发现过滤了过滤了一些东西

![image-20241103145300668](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031453706.png)

我们连接蚁剑，发现一个readflag文件，我们需要用命令行打开

![image-20241103145337104](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031453150.png)

但我们无法直接使用

![image-20241103145454637](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031454670.png)

这里我们就需要用到蚁剑的一个工具了 ------绕过disable_functions插件

![image-20241103145616023](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031456075.png)

我们选择PHP7_GC_UAF模式，然后点击开始

![image-20241103145701307](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031457348.png)

就能打开文件了

![image-20241103145730568](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411031457594.png)
