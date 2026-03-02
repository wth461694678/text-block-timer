# ✅ 测试用例：Timer Sidebar

**文档版本**: v1.0 | **创建日期**: 2026-02-25 | **对应 PRD**: stage1-PRD.md v3.0 | **状态**: 已实现（回溯整理）

> 本文档为回溯性整理，测试用例已在 `tests/e2e-timer-test.mjs` 的 `chain_sidebar_tabs` 链中实现。

## 一、测试范围

### In Scope
- 侧边栏三档视图切换（active-file / open-tabs / all）
- 计时器筛选（all / running / paused）
- 计时器排序（status / dur-desc / dur-asc）
- 汇总统计区域数据一致性
- 图表数据加载与显示/隐藏切换
- 卡片文件来源标注
- 只读模式下计时器继续运行

### Out of Scope
- 移动端 UI 测试（需手动测试）
- ECharts 图表渲染视觉回归
- 文件组管理设置 UI
- 全库扫描进度 UI

## 二、测试用例

### TC-01: 侧边栏 active-file 视图

- **前置条件**: 当前文件中有一个正在运行的计时器
- **操作步骤**:
  1. 打开侧边栏
  2. 切换 scope 为 `active-file`
  3. 触发数据加载和渲染
- **预期结果**: 仅显示当前活动文件中的计时器，当前测试计时器可见
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 通过 `view.currentScope = 'active-file'` + `view.loadData()` + DOM 查询验证

### TC-02: 侧边栏 open-tabs 视图

- **前置条件**: 当前有打开的标签页，其中包含计时器
- **操作步骤**:
  1. 切换 scope 为 `open-tabs`
  2. 触发数据加载和渲染
- **预期结果**: 显示所有打开标签页中的计时器
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 同 TC-01，验证 `timerList` 包含目标计时器

### TC-03: 侧边栏 all 视图

- **前置条件**: IDB 中有计时器记录
- **操作步骤**:
  1. 切换 scope 为 `all`
  2. 触发数据加载和渲染
- **预期结果**: 显示所有 IDB 中的计时器，数量 ≥ 1
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是

### TC-04: Running 筛选

- **前置条件**: 侧边栏 open-tabs 视图下有 running 和 paused 计时器
- **操作步骤**:
  1. 设置 filter 为 `running`
  2. 渲染侧边栏
- **预期结果**: 仅显示 `.timer-card-running` 卡片，`.timer-card-paused` 数量 = 0
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: DOM 查询 `.timer-card-running` / `.timer-card-paused` 数量

### TC-05: All 筛选重置

- **前置条件**: 当前 filter 为 `running`
- **操作步骤**:
  1. 设置 filter 为 `all`
  2. 渲染侧边栏
- **预期结果**: 显示所有计时器卡片，数量 ≥ 1
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是

### TC-06: 时长降序排序

- **前置条件**: 侧边栏有多个计时器
- **操作步骤**:
  1. 设置 sort 为 `dur-desc`
  2. loadData + render
- **预期结果**: 卡片按时长从大到小排列，`durs[i-1] >= durs[i]`
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 从 DOM 卡片解析 `HH:MM:SS` 转秒数，验证降序

### TC-07: 汇总统计数据一致性

- **前置条件**: 侧边栏以 open-tabs + status 排序 + all 过滤展示
- **操作步骤**:
  1. 读取 `timerList` 的 running/paused/total 数量
  2. 读取 DOM 中 `data-summary-count`、`data-summary-running-count`、`data-summary-paused-count`
- **预期结果**: DOM 统计数与 timerList 数据完全匹配
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是

### TC-08: 图表数据包含今日

- **前置条件**: 当前有运行中的计时器，产生了今日时长
- **操作步骤**:
  1. 读取 `chartDataCache`
- **预期结果**: `dates` 包含今日，至少一个项目今日时长 > 0
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是

### TC-09: 统计图表显示/隐藏

- **前置条件**: 侧边栏已打开
- **操作步骤**:
  1. 设置 `showStatistics = false` + render → 验证 chartInstance === null
  2. 设置 `showStatistics = true` + render → 验证 chartInstance !== null
- **预期结果**: 图表正确显示/隐藏
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是

### TC-10: 卡片文件来源标注

- **前置条件**: 侧边栏有计时器卡片
- **操作步骤**:
  1. 查找 `.timer-card-file-source` 元素
- **预期结果**: 文件来源包含正确的行号（如 `:N`）
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是

### TC-11: 只读模式下计时器继续运行

- **前置条件**: 编辑器中有运行中的计时器
- **操作步骤**:
  1. 记录当前 dur
  2. 切换至预览/只读模式
  3. 等待 3 秒
  4. 检查 dur 是否增长
- **预期结果**: 计时器在只读模式下继续计时
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 使用 `view.setState({ mode: 'preview' })` 切换模式

## 三、E2E 自动化测试链设计

### 测试链划分

| 链名 | 包含用例 | 依赖链 | 预估时长 |
|------|---------|--------|---------|
| `sidebar_tabs` | TC-01 ~ TC-10 | `preflight`, `basic` | ~15s |
| `readonly` | TC-11 | `preflight`, `basic` | ~10s |

### 断言策略

- **IDB 层**: `idbGetTimer(id)` / `idbGetDailyByTimer(id)` — 验证数据持久化
- **JSON 层**: `app.plugins.plugins['text-block-timer'].database.data` — 验证 JSON 同步
- **UI 层**: DOM 查询 `.timer-card` / `.timer-card-running` / `data-summary-*` 等
- **跨层一致性**: timerList 内存数据 == DOM 统计数

### 清理策略

- `sidebar_tabs` 链使用 `cleanup_basic` 清理函数
- `readonly` 链结束后自动切回源码模式

## 四、移动端测试要点

| 场景 | 测试方式 | 备注 |
|------|----------|------|
| 侧边栏底部抽屉展示 | 手动 | 验证在 iOS/Android 上以底部面板形式打开 |
| 触控操作 | 手动 | 点击卡片跳转、切换视图 |
| 小屏幕布局降级 | 手动 | 宽度 < 200px 时隐藏文件来源行 |
| 状态栏更新 | 手动 | 验证移动端状态栏显示计时信息 |
