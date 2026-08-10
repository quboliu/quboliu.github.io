---
lang: "zh-CN"
pubDatetime: 2025-04-13T12:00:00+08:00
timezone: "Asia/Shanghai"
title: "官方文档 | Custom Resources and Operator Pattern｜自定义资源与 Operator 模式"
contentType: "docs-translation"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "官方文档"
  - "Kubernetes"
  - "CRD"
  - "Operator"
  - "控制器"
  - "声明式 API"
description: "Kubernetes 官方文档中英对照精读：比较 CRD 与聚合 API，解释自定义控制器如何把运维知识编码为 Operator。"
---
> **Source and translation basis｜来源与翻译依据**
>
> - [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
> - [Operator Pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
>
> The English source and the official Simplified Chinese source were frozen at Kubernetes website commit [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7) (2024-08-24). Kubernetes documentation content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); code samples are licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
>
> 英文原文与简体中文官方译文均固定于 Kubernetes 网站提交 [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7)（2024-08-24）。本文逐个语义单元核对两种语言，并把官网构建时动态注入的术语定义、特性状态、示例代码与插图还原为可独立阅读的 Markdown。Kubernetes 文档内容采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可，代码示例采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0/) 许可。

---

## Custom Resources｜定制资源

*Custom resources* are extensions of the Kubernetes API. This page discusses when to add a custom
resource to your Kubernetes cluster and when to use a standalone service. It describes the two
methods for adding custom resources and how to choose between them.

> **定制资源（Custom Resource）** 是对 Kubernetes API 的扩展。
> 本页讨论何时向 Kubernetes 集群添加定制资源，何时使用独立的服务。
> 本页描述添加定制资源的两种方法以及怎样在二者之间做出抉择。

### Custom resources｜定制资源

A *resource* is an endpoint in the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/) that
stores a collection of API objects
of a certain kind; for example, the built-in *pods* resource contains a collection of Pod objects.

> **资源（Resource）** 是
> [Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/) 中的一个端点，
> 其中存储的是某个类别的
> API 对象的一个集合。
> 例如内置的 **Pod** 资源包含一组 Pod 对象。

A *custom resource* is an extension of the Kubernetes API that is not necessarily available in a default
Kubernetes installation. It represents a customization of a particular Kubernetes installation. However,
many core Kubernetes functions are now built using custom resources, making Kubernetes more modular.

Custom resources can appear and disappear in a running cluster through dynamic registration,
and cluster admins can update custom resources independently of the cluster itself.
Once a custom resource is installed, users can create and access its objects using
kubectl, just as they do for built-in resources
like *Pods*.

> **定制资源（Custom Resource）** 是对 Kubernetes API 的扩展，不一定在默认的
> Kubernetes 安装中就可用。定制资源所代表的是对特定 Kubernetes 安装的一种定制。
> 不过，很多 Kubernetes 核心功能现在都用定制资源来实现，这使得 Kubernetes 更加模块化。
>
> 定制资源可以通过动态注册的方式在运行中的集群内或出现或消失，集群管理员可以独立于集群更新定制资源。
> 一旦某定制资源被安装，用户可以使用 kubectl
> 来创建和访问其中的对象，就像他们为 **Pod** 这种内置资源所做的一样。

### Custom controllers｜定制控制器

On their own, custom resources let you store and retrieve structured data.
When you combine a custom resource with a *custom controller*, custom resources
provide a true _declarative API_.

> 就定制资源本身而言，它只能用来存取结构化的数据。
> 当你将定制资源与**定制控制器（Custom Controller）** 结合时，
> 定制资源就能够提供真正的**声明式 API（Declarative API）**。

The Kubernetes [declarative API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/)
enforces a separation of responsibilities. You declare the desired state of
your resource. The Kubernetes controller keeps the current state of Kubernetes
objects in sync with your declared desired state. This is in contrast to an
imperative API, where you *instruct* a server what to do.

> Kubernetes [声明式 API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/) 强制对职权做了一次分离操作。
> 你声明所用资源的期望状态，而 Kubernetes 控制器使 Kubernetes 对象的当前状态与你所声明的期望状态保持同步。
> 声明式 API 的这种机制与命令式 API（你**指示**服务器要做什么，服务器就去做什么）形成鲜明对比。

You can deploy and update a custom controller on a running cluster, independently
of the cluster's lifecycle. Custom controllers can work with any kind of resource,
but they are especially effective when combined with custom resources. The
[Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) combines custom
resources and custom controllers. You can use custom controllers to encode domain knowledge
for specific applications into an extension of the Kubernetes API.

> 你可以在一个运行中的集群上部署和更新定制控制器，这类操作与集群的生命周期无关。
> 定制控制器可以用于任何类别的资源，不过它们与定制资源结合起来时最为有效。
> [Operator 模式](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/operator/)就是将定制资源与定制控制器相结合的。
> 你可以使用定制控制器来将特定于某应用的领域知识组织起来，以编码的形式构造对 Kubernetes API 的扩展。

### Should I add a custom resource to my Kubernetes cluster?｜我是否应该向我的 Kubernetes 集群添加定制资源？

When creating a new API, consider whether to
[aggregate your API with the Kubernetes cluster APIs](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)
or let your API stand alone.

> 在创建新的 API 时，
> 请考虑是[将你的 API 与 Kubernetes 集群 API 聚合起来](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)，
> 还是让你的 API 独立运行。

| Consider API aggregation if: | Prefer a stand-alone API if: |
| ---------------------------- | ---------------------------- |
| Your API is [Declarative](#declarative-apis). | Your API does not fit the [Declarative](#declarative-apis) model. |
| You want your new types to be readable and writable using `kubectl`.| `kubectl` support is not required |
| You want to view your new types in a Kubernetes UI, such as dashboard, alongside built-in types. | Kubernetes UI support is not required. |
| You are developing a new API. | You already have a program that serves your API and works well. |
| You are willing to accept the format restriction that Kubernetes puts on REST resource paths, such as API Groups and Namespaces. (See the [API Overview](https://kubernetes.io/docs/concepts/overview/kubernetes-api/).) | You need to have specific REST paths to be compatible with an already defined REST API. |
| Your resources are naturally scoped to a cluster or namespaces of a cluster. | Cluster or namespace scoped resources are a poor fit; you need control over the specifics of resource paths. |
| You want to reuse [Kubernetes API support features](#common-features).  | You don't need those features. |

> | 考虑 API 聚合的情况 | 优选独立 API 的情况 |
> | ---------------------------- | ---------------------------- |
> | 你的 API 是[声明式的](#declarative-apis)。 | 你的 API 不符合[声明式](#declarative-apis)模型。 |
> | 你希望可以是使用 `kubectl` 来读写你的新资源类别。 | 不要求 `kubectl` 支持。 |
> | 你希望在 Kubernetes UI （如仪表板）中和其他内置类别一起查看你的新资源类别。 | 不需要 Kubernetes UI 支持。 |
> | 你在开发新的 API。 | 你已经有一个提供 API 服务的程序并且工作良好。 |
> | 你有意愿取接受 Kubernetes 对 REST 资源路径所作的格式限制，例如 API 组和名字空间。（参阅 [API 概述](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/)） | 你需要使用一些特殊的 REST 路径以便与已经定义的 REST API 保持兼容。 |
> | 你的资源可以自然地界定为集群作用域或集群中某个名字空间作用域。 | 集群作用域或名字空间作用域这种二分法很不合适；你需要对资源路径的细节进行控制。 |
> | 你希望复用 [Kubernetes API 支持特性](#common-features)。  | 你不需要这类特性。 |

#### Declarative APIs｜声明式 API

In a Declarative API, typically:

- Your API consists of a relatively small number of relatively small objects (resources).
- The objects define configuration of applications or infrastructure.
- The objects are updated relatively infrequently.
- Humans often need to read and write the objects.
- The main operations on the objects are CRUD-y (creating, reading, updating and deleting).
- Transactions across objects are not required: the API represents a desired state, not an exact state.

> 典型地，在声明式 API 中：
>
> - 你的 API 包含相对而言为数不多的、尺寸较小的对象（资源）。
> - 对象定义了应用或者基础设施的配置信息。
> - 对象更新操作频率较低。
> - 通常需要人来读取或写入对象。
> - 对象的主要操作是 CRUD 风格的（创建、读取、更新和删除）。
> - 不需要跨对象的事务支持：API 对象代表的是期望状态而非确切实际状态。

Imperative APIs are not declarative.
Signs that your API might not be declarative include:

- The client says "do this", and then gets a synchronous response back when it is done.
- The client says "do this", and then gets an operation ID back, and has to check a separate
  Operation object to determine completion of the request.
- You talk about Remote Procedure Calls (RPCs).
- Directly storing large amounts of data; for example, > a few kB per object, or > 1000s of objects.
- High bandwidth access (10s of requests per second sustained) needed.
- Store end-user data (such as images, PII, etc.) or other large-scale data processed by applications.
- The natural operations on the objects are not CRUD-y.
- The API is not easily modeled as objects.
- You chose to represent pending operations with an operation ID or an operation object.

> 命令式 API（Imperative API）与声明式有所不同。
> 以下迹象表明你的 API 可能不是声明式的：
>
> - 客户端发出“做这个操作”的指令，之后在该操作结束时获得同步响应。
> - 客户端发出“做这个操作”的指令，并获得一个操作 ID，之后需要检查一个 Operation（操作）
>   对象来判断请求是否成功完成。
> - 你会将你的 API 类比为远程过程调用（Remote Procedure Call，RPC）。
> - 直接存储大量数据；例如每个对象几 kB，或者存储上千个对象。
> - 需要较高的访问带宽（长期保持每秒数十个请求）。
> - 存储有应用来处理的最终用户数据（如图片、个人标识信息（PII）等）或者其他大规模数据。
> - 在对象上执行的常规操作并非 CRUD 风格。
> - API 不太容易用对象来建模。
> - 你决定使用操作 ID 或者操作对象来表现悬决的操作。

### Should I use a ConfigMap or a custom resource?｜我应该使用一个 ConfigMap 还是一个定制资源？

Use a ConfigMap if any of the following apply:

* There is an existing, well-documented configuration file format, such as a `mysql.cnf` or
  `pom.xml`.
* You want to put the entire configuration into one key of a ConfigMap.
* The main use of the configuration file is for a program running in a Pod on your cluster to
  consume the file to configure itself.
* Consumers of the file prefer to consume via file in a Pod or environment variable in a pod,
  rather than the Kubernetes API.
* You want to perform rolling updates via Deployment, etc., when the file is updated.

> 如果满足以下条件之一，应该使用 ConfigMap：
>
> * 存在一个已有的、文档完备的配置文件格式约定，例如 `mysql.cnf` 或 `pom.xml`。
> * 你希望将整个配置文件放到某 configMap 中的一个主键下面。
> * 配置文件的主要用途是针对运行在集群中 Pod 内的程序，供后者依据文件数据配置自身行为。
> * 文件的使用者期望以 Pod 内文件或者 Pod 内环境变量的形式来使用文件数据，
>   而不是通过 Kubernetes API。
> * 你希望当文件被更新时通过类似 Deployment 之类的资源完成滚动更新操作。
>
> **Note｜说明**
Use a Secret for sensitive data, which is similar
to a ConfigMap but more secure.

> 请使用 Secret 来保存敏感数据。
> Secret 类似于 configMap，但更为安全。

Use a custom resource (CRD or Aggregated API) if most of the following apply:

* You want to use Kubernetes client libraries and CLIs to create and update the new resource.
* You want top-level support from `kubectl`; for example, `kubectl get my-object object-name`.
* You want to build new automation that watches for updates on the new object, and then CRUD other
  objects, or vice versa.
* You want to write automation that handles updates to the object.
* You want to use Kubernetes API conventions like `.spec`, `.status`, and `.metadata`.
* You want the object to be an abstraction over a collection of controlled resources, or a
  summarization of other resources.

> 如果以下条件中大多数都被满足，你应该使用定制资源（CRD 或者 聚合 API）：
>
> * 你希望使用 Kubernetes 客户端库和 CLI 来创建和更改新的资源。
> * 你希望 `kubectl` 能够直接支持你的资源；例如，`kubectl get my-object object-name`。
> * 你希望构造新的自动化机制，监测新对象上的更新事件，并对其他对象执行 CRUD
>   操作，或者监测后者更新前者。
> * 你希望编写自动化组件来处理对对象的更新。
> * 你希望使用 Kubernetes API 对诸如 `.spec`、`.status` 和 `.metadata` 等字段的约定。
> * 你希望对象是对一组受控资源的抽象，或者对其他资源的归纳提炼。

### Adding custom resources｜添加定制资源

Kubernetes provides two ways to add custom resources to your cluster:

- CRDs are simple and can be created without any programming.
- [API Aggregation](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)
  requires programming, but allows more control over API behaviors like how data is stored and
  conversion between API versions.

> Kubernetes 提供了两种方式供你向集群中添加定制资源：
>
> - CRD 相对简单，创建 CRD 可以不必编程。
> - [API 聚合](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)需要编程，
>   但支持对 API 行为进行更多的控制，例如数据如何存储以及在不同 API 版本间如何转换等。

Kubernetes provides these two options to meet the needs of different users, so that neither ease
of use nor flexibility is compromised.

Aggregated APIs are subordinate API servers that sit behind the primary API server, which acts as
a proxy. This arrangement is called [API Aggregation](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)(AA).
To users, the Kubernetes API appears extended.

CRDs allow users to create new types of resources without adding another API server. You do not
need to understand API Aggregation to use CRDs.

Regardless of how they are installed, the new resources are referred to as Custom Resources to
distinguish them from built-in Kubernetes resources (like pods).

> Kubernetes 提供这两种选项以满足不同用户的需求，这样就既不会牺牲易用性也不会牺牲灵活性。
>
> 聚合 API 指的是一些下位的 API 服务器，运行在主 API 服务器后面；主 API
> 服务器以代理的方式工作。这种组织形式称作
> [API 聚合（API Aggregation，AA）](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/) 。
> 对用户而言，看起来仅仅是 Kubernetes API 被扩展了。
>
> CRD 允许用户创建新的资源类别同时又不必添加新的 API 服务器。
> 使用 CRD 时，你并不需要理解 API 聚合。
>
> 无论以哪种方式安装定制资源，新的资源都会被当做定制资源，以便与内置的
> Kubernetes 资源（如 Pods）相区分。
>
> **Note｜说明**
Avoid using a Custom Resource as data storage for application, end user, or monitoring data:
architecture designs that store application data within the Kubernetes API typically represent
a design that is too closely coupled.

Architecturally, [cloud native](https://www.cncf.io/about/faq/#what-is-cloud-native) application architectures
favor loose coupling between components. If part of your workload requires a backing service for
its routine operation, run that backing service as a component or consume it as an external service.
This way, your workload does not rely on the Kubernetes API for its normal operation.

> 避免将定制资源用于存储应用、最终用户或监控数据：
> 将应用数据存储在 Kubernetes API 内的架构设计通常代表一种过于紧密耦合的设计。
>
> 在架构上，[云原生](https://www.cncf.io/about/faq/#what-is-cloud-native)应用架构倾向于各组件之间的松散耦合。
> 如果部分工作负载需要支持服务来维持其日常运转，则这种支持服务应作为一个组件运行或作为一个外部服务来使用。
> 这样，工作负载的正常运转就不会依赖 Kubernetes API 了。

### CustomResourceDefinitions｜CustomResourceDefinitions

The [CustomResourceDefinition](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
API resource allows you to define custom resources.
Defining a CRD object creates a new custom resource with a name and schema that you specify.
The Kubernetes API serves and handles the storage of your custom resource.
The name of the CRD object itself must be a valid
[DNS subdomain name](https://kubernetes.io/docs/concepts/overview/working-with-objects/names#dns-subdomain-names) derived from the defined resource name and its API group; see [how to create a CRD](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions#create-a-customresourcedefinition) for more details.
Further, the name of an object whose kind/resource is defined by a CRD must also be a valid DNS subdomain name.

> [CustomResourceDefinition](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
> API 资源允许你定义定制资源。
> 定义 CRD 对象的操作会使用你所设定的名字和模式定义（Schema）创建一个新的定制资源，
> Kubernetes API 负责为你的定制资源提供存储和访问服务。
> CRD 对象的名称必须是有效的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)，
> 该名称由定义的资源名称及其 API 组派生而来。有关详细信息，
> 请参见[如何创建 CRD](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions#create-a-customresourcedefinition)。
> 此外，由 CRD 定义的某种对象/资源的名称也必须是有效的 DNS 子域名。

This frees you from writing your own API server to handle the custom resource,
but the generic nature of the implementation means you have less flexibility than with
[API server aggregation](#api-server-aggregation).

Refer to the [custom controller example](https://github.com/kubernetes/sample-controller)
for an example of how to register a new custom resource, work with instances of your new resource type,
and use a controller to handle events.

> CRD 使得你不必编写自己的 API 服务器来处理定制资源，不过其背后实现的通用性也意味着你所获得的灵活性要比
> [API 服务器聚合](#api-server-aggregation)少很多。
>
> 关于如何注册新的定制资源、使用新资源类别的实例以及如何使用控制器来处理事件，
> 相关的例子可参见[定制控制器示例](https://github.com/kubernetes/sample-controller)。

### API server aggregation｜API 服务器聚合

Usually, each resource in the Kubernetes API requires code that handles REST requests and manages
persistent storage of objects. The main Kubernetes API server handles built-in resources like
*pods* and *services*, and can also generically handle custom resources through
[CRDs](#customresourcedefinitions).

The [aggregation layer](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)
allows you to provide specialized implementations for your custom resources by writing and
deploying your own API server.
The main API server delegates requests to your API server for the custom resources that you handle,
making them available to all of its clients.

> 通常，Kubernetes API 中的每个资源都需要处理 REST 请求和管理对象持久性存储的代码。
> Kubernetes API 主服务器能够处理诸如 **Pod** 和 **Service** 这些内置资源，
> 也可以按通用的方式通过 [CRD](#customresourcedefinitions) 来处理定制资源。
>
> [聚合层（Aggregation Layer）](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)
> 使得你可以通过编写和部署你自己的 API 服务器来为定制资源提供特殊的实现。
> 主 API 服务器将针对你要处理的定制资源的请求全部委托给你自己的 API 服务器来处理，
> 同时将这些资源提供给其所有客户端。

### Choosing a method for adding custom resources｜选择添加定制资源的方法

CRDs are easier to use. Aggregated APIs are more flexible. Choose the method that best meets your needs.

Typically, CRDs are a good fit if:

* You have a handful of fields
* You are using the resource within your company, or as part of a small open-source project (as
  opposed to a commercial product)

> CRD 更为易用；聚合 API 则更为灵活。请选择最符合你的需要的方法。
>
> 通常，如果存在以下情况，CRD 可能更合适：
>
> * 定制资源的字段不多；
> * 你在组织内部使用该资源或者在一个小规模的开源项目中使用该资源，而不是在商业产品中使用。

#### Comparing ease of use｜比较易用性

CRDs are easier to create than Aggregated APIs.

> CRD 比聚合 API 更容易创建。

| CRDs                        | Aggregated API |
| --------------------------- | -------------- |
| Do not require programming. Users can choose any language for a CRD controller. | Requires programming and building binary and image. |
| No additional service to run; CRDs are handled by API server. | An additional service to create and that could fail. |
| No ongoing support once the CRD is created. Any bug fixes are picked up as part of normal Kubernetes Master upgrades. | May need to periodically pickup bug fixes from upstream and rebuild and update the Aggregated API server. |
| No need to handle multiple versions of your API; for example, when you control the client for this resource, you can upgrade it in sync with the API. | You need to handle multiple versions of your API; for example, when developing an extension to share with the world. |

> | CRD                        | 聚合 API       |
> | --------------------------- | -------------- |
> | 无需编程。用户可选择任何语言来实现 CRD 控制器。 | 需要编程，并构建可执行文件和镜像。 |
> | 无需额外运行服务；CRD 由 API 服务器处理。 | 需要额外创建服务，且该服务可能失效。 |
> | 一旦 CRD 被创建，不需要持续提供支持。Kubernetes 主控节点升级过程中自动会带入缺陷修复。 | 可能需要周期性地从上游提取缺陷修复并更新聚合 API 服务器。 |
> | 无需处理 API 的多个版本；例如，当你控制资源的客户端时，你可以更新它使之与 API 同步。 | 你需要处理 API 的多个版本；例如，在开发打算与很多人共享的扩展时。 |

#### Advanced features and flexibility｜高级特性与灵活性

Aggregated APIs offer more advanced API features and customization of other features; for example, the storage layer.

> 聚合 API 可提供更多的高级 API 特性，也可对其他特性实行定制；例如，对存储层进行定制。

| Feature | Description | CRDs | Aggregated API |
| ------- | ----------- | ---- | -------------- |
| Validation | Help users prevent errors and allow you to evolve your API independently of your clients. These features are most useful when there are many clients who can't all update at the same time. | Yes.  Most validation can be specified in the CRD using [OpenAPI v3.0 validation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation). [CRDValidationRatcheting](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation-ratcheting) feature gate allows failing validations specified using OpenAPI also can be ignored if the failing part of the resource was unchanged.  Any other validations supported by addition of a [Validating Webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook-alpha-in-1-8-beta-in-1-9). | Yes, arbitrary validation checks |
| Defaulting | See above | Yes, either via [OpenAPI v3.0 validation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#defaulting) `default` keyword (GA in 1.17), or via a [Mutating Webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) (though this will not be run when reading from etcd for old objects). | Yes |
| Multi-versioning | Allows serving the same object through two API versions. Can help ease API changes like renaming fields. Less important if you control your client versions. | [Yes](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning) | Yes |
| Custom Storage | If you need storage with a different performance mode (for example, a time-series database instead of key-value store) or isolation for security (for example, encryption of sensitive information, etc.) | No | Yes |
| Custom Business Logic | Perform arbitrary checks or actions when creating, reading, updating or deleting an object | Yes, using [Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#admission-webhooks). | Yes |
| Scale Subresource | Allows systems like HorizontalPodAutoscaler and PodDisruptionBudget interact with your new resource | [Yes](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#scale-subresource)  | Yes |
| Status Subresource | Allows fine-grained access control where user writes the spec section and the controller writes the status section. Allows incrementing object Generation on custom resource data mutation (requires separate spec and status sections in the resource) | [Yes](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#status-subresource) | Yes |
| Other Subresources | Add operations other than CRUD, such as "logs" or "exec". | No | Yes |
| strategic-merge-patch | The new endpoints support PATCH with `Content-Type: application/strategic-merge-patch+json`. Useful for updating objects that may be modified both locally, and by the server. For more information, see ["Update API Objects in Place Using kubectl patch"](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/) | No | Yes |
| Protocol Buffers | The new resource supports clients that want to use Protocol Buffers | No | Yes |
| OpenAPI Schema | Is there an OpenAPI (swagger) schema for the types that can be dynamically fetched from the server? Is the user protected from misspelling field names by ensuring only allowed fields are set? Are types enforced (in other words, don't put an `int` in a `string` field?) | Yes, based on the [OpenAPI v3.0 validation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation) schema (GA in 1.16). | Yes |
| Instance Name | Does this extension mechanism impose any constraints on the names of objects whose kind/resource is defined this way? | Yes, such an object's name must be a valid DNS subdomain name. | No |

> | 特性    | 描述        | CRD | 聚合 API       |
> | ------- | ----------- | ---- | -------------- |
> | 合法性检查 | 帮助用户避免错误，允许你独立于客户端版本演化 API。这些特性对于由很多无法同时更新的客户端的场合。| 可以。大多数验证可以使用 [OpenAPI v3.0 合法性检查](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation) 来设定。[CRDValidationRatcheting](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation-ratcheting) 特性门控允许在资源的失败部分未发生变化的情况下，忽略 OpenAPI 指定的失败验证。其他合法性检查操作可以通过添加[合法性检查 Webhook](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook-alpha-in-1-8-beta-in-1-9)来实现。 | 可以，可执行任何合法性检查。|
> | 默认值设置 | 同上 | 可以。可通过 [OpenAPI v3.0 合法性检查](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#defaulting)的 `default` 关键词（自 1.17 正式发布）或[更改性（Mutating）Webhook](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook)来实现（不过从 etcd 中读取老的对象时不会执行这些 Webhook）。 | 可以。 |
> | 多版本支持 | 允许通过两个 API 版本同时提供同一对象。可帮助简化类似字段更名这类 API 操作。如果你能控制客户端版本，这一特性将不再重要。 | [可以](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning)。 | 可以。 |
> | 定制存储 | 支持使用具有不同性能模式的存储（例如，要使用时间序列数据库而不是键值存储），或者因安全性原因对存储进行隔离（例如对敏感信息执行加密）。 | 不可以。 | 可以。 |
> | 定制业务逻辑 | 在创建、读取、更新或删除对象时，执行任意的检查或操作。 | 可以。要使用 [Webhook](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/extensible-admission-controllers/#admission-webhooks)。 | 可以。 |
> | 支持 scale 子资源 | 允许 HorizontalPodAutoscaler 和 PodDisruptionBudget 这类子系统与你的新资源交互。 | [可以](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#scale-subresource)。 | 可以。 |
> | 支持 status 子资源 | 允许在用户写入 spec 部分而控制器写入 status 部分时执行细粒度的访问控制。允许在对定制资源的数据进行更改时增加对象的代际（Generation）；这需要资源对 spec 和 status 部分有明确划分。| [可以](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#status-subresource)。 | 可以。 |
> | 其他子资源 | 添加 CRUD 之外的操作，例如 "logs" 或 "exec"。 | 不可以。 | 可以。 |
> | strategic-merge-patch | 新的端点要支持标记了 `Content-Type: application/strategic-merge-patch+json` 的 PATCH 操作。对于更新既可在本地更改也可在服务器端更改的对象而言是有用的。要了解更多信息，可参见[使用 `kubectl patch` 来更新 API 对象](https://kubernetes.io/zh-cn/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/)。 | 不可以。 | 可以。 |
> | 支持协议缓冲区 | 新的资源要支持想要使用协议缓冲区（Protocol Buffer）的客户端。 | 不可以。 | 可以。 |
> | OpenAPI Schema | 是否存在新资源类别的 OpenAPI（Swagger）Schema 可供动态从服务器上读取？是否存在机制确保只能设置被允许的字段以避免用户犯字段拼写错误？是否实施了字段类型检查（换言之，不允许在 `string` 字段设置 `int` 值）？ | 可以，依据 [OpenAPI v3.0 合法性检查](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#validation) 模式（1.16 中进入正式发布状态）。 | 可以。|
> | 实例名称 | 这种扩展机制是否对通过这种方式定义的对象（类别/资源）的名称有任何限制? | 可以，此类对象的名称必须是一个有效的 DNS 子域名。 | 不可以|

#### Common Features｜公共特性

When you create a custom resource, either via a CRD or an AA, you get many features for your API,
compared to implementing it outside the Kubernetes platform:

> 与在 Kubernetes 平台之外实现定制资源相比，
> 无论是通过 CRD 还是通过聚合 API 来创建定制资源，你都会获得很多 API 特性：

| Feature | What it does |
| ------- | ------------ |
| CRUD | The new endpoints support CRUD basic operations via HTTP and `kubectl` |
| Watch | The new endpoints support Kubernetes Watch operations via HTTP |
| Discovery | Clients like `kubectl` and dashboard automatically offer list, display, and field edit operations on your resources |
| json-patch | The new endpoints support PATCH with `Content-Type: application/json-patch+json` |
| merge-patch | The new endpoints support PATCH with `Content-Type: application/merge-patch+json` |
| HTTPS | The new endpoints uses HTTPS |
| Built-in Authentication | Access to the extension uses the core API server (aggregation layer) for authentication |
| Built-in Authorization | Access to the extension can reuse the authorization used by the core API server; for example, RBAC. |
| Finalizers | Block deletion of extension resources until external cleanup happens. |
| Admission Webhooks | Set default values and validate extension resources during any create/update/delete operation. |
| UI/CLI Display | Kubectl, dashboard can display extension resources. |
| Unset versus Empty | Clients can distinguish unset fields from zero-valued fields. |
| Client Libraries Generation | Kubernetes provides generic client libraries, as well as tools to generate type-specific client libraries. |
| Labels and annotations | Common metadata across objects that tools know how to edit for core and custom resources. |

> | 功能特性 | 具体含义     |
> | -------- | ------------ |
> | CRUD | 新的端点支持通过 HTTP 和 `kubectl` 发起的 CRUD 基本操作 |
> | 监测（Watch） | 新的端点支持通过 HTTP 发起的 Kubernetes Watch 操作 |
> | 发现（Discovery） | 类似 `kubectl` 和仪表盘（Dashboard）这类客户端能够自动提供列举、显示、在字段级编辑你的资源的操作 |
> | json-patch | 新的端点支持带 `Content-Type: application/json-patch+json` 的 PATCH 操作 |
> | merge-patch | 新的端点支持带 `Content-Type: application/merge-patch+json` 的 PATCH 操作 |
> | HTTPS | 新的端点使用 HTTPS |
> | 内置身份认证 | 对扩展的访问会使用核心 API 服务器（聚合层）来执行身份认证操作 |
> | 内置鉴权授权 | 对扩展的访问可以复用核心 API 服务器所使用的鉴权授权机制；例如，RBAC |
> | Finalizers | 在外部清除工作结束之前阻止扩展资源被删除 |
> | 准入 Webhooks | 在创建、更新和删除操作中对扩展资源设置默认值和执行合法性检查 |
> | UI/CLI 展示 | `kubectl` 和仪表盘（Dashboard）可以显示扩展资源 |
> | 区分未设置值和空值 | 客户端能够区分哪些字段是未设置的，哪些字段的值是被显式设置为零值的  |
> | 生成客户端库 | Kubernetes 提供通用的客户端库，以及用来生成特定类别客户端库的工具 |
> | 标签和注解 | 提供涵盖所有对象的公共元数据结构，且工具知晓如何编辑核心资源和定制资源的这些元数据 |

### Preparing to install a custom resource｜准备安装定制资源

There are several points to be aware of before adding a custom resource to your cluster.

> 在向你的集群添加定制资源之前，有些事情需要搞清楚。

#### Third party code and new points of failure｜第三方代码和新的失效点的问题

While creating a CRD does not automatically add any new points of failure (for example, by causing
third party code to run on your API server), packages (for example, Charts) or other installation
bundles often include CRDs as well as a Deployment of third-party code that implements the
business logic for a new custom resource.

Installing an Aggregated API server always involves running a new Deployment.

> 尽管添加新的 CRD 不会自动带来新的失效点（Point of
> Failure），例如导致第三方代码被在 API 服务器上运行，
> 类似 Helm Charts 这种软件包或者其他安装包通常在提供 CRD
> 的同时还包含带有第三方代码的 Deployment，负责实现新的定制资源的业务逻辑。
>
> 安装聚合 API 服务器时，也总会牵涉到运行一个新的 Deployment。

#### Storage｜存储

Custom resources consume storage space in the same way that ConfigMaps do. Creating too many
custom resources may overload your API server's storage space.

Aggregated API servers may use the same storage as the main API server, in which case the same
warning applies.

> 定制资源和 ConfigMap 一样也会消耗存储空间。创建过多的定制资源可能会导致
> API 服务器上的存储空间超载。
>
> 聚合 API 服务器可以使用主 API 服务器相同的存储。如果是这样，你也要注意此警告。

#### Authentication, authorization, and auditing｜身份认证、鉴权授权以及审计

CRDs always use the same authentication, authorization, and audit logging as the built-in
resources of your API server.

If you use RBAC for authorization, most RBAC roles will not grant access to the new resources
(except the cluster-admin role or any role created with wildcard rules). You'll need to explicitly
grant access to the new resources. CRDs and Aggregated APIs often come bundled with new role
definitions for the types they add.

Aggregated API servers may or may not use the same authentication, authorization, and auditing as
the primary API server.

> CRD 通常与 API 服务器上的内置资源一样使用相同的身份认证、鉴权授权和审计日志机制。
>
> 如果你使用 RBAC 来执行鉴权授权，大多数 RBAC 角色都不会授权对新资源的访问
> （除了 cluster-admin 角色以及使用通配符规则创建的其他角色）。
> 你要显式地为新资源的访问授权。CRD 和聚合 API 通常在交付时会包含针对所添加的类别的新的角色定义。
>
> 聚合 API 服务器可能会使用主 API 服务器相同的身份认证、鉴权授权和审计机制，也可能不会。

### Accessing a custom resource｜访问定制资源

Kubernetes [client libraries](https://kubernetes.io/docs/reference/using-api/client-libraries/) can be used to access
custom resources. Not all client libraries support custom resources. The _Go_ and _Python_ client
libraries do.

When you add a custom resource, you can access it using:

- `kubectl`
- The Kubernetes dynamic client.
- A REST client that you write.
- A client generated using [Kubernetes client generation tools](https://github.com/kubernetes/code-generator)
  (generating one is an advanced undertaking, but some projects may provide a client along with
  the CRD or AA).

> Kubernetes [客户端库](https://kubernetes.io/zh-cn/docs/reference/using-api/client-libraries/)可用来访问定制资源。
> 并非所有客户端库都支持定制资源。**Go** 和 **Python** 客户端库是支持的。
>
> 当你添加了新的定制资源后，可以用如下方式之一访问它们：
>
> - `kubectl`
> - Kubernetes 动态客户端
> - 你所编写的 REST 客户端
> - 使用 [Kubernetes 客户端生成工具](https://github.com/kubernetes/code-generator)所生成的客户端。
>   生成客户端的工作有些难度，不过某些项目可能会随着 CRD 或聚合 API 一起提供一个客户端。

### Custom resource field selectors｜定制资源字段选择算符

[Field Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/field-selectors/)
let clients select custom resources based on the value of one or more resource
fields.

> [字段选择算符](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/field-selectors/)允许客户端根据一个或多个资源字段的值选择定制资源。

All custom resources support the `metadata.name` and `metadata.namespace` field
selectors.

Fields declared in a CustomResourceDefinition
may also be used with field selectors when included in the `spec.versions[*].selectableFields` field of the
CustomResourceDefinition.

> 所有定制资源都支持 `metadata.name` 和 `metadata.namespace` 字段选择算符。
>
> 当 CustomResourceDefinition
> 中声明的字段包含在 CustomResourceDefinition
> 的 `spec.versions[*].selectableFields` 字段中时，也可以与字段选择算符一起使用。

#### Selectable fields for custom resources｜定制资源的可选择字段

**Feature state (Kubernetes v1.31): Beta, enabled by default｜特性状态（Kubernetes v1.31）：Beta，默认启用**

The `spec.versions[*].selectableFields` field of a CustomResourceDefinition may be used to
declare which other fields in a custom resource may be used in field selectors
with the feature of `CustomResourceFieldSelectors`
[feature gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/) (This feature gate is enabled by default since Kubernetes v1.31).
The following example adds the `.spec.color` and `.spec.size` fields as
selectable fields.

> 你需要启用 `CustomResourceFieldSelectors`
> [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)
> 来使用此行为，然后将其应用到集群中的所有 CustomResourceDefinitions。
>
> CustomResourceDefinition
> 字段可以用来在启用了 `CustomResourceFieldSelectors`
> [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)
> （自 Kubernetes v1.31 起，此特性默认启用）的集群中控制哪些字段可以用在字段选择算符中。
>
> 以下示例将 `.spec.color` 和 `.spec.size` 字段添加为可选择字段。
>
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: shirts.stable.example.com
spec:
  group: stable.example.com
  scope: Namespaced
  names:
    plural: shirts
    singular: shirt
    kind: Shirt
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              color:
                type: string
              size:
                type: string
    selectableFields:
    - jsonPath: .spec.color
    - jsonPath: .spec.size
    additionalPrinterColumns:
    - jsonPath: .spec.color
      name: Color
      type: string
    - jsonPath: .spec.size
      name: Size
      type: string
```

Field selectors can then be used to get only resources with a `color` of `blue`:

> 字段选择算符随后可用于仅获取 `color` 为 `blue` 的资源：
>
```shell
kubectl get shirts.stable.example.com --field-selector spec.color=blue
```

The output should be:

> 输出应该是：
>
```
NAME       COLOR  SIZE
example1   blue   S
example2   blue   M
```
>
### What's next｜接下来
* Learn how to [Extend the Kubernetes API with the aggregation layer](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/).
* Learn how to [Extend the Kubernetes API with CustomResourceDefinition](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/).

> * 了解如何[使用聚合层扩展 Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)
> * 了解如何[使用 CustomResourceDefinition 来扩展 Kubernetes API](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)

---

## Operator Pattern｜Operator 模式

Operators are software extensions to Kubernetes that make use of
[custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
to manage applications and their components. Operators follow
Kubernetes principles, notably the [control loop](https://kubernetes.io/docs/concepts/architecture/controller).

> Operator 是 Kubernetes 的扩展软件，
> 它利用[定制资源](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/custom-resources/)管理应用及其组件。
> Operator 遵循 Kubernetes 的理念，特别是在[控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller)方面。

### Motivation｜初衷

The _operator pattern_ aims to capture the key aim of a human operator who
is managing a service or set of services. Human operators who look after
specific applications and services have deep knowledge of how the system
ought to behave, how to deploy it, and how to react if there are problems.

People who run workloads on Kubernetes often like to use automation to take
care of repeatable tasks. The operator pattern captures how you can write
code to automate a task beyond what Kubernetes itself provides.

> **Operator 模式** 旨在记述（正在管理一个或一组服务的）运维人员的关键目标。
> 这些运维人员负责一些特定的应用和 Service，他们需要清楚地知道系统应该如何运行、如何部署以及出现问题时如何处理。
>
> 在 Kubernetes 上运行工作负载的人们都喜欢通过自动化来处理重复的任务。
> Operator 模式会封装你编写的（Kubernetes 本身提供功能以外的）任务自动化代码。

### Operators in Kubernetes｜Kubernetes 上的 Operator

Kubernetes is designed for automation. Out of the box, you get lots of
built-in automation from the core of Kubernetes. You can use Kubernetes
to automate deploying and running workloads, *and* you can automate how
Kubernetes does that.

Kubernetes' operator pattern
concept lets you extend the cluster's behaviour without modifying the code of Kubernetes
itself by linking controllers to
one or more custom resources. Operators are clients of the Kubernetes API that act as
controllers for a [Custom Resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/).

> Kubernetes 为自动化而生。无需任何修改，你即可以从 Kubernetes 核心中获得许多内置的自动化功能。
> 你可以使用 Kubernetes 自动化部署和运行工作负载，**甚至** 可以自动化 Kubernetes 自身。
>
> Kubernetes 的 Operator 模式概念允许你在不修改
> Kubernetes 自身代码的情况下，
> 通过为一个或多个自定义资源关联控制器来扩展集群的能力。
> Operator 是 Kubernetes API 的客户端，
> 充当[自定义资源](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/custom-resources/)的控制器。

### An example operator｜Operator 示例

Some of the things that you can use an operator to automate include:

* deploying an application on demand
* taking and restoring backups of that application's state
* handling upgrades of the application code alongside related changes such
  as database schemas or extra configuration settings
* publishing a Service to applications that don't support Kubernetes APIs to
  discover them
* simulating failure in all or part of your cluster to test its resilience
* choosing a leader for a distributed application without an internal
  member election process

> 使用 Operator 可以自动化的事情包括：
>
> * 按需部署应用
> * 获取/还原应用状态的备份
> * 处理应用代码的升级以及相关改动。例如数据库 Schema 或额外的配置设置
> * 发布一个 Service，要求不支持 Kubernetes API 的应用也能发现它
> * 模拟整个或部分集群中的故障以测试其稳定性
> * 在没有内部成员选举程序的情况下，为分布式应用选择首领角色

What might an operator look like in more detail? Here's an example:

1. A custom resource named SampleDB, that you can configure into the cluster.
2. A Deployment that makes sure a Pod is running that contains the
   controller part of the operator.
3. A container image of the operator code.
4. Controller code that queries the control plane to find out what SampleDB
   resources are configured.
5. The core of the operator is code to tell the API server how to make
   reality match the configured resources.
   * If you add a new SampleDB, the operator sets up PersistentVolumeClaims
     to provide durable database storage, a StatefulSet to run SampleDB and
     a Job to handle initial configuration.
   * If you delete it, the operator takes a snapshot, then makes sure that
     the StatefulSet and Volumes are also removed.
6. The operator also manages regular database backups. For each SampleDB
   resource, the operator determines when to create a Pod that can connect
   to the database and take backups. These Pods would rely on a ConfigMap
   and / or a Secret that has database connection details and credentials.
7. Because the operator aims to provide robust automation for the resource
   it manages, there would be additional supporting code. For this example,
   code checks to see if the database is running an old version and, if so,
   creates Job objects that upgrade it for you.

> 想要更详细的了解 Operator？下面是一个示例：
>
> 1. 有一个名为 SampleDB 的自定义资源，你可以将其配置到集群中。
> 2. 一个包含 Operator 控制器部分的 Deployment，用来确保 Pod 处于运行状态。
> 3. Operator 代码的容器镜像。
> 4. 控制器代码，负责查询控制平面以找出已配置的 SampleDB 资源。
> 5. Operator 的核心是告诉 API 服务器，如何使现实与代码里配置的资源匹配。
>    * 如果添加新的 SampleDB，Operator 将设置 PersistentVolumeClaims 以提供持久化的数据库存储，
>      设置 StatefulSet 以运行 SampleDB，并设置 Job 来处理初始配置。
>    * 如果你删除它，Operator 将建立快照，然后确保 StatefulSet 和 Volume 已被删除。
> 6. Operator 也可以管理常规数据库的备份。对于每个 SampleDB 资源，Operator
>    会确定何时创建（可以连接到数据库并进行备份的）Pod。这些 Pod 将依赖于
>    ConfigMap 和/或具有数据库连接详细信息和凭据的 Secret。
> 7. 由于 Operator 旨在为其管理的资源提供强大的自动化功能，因此它还需要一些额外的支持性代码。
>    在这个示例中，代码将检查数据库是否正运行在旧版本上，
>    如果是，则创建 Job 对象为你升级数据库。

### Deploying operators｜部署 Operator

The most common way to deploy an operator is to add the
Custom Resource Definition and its associated Controller to your cluster.
The Controller will normally run outside of the
control plane,
much as you would run any containerized application.
For example, you can run the controller in your cluster as a Deployment.

> 部署 Operator 最常见的方法是将自定义资源及其关联的控制器添加到你的集群中。
> 跟运行容器化应用一样，控制器通常会运行在控制平面之外。
> 例如，你可以在集群中将控制器作为 Deployment 运行。

### Using an operator｜使用 Operator

Once you have an operator deployed, you'd use it by adding, modifying or
deleting the kind of resource that the operator uses. Following the above
example, you would set up a Deployment for the operator itself, and then:

```shell
kubectl get SampleDB                   # find configured databases

kubectl edit SampleDB/example-database # manually change some settings
```

> 部署 Operator 后，你可以对 Operator 所使用的资源执行添加、修改或删除操作。
> 按照上面的示例，你将为 Operator 本身建立一个 Deployment，然后：
>
```shell
kubectl get SampleDB                   # 查找所配置的数据库

kubectl edit SampleDB/example-database # 手动修改某些配置
```

&hellip;and that's it! The operator will take care of applying the changes
as well as keeping the existing service in good shape.

> 可以了！Operator 会负责应用所作的更改并保持现有服务处于良好的状态。

### Writing your own operator｜编写你自己的 Operator

If there isn't an operator in the ecosystem that implements the behavior you
want, you can code your own.

You also implement an operator (that is, a Controller) using any language / runtime
that can act as a [client for the Kubernetes API](https://kubernetes.io/docs/reference/using-api/client-libraries/).

> 如果生态系统中没有可以实现你目标的 Operator，你可以自己编写代码。
>
> 你还可以使用任何支持
> [Kubernetes API 客户端](https://kubernetes.io/zh-cn/docs/reference/using-api/client-libraries/)的语言或运行时来实现
> Operator（即控制器）。

Following are a few libraries and tools you can use to write your own cloud native
operator.

> 以下是一些库和工具，你可用于编写自己的云原生 Operator。
>
**Third-party content notice｜第三方内容说明**

This section links to third party projects that provide functionality required by Kubernetes. The Kubernetes project authors aren't responsible for these projects, which are listed alphabetically. To add a project to this list, read the [content guide](https://kubernetes.io/docs/contribute/style/content-guide/#third-party-content) before submitting a change.

> 本部分链接到提供 Kubernetes 所需功能的第三方项目。Kubernetes 项目作者不负责这些项目。此页面遵循 [CNCF 网站指南](https://github.com/cncf/foundation/blob/master/website-guidelines.md)，按字母顺序列出项目。若要把项目加入此列表，请先阅读[内容指南](https://kubernetes.io/zh-cn/docs/contribute/style/content-guide/#third-party-content)，再提交更改。

* [Charmed Operator Framework](https://juju.is/)
* [Java Operator SDK](https://github.com/operator-framework/java-operator-sdk)
* [Kopf](https://github.com/nolar/kopf) (Kubernetes Operator Pythonic Framework)
* [kube-rs](https://kube.rs/) (Rust)
* [kubebuilder](https://book.kubebuilder.io/)
* [KubeOps](https://buehler.github.io/dotnet-operator-sdk/) (.NET operator SDK)
* [Mast](https://docs.ansi.services/mast/user_guide/operator/)
* [Metacontroller](https://metacontroller.github.io/metacontroller/intro.html) along with WebHooks that
  you implement yourself
* [Operator Framework](https://operatorframework.io)
* [shell-operator](https://github.com/flant/shell-operator)

> * [Charmed Operator Framework](https://juju.is/)
> * [Java Operator SDK](https://github.com/operator-framework/java-operator-sdk)
> * [Kopf](https://github.com/nolar/kopf) (Kubernetes Operator Pythonic Framework)
> * [kube-rs](https://kube.rs/) (Rust)
> * [kubebuilder](https://book.kubebuilder.io/)
> * [KubeOps](https://buehler.github.io/dotnet-operator-sdk/) (.NET operator SDK)
> * [Mast](https://docs.ansi.services/mast/user_guide/operator/)
> * [Metacontroller](https://metacontroller.github.io/metacontroller/intro.html)，可与 Webhook 结合使用，以实现自己的功能。
> * [Operator Framework](https://operatorframework.io)
> * [shell-operator](https://github.com/flant/shell-operator)
>
### What's next｜接下来
* Read the CNCF
  [Operator White Paper](https://github.com/cncf/tag-app-delivery/blob/163962c4b1cd70d085107fc579e3e04c2e14d59c/operator-wg/whitepaper/Operator-WhitePaper_v1-0.md).
* Learn more about [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
* Find ready-made operators on [OperatorHub.io](https://operatorhub.io/) to suit your use case
* [Publish](https://operatorhub.io/) your operator for other people to use
* Read [CoreOS' original article](https://web.archive.org/web/20170129131616/https://coreos.com/blog/introducing-operators.html)
  that introduced the operator pattern (this is an archived version of the original article).
* Read an [article](https://cloud.google.com/blog/products/containers-kubernetes/best-practices-for-building-kubernetes-operators-and-stateful-apps)
  from Google Cloud about best practices for building operators

> * 阅读 CNCF [Operator 白皮书](https://github.com/cncf/tag-app-delivery/blob/163962c4b1cd70d085107fc579e3e04c2e14d59c/operator-wg/whitepaper/Operator-WhitePaper_v1-0.md)。
> * 详细了解[定制资源](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
> * 在 [OperatorHub.io](https://operatorhub.io/) 上找到现成的、适合你的 Operator
> * [发布](https://operatorhub.io/)你的 Operator，让别人也可以使用
> * 阅读 [CoreOS 原始文章](https://web.archive.org/web/20170129131616/https://coreos.com/blog/introducing-operators.html)，它介绍了 Operator 模式（这是一个存档版本的原始文章）。
> * 阅读这篇来自谷歌云的关于构建 Operator
>   最佳实践的[文章](https://cloud.google.com/blog/products/containers-kubernetes/best-practices-for-building-kubernetes-operators-and-stateful-apps)
