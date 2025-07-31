---
title: php特性
date: 2024-09-18 21:41:46
tags: php特性
categories: 学习笔记
---

### php特性

### preg_match()

[PHP: preg_match - Manual](https://www.php.net/manual/zh/function.preg-match.php)

##### 数组绕过

preg_match()只能处理字符串，当传入的subject是数组时，会返回false

```
if(preg_match("/[0-9]/", $num)){
        die("no no no!");
    }
    if(intval($num)){
        echo $flag;
    }
```

payload：

num[]=1

<!--more-->

##### 最大回溯次数绕过

PHP 为了防止正则表达式的拒绝服务攻击（reDOS），给 pcre 设定了一个回溯次数上限 pcre.backtrack_limit

回溯次数上限默认是 100 万。如果回溯次数超过了 100 万，preg_match 将不再返回非 1 和 0，而是 false。

![image-20240409145338350](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091453446.png)

### intval()

[PHP: intval - Manual](https://www.php.net/manual/zh/function.intval.php)

##### 字符绕过

intval()而言，如果参数是字符串，，则返回字符串中第一个不是数字的字符之前的数字串所代表的整数值。如果字符串第一个是‘-’，则从第二个开始算起。

```php
if($num==="4476"){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
123456
```

payload：

```bash
num=4476a
```

##### 科学计数法

intval() int 函数如果base为0，则var中存在字母的话遇到字母就停止读取，但遇到e，会表示科学计数法

```php
if($num==4476){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }
123456
```

payload：

```bash
num=4476e1
```

##### 进制转换

0bxx：二进制

0xxx：八进制

0Xxx：十六进制

```
if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }
```

payload：

```bash
num=010574   //八进制，php会自动识别进制
```

##### 小数点绕过

```
if($num==="4476"){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(!strpos($num, "0")){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }

```

进制转换绕过不可行了，只能通过小数点，使得intval()转变为int()



### strpos

```
strpos() - 查找字符串在另一字符串中第一次出现的位置（区分大小写）
stripos() 函数查找字符串在另一字符串中第一次出现的位置（不区分大小写）
strrpos() - 查找字符串在另一字符串中最后一次出现的位置（区分大小写）
strripos() - 查找字符串在另一字符串中最后一次出现的位置（不区分大小写）
```



### md5

#### 科学计数法绕过

md5()遇到公式，会先进行运算，再对运算结果计算md5

由于0和任何数相乘都等于0，所以0e开头的任何数，其md5都是相同的

比如 md5('0e1234')，会先运算成 md5(0)，再计算MD5值。

补充：

0e是科学计数法，大小写等价，即 0e 和 0E 的结果相同。

科学记数法是一种记数的方法。把一个数表示成a与10的n次幂相乘的形式。

格式为：aEb=a×10^b，即a乘以10的b次幂。
![image-20240402210629384](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404022106412.png)

**绕过思路**1：遇到弱比较（md5(a)==md5(b)）时，可以使用0e绕过，即将a和b赋值为0e开头的数

0e绕过还有一种**变体**，如果某个字符串是0e开头的，在比较时，php也会先把它计算为0，在参与比较。



**绕过思路2**：遇到弱比较（md5(a)==0）,可以传入QNKCDZO等绕过

一些MD5值为0e开头的字符串：

```
QNKCDZO   => 0e830400451993494058024219903391
240610708 => 0e462097431906509019562988736854
s878926199a => 0e545993274517709034328855841020
s155964671a => 0e342768416822451524974117254469
s214587387a => 0e848240448830537924465865611904
s214587387a => 0e848240448830537924465865611904
```



#### **数组类型（数组绕过）**

md5()不能处理数组，数组都会返回NULL，同时会报一个warning，不影响执行

![image-20240405190432171](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404051904252.png)



绕过思路：遇到强比较（a===b）时，可以使用数组绕过。GET传参时，以 `a[]=1&b[]=2` 这种形式传递数组。

```
$a = array(1,2,3);
$b = array(4,5,6);

var_dump(md5($a)===md5($b));
```



#### 算数运算配合自动类型转换

md5()遇到算数符时，会先运算，再计算结果的md5值

所以，当字符串与数字类型运算时，会将字符串转换成数字类型再参与运算，最后计算运算结果的MD5值

![image-20240405191207269](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404091617863.png)

#### 数值类型

虽然 md5() 要求传入字符串，但传入整数或小数也不会报错；数字相同时，数值型和字符串的计算结果是相同的。

![image-20240405191200873](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404051912915.png)

#### MD5值相等的字符串

```
$Param1="\x4d\xc9\x68\xff\x0e\xe3\x5c\x20\x95\x72\xd4\x77\x7b\x72\x15\x87\xd3\x6f\xa7\xb2\x1b\xdc\x56\xb7\x4a\x3d\xc0\x78\x3e\x7b\x95\x18\xaf\xbf\xa2\x00\xa8\x28\x4b\xf3\x6e\x8e\x4b\x55\xb3\x5f\x42\x75\x93\xd8\x49\x67\x6d\xa0\xd1\x55\x5d\x83\x60\xfb\x5f\x07\xfe\xa2";
$Param2="\x4d\xc9\x68\xff\x0e\xe3\x5c\x20\x95\x72\xd4\x77\x7b\x72\x15\x87\xd3\x6f\xa7\xb2\x1b\xdc\x56\xb7\x4a\x3d\xc0\x78\x3e\x7b\x95\x18\xaf\xbf\xa2\x02\xa8\x28\x4b\xf3\x6e\x8e\x4b\x55\xb3\x5f\x42\x75\x93\xd8\x49\x67\x6d\xa0\xd1\xd5\x5d\x83\x60\xfb\x5f\x07\xfe\xa2";

$data1="\xd1\x31\xdd\x02\xc5\xe6\xee\xc4\x69\x3d\x9a\x06\x98\xaf\xf9\x5c\x2f\xca\xb5\x07\x12\x46\x7e\xab\x40\x04\x58\x3e\xb8\xfb\x7f\x89\x55\xad\x34\x06\x09\xf4\xb3\x02\x83\xe4\x88\x83\x25\xf1\x41\x5a\x08\x51\x25\xe8\xf7\xcd\xc9\x9f\xd9\x1d\xbd\x72\x80\x37\x3c\x5b\xd8\x82\x3e\x31\x56\x34\x8f\x5b\xae\x6d\xac\xd4\x36\xc9\x19\xc6\xdd\x53\xe2\x34\x87\xda\x03\xfd\x02\x39\x63\x06\xd2\x48\xcd\xa0\xe9\x9f\x33\x42\x0f\x57\x7e\xe8\xce\x54\xb6\x70\x80\x28\x0d\x1e\xc6\x98\x21\xbc\xb6\xa8\x83\x93\x96\xf9\x65\xab\x6f\xf7\x2a\x70";
$data2="\xd1\x31\xdd\x02\xc5\xe6\xee\xc4\x69\x3d\x9a\x06\x98\xaf\xf9\x5c\x2f\xca\xb5\x87\x12\x46\x7e\xab\x40\x04\x58\x3e\xb8\xfb\x7f\x89\x55\xad\x34\x06\x09\xf4\xb3\x02\x83\xe4\x88\x83\x25\x71\x41\x5a\x08\x51\x25\xe8\xf7\xcd\xc9\x9f\xd9\x1d\xbd\xf2\x80\x37\x3c\x5b\xd8\x82\x3e\x31\x56\x34\x8f\x5b\xae\x6d\xac\xd4\x36\xc9\x19\xc6\xdd\x53\xe2\xb4\x87\xda\x03\xfd\x02\x39\x63\x06\xd2\x48\xcd\xa0\xe9\x9f\x33\x42\x0f\x57\x7e\xe8\xce\x54\xb6\x70\x80\xa8\x0d\x1e\xc6\x98\x21\xbc\xb6\xa8\x83\x93\x96\xf9\x65\x2b\x6f\xf7\x2a\x70";
```

####  $a==md5($a)

`0e215962017` 的 MD5 值也是由 **0e** 开头，在 PHP 弱类型比较中相等

------

### file_put_contents()

[PHP: file_put_contents - Manual](https://www.php.net/manual/zh/function.file-put-contents.php)

- 该函数访问文件时，遵循以下规则：
- 如果设置了 FILE_USE_INCLUDE_PATH，那么将检查 filename 副本的内置路径
- 如果文件不存在，将创建一个文件
- 打开文件
- 如果设置了 LOCK_EX，那么将锁定文件
- 如果设置了 FILE_APPEND，那么将移至文件末尾。否则，将会清除文件的内容
- 向文件中写入数据
- 关闭文件并对所有文件解锁
- 如果成功，该函数将返回写入文件中的字符数。如果失败，则返回 False。


```
int file_put_contents ( string $filename , mixed $data [, int $flags = 0 [, resource $context ]] )

filename： 必需。规定要写入数据的文件。 如果文件不存在，则创建一个新文件。
data： 必需。规定要写入文件的数据。可以是字符串、数组或数据流。
```

------

### in_array()

[PHP: in_array - Manual](https://www.php.net/manual/zh/function.in-array.php)

in_array()函数搜索数组中是否存在指定的值

```
in_array(needle,haystack, type)

needle
待搜索的值。
注意:
如果 needle 是字符串，则比较是区分大小写的。
haystack
待搜索的数组。
type ：
类型，true全等 ，false非全等（默认）
```

------





------



### 优先级

#### 符号

&&,||> = > and,or

![img](https://img-blog.csdnimg.cn/20200802114957802.jpeg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0ppbmVE,size_16,color_FFFFFF,t_70)

#### get/post

http协议默认先以get方式获取数据，无论以哪种方式发起的，总是get方式优先，即通过get方式获取到了数据就不会再去通过post方式获取

------

### is_numeric

[PHP: is_numeric - Manual](https://www.php.net/manual/zh/function.is-numeric.php)

is_numeric([mixed](https://www.php.net/manual/zh/language.types.mixed.php) `$value`): [bool](https://www.php.net/manual/zh/language.types.boolean.php)

检查指定的变量是否为数字或数字字符串

------



### highlight_file

[PHP: highlight_file - Manual](https://www.php.net/manual/zh/function.highlight-file.php)

highlight_file([string](https://www.php.net/manual/zh/language.types.string.php) `$filename`, [bool](https://www.php.net/manual/zh/language.types.boolean.php) `$return` = **`false`**): [string](https://www.php.net/manual/zh/language.types.string.php)|[bool](https://www.php.net/manual/zh/language.types.boolean.php)

使用 PHP 内置的语法高亮器所定义的颜色，打印输出或者返回 `filename` 文件中语法高亮版本的代码。

```
filename
```

欲高亮文件的路径。

```
return
```

设置该参数为 **`true`** 使函数返回高亮后的代码。

如果 `return` 设置为 **`true`**，高亮后的代码不会被打印输出，而是以字符串的形式返回。高亮成功返回 **`true`**，否则返回 **`false`**。

------

### eval（）

[PHP: eval - Manual](https://www.php.net/manual/zh/function.eval)

eval — 把字符串作为PHP代码执行

eval([string](https://www.php.net/manual/zh/language.types.string.php) `$code`): [mixed](https://www.php.net/manual/zh/language.types.mixed.php)

------



### ReflectionClass反射类

获取类的信息，并实例化对象

```
<?php
class A{
public static $flag="flag{123123123}";
const  PI=3.14;
static function hello(){
    echo "hello</br>";
}
}
$a=new ReflectionClass('A');


var_dump($a->getConstants());  //获取一组常量
输出
 array(1) {
  ["PI"]=>
  float(3.14)
}

var_dump($a->getName());    //获取类名
输出
string(1) "A"

var_dump($a->getStaticProperties()); //获取静态属性
输出
array(1) {
  ["flag"]=>
  string(15) "flag{123123123}"
}

var_dump($a->getMethods()); //获取类中的方法
输出
array(1) {
  [0]=>
  object(ReflectionMethod)#2 (2) {
    ["name"]=>
    string(5) "hello"
    ["class"]=>
    string(1) "A"
  }
}

```



### call_user_func

call_user_func — 把第一个参数作为回调函数调用

call_user_func([callable](https://www.php.net/manual/zh/language.types.callable.php) `$callback`, [mixed](https://www.php.net/manual/zh/language.types.mixed.php) `...$args`): [mixed](https://www.php.net/manual/zh/language.types.mixed.php)

第一个参数 `callback` 是被调用的回调函数，其余参数是回调函数的参数。

- `callback`

  将被调用的回调函数（[callable](https://www.php.net/manual/zh/language.types.callable.php)）。

- `args`

  0个或以上的参数，被传入回调函数。

------

### hex2bin()

hex2bin([string](https://www.php.net/manual/zh/language.types.string.php) `$string`): [string](https://www.php.net/manual/zh/language.types.string.php)|[false](https://www.php.net/manual/zh/language.types.value.php)

转换十六进制字符串为二进制字符串。

------

### php 伪协议

配合file_put_contents(v3,str);（在需要使用base64转换时）；

```
v3=php://filter/write=convert.base64-decode/resource=1.php&str=......
```

当ban掉base64时，我们可以使用

```
php://filter/resource=flag.php		
php://filter/convert.iconv.UCS-2LE.UCS-2BE/resource=flag.php
php://filter/read=convert.quoted-printable-encode/resource=flag.php	//可打印字符引用编码
compress.zlib://flag.php		//压缩流

```

![image-20240414151832933](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202404141518075.png)

------

### is_file()

判断是否为文件

------

### php协议绕过

highlight_file()可以识别php伪协议，而is_file()不能识别

------

### /proc/self/root

在linux中/proc/self/root是指向根目录的 也就是说，如果在命令行中输入 ls /proc/self/root，其实显示的内容是根目录下的，多次重复后可绕过is_file

------

### php版本

当 php 版本⼩于 8 时，GET 请求的参数名含有 . ，会被转为 _ ，但是如果参数名中有 [ ，这个 [ 会被直接转为 _ ，但是后⾯如果有 . ，这个 . 就不会被转为 _ 。

### ctype_alpha

ctype_alpha([mixed](https://www.php.net/manual/zh/language.types.mixed.php) `$text`): [bool](https://www.php.net/manual/zh/language.types.boolean.php)

检测提供的 [string](https://www.php.net/manual/zh/language.types.string.php) 类型的 `text` 里面的所有字符是否都是字母。在标准的 `C` 语言区域设置中，字母仅仅是指 `[A-Za-z]`，并且如果 $text 是单个字符，则 **ctype_alpha()** 等同于 `(ctype_upper($text) || ctype_lower($text))`，但是在其他语言中有些字母既不视为大写也不视为小写。

用小数可以绕过

### php原生类

https://blog.csdn.net/unexpectedthing/article/details/121780909

### MAC地址

/sys/class/net/eth0/address

### MYSQL md5漏洞

```
数字型：129581926211651571912466741651878684928
字符型：ffifdyop
```

他们的md5解码后的值为真
