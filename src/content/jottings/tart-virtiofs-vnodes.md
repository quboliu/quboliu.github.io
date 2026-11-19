---
pubDatetime: 2026-11-19T10:08:01-05:00
lang: zh-CN
---

今天用 Tart 虚拟机开发游戏 Mod 时，Mac 突然宕机。我在 Mac 宿主机和 Hannibal 上各开了一个 agent，让它们对照两边的日志和时间线。Mac 的 263,168 个 vnode 当时全部用满，随后 launchd 异常退出，触发整机重启。Talos 当时正通过 VirtioFS 扫描共享目录，两边日志里的报错时间和文件路径都对得上。这是目前最明确的线索，但还不能确定 Talos 的扫描占用了多少 vnode。

我原本用共享目录，是为了让多个 VM 协作读写同一份文件。VM 扫描共享目录时，Mac 也要逐个查找文件，这会占用 Mac 上的 vnode。换到 VM 本地盘后，文件归 VM 内核管，Mac 只管磁盘镜像，就能避开这条消耗宿主机 vnode 的路径。
