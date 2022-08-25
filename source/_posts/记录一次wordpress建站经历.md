---
title: 记录一次wordpress建站经历
comments: true
date: 2022-08-17 16:42:36
tags:
    - docker
    - nginx
    - linux
categories:
    - develop
---
又是新学期，为了便于工作室招新决定临时搭建招新网站，本来是想手撸的，但是8月上旬开发组都有私事给耽搁了，下旬又有其他事情，遂决定基于wordpress搭建个网站先用着，折腾了两天，也接触了许多之前不知道的知识，特此记录（~~每水一篇博客都能带来极大的满足~~）....
<!--more-->

# 初遇 Docker
![为什么用docker？？](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828ede812c43ca3df848ad3ff84f9b337d9/0.png)

上一篇博客提过，21年暑假搭建个人博客时，由于对linux不熟悉，所以就使用宝塔面板一键安装LNMP环境，有一说一，确实好用，对于小白特别友好。

但一方面师兄说宝塔风评不好（~~虽然也没指出到底哪不好~~），另一方面想着作为科班学生，还是要乐于学习新事物（~~对我来说~~），乐于折腾新东西的，于是就尝试采用docker部署

## Windows下使用Docker
> 为了便于更好的探索docker，所以想在本机上用一用（电脑性能不好，虚拟机总是感觉卡卡的，也不愿重装linux系统~~windows还要用来打游戏呢~~，更没钱重新买一台linux的电脑~~vps也买不起，暑假没生活费好惨~~）...

[指导教程](https://dockerdocs.cn/docker-for-windows/install/index.html)，下面记录一下我遇到的关键问题，以及大概流程

- windows系统需升级到专业版（一般来说都是家庭版的，升级之后需要重新激活....）
- 开启Hyper-v服务（前提是升级到windows专业版）
    - 这里遇到一个困扰我近半个小时的问题：开启该服务重启电脑总是在最后提示*无法实现相关功能，正在撤销更新*
    - 解决办法：[修复windows10](https://www.microsoft.com/en-us/software-download/windows10)（过程大概需要2~3小时）
- 安装wsl2
    - [安装过程](https://docs.microsoft.com/zh-cn/windows/wsl/install)
    - 验证是否安装成功：
    - ![wsl2是否安装成功](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828f61d88719a65cf83a94dceebe0877a6e/0.png)
- 安装Docker Desktop
    - 前面都可行的话，这一步我没有遇到问题：
    - ![Docker安装成功的话](https://p.qlogo.cn/hy_personal/3e28f14aa0516842b97c6e325e363a68efb4c5a3656e44b80af71b1e13fb590a/0.pnghttps://p.qlogo.cn/hy_personal/3e28f14aa0516842b97c6e325e363a68efb4c5a3656e44b80af71b1e13fb590a/0.png)

## Docker知识补充
> docker的出现解决了软件开发部署过程中的环境一致性问题（docker的应用场景应该不止这些，但是笔者目前接触有限，仅从这方面谈一谈...）

### 为什么使用Docker ？
软件的运行环境一般有两方面：
- 操作系统内核（Kernel）提供
- 各种运行库（Runtime Library）提供
    - 关于运行库，不同于前端开发时的各种第三方依赖包（比如：npm包，通过package-lock.json就能很好的统一管理），而是指nodejs等软件中脚本的运行时...


下面举几个例子进而说明docker的作用：

1. 软件开发时的系统是Ubuntu，但是生产环境的系统是CentOS，那么部署就可能出问题？（比如某个在Ubuntu运行正常的数据库在CentOS上运行报错）...
2. php开发的网站与java开发的网站依赖环境不同，将其部署于一个服务器上可能会造成冲突（比如两者使用的web server分别是IIS和Apache，那么就可能存在端口访问冲突）...

Docker是通过怎样的手段解决了上述问题呢？？

Docker利用了linux的namespace隔离技术为基础，通过**共享Linux内核**实现的

> 插一句题外话：linux和windows系统既支持X86，也支持ARM（当然不同架构下内核代码肯定有区别），而X86和ARM是CPU设计的不同 ~~操作系统该复习了...~~

无论是Ubuntu还是CentOS，都使用linux内核，区别仅在于添加了不同的工具软件（GUI，函数库，软件包管理工具(yum/apt-get)等...）,Docker技术主要使用了两个内核模块：

1. [namespace](https://en.wikipedia.org/wiki/Linux_namespaces)
    - 容器隔离：PID Namespace使得容器中的进程无法感知宿主机以及其他容器中的进程。
2. [Cgroups](https://zh.wikipedia.org/zh-cn/Cgroups)
    - 容器资源控制：限制容器所使用的内存大小或者CPU个数

因此在CentOS上运行基于Ubuntu镜像的容器时, 容器使用了**CentOS主机的内核以及Ubuntu镜像**, Ubuntu镜像中安装了Ubuntu的各种软件。

### Docker 基本概念
Docker最重要的两个概念：镜像（Image）和容器（Container），其中Image是多层存储，每一层是在前一层的基础上进行的修改；而容器同样也是多层存储，是在以镜像为基础层，**在其基础上加一层作为容器运行时的存储层。**

以nginx为例：
```shell
docker run --name NginxTest -d -p 80:80 nginx
# 本地访问localhost就可以看到Nginx默认的欢迎页面
docker exec -it NginxTest bash
# 进入NginxTest容器，并开启一个shell
echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
exit
# 退出容器再访问localhost发现内容被更改

docker diff
#查看容器内文件哪些被修改
```

上述的更改均保存在容器运行时的存储层内（在内存中，不能持久化存储），因此如果直接结束容器运行，这些更改就会消失，想要将这些更改保存到镜像里，可以使用`docker commit`命令（但是慎用，最好不要用...）

每当一个docker容器运行时，会生成一个sha-256值（前6位就是container ID），然后在宿主机的/var/lib/docker目录下的container文件夹下会生成一个与container ID相同名字的文件夹，此文件夹就是该容器运行的数据所在

![docker容器根目录](https://p.qlogo.cn/hy_personal/3e28f14aa051684281e9349d20d9f45552eba43a556e5f1dc37cce007d01abe7/0.png)

可以看到熟悉的目录结构

---

下面讲讲数据卷？
> (个人理解)一方面是实现数据的持久性存储（~~便于其他容器共享和重用这一点由于使用经验较少还没感受到~~），另一方面就是便于运维人员操作容器内的文件，操作数据卷等价于操作容器内被挂载的文件（不需要进入容器内部更改数据文件了）

常见的是两种方式：

volumes由docker创建，非Docker应用程序不能改动这一位置的数据。
```shell
docker volume create XXXX
# 创建一个名为XXXX的数据卷，存储在宿主机的/var/lib/docker/volumes目录下

# 将该数据卷挂载到某一容器的相应目录
docker run -d -P \
--name VolumeTest1 \
# -v XXXX:/usr/share/nginx/index.html \
--mount source=XXX,target=/usr/share/nginx/index.html \
nginx

```
volumes就是宿主机的某个文件夹（或者新建的文件夹），手动挂载
```shell
docker run -d -P \
--name VolumeTest2 \
# -v /src/webapp:/usr/share/nginx/html \
--mount type=bind,source=/src/webapp,target=/usr/share/nginx/html \
nginx
```
### Docker 容器网络
> 自己尝试部署WordPress时，容器互联还在使用`--link`命令，师兄提醒我这已经过时了，于是就学习了通过docker的容器网络来连接多个容器....

Docker是通过Docker Network来实现容器之间互相访问的，它是一个虚拟网，可以通过bridge组建或overlay实现，通过`docker network ls`可以查看宿主机当前运行的docker网络
![docker network](https://p.qlogo.cn/hy_personal/3e28f14aa05168428b211a36cb44028539af13ac0bb3d31fe6ae22f4d9b27120/0.png)

如图所示，有三大网络模式，分别是bridge，host和none，除此之外还有一个自定义的网络wp，下面主要介绍一下bridge模式（默认模式）

在宿主机上执行`ip address`
![ip address](https://p.qlogo.cn/hy_personal/3e28f14aa05168428b211a36cb4402852092e5429ca85182a6d6bb9bd0ecf726/0.png)

可以看到docker0的网络，默认通过该网络实现宿主机与docker容器之间的网络通信，结构图如下：
![Docker Network结构图](https://p.qlogo.cn/hy_personal/3e28f14aa05168428b211a36cb4402852d89dca432dda835e532e642bc3cac35/0.png)


进入nginx容器，查看hosts文件，可以看到该服务的内网IP，在宿主机上测试，可以通信
![ping](https://p.qlogo.cn/hy_personal/3e28f14aa05168428b211a36cb4402858fcdb44a4fc7421d41dcf9276826ff92/0.png)

但是值得注意的是，**宿主机的网络上一个名为`br-66d0daa...`的网络**，是我们自定义的bridge类型的网络，我们在宿主机上运行的docker服务会连接到该网桥上，看上图下面的几个veth对也可看出...

---

下面讲一下docker 容器之间的通信，从上面的结构图可知，容器之间可以通过docker0这个网桥进行通信，但是只能通过IP进行通信，不能通过服务名称进行通信，docker容器的IP是动态分配的，如果一个容器重新启动可能就会分配不同的ip，那么就很有可能出现问题...

如何解决这个问题呢？

1. 通过 --link指定
    - 不推荐使用，[原因](https://dockerdocs.cn/network/links/)
2. 修改容器内`/etc/hosts`文件
    - 不推荐使用，[原因](https://www.cnblogs.com/YatHo/p/7866018.html)
3. 使用用户自定义网桥（而不是docker0）
    - Docker文档目前也支持这种方式实现容器互联
 
相关网桥写文章之前已经搭建完毕，这里查看一下其信息：

```shell
docker network inspect wp #wp为自定义网桥名称
```
![docker containers IP](https://p.qlogo.cn/hy_personal/3e28f14aa0516842533164f8e26a595961ea8e77e9502daad85cb5088470cb40/0.png)

进入wordpress容器测试能否ping通nginx：
![](https://p.qlogo.cn/hy_personal/3e28f14aa0516842533164f8e26a59599ef1540126622a98932a5d274f0e8dd5/0.png)


## 部署WordPress
> 上面补充的docker知识已经足够完成搭建任务了，下面给出部署过程

1. 拉取镜像

```shell
docker pull wordpress
docker pull mysql
```
2. 创建自定义网桥
```shell
docker network create -d bridge wp
```
3. 启动wordpress容器
```shell
docker run --name wordpress \
--network wp \ #连接到自定义网桥
--mount source="$PWD/wordpress",target=/var/www/html \
-e WORDPRESS_DB_PASSWORD=XXXX \
-p 8080:80 \
-d \
wordpress
```
4. 启动mysql容器
```shell
docker run --name mysql \
--network wp \
--mount source="$PWD/mysql",target="/var/lib/mysql" \
-e MYSQL_DATABASE=wordpressDB \
-e MYSQL_ROOT_PASSWORD=XXXX \
-p 3306:3306 \
-d \
mysql
```
至此访问`[ip]:[port]`即可进入wordpress安装设置页...

> 补充一下：可能会有人困惑于建立数据卷及映射时容器内目录怎么来的(~~没错是本人~~)？询问师兄后得到回复：去docker hub的相应镜像仓库下面看文档....

# 再遇 Nginx

![接着忙喽...](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828d049fded43e92ff606ccb734c4897e66/0.png)

学习半天docker，部署好之后，又被师兄发现一大堆问题，想要解决这些问题，就要使用另一个工具----nginx（~~之前为了解决跨域问题使用nginx做了反向代理，但还没有系统学习过...~~）

## Nginx前置知识
上面提到在服务器部署项目时通常需要LNMP环境，也就是linux+nginx+mysql+php，有时是LAMP，也就是nginx->apache，这里的nginx和apache都是web server（也有区分，比如前者是web服务器，后者是应用服务器）


> nginx是web服务器，我们平时在各大厂商购买的vps也是服务器，这两个服务器有什么区别呢？（下面说一下个人理解）

vps（Vitural private server）其实就是一台电脑（各厂商基于虚拟化技术虚拟出来的电脑），而nginx可以看作在这台电脑上运行的服务，帮助我们实现网络连接，路径寻找和会话管理等功能，所以nginx才是真正意义上为客户端提供服务的设备（当然其提供的资源存储在vps上...）

## Nginx 配置
> Nginx的配置是按照配置块来组织的，最外一层是mainn控制块，它是一个全局配置的区域，main配置块内有events(配置工作模式...)和http配置块，http内又有upstream(配置负载均衡)和server（配置虚拟主机...）配置块，server里面有location(URL匹配块...)等配置块...

下面主要讲一下http模块的配置：

### Server配置快
> server 配置块是用来配置虚拟主机的信息的，可以在这里配置虚拟主机监听的端口，域名，URL 重定向等。

```nginx
server {
    listen 8080;
    server_name localhost 192.168.12.10 www.nginx.learning.com;
    root /var/www;
    index index.php index.html;
    charset utf-8;
    access_log  usr/local/var/log/host.access.log  main;
    error_log  usr/local/var/log/host.error.log  error;
}
```

1. listen:设置虚拟主机监听的端口
2. server_name:设置虚拟主机的域名，中间使用空格隔开
3. root:设置虚拟主机目录
4. index:访问路径无指定文件时默认访问文件
5. charset:指定特定的字符集到响应头部"Content-Type" 首部。

### locatiion配置块
> 针对指定的URL进行配置
```nginx
server {
    location / {
        root   /var/www/;
        index  index.php index.html index.htm;
    }
}
```

root和index的含义同server配置块，两者的区别在于location仅对其匹配的URL起效，server对所有URL起效。

## Nginx 配置脚本
> 下面给出配置脚本并进行相关说明

```nginx
server {
    #监听443端口
    listen 443 ssl;
    #对应的域名
    server_name synx.tech www.synx.tech;
    # 配置ssl证书
    ssl_certificate /etc/sslcert/synx.tech.pem;
    ssl_certificate_key /etc/sslcert/synx.tech.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers on;
    
    #反向代理：访问synx.tech =>访问wordpress:80 
    location / {
	  proxy_set_header Host $host;
	  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_pass http://wordpress:80;
   }
}

# 通过80端口访问时相关设置
server{ 
   listen 80;
   server_name synx.tech www.synx.tech;
   #把http的域名请求转成https
   rewrite ^(.*)$ https://$host$1; 
   #将所有HTTP请求通过rewrite指令重定向到HTTPS。

   location / {
      proxy_set_header Host $host;
	  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_pass http://wordpress:80;
   }
}

# 通过ip地址访问时直接返回444错误
server {
    listen      80 default_server;
    listen      [::]:80 default_server;
    server_name "";
    return      444;
}

server {
    listen      443 default_server;
    listen      [::]:443 default_server;
    server_name "";
    return      444;
    ssl_certificate /etc/sslcert/synx.tech.pem;
    ssl_certificate_key /etc/sslcert/synx.tech.key;
}
```


# 参考链接

1. [windows开启Hyper-v服务失败](https://answers.microsoft.com/zh-hans/windows/forum/all/win10-%E5%BC%80%E5%90%AFhyper-v/238eeaa4-9fcc-432d-8d4b-4e83614f5f13)
2. [Docker如何能在CentOS下运行Ubuntu容器](https://www.cnblogs.com/lxgbky/p/12973931.html)
3. [docker容器技术基础之联合文件系统OverlayFS](https://zhuanlan.zhihu.com/p/392508816)
4. [docker之容器互联的作用](https://blog.csdn.net/vchy_zhao/article/details/70239605)
5. [Nginx入门指南](https://juejin.cn/post/6844904129987526663)

