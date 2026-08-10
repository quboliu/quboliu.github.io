---
lang: "zh-CN"
pubDatetime: 2024-11-03T12:00:00+08:00
timezone: "Asia/Shanghai"
title: "官方文档 | Kubernetes API Conventions｜Kubernetes API 约定"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "官方文档"
  - "Kubernetes"
  - "Kubernetes API"
  - "API 设计"
  - "控制器"
  - "分布式系统"
description: "Kubernetes API Conventions 官方设计文档中英对照精读：覆盖 Kind 与 Resource、spec/status、幂等性、默认值、并发控制、对象引用及 API 校验。"
---
> **Source and translation basis｜来源与翻译依据**
>
> [Kubernetes API Conventions](https://github.com/kubernetes/community/blob/fb55d44be24fa626d38c9116e966c0237ecd58ab/contributors/devel/sig-architecture/api-conventions.md), frozen at `kubernetes/community` commit [`fb55d44be24f`](https://github.com/kubernetes/community/commit/fb55d44be24fa626d38c9116e966c0237ecd58ab) (2023-10-26). The source repository is licensed under [Apache License 2.0](https://github.com/kubernetes/community/blob/fb55d44be24fa626d38c9116e966c0237ecd58ab/LICENSE).
>
> 原文固定于 `kubernetes/community` 提交 [`fb55d44be24f`](https://github.com/kubernetes/community/commit/fb55d44be24fa626d38c9116e966c0237ecd58ab)（2023-10-26）。本文完整保留可见原文，并在每个语义单元后给出中文翻译；规范性关键词及代码标识符均按原文语义核对。源代码仓库采用 [Apache License 2.0](https://github.com/kubernetes/community/blob/fb55d44be24fa626d38c9116e966c0237ecd58ab/LICENSE) 许可。
>
> **Reading context｜阅读背景：** 本文阅读时间安排在 2024 年 11 月，对应存算分离云原生数据库项目中的 Kubernetes 与 Longhorn 实践。阅读重点是理解声明式 API 为何强调 `spec/status` 分离、基于层级的调谐、幂等更新以及 `resourceVersion` 并发控制。

---

*This document is oriented at users who want a deeper understanding of the
Kubernetes API structure, and developers wanting to extend the Kubernetes API.
An introduction to using resources with kubectl can be found in [the object management overview](https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/).*

> *本文档面向希望深入了解 Kubernetes API 结构的用户以及希望扩展 Kubernetes API 的开发者。有关通过 kubectl 使用资源的介绍可以在 [对象管理概述](https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/) 中找到。*

**Table of Contents**

> **目录**

- [Types (Kinds)](#types-kinds)
  - [Resources](#resources)
  - [Objects](#objects)
    - [Metadata](#metadata)
    - [Spec and Status](#spec-and-status)
      - [Typical status properties](#typical-status-properties)
    - [References to related objects](#references-to-related-objects)
    - [Lists of named subobjects preferred over maps](#lists-of-named-subobjects-preferred-over-maps)
    - [Primitive types](#primitive-types)
    - [Constants](#constants)
    - [Unions](#unions)
  - [Lists and Simple kinds](#lists-and-simple-kinds)
- [Differing Representations](#differing-representations)
- [Verbs on Resources](#verbs-on-resources)
  - [PATCH operations](#patch-operations)
- [Short-names and Categories](#short-names-and-categories)
  - [Short-names](#short-names)
  - [Categories](#categories)
- [Idempotency](#idempotency)
- [Optional vs. Required](#optional-vs-required)
- [Defaulting](#defaulting)
  - [Static Defaults](#static-defaults)
  - [Admission Controlled Defaults](#admission-controlled-defaults)
  - [Controller-Assigned Defaults (aka Late Initialization)](#controller-assigned-defaults-aka-late-initialization)
  - [What May Be Defaulted](#what-may-be-defaulted)
  - [Considerations For PUT Operations](#considerations-for-put-operations)
- [Concurrency Control and Consistency](#concurrency-control-and-consistency)
- [Serialization Format](#serialization-format)
- [Units](#units)
- [Selecting Fields](#selecting-fields)
- [Object references](#object-references)
  - [Naming of the reference field](#naming-of-the-reference-field)
  - [Referencing resources with multiple versions](#referencing-resources-with-multiple-versions)
  - [Handling of resources that do not exist](#handling-of-resources-that-do-not-exist)
  - [Validation of fields](#validation-of-fields)
  - [Do not modify the referred object](#do-not-modify-the-referred-object)
  - [Minimize copying or printing values to the referrer object](#minimize-copying-or-printing-values-to-the-referrer-object)
  - [Object References Examples](#object-references-examples)
    - [Single resource reference](#single-resource-reference)
      - [Controller behavior](#controller-behavior)
    - [Multiple resource reference](#multiple-resource-reference)
      - [Kind vs. Resource](#kind-vs-resource)
      - [Controller behavior](#controller-behavior-1)
    - [Generic object reference](#generic-object-reference)
      - [Controller behavior](#controller-behavior-2)
    - [Field reference](#field-reference)
      - [Controller behavior](#controller-behavior-3)
- [HTTP Status codes](#http-status-codes)
    - [Success codes](#success-codes)
    - [Error codes](#error-codes)
- [Response Status Kind](#response-status-kind)
- [Events](#events)
- [Naming conventions](#naming-conventions)
  - [Namespace Names](#namespace-names)
- [Label, selector, and annotation conventions](#label-selector-and-annotation-conventions)
- [WebSockets and SPDY](#websockets-and-spdy)
- [Validation](#validation)
- [Automatic Resource Allocation And Deallocation](#automatic-resource-allocation-and-deallocation)
- [Representing Allocated Values](#representing-allocated-values)
  - [When to use a <code>spec</code> field](#when-to-use-a-spec-field)
  - [When to use a <code>status</code> field](#when-to-use-a-status-field)
    - [Sequencing operations](#sequencing-operations)
  - [When to use a different type](#when-to-use-a-different-type)

> - [类型（Kind）](#types-kinds)
>   - [资源](#resources)
>   - [对象](#objects)
>     - [元数据](#metadata)
>     - [Spec 与 Status](#spec-and-status)
>       - [典型的 status 属性](#typical-status-properties)
>     - [对相关对象的引用](#references-to-related-objects)
>     - [优先使用具名子对象列表，而非映射](#lists-of-named-subobjects-preferred-over-maps)
>     - [原始类型](#primitive-types)
>     - [常量](#constants)
>     - [联合类型](#unions)
>   - [List 与 Simple 类别](#lists-and-simple-kinds)
> - [不同的表示形式](#differing-representations)
> - [作用于资源的动词](#verbs-on-resources)
>   - [PATCH 操作](#patch-operations)
> - [短名称与类别分组](#short-names-and-categories)
>   - [短名称](#short-names)
>   - [类别分组](#categories)
> - [幂等性](#idempotency)
> - [可选与必需](#optional-vs-required)
> - [默认值处理](#defaulting)
>   - [静态默认值](#static-defaults)
>   - [准入控制默认值](#admission-controlled-defaults)
>   - [控制器赋予的默认值（又称延迟初始化）](#controller-assigned-defaults-aka-late-initialization)
>   - [哪些内容可以设置默认值](#what-may-be-defaulted)
>   - [PUT 操作的注意事项](#considerations-for-put-operations)
> - [并发控制与一致性](#concurrency-control-and-consistency)
> - [序列化格式](#serialization-format)
> - [单位](#units)
> - [选择字段](#selecting-fields)
> - [对象引用](#object-references)
>   - [引用字段的命名](#naming-of-the-reference-field)
>   - [引用具有多个版本的资源](#referencing-resources-with-multiple-versions)
>   - [处理不存在的资源](#handling-of-resources-that-do-not-exist)
>   - [字段校验](#validation-of-fields)
>   - [不要修改被引用对象](#do-not-modify-the-referred-object)
>   - [尽量不要向引用方对象复制或输出值](#minimize-copying-or-printing-values-to-the-referrer-object)
>   - [对象引用示例](#object-references-examples)
>     - [单一资源引用](#single-resource-reference)
>       - [控制器行为](#controller-behavior)
>     - [多资源引用](#multiple-resource-reference)
>       - [Kind 与 Resource](#kind-vs-resource)
>       - [控制器行为](#controller-behavior-1)
>     - [通用对象引用](#generic-object-reference)
>       - [控制器行为](#controller-behavior-2)
>     - [字段引用](#field-reference)
>       - [控制器行为](#controller-behavior-3)
> - [HTTP 状态码](#http-status-codes)
>     - [成功状态码](#success-codes)
>     - [错误状态码](#error-codes)
> - [Status 响应类别](#response-status-kind)
> - [事件](#events)
> - [命名约定](#naming-conventions)
>   - [名字空间名称](#namespace-names)
> - [标签、选择器与注解约定](#label-selector-and-annotation-conventions)
> - [WebSocket 与 SPDY](#websockets-and-spdy)
> - [校验](#validation)
> - [资源的自动分配与释放](#automatic-resource-allocation-and-deallocation)
> - [表示已分配的值](#representing-allocated-values)
>   - [何时使用 `spec` 字段](#when-to-use-a-spec-field)
>   - [何时使用 `status` 字段](#when-to-use-a-status-field)
>     - [操作顺序](#sequencing-operations)
>   - [何时使用不同类型](#when-to-use-a-different-type)

The conventions of the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/) (and related APIs in the
ecosystem) are intended to ease client development and ensure that configuration
mechanisms can be implemented that work across a diverse set of use cases
consistently.

> [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/)（以及生态系统中的相关 API）的约定旨在简化客户端开发，并确保可以实现在各种用例中一致工作的配置机制。

The general style of the Kubernetes API is RESTful - clients create, update,
delete, or retrieve a description of an object via the standard HTTP verbs
(POST, PUT, DELETE, and GET) - and those APIs preferentially accept and return
JSON. Kubernetes also exposes additional endpoints for non-standard verbs and
allows alternative content types. All of the JSON accepted and returned by the
server has a schema, identified by the "kind" and "apiVersion" fields. Where
relevant HTTP header fields exist, they should mirror the content of JSON
fields, but the information should not be represented only in the HTTP header.

> Kubernetes API 的一般风格是 RESTful——客户端通过标准 HTTP 动词（POST、PUT、DELETE 和 GET）创建、更新、删除或检索对象的描述——并且这些 API 优先接受并返回 JSON。Kubernetes 还公开了非标准动词的附加端点，并允许替代内容类型。服务器接受和返回的所有 JSON 都有一个架构，由 "kind" 和 "apiVersion" 字段标识。如果存在相关的 HTTP 标头字段，它们应该镜像 JSON 字段的内容，但信息不应仅在 HTTP 标头中表示。

The following terms are defined:

> 定义了以下术语：

* **Kind** the name of a particular object schema (e.g. the "Cat" and "Dog"
kinds would have different attributes and properties)
* **Resource** a representation of a system entity, sent or retrieved as JSON
via HTTP to the server. Resources are exposed via:
  * Collections - a list of resources of the same type, which may be queryable
  * Elements - an individual resource, addressable via a URL
* **API Group** a set of resources that are exposed together, along
with the version exposed in the "apiVersion" field as "GROUP/VERSION", e.g.
"policy.k8s.io/v1".

> * **类别** 特定对象模式的名称（例如，"Cat" 和 "Dog" 类别将具有不同的属性和特性）
> * **资源** 系统实体的表示，通过 HTTP 以 JSON 形式发送或检索到服务器。资源通过以下方式公开：
>   * 集合——相同类型的资源列表，可以查询
>   * 元素——单个资源，可通过 URL 寻址
> * **API 组** 一组一起公开的资源，以及在 "apiVersion" 字段中公开为 "GROUP/VERSION" 的版本，例如"policy.k8s.io/v1"。

Each resource typically accepts and returns data of a single kind. A kind may be
accepted or returned by multiple resources that reflect specific use cases. For
instance, the kind "Pod" is exposed as a "pods" resource that allows end users
to create, update, and delete pods, while a separate "pod status" resource (that
acts on "Pod" kind) allows automated processes to update a subset of the fields
in that resource.

> 每个资源通常接受并返回单个类别的数据。类别可以被反映特定用例的多个资源接受或返回。例如，类别 "Pod" 作为 "pods" 资源公开，允许最终用户创建、更新和删除 pod，而单独的“pod 状态”资源（作用于 "Pod" 类别）允许自动化进程更新该资源中的字段子集。

Resources are bound together in API groups - each group may have one or more
versions that evolve independent of other API groups, and each version within
the group has one or more resources. Group names are typically in domain name
form - the Kubernetes project reserves use of the empty group, all single
word names ("extensions", "apps"), and any group name ending in "*.k8s.io" for
its sole use. When choosing a group name, we recommend selecting a subdomain
your group or organization owns, such as "widget.mycompany.com".

> 资源在 API 组中绑定在一起——每个组可能有一个或多个独立于其他 API 组发展的版本，并且组内的每个版本都有一个或多个资源。组名称通常采用域名形式——Kubernetes 项目保留使用空组、所有单字名称（"extensions"、"apps"）以及任何以 "*.k8s.io" 结尾的组名称仅供其单独使用。选择组名称时，我们建议选择您的组或组织拥有的子域，例如 "widget.mycompany.com"。

Version strings should match
[DNS_LABEL](https://git.k8s.io/design-proposals-archive/architecture/identifiers.md)
format.

> 版本字符串应匹配 [DNS_LABEL](https://git.k8s.io/design-proposals-archive/architecture/identifiers.md) 格式。

Resource collections should be all lowercase and plural, whereas kinds are
CamelCase and singular. Group names must be lower case and be valid DNS
subdomains.

> 资源集合应全部小写且复数，而类别为驼峰式命名且单数。组名称必须是小写且是有效的 DNS 子域。

## Types (Kinds)｜类型（Kind）

Kinds are grouped into three categories:

> 类别分为三类：

1. **Objects** represent a persistent entity in the system.

   Creating an API object is a record of intent - once created, the system will
work to ensure that resource exists. All API objects have common metadata.

   An object may have multiple resources that clients can use to perform
specific actions that create, update, delete, or get.

   Examples: `Pod`, `ReplicationController`, `Service`, `Namespace`, `Node`.

2. **Lists** are collections of **resources** of one (usually) or more
(occasionally) kinds.

   The name of a list kind must end with "List". Lists have a limited set of
common metadata. All lists use the required "items" field to contain the array
of objects they return. Any kind that has the "items" field must be a list kind.

   Most objects defined in the system should have an endpoint that returns the
full set of resources, as well as zero or more endpoints that return subsets of
the full list. Some objects may be singletons (the current user, the system
defaults) and may not have lists.

   In addition, all lists that return objects with labels should support label
filtering (see [the labels documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)),
and most lists should support filtering by fields (see
[the fields documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/field-selectors/)).

   Examples: `PodList`, `ServiceList`, `NodeList`.

> 1. **对象**代表系统中的持久实体。创建 API 对象是意图的记录——一旦创建，系统将努力确保资源存在。所有 API 对象都有共同的元数据。一个对象可能有多个资源，客户端可以使用这些资源来执行创建、更新、删除或获取等特定操作。示例：`Pod`、`ReplicationController`、`Service`、`Namespace`、`Node`。
> 2. **列表**是一个（通常）或多个（偶尔）类别的**资源**的集合。列表名称类别必须以 "List" 结尾。列表具有一组有限的公共元数据。所有列表都使用必需的 "items" 字段来包含它们返回的对象数组。任何具有 "items" 字段的类别都必须是列表类别。系统中定义的大多数对象应该有一个返回完整资源集的端点，以及零个或多个返回完整列表子集的端点。有些对象可能是单例（当前用户，系统默认）并且可能没有列表。此外，所有返回带有标签的对象的列表都应支持标签过滤（请参阅[标签文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)），并且大多数列表应支持按字段过滤（请参阅[字段文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/field-selectors/)）。示例：`PodList`、`ServiceList`、`NodeList`。

Note that`kubectl` and other tools sometimes output collections of resources
as `kind: List`. Keep in mind that `kind: List` is not part of the Kubernetes API; it is
exposing an implementation detail from client-side code in those tools, used to
handle groups of mixed resources.

> 请注意，`kubectl` 和其他工具有时会将资源集合输出为 `kind: List`。请记住，`kind: List` 不是 Kubernetes API 的一部分；它公开了这些工具中客户端代码的实现细节，用于处理混合资源组。

3. **Simple** kinds are used for specific actions on objects and for
non-persistent entities.

   Given their limited scope, they have the same set of limited common metadata
as lists.

   For instance, the "Status" kind is returned when errors occur and is not
persisted in the system.

   Many simple resources are "subresources", which are rooted at API paths of
specific resources. When resources wish to expose alternative actions or views
that are closely coupled to a single resource, they should do so using new
sub-resources. Common subresources include:

   * `/binding`: Used to bind a resource representing a user request (e.g., Pod,
PersistentVolumeClaim) to a cluster infrastructure resource (e.g., Node,
PersistentVolume).
   * `/status`: Used to write just the `status` portion of a resource. For
example, the `/pods` endpoint only allows updates to `metadata` and `spec`,
since those reflect end-user intent. An automated process should be able to
modify status for users to see by sending an updated Pod kind to the server to
the "/pods/&lt;name&gt;/status" endpoint - the alternate endpoint allows
different rules to be applied to the update, and access to be appropriately
restricted.
   * `/scale`: Used to read and write the count of a resource in a manner that
is independent of the specific resource schema.

   Two additional subresources, `proxy` and `portforward`, provide access to
cluster resources as described in
[accessing the cluster](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/).

> 3. **简单** 类别用于对对象和非持久实体执行特定操作。鉴于其范围有限，它们具有与列表相同的有限公共元数据集。例如，当发生错误时，会返回 "Status" 类别，并且不会保留在系统中。许多简单资源都是"subresources"，它们植根于特定资源的API路径。当资源希望公开与单个资源紧密耦合的替代操作或视图时，它们应该使用新的子资源来实现。常见的子资源包括：
>    * `/binding`：用于将表示用户请求的资源（例如 Pod、PersistentVolumeClaim）绑定到集群基础设施资源（例如 Node、PersistentVolume）。
>    * `/status`：用于仅写入资源的 `status` 部分。例如，`/pods` 端点仅允许更新 `metadata` 和 `spec`，因为这些反映了最终用户的意图。自动化流程应该能够通过将更新的 Pod 类别发送到服务器的“/pods/<name>/status”端点来修改用户查看的状态——备用端点允许对更新应用不同的规则，并适当限制访问。
>    * `/scale`：用于以独立于特定资源模式的方式读取和写入资源的计数。两个附加子资源 `proxy` 和 `portforward` 提供对群集资源的访问，如[访问群集](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/) 中所述。

The standard REST verbs (defined below) MUST return singular JSON objects. Some
API endpoints may deviate from the strict REST pattern and return resources that
are not singular JSON objects, such as streams of JSON objects or unstructured
text log data.

> 标准 REST 动词（定义如下）必须返回单数 JSON 对象。某些 API 端点可能会偏离严格的 REST 模式并返回非单一 JSON 对象的资源，例如 JSON 对象流或非结构化文本日志数据。

A common set of "meta" API objects are used across all API groups and are
thus considered part of the API group named `meta.k8s.io`. These types may
evolve independent of the API group that uses them and API servers may allow
them to be addressed in their generic form. Examples are `ListOptions`,
`DeleteOptions`, `List`, `Status`, `WatchEvent`, and `Scale`. For historical
reasons these types are part of each existing API group. Generic tools like
quota, garbage collection, autoscalers, and generic clients like kubectl
leverage these types to define consistent behavior across different resource
types, like the interfaces in programming languages.

> 所有 API 组都使用一组通用的 "meta" API 对象，因此被视为名为 `meta.k8s.io` 的 API 组的一部分。这些类型可能会独立于使用它们的 API 组而发展，并且 API 服务器可能允许以通用形式对它们进行寻址。示例包括 `ListOptions`、`DeleteOptions`、`List`、`Status`、`WatchEvent` 和 `Scale`。由于历史原因，这些类型是每个现有 API 组的一部分。配额、垃圾收集、自动缩放器等通用工具和 kubectl 等通用客户端利用这些类型来定义跨不同资源类型的一致行为，例如编程语言中的接口。

The term "kind" is reserved for these "top-level" API types. The term "type"
should be used for distinguishing sub-categories within objects or subobjects.

> 术语 "kind" 是为这些 "top-level" API 类型保留的。术语 "type" 应用于区分对象或子对象内的子类别。

### Resources｜资源

All JSON objects returned by an API MUST have the following fields:

> API 返回的所有 JSON 对象必须具有以下字段：

* kind: a string that identifies the schema this object should have
* apiVersion: a string that identifies the version of the schema the object
should have

> * 类别：标识该对象应具有的模式的字符串
> * apiVersion：标识对象应具有的模式版本的字符串

These fields are required for proper decoding of the object. They may be
populated by the server by default from the specified URL path, but the client
likely needs to know the values in order to construct the URL path.

> 这些字段是正确解码对象所必需的。默认情况下，服务器可能会从指定的 URL 路径填充它们，但客户端可能需要知道这些值才能构造 URL 路径。

### Objects｜对象

#### Metadata｜元数据

Every object kind MUST have the following metadata in a nested object field
called "metadata":

> 每个对象类别必须在名为 "metadata" 的嵌套对象字段中具有以下元数据：

* namespace: a namespace is a DNS compatible label that objects are subdivided
into. The default namespace is 'default'. See
[the namespace docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) for more.
* name: a string that uniquely identifies this object within the current
namespace (see [the identifiers docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)).
This value is used in the path when retrieving an individual object.
* uid: a unique in time and space value (typically an RFC 4122 generated
identifier, see [the identifiers docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/))
used to distinguish between objects with the same name that have been deleted
and recreated

> * 命名空间：命名空间是对象被细分的 DNS 兼容标签。默认命名空间是“default”。有关更多信息，请参阅[命名空间文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)。
> * name：在当前命名空间中唯一标识该对象的字符串（请参阅[标识符文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)）。当检索单个对象时，该值在路径中使用。
> * uid：时间和空间上的唯一值（通常是 RFC 4122 生成的标识符，请参阅 [标识符文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)），用于区分已删除和重新创建的同名对象

Every object SHOULD have the following metadata in a nested object field called
"metadata":

> 每个对象应该在名为 "metadata" 的嵌套对象字段中具有以下元数据：

* resourceVersion: a string that identifies the internal version of this object
that can be used by clients to determine when objects have changed. This value
MUST be treated as opaque by clients and passed unmodified back to the server.
Clients should not assume that the resource version has meaning across
namespaces, different kinds of resources, or different servers. (See
[concurrency control](#concurrency-control-and-consistency), below, for more
details.)
* generation: a sequence number representing a specific generation of the
desired state. Set by the system and monotonically increasing, per-resource. May
be compared, such as for RAW and WAW consistency.
* creationTimestamp: a string representing an RFC 3339 date of the date and time
an object was created
* deletionTimestamp: a string representing an RFC 3339 date of the date and time
after which this resource will be deleted. This field is set by the server when
a graceful deletion is requested by the user, and is not directly settable by a
client. The resource will be deleted (no longer visible from resource lists, and
not reachable by name) after the time in this field except when the object has
a finalizer set. In case the finalizer is set the deletion of the object is
postponed at least until the finalizer is removed.
Once the deletionTimestamp is set, this value may not be unset or be set further
into the future, although it may be shortened or the resource may be deleted
prior to this time.
* labels: a map of string keys and values that can be used to organize and
categorize objects (see [the labels docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/))
* annotations: a map of string keys and values that can be used by external
tooling to store and retrieve arbitrary metadata about this object (see
[the annotations docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/))

> * ResourceVersion：标识该对象的内部版本的字符串，客户端可以使用该字符串来确定对象何时发生更改。该值必须被客户端视为不透明，并未经修改地传递回服务器。客户端不应假定资源版本具有跨命名空间、不同类别资源或不同服务器的含义。（有关更多详细信息，请参阅下面的[并发控制](#concurrency-control-and-consistency)。）
> * Generation：表示所需状态的特定代的序列号。由系统设置并按资源单调递增。可以进行比较，例如 RAW 和 WAW 的一致性。
> * 创建时间戳：表示创建对象的日期和时间的 RFC 3339 日期的字符串
> * 删除时间戳：一个字符串，表示 RFC 3339 日期和时间，在此之后将删除该资源。当用户请求正常删除时，该字段由服务器设置，并且客户端不能直接设置。在此字段中的时间之后，资源将被删除（不再从资源列表中可见，并且无法通过名称访问），除非对象设置了终结器。如果设置了终结器，则对象的删除至少会推迟到终结器被删除为止。一旦设置了deletionTimestamp，该值就不能被取消设置或在将来进一步设置，尽管它可能会被缩短或者资源可能会在该时间之前被删除。
> * 标签：可用于组织和分类对象的字符串键和值的映射（请参阅[标签文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)）
> * 注释：字符串键和值的映射，外部工具可以使用它来存储和检索有关该对象的任意元数据（请参阅[注释文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/)）

Labels are intended for organizational purposes by end users (select the pods
that match this label query). Annotations enable third-party automation and
tooling to decorate objects with additional metadata for their own use.

> 标签供最终用户用于组织目的（选择与此标签查询匹配的 Pod）。注释使第三方自动化和工具能够使用附加元数据来装饰对象以供其自己使用。

#### Spec and Status｜Spec 与 Status

By convention, the Kubernetes API makes a distinction between the specification
of the desired state of an object (a nested object field called `spec`) and the
status of the object at the current time (a nested object field called
`status`). The specification is a complete description of the desired state,
including configuration settings provided by the user,
[default values](#defaulting) expanded by the system, and properties initialized
or otherwise changed after creation by other ecosystem components (e.g.,
schedulers, auto-scalers), and is persisted in stable storage with the API
object. If the specification is deleted, the object will be purged from the
system.

> 按照惯例，Kubernetes API 区分对象所需状态的规范（名为 `spec` 的嵌套对象字段）和当前对象的状态（名为 `status` 的嵌套对象字段）。该规范是对所需状态的完整描述，包括用户提供的配置设置、系统扩展的[默认值](#defaulting)以及其他生态系统组件（例如调度器、自动缩放程序）创建后初始化或以其他方式更改的属性，并通过 API 对象持久保存在稳定存储中。如果删除规范，该对象将从系统中清除。

The `status` summarizes the current state of the object in the system, and is
usually persisted with the object by automated processes but may be generated
on the fly.  As a general guideline, fields in `status` should be the most recent
observations of actual state, but they may contain information such as the
results of allocations or similar operations which are executed in response to
the object's `spec`.  See [below](#representing-allocated-values) for more
details.

> `status` 总结了系统中对象的当前状态，通常通过自动化过程与对象一起保存，但也可以动态生成。作为一般准则，`status` 中的字段应该是实际状态的最新观察结果，但它们可能包含诸如分配结果或响应对象的 `spec` 执行的类似操作之类的信息。有关更多详细信息，请参阅[下文](#representing-allocated-values)。

Types with both `spec` and `status` stanzas can (and usually should) have distinct
authorization scopes for them.  This allows users to be granted full write
access to `spec` and read-only access to status, while relevant controllers are
granted read-only access to `spec` but full write access to status.

> 同时具有 `spec` 和 `status` 节的类型可以（并且通常应该）具有不同的授权范围。这允许用户被授予对 `spec` 的完全写访问权限和对状态的只读访问权限，同时授予相关控制器对 `spec` 的只读访问权限，但对状态的完全写访问权限。

When a new version of an object is POSTed or PUT, the `spec` is updated and
available immediately. Over time the system will work to bring the `status` into
line with the `spec`. The system will drive toward the most recent `spec`
regardless of previous versions of that stanza. For example, if a value is
changed from 2 to 5 in one PUT and then back down to 3 in another PUT the system
is not required to 'touch base' at 5 before changing the `status` to 3. In other
words, the system's behavior is *level-based* rather than *edge-based*. This
enables robust behavior in the presence of missed intermediate state changes.

> 当发布对象的新版本或通过 PUT 写入新版本时，`spec` 会立即更新并可用。随着时间的推移，系统将努力使 `status` 与 `spec` 保持一致。无论该节的先前版本如何，系统都将转向最新的 `spec`。例如，如果在一个 PUT 中将值从 2 更改为 5，然后在另一个 PUT 中返回到 3，则在将 `status` 更改为 3 之前，系统不需要经历 5 这一中间状态。换句话说，系统的行为是“基于层级”而不是“基于边沿”。这使得在错过中间状态变化的情况下能够实现稳健的行为。

The Kubernetes API also serves as the foundation for the declarative
configuration schema for the system. In order to facilitate level-based
operation and expression of declarative configuration, fields in the
specification should have declarative rather than imperative names and
semantics -- they represent the desired state, not actions intended to yield the
desired state.

> Kubernetes API 还充当系统声明式配置模式的基础。为了促进基于层级的操作和声明式配置的表达，规约中的字段应该采用声明式而非命令式的名称与语义——它们表示期望的状态，而不是旨在产生期望状态的操作。

The PUT and POST verbs on objects MUST ignore the `status` values, to avoid
accidentally overwriting the `status` in read-modify-write scenarios. A `/status`
subresource MUST be provided to enable system components to update statuses of
resources they manage.

> 对象上的 PUT 和 POST 动词必须忽略 `status` 值，以避免在读取-修改-写入场景中意外覆盖 `status`。必须提供 `/status` 子资源，以使系统组件能够更新其管理的资源的状态。

Otherwise, PUT expects the whole object to be specified. Therefore, if a field
is omitted it is assumed that the client wants to clear that field's value. The
PUT verb does not accept partial updates. Modification of just part of an object
may be achieved by GETting the resource, modifying part of the spec, labels, or
annotations, and then PUTting it back. See
[concurrency control](#concurrency-control-and-consistency), below, regarding
read-modify-write consistency when using this pattern. Some objects may expose
alternative resource representations that allow mutation of the status, or
performing custom actions on the object.

> 否则，PUT 期望指定整个对象。因此，如果省略某个字段，则假定客户端想要清除该字段的值。PUT 动词不接受部分更新。仅修改对象的一部分可以通过获取资源、修改部分规范、标签或注释，然后再通过 PUT 写回实现。有关使用此模式时的读取-修改-写入一致性的信息，请参阅下面的[并发控制](#concurrency-control-and-consistency)。某些对象可能会公开允许修改状态或对对象执行自定义操作的替代资源表示。

All objects that represent a physical resource whose state may vary from the
user's desired intent SHOULD have a `spec` and a `status`. Objects whose state
cannot vary from the user's desired intent MAY have only `spec`, and MAY rename
`spec` to a more appropriate name.

> 所有表示其状态可能与用户期望的意图不同的物理资源的对象应该具有 `spec` 和 `status`。状态不能与用户期望的意图不同的对象可以只有 `spec`，并且可以将 `spec` 重命名为更合适的名称。

Objects that contain both `spec` and `status` should not contain additional
top-level fields other than the standard metadata fields.

> 同时包含 `spec` 和 `status` 的对象不应包含除标准元数据字段之外的其他顶级字段。

Some objects which are not persisted in the system - such as `SubjectAccessReview`
and other webhook style calls - may choose to add `spec` and `status` to encapsulate
a "call and response" pattern. The `spec` is the request (often a request for
information) and the `status` is the response. For these RPC like objects the only
operation may be POST, but having a consistent schema between submission and
response reduces the complexity of these clients.

> 一些未保留在系统中的对象（例如 `SubjectAccessReview` 和其他 Webhook 样式调用）可能会选择添加 `spec` 和 `status` 来封装“调用和响应”模式。`spec` 是请求（通常是信息请求），`status` 是响应。对于这些类似 RPC 的对象，唯一的操作可能是 POST，但是在提交和响应之间具有一致的模式会降低这些客户端的复杂性。

##### Typical status properties｜典型的 status 属性

**Conditions** provide a standard mechanism for higher-level status reporting
from a controller. They are an extension mechanism which allows tools and other
controllers to collect summary information about resources without needing to
understand resource-specific status details. Conditions should complement more
detailed information about the observed status of an object written by a
controller, rather than replace it. For example, the "Available" condition of a
Deployment can be determined by examining `readyReplicas`, `replicas`, and
other properties of the Deployment. However, the "Available" condition allows
other components to avoid duplicating the availability logic in the Deployment
controller.

> **条件**为控制器提供更高级别的状态报告的标准机制。它们是一种扩展机制，允许工具和其他控制器收集有关资源的摘要信息，而无需了解特定于资源的状态详细信息。条件应该补充有关控制器对对象所观测状态的更详细信息，而不是替换它。例如，部署的 "Available" 条件可以通过检查 `readyReplicas`、`replicas` 和部署的其他属性来确定。但是，"Available" 条件允许其他组件避免在部署控制器中重复可用性逻辑。

Objects may report multiple conditions, and new types of conditions may be
added in the future or by 3rd party controllers. Therefore, conditions are
represented using a list/slice of objects, where each condition has a similar
structure. This collection should be treated as a map with a key of `type`.

> 对象可以报告多种条件，并且将来或由第 3 方控制器可能添加新类型的条件。因此，条件是使用对象列表/切片来表示的，其中每个条件都具有相似的结构。该集合应被视为密钥为 `type` 的地图。

Conditions are most useful when they follow some consistent conventions:

> 当条件遵循一些一致的约定时，它们是最有用的：

* Conditions should be added to explicitly convey properties that users and
  components care about rather than requiring those properties to be inferred
  from other observations.  Once defined, the meaning of a Condition can not be
  changed arbitrarily - it becomes part of the API, and has the same backwards-
  and forwards-compatibility concerns of any other part of the API.

* Controllers should apply their conditions to a resource the first time they
  visit the resource, even if the `status` is Unknown. This allows other
  components in the system to know that the condition exists and the controller
  is making progress on reconciling that resource.

   * Not all controllers will observe the previous advice about reporting
     "Unknown" or "False" values. For known conditions, the absence of a
     condition `status` should be interpreted the same as `Unknown`, and
     typically indicates that reconciliation has not yet finished (or that the
     resource state may not yet be observable).

* For some conditions, `True` represents normal operation, and for some
  conditions, `False` represents normal operation. ("Normal-true" conditions
  are sometimes said to have "positive polarity", and "normal-false" conditions
  are said to have "negative polarity".) Without further knowledge of the
  conditions, it is not possible to compute a generic summary of the conditions
  on a resource.

* Condition type names should make sense for humans; neither positive nor
  negative polarity can be recommended as a general rule. A negative condition
  like "MemoryExhausted" may be easier for humans to understand than
  "SufficientMemory". Conversely, "Ready" or "Succeeded" may be easier to
  understand than "Failed", because "Failed=Unknown" or "Failed=False" may
  cause double-negative confusion.

* Condition type names should describe the current observed state of the
  resource, rather than describing the current state transitions. This
  typically means that the name should be an adjective ("Ready", "OutOfDisk")
  or a past-tense verb ("Succeeded", "Failed") rather than a present-tense verb
  ("Deploying"). Intermediate states may be indicated by setting the `status` of
  the condition to `Unknown`.

  * For state transitions which take a long period of time (e.g. more than 1
    minute), it is reasonable to treat the transition itself as an observed
    state. In these cases, the Condition (such as "Resizing") itself should not
    be transient, and should instead be signalled using the
    `True`/`False`/`Unknown` pattern. This allows other observers to determine
    the last update from the controller, whether successful or failed. In cases
    where the state transition is unable to complete and continued
    reconciliation is not feasible, the Reason and Message should be used to
    indicate that the transition failed.

* When designing Conditions for a resource, it's helpful to have a common
  top-level condition which summarizes more detailed conditions. Simple
  consumers may simply query the top-level condition. Although they are not a
  consistent standard, the `Ready` and `Succeeded` condition types may be used
  by API designers for long-running and bounded-execution objects, respectively.

> * 应添加条件以明确传达用户和组件关心的属性，而不是要求从其他观察中推断出这些属性。一旦定义，条件的含义就不能任意更改——它成为 API 的一部分，并且与 API 的任何其他部分具有相同的向后和向前兼容性问题。
> * 控制器应在第一次访问资源时将其条件应用于资源，即使 `status` 未知。这使得系统中的其他组件知道该情况存在并且控制器正在协调该资源方面取得进展。
>    * 并非所有控制器都会遵守之前有关报告 "Unknown" 或 "False" 值的建议。对于已知条件，不存在条件 `status` 应被解释为与 `Unknown` 相同，并且通常表示协调尚未完成（或者资源状态可能尚未可观察）。
> * 对于某些情况，`True` 表示正常操作，对于某些情况，`False` 表示正常操作。（"Normal-true" 条件有时被称为具有“正极性”，而 "normal-false" 条件被称为具有“负极性”。）如果不进一步了解这些条件，就不可能计算资源上的条件的通用摘要。
> * 条件类型名称应该对人类有意义；一般而言，正极性或负极性均不推荐。像 "MemoryExhausted" 这样的负面条件可能比 "SufficientMemory" 更容易被人类理解。相反，"Ready"或"Succeeded"可能比"Failed"更容易理解，因为“Failed=Unknown”或“Failed=False”可能会导致双重否定混淆。
> * 条件类型名称应该描述资源当前观察到的状态，而不是描述当前状态转换。这通常意味着名称应该是形容词 ("Ready"、"OutOfDisk") 或过去时动词 ("Succeeded"、"Failed")，而不是现在时动词 ("Deploying")。可以通过将条件的 `status` 设置为 `Unknown` 来指示中间状态。
>   * 对于需要较长时间（例如超过 1 分钟）的状态转换，将转换本身视为观测状态是合理的。在这些情况下，条件（例如 "Resizing"）本身不应是瞬态的，而应使用 `True`/`False`/`Unknown` 模式来发出信号。这允许其他观察者确定来自控制器的最后更新，无论成功还是失败。如果状态转换无法完成并且继续协调不可行，则应使用原因和消息来指示转换失败。
> * 在设计资源的条件时，拥有一个总结了更详细条件的通用顶级条件会很有帮助。简单的消费者可以简单地查询顶级条件。尽管 `Ready` 和 `Succeeded` 条件类型不是一致的标准，但 API 设计者可以分别将它们用于长时间运行和有界执行对象。

Conditions should follow the standard schema included in [k8s.io/apimachinery/pkg/apis/meta/v1/types.go](https://github.com/kubernetes/apimachinery/blob/release-1.23/pkg/apis/meta/v1/types.go#L1432-L1492).
It should be included as a top level element in status, similar to

> 条件应遵循 [k8s.io/apimachinery/pkg/apis/meta/v1/types.go](https://github.com/kubernetes/apimachinery/blob/release-1.23/pkg/apis/meta/v1/types.go#L1432-L1492) 中包含的标准架构。它应该作为状态中的顶级元素包含在内，类似于

```go
// +listType=map
// +listMapKey=type
// +patchStrategy=merge
// +patchMergeKey=type
// +optional
Conditions []metav1.Condition `json:"conditions,omitempty" patchStrategy:"merge" patchMergeKey:"type" protobuf:"bytes,1,rep,name=conditions"`
```

The `metav1.Conditions` includes the following fields

> `metav1.Conditions` 包括以下字段

```go
// type of condition in CamelCase or in foo.example.com/CamelCase.
// +required
Type string `json:"type" protobuf:"bytes,1,opt,name=type"`
// status of the condition, one of True, False, Unknown.
// +required
Status ConditionStatus `json:"status" protobuf:"bytes,2,opt,name=status"`
// observedGeneration represents the .metadata.generation that the condition was set based upon.
// For instance, if .metadata.generation is currently 12, but the .status.conditions[x].observedGeneration is 9, the condition is out of date
// with respect to the current state of the instance.
// +optional
ObservedGeneration int64 `json:"observedGeneration,omitempty" protobuf:"varint,3,opt,name=observedGeneration"`
// lastTransitionTime is the last time the condition transitioned from one status to another.
// This should be when the underlying condition changed.  If that is not known, then using the time when the API field changed is acceptable.
// +required
LastTransitionTime Time `json:"lastTransitionTime" protobuf:"bytes,4,opt,name=lastTransitionTime"`
// reason contains a programmatic identifier indicating the reason for the condition's last transition.
// Producers of specific condition types may define expected values and meanings for this field,
// and whether the values are considered a guaranteed API.
// The value should be a CamelCase string.
// This field may not be empty.
// +required
Reason string `json:"reason" protobuf:"bytes,5,opt,name=reason"`
// message is a human readable message indicating details about the transition.
// This may be an empty string.
// +required
Message string `json:"message" protobuf:"bytes,6,opt,name=message"`
```

Additional fields may be added in the future.

> 将来可能会添加其他字段。

Use of the `Reason` field is required.

> 需要使用 `Reason` 字段。

Condition types should be named in PascalCase. Short condition names are
preferred (e.g. "Ready" over "MyResourceReady").

> 条件类型应以 PascalCase 命名。首选简短的条件名称（例如，"Ready" 优于 "MyResourceReady"）。

Condition `status` values may be `True`, `False`, or `Unknown`. The absence of a
condition should be interpreted the same as `Unknown`.  How controllers handle
`Unknown` depends on the Condition in question.

> 条件 `status` 值可能是 `True`、`False` 或 `Unknown`。不存在条件的解释应与 `Unknown` 相同。控制器如何处理 `Unknown` 取决于相关条件。

The thinking around conditions has evolved over time, so there are several
non-normative examples in wide use.

> 围绕条件的思考随着时间的推移而不断发展，因此有一些广泛使用的非规范示例。

In general, condition values may change back and forth, but some condition
transitions may be monotonic, depending on the resource and condition type.
However, conditions are observations and not, themselves, state machines, nor do
we define comprehensive state machines for objects, nor behaviors associated
with state transitions. The system is level-based rather than edge-triggered,
and should assume an Open World.

> 一般来说，条件值可能会来回变化，但某些条件转换可能是单调的，具体取决于资源和条件类型。然而，条件是观察结果，而不是状态机，我们也没有为对象定义全面的状态机，也没有定义与状态转换相关的行为。该系统是基于层级的，而不是边沿触发的，并且应该假设一个开放世界。

An example of an oscillating condition type is `Ready`, which indicates the
object was believed to be fully operational at the time it was last probed. A
possible monotonic condition could be `Succeeded`. A `True` status for
`Succeeded` would imply completion and that the resource was no longer
active. An object that was still active would generally have a `Succeeded`
condition with status `Unknown`.

> 振荡条件类型的一个示例是 `Ready`，它表示该对象在上次探测时被认为是完全可操作的。可能的单调条件是 `Succeeded`。`Succeeded` 的 `True` 状态意味着已完成并且资源不再活动。仍处于活动状态的对象通常会具有状态为 `Unknown` 的 `Succeeded` 条件。

Some resources in the v1 API contain fields called **`phase`**, and associated
`message`, `reason`, and other status fields. The pattern of using `phase` is
deprecated. Newer API types should use conditions instead. Phase was
essentially a state-machine enumeration field, that contradicted [system-design
principles](https://git.k8s.io/design-proposals-archive/architecture/principles.md#control-logic) and
hampered evolution, since [adding new enum values breaks backward
compatibility](api_changes.md). Rather than encouraging clients to infer
implicit properties from phases, we prefer to explicitly expose the individual
conditions that clients need to monitor. Conditions also have the benefit that
it is possible to create some conditions with uniform meaning across all
resource types, while still exposing others that are unique to specific
resource types.  See [#7856](http://issues.k8s.io/7856) for more details and
discussion.

> v1 API 中的某些资源包含名为 **`phase`** 的字段以及关联的 `message`、`reason` 和其他状态字段。不推荐使用 `phase` 的模式。较新的 API 类型应改用条件。Phase 本质上是一个状态机枚举字段，它与[系统设计原则](https://git.k8s.io/design-proposals-archive/architecture/principles.md#control-logic)相矛盾并阻碍了演化，因为[添加新的枚举值破坏了向后兼容性](api_changes.md)。我们不鼓励客户从阶段推断隐式属性，而是更愿意明确公开客户需要监控的个别条件。条件还有一个好处，即可以创建一些在所有资源类型中具有统一含义的条件，同时仍然公开特定资源类型特有的其他条件。有关更多详细信息和讨论，请参阅 [#7856](http://issues.k8s.io/7856)。

In condition types, and everywhere else they appear in the API, **`Reason`** is
intended to be a one-word, CamelCase representation of the category of cause of
the current status, and **`Message`** is intended to be a human-readable phrase
or sentence, which may contain specific details of the individual occurrence.
`Reason` is intended to be used in concise output, such as one-line
`kubectl get` output, and in summarizing occurrences of causes, whereas
`Message` is intended to be presented to users in detailed status explanations,
such as `kubectl describe` output.

> 在条件类型以及 API 中出现的其他任何地方，**`Reason`** 旨在作为当前状态原因类别的单字驼峰式表示形式，而 **`Message`** 旨在作为人类可读的短语或句子，其中可能包含单个事件的具体细节。`Reason` 旨在用于简洁的输出（例如单行 `kubectl get` 输出）和总结发生的原因，而 `Message` 旨在以详细的状态说明向用户呈现，例如 `kubectl describe` 输出。

Historical information status (e.g., last transition time, failure counts) is
only provided with reasonable effort, and is not guaranteed to not be lost.

> 历史信息状态（例如，上次转换时间、失败计数）仅在合理的努力下提供，并且不保证不会丢失。

Status information that may be large (especially proportional in size to
collections of other resources, such as lists of references to other objects --
see below) and/or rapidly changing, such as
[resource usage](https://git.k8s.io/design-proposals-archive/scheduling/resources.md#usage-data), should be put into separate
objects, with possibly a reference from the original object. This helps to
ensure that GETs and watch remain reasonably efficient for the majority of
clients, which may not need that data.

> 可能很大（尤其是与其他资源集合的大小成比例，例如对其他对象的引用列表——见下文）和/或快速变化的状态信息，例如[资源使用](https://git.k8s.io/design-proposals-archive/scheduling/resources.md#usage-data)，应该放入单独的对象中，并可能包含来自原始对象的引用。这有助于确保 GET 和监视对于大多数可能不需要该数据的客户端保持相当高效。

Some resources report the `observedGeneration`, which is the `generation` most
recently observed by the component responsible for acting upon changes to the
desired state of the resource. This can be used, for instance, to ensure that
the reported status reflects the most recent desired status.

> 某些资源报告 `observedGeneration`，这是负责根据资源所需状态的更改采取行动的组件最近观察到的 `generation`。例如，这可用于确保报告的状态反映最新的所需状态。

#### References to related objects｜对相关对象的引用

References to loosely coupled sets of objects, such as
[pods](https://kubernetes.io/docs/concepts/workloads/pods/) overseen by a
[replication controller](https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller/),
are usually best referred to using a
[label selector](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors). In order to
ensure that GETs of individual objects remain bounded in time and space, these
sets may be queried via separate API queries, but will not be expanded in the
referring object's status.

> 对松散耦合对象集的引用，例如由[复制控制器](https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller/) 监督的[pod](https://kubernetes.io/docs/concepts/workloads/pods/)，通常最好使用[标签选择器](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors) 来引用。为了确保各个对象的 GET 在时间和空间上保持有界，可以通过单独的 API 查询来查询这些集合，但不会在引用对象的状态中扩展。

For references to specific objects, see [Object references](#object-references).

> 有关特定对象的引用，请参阅[对象引用](#object-references)。

References in the `status` of the referee to the referrer may be permitted, when
the references are one-to-one and do not need to be frequently updated,
particularly in an edge-based manner.

> 当引用是一对一且不需要频繁更新时，特别是以基于边沿的方式更新时，可以允许引用者的 `status` 中对引用者的引用。

#### Lists of named subobjects preferred over maps｜优先使用具名子对象列表，而非映射

Discussed in [#2004](http://issue.k8s.io/2004) and elsewhere. There are
no maps of subobjects in any API objects. Instead, the convention is to
use a list of subobjects containing name fields. These conventions, and
how one can change the semantics of lists, structs and maps are
described in more details in the Kubernetes
[documentation](https://kubernetes.io/docs/reference/using-api/server-side-apply/#merge-strategy).

> 在 [#2004](http://issue.k8s.io/2004) 和其他地方进行了讨论。任何 API 对象中都没有子对象的映射。相反，约定是使用包含名称字段的子对象列表。Kubernetes [文档](https://kubernetes.io/docs/reference/using-api/server-side-apply/#merge-strategy) 中更详细地描述了这些约定以及如何更改列表、结构和映射的语义。

For example:

> 例如：

```yaml
ports:
  - name: www
    containerPort: 80
```

vs.

> 与

```yaml
ports:
  www:
    containerPort: 80
```

This rule maintains the invariant that all JSON/YAML keys are fields in API
objects. The only exceptions are pure maps in the API (currently, labels,
selectors, annotations, data), as opposed to sets of subobjects.

> 此规则保持了所有 JSON/YAML 键都是 API 对象中的字段的不变性。唯一的例外是 API 中的纯映射（当前为标签、选择器、注释、数据），而不是子对象集。

#### Primitive types｜原始类型

* Look at similar fields in the API (e.g. ports, durations) and follow the
  conventions of existing fields.
* Do not use enums. Use aliases for string instead (e.g. `NodeConditionType`).
* All numeric fields should be bounds-checked, both for too-small or negative
  and for too-large.
* All public integer fields MUST use the Go `int32` or Go `int64` types, not
  `int` (which is ambiguously sized, depending on target platform).  Internal
  types may use `int`.
* For integer fields, prefer `int32` to `int64` unless you need to represent
  values larger than `int32`.  See other guidelines about limitations of
  `int64` and language compatibility.
* Do not use unsigned integers, due to inconsistent support across languages and
  libraries. Just validate that the integer is non-negative if that's the case.
* All numbers (e.g. `int32`, `int64`) are converted to `float64` by Javascript
  and some other languages, so any field which is expected to exceed that
  either in magnitude or in precision (e.g. integer values > 53 bits)
  should be serialized and accepted as strings. `int64` fields must be
  bounds-checked to be within the range of `-(2^53) < x < (2^53)`.
* Avoid floating-point values as much as possible, and never use them in spec.
  Floating-point values cannot be reliably round-tripped (encoded and
  re-decoded) without changing, and have varying precision and representations
  across languages and architectures.
* Think twice about `bool` fields. Many ideas start as boolean but eventually
  trend towards a small set of mutually exclusive options.  Plan for future
  expansions by describing the policy options explicitly as a string type
  alias (e.g. `TerminationMessagePolicy`).

> * 查看 API 中的类似字段（例如端口、持续时间）并遵循现有字段的约定。
> * 不要使用枚举。使用字符串别名（例如 `NodeConditionType`）。
> * 所有数字字段都应该进行边界检查，无论是太小或负数还是太大。
> * 所有公共整数字段必须使用 Go `int32` 或 Go `int64` 类型，而不是 `int` （其大小不明确，具体取决于目标平台）。内部类型可以使用 `int`。
> * 对于整数字段，优先选择 `int32` 而不是 `int64`，除非您需要表示大于 `int32` 的值。请参阅有关 `int64` 限制和语言兼容性的其他指南。
> * 不要使用无符号整数，因为不同语言和库的支持不一致。如果是这种情况，只需验证该整数是否为非负数即可。
> * 所有数字（例如 `int32`、`int64`）都会通过 Javascript 和其他一些语言转换为 `float64`，因此任何预计在大小或精度上超过该范围的字段（例如整数值 > 53 位）都应被序列化并接受为字符串。`int64` 字段必须经过边界检查以位于 `-(2^53) < x < (2^53)` 的范围内。
> * 尽可能避免浮点值，并且永远不要在规范中使用它们。浮点值无法在不改变的情况下可靠地往返（编码和重新解码），并且在不同语言和体系结构中具有不同的精度和表示形式。
> * 对于 `bool` 字段请三思。许多想法都是从布尔值开始的，但最终趋向于一小组相互排斥的选项。通过将策略选项显式描述为字符串类型别名（例如 `TerminationMessagePolicy`）来规划未来的扩展。

#### Constants｜常量

Some fields will have a list of allowed values (enumerations). These values will
be strings, and they will be in CamelCase, with an initial uppercase letter.
Examples: `ClusterFirst`, `Pending`, `ClientIP`. When an acronym or initialism
each letter in the acronym should be uppercase, such as with `ClientIP` or
`TCPDelay`. When a proper name or the name of a command-line executable is used
as a constant the proper name should be represented in consistent casing -
examples: `systemd`, `iptables`, `IPVS`, `cgroupfs`, `Docker` (as a generic
concept), `docker` (as the command-line executable). If a proper name is used
which has mixed capitalization like `eBPF` that should be preserved in a longer
constant such as `eBPFDelegation`.

> 某些字段将具有允许值（枚举）的列表。这些值将是字符串，并且采用驼峰式命名法，首字母大写。示例：`ClusterFirst`、`Pending`、`ClientIP`。当使用首字母缩略词或首字母缩写词时，首字母缩略词中的每个字母都应为大写，例如 `ClientIP` 或 `TCPDelay`。当专有名称或命令行可执行文件的名称用作常量时，专有名称应以一致的大小写表示——例如：`systemd`、`iptables`、`IPVS`、`cgroupfs`、`Docker`（作为通用概念）、`docker`（作为命令行可执行文件）。如果使用混合大小写的专有名称（如 `eBPF`），则应将其保留在较长的常量中，如 `eBPFDelegation`。

All API within Kubernetes must leverage constants in this style, including
flags and configuration files. Where inconsistent constants were previously used,
new flags should be CamelCase only, and over time old flags should be updated to
accept a CamelCase value alongside the inconsistent constant. Example: the
Kubelet accepts a `--topology-manager-policy` flag that has values `none`,
`best-effort`, `restricted`, and `single-numa-node`. This flag should accept
`None`, `BestEffort`, `Restricted`, and `SingleNUMANode` going forward. If new
values are added to the flag, both forms should be supported.

> Kubernetes 中的所有 API 都必须利用这种风格的常量，包括标志和配置文件。如果以前使用了不一致的常量，则新标志应仅采用驼峰命名法，并且随着时间的推移，应更新旧标志以接受驼峰命名法值以及不一致的常量。示例：Kubelet 接受具有值 `none`、`best-effort`、`restricted` 和 `single-numa-node` 的 `--topology-manager-policy` 标志。此标志今后应接受 `None`、`BestEffort`、`Restricted` 和 `SingleNUMANode`。如果将新值添加到标志中，则应支持两种形式。

#### Unions｜联合类型

Sometimes, at most one of a set of fields can be set.  For example, the
[volumes] field of a PodSpec has 17 different volume type-specific fields, such
as `nfs` and `iscsi`.  All fields in the set should be
[Optional](#optional-vs-required).

> 有时，最多可以设置一组字段中的一个。例如，PodSpec 的 [volumes] 字段有 17 个不同的卷类型特定字段，例如 `nfs` 和 `iscsi`。该集中的所有字段都应为[可选](#optional-vs-required)。

Sometimes, when a new type is created, the api designer may anticipate that a
union will be needed in the future, even if only one field is allowed initially.
In this case, be sure to make the field [Optional](#optional-vs-required)
In the validation, you may still return an error if the sole field is unset. Do
not set a default value for that field.

> 有时，当创建一种新类型时，api 设计者可能会预计将来需要联合，即使最初只允许一个字段。在这种情况下，请务必将字段设置为[可选](#optional-vs-required)。在验证中，如果未设置唯一字段，您仍然可能会返回错误。不要为该字段设置默认值。

### Lists and Simple kinds｜List 与 Simple 类别

Every list or simple kind SHOULD have the following metadata in a nested object
field called "metadata":

> 每个列表或简单的类别应该在名为 "metadata" 的嵌套对象字段中具有以下元数据：

* resourceVersion: a string that identifies the common version of the objects
returned by in a list. This value MUST be treated as opaque by clients and
passed unmodified back to the server. A resource version is only valid within a
single namespace on a single kind of resource.

> * resourceVersion：一个字符串，标识列表中返回的对象的通用版本。该值必须被客户端视为不透明，并未经修改地传递回服务器。资源版本仅在单个类别资源的单个命名空间内有效。

Every simple kind returned by the server, and any simple kind sent to the server
that must support idempotency or optimistic concurrency should return this
value. Since simple resources are often used as input alternate actions that
modify objects, the resource version of the simple resource should correspond to
the resource version of the object.

> 服务器返回的每个简单类别以及发送到必须支持幂等性或乐观并发的服务器的任何简单类别都应返回此值。由于简单资源经常用作修改对象的输入替代操作，因此简单资源的资源版本应该与对象的资源版本相对应。

## Differing Representations｜不同的表示形式

An API may represent a single entity in different ways for different clients, or
transform an object after certain transitions in the system occur. In these
cases, one request object may have two representations available as different
resources, or different kinds.

> API 可以针对不同的客户端以不同的方式表示单个实体，或者在系统中发生某些转换后转换对象。在这些情况下，一个请求对象可能有两种可用作不同资源或不同类别的表示形式。

An example is a Service, which represents the intent of the user to group a set
of pods with common behavior on common ports. When Kubernetes detects a pod
matches the service selector, the IP address and port of the pod are added to an
Endpoints resource for that Service. The Endpoints resource exists only if the
Service exists, but exposes only the IPs and ports of the selected pods. The
full service is represented by two distinct resources - under the original
Service resource the user created, as well as in the Endpoints resource.

> 一个例子是服务，它代表用户将一组在公共端口上具有公共行为的 Pod 分组的意图。当 Kubernetes 检测到某个 pod 与服务选择器匹配时，该 pod 的 IP 地址和端口将被添加到该服务的 Endpoints 资源中。Endpoints 资源仅当 Service 存在时才存在，但仅公开所选 Pod 的 IP 和端口。完整的服务由两个不同的资源表示——在用户创建的原始服务资源下以及端点资源中。

As another example, a "pod status" resource may accept a PUT with the "pod"
kind, with different rules about what fields may be changed.

> 作为另一个示例，“pod 状态”资源可以接受具有 "pod" 类别的 PUT，其中关于哪些字段可以更改的规则不同。

Future versions of Kubernetes may allow alternative encodings of objects beyond
JSON.

> Kubernetes 的未来版本可能允许使用 JSON 之外的替代对象编码。

## Verbs on Resources｜作用于资源的动词

API resources should use the traditional REST pattern:

> API资源应使用传统的REST模式：

* GET /&lt;resourceNamePlural&gt; - Retrieve a list of type
&lt;resourceName&gt;, e.g. GET /pods returns a list of Pods.
* POST /&lt;resourceNamePlural&gt; - Create a new resource from the JSON object
provided by the client.
* GET /&lt;resourceNamePlural&gt;/&lt;name&gt; - Retrieves a single resource
with the given name, e.g. GET /pods/first returns a Pod named 'first'. Should be
constant time, and the resource should be bounded in size.
* DELETE /&lt;resourceNamePlural&gt;/&lt;name&gt;  - Delete the single resource
with the given name. DeleteOptions may specify gracePeriodSeconds, the optional
duration in seconds before the object should be deleted. Individual kinds may
declare fields which provide a default grace period, and different kinds may
have differing kind-wide default grace periods. A user provided grace period
overrides a default grace period, including the zero grace period ("now").
* DELETE /&lt;resourceNamePlural&gt; - Deletes a list of type
&lt;resourceName&gt;, e.g. DELETE /pods a list of Pods.
* PUT /&lt;resourceNamePlural&gt;/&lt;name&gt; - Update or create the resource
with the given name with the JSON object provided by the client. Whether a
resource can be created with a PUT request depends on the particular resource's
storage strategy configuration, specifically the `AllowCreateOnUpdate()` return
value. Most built-in types do not allow this.
* PATCH /&lt;resourceNamePlural&gt;/&lt;name&gt; - Selectively modify the
specified fields of the resource. See more information [below](#patch-operations).
* GET /&lt;resourceNamePlural&gt;&quest;watch=true - Receive a stream of JSON
objects corresponding to changes made to any resource of the given kind over
time.

> * GET /<resourceNamePlural>——检索 <resourceName> 类型的列表，例如GET /pods 返回 Pod 列表。
> * POST /<resourceNamePlural>——从客户端提供的 JSON 对象创建新资源。
> * GET /<resourceNamePlural>/<name>——检索具有给定名称的单个资源，例如GET /pods/first 返回一个名为“first”的 Pod。时间应该是恒定的，并且资源的大小应该受到限制。
> * DELETE /<resourceNamePlural>/<name>——删除具有给定名称的单个资源。DeleteOptions 可以指定 GracePeriodSeconds，即应删除对象之前的可选持续时间（以秒为单位）。各个类别可以声明提供默认宽限期的字段，并且不同的类别可以具有不同的类别范围的默认宽限期。用户提供的宽限期会覆盖默认宽限期，包括零宽限期 ("now")。
> * DELETE /<resourceNamePlural>——删除 <resourceName> 类型的列表，例如DELETE /pods Pod 列表。
> * PUT /<resourceNamePlural>/<name>——使用客户端提供的 JSON 对象更新或创建具有给定名称的资源。是否可以使用 PUT 请求创建资源取决于特定资源的存储策略配置，特别是 `AllowCreateOnUpdate()` 返回值。大多数内置类型不允许这样做。
> * PATCH /<resourceNamePlural>/<name>——有选择地修改资源的指定字段。请参阅[下文](#patch-operations) 的更多信息。
> * GET /<resourceNamePlural>&quest;watch=true——接收与随时间推移对给定类别的任何资源所做的更改相对应的 JSON 对象流。

### PATCH operations｜PATCH 操作

The API supports three different PATCH operations, determined by their
corresponding Content-Type header:

> API 支持三种不同的 PATCH 操作，由相应的 Content-Type 标头决定：

* JSON Patch, `Content-Type: application/json-patch+json`
  * As defined in [RFC6902](https://tools.ietf.org/html/rfc6902), a JSON Patch is
a sequence of operations that are executed on the resource, e.g. `{"op": "add",
"path": "/a/b/c", "value": [ "foo", "bar" ]}`. For more details on how to use
JSON Patch, see the RFC.
* Merge Patch, `Content-Type: application/merge-patch+json`
  * As defined in [RFC7386](https://tools.ietf.org/html/rfc7386), a Merge Patch
is essentially a partial representation of the resource. The submitted JSON is
"merged" with the current resource to create a new one, then the new one is
saved. For more details on how to use Merge Patch, see the RFC.
* Strategic Merge Patch, `Content-Type: application/strategic-merge-patch+json`
  * Strategic Merge Patch is a custom implementation of Merge Patch. For a
detailed explanation of how it works and why it needed to be introduced, see
[here](/contributors/devel/sig-api-machinery/strategic-merge-patch.md).

> * JSON 补丁，`Content-Type: application/json-patch+json`
>   * 根据 [RFC6902](https://tools.ietf.org/html/rfc6902) 中的定义，JSON 补丁是在资源上执行的一系列操作，例如`{"op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ]}`。有关如何使用 JSON Patch 的更多详细信息，请参阅 RFC。
> * 合并补丁，`Content-Type: application/merge-patch+json`
>   * 正如 [RFC7386](https://tools.ietf.org/html/rfc7386) 中所定义的，合并补丁本质上是资源的部分表示。提交的JSON为"merged"，与当前资源创建一个新的，然后保存新的。有关如何使用 Merge Patch 的更多详细信息，请参阅 RFC。
> * 战略合并补丁，`Content-Type: application/strategic-merge-patch+json`
>   * 战略合并补丁是合并补丁的自定义实现。有关其工作原理以及为何需要引入它的详细说明，请参阅[此处](/contributors/devel/sig-api-machinery/strategic-merge-patch.md)。

## Short-names and Categories｜短名称与类别分组

Resource implementers can optionally include "short names" and categories
in the discovery information published for a resource type,
which clients may use as hints when resolving ambiguous user invocations.

> 资源实现者可以选择在为资源类型发布的发现信息中包含“短名称”和类别，客户端可以在解决不明确的用户调用时将其用作提示。

For compiled-in resources, these are controlled by the REST handler `ShortNames() []string` and `Categories() []string` implementations.

> 对于编译入资源，这些资源由 REST 处理程序 `ShortNames() []string` 和 `Categories() []string` 实现控制。

For custom resources, these are controlled by the `.spec.names.shortNames` and `.spec.names.categories` fields in the CustomResourceDefinition.

> 对于自定义资源，这些资源由 CustomResourceDefinition 中的 `.spec.names.shortNames` 和 `.spec.names.categories` 字段控制。

### Short-names｜短名称

Note: Due to unpredictable behavior when short names collide (with each other or with resource types),
do not add new short names to built-in resources unless specifically allowed by API reviewers. See issues
[#117742](https://issue.k8s.io/117742#issuecomment-1545945336) and [#108573](http://issue.k8s.io/108573).

> 注意：由于短名称冲突（相互冲突或与资源类型冲突）时会发生不可预测的行为，因此除非 API 审阅者特别允许，否则请勿向内置资源添加新的短名称。请参阅问题 [#117742](https://issue.k8s.io/117742#issuecomment-1545945336) 和 [#108573](http://issue.k8s.io/108573)。

"Short names" listed in discovery may be used by clients as hints to resolve ambiguous user invocations to a single resource.

> 客户端可以使用发现中列出的“短名称”作为提示来解决对单个资源的不明确的用户调用。

Examples of built-in short names include:

> 内置短名称的示例包括：

* `ds` -> `apps/v* daemonsets`
* `sts` -> `apps/v* statefulsets`
* `hpa` -> `autoscaling/v* horizontalpodautoscalers`

> * `ds` -> `apps/v* daemonsets`
> * `sts` -> `apps/v* statefulsets`
> * `hpa` -> `autoscaling/v* horizontalpodautoscalers`

For example, with only built-in API types served, `kubectl get sts` is equivalent to `kubectl get statefulsets.v1.apps`.

> 例如，仅提供内置 API 类型时，`kubectl get sts` 相当于 `kubectl get statefulsets.v1.apps`。

Short-name matches may be given lower priority than an exact match of a resource type,
so use of short names increases potential for inconsistent behavior in clusters
with custom resources installed, if those custom resource types overlap with short names.

> 短名称匹配的优先级可能低于资源类型的精确匹配，因此，如果这些自定义资源类型与短名称重叠，则使用短名称会增加安装了自定义资源的集群中出现不一致行为的可能性。

Continuing the above example, if a custom resource with `.spec.names.plural` set to `sts` was installed in a cluster,
`kubectl get sts` would switch to retrieving instances of the custom resource instead.

> 继续上面的示例，如果在集群中安装了 `.spec.names.plural` 设置为 `sts` 的自定义资源，则 `kubectl get sts` 将切换为检索自定义资源的实例。

### Categories｜类别分组

Note: Due to inconsistent behavior when categories collide with resource types,
and difficulties knowing when it is safe to add new resources to an existing category,
do not add new categories to built-in resources unless specifically allowed by API reviewers.
See issues [#7547](https://github.com/kubernetes/kubernetes/issues/7547#issuecomment-355835279)
[#42885](https://github.com/kubernetes/kubernetes/issues/42885#issuecomment-531265679),
and [considerations for adding to the "all" category](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-cli/kubectl-conventions.md#rules-for-extending-special-resource-alias---all)
for examples of the difficulties encountered.

> 注意：由于类别与资源类型冲突时行为不一致，并且很难知道何时可以安全地将新资源添加到现有类别，因此除非 API 审核者特别允许，否则请勿向内置资源添加新类别。有关遇到的困难的示例，请参阅问题 [#7547](https://github.com/kubernetes/kubernetes/issues/7547#issuecomment-355835279) [#42885](https://github.com/kubernetes/kubernetes/issues/42885#issuecomment-531265679) 和 [添加到 "all" 类别的注意事项](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-cli/kubectl-conventions.md#rules-for-extending-special-resource-alias---all)。

Categories listed in discovery may be used by clients as hints to resolve user invocations to multiple resources.

> 客户端可以使用发现中列出的类别作为解决用户对多个资源的调用的提示。

Examples of built-in categories and the resources they map to include:

> 内置类别及其映射的资源示例包括：

* `api-extensions`
  * `apiregistration.k8s.io/v* apiservices`
  * `admissionregistration.k8s.io/v* mutatingwebhookconfigurations`
  * `admissionregistration.k8s.io/v* validatingwebhookconfigurations`
  * `admissionregistration.k8s.io/v* validatingadmissionpolicies`
  * `admissionregistration.k8s.io/v* validatingadmissionpolicybindings`
  * `apiextensions.k8s.io/v* customresourcedefinitions`
* `all`
  * `v1 pods`
  * `v1 replicationcontrollers`
  * `v1 services`
  * `apps/v* daemonsets`
  * `apps/v* deployments`
  * `apps/v* replicasets`
  * `apps/v* statefulsets`
  * `autoscaling/v* horizontalpodautoscalers`
  * `batch/v* cronjobs`
  * `batch/v* jobs`

> * `api-extensions`
>   * `apiregistration.k8s.io/v* apiservices`
>   * `admissionregistration.k8s.io/v* mutatingwebhookconfigurations`
>   * `admissionregistration.k8s.io/v* validatingwebhookconfigurations`
>   * `admissionregistration.k8s.io/v* validatingadmissionpolicies`
>   * `admissionregistration.k8s.io/v* validatingadmissionpolicybindings`
>   * `apiextensions.k8s.io/v* customresourcedefinitions`
> * `all`
>   * `v1 pods`
>   * `v1 replicationcontrollers`
>   * `v1 services`
>   * `apps/v* daemonsets`
>   * `apps/v* deployments`
>   * `apps/v* replicasets`
>   * `apps/v* statefulsets`
>   * `autoscaling/v* horizontalpodautoscalers`
>   * `batch/v* cronjobs`
>   * `batch/v* jobs`

With the above categories, and only built-in API types served, `kubectl get all` would be equivalent to 
`kubectl get pods.v1.,replicationcontrollers.v1.,services.v1.,daemonsets.v1.apps,deployments.v1.apps,replicasets.v1.apps,statefulsets.v1.apps,horizontalpodautoscalers.v2.autoscaling,cronjobs.v1.batch,jobs.v1.batch,`.

> 对于上述类别，并且仅提供内置 API 类型，`kubectl get all` 将等同于 `kubectl get pods.v1.,replicationcontrollers.v1.,services.v1.,daemonsets.v1.apps,deployments.v1.apps,replicasets.v1.apps,statefulsets.v1.apps,horizontalpodautoscalers.v2.autoscaling,cronjobs.v1.batch,jobs.v1.batch,`。

## Idempotency｜幂等性

All compatible Kubernetes APIs MUST support "name idempotency" and respond with
an HTTP status code 409 when a request is made to POST an object that has the
same name as an existing object in the system. See
[the identifiers docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)
for details.

> 所有兼容的 Kubernetes API 必须支持“名称幂等性”，并在请求 POST 与系统中现有对象同名的对象时以 HTTP 状态代码 409 进行响应。有关详细信息，请参阅[标识符文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)。

Names generated by the system may be requested using `metadata.generateName`.
GenerateName indicates that the name should be made unique by the server prior
to persisting it. A non-empty value for the field indicates the server should
attempt to make the name unique (and the name returned to the client will be
different than the name passed). The value of this field will be combined with a
random suffix on the server if the Name field has not been provided. The
provided value must be valid within the rules for Name, and may be truncated by
the length of the suffix. If this field is specified, and Name is not present,
the server will return a 409 with Reason `AlreadyExists` if the generated name
exists, and the client should retry (after waiting at least the amount of time
indicated in the Retry-After header, if it is present).

> 可以使用 `metadata.generateName` 请求系统生成的名称。GenerateName 指示服务器在保留该名称之前应使其唯一。该字段的非空值指示服务器应尝试使名称唯一（并且返回给客户端的名称将与传递的名称不同）。如果未提供名称字段，则该字段的值将与服务器上的随机后缀组合。提供的值必须在名称规则内有效，并且可能会被后缀的长度截断。如果指定了此字段，并且 Name 不存在，则如果生成的名称存在，服务器将返回 409，原因为 `AlreadyExists`，并且客户端应重试（在等待至少 Retry-After 标头中指示的时间（如果存在）之后）。

## Optional vs. Required｜可选与必需

Fields must be either optional or required.

> 字段必须是可选的或必填的。

Optional fields have the following properties:

> 可选字段具有以下属性：

- They have the `+optional` comment tag in Go.
- They are a pointer type in the Go definition (e.g. `AwesomeFlag *SomeFlag`) or
have a built-in `nil` value (e.g. maps and slices).
- The API server should allow POSTing and PUTing a resource with this field
unset.

> - 他们在 Go 中有 `+optional` 注释标签。
> - 它们是 Go 定义中的指针类型（例如 `AwesomeFlag *SomeFlag`）或具有内置的 `nil` 值（例如映射和切片）。
> - API 服务器应允许在未设置此字段的情况下 POST 和 PUT 资源。

In most cases, optional fields should also have the `omitempty` struct tag (the
`omitempty` option specifies that the field should be omitted from the json
encoding if the field has an empty value). However, If you want to have
different logic for an optional field which is not provided vs. provided with
empty values, do not use `omitempty` (e.g. https://github.com/kubernetes/kubernetes/issues/34641).

> 在大多数情况下，可选字段还应具有 `omitempty` 结构标记（`omitempty` 选项指定如果字段具有空值，则应从 json 编码中省略该字段）。但是，如果您希望未提供的可选字段与提供空值的可选字段具有不同的逻辑，请不要使用 `omitempty`（例如 https://github.com/kubernetes/kubernetes/issues/34641）。

Note that for backward compatibility, any field that has the `omitempty` struct
tag will be considered to be optional, but this may change in the future and
having the `+optional` comment tag is highly recommended.

> 请注意，为了向后兼容，任何具有 `omitempty` 结构标记的字段都将被视为可选，但这将来可能会发生变化，强烈建议使用 `+optional` 注释标记。

Required fields have the opposite properties, namely:

> 必填字段具有相反的属性，即：

- They do not have an `+optional` comment tag.
- They do not have an `omitempty` struct tag.
- They are not a pointer type in the Go definition (e.g. `AnotherFlag SomeFlag`).
- The API server should not allow POSTing or PUTing a resource with this field
unset.

> - 它们没有 `+optional` 注释标签。
> - 它们没有 `omitempty` 结构标记。
> - 它们不是 Go 定义中的指针类型（例如 `AnotherFlag SomeFlag`）。
> - API 服务器不应允许在未设置此字段的情况下 POST 或 PUT 资源。

Using the `+optional` or the `omitempty` tag causes OpenAPI documentation to
reflect that the field is optional.

> 使用 `+optional` 或 `omitempty` 标签会导致 OpenAPI 文档反映该字段是可选的。

Using a pointer allows distinguishing unset from the zero value for that type.
There are some cases where, in principle, a pointer is not needed for an
optional field since the zero value is forbidden, and thus implies unset. There
are examples of this in the codebase. However:

> 使用指针可以区分该类型的未设置和零值。在某些情况下，原则上可选字段不需要指针，因为零值是被禁止的，因此意味着未设置。代码库中有这样的示例。然而：

- it can be difficult for implementors to anticipate all cases where an empty
value might need to be distinguished from a zero value
- structs are not omitted from encoder output even where omitempty is specified,
which is messy;
- having a pointer consistently imply optional is clearer for users of the Go
language client, and any other clients that use corresponding types

> - 实现者可能很难预测可能需要将空值与零值区分开的所有情况
> - 即使指定了 omitempty，结构也不会从编码器输出中省略，这很混乱；
> - 对于 Go 语言客户端以及使用相应类型的任何其他客户端的用户来说，让指针始终意味着可选是更清楚的

Therefore, we ask that pointers always be used with optional fields that do not
have a built-in `nil` value.

> 因此，我们要求指针始终与没有内置 `nil` 值的可选字段一起使用。

## Defaulting｜默认值处理

In general we want default values to be explicitly represented in our APIs,
rather than asserting that "unspecified fields get the default behavior".  This
is important so that:

> 一般来说，我们希望在 API 中明确表示默认值，而不是断言“未指定的字段获得默认行为”。这很重要，以便：

 - default values can evolve and change in newer API versions
 - the stored configuration depicts the full desired state, making it easier
   for the system to determine how to achieve the state, and for the user to
   know what to anticipate

>  - 默认值可以在较新的 API 版本中演变和更改
>  - 存储的配置描述了完整的期望状态，使系统更容易确定如何实现该状态，并让用户知道会发生什么

There are 3 distinct ways that default values can be applied when creating or
updating (including patch and apply) a resource:

> 创建或更新（包括修补和应用）资源时，可以通过 3 种不同的方式应用默认值：

 1. static: based on the requested API version and possibly other fields in the
    resource, fields can be assigned values during the API call
 2. admission control: based on the configured admission controllers and
    possibly other state in or out of the cluster, fields can be assigned
    values during the API call
 3. controllers: arbitrary changes (within the bounds of what is allowed) can
    be made to a resource after the API call has completed

>  1. 静态：根据请求的 API 版本以及资源中可能的其他字段，可以在 API 调用期间为字段分配值
>  2. 准入控制：根据配置的准入控制器以及集群内外可能的其他状态，可以在 API 调用期间为字段分配值
>  3. 控制器：API 调用完成后可以对资源进行任意更改（在允许的范围内）

Some care is required when deciding which mechanism to use and managing the
semantics.

> 在决定使用哪种机制和管理语义时需要小心。

### Static Defaults｜静态默认值

Static default values are specific to each API version.  The default field
values applied when creating an object with the "v1" API may be different than
the values applied when using the "v2" API.  In most cases, these values are
defined as literal values by the API version (e.g. "if this field is not
specified it defaults to 0").

> 静态默认值特定于每个 API 版本。使用 "v1" API 创建对象时应用的默认字段值可能与使用 "v2" API 时应用的值不同。在大多数情况下，这些值由 API 版本定义为文字值（例如“如果未指定此字段，则默认为 0”）。

In some cases, these values may be conditional on or deterministically derived
from other fields (e.g. "if otherField is X then this field defaults to 0" or
"this field defaults to the value of otherField").  Note that such derived
defaults present a hazard in the face of updates - if the "other" field
changes, the derived field may have to change, too.  The static defaulting
logic is unaware of updates and has no concept of "previous value", which means
this inter-field relationship becomes the user's problem - they must update
both the field they care about and the "other" field.

> 在某些情况下，这些值可能以其他字段为条件或确定性地从其他字段导出（例如，“如果 otherField 是 X，则此字段默认为 0”或“此字段默认为 otherField 的值”）。请注意，此类派生默认值在更新时存在危险——如果 "other" 字段发生更改，则派生字段也可能必须更改。静态默认逻辑不知道更新，并且没有“先前值”的概念，这意味着这种字段间关系成为用户的问题——他们必须更新他们关心的字段和 "other" 字段。

In very rare cases, these values may be allocated from some pool or determined
by some other method (e.g. Service's IP and IP-family related fields need to
consider other configuration settings).

> 在极少数情况下，这些值可能从某个池中分配或通过某种其他方法确定（例如，服务的 IP 和 IP 系列相关字段需要考虑其他配置设置）。

These values are applied synchronously by the API server when decoding
versioned data.  For CREATE and UPDATE operations this is fairly
straight-forward - when the API server receives a (versioned) request, the
default values are immediately applied before any further processing.  When the
API call completes, all static defaults will have been set and stored.
Subsequent GETs of the resource will include the default values explicitly.
However, static defaults also apply when an object is read from storage (i.e.
GET operations).  This means that when someone GETs an "older" stored object,
any fields which have been added to the API since that object was stored will
be defaulted and returned according to the API version that is stored.

> 当解码版本化数据时，这些值由 API 服务器同步应用。对于 CREATE 和 UPDATE 操作，这是相当简单的——当 API 服务器收到（版本控制）请求时，在任何进一步处理之前立即应用默认值。当 API 调用完成时，所有静态默认值都将被设置并存储。资源的后续 GET 将显式包含默认值。但是，当从存储中读取对象（即 GET 操作）时，静态默认值也适用。这意味着，当某人获取 "older" 存储的对象时，自存储该对象以来已添加到 API 的任何字段都将被默认并根据存储的 API 版本返回。

Static defaults are the best choice for values which are logically required,
but which have a value that works well for most users.  Static defaulting
must not consider any state except the object being operated upon (and the
complexity of Service API stands as an example of why).

> 静态默认值是逻辑上必需的值的最佳选择，但其值适合大多数用户。静态默认不能考虑除所操作的对象之外的任何状态（服务 API 的复杂性就是一个例子）。

Default values can be specified on a field using the `+default=` tag. Primitives
will have their values directly assigned while structs will go through the
JSON unmarshalling process. Fields that do not have an `omitempty` json tag will
default to the zero value of their corresponding type if no default is assigned.

> 可以使用 `+default=` 标签在字段上指定默认值。基元将直接分配其值，而结构将经历 JSON 解组过程。如果未分配默认值，则没有 `omitempty` json 标记的字段将默认为其相应类型的零值。

Refer to [defaulting docs](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#defaulting)
for more information.

> 有关更多信息，请参阅[默认文档](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#defaulting)。

### Admission Controlled Defaults｜准入控制默认值

In some cases, it is useful to set a default value which is not derived from
the object in question.  For example, when creating a PersistentVolumeClaim,
the storage class must be specified.  For many users, the best answer is
"whatever the cluster admin has decided for the default".  StorageClass is a
different API than PersistentVolumeClaim, and which one is denoted as the
default may change at any time.  Thus this is not eligible for static
defaulting.

> 在某些情况下，设置不是从相关对象派生的默认值很有用。例如，在创建 PersistentVolumeClaim 时，必须指定存储类。对于许多用户来说，最好的答案是“无论集群管理员决定默认什么”。StorageClass 是与 PersistentVolumeClaim 不同的 API，并且哪个表示为默认值可能随时更改。因此，这不符合静态违约的条件。

Instead, we can provide a built-in admission controller or a
MutatingWebhookConfiguration.  Unlike static defaults, these may consider
external state (such as annotations on StorageClass objects) when deciding
default values, and must handle things like race conditions (e.g. a
StorageClass is designated the default, but the admission controller has not
yet seen that update).  These admission controllers are strictly optional and
can be disabled.  As such, fields which are initialized this way must be
strictly optional.

> 相反，我们可以提供内置的准入控制器或 MutatingWebhookConfiguration。与静态默认值不同，这些在决定默认值时可能会考虑外部状态（例如 StorageClass 对象上的注释），并且必须处理诸如竞争条件之类的事情（例如，StorageClass 被指定为默认值，但准入控制器尚未看到该更新）。这些准入控制器是严格可选的并且可以禁用。因此，以这种方式初始化的字段必须是严格可选的。

Like static defaults, these are run synchronously to the API operation in
question, and when the API call completes, all static defaults will have been
set.  Subsequent GETs of the resource will include the default values
explicitly.

> 与静态默认值一样，它们与相关 API 操作同步运行，并且当 API 调用完成时，所有静态默认值都将被设置。资源的后续 GET 将显式包含默认值。

### Controller-Assigned Defaults (aka Late Initialization)｜控制器赋予的默认值（又称延迟初始化）

Late initialization is when resource fields are set by a system controller
after an object is created/updated (asynchronously).  For example, the
scheduler sets the `pod.spec.nodeName` field after the pod is created.  It's
a stretch to call this "defaulting" but since it is so common and useful, it is
included here.

> 后期初始化是指在创建/更新（异步）对象后由系统控制器设置资源字段。例如，调度器在 Pod 创建后设置 `pod.spec.nodeName` 字段。称其为 "defaulting" 有点夸张，但由于它非常常见且有用，因此将其包含在此处。

Like admission controlled defaults, these controllers may consider external
state when deciding what values to set, must handle race conditions, and can be
disabled.  Fields which are initialized this way must be strictly optional
(meaning observers will see the object without these fields set, and that is
allowable and semantically correct).

> 与准入控制默认值一样，这些控制器在决定设置哪些值时可能会考虑外部状态，必须处理竞争条件，并且可以被禁用。以这种方式初始化的字段必须是严格可选的（这意味着观察者将看到没有设置这些字段的对象，这是允许的并且在语义上是正确的）。

Like all controllers, care must be taken to not clobber unrelated fields or
values (e.g. in an array).  Using one of the patch or apply mechanisms is
recommended to facilitate composition and concurrency of controllers.

> 与所有控制器一样，必须注意不要破坏不相关的字段或值（例如在数组中）。建议使用补丁或应用机制之一来促进控制器的组合和并发。

### What May Be Defaulted｜哪些内容可以设置默认值

All forms of defaulting should only make the following types of modifications:

> 所有形式的违约只能进行以下类型的修改：

 - Setting previously unset fields
 - Adding keys to maps
 - Adding values to arrays which have mergeable semantics
   (`+listType=map` tag or `patchStrategy:"merge"` attribute in the type definition)

>  - 设置之前未设置的字段
>  - 向地图添加键
>  - 将值添加到具有可合并语义的数组（类型定义中的 `+listType=map` 标记或 `patchStrategy:"merge"` 属性）

In particular we never want to change or override a value that was provided by
the user.  If they requested something invalid, they should get an error.

> 特别是，我们永远不想更改或覆盖用户提供的值。如果他们请求的内容无效，他们应该会收到错误。

These rules ensure that:

> 这些规则确保：

 1. a user (with sufficient privilege) can override any system-default
    behaviors by explicitly setting the fields that would otherwise have been
    defaulted
 1. updates from users can be merged with default values

>  1. 用户（具有足够的权限）可以通过显式设置默认的字段来覆盖任何系统默认行为
>  1. 用户的更新可以与默认值合并

### Considerations For PUT Operations｜PUT 操作的注意事项

Once an object has been created and defaults have been applied, it's very
common for updates to happen over time.  Kubernetes offers several ways of
updating an object which preserve existing values in fields other than those
being updated (e.g. strategic merge patch and server-side apply).  There is,
however, a less obvious way of updating objects which can have bad interactions
with default values - PUT (aka `kubectl replace`).

> 创建对象并应用默认值后，随着时间的推移发生更新是很常见的。Kubernetes 提供了多种更新对象的方法，这些方法保留除更新字段之外的字段中的现有值（例如，战略合并补丁和服务器端应用）。然而，有一种不太明显的更新对象的方法，它可能与默认值产生不良交互——PUT（又名 `kubectl replace`）。

The goal is that, for a given input (e.g. YAML file), PUT on an existing object
should produce the same result as if you used that input to create the object.
Calling PUT a second time with the same input should be idempotent and should
not change the resource.  Even a read-modify-write cycle is not a perfect
solution in the face of version skew.

> 目标是，对于给定的输入（例如 YAML 文件），对现有对象进行 PUT 应该产生与使用该输入创建对象相同的结果。使用相同的输入第二次调用 PUT 应该是幂等的，并且不应更改资源。面对版本偏差，即使是读-修改-写周期也不是完美的解决方案。

When an object is updated with a PUT, the API server will see the "old" object
with previously assigned defaults and the "new" object with newly assigned
defaults.  For static defaults this can be a problem if the CREATE and the PUT
used different API versions.  For example, "v1" of an API might default a field
to `false`, while "v2" defaults it to `true`.  If an object was created via API
v1 (field = `false`) and then replaced via API v2, the field will attempt to
change to `true`.  This can also be a problem when the values are allocated or
derived from a source outside of the object in question (e.g. Service IPs).

> 当使用 PUT 更新对象时，API 服务器将看到具有先前分配的默认值的 "old" 对象和具有新分配的默认值的 "new" 对象。对于静态默认值，如果 CREATE 和 PUT 使用不同的 API 版本，这可能会出现问题。例如，API 的 "v1" 可能会将字段默认为 `false`，而 "v2" 将其默认为 `true`。如果对象是通过 API v1 创建的（字段 = `false`），然后通过 API v2 替换，则该字段将尝试更改为 `true`。当值是从相关对象外部的源（例如服务 IP）分配或派生时，这也可能是一个问题。

For some APIs this is acceptable and actionable.  For others, this may be
disallowed by validation.  In the latter case, the user will get an error about
an attempt to change a field which is not even present in their YAML.  This is
especially dangerous when adding new fields - an older client may not even know
about the existence of the field, making even a read-modify-write cycle fail.
While it is "correct" (in the sense that it is really what they asked for with
PUT), it is not helpful and is a bad UX.

> 对于某些 API，这是可以接受且可行的。对于其他人来说，验证可能会不允许这样做。在后一种情况下，用户将收到有关尝试更改 YAML 中甚至不存在的字段的错误。在添加新字段时，这尤其危险——旧客户端甚至可能不知道该字段的存在，甚至导致读取-修改-写入周期失败。虽然它是 "correct"（从某种意义上说，这确实是他们对 PUT 所要求的），但它没有帮助，而且是一个糟糕的用户体验。

When adding a field with a static or admission controlled default, this must be
considered.  If the field is immutable after creation, consider adding logic to
manually "patch" the value from the "old" object into the "new" one when it has
been "unset", rather than returning an error or allocating a different value
(e.g.  Service IPs).  This will very often be what the user meant, even if it
is not what they said.  This may require setting the default in a different way
(e.g.  in the registry code which understands updates instead of in the
versioned defaulting code which does not).  Be careful to detect and report
legitimate errors where the "new" value is specified but is different from the
"old" value.

> 添加具有静态或准入控制默认值的字段时，必须考虑这一点。如果该字段在创建后不可变，请考虑添加逻辑，以便在 "old" 对象的值已为 "unset" 时手动将 "patch" 值添加到 "new" 中，而不是返回错误或分配不同的值（例如服务 IP）。这通常是用户的意思，即使这不是他们所说的。这可能需要以不同的方式设置默认值（例如，在理解更新的注册表代码中，而不是在不理解更新的版本化默认代码中）。请小心检测并报告指定了 "new" 值但与 "old" 值不同的合法错误。

For controller-defaulted fields, the situation is even more unpleasant.
Controllers do not have an opportunity to "patch" the value before the API
operation is committed.  If the "unset" value is allowed then it will be saved,
and any watch clients will be notified.  If the "unset" value is not allowed or
mutations are otherwise disallowed, the user will get an error, and there's
simply nothing we can do about it.

> 对于控制器默认字段，情况更加令人不快。在提交 API 操作之前，控制器没有机会 "patch" 该值。如果允许 "unset" 值，则会保存该值，并通知所有手表客户端。如果不允许 "unset" 值或不允许突变，用户将收到错误，而我们对此无能为力。

## Concurrency Control and Consistency｜并发控制与一致性

Kubernetes leverages the concept of *resource versions* to achieve optimistic
concurrency. All Kubernetes resources have a "resourceVersion" field as part of
their metadata. This resourceVersion is a string that identifies the internal
version of an object that can be used by clients to determine when objects have
changed. When a record is about to be updated, its version is checked against a
pre-saved value, and if it doesn't match, the update fails with a StatusConflict
(HTTP status code 409).

> Kubernetes 利用“资源版本”的概念来实现乐观并发。所有 Kubernetes 资源都有一个 "resourceVersion" 字段作为其元数据的一部分。此resourceVersion 是一个字符串，用于标识对象的内部版本，客户端可以使用该字符串来确定对象何时发生更改。当记录即将更新时，系统会根据预先保存的值检查其版本，如果不匹配，更新将失败并显示 StatusConflict（HTTP 状态代码 409）。

The resourceVersion is changed by the server every time an object is modified.
If resourceVersion is included with the PUT operation the system will verify
that there have not been other successful mutations to the resource during a
read/modify/write cycle, by verifying that the current value of resourceVersion
matches the specified value.

> 每次修改对象时，服务器都会更改资源版本。如果资源版本包含在 PUT 操作中，系统将通过验证资源版本的当前值是否与指定值匹配来验证在读/修改/写入周期期间没有对资源进行其他成功的更改。

The resourceVersion is currently backed by [etcd's
mod_revision](https://etcd.io/docs/latest/learning/api/#key-value-pair).
However, it's important to note that the application should *not* rely on the
implementation details of the versioning system maintained by Kubernetes. We may
change the implementation of resourceVersion in the future, such as to change it
to a timestamp or per-object counter.

> 该资源版本当前由 [etcd 的 mod_revision](https://etcd.io/docs/latest/learning/api/#key-value-pair) 支持。然而，值得注意的是，应用程序不应该依赖 Kubernetes 维护的版本控制系统的实现细节。我们将来可能会更改resourceVersion的实现，例如将其更改为时间戳或每个对象计数器。

The only way for a client to know the expected value of resourceVersion is to
have received it from the server in response to a prior operation, typically a
GET. This value MUST be treated as opaque by clients and passed unmodified back
to the server. Clients should not assume that the resource version has meaning
across namespaces, different kinds of resources, or different servers.
Currently, the value of resourceVersion is set to match etcd's sequencer. You
could think of it as a logical clock the API server can use to order requests.
However, we expect the implementation of resourceVersion to change in the
future, such as in the case we shard the state by kind and/or namespace, or port
to another storage system.

> 客户端了解 ResourceVersion 预期值的唯一方法是从服务器接收该值以响应先前的操作（通常是 GET）。该值必须被客户端视为不透明，并未经修改地传递回服务器。客户端不应假定资源版本具有跨命名空间、不同类别资源或不同服务器的含义。目前，resourceVersion 的值设置为与 etcd 的排序器匹配。您可以将其视为 API 服务器可用于排序请求的逻辑时钟。但是，我们预计 resourcesVersion 的实现将来会发生变化，例如在我们通过类别和/或命名空间或端口到另一个存储系统对状态进行分片的情况下。

In the case of a conflict, the correct client action at this point is to GET the
resource again, apply the changes afresh, and try submitting again. This
mechanism can be used to prevent races like the following:

> 如果发生冲突，此时正确的客户端操作是再次获取资源，重新应用更改，然后再次尝试提交。该机制可用于防止如下竞争：

```
Client #1                                  Client #2
GET Foo                                    GET Foo
Set Foo.Bar = "one"                        Set Foo.Baz = "two"
PUT Foo                                    PUT Foo
```

When these sequences occur in parallel, either the change to Foo.Bar or the
change to Foo.Baz can be lost.

> 当这些序列并行发生时，对 Foo.Bar 的更改或对 Foo.Baz 的更改可能会丢失。

On the other hand, when specifying the resourceVersion, one of the PUTs will
fail, since whichever write succeeds changes the resourceVersion for Foo.

> 另一方面，当指定resourceVersion时，其中一个PUT将失败，因为无论哪一个写入成功都会更改Foo的resourceVersion。

resourceVersion may be used as a precondition for other operations (e.g., GET,
DELETE) in the future, such as for read-after-write consistency in the presence
of caching.

> ResourceVersion 可以用作将来其他操作（例如 GET、DELETE）的前提条件，例如在存在缓存的情况下实现写后读一致性。

"Watch" operations specify resourceVersion using a query parameter. It is used
to specify the point at which to begin watching the specified resources. This
may be used to ensure that no mutations are missed between a GET of a resource
(or list of resources) and a subsequent Watch, even if the current version of
the resource is more recent. This is currently the main reason that list
operations (GET on a collection) return resourceVersion.

> "Watch" 操作使用查询参数指定资源版本。它用于指定开始监视指定资源的点。这可用于确保资源（或资源列表）的 GET 与后续监视之间不会遗漏任何突变，即使资源的当前版本是更新的。这是当前列表操作（集合上的 GET）返回资源版本的主要原因。

## Serialization Format｜序列化格式

APIs may return alternative representations of any resource in response to an
Accept header or under alternative endpoints, but the default serialization for
input and output of API responses MUST be JSON.

> API 可以返回任何资源的替代表示形式以响应 Accept 标头或在替代端点下，但 API 响应的输入和输出的默认序列化必须是 JSON。

A protobuf encoding is also accepted for built-in resources. As proto is not
self-describing, there is an envelope wrapper which describes the type of
the contents.

> 内置资源也接受 protobuf 编码。由于原型不是自描述的，因此有一个信封包装器来描述内容的类型。

All dates should be serialized as RFC3339 strings.

> 所有日期均应序列化为 RFC3339 字符串。

## Units｜单位

Units must either be explicit in the field name (e.g., `timeoutSeconds`), or
must be specified as part of the value (e.g., `resource.Quantity`). Which
approach is preferred is TBD, though currently we use the `fooSeconds`
convention for durations.

> 单位必须在字段名称中明确显示（例如，`timeoutSeconds`），或者必须指定为值的一部分（例如，`resource.Quantity`）。尽管目前我们使用 `fooSeconds` 约定来确定持续时间，但首选哪种方法尚待确定。

Duration fields must be represented as integer fields with units being
part of the field name (e.g. `leaseDurationSeconds`). We don't use Duration
in the API since that would require clients to implement go-compatible parsing.

> 持续时间字段必须表示为整数字段，单位是字段名称的一部分（例如 `leaseDurationSeconds`）。我们不在 API 中使用 Duration，因为这需要客户端实现与 go 兼容的解析。

## Selecting Fields｜选择字段

Some APIs may need to identify which field in a JSON object is invalid, or to
reference a value to extract from a separate resource. The current
recommendation is to use standard JavaScript syntax for accessing that field,
assuming the JSON object was transformed into a JavaScript object, without the
leading dot, such as `metadata.name`.

> 某些 API 可能需要识别 JSON 对象中的哪个字段无效，或者引用从单独资源中提取的值。当前建议是使用标准 JavaScript 语法来访问该字段，假设 JSON 对象已转换为 JavaScript 对象，不带前导点，例如 `metadata.name`。

Examples:

> 示例：

* Find the field "current" in the object "state" in the second item in the array
"fields": `fields[1].state.current`

> * 在数组 "fields" 的第二项中查找对象 "state" 中的字段 "current"：`fields[1].state.current`

## Object references｜对象引用

Object references on a namespaced type should usually refer only to objects in
the same namespace.  Because namespaces are a security boundary, cross namespace
references can have unexpected impacts, including:

> 命名空间类型上的对象引用通常应仅引用同一命名空间中的对象。由于命名空间是安全边界，跨命名空间引用可能会产生意想不到的影响，包括：

 1. leaking information about one namespace into another namespace. It's natural to place status messages or even bits of
    content about the referenced object in the original. This is a problem across namespaces.
 2. potential invasions into other namespaces. Often references give access to a piece of referred information, so being
    able to express "give me that one over there" is dangerous across namespaces without additional work for permission checks
    or opt-in's from both involved namespaces.
 3. referential integrity problems that one party cannot solve. Referencing namespace/B from namespace/A doesn't imply the
    power to control the other namespace. This means that you can refer to a thing you cannot create or update.
 4. unclear semantics on deletion. If a namespaced resource  is referenced by other namespaces, should a delete of the
    referenced resource result in removal or should the referenced resource be force to remain.
 5. unclear semantics on creation. If a referenced resource is created after its reference, there is no way to know if it
    is the one that is expected or if it is a different one created with the same name.

>  1. 将一个命名空间的信息泄漏到另一个命名空间中。在原始文件中放置状态消息甚至有关引用对象的内容是很自然的。这是跨命名空间的问题。
>  2. 对其他命名空间的潜在入侵。通常，引用可以访问一条被引用的信息，因此能够跨命名空间表达“给我那个”是危险的，而无需从两个涉及的命名空间进行权限检查或选择加入的额外工作。
>  3. 一方无法解决的参照完整性问题。从命名空间/A 引用命名空间/B 并不意味着拥有控制其他命名空间的权力。这意味着您可以引用无法创建或更新的事物。
>  4. 删除语义不清楚。如果命名空间资源被其他命名空间引用，则删除引用的资源是否会导致删除，或者是否应强制保留引用的资源。
>  5. 关于创造的语义不清楚。如果引用的资源是在引用之后创建的，则无法知道它是否是预期的资源，或者是否是使用相同名称创建的不同资源。

Built-in types and ownerReferences do not support cross namespaces references.
If a non-built-in types chooses to have cross-namespace references the semantics of the edge cases above should be
clearly described and the permissions issues should be resolved.
This could be done with a double opt-in (an opt-in from both the referrer and the refer-ee) or with secondary permissions
checks performed in admission.

> 内置类型和ownerReferences不支持跨命名空间引用。如果非内置类型选择跨命名空间引用，则应清楚地描述上述边缘情况的语义，并解决权限问题。这可以通过双重选择加入（推荐人和被推荐人都选择加入）或在入场时执行辅助权限检查来完成。

### Naming of the reference field｜引用字段的命名

The name of the reference field should be of the format "{field}Ref", with "Ref" always included in the suffix.

> 引用字段的名称应采用“{field}Ref”格式，后缀中始终包含 "Ref"。

The "{field}" component should be named to indicate the purpose of the reference. For example, "targetRef" in an
endpoint indicates that the object reference specifies the target.

> “{field}”组件的命名应表明引用的目的。例如，端点中的 "targetRef" 表示对象引用指定目标。

It is okay to have the "{field}" component indicate the resource type. For example, "secretRef" when referencing
a secret. However, this comes with the risk of the field being a misnomer in the case that the field is expanded to
reference more than one type.

> 可以让“{field}”组件指示资源类型。例如，引用机密时为 "secretRef"。然而，如果该字段扩展为引用多个类型，则存在该字段用词不当的风险。

In the case of a list of object references, the field should be of the format "{field}Refs", with the same guidance
as the singular case above.

> 在对象引用列表的情况下，字段应采用“{field}Refs”格式，与上面的单数情况相同。

### Referencing resources with multiple versions｜引用具有多个版本的资源

Most resources will have multiple versions. For example, core resources
will undergo version changes as it transitions from alpha to GA.

> 大多数资源都有多个版本。例如，核心资源在从 alpha 过渡到 GA 时将会经历版本更改。

Controllers should assume that a version of a resource may change, and include appropriate error handling.

> 控制器应该假设资源的版本可能会更改，并包括适当的错误处理。

### Handling of resources that do not exist｜处理不存在的资源

There are multiple scenarios where a desired resource may not exist. Examples include:

> 在多种情况下，所需的资源可能不存在。示例包括：

- the desired version of the resource does not exist.
- race condition in the bootstrapping of a cluster resulting a resource not yet added.
- user error.

> - 所需版本的资源不存在。
> - 集群引导中的竞争条件导致资源尚未添加。
> - 用户错误。

Controllers should be authored with the assumption that the referenced resource may not exist, and include
error handling to make the issue clear to the user.

> 控制器的编写应假设所引用的资源可能不存在，并包含错误处理以使用户清楚地了解问题。

### Validation of fields｜字段校验

Many of the values used in an object reference are used as part of the API path. For example,
the object name is used in the path to identify the object. Unsanitized, these values can be used to
attempt to retrieve other resources, such as by using values with semantic meanings such as  `..` or `/`.

> 对象引用中使用的许多值都用作 API 路径的一部分。例如，在路径中使用对象名称来标识该对象。如果未经清理，这些值可用于尝试检索其他资源，例如通过使用具有语义含义的值（例如 `..` 或 `/`）。

Have the controller validate fields before using them as path segments in an API request, and emit an event to
tell the user that the validation has failed.

> 让控制器在将字段用作 API 请求中的路径段之前对其进行验证，并发出一个事件来告诉用户验证失败。

See [Object Names and IDs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)
for more information on legal object names.

> 有关合法对象名称的详细信息，请参阅[对象名称和 ID](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)。

### Do not modify the referred object｜不要修改被引用对象

To minimize potential privilege escalation vectors, do not modify the object that is being referred to,
or limit modification to objects in the same namespace and constrain the type of modification allowed
(for example, the HorizontalPodAutoscaler controller only writes to the `/scale` subresource).

> 为了最大限度地减少潜在的权限提升向量，请勿修改所引用的对象，或限制对同一命名空间中的对象的修改并限制允许的修改类型（例如，HorizontalPodAutoscaler 控制器仅写入 `/scale` 子资源）。

### Minimize copying or printing values to the referrer object｜尽量不要向引用方对象复制或输出值

As the permissions of the controller can differ from the permissions of the author of the object
the controller is managing, it is possible that the author of the object may not have permissions to
view the referred object. As a result, the copying of any values about the referred object to the
referrer object can be considered permissions escalations, enabling a user to read values that they
would not have access to previously.

> 由于控制器的权限可能与控制器正在管理的对象的作者的权限不同，因此对象的作者可能没有查看所引用对象的权限。因此，将有关被引用对象的任何值复制到引用对象可以被视为权限升级，从而使用户能够读取他们以前无法访问的值。

The same scenario applies to writing information about the referred object to events.

> 相同的场景适用于将有关所引用对象的信息写入事件。

In general, do not write or print information retrieved from the referred object to the spec, other objects, or logs.

> 一般来说，不要将从引用对象检索到的信息写入或打印到规范、其他对象或日志中。

When it is necessary, consider whether these values would be ones that the
author of the referrer object would have access to via other means (e.g. already required to
correctly populate the object reference).

> 必要时，请考虑这些值是否是引用对象的作者可以通过其他方式访问的值（例如，已需要正确填充对象引用）。

### Object References Examples｜对象引用示例

The following sections illustrate recommended schemas for various object references scenarios.

> 以下部分说明了各种对象引用场景的推荐架构。

The schemas outlined below are designed to enable purely additive fields as the types of referencable
objects expand, and therefore are backwards compatible.

> 下面概述的模式旨在随着可引用对象类型的扩展启用纯附加字段，因此向后兼容。

For example, it is possible to go from a single resource type to multiple resource types without
a breaking change in the schema.

> 例如，可以从单一资源类型转变为多种资源类型，而无需对架构进行重大更改。

#### Single resource reference｜单一资源引用

A single kind object reference is straightforward in that the controller can hard-code most qualifiers needed to identify the object. As such as the only value needed to be provided is the name (and namespace, although cross-namespace references are discouraged):

> 单个类别对象引用非常简单，因为控制器可以对识别对象所需的大多数限定符进行硬编码。例如，需要提供的唯一值是名称（和命名空间，尽管不鼓励跨命名空间引用）：

```yaml
# for a single resource, the suffix should be Ref, with the field name
# providing an indication as to the resource type referenced.
secretRef:
    name: foo
    # namespace would generally not be needed and is discouraged,
    # as explained above.
    namespace: foo-namespace
```

This schema should only be used when the intention is to always have the reference only be to a single resource.
If extending to multiple resource types is possible, use the [multiple resource reference](#multiple-resource-reference).

> 仅当目的是始终仅引用单个资源时才应使用此模式。如果可以扩展到多种资源类型，请使用[多资源引用](#multiple-resource-reference)。

##### Controller behavior｜控制器行为

The operator is expected to know the version, group, and resource name of the object it needs to retrieve the value from, and can use the discovery client or construct the API path directly.

> 操作员需要知道需要从中检索值的对象的版本、组和资源名称，并且可以使用发现客户端或直接构建 API 路径。

#### Multiple resource reference｜多资源引用

Multi-kind object references are used when there is a bounded set of valid resource types that a reference can point to.

> 当引用可以指向一组有界的有效资源类型时，使用多类别对象引用。

As with a single-kind object reference, the operator can supply missing fields, provided that the fields that are present are sufficient to uniquely identify the object resource type among the set of supported types.

> 与单个类别对象引用一样，操作员可以提供缺失的字段，前提是存在的字段足以在支持的类型集中唯一标识对象资源类型。

```yaml
# guidance for the field name is the same as a single resource.
fooRef:
    group: sns.services.k8s.aws
    resource: topics
    name: foo
    namespace: foo-namespace
```

Although not always necessary to help a controller identify a resource type, “group” is included to avoid ambiguity when the resource exists in multiple groups. It also provides clarity to end users and enables copy-pasting of a reference without the referenced type changing due to a different controller handling the reference.

> 尽管并不总是需要帮助控制器识别资源类型，但包含“组”以避免资源存在于多个组中时出现歧义。它还为最终用户提供了清晰度，并允许复制粘贴引用，而不会因处理引用的不同控制器而改变引用类型。

##### Kind vs. Resource｜Kind 与 Resource

A common point of confusion in object references is whether to construct
references with a "kind" or "resource" field. Historically most object
references in Kubernetes have used "kind". This is not as precise as "resource".
Although each combination of "group" and "resource" must be unique within
Kubernetes, the same is not always true for "group" and "kind". It is possible
for multiple resources to make use of the same "kind".

> 对象引用中的一个常见混淆点是是否使用 "kind" 还是 "resource" 字段构造引用。从历史上看，Kubernetes 中的大多数对象引用都使用 "kind"。这不如 "resource" 精确。尽管 "group" 和 "resource" 的每个组合在 Kubernetes 中必须是唯一的，但 "group" 和 "kind" 并不总是如此。多个资源可以使用同一个 "kind"。

Typically all objects in Kubernetes have a canonical primary resource - such as
“pods” representing the way to create and delete resources of the “Pod” schema.
While it is possible a resource schema cannot be directly created, such as a
“Scale” object which is only used within the “scale” subresource of a number of
workloads, most object references address the primary resource via its schema.
In the context of object references, "kind" refers to the schema, not the
resource.

> 通常，Kubernetes 中的所有对象都有一个规范的主要资源——例如“pod”，代表创建和删除“Pod”模式资源的方式。虽然资源架构可能无法直接创建，例如仅在多个工作负载的“scale”子资源中使用的“Scale”对象，但大多数对象引用通过其架构来寻址主要资源。在对象引用的上下文中，"kind" 指的是架构，而不是资源。

If implementations of an object reference will always have a clear way to map
kinds to resources, it is acceptable to use "kind" in the object reference. In
general, this requires implementations to have a predefined mapping between
kinds and resources (this is the case for built-in references which use "kind").
Relying on dynamic kind to resource mapping is not safe. Even if a "kind" only
dynamically maps to a single resource initially, it's possible for another
resource to be mounted that refers to the same "kind", potentially breaking any
dynamic resource mapping.

> 如果对象引用的实现始终具有将类别映射到资源的明确方法，则可以在对象引用中使用 "kind"。一般来说，这要求实现在类别和资源之间具有预定义的映射（使用 "kind" 的内置引用就是这种情况）。依赖动态类别进行资源映射并不安全。即使 "kind" 最初仅动态映射到单个资源，也可能会安装引用同一 "kind" 的另一个资源，从而可能破坏任何动态资源映射。

If an object reference may be used to reference resources of arbitrary types and
the mapping between kind and resource could be ambiguous, "resource" should be
used in the object reference.

> 如果对象引用可用于引用任意类型的资源，并且类别和资源之间的映射可能不明确，则应在对象引用中使用 "resource"。

The Ingress API provides a good example of where "kind" is acceptable for an
object reference. The API supports a backend reference as an extension point.
Implementations can use this to support forwarding traffic to custom targets
such as a storage bucket. Importantly, the supported target types are clearly
defined by each implementation of the API and there is no ambiguity for which
resource a kind maps to. This is because each Ingress implementation has a
hard-coded mapping of kind to resource.

> Ingress API 提供了一个很好的示例，说明 "kind" 在哪里可以接受对象引用。API 支持后端引用作为扩展点。实现可以使用它来支持将流量转发到自定义目标，例如存储桶。重要的是，支持的目标类型由 API 的每个实现明确定义，并且类别映射到哪个资源没有歧义。这是因为每个 Ingress 实现都有类别到资源的硬编码映射。

The object reference above would look like this if it were using "kind" instead
of "resource":

> 如果使用 "kind" 而不是 "resource"，上面的对象引用将如下所示：

```yaml
fooRef:
    group: sns.services.k8s.aws
    kind: Topic
    name: foo
    namespace: foo-namespace
```

##### Controller behavior｜控制器行为

The operator can store a map of (group,resource) to the version of that resource it desires. From there, it can construct the full path to the resource, and retrieve the object.

> 操作员可以存储（组，资源）到其所需资源版本的映射。从那里，它可以构造资源的完整路径，并检索对象。

It is also possible to have the controller choose a version that it finds via the discovery client. However, as schemas can vary across different versions
of a resource, the controller must also handle these differences.

> 也可以让控制器选择通过发现客户端找到的版本。但是，由于模式可能因资源的不同版本而异，因此控制器还必须处理这些差异。

#### Generic object reference｜通用对象引用

A generic object reference is used when the desire is to provide a pointer to some object to simplify discovery for the user. For example, this could be used to reference a target object for a `core.v1.Event` that occurred.

> 当需要提供指向某个对象的指针以简化用户的发现时，可以使用通用对象引用。例如，这可用于引用发生的 `core.v1.Event` 的目标对象。

With a generic object reference, it is not possible to extract any information about the referenced object aside from what is standard (e.g. ObjectMeta). Since any standard fields exist in any version of a resource, it is possible to not include version in this case:

> 对于通用对象引用，除了标准信息（例如 ObjectMeta）之外，不可能提取有关引用对象的任何信息。由于任何标准字段都存在于资源的任何版本中，因此在这种情况下可以不包含版本：

```yaml
fooObjectRef:
    group: operator.openshift.io
    resource: openshiftapiservers
    name: cluster
    # namespace is unset if the resource is cluster-scoped, or lives in the
    # same namespace as the referrer.
```

##### Controller behavior｜控制器行为

The operator would be expected to find the resource via the discovery client (as the version is not supplied). As any retrievable field would be common to all objects, any version of the resource should do.

> 操作员应该通过发现客户端找到资源（因为未提供版本）。由于任何可检索字段对于所有对象都是通用的，因此任何版本的资源都应该这样做。

#### Field reference｜字段引用

A field reference is used when the desire is to extract a value from a specific field in a referenced object.

> 当需要从引用对象的特定字段中提取值时，将使用字段引用。

Field references differ from other reference types, as the operator has no knowledge of the object prior to the reference. Since the schema of an object can differ for different versions of a resource, this means that a “version” is required for this type of reference.

> 字段引用与其他引用类型不同，因为操作员在引用之前不了解对象。由于资源的不同版本的对象架构可能有所不同，这意味着此类引用需要“版本”。

```yaml
fooFieldRef:
   version: v1 # version of the resource
   # group is elided in the ConfigMap example, since it has a blank group in the OpenAPI spec.
   resource: configmaps
   fieldPath: data.foo
```

The fieldPath should point to a single value, and use [the recommended field selector notation](#selecting-fields) to denote the field path.

> fieldPath 应指向单个值，并使用[推荐的字段选择器表示法](#selecting-fields) 来表示字段路径。

##### Controller behavior｜控制器行为

In this scenario, the user will supply all of the required path elements: group, version, resource, name, and possibly namespace.
As such, the controller can construct the API prefix and query it without the use of the discovery client:

> 在这种情况下，用户将提供所有必需的路径元素：组、版本、资源、名称和可能的命名空间。因此，控制器可以构造 API 前缀并对其进行查询，而无需使用发现客户端：

```
/apis/{group}/{version}/{resource}/
```

## HTTP Status codes｜HTTP 状态码

The server will respond with HTTP status codes that match the HTTP spec. See the
section below for a breakdown of the types of status codes the server will send.

> 服务器将使用与 HTTP 规范匹配的 HTTP 状态代码进行响应。有关服务器将发送的状态代码类型的详细信息，请参阅下面的部分。

The following HTTP status codes may be returned by the API.

> API 可能会返回以下 HTTP 状态代码。

### Success codes｜成功状态码

* `200 StatusOK`
  * Indicates that the request completed successfully.
* `201 StatusCreated`
  * Indicates that the request to create kind completed successfully.
* `204 StatusNoContent`
  * Indicates that the request completed successfully, and the response contains
no body.
  * Returned in response to HTTP OPTIONS requests.

> * `200 StatusOK`
>   * 表明请求成功完成。
> * `201 StatusCreated`
>   * 指示创建类别的请求已成功完成。
> * `204 StatusNoContent`
>   * 表示请求已成功完成，并且响应不包含正文。
>   * 响应 HTTP OPTIONS 请求而返回。

### Error codes｜错误状态码

* `307 StatusTemporaryRedirect`
  * Indicates that the address for the requested resource has changed.
  * Suggested client recovery behavior:
    * Follow the redirect.


* `400 StatusBadRequest`
  * Indicates the requested is invalid.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `401 StatusUnauthorized`
  * Indicates that the server can be reached and understood the request, but
refuses to take any further action, because the client must provide
authorization. If the client has provided authorization, the server is
indicating the provided authorization is unsuitable or invalid.
  * Suggested client recovery behavior:
    * If the user has not supplied authorization information, prompt them for
the appropriate credentials. If the user has supplied authorization information,
inform them their credentials were rejected and optionally prompt them again.


* `403 StatusForbidden`
  * Indicates that the server can be reached and understood the request, but
refuses to take any further action, because it is configured to deny access for
some reason to the requested resource by the client.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `404 StatusNotFound`
  * Indicates that the requested resource does not exist.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `405 StatusMethodNotAllowed`
  * Indicates that the action the client attempted to perform on the resource
was not supported by the code.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `409 StatusConflict`
  * Indicates that either the resource the client attempted to create already
exists or the requested update operation cannot be completed due to a conflict.
  * Suggested client recovery behavior:
    * If creating a new resource:
      * Either change the identifier and try again, or GET and compare the
fields in the pre-existing object and issue a PUT/update to modify the existing
object.
    * If updating an existing resource:
      * See `Conflict` from the `status` response section below on how to
retrieve more information about the nature of the conflict.
      * GET and compare the fields in the pre-existing object, merge changes (if
still valid according to preconditions), and retry with the updated request
(including `ResourceVersion`).


* `410 StatusGone`
  * Indicates that the item is no longer available at the server and no
forwarding address is known.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `422 StatusUnprocessableEntity`
  * Indicates that the requested create or update operation cannot be completed
due to invalid data provided as part of the request.
  * Suggested client recovery behavior:
    * Do not retry. Fix the request.


* `429 StatusTooManyRequests`
  * Indicates that either the client rate limit has been exceeded or the
server has received more requests than it can process.
  * Suggested client recovery behavior:
    * Read the `Retry-After` HTTP header from the response, and wait at least
that long before retrying.


* `500 StatusInternalServerError`
  * Indicates that the server can be reached and understood the request, but
either an unexpected internal error occurred and the outcome of the call is
unknown, or the server cannot complete the action in a reasonable time (this may
be due to temporary server load or a transient communication issue with another
server).
  * Suggested client recovery behavior:
    * Retry with exponential backoff.


* `503 StatusServiceUnavailable`
  * Indicates that required service is unavailable.
  * Suggested client recovery behavior:
    * Retry with exponential backoff.


* `504 StatusServerTimeout`
  * Indicates that the request could not be completed within the given time.
Clients can get this response ONLY when they specified a timeout param in the
request.
  * Suggested client recovery behavior:
    * Increase the value of the timeout param and retry with exponential
backoff.

> * `307 StatusTemporaryRedirect`
>   * 表示所请求资源的地址已更改。
>   * 建议的客户端恢复行为：
>     * 按照重定向进行操作。
> * `400 StatusBadRequest`
>   * 表示请求无效。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `401 StatusUnauthorized`
>   * 表示可以到达服务器并理解该请求，但拒绝采取任何进一步的操作，因为客户端必须提供授权。如果客户端已提供授权，则服务器指示提供的授权不合适或无效。
>   * 建议的客户端恢复行为：
>     * 如果用户未提供授权信息，请提示他们输入适当的凭据。如果用户提供了授权信息，请通知他们他们的凭据被拒绝，并可以选择再次提示他们。
> * `403 StatusForbidden`
>   * 表示可以到达服务器并理解该请求，但拒绝采取任何进一步的操作，因为它被配置为出于某种原因拒绝客户端对所请求资源的访问。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `404 StatusNotFound`
>   * 表示请求的资源不存在。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `405 StatusMethodNotAllowed`
>   * 指示代码不支持客户端尝试对资源执行的操作。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `409 StatusConflict`
>   * 表示客户端尝试创建的资源已存在，或者请求的更新操作由于冲突而无法完成。
>   * 建议的客户端恢复行为：
>     * 如果创建新资源：
>       * 更改标识符并重试，或者 GET 并比较预先存在的对象中的字段并发出 PUT/更新以修改现有对象。
>     * 如果更新现有资源：
>       * 请参阅下面 `status` 响应部分中的 `Conflict`，了解如何检索有关冲突性质的更多信息。
>       * GET 并比较预先存在的对象中的字段，合并更改（如果根据先决条件仍然有效），然后重试更新的请求（包括 `ResourceVersion`）。
> * `410 StatusGone`
>   * 表示该项目在服务器上不再可用，并且转发地址未知。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `422 StatusUnprocessableEntity`
>   * 表示由于请求中提供的数据无效，无法完成请求的创建或更新操作。
>   * 建议的客户端恢复行为：
>     * 不要重试。修复请求。
> * `429 StatusTooManyRequests`
>   * 指示已超出客户端速率限制或服务器收到的请求数量超出其处理能力。
>   * 建议的客户端恢复行为：
>     * 从响应中读取 `Retry-After` HTTP 标头，并在重试之前至少等待那么长时间。
> * `500 StatusInternalServerError`
>   * 表示可以到达服务器并理解该请求，但发生意外的内部错误并且调用结果未知，或者服务器无法在合理的时间内完成操作（这可能是由于临时服务器负载或与另一台服务器的瞬时通信问题）。
>   * 建议的客户端恢复行为：
>     * 使用指数退避重试。
> * `503 StatusServiceUnavailable`
>   * 表示所需的服务不可用。
>   * 建议的客户端恢复行为：
>     * 使用指数退避重试。
> * `504 StatusServerTimeout`
>   * 表示请求无法在给定时间内完成。仅当客户端在请求中指定超时参数时才能获得此响应。
>   * 建议的客户端恢复行为：
>     * 增加超时参数的值并使用指数退避重试。

## Response Status Kind｜Status 响应类别

Kubernetes will always return the `Status` kind from any API endpoint when an
error occurs. Clients SHOULD handle these types of objects when appropriate.

> 当发生错误时，Kubernetes 将始终从任何 API 端点返回 `Status` 类别。客户端应该在适当的时候处理这​​些类型的对象。

A `Status` kind will be returned by the API in two cases:

> 在两种情况下，API 将返回 `Status` 类别：

  * When an operation is not successful (i.e. when the server would return a non
2xx HTTP status code).
  * When a HTTP `DELETE` call is successful.

>   * 当操作不成功时（即服务器返回非 2xx HTTP 状态代码时）。
>   * 当 HTTP `DELETE` 调用成功时。

The status object is encoded as JSON and provided as the body of the response.
The status object contains fields for humans and machine consumers of the API to
get more detailed information for the cause of the failure. The information in
the status object supplements, but does not override, the HTTP status code's
meaning. When fields in the status object have the same meaning as generally
defined HTTP headers and that header is returned with the response, the header
should be considered as having higher priority.

> 状态对象被编码为 JSON 并作为响应的正文提供。状态对象包含供 API 的人类和机器使用者获取有关故障原因的更详细信息的字段。状态对象中的信息补充但不会覆盖 HTTP 状态代码的含义。当状态对象中的字段与通常定义的 HTTP 标头具有相同含义并且该标头随响应返回时，应将标头视为具有更高的优先级。

**Example:**

> **示例：**

```console
$ curl -v -k -H "Authorization: Bearer WhCDvq4VPpYhrcfmF6ei7V9qlbqTubUc" https://10.240.122.184:443/api/v1/namespaces/default/pods/grafana

> GET /api/v1/namespaces/default/pods/grafana HTTP/1.1
> User-Agent: curl/7.26.0
> Host: 10.240.122.184
> Accept: */*
> Authorization: Bearer WhCDvq4VPpYhrcfmF6ei7V9qlbqTubUc
>

< HTTP/1.1 404 Not Found
< Content-Type: application/json
< Date: Wed, 20 May 2015 18:10:42 GMT
< Content-Length: 232
<
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "pods \"grafana\" not found",
  "reason": "NotFound",
  "details": {
    "name": "grafana",
    "kind": "pods"
  },
  "code": 404
}
```

`status` field contains one of two possible values:

> `status` 字段包含两个可能值之一：

* `Success`
* `Failure`

> * `Success`
> * `Failure`

`message` may contain human-readable description of the error

> `message` 可能包含人类可读的错误描述

`reason` may contain a machine-readable, one-word, CamelCase description of why
this operation is in the `Failure` status. If this value is empty there is no
information available. The `reason` clarifies an HTTP status code but does not
override it.

> `reason` 可以包含机器可读的单字驼峰命名法描述，说明为什么此操作处于 `Failure` 状态。如果该值为空，则没有可用信息。`reason` 阐明了 HTTP 状态代码，但不会覆盖它。

`details` may contain extended data associated with the reason. Each reason may
define its own extended details. This field is optional and the data returned is
not guaranteed to conform to any schema except that defined by the reason type.

> `details` 可能包含与原因相关的扩展数据。每个原因都可以定义其自己的扩展细节。该字段是可选的，并且不保证返回的数据符合除原因类型定义之外的任何模式。

Possible values for the `reason` and `details` fields:

> `reason` 和 `details` 字段的可能值：

* `BadRequest`
  * Indicates that the request itself was invalid, because the request doesn't
make any sense, for example deleting a read-only object.
  * This is different than `status reason` `Invalid` above which indicates that
the API call could possibly succeed, but the data was invalid.
  * API calls that return BadRequest can never succeed.
  * Http status code: `400 StatusBadRequest`


* `Unauthorized`
  * Indicates that the server can be reached and understood the request, but
refuses to take any further action without the client providing appropriate
authorization. If the client has provided authorization, this error indicates
the provided credentials are insufficient or invalid.
  * Details (optional):
    * `kind string`
      * The kind attribute of the unauthorized resource (on some operations may
differ from the requested resource).
    * `name string`
      * The identifier of the unauthorized resource.
   * HTTP status code: `401 StatusUnauthorized`


* `Forbidden`
  * Indicates that the server can be reached and understood the request, but
refuses to take any further action, because it is configured to deny access for
some reason to the requested resource by the client.
  * Details (optional):
    * `kind string`
      * The kind attribute of the forbidden resource (on some operations may
differ from the requested resource).
    * `name string`
      * The identifier of the forbidden resource.
  * HTTP status code: `403 StatusForbidden`


* `NotFound`
  * Indicates that one or more resources required for this operation could not
be found.
  * Details (optional):
    * `kind string`
      * The kind attribute of the missing resource (on some operations may
differ from the requested resource).
    * `name string`
      * The identifier of the missing resource.
  * HTTP status code: `404 StatusNotFound`


* `AlreadyExists`
  * Indicates that the resource you are creating already exists.
  * Details (optional):
    * `kind string`
      * The kind attribute of the conflicting resource.
    * `name string`
      * The identifier of the conflicting resource.
  * HTTP status code: `409 StatusConflict`

* `Conflict`
  * Indicates that the requested update operation cannot be completed due to a
conflict. The client may need to alter the request. Each resource may define
custom details that indicate the nature of the conflict.
  * HTTP status code: `409 StatusConflict`


* `Invalid`
  * Indicates that the requested create or update operation cannot be completed
due to invalid data provided as part of the request.
  * Details (optional):
    * `kind string`
      * the kind attribute of the invalid resource
    * `name string`
      * the identifier of the invalid resource
    * `causes`
      * One or more `StatusCause` entries indicating the data in the provided
resource that was invalid. The `reason`, `message`, and `field` attributes will
be set.
  * HTTP status code: `422 StatusUnprocessableEntity`


* `Timeout`
  * Indicates that the request could not be completed within the given time.
Clients may receive this response if the server has decided to rate limit the
client, or if the server is overloaded and cannot process the request at this
time.
  * Http status code: `429 TooManyRequests`
  * The server should set the `Retry-After` HTTP header and return
`retryAfterSeconds` in the details field of the object. A value of `0` is the
default.


* `ServerTimeout`
  * Indicates that the server can be reached and understood the request, but
cannot complete the action in a reasonable time. This maybe due to temporary
server load or a transient communication issue with another server.
    * Details (optional):
      * `kind string`
        * The kind attribute of the resource being acted on.
      * `name string`
        * The operation that is being attempted.
  * The server should set the `Retry-After` HTTP header and return
`retryAfterSeconds` in the details field of the object. A value of `0` is the
default.
  * Http status code: `504 StatusServerTimeout`


* `MethodNotAllowed`
  * Indicates that the action the client attempted to perform on the resource
was not supported by the code.
  * For instance, attempting to delete a resource that can only be created.
  * API calls that return MethodNotAllowed can never succeed.
  * Http status code: `405 StatusMethodNotAllowed`


* `InternalError`
  * Indicates that an internal error occurred, it is unexpected and the outcome
of the call is unknown.
  * Details (optional):
    * `causes`
      * The original error.
  * Http status code: `500 StatusInternalServerError` `code` may contain the suggested HTTP return code for this status.

> * `BadRequest`
>   * 表示请求本身无效，因为该请求没有任何意义，例如删除只读对象。
>   * 这与上面的 `status reason` `Invalid` 不同，后者表明 API 调用可能成功，但数据无效。
>   * 返回 BadRequest 的 API 调用永远不会成功。
>   * HTTP状态码：`400 StatusBadRequest`
> * `Unauthorized`
>   * 表示可以到达服务器并理解该请求，但如果客户端没有提供适当的授权，则拒绝采取任何进一步的操作。如果客户端已提供授权，则此错误表示提供的凭据不足或无效。
>   * 详细信息（可选）：
>     * `kind string`
>       * 未授权资源的类别属性（在某些操作上可能与请求的资源不同）。
>     * `name string`
>       * 未授权资源的标识符。
>    * HTTP 状态代码：`401 StatusUnauthorized`
> * `Forbidden`
>   * 表示可以到达服务器并理解该请求，但拒绝采取任何进一步的操作，因为它被配置为出于某种原因拒绝客户端对所请求资源的访问。
>   * 详细信息（可选）：
>     * `kind string`
>       * 禁止资源的类别属性（在某些操作上可能与请求的资源不同）。
>     * `name string`
>       * 禁止资源的标识符。
>   * HTTP 状态代码：`403 StatusForbidden`
> * `NotFound`
>   * 指示无法找到此操作所需的一个或多个资源。
>   * 详细信息（可选）：
>     * `kind string`
>       * 丢失资源的类别属性（在某些操作上可能与请求的资源不同）。
>     * `name string`
>       * 丢失资源的标识符。
>   * HTTP 状态代码：`404 StatusNotFound`
> * `AlreadyExists`
>   * 表明您正在创建的资源已经存在。
>   * 详细信息（可选）：
>     * `kind string`
>       * 冲突资源的类别属性。
>     * `name string`
>       * 冲突资源的标识符。
>   * HTTP 状态代码：`409 StatusConflict`
> * `Conflict`
>   * 表示由于冲突而无法完成请求的更新操作。客户可能需要更改请求。每个资源可以定义指示冲突性质的自定义详细信息。
>   * HTTP 状态代码：`409 StatusConflict`
> * `Invalid`
>   * 表示由于请求中提供的数据无效，无法完成请求的创建或更新操作。
>   * 详细信息（可选）：
>     * `kind string`
>       * 无效资源的类别属性
>     * `name string`
>       * 无效资源的标识符
>     * `causes`
>       * 一个或多个 `StatusCause` 条目指示所提供资源中的数据无效。将设置 `reason`、`message` 和 `field` 属性。
>   * HTTP 状态代码：`422 StatusUnprocessableEntity`
> * `Timeout`
>   * 表示请求无法在给定时间内完成。如果服务器决定对客户端进行速率限制，或者服务器过载并且此时无法处理请求，则客户端可能会收到此响应。
>   * HTTP状态码：`429 TooManyRequests`
>   * 服务器应设置 `Retry-After` HTTP 标头并在对象的详细信息字段中返回 `retryAfterSeconds`。`0` 是默认值。
> * `ServerTimeout`
>   * 表示可以到达服务器并理解该请求，但无法在合理的时间内完成操作。这可能是由于临时服务器负载或与另一台服务器的瞬时通信问题造成的。
>     * 详细信息（可选）：
>       * `kind string`
>         * 正在操作的资源的类别属性。
>       * `name string`
>         * 正在尝试的操作。
>   * 服务器应设置 `Retry-After` HTTP 标头并在对象的详细信息字段中返回 `retryAfterSeconds`。`0` 是默认值。
>   * HTTP状态码：`504 StatusServerTimeout`
> * `MethodNotAllowed`
>   * 指示代码不支持客户端尝试对资源执行的操作。
>   * 例如，尝试删除只能创建的资源。
>   * 返回 MethodNotAllowed 的 API 调用永远不会成功。
>   * HTTP状态码：`405 StatusMethodNotAllowed`
> * `InternalError`
>   * 表示发生了内部错误，这是意外的并且调用的结果未知。
>   * 详细信息（可选）：
>     * `causes`
>       * 原来的错误。
>   * HTTP 状态代码：`500 StatusInternalServerError` `code` 可能包含此状态的建议 HTTP 返回代码。

## Events｜事件

Events are complementary to status information, since they can provide some
historical information about status and occurrences in addition to current or
previous status. Generate events for situations users or administrators should
be alerted about.

> 事件是状态信息的补充，因为除了当前或以前的状态之外，它们还可以提供一些有关状态和事件的历史信息。为应提醒用户或管理员的情况生成事件。

Choose a unique, specific, short, CamelCase reason for each event category. For
example, `FreeDiskSpaceInvalid` is a good event reason because it is likely to
refer to just one situation, but `Started` is not a good reason because it
doesn't sufficiently indicate what started, even when combined with other event
fields.

> 为每个事件类别选择一个独特、具体、简短的 CamelCase 原因。例如，`FreeDiskSpaceInvalid` 是一个很好的事件原因，因为它可能仅指一种情况，但 `Started` 不是一个很好的原因，因为它不能充分指示开始的内容，即使与其他事件字段结合使用也是如此。

`Error creating foo` or `Error creating foo %s` would be appropriate for an
event message, with the latter being preferable, since it is more informational.

> `Error creating foo` 或 `Error creating foo %s` 适用于事件消息，后者更可取，因为它提供更多信息。

Accumulate repeated events in the client, especially for frequent events, to
reduce data volume, load on the system, and noise exposed to users.

> 累积客户端中的重复事件，尤其是频繁事件，以减少数据量、系统负载以及向用户暴露的噪音。

## Naming conventions｜命名约定

* Go field names must be PascalCase. JSON field names must be camelCase. Other
than capitalization of the initial letter, the two should almost always match.
No underscores or dashes in either.
* Field and resource names should be declarative, not imperative (SomethingDoer,
DoneBy, DoneAt).
* Use `Node` where referring to
the node resource in the context of the cluster. Use `Host` where referring to
properties of the individual physical/virtual system, such as `hostname`,
`hostPath`, `hostNetwork`, etc.
* `FooController` is a deprecated kind naming convention. Name the kind after
the thing being controlled instead (e.g., `Job` rather than `JobController`).
* The name of a field that specifies the time at which `something` occurs should
be called `somethingTime`. Do not use `stamp` (e.g., `creationTimestamp`).
* We use the `fooSeconds` convention for durations, as discussed in the [units
subsection](#units).
  * `fooPeriodSeconds` is preferred for periodic intervals and other waiting
periods (e.g., over `fooIntervalSeconds`).
  * `fooTimeoutSeconds` is preferred for inactivity/unresponsiveness deadlines.
  * `fooDeadlineSeconds` is preferred for activity completion deadlines.
* Do not use abbreviations in the API, except where they are extremely commonly
used, such as "id", "args", or "stdin".
* Acronyms should similarly only be used when extremely commonly known. All
letters in the acronym should have the same case, using the appropriate case for
the situation. For example, at the beginning of a field name, the acronym should
be all lowercase, such as "httpGet". Where used as a constant, all letters
should be uppercase, such as "TCP" or "UDP".
* The name of a field referring to another resource of kind `Foo` by name should
be called `fooName`. The name of a field referring to another resource of kind
`Foo` by ObjectReference (or subset thereof) should be called `fooRef`.
* More generally, include the units and/or type in the field name if they could
be ambiguous and they are not specified by the value or value type.
* The name of a field expressing a boolean property called 'fooable' should be
called `Fooable`, not `IsFooable`.

> * Go 字段名称必须采用 PascalCase。JSON 字段名称必须采用驼峰命名法。除了首字母大写之外，两者几乎应该总是匹配。两者中都没有下划线或破折号。
> * 字段和资源名称应该是声明式的，而不是命令式的（SomethingDoer、DoneBy、DoneAt）。
> * 使用 `Node` 来引用集群上下文中的节点资源。在引用单个物理/虚拟系统的属性时使用 `Host`，例如 `hostname`、`hostPath`、`hostNetwork` 等。
> * `FooController` 是已弃用的类别命名约定。以被控制的物体命名类别（例如，`Job` 而不是 `JobController`）。
> * 指定 `something` 发生时间的字段名称应称为 `somethingTime`。请勿使用 `stamp`（例如 `creationTimestamp`）。
> * 我们对持续时间使用 `fooSeconds` 约定，如[单位小节](#units) 中所述。
>   * `fooPeriodSeconds` 对于周期性间隔和其他等待期（例如，优于 `fooIntervalSeconds`）是首选。
>   * `fooTimeoutSeconds` 是不活动/无响应截止日期的首选。
>   * `fooDeadlineSeconds` 是活动完成期限的首选。
> * 不要在 API 中使用缩写，除非它们非常常用，例如 "id"、"args" 或 "stdin"。
> * 同样，只有在极其众所周知的情况下才应使用首字母缩略词。首字母缩略词中的所有字母都应具有相同的大小写，并根据具体情况使用适当的大小写。例如，在字段名称的开头，首字母缩略词应全部小写，例如 "httpGet"。用作常量时，所有字母都应为大写，例如 "TCP" 或 "UDP"。
> * 通过名称引用类别 `Foo` 的另一个资源的字段名称应称为 `fooName`。通过 ObjectReference（或其子集）引用类别 `Foo` 的另一个资源的字段名称应称为 `fooRef`。
> * 更一般地说，如果单位和/或类型可能不明确并且未由值或值类型指定，则在字段名称中包含单位和/或类型。
> * 表示名为“fooable”的布尔属性的字段名称应称为 `Fooable`，而不是 `IsFooable`。

### Namespace Names｜名字空间名称

* The name of a namespace must be a
[DNS_LABEL](https://git.k8s.io/design-proposals-archive/architecture/identifiers.md).
* The `kube-` prefix is reserved for Kubernetes system namespaces, e.g. `kube-system` and `kube-public`.
* See
[the namespace docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
for more information.

> * 命名空间的名称必须是 [DNS_LABEL](https://git.k8s.io/design-proposals-archive/architecture/identifiers.md)。
> * `kube-` 前缀是为 Kubernetes 系统命名空间保留的，例如`kube-system` 和 `kube-public`。
> * 有关更多信息，请参阅[命名空间文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)。

## Label, selector, and annotation conventions｜标签、选择器与注解约定

Labels are the domain of users. They are intended to facilitate organization and
management of API resources using attributes that are meaningful to users, as
opposed to meaningful to the system. Think of them as user-created mp3 or email
inbox labels, as opposed to the directory structure used by a program to store
its data. The former enables the user to apply an arbitrary ontology, whereas
the latter is implementation-centric and inflexible. Users will use labels to
select resources to operate on, display label values in CLI/UI columns, etc.
Users should always retain full power and flexibility over the label schemas
they apply to labels in their namespaces.

> 标签是用户的领域。它们旨在使用对用户有意义的属性（而不是对系统有意义）来促进 API 资源的组织和管理。将它们视为用户创建的 mp3 或电子邮件收件箱标签，而不是程序用于存储其数据的目录结构。前者使用户能够应用任意本体，而后者以实现为中心并且不灵活。用户将使用标签来选择要操作的资源、在 CLI/UI 列中显示标签值等。用户应始终对应用于其命名空间中的标签的标签架构保留全部功能和灵活性。

However, we should support conveniences for common cases by default. For
example, what we now do in ReplicationController is automatically set the RC's
selector and labels to the labels in the pod template by default, if they are
not already set. That ensures that the selector will match the template, and
that the RC can be managed using the same labels as the pods it creates. Note
that once we generalize selectors, it won't necessarily be possible to
unambiguously generate labels that match an arbitrary selector.

> 但是，我们应该默认支持常见情况的便利性。例如，我们现在在 ReplicationController 中所做的就是默认情况下自动将 RC 的选择器和标签设置为 pod 模板中的标签（如果尚未设置）。这确保了选择器将与模板匹配，并且可以使用与其创建的 Pod 相同的标签来管理 RC。请注意，一旦我们概括了选择器，就不一定能够明确地生成与任意选择器匹配的标签。

If the user wants to apply additional labels to the pods that it doesn't select
upon, such as to facilitate adoption of pods or in the expectation that some
label values will change, they can set the selector to a subset of the pod
labels. Similarly, the RC's labels could be initialized to a subset of the pod
template's labels, or could include additional/different labels.

> 如果用户想要将其他标签应用于未选择的 Pod，例如为了促进 Pod 的采用或期望某些标签值会发生变化，他们可以将选择器设置为 Pod 标签的子集。类似地，RC 的标签可以初始化为 Pod 模板标签的子集，或者可以包括附加/不同的标签。

For disciplined users managing resources within their own namespaces, it's not
that hard to consistently apply schemas that ensure uniqueness. One just needs
to ensure that at least one value of some label key in common differs compared
to all other comparable resources. We could/should provide a verification tool
to check that. However, development of conventions similar to the examples in
[Labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) make uniqueness straightforward. Furthermore,
relatively narrowly used namespaces (e.g., per environment, per application) can
be used to reduce the set of resources that could potentially cause overlap.

> 对于在自己的命名空间内管理资源的严格用户来说，一致地应用确保唯一性的模式并不难。只需确保某个共同标签键的至少一个值与所有其他可比资源不同。我们可以/应该提供一个验证工具来检查这一点。然而，与[标签](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)中的示例类似的约定的开发使唯一性变得简单。此外，使用相对狭窄的命名空间（例如，每个环境、每个应用程序）可用于减少可能导致重叠的资源集。

In cases where users could be running misc. examples with inconsistent schemas,
or where tooling or components need to programmatically generate new objects to
be selected, there needs to be a straightforward way to generate unique label
sets. A simple way to ensure uniqueness of the set is to ensure uniqueness of a
single label value, such as by using a resource name, uid, resource hash, or
generation number.

> 在用户可能运行杂项的情况下。对于架构不一致的示例，或者工具或组件需要以编程方式生成要选择的新对象的示例，需要有一种简单的方法来生成唯一的标签集。确保集合唯一性的一个简单方法是确保单个标签值的唯一性，例如通过使用资源名称、uid、资源哈希或生成编号。

Problems with uids and hashes, however, include that they have no semantic
meaning to the user, are not memorable nor readily recognizable, and are not
predictable. Lack of predictability obstructs use cases such as creation of a
replication controller from a pod, such as people want to do when exploring the
system, bootstrapping a self-hosted cluster, or deletion and re-creation of a
new RC that adopts the pods of the previous one, such as to rename it.
Generation numbers are more predictable and much clearer, assuming there is a
logical sequence. Fortunately, for deployments that's the case. For jobs, use of
creation timestamps is common internally. Users should always be able to turn
off auto-generation, in order to permit some of the scenarios described above.
Note that auto-generated labels will also become one more field that needs to be
stripped out when cloning a resource, within a namespace, in a new namespace, in
a new cluster, etc., and will need to be ignored around when updating a resource
via patch or read-modify-write sequence.

> 然而，uid 和哈希值的问题包括它们对用户来说没有语义意义、不易记忆、不易识别、并且不可预测。缺乏可预测性会阻碍一些用例，例如从 Pod 创建复制控制器（就像人们在探索系统时想要做的那样）、引导自托管集群，或者删除和重新创建采用前一个 Pod 的新 RC（例如重命名它）。假设存在逻辑顺序，世代数更可预测且更清晰。幸运的是，对于部署来说就是这样。对于作业，创建时间戳的使用在内部很常见。用户应该始终能够关闭自动生成，以便允许上述某些场景。请注意，自动生成的标签也将成为在命名空间、新命名空间、新集群等克隆资源时需要删除的又一个字段，并且在通过修补或读取-修改-写入序列更新资源时需要忽略。

Inclusion of a system prefix in a label key is fairly hostile to UX. A prefix is
only necessary in the case that the user cannot choose the label key, in order
to avoid collisions with user-defined labels. However, I firmly believe that the
user should always be allowed to select the label keys to use on their
resources, so it should always be possible to override default label keys.

> 在标签键中包含系统前缀对用户体验相当不利。只有在用户无法选择标签键的情况下才需要前缀，以避免与用户定义的标签发生冲突。但是，我坚信应该始终允许用户选择要在其资源上使用的标签键，因此应该始终可以覆盖默认标签键。

Therefore, resources supporting auto-generation of unique labels should have a
`uniqueLabelKey` field, so that the user could specify the key if they wanted
to, but if unspecified, it could be set by default, such as to the resource
type, like job, deployment, or replicationController. The value would need to be
at least spatially unique, and perhaps temporally unique in the case of job.

> 因此，支持自动生成唯一标签的资源应该有一个 `uniqueLabelKey` 字段，以便用户可以根据需要指定密钥，但如果未指定，则可以默认设置，例如资源类型，如 job、deployment 或replicationController。该值至少需要在空间上是唯一的，对于工作来说，也许在时间上是唯一的。

Annotations have very different intended usage from labels. They are
primarily generated and consumed by tooling and system extensions, or are used
by end-users to engage non-standard behavior of components.  For example, an
annotation might be used to indicate that an instance of a resource expects
additional handling by non-kubernetes controllers. Annotations may carry
arbitrary payloads, including JSON documents.  Like labels, annotation keys can
be prefixed with a governing domain (e.g. `example.com/key-name`).  Unprefixed
keys (e.g. `key-name`) are reserved for end-users.  Third-party components must
use prefixed keys.  Key prefixes under the "kubernetes.io" and "k8s.io" domains
are reserved for use by the kubernetes project and must not be used by
third-parties.

> 注释的预期用途与标签有很大不同。它们主要由工具和系统扩展生成和使用，或者由最终用户用来参与组件的非标准行为。例如，注释可用于指示资源实例需要非 kubernetes 控制器进行额外处理。注释可以携带任意负载，包括 JSON 文档。与标签一样，注释键可以以管理域为前缀（例如 `example.com/key-name`）。无前缀密钥（例如 `key-name`）是为最终用户保留的。第三方组件必须使用前缀键。"kubernetes.io" 和 "k8s.io" 域下的关键前缀保留供 kubernetes 项目使用，第三方不得使用。

In early versions of Kubernetes, some in-development features represented new
API fields as annotations, generally with the form `something.alpha.kubernetes.io/name` or
`something.beta.kubernetes.io/name` (depending on our confidence in it). This
pattern is deprecated.  Some such annotations may still exist, but no new
annotations may be defined.  New API fields are now developed as regular fields.

> 在 Kubernetes 的早期版本中，一些正在开发的功能将新的 API 字段表示为注释，通常采用 `something.alpha.kubernetes.io/name` 或 `something.beta.kubernetes.io/name` 的形式（取决于我们对它的信心）。此模式已被弃用。一些这样的注释可能仍然存在，但不能定义新的注释。新的 API 字段现已作为常规字段开发。

Other advice regarding use of labels, annotations, taints, and other generic map keys by
Kubernetes components and tools:

> 关于 Kubernetes 组件和工具使用标签、注释、污点和其他通用映射键的其他建议：

  - Key names should be all lowercase, with words separated by dashes instead of camelCase
    - For instance, prefer `foo.kubernetes.io/foo-bar` over `foo.kubernetes.io/fooBar`, prefer
    `desired-replicas` over `DesiredReplicas`
  - Unprefixed keys are reserved for end-users.  All other labels and annotations must be prefixed.
  - Key prefixes under "kubernetes.io" and "k8s.io" are reserved for the Kubernetes
    project.
    - Such keys are effectively part of the kubernetes API and may be subject
      to deprecation and compatibility policies.
    - "kubernetes.io" is the preferred form for labels and annotations, "k8s.io" should not be used
      for new map keys.
  - Key names, including prefixes, should be precise enough that a user could
    plausibly understand where it came from and what it is for.
  - Key prefixes should carry as much context as possible.
    - For instance, prefer `subsystem.kubernetes.io/parameter` over `kubernetes.io/subsystem-parameter`
  - Use annotations to store API extensions that the controller responsible for
the resource doesn't need to know about, experimental fields that aren't
intended to be generally used API fields, etc. Beware that annotations aren't
automatically handled by the API conversion machinery.

>   - 键名称应全部小写，单词之间用破折号分隔，而不是驼峰式命名
>     - 例如，优先选择 `foo.kubernetes.io/foo-bar` 而不是 `foo.kubernetes.io/fooBar`，优先选择 `desired-replicas` 而不是 `DesiredReplicas`
>   - 无前缀密钥是为最终用户保留的。所有其他标签和注释都必须带有前缀。
>   - "kubernetes.io" 和 "k8s.io" 下的关键前缀是为 Kubernetes 项目保留的。
>     - 此类密钥实际上是 kubernetes API 的一部分，可能会受到弃用和兼容性政策的约束。
>     - "kubernetes.io" 是标签和注释的首选形式，"k8s.io" 不应用于新的地图键。
>   - 键名（包括前缀）应该足够精确，以便用户可以合理地理解它的来源和用途。
>   - 键前缀应包含尽可能多的上下文。
>     - 例如，首选 `subsystem.kubernetes.io/parameter` 而不是 `kubernetes.io/subsystem-parameter`
>   - 使用注释来存储负责资源的控制器不需要了解的 API 扩展、不打算作为通用 API 字段的实验字段等。请注意，注释不会由 API 转换机制自动处理。

## WebSockets and SPDY｜WebSocket 与 SPDY

Some of the API operations exposed by Kubernetes involve transfer of binary
streams between the client and a container, including attach, exec, portforward,
and logging. The API therefore exposes certain operations over upgradeable HTTP
connections ([described in RFC 2817](https://tools.ietf.org/html/rfc2817)) via
the WebSocket and SPDY protocols. These actions are exposed as subresources with
their associated verbs (exec, log, attach, and portforward) and are requested
via a GET (to support JavaScript in a browser) and POST (semantically accurate).

> Kubernetes 公开的一些 API 操作涉及客户端和容器之间的二进制流传输，包括 Attach、exec、portforward 和日志记录。因此，API 通过 WebSocket 和 SPDY 协议公开可升级 HTTP 连接（[RFC 2817 中描述](https://tools.ietf.org/html/rfc2817)）上的某些操作。这些操作以其关联的动词（exec、log、attach 和 portforward）作为子资源公开，并通过 GET（以支持浏览器中的 JavaScript）和 POST（语义上准确）请求。

There are two primary protocols in use today:

> 目前使用的主要协议有两种：

1.  Streamed channels

    When dealing with multiple independent binary streams of data such as the
remote execution of a shell command (writing to STDIN, reading from STDOUT and
STDERR) or forwarding multiple ports the streams can be multiplexed onto a
single TCP connection. Kubernetes supports a SPDY based framing protocol that
leverages SPDY channels and a WebSocket framing protocol that multiplexes
multiple channels onto the same stream by prefixing each binary chunk with a
byte indicating its channel. The WebSocket protocol supports an optional
subprotocol that handles base64-encoded bytes from the client and returns
base64-encoded bytes from the server and character based channel prefixes ('0',
'1', '2') for ease of use from JavaScript in a browser.

2.  Streaming response

    The default log output for a channel of streaming data is an HTTP Chunked
Transfer-Encoding, which can return an arbitrary stream of binary data from the
server. Browser-based JavaScript is limited in its ability to access the raw
data from a chunked response, especially when very large amounts of logs are
returned, and in future API calls it may be desirable to transfer large files.
The streaming API endpoints support an optional WebSocket upgrade that provides
a unidirectional channel from the server to the client and chunks data as binary
WebSocket frames. An optional WebSocket subprotocol is exposed that base64
encodes the stream before returning it to the client.

> 1. 流式通道当处理多个独立的二进制数据流时，例如远程执行 shell 命令（写入 STDIN、从 STDOUT 和 STDERR 读取）或转发多个端口，流可以多路复用到单个 TCP 连接上。Kubernetes 支持基于 SPDY 的成帧协议，该协议利用 SPDY 通道和 WebSocket 成帧协议，该协议通过在每个二进制块前添加一个指示其通道的字节来将多个通道复用到同一个流上。WebSocket 协议支持可选的子协议，该子协议处理来自客户端的 Base64 编码字节，并从服务器返回 Base64 编码字节和基于字符的通道前缀（“0”、“1”、“2”），以便于在浏览器中的 JavaScript 中使用。
> 2. 流响应流数据通道的默认日志输出是 HTTP 分块传输编码，它可以从服务器返回任意二进制数据流。基于浏览器的 JavaScript 在从分块响应访问原始数据的能力方面受到限制，特别是当返回大量日志时，并且在将来的 API 调用中可能需要传输大文件。流 API 端点支持可选的 WebSocket 升级，该升级提供从服务器到客户端的单向通道，并将数据块作为二进制 WebSocket 帧。公开了一个可选的 WebSocket 子协议，该子协议在将流返回给客户端之前对流进行 base64 编码。

Clients should use the SPDY protocols if their clients have native support, or
WebSockets as a fallback. Note that WebSockets is susceptible to Head-of-Line
blocking and so clients must read and process each message sequentially. In
the future, an HTTP/2 implementation will be exposed that deprecates SPDY.

> 如果客户端有本机支持，则客户端应使用 SPDY 协议，或使用 WebSockets 作为后备。请注意，WebSockets 容易受到队头阻塞的影响，因此客户端必须按顺序读取和处理每条消息。将来，将公开弃用 SPDY 的 HTTP/2 实现。

## Validation｜校验

API objects are validated upon receipt by the apiserver. Validation errors are
flagged and returned to the caller in a `Failure` status with `reason` set to
`Invalid`. In order to facilitate consistent error messages, we ask that
validation logic adheres to the following guidelines whenever possible (though
exceptional cases will exist).

> API 对象在 api 服务器收到后进行验证。验证错误被标记并以 `Failure` 状态返回给调用者，其中 `reason` 设置为 `Invalid`。为了促进一致的错误消息，我们要求验证逻辑尽可能遵守以下准则（尽管会存在例外情况）。

* Be as precise as possible.
* Telling users what they CAN do is more useful than telling them what they
CANNOT do.
* When asserting a requirement in the positive, use "must".  Examples: "must be
greater than 0", "must match regex '[a-z]+'".  Words like "should" imply that
the assertion is optional, and must be avoided.
* When asserting a formatting requirement in the negative, use "must not".
Example: "must not contain '..'".  Words like "should not" imply that the
assertion is optional, and must be avoided.
* When asserting a behavioral requirement in the negative, use "may not".
Examples: "may not be specified when otherField is empty", "only `name` may be
specified".
* When referencing a literal string value, indicate the literal in
single-quotes. Example: "must not contain '..'".
* When referencing another field name, indicate the name in back-quotes.
Example: "must be greater than \`request\`".
* When specifying inequalities, use words rather than symbols.  Examples: "must
be less than 256", "must be greater than or equal to 0".  Do not use words
like "larger than", "bigger than", "more than", "higher than", etc.
* When specifying numeric ranges, use inclusive ranges when possible.

> * 尽可能精确。
> * 告诉用户他们可以做什么比告诉他们不能做什么更有用。
> * 当肯定要求时，请使用 "must"。示例：“必须大于 0”、“必须匹配正则表达式 '[a-z]+'”。像 "should" 这样的词意味着断言是可选的，必须避免。
> * 当以否定方式断言格式要求时，请使用“不得”。示例：“不得包含 '..'”。像“不应该”这样的词意味着该断言是可选的，并且必须避免。
> * 当以否定的方式断言行为要求时，请使用“可能不会”。示例：“当 otherField 为空时不能指定”、“只能指定 `name`”。
> * 引用文字字符串值时，请用单引号指明文字。示例：“不得包含 '..'”。
> * 引用其他字段名称时，请用反引号指明该名称。示例：“必须大于 \`request\`”。
> * 指定不等式时，请使用文字而不是符号。示例：“必须小于 256”、“必须大于或等于 0”。请勿使用“大于”、“大于”、“超过”、“高于”等词语。
> * 指定数值范围时，请尽可能使用包含范围。

## Automatic Resource Allocation And Deallocation｜资源的自动分配与释放

API objects often are [union](#Unions) object containing the following:

> API 对象通常是包含以下内容的 [union](#Unions) 对象：

1. One or more fields identifying the `Type` specific to API object (aka the `discriminator`).
2. A set of N fields, only one of which should be set at any given time - effectively a union.

> 1. 标识特定于 API 对象的 `Type`（又名 `discriminator`）的一个或多个字段。
> 2. 一组 N 个字段，在任何给定时间只应设置其中一个字段——实际上是一个并集。

Controllers operating on the API type often allocate resources based on
the `Type` and/or some additional data provided by user. A canonical example
of this is the `Service` API object where resources such as IPs and network ports
will be set in the API object based on `Type`. When the user does not specify
resources, they will be allocated, and when the user specifies exact value, they will
be reserved or rejected.

> 在 API 类型上操作的控制器通常根据 `Type` 和/或用户提供的一些附加数据来分配资源。一个典型的例子是 `Service` API 对象，其中 IP 和网络端口等资源将在基于 `Type` 的 API 对象中设置。当用户没有指定资源时，它们将被分配，而当用户指定确切值时，它们将被保留或拒绝。

When the user chooses to change the `discriminator` value (e.g., from `Type X` to `Type Y`) without
changing any other fields then the system should clear the fields that were used to represent `Type X`
in the union along with releasing resources that were attached to `Type X`. This should automatically
happen irrespective of how these values and resources were allocated (i.e., reserved by the user or
automatically allocated by the system. A concrete example of this is again `Service` API. The system
allocates resources such as `NodePorts` and `ClusterIPs` and automatically fill in the fields that
represent them in case of the service is of type `NodePort` or `ClusterIP` (`discriminator` values).
These resources and the fields representing them are automatically cleared when  the users changes
service type to `ExternalName` where these resources and field values no longer apply.

> 当用户选择更改 `discriminator` 值（例如，从 `Type X` 更改为 `Type Y`）而不更改任何其他字段时，系统应清除联合中用于表示 `Type X` 的字段，并释放附加到 `Type X` 的资源。无论这些值和资源如何分配（即，由用户保留或由系统自动分配），这都应该自动发生。具体的示例还是 `Service` API。系统分配 `NodePorts` 和 `ClusterIPs` 等资源，并在服务类型为 `NodePort` 或 `ClusterIP` 的情况下自动填充表示它们的字段（`discriminator` 值）。当用户将服务类型更改为 `ExternalName` 时，这些资源和表示它们的字段将自动清除，其中这些资源和字段值不再适用。

## Representing Allocated Values｜表示已分配的值

Many API types include values that are allocated on behalf of the user from
some larger space (e.g. IP addresses from a range, or storage bucket names).
These allocations are usually driven by controllers asynchronously to the
user's API operations.  Sometimes the user can request a specific value and a
controller must confirm or reject that request.  There are many examples of
this in Kubernetes, and there a handful of patterns used to represent it.

> 许多 API 类型包含代表用户从较大空间分配的值（例如某个范围内的 IP 地址或存储桶名称）。这些分配通常由控制器与用户的 API 操作异步驱动。有时，用户可以请求特定值，并且控制器必须确认或拒绝该请求。Kubernetes 中有很多这样的例子，并且有一些模式用来表示它。

The common theme among all of these is that the system should not trust users
with such fields, and must verify or otherwise confirm such requests before
using them.

> 所有这些的共同主题是系统不应信任具有此类字段的用户，并且必须在使用此类请求之前验证或以其他方式确认此类请求。

Some examples:

> 一些例子：

* Service `clusterIP`: Users may request a specific IP in `spec` or will be
  allocated one (in the same `spec` field).  If a specific IP is requested, the
  apiserver will either confirm that IP is available or, failing that, will
  reject the API operation synchronously (rare).  Consumers read the result
  from `spec`.  This is safe because the value is either valid or it is never
  stored.
* Service `loadBalancerIP`: Users may request a specific IP in `spec` or will
  be allocated one which is reported in `status`.  If a specific IP is
  requested, the LB controller will either ensure that IP is available or
  report failure asynchronously.  Consumers read the result from `status`.
  This is safe because most users do not have acces to write to `status`.
* PersistentVolumeClaims: Users may request a specific PersistentVolume in
  `spec` or will be allocated one (in the same `spec` field).  If a specific PV
  is requested, the volume controller will either ensure that the volume is
  available or report failure asynchronously.  Consumers read the result by
  examining both the PVC and the PV.  This is more complicated than the others
  because the `spec` value is stored before being confirmed, which could
  (hypothetically, thanks to extra checking) lead to a user accessing someone
  else's PV.
* VolumeSnapshots: Users may request a particular source to be snaphotted in
  `spec`.  The details of the resulting snapshot is reflected in `status`.

> * 服务 `clusterIP`：用户可以请求 `spec` 中的特定 IP，或者将被分配一个（在同一 `spec` 字段中）。如果请求特定的 IP，apiserver 将确认 IP 可用，或者如果失败，将同步拒绝 API 操作（罕见）。消费者从 `spec` 读取结果。这是安全的，因为该值要么有效，要么从不存储。
> * 服务 `loadBalancerIP`：用户可以请求 `spec` 中的特定 IP，或者将被分配 `status` 中报告的 IP。如果请求特定的 IP，LB 控制器将确保 IP 可用或异步报告失败。消费者从 `status` 读取结果。这是安全的，因为大多数用户没有写入 `status` 的权限。
> * PersistentVolumeClaims：用户可以在 `spec` 中请求特定的 PersistentVolume，或者将被分配一个（在同一 `spec` 字段中）。如果请求特定的 PV，卷控制器将确保卷可用或异步报告故障。消费者通过检查 PVC 和 PV 来读取结果。这比其他值更复杂，因为 `spec` 值在确认之前就已存储，这可能（假设，由于额外检查）导致用户访问其他人的 PV。
> * VolumeSnapshots：用户可以请求在 `spec` 中对特定源进行快照。生成的快照的详细信息反映在 `status` 中。

A counter-example:

> 一个反例：

* Service `externalIPs`: Users must specify one or more specific IPs in `spec`.
  The system cannot easily verify those IPs (by their definition, they are
  external). Consumers read the result from `spec`.  This is UNSAFE and has
  caused problems with untrusted users.

> * 服务`externalIPs`：用户必须在`spec`中指定一个或多个特定IP。系统无法轻松验证这些 IP（根据其定义，它们是外部 IP）。消费者从 `spec` 读取结果。这是不安全的，并且给不受信任的用户带来了问题。

In the past, API conventions dictated that `status` fields always come from
observation, which made some of these cases more complicated than necessary.
The conventions have been updated to allow `status` to hold such allocated
values.  This is not a one-size-fits-all solution, though.

> 过去，API 约定规定 `status` 字段始终来自观察，这使得其中一些情况变得不必要的复杂。约定已更新，以允许 `status` 保存此类分配的值。但这并不是一种一刀切的解决方案。

### When to use a `spec` field｜何时使用 `spec` 字段

New APIs should almost never do this.  Instead, they should use `status`.
PersistentVolumes might have been simpler if we had done this.

> 新的 API 几乎不应该这样做。相反，他们应该使用 `status`。如果我们这样做的话，PersistentVolumes 可能会更简单。

### When to use a `status` field｜何时使用 `status` 字段

Storing such values in `status` is the easiest and most straight-forward
pattern.  This is appropriate when:

> 将这些值存储在 `status` 中是最简单、最直接的模式。这适用于以下情况：

* the allocated value is highly coupled to the rest of the object (e.g. pod
  resource allocations)
* the allocated value is always or almost always needed (i.e. most instances of
  this type will have a value)
* the schema and controller are known a priori (i.e. it's not an extension)
* it is "safe" to allow the controller(s) to write to `status` (i.e.
  there's low risk of them causing problems via other `status` fields).

> * 分配的值与对象的其余部分高度耦合（例如 pod 资源分配）
> * 分配的值总是或几乎总是需要的（即这种类型的大多数实例都会有一个值）
> * 模式和控制器是先验已知的（即它不是扩展）
> * "safe" 允许控制器写入 `status`（即它们通过其他 `status` 字段引起问题的风险很低）。

Consumers of such values can look at the `status` field for the "final" value
or an error or condition indicating why the allocation could not be performed.

> 此类值的使用者可以查看 `status` 字段中的 "final" 值或指示无法执行分配的原因的错误或条件。

#### Sequencing operations｜操作顺序

Since almost everything is happening asynchronously to almost everything else,
controller implementations should take care around the ordering of operations.
For example, whether the controller updates a `status` field before or after it
actuates a change depends on what guarantees need to be made to observers of
the system.  In some cases, writing to a `status` field represents an
acknowledgement or acceptance of a `spec` value, and it is OK to write it before
actuation.  However, if it would be problematic for a client to observe the
`status` value before it is actuated then the controller must actuate first and
update `status` afterward.  In some rarer cases, controllers will need to
acknowledge, then actuate, then update to a "final" value.

> 由于几乎所有事情都与其他几乎所有事情异步发生，因此控制器实现应该注意操作的顺序。例如，控制器是否在启动更改之前或之后更新 `status` 字段取决于需要向系统观察者做出哪些保证。在某些情况下，写入 `status` 字段表示对 `spec` 值的确认或接受，并且可以在启动之前写入它。但是，如果客户端在启动之前观察 `status` 值会出现问题，则控制器必须首先启动并随后更新 `status`。在某些罕见的情况下，控制器需要确认、启动，然后更新为 "final" 值。

Controllers must take care to consider how a `status` field will be handled in
the case of interrupted control loops (e.g. controller crash and restart), and
must act idempotently and consistently.  This is particularly important when
using an informer-fed cache, which might not be updated with recent writes.
Using a resourceVersion precondition to detect the "conflict" is the common
pattern in this case.  See [this issue](http://issue.k8s.io/105199) for an
example.

> 控制器必须注意考虑在控制循环中断（例如控制器崩溃和重新启动）的情况下如何处理 `status` 字段，并且必须以幂等且一致的方式进行操作。当使用通知者提供的缓存时，这一点尤其重要，因为该缓存可能不会随着最近的写入而更新。在这种情况下，使用资源版本前提条件来检测 "conflict" 是常见模式。有关示例，请参阅[此问题](http://issue.k8s.io/105199)。

### When to use a different type｜何时使用不同类型

Storing allocated values in a different type is more complicated but also more
flexible.  This is most appropriate when:

> 以不同类型存储分配的值更复杂，但也更灵活。在以下情况下这是最合适的：

* the allocated value is optional (i.e. many instances of this type will not
  have a value at all)
* the schema and controller are not known a priori (i.e. it's an extension)
* the schema is sufficiently complicated (i.e. it doesn't make sense to burden
  the main type with it)
* access control for this type demands finer granularity than "all of status"
* the lifecycle of the allocated value is different than the lifecycle of the
  allocation holder

> * 分配的值是可选的（即这种类型的许多实例根本没有值）
> * 模式和控制器是先验未知的（即它是一个扩展）
> * 模式足够复杂（即，用它来增加主要类型的负担是没有意义的）
> * 这种类型的访问控制需要比“所有状态”更细的粒度
> * 分配值的生命周期与分配持有者的生命周期不同

Services and Endpoints could be considered a form of this pattern, as could
PersistentVolumes and PersistentVolumeClaims.

> 服务和端点可以被认为是这种模式的一种形式，持久卷和持久卷声明也可以。

When using this pattern, you must account for lifecycle of the allocated
objects (who cleans them up and when) as well as the "linkage" between them and
the main type (often using the same name, an object-ref field, or a selector).

> 使用此模式时，您必须考虑已分配对象的生命周期（谁清理它们以及何时清理它们）以及它们与主类型之间的 "linkage"（通常使用相同的名称、对象引用字段或选择器）。

There will always be some cases which could follow either path, and these will
need human evaluation to decide.  For example, Service `clusterIP` is highly
coupled to the rest of Service and most instances use it.  But it also is
strictly optional and has an increasingly complicated schema of related fields.
An argument could be made for either path.

> 总会有一些情况可能遵循任一路径，这些需要人工评估来决定。例如，服务 `clusterIP` 与服务的其余部分高度耦合，并且大多数实例都使用它。但它也是严格可选的，并且相关领域的模式越来越复杂。对于任何一条路径都可以进行论证。
