---
title: NSSRound
date: 2025-02-18 19:44:57
tags:
categories: 比赛复现
---

### [NSSRound#1 Basic]basic_check(put协议)

我们用nikto `nikto -h url `扫描网站或使用curl命令
`curl -I -X OPTIONS http：xxx.com`查看服务器允许的http方法，发现put协议能用

![image-20250218201015487](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502182010829.png)

我们用bp抓包，PUT请求上传命令执行文件,相当于我打了个补丁

![image-20250218201719372](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502182017547.png)

然后命令执行就能得到flag了

### [NSSRound#8 Basic]MyDoor

1、php伪协议任意文件读取，发现无法读取flag，尝试读取源码

2、源码发现代码执行

3、当PHP版本小于8时，如果参数中出现中括号[，中括号会被转换成下划线_

```
/index.php?N[S.S=phpinfo();&file=php://filter/read=convert.base64-encode/resource=./index.php
```

