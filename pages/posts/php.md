---
title: php
date: 2023-12-17 13:59:53
tags:
categories: 学习笔记

---

php格式：

<?php

...

?>

## 变量

------

定义变量：

$+变量名。

赋值变量,变量前一定要带着$;

**变量名不能以数字开头，不建议使用汉字**

<!-- more -->

------

打印变量

echo相当于printf。 echo $变量名，'<标签>'；

------

删除变量用 unset(变量名)

unset($var2);

------

预定义变量：

![image-20231217141534425](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312171415553.png)

------

可变变量

$a='b';

$b='aa';

那么$$a='aa';

------

变量作用域

​	跟c差不多；

​	函数内部是局部变量，外部是全局变量，如果想在函数内用全局变量，得在变量前加global；

------

static作用域

一般，函数用完后，其内部的局部变量就会被删除，要想不被删除，在变量前使用static。

------

超级全局变量

$GLOBALS是一个包含当前文件全部全局变量的数组；

$_SERVER是一个包含诸多头信息、路径、以及脚本位置等等信息的数组

注意：要想获得信息，通过print_r(超级全局变量 )来寻找key



## php数据类型

基本类型：

 	整型：int

​	浮点型：float/double

​	字符串型: string

​	布尔类型:  bool/boolean

复合数据类型:

​	对象类型：object,存放对象（面向对象）

​	数组类型：array，存储多个数据（一次性）

特殊数据类型:

​	资源类型：resource，存放资源数据（php外部数据，如数据库，文件）

​	空类型：NULL

------

类型转换：

1.自动转换：系统根据需求自己判定，自己转换

2.强制转换：认为根据需求手动转换  echo（类型）变量名；

说明：

1.布尔ture=1，false=0

2.以字母开头的字符串，永远为0；

3.以数字开头的字符串，取到碰到字符串为止（不会同时包含两个小数点）

------

类型判断：

用一组类型判断函数来判断.

var_dump(is_xxx(变量名))： xxx为类型名,如果变量的类型为xxx，则返回 1，反之，返回0；

var_dump(变量名)： 直接返回类型；

Gettype(变量名):  得到该类型对应字符串；

Settype(变量名，类型) ：设定数据类型，与强制转换不同

​	1.强制类型转换，是转换数据值；

​	2.settype是改变数据本身类型；

------

整数类型进制：

$a=120; //10进制

$a=0b110; //2... 数字前加0b

$a=0120;  //8...                  0

$a=0x120; //16...                0x

php默认转换10进制输出

decbin():    10->2

decoct():     10->8

dechex():     10->16

bindec():        2->10

dec: 十进制  bin：二进制   oct：八进制   hex：十六进制

------

判断变量值是否存在：

empty（变量名）；

isset（变量名）；

区别：

empty 如果值为空或0；返回true

isset   只有值存在才返回true

------

运算符：

比较运算符：

​	===  全等于，左边与右边相同：大小以及数据类型相同，返回true

​	!==    不全等于，只要大小或类型不同，就返回false；

------

逻辑运算符：

​	跟c一样；

------

连接运算符：

​	. ：将两个字符串连起来；

​	.=：a.=b;=>a=a.b;

------

错误抑制符：

​	@：在可能出错的表达式前加@；

​	错误运算符通常在生产环境（上线）会用到，在开发时不会用到

------

三目运算符：

​	跟c一样；

------

自操作运算符：

​	++；

​	--；

------

php EOF定界符：

$a=<<<EOF

....

EOF;

echo $a;

注意：EOF要顶格写，$a里的内容都会被解析。

------

空合并运算符：？？

用于简化处理可能为null的变量或数组元素的情况。

它的作用是判断一个变量是否未定义或者为null，如果未定义或为null，则返回指定的默认值，否则返回该变量的值

$name=\$username??10;

echo $name ；=>10

------

组合运算符

<=> 可比较整型，浮点型，字符串(比较ascll码)

```
$s=$a<=>$b;
如果$a>$b;$s=1;
......=.;....0;
......<.....-1;
```

------



## 循环

if-else和swith-case

跟c差不多

------

for循环

跟c差不多

PHP_EOF：回车换行；

break n（n=1，2，3......）；跳出n个循环；

------

## 数组

数值数组定义:1.$var1=array(" ...","... ","... ");

​				2.$var1=["...","...'',"..."];

​				3.$var1=[];

​					$var1[3]='a';

关联数组：

​	$var1=[

 	   "test"=>"da",“0”=>"5","1","2"

​	];

​	$var1[test]=da;

------

数组长度：count($var1);

------

数组遍历：

```
1.foreach($var1 as  $value)  echo $value; 
         2.foreach($var1 as $key =>$value)  key:下标
         注意：key和value可以自命名
```

------

多维数组：

$arr=[

"0"=>[

​		"a","b

​          ],

"1"=>[

​				"c","d";

​          ],

"3"=>"f"

];

遍历跟c差不多，只不过用多个foreach遍历

------

数组运算符：

1.+号运算符（合并两个数组）

注意：只会保留第一个数组中的键值对，而忽略后面数组中相同键名的元素，如果想要合并两个数组并覆盖相同键名的元素，可以使用array_merge()函数

2.==  只会判断数组有相同的建/值对

3.===  判断数组有相同的建/值对，且顺序相同、类型相同

4.!=等同于<>

5.!==

## 函数

​    内置函数：

​        date("Y-m-d H:i:s")

 

------

定义函数：

function  名字（类型 变量名）{

   ....

return ...；

}

严格模式 ：declare（strict_type=1）; 使用严格模式后，函数的变量类型要与定义时的类型一致

------

## 字符串

字符串函数：

​     strlen（）获取字符长度；

 	stripos（）在字符串里查找一个字符或一段指定的文本，返回第一次出现的位置或false

​	  stripos（）同上，但不区分大小写

​	strrpos（）同上上，返回最后一次出现的位置或false

strripos（）同上，不区分大小写。

​     ![image-20231218173119690](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312181731813.png)

## 数组相关函数

![image-20231218213641984](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312182136297.png)

数组后面插入元素还可使用 $arr[]=5;这样就在arr数组的末尾插入了一个5；

------

## 时间、日期相关知识

```
time（）获取当前的时间戳（10位）

microtime（ture）返回一个浮点数的时间戳（秒数和微秒数的总和）

date（"Y-m-d H ：m：s",$time）日期格式化  ， 如果y是小写则只会输出年份后两个数字，h是小写则会变为12小时制。

strtotime（string类型），可以把string类型转换成时间戳。例如：strtotime（"next monday"）;可以得到下个星期一的时间戳。此外$baseTime=strtotime("Y-m-d");  echo date("Y-m-d",$baseTime)可以把这个时间的时间戳设为基础时间,并输出来。

mktime($hour,$minute,$secong,$moth,$day,$year);生成时间戳，mktime（）里可以使用数字。

date_create()来创建一个日期时间对象

date_format()将日期时间对象转换为字符串


```

```
date_diff() 计算两个日期之间的差。 
```

![image-20231219142013716](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312191420806.png)

**注意%R和%r有正负之分**

```

```



## 常量

定义：

1.define('常量名'，常量值)；

2.const 常量名=常量值；

常量定义不需要加$;

区别：

1.define定义的常量名可以是特殊符号，若是特殊符号，则需要用echo constant（' 常量名'）来打印；const 不能用特殊符号；

2.const不能用于条件语句中

3.const用于类成员变量的定义，define不可用

------

系统常量：

系统自带的常量，可直接用；

PHP_VERSION:  php版本

PHP_INT_SIZE:   int类型大小

PHP_INT_MAX:   int可表示最大值

系统魔术常量:  双下划线开始+常量名+双下划线结束，可随环境变换而变换

```
__DIR__: 当前被执行的脚本所在电脑的绝对路径
__FILE__:当前被执行的脚本所在电脑的绝对路径（带自己文件的名字）
__LINE__:当前所属的行数
__NAMESPACE__:当前所属的命名空间
__CLASS__:当前所属的类
__METHOD__:当前所属的方法
```

------

## 包含文件

作用，在当前文件引用其他PHP文件、HTML文件或文本文件等。

------

include语句和require语句

[路径中“./”、“../”、“/”代表的含义_文件路径符号-CSDN博客](https://blog.csdn.net/Young__Fan/article/details/80152501)

区别：

如果出现错误，include如果生成一个警告，在错误发生后脚本会继续执行。

require会生成一个致命错误，然后停止脚本执行。

**推荐使用require**

include_once和require_once语句，和上面的一样，但只会调用一次

## 面向对象(OO)

![image-20231219170830894](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312191708005.png)

## 类

定义：定义了一系列事物的抽象特点。

类的定义包含了数据的形式以及对数据的操作

------

```
class Animal{

public $name="abc";
public function eat(){
echo"sss";
}
}
```

------

类的调用

 new 实例化对象

```
$lei= new Anmial;
echo $lei->name;
$lei->eat();
```

------

类的方法和属性

$this

如果想要调用class自身的变量(假如为\$name)时，要定义为\$this->$name;还可以通过这种方式来改自身的值。

![image-20231219191459048](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312191914143.png)

------

类的访问控制

关键词：public,privated,protected

public(公有)：公有的类成员可以再任何地方被访问。

protected（受保护）：受保护的类成员可以被其自身以及其子类和父类访问

private（私有）：私有的类成员则只能被其定义所在的类访问。

------

php的构造函数和析构函数

[PHP 面向对象 | 菜鸟教程 (runoob.com)](https://www.runoob.com/php/php-oop.html)

__construct构造函数

1. 构造函数是一种特殊的方法，在创建一个新对象是，他会自动调用
2. 他可以用来初始化对象的属性或执行的其他必要的操作
3. 没有返回值

------

__destruct析构函数

1. 析构函数是一种特殊的方法，它在对象被销毁时自动调用
2. 他可以用来执行一些清理操作，例如释放资源或关闭数据库连接
3. 当对象不在被引用或脚本执行结束前，析构函数会被自动调用

------

static静态变量和self

![image-20231219202342347](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312192023433.png)

用static去定义，用self::去取。

静态变量在外部的修改： Animal::$cat="熊猫"。

------

类常量

用const去定义常量，调用方式和static类似，用self调用，唯一区别是类常量不可修改

------

static静态方法

![image-20231219204625029](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312192046113.png)

------

类的继承（extends）：

指可以创建一个新的类，该类继承（extends)了父类的属性和方法，并且可以添加自己的属性和方法。通过继承，可以避免重复编写相似的代码，并且可以实现代码的重用。

class 新的类的名字 extends 之前类的名字{

可以添加新的东西，也可不写

}

------

类方法和属性的改写

如果从父类继承的方法或属性不能满足子类的需求，可以对其进行改写。

直接在子类内部改写方法或属性。



final关键字（在不想被改写的类或类的方法前加final）

- 防止类被改写
- 防止类的方法被重写。

**final不能用于属性**

------

parent调用父类的方法和构造函数

在子类方法里写：parent::父类方法或parent::_construct();

```
<?php
class BaseClass {
   function __construct() {
       print "BaseClass 类中构造方法" . PHP_EOL;
   }
}
class SubClass extends BaseClass {
   function __construct() {
       parent::__construct();  // 子类构造方法不能自动调用父类的构造方法
       print "SubClass 类中构造方法" . PHP_EOL;
   }
}
class OtherSubClass extends BaseClass {
    // 继承 BaseClass 的构造方法
}

// 调用 BaseClass 构造方法
$obj = new BaseClass();

// 调用 BaseClass、SubClass 构造方法
$obj = new SubClass();

// 调用 BaseClass 构造方法
$obj = new OtherSubClass();
?>

```

------

静态延迟绑定static

指在运行时根据实际调用的类来确定静态方法或属性的绑定

语法 static::$name

![image-20231219214227829](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312192142918.png)

输出小动物 在吃饭  小猫 在吃饭 

------

php类的多态和方法重载

类的多态：

1. 多态性允许不同类的对象对相同的消息作出不同的响应gI·多态性通过方
2. 重写（覆盖）和方法重载来实现。
3. 方法重写是指子类重写父类的方法，以改变方法的实现细节。
4. 方法重载是指在同一个类中根据参数个数或类型不同来实现不同功能。
5. 需要注意的是，多态性只适用于继承关系的类。子类必须重写父类的方法才能实现多态性。

方法重载：

$args=func_get_args();

$numArgs=func_num_args();

## 接口和抽象类

### 接口

是指一组方法的集合，不是类，不能被实例化

只可使用public。

通常用于定义一些规范，让代码更加有条理，不易出错

------

 lnterface   名字（）接口

implements 实现

基本格式：

```
interface xxx{

...

}

class xxx implements xxx{

...

}
```

**注意：interface里含的方法要全部在implements里包含**

![image-20231220193238918](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312201932040.png)

------

### 抽象类和抽象方法

抽象类：

抽象类是一种特殊的类，只能被继承，不能被实例化

抽象类用于定义一组相关的方法，但这些方法的具体实现由继承它的子类来完成·

子类继承抽象类后，必须实现抽象类中的所有抽象方法

抽象类可以包含抽象方法和普通方法

------

abstract关键字

在class前加上abstract就创建了一个抽象类

------

抽象方法：

抽象方法是没有具体实现的方法，只有方法的声明，而**不需要方法体**

**抽象方法只能存在抽象类中**

可以使用protected，但不能使用private私有

![image-20231220195253364](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312201952427.png)

------

### trait代码复用

解决类的单一继承问题

可同时使用多个trait，用逗号隔开

把常用的、通用的代码抽离出来，写成trait

```
trait A{

}
trait B{

}
class c{
use A,B;
}
把A,B继承到C里
```

trait中可使用抽象方法

trait中可使用静态属性和方法

trait中可使用其他trait

trait中可使用parent

------

trait的同名方法冲突和重命名

同名冲突：

当一个类同时引用了多个trait，并且这些trait中存在同名方法时，就会产生方法冲突。

用insteadof替换，用as重命名（还可以重命名权限）

**属性重名无法更改**

```
use A,B{
B::eat insteadof A;
A::eat as Aeat;
}
```

## 网络请求

若想要获得get请求数据 使用var_dump($_GET);

若想要获得post请求数据 使用var_dump($_POST);

![image-20231220205303938](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312202053042.png)

------

超级全局变量

```
$_REQUEST变量包含了$_GET，$__POST和$_COOKLE的内容
```

$_SERVER是一个包含诸多头信息、路径、以及脚本位置等等信息的数组

注意：要想获得信息，通过print_r(超级全局变量 )来寻找key

![image-20231217141534425](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312171415553.png)

htmlspecialchars()函数

用于将字符串中的特殊字符转换为HTMl实体，以避免在HTML文档中引起解析错误或安全漏洞

&（和号）成为&amp

“（双引号）成为&quot；

’（单引号）成为&#039；

<(小于)成为&lt

\>(大于)成为\&gt;
