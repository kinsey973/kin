---
title: HTML学习篇
date: 2023-12-09 18:12:26
tags:
categories: 学习笔记
---

# HTML是什么

HTML 不是一门编程语言，而是一种用于定义内容结构的*标记语言*。HTML 由一系列的[元素](https://developer.mozilla.org/zh-CN/docs/Glossary/Element)组成，这些元素可以用来包围不同部分的内容，使其以某种方式呈现或者工作。一对[标签](https://developer.mozilla.org/zh-CN/docs/Glossary/Tag)可以为一段文字或者一张图片添加超链接，将文字设置为斜体，改变字号，等等。

<!-- more -->

在了解前，先看一下大概：[HTML 标签列表(字母排序)](https://www.runoob.com/tags/html-reference.html)

# HTML学习

![image-20231209193738651-170213087190711](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312101447318.png)

## 基础语法

### 标签

```
单标签 ：   无属性<标签名 />

​          有属性<标签名 属性名="属性值"></标签名>

双标签 ：   无属性 <标签名></标签名>

​           有属性<标签名 属性名="属性值"></标签名>    
DOCTYPE

<!DOCTYPE html> heml 5版本声明，需写在文档第一行


```

```
例如：<meta charset="utf-8" />   meta为标签，charset为属性，utf-8为属性值
```

**‘ / ’是结束标志**

### 整体结构

```
<html>...</html> 表示当前是一个网页

<head>...</head> 头部信息

<body>...</body> 身体部分
```



### DOCTYPE  

```
<!DOCTYPE html>  html 5版本声明，需写在文档的第一行，‘！’要加
```



### 例子

![image-20231209211145818-170213088699513](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312101448705.png)



## 常用标签



**标签的属性之间要以空格隔开**

若想要给页面设置颜色，参考以下文章：[CSS color 属性](https://www.runoob.com/cssref/pr-text-color.html)

### 标题和水平线

标题标签：

```
<h1></h1>~<h6></h6>  标题依次从大到小
```

***不建议在页面中使用多个h1标签，h1标签可以被搜索引擎获取到，如果有多个，可能会被搜索引擎拉黑***



水平线标签：

```
<hr>   放在body内任意一行，都会在该行生成一个水平线

常用属性：
width 宽度    1.百分比 
              2. px

align 对齐方式 left      right     center（默认）

size  水平线粗细

例如：
<hr width="50%" alien="left" size="5” /> 
宽度为50% 居左 大小为5的水平线
```



### 段落和换行

段落标签：

```
<p>...<p/> 段落会自动换行
常用属性：
    align 对齐方式:
             left  居左对齐
             right 居右对齐
             center 居中对齐
             justify 两端对齐
例如：             
<p align="left">...</p> 
段落居左对齐
```

换行标签：

```
<br/> 有几个换几行
```

**段落标签和换行标签的区别：**

段落标签换行的距离比换行标签换行的距离大

![image-20231210151308888](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312101513952.png)

第一行与第二行间用的是段落标签，第四行和第五行之间用的是换行标签

### 列表

```
无序列表：
格式：<ul>
       <li></li>
       <li></li>
    </ul>
常用属性：
    type列表的图标：
           square 实心方块
           circle 空心圆
           disc   实心圆      
例如：           
 <ul type="square"> 
       <li>...</li>
       <li>...</li>
  </ul>   
  ...前有实心方块    
```

```
有序列表：
格式：<ol>
        <li></li>
       <li></li>
    </ol>
常用属性：
    type 列表的图标
        1  数字序号
        a  小写字母
        A  大写字母
        i  小写罗马字母
        I  大写罗马字母 
例如：        
<ol type="1">
    <li>...</li>
    <li>...</li>
</ol>   
...前从1开始标号
```

### div和span

```
div标签
   层，块级元素，标签会自动换行
   常用于布局。
   常用元素：
         align   div元素中内容的对齐方式

span标签
    块，行内元素，标签不会自动换行
       
```

**div标签和span标签主要结合css用于布局**

区别参考csdn：[span和div的区别是什么](https://blog.csdn.net/Obito_TXP/article/details/120106931#:~:text=div和span的区别是：div标签是块级元素，每个div标签都会从新行开始显示，占据一行；div标签内可以添加其他的标签元素（行内元素、块级元素都行）。,而，span标签是行内元素，会在一行显示；span标签内只能添加行内元素的标签或文本。)

### 格式化标签 

```
font
   设置字体相关的属性
   常用属性：
        color 字体颜色
        size  字体大小
        face  字体风格
 例如：       
 <font color="red" size="5" face="楷体">
       ...
 </font> 
 ...为红色，字体大小为5的楷体
```

```
pre
   定义预格式化的文本。保留文本中的空格和换行。文本呈现等宽字体
例如：  
<pre>
     hello
     world
</pre>   
hello在一行，world在另一行，且hello前没有空格，world前有空格    
```

```
字体
    粗体：            例子
    b或者strong    <b>hello</b>   得到粗体hello
    
    斜体：
    i             <i>hello</i>   得到斜体hello
    
    下划线：
    u             <u>hello</u>   得到有下划线的hello
    
    中划线：
    del            <del>hello</del>  得到中间有一条线的hello
    
    下标：
    sub             H<sub>2<sub>O    得到H₂O
    
    上标
    sup             10<sup>2<sup>   得到10²
  
```

### a标签

```
超链接a标签：
    定义超链接：用于从一个页面链接到另外一个页面
    
    常用属性
        href  必须要有属性值（若无，则a标签与普通标签无异）
            需要跳转的地址
            
       例： <a href="网站地址">网站</a>   覆盖当前页面，跳转到新的页面
        
        target
               窗口打开的方式
               _self  当前窗口打开（默认）
               _blank 新开空白窗口打开
               
     例：   <a href="网站地址" target="_blank">网站</a>  新开页面打开网站 
    
```

### a标签扩展——锚点的实现

```
如果想要跳转到当前页面，那么href的值可以设置为#
    1.利用a标签的name属性
    
     <a name="dd"></a>a...
        b...
        c...
        d...
     <a href="#dd">跳转</a>  
     点击跳转就会跳转到a...这行。
     
     注意：若未设name属性，则直接跳转到页面最上方  例如：<a href="# ">跳转</a> 点击跳转就会来到页面最上方
     
     2.利用其他标签的id属性
     
        <p > 1...</p>
          <p id="dd"> 2...</p>
          <p> 3...</p> 
         <p> 4...</p>
         <a href="#dd">跳转</a>
         点击跳转就会来到2...这一行
```

### 图片

```
img 标签：
    必须属性：
    	src   被引入图片的地址
    常用属性：
        title 当鼠标悬停在图片上的文字
        alt   当图片加载失败时显示的文本
        width 设置图片的宽度
        height 设置图片的高度
        align  规定如何根据文本来排列图像
        border  给图片加框

例：
<img src="图片地址" alt="图片错误"/>
<img src="图片地址" width="200px" height="100px"/>

<a href="网站地址">
<img src="图片地址 " title="..." border="2"/>
</a>
```

### 表格

```
 表格标签：
    table 表示表格
    tr    表示表格中的行（每一行可以包含多个th或tr）
    td    表示表格中的标准单元格
    th    表示表格中的表头单元格（具有标题的效果，字体加粗，居中显示）
    
************************    
 table 常用属性
     border 表格的边框
     width  表格的宽度（使用像素值或百分比，如果是百分比，参考的是上一元素，如果上一元素未设置，则参考屏幕宽度）
     height 表格的高度
     align  表格的对齐方式（left right center）
     
************************     
 tr和th 常用属性 
       align 每行中文本内容的水平方向对齐方式
       valign 每行中文本内容的垂直方向对齐方式（top bottom middle）
       bgcolor 设置行的背景颜色
       
********************
 css样式
   border-collapse:collapse; 合并表格边框
  
 **************** 
 合并单元格
    <td>的colspan和rowspan分别规定单元格横跨的列数和行数
    纵向合并 rowspan
    横向合并 colspan
       
```

```
例：
<table border="1" width="500px" align="center" style="border-collaspe:collaspe;">
<tr>
   <th colspan="2">班级+姓名</th>
   <th>年龄</th>
   <th>性别</th>
</tr>
<tr align="center">
    <td rowspan="2">101班</td>
    <td>张三</td>
    <td>18</td>
    <td>男</td>
 </tr>   
 <tr align="center">
    <td >101班</td>
    <td>李四</td>
    <td>19</td>
    <td>女</td>
 </tr>   
 <tr align="center">
    <td>102班</td>
    <td>王五</td>
    <td>19</td>
    <td>男</td>
 </tr>   
```

效果图：![image-20231212203606559](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312122036586.png)

### 表单form

```
	所有标签都有的属性：
	       id属性   用来标识元素的唯一性
	       name属性 提交数据时的参数名
	       style属性 设置元素的行内样式
	       class属性 设置元素的样式名
	       
******************************************************

	form 
        表单用于向服务器传输数据。form元素是块级元素，其前后会产生折行
        表单提交时，必须设置表单元素的name属性值，否则无法获取数据
        表单需要结合表单元素一起使用
        
       常用属性
          action 提交表单的地址
          method 提交方式（不区分大小写）
             get提交 GET
             post提交 POST
          target 提交数据时打开窗口的方式
             _self 当前窗口
             _blank 空白窗口
   
   GET请求和POST请求的区别：
        1.get请求时参数会跟在浏览器地址后面，而post请求不会
        2.get请求相当于post而言，不那么安全
        3.get请求传递的数据长度是有限的，而post请求基本没有（长度与服务器有关）
        4.get请求比post快（2倍）
        5.get请求有缓存，而post无
 
```

### input标签

```
 input标签（行内元素）
     type   元素的类型
          text  文本框
          psaaword 密码框
          radio   单选框
          checkbox 复选框
          file     文件域
          hidden   隐藏域
          button   普通按钮
          submit   提交按钮
          reset    重置按钮
          date     日期框
      value    元素的值
      readonly  只读状态
      maxlength  最多输入的长度
      disabled   禁用标签
      
注意：
    1.单选框需要通过name属性设置为一组，复选框需要通过name属性设置为一组。
    2.如果是上传文件的表单，则表单需要设置一个属性 enctype=“multipart/form-date”，提交方式为post请求
    3.没有name属性是无法提交数据的。
    
    
```

```
<body>
    <form action="http://www.baidu.com" method="get">
     文本框：<input type="text" value="zhangsan" maxlength="10"/><br/>
     文本框：<input type="text" value="zhangsan" readonly="readonly"/><br/>
     密码框:<input type="password" /><br />
     单选框：<input type="radio" value="man" name="sex">男
     		<input type="radio" value="woman" name="sex">女 <br/>
     复选框：<input type="checkbox" value="1" name="test"> 1
            <input type="checkbox" value="2" name="test"> 2
     		<input type="checkbox" value="3" name="test"> 3 <br/>
     文件域: <input type="file" /><br/>
     隐藏域：<input type="hidden" value="admin" /><br/>
     普通按钮：<input type="button" value="普通按钮"><br/>
     提交按钮：<input type="submit" value="提交按钮"><br/>
     重置按钮：<input type="reset" value="重置按钮"><br/>
     日期框：<input type="date" /><br/>
    </form>
</body>    
```

![image-20231212203322384](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202312122033423.png)

### textarea和label标签

```
textarea: 定义可输入多行文本的控件
          cols 文本的可见宽度
          rows 文本的可见行数
label：元素聚焦
      for属性
      当for属性与元素的id属性一致时，点击label标签，会自动续航

例：
简历：<textarea cols="30" rows="10"></textarea>
  <label for="uname">姓名</label><input type="text" name="uname"/><br/>
```

### 按钮

```
input按钮：
   type="button"  普通按钮
   type="submit"  提交按钮
   type="reset"  重置按钮
button标签：
  type="button"  普通按钮
   type="submit"  提交按钮（默认）  注意 不写type就相当于提交按钮！！！
   type="reset"  重置按钮

```

### 下拉框

```
select 下拉框标签
option  下拉框的选项标签

select：
     multiple  设置下拉框多选
     size      设置下拉框可见选项数
     disabled  禁用元素
option：
      selected  默认选中值
      disabled  禁用某个选项
      value     提交给服务器的选项值
      注意： 如果设置了value属性值，则提交的是value的值
            如果未设置，则提交option双标签中的文本值
            value=""也相当于设置了。
            
```

## 常用字符实体

### 常用字符实体

```
<   小于号   &lt
>   大于号   &gt
空格        &nbsp
版权         &copy
```





*******************************************************************************************************************************

