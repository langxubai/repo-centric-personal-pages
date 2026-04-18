# 架构设计：Repo-Centric Digital Garden (基于仓库逻辑的数字花园)

## 1. 核心愿景 (Core Philosophy)
打破传统个人主页的“线性瀑布流”博客模式，引入**“万物皆可 Repo”**的极客美学。将物理推导、代码工程和知识沉淀以“项目 (Project)”为粒度进行收敛，构建类似于GitHub页面的个人主页。

系统采用**双态视图 (Dual-View)** 架构：
* **展示模式 (Presentation View)：** 知识的蓝图。摒弃冗长的源码，以**拓扑逻辑图 (Topology Graph)** 展示项目宏观架构与研究脉络。
* **过程模式 (Process View)：** 思维的航海日志。摒弃干瘪的 Git Commit Message，以**长篇伪 Commit (Markdown ADR)** 记录试错过程、数学推导与踩坑历史。

---

## 2. 目录结构与数据源 (Data Architecture)
依托 Astro 的 `Content Collections` 功能，在本地文件系统层面构建一个 Monorepo（单体仓库）逻辑。避免使用真实的 Git Submodule，而是用文件夹模拟项目，用 Markdown 文件模拟 Commit。

```text
src/content/projects/
  └── quantum-many-body-sim/           # 逻辑上的一个“Repo”
      ├── index.mdx                    # 项目的主入口（概述与核心结论，类似于README）
      ├── nodes/                       # 存放“逻辑图”文件的目录
          ├── 01-hamiltonian.mdx
          ├── 02-lanczos-algorithm.mdx
          └── 03-entropy-calc.mdx
      └── commits/                     # 存放“伪 Commit”文件的目录
          ├── 2026-04-13-11:41:09.209092+00.mdx
          ├── 2026-04-15-12:30:09.00445+00.mdx
          └── 2026-04-30-01:38:02.34445+00.mdx
```

---

## 3. 拓扑逻辑的 Frontmatter 设计
为了实现前端的图结构渲染，每一个““逻辑图”” (Node) 必须在头部元数据 (Frontmatter) 中显式声明其**依赖关系 (Parents)**。

**Frontmatter Schema 示例：**
```yaml
---
id: "lanczos-algorithm"
title: "Lanczos 算法的数值对角化尝试"
date: 2026-05-12
type: "code"             # 节点类型：math, code, logic, bugfix (用于决定图谱中的节点颜色/图标)
status: "verified"       # 节点状态：draft, in-progress, verified, failed (用于决定边框样式，如虚线/实线)
parents: ["hamiltonian"] # 上游节点 ID 数组，用于构建有向无环图 (DAG)
visibility: "public"     # 权限控制：public 或 private
---
```
*Astro 在构建阶段 (Build Time) 会遍历 `nodes/` 目录，解析所有 `parents` 字段，自动生成前端可视化库所需的 Nodes & Edges JSON 数据。*

---

## 4. 视图层实现方案 (UI/UX)

### 4.1 全局控制器 (The Toggle)
在页面全局注入一个状态（如 React 的 `useState` 或 Nano Stores），用于控制当前处于 `Presentation` 还是 `Process` 模式。

### 4.2 展示模式：交互式拓扑图 (The Blueprint)
* **视觉呈现：** 页面主体为一个二维画布和一个内容为index.mdx的文本框介绍概述与核心结论。当点击拓扑图中的某个具体 Node 时，触发侧边栏滑出或全屏 Modal。
* **技术栈推荐：** `React Flow`。它可以完美对接 Astro 的混合渲染，支持节点的拖拽、缩放，并且可以高度自定义节点卡片的样式。并利用 Astro 的 `<Content />` 组件直接渲染节点对应的 `.mdx` 文件。
* **交互逻辑：** 访客通过宏观图谱理解研究的依赖关系，并且可以了解概述与核心结论。
* **生态接入：** 完美支持 LaTeX 公式渲染 (通过 `rehype-katex`)、代码高亮以及图表的嵌入。

### 4.3 过程模式：沉浸式阅读 (The Journey)
* **视觉呈现：** 页面整体是线性排列从新到旧的所有commits。
* **内容渲染：** 利用 Astro 的 `<Content />` 组件直接渲染节点对应commit的 `.mdx` 文件。
* **交互逻辑：** 访客通过commits的历史深入了解作者的想法历程。
* **生态接入：** 完美支持 LaTeX 公式渲染 (通过 `rehype-katex`)、代码高亮以及图表的嵌入。

---

## 5. 开发实施路径 (Roadmap)
这个修改非常精准！将 `nodes/`（负责空间拓扑结构）和 `commits/`（负责时间线性历史）在数据结构上彻底解耦，完美解决了之前“逻辑图与时间线强行绑定”可能导致的混乱。这样一来，数据源更加清晰，前端渲染逻辑也更纯粹。

根据你更新后的架构设计，我为你重新梳理了工程落地的**第 5 部分：开发实施路径 (Roadmap)**。你可以直接将其补充到你的设计文档中。

---

## 5. 开发实施路径 (Roadmap)

由于数据结构拆分为了 `index.mdx`、`nodes/` 和 `commits/`，开发路径需要紧紧围绕这三类数据的**读取、解析与分离渲染**来展开。建议按照以下五个阶段进行敏捷迭代：

### Phase 1: 数据集合与 Schema 定义 (Data Layer)
* **核心目标：** 让 Astro 能够正确识别并校验项目中这三类不同的 Markdown 文件。
* **具体任务：**
  * 在 `src/content/config.ts` 中重新定义 `projects` 集合的 Schema。
  * 引入路径区分逻辑（或者基于 Frontmatter 的 `type` 字段），分别定义 `NodeSchema` (必须包含 `parents` 和 `id`) 和 `CommitSchema` (包含时间戳信息)。
  * 编写基于 `visibility: private` 的构建过滤逻辑，确保本地私密推导不泄露到生产环境。

### Phase 2: 核心路由与数据获取 (Routing & Fetching)
* **核心目标：** 为每个项目生成专属页面，并在后端处理好所有依赖数据。
* **具体任务：**
  * 创建动态路由文件 `src/pages/projects/[project].astro`。
  * 编写数据获取逻辑：
    1. 获取并解析当前的 `index.mdx`。
    2. 获取该项目下 `nodes/` 目录内的所有文件，按 `parents` 依赖关系转化为可供前端使用的 JSON 图结构数据 (Nodes & Edges)。
    3. 获取该项目下 `commits/` 目录内的所有文件，并通过解析文件名或 Frontmatter 中的时间信息，按从新到旧 (降序) 进行排序。

### Phase 3: 展示模式开发 (Presentation View)
* **核心目标：** 实现“文本概述 + 交互式图谱”的左右/上下分屏视窗。
* **具体任务：**
  * 搭建基础布局：渲染 `index.mdx` 作为项目的概述面板。
  * 引入 `React Flow`：编写适配器函数，将 Phase 2 提取的图结构数据喂给画布，渲染宏观架构图。
  * 交互打磨：实现节点点击事件，触发侧边栏 (Sidebar) 或模态框 (Modal)，并在其中使用 `<Content />` 渲染被点击节点的 `.mdx` 详细内容。

### Phase 4: 过程模式开发 (Process View)
* **核心目标：** 实现类似 Twitter 信息流或 GitHub 提交记录的线性沉浸式阅读体验。
* **具体任务：**
  * 遍历渲染：使用 `.map()` 遍历已排序的 `commits` 数据，使用 `<Content />` 逐个渲染。
  * 样式设计：为每一条 Commit 添加时间轴 UI (Timeline UI) 和元数据标签，确保长篇文字的阅读体验清晰不压抑。

### Phase 5: 全局状态与生态集成 (State & Ecosystem)
* **核心目标：** 实现双态视图的无缝切换以及数理生态支持。
* **具体任务：**
  * 引入状态管理（推荐 Astro 官方推荐的 `Nano Stores` 或 React 的 `Context/useState`），在页面顶部注入 **The Toggle** 开关，丝滑控制 `Presentation` 和 `Process` 视图的挂载与卸载。
  * 配置 MDX 渲染插件：接入 `rehype-katex` 和 `remark-math` 确保高等物理公式的完美渲染；配置 `Shiki` 或 `Prism` 实现代码块的高级语法高亮。