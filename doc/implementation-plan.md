# 📋 实现计划：Timer Sidebar

**文档版本**: v1.0
**创建日期**: 2026-02-25
**依赖文档**: tech-design-timer-sidebar.md v1.0 / PRD-timer-sidebar.md v2.1
**执行对象**: 开发 Agent

---

## 阅读须则

1. **按任务编号顺序执行**，每个任务有明确的前置依赖
2. **每个任务完成后必须通过验收标准**，再进入下一个任务
3. **不得修改任务范围外的代码**，除非任务明确说明
4. 技术细节（接口签名、数据结构、实现代码）以 **tech-design-timer-sidebar.md** 为准
5. 遇到文档未覆盖的边界情况，优先保持与现有代码风格一致

---

## 任务总览

```
M0 底层扩展（无 UI）
├── T01  扩展 TimerData 接口，新增 project 字段
├── T02  扩展 TimerParser，解析 data-project 属性
├── T03  扩展 TimerRenderer，输出时保留 data-project 属性
├── T04  实现 TimerDatabase 核心骨架（加载/保存/索引）
├── T05  实现 TimerDatabase 增量写入接口
├── T06  实现 TimerDatabase 跨天检测与崩溃恢复
└── T07  实现 TimerScanner

M1 基础侧边栏（当前会话视图，只读展示）
├── T08  注册侧边栏视图，接入 TimerPlugin
├── T09  实现侧边栏工具栏（视图切换 + 筛选 + 排序控件）
├── T10  实现计时器卡片渲染
└── T11  实现汇总统计行

M2 实时更新 + 当前文件视图 + 跳转
├── T12  实现 refreshRunningTimers（每秒局部刷新）
├── T13  实现当前文件视图（active-file scope）
└── T14  实现卡片点击跳转

M3 侧边栏操作 + 数据库同步 + 状态栏
├── T15  侧边栏内暂停/继续操作，联动 TimerPlugin
├── T16  TimerPlugin 操作时同步写入 TimerDatabase
├── T17  实现状态栏
└── T18  实现 onunload 同步上报

M4 全库视图 + 文件组管理
├── T19  实现全库扫描 UI 与进度展示
├── T20  实现全库视图列表渲染
├── T21  实现文件组管理设置 UI
└── T22  监听文件删除/重命名事件，同步数据库
```

---

## M0：底层扩展

> **目标**：在不影响任何现有功能的前提下，完成数据层和工具层的扩展，为后续 UI 开发打好基础。

---

### T01 · 扩展 TimerData 接口，新增 project 字段

**文件**：`src/core/TimerDataUpdater.ts`

**实现重点**：
- 在 `TimerData` 接口中新增 `project?: string | null` 可选字段
- `TimerDataUpdater.calculate()` 的各个 case（`init`、`continue`、`pause`、`update` 等）在构造返回值时，通过展开运算符 `...currentData` 自动透传 `project` 字段，**无需逐个 case 手动处理**
- 不修改任何现有逻辑，仅新增字段

**验收标准**：
- TypeScript 编译无报错
- 现有计时器功能（启动/暂停/继续/删除）行为不变

---

### T02 · 扩展 TimerParser，解析 data-project 属性

**文件**：`src/io/TimerParser.ts`

**实现重点**：
- 在 `parseNewFormat`（解析 `<span>` 标签的方法）中，从 `timerEl.dataset.project` 读取 `project` 值
- 若属性不存在则赋值 `null`，将 `project` 字段包含在返回的 `TimerData` 对象中
- 旧格式解析路径（`parseOldFormat`）不需要处理 `project`，返回 `project: null` 即可

**验收标准**：
- 解析含 `data-project="xxx"` 的 span 标签时，返回的 `TimerData.project === 'xxx'`
- 解析不含 `data-project` 的 span 标签时，返回的 `TimerData.project === null`
- 现有解析逻辑不受影响

---

### T03 · 扩展 TimerRenderer，输出时保留 data-project 属性

**文件**：`src/io/TimerRenderer.ts`

**实现重点**：
- 在 `render()` 方法生成 HTML 字符串时，若 `timerData.project` 有值，则在 `<span>` 标签中追加 `data-project="${timerData.project}"` 属性
- 若 `project` 为 `null` 或 `undefined`，则不输出该属性（保持旧格式兼容）
- 属性顺序建议放在 `data-ts` 之后

**验收标准**：
- `project` 有值时，渲染输出的 HTML 包含 `data-project` 属性
- `project` 为 `null` 时，渲染输出的 HTML 不含 `data-project` 属性
- 现有渲染输出格式不变（仅条件追加属性）

---

### T04 · 实现 TimerDatabase 核心骨架

**文件**：`src/core/TimerDatabase.ts`（新建）

**实现重点**：
- 定义 `TimerDbFile`、`TimerEntry`、`TimerSession` 接口（参考 tech 文档 2.3 节）
- 实现 `TimerDatabase` 类，包含：
  - `DB_PATH` 常量：`.obsidian/plugins/text-block-timer/timer-db.json`（通过 `plugin.app.vault.configDir` 拼接）
  - `load()`：尝试读取并 JSON.parse，失败则初始化空库；读取成功后调用 `buildIndexes()`
  - `buildIndexes()`：遍历 `data.timers`，构建 `timersByFile` Map（`filePath → Set<timer_id>`）
  - `exists()`：返回 `this.data !== null`
  - `getLastFullScan()`：返回 `data.lastFullScan`
  - `createEmptyDb()`：返回符合 `TimerDbFile` 结构的空对象（`version: 1`，空 timers/sessions）
- 实现 `flush()`（异步写入）和 `flushSync()`（同步写入，使用 Node.js `fs.writeFileSync`）
- 实现 `scheduleFlush()`：100ms debounce，调用 `flush()`

**验收标准**：
- 插件加载时调用 `database.load()` 不报错
- 首次加载（文件不存在）时，`data` 为空库结构，`exists()` 返回 `false`
- 二次加载（文件已存在）时，数据正确恢复

---

### T05 · 实现 TimerDatabase 增量写入接口

**文件**：`src/core/TimerDatabase.ts`

**实现重点**：
- `updateEntry(timerId, patch)`：合并 patch 到 `data.timers[timerId]`，更新 `timersByFile` 索引，调用 `scheduleFlush()`
- `updateEntrySync(timerId, patch)`：同 `updateEntry` 但不 debounce，直接修改内存（供 `onunload` 使用，不触发 flush，由调用方统一调用 `flushSync()`）
- `appendSession(session)`：push 到 `data.sessions`，调用 `scheduleFlush()`
- `appendSessionSync(timerId, endReason)`：同步构造 session 对象并 push，不触发 flush
- `removeFile(filePath)`：删除 `timersByFile` 中该文件的所有 timer_id，并从 `data.timers` 中删除对应条目，调用 `scheduleFlush()`
- `renameFile(oldPath, newPath)`：更新所有相关 `TimerEntry.file_path`，重建 `timersByFile` 索引，调用 `scheduleFlush()`
- `queryTimers(filter, sort)`：在内存中过滤 `data.timers`，返回排序后的 `TimerEntry[]`
- `querySessionsByDate(date)`：过滤 `data.sessions`，返回指定日期的 sessions
- `rebuild(entries, sessions)`：原子性替换整个数据库内容，调用 `flush()`（非 debounce，立即写入）

**验收标准**：
- `updateEntry` 后调用 `queryTimers` 能查到更新后的数据
- `appendSession` 后 `data.sessions` 长度 +1
- `removeFile` 后该文件的 timers 从内存和磁盘消失
- `rebuild` 后数据库内容完整替换

---

### T06 · 实现 TimerDatabase 跨天检测与崩溃恢复

**文件**：`src/core/TimerDatabase.ts`

**实现重点**：
- `recordSessionStart(timerId)`：将当前日期（`YYYY-MM-DD`，本地时区）存入 `sessionStartDate` Map
- `clearSessionStart(timerId)`：从 `sessionStartDate` Map 删除该 timerId
- `checkDayBoundary(timerId)`（async）：
  - 取 `sessionStartDate.get(timerId)`，若不存在则直接返回
  - 获取今日日期，若与记录日期相同则直接返回
  - 若不同：追加一条 `end_reason: 'day_boundary'` 的 session（duration = 今日零点 - session 开始时刻），然后更新 `sessionStartDate` 为今日
- `recoverCrashedSessions()`（async）：
  - 遍历 `data.timers`，找出所有 `state === 'running'` 的条目
  - 对每条追加 `end_reason: 'crash_recovery'` 的 session
  - 将这些条目的 `state` 更新为 `'paused'`
  - 调用 `flush()`

**验收标准**：
- 模拟跨天场景：`sessionStartDate` 中存有昨日日期，调用 `checkDayBoundary` 后，`data.sessions` 新增一条 `day_boundary` session，且 `sessionStartDate` 更新为今日
- 模拟崩溃恢复：数据库中存在 `state=running` 的条目，调用 `recoverCrashedSessions()` 后，这些条目变为 `paused`，且新增 `crash_recovery` session

---

### T07 · 实现 TimerScanner

**文件**：`src/core/TimerScanner.ts`（新建）

**实现重点**：
- 定义 `ScannedTimer` 接口（参考 tech 文档 4.2 节）
- `scanFile(file)`：读取文件内容，逐行调用 `TimerParser.parse()`，收集所有计时器；对运行中的计时器，优先使用 `TimerManager` 内存中的 `dur`（实时值）替代文件中的快照值
- `scanFiles(files)`：并发调用 `scanFile()`（`Promise.all`），合并结果
- `scanVaultStream(onProgress, signal)`（AsyncGenerator）：
  - 获取所有 `.md` 文件列表
  - 逐文件读取并解析，每处理完一个文件 `yield` 其中的计时器
  - 每 50 个文件调用一次 `onProgress` 并 `await new Promise(r => setTimeout(r, 0))` 让出主线程
  - 每次循环开头检查 `signal.aborted`，若已取消则直接 `return`
- `scanVault(onProgress, signal)`：收集 `scanVaultStream` 的全部结果；若 `signal.aborted` 则返回 `null`
- `static extractLineText(rawLine)`：去除 Markdown 语法（`#`、`*`、`-`、`[ ]` 等），返回纯文本摘要，超过 50 字符截断

**验收标准**：
- `scanFile` 能正确解析含计时器的 markdown 文件，返回 `ScannedTimer[]`
- 运行中计时器的 `dur` 使用内存值（比文件值大）
- `scanVault` 取消时返回 `null`，不修改数据库

---

## M1：基础侧边栏（当前会话视图，只读展示）

> **目标**：实现可打开的侧边栏，展示当前已打开标签页中的计时器列表（open-tabs scope），支持筛选和排序，但此阶段操作按钮不可用。

---

### T08 · 注册侧边栏视图，接入 TimerPlugin

**文件**：`src/ui/TimerSidebarView.ts`（新建）、`src/main.ts`

**实现重点**：

**TimerSidebarView.ts**：
- 继承 `ItemView`，实现 `getViewType()`（返回 `'timer-sidebar'`）、`getDisplayText()`、`getIcon()`
- 构造函数接收 `leaf` 和 `plugin: TimerPlugin`
- `onOpen()`：初始化容器 DOM 结构（工具栏区、汇总区、列表区），调用 `loadData()` 加载数据并 `render()`
- `onClose()`：取消正在进行的扫描（`scanAbortController?.abort()`）
- `loadOpenTabsData()`：获取所有已打开的 markdown leaf，调用 `scanner.scanFiles()` 扫描，结果存入 `this.timerList`

**main.ts**：
- 在 `onload()` 中初始化 `this.database` 和 `this.scanner`，调用 `this.database.load()`，再调用 `this.database.recoverCrashedSessions()`
- 注册视图类型：`this.registerView('timer-sidebar', leaf => new TimerSidebarView(leaf, this))`
- 添加 Ribbon 图标（`timer` 图标），点击时调用 `openSidebar()`
- 实现 `openSidebar()`：若侧边栏已存在则激活，否则在右侧创建新 leaf 并打开视图
- 注册 `layout-change` 事件：`this.registerEvent(this.app.workspace.on('layout-change', ...))`，转发给 `sidebarView.onLayoutChange()`

**验收标准**：
- 点击 Ribbon 图标能打开侧边栏
- 侧边栏显示当前已打开 markdown 文件中的计时器（即使列表为空也不报错）
- 关闭侧边栏不报错，重新打开能正常加载

---

### T09 · 实现侧边栏工具栏

**文件**：`src/ui/TimerSidebarView.ts`、`styles.css`

**实现重点**：
- `renderToolbar()`：在工具栏容器中渲染三组控件：
  - **视图切换**（Segmented Control 样式）：`当前文件` / `当前会话` / `全部`，对应 `active-file` / `open-tabs` / `all`
  - **状态筛选**（下拉或按钮组）：`全部` / `运行中` / `已暂停`
  - **排序**（下拉）：`状态优先` / `时长↓` / `时长↑` / `文件名↓` / `文件名↑` / `最近更新`
- 每个控件变化时更新对应的 `currentScope` / `currentFilter` / `currentSort`，然后调用 `loadData()` + `render()`
- 当前激活状态通过 CSS class 体现（如 `is-active`）
- `全部` 视图的按钮此阶段点击后显示"功能开发中"提示（M4 实现）

**验收标准**：
- 三组控件均可点击，激活状态视觉反馈正确
- 切换筛选/排序后，列表重新渲染（即使数据相同）
- 切换到 `全部` 视图时显示提示，不崩溃

---

### T10 · 实现计时器卡片渲染

**文件**：`src/ui/TimerSidebarView.ts`、`styles.css`

**实现重点**：
- `renderTimerList()`：遍历经过筛选和排序后的 `timerList`，为每个计时器调用 `renderTimerCard()` 并追加到列表容器
- 筛选逻辑（在内存中执行）：
  - `filter === 'running'`：只保留 `state === 'timer-r'` 的条目
  - `filter === 'paused'`：只保留 `state === 'timer-p'` 的条目
- 排序逻辑（在内存中执行）：按 `currentSort` 对 `timerList` 排序（`status` 排序时运行中排前面）
- `renderTimerCard(timer)`：渲染单张卡片，包含：
  - **状态指示器**：运行中显示绿色动态圆点，已暂停显示灰色静态圆点
  - **时长显示**：使用 `TimeFormatter.formatTime(timer.dur, settings.timeDisplayFormat)`，运行中的计时器给该元素加 `data-timer-id` 属性（供 `refreshRunningTimers` 定位）
  - **文本摘要**：`timer.lineText`，超长截断
  - **文件来源**：`文件名:行号`（如 `daily.md:12`）
  - **项目标签**：若 `timer.project` 有值则显示标签徽章
  - **操作按钮区**：此阶段渲染暂停/继续按钮但标记为 `disabled`（M3 实现交互）
- `renderEmptyState()`：列表为空时显示友好提示文案

**验收标准**：
- 有计时器时，每个计时器对应一张卡片，信息显示正确
- 无计时器时，显示空状态提示
- 运行中/已暂停的卡片视觉区分明显
- `project` 有值时显示标签，无值时不显示

---

### T11 · 实现汇总统计行

**文件**：`src/ui/TimerSidebarView.ts`、`src/core/TimerSummary.ts`（新建）

**实现重点**：
- 新建 `TimerSummary` 类（纯函数，参考 tech 文档 3.2 节）：
  - `static calculate(timers, manager)`：遍历计时器列表，运行中的取内存实时值，已暂停的取快照值，统计总时长和运行中数量
  - `static format(summary)`：格式化为 `"X running · HH:MM:SS"` 字符串
- `renderSummary()`：调用 `TimerSummary.calculate()` 和 `format()`，将结果渲染到汇总区容器

**验收标准**：
- 汇总行显示正确的运行中数量和总时长
- 无计时器时显示 `"0 running · 00:00:00"`

---

## M2：实时更新 + 当前文件视图 + 跳转

> **目标**：侧边栏与计时器 tick 同步刷新时长，支持当前文件视图，卡片可点击跳转。

---

### T12 · 实现 refreshRunningTimers（每秒局部刷新）

**文件**：`src/ui/TimerSidebarView.ts`、`src/main.ts`

**实现重点**：

**TimerSidebarView.ts**：
- `refreshRunningTimers()`：
  - 查询 DOM 中所有带 `data-timer-id` 属性的时长元素
  - 对每个元素，从 `plugin.manager.getTimerData(timerId)` 获取最新 `dur`
  - 仅更新该文本节点的内容，**不重新渲染整个卡片或列表**
  - 同时更新汇总行（调用 `renderSummary()`）

**main.ts**：
- 在 `onTick()` 末尾新增：`this.refreshSidebar()`
- 实现 `refreshSidebar()`：获取侧边栏视图实例，若存在则调用 `sidebarView.refreshRunningTimers()`
- 获取侧边栏视图实例的方式：`this.app.workspace.getLeavesOfType('timer-sidebar')[0]?.view as TimerSidebarView`

**验收标准**：
- 有运行中计时器时，侧边栏时长每秒自动更新
- 更新时不发生列表闪烁（仅文本节点变化）
- 无运行中计时器时，`refreshRunningTimers()` 调用无副作用

---

### T13 · 实现当前文件视图（active-file scope）

**文件**：`src/ui/TimerSidebarView.ts`、`src/main.ts`

**实现重点**：

**TimerSidebarView.ts**：
- `loadActiveFileData()`：获取当前激活的 markdown 文件（`plugin.app.workspace.getActiveFile()`），调用 `scanner.scanFile()` 扫描，结果存入 `timerList`；若无激活文件则 `timerList = []`
- `onActiveLeafChange(leaf)`：若当前 scope 为 `active-file`，则调用 `loadActiveFileData()` + `render()`
- 在 `onOpen()` 中注册 `ResizeObserver`（参考 tech 文档 4.3 节），宽度 < 200px 时给容器加 `timer-sidebar-compact` class

**main.ts**：
- 注册 `active-leaf-change` 事件，转发给 `sidebarView.onActiveLeafChange(leaf)`

**styles.css**：
- `.timer-sidebar-compact .timer-card-file-source { display: none; }`

**验收标准**：
- 切换到 `当前文件` 视图后，列表只显示当前激活文件的计时器
- 切换激活文件后，列表自动更新
- 侧边栏宽度 < 200px 时，文件来源行自动隐藏

---

### T14 · 实现卡片点击跳转

**文件**：`src/ui/TimerSidebarView.ts`

**实现重点**：
- 在 `renderTimerCard()` 中，给文件来源区域（`文件名:行号`）绑定 `click` 事件
- 点击时：
  1. 通过 `vault.getAbstractFileByPath(timer.filePath)` 获取文件对象，若不存在则 `new Notice('⚠️ File not found')` 并返回
  2. 调用 `workspace.getLeaf(false).openFile(file)` 打开文件
  3. 等待编辑器加载（使用 `setTimeout` 或 `workspace.onLayoutReady` 回调）
  4. 获取 `MarkdownView`，调用 `editor.setCursor({ line: timer.lineNum, ch: 0 })` 和 `editor.scrollIntoView(...)` 定位到目标行
- 整个流程包裹在 `try/catch` 中，异常时显示 Notice

**验收标准**：
- 点击文件来源区域，编辑器跳转到对应文件的对应行
- 文件不存在时显示错误提示，不崩溃
- 跳转后光标定位在目标行

---

## M3：侧边栏操作 + 数据库同步 + 状态栏

> **目标**：侧边栏内的暂停/继续按钮可用，操作同步写入数据库，新增状态栏显示，插件卸载时安全上报数据。

---

### T15 · 侧边栏内暂停/继续操作

**文件**：`src/ui/TimerSidebarView.ts`

**实现重点**：
- 将 T10 中渲染的操作按钮从 `disabled` 改为可交互
- 暂停按钮点击时：
  1. 通过 `timer.filePath` 和 `timer.lineNum` 定位目标
  2. 尝试获取该文件对应的 EditorView（优先激活 leaf，其次遍历所有 markdown leaf）
  3. 若找到 EditorView：调用 `plugin.handlePause(view, lineNum, parsedData)`
  4. 若未找到（文件未打开）：通过 `vault.read()` 读取文件内容，重新解析目标行，再通过 `vault.modify()` 写入（降级模式）
  5. 操作完成后调用 `loadData()` + `render()` 刷新列表
- 继续按钮同理，调用 `plugin.handleContinue()`
- 降级模式（文件未打开）的实现：读取文件 → 按行分割 → 解析目标行 → 计算新状态 → 替换目标行 → 写回文件

**验收标准**：
- 文件已打开时，侧边栏暂停/继续操作与编辑器内操作效果一致
- 文件未打开时，操作仍然生效（文件内容被正确修改）
- 操作后侧边栏列表状态立即更新

---

### T16 · TimerPlugin 操作时同步写入 TimerDatabase

**文件**：`src/main.ts`

**实现重点**：
- 在 `handleStart()` 末尾新增：
  - `await this.database.updateEntry(timerId, { ...entry })` 写入新计时器元数据
  - `this.database.recordSessionStart(timerId)` 记录 session 开始日期
- 在 `handleContinue()` 末尾新增：
  - `await this.database.updateEntry(timerId, { state: 'running', ... })`
  - `this.database.recordSessionStart(timerId)`
- 在 `handlePause()` 末尾新增：
  - `await this.database.updateEntry(timerId, { state: 'paused', total_dur_sec: newData.dur, last_ts: ... })`
  - `await this.database.appendSession({ end_reason: 'paused', duration_sec: ..., ... })`
  - `this.database.clearSessionStart(timerId)`
- 在 `handleDelete()` 末尾新增：
  - `await this.database.updateEntry(timerId, { state: 'deleted' })`
  - 若计时器正在运行，追加 `end_reason: 'deleted'` session 并 `clearSessionStart`
- 在 `onTick()` 末尾新增：
  - `await this.database.checkDayBoundary(timerId)`（必须 await）

**验收标准**：
- 启动计时器后，`timer-db.json` 中出现对应的 `TimerEntry`
- 暂停后，`timer-db.json` 中出现对应的 `TimerSession`，`state` 更新为 `paused`
- 跨天场景（手动修改系统时间测试）：出现 `day_boundary` session

---

### T17 · 实现状态栏

**文件**：`src/main.ts`

**实现重点**：
- `initStatusBar()`：调用 `this.addStatusBarItem()` 创建状态栏元素，存入 `this.statusBarItem`；若 `settings.showStatusBar === false` 则隐藏
- `updateStatusBar()`：
  - 获取所有运行中计时器的总时长（从 `manager` 获取）
  - 若有运行中计时器：显示 `⏳ X running · HH:MM:SS`
  - 若无运行中计时器：隐藏状态栏元素（`statusBarItem.style.display = 'none'`）
- 在 `onTick()` 末尾调用 `this.updateStatusBar()`
- 在 `onload()` 末尾调用 `this.initStatusBar()`

**验收标准**：
- 有运行中计时器时，状态栏显示数量和总时长，每秒更新
- 无运行中计时器时，状态栏隐藏
- 设置中关闭状态栏后，状态栏不显示

---

### T18 · 实现 onunload 同步上报

**文件**：`src/main.ts`

**实现重点**：
- 在现有 `onunload()` 开头（`manager.clearAll()` 之前）新增：
  1. 获取所有运行中计时器：`this.manager.getAllTimers()`（需确认 `TimerManager` 是否有此方法，若无则通过 `manager.timers` Map 遍历）
  2. 对每个运行中计时器（`data.class === 'timer-r'`）：
     - 调用 `this.database.appendSessionSync(timerId, 'plugin_unload')`
     - 调用 `this.database.updateEntrySync(timerId, { state: 'paused', last_ts: Date.now() / 1000 | 0 })`
  3. 调用 `this.database.flushSync()` 同步写入磁盘
- `flushSync()` 使用 `require('fs').writeFileSync`，路径通过 `(app.vault.adapter as any).basePath` 拼接

**验收标准**：
- 禁用插件后，`timer-db.json` 中运行中的计时器状态变为 `paused`，且有 `plugin_unload` session 记录
- 重新启用插件后，不触发崩溃恢复（因为 `state` 已是 `paused`）

---

## M4：全库视图 + 文件组管理

> **目标**：实现全库扫描和全库视图，支持文件组筛选，监听文件系统事件保持数据库同步。

---

### T19 · 实现全库扫描 UI 与进度展示

**文件**：`src/ui/TimerSidebarView.ts`

**实现重点**：
- 在 `loadAllData()` 中：
  1. 若 `database.exists()` 且 `lastFullScan` 在 24 小时内：直接从数据库加载，不重新扫描
  2. 否则：显示扫描进度 UI（进度条 + `Scanned X / Y files` 文本）
  3. 创建 `AbortController`，存入 `this.scanAbortController`
  4. 调用 `scanner.scanVault(onProgress, signal)`
  5. 若返回 `null`（用户取消）：恢复原列表，隐藏进度 UI
  6. 若返回结果：调用 `database.rebuild(entries, sessions)`，更新 `timerList`，隐藏进度 UI
- 进度 UI 包含"取消"按钮，点击时调用 `scanAbortController.abort()`
- 扫描超过 3 秒才显示进度条（避免快速扫描时的闪烁）

**验收标准**：
- 切换到 `全部` 视图时触发扫描（或从缓存加载）
- 扫描过程中进度条正确更新
- 点击取消后，列表恢复到取消前的状态
- 扫描完成后，`timer-db.json` 被更新

---

### T20 · 实现全库视图列表渲染

**文件**：`src/ui/TimerSidebarView.ts`、`src/core/TimerFileGroupFilter.ts`（新建）

**实现重点**：
- 新建 `TimerFileGroupFilter` 类（纯函数，参考 tech 文档 3.2 节）：
  - `static filter(timers, group)`：黑名单优先，白名单为空时全通过
- 全库视图的 `timerList` 来源：`database.queryTimers(filter, sort)` 返回的 `TimerEntry[]`，转换为 `ScannedTimer[]` 格式（字段映射）
- 在渲染前应用 `TimerFileGroupFilter.filter()`（若用户选择了文件组）
- 全库视图的卡片与其他视图共用 `renderTimerCard()`，无需额外处理

**验收标准**：
- 全库视图显示数据库中所有计时器
- 文件组筛选生效（选择文件组后列表正确过滤）
- 全库视图的排序/筛选与其他视图行为一致

---

### T21 · 实现文件组管理设置 UI

**文件**：`src/ui/TimerSettingTab.ts`、`src/main.ts`

**实现重点**：

**TimerSettings 接口扩展**（在 `TimerSettingTab.ts` 中）：
- 新增字段：`showStatusBar`、`sidebarDefaultScope`、`sidebarDefaultFilter`、`sidebarDefaultSort`、`autoRefreshSidebar`、`timerFileGroups`（参考 tech 文档第 6 节）
- 在 `default_settings` 中为所有新字段设置默认值

**TimerSettingTab.ts**：
- 新增"侧边栏"设置分组，包含：
  - 状态栏开关（`showStatusBar`）
  - 默认视图/筛选/排序下拉
  - 自动刷新开关（`autoRefreshSidebar`）
- 新增"文件组管理"设置分组：
  - 显示现有文件组列表，每组显示名称和白/黑名单路径
  - "新增文件组"按钮：弹出输入框，填写名称和路径
  - 每个文件组有"删除"按钮
  - 路径输入支持多行（每行一个路径前缀）

**验收标准**：
- 设置页面新增"侧边栏"和"文件组管理"两个分组
- 新增/删除文件组后，设置正确保存
- 现有设置项不受影响（向后兼容）

---

### T22 · 监听文件删除/重命名事件

**文件**：`src/main.ts`

**实现重点**：
- 在 `onload()` 中注册：
  - `this.registerEvent(this.app.vault.on('delete', this.onFileDelete.bind(this)))`
  - `this.registerEvent(this.app.vault.on('rename', this.onFileRename.bind(this)))`
- `onFileDelete(file)`：若 `file` 是 `TFile`（非文件夹），调用 `await this.database.removeFile(file.path)`
- `onFileRename(file, oldPath)`：若 `file` 是 `TFile`，调用 `await this.database.renameFile(oldPath, file.path)`
- 事件处理完成后，若侧边栏当前显示的是全库视图，触发列表刷新

**验收标准**：
- 删除含计时器的文件后，`timer-db.json` 中该文件的计时器记录被移除
- 重命名含计时器的文件后，`timer-db.json` 中的 `file_path` 字段正确更新
- 侧边栏列表同步更新

---

## 附录：关键约束

### 不可修改的现有行为

| 文件 | 约束 |
|------|------|
| `src/core/TimerManager.ts` | 不修改现有接口，只允许新增方法 |
| `src/io/TimerFileManager.ts` | 不修改现有接口，只允许新增方法 |
| `src/core/TimerDataUpdater.ts` | `calculate()` 的现有 case 逻辑不变，只新增 `project` 字段透传 |
| `src/io/TimerParser.ts` | 现有解析逻辑不变，只在 `parseNewFormat` 末尾新增 `project` 字段读取 |
| `src/io/TimerRenderer.ts` | 现有渲染逻辑不变，只在 HTML 字符串末尾条件追加 `data-project` |
| `data.json` | 不直接操作，只通过 `loadData()`/`saveData()` 访问，且只存储 `TimerSettings` |

### 新增文件清单

| 文件路径 | 对应任务 |
|----------|---------|
| `src/core/TimerDatabase.ts` | T04、T05、T06 |
| `src/core/TimerScanner.ts` | T07 |
| `src/core/TimerSummary.ts` | T11 |
| `src/core/TimerFileGroupFilter.ts` | T20 |
| `src/ui/TimerSidebarView.ts` | T08～T15、T19、T20 |

### session_id 生成

`TimerSession.session_id` 使用 `crypto.randomUUID()`（Electron 环境原生支持），无需引入 nanoid 依赖。

### 时间戳约定

- `last_ts`、`reported_at`、`created_at`、`updated_at` 均为 **Unix 秒**（`Math.floor(Date.now() / 1000)`）
- `stat_date` 为本地时区的 `YYYY-MM-DD` 字符串（`new Date().toLocaleDateString('sv')`，`sv` locale 输出 ISO 格式）
