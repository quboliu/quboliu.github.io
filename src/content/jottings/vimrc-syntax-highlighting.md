---
pubDatetime: 2026-11-24T01:02:43-05:00
lang: zh-CN
---

今天用vim手写了几个简单的程序，发现缩进是默认的，于是在~/.vimrc增加了tab的缩进配置，结果语法高亮没了，llm查了下资料，发现Vim 8.0 起的完整安装会自带 defaults.vim，它最早加入于补丁7.4.2111。文件位于 $VIMRUNTIME 下。正常启动时，Vim 找不到个人 vimrc才会自动加载它。
