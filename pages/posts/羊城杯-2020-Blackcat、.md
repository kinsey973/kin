---
title: '[羊城杯 2020]Blackcat、'
date: 2024-09-26 20:05:06
tags: php特性
categories: 刷题笔记
---

## [羊城杯 2020]Blackcat

我们打开源码页面，它提示听听歌

![image-20240926201549346](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409262015449.png)

我们猜测mp3文件里有东西

下载Hei_Mao_Jing_Chang.mp3文件,使用命令

```
strings Hei_Mao_Jing_Chang.mp3查看文件
```

在文末看到一段PHP代码

```
if(empty($_POST['Black-Cat-Sheriff']) || empty($_POST['One-ear'])){
    die('
$clandestine = getenv("clandestine");
if(isset($_POST['White-cat-monitor']))
    $clandestine = hash_hmac('sha256', $_POST['White-cat-monitor'], $clandestine);
$hh = hash_hmac('sha256', $_POST['One-ear'], $clandestine);
if($hh !== $_POST['Black-Cat-Sheriff']){
    die('
echo exec("nc".$_POST['One-ear']);
```

分析代码:

首先要使用POST方式提交参数Black-Cat-Sheriff和One-ear;

getenv()函数定义：取得系统的环境变量；

使用POST方式提交White-cat-monitor,使用hash_hmac函数加密key为clandestine赋值给变量clandestine,再次使用hash_hmac函数加密,密钥为clandestine,此时的clandestine为White-cat-monitor加密的结果,赋值给变量hh;使hh===Black-Cat-Sheriff;

One-ear可控.

hash_hamc函数是关键点,学习一下

hash_hmac(\$algo, \$data, \$key)

当传入的$data为数组时，加密得到的结果固定为NULL；那么第二次的hash_hmac就是可控的

预测hh的值,将其赋值给Black-Cat-Sheriff
![img](https://i-blog.csdnimg.cn/blog_migrate/a37965740e8c9423c1b223dc6426735c.png)

```
payload:

White-cat-monitor[]=0&Black-Cat-Sheriff=afd556602cf62addfe4132a81b2d62b9db1b6719f83e16cce13f51960f56791b&One-ear=;env
```

post提交得到flag
