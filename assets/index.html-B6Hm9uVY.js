import{_ as i,c as a,a as n,o as l}from"./app-CkY5Gb3L.js";const h={};function t(e,s){return l(),a("div",null,s[0]||(s[0]=[n(`<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>一次使用 wget 爬取网站资源的经历。</p><h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景"><span>背景</span></a></h2><p>昨天晚上在看 <a href="https://learn.lianglianglee.com/" target="_blank" rel="noopener noreferrer">技术摘抄</a> 的时候，发现该网站因为收到 Google 相关通知，不久会被关闭，所以我就想着能不能将整个网站的内容保存下来，后面还可以看。</p><p>经过后面一通 f12 分析，我发现它不是常规的前后端通过 ajax 请求来进行数据交互的，而是类似于 hexo 这类博客，将 markword 文件渲染为 html 进行展示，所以我想出来的唯一方法就是将 html 包括相关的 css、js、图片等全部下载下来。</p><p>这里会使用到一个工具 wget，然后编写了一些脚本，在我自己的服务器上跑了大概 1 天，成功的下载了所有的内容。</p><p>之所以要跑一天，是因为这个网站应该是基于 cloudflare 做了请求的限制，所以我每次的请求都必须要等待一段时间。</p><p>下面就将我这个过程中用到的 sh 脚本分享出来，希望大家慎用。</p><h2 id="wget-批量爬取资源" tabindex="-1"><a class="header-anchor" href="#wget-批量爬取资源"><span>wget 批量爬取资源</span></a></h2><p>首先 wget 命令是：</p><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">wget</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -r</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -l</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> inf</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --no-parent</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --accept=html,css,jpg,jpeg,png,gif,md</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -e</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> robots=off</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -w</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 5</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -x</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -np</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -pk</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">download_url</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>解释一下：</p><ul><li><code>-r</code>：启用递归下载。</li><li><code>-l inf</code>：设置递归的最大深度为无限。</li><li><code>--no-parent</code>：确保 wget 不会爬取到指定目录之外的上级目录。</li><li><code>--accept=html,css,jpg,jpeg,png,gif,md</code>：只接受特定类型的文件。</li><li><code>-e robots=off</code>：忽略站点的 robots.txt 文件。</li><li><code>-w 5</code>：在每次请求之间等待 5 秒钟，这就是避免因为请求过于频繁而被封禁 IP 地址。</li><li><code>-x</code>：使用原来的目录结构保存文件，这样下载的内容会按照原网站的目录结构进行组织。</li><li><code>-np</code>：不追溯到父级目录。</li><li><code>-pk</code>：下载显示 HTML 页面所必需的所有文件。比如，如果一个 HTML 页面包含图片、样式表等，那么这些也会一并被下载下来。</li><li><code>&quot;download_url&quot;</code>：这就是要下载的起始 URL。</li></ul><p>在下载过程中，我们肯定不能手动输入 download_url，所以我会提前将网站的所有文章链接写到一个 txt 文件，其次，在下载完成后记录日志，方便后面如果哪里有问题好排查。</p><p>最后，启动 sh 时请使用 nohup，否则关掉终端后 sh 命令就会停止了，如下：</p><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">nohup</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> ./download.sh</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> index.txt</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> &amp;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>download.sh 参考：</p><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">#!/bin/sh</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 参数是包含 URL 的文本文件名称</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">URL_FILE</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">=</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$1</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 日志文件名</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">LOG_FILE</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">=</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">download_log.txt</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 清空或创建日志文件</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;">&gt;</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 读取 URL 文件并下载每个 URL</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">while</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;"> IFS</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">=</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;"> read</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -r</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> URL</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> do</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">  if</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> [</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> -n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$URL</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> ];</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> then</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # 确保 URL 不为空</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">    echo</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">Downloading from: $URL</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> tee</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">    </span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">    # 使用 wget 下载 URL，并将输出重定向到日志文件</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">    wget</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -r</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -l</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> inf</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --no-parent</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --accept=html,css,jpg,jpeg,png,gif,md</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -e</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> robots=off</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -w</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 5</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -x</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -np</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -pk</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$URL</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> 2&gt;&amp;1</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> tee</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">    </span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">    # 检查 wget 的退出状态</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">    if</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> [</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> $?</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> -eq</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> ];</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> then</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">      echo</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">Success: $URL</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> tee</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">    else</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">      echo</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">Failure: $URL</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> tee</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">    fi</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">  fi</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">done</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> &lt;</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$URL_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">echo</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">All downloads completed.</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> tee</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$LOG_FILE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="将-md-修改为-html" tabindex="-1"><a class="header-anchor" href="#将-md-修改为-html"><span>将 .md 修改为 .html</span></a></h2><p>将资源下载下来后，文件的后缀是 .md，但是里面的内容实际是 html，所以我们将所有的 .md 后缀修改为 .html，如下：</p><div class="language-shell line-numbers-mode" data-ext="shell" data-title="shell"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">#!/bin/sh</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 检查是否提供了一个参数</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">if</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> [</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> -z</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$1</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> ];</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> then</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">  echo</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">请提供一个目录作为参数</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">  exit</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 1</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">fi</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 定义目录变量</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">dir</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">=</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$1</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 使用 find 查找 .md 文件，并对每个找到的文件执行 mv 命令更改扩展名</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">find</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$dir</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -type</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> f</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -name</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">*.md</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> while</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;"> read</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> file</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> do</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # 获取文件的基本名称（不含扩展名）</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">  base</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">=</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">\${</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">file</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;">%</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">.md</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">}</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # 重命名文件</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">  mv</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">$file</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">\${</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">base</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">}</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">.html</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">done</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,21)]))}const p=i(h,[["render",t],["__file","index.html.vue"]]),d=JSON.parse('{"path":"/article/0fqhzg6c/","title":"一次爬取网站的经历","lang":"zh-CN","frontmatter":{"title":"一次爬取网站的经历","createTime":"2024/10/22 23:31:01","permalink":"/article/0fqhzg6c/","tags":["title-tattle"]},"headers":[],"readingTime":{"minutes":3.18,"words":955},"git":{},"filePathRelative":"tittle-tattle/一次爬取网站的经历.md","bulletin":false}');export{p as comp,d as data};