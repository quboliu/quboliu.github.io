---
lang: "zh-CN"
pubDatetime: 2025-12-28T10:00:00+08:00
modDatetime: 2026-08-11T20:32:10+08:00
timezone: "Asia/Shanghai"
title: "官方博客 | V2 Disk Size Aggregation｜Longhorn V2 磁盘容量聚合（中英对照）"
contentType: "docs-translation"
featured: false
area: "storage-systems"
draft: false
tags:
  - "官方博客"
  - "Longhorn"
  - "V2 Data Engine"
  - "分布式块存储"
  - "SPDK"
  - "Linux RAID"
  - "性能测试"
description: "Longhorn 官方博客全文中英对照：比较 SPDK RAID 0、SPDK Concat 与 Linux 内核 RAID 的容量、性能和运维取舍，并给出创建、移除和基准测试数据。"
---
> **Source and translation basis｜来源与翻译依据**
>
> David Cheng, *V2 Disk Size Aggregation*, December 23, 2025. [Official article](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/) and [Markdown source](https://github.com/longhorn/website/blob/e9f821921fdb464d2b055ccc91c7c62e356ab959/content/blog/20251223-v2-disk-size-aggregation.md), frozen at `longhorn/website` commit [`e9f821921fdb`](https://github.com/longhorn/website/commit/e9f821921fdb464d2b055ccc91c7c62e356ab959). The source Markdown SHA-256 is `3f23ca19dc05e2f4a300f7de3206e1e4ff3ed35f93ac681ccac6af55fb062506`.
>
> 本文按 Longhorn 官网 Markdown 源文件的顺序保留全部英文，并紧接着给出中文翻译。原文没有位图，3 幅结构图均为字符图。表格、命令、测试参数和数值全部保留。除开头的来源说明和文末明确标出的版本核对外，没有增删正文内容。文中的磁盘清理命令只按原文收录，并未执行。

**V2 Disk Size Aggregation**

> **Longhorn V2 磁盘容量聚合**

David Cheng | December 23, 2025

> David Cheng｜2025 年 12 月 23 日

## Table of contents｜目录

- [Introduction](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#introduction)
- [Disk Size Aggregation Overview](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#disk-size-aggregation-overview)
- [Why Longhorn Chooses Linux RAID Over SPDK RAID (For Now)](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#why-longhorn-chooses-linux-raid-over-spdk-raid-for-now)
  - [SPDK RAID 0 – Capacity Waste](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#spdk-raid-0-capacity-waste)
  - [SPDK Concat – Capacity Good, Performance Flat](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#spdk-concat-capacity-good-performance-flat)
  - [Linux Kernel RAID 0 – Best Practical Balance](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#linux-kernel-raid-0-best-practical-balance)
  - [Comparison Table](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#comparison-table)
- [Create an Aggregated Disk Using Linux Kernel RAID](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#create-an-aggregated-disk-using-linux-kernel-raid)
  - [Create Aggregated Disk](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#create-aggregated-disk)
  - [Remove an Aggregated Disk](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#remove-an-aggregated-disk)
- [Benchmark Result](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#benchmark-result)
  - [1-Replica Volume](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#1-replica-volume)
  - [3-Replica Volume](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#3-replica-volume)
- [Conclusion](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#conclusion)
- [Future Direction](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#future-direction)

> - [简介](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#introduction)
> - [磁盘容量聚合概览](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#disk-size-aggregation-overview)
> - [Longhorn 为什么选择 Linux RAID，而不是 SPDK RAID（目前）](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#why-longhorn-chooses-linux-raid-over-spdk-raid-for-now)
>   - [SPDK RAID 0——浪费容量](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#spdk-raid-0-capacity-waste)
>   - [SPDK Concat——容量利用充分，性能没有增长](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#spdk-concat-capacity-good-performance-flat)
>   - [Linux 内核 RAID 0——实际使用中的最佳平衡](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#linux-kernel-raid-0-best-practical-balance)
>   - [对比表](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#comparison-table)
> - [用 Linux 内核 RAID 创建聚合磁盘](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#create-an-aggregated-disk-using-linux-kernel-raid)
>   - [创建聚合磁盘](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#create-aggregated-disk)
>   - [移除聚合磁盘](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#remove-an-aggregated-disk)
> - [基准测试结果](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#benchmark-result)
>   - [单副本卷](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#1-replica-volume)
>   - [三副本卷](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#3-replica-volume)
> - [结论](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#conclusion)
> - [未来方向](https://longhorn.io/blog/20251223-v2-disk-size-aggregation/#future-direction)

## Introduction｜简介

This article is intended for Kubernetes administrators and system engineers running **Longhorn v2** on nodes with multiple local disks who want to aggregate disk capacity or improve I/O performance. It explains the available disk aggregation options, their trade-offs, and why Linux Kernel RAID is currently the recommended approach.

> 本文面向在带有多块本地磁盘的节点上运行 **Longhorn v2**，并希望聚合磁盘容量或提高 I/O 性能的 Kubernetes 管理员和系统工程师。文章会介绍现有的磁盘聚合方式及其取舍，并说明为什么目前推荐使用 Linux 内核 RAID。

## Disk Size Aggregation Overview｜磁盘容量聚合概览

Modern Kubernetes nodes often include multiple local disks—NVMe, SSD, or HDD—that users want to combine into a single larger storage unit. Longhorn supports using aggregated block devices as storage backends, but the aggregation itself must be created by the user on the host node before Longhorn consumes it.

> 现代 Kubernetes 节点通常带有多块本地磁盘，例如 NVMe、SSD 或 HDD。用户希望把它们合成一个更大的存储单元。Longhorn 支持把聚合后的块设备用作存储后端，但在 Longhorn 使用它之前，用户必须先在宿主节点上完成聚合。

Currently, the recommended way to aggregate disks for Longhorn v2 is to use **Linux Kernel RAID** (`mdadm`). Although SPDK provides RAID and concat capabilities, their current limitations make kernel RAID the more practical choice. This article explains how to create and remove aggregated disks and, more importantly, why Longhorn does not introduce a built-in SPDK RAID layer at this time.

> 目前，为 Longhorn v2 聚合磁盘的推荐方式是使用 **Linux 内核 RAID**（`mdadm`）。SPDK 虽然提供 RAID 和 concat 功能，但它们目前的限制使内核 RAID 成为更实用的选择。本文会说明怎样创建和移除聚合磁盘，更重要的是，还会解释 Longhorn 为什么暂时没有引入内置的 SPDK RAID 层。

## Why Longhorn Chooses Linux RAID Over SPDK RAID (For Now)｜Longhorn 为什么选择 Linux RAID，而不是 SPDK RAID（目前）

Longhorn v2 uses a fully SPDK-based data engine. At first glance, building disk aggregation on top of SPDK RAID appears intuitive. However, after evaluating **SPDK RAID 0** and **SPDK Concat**, several drawbacks prevent them from being adopted as the default aggregation layer for Longhorn v2 today.

> Longhorn v2 使用完全基于 SPDK 的数据引擎。乍看之下，在 SPDK RAID 上构建磁盘聚合很自然。不过，在评估 **SPDK RAID 0** 和 **SPDK Concat** 后，我们发现它们有几项缺点，因此目前还不能把它们用作 Longhorn v2 的默认聚合层。

The observations below are based on internal testing.

> 下面的观察结果来自内部测试。

### SPDK RAID 0 - Capacity Waste｜SPDK RAID 0——浪费容量

SPDK RAID 0 requires all member disks to operate at the size of the smallest disk in the array. For example:

> SPDK RAID 0 要求所有成员磁盘都按阵列中最小磁盘的容量工作。例如：

| Disk | Size |
| --- | --- |
| nvme1 | 50Gi |
| nvme2 | 100Gi |
| nvme3 | 100Gi |

| 磁盘 | 容量 |
| --- | --- |
| nvme1 | 50Gi |
| nvme2 | 100Gi |
| nvme3 | 100Gi |

The usable capacity of this SPDK RAID 0 array is: `3 × 50Gi = 150Gi`.

> 这个 SPDK RAID 0 阵列的可用容量是：`3 × 50Gi = 150Gi`。

The remaining capacity on the larger disks is unused because SPDK RAID 0 truncates all members to the smallest size. This behavior makes SPDK RAID 0 impractical for environments with disks of mixed sizes, which is common on bare-metal and cloud instances. Linux RAID 0 does not impose this limitation.

> 较大磁盘的剩余容量无法使用，因为 SPDK RAID 0 会把所有成员截断到最小磁盘的容量。这使 SPDK RAID 0 不适合混用不同容量磁盘的环境，而这种情况在裸机和云实例中很常见。Linux RAID 0 没有这一限制。

From a performance perspective, SPDK RAID 0 behaves as expected:

> 从性能上看，SPDK RAID 0 的表现符合预期：

- Striping works correctly and IOPS scale with disk count
- Sequential throughput increases with additional disks
- No severe latency penalties are observed

> - 条带化工作正常，IOPS 随磁盘数量增长
> - 增加磁盘后，顺序吞吐量随之提高
> - 没有观察到严重的延迟损失

However, achieving optimal performance typically requires:

> 不过，要获得最佳性能，通常需要：

- Explicit CPU core pinning
- Stripe size tuning

> - 明确绑定 CPU 核心
> - 调整条带大小

Without careful tuning, SPDK RAID 0 often provides limited advantages over Linux RAID 0. Given Longhorn’s focus on operational simplicity, requiring users to manually tune SPDK internals is not desirable.

> 如果不仔细调优，SPDK RAID 0 相比 Linux RAID 0 往往没有多少优势。Longhorn 注重运维简单，因此不希望要求用户手动调整 SPDK 内部参数。

#### Structure Diagram｜结构图

```text
LVS
└── SPDK RAID 0
    ├── Bdev nvme
    │   └── /dev/nvme1
    ├── Bdev nvme
    │   └── /dev/nvme2
    └── Bdev nvme
        └── /dev/nvme3
```

> ```text
> LVS
> └── SPDK RAID 0
>     ├── Bdev nvme
>     │   └── /dev/nvme1
>     ├── Bdev nvme
>     │   └── /dev/nvme2
>     └── Bdev nvme
>         └── /dev/nvme3
> ```

### SPDK Concat - Capacity Good, Performance Flat｜SPDK Concat——容量利用充分，性能没有增长

SPDK Concat mode:

- Preserves the full capacity of all disks
- Does not provide I/O parallelism
- Does not improve bandwidth or IOPS
- Uses a simple linear data layout

> SPDK Concat 模式：
>
> - 保留所有磁盘的全部容量
> - 不提供 I/O 并行能力
> - 不提高带宽或 IOPS
> - 使用简单的线性数据布局

Because Concat does not interleave I/O across disks, it behaves similarly to a single raw device. Although Concat does not stripe data like Linux RAID 0, the stripe size still affects I/O behavior. Internally, the RAID bdev layer uses the stripe size as an `optimal_io_boundary` and enables `split_on_optimal_io_boundary`. Large sequential I/O may be split into smaller requests before reaching the RAID module. If the stripe size is too small (for example, 4K), this excessive splitting can severely reduce sequential throughput without providing any parallelism.

> Concat 不会让 I/O 交错分布到多块磁盘上，因此它的表现与单个裸设备相似。Concat 虽然不像 Linux RAID 0 那样对数据做条带化，条带大小仍会影响 I/O 行为。在内部，RAID bdev 层把条带大小用作 `optimal_io_boundary`，并启用 `split_on_optimal_io_boundary`。较大的顺序 I/O 在到达 RAID 模块前，可能被拆成更小的请求。如果条带大小过小，例如 4K，这种过度拆分会严重降低顺序吞吐量，却不会带来任何并行能力。

In contrast, Linux RAID 0 stripes data across all disks and processes I/O in parallel, allowing both sequential and random workloads to scale with disk count. SPDK Concat performs like a single large linear device, serving I/O sequentially within each disk region, without any concurrency or bandwidth aggregation.

> 相比之下，Linux RAID 0 会把数据条带化到所有磁盘上，并行处理 I/O，因此顺序和随机工作负载都能随磁盘数量扩展。SPDK Concat 的表现更像一个大型线性设备：它在每块磁盘对应的区域内依次处理 I/O，没有并发，也没有带宽聚合。

#### Structure Diagram｜结构图

```text
LVS
└── SPDK Concat
    ├── Bdev nvme
    │   └── /dev/nvme1
    ├── Bdev nvme
    │   └── /dev/nvme2
    └── Bdev nvme
        └── /dev/nvme3
```

> ```text
> LVS
> └── SPDK Concat
>     ├── Bdev nvme
>     │   └── /dev/nvme1
>     ├── Bdev nvme
>     │   └── /dev/nvme2
>     └── Bdev nvme
>         └── /dev/nvme3
> ```

### Linux Kernel RAID 0 - Best Practical Balance｜Linux 内核 RAID 0——实际使用中的最佳平衡

Linux Kernel RAID 0 provides:

> Linux 内核 RAID 0 提供：

- Good sequential throughput
- Good random IOPS
- Predictable latency
- Full capacity utilization, even with mixed disk sizes
- A mature ecosystem with proven tooling and recovery workflows

> - 良好的顺序吞吐量
> - 良好的随机 IOPS
> - 可预测的延迟
> - 即使混用不同容量的磁盘，也能充分利用容量
> - 成熟的生态，以及经过验证的工具和恢复流程

It meets Longhorn’s requirements without introducing additional complexity or performance regressions.

> 它能满足 Longhorn 的要求，又不会引入额外复杂性或性能下降。

#### Structure Diagram｜结构图

```text
LVS
└── Bdev aio
    └── Linux Kernel RAID 0 (mdadm)
        ├── /dev/nvme1
        ├── /dev/nvme2
        └── /dev/nvme3
```

> ```text
> LVS
> └── Bdev aio
>     └── Linux 内核 RAID 0（mdadm）
>         ├── /dev/nvme1
>         ├── /dev/nvme2
>         └── /dev/nvme3
> ```

### Comparison Table｜对比表

| Category | **SPDK RAID 0** | **SPDK Concat** | **Linux RAID 0** |
| --- | --- | --- | --- |
| **Capacity Behavior** | Limited by smallest disk; wastes capacity with mixed sizes | Uses full capacity | Uses full capacity |
| **Sequential Throughput** | Very high (striping) | Same as a single disk | Very high (striping) |
| **Random IOPS** | Scales with number of disks | Same as a single disk | Scales with number of disks |
| **Latency** | Low | Low | Slightly higher but still low |
| **Performance Tuning** | CPU pinning and stripe-size tuning often needed | No tuning | No tuning |
| **Recovery and Tooling** | Limited ecosystem | Limited | Excellent tooling (`mdadm`, recovery workflows) |
| **Suitability for Mixed Disk Sizes** | Poor | Good | Good |
| **Kernel or Userspace** | Userspace (SPDK) | Userspace (SPDK) | Kernel native |
| **Integration with Longhorn** | Requires SPDK-level configuration | Requires SPDK-level configuration | Works out of the box as a block device |
| **Overall Recommendation (2025)** | Not recommended | Not recommended for performance | Recommended |

| 类别 | **SPDK RAID 0** | **SPDK Concat** | **Linux RAID 0** |
| --- | --- | --- | --- |
| **容量表现** | 受最小磁盘限制；混用不同容量时会浪费空间 | 使用全部容量 | 使用全部容量 |
| **顺序吞吐量** | 很高（条带化） | 与单盘相同 | 很高（条带化） |
| **随机 IOPS** | 随磁盘数量扩展 | 与单盘相同 | 随磁盘数量扩展 |
| **延迟** | 低 | 低 | 略高，但仍然很低 |
| **性能调优** | 经常需要绑定 CPU 和调整条带大小 | 无需调优 | 无需调优 |
| **恢复与工具** | 生态有限 | 有限 | 工具完善（`mdadm`、恢复流程） |
| **对不同容量磁盘的适用性** | 差 | 好 | 好 |
| **内核或用户空间** | 用户空间（SPDK） | 用户空间（SPDK） | 内核原生 |
| **与 Longhorn 集成** | 需要 SPDK 层配置 | 需要 SPDK 层配置 | 可直接作为块设备使用 |
| **总体建议（2025 年）** | 不推荐 | 对性能有要求时不推荐 | 推荐 |

### Create an Aggregated Disk Using Linux Kernel RAID｜用 Linux 内核 RAID 创建聚合磁盘

#### Create Aggregated Disk｜创建聚合磁盘

- Install `mdadm` using your system package manager (for example, `sudo apt install mdadm -y` or `sudo yum install mdadm -y`).

> - 使用系统的软件包管理器安装 `mdadm`，例如运行 `sudo apt install mdadm -y` 或 `sudo yum install mdadm -y`。

- Create a RAID 0 array from the desired devices:

> - 用选定的设备创建 RAID 0 阵列：

```bash
sudo mdadm --create /dev/md0 \
    --level=0 \
    --raid-devices=3 \
    /dev/nvme1n1 /dev/nvme2n1 /dev/nvme3n1
```

> ```bash
> sudo mdadm --create /dev/md0 \
>     --level=0 \
>     --raid-devices=3 \
>     /dev/nvme1n1 /dev/nvme2n1 /dev/nvme3n1
> ```

- After the RAID device (for example, `/dev/md0`) is created, add it to the Longhorn cluster through the UI or via `kubectl`. Longhorn accesses this device using the **AIO backend**.

> - RAID 设备（例如 `/dev/md0`）创建后，通过 UI 或 `kubectl` 把它加入 Longhorn 集群。Longhorn 使用 **AIO 后端**访问这个设备。

#### Remove an Aggregated Disk｜移除聚合磁盘

- Remove the aggregated disk from the Longhorn system using the `UI` or `kubectl`.

> - 使用 `UI` 或 `kubectl` 从 Longhorn 系统中移除聚合磁盘。

- Stop the RAID device:

> - 停止 RAID 设备：

```bash
sudo mdadm --stop /dev/md0
```

> ```bash
> sudo mdadm --stop /dev/md0
> ```

- Remove the `mdadm` superblock from each member disk:

> - 从每块成员磁盘中移除 `mdadm` 超级块：

```bash
sudo mdadm --zero-superblock /dev/nvme1n1
sudo mdadm --zero-superblock /dev/nvme2n1
sudo mdadm --zero-superblock /dev/nvme3n1
```

> ```bash
> sudo mdadm --zero-superblock /dev/nvme1n1
> sudo mdadm --zero-superblock /dev/nvme2n1
> sudo mdadm --zero-superblock /dev/nvme3n1
> ```

- Verify that the superblocks have been removed:

> - 确认超级块已经移除：

```bash
sudo mdadm --examine /dev/nvme1n1
sudo mdadm --examine /dev/nvme2n1
sudo mdadm --examine /dev/nvme3n1
```

> ```bash
> sudo mdadm --examine /dev/nvme1n1
> sudo mdadm --examine /dev/nvme2n1
> sudo mdadm --examine /dev/nvme3n1
> ```

Expected output:

> 预期输出：

```text
mdadm: No md superblock detected on /dev/nvme1n1.
mdadm: No md superblock detected on /dev/nvme2n1.
mdadm: No md superblock detected on /dev/nvme3n1.
```

> ```text
> mdadm：在 /dev/nvme1n1 上没有检测到 md 超级块。
> mdadm：在 /dev/nvme2n1 上没有检测到 md 超级块。
> mdadm：在 /dev/nvme3n1 上没有检测到 md 超级块。
> ```

## Benchmark Result｜基准测试结果

This benchmark uses [kbench](https://github.com/longhorn/kbench) to evaluate different aggregation configurations under varying replica counts.

> 本次基准测试使用 [kbench](https://github.com/longhorn/kbench)，评估不同副本数量下的各种聚合配置。

FIO Test Parameters:

> FIO 测试参数：

- Sequential workload
  - bs=128K
  - iodepth=16
  - numjobs=4

> - 顺序工作负载
>   - bs=128K
>   - iodepth=16
>   - numjobs=4

- Random workload
  - bs=4K
  - iodepth=128
  - numjobs=8
  - norandommap=1

> - 随机工作负载
>   - bs=4K
>   - iodepth=128
>   - numjobs=8
>   - norandommap=1

- Common parameters
  - stonewall=1
  - randrepeat=0
  - verify=0
  - ioengine=libaio
  - direct=1
  - time_based=1
  - ramp_time=60s
  - runtime=60s
  - group_reporting=1

> - 通用参数
>   - stonewall=1
>   - randrepeat=0
>   - verify=0
>   - ioengine=libaio
>   - direct=1
>   - time_based=1
>   - ramp_time=60s
>   - runtime=60s
>   - group_reporting=1

Measured metrics:

- Random IOPS (read and write)
- Sequential bandwidth (read and write)
- Random latency (read and write)

> 测量指标：
>
> - 随机 IOPS（读和写）
> - 顺序带宽（读和写）
> - 随机延迟（读和写）

Test environment:

- Three nodes for 3-replica volumes; one node for 1-replica volumes
- Each node contains three disks: 50Gi, 100Gi, and 100Gi
- Instance type: `c5.xlarge`

> 测试环境：
>
> - 三副本卷使用 3 个节点；单副本卷使用 1 个节点
> - 每个节点包含 3 块磁盘：50Gi、100Gi 和 100Gi
> - 实例类型：`c5.xlarge`

> All bandwidth values shown below are measured in KiB/s. Stripe sizes (64K and 512K) indicate the amount of data written to one disk before continuing to the next disk in a RAID 0 array.

> 下面显示的所有带宽值都以 KiB/s 为单位。条带大小（64K 和 512K）表示 RAID 0 阵列在转到下一块磁盘前，先向一块磁盘写入的数据量。

In summary, SPDK RAID 0 delivers strong performance but wastes capacity, SPDK Concat preserves capacity without scaling performance, and Linux RAID 0 provides the most balanced results.

> 总的来说，SPDK RAID 0 性能很强，但会浪费容量；SPDK Concat 能保留全部容量，却无法扩展性能；Linux RAID 0 的结果最均衡。

### 1-Replica Volume｜单副本卷

| Configuration | Random IOPS (Read / Write) | Sequential Bandwidth (Read / Write) KiB/s | Random Latency (Read / Write) ns |
| --- | --- | --- | --- |
| **Baseline (Single Disk)** | 3,001 / 3,525 | 128,222 / 128,225 | 638,322 / 941,680 |
| **SPDK RAID Concat (4K)** | 3,002 / 3,586 | 11,939 / 12,049 | 636,214 / 941,915 |
| **SPDK RAID Concat (64K)** | 3,002 / 3,689 | 128,229 / 128,245 | 642,153 / 951,388 |
| **SPDK RAID 0 (64K)** | 8,985 / 9,005 | 384,820 / 384,785 | 731,702 / 1,042,055 |
| **SPDK RAID 0 (512K)** | 9,004 / 8,981 | 384,643 / 384,513 | 639,568 / 945,823 |
| **mdadm RAID 0 (512K)** | 8,983 / 8,981 | 384,503 / 384,492 | 647,074 / 954,796 |

| 配置 | 随机 IOPS（读／写） | 顺序带宽（读／写）KiB/s | 随机延迟（读／写）ns |
| --- | --- | --- | --- |
| **基线（单盘）** | 3,001 / 3,525 | 128,222 / 128,225 | 638,322 / 941,680 |
| **SPDK RAID Concat (4K)** | 3,002 / 3,586 | 11,939 / 12,049 | 636,214 / 941,915 |
| **SPDK RAID Concat (64K)** | 3,002 / 3,689 | 128,229 / 128,245 | 642,153 / 951,388 |
| **SPDK RAID 0 (64K)** | 8,985 / 9,005 | 384,820 / 384,785 | 731,702 / 1,042,055 |
| **SPDK RAID 0 (512K)** | 9,004 / 8,981 | 384,643 / 384,513 | 639,568 / 945,823 |
| **mdadm RAID 0 (512K)** | 8,983 / 8,981 | 384,503 / 384,492 | 647,074 / 954,796 |

### 3-Replica Volume｜三副本卷

| Configuration | Random IOPS (Read / Write) | Sequential Bandwidth (Read / Write) KiB/s | Random Latency (Read / Write) ns |
| --- | --- | --- | --- |
| **Baseline (Single Disk)** | 9,015 / 3,476 | 384,783 / 128,265 | 637,628 / 1,071,141 |
| **SPDK RAID Concat (4K)** | 9,017 / 3,409 | 36,013 / 12,215 | 642,653 / 1,075,667 |
| **SPDK RAID Concat (64K)** | 9,004 / 3,558 | 384,831 / 128,238 | 646,068 / 1,037,210 |
| **SPDK RAID 0 (64K)** | 26,992 / 8,973 | 1,075,181 / 384,849 | 644,169 / 1,083,213 |
| **SPDK RAID 0 (512K)** | 26,936 / 9,003 | 941,377 / 380,937 | 642,769 / 1,074,282 |
| **mdadm RAID 0 (512K)** | 14,334 / 9,041 | 963,234 / 378,805 | 646,411 / 1,070,201 |

| 配置 | 随机 IOPS（读／写） | 顺序带宽（读／写）KiB/s | 随机延迟（读／写）ns |
| --- | --- | --- | --- |
| **基线（单盘）** | 9,015 / 3,476 | 384,783 / 128,265 | 637,628 / 1,071,141 |
| **SPDK RAID Concat (4K)** | 9,017 / 3,409 | 36,013 / 12,215 | 642,653 / 1,075,667 |
| **SPDK RAID Concat (64K)** | 9,004 / 3,558 | 384,831 / 128,238 | 646,068 / 1,037,210 |
| **SPDK RAID 0 (64K)** | 26,992 / 8,973 | 1,075,181 / 384,849 | 644,169 / 1,083,213 |
| **SPDK RAID 0 (512K)** | 26,936 / 9,003 | 941,377 / 380,937 | 642,769 / 1,074,282 |
| **mdadm RAID 0 (512K)** | 14,334 / 9,041 | 963,234 / 378,805 | 646,411 / 1,070,201 |

> Minor variation is expected due to environmental or network factors.

> 由于环境或网络因素，结果出现小幅波动属于正常情况。

### Analysis｜分析

1. **Single-disk vs. SPDK Concat**
   Single-disk and `SPDK Concat` show similar random I/O performance since each request is served by a single underlying device. Sequential throughput should also be close to a single disk; large drops typically indicate excessive I/O splitting caused by a small configured stripe size, rather than an inherent limitation of Concat.

> 1. **单盘与 SPDK Concat**
>    单盘和 `SPDK Concat` 的随机 I/O 性能相近，因为每个请求都由单个底层设备处理。顺序吞吐量也应该接近单盘；如果大幅下降，通常说明配置的条带大小太小，导致 I/O 被过度拆分，而不是 Concat 本身存在这种限制。

2. **Single-replica volumes**
   For single-replica volumes, Linux Kernel RAID 0 performs similarly to `SPDK RAID 0`, delivering near–RAID 0 throughput without requiring SPDK-specific tuning. Both approaches provide strong sequential bandwidth and scale random IOPS with the number of disks.

> 2. **单副本卷**
>    对单副本卷来说，Linux 内核 RAID 0 的表现与 `SPDK RAID 0` 相近，无需针对 SPDK 做专门调优，就能提供接近 RAID 0 的吞吐量。两种方式都有很高的顺序带宽，随机 IOPS 也都会随磁盘数量扩展。

3. **Multi-replica volumes**
   For multi-replica volumes, `SPDK RAID 0` can outperform Linux Kernel RAID 0 when the stripe size is carefully tuned (for example, 64K). In these scenarios, SPDK’s userspace datapath can reduce overhead and achieve higher sequential throughput under optimal configurations.

> 3. **多副本卷**
>    对多副本卷来说，仔细调整条带大小后（例如设为 64K），`SPDK RAID 0` 的性能可能超过 Linux 内核 RAID 0。在这些场景中，SPDK 的用户空间数据路径可以减少开销，并在最佳配置下获得更高的顺序吞吐量。

Overall, Linux Kernel RAID 0 provides the best balance of capacity utilization, operational simplicity, and predictable performance. In contrast, `SPDK RAID 0` and `SPDK Concat` exhibit limitations that currently prevent them from being recommended as the primary disk aggregation layer for Longhorn v2.

> 总体来看，Linux 内核 RAID 0 在容量利用率、运维简单程度和性能可预测性之间取得了最好的平衡。相比之下，`SPDK RAID 0` 和 `SPDK Concat` 仍有一些限制，因此目前不适合推荐为 Longhorn v2 的主要磁盘聚合层。

## Conclusion｜结论

Longhorn v2 prioritizes stability, predictable performance, and low operational complexity. Although SPDK provides RAID and concat capabilities, several limitations prevent these modes from being adopted as the default disk aggregation solution:

> Longhorn v2 优先考虑稳定性、可预测的性能和较低的运维复杂度。SPDK 虽然提供 RAID 和 concat 功能，但这些模式仍有几项限制，无法作为默认的磁盘聚合方案：

- `SPDK RAID 0` wastes capacity when disk sizes differ.
- `SPDK Concat` preserves capacity but does not provide parallel I/O.
- Optimal `SPDK RAID 0` performance requires advanced tuning, such as CPU pinning and stripe size configuration.
- Linux Kernel RAID 0 is mature, stable, simple to operate, and integrates cleanly with Longhorn.

> - 磁盘容量不同时，`SPDK RAID 0` 会浪费容量。
> - `SPDK Concat` 能保留全部容量，但不提供并行 I/O。
> - 要让 `SPDK RAID 0` 达到最佳性能，需要绑定 CPU、配置条带大小等高级调优。
> - Linux 内核 RAID 0 成熟、稳定、操作简单，也能与 Longhorn 顺利集成。

In practice, users can select the appropriate Linux Kernel RAID level based on their desired balance between performance and data protection:

> 实际使用时，用户可以根据性能与数据保护之间的取舍，选择合适的 Linux 内核 RAID 级别：

- `RAID 0` can be used when maximum performance and capacity utilization are required and data redundancy is handled at the Longhorn replica layer.
- `RAID 5` can be used when additional disk-level fault tolerance is desired, at the cost of some write-performance overhead.

> - 如果需要最高性能和容量利用率，并由 Longhorn 副本层负责数据冗余，可以使用 `RAID 0`。
> - 如果需要额外的磁盘级容错能力，可以使用 `RAID 5`，代价是增加一些写入性能开销。

It is also important to note that with this approach, block-type disks in Longhorn are intentionally exposed using the `AIO` disk driver.

> 还要注意，在这种方案中，Longhorn 会有意使用 `AIO` 磁盘驱动来暴露块类型磁盘。

For these reasons, **Linux Kernel RAID** remains the recommended approach for disk size aggregation in Longhorn v2, offering a flexible choice of RAID levels, proven reliability, and lower operational complexity compared to SPDK-based aggregation.

> 基于这些原因，**Linux 内核 RAID** 仍是 Longhorn v2 磁盘容量聚合的推荐方式。与基于 SPDK 的聚合相比，它可以灵活选择 RAID 级别，可靠性经过验证，运维复杂度也更低。

## Future Direction｜未来方向

Longhorn may consider introducing a built-in RAID layer in the future if the following conditions are met:

> 如果满足以下条件，Longhorn 将来可能会考虑引入内置 RAID 层：

- `SPDK RAID 0` supports heterogeneous disk sizes without capacity loss.
- `SPDK Concat` delivers meaningful performance improvements.
- Linux Kernel RAID becomes insufficient or a bottleneck for workloads requiring higher throughput or lower latency.

> - `SPDK RAID 0` 支持不同容量的磁盘，而且不会损失容量。
> - `SPDK Concat` 能带来有实际意义的性能提升。
> - 对需要更高吞吐量或更低延迟的工作负载来说，Linux 内核 RAID 已经不够用，或者成了瓶颈。

Until then, Linux Kernel RAID continues to offer the best balance of:

> 在此之前，Linux 内核 RAID 仍能在以下方面取得最好的平衡：

- Capacity
- Performance
- Reliability
- Usability

> - 容量
> - 性能
> - 可靠性
> - 易用性

## Version Check, August 2026｜2026 年 8 月版本核对

This note is not part of the original article. When the article was published on December 23, 2025, the current stable Longhorn release was v1.10.1, whose [archived documentation](https://longhorn.io/docs/archives/1.10.1/v2-data-engine/) labeled the V2 Data Engine “Experimental.” The current stable release is [Longhorn v1.12.0](https://github.com/longhorn/longhorn/releases/tag/v1.12.0), released on June 2, 2026. Its release notes state that the V2 Data Engine is now generally available. The benchmark numbers and the 2025 recommendation in the original article should still be read in their original version context.

> 这段说明不属于原文。文章在 2025 年 12 月 23 日发布时，Longhorn 的稳定版是 v1.10.1，[存档文档](https://longhorn.io/docs/archives/1.10.1/v2-data-engine/)当时把 V2 Data Engine 标为“Experimental”。目前的稳定版是 2026 年 6 月 2 日发布的 [Longhorn v1.12.0](https://github.com/longhorn/longhorn/releases/tag/v1.12.0)，发布说明已经把 V2 Data Engine 标为正式可用（GA）。原文中的测试数字和 2025 年建议，仍应放在当时的版本背景下理解。
