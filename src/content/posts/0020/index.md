---
lang: "zh-CN"
pubDatetime: 2024-08-05T09:27:43+08:00
modDatetime: 2024-08-05T11:05:43+08:00
timezone: "Asia/Shanghai"
title: "局域网扫描一个网段中的可用ip-用于配置虚拟机的静态ip"
featured: false
draft: false
tags:
  - "计算机网络"
description: "安装: sudo apt install nmap"
---

#### 场景

- 一个网段aaa.bbb.ccc.xxx中，搜索其中可用的没有被其他主机占用的ip用以配置虚拟机的ip。
- 其中，网关是aaa.bbb.ccc.1。
- 子网掩码是255.255.255.0。

#### nmap工具

- 安装: sudo apt install nmap

- 需求：使用nmap工具来扫描网段aaa.bbb.ccc.0/24中未被使用的IP地址。

- aaa.bbb.ccc.0 作为网络地址。

- aaa.bbb.ccc.255 作为广播地址。

- aaa.bbb.ccc.1 作为网关地址。

- 所以搜寻地址范围是：\[aaa.bbb.ccc.2, aaa.bbb.ccc.254\]

- 方案：

  > 方案1:  
  > 使用-sP参数进行Ping扫描，来检查主机是否在线，但不进行端口扫描。

  > 方案2:  
  > 使用-sS参数进行TCP SYN扫描

  > 方案3:  
  > 使用-sT参数进行TCP连接扫描

- 实践：

  ```shell
  nmap -sP aaa.bbb.ccc.2-254
  ```

  结果如下：

  ```shell
  user1@k8s-master01:~$ sudo nmap -sP aaa.bbb.ccc.2-254

  Starting Nmap 7.60 ( https://nmap.org ) at 2024-08-05 02:58 UTC
  Nmap scan report for aaa.bbb.ccc.7
  Host is up (0.00032s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.11
  Host is up (0.00067s latency).
  MAC Address: ---------------- (Super Micro Computer)
  Nmap scan report for aaa.bbb.ccc.25
  Host is up (0.00018s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.31
  Host is up (0.00028s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.32
  Host is up (0.00021s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.33
  Host is up (0.00027s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.37
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Inventec)
  Nmap scan report for aaa.bbb.ccc.38
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.39
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Super Micro Computer)
  Nmap scan report for aaa.bbb.ccc.41
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.42
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.43
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.44
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.45
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Shenzhen Bitland Information Technology)
  Nmap scan report for aaa.bbb.ccc.47
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.48
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.49
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.50
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.51
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Inspur Electronic Information Industry)
  Nmap scan report for aaa.bbb.ccc.52
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Inspur Electronic Information Industry)
  Nmap scan report for aaa.bbb.ccc.55
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Beijing Sinead Technology)
  Nmap scan report for aaa.bbb.ccc.81
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.85
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.89
  Host is up (0.00016s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.94
  Host is up (0.00032s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.95
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.97
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.98
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.99
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.102
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for aaa.bbb.ccc.103
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for aaa.bbb.ccc.104
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for k8s-master02 (aaa.bbb.ccc.105)
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for k8s-worker01 (aaa.bbb.ccc.106)
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for k8s-worker02 (aaa.bbb.ccc.107)
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for k8s-worker03 (aaa.bbb.ccc.108)
  Host is up (-0.100s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for aaa.bbb.ccc.109
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.110
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.111
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.112
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.113
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.114
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.115
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.116
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Intel Corporate)
  Nmap scan report for aaa.bbb.ccc.117
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.119
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Hewlett Packard)
  Nmap scan report for aaa.bbb.ccc.120
  Host is up (-0.10s latency).
  MAC Address: ---------------- (Hewlett Packard)
  Nmap scan report for aaa.bbb.ccc.121
  Host is up (-0.10s latency).
  MAC Address: ---------------- (VMware)
  Nmap scan report for aaa.bbb.ccc.134
  Host is up (0.00013s latency).
  MAC Address: ---------------- (Realtek Semiconductor)
  Nmap scan report for aaa.bbb.ccc.138
  Host is up (0.00017s latency).
  MAC Address: ---------------- (Super Micro Computer)
  Nmap scan report for aaa.bbb.ccc.149
  Host is up (0.00036s latency).
  MAC Address: ---------------- (Asustek Computer)
  Nmap scan report for aaa.bbb.ccc.150
  Host is up (0.00012s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.151
  Host is up (0.10s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.154
  Host is up (0.00048s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.155
  Host is up (0.00051s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.156
  Host is up (0.00017s latency).
  MAC Address: ---------------- (Dell)
  Nmap scan report for aaa.bbb.ccc.160
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.165
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.166
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.168
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.169
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.171
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.172
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.173
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.174
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.175
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.176
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.177
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Hewlett Packard)
  Nmap scan report for aaa.bbb.ccc.180
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.181
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.183
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.184
  Host is up (0.00013s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.185
  Host is up (0.00073s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.186
  Host is up (0.00025s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.190
  Host is up (0.00043s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.191
  Host is up (0.00018s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.192
  Host is up (0.00019s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.193
  Host is up (0.00018s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.194
  Host is up (0.00051s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.196
  Host is up (0.00026s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.199
  Host is up (0.00059s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.200
  Host is up (0.00016s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.201
  Host is up (0.00022s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.202
  Host is up (0.00048s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.203
  Host is up (0.00014s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.204
  Host is up (0.00026s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.205
  Host is up (0.00043s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.207
  Host is up (0.00013s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.208
  Host is up (0.00014s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.210
  Host is up (0.00012s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.211
  Host is up (0.00029s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.212
  Host is up (0.00023s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.213
  Host is up (0.00014s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.214
  Host is up (0.00023s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.215
  Host is up (0.00016s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.216
  Host is up (0.00029s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.217
  Host is up (0.00020s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.218
  Host is up (0.00018s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.219
  Host is up (0.00013s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.220
  Host is up (0.00044s latency).
  MAC Address: ---------------- (Realtek Semiconductor)
  Nmap scan report for aaa.bbb.ccc.222
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Asustek Computer)
  Nmap scan report for aaa.bbb.ccc.223
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.224
  Host is up (-0.099s latency).
  MAC Address: ---------------- (Asustek Computer)
  Nmap scan report for aaa.bbb.ccc.227
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Hewlett Packard)
  Nmap scan report for aaa.bbb.ccc.229
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.231
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.232
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.233
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.236
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.237
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.240
  Host is up (0.00019s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.241
  Host is up (0.00014s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.244
  Host is up (-0.099s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.245
  Host is up (-0.100s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.246
  Host is up (0.00068s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.247
  Host is up (0.00021s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.248
  Host is up (0.00012s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.249
  Host is up (0.00014s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.250
  Host is up (0.00020s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.251
  Host is up (0.00013s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.252
  Host is up (0.00024s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for aaa.bbb.ccc.253
  Host is up (0.00037s latency).
  MAC Address: ---------------- (Hewlett Packard)
  Nmap scan report for aaa.bbb.ccc.254
  Host is up (0.00015s latency).
  MAC Address: ---------------- (Unknown)
  Nmap scan report for k8s-master01 (aaa.bbb.ccc.122)
  Host is up.
  Nmap done: 253 IP addresses (124 hosts up) scanned in 1.99 seconds
  ```
