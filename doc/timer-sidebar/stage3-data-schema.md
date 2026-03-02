# 🗄️ 数据表需求：Timer Sidebar

**文档版本**: v1.0 | **创建日期**: 2026-02-25 | **对应 PRD**: stage1-PRD.md v3.0 | **状态**: 已实现（回溯整理）

> 本文档为回溯性整理，基于已实现的 PRD 和 tech-design 中的数据设计内容汇总而成。

## 一、现有 Schema 分析

### 1.1 timer-db.json 原有结构（Sidebar 开发前）

Sidebar 开发前，`timer-db.json` 仅作为简单的计时器索引，无独立文件——数据存储在 `data.json`（插件设置）中。

### 1.2 IndexedDB 原有 store

Sidebar 开发前无 IndexedDB 存储。

## 二、新增/变更 Schema

### 2.1 JSON 层变更

**新增独立文件 `timer-db.json`**：

```typescript
interface TimerDbFile {
    version: number;           // schema 版本 = 2
    lastFullScan: string;      // ISO 8601，最近一次全量扫描时间
    timers: Record<string, TimerEntry>;    // timerId → 计时器元数据
    daily_dur: Record<string, Record<string, number>>; // date → { timerId → seconds }
}

interface TimerEntry {
    timer_id: string;          // filePath::lineNum
    file_path: string;
    line_num: number;
    line_text: string;         // 去 Markdown 语法后的纯文本摘要
    project: string | null;
    state: 'running' | 'paused' | 'deleted';
    total_dur_sec: number;     // 累计秒数（状态变更时同步）
    last_ts: number;           // Unix 秒，最近状态变更时间戳
    created_at: number;
    updated_at: number;
}
```

| 字段名 | 类型 | 默认值 | 用途 | 索引需求 |
|--------|------|--------|------|----------|
| `timer_id` | string | — | 主键，`filePath::lineNum` | Map key |
| `file_path` | string | — | 相对路径 | `timersByFile` Map |
| `line_num` | number | — | 行号（0-indexed） | — |
| `line_text` | string | — | 纯文本摘要 | — |
| `project` | string \| null | null | 项目标签 | `timersByProject` Map |
| `state` | enum | — | running/paused/deleted | 内存过滤 |
| `total_dur_sec` | number | 0 | 累计秒数 | — |
| `last_ts` | number | — | 最近变更时间戳 | — |
| `created_at` | number | — | 首次创建时间 | — |
| `updated_at` | number | — | 最近更新时间 | — |

### 2.2 IndexedDB 层变更

**新增数据库 `text-block-timer`（version 1）**：

| store 名 | keyPath | 索引 | 变更类型 |
|----------|---------|------|----------|
| `timers` | `timer_id` | 无额外索引 | 新增 |
| `daily_dur` | `key` (`timer_id\|stat_date`) | `by_timer`(timer_id), `by_date`(stat_date) | 新增 |

### 2.3 数据迁移方案

- **首次部署**：无现有数据需迁移，直接创建空库
- **全量扫描初始化**：首次打开全库视图时触发 vault 全量扫描，填充 JSON + IDB
- **增量同步**：后续状态变更通过 `updateEntry` / `patchTimer` 增量更新

## 三、查询场景分析

| 场景 | 查询条件 | 期望响应时间 | 数据量预估 |
|------|----------|-------------|-----------|
| Sidebar 加载当前会话计时器 | 扫描已打开文件 | < 100ms | 0-50 条 |
| Sidebar 加载全库计时器 | 读取 JSON timers + 内存过滤 | < 200ms | 0-500 条活跃 |
| 按日期查询每日时长 | IDB `by_date` 索引 | < 50ms | 0-100 条/天 |
| 按 timer_id 查询历史时长 | IDB `by_timer` 索引 | < 50ms | 0-365 条/timer |
| 文件组筛选 | 内存过滤 `file_path` | < 10ms | 全量遍历 |

## 四、数据一致性保障

### 4.1 三层同步策略

```
Markdown 行内 HTML  ←→  timer-db.json (JSON)  ←→  IndexedDB
       ↑                        ↑                         ↑
   源数据（持久化）        索引 + 快速查询           分天统计 + 图表数据
```

- **状态变更**（暂停/继续/开始/删除）：同时更新 Markdown + JSON + IDB
- **运行中秒数递增**：仅在内存中维护，不写 JSON/IDB（避免频繁 IO）
- **全量扫描**：原子性重建 JSON + IDB，以 Markdown 为权威数据源

### 4.2 冲突解决规则

| 冲突场景 | 解决方式 |
|----------|----------|
| JSON 与 Markdown 不一致 | Markdown 为权威，全量扫描时以 Markdown 覆盖 JSON |
| IDB 与 JSON 不一致 | JSON 为权威，启动时 `seedFromJSON` 重建 IDB |
| 运行中计时器内存值 vs 文件值 | 内存值优先（实时值），侧边栏展示内存值 |

### 4.3 异常恢复方案

| 异常场景 | 恢复机制 |
|----------|----------|
| `timer-db.json` 损坏 | JSON.parse 异常捕获，清空并触发全量扫描 |
| IDB 数据丢失 | 启动时检测，从 JSON 重建 (`seedFromJSON`) |
| 插件崩溃（未正常 unload） | 下次启动时 `recoverCrashedTimers` 处理 running 状态记录 |
| 文件被外部删除 | 监听 vault `delete` 事件，从 JSON + IDB 移除 |
| 文件被外部重命名 | 监听 vault `rename` 事件，更新 JSON + IDB 中的 file_path |
