import{_ as s,c as a,a as i,o as e}from"./app-C3CPT0za.js";const l={};function p(c,n){return e(),a("div",null,n[0]||(n[0]=[i(`<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>最近在看《Go语言精进之路 从新手到高手的编程思想、方法和技巧1》一书，其中提到了 Go 语言之父 Rob Pike 的一句关于并发和并行的话：<mark>&quot;并发不是并行，并发关乎结构，并行关乎执行&quot;</mark>，值得我们深入思考。</p><ul><li>相关的 talk slide：https://go.dev/talks/2012/waza.slide。</li></ul><h2 id="rob-说并发和并行" tabindex="-1"><a class="header-anchor" href="#rob-说并发和并行"><span>Rob 说并发和并行</span></a></h2><p>我们先来看看 Go 之父 Rob Pike 是怎么解释并发和并行的。</p><p>Concurrency：Programming as the composition of independently executing processes. Processes in the general sense, not Linux processes. Famously hard to define.</p><p>Parallelism：Programming as the simultaneous execution of (possibly related) computations.</p><p>Concurrency vs Parallelism：</p><ul><li>Concurrency is about dealing with lots of things at once.</li><li>Parallelism is about doing lots of things at once.</li><li>Not the same, but related.</li><li>Concurrency is about structure, parallelism is about execution.</li><li><mark>Concurrency provides a way to structure a solution to solve a problem that may (but not necessarily) be parallelizable.</mark></li></ul><p>感兴趣的话，可以自己翻译一下，整段话中，比较核心的是最后一句，<strong>并发提供了一种构建解决方案的方法，以解决可能（但不一定）可以并行化的问题。</strong></p><p>那么我自己的理解就是，当我们拿到一个编程问题时，我们可以通过合理的方案设计将解决该问题的解决方案做出 <strong>结构</strong> 化的拆分，如果我们将拆分之后的程序跑在多核 CPU 上，那么就可以并行 <strong>执行</strong>。</p><p>这里，所谓 <strong>结构</strong> 化的拆分，另一种理解方式就是 <strong>逻辑上的同时发生</strong>，与之对应的，并行就是 <strong>物理上的同时发生</strong>。</p><h2 id="举个例子" tabindex="-1"><a class="header-anchor" href="#举个例子"><span>举个例子</span></a></h2><p>我们考虑一个比较简单的例子，我给你一个序列，返回序列中每个数的平方数。</p><p>当然，一个很简单的实现如下：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import &quot;fmt&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>    nums := []int{1, 2, 3, 4, 5}</span></span>
<span class="line"><span>    calc(nums)</span></span>
<span class="line"><span>    fmt.Println(nums)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func calc(nums []int) {</span></span>
<span class="line"><span>    for i := range nums {</span></span>
<span class="line"><span>        nums[i] = nums[i] * nums[i]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你也看到了这其实是串行的计算，下面我们通过“并发”来做结构化的拆分：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import &quot;fmt&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>    nums := []int{1, 2, 3, 4, 5}</span></span>
<span class="line"><span>    rsChan := make(chan int, len(nums))</span></span>
<span class="line"><span>    defer close(rsChan)</span></span>
<span class="line"><span>    for _, num := range nums {</span></span>
<span class="line"><span>        go calc(num, rsChan)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    for range nums {</span></span>
<span class="line"><span>        fmt.Println(&lt;-rsChan)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func calc(num int, rsChan chan&lt;- int) {</span></span>
<span class="line"><span>    rsChan &lt;- num * num</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样我们就实现了结构上的“并发”，因为每一个数字的计算都是开启了新的协程，当然，还看不出来好处，那如何计算结果很耗时呢？</p><p>来看一个测试：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import (</span></span>
<span class="line"><span>    &quot;fmt&quot;</span></span>
<span class="line"><span>    &quot;time&quot;</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>    nums0 := []int{1, 2, 3, 4, 5}</span></span>
<span class="line"><span>    nums1 := []int{1, 2, 3, 4, 5}</span></span>
<span class="line"><span>    calc0(nums0)</span></span>
<span class="line"><span>    calc1(nums1)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func calc0(nums []int) {</span></span>
<span class="line"><span>    start := time.Now()</span></span>
<span class="line"><span>    rsChan := make(chan int, len(nums))</span></span>
<span class="line"><span>    defer close(rsChan)</span></span>
<span class="line"><span>    for _, num := range nums {</span></span>
<span class="line"><span>        go doCalc(num, rsChan)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    for range nums {</span></span>
<span class="line"><span>        _ = &lt;-rsChan</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    fmt.Println(&quot;耗时: &quot; + time.Since(start).String())</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func doCalc(num int, rsChan chan&lt;- int) {</span></span>
<span class="line"><span>    time.Sleep(1 * time.Second)</span></span>
<span class="line"><span>    rsChan &lt;- num * num</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func calc1(nums []int) {</span></span>
<span class="line"><span>    start := time.Now()</span></span>
<span class="line"><span>    for i := range nums {</span></span>
<span class="line"><span>        time.Sleep(1 * time.Second)</span></span>
<span class="line"><span>        nums[i] = nums[i] * nums[i]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    fmt.Println(&quot;耗时: &quot; + time.Since(start).String())</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>耗时: 1.0005136s</span></span>
<span class="line"><span>耗时: 5.0028766s</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>此外，我的机器是多核的，所以可以实现并行，如果是单核机器，那就只有并发性了。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>那么，总的来说，理解并行和并发主要是三点：</p><ol><li>并发关乎结构，并行关乎执行。</li><li>并发提供了一种构建解决方案的方法，以解决可能（但不一定）可以并行化的问题。</li><li>并发是逻辑上的同时发生，并行是物理上的同时发生。</li></ol><p>最后提出一个问题，Go 的协程和 Java 的多线程一定是并发还是并行？</p><p>如果使用了协程或者多线程，那么程序一定具有并发性，但是否具有并行性还要看物理机器是否是多核 CPU。</p>`,29)]))}const r=s(l,[["render",p],["__file","index.html.vue"]]),t=JSON.parse('{"path":"/article/8k1vfaur/","title":"Concurrency is not Parallelism","lang":"zh-CN","frontmatter":{"title":"Concurrency is not Parallelism","createTime":"2025/01/27 09:26:53","permalink":"/article/8k1vfaur/","tags":["cs","go"]},"headers":[],"readingTime":{"minutes":3.07,"words":921},"git":{},"filePathRelative":"cs/Concurrency is not Parallelism.md","bulletin":false}');export{r as comp,t as data};
