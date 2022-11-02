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

## JavaScript面向对象编程

> JavaScript的面向对象，是一种基于`prototype`的面向对象。

什么是基于`prototype`的面向对象呢？在原型链中我们提到过（写到这里发现漏提了...），**所有的对象都有一个原型对象，原型对象也有其原型对象**，因此就有了原型链，为了更好的理解，我们先此处存疑，接着往下看：

### new干了什么？

JavaScript中如何产生一个对象呢？两种方式：

1. 对象字面量
2. 构造函数实例化

对象字面量不再过多介绍，这里主要说一下构造函数实例化的方式，所谓构造函数，其实就是普通的函数，但是通过`new`关键字调用：
```javascript
let Demo =function(name){
    this.name =name;
}

let yzh =new Demo('yzh');
console.log(yzh) //Demo {name:'yzh'}
```

`new`关键词做了什么呢？

1. 创建一个空的JavaScript对象`{}`
2. 为该对象添加属性`__proto__`，将其指向构造函数的原型对象
3. 将步骤1创建的对象作为构造函数中`this`的引用
4. 如果该函数没有返回对象（一般构造函数都不返回对象，默认返回this），就返回`this`

写成代码就是：

```javascript
function newObj(fn,args){
    let obj ={}
    obj.__proto__ =fn.prototype;
    fn.call(obj,...args)
    return obj;
}
```

为什么是基于原型的面向对象，关键就在于第二步`obj.__proto__ =fn.prototype`，（根据原型链提到的属性和方法的查询原则）不同实例对象的属性和方法都来自于同一个对象，也即构造函数的原型对象。

### 继承如何实现？

知晓这一点之后，再来看看基于原型如何实现继承？

> 其实所谓继承：

```javascript
let Person =function(name){
    this.name =name;
}

Person.prototype.eat =function(){
    console.log("eating...")
}

// 实现一个学生类，继承Person
let Student =function(name,grade){
    Person.call(this,name); //使得实例对象拥有Person类的属性和方法
    // Student类的属性和方法
    this.grade =grade;
}
// 为了Student类可以访问Person类的原型上属性和方法，因此需要使得Student的原型对象继承Person的原型对象
Student.prototype =Object.create(Person.prototype) 
// 记得将constructor更改回来
Student.prototype.constructor =Student;

// 完成上述步骤之后就可以在Student的原型上再添加新方法了....
```

### class

> ES6中引入了`class`关键字，虽说其只是一个语法糖，但是底层实现还是上述相关，但是使用`class`实现上述内容要比使用原型对象心智负担小很多....




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

## Promise

> 具体背景不再介绍，这里主要介绍一下其用法

ES6中规定，`Promise`是一个构造函数，用来生成`Promise`实例。
```javascript
const promise =new Promise((resolve,reject)=>{
    if (/*异步操作成功*/){
        resolve(value);
    }else{
        reject(err);
    }
})

promise.then((value)=>{
    //fulfilled
}).catch((err)=>{
    //failure
})
```

`Promise`构造函数接收一个函数作为参数，该参数的两个函数分别为`resolve`和`reject`。

其中`resolve`是一个回调函数，其参数为异步操作成功的结果。`reject`也是一个回调函数，其参数为异步操作失败的结果。（对于这句话的理解还可以是`resolve`改变异步操作的状态为fulfilled后会触发相应的回调函数...）

## 闭包

> 闭包是JavaScript中最强大的特性之一。

JavaScript允许函数嵌套，并且内部函数可以访问定义在外部函数中的所有变量和函数，以及外部函数能访问的所有变量和函数。但是，外部函数不能访问定义在内部函数中的变量和函数，此外，由于内部函数可以访问外部函数的作用域，因此当内部函数生存周期大于外部函数时，外部函数中定义的变量和函数的生存周期将比内部函数执行时间长，当内部函数以某种方式被任何一个外部函数作用域访问了，一个闭包就产生了。

上面的话有点绕，简单来说：外部函数的词法作用域在执行之后应该销毁，但是由于内部函数作为值返回出去，导致这些值得以保存，同时无法直接访问，只能通过返回的内部函数来访问，这个内部函数就是闭包。**所谓`闭`，指的是封闭外部状态，当外部状态的作用域失效时，还能留一份在内部状态中。**

```javascript
let test =function(name){
    let closure =function(){
        return name;
    }
    return closure;
}
let name =test('yzh');
name(); //yzh
```
### 闭包应用

> 待补充....

1. 模拟块级作用域

> 感觉更多是在使用函数作用域的特性，而不是闭包的一些特性（回头再想一想...）
```javascript
for(var i=0;i<10;i++){
    setTimeout(()=>{
        console.log(i) 
    },1000*i)
} //最终打印10个10

for(var i=0;i<10;i++){
    (function(j){
        setTimeout(()=>{
            console.log(j)
        },1000)
    })(i)
}
```

## Event Loop



## 参考链接

1. [原型链，变量提升与覆盖，this指向一网打尽](https://juejin.cn/post/7025595497431695391)
2. [ES6 入门](https://es6.ruanyifeng.com/)
3. [函数闭包 --MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions#%E9%97%AD%E5%8C%85)
4. []()

