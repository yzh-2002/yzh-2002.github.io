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

## 初遇 Docker
![为什么用docker？？](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828ede812c43ca3df848ad3ff84f9b337d9/0.png)

上一篇博客提过，21年暑假搭建个人博客时，由于对linux不熟悉，所以就使用宝塔面板一键安装LNMP环境，有一说一，确实好用，对于小白特别友好。

但一方面师兄说宝塔风评不好（~~虽然也没指出到底哪不好~~），另一方面想着作为科班学生，还是要乐于学习新事物（~~对我来说~~），乐于折腾新东西的，于是就尝试采用docker部署

### Windows下使用Docker
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

### Docker知识补充
> docker的出现解决了软件开发部署过程中的环境一致性问题（docker的应用场景应该不止这些，但是笔者目前接触有限，仅从这方面谈一谈...）

#### 为什么使用Docker ？
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

#### Docker 基本概念
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
--mount type=bind,source=/src/webapp,target=/usr/share、nginx/html \
nginx
```
---
> 自己尝试部署WordPress时，容器互联还在使用`--link`命令，师兄提醒我这已经过时了，于是就学习了通过自定义的docker网络来连接多个容器....

先说一下传统的通过`--link`连接的方式：
```shell
# 启动mysql容器
docker run --name mysqlTest -d mysql
# 启动wordpress并连接mysql容器
docker run --name wordpressTest \
--link mysqlTest:mysql \
-d 
wordpress
# 怎么确定建立连接了呢？

```


### 部署WordPress


## 再遇 Nginx
![接着忙喽...](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828d049fded43e92ff606ccb734c4897e66/0.png)

学习半天docker，部署好之后，又被师兄发现一大堆问题，想要解决这些问题，就要使用另一个工具----nginx（~~之前为了解决跨域问题使用nginx做了反向代理，但还没有系统学习过...~~）

### Nginx前置知识
上面提到在服务器部署项目时通常需要LNMP环境，也就是linux+nginx+mysql+php，有时是LAMP，也就是nginx->apache，这里的nginx和apache都是web server（也有区分，比如前者是web服务器，后者是应用服务器）

```text
nginx是web服务器，我们平时在各大厂商购买的vps也是服务器，这两个服务器有什么区别呢？（下面说一下个人理解）

vps（Vitural private server）其实就是一台电脑（各厂商基于虚拟化技术虚拟出来的电脑），而nginx可以看作在这台电脑上运行的服务，帮助我们实现网络连接，路径寻找和会话管理等功能，所以nginx才是真正意义上为客户端提供服务的设备（当然其提供的资源存储在vps上...）
```

### Nginx 配置






## 参考链接

1. [windows开启Hyper-v服务失败](https://answers.microsoft.com/zh-hans/windows/forum/all/win10-%E5%BC%80%E5%90%AFhyper-v/238eeaa4-9fcc-432d-8d4b-4e83614f5f13)
2. [Docker如何能在CentOS下运行Ubuntu容器](https://www.cnblogs.com/lxgbky/p/12973931.html)
3. [docker容器技术基础之联合文件系统OverlayFS](https://zhuanlan.zhihu.com/p/392508816)
4. [docker之容器互联的作用](https://blog.csdn.net/vchy_zhao/article/details/70239605)
5. []()

