---
title: Java
date: 2024-11-12 18:49:38
tags: java
categories: 学习笔记
---

### Java

------

### 注释

#### 単行注释  

格式    //注释信息

#### 多行注释

格式    /*注释信息\*/

#### 文档注释

格式    /\*\*注释信息*/

### 关键字

![image-20241014203025134](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142030404.png)

#### class关键字

用于（创建/定义）应该类，类是Java最基本的组成单元

### 字面量

![image-20241014203057613](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142030688.png)

#### 制表符

\t 在打印时，把前面字符串长度补齐到8或者8的整数倍，最少一个空格，最多8个空格

![image-20241014203401136](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142034225.png)

### 变量名

**int**  整数类型

 **byte **

**short**

**long**   定义时，数据值要加一个L作为后缀.可以大写也可以小写



**double**  小数类型

**float**   定义时，数据值要加一个F作为后缀



**char** 字符类型

**String**  字符串类型 注：S**要大写**

**boolean** 布尔类型

![image-20241014204822919](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142048988.png)

#### 使用方法

![image-20241014203700067](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142037126.png)

#### 注意事项

1.只能存一个值

2.变量名不允许重复定义

3.一条语句可以定义多个变量

int a=1,b=2,c=3;

4.变量在使用之前要进行赋值

5.变量要注意作用域范围



### 类型

分为基本类型和引用类型

#### 基本类型

基本类型是 Java 中最简单、最基本的数据类型，用于存储原始的数据值。它们直接存储数据，大小固定，并且没有附带任何方法或功能。

Java 有 8 种基本数据类型：

| 数据类型  | 大小   | 默认值   | 示例                   |
| --------- | ------ | -------- | ---------------------- |
| `byte`    | 1 字节 | 0        | `byte b = 10;`         |
| `short`   | 2 字节 | 0        | `short s = 100;`       |
| `int`     | 4 字节 | 0        | `int i = 1000;`        |
| `long`    | 8 字节 | 0L       | `long l = 100000000L;` |
| `float`   | 4 字节 | 0.0f     | `float f = 3.14f;`     |
| `double`  | 8 字节 | 0.0      | `double d = 3.14159;`  |
| `char`    | 2 字节 | '\u0000' | `char c = 'A';`        |
| `boolean` | 1 字节 | `false`  | `boolean flag = true;` |

- **数值类型**：`byte`、`short`、`int`、`long`、`float`、`double`。
- **字符类型**：`char`。
- **布尔类型**：`boolean`。

#### 引用类型

引用类型的变量保存了对实际对象的引用（内存地址）。常见的引用类型包括类、数组和接口。

引用类型的例子：

- **类**：如 `String`、`ArrayList`、`Person` 等
- **数组**：如 `int[]`、`String[]` 等
- **接口**：如 `List`、`Runnable` 等

### 标识符

![image-20241014215821487](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142158637.png)

### 输入

Scanner,这个类可以接受键盘输入的数字

导包，要写在类定义的上面

![image-20241014220038909](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142200057.png)

```
//1
import java.util.Scanner;

public class hellow1 {
    public static void main(String[] args) {
    //2
       Scanner sc = new Scanner(System.in);
       //3
       int i=sc.nextInt();
        System.out.println(i);
    }
}
```

### 运算符

#### 数值相加

![image-20241014221741757](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142217870.png)

如果在计算时有小数参与，结果可能会不准确

算数语法跟c语言一样

数字进行运算时，数据类型不一样不能运算，需要转成一样的，才能运算

**隐式转换：**取值范围小的数值-->取值范围大的数值

**强制转换：**取值范围大的数值-->取值范围小的数值 

![image-20241014222431627](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142224812.png)

![image-20241014222543564](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142225733.png)

#### 字符串相加

字符串的“+”操作，跟python差不多

![image-20241014222811242](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142228327.png)

#### 字符相加

![image-20241014223003209](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142230328.png)

#### 自增、自减

跟c差不多

![image-20241014223228739](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410142232844.png)

#### 赋值运算符

+=、-=、/==等等 ，跟c一样

#### 逻辑运算符

&、 |、 ^ 、!

&&、||  当左边的表达式能确定最终的结果时，右边就不会参与运行了

#### 三元运算符

a?b:c 、; 跟c差不多

#### 优先级

![image-20241015142719609](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151427720.png)

### 判断语句

#### if语句

跟c一样

#### switch语句

![image-20241015143106616](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410151431700.png)



在jdk12时，可以使用 

```
switch(a)
case 值1-> {

}
```

循环语句

跟c一样有for，while，do...while



### 数组

#### 定义方式

```
格式一
数据类型 [] 数组名;
//例如
int [] array;

格式二
数据类型  数组名 [];
//例如
int array [];

```

**注意：**不同的数据类型对应不同的默认值

- 整数类型：0
- 小数类型：0.0
- 布尔类型：false
- 字符类型：‘\u0000’
- 引用类型：null

![image-20241124205246536](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411242052644.png)

#### 数组的初始化

```
格式一
数据类型[] 数组名 = new 数据类型[]{元素1，元素2，元素3，元素4...};
//例如
double[] arr = new double[]{1.1,1.2,1.3};

格式二
数据类型[] 数组名 = {元素1，元素2，元素3，元素4...};
//例如
int[] array = {1,2,3,4,5};
 
```



#### 数组的地址值

```
int arr[]={1,2,3,4,5,6,7,8,9,10};
System.out.println(arr);


//打印的是第一个元素的地址值 [I@14ae5a5
```

[I@14ae5a5

解读：

[   表示是数组.

i   表示是int类型

@ 表示一个间隔符号（固定格式）

14ae5a5 数组真正的地址值（十六进制）

通常把这个整体统称为地址



#### 数组的遍历

```java
第一种 fro循环遍历
int arr[]={1,2,3,4,5,6,7,8,9,10};
        
        for (int i=0;i<arr.length;i++) {
            System.out.println(arr[i]);
        }
        //arr.length 获取数组长度
```

```java
第二种
arr.fori 自动生成

 arr.fori ==>  for (int i = 0; i < arr.length; i++) {
            
        }    
```

```java
第三种  foreach语句遍历

for(type element: array)
{
    System.out.println(element);
}

```



![image-20241124220458160](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411242204255.png)



#### java内存分配

栈      方法运行时使用的内存，比如main方法运行，进入方法栈中执行

堆      存储对象或者数组，new来创建的，都存储在堆内存中

方法区  	存储可以运行的class文件

本地方法栈	JVM在使用操作系统功能的时候使用，和我们开发无关

寄存器 		给cpu使用   ，和我们开发无关

### 方法

#### 方法的定义

程序中最小的执行单元



#### 方法的格式

**最简单的格式**

```
public static void 方法名(){
		方法体（就是打包起来的代码）
}

方法名();
```

**带参数的格式**

有实参和形参的区别

```
public static void 方法名(int num1, int num2){

		方法体
		System.out.println(num1+num2);
		
}
```

**带返回值的格式**

```
public static 返回值类型 方法名(参数){
		方法体
		return 返回值;
}
```



#### 方法的重载

在同一个类中，定义了多个同名的方法，这些同名的方法具有同种的功能。

每个方法具有不同的参数类型或参数个数，这些同名的方法，就构成了重载关系

![image-20241124223719405](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411242237542.png)

注意，一个变量不构成重载关系



#### 方法的基本数据型和引用数据类型

![image-20241125191132351](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411251911421.png)

### 修饰符

在 Java 中，**修饰符**（Modifiers）用于控制类、方法、变量的访问权限、行为以及其他特性。修饰符分为两大类：**访问修饰符** 和 **非访问修饰符**。修饰符提供了对类、方法、属性等的访问控制、功能增强以及其他特性管理。

**访问修饰符**

访问修饰符用于定义类、方法、变量的访问范围，即控制哪些类、方法、变量可以被访问。Java 提供了四种访问修饰符：

**`public`**

- **含义**：表示该成员可以被任何其他类访问。
- **适用范围**：类、方法、变量。

```
public class MyClass {
    public int number;
}
```

**`private`**

- **含义**：表示该成员只能在定义它的类内部访问，不能在类外部访问。
- **适用范围**：方法、变量。

```
class MyClass {
    private int number;
    
    private void display() {
        System.out.println(number);
    }
}
```

**`protected`**

- **含义**：表示该成员可以在同一包中的其他类访问，也可以在不同包中通过继承访问。
- **适用范围**：方法、变量。

```
class MyClass {
    protected int number;
    
    protected void display() {
        System.out.println(number);
    }
}
```

**默认**

- **含义**：如果没有指定访问修饰符，默认是包私有，表示该成员仅能在同一包内的类中访问，包外不可访问。
- **适用范围**：方法、变量。

```
class MyClass {
    int number;  // 默认访问修饰符（包私有）
    
    void display() {
        System.out.println(number);
    }
}
```



### 面向对象

#### 类和对象

**类**是一个模板或蓝图，用于创建对象。类定义了对象的**属性**（成员变量）和**行为**（方法）。它是对现实世界中的一类事物的抽象描述。

类的构成：

- **成员变量（属性）**：表示对象的状态或特征。
- **方法（行为）**：表示对象可以执行的操作。

**对象**是类的一个实例。通过类定义的蓝图，我们可以创建多个对象，每个对象都有自己的属性值（状态）和可以执行的方法（行为）。对象在内存中有实际的存储空间，每个对象的属性是独立的。

创建对象：

创建对象的语法是使用 `new` 关键字，并调用类的构造方法（如果有定义）。

**在JAVA中必须先设计类，才能获得对象**

```
public class 类名{    
    1.成员变量
    2.成员方法
    3.构造器
    4.代码块
    5.内部类
}

public class Phone{
   //属性（成员变量）
   String brand;
   
   //方法
   public void call(){
   
   }
}
```

#### 测试类、javaBean类和工具类

1. 测试类（Test Class）

测试类通常用于单元测试（Unit Testing）。它的目的是验证你的代码是否按预期工作。Java 中有一些常用的测试框架，如 JUnit、TestNG 等，它们帮助你创建和运行测试。

**特点：**

- 包含测试方法，通常以 `@Test` 注解标注。
- 每个测试方法通常是独立的，验证特定功能或方法。
- 测试类不用于业务逻辑实现，而是用于验证程序的正确性。

**例子：**

```
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculatorTest {

    @Test
    public void testAdd() {
        Calculator calculator = new Calculator();
        int result = calculator.add(1, 2);
        assertEquals(3, result);
    }
}
```

在上面的代码中，`CalculatorTest` 类是一个测试类，`testAdd()` 是一个测试方法，它验证 `Calculator` 类中的 `add()` 方法是否正确。

2. ###### JavaBean 类

JavaBean 是一种符合特定规范的 Java 类，它通常用于数据封装。JavaBean 类的主要目的是通过提供一组 getter 和 setter 方法，使得它可以作为一个数据传输对象（DTO）在应用程序中传递数据。

**特点：**

- JavaBean 必须有一个无参构造函数。
- 类中的成员变量通常是私有的（`private`），通过公共的 getter 和 setter 方法访问。
- 它应该实现 `Serializable` 接口，以便可以进行序列化。
- 常用于数据库的实体映射或网络传输。

**例子：**

```
public class User implements java.io.Serializable {
    private String name;
    private int age;

    // 无参构造函数
    public User() {}

    // getter 和 setter 方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

在这个例子中，`User` 类是一个 JavaBean 类，包含了私有成员变量 `name` 和 `age`，以及它们的 getter 和 setter 方法。这个类符合 JavaBean 的规范，通常用于传递用户信息。

3. ###### 工具类（Utility Class）

工具类是一个包含一组静态方法的类，这些方法提供常用的功能，通常与某些操作或计算相关。工具类中的方法通常是通用的，因此可以在应用程序的不同部分重复使用。工具类通常只包含静态方法，并且不需要实例化。

**特点：**

- 工具类通常只包含静态方法，方便调用。
- 通常不需要实例化对象。
- 可以包含各种实用功能，如字符串处理、日期处理、数学计算等。

**例子：**

```
public class StringUtils {

    // 判断字符串是否为空
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    // 字符串反转
    public static String reverse(String str) {
        if (str == null) {
            return null;
        }
        return new StringBuilder(str).reverse().toString();
    }
}
```

在上面的 `StringUtils` 类中，`isEmpty()` 和 `reverse()` 方法是工具方法。你可以直接调用这些静态方法而不需要创建 `StringUtils` 的实例。

主要区别总结：

- **测试类**：用于测试应用程序的代码是否按预期工作，通常包含测试框架（如 JUnit）的测试方法。
- **JavaBean 类**：用于封装数据，通常包含私有字段和公共的 getter/setter 方法，符合 JavaBean 的规范。
- **工具类**：包含常用的静态方法，用于实现通用功能（如字符串处理、文件操作等），通常不需要实例化。



#### 如何得到类的对象

```
类名 对象名=new 类名();

Phone p =new Phone();
```



#### 类的封装

对象代表什么，就得封装对应的数据，并提供数据对应的行为

封装通常通过设置**私有属性**和**公共方法**来实现

```java
public class Person {
    // 私有属性，外部无法直接访问
    private String name;
    private int age;

    // 公共的 getter 和 setter 方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        // 在 setter 方法中可以加入一些控制逻辑，确保数据合法
        if (age > 0) {
            this.age = age;
        } else {
            System.out.println("Age must be positive.");
        }
    }

    // 公共方法，类的行为
    public void introduce() {
        System.out.println("Hi, my name is " + name + " and I am " + age + " years old.");
    }
}

public class Test {
    public static void main(String[] args) {
        Person person = new Person();
        
        // 使用 setter 方法设置属性
        person.setName("Alice");
        person.setAge(25);
        
        // 使用 getter 方法获取属性值
        System.out.println(person.getName()); // 输出：Alice
        System.out.println(person.getAge());  // 输出：25

        // 调用公共方法
        person.introduce(); // 输出：Hi, my name is Alice and I am 25 years old.
    }
}

```



#### this关键字

  this用来调用成员变量，区分成员变量和局部变量

```

public class Phone{
   //属性（成员变量）
   int age=20;
   
   //方法
   public void call(){
   
   int age=10;
    System.out.println(brand); //输出10
   System.out.println(this.brand); //输出20
   
   }
}
```



#### 构造方法

作用：在创建对象的时候给成员变量进行赋值

**无参**数构造方法：	初始化的对象时，成员变量的数据均采用默认值，

**有参**数构造方法:		在初始化对象的时候，同时可以为对象进行赋值。

**形式**

```
public class Student{
	
	修饰符 类名(参数){
	方法体
	
	}

}
```

**特点：**

1.方法名与类名相同，大小写也要一致

2.没有返回类型，连void也没有

3.没有具体的返回值(不能由retrun带回结果数据)

**执行时机:**

1.创建对象的时候由虚拟机调用，不能手动调用构造方法

2.每创建一次对象，就会调用一次构造方法

**注意事项**

① 构造方法的定义

如果没有定义构造方法，系统将给出一个默认的无参数构造方法

如果定义了构造方法，系统将不再提供默认的构造方法

② 构造方法的重载

带参构造方法，和无参数构造方法，两者方法名相同，但是参数不同，这叫做构造方法的重载

③ 推荐的使用方式

无论是否使用，都手动书写无参数构造方法，和带全部参数的构造方法



#### 标准JavaBean

1. 类名需要见名知意
2. 成员变量使用private修饰
3. 提供至少两个构造方法
   1. 无参构造方法
   2. 带全部参数的构造方法
4. 成员方法
   提供每一个成员变量对应的setXxx()/getXxx()
   如果还有其他行为，也需要写上

![image-20241125221012155](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411252210243.png)

#### static

static表示静态，是Java中的一个修饰符，可以修饰成员方法和成员变量

被static修饰的成员变量叫做**静态变量**(类变量)

![image-20241125223150756](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411252231802.png)



被static修饰的成员方法，叫做**静态方法**

![image-20241126144657919](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261447025.png)

###### 注意事项

![image-20241126150304641](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261503699.png)

#### 类的继承

Java中提供一个关键字extends，用这个关键字，我们可以让一个类和你应该类建立起继承关系

```
public class Student extends Person {}
```

student成为子类(派生类)，Person成为父类(基类或超类)

```
// 父类
class Animal {
    void speak() {
        System.out.println("Animal speaks");
    }
}

// 子类
class Dog extends Animal {
    // 子类重写父类方法
    @Override
    void speak() {
        System.out.println("Dog barks");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.speak();  // 输出：Dog barks
        
        Animal animal = new Animal();
        animal.speak();  // 输出：Animal speaks
    }
}

```

**使用继承的好处**

可以把多个子类中重复的代码抽取到父类中了，提高代码的复用性

子类可以在父类的基础上，增加其他的功能，使子类更强大，



**使用条件**

当类与类之间，存在相同(共性)的内容，并满足子类是父类的一种，就可以考虑使用继承，来优化代码

##### 继承的特点

 Java只支持但继承，不支持多继承，但支持多层继承

多层继承：子类A可以继承父类B，父类B可以继承父类C  

每一个类都直接或者间接的继承于Object



##### 子类能继承父类的内容

![image-20241126155824043](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261558114.png)



##### 成员变量和成员方法访问特点

 遵循就近原则：谁离我近，我就用谁

```
class Parent {
    int x = 10;  // 父类成员变量
}

class Child extends Parent {
    int x = 20;  // 子类成员变量
    void printX() {
        System.out.println(x);  // 访问子类的x
    }
}

public class Main {
    public static void main(String[] args) {
        Child child = new Child();
        child.printX();  // 输出：20
    }
}

```

如果出现了重名变量

```
class Parent {
    int x = 10;  // 父类的变量
}

class Child extends Parent {
    int x = 20;  // 子类的变量，遮蔽父类的同名变量

    void printX() {
        System.out.println(x);  // 从局部变量找
        System.out.println(this.x); //从子类找
        System.out.println(super.x);  // 访问的是父类的x
    }
}

public class Main {
    public static void main(String[] args) {
        Child child = new Child();
        child.printX();  // 输出：20 20  10 
    }
}

```



方法重写注意事项和要求

![image-20241126162508846](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261625965.png)

注意：子类中重写的方法上面要加上@override

##### 构造方法的访问特点

**继承中：构造方法的访问特点**

父类中的构造方法不会被子类继承。

子类中所有的构造方法默认先访问父类中的无参构造，再执行自己

**为什么?**

子类在初始化的时候，有可能会使用到父类中的数据，如果父类没有完成初始化，子类将无法使用父类的数据

子类初始化之前，一定要调用父类构造方法先完成父类数据空间的初始化。



使用this()访问本类的构造方法

使用super访问父类的构造方法



#### this、super总结

this  ： 理解为一个变量，表示当前方法调用者的地址值

super: 代表父类存储空间

![image-20241126164556106](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261645171.png)



#### 类的多态

对象代表什么，就得封装对应的数据，并提供数据对应的行为

**定义**

同类型的对象，表现出不同形态



**多态表现形式**

父类类型 对象名称 = 子类对象



**多态的前提**

1. 有继承关系
2. 有父引用指向子类对象
3. 有方法重写



##### 多态调用成员特点

变量调用：编译看左边，运行也看左边

方法调用：编译看左边，运行看右边



##### 变量调用

**编译看左边**:javac编译代码的时候，会看左边的父类中有没有这个变量，如果有，编译成功，如果没有编译失败。

在Java中，**编译时**的行为是由引用变量的类型（也就是“左边”）决定的。Java编译器在编译代码时，确定方法调用或成员访问是根据引用类型来进行检查的。因此，编译时检查的是引用变量所声明的类型，而不是它实际指向的对象类型。

```
class Parent {
    int x = 10;
}

class Child extends Parent {
    int x = 20;
}

public class Main {
    public static void main(String[] args) {
        Parent obj = new Child();
        System.out.println(obj.x); // 编译错误 实际上会访问 Parent的x的值
    }
}
```

**编译时**：在上面的代码中，`obj`是`Parent`类型的引用，而不是`Child`类型。因此，编译器会检查`Parent`类中是否有名为`x`的变量，虽然`obj`在运行时指向`Child`对象，但编译器只会检查`Parent`类中的`x`，因此无法找到`x`变量，编译器会报错。如果我们使用`obj.x`，编译器就无法知道它是否在`Child`类中有`x`字段，它只会根据`Parent`类的声明进行检查。



**运行也看左边**:java运行代码的时候，实际获取的就是左边父类中成员变量的值

在**运行时**，Java会根据实际对象的类型来决定使用哪个成员变量或方法。这是Java中**动态绑定**的特性（尤其是方法的动态绑定）。对于成员变量（尤其是实例变量），它会选择实际对象中的值，即使引用类型是父类类型，也会访问实际对象中（子类）的成员变量。

```
class Parent {
    int x = 10;
}

class Child extends Parent {
    int x = 20;
}

public class Main {
    public static void main(String[] args) {
        Parent obj = new Child();  // 父类引用指向子类对象
        System.out.println(obj.x);  // 输出：10
    }
}
```

**运行时**：虽然`obj`是`Parent`类型的引用，但它指向的是`Child`类型的对象。`obj.x`访问的是`Parent`类中的`x`变量，因为编译器在编译时是根据`obj`的声明类型`Parent`来查找成员变量的，而不是`Child`类的成员变量。



##### 方法调用

```
class Animal {
    void sound() {
        System.out.println("Animal makes a sound");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Dog barks");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal obj = new Dog();  // 父类引用指向子类对象
        obj.sound();  // 运行时调用Dog类的sound()方法
    }
}
```

1. **编译时看左边：**

- 在编译时，`obj`的引用类型是`Animal`，所以编译器会检查`Animal`类中是否有`sound()`方法。
- 编译器会发现`Animal`类有`sound()`方法，因此不会报编译错误。

2. **运行时看右边：**

- 运行时，`obj`指向的是`Dog`类的对象。因此，Java会根据实际对象的类型（`Dog`）来调用重写后的`Dog`类中的`sound()`方法。
- 尽管引用类型是`Animal`，运行时仍然会调用子类`Dog`的`sound()`方法，输出的是`Dog barks`，而不是`Animal makes a sound`。



##### 多态的优势和弊端

![image-20241126195058762](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411261950890.png)

#### 包和final

##### 包

包就是文件夹。用来管理各种不同功能的Java类，方便后期维护

包名通常基于公司或项目的域名（反向域名命名法），以减少与其他组织或项目的包名冲突。

例如，如果你的公司网站是 `example.com`，那么包名的前缀应是 `com.example.包的作用`。

###### 使用其他类的规则

使用其他类时，需要使用全类名（com.example.包的作用.类名）

![image-20250218154739059](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181547149.png)

- 使用同一个包中的类时，不需要导包
- 使用java.lang包中的类时，不需要导包
- 其他情况都需要导包
- 如果同时使用两个包中的同名类，需要使用全类名

##### final

可以修饰方法、类、变量

final 方法：表明该方法是最终方法，不能被重写

final 类 ：表明该类是最终类，不能被继承

final 变量：叫做常量，只能被赋值一次









#### 抽象类和抽象方法

类用于描述现实生活中一类事物。类中有属性、方法等成员。

父类中的方法，被它的子类们重写，子类各自的实现都不尽相同。那么父类的方法声明和方法主体，只有声明还有 意义，而方法主体则没有存在的意义了。

某种情况下，父类只能知道子类应该具备一个怎样的方法，但是不能够明确知道如何实现该方法。只能在子类中才能确定如何去实现方法体。例如：所有几何图形都应该具备一个计算面积的方法。但是不同的几何图形计算面积的方式不同。

我们把没有方法主体的方法称为**抽象方法**。Java语法规定，包含抽象方法 的类就是**抽象类**。

##### 抽象方法

**抽象方法** ： 只有方法的声明，没有方法体，以分号 ; 结尾，使用 `abstract` 关键字修饰

定义格式：

```java
修饰符 abstract 返回值类型 方法名(参数列表);
```

代码举例：

```java
public abstract void run();
```

> 抽象方法不能用private、final、static、native修饰

##### **抽象类**

**抽象类**：包含抽象方法的类。如果一个类包含抽象方法，那么该类必须是抽象类，使用 `abstract` 关键字修饰

定义格式：

```java
public abstract class 类名 {
    //抽象类中可以包含变量、常量，抽象方法，非抽象方法
}
```

代码举例：

```java
public abstract class Person {
    public abstract void work()；
}
```

##### **抽象类的使用**

抽象类不能实例化，不能直接创建对象。抽象类是用来被继承的，继承抽象类的子类**必须重写父类所有的抽象方法**。否则，该子类也必须声明为抽象类，使用 `abstract` 关键字修饰

抽象类也是类，因此原来类中可以有的成员，抽象类都可以有，那么抽象类不能直接创建对象，为什么还有构造器呢？供子类调用，子类创建对象时，需要为从父类继承的属性初始化。

抽象类不能使用final修饰

```java
public class Teacher extends Person {
    public void work() {
      	System.out.println("讲课"); 	 
    }
}
public class Abstract ClassTest {
 	 public static void main(String[] args) {
        // 创建子类对象
        Teacher t = new Teacher(); 
       
        // 调用run方法
        t.work();
  	}
}

输出结果：
讲课

```

此时的方法重写，是对子类对父类抽象方法的完成实现，我们将这种方法重写的操作，叫做实现方法

实现：去掉abstract关键字，加上方法体{...}

**抽象类注意事项**：

1. 抽象类**不能创建对象**，如果创建，编译无法通过而报错。只能创建其非抽象子类的对象。

   > 理解：假设创建了抽象类的对象，调用抽象的方法，而抽象方法没有具体的方法体，没有意义。

2. 抽象类中，可以有构造方法，是供子类创建对象时，初始化父类成员使用的。

   > 理解：子类的构造方法中，有默认的super()，需要访问父类构造方法。

3. 抽象类中，可以有成员变量。

   > 理解：子类的共性的成员变量 , 可以定义在抽象父类中。

4. 抽象类中，不一定包含抽象方法，但是有抽象方法的类必定是抽象类。

   > 理解：未包含抽象方法的抽象类，声明为抽象类目的就是不想让使用者创建该类的对象，通常用于某些特殊的类结构设计。

5. 抽象类的子类，必须重写抽象父类中**所有的**抽象方法，否则，编译报错。除非该子类也是抽象类。

   > 理解：假设不重写所有抽象方法，则类中可能包含抽象方法。那么创建对象后，调用抽象的方法，没有意义。



#### 接口

在抽象类中，抽象方法本质上是定义接口规范：即规定高层类的接口，从而保证所有子类都有相同的接口实现，这样，多态就能发挥出威力。

如果一个抽象类没有字段，所有方法全部都是抽象方法：

```java
abstract class Person {
    public abstract void run();
    public abstract String getName();
}
```

就可以把该抽象类改写为接口：`interface`。

在Java中，使用`interface`可以声明一个接口：

```java
interface Person {
    void run();
    String getName();
}
```

所谓`interface`，就是比抽象类还要抽象的纯抽象接口，因为它连字段都不能有。因为接口定义的所有方法默认都是`public abstract`的，所以这两个修饰符不需要写出来（写不写效果都一样）。

当一个具体的`class`去实现一个`interface`时，需要使用`implements`关键字。举个例子：

```java
class Student implements Person {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        System.out.println(this.name + " run");
    }

    @Override
    public String getName() {
        return this.name;
    }
}
```

我们知道，在Java中，一个类只能继承自另一个类，不能从多个类继承。但是，一个类可以实现多个`interface`，例如：

```java
class Student implements Person, Hello { // 实现了两个interface
    ...
}
```

### 常量

常量一般作为系统的配置信息，方便维护，提高可读性

常量的命名规范：

単个单词：全部大写

多个单词：全部大写，单词之间用下划线隔开

**注意：**

final修饰的变量是基本类型：那么变量存储的数据值不能发生改变

final修饰的变量是引用类型：那么变量存储的地址值不能发生改变，对象内部可以改变

### 术语

注意区分术语：

Java的接口特指`interface`的定义，表示一个接口类型和一组方法签名，而编程接口泛指接口规范，如方法签名，数据格式，网络协议等。

抽象类和接口的对比如下：

|            | abstract class       | interface                   |
| ---------- | :------------------- | :-------------------------- |
| 继承       | 只能extends一个class | 可以implements多个interface |
| 字段       | 可以定义实例字段     | 不能定义实例字段            |
| 抽象方法   | 可以定义抽象方法     | 可以定义抽象方法            |
| 非抽象方法 | 可以定义非抽象方法   | 可以定义default方法         |

### 接口继承

一个`interface`可以继承自另一个`interface`。`interface`继承自`interface`使用`extends`，它相当于扩展了接口的方法。例如：

```java
interface Hello {
    void hello();
}

interface Person extends Hello {
    void run();
    String getName();
}
```

此时，`Person`接口继承自`Hello`接口，因此，`Person`接口现在实际上有3个抽象方法签名，其中一个来自继承的`Hello`接口。

### 继承关系

合理设计`interface`和`abstract class`的继承关系，可以充分复用代码。一般来说，公共逻辑适合放在`abstract class`中，具体逻辑放到各个子类，而接口层次代表抽象程度。可以参考Java的集合类定义的一组接口、抽象类以及具体子类的继承关系：

```
┌───────────────┐
│   Iterable    │
└───────────────┘
        ▲                ┌───────────────────┐
        │                │      Object       │
┌───────────────┐        └───────────────────┘
│  Collection   │                  ▲
└───────────────┘                  │
        ▲     ▲          ┌───────────────────┐
        │     └──────────│AbstractCollection │
┌───────────────┐        └───────────────────┘
│     List      │                  ▲
└───────────────┘                  │
              ▲          ┌───────────────────┐
              └──────────│   AbstractList    │
                         └───────────────────┘
                                ▲     ▲
                                │     │
                                │     │
                     ┌────────────┐ ┌────────────┐
                     │ ArrayList  │ │ LinkedList │
                     └────────────┘ └────────────┘
```

在使用的时候，实例化的对象永远只能是某个具体的子类，但总是通过接口去引用它，因为接口比抽象类更抽象：

```java
List list = new ArrayList(); // 用List接口引用具体子类的实例
Collection coll = list; // 向上转型为Collection接口
Iterable it = coll; // 向上转型为Iterable接口
```

### default方法

在接口中，可以定义`default`方法。例如，把`Person`接口的`run()`方法改为`default`方法：

```java
// interface
public class Main {
    public static void main(String[] args) {
        Person p = new Student("Xiao Ming");
        p.run();
    }
}

interface Person {
    String getName();
    default void run() {
        System.out.println(getName() + " run");
    }
}

class Student implements Person {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
```

实现类可以不必覆写`default`方法。`default`方法的目的是，当我们需要给接口新增一个方法时，会涉及到修改全部子类。如果新增的是`default`方法，那么子类就不必全部修改，只需要在需要覆写的地方去覆写新增方法。

`default`方法和抽象类的普通方法是有所不同的。因为`interface`没有字段，`default`方法无法访问字段，而抽象类的普通方法可以访问实例字段。

### 字符串&API

##### API

简单理解:API就是别人已经写好的东西，我们不需要自己编写，直接使用即可

可通过API帮助文档查找需要的API

##### String

java.lang.String 类代表字符串，Java 程序中的所有字符串文字(例如“abc”)都为此类的对象。

```
String name ="小面";
```

用+可以拼接

![image-20241125203147721](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411252031928.png)

###### 字符串的比较

![image-20241125203433405](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411252034486.png)

**方法**(一般用这个)

```
string1.equals(string2)  完全一样才是true，否则为false

string1.equalsIgnoreCase(string1,string2)   比较时忽略大小写
```



###### StringBuilder

StringBuilder 可以看成是一个容器，创建之后里面的内容是可变的

作用：提高字符串的操作效率

它与`String`的主要区别在于，`String`对象是不可变的，每次对`String`进行修改都会生成新的字符串对象；而`StringBuilder`可以直接在原对象上修改内容，避免创建新的对象，从而提高效率。

**构造方法**

```
StringBuilder aa = new StringBuilder("abc");  将abc放入StringBuilder对象里

```

**常用操作**

append()  添加数据，并返回对象本身

reverse()   翻转容器中的内容

length()	返回长度

toString() 实现吧StringBuilder转换为String

```   
StringBuilder aa = new StringBuilder();  
aa.append("123"); //123
aa.reverse();   //321
aa.length();   //3
aa.tostring()  // 变成字符串
```

###### StringJoiner

Stringloiner跟StringBuilder一样，也可以看成是一个容器，创建之后里面的内容是可变的。

通常用于将多个字符串以指定分隔符连接成一个单一的字符串

作用:提高字符串的操作效率，而且代码编写特别简洁，但是目前市场上很少有人用。

```
StringJoiner("间隔符", "开始符号", "结束符号");

import java.util.StringJoiner;

public class Main {
    public static void main(String[] args) {
        StringJoiner joiner = new StringJoiner(", ", "[", "]");
        joiner.add("apple");
        joiner.add("banana");
        joiner.add("cherry");
        
        System.out.println(joiner.toString());  // 输出: [apple, banana, cherry]
    }
}

```

**常用操作**

add()

length()

toString()



### 集合

集合中可以存引用数据类型和基本数据类型，但存放基本数据类型时，要使用对应的包装类

| 基本数据类型 | 包装类      |
| ------------ | ----------- |
| `boolean`    | `Boolean`   |
| `byte`       | `Byte`      |
| `char`       | `Character` |
| `short`      | `Short`     |
| `int`        | `Integer`   |
| `long`       | `Long`      |
| `float`      | `Float`     |
| `double`     | `Double`    |

**与数组的区别**

**数组**：数组的大小是固定的，一旦定义，就无法更改。在创建数组时，必须指定其长度，并且一旦数组创建完成，大小就不能再修改。

```

int[] arr = new int[5];  // 创建一个包含 5 个元素的数组
```

**集合**：集合的大小是动态的，可以根据需要自动增长或缩小。例如，`ArrayList` 可以根据添加或删除元素自动调整大小。

```
ArrayList<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
```



##### **创建集合的对象**

```

泛型：限定集合中存储数据的类型
ArrayList<包装类> list = new ArrayList<>();  只能存储这种包装类的  //在JDK7以上使用

```

**成员方法**

![image-20241125212751941](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411252127044.png)

##### 



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

```
Class clazz=Class.forName("全类名");
Field[] fie1=clazz.getConstructors();
for(Field field:fie2){
System.out.println(con)
}
```



#### 获取成员方法

![image-20250218191740079](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181917171.png)













#### 动态代理

特点：无侵入式的给代码增加额外的功能

java通过接口保证，后面的对象和代理需要实现同一个接口，接口就是被代理的所有方法

#### 如何为Java对象创建代理对象

![image-20250218151025096](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202502181510170.png)

  

未完。。。
