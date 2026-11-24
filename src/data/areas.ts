export type AreaDefinition = {
  slug: string;
  name: string;
  description: string;
  order: number;
};

/**
 * Canonical Areas catalog.
 *
 * Posts store only the stable slug. Display copy and ordering live here so they
 * can change without rewriting frontmatter or changing published URLs.
 */
export const AREAS = [
  {
    slug: "distributed-systems",
    name: "分布式系统",
    description:
      "共识、一致性、复制、时钟、快照与协调服务等分布式系统经典主题与工程实践。",
    order: 1,
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    description:
      "Kubernetes 的设计理念、资源模型、控制循环、API、调度、Operator，以及 Borg、Omega 与 etcd 等理论和工程基础。",
    order: 2,
  },
  {
    slug: "storage-systems",
    name: "存储系统",
    description:
      "分布式块存储、卷引擎、数据复制、快照备份、故障恢复，以及云原生存储的数据路径与工程实践。",
    order: 3,
  },
  {
    slug: "databases",
    name: "数据库",
    description: "数据库引擎、存储与压缩、云原生数据库架构与评测。",
    order: 4,
  },
  {
    slug: "ai-and-agents",
    name: "AI 与 Agent",
    description:
      "LLM、Coding Agent 运行时与工具链、Vibe Coding 实践，以及 AI 辅助开发语境下的工程与设计问题。",
    order: 5,
  },
  {
    slug: "go",
    name: "Go 语言",
    description: "Go 语言机制、运行时、测试组织、源码阅读方法与工程架构实践。",
    order: 6,
  },
  {
    slug: "operating-systems",
    name: "操作系统与底层",
    description:
      "进程、线程、IPC、上下文切换、TTY、CPU 特权级等操作系统与硬件底层机制。",
    order: 7,
  },
  {
    slug: "algorithms",
    name: "算法与数据结构",
    description: "数据结构与算法的学习笔记，以及支撑刷题练习的项目框架。",
    order: 8,
  },
  {
    slug: "software-engineering",
    name: "软件工程",
    description:
      "软件架构与设计论述、故障诊断与性能排查案例、客户端产品工程实践，以及面向开发者的开源生态。",
    order: 9,
  },
  {
    slug: "tools-and-workflow",
    name: "工具与工作流",
    description:
      "博客基建、图床、脚本、网络环境配置与个人知识管理等工具链和工作流。",
    order: 10,
  },
  {
    slug: "notes-and-thoughts",
    name: "随笔与思考",
    description: "个人表达、跨领域概念辨析，以及思维模型的文摘与转载。",
    order: 11,
  },
] as const satisfies readonly AreaDefinition[];

export type AreaSlug = (typeof AREAS)[number]["slug"];

export const AREA_SLUGS = AREAS.map(({ slug }) => slug) as [
  AreaSlug,
  ...AreaSlug[],
];

export function getAreaBySlug(slug: string, english = false) {
  const area = AREAS.find(entry => entry.slug === slug);
  return area && localizeArea(area, english);
}

const englishLabels: Record<
  AreaSlug,
  Pick<AreaDefinition, "name" | "description">
> = {
  "distributed-systems": {
    name: "Distributed Systems",
    description:
      "Consensus, consistency, replication, clocks, snapshots, coordination, and engineering practice.",
  },
  kubernetes: {
    name: "Kubernetes",
    description:
      "Design, resources, control loops, APIs, scheduling, operators, and the foundations in Borg, Omega, and etcd.",
  },
  "storage-systems": {
    name: "Storage Systems",
    description:
      "Distributed block storage, volume engines, replication, backups, recovery, and cloud-native data paths.",
  },
  databases: {
    name: "Databases",
    description:
      "Database engines, storage and compression, cloud-native architectures, and evaluations.",
  },
  "ai-and-agents": {
    name: "AI and Agents",
    description:
      "LLMs, coding agent runtimes and tools, vibe coding, and engineering and design with AI assistance.",
  },
  go: {
    name: "Go",
    description:
      "Language mechanics, the runtime, test organization, reading source code, and software architecture.",
  },
  "operating-systems": {
    name: "Operating Systems",
    description:
      "Processes, threads, IPC, context switching, TTYs, CPU privilege levels, and other low-level topics.",
  },
  algorithms: {
    name: "Algorithms and Data Structures",
    description: "Study notes and project scaffolding for algorithm practice.",
  },
  "software-engineering": {
    name: "Software Engineering",
    description:
      "Architecture and design, debugging and performance, client application engineering, and open-source tools.",
  },
  "tools-and-workflow": {
    name: "Tools and Workflow",
    description:
      "Blog infrastructure, image hosting, scripts, networking, and personal knowledge management.",
  },
  "notes-and-thoughts": {
    name: "Notes and Thoughts",
    description:
      "Personal essays, ideas across fields, and readings on mental models.",
  },
};

function localizeArea(
  area: (typeof AREAS)[number],
  english: boolean
): AreaDefinition {
  return english ? { ...area, ...englishLabels[area.slug] } : area;
}

export function getAreas(english: boolean) {
  return AREAS.map(area => localizeArea(area, english));
}
