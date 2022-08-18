---
title: webpack from 0 to 0.01
comments: true
date: 2022-08-16 15:23:26
tags:
    - webpack
categories:
    - develop
---
Vue/Cli，Vite，create-react-app...

平日经常使用这些工具来构建项目，这些工具也都包含了模块打包工具，webpack，esbuild，rollup....但是由于这些工具有默认的配置文件，并且安装好了各种依赖，开箱即用，所以直到今天，都没有系统的学习打包工具的使用和原理

于是就有了这篇文章......

<!--more-->

## webpack是什么？
> 本质上，webpack 是一个用于现代 JavaScript 应用程序的 静态模块打包工具。

所以他都干了什么呢？

- 代码转换：TypeScript->JavaScript，Scss->Css...

        最终浏览器运行的都是html，css，js，但是为了便于开发，前端发展中诞生了各种工具，ts，scss，less....这就需要一种工具来帮助转换
- 文件优化：压缩html，css，JavaScript和图片等资源
        
        压缩后减少服务器请求负担....
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。

        暂时还没搞明白....
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。

        便于开发调试
- ...
## webpack.config.js

学习webpack，最关键的在于学习如何配置webpack来帮助我们

## 



## 参考链接

1. [深入浅出 webpack](http://webpack.wuhaolin.cn/)
2. []()


