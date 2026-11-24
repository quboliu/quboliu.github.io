---
sourceDigest: "a24403b8333bfdeb8c7def2744d4b122e90f5fdf259ad8e35aa99055036ef048"
---

Today I wrote a few simple programs by hand in Vim. I noticed Vim was using its default indentation, so I added tab indentation settings to `~/.vimrc`. Then syntax highlighting disappeared. I had an LLM look it up. A full installation of Vim 8.0 or later comes with `defaults.vim`, first introduced in patch 7.4.2111. The file lives under `$VIMRUNTIME`. On a normal startup, Vim loads it automatically only if it can't find a personal vimrc.
