---
sourceDigest: "56ea813748f0203d59692464a939a3a855ccaad84517ab7f971136505694f651"
---

My Mac suddenly crashed today while I was developing a game mod in a Tart VM. I started an agent on the Mac host and another in the VM and had them compare logs and timelines. All 263,168 vnodes on the Mac were in use. Then launchd exited unexpectedly and the machine rebooted. The VM was scanning a shared directory over VirtioFS, and the errors on both sides lined up in time and path. That was the strongest clue, though it doesn't establish how many of the vnodes VirtioFS had used.

I set up the share so multiple VMs could work on the same files. But when a VM scans the share, the Mac has to look up files one by one, consuming host vnodes. On the VM's own disk, the VM kernel handles the files and the Mac only handles the disk image. That avoids this source of vnode use on the host.
