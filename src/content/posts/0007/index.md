---
lang: "zh-CN"
pubDatetime: 2024-07-28T20:41:52+08:00
modDatetime: 2024-07-30T00:48:30+08:00
timezone: "Asia/Shanghai"
title: "draw.io插件在vscode中使用的几个要点。"
featured: false
draft: false
tags:
  - "工具使用"
  - "drawio"
  - "vscode-extensions"
description: "安装draw.io插件：Draw.io Integration"
---

1.  安装draw.io插件：Draw.io Integration

2.  创建绘图文件：

     第一种格式: png

    > - 创建”filename.drawio.png”类型的图片
    > - 这种创建完成之后直接可以粘贴png到文档中，但是非常糊眼睛。
    > - 需要小小修改一下：File ——\> Properties ——\> Zoom:400% ——\> Apply
    > - 具体你搞多少的缩放看你心情了，反正不是100%就行。
    > - 但是这个有个问题就是，图片粘贴到文档后面非常大，很不方便操作，你还需要额外的进行缩放，比较麻烦。
    > - 所以还是比较建议采取下面的格式。

       
    第二种格式：svg

    > - 创建”filename.drawio.svg”类型的图片
    > - 矢量图，画完就是高清，直接贴就完事儿了。
