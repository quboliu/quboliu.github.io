---
lang: "zh-CN"
pubDatetime: 2024-10-06T12:00:00+08:00
timezone: "Asia/Shanghai"
title: "官方文档 | Kubernetes Cluster Architecture and Control Plane Communication｜Kubernetes 集群架构与控制平面通信"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "官方文档"
  - "Kubernetes"
  - "控制平面"
  - "集群架构"
  - "etcd"
  - "分布式系统"
description: "Kubernetes 官方文档中英对照精读：把控制平面、节点组件与 API Server 双向通信路径映射到一套完整的集群架构。"
---
> **Source and translation basis｜来源与翻译依据**
>
> - [Kubernetes Components](https://kubernetes.io/docs/concepts/architecture/)
> - [Communication between Nodes and the Control Plane](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/)
>
> The English source and the official Simplified Chinese source were frozen at Kubernetes website commit [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7) (2024-08-24). Kubernetes documentation content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); code samples are licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
>
> 英文原文与简体中文官方译文均固定于 Kubernetes 网站提交 [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7)（2024-08-24）。本文逐个语义单元核对两种语言，并把官网构建时动态注入的术语定义、特性状态、示例代码与插图还原为可独立阅读的 Markdown。Kubernetes 文档内容采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可，代码示例采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0/) 许可。

---

## Kubernetes Components｜Kubernetes 组件

When you deploy Kubernetes, you get a cluster. A Kubernetes cluster consists of a set of worker
machines, called nodes, that run containerized applications. Every cluster has at least one worker
node.

The worker node(s) host the Pods that are the components of the application workload. The control
plane manages the worker nodes and the Pods in the cluster. In production environments, the control
plane usually runs across multiple computers and a cluster usually runs multiple nodes, providing
fault-tolerance and high availability.

This document outlines the various components you need to have for a complete and working
Kubernetes cluster.

> 当你部署完 Kubernetes，便拥有了一个完整的集群。Kubernetes 集群由一组称为节点的工作机器
> 构成，这些机器负责运行容器化应用。每个集群至少有一个工作节点。工作节点托管组成应用负载的
> Pod；控制平面则管理集群中的工作节点和 Pod。在生产环境中，控制平面通常跨多台计算机运行，
> 集群一般也包含多个节点，从而提供容错能力和高可用性。
>
> 本文档概述了一个完整且可正常工作的 Kubernetes 集群所需的各种组件。

![Components of Kubernetes｜Kubernetes 组件](./components-of-kubernetes.svg)

**Figure: The components of a Kubernetes cluster｜图：Kubernetes 集群的组件**

> **图解：** 控制平面通过 API Server 统一暴露集群状态，以 etcd 持久化状态，并由调度器与各类控制器作出决策；工作节点上的 kubelet、容器运行时和 kube-proxy 则把这些决策落实为正在运行的 Pod 与网络规则。图中的连线强调 API Server 是各组件协作的中心边界，而不是所有组件彼此直接耦合。

### Control Plane Components｜控制平面组件

The control plane's components make global decisions about the cluster (for example, scheduling),
as well as detecting and responding to cluster events (for example, starting up a new Pod when a
Deployment's `replicas` field is unsatisfied).

Control plane components can be run on any machine in the cluster. However, for simplicity, setup
scripts typically start all control plane components on the same machine, and do not run user
containers on this machine. See [Creating Highly Available clusters with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/)
for an example control plane setup that runs across multiple machines.

> 控制平面组件会为集群作出全局决策，例如资源调度；也会检测和响应集群事件，例如当 Deployment
> 的 `replicas` 字段未得到满足时启动新的 Pod。
>
> 控制平面组件可以在集群中的任何机器上运行。不过，为了简单起见，安装脚本通常会在同一台机器上
> 启动所有控制平面组件，并且不在这台机器上运行用户容器。有关跨多台机器部署控制平面的示例，
> 请参阅[使用 kubeadm 创建高可用集群](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/high-availability/)。

#### kube-apiserver｜kube-apiserver

The API server is a component of the Kubernetes control plane that exposes the Kubernetes API.
The API server is the front end for the Kubernetes control plane.

The main implementation of a Kubernetes API server is [kube-apiserver](https://kubernetes.io/docs/reference/generated/kube-apiserver/).
kube-apiserver is designed to scale horizontally&mdash;that is, it scales by deploying more instances.
You can run several instances of kube-apiserver and balance traffic between those instances.

> API 服务器是 Kubernetes 控制平面中负责公开 Kubernetes API 的组件，也是控制平面的前端。
> 其主要实现 `kube-apiserver` 采用横向扩展设计：可以部署多个实例，并在实例之间均衡流量。

#### etcd｜etcd

Consistent and highly-available key value store used as Kubernetes' backing store for all cluster data.

If your Kubernetes cluster uses etcd as its backing store, make sure you have a
[back up](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster) plan
for the data.

You can find in-depth information about etcd in the official [documentation](https://etcd.io/docs/).

> etcd 是一致且高可用的键值存储，用作 Kubernetes 所有集群数据的后端存储。如果 Kubernetes
> 集群使用 etcd 保存状态，请务必制定数据备份方案。

#### kube-scheduler｜kube-scheduler

Control plane component that watches for newly created Pods with no assigned node, and selects a
node for them to run on.

Factors taken into account for scheduling decisions include: individual and collective resource
requirements, hardware/software/policy constraints, affinity and anti-affinity specifications,
data locality, inter-workload interference, and deadlines.

> kube-scheduler 监视新创建但尚未分配节点的 Pod，并为其选择运行节点。调度决策会考虑资源需求、
> 软硬件及策略约束、亲和性与反亲和性、数据局部性、工作负载之间的干扰和截止时间等因素。

#### kube-controller-manager｜kube-controller-manager

Control plane component that runs controller processes.

Logically, each controller is a separate process, but to reduce complexity, they are all compiled
into a single binary and run in a single process.

> kube-controller-manager 是负责运行控制器进程的控制平面组件。从逻辑上看，每个控制器都是
> 独立进程；为了降低复杂度，它们被编译进同一个二进制文件，并在同一个进程中运行。

There are many different types of controllers. Some examples of them are:

  * Node controller: Responsible for noticing and responding when nodes go down.
  * Job controller: Watches for Job objects that represent one-off tasks, then creates
    Pods to run those tasks to completion.
  * EndpointSlice controller: Populates EndpointSlice objects (to provide a link between Services and Pods).
  * ServiceAccount controller: Create default ServiceAccounts for new namespaces.

The above is not an exhaustive list.

> 有许多不同类型的控制器。以下是一些例子：
>
> * 节点控制器（Node Controller）：负责在节点出现故障时进行通知和响应
> * 任务控制器（Job Controller）：监测代表一次性任务的 Job 对象，然后创建 Pod 来运行这些任务直至完成
> * 端点分片控制器（EndpointSlice controller）：填充端点分片（EndpointSlice）对象（以提供 Service 和 Pod 之间的链接）。
> * 服务账号控制器（ServiceAccount controller）：为新的命名空间创建默认的服务账号（ServiceAccount）。
>
> 以上并不是一个详尽的列表。

#### cloud-controller-manager｜cloud-controller-manager

Control plane component that integrates Kubernetes with third-party cloud providers.

The cloud-controller-manager only runs controllers that are specific to your cloud provider.
If you are running Kubernetes on your own premises, or in a learning environment inside your
own PC, the cluster does not have a cloud controller manager.

As with the kube-controller-manager, the cloud-controller-manager combines several logically
independent control loops into a single binary that you run as a single process. You can
scale horizontally (run more than one copy) to improve performance or to help tolerate failures.

The following controllers can have cloud provider dependencies:

  * Node controller: For checking the cloud provider to determine if a node has been deleted in the cloud after it stops responding
  * Route controller: For setting up routes in the underlying cloud infrastructure
  * Service controller: For creating, updating and deleting cloud provider load balancers

> cloud-controller-manager 是嵌入云平台特定控制逻辑的 Kubernetes 控制平面组件。它使集群能够
> 接入云提供商 API，并把需要同云平台交互的组件与只同集群交互的组件分离开来。
>
> `cloud-controller-manager` 仅运行特定于云平台的控制器。
> 因此如果你在自己的环境中运行 Kubernetes，或者在本地计算机中运行学习环境，
> 所部署的集群不需要有云控制器管理器。
>
> 与 `kube-controller-manager` 类似，`cloud-controller-manager`
> 将若干逻辑上独立的控制回路组合到同一个可执行文件中，
> 供你以同一进程的方式运行。
> 你可以对其执行水平扩容（运行不止一个副本）以提升性能或者增强容错能力。
>
> 下面的控制器都包含对云平台驱动的依赖：
>
>   * 节点控制器（Node Controller）：用于在节点终止响应后检查云提供商以确定节点是否已被删除
>   * 路由控制器（Route Controller）：用于在底层云基础架构中设置路由
>   * 服务控制器（Service Controller）：用于创建、更新和删除云提供商负载均衡器

### Node Components｜Node 组件

Node components run on every node, maintaining running pods and providing the Kubernetes runtime environment.

> 节点组件会在每个节点上运行，负责维护运行的 Pod 并提供 Kubernetes 运行环境。
>
#### kubelet｜kubelet

An agent that runs on each node in the cluster. It makes sure that containers are running in a Pod.

The [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/) takes a set of PodSpecs that
are provided through various mechanisms and ensures that the containers described in those
PodSpecs are running and healthy. The kubelet doesn't manage containers which were not created by
Kubernetes.

> kubelet 是运行在集群每个节点上的代理。它接收通过多种机制提供的 PodSpec，并确保其中描述的
> 容器处于运行且健康的状态。kubelet 不管理并非由 Kubernetes 创建的容器。

#### kube-proxy｜kube-proxy

kube-proxy is a network proxy that runs on each node in your cluster, implementing part of the
Kubernetes Service concept.

[kube-proxy](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/) maintains network rules on
nodes. These network rules allow network communication to your Pods from network sessions inside
or outside of your cluster.

kube-proxy uses the operating system packet filtering layer if there is one and it's available.
Otherwise, kube-proxy forwards the traffic itself.

> kube-proxy 是运行在集群每个节点上的网络代理，实现 Kubernetes Service 概念的一部分。它在
> 节点上维护网络规则，使集群内外的网络会话都能与 Pod 通信。如果操作系统提供可用的数据包过滤层，
> kube-proxy 会利用它；否则由 kube-proxy 自行转发流量。

#### Container runtime｜容器运行时（Container Runtime）

A fundamental component that empowers Kubernetes to run containers effectively. It is responsible
for managing the execution and lifecycle of containers within the Kubernetes environment.

Kubernetes supports container runtimes such as containerd, CRI-O, and any other implementation of
the [Kubernetes CRI (Container Runtime Interface)](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-node/container-runtime-interface.md).

> 容器运行时是负责管理容器执行与生命周期的基础组件。Kubernetes 支持 containerd、CRI-O，
> 以及其他实现 Kubernetes 容器运行时接口（CRI）的运行时。

### Addons｜插件（Addons）

Addons use Kubernetes resources (daemonset,
deployment, etc)
to implement cluster features. Because these are providing cluster-level features, namespaced resources
for addons belong within the `kube-system` namespace.

> 插件使用 Kubernetes 资源（DaemonSet、
> Deployment 等）实现集群功能。
> 因为这些插件提供集群级别的功能，插件中命名空间域的资源属于 `kube-system` 命名空间。

Selected addons are described below; for an extended list of available addons, please
see [Addons](https://kubernetes.io/docs/concepts/cluster-administration/addons/).

> 下面描述众多插件中的几种。有关可用插件的完整列表，请参见
> [插件（Addons）](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/addons/)。

#### DNS｜DNS

While the other addons are not strictly required, all Kubernetes clusters should have
[cluster DNS](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/), as many examples rely on it.

Cluster DNS is a DNS server, in addition to the other DNS server(s) in your environment,
which serves DNS records for Kubernetes services.

Containers started by Kubernetes automatically include this DNS server in their DNS searches.

> 尽管其他插件都并非严格意义上的必需组件，但几乎所有 Kubernetes
> 集群都应该有[集群 DNS](https://kubernetes.io/zh-cn/docs/concepts/services-networking/dns-pod-service/)，
> 因为很多示例都需要 DNS 服务。
>
> 集群 DNS 是一个 DNS 服务器，和环境中的其他 DNS 服务器一起工作，它为 Kubernetes 服务提供 DNS 记录。
>
> Kubernetes 启动的容器自动将此 DNS 服务器包含在其 DNS 搜索列表中。

#### Web UI (Dashboard)｜Web 界面（仪表盘）

[Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) is a general purpose,
web-based UI for Kubernetes clusters. It allows users to manage and troubleshoot applications
running in the cluster, as well as the cluster itself.

> [Dashboard](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/web-ui-dashboard/)
> 是 Kubernetes 集群的通用的、基于 Web 的用户界面。
> 它使用户可以管理集群中运行的应用程序以及集群本身，
> 并进行故障排除。

#### Container Resource Monitoring｜容器资源监控

[Container Resource Monitoring](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/)
records generic time-series metrics
about containers in a central database, and provides a UI for browsing that data.

> [容器资源监控](https://kubernetes.io/zh-cn/docs/tasks/debug/debug-cluster/resource-usage-monitoring/)
> 将关于容器的一些常见的时间序列度量值保存到一个集中的数据库中，
> 并提供浏览这些数据的界面。

#### Cluster-level Logging｜集群层面日志

A [cluster-level logging](https://kubernetes.io/docs/concepts/cluster-administration/logging/) mechanism is responsible for
saving container logs to a central log store with search/browsing interface.

> [集群层面日志](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/logging/)机制负责将容器的日志数据保存到一个集中的日志存储中，
> 这种集中日志存储提供搜索和浏览接口。

#### Network Plugins｜网络插件

[Network plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins) are software
components that implement the container network interface (CNI) specification. They are responsible for
allocating IP addresses to pods and enabling them to communicate with each other within the cluster.

> [网络插件](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins)
> 是实现容器网络接口（CNI）规范的软件组件。它们负责为 Pod 分配 IP 地址，并使这些 Pod 能在集群内部相互通信。
>
### What's next｜接下来
Learn more about the following:
   * [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/) and [their communication](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/)
     with the control plane.
   * Kubernetes [controllers](https://kubernetes.io/docs/concepts/architecture/controller/).
   * [kube-scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) which is the default scheduler for Kubernetes.
   * Etcd's official [documentation](https://etcd.io/docs/).
   * Several [container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) in Kubernetes.
   * Integrating with cloud providers using [cloud-controller-manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/).
   * [kubectl](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands) commands.

> 进一步了解以下内容：
>    * [节点](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/)及其与[控制平面](https://kubernetes.io/zh-cn/docs/concepts/architecture/control-plane-node-communication/)的通信。
>    * Kubernetes 中的[控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/)。
>    * Kubernetes 的默认调度程序 [kube-scheduler](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/kube-scheduler/)。
>    * etcd 的官方[文档](https://etcd.io/docs/)。
>    * Kubernetes 中的几个[容器运行时](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)。
>    * 使用 [cloud-controller-manager](https://kubernetes.io/zh-cn/docs/concepts/architecture/cloud-controller/) 与云提供商进行集成。
>    * [kubectl](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands) 命令。

---

## Communication between Nodes and the Control Plane｜节点与控制面之间的通信

This document catalogs the communication paths between the API server
and the Kubernetes cluster.
The intent is to allow users to customize their installation to harden the network configuration
such that the cluster can be run on an untrusted network (or on fully public IPs on a cloud
provider).

> 本文列举控制面节点（确切地说是 API 服务器）和
> Kubernetes 集群之间的通信路径。
> 目的是为了让用户能够自定义他们的安装，以实现对网络配置的加固，
> 使得集群能够在不可信的网络上（或者在一个云服务商完全公开的 IP 上）运行。

### Node to Control Plane｜节点到控制面

Kubernetes has a "hub-and-spoke" API pattern. All API usage from nodes (or the pods they run)
terminates at the API server. None of the other control plane components are designed to expose
remote services. The API server is configured to listen for remote connections on a secure HTTPS
port (typically 443) with one or more forms of client
[authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) enabled.
One or more forms of [authorization](https://kubernetes.io/docs/reference/access-authn-authz/authorization/) should be
enabled, especially if [anonymous requests](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests)
or [service account tokens](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#service-account-tokens)
are allowed.

> Kubernetes 采用的是中心辐射型（Hub-and-Spoke）API 模式。
> 所有从节点（或运行于其上的 Pod）发出的 API 调用都终止于 API 服务器。
> 其它控制面组件都没有被设计为可暴露远程服务。
> API 服务器被配置为在一个安全的 HTTPS 端口（通常为 443）上监听远程连接请求，
> 并启用一种或多种形式的客户端[身份认证](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/)机制。
> 一种或多种客户端[鉴权机制](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authorization/)应该被启用，
> 特别是在允许使用[匿名请求](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/#anonymous-requests)
> 或[服务账户令牌](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/#service-account-tokens)的时候。

Nodes should be provisioned with the public root certificate for the cluster such that they can
connect securely to the API server along with valid client credentials. A good approach is that the
client credentials provided to the kubelet are in the form of a client certificate. See
[kubelet TLS bootstrapping](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/)
for automated provisioning of kubelet client certificates.

> 应该使用集群的公共根证书开通节点，
> 这样它们就能够基于有效的客户端凭据安全地连接 API 服务器。
> 一种好的方法是以客户端证书的形式将客户端凭据提供给 kubelet。
> 请查看 [kubelet TLS 启动引导](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/)
> 以了解如何自动提供 kubelet 客户端证书。

Pods that wish to connect to the API server can do so securely by leveraging a service account so
that Kubernetes will automatically inject the public root certificate and a valid bearer token
into the pod when it is instantiated.
The `kubernetes` service (in `default` namespace) is configured with a virtual IP address that is
redirected (via `kube-proxy`) to the HTTPS endpoint on the API server.

The control plane components also communicate with the API server over the secure port.

> 想要连接到 API 服务器的 Pod
> 可以使用服务账号安全地进行连接。
> 当 Pod 被实例化时，Kubernetes 自动把公共根证书和一个有效的持有者令牌注入到 Pod 里。
> `kubernetes` 服务（位于 `default` 名字空间中）配置了一个虚拟 IP 地址，
> 用于（通过 `kube-proxy`）转发请求到
> API 服务器的 HTTPS 末端。
>
> 控制面组件也通过安全端口与集群的 API 服务器通信。

As a result, the default operating mode for connections from the nodes and pod running on the
nodes to the control plane is secured by default and can run over untrusted and/or public
networks.

> 这样，从集群节点和节点上运行的 Pod 到控制面的连接的缺省操作模式即是安全的，
> 能够在不可信的网络或公网上运行。

### Control plane to node｜控制面到节点

There are two primary communication paths from the control plane (the API server) to the nodes.
The first is from the API server to the kubelet process which runs on each node in the cluster.
The second is from the API server to any node, pod, or service through the API server's _proxy_
functionality.

> 从控制面（API 服务器）到节点有两种主要的通信路径。
> 第一种是从 API 服务器到集群中每个节点上运行的
> kubelet 进程。
> 第二种是从 API 服务器通过它的**代理**功能连接到任何节点、Pod 或者服务。

#### API server to kubelet｜API 服务器到 kubelet

The connections from the API server to the kubelet are used for:

* Fetching logs for pods.
* Attaching (usually through `kubectl`) to running pods.
* Providing the kubelet's port-forwarding functionality.

These connections terminate at the kubelet's HTTPS endpoint. By default, the API server does not
verify the kubelet's serving certificate, which makes the connection subject to man-in-the-middle
attacks and **unsafe** to run over untrusted and/or public networks.

> 从 API 服务器到 kubelet 的连接用于：
>
> * 获取 Pod 日志。
> * 挂接（通过 kubectl）到运行中的 Pod。
> * 提供 kubelet 的端口转发功能。
>
> 这些连接终止于 kubelet 的 HTTPS 末端。
> 默认情况下，API 服务器不检查 kubelet 的服务证书。这使得此类连接容易受到中间人攻击，
> 在非受信网络或公开网络上运行也是 **不安全的**。

To verify this connection, use the `--kubelet-certificate-authority` flag to provide the API
server with a root certificate bundle to use to verify the kubelet's serving certificate.

If that is not possible, use [SSH tunneling](#ssh-tunnels) between the API server and kubelet if
required to avoid connecting over an
untrusted or public network.

Finally, [Kubelet authentication and/or authorization](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/)
should be enabled to secure the kubelet API.

> 为了对这个连接进行认证，使用 `--kubelet-certificate-authority` 标志给
> API 服务器提供一个根证书包，用于 kubelet 的服务证书。
>
> 如果无法实现这点，又要求避免在非受信网络或公共网络上进行连接，可在 API 服务器和
> kubelet 之间使用 [SSH 隧道](#ssh-tunnels)。
>
> 最后，应该启用
> [Kubelet 认证/鉴权](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/kubelet-authn-authz/)
> 来保护 kubelet API。

#### API server to nodes, pods, and services｜API 服务器到节点、Pod 和服务

The connections from the API server to a node, pod, or service default to plain HTTP connections
and are therefore neither authenticated nor encrypted. They can be run over a secure HTTPS
connection by prefixing `https:` to the node, pod, or service name in the API URL, but they will
not validate the certificate provided by the HTTPS endpoint nor provide client credentials. So
while the connection will be encrypted, it will not provide any guarantees of integrity. These
connections **are not currently safe** to run over untrusted or public networks.

> 从 API 服务器到节点、Pod 或服务的连接默认为纯 HTTP 方式，因此既没有认证，也没有加密。
> 这些连接可通过给 API URL 中的节点、Pod 或服务名称添加前缀 `https:` 来运行在安全的 HTTPS 连接上。
> 不过这些连接既不会验证 HTTPS 末端提供的证书，也不会提供客户端证书。
> 因此，虽然连接是加密的，仍无法提供任何完整性保证。
> 这些连接 **目前还不能安全地** 在非受信网络或公共网络上运行。

#### SSH tunnels｜SSH 隧道

Kubernetes supports [SSH tunnels](https://www.ssh.com/academy/ssh/tunneling) to protect the control plane to nodes communication paths. In this
configuration, the API server initiates an SSH tunnel to each node in the cluster (connecting to
the SSH server listening on port 22) and passes all traffic destined for a kubelet, node, pod, or
service through the tunnel.
This tunnel ensures that the traffic is not exposed outside of the network in which the nodes are
running.

> Kubernetes 支持使用
> [SSH 隧道](https://www.ssh.com/academy/ssh/tunneling)来保护从控制面到节点的通信路径。
> 在这种配置下，API 服务器建立一个到集群中各节点的 SSH 隧道（连接到在 22 端口监听的 SSH 服务器）
> 并通过这个隧道传输所有到 kubelet、节点、Pod 或服务的请求。
> 这一隧道保证通信不会被暴露到集群节点所运行的网络之外。
>
> **Note｜说明**
SSH tunnels are currently deprecated, so you shouldn't opt to use them unless you know what you
are doing. The [Konnectivity service](#konnectivity-service) is a replacement for this
communication channel.

> SSH 隧道目前已被废弃。除非你了解个中细节，否则不应使用。
> [Konnectivity 服务](#konnectivity-service)是 SSH 隧道的替代方案。

#### Konnectivity service｜Konnectivity 服务

**Feature state: Kubernetes v1.18 [beta]｜特性状态：Kubernetes v1.18 [beta]**

As a replacement to the SSH tunnels, the Konnectivity service provides TCP level proxy for the
control plane to cluster communication. The Konnectivity service consists of two parts: the
Konnectivity server in the control plane network and the Konnectivity agents in the nodes network.
The Konnectivity agents initiate connections to the Konnectivity server and maintain the network
connections.
After enabling the Konnectivity service, all control plane to nodes traffic goes through these
connections.

Follow the [Konnectivity service task](https://kubernetes.io/docs/tasks/extend-kubernetes/setup-konnectivity/) to set
up the Konnectivity service in your cluster.

> 作为 SSH 隧道的替代方案，Konnectivity 服务提供 TCP 层的代理，以便支持从控制面到集群的通信。
> Konnectivity 服务包含两个部分：Konnectivity 服务器和 Konnectivity 代理，
> 分别运行在控制面网络和节点网络中。
> Konnectivity 代理建立并维持到 Konnectivity 服务器的网络连接。
> 启用 Konnectivity 服务之后，所有控制面到节点的通信都通过这些连接传输。
>
> 请浏览 [Konnectivity 服务任务](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/setup-konnectivity/)
> 在你的集群中配置 Konnectivity 服务。
>
### What's next｜接下来
* Read about the [Kubernetes control plane components](https://kubernetes.io/docs/concepts/overview/components/#control-plane-components)
* Learn more about [Hubs and Spoke model](https://book.kubebuilder.io/multiversion-tutorial/conversion-concepts.html#hubs-spokes-and-other-wheel-metaphors)
* Learn how to [Secure a Cluster](https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/)
* Learn more about the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/)
* [Set up Konnectivity service](https://kubernetes.io/docs/tasks/extend-kubernetes/setup-konnectivity/)
* [Use Port Forwarding to Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
* Learn how to [Fetch logs for Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#examine-pod-logs), [use kubectl port-forward](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod)

> * 阅读 [Kubernetes 控制面组件](https://kubernetes.io/zh-cn/docs/concepts/overview/components/#control-plane-components)
> * 进一步了解 [Hubs and Spoke model](https://book.kubebuilder.io/multiversion-tutorial/conversion-concepts.html#hubs-spokes-and-other-wheel-metaphors)
> * 进一步了解如何[保护集群](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/securing-a-cluster/)
> * 进一步了解 [Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/)
> * [设置 Konnectivity 服务](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/setup-konnectivity/)
> * [使用端口转发来访问集群中的应用](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
> * 学习如何[检查 Pod 的日志](https://kubernetes.io/zh-cn/docs/tasks/debug/debug-application/debug-running-pod/#examine-pod-logs)
>   以及如何[使用 kubectl 端口转发](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod)
