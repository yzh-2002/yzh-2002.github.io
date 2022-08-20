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

# Typecho
> 之前一直在本地记笔记，应该是受学长的影响（也可能是感觉程序员应该有一个自己的博客），所以萌生了搭建个人博客的想法。

2021年暑假在腾讯云购置了自己的第一个服务器（120元/年），使用宝塔工具部署（当时知识水平不够，宝塔一键配置依赖环境对小白真的很友好...），用typecho搭建自己的博客（自带后台管理，相关配置可以直接在后台进行，不用自己改yaml文件），最后买了一个yzh1sblog.xyz的域名 ~~本来的意思是`yzh's blog`，把`'`当作`1`，结果被学长以为是`yzh is sb`~~

可能是第一次拥有个人博客，心情比较激动，那段时间挺高产的（~~虽然都是水~~），21年暑假基本都在参加CNSS的夏令营，把夏令营中题目的wp都放到博客上（~~后来还被当时的CNSS负责人发现了，提醒我这样不好....~~）

慢慢的，因为自己开始写博客，也就会在网上寻找其他人的博客，越看越觉得自己写的全是水，一定程度上打消了我写博客的热情，到后面基本不敢再写博客了....
# XiTuJueJin
> 到了22年春季开学，因为计划着22年暑假找个实习，所以打算巩固自己的开发知识，并把复习过程中收获的知识总结一下放到博客上，但是却没有扔到之前搭建的个人博客上

我当时这样想的，既然要放到网上，当然希望能有更多人看到，然后能对我写的东西进行指点以促进自己进步，但是个人博客的浏览量实在不高，平均每篇文章阅读量只有100左右，
更是基本没有评论，这就违背了我放到网上的初衷，于是决定转战社区，遂进了掘金的坑。

![掘金主页](https://pic.rmb.bdstatic.com/bjh/5595a5b0e1b6c5fa5193c14302220db8.png)

但是有一说一，没发几篇，好像就五篇，最近的一篇已经三个月之前了，至于原因呢？很简单，上学期专业课好多，自己又参加了好几个比赛（谈到比赛就有点难受了，两个省三，一个省一进国赛，但于自己而言没什么实质性的提升，反而浪费了很多技术沉淀的时间），同时这学期游戏也没少打，森林，七日杀，累计时长超过120小时，还有后来的恐鬼症，（王者，金铲铲这些大大小小更是不用说了）,就这样压根没想起来写博客的事情....

# Hexo(gituhb pages)
> 就这样到了今年暑假，我又有了不同的想法 ~~自己确实想法多变，比如关于是否读研的问题我这两年已经变了三次了，大一一门心思想保研，给均分卷到90，大二不想读研想直接工作恰米钱，均分下滑到88.6，结果我现在感觉自己技术不行又想读研了（但是已经处于保研线边缘了...）~~ (இдஇ; )

什么不同的想法呢：

之前想的是博客写出来应该给别人看，然后互相交流学习，现在呢，感觉博客更像是自己在互联网上一处仅属于自己的净土，自己写点心得或学习笔记放到这上面，更多是自己内心的满足（~~或者说分享欲的另一种表现形式？？~~）不过能看到我博客的大多应该都是我的朋友吧（~~也可能是无聊的人~~）(ฅ•﹏•ฅ)....

也就是这样又决定搭建自己的博客了，但是不准备为此特意买个vps用来部署，抱着能白嫖就白嫖的原则，就暂时扔到Github Pages上了

借此机会，也了解一下CI/CD相关知识，本来是打算用Travis CI的，但是搞了半天一直没办法使用免费版的，遂决定使用Github自带的Action，写了自己的第一个CI脚本：

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

hexo源码文件放在main分支下，打包文件部署在gh-pages分支下，看到小火箭的那一刻还是挺激动的....

![gh-pages部署成功](https://p.qlogo.cn/hy_personal/3e28f14aa0516842e32b495dab92b6a70dc687e59076828827b37a176dd393e4/0.png)

# Hexo(netlify)
> 听说Netlify静态资源托管平台挺不错的，就又把博客扔到这上面了，换了个域名，配置了HTTPS访问....

netlify有自己的workflow，它监听hexo博客所在的github仓库，每当仓库发生改变，就会触发workflow进行重新打包部署，很是方便。

这次学聪明了，买了个看起来还是蛮正经的一个域名`yzh2002.cn`

![netlify部署](https://p.qlogo.cn/hy_personal/3e28f14aa0516842e32b495dab92b6a729fcb20f610258918e019a4c40a0d004/0.png)

# 鸣谢
> 该个人博客文章的所有图片均使用[映画图床](imgs.top)

（~~本来想自己使用github做图床呢，但是感觉好麻烦~~....）