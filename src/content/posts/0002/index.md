---
lang: "zh-CN"
pubDatetime: 2024-07-27T01:01:00+08:00
modDatetime: 2024-08-04T17:36:44+08:00
timezone: "Asia/Shanghai"
title: "Leetcode坚持刷题"
featured: false
draft: false
tags:
  - "leetcode面试经典150题"
  - "leetcode"
  - "基本功"
  - "数组/字符串"
  - "求职"
  - "跳槽"
description: "本篇博文将随着刷题进度持续更新。"
---

本篇博文将随着刷题进度持续更新。

## 2024.07.27

今天比较捞，就刷了一题还没刷对。题还是要坚持刷的呀。

代码如下：

```go
package goleetcode

// link: https://leetcode.cn/studyplan/top-interview-150/
// 题解: xxx
// 我尝试在O(1)的空间复杂度和O(m+n)的时间复杂度来解决这道题目, 但是失败了。
// 这个代码应该是最蠢的代码了。
func merge(nums1 []int, m int, nums2 []int, n int) {
    nums3 := make([]int, m+n)
    p21 := 0
    p22 := 0
    p23 := 0
    for p21 < m && p22 < n {
        if nums1[p21] <= nums2[p22] {
            nums3[p23] = nums1[p21]
            p21 += 1
        } else {
            nums3[p23] = nums1[p22]
            p22 += 1
        }
        p23 += 1
    }
    for p21 < m {
        nums3[p23] = nums2[p21]
        p23 += 1
    }
    for p22 < n {
        nums3[p23] = nums2[p22]
        p23 += 1
    }
    for p := 0; p < m+n; p++ {
        nums1[p] = nums3[p]
    }
}
```

总结：

> 这个题目的思路是，先将nums1和nums2合并到一个新的数组中，然后再将新的数组赋值给nums1。  
> 这个是我的最愚蠢的思路。  
> 不知道更好的思路是什么。
