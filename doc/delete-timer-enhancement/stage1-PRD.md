
# 📋 PRD：删除计时器功能扩展（Delete Timer Enhancement）

**文档版本**: v1.0 | **创建日期**: 2026-03-02 | **状态**: 已审查

---

## 一、需求背景

Text Block Timer 插件目前已支持通过命令/右键菜单主动删除计时器（`delete-timer` 命令）。然而，用户在编辑 Markdown 文档时，可能通过以下方式**无意间删除**包含计时器的文本行：

- 选中多行后按 Delete/Backspace
- 剪切（Ctrl+X）包含计时器的行
- 在编辑过程中误删整行

这些"被动删除"场景下，计时器的 span 从文档中消失，但插件数据库中的记录仍然保留，导致**数据不一致**：Sidebar 仍显示已不存在的计时器，StatusBar 计数不准确。

同时，用户可能通过 Ctrl+Z（Undo）或粘贴（Ctrl+V）将被删除的计时器文本恢复回来，此时需要自动检测并恢复计时器的数据库状态。

## 二、需求目标

1. **自动检测被动删除**：当用户编辑导致 timer span 从文档中消失时，插件自动将该计时器标记为 `deleted` 状态
2. **自动检测被动恢复**：当用户通过 Undo/粘贴使已删除的 timer span 重新出现时，插件自动将该计时器恢复为 `paused` 状态
3. **Running 计时器结算**：如果被删除的计时器处于 running 状态，需先结算已累积的时长到 daily_dur
4. **UI 即时同步**：删除/恢复后 Sidebar 和 StatusBar 立即更新

## 三、用户故事

### US-01: 编辑器被动删除检测
> 作为用户，当我在编辑器中删除包含计时器的文本行时，我希望插件自动检测到这个变化，并将计时器标记为删除状态，使 Sidebar 和 StatusBar 同步更新。

### US-02: 编辑器被动恢复检测
> 作为用户，当我通过 Ctrl+Z 撤销删除后，我希望计时器自动恢复为暂停状态（paused），而不是自动恢复为运行状态，以避免意外计时。

### US-03: Running 计时器删除时时长结算
> 作为用户，当我删除一个正在运行的计时器时，我希望已经累积的计时时长被正确结算并记录到每日统计中，不会丢失任何已计的时间。

### US-04: 剪切粘贴不丢数据
> 作为用户，当我剪切包含计时器的行并粘贴到同一文件的另一位置时，我希望计时器数据完整保留，位置信息更新为新位置。

## 四、功能范围

### In Scope

| 功能项 | 说明 |
|--------|------|
| CM6 被动删除检测 | 通过 `EditorView.updateListener` 检测 timer span 从文档中消失 |
| CM6 被动恢复检测 | 通过 `EditorView.updateListener` 检测 deleted 状态的 timer span 重新出现 |
| Running 计时器时长结算 | 被动删除 running 计时器前，调用 `computeRunningSessionSegments` 结算跨天时长 |
| 三层数据同步 | JSON 内存层 → IDB 异步层 → UI 回调层，保持数据一致 |
| Sidebar 即时同步 | 删除时移除卡片，恢复时添加卡片 |
| StatusBar 即时同步 | 更新运行中计时器计数 |
| 幂等性保障 | 所有删除/恢复操作前先检查当前 state，避免重复处理 |

### Out of Scope

| 排除项 | 理由 |
|--------|------|
| 新的 UI 组件 | 本需求为纯后台逻辑增强，不引入任何新 UI |
| 删除确认弹窗 | 被动删除不应中断编辑流，不弹窗确认 |
| Sidebar 删除/恢复过渡动画 | Nice to Have，推迟到后续统一优化 |
| 恢复后 Notice 提示 | Nice to Have，推迟到后续统一优化 |
| 跨文件剪切粘贴恢复 | 当前全量扫描机制已可处理，不在本期被动检测范围 |
| 预览模式 | 预览模式下不编辑，不会触发被动删除 |
| 外部修改 .md 文件 | 插件仅监控编辑器内的文档变更 |

## 五、功能详情

### 5.1 被动删除检测

**触发条件**：用户在编辑器中进行操作导致 timer span 文本从文档中消失。

**检测机制**：
- 利用 CM6 `EditorView.updateListener` + `update.changes.iterChanges` 获取变更行范围，比较旧文档/新文档中的 timer span 差异
- 仅扫描变更行范围，不做全文档扫描

**处理逻辑**：
1. 对于 **paused** 计时器：直接标记为 `deleted`，更新三层数据，同步 UI
2. 对于 **running** 计时器：
   - 先调用 `computeRunningSessionSegments` 结算跨天时长
   - 将时长写入 `daily_dur`（JSON + IDB）
   - 清除 session 状态
   - 停止 TimerManager 中的计时器
   - 标记为 `deleted`，同步 UI

### 5.2 被动恢复检测

**触发条件**：用户通过 Ctrl+Z（Undo）或粘贴使得已 `deleted` 状态的 timer span 重新出现在文档中。

**处理逻辑**：
- 恢复为 **paused** 状态（不自动恢复为 running，避免意外计时）
- 从 span 的 `data-dur` 和 `data-ts` 属性读取时长和时间戳作为权威数据
- 更新 `file_path` 和 `line_num` 为当前位置
- 不写入文件（span 已在文档中）
- 同步 Sidebar 和 StatusBar

### 5.3 幂等性保障

所有删除/恢复操作前先检查 JSON 内存层中的当前 `state`：
- 已是 `deleted` → 跳过删除操作
- 不是 `deleted` → 跳过恢复操作
- timer 不存在 → 跳过

### 5.4 三层数据同步

遵循现有的三层同步策略：
1. **JSON 内存层**：同步更新（`updateEntry`）
2. **IDB 异步层**：异步 fire-and-forget（`patchTimer` / `addDailyDur`）
3. **UI 层**：同步回调（`notifySidebar*` / `updateStatusBar`）

**顺序约束**：JSON 内存层必须先更新，因为幂等检查依赖 JSON 内存层的同步读取。

## 六、验收标准

### AC-01: Paused 计时器被动删除
- 编辑器中删除包含 paused timer span 的文本行后：
  - JSON state = `deleted`
  - IDB state = `deleted`
  - Sidebar 卡片消失
  - StatusBar 更新

### AC-02: Running 计时器被动删除 + 时长结算
- 编辑器中删除包含 running timer span 的文本行后：
  - JSON state = `deleted`，`total_dur_sec > 0`
  - IDB state = `deleted`
  - daily_dur 有今天的时长记录
  - TimerManager 中该 timer 不再运行

### AC-03: Ctrl+Z 恢复 paused 计时器
- 被动删除 paused timer 后执行 Undo：
  - JSON state = `paused`
  - IDB state = `paused`
  - Sidebar 卡片重新出现
  - 行文本包含 timer span

### AC-04: Ctrl+Z 恢复 running 计时器为 paused
- 被动删除 running timer 后执行 Undo：
  - JSON state = `paused`（**不是** running）
  - TimerManager 中该 timer 不在运行

### AC-05: 剪切粘贴同文件
- 剪切包含 timer 的行 → 剪切后 state = `deleted`
- 粘贴到同文件其他位置 → 粘贴后 state = `paused`，`line_num` 更新为新位置

### AC-06: 多个计时器同时被动删除
- 选中包含多个 timer 的多行文本并删除后，所有 timer 均为 `deleted`

### AC-07: 幂等性
- 对已 `deleted` 的 timer 再次触发被动删除：无副作用，daily_dur 无新增
- 对非 `deleted` 的 timer 触发被动恢复：无副作用

### AC-08: 非计时器行编辑无影响
- 编辑不包含 timer 的行：所有 timer 状态不变，无异常

## 七、非功能需求

### 7.1 性能要求

| 指标 | 目标值 |
|------|--------|
| updateListener 单次执行 | < 2ms |
| 被动删除总耗时 | < 10ms（JSON 同步 + IDB 异步） |
| 被动恢复总耗时 | < 5ms |
| 内存增长 | 0（无新的持久化数据结构） |

### 7.2 兼容性

- 与现有 `handleDelete`（主动删除）和 `handleRestore`（文件恢复）完全独立，互不影响
- 与现有 checkbox-to-timer updateListener 共存，互不干扰
- Obsidian 桌面端 + 移动端均支持

### 7.3 数据安全

- JSON 内存层同步更新确保崩溃后 `seedFromJSON` 可重建 IDB
- `recoverCrashedTimers` 处理残留的 running 状态记录

## 八、UI/UX 约束

1. **不引入任何新 UI 组件**（无弹窗、无 Notice、无新按钮）
2. **不中断编辑流**：被动删除静默处理，不弹出确认框
3. **恢复后为 paused**：避免意外计时，用户需手动 continue
4. 现有 Sidebar / StatusBar 的即时同步机制足以反馈状态变化

## 九、数据方案概述

**无 Schema 变更**。完全复用现有数据结构：
- `TimerEntry.state` 已支持 `'deleted'` 枚举值
- `daily_dur` 已支持按 timer_id 和日期写入时长
- IDB store 无需新增/修改

## 十、技术实现要点

1. **检测机制**：利用 CM6 `EditorView.updateListener` + `update.changes.iterChanges` 获取变更行范围，比较旧文档/新文档中的 timer span 差异
2. **轻量提取**：使用正则表达式（而非 DOM 解析）从文本中提取 timer ID，避免 updateListener 热路径的性能开销
3. **恢复机制**：不复用现有 `handleRestore`（该方法恢复为 running 且需要 view 参数），实现独立的被动恢复方法
4. **幂等保障**：所有删除/恢复操作前先检查 JSON 内存层中的当前 state
5. **三层同步**：遵循 JSON → IDB → UI 的现有同步策略
6. **仅扩展不修改**：不修改任何现有方法签名或行为，仅在 `TimerPlugin` 中新增方法

## 十一、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 大段文本粘贴/删除性能 | 低 | 正则扫描 1000 行文本 < 1ms |
| 高频 Undo/Redo | 低 | 幂等检查确保不重复处理，每次 < 5ms |
| IDB 写入失败 | 低 | 静默降级，下次启动 seedFromJSON 重建 |
| 多面板重复触发 | 低 | 幂等检查基于 JSON 同步读取 |
