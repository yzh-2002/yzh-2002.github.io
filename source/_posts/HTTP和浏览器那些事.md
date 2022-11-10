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

#### session

不知有没有人关注到了上面设置cookie时的`sessionToken`，它的值是一个sessionId，那么session和cookie的关系是什么？

其实两者都是为了实现用户的身份认证，只不过session是在服务器生成并保存的，cookie是在浏览器中保存的，我们在访问网站时，可以通过和服务器协商产生一个cookie（但是该cookie更多的作用是用于记录信息，比如记录用户购物车的信息等等，都是明文的，特别是如果用户登录认证时采用cookie明文传输很危险，就算是购物车信息等也会暴漏个人隐私），基于此，诞生了session，也即将**这些信息统统保存在服务端**，服务端通过cookie只记录了一个sessionId（**这种方式离不开cookie的支持**）（通常存储在redis数据库中...），下次用户传输时只有sessionId，然后服务端这边解析出相应的信息，也可以个性化的返回内容...

这样就一定程度的保证了安全性，可以避免不法分子拿到cookie获取个人隐私等等

#### JSON Web Tokens

> cookie的替代方案，可以用来替代session cookie，但是不同于cookie自动附加到每个HTTP请求的方式，JWTs必须被web应用明确指定附加到哪个HTTP请求上....

### HTTP缓存

> HTTP缓存分为私有缓存和共享缓存，私有缓存是绑定到特定客户端的缓存，通常是浏览器缓存。共享缓存位于客户端和服务器之间，通常需要依托于Web缓存服务器。

缓存过程分析：

![缓存过程](https://p.qlogo.cn/hy_personal/3e28f14aa0516842e3a9bdd65a95b6961c9c88fc03a1b1501e460918dc14c264/0.png)

由上图可知：

1. 浏览器每次请求时，都会现在浏览器缓存中查找该请求的结果以及缓存标识
2. 浏览器每次拿到返回的请求时，都会将该结果和缓存标识存入浏览器缓存中

以上两点是浏览器缓存机制的关键，它确保了每个请求的缓存存入和读取，下面说一下浏览器缓存的使用规则：根据是否需要向服务器重新发起HTTP请求将缓存过程分为两个部分，分别是强缓存和协商缓存。

#### 强缓存

> 所谓强缓存，不会向服务器发起请求，直接从缓存中读取资源。可以在Chrome的Network中看到**状态码为200，并且显示(from disk cache)**，可见下图;

![](https://p.qlogo.cn/hy_personal/3e28f14aa0516842a04ef48ec3f1e01c133f473a3e08549512b791d265332951/0.png)

强缓存可以通过设置两种HTTP Header实现：`Expires`和`Cache-Control`

**Expires**

`Expires`是**服务器响应消息头字段**。缓存到期时间，用来指定资源到期时间，也即`Expires =max-age+请求时间`，在响应http请求时告诉浏览器在过期时间前浏览器可以直接从浏览器缓存获取数据，而无需再次请求。

**Cache-Control**

![](https://p.qlogo.cn/hy_personal/3e28f14aa0516842de586b88f69bd73313540114f6351d1eb07bea2efb4c6132/0.png)

两者区别在于：Expires 是 http1.0 的产物，Cache-Control 是 http1.1 的产物，两者同时存在的话，Cache-Control 优先级高于 Expires。

强缓存判断缓存是否超过某个时间或者某个时间段，而**不关心服务器端文件是否已经更新**，这可能会导致加载文件不是服务器端最新的内容（因此有时候需要刷新浏览器缓存就是这个道理），下面介绍一下协商缓存：

#### 协商缓存

> 所谓协商缓存，就是强制缓存失效后，浏览器携带缓存标识向服务器发起请求，由服务器根据缓存标识决定是否使用缓存的过程：

比如浏览器发起HTTP请求之后发现缓存资源已经过了时间段或者预定时间，就会携带该资源的缓存标识（具体是什么下面会介绍）向服务器发起HTTP请求，如果服务端的资源未更新，则返回304的状态码（不携带资源），然后浏览器再去浏览器缓存中获取缓存资源，同时还会更新缓存标识，如果服务端的资源更新，则返回请求结果，此时状态码为200，然后浏览器会将此结果和缓存标识存入浏览器缓存中。

协商缓存通过设置两种HTTP Header实现：Last-Modified和ETag（也就是上面提到的缓存标识）。

所谓ETag，响应头字段，用于标识请求资源的版本（通常需要后端通过相关算法生成，例如hash值或者MD5值），浏览器在向服务器发送请求时会带上`If-None-Match`字段， 来询问服务器该版本是否仍然可用。如果服务器发现该版本仍然是最新的， 就可以返回 304 状态码指示 UA 继续使用缓存。

与 Etag 类似，Last-Modified HTTP 响应头也用来标识资源的有效性。 不同的是**使用修改时间而不是实体标签**。对应的请求头字段为`If-Modified-Since`。

### HTTP2.0/3.0

> 上面讲的基本都是基于HTTP1.1版本的，下面看一下HTTP2.0和HTTP3.0有哪些不同？

HTTP1.1和HTTP2.0的最大的区别就是二进制框架层，前者把所有请求和响应作为纯文本，后者使用二进制框架层把所有消息封装为二进制，且仍然保持HTTP语法，消息的转换让HTTP2能够尝试HTTP1.1所不能的传输方式。

> 此处有必要说明一下二进制和纯文本之间的区别，两者其实并无本质区别，只是编码形式不同，文字背后还是0和1，只是采用一种编码方式（UTF-8,GBK....）使得人们能够看懂而已...

#### 队头阻塞问题

这里就不得不提一下HTTP1.1的流水线和队头阻塞问题了：HTTP1.1允许客户端通过同一连接发送多个请求，但是当一个队头的请求不能收到响应的资源时，他将会阻塞后面的请求，这就是队头阻塞问题，虽然添加并行的TCP连接（针对域名的，因此可以通过域名切片增加并行TCP连接数量加快请求资源的速度）能减轻这个问题，但是TCP连接数量是有限的，且每个新的连接需要额外的资源。

HTTP2如何解决这个问题的呢？

HTTP2的数据报分为**多个帧，并且给每个帧打上流的ID**去避免依次响应的问题，对方接收到帧之后根据ID拼接出流，这样就可以做到乱序响应从而避免请求时的队首阻塞问题（但需要注意的是：HTTP2只是解决了应用层面的队首阻塞，传输层的队首阻塞并没有解决，也即如果产生丢包现象，就需要等待重新发包，阻塞后续传输（TCP的滑动窗口只能增强抗干扰的能力，并没有根本解决这个问题。））

所谓HTTP2的多路复用，即通信双方都可以给对方发送二进制帧，这种二进制帧的双向传输的序列，也称之为流（stream），HTTP2用流在一个TCP连接上来进行多个数据帧的通信，称之为多路复用。

HTTP2还新增了服务端推送的能力，服务器已经不再是完全被动的接收数据，响应请求，他也能新建stream来给客户端发送消息，当TCP建立连接之后，比如浏览器请求一个HTML文件，服务器就可以在返回HTML文件的基础上，将HTML引用的其他资源文件一并返回给客户端，减少客户端的等待。

同时HTTP2还使用HPACK算法压缩首部内容（这对于携带cookie的大量HTTP请求来说还是很客观的性能优化....）

#### HTTP3.0

为了解决HTTP2中仍然存在的TCP队头阻塞问题，HTTP3不再基于TCP建立，而是基于Google提出的基于UDP实现的开源协议QUIC实现。

后续查阅更多资料后在进行补充....

## 浏览器相关

### 同源策略

> 浏览器安全的基石就是“同源政策”

所谓同源，指的是**协议，域名和端口**三者均相同。同源策略限制了不同源之间如何进行资源交互，是用于隔离潜在恶意文件的重要安全机制。如果没有同源策略，不同源的数据和资源（例如：cookie，DOM，localStorage等）就能相互随意访问，那就没有隐私和安全（cookie中保存着用户的私人信息，特别是很多cookie还和登录状态有关）可言。

随着互联网的发展，“同源政策”越来越严格，目前，如果非同源，以下三种行为受到限制：

1. cookie，localstorage无法读取
2. DOM无法获得
3. ajax请求不能发送

除此之外，其他的是不受同源策略限制的，比如我们开发网页时引入的cdn资源，img图片，script标签（这个也被用于jsonp的实现，见下文），

虽然限制很必要，但是有时候会导致一些合理的用途收到影响，因此，我们也需要知道如何规避这些限制。（这里主要说明如何规避第三种情况，可以说是最常见的情况，也是最普遍的需求）

### 跨域问题解决方案

#### nginx反向代理

#### JSONP

> jsonp是服务器与客户端跨源通信的常用方法，最大的特点就是简单适用，老式浏览器全部支持，**服务器改造非常小**

其实现就是利用`script`标签不受同源策略限制的特点，通过动态插入`script`标签，这个js文件载入成功之后会执行我们在url参数中指定的函数，并把我们需要的json数据返回。

```javascript
function addScriptTag(src) {
  var script = document.createElement('script');
  script.setAttribute("type","text/javascript");
  script.src = src;
  document.body.appendChild(script);
}

window.onload = function () {
  addScriptTag('http://example.com/ip?callback=test&data=ip');
}

function test(ip) {
  console.log('Your public IP address is: ' + ip);
};
```

上面通过`script`标签，我们向`http://example.com/ip?callback=test&data=ip`发起了请求，并附带上了callback和data两个参数，由于被`script`包裹，所以最终返回值是一段JavaScript代码，故后端就可以返回`test(ip)`，然后前端就会尝试执行这个内容。

于是我们就知道了，callback是指定前端需要运行的函数，而data则实现了跨域获取后端数据。

但是jsonp存在很多安全问题：最明显的就是后台并没有做身份认证（产生疑问：通过script发出的请求会携带cookie吗？），导致任何前台都可以发送jsonp请求，若请求中存在敏感信息则会发生信息泄漏。防御方法有：referer过滤或者增加一个随机token（类似于CSRF的防御方法，后续单独介绍时再细讲）


#### CORS

> CORS是跨域资源分享的缩写，是W3C标准，是跨域ajax请求的根本解决办法，相比于jsonp只能发GET请求，cors允许任何类型的请求。

cors需要浏览器和服务器同时支持，目前，所有浏览器均支持该功能，整个cors通信过程，都是浏览器自动完成的，对于开发者而言，cors通信与同源的ajax通信没有差别，浏览器一旦发现ajax请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，因此，实现cors的关键是服务器，只要服务器实现了cors接口，就可以跨源通信。



### DOM事件流

原生DOM事件的绑定分为两种方式：

1. element.onclick =function(){};
  - 缺点：一个元素不能同时绑定多个事件（后面的会覆盖前面的...）
2. element.addEventListener('clcik',function(){},flase);
  - 解决了第一种不能同时绑定多个的问题
  - 第三个参数表明是否`事件捕获`阶段调用事件处理程序（详情见下文）

#### DOM事件模型

当一个事件发生在具有父元素的元素上，现代浏览器运行两个不同的阶段：事件捕获和事件冒泡

在捕获阶段：浏览器检查元素的最外层祖先`<html>`，是否在捕获阶段中注册了一个`onclick`事件处理程序，如果是，则运行它。然后再移动到`<html>`中单机元素的下一个祖先元素，并执行相同的操作。依次类推，直到到达实际点击的元素。

在冒泡阶段：恰恰相反，浏览器检查实际点击的元素是否在冒泡阶段中注册了一个`onclick`事件处理程序，如果是，则运行它，然后移动到其下一个直接的祖先元素，直到`<html>`

现代浏览器中，**默认情况，所有事件处理程序都在冒泡阶段被调用**，如何阻止因为事件冒泡而使得父元素的事件处理程序被触发呢？使用`e.stopPropagation`。

当然我们也可以利用冒泡机制进行一些优化，例如**事件委托**：将事件挂载到父组件上，当点击子组件时，会因为冒泡而触发父组件的事件函数，从而使得我们不用给大量的子元素添加事件处理函数。


## TO be continued


## 参考链接

1. [计算机网络自顶向下方法]()
2. [HTTP之cookie --wiki](https://en.wikipedia.org/wiki/HTTP_cookie)
3. [HTTP缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)
4. [Cookie 的 SameSite 属性](https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)
5. [深入理解浏览器的缓存机制](https://zhuanlan.zhihu.com/p/99340110)
6. [浏览器同源策略 --阮一峰](https://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)
7. [跨域资源共享 CORS 详解 --阮一峰](https://www.ruanyifeng.com/blog/2016/04/cors.html)
8. [事件介绍](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Building_blocks/Events)
9. [详细分析http2 和http1.1 区别](https://www.jianshu.com/p/63fe1bf5d445)