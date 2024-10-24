---
title: 分布式 ID 生成方案
createTime: 2024/10/22 23:11:20
permalink: /article/cj7ya36a/
tags:
- distributed
---
## 前言

在复杂分布式系统中，往往需要对大量的数据进行唯一标识，比如在对数据分库分表后需要有一个唯一 id 来标识一条数据，数据库的自增 id 显然不能满足需求。

所以，这篇文章我们来聊一聊分布式 ID 的生成方案，主要参考 [Leaf——美团点评分布式ID生成系统](https://tech.meituan.com/2017/04/21/mt-leaf.html)，你也可以去读一读。

## 对分布式 id 的要求

通常情况下，对于分布式 id 来说，我们一般希望它具有以下几个特点。

首先是全局唯一，不能出现重复的 id，这是最基本的。

其次，需要保证趋势递增或者单调递增，我们知道在 MySQL 的存储引擎中，聚簇索引多数使用的 B+ 树作为底层数据结构，所以主键的生成上尽量选择有序的主键来保证写入的性能。

然后是递增的选择，根据不同的业务场景选择不同的递增方式，比如一些情况可能会要求生成单调递增的 id，比如事务版本号，另外的情况是为了保证信息安全，也要求生成趋势递增的 id，这两者是矛盾的，也就是说单调递增的 id 和保证信息安全是不能同时满足的。

最后，由于生成分布式 id 服务一般属于基础服务，所以一定要保证服务的高性能以及高可用。

综上，业界中常用的分布式 id 生成方案主要有 UUID（啥也不是）、数据库自增、号段以及雪花算法。

## UUID

UUID（Universally Unique Identifier）全局唯一标识符，它是在一台机器上生成的数字，可以保证对在同一时空中的所有机器都是唯一的。

标准的 UUID 格式为：xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx（8-4-4-4-12），共 32 个字符，通常由以下几部分的组合而成：当前日期和时间，时钟序列，全局唯一的 1EEE 机器识别号。

它的优点是高性能，因为不依赖网络，本地就可以生成，使用起来也比较简单。

但是我们一般不推荐使用 UUID 的方案，主要是因为：

+ 首先 UUID 的长度过长，没有任何含义，后续排查、调试不方便。
+ 其次生成的 id 也不是递增的，所以不适合做数据库自增主键。
+ 另外基于 MAC 地址的 UUID 算法可能会造成 MAC 地址泄漏，这是信息不安全的。

这里我们着重说明一下为什么 UUID 不适合用作数据库自增主键。

+ UUID 通常是以字符串的形式存储，所以占用的存储空间较大，所以在通过主键查询时会增大磁盘的 IO 次数
+ 并且 UUID 也不适合范围查询。
+ 最重要的插入效率低，在插入数据时，新的 UUID 值可能会插入到叶子节点的中间，这可能导致页分裂和 B+ 树的平衡操作，增大了写数据的开销。

所以，一般不使用 UUID。

## 数据库自增

### 多节点配置

在 MySQL 服务器中，可以使用 auto_increment_offset 和 auto_increment_increment 配置自增列的步长和自增起始点，这通常用于配置多数据节点，确保每个节点生成的自增 id 不会冲突。

其中 auto_increment_increment 用于设置自增列的步长，也就是每次自增的值，而 auto_increment_offset 用于设置自增列的起始点，也就是第一个自增值。

我们举个例子，假设有三个 MySQL 节点，我们希望每个节点生成的 id 互不冲突，可以如下配置：

```sql
# 节点 1
SET @@auto_increment_increment = 3;
SET @@auto_increment_offset = 1;
# 节点 2
SET @@auto_increment_increment = 3;
SET @@auto_increment_offset = 2;
# 节点 3
SET @@auto_increment_increment = 3;
SET @@auto_increment_offset = 3;
```

这种配置确保了：

+ 节点 1 生成的 id 序列为：1、4、7、10、...
+ 节点 2 生成的 id 序列为：2、5、8、11、...
+ 节点 3 生成的 id 序列为：3、6、9、12、...

在业务侧，可以通过 MySQL 中的 last_insert_id() 函数获取自增的 id，如下：

```sql
BEGIN;

-- 插入新记录
INSERT INTO orders(customer_id, order_date) VALUES (123, '2023-06-22');

-- 获取生成的自增 id
SELECT LAST_INSERT_ID();

COMMIT;
```

### 方案优缺点

首先优点是该方案，只依赖现有数据库，实现比较简单，不引入额外组件，成本较小，并且也可以满足 id 趋势自增的要求。

缺点主要就是系统水平扩展困难，比如定义好自增步长和机器台数后，如果要添加机器怎么办？

假设现在只有一台机器发号是 1、2、3、4、5（步长是 1），这时需要扩容一台机器，我们可以这样做：把第二台机器的初始值设置得比第一台超过很多，比如 100（假设在扩容时间之内第一台发号不可能发到 100），同时设置步长为 2，那么这台机器下发的号码都是 100 以后的偶数。

然后修改第一台的自增步长为 2，这样第一台机器以后只能产生奇数的号。

当只有两个节点是扩容还不复杂，如果线上有 100 台机器呢？这个时候要扩容实际是不太现实的，所以系统水平扩展方案复杂，难以实现。

另外，这样的分布式 id 失去了单调递增的特性，只能趋势递增，不过对于一般业务来说，应该是可以容忍的。

还有还是性能问题了，每次获取 id 还是需要读写一次数据库，存在一定的性能问题。

## 号段模式

号段模式是在数据库自增 id 的基础上，为了解决性能问题而产生的一种方案。

在号段模式中，每次从数据库申请自增 id 时会一次性获取一批 id 放在内存中，那么服务下一次需要 id 时就直接从内存中取，这一批用完了再去数据库中申请新的一批。

从物理模型层面来说，以 Leaf 中的表为例：

```sql
+-------------+--------------+------+-----+-------------------+-----------------------------+
| Field       | Type         | Null | Key | Default           | Extra                       |
+-------------+--------------+------+-----+-------------------+-----------------------------+
| biz_tag     | varchar(128) | NO   | PRI |                   |                             |
| max_id      | bigint(20)   | NO   |     | 1                 |                             |
| step        | int(11)      | NO   |     | NULL              |                             |
| desc        | varchar(256) | YES  |     | NULL              |                             |
| update_time | timestamp    | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
+-------------+--------------+------+-----+-------------------+-----------------------------+
```

首先将 max_id 自增 step，然后查询 max_id 和 step 值，计算出 min_id，就相当于 [min_id，max_id] 这段区间一共 step 个 id 被当前服务加载到内存了，后续获取自增 id 就可以直接从内存中获取。

其实还是挺简单的。

### 方案优缺点

号段模式可以防止多个实例之间发生冲突，也就是说，它给每个客户端发放时按号段分开，如服务 A 取的号段是 1 ~ 1000，服务 B 取的是 1001 ~ 2000，服务 C 取的是 2001 ~ 3000，当服务 A 用完之后，再来取的时候就会取到 3001 ~ 4000。

号段模式每次加载一批 id 到内存，可以极大的提升发号的性能，也正是服务会将产生的 id 缓存起来，那么即使数据库发生故障，在短时间内也能提供正常的服务。

一般服务取号的时机是在内存中的号消耗完之后才会从数据库加载新的，如果在此期间数据库的网络发生抖动或者慢查询就会导致整个系统的响应时间变慢，所以 Leaf 框架在在号段模式的基础上，还使用了双 buffer 进行优化，也就是当内存中的号段消耗到某个点时（90%），就会异步将下一批号段加载到内存中，而不是等到真正用尽时才去数据库加载，这样就可以在很大程度上保证系统的高可用 TP999 指标。

但是号段模式也有一些缺点，比如生成的 id 不够随机，可能会泄漏发号数量的信息，同时也存在一定的数据库单点故障，并且从整体服务来看，生成的 id 并不是趋势递增的，不过多个服务之间的差距仅仅在一个 step 以内，这还是可以接受的。

### 参考框架

建议你可以详细阅读一下下面的文章：

+ [Leaf——美团点评分布式ID生成系统](https://tech.meituan.com/2017/04/21/mt-leaf.html)

同时淘宝的 TDDL Sequence 也是类似的基于号段模式实现的分布式 id，也可以参考一下。

## 雪花算法

Snowflake 中文的意思是雪花，所以常被称为雪花算法，是 Twitter 开源的分布式 id 生成算法。

### 雪花算法组成

snowflake 结构如下图所示：

![image-20241022231826532](assets/image-20241022231826532.png)

包含四个组成部分：

+ 不使用：1 bit，最高位是符号位，0 表示正，1 表示负，固定为 0。
+ 时间戳：41 bit，毫秒级的时间戳（41 位的长度可以维持 69 年）。
+ 标识位：5 bit 数据中心 id，5 bit 工作 id，两个标识位组合起来最多可以支持部署 1024 个节点。
+ 序列号：12 bit 递增序列号，表示单节点毫秒内生成不重复的 id 数，通过序列号表示唯一。基于序列号毫秒内可以产生 4096 个不重复 id，所以理论情况下秒级生成量可达 400w。

并且雪花算法也不是一成不变的，如果你希望运行的时间更久（超过 69 年，貌似不可能），那么可以增加时间戳的位数，如果需要支持更多节点的部署，就可以增加标识位的长度，如果系统并发很高，那么就可以增加序列号的位数，一切都可以根据特定的场景进行定制化。

### 方案优缺点

就雪花算法的组成来看，时间戳划分在 id 的高位，可以保证生成的 id 序列是趋势递增的，其次雪花算法并不依赖数据库等三方系统，完全在内存中生成，所以它生成 id 的性能是非常高的，另外，我们上面也解释了，雪花算法还可以根据自身的业务特性分配 bit 位，也是非常灵活的。

而也正因为雪花算法需要时间戳，所以是强依赖机器时钟的，如果机器上时钟回拨，就有可能导致发号重复。

而一旦服务集群中节点较多，配置数据中心 id 和工作 id 也是一件繁琐的事，解决的方案可以是在 Zookeeper 或者 Redis 存放标识位，在服务启动时请求，也可以参考 Mybatis-Plus 基于 Mac 地址和 PID 获取唯一标识。

### 标识位如何获取

上面我们说过，标识位的获取有两种方案，一是在 Zookeeper 或者 Redis 存放标识位，自动对服务节点分配标识位，二是参考 Mybatis-Plus 基于 Mac 地址和 PID 获取。

#### 基于 Mac 和 PID

我们先看看开源框架中使用雪花算法，如何定义标识位。

Mybatis-Plus v3.4.2 雪花算法实现类 Sequence，提供了两种构造方法：

+ 无参构造，自动生成 dataCenterId 和 workerId
+ 有参构造，创建 Sequence 时明确指定标识位

这里就来看一下 Sequence 的默认无参构造，如何生成 dataCenterId 和 workerId。

```java
/**
 * 数据标识 id 部分
 */
protected static long getDatacenterId(long maxDatacenterId) {
    long id = 0L;
    try {
        InetAddress ip = InetAddress.getLocalHost();
        NetworkInterface network = NetworkInterface.getByInetAddress(ip);
        if (network == null) {
            id = 1L;
        } else {
            byte[] mac = network.getHardwareAddress();
            if (null != mac) {
                id = ((0x000000FF & (long) mac[mac.length - 2]) | 
                      (0x0000FF00 & (((long) mac[mac.length - 1]) << 8))) >> 6;
                id = id % (maxDatacenterId + 1);
            }
        }
    } catch (Exception e) {
        logger.warn(" getDatacenterId: " + e.getMessage());
    }
    return id;
}
```

入参 maxDatacenterId 是一个固定值，代表数据中心 id 最大值，默认值 31。

获取 dataCenterId 时存在两种情况，一种是网络接口为空，默认取 1L，另一种不为空，通过 Mac 地址获取 dataCenterId。

可以得知，dataCenterId 的取值与 Mac 地址有关。

接下来再看看 workerId。

```java
/**
 * 获取 maxWorkerId
 */
protected static long getMaxWorkerId(long datacenterId, long maxWorkerId) {
    StringBuilder mpid = new StringBuilder();
    mpid.append(datacenterId);
    String name = ManagementFactory.getRuntimeMXBean().getName();
    if (StringUtils.isNotBlank(name)) {
        // GET jvmPid
        mpid.append(name.split(StringPool.AT)[0]);
    }
    /*
     * MAC + PID 的 hashcode 获取16个低位
     */
    return (mpid.toString().hashCode() & 0xffff) % (maxWorkerId + 1);
}
```

入参 maxWorkderId 也是一个固定值，代表工作机器 id 最大值，默认值 31，datacenterId 取自上述的 getDatacenterId 方法。

name 变量值为 PID@IP，所以 name 需要根据 @ 分割并获取下标 0，得到 PID，通过 MAC + PID 的 hashcode 获取 16 个低位，进行运算，最终得到 workerId。

#### 三方自动分配

我们也可以基于 Zookeeper 或者 Redis 存储标识位，在服务启动时向它们请求即可。

这里我们给出一个基于 Redis 的方案，对于 Zookeeper 你可以参考美团 Leaf 中有关雪花算法的实现。

我们在 Redis 存储一个 Hash 结构，包含两个 field：data_center_id 和 worker_id。

在服务启动时，通过 Lua 去 Redis 获取标识位，dataCenterId 和 workerId 的获取与自增在 Lua 脚本中完成，调用返回后就是可用的标示位。

参考：[https://github.com/hein-hp/sequence-generator](https://github.com/hein-hp/sequence-generator)

#### 服务降级处理

如果选择依赖 Redis 或者 Zookeeper 来分配标识位，那么必然要求 Redis 或者 Zookeeper 高可用，但这并不现实，所以我们还需要一个服务降级的处理。

你可以这样做，当需要请求标识位时，如果 Redis 和 Zookeeper 出现问题，可以临时基于 Mac 地址和 PID 在本地临时生成标识位作为降级处理。

### 时钟回拨问题

时间回拨是指系统在运行过程中，可能由于网络时间校准或者人工设置，导致系统时间主动或被动地跳回到过去的某个时间。

雪花算法使用时间戳作为生成 id 的一部分，所以如果系统时钟回拨，可能就会导致发号重复问题。

#### 延迟等待

我们先来看看常见框架是怎么解决的，参考 Mybatis-plus 生成 id 的方法。

```java
public synchronized long nextId() {
    long timestamp = timeGen();
    // 出现时钟回拨
    if (timestamp < lastTimestamp) {
        // 回拨偏移量
        long offset = lastTimestamp - timestamp;
        if (offset <= 5) {
            // 如果 offset <= 5 有可能只是机器出现了小问题
            // 阻塞等待 2 倍的时间然后重新生成时间戳
            try {
                wait(offset << 1);
                timestamp = timeGen();
                // 还是存在回拨问题，则抛异常
                if (timestamp < lastTimestamp) {
                    throw new RuntimeException(String.format("Clock moved backwards.  Refusing to generate id for %d milliseconds", offset));
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        } else {
            throw new RuntimeException(String.format("Clock moved backwards.  Refusing to generate id for %d milliseconds", offset));
        }
    }

    if (lastTimestamp == timestamp) {
        // 相同毫秒内，序列号自增
        sequence = (sequence + 1) & sequenceMask;
        if (sequence == 0) {
            // 同一毫秒的序列数已经达到最大，只能等待下一个毫秒
            timestamp = tilNextMillis(lastTimestamp);
        }
    } else {
        // 不同毫秒内，序列号置为 1 - 3 随机数
        sequence = ThreadLocalRandom.current().nextLong(1, 3);
    }

    lastTimestamp = timestamp;

    // 时间戳部分 | 数据中心部分 | 机器标识部分 | 序列号部分
    return ((timestamp - twepoch) << timestampLeftShift)
        | (datacenterId << datacenterIdShift)
        | (workerId << workerIdShift)
        | sequence;
}
```

可以看到，Mybatis-plus 的实现中，如果时钟回拨的偏移量 < 5ms，那么我们认为这种时间回拨可能只会出现一次，所以我们可以将线程阻塞等待两倍长的时间再次尝试获取时间戳，如果还是回拨那么就抛异常。

#### 增加时钟序列

另一种方案是修改扩展位，我们在雪花算法的序列中增加 3 位时钟序列，也就是像下面这样：

+ 1 bit（保留）+ 41 bit（时间戳）+ 3 bit（时钟序列）+ 7 bit（标识位）+ 12 bit（序列号）

一旦发生时钟回拨，并且延迟等待之后还是出现时钟回拨，我们就可以递增时钟序列，然后重新设置 lastTimestamp，强行修正时间戳。

```java
/**
 * 获取下一个 id
 */
public synchronized long nextId() {
    long timestamp = timeGen();
    if (timestamp < lastTimestamp) {
        long offset = lastTimestamp - timestamp;
        if (offset <= 5) {
            try {
                wait(offset << 1);
                timestamp = timeGen();
                if (timestamp < lastTimestamp) {
                    return forceFixOffset(timestamp);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        } else {
            return forceFixOffset(timestamp);
        }
    }

    if (lastTimestamp == timestamp) {
        // 相同毫秒内，序列号自增
        sequence = (sequence + 1) & sequenceMask;
        if (sequence == 0) {
            // 同一毫秒的序列数已经达到最大
            timestamp = tilNextMillis(lastTimestamp);
        }
    } else {
        // 不同毫秒内，序列号置为 1 - 3 随机数
        sequence = ThreadLocalRandom.current().nextLong(1, 3);
    }

    lastTimestamp = timestamp;

    // 时间戳部分 | 时钟序列 | 数据中心部分 | 机器标识部分 | 序列号部分
    return ((timestamp - twepoch) << timestampLeftShift)
            | (clockSequence << clockSequenceShift)
            | (datacenterId << datacenterIdShift)
            | (workerId << workerIdShift)
            | (sequence << sequenceShift);
}

private long forceFixOffset(long timestamp) {
    // 自增 clockSequence
    clockSequence = (clockSequence + 1) & clockSequenceMask;
    // 强行修正时间戳
    lastTimestamp = timestamp;
    // 时间戳部分 | 时钟序列 | 数据中心部分 | 机器标识部分 | 序列号部分
    return ((timestamp - twepoch) << timestampLeftShift)
            | (clockSequence << clockSequenceShift)
            | (datacenterId << datacenterIdShift)
            | (workerId << workerIdShift)
            | (sequence << sequenceShift);
}
```

参考：[https://github.com/hein-hp/sequence-generator](https://github.com/hein-hp/sequence-generator)

## 总结

其实这篇文章，更多是为了应付面试吧，我在公司也不是写这相关业务的，像这种基础组件都是有专门的基础开发团队，也算是了解一下吧。