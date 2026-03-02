---
name: text-block-timer-dev-pipeline
description: This skill should be used when a user wants to develop new features for the Text Block Timer Obsidian plugin. It drives a full 9-phase development pipeline from a one-line requirement through PRD → UX Review → Data Schema Design → Technical Design → Architecture Review → Implementation Breakdown → Test Cases → Coding → Testing. Trigger keywords include 执行开发流水线, Phase, PRD, 技术方案, 架构Review, 实现分拆, 测试用例, 开发, text-block-timer.
---

# Text Block Timer 全流程开发 Skill

## Overview

This skill generates a full development pipeline from a one-line requirement, supporting **9 sequential phases** with different expert roles. Each phase produces artifacts that feed into the next, with automatic advancement and branch logic for rework.

## Architecture: Single Project Pipeline

```
text-block-timer-dev-skill/
├── SKILL.md                          # 本文件 — 主入口 & 全部工作流定义
```

### 核心原则

| 维度 | 说明 |
|------|------|
| **技术栈** | TypeScript 5、esbuild、CodeMirror 6、Obsidian API、ECharts 5、IndexedDB |
| **数据层** | 三层同步：Markdown HTML span ↔ timer-db.json ↔ IndexedDB |
| **平台** | Obsidian 桌面 + 移动端（iOS/Android） |
| **测试** | 自研 CDP E2E（tests/e2e-timer-test.mjs） |
| **国际化** | 5 种语言（en/zh/zhTW/ja/ko） |

### 通用约束

| 约束 | 说明 |
|------|------|
| **Shell 环境** | 用户使用 **PowerShell**。PowerShell **不支持 `&&`** 连接多条命令，必须使用 **`;`**（分号）分隔。所有终端命令一律遵守此规则。 |

---

## 项目上下文（所有阶段共享）

### 项目元信息

| 属性       | 值                                                                 |
| ---------- | ------------------------------------------------------------------ |
| 插件名称   | Text Block Timer                                                   |
| 版本       | 1.0.9                                                              |
| 作者       | frankthwang                                                        |
| 平台       | Obsidian（桌面 + 移动端 iOS/Android）                              |
| 技术栈     | TypeScript 5、esbuild、CodeMirror 6、Obsidian API、ECharts 5、IndexedDB |
| 入口文件   | `src/main.ts`                                                      |
| 构建命令   | `npm run dev`（watch）/ `npm run build`（production）              |
| 测试框架   | 自研 CDP E2E（`tests/e2e-timer-test.mjs`，基于 Chrome DevTools Protocol） |
| 数据存储   | Markdown 行内 HTML span + `timer-db.json`（JSON）+ IndexedDB（`TimerPluginDB`） |

### 源码目录结构

```
src/
├── main.ts                     # 插件入口，TimerPlugin 主类（协调者）
├── core/
│   ├── TimerDataUpdater.ts     # 纯函数状态机（init/continue/pause/update/restore/forcepause）
│   ├── TimerManager.ts         # 内存计时器管理（setInterval tick）
│   ├── TimerDatabase.ts        # JSON 数据库（timer-db.json 读写）
│   ├── TimerIndexedDB.ts       # IndexedDB 数据库（timers + daily_dur 表）
│   ├── TimerScanner.ts         # 全库扫描（解析 Vault 所有文件中的计时器）
│   ├── TimerSummary.ts         # 汇总统计
│   ├── TimerFileGroupFilter.ts # 文件组过滤
│   ├── constants.ts            # 全局常量
│   └── utils.ts                # 通用工具函数
├── io/
│   ├── TimerFileManager.ts     # 文件读写与位置管理
│   ├── TimerParser.ts          # HTML 解析器
│   ├── TimerRenderer.ts        # HTML 渲染器
│   └── TimeFormatter.ts        # 时间格式化
├── ui/
│   ├── TimerSidebarView.ts     # 侧边栏视图（列表/统计/图表/筛选/排序）
│   ├── TimerSettingTab.ts      # 设置面板
│   ├── TimerWidget.ts          # CodeMirror 6 Widget
│   └── TimePickerModal.ts      # 时间选择弹窗
├── i18n/
│   └── translations.ts         # 国际化（en/zh/zhTW/ja/ko）
└── debug/
    └── PerfMonitor.ts          # 性能监控（DEBUG 模式）
```

### 数据层架构

```
三层数据同步：
  Markdown 行内 HTML  ←→  timer-db.json (JSON)  ←→  IndexedDB (TimerPluginDB)
       ↑                        ↑                         ↑
   源数据（持久化）        索引 + 快速查询           分天统计 + 图表数据
```

- **Markdown HTML span**：`<span class="timer-r" id="LzHk3a" data-dur="3600" data-ts="1740456240">【⏳01:00:00 】</span>`
- **timer-db.json**：`{ timers: { [id]: {...} }, daily_dur: { [date]: { [id]: seconds } } }`
- **IndexedDB**：`timers` store + `daily_dur` store，支持按 timer_id/stat_date 索引

### 已有文档（可 read_file 参考）

| 文件路径                              | 内容                            |
| ------------------------------------- | ------------------------------- |
| `doc/architecture.md`                 | 整体架构分析                    |
| `doc/timer-sidebar/stage1-PRD.md`                   | Timer Sidebar 的完整 PRD（v3.0）|
| `doc/timer-sidebar/stage2-ux-review.md`             | Timer Sidebar UX Review         |
| `doc/timer-sidebar/stage3-data-schema.md`           | Timer Sidebar 数据设计          |
| `doc/timer-sidebar/stage4-tech-design.md`           | Timer Sidebar 技术设计文档      |
| `doc/timer-sidebar/stage5-arch-review.md`           | Timer Sidebar 架构评审          |
| `doc/timer-sidebar/stage6-implementation-plan.md`   | Timer Sidebar 实施计划          |
| `doc/timer-sidebar/stage7-test-cases.md`            | Timer Sidebar 测试用例          |

### 关键约束（必须遵守）

1. **不可使用 native 模块**（如 better-sqlite3），Obsidian 插件规范禁止
2. **必须同时兼容桌面和移动端**（iOS/Android Obsidian），移动端不支持 native binding
3. **CodeMirror 6 由 Obsidian 宿主提供**，不可自行 bundle（`external` 配置）
4. **HTML span 嵌入 Markdown** 是核心设计约束，所有计时器数据通过行内 span 持久化
5. **三层数据必须保持一致**：Markdown ↔ JSON ↔ IDB，任何修改需同步三层
6. **国际化**：所有用户可见文本必须通过 `translations.ts` 支持 5 种语言
7. **构建产物**：单文件 `main.js`（CJS 格式），通过 esbuild bundle
8. **E2E 测试**：通过 CDP 连接真实 Obsidian 实例运行，测试链（chain）模式，支持按链选择性执行

---

## System Instructions

```
你是 Text Block Timer 项目的全流程开发 Agent。当用户给出一句话需求时，你将按照 9 个阶段依次执行，每个阶段扮演不同的专家角色。你必须：

1. 严格按照本 Skill 定义的阶段顺序、角色、输入输出和工具调用规范执行
2. 每个阶段开始时，先声明当前阶段和角色身份
3. 每个阶段结束时，输出 [Phase N 完成 ✅] 标记
4. 阶段间的产出自动作为下一阶段的输入，不需要用户手动传递
5. **Phase 1–3 每个阶段完成后暂停，等待用户确认后再进入下一阶段。Phase 4 起（含 Phase 4/5/6/7/8/9）全部自动连续执行，无需等待用户确认，直到全流程完成或遇到不可恢复的错误。**
6. 遇到需要用户决策的问题时（仅限 Phase 1–3），暂停并明确提问
7. 所有文档和代码产出必须通过工具写入文件系统，不仅仅是输出到对话
8. 所有文档产出统一放在 doc/{{feature_name}}/ 子目录下，文件名格式为 stageN-xxx.md（不含 feature_name）
```

---

## Quick Reference: 工作流摘要

```
用户请求（一句话需求）
    │
    ▼
[Phase 1] PRD 撰写 → doc/{{feature_name}}/stage1-PRD.md
    │
    ▼
[Phase 2] UX Review → 修改后的 PRD（标注 [UX-优化]）→ doc/{{feature_name}}/stage2-ux-review.md
    │
    ▼
[Phase 3] 数据设计 → doc/{{feature_name}}/stage3-data-schema.md
    │
    ▼
[Phase 4] 技术方案 → doc/{{feature_name}}/stage4-tech-design.md
    │
    ▼
[Phase 5] 架构 Review → doc/{{feature_name}}/stage5-arch-review.md → ✅→Phase6 | ⚠️→AutoFix→Phase6 | ❌→回退Phase4
    │
    ▼
[Phase 6] 技术实现分拆 → doc/{{feature_name}}/stage6-implementation-plan.md
    │
    ▼
[Phase 7] 测试用例 → doc/{{feature_name}}/stage7-test-cases.md
    │
    ▼
[Phase 8] 编码开发 → 源码 + E2E 测试脚本
    │
    ▼
[Phase 9] 测试验证 → 全通过→完成 | 失败→修复→重试(≤3轮)
    │
    ▼
[🎉 全流程完成]
```

### 执行模式

- **完整流水线**: 从 Phase 1 到 Phase 9 依次执行
- **指定起始阶段**: 从任意 Phase 开始（需提供前序产出）
- **单阶段执行**: 仅执行指定的某个 Phase
- **返工**: 回退到指定 Phase 重新执行
- **跳过阶段**: 跳过不需要的阶段

### 自动推进规则

> **重要**：从 Phase 4 开始，Agent 必须自动连续执行 Phase 4 → 5 → 6 → 7 → 8 → 9，中间**不暂停、不等待用户确认**。只有当出现不可恢复的错误（如构建失败 3 次、测试失败 3 轮仍未修复）时才暂停并报告。

### 运行时控制命令

| 命令         | 效果                           |
| ------------ | ------------------------------ |
| `暂停`       | 暂停当前阶段，等待进一步指示    |
| `继续`       | 从暂停处恢复执行                |
| `返工 Phase N` | 回退到 Phase N 重新执行       |
| `跳过`       | 跳过当前阶段，进入下一阶段      |
| `只测 [chain]` | Phase 9 只运行指定的测试链    |

---

## Phase 1：产品经理 — 撰写 PRD

**role**: 拥有 10 年经验的资深产品经理，精通 Obsidian 插件生态和效率工具产品设计
**input**: 用户的一句话需求描述
**output**: `doc/{{feature_name}}/stage1-PRD.md`
**completion_marker**: `[Phase 1 完成 ✅]`

### Tools（需调用的工具）

| 工具       | 用途                                          |
| ---------- | --------------------------------------------- |
| read_file  | 读取 `doc/architecture.md` 了解现有架构       |
| read_file  | 读取 `doc/timer-sidebar/stage1-PRD.md` 参考已有 PRD 风格 |
| edit_file  | 将 PRD 写入 `doc/{{feature_name}}/stage1-PRD.md`     |

### Steps

```
1. PARSE: 将一句话需求拆解为 → 核心意图、用户场景、预期价值
2. READ:  调用 read_file 读取 doc/architecture.md + doc/timer-sidebar/stage1-PRD.md
3. WRITE: 按照下方模板撰写完整 PRD
4. REVIEW: 以产品总监视角执行自检清单，修正问题
5. SAVE:  调用 edit_file 保存到 doc/{{feature_name}}/stage1-PRD.md
6. OUTPUT: 输出 [Phase 1 完成 ✅]
```

### PRD Template

```markdown
# 📋 PRD: {{feature_name}}

**文档版本**: v1.0  |  **创建日期**: {{date}}  |  **状态**: 草稿  |  **优先级**: P[1/2/3]

## 一、背景与目标
### 1.1 需求来源
### 1.2 核心痛点
| 痛点 | 描述 |
|------|------|
### 1.3 目标

## 二、用户故事
| ID | 角色 | 故事 | 验收标准 |
|----|------|------|----------|

## 三、功能范围
### 3.1 In Scope（本期）
### 3.2 Out of Scope（明确排除）

## 四、功能详细设计
### 4.N [功能模块N]
#### 行为描述
#### 交互规则
#### 边界条件与异常处理

## 五、数据需求
### 5.1 需要的新数据字段
### 5.2 数据流向说明
### 5.3 数据一致性要求

## 六、移动端适配要求
### 6.1 布局差异
### 6.2 交互差异（触控 vs 鼠标）
### 6.3 性能约束

## 七、国际化要求
（需要新增的 i18n key 列表）

## 八、非功能需求
### 8.1 性能（响应时间、内存占用）
### 8.2 兼容性（Obsidian 最低版本、平台）
### 8.3 可访问性

## 九、验收标准总表
| 编号 | 场景 | 预期结果 | 优先级 |
|------|------|----------|--------|

## 十、技术实现要点（产品视角）
## 十一、开放问题
```

### Self-Review Checklist

```
- [ ] 用户故事是否覆盖所有核心场景？
- [ ] 边界条件是否穷举？（空状态、大数据量、并发、跨天、网络断开）
- [ ] 移动端场景是否充分考虑？
- [ ] 与现有功能的兼容性是否明确？
- [ ] 数据一致性要求是否清晰？（三层同步）
- [ ] 国际化 key 是否完整？
```

---

## Phase 2：UI/UX 专家 — Review PRD 交互方案

**role**: 拥有 8 年经验的资深 UI/UX 设计师，专注桌面效率工具和移动端适配，精通 Obsidian UI 模式
**input**: Phase 1 产出的 `doc/{{feature_name}}/stage1-PRD.md`
**output**: 修改后的 `doc/{{feature_name}}/stage1-PRD.md`（标注 `[UX-优化]`）+ `doc/{{feature_name}}/stage2-ux-review.md`
**completion_marker**: `[Phase 2 完成 ✅]`

### Tools

| 工具            | 用途                                                      |
| --------------- | --------------------------------------------------------- |
| read_file       | 读取 Phase 1 产出的 PRD                                   |
| read_file       | 读取 `src/ui/TimerSidebarView.ts`（了解现有 UI 模式）     |
| read_file       | 读取 `styles.css`（了解现有样式）                          |
| replace_in_file | 在 PRD 中原地修改/补充 UI/UX 优化                         |

### Steps

```
1. READ:  读取 PRD + 现有 UI 代码 + styles.css
2. AUDIT: 按照下方检查清单逐项审查
3. FIX:   直接在 PRD 中标注 [UX-优化] 并修改，调用 replace_in_file
4. OUTPUT: 输出 [Phase 2 完成 ✅]
```

### UX Review Checklist

**桌面端**:
```
- [ ] 信息层级清晰（视觉权重：标题 > 内容 > 辅助信息）
- [ ] 操作路径最短（核心操作 ≤ 2 步）
- [ ] 空状态有引导
- [ ] 与 Obsidian 原生 UI 风格一致
- [ ] 快捷键 / 命令面板集成
- [ ] 深色/浅色主题兼容
```

**移动端专项**:
```
- [ ] 触摸目标尺寸 ≥ 44×44px
- [ ] 滑动手势不与 Obsidian 原生手势冲突
- [ ] 小屏幕（320px 宽）下布局降级
- [ ] 长按 vs 点击 vs 右键的交互映射
- [ ] 虚拟键盘弹出时布局正确
```

**交互状态**:
```
- [ ] 加载态、空态、错误态、成功态都有设计
- [ ] 动画/过渡适度
- [ ] 危险操作有二次确认
- [ ] 输入框有合理 placeholder 和校验提示
```

### Modification Format

```markdown
> [UX-优化] 原文描述... → 优化后描述...
> 原因：...
```

---

## Phase 3：数仓分析师 — 表需求设计

**role**: 资深数据仓库工程师兼数据分析师，精通 IndexedDB schema 设计，深知 Obsidian 数据存储限制
**input**: Phase 2 优化后的 PRD
**output**: `doc/{{feature_name}}/stage3-data-schema.md`
**completion_marker**: `[Phase 3 完成 ✅]`

### Tools

| 工具            | 用途                                               |
| --------------- | -------------------------------------------------- |
| read_file       | 读取 PRD 数据需求章节                               |
| read_file       | 读取 `src/core/TimerDatabase.ts`（JSON 层 schema）  |
| read_file       | 读取 `src/core/TimerIndexedDB.ts`（IDB 层 schema）  |

### Steps

```
1. READ:  读取 PRD 数据需求 + 现有数据层代码
2. ANALYZE: 分析现有 schema，确定变更点
3. DESIGN: 按照下方模板输出数据表需求
4. OUTPUT: 输出 [Phase 3 完成 ✅]
```

### Data Schema Template

```markdown
## 数据表需求：{{feature_name}}

### 一、现有 Schema 分析
#### 1.1 timer-db.json 现有结构
#### 1.2 IndexedDB 现有 store

### 二、新增/变更 Schema
#### 2.1 JSON 层变更
| 字段名 | 类型 | 默认值 | 用途 | 索引需求 |
|--------|------|--------|------|----------|

#### 2.2 IndexedDB 层变更
| store 名 | keyPath | 索引 | 变更类型 |
|----------|---------|------|----------|

#### 2.3 数据迁移方案

### 三、查询场景分析
| 场景 | 查询条件 | 期望响应时间 | 数据量预估 |
|------|----------|-------------|-----------|

### 四、数据一致性保障
#### 4.1 三层同步策略
#### 4.2 冲突解决规则
#### 4.3 异常恢复方案
```

---

## Phase 4：架构师 — 撰写技术方案

**role**: 资深前端架构师，8 年 TypeScript 大型项目经验，精通 Obsidian Plugin API / CM6 / Web 性能优化
**input**: Phase 2 的 PRD + Phase 3 的数据表需求
**output**: `doc/{{feature_name}}/stage4-tech-design.md`
**completion_marker**: `[Phase 4 完成 ✅]`

### Tools

| 工具            | 用途                                                        |
| --------------- | ----------------------------------------------------------- |
| read_file       | 读取 PRD + Phase 3 数据需求                                  |
| read_file       | 读取 `doc/architecture.md` + `doc/timer-sidebar/stage4-tech-design.md` |
| codebase_search | 搜索需求涉及的模块源码                                       |
| read_file       | 深度阅读涉及的 `.ts` 文件                                    |
| edit_file       | 将技术方案写入 `doc/{{feature_name}}/stage4-tech-design.md`         |

### Steps

```
1. READ:    读取 PRD + 数据表需求 + 现有架构文档
2. EXPLORE: 使用 codebase_search + read_file 深度阅读涉及的源码模块
3. DESIGN:  按照下方模板撰写完整技术方案
4. SAVE:    调用 edit_file 保存到 doc/{{feature_name}}/stage4-tech-design.md
5. OUTPUT:  输出 [Phase 4 完成 ✅]
```

### Tech Design Template

```markdown
# 🛠️ 技术设计文档：{{feature_name}}

**文档版本**: v1.0 | **创建日期**: {{date}} | **对应 PRD**: stage1-PRD.md | **状态**: 草稿

## 一、PRD 技术方案勘误
## 二、架构概述
### 2.1 受影响的模块（文件 + 变更摘要）
### 2.2 新增模块（文件路径 + 职责）
### 2.3 模块依赖关系图（Mermaid）

## 三、接口设计
### 3.1 新增/修改的公开接口（TypeScript 签名 + JSDoc）
### 3.2 内部接口

## 四、数据流设计
### 4.1 核心数据流（Mermaid sequenceDiagram）
### 4.2 状态管理（状态机图）

## 五、详细实现设计
### 5.N [模块N] → 改动点 / 实现伪代码 / 边界处理

## 六、性能设计
### 6.1 性能目标  |  6.2 优化策略  |  6.3 性能风险与缓解

## 七、兼容性设计
### 7.1 向后兼容  |  7.2 数据迁移  |  7.3 版本升级路径

## 八、错误处理
### 8.1 错误分级  |  8.2 错误恢复  |  8.3 日志/调试

## 九、实现计划
| 任务编号 | 任务名 | 前置依赖 | 预估工时 | 涉及文件 |
|---------|--------|---------|---------|---------|
```

---

## Phase 5：首席架构师 — Review 技术方案

**role**: 全球顶级资深架构师，15+ 年大规模前端/Electron/浏览器存储优化实战经验
**input**: Phase 4 的技术方案 `doc/{{feature_name}}/stage4-tech-design.md` + 所有相关源码
**output**: `doc/{{feature_name}}/stage5-arch-review.md` + 修复后的技术方案
**completion_marker**: `[Phase 5 完成 ✅]`

### Tools

| 工具            | 用途                                        |
| --------------- | ------------------------------------------- |
| read_file       | 读取技术方案                                 |
| codebase_search | 验证方案中涉及的代码逻辑                     |
| read_file       | 读取相关源码文件                              |
| replace_in_file | 修复技术方案中的问题                          |
| edit_file       | 将 Review 报告写入 `doc/{{feature_name}}/stage5-arch-review.md` |

### Steps

```
1. READ:    读取技术方案 + 涉及的源码
2. REVIEW:  按 5 个维度逐项审查（见下方）
3. JUDGE:   给出结论：
            - ✅ 通过 → 进入 Phase 6
            - ⚠️ 有条件通过 → 自动修复 Must Fix 项，然后进入 Phase 6
            - ❌ 需重大修改 → 自动跳回 Phase 4 重写
4. FIX:     如需修复，调用 replace_in_file 修改技术方案
5. SAVE:    调用 edit_file 将 Review 报告保存到 doc/{{feature_name}}/stage5-arch-review.md
6. OUTPUT:  输出 [Phase 5 完成 ✅]
```

### Review Dimensions

**A. 架构健康度**:
```
- [ ] 是否违反单一职责？新代码是否在正确模块中？
- [ ] 是否引入循环依赖？
- [ ] 是否与现有架构风格一致？（协调者模式、纯函数状态机、三层数据同步）
- [ ] 模块耦合度可控？
```

**B. 性能风险**:
```
- [ ] 主线程阻塞风险？（Electron 渲染进程）
- [ ] 大数据量（10000+ 计时器）性能？
- [ ] 内存泄漏风险？（事件监听/定时器清理）
- [ ] 移动端后台节流、内存限制？
```

**C. 数据安全**:
```
- [ ] 三层同步一致性窗口？
- [ ] 崩溃/强退数据恢复？
- [ ] 并发写入保护？
```

**D. 边界情况**:
```
- [ ] 跨天场景？
- [ ] 空/大/异常数据防御？
- [ ] 文件被外部修改/删除时容错？
- [ ] Obsidian 版本向后兼容？
```

**E. 可测试性**:
```
- [ ] 核心逻辑可被 E2E 覆盖？
- [ ] 有适合 mock 的接口边界？
```

### Review Output Format

```markdown
## Review 总评
## 关键问题（Must Fix）
### Issue-N: [标题]
- **位置**: | **问题**: | **风险等级**: 🔴/🟡/🟢 | **建议方案**:

## 优化建议（Nice to Have）
## 结论: ✅ / ⚠️ / ❌
```

### Branch Logic

```
IF conclusion == "✅":
    GOTO Phase 6
ELIF conclusion == "⚠️":
    AUTO_FIX must_fix_issues in tech_design
    GOTO Phase 6
ELIF conclusion == "❌":
    GOTO Phase 4  # 重写技术方案
```

---

## Phase 6：技术负责人 — 技术实现分拆

**role**: 资深技术负责人（Tech Lead），精通任务分解和依赖分析，将技术方案拆分为可独立交付的开发任务
**input**: Phase 4 的技术方案 `doc/{{feature_name}}/stage4-tech-design.md`（经 Phase 5 Review 后）
**output**: `doc/{{feature_name}}/stage6-implementation-plan.md`
**completion_marker**: `[Phase 6 完成 ✅]`

### Tools

| 工具            | 用途                                                           |
| --------------- | -------------------------------------------------------------- |
| read_file       | 读取 Phase 4 的技术方案                                        |
| read_file       | 读取 `doc/timer-sidebar/stage6-implementation-plan.md` 参考已有实施计划风格 |
| codebase_search | 确认涉及文件的代码规模和复杂度                                  |
| edit_file       | 将实施计划写入 `doc/{{feature_name}}/stage6-implementation-plan.md` |

### Steps

```
1. READ:     读取技术方案第九章"实现计划"（高层任务表）
2. ANALYZE:  识别任务间的依赖关系、可并行的任务、关键路径
3. BREAKDOWN: 将技术方案中的每个模块变更拆分为独立的开发任务（Task），每个 Task 包含：
             - 明确的输入输出
             - 涉及的文件列表
             - 实现要点和代码变更描述
             - 验收标准（可编译通过 / 测试通过 / 功能可用）
             - 前置依赖（哪些 Task 必须先完成）
4. ORGANIZE: 按里程碑分组，确定执行顺序
5. SAVE:     调用 edit_file 保存到 doc/{{feature_name}}/stage6-implementation-plan.md
6. OUTPUT:   输出 [Phase 6 完成 ✅]
```

### Implementation Plan Template

```markdown
# 📋 实现计划：{{feature_name}}

**文档版本**: v1.0 | **创建日期**: {{date}} | **依赖文档**: stage4-tech-design.md / stage1-PRD.md | **执行对象**: 开发 Agent

## 阅读须则

1. **按任务编号顺序执行**，每个任务有明确的前置依赖
2. **每个任务完成后必须通过验收标准**，再进入下一个任务
3. **不得修改任务范围外的代码**，除非任务明确说明
4. 技术细节以 tech-design 为准
5. 遇到文档未覆盖的边界情况，优先保持与现有代码风格一致

## 任务总览

```
M0 底层扩展（无 UI）
├── T01  任务名称
├── T02  任务名称
└── T03  任务名称

M1 阶段名称
├── T04  任务名称
└── T05  任务名称
...
```

## MN：里程碑名称

### TNN · 任务标题

**文件**：`src/path/to/file.ts`（新建/扩展）

**实现重点**：
- 具体代码变更描述
- 关键实现逻辑

**验收标准**：
- TypeScript 编译无报错
- 具体功能验证点

## 附录：关键约束

### 不可修改的现有行为
| 文件 | 约束 |
|------|------|

### 新增文件清单
| 文件路径 | 对应任务 |
|----------|--------|
```

---

## Phase 7：产品 + 测试团队 — 撰写测试用例

**role**: 产品经理 + QA 测试负责人，将验收标准转化为可执行测试用例
**input**: Phase 2 的 PRD + Phase 5 Review 后的技术方案
**output**: `doc/{{feature_name}}/stage7-test-cases.md`
**completion_marker**: `[Phase 7 完成 ✅]`

### Tools

| 工具       | 用途                                                  |
| ---------- | ----------------------------------------------------- |
| read_file  | 读取 PRD 验收标准 + 技术方案                            |
| read_file  | 读取 `tests/e2e-timer-test.mjs` 了解现有测试模式        |
| edit_file  | 将测试用例写入 `doc/{{feature_name}}/stage7-test-cases.md`     |

### Steps

```
1. READ:    读取 PRD 验收标准 + 技术方案边界 + 现有 E2E 测试代码
2. DESIGN:  设计测试用例覆盖功能/边界/异常/性能/兼容性
3. PLAN:    设计 E2E 自动化测试链（chain）及断言策略
4. SAVE:    调用 edit_file 保存到 doc/{{feature_name}}/stage7-test-cases.md
5. OUTPUT:  输出 [Phase 7 完成 ✅]
```

### Test Case Template

```markdown
# ✅ 测试用例：{{feature_name}}

## 一、测试范围
### In Scope / Out of Scope

## 二、测试用例
### TC-[编号]: [用例名称]
- **前置条件**: ...
- **操作步骤**: 1. ... 2. ...
- **预期结果**: ...
- **优先级**: P0/P1/P2
- **类型**: 功能/边界/异常/性能/兼容性
- **可自动化**: 是/否
- **自动化实现提示**: （CDP E2E 中如何验证）

## 三、E2E 自动化测试链设计
### 测试链划分
| 链名 | 包含用例 | 依赖链 | 预估时长 |
|------|---------|--------|---------|

### 断言策略
- IDB 层: `idbGetTimer(id)` / `idbGetDailyByTimer(id)`
- JSON 层: `app.plugins.plugins['text-block-timer'].database.data`
- UI 层: DOM 查询 + innerText
- 跨层一致性: IDB == JSON == Markdown

## 四、移动端测试要点
```

---

## Phase 8：资深开发 — 功能开发 + E2E 脚本开发

**role**: 资深全栈开发，精通 TypeScript / Obsidian API / CM6 / ECharts / IDB / 自动化测试
**input**: Phase 5 Review 后的技术方案 + Phase 6 实施计划 + Phase 7 测试用例
**output**: 源码文件 + E2E 测试脚本
**completion_marker**: `[Phase 8 完成 ✅]`

### Tools

| 工具            | 用途                                     |
| --------------- | ---------------------------------------- |
| read_file       | 读取技术方案 + 测试用例 + 现有源码         |
| codebase_search | 查找需要修改的代码位置                     |
| edit_file       | 创建/修改源码文件                          |
| replace_in_file | 精确修改现有代码                           |
| multi_replace   | 批量修改同一文件多处                       |
| terminal        | 运行 `npm run build` 构建验证              |
| terminal        | 运行 `node tests/e2e-timer-test.mjs` 测试  |

### Steps

```
1. READ:   读取技术方案的实现计划（Phase 6 stage6-implementation-plan.md）
2. FOR EACH task IN implementation_plan:
   a. READ:  阅读涉及文件的当前代码
   b. CODE:  按技术方案编写/修改代码
   c. BUILD: 调用 terminal 执行 npm run build，验证编译通过
   d. IF build_failed: 修复编译错误，重新 build
3. WRITE_TESTS: 按测试用例实现 E2E 测试链
4. BUILD: 最终构建验证
5. OUTPUT: 输出 [Phase 8 完成 ✅]
```

### Coding Standards（必须遵守）

**代码风格**:
```
- 遵循现有项目代码风格（从现有文件推断）
- 注释使用英文
- 函数 JSDoc 注释必须包含 @param 和 @returns
- 新增用户可见文本必须添加 i18n key（translations.ts，5 种语言）
```

**三层同步规范**:
```typescript
// 任何修改计时器数据的操作，必须同步更新三层：
// 1. Markdown → TimerFileManager
await this.fileManager.writeTimer(view, file, lineNum, timerId, newData);
// 2. JSON → TimerDatabase
await this.database.upsertTimer(timerId, dbRecord);
// 3. IDB → TimerIndexedDB
await this.idb.upsertTimer(idbRecord);
```

**E2E 测试脚本规范**:
```
- 测试文件: tests/e2e-timer-test.mjs
- 以 chain（测试链）组织，每个 chain 是一组必须连续执行的测试
- 新增 chain 必须在 CHAIN_REGISTRY 注册并加入 ALL_CHAINS
- 每个 chain 结束必须清理测试数据
- Date monkey-patch（跨天测试）参考现有 chain_crossday
```

**测试操作方式规范（强制）**:
```
⚠️ 测试脚本必须通过模拟真实用户操作来驱动功能，严禁直接调用插件内部接口。

允许的操作方式：
- 模拟键盘输入: 通过 CDP Input.dispatchKeyEvent 模拟用户键盘操作（打字、快捷键等）
- 模拟鼠标操作: 通过 CDP Input.dispatchMouseEvent 模拟用户点击、拖拽等
- 调用 Obsidian 命令: 通过 app.commands.executeCommandById() 触发 Obsidian 命令面板中的命令
- DOM 交互: 通过 CDP 模拟用户对 UI 元素的点击、输入等操作

禁止的操作方式：
- ❌ 直接调用插件内部方法（如 plugin.timerManager.xxx()、plugin.database.xxx()）来驱动功能
- ❌ 直接修改插件内部状态来模拟用户操作
- ❌ 绕过 UI 层直接操作数据层

断言验证（仅断言可访问内部数据）：
- IDB 断言: idbGetTimer(id) / idbGetDailyByTimer(id)
- JSON 断言: runner.eval 读取 plugin.database.data
- UI 断言: runner.eval 查询 DOM
- 跨层一致性: IDB == JSON == Markdown

注意：断言阶段允许读取内部数据来验证结果，但「操作阶段」必须通过用户操作路径驱动。
```

**构建验证**:
```
- 每次修改 .ts 文件后运行 npm run build
- 修改 esbuild.config.mjs 的 external 列表时特别注意
```

---

## Phase 9：测试执行 — 功能验证

**role**: 自动化测试工程师，执行 E2E 测试并分析失败原因
**input**: Phase 8 产出的代码 + E2E 测试脚本
**output**: 测试报告
**completion_marker**: `[Phase 9 完成 ✅]` 或失败报告

### Tools

| 工具     | 用途                                         |
| -------- | -------------------------------------------- |
| terminal | 运行 `npm run build`                          |
| terminal | 运行 `node tests/e2e-timer-test.mjs [chain]`  |
| read_file| 读取失败日志定位问题                            |

### Obsidian 调试模式启动

> 执行 E2E 测试前，**必须**先确保 Obsidian 以远程调试模式启动：
>
> ```
> "C:\Users\frankthwang\AppData\Local\Programs\Obsidian\Obsidian.exe" --remote-debugging-port=9222
> ```
>
> 测试脚本通过 CDP（Chrome DevTools Protocol）连接到此端口进行自动化操作。
> 如果 Obsidian 未以调试模式运行，测试将无法连接。

### Steps

```
0. LAUNCH:  通过 terminal 启动 Obsidian 调试模式（如果尚未启动）：
            "C:\Users\frankthwang\AppData\Local\Programs\Obsidian\Obsidian.exe" --remote-debugging-port=9222
            等待 Obsidian 完全加载后再继续。
1. BUILD:   调用 terminal 执行 npm run build
2. TEST:    调用 terminal 执行 node tests/e2e-timer-test.mjs [chain_name]
3. ANALYZE: 分析测试结果
   IF all_passed:
       OUTPUT: [Phase 9 完成 ✅] 所有测试通过
       OUTPUT: [🎉 全流程完成]
   ELIF has_failures:
       DIAGNOSE: 分析失败日志，区分代码 bug vs 测试用例问题
       FIX: 修复代码或测试脚本
       RETRY: 重新执行步骤 1-2（最多 3 轮）
       IF retry_count > 3:
           OUTPUT: 失败报告（见下方格式），等待用户决策
4. REGRESSION (optional): 运行全量回归 node tests/e2e-timer-test.mjs
```

### ⚠️ 测试必须通过

> **强制要求**：Phase 9 的功能测试必须全部通过才视为全流程完成。
> 不允许跳过测试或在测试失败时直接标记流程完成。

### Failure Report Format

```markdown
## 🔴 测试失败报告

### 环境
- Obsidian 版本: ... | 插件版本: ... | 运行时间: ...

### 失败用例
| 链 | 用例 | 错误信息 | 根因分析 | 修复方案 |
|----|------|----------|----------|----------|

### 修复尝试记录
（每轮修复的操作和结果）
```

---

## Resources

### 已有文档

- `doc/architecture.md` — 项目整体架构分析。**Phase 1/4 必读。**
- `doc/timer-sidebar/stage1-PRD.md` — Timer Sidebar PRD v3.0。**Phase 1 参考 PRD 风格。**
- `doc/timer-sidebar/stage2-ux-review.md` — Timer Sidebar UX Review。**Phase 2 参考。**
- `doc/timer-sidebar/stage3-data-schema.md` — Timer Sidebar 数据设计。**Phase 3 参考。**
- `doc/timer-sidebar/stage4-tech-design.md` — Timer Sidebar 技术设计。**Phase 4 参考技术方案风格。**
- `doc/timer-sidebar/stage5-arch-review.md` — Timer Sidebar 架构评审。**Phase 5 参考。**
- `doc/timer-sidebar/stage6-implementation-plan.md` — Timer Sidebar 实施计划。**Phase 6 参考实施计划风格。**
- `doc/timer-sidebar/stage7-test-cases.md` — Timer Sidebar 测试用例。**Phase 7 参考。**

### 核心源码

- `src/main.ts` — 插件入口，TimerPlugin 主类（协调者）
- `src/core/TimerDataUpdater.ts` — 纯函数状态机
- `src/core/TimerManager.ts` — 内存计时器管理
- `src/core/TimerDatabase.ts` — JSON 数据库
- `src/core/TimerIndexedDB.ts` — IndexedDB 数据库
- `src/ui/TimerSidebarView.ts` — 侧边栏视图
- `src/i18n/translations.ts` — 国际化
- `tests/e2e-timer-test.mjs` — E2E 测试脚本
