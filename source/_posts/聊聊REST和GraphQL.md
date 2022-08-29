---
title: 聊聊REST和GraphQL
mathjax: true
comments: true
date: 2022-08-29 16:04:21
tags:
    - network
    - graphql
    - nodejs
categories:
    - develop
---
接触GraphQL是因为暑假实验室项目的接口采用该规范，遂学习一下，基于koa写了一个简单的graphql规范的服务端应用程序，代码扔在[Github](https://github.com/yzh-2002/demo/tree/main/graphql)了（不小心把自己mongoDB数据库的连接密钥也push上去了，不过是MongoDB免费提供的，无所谓了~~懒得revert~~）

<!--more-->

## 预备知识

> 由于笔者没有系统的学习过后端，更没有什么工程经验，这部分内容很多都是自我感受，读者仅供参考，欢迎评论指正。

无论是GraphQL还是REST，都是客户端如何从服务端获取数据的一种规范，下面一张图描述了一个单体服务的应用架构（自己画的，欢迎指正(ฅ•﹏•ฅ)）：
![单体应用架构图](https://p.qlogo.cn/hy_personal/3e28f14aa05168425d009be15e3efd9a223ebefcad7efaa89dc66e336c791feb/0.png)

一个应用的数据一般都存储在数据库中，服务端想把数据传输给客户端，首先要从数据库获取数据（一般都是在同一主机上，获取过程可能类似于磁盘读取（未深究），当然，对于多服务架构，一个服务的数据可能来自另一个服务，也即另一台主机的数据库...）。

客户端和服务端基本都不在同一主机上，不同主机之间的数据传输需要网络通信，常见的有：HTTP,WebSocket，gRPC....

基于这些内容，下面看看什么是REST？GraphQL？

## REST

> 上面说过客户端与服务端通信协议有很多，但是REST是基于HTTP的很多特性设计的一种规范（REST的设计者曾参与HTTP协议规范的制定，~~算是夹带私货？？~~）

比较常见的规范如下：

1. URL定位服务端资源（也就是数据），HTTP动作（GET/POST/PUT/DELETE）来操作资源
2. 使用HTTP Status Code表示服务器状态
3. `HATEOAS`，通俗来讲就是：客户端事先对于服务端能提供怎样的数据一无所知，仅知道两者之间交互的URL（ 专业点叫`hypermedia`，restful教旨中资源的表现形式，我理解为URL）

具体表现在指导后端开发人员如何设计接口及编写应用程序，示例如下：

```text
表示某个用户user的朋友列表信息:
https://xxxxx/user/friends

表示某个用户的个人信息：
https://xxxxx/user/profile
```

后端的应用程序在处理时，也是关注URL和响应的方法，再给出返回的数据

```js
import Koa from "koa";
const app =new Koa();

app.get("/profile",(ctx,next)=>{
    // 逻辑处理，从数据库返回相应数据
})

app.post("/profile",(ctx,next)=>{
    //...
})
```

但是据我目前所了解，很多公司并没有严格遵循REST的设计规范，主要在于REST设计时有点理想化，很多HTTP的设计并没有为实际开发的业务考虑，具体表现在：

1. 不使用HTTP Status Code表示服务器状态，而是全部返回200，自己在返回的数据中增设code字段表示服务器内部业务处理逻辑的状态。
2. 不使用PUT/DELETE，基本上全部使用POST请求事先。

关于这两种情况，可以翻看知乎的相关讨论：

[为什么那么多公司做前后端分离项目后端响应的 HTTP 状态一律 200？](https://www.zhihu.com/question/513865370/answer/2344277817)

[公司规定所有接口都用 post 请求，这是为什么？](https://www.zhihu.com/question/336797348/answer/2186795814)

## GraphQL
> 不同于REST和HTTP协议的强关联性，GraphQL具有`transport-layer agbostic`的特点，也即客户端与服务端之间的通信协议使用什么都无所谓...


## to be continued 
吃完饭再写....



## 参考链接

1. [怎样用通俗的语言解释REST，以及RESTful？--知乎](https://www.zhihu.com/question/28557115/answer/48094438)
2. [HATEOAS --wikipedia](https://en.wikipedia.org/wiki/HATEOAS)
3. []()