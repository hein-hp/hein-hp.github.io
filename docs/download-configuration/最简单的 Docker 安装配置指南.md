---
title: 最简单的 Docker 安装配置指南
createTime: 2024/11/30 19:24:44
permalink: /article/bnp8yuov/
tags:
- download
- configuration
---
## 前言

最简单的 Centos7 安装 Docker、Docker Compose 指南。

## 安装 Docker

Docker CE 支持 64 位版本 CentOS 7，并且要求内核版本不低于3.10， CentOS 7 满足最低内核的要求，所以在 CentOS 7 安装 Docker。

### 卸载（可选）

如果之前安装过旧版本的 Docker，可以使用下面命令卸载：

```shell
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```

### 安装 docker

联网，安装 yum 工具

```shell
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

更新本地镜像源：

```shell
# 设置 docker 镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
# 将 /etc/yum.repos.d/docker-ce.repo 文件中的 'download.docker.com' 替换为 'mirrors.aliyun.com\/docker-ce'
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```

然后输入命令：

```shell
yum install -y docker-ce
```

即可安装成功。

### 启动 docker

通过命令启动 docker：

```shell
# 启动
systemctl start docker  
# 停止
systemctl stop docker  
# 重启
systemctl restart docker
```

可以查看 docker 版本：

```plain
docker -v
```

### 配置镜像加速

在 /etc/docker 目录创建编写 daemon.json 文件

```shell
{
    "registry-mirrors": [
        "https://dockerproxy.com",
        "https://docker.nju.edu.cn",
        "https://docker.mirrors.sjtug.sjtu.edu.cn"
    ]
}
```

## 安装 Docker Compose

官网：[Releases · docker/compose](https://github.com/docker/compose/releases)

### 下载

通过命令：

```shell
curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

或者使用国内镜像源：

```shell
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.27.0/docker-compose-`uname -s`-`uname -m` > /usr/local/src/docker-compose
```

或者在 GitHub 官网的 realse 页面下载二进制包后上传到服务器。

### 配置

将可执行权限应用于二进制文件

```shell
chmod +x /usr/local/src/docker-compose
```

创建软链接

```shell
sudo ln -s /usr/local/src/docker-compose /usr/bin/docker-compose
```

查看 docker compose 版本

```shell
docker compose version
```