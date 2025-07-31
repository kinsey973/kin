---
title: '[LineCTF2022]gotm'
date: 2024-11-13 20:07:58
tags:
      - jwt
      - ssti
      - go
categories: 刷题笔记
---

### [LineCTF2022]gotm

题目给出了go的源码（不熟）

![image-20241113202414896](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132024001.png)

我们主要来看main.go的代码

有个Account结构体，主要四个属性

```go
type Account struct {
	id         string
	pw         string
	is_admin   bool
	secret_key string
}
```

有四个路由

```go
func main() {
    admin := Account{admin_id, admin_pw, true, secret_key}
    acc = append(acc, admin)

    http.HandleFunc("/", root_handler)
    http.HandleFunc("/auth", auth_handler)
    http.HandleFunc("/flag", flag_handler)
    http.HandleFunc("/regist", regist_handler)
    log.Fatal(http.ListenAndServe("0.0.0.0:11000", nil))
}
```

我们一个一个来审

我们先来看"/"路由

```go
func root_handler(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-Token")
	if token != "" {
		id, _ := jwt_decode(token)
		acc := get_account(id)
		tpl, err := template.New("").Parse("Logged in as " + acc.id)
		if err != nil {
		}
		tpl.Execute(w, &acc)
	} else {

		return
	}
}
```

先获取Token,如果有Token则用jwt解密,如果解密成功则显示用户的id，如果没有token直接返回空白

然后审’/auth’

```go
uid := r.FormValue("id")
	upw := r.FormValue("pw")
	if uid == "" || upw == "" {
		return
	}
```

获取用户传入的id和pw

```
user_acc := get_account(uid)
	if user_acc.id != "" && user_acc.pw == upw {
		token, err := jwt_encode(user_acc.id, user_acc.is_admin)
		if err != nil {
			return
		}
		p := TokenResp{true, token}
		res, err := json.Marshal(p)
		if err != nil {
		}
		w.Write(res)
		return
	}
```

如果输入了正确的id和pw(get_account有匹配的正确结果)，返回一个TokenResp的对象（json形式），里面存储了状态status,和jwt token，内容是id和是否为admin

```
type TokenResp struct {
	Status bool   `json:"status"`
	Token  string `json:"token"`
}
```



然后我们审计“/flag”路由

```
func flag_handler(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-Token")
	if token != "" {
		id, is_admin := jwt_decode(token)
		if is_admin == true {
			p := Resp{true, "Hi " + id + ", flag is " + flag}
			res, err := json.Marshal(p)
			if err != nil {
			}
			w.Write(res)
			return
		} else {
			w.WriteHeader(http.StatusForbidden)
			return
		}
	}
}
```

通过对传入的X-Token进行jwt解码，然后判断is_admin，如果为true就给flag



最后来看/regist路由

```
func regist_handler(w http.ResponseWriter, r *http.Request) {
	uid := r.FormValue("id")
	upw := r.FormValue("pw")

	if uid == "" || upw == "" {
		return
	}

	if get_account(uid).id != "" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	if len(acc) > 4 {
		clear_account()
	}
	new_acc := Account{uid, upw, false, secret_key}
	acc = append(acc, new_acc)

	p := Resp{true, ""}
	res, err := json.Marshal(p)
	if err != nil {
	}
	w.Write(res)
	return
}
```

路由中默认给is_admin为false，所以我们要想办法给is_admin为true



由于jwt编码过程中需要用到secret_key作签名密钥，secret_key是环境变量，就需要通过SSTI漏洞把secret_key

现在我们要利用go ssti注入获取key然后伪造jwt

https://forum.butian.net/share/1286

> 先说一下go的ssti，和jinja2的ssti类似，都是因为直接渲染拼接的字符导致插入了模板语言后执行
>
> Go 语言内置了 text/template 和 html/template 两个模板库。如果开发人员没有正确使用这些库，可能会导致 SSTI 注入。例如，如果使用 text/template 处理用户输入，并且未对输入进行转义，攻击者可以插入恶意模板代码。

这里ssti漏洞产生的位置在

http.HandleFunc("/", root_handler)

```go
func root_handler(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-Token")
	if token != "" {
		id, _ := jwt_decode(token)	#从jwt中解析出id属性
		acc := get_account(id)	#根据id，查找账户
		tpl, err := template.New("").Parse("Logged in as " + acc.id) #acc.id存在SSTI
		if err != nil {
		}
		tpl.Execute(w, &acc)
	} else {

		return
	}
}
```

常规思路可以注入`{{.}}`或`{{.secret_key}}`来读secret_key属性，但此处由于`root_handler()`函数得到的acc是数组中的地址，也就是get_account函数通过在全局变量acc数组中查找我们的用户，这种情况下直接注入`{{.secret_key}}`会返回空，所以此处只能用`{{.}}`来返回全部属性

我们在/regist页面进行注册

```
?id={{.}}&pw=pass
```

![image-20241113204914697](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132049742.png)

然后我们访问auth进行登录，得到token

![image-20241113205009390](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132050435.png)

我们再回到最开始的页面，将token值传入X-Token头部，成功读到secret_key
![image-20241113205118101](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132051149.png)

得到secret_key

```
this_is_f4Ke_key
```

我们修改jwt，将is_admin修改为true.

![image-20241113205308627](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132053672.png)

再到/flag页面，将修改后的jwt传入token中

得到flag

![image-20241113205404717](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411132054772.png)
