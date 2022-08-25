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

## 问题复现
> 提前声明：这个问题本质在于对于ES Module的不熟悉，因此下面的bug可能会让人感觉血压高（~~我自己重新想一下都感觉我当时是个脑子是坨浆糊~~） 以至于会有人问：《你干嘛要这样搞？》(~~我也不知道自己当时咋想的...~~)

服务端大体结构：

1. Mongoose连接数据库在`server/mongodb/index.js`
2. Schema注册在`server/mongodb/schema/person.js`
3. Schema的数据操作函数在`server/controllers/person.js`
4. 服务端入口在`server/app.js`

四个模块均采用ES Module，依赖关系是这样处理的：模块(1)导出`ConnectedDB`函数，模块(2)无导出，模块(3)导出Schema的`addPerson和getPersons`两个处理函数，模块(4)引入模块(1)和模块(3)的函数并运行：

1. 服务器连接MongoDB数据库
2. 指定路由执行相应的数据处理函数

关键在于模块(2)并没有将注册的Schema导出，那数据操作函数如何获取注册的Schema呢？

> ES6模块输出的是值的拷贝

故`import mongoose from "mongoose"`中的mongoose理论上在内存上是同一块地址。

## to be continued

今天整理不完了，明早再整理吧（~~没人看就是随便....~~）



## 参考资料

1. [Module的加载实现--阮一峰](https://es6.ruanyifeng.com/#docs/module-loader)
2. []()
3. 