---
title: crypto AES&DES
date: 2024-11-27 19:10:36
tags: 
     - crypto
     - AES
     - DES
categories: 密码笔记
sticky: 100
---

### DES

属于对称密码算法中的分组加密算法

**密钥**：**8个字节共64位的工作密钥，但只有56位参与运算，其余8位为校验位(8,16,24,32,40,48,56,64)不参与运算，且最后生成的密钥为48位

**明文：**8个字节共64位的需要被加密的数据。

**密文：**8个字节共64位的需要被解密的数据。

明文加密过程：

![image-20250108171109760](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081711864.png)



**IP置换**:按照一定的规律，将原来的64位2进制位重新排序

![image-20250108171621496](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081716550.png)

**E盒扩展**:将32位输入扩展为48位输出(左右两边各扩一列，左边列数等于第一列减一，右边列数等于第四列j加一，注意:第一个数和最后一个数扩出来的有点变化)

![image-20250108171743521](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081717549.png)

**异或**:将E盒扩展的数与当前轮数的密钥进行异或

**S盒压缩**:将异或后的48位分成8行*6列，把每一行取出来，将一行的第一个数和最后一个数组成一个二进制，化成10进制后就是得到的行数，中间的四个数组成一个二进制，化成10进制后就是得到的列数

共8个表，哪一行化出来的行数和列数就在哪张表查，将最终得到的10进制化作二进制就是压缩后的结果

例如:第一行的111111，在第一张表的第3行第15列，为13，二进制为1103

![image-20250108173302829](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081733866.png)

![image-20250108172250470](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081722543.png)

**P置换**:跟P置换差不多

**密钥k~i~生成过程**:

![image-20250108173350128](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081733204.png)

先将64位密钥除去8位校验位后进行pc-1置换，得到56位密钥，将56位密钥排成8*7的表，取出前四行为C，后四行为D，将每四行按顺序排成一行进行循环左移，每一轮完成后再重新排成8\*7的表，经过以下的pc-2盒的置换得到每一轮的密钥

![img](https://pica.zhimg.com/v2-ed6bd32060692261db8e774cbca22d2c_1440w.jpg)

![image-20250108173736617](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202501081737685.png)

#### [ACTF新生赛2020]crypto-des

encryptedkey.txt

```python
72143238992041641000000.000000,
77135357178006504000000000000000.000000,
1125868345616435400000000.000000,
67378029765916820000000.000000,
75553486092184703000000000000.000000,
4397611913739958700000.000000,
76209378028621039000000000000000.000000
```

hint.txt

```python
To solve the key, Maybe you know some interesting data format about C language?
```

附件1考的是数据在内存中的存储，我们用struct库中的pack函数打包数据

```python
from libnum import*
import struct
import binascii

s = [72143238992041641000000.000000,77135357178006504000000000000000.000000,1125868345616435400000000.000000,67378029765916820000000.000000,75553486092184703000000000000.000000,4397611913739958700000.000000,76209378028621039000000000000000.000000]
a = ''
b = ''
for i in s:
    i = float(i)
    a += struct.pack('<f',i).hex()        #小端
print(a)

for j in s:
    i = float(i)
    b += struct.pack('>f',i).hex()        #小端
print(b)

a = 0x496e74657265737472696e67204964656120746f20656e6372797074
b = 0x74707972747079727470797274707972747079727470797274707972
print(n2s(a))
print(n2s(b))

```

我们得到压缩包密码为

```
Interestring Idea to encrypt
```

得到一个加密文件，密钥都给出来了，直接base64解码后，decrypt()解密就行了。

```python
import pyDes
import base64
from Crypto.Util.number  import*
deskey  = "********"
DES = pyDes.des(deskey)
DES.setMode('ECB')
DES.Kn = [
			[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
			[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0], 
			[0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
			[1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1], 
			[0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
			[0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
			[0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0],
			[1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
			[0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
			[0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
			[0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
			[1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0],
			[1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1]
		]
# cipher_list = base64.b64encode(DES.encrypt(flag))

k = b'vrkgBqeK7+h7mPyWujP8r5FqH5yyVlqv0CXudqoNHVAVdNO8ML4lM4zgez7weQXo'
data = base64.b64decode(k)
# print(data)
flag = DES.decrypt(data)
print(flag)

```



### AES

#### 加密模式

```python
ECB模式（电子密码本模式：Electronic codebook）
　　ECB是最简单的块密码加密模式，加密前根据加密块大小（如AES为128位）分成若干块，之后将每块使用相同的密钥单独加密，解密同理。

CBC模式（密码分组链接：Cipher-block chaining）
　　CBC模式对于每个待加密的密码块在加密前会先与前一个密码块的密文异或然后再用加密器加密。第一个明文块与一个叫初始化向量的数据块异或
　　CBC加密：https://www.cnblogs.com/phoenixy/p/15793339.html

CTR模式（计数器模式）
　　CTR模式是一种通过将逐次累加的计数器进行加密来生成密钥流的流密码。自增的算子用密钥加密之后的输出和明文异或的结果得到密文，相当于一次一密。
　　这种加密方式简单快速，安全可靠，而且可以并行加密，但是在计算器不能维持很长的情况下，密钥只能使用一次。 

CFB模式(密文反馈:Cipher feedback)
 　　与ECB和CBC模式只能够加密块数据不同，CFB能够将块密文（Block Cipher）转换为流密文（Stream Cipher）

OFB模式（输出反馈：Output feedback）
 　　OFB是先用块加密器生成密钥流（Keystream），然后再将密钥流与明文流异或得到密文流，解密是先用块加密器生成密钥流，再将密钥流与密文流异或得到明文，由于异或操作的对称性所以加密和解密的流程是完全一样的。
```

ECB模式

![image-20250225210125048](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502252101176.png)

CBC模式

![image-20250225210138483](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502252101516.png)

AES在python中的加密限制：

1.在python中进行AES加密解密时，所传入的密文，明文，密钥，iv偏移量，都是需要bytes类型的数据。python在构建aes对象时也只能接受bytes类型数据

2.当密钥，iv偏移量，待解密的明文，字节长度不够16字节或者16字节的背书时需要进行补全

3.CBC模式需要重新生成AES对象，为了防止这类错误，我们写代码无论什么模式都要重新生成AES对象

- python中bytes类型数据与中文的转换。Tips:utf8一个中文三个字节，gbk一个中文两个字节。

- ```
  key = "中文数据"   #中文数据
  key_b = key.encode()  #转换成字节型数据
  print(key_b)
  print(key_b.decode()) #字节型数据转换成中文数据
  
  ```

  

#### [ACTF新生赛2020]crypto-aes

我们来看题目

```
from Cryptodome.Cipher import AES
import os
import gmpy2
from flag import FLAG
from Cryptodome.Util.number import *

def main():
    key = os.urandom(2) * 16  # 生成一个随机的密钥，长度为32字节（256位） 前16位和后16位相同
    iv = os.urandom(16)  # 生成一个随机的初始化向量，长度为16字节（128位）
    print(bytes_to_long(key) ^ bytes_to_long(iv))  # 将密钥和初始化向量转换为长整数，并执行异或操作，然后打印结果
    aes = AES.new(key, AES.MODE_CBC, iv)  # 使用密钥、模式（CBC）和初始化向量创建一个新的AES加密对象
    enc_flag = aes.encrypt(FLAG)  # 使用AES加密对象对FLAG进行加密，并将加密后的结果存储在enc_flag变量中
    print(enc_flag)  # 打印加密后的FLAG

if __name__ == "__main__":
    main()  # 如果当前模块是主模块，则调用main函数

```

代码最后输出了两个值，应该key和iv(偏移量)xor的结果，应该enc_flag也就是key和iv利用aes的CBC模式加密后的结果

这边可以观察到，它的key是随机生成了16字节的值，然后*2变成32字节的。其实也就是说key的高位128位和低位128位是相同的

iv是16字节的，也就是128位，那么去计算key和iv的异或时，其实key仅有低位参与了异或运算，高位相当于没变。这里也就有了解题思路，

在原题的加密文件aes.py中key和iv仅异或了低16字节，key的高16字节是不变的，所有由aes.py中key是生成来看解题思路，获取了key的高16字节，便获取了key的256位。（因为aes.py中是*2）

通过key的低位与xor的低位进行异或得到的结果就是aes.py中的iv

```
from Cryptodome.Cipher import AES
import os
from gmpy2 import*
from Cryptodome.Util.number import*

xor = 91144196586662942563895769614300232343026691029427747065707381728622849079757
enc_flag = b'\x8c-\xcd\xde\xa7\xe9\x7f.b\x8aKs\xf1\xba\xc75\xc4d\x13\x07\xac\xa4&\xd6\x91\xfe\xf3\x14\x10|\xf8p'
out = long_to_bytes(xor)      #将异或的数值转换为字节型数据
key = out[:16]*2              #取了之前加密key和iv的异或的前16字节，相当于取了高位的128位。

iv = bytes_to_long(key[16:])^bytes_to_long(out[16:])    #此时取了key的后16位与xor的后16位进行xor来还原iv
iv = long_to_bytes(iv)
aes = AES.new(key,AES.MODE_CBC,iv)
flag = aes.decrypt(enc_flag)
print(flag)

```

```
//验证 key = out[:16]*2 
from Cryptodome.Cipher import AES
import os
from gmpy2 import *
from Cryptodome.Util.number import *

xor = 91144196586662942563895769614300232343026691029427747065707381728622849079757
out = long_to_bytes(xor)  # 将异或的数值转换为字节型数据
key = out[:16] * 2
print(bin(bytes_to_long(key)))
print((bin(bytes_to_long(out[:16]))))
print("0b11001001100000011100100110000001110010011000000111001001100000011100100110000001110010011000000111001001100000011100100110000001")
```

#### [AFCTF2018]MyOwnCBC

题目给出了三个文件，flag_cipher是二进制文件，不能直接打开，我们用open的IO操作来读取

```py
#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
 
from Crypto.Cipher import AES
from Crypto.Random import random
from Crypto.Util.number import long_to_bytes
 
def MyOwnCBC(key, plain):
	if len(key)!=32:
		return "error!"
	cipher_txt = b""
	cipher_arr = []
	cipher = AES.new(key, AES.MODE_ECB, "")
	plain = [plain[i:i+32] for i in range(0, len(plain), 32)]
	print plain
	cipher_arr.append(cipher.encrypt(plain[0]))
	cipher_txt += cipher_arr[0]
	for i in range(1, len(plain)):
		cipher = AES.new(cipher_arr[i-1], AES.MODE_ECB, "")
		cipher_arr.append(cipher.encrypt(plain[i]))
		cipher_txt += cipher_arr[i]
	return cipher_txt
	
key = random.getrandbits(256)
key = long_to_bytes(key)
 
s = ""
with open("flag.txt","r") as f:
	s = f.read()
	f.close()
 
with open("flag_cipher","wb") as f:
	f.write(MyOwnCBC(key, s))
	f.close()
```

通过代码，我们可以发现，源码是用AES的ECB加密来模拟CBC加密

可以看出是通过将ecb模式下的加密进行改写得到不那么正宗的cbc加密模式
为什么说不那么正宗呢，嗯，缺少了异或操作

加密过程：

先取32字节的初始密钥，再将明文按32字节进行分组

用初始密钥对第一组明文进行ecb模式下的加密，得到第一组密文

然后用第一组密文作为密钥，对第二组明文进行ecb模式下的加密

依次进行（即用上一组密文做这一组的密钥对这一组明文进行加密，得到这一组的密文）

将各组密文拼接起来得到最终完整密文

解密过程即为加密的逆过程，直接看代码理解吧（加密代码都能理解，解密代码就更不在话下了）

```py
import os,sys
os.chdir(sys.path[0])
from Crypto.Cipher import AES
cipher = open('flag_cipher','rb').read()
key = cipher[0:32]
# print(key)
def MyOwnCBC(key,cipher):
    m_txt = b''
    c = [cipher[i:i+32] for i in range(0,len(cipher),32)]
    tempkey = key
    for i in range(1,len(c)):
        dic_cipher = AES.new(tempkey,AES.MODE_ECB)
        m_txt += dic_cipher.decrypt(c[i])
        tempkey = c[i]
    return m_txt

print(MyOwnCBC(key,cipher))
# afctf{Don't_be_fooled_by_yourself}

```

