import{_ as n,c as a,a as e,o as i}from"./app-BJidF-NR.js";const l={};function p(d,s){return i(),a("div",null,s[0]||(s[0]=[e(`<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>最简单的 Centos7 安装 MySQL 指南。</p><h2 id="拉取镜像" tabindex="-1"><a class="header-anchor" href="#拉取镜像"><span>拉取镜像</span></a></h2><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> pull</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> mysql:8.0.20</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="创建挂载目录" tabindex="-1"><a class="header-anchor" href="#创建挂载目录"><span>创建挂载目录</span></a></h2><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">mkdir</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -p</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> ~/docker/mysql/{log,data,conf.d}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="添加配置文件-my-cnf" tabindex="-1"><a class="header-anchor" href="#添加配置文件-my-cnf"><span>添加配置文件 my.cnf</span></a></h2><blockquote><p>没有特殊需求可以跳过</p></blockquote><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">vim</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> ~/docker/mysql/conf.d/my.cnf</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>内容如下：</p><div class="language-properties line-numbers-mode" data-ext="properties" data-title="properties"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>###### [client] ######</span></span>
<span class="line"><span>[client]</span></span>
<span class="line"><span>default-character-set=utf8mb4</span></span>
<span class="line"><span>socket=/var/lib/mysql/mysql.sock</span></span>
<span class="line"><span></span></span>
<span class="line"><span>###### [mysql] ######</span></span>
<span class="line"><span>[mysql]</span></span>
<span class="line"><span># 设置 MySQL 客户端默认字符集</span></span>
<span class="line"><span>default-character-set=utf8mb4</span></span>
<span class="line"><span>socket=/var/lib/mysql/mysql.sock</span></span>
<span class="line"><span></span></span>
<span class="line"><span>###### [mysqld] ######</span></span>
<span class="line"><span>[mysqld]</span></span>
<span class="line"><span>port=3306</span></span>
<span class="line"><span>user=mysql</span></span>
<span class="line"><span># 设置 SQL 模式</span></span>
<span class="line"><span># sql_mode 模式引起的分组查询出现 *this is incompatible with sql_mode=only_full_group_by，最好剔除 ONLY_FULL_GROUP_BY</span></span>
<span class="line"><span>sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION</span></span>
<span class="line"><span>datadir=/var/lib/mysql</span></span>
<span class="line"><span>socket=/var/lib/mysql/mysql.sock</span></span>
<span class="line"><span>server-id = 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span># MySQL8 的密码认证插件 如果不设置低版本 navicat 无法连接</span></span>
<span class="line"><span>default_authentication_plugin=mysql_native_password</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 禁用符号链接以防止各种安全风险</span></span>
<span class="line"><span>symbolic-links=0</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 允许最大连接数</span></span>
<span class="line"><span>max_connections=1000</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 服务端使用的字符集默认为 8 bit 编码的 latin1 字符集</span></span>
<span class="line"><span>character-set-server=utf8mb4</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 创建新表时将使用的默认存储引擎</span></span>
<span class="line"><span>default-storage-engine=INNODB</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 0: 表名将按指定方式存储，并且比较区分大小写;</span></span>
<span class="line"><span># 1: 表名以小写形式存储在磁盘上，比较不区分大小写；</span></span>
<span class="line"><span>lower_case_table_names=0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>max_allowed_packet=16M </span></span>
<span class="line"><span></span></span>
<span class="line"><span># 设置时区</span></span>
<span class="line"><span>default-time_zone=&#39;+8:00&#39;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="编写-dockers-compose-yml-文件" tabindex="-1"><a class="header-anchor" href="#编写-dockers-compose-yml-文件"><span>编写 dockers-compose.yml 文件</span></a></h2><div class="language-yaml line-numbers-mode" data-ext="yaml" data-title="yaml"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>version: &#39;3.7&#39;</span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>  mysql: # 服务名称</span></span>
<span class="line"><span>    image: mysql:8.0.20</span></span>
<span class="line"><span>    container_name: mysql </span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - MYSQL_ROOT_PASSWORD=mysql224608 # root 用户密码</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      - /root/docker/mysql/log:/var/log/mysql           # 映射日志目录，宿主机:容器</span></span>
<span class="line"><span>      - /root/docker/mysql/data:/var/lib/mysql          # 映射数据目录，宿主机:容器</span></span>
<span class="line"><span>      - /root/docker/mysql/conf.d:/etc/mysql/conf.d     # 映射配置目录，宿主机:容器</span></span>
<span class="line"><span>      - /etc/localtime:/etc/localtime:ro                # 让容器的时钟与宿主机时钟同步，避免时间问题，ro 即 read only 只读。</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 3306:3306 # 指定宿主机端口与容器端口映射关系，宿主机:容器</span></span>
<span class="line"><span>    restart: always # 容器随 docker 启动自启</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="启动容器" tabindex="-1"><a class="header-anchor" href="#启动容器"><span>启动容器</span></a></h2><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker-compose</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -f</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> ./docker-complse.yml</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> up</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -d</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div>`,15)]))}const t=n(l,[["render",p],["__file","index.html.vue"]]),r=JSON.parse('{"path":"/article/1ap3ri33/","title":"最简单的 MySQL 安装配置指南","lang":"zh-CN","frontmatter":{"title":"最简单的 MySQL 安装配置指南","createTime":"2024/11/30 19:29:10","permalink":"/article/1ap3ri33/","tags":["download","configuration"]},"headers":[],"readingTime":{"minutes":1.49,"words":446},"git":{"updatedTime":1732966286000,"contributors":[{"name":"hein","email":"hein.hpq@gmail.com","commits":1,"avatar":"https://avatars.githubusercontent.com/hein?v=4","url":"https://github.com/hein"}]},"filePathRelative":"download-configuration/最简单的 MySQL 安装配置指南.md","bulletin":false}');export{t as comp,r as data};
