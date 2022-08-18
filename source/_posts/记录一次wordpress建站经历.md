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
新学期到了，为了工作室招新决定临时搭建一个招新网站，本来是想手撸的，但是8月上旬开发组都有私事给耽搁了，下旬又有其他事情，遂决定基于wordpress搭建个网站先用着，也就有了这篇文章（~~又水一篇真爽~~）....
<!--more-->

## docker ??
![为什么用docker？？](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828ede812c43ca3df848ad3ff84f9b337d9/0.png)

上一篇博客提过，21年暑假搭建个人博客时，由于对于linux不是很熟悉，所以就使用宝塔面板一键安装LNMP环境，有一说一，确实好用，对于小白特别友好。

但一方面师兄说宝塔风评不好（虽然也没指出到底哪不好），另一方面想着身为科班学生，还是要学会折腾一些东西的，于是就采用docker部署了（其实docker部署相比于自己搞NMP环境也很方便了，但是在此之前完全没接触过docker，因此还是费了点时间了解了一下...）

### docker in windows
> 电脑性能不好，虚拟机用起来总是感觉卡卡的，也不愿重装linux系统（~~windows还要用来打游戏呢~~），更没钱重新买一台linux的电脑，于是就想着在windows系统上面操作docker了

怎么操作网上很多指导教程，这里主要记录一下我遇到的关键问题，以及大概流程

- windows系统需升级到专业版（一般来说都是家庭版的，但是升级之后就需要重新激活了....）
- 需要开启Hyper-v服务（只有专业版windows才有该服务）
    - 这里遇到一个问题：开启该服务重新电脑总是在最后提示：无法实现相关功能，正在撤销更新（大概）
    - 解决办法：[修复windows10](https://www.microsoft.com/en-us/software-download/windows10)，过程大概需要2~3小时
- 安装wsl2
    - 具体安装过程网上很多，最后输入`wsl -l -v`
    - ![wsl2是否安装成功](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828f61d88719a65cf83a94dceebe0877a6e/0.png)
- 安装Docker Desktop
    - 前面都ok的话，这里基本没有什么问题...

### use docker
> 目前在本地安装docker还没干什么事情，只是自己写了几个demo练习一哈，下面就直接如何在服务器使用docker部署wordpress了

- 拉取镜像
    ```shell
    docker pull wordpress
    docker pull mysql
    ```
- 新建并启动mysql容器
    ```shell
    docker container run \
    - d \ #后台运行
    --rm \ #停止运行后，自动删除容器文件
    --name wordpressdb \ #容器命名
    --env MYSQL_ROOT_PASSWORD=123456 \ #给容器进程传递一个环境变量
    --env MYSQL_DATABASE=wordpress \
    mysql
    ```
- 新建并启动wordpress容器
    ```shell
    docker container run \
    -d \
    -p 8080:80 \ #端口映射
    --rm \
    --name wordpress \
    --env WORDPRESS_DB_PASSWORD=123456 \
    --link wordpressdb:mysql \ #连接数据库（师兄说这种写法已经过时，现在都是用网桥和别名，这个找时间学习学习）
    --volume "$PWD/wordpress":/var/www/html \ #存储卷映射，更改wordpress下的文件等价于修改/var/www/html下的文件
    wordpress
    ```
- 修改wordpress/wp-config.php
    - 使用vim修改
    - 默认没有修改权限，需要手动添加
        ```shell
        sudo chmod a+w wordpress/wp-config.php
        ```
至此，访问ip:8080就可以进入wordpress站点的设置页面了...

## nginx ??
![接着忙喽...](https://p.qlogo.cn/hy_personal/3e28f14aa051684246f1880463f96828d049fded43e92ff606ccb734c4897e66/0.png)

忙活半天部署好之后，又被师兄发现一大堆问题，想要解决这些问题，就要使用另一个工具--nginx（~~之前为了解决跨域问题使用nginx做了反向代理，但没有系统学习过...~~）

## to be contniued 

先去吃饭，回头再补充....
