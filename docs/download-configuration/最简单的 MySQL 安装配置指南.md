---
title: 最简单的 MySQL 安装配置指南
createTime: 2024/11/30 19:29:10
permalink: /article/1ap3ri33/
tags:
- download
- configuration
---
## 前言

最简单的 Centos7 安装 MySQL 指南。

## 拉取镜像

```shell
docker pull mysql:8.0.20
```

## 创建挂载目录

```shell
mkdir -p ~/docker/mysql/{log,data,conf.d}
```

## 添加配置文件 my.cnf 

> 没有特殊需求可以跳过

```shell
vim ~/docker/mysql/conf.d/my.cnf
```

内容如下：

```properties
###### [client] ######
[client]
default-character-set=utf8mb4
socket=/var/lib/mysql/mysql.sock

###### [mysql] ######
[mysql]
# 设置 MySQL 客户端默认字符集
default-character-set=utf8mb4
socket=/var/lib/mysql/mysql.sock

###### [mysqld] ######
[mysqld]
port=3306
user=mysql
# 设置 SQL 模式
# sql_mode 模式引起的分组查询出现 *this is incompatible with sql_mode=only_full_group_by，最好剔除 ONLY_FULL_GROUP_BY
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
server-id = 1

# MySQL8 的密码认证插件 如果不设置低版本 navicat 无法连接
default_authentication_plugin=mysql_native_password

# 禁用符号链接以防止各种安全风险
symbolic-links=0

# 允许最大连接数
max_connections=1000

# 服务端使用的字符集默认为 8 bit 编码的 latin1 字符集
character-set-server=utf8mb4

# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB

# 0: 表名将按指定方式存储，并且比较区分大小写;
# 1: 表名以小写形式存储在磁盘上，比较不区分大小写；
lower_case_table_names=0

max_allowed_packet=16M 

# 设置时区
default-time_zone='+8:00'
```

## 编写 dockers-compose.yml 文件

```yaml
version: '3.7'
services:
  mysql: # 服务名称
    image: mysql:8.0.20
    container_name: mysql 
    environment:
      - MYSQL_ROOT_PASSWORD=mysql224608 # root 用户密码
    volumes:
      - /root/docker/mysql/log:/var/log/mysql           # 映射日志目录，宿主机:容器
      - /root/docker/mysql/data:/var/lib/mysql          # 映射数据目录，宿主机:容器
      - /root/docker/mysql/conf.d:/etc/mysql/conf.d     # 映射配置目录，宿主机:容器
      - /etc/localtime:/etc/localtime:ro                # 让容器的时钟与宿主机时钟同步，避免时间问题，ro 即 read only 只读。
    ports:
      - 3306:3306 # 指定宿主机端口与容器端口映射关系，宿主机:容器
    restart: always # 容器随 docker 启动自启
```

## 启动容器

```shell
docker-compose -f ./docker-complse.yml up -d
```