---
title: '[BSidesCF 2019]Mixer'
date: 2024-11-20 19:04:11
tags: 
      - 分组加密
categories: 刷题笔记
---

### [BSidesCF 2019]Mixer

刚进入页面，提示我们要使自己为admin

但is_admin选项是灰色的，我们修改js

![image-20241120192032067](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411201920119.png)

然后随便输入个账号进行登录，发现登录后依旧提示我们不是admin，我们猜测cookie被重置了

我们将`is_admin`设置为`1`，抓个包看一下

![image-20241120192519966](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411201925049.png)

果然，存在个set-cookie，我们将回显页面刷新，重新抓取数据包

我们再将user的前三个字符修改为111，看看回显

![image-20241120192944845](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411201929973.png)

成功得到了报错内容，因为只改了开头，所以只有后半部分完整

我们以相同的方式在最后的三个位置修改为111，得到了session的解密

![image-20241120193155248](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411201931306.png)

```
{"first_name":"first","last_name":"last","is_admin":0}

```

这里我们需要了解一下[分组密码工作模式](https://zh.wikipedia.org/wiki/分组密码工作模式)

[图解分组密码五大工作模式](https://blog.csdn.net/shaosunrise/article/details/80035297)

本题也就是每块内容被分成固定的大小块单独加密，推测为ECB模式

ECB是16字节一个块，每组相互独立，加密后每组为32位，尝试整块替换，并且在**json**中`1.00 == 1`

首先构造被加密的字符串

```python
{"first_name":"A1.00000000000000","last_name":"last","is_admin":0}
```

我们可以将字符串拆成5组，也就是

```
# 第一组
{"first_name":"A

# 第二组
1.00000000000000

# 第三组
","last_name":"l

# 第四组
ast","is_admin":

# 第五组
0}

```

我们将加密后的第二组放到第四组的后面，构成

```
"is_admin":1.00000000000000
```

完成了构造，那么就需要加密后的cookie，因为没有加密所需的key，所以通过原页面完成，构造登录内容

```
first name = A1.00000000000000
last name = last

```

提交表单后，我们得到了user的值

```
4877c6993a88a12b920dd6044f5b7535943f6c9cc87a3d2ecc6fae7ef3a62340fcb7226588a4001f7d7ce2b8ebc3b5078679c68a27c7de7ee67515bb01ab6e610395f3b0776d474b5a5f6ad104768390
```

前四组不要动，也就是到128位之前，我们将32到64位作为第二组内容取出，并拼接到第四组后

```
s = "4877c6993a88a12b920dd6044f5b7535943f6c9cc87a3d2ecc6fae7ef3a62340fcb7226588a4001f7d7ce2b8ebc3b5078679c68a27c7de7ee67515bb01ab6e610395f3b0776d474b5a5f6ad104768390"

res = s[:128] + s[32:64] + s[128:]
print(res)

```

得到构造好的user

```
4877c6993a88a12b920dd6044f5b7535943f6c9cc87a3d2ecc6fae7ef3a62340fcb7226588a4001f7d7ce2b8ebc3b5078679c68a27c7de7ee67515bb01ab6e61943f6c9cc87a3d2ecc6fae7ef3a623400395f3b0776d474b5a5f6ad104768390
```

我们将user修改为构造好的，刷新一下页面，得到flag

![image-20241120195209596](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411201952642.png)
