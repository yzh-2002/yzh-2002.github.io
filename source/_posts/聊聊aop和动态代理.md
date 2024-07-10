---
title: 聊聊aop和动态代理
mathjax: true
comments: true
date: 2024-07-10 13:12:02
tags:
categories:
    - java
---

AOP，Aspect Oriented Programming，面向切面编程。

名字很晦涩难懂，实际是面向特定方法进行编程，可以**无侵入**的为指定方法添加一些功能。

动态代理是AOP最主流的实现方法，下面着重讲一下。

<!--more-->

## AOP
> 前提：项目引入aop的依赖

应用场景：

1. 记录操作日志
2. 权限控制
3. 事务管理
4. ... 

```java
@Component
@Aspect
public class XxxAspect {
    @Around("...") //切入点表达式，指定哪些方法需要增强
    public Object xxxx(ProceedingJoinPoint proceedingJoinPoint) {
        // 指定方法运行前执行内容
        // TODO：code
        Object object =proceedingJoinPoint.proceed(); //调用原始方法运行
        // 指定方法运行后执行内容
        // TODO: code
        return object;
    }
}
```

AOP的核心概念：

1. 连接点（JoinPoint）：可以被AOP控制的方法
2. 通知（Advice）：AOP增强的重复逻辑（共性功能）
3. 切入点（PointCut）：？
4. 切面（Aspect）：
5. 目标对象（Target）：

### 动态代理

所谓动态代理，即在程序运行期间，创建目标对象的代理对象，并对目标对象中的方法进行功能性增强的一种技术。

基于动态代理，我们就可以在不修改方法源代码的情况下，增强被代理对象方法的功能（和上文说的AOP的用法一摸一样）。

```java
// 
public interface ProxyMethod {
    public abstract void test();
}

// 被代理对象
public class Test implements ProxyMethod {
    @Override
    public void test(){

    }
}

// 
public class ProxyUtil {
    public static ProxyMethod createProxy(Test test){
        // 创建代理对象
        ProxyMethod proxyMethod = (ProxyMethod) Proxy.newProxyInstance(
            ProxyUtil.class.getClassLoader(), // 指定类加载器
            new Class[]{ProxyMethod.class,}, // 要代理对象的哪些方法（接口）
            new InvocationHandler(){
                public Object invoke(Object proxy,Method method,Object[] args){
                    // 执行目标对象方法前实现的功能
                    // TODO:code
                    return method.invoke(test,args); //调用目标对象的方法
                }
            }
        )
    }
}

public class Main{
    public static void main(){
        Test test =new Test();
        // 创建代理对象
        ProxyMethod proxy =ProxyUtil.createProxy(test);
        // 通过代理对象实现相应方法
        proxy.method();
    }
}

```

### AOP进阶

程序运行期间，AOP类会为目标对象生成其代理对象，在其中对代理方法进行增强。同时，依赖于目标对象的类中最终注入的不再是原始目标对象，而是生成的代理对象。

通知类型：
![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/cs/202407101553145.png)

> ！！注意事项：
> `@Around`需要手动调用`ProceedingJoinPoint.proceed()`来执行原始方法，其他通知类型不需要。
> `@Around`方法的返回值必须指定为Object，来接收原始方法的返回值

通知顺序：

当有多个切面的切入点都匹配到了目标方法，目标方法运行时，多个通知方法都会被执行。执行顺序如何呢？
![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/cs/202407101559043.png)

切入点表达式：决定项目中哪些方法需要加入通知

1. `execution(...)`:根据方法的签名来匹配
   1. ![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/cs/202407101602073.png)
   2. ![](https://raw.githubusercontent.com/yzh-2002/img-hosting/main/cs/202407101604916.png)
2. `@annotation(...)`:根据注解匹配
   1. `@Around("@annotation(xx.xx.xxx.Log)")`：匹配带有Log注解的方法

连接点：

1. Spring中使用JoinPoint类抽象了连接点，可根据其获得方法执行时的相关信息，例如目标类名，方法名，方法参数等
2. `@Around`通知，获取连接点信息只能使用`ProceedingJoinPoint`
3. 其他四种通知方式，获取连接点信息只能使用`JoinPoint`，其为`ProceedingJoinPoint`的父类型