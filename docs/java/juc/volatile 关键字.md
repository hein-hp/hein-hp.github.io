---
title: volatile 关键字
createTime: 2024/10/23 22:32:50
permalink: /article/wauy3z3i/
tags:
- java
- juc
---
## 前言

volatile 关键字是 JVM 提供的轻量级同步机制，在并发编程中，volatile 和 synchronized 都有着举足轻重的作用，我们也知道 volatile 可以保证并发编程的可见性和有序性，那具体底层是怎么实现的？

所以这里我们重点讨论 volatile 的底层实现原理，对 volatile 如何使用就不再赘述了。

## 语言层面

在 [Java 语法规范](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.3.1.4) 中，是这样描述 volatile 的：

```java
The Java programming language allows threads to access shared variables. As a rule, to ensure that shared variables are consistently and reliably updated, a thread should ensure that it has exclusive use of such variables by obtaining a lock that, conventionally, enforces mutual exclusion for those shared variables.
The Java programming language provides a second mechanism, volatile fields, that is more convenient than locking for some purposes.
A field may be declared volatile, in which case the Java Memory Model ensures that all threads see a consistent value for the variable.
```

翻译下来就是：

Java 编程语言允许线程访问共享变量，通常为了确保共享变量的更新是一致和可靠的，线程应该通过获得锁来确保它独占地使用这些变量，而锁通常会强制这些共享变量的互斥。 

Java 编程语言提供了第二种机制，即 volatile 字段，它在某些用途上比锁更方便。 

可以将字段声明为 volatile，在这种情况下，Java 内存模型确保所有线程都看到该变量的一致值。

我们可以看到，Java 语法规范中，着重说明了 volatile 提供的「可见性」，但没有提及「有序性」。

## 字节码层面

我们考虑下面的用例

```java
package org.hein;

public class Volatile {

    public static volatile int volatileVar = 0;
    public static int nonVolatileVar = 0;

    public static void main(String[] args) {
        volatileVar = 1;
        nonVolatileVar = 1;
        System.out.println(volatileVar);
        System.out.println(nonVolatileVar);
    }
}
```

反编译为字节码如下，主要关注 volatileVar 和 nonVolatileVar 字段

```java
public static volatile int volatileVar;
  descriptor: I
  flags: ACC_PUBLIC, ACC_STATIC, ACC_VOLATILE
  
public static int nonVolatileVar;
  descriptor: I
  flags: ACC_PUBLIC, ACC_STATIC
```

可以看出，volatile 变量在字节码中的 access_flag 字段会使用 ACC_VOLATILE 标记，该标记在 JVM 虚拟机规范中定义如下：

```java
ACC_VOLATILE 0x0040 Declared volatile; cannot be cached.
```

所以虚拟机可以根据 ACC_VOLATILE 标记来决定是否要遵循 volatile 的语义处理该变量。

## OpenJDK 源码

>  [OpenJDK 源码](https://hg.openjdk.org/)

为了在不同的操作系统和硬件平台上都能实现 volatile 语义，就需要一个与平台无关的逻辑抽象来描述这种语义的定义实现，也就是所谓的规范。

在 OpenJDK 源码有一段注释是专门描述如何实现 volatile 语义的，具体文件是 orderAccess.hpp。

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/orderAccess.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/orderAccess.hpp)

在不同的平台下又有着不同的实现，比如在 linux_x86 架构下的实现是 <font style="color:rgb(0, 0, 0);">orderAccess_linux_x86.inline.hpp。</font>

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/os_cpu/linux_x86/vm/orderAccess_linux_x86.inline.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/os_cpu/linux_x86/vm/orderAccess_linux_x86.inline.hpp)

那么下面我们就来看看注释中有个啥？

### volatile 规范

下面是一个关键的内容，完整的注释内容参见文末。

```java
// We define four primitive memory barrier operations.
//
// LoadLoad:   Load1(s); LoadLoad; Load2
//
// Ensures that Load1 completes (obtains the value it loads from memory)
// before Load2 and any subsequent load operations.  Loads before Load1
// may *not* float below Load2 and any subsequent load operations.
//
// StoreStore: Store1(s); StoreStore; Store2
//
// Ensures that Store1 completes (the effect on memory of Store1 is made
// visible to other processors) before Store2 and any subsequent store
// operations.  Stores before Store1 may *not* float below Store2 and any
// subsequent store operations.
//
// LoadStore:  Load1(s); LoadStore; Store2
//
// Ensures that Load1 completes before Store2 and any subsequent store
// operations.  Loads before Load1 may *not* float below Store2 and any
// subseqeuent store operations.
//
// StoreLoad:  Store1(s); StoreLoad; Load2
//
// Ensures that Store1 completes before Load2 and any subsequent load
// operations.  Stores before Store1 may *not* float below Load2 and any
// subseqeuent load operations.
```

我们解读一下大致内容，这段注释描述了四种基本的内存屏障（memory barrier）

1、LoadLoad：作用在两个读（Load）操作之间内存屏障。

```java
Load1;
LoadLoad;
Load2;
```

它禁止了 Load1 之后的加载指令被重排序到 Load1 之前，所以在 Load1 获取到数据之前，后续的任何加载操作都不能先于 Load1 执行。

2、StoreStore：作用在两个写（Store）操作之间的内存屏障。

```java
Store1;
StoreStore;
Store2;
```

它禁止了 Store1 之后的存储指令被重排序到 Store1 之前，所以 Store1 的效果必须在其他处理器可见后，才能执行 Store2 及之后的存储操作。

3、LoadStore：作用在 Load  操作和 Store 操作之间的内存屏障。

```java
Load1;
LoadStore;
Store2;
```

它禁止了 Load1 之后的存储指令被重排序到 Load1 之前，所以 Load1 必须在其值被使用之前完成，然后才能执行 Store2 以及后续的所有存储操作。

4、StoreLoad：作用在 Store 操作和 Load 操作之间的内存屏障。

```plain
Store1; 
StoreLoad;
Load2;
```

这是最强大的内存屏障之一，因为它不仅阻止了存储指令与后续加载指令之间的重排序，还强制刷新处理器缓存，使得 Store1 的数据能够被其他处理器看到，只有当 Store1 的写入效果对其他处理器可见后，Load2 及之后的加载操作才能执行。

JVM 通过在指令序列中插入上面的四种内存屏障来达到正确的代码执行效果，那具体会在什么情况下会插入以上四种内存屏障呢？

下表显示了怎么样的两个操作步骤之间需要插入内存屏障（JSR133 规范）：

| 第一步 \ 第二步 | 普通读   | 普通写    | volatile 读 | volatile 写 |
| --------------- | -------- | --------- | ----------- | ----------- |
| 普通读          |          |           |             | LoadStore   |
| 普通写          |          |           |             | StoreStore  |
| volatile 读     | LoadLoad | LoadStore | LoadLoad    | LoadStore   |
| volatile 写     |          |           | StoreLoad   | StoreStore  |


所以，总的来说，JVM 在进行读写 volatile 变量时，在 volatile 读后面都会加上 LoadLoad 和 LoadStore 两个屏障：

```java
int a = b; // b 是 volatile 变量
LoadLoad
LoadStore
...
```

在 volatile 写的前面都会加上 LoadStore 和 StoreStore 两个屏障，在后面加上 StoreLoad 屏障：

```java
...
LoadStore
StoreStore
a = 0; // a 是 volatile 变量
StoreLoad
...
```

理论上在进行 volatile 写之后，只有后续进行 volatile 读才需要插入 StoreLoad 屏障，但是，编译器又不能感知到多线程环境下在 volatile 写时，后续各个 CPU 是否有 volatile 读操作，所以，Java 插入内存屏障时采用了保守策略，进行 volatile 写后一定会插入 StoreLoad 屏障来保证可见性。

### linux_x86 实现

我们再深入到 JDK 源码看看是如何处理 ACC_VOLATILE 标记的，从下面的源码着手。

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/interpreter/bytecodeInterpreter.cpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/interpreter/bytecodeInterpreter.cpp)

```java
CASE(_getfield):
CASE(_getstatic):
{
  // ...
  //
  // Now store the result on the stack
  //
  TosState tos_type = cache->flag_state();
  int field_offset = cache->f2_as_index();
  // 是否是 volatile 变量
  if (cache->is_volatile()) {
    // 下面都是 volatile 变量的取值逻辑
    if (tos_type == atos) {
      VERIFY_OOP(obj->obj_field_acquire(field_offset));
      SET_STACK_OBJECT(obj->obj_field_acquire(field_offset), -1);
    } else if (tos_type == itos) {
      SET_STACK_INT(obj->int_field_acquire(field_offset), -1);
    } else if (tos_type == ltos) {
      SET_STACK_LONG(obj->long_field_acquire(field_offset), 0);
      MORE_STACK(1);
    } else if (tos_type == btos) {
      SET_STACK_INT(obj->byte_field_acquire(field_offset), -1);
    } else if (tos_type == ctos) {
      SET_STACK_INT(obj->char_field_acquire(field_offset), -1);
    } else if (tos_type == stos) {
      SET_STACK_INT(obj->short_field_acquire(field_offset), -1);
    } else if (tos_type == ftos) {
      SET_STACK_FLOAT(obj->float_field_acquire(field_offset), -1);
    } else {
      SET_STACK_DOUBLE(obj->double_field_acquire(field_offset), 0);
      MORE_STACK(1);
    }
  } else {
    // 普通变量的取值
  }
  UPDATE_PC_AND_CONTINUE(3);
 }

// ...

CASE(_putfield):
CASE(_putstatic):
{
  // ...
  //
  // Now store the result
  //
  int field_offset = cache->f2_as_index();
  // 是否是 volatile 变量
  if (cache->is_volatile()) {
    // 下面都是 volatile 变量的赋值逻辑
    if (tos_type == itos) {
      obj->release_int_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == atos) {
      VERIFY_OOP(STACK_OBJECT(-1));
      obj->release_obj_field_put(field_offset, STACK_OBJECT(-1));
      OrderAccess::release_store(&BYTE_MAP_BASE[(uintptr_t)obj >> CardTableModRefBS::card_shift], 0);
    } else if (tos_type == btos) {
      obj->release_byte_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == ltos) {
      obj->release_long_field_put(field_offset, STACK_LONG(-1));
    } else if (tos_type == ctos) {
      obj->release_char_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == stos) {
      obj->release_short_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == ftos) {
      obj->release_float_field_put(field_offset, STACK_FLOAT(-1));
    } else {
      obj->release_double_field_put(field_offset, STACK_DOUBLE(-1));
    }
    // ==== 赋值之后的 storeload 屏障 ====
    OrderAccess::storeload();
  } else {
    // 普通变量的赋值
  }
  UPDATE_PC_AND_TOS_AND_CONTINUE(3, count);
}
```

判断 volatile 变量的逻辑主要就在 is_volatile 方法中，如下：

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/utilities/accessFlags.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/utilities/accessFlags.hpp)

```java
bool is_volatile() const { 
    return (_flags & JVM_ACC_VOLATILE) != 0; 
}
```

再来看 JVM 是如何处理 volatile 变量的？以 int 类型为例：

```java
obj->release_int_field_put(field_offset, STACK_INT(-1));
```

跟入 release_int_field_put 方法，如下：

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/oops/oop.inline.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/oops/oop.inline.hpp)

```java
inline void oopDesc::release_int_field_put(int offset, jint contents) {
    // store
    OrderAccess::release_store(int_field_addr(offset), contents);  
}
```

与此同时，在 getstatic 指令执行时会调用下面的方法

```java
inline jint oopDesc::int_field_acquire(int offset) const { 
    // load
    return OrderAccess::load_acquire(int_field_addr(offset));      
}
```

赋值的操作又被包装了一层，又调用的 OrderAccess::release_store 以及 OrderAccess::load_acquire 方法。

通过上面的代码，我们大概可以知道，JVM 在解释字节码时，对 getfield、putfield、getstatic、putstatic 这些对对象的属性进行读写操作的指令时，判断 Klass 属性 access_flag 为 ACC_VOLATILE 时，就会在汇编指令中添加上内存屏障指令。

大致的逻辑简化如下：

```java
if (属性读指令操作) {
    if (属性被 volatile 修饰) {
        OrderAccess::load_acquire
    } else {
        正常读
    }
} else if (属性写指令操作) {
    if (属性被 volatile 修饰) {
        OrderAccess::release_store
        // ==== 赋值之后的 storeload 屏障 ====
        OrderAccess::storeload
    } else {
        正常写
    }
}
```

所以，关键就在于 OrderAccess::load_acquire，OrderAccess::release_store，OrderAccess::storeload。

很显然，OrderAccess::storeload 对应 JVM 抽象出来的 StoreLoad 指令，而 OrderAccess::load_acquire，OrderAccess::release_store 又是什么呢？

这在 orderAccess.hpp 中的注释中也有说明。

+ acquire 等价于 LoadLoad + LoadStore，而 load_acquire 等价于 load + acquire，所以其实这就是 load + LoadLoad + LoadStore，这印证了我们前面说的，对 volatile 属性的读取，在读指令后加上了 LoadLoad 屏障和 LoadStore 屏障。
+ release 等价于 LoadStore + StoreStore，而 release_store 等价于 release + store，所以其实这就是 LoadLoad + LoadStore + store，这印证了我们前面说的，对 volatile 属性的写入，在写指令前加上了 LoadStore 屏障和 StoreStore 屏障。
+ 在写入（赋值）之后还会加上 StoreLoad 屏障。

所以我们接下来的重点就是分析 OrderAccess。

OrderAccess 定义在 orderAccess.hpp，根据不同的操作系统和 CPU 架构有着不同的实现。

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/orderAccess.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/orderAccess.hpp)

orderAccess.hpp 在 linux_x86 架构下的实现是 orderAccess_linux_x86.inline.hpp

> [https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/os_cpu/linux_x86/vm/orderAccess_linux_x86.inline.hpp](https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/os_cpu/linux_x86/vm/orderAccess_linux_x86.inline.hpp)

```java
inline jint OrderAccess::load_acquire(volatile jint* p) { 
    return *p;
}
inline void OrderAccess::release_store(volatile jint* p, jint v) { 
    *p = v; 
}
```

这里相当于是套了一层 C++ 的 volatile，所以我们需要了解一下在 C++ 中 volatile 的作用。

在 C++ 中，volatile 用于建立语言级别的内存屏，编译器对访问 volatile 变量的代码不再进行优化，以便可以提供对特殊地址的稳定访问，编译器保证总是重新从它所在的内存读取数据，即使已经读取后并没有任何修改。

再来看赋值之后的 storeload 屏障，

```java
OrderAccess::storeload();
```

当对 volatile 变量赋值完成之后就会调用 storeload 方法，它依然声明在 orderAccess.hpp 中，在不同操作系统和 CPU 架构有不同的实现，这里我们还是看在 linux_x86 架构下的实现：

```java
inline void OrderAccess::storeload() { 
  fence();
}

inline void OrderAccess::fence() {
  // 首先判断处理器是单核还是多核，如果是单核则没有必要使用内存屏障，反而消耗资源
  if (os::is_MP()) {
    // always use locked addl since mfence is sometimes expensive
#ifdef AMD64
    __asm__ volatile ("lock; addl $0,0(%%rsp)" : : : "cc", "memory");
#else
    __asm__ volatile ("lock; addl $0,0(%%esp)" : : : "cc", "memory");
#endif
  }
}
```

可以看到，这里使用了 lock addl 指令，在 AMD64 架构下，addl 指令主要是给 rsp 寄存器中的值加 0，这里是一个讨巧的做法，volatile 变量的数据就存储在 rsp 中的，这时给这个值加 0 可以确保这个值不会发生变化，所以这里的核心是在 lock 上，lock 有如下作用：

1. lock 前缀的指令会保证处理器对缓存行的独占使用，其他处理器对应的缓存行会失效。
2. CPU 会禁止 lock 前缀的指令与之前和之后的读和写指令重排序。
3. 指令执行完后，将写缓冲区中的所有数据刷新到内存中。

到这里，我们基本确定了在 linux_x86 上就是通过 lock addl 指令来实现 volatile 的硬件级别的语义。

## 汇编代码

加上如下 VM 参数运行程序，可以看到它的汇编输出，其实底层就是我们上面分析的 lock 指令。

```java
-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly
```

## 总结

这篇文章，我们分析了 volatile 关键字在 JVM 是如何实现的。

其实本质上来说就是在 volatile 变量的读后面加了 LoadLoad 和 LoadStore 屏障，在 volatile 变量的写前面加了 LoadStore 和 StoreStore 屏障，在 volatile 变量的写后面还加了 StoreLoad 屏障。

而这些屏障的底层就是基于 C++ 的 volatile 关键字以及 cpu 的 lock 指令实现的。