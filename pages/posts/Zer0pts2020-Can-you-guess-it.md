---
title: Zer0pts2020 Can you guess it?
date: 2024-05-29 17:40:47
tags: 题解
categories: 刷题笔记
---

## [Zer0pts2020]Can you guess it?

点开source，发现源码

![image-20240529192034651](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405291920756.png)

```
<?php
include 'config.php'; // FLAG is defined in config.php

if (preg_match('/config\.php\/*$/i', $_SERVER['PHP_SELF'])) {
  exit("I don't know what you are thinking, but I won't let you read it :)");
}

if (isset($_GET['source'])) {
  highlight_file(basename($_SERVER['PHP_SELF']));
  exit();
}

$secret = bin2hex(random_bytes(64));
if (isset($_POST['guess'])) {
  $guess = (string) $_POST['guess'];
  if (hash_equals($secret, $guess)) {
    $message = 'Congratulations! The flag is: ' . FLAG;
  } else {
    $message = 'Wrong.';
  }
}
?>
```

然后开始进行代码审计

根据题目提示，flag在config.php中，所以我们的目的是要读取config.php

<!-- more -->

```
if (preg_match('/config\.php\/*$/i', $_SERVER['PHP_SELF'])) {
 exit("I don't know what you are thinking, but I won't let you read it :)");
}
```

这个正则表达式用于检查字符串是否以 `config.php` 结尾，并且后面可以有零个或多个 `/` 字符，且不区分大小写。

$_SERVER['PHP_SELF']是一个包含当前脚本的文件名及路径的超级全局变量



```
if (isset($_GET['source'])) {
  highlight_file(basename($_SERVER['PHP_SELF']));
  exit();
}
```

意思是给source传参，再用basename返回当前脚本的文件名



**basename**-返回路径中的文件名部分

例如：basename("/path/home.php") -> home.php

basename([string](https://www.php.net/manual/zh/language.types.string.php) `$path`, [string](https://www.php.net/manual/zh/language.types.string.php) `$suffix` = ""): [string](https://www.php.net/manual/zh/language.types.string.php)

```
path
```

一个路径。

在 Windows 中，斜线（`/`）和反斜线（`\`）都可以用作目录分隔符。在其它环境下是斜线（`/`）。

```
suffix
```

如果文件名是以 `suffix` 结束的，那这一部分也会被去掉。



```
$secret = bin2hex(random_bytes(64));
if (isset($_POST['guess'])) {
  $guess = (string) $_POST['guess'];
  if (hash_equals($secret, $guess)) {
    $message = 'Congratulations! The flag is: ' . FLAG;
  } else {
    $message = 'Wrong.';
  }
}
```

用bin2hex生成一个包含随机字节的密钥，并将其转换为十六进制表示形式

再用hash_equals将密钥与传入的guess进行比较，这个方法几乎是不可能的



我们开始解题，假如传入的是`/index.php/config.php`，运行的是`index.php`,但是`basename()`获取到的是`config.php`，

因此可以读取config.php，但由于存在正则匹配，我们需要绕过它

写一个脚本

```
<?php
function check($str){
    return preg_match('/config\.php\/*$/i', $str);
}
for ($i = 0; $i < 255; $i++){
    $s = '/index.php/config.php/'.chr($i);
    if(!check($s)){
        $t = basename('/index.php/config.php/'.chr($i));
        echo "${i}: ${t}\n";
    }
}

?>

```

