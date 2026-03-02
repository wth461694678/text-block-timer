---
# ═══════════════════════════════════════════════
#  Skill Entry File — AI Agent 标准入口描述
# ═══════════════════════════════════════════════

# ── 基础元信息 ──
skill_id: text-block-timer-dev-pipeline
skill_name: "Text Block Timer 全流程开发 Skill"
version: "2.0"
description: |
  通过一句话需求，自动驱动从 PRD → UI Review → 数据设计 → 技术方案 → 架构 Review → 测试用例 → 编码开发 → 功能测试的全流程开发流水线。
  适用于 Obsidian 插件 Text Block Timer 项目的功能开发。
author: frankthwang
created: 2026-03-01
updated: 2026-03-01
tags: [obsidian-plugin, full-stack, dev-pipeline, typescript]

# ── 触发条件（Agent 通过 pattern 匹配决定是否加载此 Skill）──
triggers:
  - pattern: "请基于 dev-skill-text-block-timer.md 执行开发流水线：*"
    description: "完整流水线触发"
  - pattern: "请执行开发流水线：*"
    description: "完整流水线触发（简写）"
  - pattern: "请从 Phase * 开始执行*"
    description: "从指定阶段开始"
  - pattern: "请只执行 Phase *"
    description: "单阶段执行"
  - pattern: "返工 Phase *"
    description: "返工指定阶段"

# ── 输入参数 ──
inputs:
  required:
    - name: requirement
      type: string
      description: "用户的一句话需求描述"
  optional:
    - name: start_phase
      type: integer
      range: [1, 8]
      default: 1
      description: "起始阶段编号（默认从 Phase 1 开始）"
    - name: end_phase
      type: integer
      range: [1, 8]
      default: 8
      description: "结束阶段编号（默认执行到 Phase 8）"
    - name: skip_phases
      type: array<integer>
      default: []
      description: "需要跳过的阶段编号列表"
    - name: only_phase
      type: integer
      range: [1, 8]
      default: null
      description: "仅执行指定的单个阶段"
    - name: existing_prd
      type: file_path
      default: null
      description: "已有的 PRD 文件路径（跳过 Phase 1 时必填）"
    - name: test_chain
      type: string
      default: null
      description: "Phase 8 仅运行指定的测试链名称"

# ── 输出声明 ──
outputs:
  files:
    - path: "doc/PRD-{{feature_name}}.md"
      phase: 1
      description: "产品需求文档"
    - path: "doc/tech-design-{{feature_name}}.md"
      phase: 4
      description: "技术设计文档"
    - path: "doc/test-cases-{{feature_name}}.md"
      phase: 6
      description: "测试用例文档"
    - path: "src/**/*.ts"
      phase: 7
      description: "功能源码"
    - path: "tests/e2e-timer-test.mjs"
      phase: 7
      description: "E2E 测试脚本"
  completion_marker: "[🎉 全流程完成]"

# ── 能力声明（8 个阶段摘要）──
capabilities:
  - phase: 1
    name: "PRD 撰写"
    role: "资深产品经理（10 年经验）"
    output: "doc/PRD-{{feature_name}}.md"
    tools: [read_file, edit_file]

  - phase: 2
    name: "UI/UX Review"
    role: "资深 UI/UX 设计师（8 年经验，桌面 + 移动端）"
    output: "修改后的 PRD（标注 [UX-优化]）"
    tools: [read_file, replace_in_file]

  - phase: 3
    name: "数据表需求设计"
    role: "资深数仓工程师 + 数据分析师"
    output: "数据 Schema 设计（嵌入技术方案或独立输出）"
    tools: [read_file]

  - phase: 4
    name: "技术方案撰写"
    role: "资深前端架构师（8 年 TypeScript 大型项目）"
    output: "doc/tech-design-{{feature_name}}.md"
    tools: [read_file, codebase_search, edit_file]

  - phase: 5
    name: "架构 Review"
    role: "全球顶级首席架构师（15+ 年）"
    output: "Review 报告 + 修复后的技术方案"
    tools: [read_file, codebase_search, replace_in_file]
    branch_logic: "✅→Phase6 | ⚠️→AutoFix→Phase6 | ❌→回退Phase4"

  - phase: 6
    name: "测试用例编写"
    role: "产品经理 + QA 测试负责人"
    output: "doc/test-cases-{{feature_name}}.md"
    tools: [read_file, edit_file]

  - phase: 7
    name: "编码开发"
    role: "资深全栈开发（TypeScript / Obsidian API / CM6 / ECharts）"
    output: "源码 + E2E 测试脚本"
    tools: [read_file, codebase_search, edit_file, replace_in_file, multi_replace, terminal]

  - phase: 8
    name: "测试验证"
    role: "自动化测试工程师"
    output: "测试报告"
    tools: [terminal, read_file]
    branch_logic: "全通过→完成 | 失败→修复→重试(≤3轮) | 3轮失败→BLOCKED"

# ── 执行模式 ──
execution:
  mode: sequential_phases
  total_phases: 8
  allow_skip: true
  allow_jump: true
  allow_single: true
  allow_rework: true
  auto_advance: true

# ── 前置条件 ──
prerequisites:
  - "项目已构建通过（npm run build 无报错）"
  - "Obsidian 开发环境可用（用于 E2E 测试）"

# ── 项目作用域 ──
scope:
  project: text-block-timer
  workspace: "d:\\work_frankthwang\\text-block-timer-dev\\.obsidian\\plugins\\text-block-timer"

# ── 依赖 & 资源引用 ──
dependencies:
  execution_protocol: "doc/dev-skill-text-block-timer.md"
  reference_docs:
    - path: "doc/architecture.md"
      description: "项目整体架构分析"
    - path: "doc/PRD-timer-sidebar.md"
      description: "已有 PRD 参考（Timer Sidebar）"
    - path: "doc/tech-design-timer-sidebar.md"
      description: "已有技术设计参考"
  test_framework: "tests/e2e-timer-test.mjs"

# ── 运行时控制命令 ──
runtime_commands:
  - command: "暂停"
    effect: "暂停当前阶段，等待进一步指示"
  - command: "继续"
    effect: "从暂停处恢复执行"
  - command: "返工 Phase N"
    effect: "回退到 Phase N 重新执行"
  - command: "跳过"
    effect: "跳过当前阶段，进入下一阶段"
  - command: "只测 [chain]"
    effect: "Phase 8 只运行指定的测试链"
---

# Text Block Timer 全流程开发 Skill

> **本文件是 Skill 入口描述文件**，Agent 通过此文件识别 Skill 能力、触发条件和参数定义。
> 详细的执行协议（角色指令、步骤、模板、检查清单）请参阅 →
> [`dev-skill-text-block-timer.md`](./dev-skill-text-block-timer.md)

## 快速调用

### 完整流水线
```
请基于 dev-skill-text-block-timer.md 执行开发流水线：[一句话需求]
```

### 从指定阶段开始
```
请从 Phase 4 开始执行，PRD 在 doc/PRD-xxx.md
```

### 单独执行某阶段
```
请只执行 Phase 1，需求是：[...]
```

### 返工某阶段
```
Phase 3 的数据表设计有问题，请基于以下反馈重做：[...]
```

### 跳过阶段
```
请跳过 Phase 2 和 Phase 3，直接从 Phase 4 开始
```

## 流水线概览

```mermaid
graph LR
    U["🗣️ 需求"] --> P1["Phase 1<br/>PRD"]
    P1 --> P2["Phase 2<br/>UX Review"]
    P2 --> P3["Phase 3<br/>数据设计"]
    P3 --> P4["Phase 4<br/>技术方案"]
    P4 --> P5["Phase 5<br/>架构 Review"]
    P5 -->|"✅/⚠️"| P6["Phase 6<br/>测试用例"]
    P5 -->|"❌"| P4
    P6 --> P7["Phase 7<br/>编码开发"]
    P7 --> P8["Phase 8<br/>测试验证"]
    P8 -->|"失败"| P7
    P8 -->|"✅"| DONE["🎉 完成"]
```
