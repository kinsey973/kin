---
title: '[NPUCTF2020]web🐕'
date: 2024-11-17 14:25:40
tags: AES
categories: 刷题笔记
---

### [NPUCTF2020]web🐕

```php
<?php 
error_reporting(0);
include('config.php');   # $key,$flag
define("METHOD", "aes-128-cbc");  //定义加密方式
define("SECRET_KEY", $key);    //定义密钥
define("IV","6666666666666666");    //定义初始向量 16个6
define("BR",'<br>');
if(!isset($_GET['source']))header('location:./index.php?source=1');


#var_dump($GLOBALS);   //听说你想看这个？
function aes_encrypt($iv,$data)
{
    echo "--------encrypt---------".BR;
    echo 'IV:'.$iv.BR;
    return base64_encode(openssl_encrypt($data, METHOD, SECRET_KEY, OPENSSL_RAW_DATA, $iv)).BR;
}
function aes_decrypt($iv,$data)
{
    return openssl_decrypt(base64_decode($data),METHOD,SECRET_KEY,OPENSSL_RAW_DATA,$iv) or die('False');
}
if($_GET['method']=='encrypt')
{
    $iv = IV;
    $data = $flag;    
    echo aes_encrypt($iv,$data);
} else if($_GET['method']=="decrypt")
{
    $iv = @$_POST['iv'];
    $data = @$_POST['data'];
    echo aes_decrypt($iv,$data);
}
echo "我摊牌了，就是懒得写前端".BR;

if($_GET['source']==1)highlight_file(__FILE__);
?>
```

我们通过代码审计发现这个题是用php写的AES加密页面

从源码我们可以看出来，AES的密钥长度为128位，加密的iv和密文data可控



AES有两种攻击方法：Padding Oracle和字节反转，这道题刚好都考虑

Padding Oracle适合在我们可以知道iv，不清楚加密Key，能够区分解密成功与否的情况下，直接获得明文

而这题刚好可以判断解密是否成功

https://www.jianshu.com/p/833582b2f560

在Padding Oracle Attack攻击中，攻击者输入的参数是IV+Cipher，我们要通过对IV的"穷举"来请求服务器端对我们指定的Cipher进行解密

因此我们需要知道密文，而那个加密函数刚好把密文显示出来了。

这个攻击类似布尔盲注

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/70f2cc5eb9a3bfbe768809a1f242d8e7.png#pic_center)

既然是爆破初始向量，我们需要知道iv是怎样构成的

我们先来看CBC解密是怎么解的

首先密文和key进行运算得到一个中间值，然后再通过这个中间值与iv值的异或，最后得到密文



![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/76c9f11d1cb57ea2e00385ebb9fd1e14.png#pic_center)

上述文章已经讲的很清楚了

由于这题如果解密失败会返False，因此我们只需通过枚举IV，然后得到中间值，然后再中间值和原来真正的IV异或，即可得到明文。

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/9bb8fa1d210cc2b5f035d978f35d0d22.png#pic_center)



因此需要通过padding值来判断中间值

我们可以知道padding的长度和middle是相等的

看了wp，不知道这个公式怎么来的，记一下

[一道ctf题目](https://www.jianshu.com/p/ad8bdd87e131)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/5fa19436b433833ce522bedde8295020.png#pic_center)

因此IV的构成不难猜了

首先IV肯定是16位的也就是0000000000000000

在进行爆破时他需要还剩下爆破的位数+正在爆破的值，再加上最后的位数要运算后要保证和padding相等，因此iv[N-step+1:] ^ middle = padding 由此这最后一位就是middle和padding进行异或的结果

刚开始middle未知，因此middle要为空值，

如果解密成功那么middle[当前位置]= iv爆破成功的值 ^当前的位置


由此构造exp

```
import requests
import time



iv = "6666666666666666"

N = 16

middle =""
m =''

url ='http://7dbf58a1-ae85-4457-a828-0a131c8a1f17.node3.buuoj.cn/index.php?source=1&method=decrypt'


def xor(a,b):
    return "".join([chr(ord(a[i]) ^ ord(b[i])) for i in range(0,len(a))])

for step in range(1,N+1):
    padding = chr(step) * (step -1)
    print("爆破的最后{}位".format(step))
    for i in range(0,256):
        print(i)
        new_iv = chr(0)*(N-step)+chr(i)+xor(padding,middle)
        data={
            "iv":new_iv,
            "data":'ly7auKVQCZWum/W/4osuPA=='
        }
        r = requests.post(url=url,data=data)
        time.sleep(0.06)


        if r.text != "False":
            middle =xor(chr(i),chr(step)) +middle
            print(middle)
            break

```

得到FlagIsHere.php

我们访问FlagIsHere.php

```php
ptdZn+MkBf36SZCFd989dA==
<?php 
#error_reporting(0);
include('config.php');    //$fl4g
define("METHOD", "aes-128-cbc");
define("SECRET_KEY", "6666666");
session_start();

function get_iv(){    //生成随机初始向量IV
    $random_iv='';
    for($i=0;$i<16;$i++){
        $random_iv.=chr(rand(1,255));
    }
    return $random_iv;
}

$lalala = 'piapiapiapia';

if(!isset($_SESSION['Identity'])){
    $_SESSION['iv'] = get_iv();

    $_SESSION['Identity'] = base64_encode(openssl_encrypt($lalala, METHOD, SECRET_KEY, OPENSSL_RAW_DATA, $_SESSION['iv']));
}
echo base64_encode($_SESSION['iv'])."<br>";

if(isset($_POST['iv'])){
    $tmp_id = openssl_decrypt(base64_decode($_SESSION['Identity']), METHOD, SECRET_KEY, OPENSSL_RAW_DATA, base64_decode($_POST['iv']));
    echo $tmp_id."<br>";
    if($tmp_id ==='weber')die($fl4g);
}

highlight_file(__FILE__);
?>
```

然后就是cbc字节反转

![image-20241117165817682](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171658761.png)

要求’piapiapiapia’加密的密文，通过可控IV，解密成’weber’，就是要我们把IV给解出来

当遇到明文已经经过IV处理过，然后要你解出来是另一个明文时，就要用到CBC字节反转

由于是128长度，16位为一组

因此

两个明文后面都要补齐，填充模式是PK7模式填充，就是拿16减去最后一位的位数的十六进制来进行填充

```
比如：piapiapiapia\0x04\0x04\0x04\0x04
weber\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B\0x0B
```

然后直接上脚本吧，多说无益，这个看脚本就能理解

方法就是将目标i明文和初始的IV异或后再和原来的明文进行异或。

注意在python3里，一定要传入byte类型，否则将会自动解码hex.

```python
import base64


def add(s):
    # 块长度为128位=16个字节，需要补齐，填充模式是PK7
    t = 16 - len(s)
    p = r'\x' + hex(t)[2:].zfill(2)
    print(s + p * t)


# add('weber')
# 在python3里，需要传入byte类型，否则将会自动解码hex，记得补齐
target = b'weber\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b'  # 目标字符串
orginal = b'piapiapiapia\x04\x04\x04\x04'  # 源字符串

iv = base64.b64decode('nmENbLyPO2t6r9XaRJ7dPw==')  # 初始向量
result = b''
for i in range(16):
    result += bytes([target[i] ^ iv[i] ^ orginal[i]])

print(base64.b64encode(result))


//mW0OeaflQAkQ1LewS5HSMA==
```

但一开始生成的ptdZn+MkBf36SZCFd989dA==不行，可能因为里面含泪一个+号，我们删掉cookie重新生成，知道iv里没有+号

将得到的iv传过去后得到一个网站

![image-20241117165806893](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171658033.png)

原来正常操作是这个网盘能下载之前那个helloworld.class文件。可能因为链接失效了吧，buu就直接把helloworld.class文件给我们了

我们将helloworld.class放到jd-gui反编译

![image-20241117170147443](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171701479.png)

得到了一串ascii码的东西，我们将其解密出来，得到flag

```
        byte[] var10000 = new byte[]{102, 108, 97, 103, 123, 119, 101, 54, 95, 52, 111, 103, 95, 49, 115, 95, 101, 52, 115, 121, 103, 48, 105, 110, 103, 125};
        String flag="";
        for(int j =0; j<var10000.length ;j++){
            flag +=(char)var10000[j];
        }
        System.out.println(flag);

```

![image-20241117170436374](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411171704623.png)
