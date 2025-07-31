---
title: '[CSAWQual 2016]i_got_id'
date: 2024-09-27 19:09:57
tags: perl
categories: 刷题笔记
---

------

## [CSAWQual 2016]i_got_id

![image-20240927220030114](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272200206.png)

不懂perl…

发现了文件上传的地方

![image-20240927215642546](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272156585.png)

发现会把上传的文件直接显示在网页上

<!--more-->

查了下原理

##### perlparam()任意文件读取

```php
if ($cgi->upload('file')) {
    my $file = $cgi->param('file');
    while (<$file>) {
        print "$_";
        print "<br />";
    }
}
```



如上代码将上传的文件原样输出到网页

知识点： param()函数会返回一个列表的文件但是只有第一个文件会被放入到下面的file变量中。而对于下面的读文件逻辑来说，如果我们传入一个ARGV的文件，那么Perl会将传入的参数作为文件名读出来。这样，我们的利用方法就出现了：在正常的上传文件前面加上一个文件上传项ARGV，然后在URL中传入文件路径参数，这样就可以读取任意文件了。

ARGV——命令行参数

于是抓包

![image-20201129170225902](https://err0r.top/article/Buuoj-WEB-Write-up/image-20201129170225902.png)

修改为：

![image-20201129170548925](https://err0r.top/article/Buuoj-WEB-Write-up/image-20201129170548925.png)
