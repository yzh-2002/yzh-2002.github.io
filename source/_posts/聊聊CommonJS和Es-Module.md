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

> [2022-11-01补充：]这些天在学习webpack，回顾前端打包方案的黑暗历史时又看到了CommonJS模块化的介绍，感觉自己的记忆已经有点模糊，加之当初总结这篇文章时，并没有细究很多东西，所以难免存在问题，因此对文章进行了大的改动。

两者之间的区别，阮一峰已经总结过了

1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
3. CommonJS 模块的`require()`是同步加载模块，ES6 模块的`import`命令是异步加载，有一个独立的模块依赖的解析阶段。
4. ES6 Module的 this 是 undefined，而CommonJs 的 this 是当前模块；

先简单提一下区别2和区别3，表面上看两者似乎没什么关系，但这种设计都是从应用场景出发的（或者说有相应的考量），具体原因参考`Jason Orendorff`的原话：

> A “simple”, synchronous require() was never in the cards for ES, because ES has to work in the browser. Loading a module may involve fetching code off the internet, which can’t be done synchronously. 

CommonJS一直是nodejs的模块化规范，而nodejs一般跑在服务器上，不需要考虑依赖文件的获取问题，因为文件基本都在本地，花费的时间无非就是磁盘读取时间，相比于跑在浏览器上的代码，依赖文件很可能要通过网络获取，这个过程就相比前者就慢了好几个数量级，因此需要采用异步（AMD（已淘汰）诞生的原因无外乎这个...）以避免JS主线程的阻塞。


## How ES Module work？

> 下面就谈谈ES Module的解析流程

以下面代码为例：

```html
<body>
    <div id="root"></div>
    <script type="module" src="main.js"></script>
</body>
```
经历三个步骤：

1. Construction：查找，下载并解析所有模块文件为`Module Record`
    - `Module Record`示例：
    - ![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/blog/202211102306411.png)
2. Instantiation: 将export的值置入内存中（**此时不填充变量值**），然后将exports和imports的变量都指向刚刚分配的内存空间（这样就解释了为什么ESM输出的是值的引用）
3. Evaluation：执行代码为内存中变量赋值（所以模块中最好不要有effect？？）


### Construction

该过程由分为三部分：

1. 通过解析模块来查明从哪里获取模块文件
2. 获取文件（通过**网络获取或从文件系统（本地）**中获取）
3. 将文件解析为`Module Record`
    
如上例所示，当浏览器解析到一个类型为module的脚本文件时，就会去异步加载该文件（所谓异步加载：即等到整个页面渲染完，再执行模块脚本（**模块文件的下载和获取工作交由后台完成**，不会阻塞页面渲染）），等到文件下载完成之后再去解析`Module Record`，然后寻找依赖，然后再交由后台去下载，一层一层的完成，并最终构建出来一张模块依赖图。

![解析流程](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/blog/202211232213019.png)

这其实就是ESM和CommonJS之前的区别之一了，由于网络下载文件通常很消耗时间，所以**ESM模块代码的执行和下载是分开的**（也就是所谓的异步执行），也即解析到Module文件时，浏览器不着急执行它，而是后台下载相关依赖文件，然后等到完成下载之后，再去执行该文件。而CommonJS则是等待其下载并执行完之后再往下走（也就是同步加载）。

同时这也是为什么ESM的模块标识符不能存在变量，而CommonJS可以存在变量的原因，因为ESM的解析是静态的（静态解析交由谁完成还需要查询资料），而CommonJS文件直接下载并执行（非静态解析）。

#### 动态导入`import()`

那么在ESM中，如何实现根据不同的场景导入不同的模块这一需求呢？答案就是`import()`。具体原理还需要再查询相关资料...

#### Module Map

> `Module Map`的设计在ES Module中十分重要。

每当浏览器获取模块依赖文件时，就会被记录在Module Map中，例如：

![Module Map](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/blog/202211232213252.png)

这样如果有其他模块依赖同一个文件，浏览器会先去Module Map查看是否存在，如果正在获取，就直接跳过该文件获取下面的文件。除了减少请求次数，Module Map还具有缓存（缓存Module Record）的功能。如下图：

![Module Map Cache](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/blog/202211232214597.png)

这个设计对于ES Module处理循环依赖大有作用（后面再说）。

### Instantiation

js引擎将会创建一个模块环境记录，用于管理`Module Record`中的变量，JavaScript引擎会为export出的变量分配内存，然后在模块的环境记录中保存内存地址和export的变量的关联，此时这些内存地址都没有初始化的值，然后JavaScript引擎再将import与export的变量指向相同的地址空间（但是ESM规定导入变量的模块不能修改导入变量的引用（但是对于引用类型，可以修改其值）），这与CommonJS不同，在CommonJS中，导入对象是导出对象的值的拷贝。

如下图所示：

![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/blog/202211232215017.png)

这也解释了为什么ES6模块输出的是值的引用。

### Evaluation

最后就是对各个模块依赖的变量进行赋值，js引擎通过执行**顶层作用域**的代码来实现该步骤，值得注意的是，这会带来一些副作用，比如你的模块中有如下代码：
```js
console.log("test");
```
这些函数会在其依赖的模块中也执行一遍，当然例子算是温和的了，比较严重的副作用就是在模块中修改导出的值，又可能会导致同一个模块导出的值，在不同的模块中最终表现结果不一致。（不过`Module Map`的存在帮我们解决了这个问题）


## To be Continued

## 参考资料

1. [Module的加载实现--阮一峰](https://es6.ruanyifeng.com/#docs/module-loader)
2. [ES modules: A cartoon deep-dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
3. [es6-in-depth-modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)
4. [Node.js v18.8.0 documentation](https://nodejs.org/api/modules.html)