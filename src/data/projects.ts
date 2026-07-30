export interface Project {
  name: string;
  description: string;
  url: string;
  language: string;
  tags: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "flintmark",
    description:
      "面向 VS Code 的 Obsidian 风格 Markdown 实时预览：原地编辑、所见即所得，文件仍然保持纯 Markdown。",
    url: "https://github.com/quboliu/flintmark",
    language: "TypeScript",
    tags: ["VS Code", "Markdown", "Editor"],
    featured: true,
  },
  {
    name: "multi-prompt-dispatcher",
    description:
      "一个 Manifest V3 Chromium 扩展，将同一提示词发送到多个 AI Web 应用，并集中查看处理状态。",
    url: "https://github.com/quboliu/multi-prompt-dispatcher",
    language: "JavaScript",
    tags: ["Browser Extension", "AI", "Productivity"],
    featured: true,
  },
  {
    name: "codejym",
    description:
      "面向源码刻意练习与记忆的代码训练工作室，把“读过”进一步变成“真正掌握”。",
    url: "https://github.com/quboliu/codejym",
    language: "Go",
    tags: ["Learning", "Practice", "Developer Tool"],
    featured: true,
  },
];
