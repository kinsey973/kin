---
title: '[FBCTF2019]Products Manager'
date: 2024-11-19 19:16:21
tags: sql
categories: 刷题笔记
---

### [FBCTF2019]Products Manager

页面给出了三个功能

查看前5的产品

![image-20241119191925507](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191919624.png)

添加产品

![image-20241119191935229](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191919293.png)

查看产品细节

![image-20241119192001617](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191920655.png)

我们知道了大致的功能，尝试正常的的业务逻辑，首先添加产品，它的secret需要10个以上的大小写字母和数字

![image-20241119192251180](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191922233.png)

然后查看产品的具体细节

![image-20241119192406564](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191924636.png)

具体操作了解了，我们来看源码，其中footer.php没用，header.php页面只是首页三个跳转链接，index.php也没有可以利用的内容，我们来看db.php

```sql
CREATE TABLE products (
  name char(64),
  secret char(64),
  description varchar(250)
);

INSERT INTO products VALUES('facebook', sha256(....), 'FLAG_HERE');
INSERT INTO products VALUES('messenger', sha256(....), ....);
INSERT INTO products VALUES('instagram', sha256(....), ....);
INSERT INTO products VALUES('whatsapp', sha256(....), ....);
INSERT INTO products VALUES('oculus-rift', sha256(....), ....);

```

其中给出了提示，flag在facebook中，我们需要查看它的细节

但我们需要产品的secret值，这里就用到了一个知识点：[基于约束的SQL攻击]()

### 基于约束的SQL攻击

#### 1.数据库字符比较

在数据库对字符串进行比较时，若两字符串的长度不一样，则会在较短的字符串末尾补充空格，使两个字符串的长一致

例如：

str1和str 的比较，比较时会在str的后面添加一个空格来补充长度

```
select * from users where username='test'
select * from users where username='test '
查询结果是一致的 
```

#### 2.insert截断

在数据插入的时候，若数据长度超过了预先设定的限制，例如name char(64)时，数据库会对字符串进行截断，只保留限定的长度

在本题db.php页面源码中，查看添加

产品和查询产品详细函数:

```php
// 添加产品
function insert_product($name, $secret, $description) {
  global $db;
  $statement = $db->prepare(
    "INSERT INTO products (name, secret, description) VALUES
      (?, ?, ?)"
  );
  check_errors($statement);
  $statement->bind_param("sss", $name, $secret, $description);
  check_errors($statement->execute());
  $statement->close();
}

```

插入语句中`"INSERT INTO products (name, secret, description) VALUES ($name, $secret, $description)"`，并未做任何处理，直接插入数据库。

```php
// 查询产品详情
function get_product($name) {
  global $db;
  $statement = $db->prepare(
    "SELECT name, description FROM products WHERE name = ?"
  );
  check_errors($statement);
  $statement->bind_param("s", $name);
  check_errors($statement->execute());
  $res = $statement->get_result();
  check_errors($res);
  $product = $res->fetch_assoc();
  $statement->close();
  return $product;
}

```

在查询语句中`"SELECT name, description FROM products WHERE name = $name"`，只是对获取的`$name`变量进行了拼接，未进行任何处理。

根据上述代码，我们可以添加一个facebook用户，即在产品名后加大于长度限制的空格，空格后需再跟若干个字符，在添加数据时，是添加的产品名与目标一致。

查询的时候，返回的用户名是目标信息，达到水平越权

构造添加的产品信息

```
Name:facebook                                                            11
Secret:qweASDzxc123
Description:123

```

![image-20241119194317211](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191943243.png)

​	产品成功被添加

我们进行查询

```
Name:facebook
Secret:qweASDzxc123
// 因为在存入数据库时，添加的Name属性长度超过限制被截断

```

得到flag

![image-20241119194412038](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191944069.png)
