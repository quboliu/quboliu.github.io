---
lang: "zh-CN"
pubDatetime: 2024-07-29T12:53:12+08:00
modDatetime: 2024-07-30T14:50:59+08:00
timezone: "Asia/Shanghai"
title: "Piclist+缤纷云=个人图床"
featured: false
draft: false
tags: []
description: "创建完成后进入访问管理。"
---

# 缤纷云+Piclist

#### 一. 在缤纷云创建桶

![image-20240730141430-vrwweuf.png](./image-20240730141430-vrwweuf.png)

创建完成后进入访问管理。

![image-20240730141544-cb8j362.png](./image-20240730141544-cb8j362.png)

主要关注如下两个：“桶信息”和“访问管理”这两块儿。

![image-20240730141650-24ymhkg.png](./image-20240730141650-24ymhkg.png)

- “桶信息”用于后续的Piclist的配置。
- “访问管理”里面：
  - 这个应该是比较必要，白名单里面配置的是自己的博客的地址。  
    ![image-20240730141946-x0jrrch.png](./image-20240730141946-x0jrrch.png)

#### 二. 配置Piclist的npm镜像源并安装Amazon S3插件并配置

1.  下载地址：<a href="https://piclist.cn/" rel="noopener" target="_blank">PicList</a>。
2.  设置npm镜像  
    ![image-20240730142442-wqpf8jd.png](./image-20240730142442-wqpf8jd.png)  
    ![image-20240730142457-e5yccys.png](./image-20240730142457-e5yccys.png)  
    就是插件安装镜像那边：<a href="https://registry.npmmirror.com/" rel="noopener" target="_blank">https://registry.npmmirror.com</a>
3.  搜索s3插件并安装  
    ![image-20240730142613-5izjg7i.png](./image-20240730142613-5izjg7i.png)
4.  创建配置：  
    ![image-20240730142756-60umdh8.png](./image-20240730142756-60umdh8.png)
5.  打开配置并配置：  
    ![image-20240730142946-5xsthcw.png](./image-20240730142946-5xsthcw.png)
    - 主要是这7个配置。
    - 应用密钥ID和应用密钥是缤纷云创建桶的时候出来的，记住。
    - 自定义结点和地区，就是缤纷云桶信息那块儿。  
      自定义节点这个记得加上https就行。
6.  确定  
    ![image-20240730143255-l5obts1.png](./image-20240730143255-l5obts1.png)

#### 三. 上传图片

![image-20240730143320-x08l76l.png](./image-20240730143320-x08l76l.png)  
![image-20240730143337-fcldbh3.png](./image-20240730143337-fcldbh3.png)  
![image-20240730143429-9z5fsx8.png](./image-20240730143429-9z5fsx8.png)

#### 四. 贴到博客里面

![image-20240730143639-0va95qe.png](./image-20240730143639-0va95qe.png)  
`"![](https://4blog.s3.bitiful.net/test.drawio.svg)"`

下面就是呈现：  
![](./test.drawio.svg)

#### 附录: 参考连接

1.  <a href="https://www.yvii.cn/archives/2014.html" rel="noopener" target="_blank">https://www.yvii.cn/archives/2014.html</a>
2.  <a href="https://piclist.cn/manage#s3s" rel="noopener" target="_blank">https://piclist.cn/manage#s3s</a>
3.  <a href="https://www.bayyys.cn/posts/914acd72.html#%E9%85%8D%E7%BD%AE-picgo" rel="noopener" target="_blank">https://www.bayyys.cn/posts/914acd72.html#%E9%85%8D%E7%BD%AE-picgo</a>
