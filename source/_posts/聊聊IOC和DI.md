---
title: 聊聊IOC和DI
mathjax: true
comments: true
date: 2024-07-09 11:54:03
tags:
categories:
    - java
---

Ioc:Inversion of Control，控制反转。DI：Dependency Injection，依赖注入。

<!--more-->

## IOC
> 一种实现对象解耦的思想

场景：对象A的某方法中需调用对象B的方法，如果**简单的在A方法中实例化B对象再调用**，那么如果B的构造方法发生了改变，我们便不得不修改A方法中实例化B对象的代码。

解决方法：A方法中不再实例化B对象，而是在A类中声名一个B对象的属性，我们可以通过A的构造方法传递对象b，这样B构造方法改变时，只需要在A实例化代码处修改即可。

Spring通过IOC容器+DI的方式，使得我们连构造方法传递都无需书写，就可以在A中使用B的方法，详细见下文DI。

```java
class A {
    // Spring
    @Autowired
    private B b;

    // 通过构造方法实现赋值
    // public A(B b){
    //     this.b =b;
    // }

    public void init(){
        // 耦合实现
        // B b =new B();
        // b.init();

        // Ioc实现
        b.init();
    }

}

// Spring
@Component
class B {}

```

## DI
> 相比于IOC，DI是一种具体的技术，其为在IOC容器运行期间，动态的将某个依赖对象注入到当前对象的技术。

关于IOC和DI，Spring提供了两个注解：`@Component`和`@Autowired`：
- 前者表示该类的创建权转交给IOC容器
- 后者表示该对象由IOC容器提供

那Spring如何实现在A中，只需要对依赖对象添加`@Autowired`注解，即可直接使用的呢？

首先，Spring会扫描整个项目，发现带有`@Component`（该注解还有一些衍生注解：`@Controller，@Service，@Repository`）的类，将其收集起来，并通过反射实例化这些类。

> 反射：通过某类的Class实例（可以等价视作该类的字节码对象？）获取该类的所有信息。

```java
// classes的范围是可以指定的
for (Class c:classes){
    Service service = c.getAnnotation(Service.class);
    if (service !=null){
        // 反射的应用
        Object obj = c.newInstance();
        // 将实例化对象置于IOC容器中作为一个Bean对象，bean_id默认为c.getName();
    }
}
```

上述步骤会将B的实例对象收集到IOC容器中，同时也会检查带有`@Autowired`的字段，将依赖对象注入其中

```java
// fields由c.getDeclaredFields()得到，同样基于反射
for (Field f:fields){
    Autowired a =f.getAnnotation(Autowired.class);
    if (a!=null){
        // 默认通过类型从IOC容器中寻找其依赖对象
        Class fieldType =f.getType();
        Object fobj = getByType(fieldType); //从IOC容器中得到依赖对象实例
        // 解除该字段private修饰的限制
        f.setAccessible(true);
        // obj为f所在对象实例，由c.newInstance()得到
        f.set(obj,fobj); 
    }
}
```

上述代码粗略的描述了IOC容器的工作流程，但关于Spring中IOC的应用还有一些细节需要注意。

## Details

第一点就是Spring扫描文件的范围，或者说注解的生效范围。

TODO...

