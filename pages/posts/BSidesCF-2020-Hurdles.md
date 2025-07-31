---
title: '[BSidesCF 2020]Hurdles'
date: 2024-09-10 19:14:40
tags: curl
categories: 刷题笔记
---

### [BSidesCF 2020]Hurdles

我们打开页面，发现页面提示

![image-20240910194058802](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409101941900.png)

我们访问/hurdles

![image-20240910194129958](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409101941023.png)

提示我们使用PUT方法



<!--more-->

```
curl -X PUT http://node5.buuoj.cn:27128/hurdles 
```

![image-20240910195905317](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409101959421.png)

接下来提示url末尾为!

```
curl -X PUT http://node5.buuoj.cn:27128/hurdles/!
```

![image-20240910200041269](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102000324.png)

提示url要get flag

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag'
```

需要将请求链接以`‘`单引号包裹，访问后得到结果：

![image-20240910200254190](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102002241.png)

需要传参的名为`&=&=&`，首先将其进行url编码，得到：`%26%3D%26%3D%26`，构造传参

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=1'
```

![image-20240910200422210](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102004253.png)

提示&=&=&与%00(换行符)相等，其后还包含了一个换行符，也是进行URL编码：`%2500%0a`，构造传参：

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a'
```

![image-20240910200638841](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102006897.png)

提示我们需要传username为player

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:player'
```

![image-20240910200748531](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102007561.png)

接着提示密码为open sesame的十六进制**MD5**值：`54ef36ec71201fdf9d1423fd26f97f6b`

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
```

![image-20240910201111243](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102011272.png)

提示使用1337浏览器

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser'
```

![image-20240910201229721](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102012745.png)

提示浏览器版本为9000

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000'
```

![image-20240910201319602](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102013679.png)

期待有人将这个转发给我，提示给出了`Forwarded-For`，猜测为修改`X-Forwared-For`为`127.0.0.1`，使用`-H`参数添加HTTP请求头`X-Forwarded-For:127.0.0.1`

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:127.0.0.1'
```

![image-20240910201408865](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102014951.png)

提示使用别的代理

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:1.1.1.1,127.0.0.1'

```

![image-20240910201608610](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102016669.png)

提示使用代理13.37.13.37

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1'
```

![image-20240910201711307](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102017360.png)

提示使用cookie Fortune

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=1'
```

![image-20240910201824749](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102018831.png)

需要**Cookie**中包含`2011`年的`RFC编号`，通过查阅资料：[Datatracker](https://datatracker.ietf.org/doc/rfc6265/)

了解到`2011`版的RFC协议的值为`6265`，构造传参：

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265'
```

![image-20240910201909117](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102019154.png)

提示只接受text形式

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265' -H 'Accept:text/plain'
```

![image-20240910202015924](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102020980.png)

提示了一串俄语

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f65c14a67728393424645391c769f227.png)

我们修改语言为ru

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265' -H 'Accept:text/plain' -H'Accept-Language:ru'
```

![image-20240910202132163](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102021248.png)

提示请求来自`https://ctf.bsidessf.net`，尝试添加了请求头`Referer`属性，但始终未能成功进入下一个，发现是`origin:https://ctf.bsidessf.net`

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265' -H 'Accept:text/plain' -H'Accept-Language:ru' -H'Origin:https://ctf.bsidessf.net'
```

![image-20240910202241678](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102022770.png)

提示请求来自`https://ctf.bsidessf.net/challenges`，尝试添加了请求头Referer:https://ctf.bsidessf.net/challenges

```
curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'
-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265' -H 'Accept:text/plain' -H'Accept-Language:ru' -H'Origin:https://ctf.bsidessf.net' -H'Referer:https://ctf.bsidessf.net/challenges'
```

![image-20240910202337106](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102023189.png)

然后就没了，也没看见flag，我们猜测flag在头信息中

```
x 1curl -X PUT 'http://node5.buuoj.cn:27128/hurdles/!?get=flag&%26%3D%26%3D%26=%2500%0a' -u 'player:54ef36ec71201fdf9d1423fd26f97f6b'2-A'1337 Browser v.9000' -H 'X-Forwarded-For:13.37.13.37,127.0.0.1' -b 'Fortune=6265' -H 'Accept:text/plain' -H'Accept-Language:ru' -H'Origin:https://ctf.bsidessf.net' -H'Referer:https://ctf.bsidessf.net/challenges' -i
```

![image-20240910202416464](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409102024543.png)

关于curl看这个：https://blog.csdn.net/deliciousion/article/details/78062521
