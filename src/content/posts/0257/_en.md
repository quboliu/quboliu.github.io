---
sourceDigest: "9330ec71fc65da10ea98a343805ffdc55cfb5b3948a62bb9b720e516896a5139"
title: "Notes on Using Personal Agents"
description: "Reflections on account access, isolated environments, and the cost of splitting attention after using personal agents for a literary podcast and a historical Bannerlord mod."
---

Around November 3, I used the break between jobs to work on a few things that had been on my mind.

One was English. I've never been able to read papers in English as fluently as in Chinese, and it takes me much longer. This has bothered me on and off for years. This month I wanted to tackle Dickens's *Great Expectations* again and improve my English gradually, but I couldn't find a podcast that read the book aloud and explained it the way I wanted. I don't have the energy to spend half an hour or an hour every day studying and memorizing the original text. I wanted something I could put on in the background in my spare time and absorb as I listened.

The other was building a historical mod for *Mount & Blade II: Bannerlord*. I'm more interested in turbulent periods, especially the century or so after prosperous dynasties like the Han and Tang. The Jin and Sixteen Kingdoms, and the Five Dynasties and Ten Kingdoms, are examples. I watch videos by 稚嫩的魔法师, 安州牧, and 杨利辉 over meals, and I've skimmed *A New Account of Tales of the World* and a set of books on the Five Dynasties and Ten Kingdoms. This setting also suits Bannerlord's engine.

I decided to try both while cloud-hosted personal agents were in what I'd call their “food delivery and ride-hailing phase.” All I had locally was an M4 Pro MacBook with 48 GB of memory and 512 GB of storage, plus a 2 TB external drive. I had no Windows gaming environment. I knew nothing about podcast production or Bannerlord modding, and to this day, beyond specifying and reviewing what the agents made, I haven't gone out of my way to learn either. It would cost time, and I haven't needed to yet.

I have separate write-ups about both projects. Here I just want to share some impressions of using agents as a junior programmer two years into the job.

Agents and their harnesses still carry considerable risks, and people are cautious about connecting them to existing systems. During this experiment, I let several agents use my main secondary Google account, which I'd used without trouble for over a year. It was suspended. GitHub suspended a newly created account of mine as well. Fortunately, I hadn't handed over my main GitHub account. I didn't connect my personal email or messages to any of the agents, and I certainly wouldn't give them access to accounts or systems involving money.

Trust also affects how I run them on my computer. On my Mac, I isolate agents and harnesses in OrbStack, Tart, or even UTM so they don't get access to the host environment.

Instead of having personal agents take over their owners' accounts, I expect agents will get their own identities and accounts linked to their owners. Messaging and collaboration tools support bots in various ways, but setting them up is still cumbersome, and their capabilities don't fit the personal-agent use case very well. Some people seem to be working on this. I vaguely remember Cloudflare launching a wallet for agents, though I may be misremembering. Muse has its own email address, and Cue in Manus 2.0 has its own email address and phone number. Communications accounts for agents like these still come with too many restrictions.

Today's personal agents mostly take over existing accounts. I imagine that's partly because it lets companies test the technology and results right away. Separating agent users from human users in existing systems would also be a lot of difficult work.

Some personal agents take a more radical approach and have no client at all. They communicate only over text, phone, or email. Instinct is one example. I haven't tried them because of policy constraints and the trouble of setting them up.

Beyond the time it would take to get a number and try one, the phone-and-text approach cuts off the way I use personal agents as software tools. Of course, doing away with the client is part of the business idea.

I mainly want personal agents to build projects, gather information, research questions, and send me updates they've filtered. A client makes it easier to see those tasks in one place and review what happened. I still need some kind of console.

With agents' help, I've looked into some Go and Linux topics that previously would have meant reading source code line by line and running experiments myself. As for articles straight from an LLM, whether GPT Astra, Claude Fable, or Gemini Carbon wrote them, I don't think they're written for people to read. They're collections of material, and it's hard to call them articles. The structure, progression of the argument, arrangement, and wording still need guidance and review from a person who knows how to write.

Forums, blogs, public accounts, and social platforms are already full of posts and replies with a heavy dose of LLM prose that the author barely reviewed or revised. After reading enough of them, I find myself instinctively annoyed or even angry. I expect the big platforms to set limits eventually. They might ban agents from taking over human accounts, require agent accounts to identify themselves, and limit how frequently they can post, much like private forums limit the posting privileges of new accounts.

A forum or platform with no real people left is close to dying. Stack Overflow's corpse isn't cold yet.

When an agent is doing something that doesn't strictly need to be done, is it worth letting it finish just to make the result perfect? Several times I've found that an agent turns my instructions into a plan that covers a little too much. I then have to decide whether to spend time spelling out what I want. Letting it go ahead may do no harm, but it can also drag the task out. The longer it takes, the more of my patience and attention it consumes.

It's also more tiring to operate an agent in an unfamiliar field. When it gets stuck, all I can do is explain myself and hope it understands and finds a way forward. That makes me anxious. Then there's the problem of running several tasks at once and having my attention chopped into little pieces, which plenty of people have already reported.

Today's LLMs and harnesses can replace a fair share of intellectual labor. Barring deliberate human or political intervention, it's hard to see us going back to a purely traditional development process. The worries people raise may remain worries. Decision-makers may see no need to address them. Industrial revolutions brought environmental problems, for example, but those worries were little more than decoration on the wheels as they rolled on. There is no helping it: that's how people are. And God, for that matter, doesn't care what you worry about or what you believe.

I think computer and software professionals will still have a place in the new software engineering and its industry. For now, quite a few tasks still depend on professional judgment and the occasional decisive intervention to finish well. What that place will ultimately look like, I don't know. Let's see what 2027 brings.
