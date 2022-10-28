---
title: HTTP和浏览器那些事~~
mathjax: true
comments: true
date: 2022-10-27 21:15:47
tags:
    - network
categories:
    - develop
---

上个星期写了`一道经典面试题`，其中HTTP请求的部分基本一笔带过，主要是HTTP协议对于前端开发人员还是很重要的，可说的点非常多，结合浏览器能说的就更多了，因此单独开坑总结一下，详情见后文

<!--more-->

## HTTP协议

> HTTP协议，超文本传输协议。定义了客户端和服务端进行报文交互的方式以及报文的结构。

HTTP是一个无状态协议，也即HTTP服务器不会保存关于客户端的任何信息。（先记着，后面有相关内容...）

HTTP协议是基于TCP协议的，因此客户端和服务端传输HTTP报文之前需要先建立TCP连接，每个请求/响应对经过一个单独的TCP连接发送（然后服务端就断开TCP连接，客户端下次发送报文需要重新建立TCP连接）这种属于非持续连接。所有的请求和响应均经相同的TCP连接发送，这种属于持续连接。**目前HTTP默认使用持续连接**（但是也可配置为非持续连接）。

非持续连接的缺点：
1. 为每一个请求的对象建立和维护一个全新的连接，每一个这样的连接，在客户端和服务器中都要分配TCP缓冲区和保持TCP变量，这给Web服务器带来了严重的负担。
2. 每一个对象经受两倍RTT的交付时延（一个RTT用于建立TCP连接，另一个用于请求和接收对象）

### HTTP报文

> HTTP报文是由ASCII文本构成的。

#### HTTP 请求报文

```text
GET /XXX/Index.html HTTP/1.1
Host: yzh2002.cn  #注解(不属于报文，只是解释含义)：请求对象所在主机
Connection: close #告知服务器无需采用持续连接
User-agent: Chrome/106.0.0.0
Accept-language: zh-CN

# 注解：剩下的部分为实体（和首部行之间有一个换行回车....）
```
HTTP请求报文的第一行叫做`请求行`（三个字段构成：方法字段，URL字段和HTTP版本字段），其后继的行叫做`首部行`。

其中HTTP方法包括：`GET`,`POST`,`HEAD`,`PUT`,`DELETE`。

1. GET方法：实体为空
2. POST方法：
3. HEAD方法：类似于GET方法，服务器收到HEAD请求的报文时，将会用一个HTTP报文进行响应，但是并不返回请求对象（通常用于调试跟踪...）
4. PUT方法：常与Web发行工具（Xshell之类的？？）联合使用，允许用户上传对象到指定的Web服务器上指定的路径（目录）（FTTP协议的区别？？）
5. DELETE方法：允许用户或应用程序删除Web服务器上的对象

#### HTTP响应报文

```text
HTTP/1.1 200 OK
Connection: close
Date: Thu, 27 Oct 2022 14:04:09 GMT
Server: Apache/2.2.3 (CentOS)
Last-Modefied: Thu, 27 Oct 2022 14:04:09 GMT #注解：后续讲到代理服务器会涉及...
Content-Length: 6821
Content-Type: text/html #注解：MIME类型...

(data,data,data,data....)
```
HTTP响应报文第一行为初始状态行（协议版本字段，状态码和相应状态信息），然后是首部行，再下面就是实体数据。

常见状态码及相关短语：

1. 200 OK：请求成功，信息在返回的响应报文中
2. 301 Moved Permanently
3. 302 Moved Temporarily
    - 两者的共同点：浏览器在拿到服务器返回的此状态码的报文后会自动跳转到另一个新的URL（从响应的Location获取）
    - 不同点：301表示旧地址A的资源已经被永久移除，搜索引擎在抓取新内容的同时也会将旧网址交换为重定向后的网址
    - 302表示旧地址A的资源仍然可访问，重定向只是临时从A到B，搜索引擎会抓取新的内容而保存旧的网址（这个保存和更改是操作的什么？收藏夹？？）
4. 304 ：命中缓存（后续HTTP缓存部分会涉及...）
5. 4xx:客户端错误，请求不合法
    - 400 Bad Request：请求不合法
    - 403：拒绝请求
    - 404： 客户端访问的页面不存在
6. 5xx：服务端错误，不能处理合法请求
    - 500：服务器内部错误
    - 503：服务不可用


### cookie

> 前面说过HTTP协议是无状态的，这一定程度上简化了服务器的设计，让其能够好的处理数以千计的TCP连接的高性能Web服务器。然后对于一个Web应用来说，通常希望能够识别用户，一方面是因为服务器希望限制用户访问，另一方面因为其希望内容和用户身份联系起来（推出一些定制化服务？？比如VIP....），为此HTTP使用了cookie。

cookie技术组成：

1. HTTP响应报文的cookie首部行
2. HTTP请求报文的cookie首部行
3. 用户端系统保留一个cookie文件，并由浏览器进行管理
4. 服务器的一个后端数据库

下面我们以本博客网站的访客为例，说明一下`cookie`的处理过程：

1. 浏览器发送第一个请求，请求`yzh2002.cn`站点的首页
```text
GET /index.html HTTP/1.1
Host: www.yzh2002.cn
```
2. 服务器接收请求报文之后，返回响应，同时设置`cookie`
```text
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: theme=light
Set-Cookie: sessionToken=YzhLOVEMT13=; Expires=Wed, 09 Jun 2021 10:18:14 GMT
```
3. 浏览器会保存服务端设置的`cookie`，并在下次请求时携带这些cookie
```text
GET /about.html HTTP/1.1
Host: www.yzh2002.cn
Cookie: theme=light; sessionToken=YzhLOVEMT13=
…
```

通过这种方式服务器就知道这个请求和上个请求是同一个用户发送的。

#### cookie属性

cookie本身是由一个个键值对构成的，形式类似于：`Cookie:k1=v1;k2=v2;......`

其中属性可以自定义，也有很多默认的属性：

1. Domain和Path：定义了cookie的范围，本质上是告诉cookie属于哪个站点，为了安全考虑，cookie只能在当前资源的顶级域名或者子级域名上设置，不能再其他域名和对应的子级域名上设置（浏览器跨域问题会涉及...），如果这两个属性没有被服务端指定，那么默认是当前请求资源的domain（**不包括子级域名**）和path，如果设置了domain（则会**包含子级域名**）
2. Expires和Max-Age：Expires属性定义了一个指定的日期和时间，到此时间浏览器将会删掉cookie。Max-Age则是设置cookie的有效期，以相对于浏览器接收到cookie之后的秒数计算。如果这两者均没有设置，那么这是一个`session cookie`，即当浏览器关闭之后该cookie被删除（不同于H5中SessionStorage，其和窗口相关，当窗口关闭时被销毁，`session cookie`是和浏览器相关）
3. Secure和HttpOnly：两者无关联值，单独存在，`Secure`意味着cookie只会在加密传输中携带，`HttpOnly`则代表着浏览器除了HTTP/HTTPS请求之外不会显示cookie，也无法在客户端通过脚本获取。
4. sameSite：Chrome51新增的属性，用于防止CSRF攻击和用户追踪，其有三个值，`strict`,`Lax`,`None`。strict完全禁止第三方cookie，lax稍稍放松，但是导航到目标网址的get请求除外（详情见参考链接），None则是关闭samesite属性。

不知有没有人关注到了``

## TO be continued


## 参考链接

1. [计算机网络自顶向下方法]()
2. [HTTP之cookie --wiki](https://en.wikipedia.org/wiki/HTTP_cookie)
3. [HTTP缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)
4. [Cookie 的 SameSite 属性](https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)
5. []()