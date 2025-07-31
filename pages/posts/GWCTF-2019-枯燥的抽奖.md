---
title: '[GWCTF 2019]枯燥的抽奖'
date: 2024-05-31 20:37:35
tags: 题解

---

## [GWCTF 2019]枯燥的抽奖（php_mt_seed脚本&伪随机数生成）

我们首先打开页面源码，发现一串关键代码

<!-- more -->

```
<script type="text/javascript">
$(document).ready(function(){
    $("#div1").load("check.php #p1");

        $(".close").click(function(){
        		$("#myAlert").hide();
    });	     

    $("#button1").click(function(){
    	$("#myAlert").hide();
    	guess=$("input").val();
		$.ajax({
	   type: "POST",
	   url: "check.php",
	   data: "num="+guess,
		   success: function(msg){
		     $("#div2").append(msg);
		     alertmsg = $("#flag").text(); 
		     if(alertmsg=="没抽中哦，再试试吧"){
		      $("#myAlert").attr("class","alert alert-warning");
		      if($("#new").text()=="")
		     	$("#new").append(alertmsg);
		     }
		     else{		     	
		     	$("#myAlert").attr("class","alert alert-success");
		     	if($("#new").text()=="")	
		     		$("#new").append(alertmsg);	
		     }

		 
		   }
		}); 
		$("#myAlert").show();
		$("#new").empty();
		 $("#div2").empty();
	});
});
</script>
```

我们在其中发现了一个文件check.php，我们访问它看看

得到了check.php的源码

```
zmlIh72gss

<?php
#这不是抽奖程序的源代码！不许看！
header("Content-Type: text/html;charset=utf-8");
session_start();
if(!isset($_SESSION['seed'])){
$_SESSION['seed']=rand(0,999999999);
}

mt_srand($_SESSION['seed']);
$str_long1 = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
$str='';
$len1=20;
for ( $i = 0; $i < $len1; $i++ ){
    $str.=substr($str_long1, mt_rand(0, strlen($str_long1) - 1), 1);       
}
$str_show = substr($str, 0, 10);
echo "<p id='p1'>".$str_show."</p>";


if(isset($_POST['num'])){
    if($_POST['num']===$str){x
        echo "<p id=flag>抽奖，就是那么枯燥且无味，给你flag{xxxxxxxxx}</p>";
    }
    else{
        echo "<p id=flag>没抽中哦，再试试吧</p>";
    }
}
show_source("check.php");
```

开始进行代码审计

可以注意到我们猜测字符串是采用伪随机函数依据种子生成的，所以我们可以利用脚本通过给出的部分字符串逆推出伪随机函数采用的种子（这里脚本采用的是php_mt_seed）。

先使用PHP编写程序把给出的部分字符串处理成脚本需要的数据格式，程序源码如下：

```
<?php
error_reporting(0);
$str_long1 = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
$string='tsD5SzCFpA';
$len1=20;
for ( $i = 0; $i < $len1; $i++ ){
$pos=strpos($str_long1,$string[$i]);
    echo $pos." ".$pos." 0 61 " ;  
}
?>
```

传入脚本执行得出种子。

![image-20240531210956094](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405312109232.png)

生成完整字符串的代码从check.php中截取就ok，将获得的种子传入拿到完整的字符串。

```
<?php
mt_srand(895254662);    //在这里填入获得的种子
$str_long1 = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
$str='';
$len1=20;
for ( $i = 0; $i < $len1; $i++ ){
    $str.=substr($str_long1, mt_rand(0, strlen($str_long1) - 1), 1);
}
echo($str);
?>
```

得到原本的字符串

![image-20240531211100473](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405312111498.png)

首页提交上去就能得到flag了

![image-20240531211126693](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202405312111954.png)
