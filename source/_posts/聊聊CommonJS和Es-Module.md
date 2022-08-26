---
title: 聊聊CommonJS和Es Module
mathjax: true
comments: true
date: 2022-08-25 20:07:06
tags:
    - JavaScript
categories:
    - develop
---
今天想写一个GraphQL前后端交互的Demo，平时用Nodejs写服务端模块都使用CommonJS规范，但Nodejs在`v13.2`版本开始就支持Es Module了，于是尝试了一下，但是在涉及到`import()`异步加载遇到了些问题，便借此机会系统看看两者的区别。

<!--more-->

## A stupid bug
> 提前声明：问题复现部分十分无聊，想了解ESmodule和CommmonJS的读者可以直接跳过，这个问题本质在于对于ES Module的不熟悉，因此下面的bug可能会让人感觉血压高（~~我自己重新想一下都感觉我当时是个脑子是坨浆糊~~） 以至于会有人问：《你干嘛要这样搞？》(~~我也不知道自己当时咋想的...~~)

服务端大体结构：

1. Mongoose连接数据库在`server/mongodb/index.js`
2. Schema注册在`server/mongodb/schema/person.js`
3. Schema的数据操作函数在`server/controllers/person.js`
4. 服务端入口在`server/app.js`

四个模块均采用ES Module，依赖关系是这样处理的：模块(1)导出`ConnectedDB`函数，模块(2)无导出，模块(3)导出Schema的`addPerson和getPersons`两个处理函数，模块(4)引入模块(1)和模块(3)的函数并运行：

1. 服务器连接MongoDB数据库
2. 指定路由执行相应的数据处理函数

关键在于模块(2)并没有将注册的Schema导出，那数据操作函数如何获取注册的Schema呢？

> ES6模块输出的是值的引用

故`import mongoose from "mongoose"`中的mongoose理论上在内存上是同一块地址。

因此只要我在模块(2)中在mongoose上注册了Schema，并使其在模块(3)使用Schema时执行，那么模块(3)就可以从mongoose这个几个模块共享的变量中拿到Schema（~~思路很新奇对吧，为什么不直接模块(2)导出定义的Schema，然后在模块(3)中直接引入就行---我也不知道我当时咋想的....~~）

ok，那么关键就在于如何让模块(2)在模块(3)之间执行，因为require和import都会执行当前文件的特点，所以当时的想法就是导入即可（但是当时不知道ESmodule即使文件不导出，也可以被其他文件导入），因此就想着使用`import()`，但其是异步导入，后续的操作需要放到`import().then(()=>{...})`中，但是`export`又只能放到顶层作用域中，所以这个想法破产了....

然后就想着我在模块(2)导出一个空对象，然后模块(3)就能导入模块(2)，方法成功。（但这种方法实属愚蠢，不如直接导出定义的Schema对象）

但其实还能更简洁，模块(2)无需导出，模块(3)依然能导入，且该方法成功....

最后总结一下：这个问题发展到这里其实更多是想利用ESmodule不同于CommonJS的新特性玩点花的，但是借[雪碧大大的一段话](https://www.zhihu.com/question/353757734/answer/894810451)：

> 希望你能从技术的用途出发去理解技术，没必要上来就原理原理的。微积分是为了解决体积计算问题而出现的，矩阵也是为了求解线性方程才诞生的。高大上的数学尚且如此，对于编程语言来说，它们的特性更几乎必定是为解决某个具体问题而设计的。所以不管对于 this 还是什么别的特性，作为使用者，还是先搞明白它的使用场景吧 :)


## ES Module vs CommonJS

两者之间的区别，阮一峰已经总结过了

1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
3. CommonJS 模块的`require()`是同步加载模块，ES6 模块的`import`命令是异步加载，有一个独立的模块依赖的解析阶段。
4. ES6 Module的 this 是 undefined，而CommonJs 的 this 是当前模块；

先简单提一下区别2和区别3，表面上看两者似乎没什么关系，但这种设计都是从应用场景出发的（或者说有相应的考量），具体原因参考`Jason Orendorff`的原话：

> A “simple”, synchronous require() was never in the cards for ES, because ES has to work in the browser. Loading a module may involve fetching code off the internet, which can’t be done synchronously. 

CommonJS一直是nodejs的模块化规范，而nodejs一般跑在服务器上，不需要考虑依赖文件的获取问题，因为文件基本都在本地，花费的时间无非就是磁盘读取时间，相比于跑在浏览器上的代码，依赖文件很可能要通过网络获取，这个过程就相比前者就慢了好几个数量级，因此需要采用异步（AMD（已淘汰）诞生的原因无外乎这个...）以避免JS主线程的阻塞。

编译时就处理依赖关系一定程度上也可以节省时间（总比运行到那再去获取依赖文件要快....），当然编译时处理还有其他诸多好处，这里就不一一列举了（~~其他好处我也不晓得，感知的不是很清楚，类似方便预处理之类的？？~~）

## How ES Module work？

> 下面就谈谈ES Module的解析流程

以下面代码为例：

```html
<body>
    <div id="root"></div>
    <script type="module" src="main.js"></script>
</body>
```

编译阶段需要经历三个步骤：

1. Construction — find, download, and parse all of the files into module records.
2. Instantiation —find boxes in memory to place all of the exported values in (but don’t fill them in with values yet). Then make both exports and imports point to those boxes in memory. This is called linking.
3. Evaluation —run the code to fill in the boxes with the variables’ actual values.

### Construction
该过程由分为三部分：

1. 找到从哪里下载包含模块的文件
2. 获取这些文件（通过网络获取或从文件系统（本地）中获取）
3. 将这些文件解析为`Module Record`
    - `Module Record`示例：
    - ![Module Record](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad185636d188556d7060c2e62d0d6ddf0a8aac/0.png)

如上例所示，当浏览器解析到一个类型为module的脚本文件时，会以异步的当时获取该文件（module类型的js脚本相当于添加了async），然后解析该文件内容，生成一个`Module Record`，其中记录了它依赖哪些模块，并依赖相应模块中的哪些变量。

然后就会去获取它所依赖的文件，将它们解析为`Module Record`，过程如下：
![解析流程](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad18563eb50baeb0eb5453b5722b34229b73a1/0.png)

#### Module Map

> `Module Map`的设计在ES Module中十分重要。

每当浏览器获取模块依赖文件时，就会被记录在Module Map中，例如：
![Module Map](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad18564ca54013556577d4f6a0c1f7873c0859/0.png)

这样如果有其他模块依赖同一个文件，浏览器会先去Module Map查看是否存在，如果正在获取，就直接跳过该文件获取下面的文件。除了减少请求次数，Module Map还具有缓存的功能。如下图：
![Module Map Cache](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad1856878ad49d62f43bdc8b9bf768bad206bc/0.png)

这个设计对于ES Module处理循环依赖大有作用（后面再说）。

### Instantiation

在这一步，js引擎将会创建一个模块环境记录，用于管理`Module Record`中的变量，然后将内存空间中的变量地址与相应模块的变量建立连接（浏览器将会对依赖图以深度优先后序遍历的方式处理各个`Module Record`），如下图所示：
![](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad1856496a454d740eee4bd4bb9a0070fe34b1/0.png)

这也解释了为什么ES6模块输出的是值的引用。

### Evaluation

最后就是对各个模块依赖的变量进行赋值，js引擎通过执行**顶层作用域**的代码来实现该步骤，值得注意的是，这会带来一些副作用，比如你的模块中有如下代码：
```js
console.log("test");
```
这些函数会在其依赖的模块中也执行一遍，当然例子算是温和的了，比较严重的副作用就是在模块中修改导出的值，又可能会导致同一个模块导出的值，在不同的模块中最终表现结果不一致。（不过`Module Map`的存在帮我们解决了这个问题）

## How CommonJS work？
> 下文大多为个人理解，可能存在错误，欢迎指正（笔者在查阅相关资料后会进行修改补充） 

CommonJS由于是运行时加载，因此不会像ES Module一样事先构造出依赖图。

它会将模块化的文件

![](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad1856246b9392d2f1b100b800fc2634bbc1c8/0.png)


![demo](https://p.qlogo.cn/hy_personal/3e28f14aa05168421a27c81c3aad1856e15e8f4132de4b964856d4d7ea77ee0e/0.png)

如图所示，上图是CommonJS循环依赖的例子，这个过程简单分析一下：

main.js运行过程中遇到了`require('/counter.js')`，转而去加载counter.js，

## To be Continued
先吃饭，吃完再找时间补充....

## 参考资料

1. [Module的加载实现--阮一峰](https://es6.ruanyifeng.com/#docs/module-loader)
2. [ES modules: A cartoon deep-dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
3. [es6-in-depth-modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)
4. [Node.js v18.8.0 documentation](https://nodejs.org/api/modules.html)