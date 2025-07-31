---
title: '[GXYCTF2019]StrongestMind'
date: 2024-06-21 20:04:47
tags: 题解
categories: 刷题笔记
---

### [GXYCTF2019]StrongestMind

打开页面，提示我们计算1000次答案给flag

我们直接上脚本

```

import requests
import re
import time

url = 'http://1ab3c450-eac5-4e70-930f-c0e7bd6c577c.node5.buuoj.cn:81'
session = requests.session()
req = session.get(url).text
flag = ""

for i in range(1010):
    try:
        result = re.findall("\<br\>\<br\>(\d.*?)\<br\>\<br\>",req)#获取[数字]
        result = "".join(result)#提取字符串
        result = eval(result)#运算
        print("time: "+ str(i) +"   "+"result: "+ str(result))

        data = {"answer":result}
        req = session.post(url,data=data).text
        if "flag{" in req:
            print(re.search("flag{.*}", req).group(0)[:50])
            break
        time.sleep(0.1)#防止访问太快断开连接
    except:
        print("[-]")

```

得到flag.<!--more-->

![image-20240621201743449](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406212017495.png)
