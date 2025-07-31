---
title: ctfshow 信息搜集
date: 2024-10-08 20:10:37
tags: 
      - 信息搜集
      - ctfshow
categories: 学习笔记
---

### web-1

打开页面，发现页面上显示 where is flag?

F12打开

![image-20240403133955143](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404031339174.png)

发现一段base64编码，拿去解码得到flag

ctfshow{9b7e1c33-2521-474b-8801-dcead605aee7}

------

### web-2

用f12和右键查看不了源代码（js代码限制）

使用ctrl+u 打开源代码 或者ctrl+shift+i ，或者用开发者工具

![image-20240403145141607](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404031451669.png)

------

### web-3

对页面进行抓包，再发包到重发器中，flag在请求头里

![image-20240407191146214](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404071911451.png)

ctfshow{f549ee24-8620-45f2-943b-79f90cc6c81d}

------

### web-4

题目提示robots.txt可能泄露信息，我们就访问它，得到一个新的文件

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404072114625.png)

再次访问这个新文件就能得到flag

![image-20240407211446703](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404072114729.png)

ctfshow{fc472283-6e2c-44e1-9c2b-a46fdd11d1fb}

框架特性 -robots.txt文件：robots.txt 一个非常重要的文件，通常情况下，主要用于指定搜索引擎蜘蛛spider在网站里的抓取范围,用于声明蜘蛛不可以抓取哪些网站资源及可以抓取哪些网站资源。



参考链接：[【每天学习一点新知识】robots.txt详解-CSDN博客](https://blog.csdn.net/m0_51683653/article/details/127252676?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_utm_term~default-5-127252676-blog-7918528.235^v43^pc_blog_bottom_relevance_base7&spm=1001.2101.3001.4242.4&utm_relevant_index=8)

![image-20240414160116149](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404141601198.png)

------



### web-5

根据提示，该题为phps代码泄露，所以访问index.phps,会弹出一个下载链接，flag就在里面

![image-20240407214128588](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404072141613.png)

保留就行

------

### web-6

[代码泄露](https://blog.csdn.net/qq_53079406/article/details/125582887?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171249839616800211582922%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171249839616800211582922&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-125582887-null-null.142^v100^control&utm_term=%E4%BB%A3%E7%A0%81%E6%B3%84%E9%9C%B2&spm=1018.2226.3001.4187)

先手测robots.txt，index.phps,www.zip，.git，.index.php.swp试试哪个正确

或者用扫描工具扫出来个www.zip或者凭感觉得出，访问它，会弹出一个链接，再下载下来

![image-20240407215532335](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404072155411.png)

发现有两个文件，访问fl000g.txt就行了

![image-20240407215603927](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404072156965.png)

------

### web-7

跟上一题类似，访问.git就能拿到flag

![image-20240408211247236](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404082112362.png)

------

### web-8

跟上题一样，用dirsearch扫一下（就是久了点），发现目录下有个svn文件，访问它就能拿到flag

![在这里插入图片描述](https://img-blog.csdnimg.cn/58e9704ef38142b48c5ab9fe4cdc84b3.png)

------

### web-9

vim缓存导致信息泄露

在使用vim时会创建临时缓存文件，关闭vim时缓存文件则会被删除，当vim异常退出后，因为未处理缓存文件，导致可以通过缓存文件恢复原始文件内容

以 index.php 为例：

第一次产生的交换文件名为 .index.php.swp

再次意外退出后，将会产生名为 .index.php.swo 的交换文件

第三次产生的交换文件则为 .index.php.swn



根据提示，可能是vim缓存信息泄露，直接访问url/index.php.swp 即可获取flag

------

### web-10

根据提示flag在cookie（需要解码）里

![image-20240409212420910](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092124043.png)

------

### web-11

题目说ctf.show隐藏了一条信息，我们打开dbcha.com（可以查到域名的所有解析信息）

![image-20240414191353792](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404141914920.png)

然后就能得到flag了

![image-20240414191420961](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404141914989.png)

------

### web-12

访问robots.txt，得到后台目录

![image-20211008174122936](https://img-blog.csdnimg.cn/img_convert/9c2d489f1656cb9cf1ae704061e4bf58.png)

![image-20211008174152704](https://img-blog.csdnimg.cn/img_convert/72cd1a7593065205d32e469f75061d98.png)

猜测用户名为admin，根据提示网页上公开信息为管理员常用密码，猜测密码为372619038

![image-20211008174249748](https://img-blog.csdnimg.cn/img_convert/6fbe1b5636c69f5d1902f040dc1ca764.png)

进入后台拿到flag

![image-20211008174324632](https://img-blog.csdnimg.cn/img_convert/0ea0207049ce62ea42843003e4f36b88.png)

------

### web-13

往最下面翻，发现有个藏在一堆文字里的链接可以点

![image-20240414203803035](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142038099.png)

点开是个文档

![image-20240414203832253](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142038347.png)

打开链接，发现打不开，我们仔细观察这个链接，发现要把your-domain替换成之前的那个网页

![image-20240414204013275](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142040306.png)

输入用户名和密码就得到flag了

ctfshow{d7e34ce6-6abc-4260-917e-1e6e11a8c3e3}

------

### web-14

根据提示访问/editor，在图片里打开图片空间

![image-20211008175648807](https://img-blog.csdnimg.cn/img_convert/453a87260599775fe82a249d93a8a82c.png)

在/var/www/html/nothinghere 中找到一个fl000g.txt

URL访问/nothinghere/fl000g.txt即可获取flag

![image-20240414210025444](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142100478.png)

------

### web-15

在网页最下方发现一个邮箱1156631961@qq.com，先记下来，访问/admin进入后台登录

![image-20211008180251517](https://img-blog.csdnimg.cn/img_convert/0459d3e1f98017f0f5340995e404ea8d.png)

忘记密码——密保问题

![image-20211008180356297](https://img-blog.csdnimg.cn/img_convert/56a85b0aa3b7b1c25b6d3ecbdde29c70.png)

通过搜索qq号发现

![image-20211008180456763](https://img-blog.csdnimg.cn/img_convert/b60c6379225ebf9aaffd4c689c1f9397.png)

重置密码成功

重新登陆拿到flag

------

### web-16

提示探针，访问雅黑，tz.php，查看phpinfo

传入?action=phpinfo

![image-20211008180803604](https://img-blog.csdnimg.cn/img_convert/fe0ad07a1ce8648f485181f1012700fc.png)

在页面搜索flag

![image-20211008180832641](https://img-blog.csdnimg.cn/img_convert/7ad797d16f8583b371132b87519a8107.png)

[**php**探针](https://blog.csdn.net/weixin_43790779/article/details/108834213?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171310161416800185843688%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171310161416800185843688&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-108834213-null-null.142^v100^control&utm_term=PHP%E6%8E%A2%E9%92%88&spm=1018.2226.3001.4187)

------

### web-17

------

### web-18

正常游玩铁定玩不过的![image-20240414215104553](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142151621.png)

这题也没啥别的信息，我们检查源码和js，在js里发现了一个unicode编码

![image-20240414215146287](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142151314.png)

我们解码看看，它让我们去110.php看看，那我们就去看看

![image-20240414220537691](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142205722.png)

也是成功找到flag了好吧

![image-20240414220631863](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404142206884.png)

------

### web-19

嗯，题目说密钥不要放在前端，说明，密钥就在前端呢。

f12启动！！！

![image-20240415213305391](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404152133529.png)

发现一串注释，嗯，post传参吧

![image-20240415213331012](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404152133198.png)

成功得到flag

------

### web-20

mdb文件是早期asp+access构架的数据库文件 直接查看url路径添加/db/db.mdb 下载文件通过txt打开或者notepad或者通过EasyAccess.exe打开搜索flag flag{ctfshow_old_database}



### 总结

```
得到一个IP地址或网址时
第一步：查看源码
第二步：网页上查找是否有有效信息
第三步：查看是否存在说明文件rotobs.txt
第四步：通过御剑或dirsearch扫描探测是否存在其它页面
第五步：按照网页的框架信息查看是否存在测试文件或备份文件
```

