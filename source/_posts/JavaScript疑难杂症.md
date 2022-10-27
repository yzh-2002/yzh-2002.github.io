---
title: JavaScript疑难杂症
mathjax: true
comments: true
date: 2022-10-27 09:13:07
tags:
    - JavaScript
categories:
    - develop
---

面试经常考察的JavaScript的疑难点（这几天看面经是越看越心虚...），觉得有必要总结一下，加深理解和记忆。(相关内容其实很久之前已经总结过了，但是现在还是感觉记忆有点模糊，可能是当时总结的时候太过啰嗦，所以文中的总结以简练为主，意思传递到位即可)

<!--more-->

## 原型链

一个对象的属性和方法既可以使用自身的，也可以使用继承自原型链上的，当访问一个对象的属性和方法时，会按照原型链从自身开始一直按照`__proto__`属性链接的原型链查找下去，直到找到这个属性或方法。

以`let demo =new Array()`为例:

`demo.__proto__`为`Array.prototype`，而`Array.prototype.__proto__`为`Object.prototype`，再往后为null，也即原型链走到尽头。

## this指向

> ECMAScript规范： 严格模式时，函数内的this绑定严格指向传入的thisArgument。非严格模式时，若传入的thisArgument不为undefined或null时，函数内的this绑定指向传入的thisArgument；为undefined或null时，函数内的this绑定指向全局的this。

分为以下几种情况：

1. 普通函数调用：thisArgument为undefined
2. 对象函数调用：thisArgument为该对象
3. 构造函数调用：thisArgument指向实例化对象
4. `call`,`apply`,`bind`调用，显式的传递thisArgument：
    - call：第一个参数为this指向对象，剩余参数作为参数传递给绑定函数，直接调用绑定函数
    - apply：第一个参数为this指向对象，第二个参数为一个数组，其中存放的是传递给绑定函数的参数，直接调用绑定函数
    - bind：第一个参数为this指向对象，返回一个绑定了this的函数

最后，还有一类最特殊的：`箭头函数调用`：

> **箭头函数调用时不会绑定this**(因此上面三种绑定thisArgument的函数无效)，他会去词法环境链上寻找this，所以箭头函数的this取决于它定义的位置，也即箭头函数会跟包裹着它的作用域共享一个作用域。

### 举个栗子

先来看看箭头函数的（由于Nodejs环境下一些未知的问题（见下面扩展阅读），建议在浏览器控制栏中运行下列代码）：

```javascript
// 显式绑定无效
var a =10;
const test =()=>{
    console.log(this.a)
}
test.call({a:20}) //10

// this指向不是调用对象
var a =10;
let demo ={
   a: 20,
   test:()=>{
    console.log(this.a)
   } 
}
demo.test() //10

// 此时输出为20，想想为什么？(介绍完词法作用域会解释原因，好奇的话可以直接往下翻)
var a =10;
let demo ={
    a:20,
    test: function(){
        var s =()=>{
            console.log(this.a);
        }
        s()
    }
}
demo.test() //20
```

再来看看一个特殊函数，`setTimeout`函数：

```javascript
window.a =10
let demo ={
    a:20,
    // test:function(){
    //     console.log(this.a);
    // }
    test:function(){
        var s =()=>{
            console.log(this.a);
        }
        s()
    }
}
demo.test() //20
setTimeout(demo.test,0); //10|20
```

为什么定时器中的函数输出的结果是10呢？

这其实是**回调函数的this指向问题**，回调函数的this默认指向全局对象，因为虽然看起来`demo.test`是对象调用，但其实并没有调用，只是传入一个函数而已，本质上还是普通函数调用，解决办法：

1. 使用bind绑定this指向
2. 使用箭头函数(上述例子中输出结果仍为10，原因在于箭头函数所在作用域的函数也不是对象调用，因此其this仍指向全局)
    - 暂时没想到好的使用箭头函数修改的方式，还希望读者能够评论补充

但是可以从React事件处理函数的处理中窥见箭头函数作用，可参考[函数作为React组件的方法时, 箭头函数和普通函数的区别是什么?](https://www.zhihu.com/question/59025982)


#### 扩展阅读

> !!!提前声明：此部分可跳过，因为平时写代码基本不会考虑或利用下面的特性，只是我在举上述例子时遇到的问题

JavaScript的宿主环境，一般就是指浏览器和Nodejs。之前一直以为浏览器的全局对象是window，Nodejs的全局对象是globalThis，所以两种环境下的顶层this指向全局对象，但今天发现有点问题，Nodejs的全局this指向居然是`{}`，并且运行`this==globalThis`也会返回`false`。

同时，之前一直认为`var`声明的变量会挂载到全局对象上，这些在浏览器上是正确的，但是在Nodejs中却不是，无论是`globalThis.xx`还是`this.xx`都返回undefined，但是如果不带`var`，直接声明，那么在Nodejs环境下前两者均能访问到，但是`this`输出还是`{}`,这就很奇怪了（我已经不想去思考这个问题了....）

下面是测试代码：
```javascript
// var name ='var'
name = 'not var'; 

const test1 =()=>{
    console.log(this.name)
}

function test2(){
    console.log(this.name);
}

test1()
test2()
console.log(this.name)
console.log(globalThis.name);
console.log(this ==globalThis);
console.log(this);
```

## 作用域链

> 上面说箭头函数时提到了作用域，下面简单说一下：

所谓作用域，可以通俗理解为JavaScript查找变量的范围，JavaScript的作用域在V8引擎进行词法分析的时候确定（和学编译的室友聊了一下，他认为词法分析阶段做不到，可能是解释语言和编译型语言的差异导致认知不同，也可能是我查阅的资料说错了，需要进一步求证...），也即JavaScript采用词法作用域，也称之为静态作用域。(作用域的形成：全局作用域，函数作用域，块级作用域...)

如下图所示：
![词法作用域](https://p.qlogo.cn/hy_personal/3e28f14aa0516842b4f6e067f975f63acfca7c653ab9d8c0b2ab06d68c5fec27/0.png)

`foo()`函数为什么打印的是`2`，而不是`10`呢？

这就是JavaScript如何寻找变量决定的了，首先在foo的块级作用域内看能否访问到，如果没有，就会到上层的词法环境中去寻找（通过outer指针，其指向上层的词法环境），而通过outer指针链接的词法作用域的链就称之为作用域链。

注意outer指针是指向外部的作用域，而不是指向内部的，很容易理解，因为内部对外部不可见。

## 参考链接

1. [原型链，变量提升与覆盖，this指向一网打尽](https://juejin.cn/post/7025595497431695391)
2. 


