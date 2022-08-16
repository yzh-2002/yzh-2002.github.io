---
title: 记录自己Blog的折腾历史
date: 2022-08-14 08:47:39
updated: 2022-08-14 08:47:39
tags:
  - Blog
categories:
  - 个人成长
comments: true
# password: yzh20020717
---

简单记录一下自己这一年期间博客的折腾历史（无知识分享，仅个人吐槽）

<!--more-->

## 2021-summer
之前一直在本地记录学习笔记，应该是受学长的影响（也可能是见程序员都有一个属于自己的博客），所以也萌生了搭建自己博客的想法。

于是就在2021年暑假在腾讯云购置了自己的第一个服务器（120元/年），使用宝塔工具部署（当时知识水平不够，宝塔可以说是最简单的部署工具了吧，主要是可以一键安装服务器上的各种所需依赖），使用typecho搭建自己的博客（也是简单，不像hexo一样要自己各种折腾），然后还买了一个yzh1sblog.xyz的域名，本来的意思是`yzh's blog`，把`'`当作`1`，结果被学长以为是`yzh is sb`，唉，当时还是草率了。

然后就开始写博客，中间写了挺多东西的，后来又删了很多东西，虽说一开始仅仅只是抱着把学习笔记从本地搬到博客的想法，但是因为玩博客后遇到了很多博主，感觉自己的文章和他们相比显得像小孩过家家，还有就是很多知识随着不断学习，也显得太入门了，分享出去多少有点不好意思（当时参加张老师的SDN挑战性课程，把使用packet搭建网络拓扑这种基础操作也记录了一下...），也正是因为这种心态，越来越不好意思写博客了。
## 2022-spring

就这样过了半年，来到2022年春天，当时回顾过去半年的博客历史，感觉自己搭建的博客访问量太低，文章最多阅读数貌似才200多，更关键的是没什么人评论，这就令我很苦恼，因为相比于单纯的知识分享，我更希望有人能在评论区和我交流看法，这样不仅能及时发现自己的一些误解和不足，同时也能扩展自己的知识面，抱着这样的心态，我进了掘金的坑

![掘金主页](https://pic.rmb.bdstatic.com/bjh/5595a5b0e1b6c5fa5193c14302220db8.png)

在社区内分享文章就不同于在自己的博客上写文章了，不能随随便便就把学习笔记给放上去，毕竟会有很多人看到自己的文章，也尝试写了一些，但是后来又放弃了（一方面是因为总是对自己写的东西不满意，确实没什么自己的独到见解，到现在掘金的草稿箱内还有10篇文章左右不好意思发表...，另一方面就是上学期太懒了，森林，七日杀太香了，分享欲也没那么强了）

## 2022-summer

到了今年暑假，我又有了不同的想法，之前我认为博客是用来分享技术，自己在过去一年也确实陶醉于不断学习新技术带来的满足感，但是经过这一年，我也意识到自己的技术水平一般，深度不够，同时自己爱好较为匮乏，哪怕是打游戏，也没有打出个所以然来（暑假回老家了，看到舍友天天在寝室联机MC，学着建造各种生存机器，以及之前我想想就头疼的红石机关...）我意识到自己也应该多多培养自己的爱好，小时候和外公一起下象棋，浅尝辄止，到现在连中国人都知道的开局那几步都基本忘却了，玩MC，也就是挖挖矿，打打怪，甚至于连末影之地都没进去过，玩森林，当时也依赖于老司机的视频攻略，很少自己探索过...

于是我就打算再次搭建自己的博客，在社区我怎么好意思写这些话，但是在个人博客上面，就没有这个顾虑了（毕竟能看到的 ~~愿意看的~~ 基本都是比较熟悉的朋友 ~~无聊的人~~）

抱着白嫖的原则，我首先想到的是github pages，也是第一次接触DevOps的CI/CD，基于github自带的CI服务Actions编写了自己的第一个脚本

```yaml
name: GitHub Actions Build and Deploy Yzh2002's Blog
on: # push到main分支上触发工作流程，并将打包产物部署到gh-pages分支
  push: 
    branches: main 
    #详细语法见：https://docs.github.com/cn/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest #github actions运行的虚拟机环境（也可以使用自己的环境）
    steps:
    - name: Checkout #？？不是很明白？？？？
      uses: actions/checkout@v3

    - name: Install dependency 
      # install dependencies of hexo
      run: | 
        npm install hexo
        npm install
      # with:
        # node-version: "16"

    - name: Build
      run: npx hexo generate

    - name: Deploy
      uses: JamesIves/github-pages-deploy-action@releases/v3
      with:
        ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        BRANCH: gh-pages
        FOLDER: public

```

## To be continued

零零散散写了这么多，愿意看到这真的是十分感谢！！