import{_ as p,c as s,a as r,b as t,d as a,e as i,w as d,r as o,o as l}from"./app-CkY5Gb3L.js";const h={};function m(c,e){const n=o("RouteLink");return l(),s("div",null,[e[2]||(e[2]=r('<h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h2><p>这篇文章对我目前理解的分布式系统做一个介绍，包括什么是分布式系统，引入分布式系统带来的数据一致性问题。</p><h2 id="什么是分布式系统" tabindex="-1"><a class="header-anchor" href="#什么是分布式系统"><span>什么是分布式系统</span></a></h2><p>我们先说说什么是分布式系统，我目前对分布式系统的理解其实很粗俗。</p><p>随着互联网业务的发展，传统的、部署在单机上的单体架构已经无法承受用户的高并发请求的访问，因为一台计算机的内存、CPU 资源是有上限的，当压榨一台机器达到瓶颈时，我们就不得不想其他的办法来提升整个系统的可支配的资源上限。</p><p>一个显而易见的方式就是堆机器，我们将原来系统中的业务模块做拆分，拆分成一个个更小的业务模型，比如结算域、订单域、交易域等，然后将这些更小的业务域部署到不同的机器上，更进一步的，我们还可以在多台机器上部署相同的服务，做成集群，整体通过负载均衡对外提供服务。</p><p>这样机器一多，那么整个系统能够支配的 CPU、内存、存储资源也会更多，就能应对更高的并发和流量。</p><h2 id="数据一致性问题" tabindex="-1"><a class="header-anchor" href="#数据一致性问题"><span>数据一致性问题</span></a></h2><p>虽然通过增加机器解决了整个系统的资源瓶颈，但是也带来了一些额外的问题。</p><p>首当其冲的就是节点之间如何进行通信，同一个节点上进程间的通信（IPC）可以基于消息队列、共享内存、管道等来实现，但是对于跨节点进程通信，就不得不使用 Socket 网络通信。</p><p>但网络总是不可靠的，它会带来接口调用的第三种结果，超时，这种不知道实际成功还是失败的结果又会引发一些其他的问题，比如数据一致性问题。</p><p>以电商交易场景为例，用户支付订单这一核心操作的同时会涉及到下游物流发货、积分变更、购物车状态清空等多个子系统的变更。</p><p>假设支付订单之后远程调用下游物流发货超时，那我们支付订单这个事务是要提交还是回滚呢？如果支付回滚，但实际上物流发货成功，这出现了数据不一致的问题，如果支付提交，但实际上物流发货失败，这还是出现了数据不一致性的问题。</p><p>所以正是由于网络调用超时的出现，我们不确定下游系统的状态，从而导致了数据不一致的问题。</p><p>实际上，这种数据不一致更多的体现在事务不一致，这其中掺杂着分布式事务的解决方案，除此之外，还有一种副本一致性。</p>',15)),t("p",null,[e[1]||(e[1]=a("更多数据一致性的内容，你可以参考：")),i(n,{to:"/distributed/consistency/CAP%20%E5%92%8C%E4%B8%80%E8%87%B4%E6%80%A7%E7%90%86%E8%AE%BA.html"},{default:d(()=>e[0]||(e[0]=[a("CAP 和一致性理论")])),_:1})]),e[3]||(e[3]=t("h2",{id:"后记",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#后记"},[t("span",null,"后记")])],-1)),e[4]||(e[4]=t("p",null,"后面不断成长，应该会有一些更深刻的体会，不断更新。",-1))])}const f=p(h,[["render",m],["__file","index.html.vue"]]),x=JSON.parse('{"path":"/article/hm1pqvhv/","title":"分布式","lang":"zh-CN","frontmatter":{"title":"分布式","createTime":"2024/10/31 21:52:35","permalink":"/article/hm1pqvhv/","tags":["distributed"]},"headers":[],"readingTime":{"minutes":2.75,"words":825},"git":{},"filePathRelative":"distributed/分布式.md","bulletin":false}');export{f as comp,x as data};