---
title: '[PWNHUB 公开赛 2018]傻 fufu 的工作日'
date: 2025-03-02 15:04:27
tags: 
      - 文件上传
      - phpjiami
categories: 刷题笔记
---

## [PWNHUB 公开赛 2018]傻 fufu 的工作日

我们先扫描目录，发现文件index.php.bak

下载打开，提示文件被PHPjiami加密了

![image-20250302151724102](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021517232.png)

**phpjiami加密流程**

> [加密](https://so.csdn.net/so/search?q=加密&spm=1001.2101.3001.7020)流程：源码 -> 加密处理（压缩，替换，BASE64，[转义](https://so.csdn.net/so/search?q=转义&spm=1001.2101.3001.7020)）-> 安全处理（验证文件 MD5 值，限制
> IP、限域名、限时间、防破解、防[命令行](https://so.csdn.net/so/search?q=命令行&spm=1001.2101.3001.7020)调试）-> 加密程序成品，再简单的说：源码 + 加密外壳

我们去网上找个解密脚本

https://vsalw.com/1594.html

![image-20250302153252493](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021532666.png)

encode文件夹放待加密的文件，文件格式恢复成php

decode文件为明文

我们运行

```
php phpjiami.php
```

得到源码

![image-20250302155459194](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021554279.png)

我们发现有个UploadFile.class.php

访问UploadFile.class.php.bak将其下载下来

依旧解码得到

```php
<?php

class UploadFile {
    public $error = '';

    protected $field;
    protected $allow_ext;
    protected $allow_size;
    protected $dist_path;
    protected $new_path;

    function __construct($dist_path, $field='upfile', $new_name='random', $allow_ext=['gif', 'jpg', 'jpeg', 'png'], $allow_size=102400)
    {
        $this->field = $field;
        $this->allow_ext = $allow_ext;
        $this->allow_size = $allow_size;
        $this->dist_path = realpath($dist_path);

        if ($new_name === 'random') {
            $this->new_name = uniqid();
        } elseif (is_string($new_name)) {
            $this->new_name = $new_name;
        } else {
            $this->new_name = null;
        }
    }

    protected function codeToMessage($code) 
    { 
        switch ($code) {
            case UPLOAD_ERR_INI_SIZE: 
                $message = "The uploaded file exceeds the upload_max_filesize directive in php.ini"; 
                break; 
            case UPLOAD_ERR_FORM_SIZE: 
                $message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
                break; 
            case UPLOAD_ERR_PARTIAL: 
                $message = "The uploaded file was only partially uploaded"; 
                break; 
            case UPLOAD_ERR_NO_FILE: 
                $message = "No file was uploaded"; 
                break; 
            case UPLOAD_ERR_NO_TMP_DIR: 
                $message = "Missing a temporary folder"; 
                break; 
            case UPLOAD_ERR_CANT_WRITE: 
                $message = "Failed to write file to disk"; 
                break; 
            case UPLOAD_ERR_EXTENSION: 
                $message = "File upload stopped by extension"; 
                break; 
            default: 
                $message = "Unknown upload error"; 
                break; 
        } 
        return $message; 
    } 

    protected function error($info)
    {
        $this->error = $info;
        return false;
    }

    public function upload()
    {
        if(empty($_FILES[$this->field])) {
            return $this->error('上传文件为空');
        }
        if(is_array($_FILES[$this->field]['error'])) {
            return $this->error('一次只能上传一个文件');
        }
        if($_FILES[$this->field]['error'] != UPLOAD_ERR_OK) {
            return $this->error($this->codeToMessage($_FILES[$this->field]['error']));
        }
        $filename = !empty($_POST[$this->field]) ? $_POST[$this->field] : $_FILES[$this->field]['name'];
        if(!is_array($filename)) {
            $filename = explode('.', $filename);
        }
        foreach ($filename as $name) {
            if(preg_match('#[<>:"/\\|?*.]#is', $name)) {
                return $this->error('文件名中包含非法字符');
            }
        }

        if($_FILES[$this->field]['size'] > $this->allow_size) {
            return $this->error('你上传的文件太大');
        }
        if(!in_array($filename[count($filename)-1], $this->allow_ext)) {
            return $this->error('只允许上传图片文件');
        }

        // 用.分割文件名，只保留首尾两个字符串，防御Apache解析漏洞
        $origin_name = current($filename);
        $ext = end($filename);
        $new_name = ($this->new_name ? $this->new_name : $origin_name) . '.' . $ext;
        $target_fullpath = $this->dist_path . DIRECTORY_SEPARATOR . $new_name;

        // 创建目录
        if(!is_dir($this->dist_path)) {
            mkdir($this->dist_path);
        }

        if(is_uploaded_file($_FILES[$this->field]['tmp_name']) && move_uploaded_file($_FILES[$this->field]['tmp_name'], $target_fullpath)) {
            // Success upload
        } elseif (rename($_FILES[$this->field]['tmp_name'], $target_fullpath)) {
            // Success upload
        } else {
            return $this->error('写入文件失败，可能是目标目录不可写');
        }

        return [
            'name' => $origin_name,
            'filename' => $new_name,
            'type' => $ext
        ];
    }
}
 
```

关键代码

```php
 if(!in_array($filename[count($filename)-1], $this->allow_ext)) {
            return $this->error('只允许上传图片文件');
        }

        return [
            'name' => $origin_name,
            'filename' => $new_name,
            'type' => $ext
        ];
```

存在绕过

利用上传数组`upfile('1'->'jpg','0'->'php')`

所以`$filename[count($filename)-1]`取出的是jpg

`end($filename)`取出的是php

绕过达成

![image-20250302161722720](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021617907.png)

![image-20250302161732814](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503021617913.png)

找到上传目录后我们直接连蚁剑，在根目录得到flag
