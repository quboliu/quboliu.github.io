---
lang: "zh-CN"
pubDatetime: 2024-09-15T12:00:00+08:00
modDatetime: 2026-08-10T21:05:34+08:00
timezone: "Asia/Shanghai"
title: "官方文档 | Kubernetes Resource Model and Control Loop｜Kubernetes 资源模型与控制循环"
contentType: "docs-translation"
featured: false
area: "kubernetes"
draft: false
tags:
  - "官方文档"
  - "Kubernetes"
  - "控制器"
  - "声明式 API"
  - "控制循环"
  - "分布式系统"
description: "Kubernetes 官方文档中英对照精读：从对象的 spec/status 出发，贯通控制循环、Finalizer、属主引用、垃圾收集与 Lease。"
---
> **Source and translation basis｜来源与翻译依据**
>
> - [Objects In Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/)
> - [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/)
> - [Finalizers](https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/)
> - [Garbage Collection](https://kubernetes.io/docs/concepts/architecture/garbage-collection/)
> - [Leases](https://kubernetes.io/docs/concepts/architecture/leases/)
>
> The English source and the official Simplified Chinese source were frozen at Kubernetes website commit [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7) (2024-08-24). Kubernetes documentation content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); code samples are licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
>
> 英文原文与简体中文官方译文均固定于 Kubernetes 网站提交 [`890b36a496fb`](https://github.com/kubernetes/website/commit/890b36a496fb93c68efedc06385293ee35326df7)（2024-08-24）。本文逐个语义单元核对两种语言，并把官网构建时动态注入的术语定义、特性状态、示例代码与插图还原为可独立阅读的 Markdown。Kubernetes 文档内容采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可，代码示例采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0/) 许可。

---

## Objects In Kubernetes｜Kubernetes 对象

This page explains how Kubernetes objects are represented in the Kubernetes API, and how you can
express them in `.yaml` format.

> 本页说明了在 Kubernetes API 中是如何表示 Kubernetes 对象的，
> 以及如何使用 `.yaml` 格式的文件表示 Kubernetes 对象。

### Understanding Kubernetes objects｜理解 Kubernetes 对象

*Kubernetes objects* are persistent entities in the Kubernetes system. Kubernetes uses these
entities to represent the state of your cluster. Specifically, they can describe:

* What containerized applications are running (and on which nodes)
* The resources available to those applications
* The policies around how those applications behave, such as restart policies, upgrades, and fault-tolerance

> 在 Kubernetes 系统中，**Kubernetes 对象**是持久化的实体。
> Kubernetes 使用这些实体去表示整个集群的状态。
> 具体而言，它们描述了如下信息：
>
> * 哪些容器化应用正在运行（以及在哪些节点上运行）
> * 可以被应用使用的资源
> * 关于应用运行时行为的策略，比如重启策略、升级策略以及容错策略

A Kubernetes object is a "record of intent"--once you create the object, the Kubernetes system
will constantly work to ensure that the object exists. By creating an object, you're effectively
telling the Kubernetes system what you want your cluster's workload to look like; this is your
cluster's *desired state*.

> Kubernetes 对象是一种“意向表达（Record of Intent）”。一旦创建该对象，
> Kubernetes 系统将不断工作以确保该对象存在。通过创建对象，你本质上是在告知
> Kubernetes 系统，你想要的集群工作负载状态看起来应是什么样子的，
> 这就是 Kubernetes 集群所谓的**期望状态（Desired State）**。

To work with Kubernetes objects—whether to create, modify, or delete them—you'll need to use the
[Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/). When you use the `kubectl` command-line
interface, for example, the CLI makes the necessary Kubernetes API calls for you. You can also use
the Kubernetes API directly in your own programs using one of the
[Client Libraries](https://kubernetes.io/docs/reference/using-api/client-libraries/).

> 操作 Kubernetes 对象 —— 无论是创建、修改或者删除 —— 需要使用
> [Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api)。
> 比如，当使用 `kubectl` 命令行接口（CLI）时，CLI 会调用必要的 Kubernetes API；
> 也可以在程序中使用[客户端库](https://kubernetes.io/zh-cn/docs/reference/using-api/client-libraries/)，
> 来直接调用 Kubernetes API。

#### Object spec and status｜对象规约（Spec）与状态（Status）

Almost every Kubernetes object includes two nested object fields that govern
the object's configuration: the object *`spec`* and the object *`status`*.
For objects that have a `spec`, you have to set this when you create the object,
providing a description of the characteristics you want the resource to have:
its _desired state_.

> 几乎每个 Kubernetes 对象包含两个嵌套的对象字段，它们负责管理对象的配置：
> 对象 **`spec`（规约）** 和对象 **`status`（状态）**。
> 对于具有 `spec` 的对象，你必须在创建对象时设置其内容，描述你希望对象所具有的特征：
> **期望状态（Desired State）**。

The `status` describes the _current state_ of the object, supplied and updated
by the Kubernetes system and its components. The Kubernetes
control plane continually
and actively manages every object's actual state to match the desired state you
supplied.

> `status` 描述了对象的**当前状态（Current State）**，它是由 Kubernetes
> 系统和组件设置并更新的。在任何时刻，Kubernetes
> 控制平面
> 都一直在积极地管理着对象的实际状态，以使之达成期望状态。

For example: in Kubernetes, a Deployment is an object that can represent an
application running on your cluster. When you create the Deployment, you
might set the Deployment `spec` to specify that you want three replicas of
the application to be running. The Kubernetes system reads the Deployment
spec and starts three instances of your desired application--updating
the status to match your spec. If any of those instances should fail
(a status change), the Kubernetes system responds to the difference
between spec and status by making a correction--in this case, starting
a replacement instance.

> 例如，Kubernetes 中的 Deployment 对象能够表示运行在集群中的应用。
> 当创建 Deployment 时，你可能会设置 Deployment 的 `spec`，指定该应用要有 3 个副本运行。
> Kubernetes 系统读取 Deployment 的 `spec`，
> 并启动我们所期望的应用的 3 个实例 —— 更新状态以与规约相匹配。
> 如果这些实例中有的失败了（一种状态变更），Kubernetes 系统会通过执行修正操作来响应
> `spec` 和 `status` 间的不一致 —— 意味着它会启动一个新的实例来替换。

For more information on the object spec, status, and metadata, see the
[Kubernetes API Conventions](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md).

> 关于对象 spec、status 和 metadata 的更多信息，可参阅
> [Kubernetes API 约定](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md)。

#### Describing a Kubernetes object｜描述 Kubernetes 对象

When you create an object in Kubernetes, you must provide the object spec that describes its
desired state, as well as some basic information about the object (such as a name). When you use
the Kubernetes API to create the object (either directly or via `kubectl`), that API request must
include that information as JSON in the request body.
Most often, you provide the information to `kubectl` in a file known as a _manifest_.
By convention, manifests are YAML (you could also use JSON format).
Tools such as `kubectl` convert the information from a manifest into JSON or another supported
serialization format when making the API request over HTTP.

> 创建 Kubernetes 对象时，必须提供对象的 `spec`，用来描述该对象的期望状态，
> 以及关于对象的一些基本信息（例如名称）。
> 当使用 Kubernetes API 创建对象时（直接创建或经由 `kubectl` 创建），
> API 请求必须在请求主体中包含 JSON 格式的信息。
> 大多数情况下，你会通过 **清单（Manifest）** 文件为 `kubectl` 提供这些信息。
> 按照惯例，清单是 YAML 格式的（你也可以使用 JSON 格式）。
> 像 `kubectl` 这样的工具在通过 HTTP 进行 API 请求时，
> 会将清单中的信息转换为 JSON 或其他受支持的序列化格式。

Here's an example manifest that shows the required fields and object spec for a Kubernetes
Deployment:

> 这里有一个清单示例文件，展示了 Kubernetes Deployment 的必需字段和对象 `spec`：
>
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # tells deployment to run 2 pods matching the template
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

One way to create a Deployment using a manifest file like the one above is to use the
[`kubectl apply`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply) command
in the `kubectl` command-line interface, passing the `.yaml` file as an argument. Here's an example:

> 与上面使用清单文件来创建 Deployment 类似，另一种方式是使用 `kubectl` 命令行接口（CLI）的
> [`kubectl apply`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply) 命令，
> 将 `.yaml` 文件作为参数。下面是一个示例：
>
```shell
kubectl apply -f https://k8s.io/examples/application/deployment.yaml
```

The output is similar to this:

> 输出类似下面这样：
>
```
deployment.apps/nginx-deployment created
```

#### Required fields｜必需字段

In the manifest (YAML or JSON file) for the Kubernetes object you want to create, you'll need to set values for
the following fields:

* `apiVersion` - Which version of the Kubernetes API you're using to create this object
* `kind` - What kind of object you want to create
* `metadata` - Data that helps uniquely identify the object, including a `name` string, `UID`, and optional `namespace`
* `spec` - What state you desire for the object

> 在想要创建的 Kubernetes 对象所对应的清单（YAML 或 JSON 文件）中，需要配置的字段如下：
>
> * `apiVersion` - 创建该对象所使用的 Kubernetes API 的版本
> * `kind` - 想要创建的对象的类别
> * `metadata` - 帮助唯一标识对象的一些数据，包括一个 `name` 字符串、`UID` 和可选的 `namespace`
> * `spec` - 你所期望的该对象的状态

The precise format of the object `spec` is different for every Kubernetes object, and contains
nested fields specific to that object. The [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
can help you find the spec format for all of the objects you can create using Kubernetes.

> 对每个 Kubernetes 对象而言，其 `spec` 之精确格式都是不同的，包含了特定于该对象的嵌套字段。
> [Kubernetes API 参考](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/)可以帮助你找到想要使用
> Kubernetes 创建的所有对象的规约格式。

For example, see the [`spec` field](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#PodSpec)
for the Pod API reference.
For each Pod, the `.spec` field specifies the pod and its desired state (such as the container image name for
each container within that pod).
Another example of an object specification is the
[`spec` field](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/stateful-set-v1/#StatefulSetSpec)
for the StatefulSet API. For StatefulSet, the `.spec` field specifies the StatefulSet and
its desired state.
Within the `.spec` of a StatefulSet is a [template](https://kubernetes.io/docs/concepts/workloads/pods/#pod-templates)
for Pod objects. That template describes Pods that the StatefulSet controller will create in order to
satisfy the StatefulSet specification.
Different kinds of objects can also have different `.status`; again, the API reference pages
detail the structure of that `.status` field, and its content for each different type of object.

> 例如，参阅 Pod API 参考文档中
> [`spec` 字段](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/#PodSpec)。
> 对于每个 Pod，其 `.spec` 字段设置了 Pod 及其期望状态（例如 Pod 中每个容器的容器镜像名称）。
> 另一个对象规约的例子是 StatefulSet API 中的
> [`spec` 字段](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/stateful-set-v1/#StatefulSetSpec)。
> 对于 StatefulSet 而言，其 `.spec` 字段设置了 StatefulSet 及其期望状态。
> 在 StatefulSet 的 `.spec` 内，有一个为 Pod 对象提供的[模板](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/#pod-templates)。
> 该模板描述了 StatefulSet 控制器为了满足 StatefulSet 规约而要创建的 Pod。
> 不同类型的对象可以有不同的 `.status` 信息。API 参考页面给出了 `.status` 字段的详细结构，
> 以及针对不同类型 API 对象的具体内容。
>
> **Note｜说明**
See [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/) for additional
information on writing YAML configuration files.

> 请查看[配置最佳实践](https://kubernetes.io/zh-cn/docs/concepts/configuration/overview/)来获取有关编写 YAML 配置文件的更多信息。

### Server side field validation｜服务器端字段验证

Starting with Kubernetes v1.25, the API server offers server side
[field validation](https://kubernetes.io/docs/reference/using-api/api-concepts/#field-validation)
that detects unrecognized or duplicate fields in an object. It provides all the functionality
of `kubectl --validate` on the server side.

> 从 Kubernetes v1.25 开始，API
> 服务器提供了服务器端[字段验证](https://kubernetes.io/zh-cn/docs/reference/using-api/api-concepts/#field-validation)，
> 可以检测对象中未被识别或重复的字段。它在服务器端提供了 `kubectl --validate` 的所有功能。

The `kubectl` tool uses the `--validate` flag to set the level of field validation. It accepts the
values `ignore`, `warn`, and `strict` while also accepting the values `true` (equivalent to `strict`)
and `false` (equivalent to `ignore`). The default validation setting for `kubectl` is `--validate=true`.

> `kubectl` 工具使用 `--validate` 标志来设置字段验证级别。它接受值
> `ignore`、`warn` 和 `strict`，同时还接受值 `true`（等同于 `strict`）和
> `false`（等同于 `ignore`）。`kubectl` 的默认验证设置为 `--validate=true`。

`Strict`
: Strict field validation, errors on validation failure

`Warn`
: Field validation is performed, but errors are exposed as warnings rather than failing the request

`Ignore`
: No server side field validation is performed

> `Strict`
> : 严格的字段验证，验证失败时会报错
>
> `Warn`
> : 执行字段验证，但错误会以警告形式提供而不是拒绝请求
>
> `Ignore`
> : 不执行服务器端字段验证

When `kubectl` cannot connect to an API server that supports field validation it will fall back
to using client-side validation. Kubernetes 1.27 and later versions always offer field validation;
older Kubernetes releases might not. If your cluster is older than v1.27, check the documentation
for your version of Kubernetes.

> 当 `kubectl` 无法连接到支持字段验证的 API 服务器时，它将回退为使用客户端验证。
> Kubernetes 1.27 及更高版本始终提供字段验证；较早的 Kubernetes 版本可能没有此功能。
> 如果你的集群版本低于 v1.27，可以查阅适用于你的 Kubernetes 版本的文档。
>
### What's next｜接下来
If you're new to Kubernetes, read more about the following:

* [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) which are the most important basic Kubernetes objects.
* [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) objects.
* [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/) in Kubernetes.
* [kubectl](https://kubernetes.io/docs/reference/kubectl/) and [kubectl commands](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands).

[Kubernetes Object Management](https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/)
explains how to use `kubectl` to manage objects.
You might need to [install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) if you don't already have it available.

> 如果你刚开始学习 Kubernetes，可以进一步阅读以下信息：
>
> * 最重要的 Kubernetes 基本对象 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/)。
> * [Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/) 对象。
> * Kubernetes 中的[控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/)。
> * [kubectl](https://kubernetes.io/zh-cn/docs/reference/kubectl/) 和
>   [kubectl 命令](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)。
>
> [Kubernetes 对象管理](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/)
> 介绍了如何使用 `kubectl` 来管理对象。
> 如果你还没有安装 `kubectl`，你可能需要[安装 kubectl](https://kubernetes.io/zh-cn/docs/tasks/tools/#kubectl)。

To learn about the Kubernetes API in general, visit:

* [Kubernetes API overview](https://kubernetes.io/docs/reference/using-api/)

To learn about objects in Kubernetes in more depth, read other pages in this section:

> 从总体上了解 Kubernetes API，可以查阅：
>
> * [Kubernetes API 概述](https://kubernetes.io/zh-cn/docs/reference/using-api/)
>
> 若要更深入地了解 Kubernetes 对象，可以阅读本节的其他页面：

---

## Controllers｜控制器

In robotics and automation, a _control loop_ is
a non-terminating loop that regulates the state of a system.

Here is one example of a control loop: a thermostat in a room.

When you set the temperature, that's telling the thermostat
about your *desired state*. The actual room temperature is the
*current state*. The thermostat acts to bring the current state
closer to the desired state, by turning equipment on or off.

> 在机器人技术和自动化领域，控制回路（Control Loop）是一个非终止回路，用于调节系统状态。
>
> 这是一个控制环的例子：房间里的温度自动调节器。
>
> 当你设置了温度，告诉了温度自动调节器你的**期望状态（Desired State）**。
> 房间的实际温度是**当前状态（Current State）**。
> 通过对设备的开关控制，温度自动调节器让其当前状态接近期望状态。
>
In Kubernetes, controllers are control loops that watch the state of your cluster, then make or request changes where needed. Each controller tries to move the current cluster state closer to the desired state.

> 在 Kubernetes 中，控制器是持续监视集群状态的控制回路，并在需要时实施或请求变更。每个控制器都力图推动集群的当前状态接近期望状态。

### Controller pattern｜控制器模式

A controller tracks at least one Kubernetes resource type.
These objects
have a spec field that represents the desired state. The
controller(s) for that resource are responsible for making the current
state come closer to that desired state.

The controller might carry the action out itself; more commonly, in Kubernetes,
a controller will send messages to the
API server that have
useful side effects. You'll see examples of this below.

Some built-in controllers, such as the namespace controller, act on objects
that do not have a spec. For simplicity, this page omits explaining that
detail.
> 一个控制器至少追踪一种类型的 Kubernetes 资源。这些
> 对象
> 有一个代表期望状态的 `spec` 字段。
> 该资源的控制器负责确保其当前状态接近期望状态。
>
> 控制器可能会自行执行操作；在 Kubernetes 中更常见的是一个控制器会发送信息给
> API 服务器，这会有副作用。
> 具体可参看后文的例子。
>
> 一些内置的控制器，比如名字空间控制器，针对没有指定 `spec` 的对象。
> 为了简单起见，本文没有详细介绍这些细节。
#### Control via API server｜通过 API 服务器来控制

The job controller is an example of a
Kubernetes built-in controller. Built-in controllers manage state by
interacting with the cluster API server.

Job is a Kubernetes resource that runs a
pod, or perhaps several Pods, to carry out
a task and then stop.

(Once [scheduled](https://kubernetes.io/docs/concepts/scheduling-eviction/), Pod objects become part of the
desired state for a kubelet).

When the Job controller sees a new task it makes sure that, somewhere
in your cluster, the kubelets on a set of Nodes are running the right
number of Pods to get the work done.
The Job controller does not run any Pods or containers
itself. Instead, the Job controller tells the API server to create or remove
Pods.
Other components in the
control plane
act on the new information (there are new Pods to schedule and run),
and eventually the work is done.

> Job 控制器是一个 Kubernetes 内置控制器的例子。
> 内置控制器通过和集群 API 服务器交互来管理状态。
>
> Job 是一种 Kubernetes 资源，它运行一个或者多个 pod，
> 来执行一个任务然后停止。
> （一旦[被调度了](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/)，对 `kubelet` 来说 Pod
> 对象就会变成期望状态的一部分）。
>
> 在集群中，当 Job 控制器拿到新任务时，它会保证一组 Node 节点上的 `kubelet`
> 可以运行正确数量的 Pod 来完成工作。
> Job 控制器不会自己运行任何的 Pod 或者容器。Job 控制器是通知 API 服务器来创建或者移除 Pod。
> 控制面中的其它组件
> 根据新的消息作出反应（调度并运行新 Pod）并且最终完成工作。

After you create a new Job, the desired state is for that Job to be completed.
The Job controller makes the current state for that Job be nearer to your
desired state: creating Pods that do the work you wanted for that Job, so that
the Job is closer to completion.

Controllers also update the objects that configure them.
For example: once the work is done for a Job, the Job controller
updates that Job object to mark it `Finished`.

(This is a bit like how some thermostats turn a light off to
indicate that your room is now at the temperature you set).

> 创建新 Job 后，所期望的状态就是完成这个 Job。Job 控制器会让 Job 的当前状态不断接近期望状态：创建为 Job 要完成工作所需要的 Pod，使 Job 的状态接近完成。
>
> 控制器也会更新配置对象。例如：一旦 Job 的工作完成了，Job 控制器会更新 Job 对象的状态为 `Finished`。
>
> （这有点像温度自动调节器关闭了一个灯，以此来告诉你房间的温度现在到你设定的值了）。

#### Direct control｜直接控制

In contrast with Job, some controllers need to make changes to
things outside of your cluster.

For example, if you use a control loop to make sure there
are enough Nodes
in your cluster, then that controller needs something outside the
current cluster to set up new Nodes when needed.

Controllers that interact with external state find their desired state from
the API server, then communicate directly with an external system to bring
the current state closer in line.

(There actually is a [controller](https://github.com/kubernetes/autoscaler/)
that horizontally scales the nodes in your cluster.)

> 相比 Job 控制器，有些控制器需要对集群外的一些东西进行修改。
>
> 例如，如果你使用一个控制回路来保证集群中有足够的
> 节点，那么控制器就需要当前集群外的
> 一些服务在需要时创建新节点。
>
> 和外部状态交互的控制器从 API 服务器获取到它想要的状态，然后直接和外部系统进行通信
> 并使当前状态更接近期望状态。
>
> （实际上有一个[控制器](https://github.com/kubernetes/autoscaler/)
> 可以水平地扩展集群中的节点。）

The important point here is that the controller makes some changes to bring about
your desired state, and then reports the current state back to your cluster's API server.
Other control loops can observe that reported data and take their own actions.

> 这里的重点是，控制器做出了一些变更以使得事物更接近你的期望状态，
> 之后将当前状态报告给集群的 API 服务器。
> 其他控制回路可以观测到所汇报的数据的这种变化并采取其各自的行动。

In the thermostat example, if the room is very cold then a different controller
might also turn on a frost protection heater. With Kubernetes clusters, the control
plane indirectly works with IP address management tools, storage services,
cloud provider APIs, and other services by
[extending Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/) to implement that.

> 在温度计的例子中，如果房间很冷，那么某个控制器可能还会启动一个防冻加热器。
> 就 Kubernetes 集群而言，控制面间接地与 IP 地址管理工具、存储服务、云驱动
> APIs 以及其他服务协作，通过[扩展 Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/)
> 来实现这点。

### Desired versus current state｜期望状态与当前状态

Kubernetes takes a cloud-native view of systems, and is able to handle
constant change.

Your cluster could be changing at any point as work happens and
control loops automatically fix failures. This means that,
potentially, your cluster never reaches a stable state.

As long as the controllers for your cluster are running and able to make
useful changes, it doesn't matter if the overall state is stable or not.

> Kubernetes 采用了系统的云原生视图，并且可以处理持续的变化。
>
> 在任务执行时，集群随时都可能被修改，并且控制回路会自动修复故障。
> 这意味着很可能集群永远不会达到稳定状态。
>
> 只要集群中的控制器在运行并且进行有效的修改，整体状态的稳定与否是无关紧要的。

### Design｜设计

As a tenet of its design, Kubernetes uses lots of controllers that each manage
a particular aspect of cluster state. Most commonly, a particular control loop
(controller) uses one kind of resource as its desired state, and has a different
kind of resource that it manages to make that desired state happen. For example,
a controller for Jobs tracks Job objects (to discover new work) and Pod objects
(to run the Jobs, and then to see when the work is finished). In this case
something else creates the Jobs, whereas the Job controller creates Pods.

It's useful to have simple controllers rather than one, monolithic set of control
loops that are interlinked. Controllers can fail, so Kubernetes is designed to
allow for that.

> 作为设计原则之一，Kubernetes 使用了很多控制器，每个控制器管理集群状态的一个特定方面。
> 最常见的一个特定的控制器使用一种类型的资源作为它的期望状态，
> 控制器管理控制另外一种类型的资源向它的期望状态演化。
> 例如，Job 的控制器跟踪 Job 对象（以发现新的任务）和 Pod 对象（以运行 Job，然后查看任务何时完成）。
> 在这种情况下，新任务会创建 Job，而 Job 控制器会创建 Pod。
>
> 使用简单的控制器而不是一组相互连接的单体控制回路是很有用的。
> 控制器会失败，所以 Kubernetes 的设计正是考虑到了这一点。

There can be several controllers that create or update the same kind of object.
Behind the scenes, Kubernetes controllers make sure that they only pay attention
to the resources linked to their controlling resource.

For example, you can have Deployments and Jobs; these both create Pods.
The Job controller does not delete the Pods that your Deployment created,
because there is information (labels)
the controllers can use to tell those Pods apart.

> **Note｜说明**
> 可以有多个控制器来创建或者更新相同类型的对象。
> 在后台，Kubernetes 控制器确保它们只关心与其控制资源相关联的资源。
>
> 例如，你可以创建 Deployment 和 Job；它们都可以创建 Pod。
> Job 控制器不会删除 Deployment 所创建的 Pod，因为有信息
> （标签）让控制器可以区分这些 Pod。

### Ways of running controllers｜运行控制器的方式

Kubernetes comes with a set of built-in controllers that run inside
the kube-controller-manager. These
built-in controllers provide important core behaviors.

The Deployment controller and Job controller are examples of controllers that
come as part of Kubernetes itself ("built-in" controllers).
Kubernetes lets you run a resilient control plane, so that if any of the built-in
controllers were to fail, another part of the control plane will take over the work.

You can find controllers that run outside the control plane, to extend Kubernetes.
Or, if you want, you can write a new controller yourself.
You can run your own controller as a set of Pods,
or externally to Kubernetes. What fits best will depend on what that particular
controller does.

> Kubernetes 内置一组控制器，运行在 kube-controller-manager 内。
> 这些内置的控制器提供了重要的核心功能。
>
> Deployment 控制器和 Job 控制器是 Kubernetes 内置控制器的典型例子。
> Kubernetes 允许你运行一个稳定的控制平面，这样即使某些内置控制器失败了，
> 控制平面的其他部分会接替它们的工作。
>
> 你会遇到某些控制器运行在控制面之外，用以扩展 Kubernetes。
> 或者，如果你愿意，你也可以自己编写新控制器。
> 你可以以一组 Pod 来运行你的控制器，或者运行在 Kubernetes 之外。
> 最合适的方案取决于控制器所要执行的功能是什么。
>
### What's next｜接下来
* Read about the [Kubernetes control plane](https://kubernetes.io/docs/concepts/overview/components/#control-plane-components)
* Discover some of the basic [Kubernetes objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/)
* Learn more about the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/)
* If you want to write your own controller, see
  [Kubernetes extension patterns](https://kubernetes.io/docs/concepts/extend-kubernetes/#extension-patterns)
  and the [sample-controller](https://github.com/kubernetes/sample-controller) repository.

> * 阅读 [Kubernetes 控制平面组件](https://kubernetes.io/zh-cn/docs/concepts/overview/components/#control-plane-components)
> * 了解 [Kubernetes 对象](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/)
>   的一些基本知识
> * 进一步学习 [Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/)
> * 如果你想编写自己的控制器，请查看
>   [Kubernetes 扩展模式](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/#extension-patterns)
>   以及[控制器样例](https://github.com/kubernetes/sample-controller)。

---

## Finalizers｜Finalizers

You can use finalizers to control garbage collection
of objects by alerting controllers
to perform specific cleanup tasks before deleting the target resource.

> 你可以使用 Finalizers 来控制对象的垃圾回收，
> 方法是在删除目标资源之前提醒控制器执行特定的清理任务。

Finalizers don't usually specify the code to execute. Instead, they are
typically lists of keys on a specific resource similar to annotations.
Kubernetes specifies some finalizers automatically, but you can also specify
your own.

> Finalizers 通常不指定要执行的代码。
> 相反，它们通常是特定资源上的键的列表，类似于注解。
> Kubernetes 自动指定了一些 Finalizers，但你也可以指定你自己的。

### How finalizers work｜Finalizers 如何工作

When you create a resource using a manifest file, you can specify finalizers in
the `metadata.finalizers` field. When you attempt to delete the resource, the
API server handling the delete request notices the values in the `finalizers` field
and does the following:

  * Modifies the object to add a `metadata.deletionTimestamp` field with the
    time you started the deletion.
  * Prevents the object from being removed until its `metadata.finalizers` field is empty.
  * Prevents the object from being removed until all items are removed from its `metadata.finalizers` field
  * Returns a `202` status code (HTTP "Accepted")

> 当你使用清单文件创建资源时，你可以在 `metadata.finalizers` 字段指定 Finalizers。
> 当你试图删除该资源时，处理删除请求的 API 服务器会注意到 `finalizers` 字段中的值，
> 并进行以下操作：
>
>   * 修改对象，将你开始执行删除的时间添加到 `metadata.deletionTimestamp` 字段。
>   * 禁止对象被删除，直到其 `metadata.finalizers` 字段内的所有项被删除。
>   * 返回 `202` 状态码（HTTP "Accepted"）。

The controller managing that finalizer notices the update to the object setting the
`metadata.deletionTimestamp`, indicating deletion of the object has been requested.
The controller then attempts to satisfy the requirements of the finalizers
specified for that resource. Each time a finalizer condition is satisfied, the
controller removes that key from the resource's `finalizers` field. When the
`finalizers` field is emptied, an object with a `deletionTimestamp` field set
is automatically deleted. You can also use finalizers to prevent deletion of unmanaged resources.

> 管理 finalizer 的控制器注意到对象上发生的更新操作，对象的 `metadata.deletionTimestamp`
> 被设置，意味着已经请求删除该对象。然后，控制器会试图满足资源的 Finalizers 的条件。
> 每当一个 Finalizer 的条件被满足时，控制器就会从资源的 `finalizers` 字段中删除该键。
> 当 `finalizers` 字段为空时，`deletionTimestamp` 字段被设置的对象会被自动删除。
> 你也可以使用 Finalizers 来阻止删除未被管理的资源。

A common example of a finalizer is `kubernetes.io/pv-protection`, which prevents
accidental deletion of `PersistentVolume` objects. When a `PersistentVolume`
object is in use by a Pod, Kubernetes adds the `pv-protection` finalizer. If you
try to delete the `PersistentVolume`, it enters a `Terminating` status, but the
controller can't delete it because the finalizer exists. When the Pod stops
using the `PersistentVolume`, Kubernetes clears the `pv-protection` finalizer,
and the controller deletes the volume.

> 一个常见的 Finalizer 的例子是 `kubernetes.io/pv-protection`，
> 它用来防止意外删除 `PersistentVolume` 对象。
> 当一个 `PersistentVolume` 对象被 Pod 使用时，
> Kubernetes 会添加 `pv-protection` Finalizer。
> 如果你试图删除 `PersistentVolume`，它将进入 `Terminating` 状态，
> 但是控制器因为该 Finalizer 存在而无法删除该资源。
> 当 Pod 停止使用 `PersistentVolume` 时，
> Kubernetes 清除 `pv-protection` Finalizer，控制器就会删除该卷。
>
> **Note｜说明**
* When you `DELETE` an object, Kubernetes adds the deletion timestamp for that object and then
immediately starts to restrict changes to the `.metadata.finalizers` field for the object that is
now pending deletion. You can remove existing finalizers (deleting an entry from the `finalizers`
list) but you cannot add a new finalizer. You also cannot modify the `deletionTimestamp` for an
object once it is set.

* After the deletion is requested, you can not resurrect this object. The only way is to delete it and make a new similar object.

> * 当你 `DELETE` 一个对象时，Kubernetes 为该对象增加删除时间戳，然后立即开始限制
> 对这个正处于待删除状态的对象的 `.metadata.finalizers` 字段进行修改。
> 你可以删除现有的 finalizers （从 `finalizers` 列表删除条目），但你不能添加新的 finalizer。
> 对象的 `deletionTimestamp` 被设置后也不能修改。
> * 删除请求已被发出之后，你无法复活该对象。唯一的方法是删除它并创建一个新的相似对象。

### Owner references, labels, and finalizers｜属主引用、标签和 Finalizers

Like labels,
[owner references](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/)
describe the relationships between objects in Kubernetes, but are used for a
different purpose. When a
controller manages objects
like Pods, it uses labels to track changes to groups of related objects. For
example, when a Job creates one or
more Pods, the Job controller applies labels to those pods and tracks changes to
any Pods in the cluster with the same label.

> 与标签类似，
> [属主引用](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/owners-dependents/)
> 描述了 Kubernetes 中对象之间的关系，但它们作用不同。
> 当一个控制器
> 管理类似于 Pod 的对象时，它使用标签来跟踪相关对象组的变化。
> 例如，当 Job 创建一个或多个 Pod 时，
> Job 控制器会给这些 Pod 应用上标签，并跟踪集群中的具有相同标签的 Pod 的变化。

The Job controller also adds *owner references* to those Pods, pointing at the
Job that created the Pods. If you delete the Job while these Pods are running,
Kubernetes uses the owner references (not labels) to determine which Pods in the
cluster need cleanup.

Kubernetes also processes finalizers when it identifies owner references on a
resource targeted for deletion.

In some situations, finalizers can block the deletion of dependent objects,
which can cause the targeted owner object to remain for
longer than expected without being fully deleted. In these situations, you
should check finalizers and owner references on the target owner and dependent
objects to troubleshoot the cause.

> Job 控制器还为这些 Pod 添加了“属主引用”，指向创建 Pod 的 Job。
> 如果你在这些 Pod 运行的时候删除了 Job，
> Kubernetes 会使用属主引用（而不是标签）来确定集群中哪些 Pod 需要清理。
>
> 当 Kubernetes 识别到要删除的资源上的属主引用时，它也会处理 Finalizers。
>
> 在某些情况下，Finalizers 会阻止依赖对象的删除，
> 这可能导致目标属主对象被保留的时间比预期的长，而没有被完全删除。
> 在这些情况下，你应该检查目标属主和附属对象上的 Finalizers 和属主引用，来排查原因。
>
> **Note｜说明**
In cases where objects are stuck in a deleting state, avoid manually
removing finalizers to allow deletion to continue. Finalizers are usually added
to resources for a reason, so forcefully removing them can lead to issues in
your cluster. This should only be done when the purpose of the finalizer is
understood and is accomplished in another way (for example, manually cleaning
up some dependent object).

> 在对象卡在删除状态的情况下，要避免手动移除 Finalizers，以允许继续删除操作。
> Finalizers 通常因为特殊原因被添加到资源上，所以强行删除它们会导致集群出现问题。
> 只有了解 finalizer 的用途时才能这样做，并且应该通过一些其他方式来完成
> （例如，手动清除其余的依赖对象）。

>
### What's next｜接下来
* Read [Using Finalizers to Control Deletion](/blog/2021/05/14/using-finalizers-to-control-deletion/)
  on the Kubernetes blog.

> * 在 Kubernetes 博客上阅读[使用 Finalizers 控制删除](/blog/2021/05/14/using-finalizers-to-control-deletion/)。

---

## Garbage Collection｜垃圾收集

Garbage collection is a collective term for the various mechanisms Kubernetes uses to clean up cluster resources. This allows the clean up of resources like the following:

> 垃圾收集是 Kubernetes 用于清理集群资源的各种机制的统称。系统由此可以清理以下资源：

* [Terminated pods](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-garbage-collection)
* [Completed Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/)
* [Objects without owner references](#owners-dependents)
* [Unused containers and container images](#containers-images)
* [Dynamically provisioned PersistentVolumes with a StorageClass reclaim policy of Delete](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#delete)
* [Stale or expired CertificateSigningRequests (CSRs)](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/#request-signing-process)
* Nodes deleted in the following scenarios:
  * On a cloud when the cluster uses a [cloud controller manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/)
  * On-premises when the cluster uses an addon similar to a cloud controller
    manager
* [Node Lease objects](https://kubernetes.io/docs/concepts/architecture/nodes/#heartbeats)

> * [终止的 Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/#pod-garbage-collection)
> * [已完成的 Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ttlafterfinished/)
> * [不再存在属主引用的对象](#owners-dependents)
> * [未使用的容器和容器镜像](#containers-images)
> * [动态制备的、StorageClass 回收策略为 Delete 的 PV 卷](https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/#delete)
> * [阻滞或者过期的 CertificateSigningRequest (CSR)](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/certificate-signing-requests/#request-signing-process)
> * 在以下情形中删除了的节点对象：
>   * 当集群使用[云控制器管理器](https://kubernetes.io/zh-cn/docs/concepts/architecture/cloud-controller/)运行于云端时；
>   * 当集群使用类似于云控制器管理器的插件运行在本地环境中时。
> * [节点租约对象](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/#heartbeats)

### Owners and dependents｜属主与依赖

Many objects in Kubernetes link to each other through [*owner references*](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/).
Owner references tell the control plane which objects are dependent on others.
Kubernetes uses owner references to give the control plane, and other API
clients, the opportunity to clean up related resources before deleting an
object. In most cases, Kubernetes manages owner references automatically.

> Kubernetes 中很多对象通过[**属主引用**](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/owners-dependents/)
> 链接到彼此。属主引用（Owner Reference）可以告诉控制面哪些对象依赖于其他对象。
> Kubernetes 使用属主引用来为控制面以及其他 API 客户端在删除某对象时提供一个清理关联资源的机会。
> 在大多数场合，Kubernetes 都是自动管理属主引用的。

Ownership is different from the [labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)
mechanism that some resources also use. For example, consider a
Service that creates
`EndpointSlice` objects. The Service uses *labels* to allow the control plane to
determine which `EndpointSlice` objects are used for that Service. In addition
to the labels, each `EndpointSlice` that is managed on behalf of a Service has
an owner reference. Owner references help different parts of Kubernetes avoid
interfering with objects they don’t control.

> 属主关系与某些资源所使用的[标签和选择算符](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)不同。
> 例如，考虑一个创建 `EndpointSlice` 对象的 Service。
> Service 使用**标签**来允许控制面确定哪些 `EndpointSlice` 对象被该 Service 使用。
> 除了标签，每个被 Service 托管的 `EndpointSlice` 对象还有一个属主引用属性。
> 属主引用可以帮助 Kubernetes 中的不同组件避免干预并非由它们控制的对象。
>
> **Note｜说明**
Cross-namespace owner references are disallowed by design.
Namespaced dependents can specify cluster-scoped or namespaced owners.
A namespaced owner **must** exist in the same namespace as the dependent.
If it does not, the owner reference is treated as absent, and the dependent
is subject to deletion once all owners are verified absent.

> 根据设计，系统不允许出现跨名字空间的属主引用。名字空间作用域的依赖对象可以指定集群作用域或者名字空间作用域的属主。
> 名字空间作用域的属主**必须**存在于依赖对象所在的同一名字空间。
> 如果属主位于不同名字空间，则属主引用被视为不存在，而当检查发现所有属主都已不存在时，依赖对象会被删除。

Cluster-scoped dependents can only specify cluster-scoped owners.
In v1.20+, if a cluster-scoped dependent specifies a namespaced kind as an owner,
it is treated as having an unresolvable owner reference, and is not able to be garbage collected.

> 集群作用域的依赖对象只能指定集群作用域的属主。
> 在 1.20 及更高版本中，如果一个集群作用域的依赖对象指定了某个名字空间作用域的类别作为其属主，
> 则该对象被视为拥有一个无法解析的属主引用，因而无法被垃圾收集处理。

In v1.20+, if the garbage collector detects an invalid cross-namespace `ownerReference`,
or a cluster-scoped dependent with an `ownerReference` referencing a namespaced kind, a warning Event
with a reason of `OwnerRefInvalidNamespace` and an `involvedObject` of the invalid dependent is reported.
You can check for that kind of Event by running
`kubectl get events -A --field-selector=reason=OwnerRefInvalidNamespace`.

> 在 1.20 及更高版本中，如果垃圾收集器检测到非法的跨名字空间 `ownerReference`，
> 或者某集群作用域的依赖对象的 `ownerReference` 引用某名字空间作用域的类别，
> 系统会生成一个警告事件，其原因为 `OwnerRefInvalidNamespace` 和 `involvedObject`
> 设置为非法的依赖对象。你可以通过运行
> `kubectl get events -A --field-selector=reason=OwnerRefInvalidNamespace`
> 来检查是否存在这类事件。

### Cascading deletion｜级联删除

Kubernetes checks for and deletes objects that no longer have owner
references, like the pods left behind when you delete a ReplicaSet. When you
delete an object, you can control whether Kubernetes deletes the object's
dependents automatically, in a process called *cascading deletion*. There are
two types of cascading deletion, as follows:

* Foreground cascading deletion
* Background cascading deletion

> Kubernetes 会检查并删除那些不再拥有属主引用的对象，例如在你删除了 ReplicaSet
> 之后留下来的 Pod。当你删除某个对象时，你可以控制 Kubernetes 是否去自动删除该对象的依赖对象，
> 这个过程称为**级联删除（Cascading Deletion）**。
> 级联删除有两种类型，分别如下：
>
> * 前台级联删除
> * 后台级联删除

You can also control how and when garbage collection deletes resources that have
owner references using Kubernetes finalizers.

> 你也可以使用 Kubernetes Finalizers
> 来控制垃圾收集机制如何以及何时删除包含属主引用的资源。

#### Foreground cascading deletion｜前台级联删除

In foreground cascading deletion, the owner object you're deleting first enters
a *deletion in progress* state. In this state, the following happens to the
owner object:

> 在前台级联删除中，正在被你删除的属主对象首先进入 **deletion in progress** 状态。
> 在这种状态下，针对属主对象会发生以下事情：

* The Kubernetes API server sets the object's `metadata.deletionTimestamp`
  field to the time the object was marked for deletion.
* The Kubernetes API server also sets the `metadata.finalizers` field to
  `foregroundDeletion`.
* The object remains visible through the Kubernetes API until the deletion
  process is complete.

> * Kubernetes API 服务器将某对象的 `metadata.deletionTimestamp`
>   字段设置为该对象被标记为要删除的时间点。
> * Kubernetes API 服务器也会将 `metadata.finalizers` 字段设置为 `foregroundDeletion`。
> * 在删除过程完成之前，通过 Kubernetes API 仍然可以看到该对象。

After the owner object enters the deletion in progress state, the controller
deletes the dependents. After deleting all the dependent objects, the controller
deletes the owner object. At this point, the object is no longer visible in the
Kubernetes API.

During foreground cascading deletion, the only dependents that block owner
deletion are those that have the `ownerReference.blockOwnerDeletion=true` field.
See [Use foreground cascading deletion](https://kubernetes.io/docs/tasks/administer-cluster/use-cascading-deletion/#use-foreground-cascading-deletion)
to learn more.

> 当属主对象进入删除过程中状态后，控制器删除其依赖对象。控制器在删除完所有依赖对象之后，
> 删除属主对象。这时，通过 Kubernetes API 就无法再看到该对象。
>
> 在前台级联删除过程中，唯一可能阻止属主对象被删除的是那些带有
> `ownerReference.blockOwnerDeletion=true` 字段的依赖对象。
> 参阅[使用前台级联删除](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/use-cascading-deletion/#use-foreground-cascading-deletion)
> 以了解进一步的细节。

#### Background cascading deletion｜后台级联删除

In background cascading deletion, the Kubernetes API server deletes the owner
object immediately and the controller cleans up the dependent objects in
the background. By default, Kubernetes uses background cascading deletion unless
you manually use foreground deletion or choose to orphan the dependent objects.

See [Use background cascading deletion](https://kubernetes.io/docs/tasks/administer-cluster/use-cascading-deletion/#use-background-cascading-deletion)
to learn more.

> 在后台级联删除过程中，Kubernetes 服务器立即删除属主对象，控制器在后台清理所有依赖对象。
> 默认情况下，Kubernetes 使用后台级联删除方案，除非你手动设置了要使用前台删除，
> 或者选择遗弃依赖对象。
>
> 参阅[使用后台级联删除](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/use-cascading-deletion/#use-background-cascading-deletion)以了解进一步的细节。

#### Orphaned dependents｜被遗弃的依赖对象

When Kubernetes deletes an owner object, the dependents left behind are called
*orphan* objects. By default, Kubernetes deletes dependent objects. To learn how
to override this behaviour, see [Delete owner objects and orphan dependents](https://kubernetes.io/docs/tasks/administer-cluster/use-cascading-deletion/#set-orphan-deletion-policy).

> 当 Kubernetes 删除某个属主对象时，被留下来的依赖对象被称作被遗弃的（Orphaned）对象。
> 默认情况下，Kubernetes 会删除依赖对象。要了解如何重载这种默认行为，
> 可参阅[删除属主对象和遗弃依赖对象](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/use-cascading-deletion/#set-orphan-deletion-policy)。

### Garbage collection of unused containers and images｜未使用容器和镜像的垃圾收集

The kubelet performs garbage
collection on unused images every two minutes and on unused containers every
minute. You should avoid using external garbage collection tools, as these can
break the kubelet behavior and remove containers that should exist.

> kubelet 会每两分钟对未使用的镜像执行一次垃圾收集，
> 每分钟对未使用的容器执行一次垃圾收集。
> 你应该避免使用外部的垃圾收集工具，因为外部工具可能会破坏 kubelet
> 的行为，移除应该保留的容器。

To configure options for unused container and image garbage collection, tune the
kubelet using a [configuration file](https://kubernetes.io/docs/tasks/administer-cluster/kubelet-config-file/)
and change the parameters related to garbage collection using the
[`KubeletConfiguration`](https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/)
resource type.

> 要配置对未使用容器和镜像的垃圾收集选项，
> 可以使用一个[配置文件](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubelet-config-file/)，基于
> [`KubeletConfiguration`](https://kubernetes.io/zh-cn/docs/reference/config-api/kubelet-config.v1beta1/)
> 资源类型来调整与垃圾收集相关的 kubelet 行为。

#### Container image lifecycle｜容器镜像生命周期

Kubernetes manages the lifecycle of all images through its *image manager*,
which is part of the kubelet, with the cooperation of
cadvisor. The kubelet
considers the following disk usage limits when making garbage collection
decisions:

> Kubernetes 通过其**镜像管理器（Image Manager）** 来管理所有镜像的生命周期，
> 该管理器是 kubelet 的一部分，工作时与
> cadvisor 协同。
> kubelet 在作出垃圾收集决定时会考虑如下磁盘用量约束：
>
> * `HighThresholdPercent`
> * `LowThresholdPercent`

Disk usage above the configured `HighThresholdPercent` value triggers garbage
collection, which deletes images in order based on the last time they were used,
starting with the oldest first. The kubelet deletes images
until disk usage reaches the `LowThresholdPercent` value.

> 磁盘用量超出所配置的 `HighThresholdPercent` 值时会触发垃圾收集，
> 垃圾收集器会基于镜像上次被使用的时间来按顺序删除它们，首先删除的是最近未使用的镜像。
> kubelet 会持续删除镜像，直到磁盘用量到达 `LowThresholdPercent` 值为止。

##### Garbage collection for unused container images｜未使用容器镜像的垃圾收集

**Feature state (Kubernetes v1.31): Beta, enabled by default｜特性状态（Kubernetes v1.31）：Beta，默认启用**

As an beta feature, you can specify the maximum time a local image can be unused for,
regardless of disk usage. This is a kubelet setting that you configure for each node.

> 这是一个 Beta 特性，不论磁盘使用情况如何，你都可以指定本地镜像未被使用的最长时间。
> 这是一个可以为每个节点配置的 kubelet 设置。

To configure the setting, enable the `imageMaximumGCAge`
[feature gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/) for the kubelet,
and also set a value for the `imageMaximumGCAge` field in the kubelet configuration file.

> 请为 kubelet 启用 `imageMaximumGCAge`
> [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)，
> 并在 kubelet 配置文件中为 `imageMaximumGCAge` 字段赋值来配置该设置。

The value is specified as a Kubernetes _duration_;
Valid time units for the `imageMaximumGCAge` field in the kubelet configuration file are:
- "ns" for nanoseconds
- "us" or "µs" for microseconds
- "ms" for milliseconds
- "s" for seconds
- "m" for minutes
- "h" for hours

> 该值应遵循 Kubernetes **持续时间（Duration）** 格式；
> 在 kubelet 配置文件中，`imageMaximumGCAge` 字段的有效时间单位如下：
>
> - "ns" 表示纳秒
> - "us" 或 "µs" 表示微秒
> - "ms" 表示毫秒
> - "s" 表示秒
> - "m" 表示分钟
> - "h" 表示小时

For example, you can set the configuration field to `12h45m`,
which means 12 hours and 45 minutes.

> 例如，你可以将配置字段设置为 `12h45m`，代表 12 小时 45 分钟。
>
> **Note｜说明**
This feature does not track image usage across kubelet restarts. If the kubelet
is restarted, the tracked image age is reset, causing the kubelet to wait the full
`imageMaximumGCAge` duration before qualifying images for garbage collection
based on image age.

> 这个特性不会跟踪 kubelet 重新启动后的镜像使用情况。
> 如果 kubelet 被重新启动，所跟踪的镜像年龄会被重置，
> 导致 kubelet 在根据镜像年龄进行垃圾收集时需要等待完整的
> `imageMaximumGCAge` 时长。

#### Container garbage collection｜容器垃圾收集

The kubelet garbage collects unused containers based on the following variables,
which you can define:

> kubelet 会基于如下变量对所有未使用的容器执行垃圾收集操作，这些变量都是你可以定义的：

* `MinAge`: the minimum age at which the kubelet can garbage collect a
  container. Disable by setting to `0`.
* `MaxPerPodContainer`: the maximum number of dead containers each Pod
  can have. Disable by setting to less than `0`.
* `MaxContainers`: the maximum number of dead containers the cluster can have.
  Disable by setting to less than `0`.

> * `MinAge`：kubelet 可以垃圾回收某个容器时该容器的最小年龄。设置为 `0`
>   表示禁止使用此规则。
> * `MaxPerPodContainer`：每个 Pod 可以包含的已死亡的容器个数上限。设置为小于 `0`
>   的值表示禁止使用此规则。
> * `MaxContainers`：集群中可以存在的已死亡的容器个数上限。设置为小于 `0`
>   的值意味着禁止应用此规则。

In addition to these variables, the kubelet garbage collects unidentified and
deleted containers, typically starting with the oldest first.

`MaxPerPodContainer` and `MaxContainers` may potentially conflict with each other
in situations where retaining the maximum number of containers per Pod
(`MaxPerPodContainer`) would go outside the allowable total of global dead
containers (`MaxContainers`). In this situation, the kubelet adjusts
`MaxPerPodContainer` to address the conflict. A worst-case scenario would be to
downgrade `MaxPerPodContainer` to `1` and evict the oldest containers.
Additionally, containers owned by pods that have been deleted are removed once
they are older than `MinAge`.

> 除以上变量之外，kubelet 还会垃圾收集除无标识的以及已删除的容器，通常从最近未使用的容器开始。
>
> 当保持每个 Pod 的最大数量的容器（`MaxPerPodContainer`）会使得全局的已死亡容器个数超出上限
> （`MaxContainers`）时，`MaxPerPodContainer` 和 `MaxContainers` 之间可能会出现冲突。
> 在这种情况下，kubelet 会调整 `MaxPerPodContainer` 来解决这一冲突。
> 最坏的情形是将 `MaxPerPodContainer` 降格为 `1`，并驱逐最近未使用的容器。
> 此外，当隶属于某已被删除的 Pod 的容器的年龄超过 `MinAge` 时，它们也会被删除。
>
> **Note｜说明**
The kubelet only garbage collects the containers it manages.

> kubelet 仅会回收由它所管理的容器。

### Configuring garbage collection｜配置垃圾收集

You can tune garbage collection of resources by configuring options specific to
the controllers managing those resources. The following pages show you how to
configure garbage collection:

* [Configuring cascading deletion of Kubernetes objects](https://kubernetes.io/docs/tasks/administer-cluster/use-cascading-deletion/)
* [Configuring cleanup of finished Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/)

> 你可以通过配置特定于管理资源的控制器来调整资源的垃圾收集行为。
> 下面的页面为你展示如何配置垃圾收集：
>
> * [配置 Kubernetes 对象的级联删除](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/use-cascading-deletion/)
> * [配置已完成 Job 的清理](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ttlafterfinished/)
>
### What's next｜接下来
* Learn more about [ownership of Kubernetes objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/).
* Learn more about Kubernetes [finalizers](https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/).
* Learn about the [TTL controller](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/) that cleans up finished Jobs.

> * 进一步了解 [Kubernetes 对象的属主关系](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/owners-dependents/)。
> * 进一步了解 Kubernetes [finalizers](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/finalizers/)。
> * 进一步了解 [TTL 控制器](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ttlafterfinished/)，
>   该控制器负责清理已完成的 Job。

---

## Leases｜租约

Distributed systems often have a need for _leases_, which provide a mechanism to lock shared resources
and coordinate activity between members of a set.
In Kubernetes, the lease concept is represented by [Lease](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/lease-v1/)
objects in the `coordination.k8s.io` API Group,
which are used for system-critical capabilities such as node heartbeats and component-level leader election.

> 分布式系统通常需要**租约（Lease）**；租约提供了一种机制来锁定共享资源并协调集合成员之间的活动。
> 在 Kubernetes 中，租约概念表示为 `coordination.k8s.io`
> API 组中的
> [Lease](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/cluster-resources/lease-v1/) 对象，
> 常用于类似节点心跳和组件级领导者选举等系统核心能力。

### Node heartbeats｜节点心跳

Kubernetes uses the Lease API to communicate kubelet node heartbeats to the Kubernetes API server.
For every `Node` , there is a `Lease` object with a matching name in the `kube-node-lease`
namespace. Under the hood, every kubelet heartbeat is an **update** request to this `Lease` object, updating
the `spec.renewTime` field for the Lease. The Kubernetes control plane uses the time stamp of this field
to determine the availability of this `Node`.

See [Node Lease objects](https://kubernetes.io/docs/concepts/architecture/nodes/#node-heartbeats) for more details.

> Kubernetes 使用 Lease API 将 kubelet 节点心跳传递到 Kubernetes API 服务器。
> 对于每个 `Node`，在 `kube-node-lease` 名字空间中都有一个具有匹配名称的 `Lease` 对象。
> 在此基础上，每个 kubelet 心跳都是对该 `Lease` 对象的 **update** 请求，更新该 Lease 的 `spec.renewTime` 字段。
> Kubernetes 控制平面使用此字段的时间戳来确定此 `Node` 的可用性。
>
> 更多细节请参阅 [Node Lease 对象](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/#node-heartbeats)。

### Leader election｜领导者选举

Kubernetes also uses Leases to ensure only one instance of a component is running at any given time.
This is used by control plane components like `kube-controller-manager` and `kube-scheduler` in
HA configurations, where only one instance of the component should be actively running while the other
instances are on stand-by.

> Kubernetes 也使用 Lease 确保在任何给定时间某个组件只有一个实例在运行。
> 这在高可用配置中由 `kube-controller-manager` 和 `kube-scheduler` 等控制平面组件进行使用，
> 这些组件只应有一个实例激活运行，而其他实例待机。

Read [coordinated leader election](https://kubernetes.io/docs/concepts/cluster-administration/coordinated-leader-election)
to learn about how Kubernetes builds on the Lease API to select which component instance
acts as leader.

> 参阅[协调领导者选举](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/coordinated-leader-election)以了解
> Kubernetes 如何基于 Lease API 来选择哪个组件实例充当领导者。

### API server identity｜API 服务器身份

**Feature state (Kubernetes v1.31): Beta, enabled by default｜特性状态（Kubernetes v1.31）：Beta，默认启用**

Starting in Kubernetes v1.26, each `kube-apiserver` uses the Lease API to publish its identity to the
rest of the system. While not particularly useful on its own, this provides a mechanism for clients to
discover how many instances of `kube-apiserver` are operating the Kubernetes control plane.
Existence of kube-apiserver leases enables future capabilities that may require coordination between
each kube-apiserver.

You can inspect Leases owned by each kube-apiserver by checking for lease objects in the `kube-system` namespace
with the name `kube-apiserver-<sha256-hash>`. Alternatively you can use the label selector `apiserver.kubernetes.io/identity=kube-apiserver`:

> 从 Kubernetes v1.26 开始，每个 `kube-apiserver` 都使用 Lease API 将其身份发布到系统中的其他位置。
> 虽然它本身并不是特别有用，但为客户端提供了一种机制来发现有多少个 `kube-apiserver` 实例正在操作
> Kubernetes 控制平面。kube-apiserver 租约的存在使得未来可以在各个 kube-apiserver 之间协调新的能力。
>
> 你可以检查 `kube-system` 名字空间中名为 `kube-apiserver-<sha256-hash>` 的 Lease 对象来查看每个
> kube-apiserver 拥有的租约。你还可以使用标签选择算符 `apiserver.kubernetes.io/identity=kube-apiserver`：
>
```shell
kubectl -n kube-system get lease -l apiserver.kubernetes.io/identity=kube-apiserver
```
>
```
NAME                                        HOLDER                                                                           AGE
apiserver-07a5ea9b9b072c4a5f3d1c3702        apiserver-07a5ea9b9b072c4a5f3d1c3702_0c8914f7-0f35-440e-8676-7844977d3a05        5m33s
apiserver-7be9e061c59d368b3ddaf1376e        apiserver-7be9e061c59d368b3ddaf1376e_84f2a85d-37c1-4b14-b6b9-603e62e4896f        4m23s
apiserver-1dfef752bcb36637d2763d1868        apiserver-1dfef752bcb36637d2763d1868_c5ffa286-8a9a-45d4-91e7-61118ed58d2e        4m43s
```

The SHA256 hash used in the lease name is based on the OS hostname as seen by that API server. Each kube-apiserver should be
configured to use a hostname that is unique within the cluster. New instances of kube-apiserver that use the same hostname
will take over existing Leases using a new holder identity, as opposed to instantiating new Lease objects. You can check the
hostname used by kube-apisever by checking the value of the `kubernetes.io/hostname` label:

> 租约名称中使用的 SHA256 哈希基于 API 服务器所看到的操作系统主机名生成。
> 每个 kube-apiserver 都应该被配置为使用集群中唯一的主机名。
> 使用相同主机名的 kube-apiserver 新实例将使用新的持有者身份接管现有 Lease，而不是实例化新的 Lease 对象。
> 你可以通过检查 `kubernetes.io/hostname` 标签的值来查看 kube-apisever 所使用的主机名：
>
```shell
kubectl -n kube-system get lease apiserver-07a5ea9b9b072c4a5f3d1c3702 -o yaml
```
>
```yaml
apiVersion: coordination.k8s.io/v1
kind: Lease
metadata:
  creationTimestamp: "2023-07-02T13:16:48Z"
  labels:
    apiserver.kubernetes.io/identity: kube-apiserver
    kubernetes.io/hostname: master-1
  name: apiserver-07a5ea9b9b072c4a5f3d1c3702
  namespace: kube-system
  resourceVersion: "334899"
  uid: 90870ab5-1ba9-4523-b215-e4d4e662acb1
spec:
  holderIdentity: apiserver-07a5ea9b9b072c4a5f3d1c3702_0c8914f7-0f35-440e-8676-7844977d3a05
  leaseDurationSeconds: 3600
  renewTime: "2023-07-04T21:58:48.065888Z"
```

Expired leases from kube-apiservers that no longer exist are garbage collected by new kube-apiservers after 1 hour.

You can disable API server identity leases by disabling the `APIServerIdentity`
[feature gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/).

> kube-apiserver 中不再存续的已到期租约将在到期 1 小时后被新的 kube-apiserver 作为垃圾收集。
>
> 你可以通过禁用 `APIServerIdentity`
> [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)来禁用 API 服务器身份租约。

### Workloads｜工作负载

Your own workload can define its own use of Leases. For example, you might run a custom
controller where a primary or leader member
performs operations that its peers do not. You define a Lease so that the controller replicas can select
or elect a leader, using the Kubernetes API for coordination.
If you do use a Lease, it's a good practice to define a name for the Lease that is obviously linked to
the product or component. For example, if you have a component named Example Foo, use a Lease named
`example-foo`.

> 你自己的工作负载可以定义自己使用的 Lease。例如，
> 你可以运行自定义的控制器，
> 让主要成员或领导者成员在其中执行其对等方未执行的操作。
> 你定义一个 Lease，以便控制器副本可以使用 Kubernetes API 进行协调以选择或选举一个领导者。
> 如果你使用 Lease，良好的做法是为明显关联到产品或组件的 Lease 定义一个名称。
> 例如，如果你有一个名为 Example Foo 的组件，可以使用名为 `example-foo` 的 Lease。

If a cluster operator or another end user could deploy multiple instances of a component, select a name
prefix and pick a mechanism (such as hash of the name of the Deployment) to avoid name collisions
for the Leases.

You can use another approach so long as it achieves the same outcome: different software products do
not conflict with one another.

> 如果集群操作员或其他终端用户可以部署一个组件的多个实例，
> 则选择名称前缀并挑选一种机制（例如 Deployment 名称的哈希）以避免 Lease 的名称冲突。
>
> 你可以使用另一种方式来达到相同的效果：不同的软件产品不相互冲突。
