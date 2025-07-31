---
title: crypto ECC加密
date: 2024-11-27 19:14:22
tags: 
     - crypto
     - ECC
categories: 密码笔记
sticky: 100
---

### 椭圆曲线加密

椭圆曲线是一条由方程$$y^2=x^3+ax+b$$给定的曲线，说白了只要满足以上形式的方程都是椭圆曲线，其中a、b为常数，并满足$$4a^3+27b^2!=0$$（确保曲线上没有奇点，即曲线上任意一个点都有切线，确保每个点都有切线是十分重要的）

### 原理

椭圆曲线上的两个点P和Q，k为整数

Q=KP

点P称为基点；K为私钥；Q为公钥

给定k和P，根据加法法则，计算Q很容易

但给定P和Q求k非常困难（实际应用ECC，质数p取非常大，穷举出k非常困难）

### **加法法则**

在椭圆曲线上取两点A、B，画一条过A、B的直线，该直线与椭圆曲线交于一点，记该交点关于x轴对称位置的点为点C，定义为A+B，即为加法A + B = C。如下图所示：

![image-20241127192159966](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411271922078.png)

如果是A+A，那么就是过A点的切线与椭圆曲线的交点关于X轴对称的位置

![image-20241127192335447](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411271923485.png)

此外，在椭圆曲线中只有“加法”，没有减法，所以我们只能写为+（-x）的形式，B=C+(-A),
再用一次以上的“加法运算，”显然A与-A关于x轴对称，而A+（-A）通过下图显然是与椭圆曲线是没有交点的，所以A+（-A）=0，所以除了坐标系上曲线的点，椭圆曲线额外定义一个点（无穷远处），记为 0（因为群的封闭性）。

![image-20241127201514890](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411272015024.png)

### 有限域

椭圆曲线是连续的，容易被找到规律，并不适合用于加密；所以必须把椭圆曲线变成离散的点，要把椭圆曲线定义在有限域上。

实际上，域是一个可以在其上进行加法、减法、乘法和除法运算而结果不会超出域的集合。如有理数集合、实数集合、复数集合都是域，但整数集合不是（很明显，使用除法得到的分数或小数已超出整数集合）。
如果域F只包含有限个元素，则称其为有限域。有限域中元素的个数称为有限域的阶。尽管存在有无限个元素的无限域，但只有有限域在密码编码学中得到了广泛的应用。每个有限域的阶必为素数的幂，即有限域的阶可表示为pⁿ（p是素数、n是正整数），该有限域通常称为Galois域(Galois Fields)，记为GF(pⁿ)。

![image-20241127192800827](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411271928900.png)

### 有限域上的椭圆曲线

![image-20241127193246850](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411271932955.png)

### 加密过程

![image-20241127192925473](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411271929564.png)

1、用户A选定一条椭圆曲线Ep(a,b)，并取椭圆曲线上一点，作为基点P。

2、用户A选择一个私有密钥k，并生成公开密钥Q=kG。

3、用户A将Ep(a,b)和点Q，P传给用户B。

4、用户B接到信息后 ，将待传输的明文编码到Ep(a,b)上一点M（编码方法很多，这里不作讨论），并产生一个随机整数r。

5、用户B计算点C1=M+rK；C2=rP。

6、用户B将C1、C2传给用户A。

7、用户A接到信息后，计算C1-kC2，结果就是点M。因为 C1-kC2=M+rK-k(rP)=M+rK-r(kP)=M
   再对点M进行解码就可以得到明文。



### 例题

```python
from Crypto.Util.number import *
from gmpy2 import *
from random import *
from secret import flag

p=getPrime(600)
a=bytes_to_long(flag)
b=randrange(2,p-1)
E=EllipticCurve(GF(p),[a,b])
G=E.random_element()

x1,y1,_=G
G=2*G 
x2,y2,_=G

print(f"p = {p}")
print(f"b = {b}")
print(f"x1 = {x1}")
print(f"x2 = {x2}")

'''
p = 2978504498661002629091299071582436290465904673149953768927904567383228838983804727503168770704927560352042485566736762649409218645007506958368851729754839447148084715613471942096737
b = 203155971939366413053854572390533580854014345966175709774130058801484693709794880904842038444407635302410301870035839686400041986234396869946957773156780151597585571207840328547492
x1 = 2961746450301081157772024536903602376932457486781631924575753810982866784201238112170620297100938460251128698788082874030972104190128685218417680444326891343632886092532386859114448
x2 = 890136530671131957244004062733232817452520380339736536303621498985673475366221669385748542093619285319261702354866398531524362067791067563428973366865229056520602220404939306258451

'''
```

这是一道很简单的ECC，首先看椭圆曲线：

y\^2=x^3+a*x+b

并且在本题中还有modp为条件，不妨令A(x1,y1),B(x2,y2)，B=2A

然后再说明一下公式：

$$x3\equiv k^2-x1-x2(modp)$$

$$y3\equiv k(x1-x3)-y1(modp)$$

当两个点相同时,k=（3x1^2+a)/2y1(modp),所以

x2=k^2-2x1(modp)------------------------------1

k=（3*x1\^2+a)/(x^3+ax+b)(modp)-------------2

由式1：

k^2=x2+2x1(modp)

将2式代入

x2+2x1=（3x1\^2+a)\^2/(x\^3+ax+b)^2(modp)

然后只要解方程就可以了

```python
from Crypto.Util.number import *
from gmpy2 import *
p = 2978504498661002629091299071582436290465904673149953768927904567383228838983804727503168770704927560352042485566736762649409218645007506958368851729754839447148084715613471942096737
b = 203155971939366413053854572390533580854014345966175709774130058801484693709794880904842038444407635302410301870035839686400041986234396869946957773156780151597585571207840328547492
x1 = 2961746450301081157772024536903602376932457486781631924575753810982866784201238112170620297100938460251128698788082874030972104190128685218417680444326891343632886092532386859114448
x2 = 890136530671131957244004062733232817452520380339736536303621498985673475366221669385748542093619285319261702354866398531524362067791067563428973366865229056520602220404939306258451
k_2 = (x2 + 2 * x1)
PR.<a> = PolynomialRing(Zmod(p))
f = 4 * k_2 * (x1 ^ 3 + a * x1 + b) - (3 * x1 ^ 2 + a) ^ 2
a = f.roots()
for i in range(len(a)):
    m=a[i][0]
    flag = long_to_bytes(m)
    print(flag)
 b'flag{1s_1t_r3@lly_Easy?}'
```

### [watevrCTF 2019]ECC-RSA

```py
from fastecdsa.curve import P521 as Curve
from fastecdsa.point import Point
from Crypto.Util.number import bytes_to_long, isPrime
from os import urandom
from random import getrandbits

def gen_rsa_primes(G):
	urand = bytes_to_long(urandom(521//8))
	while True:
		s = getrandbits(521) ^ urand

		Q = s*G
		if isPrime(Q.x) and isPrime(Q.y):
			print("ECC Private key:", hex(s))
			print("RSA primes:", hex(Q.x), hex(Q.y))
			print("Modulo:", hex(Q.x * Q.y))
			return (Q.x, Q.y)


flag = int.from_bytes(input(), byteorder="big")

ecc_p = Curve.p
a = Curve.a
b = Curve.b

Gx = Curve.gx
Gy = Curve.gy
G = Point(Gx, Gy, curve=Curve)


e = 0x10001
p, q = gen_rsa_primes(G)
n = p*q


file_out = open("downloads/ecc-rsa.txt", "w")

file_out.write("ECC Curve Prime: " + hex(ecc_p) + "\n")
file_out.write("Curve a: " + hex(a) + "\n")
file_out.write("Curve b: " + hex(b) + "\n")
file_out.write("Gx: " + hex(Gx) + "\n")
file_out.write("Gy: " + hex(Gy) + "\n")

file_out.write("e: " + hex(e) + "\n")
file_out.write("p * q: " + hex(n) + "\n")

c = pow(flag, e, n)
file_out.write("ciphertext: " + hex(c) + "\n")

'''
ECC Curve Prime: 0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
Curve a: -0x3
Curve b: 0x51953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00
Gx: 0xc6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66
Gy: 0x11839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650
e: 0x10001
p * q: 0x118aaa1add80bdd0a1788b375e6b04426c50bb3f9cae0b173b382e3723fc858ce7932fb499cd92f5f675d4a2b05d2c575fc685f6cf08a490d6c6a8a6741e8be4572adfcba233da791ccc0aee033677b72788d57004a776909f6d699a0164af514728431b5aed704b289719f09d591f5c1f9d2ed36a58448a9d57567bd232702e9b28f
ciphertext: 0x3862c872480bdd067c0c68cfee4527a063166620c97cca4c99baff6eb0cf5d42421b8f8d8300df5f8c7663adb5d21b47c8cb4ca5aab892006d7d44a1c5b5f5242d88c6e325064adf9b969c7dfc52a034495fe67b5424e1678ca4332d59225855b7a9cb42db2b1db95a90ab6834395397e305078c5baff78c4b7252d7966365afed9e
'''
```

我们先分析下面这个函数

```
def gen_rsa_primes(G):
	urand = bytes_to_long(urandom(521//8))
	while True:
		s = getrandbits(521) ^ urand

		Q = s*G
		if isPrime(Q.x) and isPrime(Q.y):
			print("ECC Private key:", hex(s))
			print("RSA primes:", hex(Q.x), hex(Q.y))
			print("Modulo:", hex(Q.x * Q.y))
			return (Q.x, Q.y)
```

利用随机出来的私钥s生成一个点Q,并使该点的x和y都是素数，且满足y^2^=x^3^+a*x+b

```python
flag = int.from_bytes(input(), byteorder="big")
 
ecc_p = Curve.p
a = Curve.a
b = Curve.b
 
Gx = Curve.gx
Gy = Curve.gy
G = Point(Gx, Gy, curve=Curve)
//初始化 ECC 曲线
 
e = 0x10001
p, q = gen_rsa_primes(G)
n = p*q

```

我们发现p和q的产生源于返回的Q.x和Q.y

由此我们得到q^2^=p^3^+a*p+b

如果我们两边同时乘以p^2^，那么我们就能把q消掉，再解方程得到p

我们用sagemath求解

```
n=0x118aaa1add80bdd0a1788b375e6b04426c50bb3f9cae0b173b382e3723fc858ce7932fb499cd92f5f675d4a2b05d2c575fc685f6cf08a490d6c6a8a6741e8be4572adfcba233da791ccc0aee033677b72788d57004a776909f6d699a0164af514728431b5aed704b289719f09d591f5c1f9d2ed36a58448a9d57567bd232702e9b28f
a=-0x3
b=0x51953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00
pr=0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
PR.<x>=PolynomialRing(Zmod(pr))
f=n**2-x**5-a*x**3-b*x**2
f.roots()
```

![image-20250209202451210](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502092024264.png)

结果有三个，但其中有两个不是素数，由此我们得到

```
p=4573744216059593260686660411936793507327994800883645562370166075007970317346237399760397301505506131100113886281839847419425482918932436139080837246914736557
```

既然我们得到了p，那通过简单的rsa求解就能得到flag了

```
from Crypto.Util.number import long_to_bytes
from gmpy2 import invert
c=0x3862c872480bdd067c0c68cfee4527a063166620c97cca4c99baff6eb0cf5d42421b8f8d8300df5f8c7663adb5d21b47c8cb4ca5aab892006d7d44a1c5b5f5242d88c6e325064adf9b969c7dfc52a034495fe67b5424e1678ca4332d59225855b7a9cb42db2b1db95a90ab6834395397e305078c5baff78c4b7252d7966365afed9e
n=0x118aaa1add80bdd0a1788b375e6b04426c50bb3f9cae0b173b382e3723fc858ce7932fb499cd92f5f675d4a2b05d2c575fc685f6cf08a490d6c6a8a6741e8be4572adfcba233da791ccc0aee033677b72788d57004a776909f6d699a0164af514728431b5aed704b289719f09d591f5c1f9d2ed36a58448a9d57567bd232702e9b28f
p=4573744216059593260686660411936793507327994800883645562370166075007970317346237399760397301505506131100113886281839847419425482918932436139080837246914736557
q=n//p
phi=(p-1)*(q-1)
e=0x10001
d=invert(e,phi)
m=pow(c,d,n)
print(long_to_bytes(m))
```

