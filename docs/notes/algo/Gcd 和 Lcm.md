---
title: Gcd 和 Lcm
createTime: 2024/10/20 11:29:30
permalink: /algo/q87e02h6/
---
## 前言

最大公约数 & 最小公倍数

## 什么是最大公约数

参考百度百科：

最大公因数，也称最大公约数、最大公因子，指两个或多个整数共有约数（因数）中最大的一个。

## 什么是最小公倍数

参考百度百科：

两个或多个整数公有的倍数叫做它们的公倍数，其中除 0 以外最小的一个公倍数就叫做这几个整数的最小公倍数。

## 如何求最大公约数

### 辗转相除法

```java
public int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}
```

证明略。

## 如何求最小公倍数

### 根据 gcd 求 lcm

当你求出 gcd 之后，最大公倍数也就显而易见了。

```java
public long lcm(int a, int b) {
    return a / gcd(a, b) * b;
}

public int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}
```