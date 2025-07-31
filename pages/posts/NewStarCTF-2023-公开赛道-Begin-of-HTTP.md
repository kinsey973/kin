---
title: '[NewStarCTF 2023 公开赛道]Begin of HTTP'
date: 2024-11-03 14:59:04
tags: http
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]Begin of HTTP

开局让我们用ctf传个1

```
?ctf=1
```

然后让我们post传secert，传的值在页面源码里，base64解码就行

```
?ctf=1
secret=n3wst4rCTF2023g00000d
```

接着让我们使用NewStarCTF2023浏览器

我们修改User-Agent为NewStarCTF2023

然后让我们修改referer为 newstarctf.com

最后一关提示我提示用本地用户

但我们不能使用xff，我们需要使用X-Real-IP为127.0.0.1



X-Forwarded-For和X-Real-IP，前者为是用于记录代理信息的,每经过一级代理，该字段就会记录来源地址,经过多级代理，服务端就会记录每级代理的X-Forwarded-For信息，后者则只记录真实发出请求的客户端IP。因此，在请求头里添加一个X-Real-IP为127.0.0.1就可以得到flag的值了。

