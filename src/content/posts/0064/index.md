---
lang: "zh-CN"
pubDatetime: 2024-08-17T21:40:13+08:00
modDatetime: 2024-08-17T21:42:00+08:00
timezone: "Asia/Shanghai"
title: "一个hexo一键推送的脚本"
featured: false
area: "tools-and-workflow"
draft: false
tags: []
description: "该脚本由ChatGPT、Claude联合调整而成，目前还是好用的。 运行于Win11下, .ps1后缀。"
---

该脚本由ChatGPT、Claude联合调整而成，目前还是好用的。  
运行于Win11下, .ps1后缀。

> name.ps1

```shell
# 设置执行环境为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 运行 hexo clean
hexo clean

# 设置LF和CRLF的转换, 这个好像不是这样搞的，算了。
git config --global core.autocrlf false

# 检查退出状态
if ($LASTEXITCODE -ne 0) {
    Write-Host "hexo clean 失败，请检查错误日志。"
    Exit 1
}

# 运行 hexo generate
hexo generate

# 检查退出状态
if ($LASTEXITCODE -ne 0) {
    Write-Host "hexo generate 失败，请检查错误日志。"
    Exit 1
}

# -------------------------------------------------
# # 运行 hexo deploy
# hexo deploy

# # 检查退出状态
# if ($LASTEXITCODE -ne 0) {
#     Write-Host "hexo deploy 失败，请检查错误日志。"
#     Exit 1
# }

# Write-Output "Hexo, 部署成功!"
# --------------------------------------------------
# 初始化变量
$deploySuccess = $false
$maxAttempts = 20  # 定义最大尝试次数
$attemptCount = 0

while (-not $deploySuccess -and $attemptCount -lt $maxAttempts) {

    # 运行 hexo deploy
    hexo deploy

    # 检查退出状态
    if ($LASTEXITCODE -eq 0) {
        $deploySuccess = $true
        Write-Output "Hexo 部署成功!"
    } else {
        Write-Host "hexo deploy 失败，请检查错误日志。"
        $attemptCount++
        Start-Sleep -Seconds 10  # 等待一段时间后重试
    }
}

if (-not $deploySuccess) {
    Write-Host "达到最大尝试次数，部署仍然失败。"
    Exit 1
}
```
