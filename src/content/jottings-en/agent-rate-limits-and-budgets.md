---
sourceDigest: "03a2ad58512c901b36a45a07111641fce5d88c104488cd982f969b91cf13dbd0"
---

Today I revisited Salman Munaf's talk [AI Agents Are Also Distributed Systems](https://quboliu.github.io/en/posts/0128/), which includes this passage:

> It is also important to assign rate limits and budgets. An agent can run your cost, uh, if it’s not assigned proper budgets and rate limits. It will keep retrying and try to solve the problem that if it’s facing. So it is important that we have set up max turns, max parallelism, max spend, to ensure that the model is not, uh, uh, not crossing the budget boundary that we have set.

It reminded me of when Codex was helping build the campaign map for the Five Dynasties mod: left unsupervised, it spun its wheels for over ten hours over a few millimeters of map detail that aren't even visible to the naked eye, burned through half my weekly quota, committed a pile of meaningless changes, and made zero real progress on the map task.
