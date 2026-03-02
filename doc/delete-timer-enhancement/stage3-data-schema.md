# 🗄️ 数据表需求：删除计时器功能扩展

**文档版本**: v1.0 | **创建日期**: 2026-03-02 | **对应 PRD**: stage1-PRD.md v1.0 | **状态**: 已审查

## 一、现有 Schema 分析

### 1.1 timer-db.json 现有结构

```typescript
interface TimerDbFile {
    version: number;           // schema 版本 = 2
    lastFullScan: string;      // ISO 8601，最近一次全量扫描时间
    timers: Record<string, TimerEntry>;    // timerId → 计时器元数据
    daily_dur: Record<string, Record<string, number>>; // date → { timerId → seconds }
}

interface TimerEntry {
    timer_id: string;
    file_path: string;
    line_num: number;
    line_text: string;
    project: string | null;
    state: 'running' | 'paused' | 'deleted' | 'lost';  // deleted 已支持
    total_dur_sec: number;
    last_ts: number;
    created_at: number;
    updated_at: number;
}
```

**关键发现**：`state` 字段已包含 `'deleted'` 枚举值，无需扩展。

### 1.2 IndexedDB 现有 store

| store 名 | keyPath | 索引 | 说明 |
|----------|---------|------|------|
| `timers` | `timer_id` | 无额外索引 | 计时器主表，state 已支持 `'deleted'` |
| `daily_dur` | `key` (`timer_id\|stat_date`) | `by_timer`(timer_id), `by_date`(stat_date) | 每日时长表 |

### 1.3 内存层辅助数据

| 数据结构 | 位置 | 用途 |
|----------|------|------|
| `timersByFile: Map<string, Set<string>>` | `TimerDatabase` | 按文件路径索引计时器 ID |
| `sessionStartDate: Map<string, string>` | `TimerDatabase` | 跨天检测：计时器会话开始日期 |
| `sessionStartTs: Map<string, number>` | `TimerDatabase` | 跨天检测：计时器会话开始时间戳 |

### 1.4 已有关键方法

| 方法 | 位置 | 用途 | 本需求是否复用 |
|------|------|------|----------------|
| `updateEntry(timerId, patch)` | `TimerDatabase` | 更新 JSON 层 timer 记录 | ✅ 删除/恢复时更新 state |
| `patchTimer(timerId, patch)` | `TimerIndexedDB` | 更新 IDB 层 timer 记录 | ✅ 删除/恢复时同步 IDB |
| `computeRunningSessionSegments(timerId)` | `TimerDatabase` | 计算 running 会话的跨天时长分段 | ✅ 删除 running 计时器时结算时长 |
| `addDailyDurInMemory(timerId, date, deltaSec)` | `TimerDatabase` | JSON 层写入每日时长 | ✅ 时长结算写入 |
| `addDailyDur(timerId, date, deltaSec)` | `TimerIndexedDB` | IDB 层写入每日时长 | ✅ 时长结算同步 IDB |
| `clearSessionStart(timerId)` | `TimerDatabase` | 清除会话开始记录 | ✅ 删除后清理 |

## 二、新增/变更 Schema

### 2.1 JSON 层变更

**无变更**。现有 `TimerDbFile` 和 `TimerEntry` 结构完全满足需求：

- `state: 'deleted'` — 已存在，用于标记被动删除的计时器
- `daily_dur` — 已存在，用于存储 running 计时器删除前的时长结算
- `total_dur_sec` — 已存在，恢复时从 span 的 `data-dur` 属性读回

### 2.2 IndexedDB 层变更

**无变更**。现有 `timers` 和 `daily_dur` store 完全满足需求：

- `IDBTimerEntry.state` — 已支持 `'deleted'`
- `daily_dur` store — 已支持按 timer_id 写入每日时长

### 2.3 数据迁移方案

**无需迁移**。本需求不引入任何新的数据字段或 store，完全复用现有数据结构。

## 三、查询场景分析

| 场景 | 查询条件 | 期望响应时间 | 数据量预估 |
|------|----------|-------------|-----------|
| 被动删除时检查计时器当前状态 | `this.database.data.timers[timerId]?.state` (JSON 内存) | < 1ms（同步读取） | 单条 |
| 恢复时检查计时器是否为 deleted | `this.database.data.timers[timerId]?.state === 'deleted'` (JSON 内存) | < 1ms（同步读取） | 单条 |
| Running 计时器删除时计算跨天分段 | `computeRunningSessionSegments(timerId)` (内存计算) | < 1ms | 1-N 分段（通常 1-2） |
| 删除后更新 daily_dur | `addDailyDurInMemory` + `addDailyDur` | < 5ms（JSON 同步 + IDB 异步） | 1-N 条 |

**性能结论**：所有幂等检查通过 JSON 内存层同步完成（< 1ms），不引入额外 IO 开销。

## 四、数据一致性保障

### 4.1 三层同步策略

本需求的数据操作严格遵循已有的三层同步策略：

```
被动删除流程：
  [1] JSON memory  → updateEntry(timerId, { state: 'deleted', ... })     [同步]
  [2] IDB async    → patchTimer(timerId, { state: 'deleted', ... })      [异步]
  [3] UI           → notifySidebarTimerRemoved + updateStatusBar          [同步回调]

恢复流程：
  [1] JSON memory  → updateEntry(timerId, { state: 'paused', ... })      [同步]
  [2] IDB async    → patchTimer(timerId, { state: 'paused', ... })       [异步]
  [3] UI           → notifySidebarTimerAdded + updateStatusBar            [同步回调]
```

**顺序约束**：JSON 内存层必须先更新，因为幂等检查依赖 JSON 内存层的同步读取。

### 4.2 冲突解决规则

| 冲突场景 | 解决方式 |
|----------|----------|
| 多面板重复触发删除/恢复 | JSON 内存层幂等检查：`state === 'deleted'` 则跳过删除；`state !== 'deleted'` 则跳过恢复 |
| 删除与恢复快速交替（Undo/Redo） | 按时间顺序逐个处理，每次操作前检查最新 state |
| Running 计时器删除时 IDB 写入 daily_dur 失败 | JSON 层已写入 daily_dur，下次启动时 `seedFromJSON` 重建 IDB |
| 恢复时 span 中 data-dur 与 JSON 不一致 | 以 span 为权威数据源（Markdown 是持久化层） |

### 4.3 异常恢复方案

| 异常场景 | 恢复机制 |
|----------|----------|
| 删除流程中途插件崩溃（JSON 已更新但 IDB 未更新） | 下次启动 `seedFromJSON` 重建 IDB，最终一致 |
| 恢复流程中途插件崩溃 | 同上 |
| Running 计时器删除时时长结算未完成就崩溃 | `recoverCrashedTimers` 在下次启动时处理残留的 running 状态记录 |

## 五、总结

本需求是一个**纯逻辑层扩展**，完全复用现有数据结构，不需要任何 Schema 变更或数据迁移：

| 维度 | 结论 |
|------|------|
| JSON 层 Schema 变更 | 无 |
| IDB 层 Schema 变更 | 无 |
| 新增 store / 索引 | 无 |
| 数据迁移 | 无 |
| 已有方法复用 | `updateEntry` / `patchTimer` / `computeRunningSessionSegments` / `addDailyDur*` / `clearSessionStart` |
| 幂等保障 | JSON 内存层同步检查 `state` 字段 |
