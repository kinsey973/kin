---
title: MySQL学习
date: 2023-12-20 21:22:58
tags: sql注入
categories: 学习笔记
---

## Mysql

数据库

打开：mysql -u root -p

关系型数据库

​       概念：建立在关系模型基础上，由多张相互连接的二维表组成的数据库

<!-- more -->

​		特点：

				1. 使用表存储数据，格式统一，便于维护。
				1. 使用SQL语言操作，标准统一，使用方便。


## SQL语法

### 通用语法：

1.SQL语句可以单行或多行书写，以分号结尾

2.SQL语句可以使用空格/缩进来增强语句的可读性

3.mysql数据库的SQL语句不区分大小写，关键字建议使用大写.

4.注释 单行 ：--注释内容或#注释内容（mysql特有）

​             多行 ：/\*注释内容*/

### SQL分类：

![image-20240108192521759](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401081925812.png)

### DDL：

```
查询
   查询所有数据库
   SHOW DATABASE；
   查询当前数据库
   SELECT DATABASE();
   
创建
	CREATA DATABASE[IF NOT EXISTS]数据库名[DEFAULT CHARSET字符集][COLLATE 排序规则];  
	字符集建议utf8mb4
删除
	DROP DATABASE[IF EXISTS]数据库名;
	
使用
    USE 数据库名;
```

#### DDL-表结构-查询

```
查询当前数据库所有表
show tables;
查询表结构
desc 表名；
查询指定表的建表语句
show create table 表名;
```

####  DDL-表操作-创建

```
create table 表名(
    字段1 字段1类型[COMMENT 字段1注释],
   字段2 字段2类型[COMMENT 字段2注释]

)[COMMENT 表注释];
```

![image-20240108192550862](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401081925880.png)



#### 数值类型

![image-20240107151403868](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401071514943.png)

age TINYINT UNSLGNED；无符号类型 unsigned

age TINYINT SLGNED ； 有符号类型  signed



字符串类型

![image-20240107151551336](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401071515371.png)

char(x)和varchar(x)都要带参数，表示存储字符串的个数

char()性能好 gander char(1)

varchar()性能差 name varchar(10);  定长用char，不定长用varchar



日期类型

![image-20240107152239395](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401071522440.png)



####  DDL-表操作-修改

```
添加字段
alter table 表名 add 字段名 类型（长度）[comment 注释];
修改数据类型
alter table 表名 modify 字段名 新数据类型（长度）
修改字段名和字段类型
alter 表名 change 旧字段名 新字段名 类型（长度）[comment 注释][约束]；
修改表名
alter table rename to 表名
```



####  DDL-表操作-删除

```
删除字段
alter table 表名 drop 字段名；
删除表
drop table[if exists] 表名；
删除指定表，并重新创建该表
truncate table 表名
```



### DML

#### DML-添加数据

```
给指定字段添加数据
insert into 表名（字段1，字段2...）values(值1,值2,...);
给全部字段添加数据
insert into表名 values(值1,值2,...);
批量添加数据
insert into 表名(字段名1，字段名2,...) values(值1,值2,...),(值1,值2,...),(值1,值2,...);

insert into 表名 values(值1，值2,...),(值1,值2,...);
```

注意：

插入数据时，指定字段顺序需要与值的顺序一一对应。

字符串和日期型的数据应该包含在引号中

输入的数据大小，应该在字段的规定范围内。



#### DML-修改数据

```
update 表名 set 字段名1=值1，字段2=值2，...[where 条件];
```



#### DML-删除数据

```
delete from 字段 where 条件
```

注意：

*delete 语句的条件可以有，也可以没有，如果没有条件，则会删除整张表的所有数据

*delete 语句不能删除每一个字段的值（可以使用update）

### DQL--查询

#### DQL-语法

```
select
     字段列表
from  
      表名列表
      
where 
       条件列表
      
group by
        分组字段列表
having
        分组后条件列表
        
order by
         排序字段列表
         
limlt
       分页参数
```

#### DQL-基本查询

```
查询多个字段
select 字段1，字段2.....from 表名;
select * from 表名;(查询返回所有字段)

设置别名
select 字段1 [as 别名1]，字段2 [as 别名2] ... from 表名;

去除重复记录
select distinct 字段列表 from 表名;
```

#### DQL-条件查询（where）

```
语法
select 字段列表 from 表名 where 条件列表;
```

![image-20240117213616515](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401172136641.png)

'--'两个字符，‘%x’最后一个字符为x；

#### DQL-聚合函数

含义：将一列数据作为一个整体，进行纵向计算。

![image-20240117215749842](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401172157958.png)

```
语法
select 聚合函数（字段列表） from 表名 [where...];
```

注意：null值不参与所有

#### DQL-分组查询

```
语法
select 字段列表 from 表名[where 条件 ] group by 分组字段名[having 分组后过滤条件]
```

![image-20240117221047389](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401172210435.png)

注意：执行顺序：where>聚合函数>having.

分组之后，查询的字段一般为聚合函数和分组字段，查询其他字段无任何意义

#### DQL-排序查询

```
语法
select 字段列表 from 表名 order by 字段1 排序方式1，字段2 排序方式2;

排序方式
asc：升序（默认）
desc：降序

注意：如果是多字段排序，当第一个字段值相同是，才会根据第二个字段进行排序
```



#### DQL-分页查询

```
语法
select 字段列表 from 表名 limit 起始索引，查询记录数；
```

注意
		起始索引从0开始，起始索引 = (查询页码 - 1) * 每页显示记录数

分页查询是数据库的方言，不同的数据库有不同的实现，MySQL中是LIMIT

如果查询的是第一页数据，起始索引可以省略，直接简写为 limit 10。



#### DQL-查询顺序

![image-20240119203234662](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401192032785.png)



### DCL

#### DCL-管理用户

```
查询用户
use mysql;
select * from user;

创建用户
crate user '用户名'@'主机名' identified by '密码';
主机名为%时，意思是在任意主机上访问

修改密码
alter user '用户名'@'主机名' identified with mysql_native_password by '新密码';

删除用户
drop user '用户名'@'主机名';
```



#### DCL-权限控制

![image-20240120205326969](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401202053085.png)

```
查询权限
show grants for '用户名'@'主机名';

授予权限
grant 权限列表 on 数据库名.表名 to '用户名'@'主机名';

撤销权限
revoke 权限列表 on 数据库名.表名 from '用户名'@'主机名';
```

注意

多个权限之间，使用逗号分隔

授权时，数据库名和表名可以使用*进行通配，代表所有



## 函数

介绍：一段可以直接被另一段程序调用的程序或代码

### 字符串函数

![image-20240120211126711](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401202111781.png)

语法

select 函数( )；



### 数值函数

![image-20240120212149550](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401202121632.png)



### 日期函数

![image-20240120213007540](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401202130612.png)

### 流程函数

![image-20240120213803018](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401202138125.png)

## 约束

含义：作用于表中字段上的规则，用于限制存储在表中的数据

目的：保证数据库中数据的正确、有效性和完整性

![image-20240127192147524](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401271921634.png)

**约束是作用于表中字段上的，可以在创建表/修改表时添加**

想要实现主键的自增长要使用auto_increment

## 外键约束

概念：外键用来让两张表的数据之间建立连接，从而保证数据的一致性和完整性

语法

```
添加外键
create table 表名(
字段名 数据类型
...
[constraint][外键名称] foreign key(外键字段名) references 主表（主表列名）
);

alter table 表名 add constraint 外键名称 foreign key(外键字段名) references 主表（主表列名);

删除外键
alter table 表名 drop foreign key 外键名称;
```

删除/更新行为

![image-20240127195407287](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401271954410.png)

cascade 级联

```
ALTER TABLE 表名 ADD CONSTRAINT 外键名称 FOREIGN KEY (外键字段) REFERENCES 主表名(主表字段名) ON UPDATE 行为 ON DELETE 行为; 更新时执行这个行为，删除时执行这个行为
```

## 多表查询

### 多表关系

- 一对多（多对一）
- 多对多
- 一对一

#### 一对多

案例：部门与员工
关系：一个部门对应多个员工，一个员工对应一个部门
实现：在多的一方建立外键，指向一的一方的主键

#### 多对多

案例：学生与课程
关系：一个学生可以选多门课程，一门课程也可以供多个学生选修
实现：建立第三张中间表，中间表至少包含两个外键，分别关联两方主键

#### 一对一

案例：用户与用户详情
关系：一对一关系，多用于单表拆分，将一张表的基础字段放在一张表中，其他详情字段放在另一张表中，以提升操作效率
实现：在任意一方加入外键，关联另外一方的主键，并且设置外键为唯一的（UNIQUE）

### 查询

```
合并查询（笛卡尔积，会展示所有组合结果）：
select * from employee, dept;
```

> 笛卡尔积：两个集合A集合和B集合的所有组合情况（在多表查询时，需要消除无效的笛卡尔积）

```
消除无效笛卡尔积：
select * from employee, dept where employee.dept = dept.id;
```

![image-20240128195137288](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202401281951405.png)

### 内连接查询

内连接查询的是两张表交集的部分

```
隐式内连接：
SELECT 字段列表 FROM 表1, 表2 WHERE 条件 ...;

显式内连接：
SELECT 字段列表 FROM 表1 [ INNER ] JOIN 表2 ON 连接条件 ...；
```

显式性能比隐式高

例子：

```mysql
-- 查询员工姓名，及关联的部门的名称
-- 隐式
select e.name, d.name from employee as e, dept as d where e.dept = d.id;
-- 显式
select e.name, d.name from employee as e inner join dept as d on e.dept = d.id;
```

### 外连接查询

左外连接：
查询左表所有数据，以及两张表交集部分数据

```
SELECT 字段列表 FROM 表1 LEFT [ OUTER ] JOIN 表2 ON 条件 ...;
相当于查询表1的所有数据，包含表1和表2交集部分数据
```

右外连接：
查询右表所有数据，以及两张表交集部分数据

```
SELECT 字段列表 FROM 表1 RIGHT [ OUTER ] JOIN 表2 ON 条件 ...;
```

例子：

```mysql
左
select e.*, d.name from employee as e left outer join dept as d on e.dept = d.id;
select d.name, e.* from dept d left outer join emp e on e.dept = d.id;  -- 这条语句与下面的语句效果一样
右
select d.name, e.* from employee as e right outer join dept as d on e.dept = d.id;
```

左连接可以查询到没有dept的employee，右连接可以查询到没有employee的dept

### 自连接查询

当前表与自身的连接查询，自连接必须使用表别名

语法：
`SELECT 字段列表 FROM 表A 别名A JOIN 表A 别名B ON 条件 ...;`

自连接查询，可以是内连接查询，也可以是外连接查询

例子：

```mysql
-- 查询员工及其所属领导的名字
select a.name, b.name from employee a, employee b where a.manager = b.id;
-- 没有领导的也查询出来
select a.name, b.name from employee a left join employee b on a.manager = b.id;
```

### 联合查询 union, union all

把多次查询的结果合并，形成一个新的查询集

语法：

```mysql
SELECT 字段列表 FROM 表A ...
UNION [ALL]
SELECT 字段列表 FROM 表B ...
```

#### 注意事项

- UNION ALL 会有重复结果，UNION 不会
- 联合查询比使用or效率高，不会使索引失效

### 子查询

SQL语句中嵌套SELECT语句，称谓嵌套查询，又称子查询。
`

```
SELECT * FROM t1 WHERE column1 = ( SELECT column1 FROM t2);
```

`
**子查询外部的语句可以是 INSERT / UPDATE / DELETE / SELECT 的任何一个**

根据子查询结果可以分为：

- 标量子查询（子查询结果为单个值）
- 列子查询（子查询结果为一列）
- 行子查询（子查询结果为一行）
- 表子查询（子查询结果为多行多列）

根据子查询位置可分为：

- WHERE 之后
- FROM 之后
- SELECT 之后

#### 标量子查询

子查询返回的结果是单个值（数字、字符串、日期等）。
常用操作符：- < > > >= < <=

例子：

```mysql
-- 查询销售部所有员工
select id from dept where name = '销售部';
-- 根据销售部部门ID，查询员工信息
select * from employee where dept = 4;
-- 合并（子查询）
select * from employee where dept = (select id from dept where name = '销售部');

-- 查询xxx入职之后的员工信息
select * from employee where entrydate > (select entrydate from employee where name = 'xxx');
```

#### 列子查询

返回的结果是一列（可以是多行）。

常用操作符：

| 操作符 | 描述                                   |
| ------ | -------------------------------------- |
| IN     | 在指定的集合范围内，多选一             |
| NOT IN | 不在指定的集合范围内                   |
| ANY    | 子查询返回列表中，有任意一个满足即可   |
| SOME   | 与ANY等同，使用SOME的地方都可以使用ANY |
| ALL    | 子查询返回列表的所有值都必须满足       |

例子：

```mysql
-- 查询销售部和市场部的所有员工信息
select * from employee where dept in (select id from dept where name = '销售部' or name = '市场部');
-- 查询比财务部所有人工资都高的员工信息
select * from employee where salary > all(select salary from employee where dept = (select id from dept where name = '财务部'));
-- 查询比研发部任意一人工资高的员工信息
select * from employee where salary > any (select salary from employee where dept = (select id from dept where name = '研发部'));
```

#### 行子查询

返回的结果是一行（可以是多列）。
常用操作符：=, <, >, IN, NOT IN

例子：

```mysql
-- 查询与xxx的薪资及直属领导相同的员工信息
select * from employee where (salary, manager) = (12500, 1);
select * from employee where (salary, manager) = (select salary, manager from employee where name = 'xxx');
```

#### 表子查询

返回的结果是多行多列
常用操作符：IN

例子：

```mysql
-- 查询与xxx1，xxx2的职位和薪资相同的员工
select * from employee where (job, salary) in (select job, salary from employee where name = 'xxx1' or name = 'xxx2');
-- 查询入职日期是2006-01-01之后的员工，及其部门信息
select e.*, d.* from (select * from employee where entrydate > '2006-01-01') as e left join dept as d on e.dept = d.id;
```

## 事务

事务是一组操作的集合，事务会把所有操作作为一个整体一起向系统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。

基本操作：

```
-- 1. 查询张三账户余额select * from account where name = '张三';-- 2. 将张三账户余额-1000update account set money = money - 1000 where name = '张三';-- 此语句出错后张三钱减少但是李四钱没有增加模拟sql语句错误-- 3. 将李四账户余额+1000update account set money = money + 1000 where name = '李四';-- 查看事务提交方式SELECT @@AUTOCOMMIT;-- 设置事务提交方式，1为自动提交，0为手动提交，该设置只对当前会话有效SET @@AUTOCOMMIT = 0;-- 提交事务COMMIT;-- 回滚事务ROLLBACK;-- 设置手动提交后上面代码改为：select * from account where name = '张三';update account set money = money - 1000 where name = '张三';update account set money = money + 1000 where name = '李四';commit;
```

操作方式二：

开启事务：
`START TRANSACTION 或 BEGIN TRANSACTION;`
提交事务：
`COMMIT;`
回滚事务：
`ROLLBACK;`

操作实例：

```
start transaction;select * from account where name = '张三';update account set money = money - 1000 where name = '张三';update account set money = money + 1000 where name = '李四';commit;
```

### 四大特性ACID

- 原子性(Atomicity)：事务是不可分割的最小操作但愿，要么全部成功，要么全部失败
- 一致性(Consistency)：事务完成时，必须使所有数据都保持一致状态
- 隔离性(Isolation)：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行
- 持久性(Durability)：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的

### 并发事务

| 问题       | 描述                                                         |
| :--------- | :----------------------------------------------------------- |
| 脏读       | 一个事务读到另一个事务还没提交的数据                         |
| 不可重复读 | 一个事务先后读取同一条记录，但两次读取的数据不同             |
| 幻读       | 一个事务按照条件查询数据时，没有对应的数据行，但是再插入数据时，又发现这行数据已经存在 |

> 这三个问题的详细演示：https://www.bilibili.com/video/BV1Kr4y1i7ru?p=55cd

并发事务隔离级别：

| 隔离级别              | 脏读 | 不可重复读 | 幻读 |
| :-------------------- | :--- | :--------- | :--- |
| Read uncommitted      | √    | √          | √    |
| Read committed        | ×    | √          | √    |
| Repeatable Read(默认) | ×    | ×          | √    |
| Serializable          | ×    | ×          | ×    |

- √表示在当前隔离级别下该问题会出现
- Serializable 性能最低；Read uncommitted 性能最高，数据安全性最差

查看事务隔离级别：
`SELECT @@TRANSACTION_ISOLATION;`
设置事务隔离级别：
`SET [ SESSION | GLOBAL ] TRANSACTION ISOLATION LEVEL {READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE };`
SESSION 是会话级别，表示只针对当前会话有效，GLOBAL 表示对所有会话有效
