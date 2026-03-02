# 📋 实现计划：删除计时器功能扩展（Delete Timer Enhancement）

**文档版本**: v1.0 | **创建日期**: 2026-03-02 | **依赖文档**: stage4-tech-design.md v1.0 / stage1-PRD.md v1.0 | **执行对象**: 开发 Agent

---

## 阅读须则

1. **按任务编号顺序执行**，每个任务有明确的前置依赖
2. **每个任务完成后必须通过验收标准**，再进入下一个任务
3. **不得修改任务范围外的代码**，除非任务明确说明
4. 技术细节以 **stage4-tech-design.md** 为准
5. 遇到文档未覆盖的边界情况，优先保持与现有代码风格一致

---

## 任务总览

```
M0 底层扩展
├── T00  TimerDatabase 新增 getEntry 公开查询方法
└── T01  实现 extractTimerIdsFromText 工具函数

M1 核心逻辑
├── T02  实现 handlePassiveDelete 方法
├── T03  实现 handlePassiveRestore 方法
└── T04  实现 registerPassiveDeletionDetector 并在 onload 中注册

M2 构建验证 + E2E 测试
└── T05  构建验证 + E2E 测试脚本开发
```

---

## M0：底层扩展

> **目标**：在不影响现有功能的前提下，扩展 TimerDatabase 的查询能力，实现轻量级正则提取函数。

---

### T00 · TimerDatabase 新增 getEntry 公开查询方法

**文件**：`src/core/TimerDatabase.ts`（扩展）

**实现重点**：
- 在 `TimerDatabase` 类中新增公开方法 `getEntry(timerId: string): TimerEntry | null`
- 返回 `this.data?.timers[timerId] ?? null`
- 该方法供 `handlePassiveDelete` 和 `handlePassiveRestore` 进行幂等检查
- 不修改任何现有方法

**代码**：
```typescript
/**
 * Get a single timer entry by ID.
 * Returns null if timer not found or database not loaded.
 */
getEntry(timerId: string): TimerEntry | null {
    return this.data?.timers[timerId] ?? null;
}
```

**验收标准**：
- TypeScript 编译无报错
- 现有功能不受影响
- `getEntry('non-existent')` 返回 `null`

---

### T01 · 实现 extractTimerIdsFromText 工具函数

**文件**：`src/main.ts`（扩展）

**实现重点**：
- 在 `main.ts` 文件顶部（import 之后、class 之前）定义模块级函数 `extractTimerIdsFromText`
- 使用正则表达式从文本中提取所有 timer span 的 ID 及其属性（dur, ts, project）
- 不使用 DOM 解析（避免 updateListener 热路径上的性能开销）
- 正则匹配 `<span` 标签中同时包含 `class="timer-[rp]"` 和 `id="..."` 的情况

**代码**（参考 tech-design 第 5.1 节）：
```typescript
function extractTimerIdsFromText(text: string): Map<string, { dur: number; ts: number; project: string | null }> {
    const result = new Map<string, { dur: number; ts: number; project: string | null }>();
    const spanRegex = /<span\s+[^>]*class="timer-[rp]"[^>]*>/g;
    let match;
    while ((match = spanRegex.exec(text)) !== null) {
        const spanTag = match[0];
        const idMatch = spanTag.match(/\bid="([^"]+)"/);
        const durMatch = spanTag.match(/data-dur="([^"]+)"/);
        const tsMatch = spanTag.match(/data-ts="([^"]+)"/);
        const projMatch = spanTag.match(/data-project="([^"]+)"/);
        if (idMatch) {
            result.set(idMatch[1], {
                dur: durMatch ? parseInt(durMatch[1], 10) : 0,
                ts: tsMatch ? parseInt(tsMatch[1], 10) : 0,
                project: projMatch ? projMatch[1] : null
            });
        }
    }
    return result;
}
```

**验收标准**：
- TypeScript 编译无报错
- 正确解析 `<span class="timer-r" id="LzHk3a" data-dur="3600" data-ts="1740456240">` → `Map { 'LzHk3a' → { dur: 3600, ts: 1740456240, project: null } }`
- 正确解析含 `data-project` 属性的 span
- 多个 span 在同一段文本中时全部提取
- 无 timer span 时返回空 Map

---

## M1：核心逻辑

> **目标**：实现被动删除/恢复的核心处理方法和 CM6 检测器。

---

### T02 · 实现 handlePassiveDelete 方法

**文件**：`src/main.ts`（扩展）

**实现重点**：
- 在 `TimerPlugin` 类中新增 `handlePassiveDelete(timerId: string): void` 方法
- **幂等检查**：调用 `this.database.getEntry(timerId)` 检查状态，若已是 `deleted` 或不存在则直接 return
- **Running 计时器处理**：
  1. 获取内存中的 dur（`this.manager.getTimerData(timerId)`），若无则使用 DB 中的 `total_dur_sec`
  2. 调用 `this.database.computeRunningSessionSegments(timerId)` 计算跨天分段
  3. 逐段写入 `this.database.addDailyDurInMemory` + `this.idb.addDailyDur`
  4. 调用 `this.database.clearSessionStart(timerId)`
  5. 调用 `this.manager.stopTimer(timerId)`
- **状态更新**：`this.database.updateEntry(timerId, { state: 'deleted', ... })` + `this.idb.patchTimer(timerId, ...)`
- **清理**：`this.fileManager.locations.delete(timerId)`
- **UI 同步**：`this.updateStatusBar()` + `this.notifySidebarTimerRemoved(timerId)`
- **DEBUG 日志**：`if (DEBUG) console.log('[PassiveDelete] timerId=...', ...)`

**代码**（参考 tech-design 第 5.3 节，所有 `database.data` 已替换为 `database.getEntry`）

**验收标准**：
- TypeScript 编译无报错
- 对已 deleted 的 timer 调用不产生副作用（幂等）
- 对不存在的 timerId 调用不崩溃
- Running timer 被动删除时 daily_dur 正确写入

---

### T03 · 实现 handlePassiveRestore 方法

**文件**：`src/main.ts`（扩展）

**实现重点**：
- 在 `TimerPlugin` 类中新增 `handlePassiveRestore(timerId, spanDur, spanTs, filePath, lineNum, project): void`
- **幂等检查**：调用 `this.database.getEntry(timerId)` 检查状态，若不是 `deleted` 则直接 return
- **恢复为 paused**：`this.database.updateEntry(timerId, { state: 'paused', total_dur_sec: spanDur, ... })` + `this.idb.patchTimer`
- **不启动 TimerManager**：恢复后为 paused 状态，用户需手动 continue
- **不写文件**：span 已经在文档中了
- **UI 同步**：`this.updateStatusBar()` + `this.notifySidebarTimerAdded({...})`
- **DEBUG 日志**：`if (DEBUG) console.log('[PassiveRestore] timerId=...', ...)`

**代码**（参考 tech-design 第 5.4 节，所有 `database.data` 已替换为 `database.getEntry`）

**验收标准**：
- TypeScript 编译无报错
- 对非 deleted 状态的 timer 调用不产生副作用（幂等）
- 恢复后 timer 状态为 `paused`，dur 从 span 属性读取
- file_path 和 line_num 更新为新位置

---

### T04 · 实现 registerPassiveDeletionDetector 并在 onload 中注册

**文件**：`src/main.ts`（扩展）

**实现重点**：
- 在 `TimerPlugin` 类中新增 `private registerPassiveDeletionDetector(): void` 方法
- 使用 `this.registerEditorExtension(EditorView.updateListener.of(...))` 注册
- **检测逻辑**：
  1. `if (!update.docChanged) return` 早期退出
  2. `update.changes.iterChanges(...)` 遍历每个变更范围
  3. 对每个变更范围，提取受影响的旧文档行文本和新文档行文本
  4. 调用 `extractTimerIdsFromText()` 分别得到旧/新 timer ID 集合
  5. 旧集合中有但新集合中没有的 → `this.handlePassiveDelete(timerId)`
  6. 新集合中有但旧集合中没有的 → 检查 DB 状态，若为 `deleted` → `this.handlePassiveRestore(...)`
- **行号计算**：对于恢复的 timer，遍历新文档行找到包含该 timerId 的行号（0-based）
- **文件路径获取**：`this.app.workspace.getActiveViewOfType(FileView)?.file?.path`
- 在 `onload()` 方法中调用 `this.registerPassiveDeletionDetector()`（放在现有 `registerEditorExtension` 调用附近）

**代码**（参考 tech-design 第 5.2 节，所有 `database.data` 已替换为 `database.getEntry`）

**边界处理**：
- `oldTo` 可能等于 `oldDoc.length`（删除到文件末尾），需 `Math.min(oldTo, oldDoc.length)` 防止越界
- `newTo` 同理
- 空文档时 `doc.lineAt()` 仍返回第一行（line 1），不会崩溃

**验收标准**：
- TypeScript 编译无报错
- `npm run build` 构建成功
- 在编辑器中删除包含 timer span 的行后，timer 状态变为 deleted
- Ctrl+Z 恢复后，timer 状态变为 paused
- 编辑不包含 timer 的行不触发任何操作
- 多面板编辑同一文件，删除只执行一次（幂等）

---

## M2：构建验证 + E2E 测试

> **目标**：确保代码编译通过，并编写 E2E 测试覆盖所有验收标准。

---

### T05 · 构建验证 + E2E 测试脚本开发

**文件**：`tests/e2e-timer-test.mjs`（扩展）

**实现重点**：
- 执行 `npm run build` 确认编译通过
- 在 E2E 测试脚本中新增测试链 `chain_passive_delete`，注册到 `CHAIN_REGISTRY` 和 `ALL_CHAINS`
- 测试链包含以下用例（对应 PRD AC-01 ~ AC-11）：
  1. **被动删除 paused timer**：创建 paused timer → 选中整行 → Delete → 验证 DB state=deleted、Sidebar 移除
  2. **被动删除 running timer**：创建 running timer → 选中整行 → Delete → 验证 DB state=deleted、daily_dur 有写入
  3. **Ctrl+Z 恢复 paused timer**：AC-01 后 Ctrl+Z → 验证 DB state=paused、Sidebar 重新出现
  4. **Ctrl+Z 恢复 running timer**：AC-02 后 Ctrl+Z → 验证 DB state=paused（非 running）
  5. **剪切粘贴同文件**：Ctrl+X → Ctrl+V 到另一行 → 验证最终状态 paused
  6. **多行选中删除多个 timer**：创建两个 timer → 选中多行 → Delete → 验证两个都 deleted
  7. **幂等性验证**：对已 deleted 的 timer 模拟再次触发 → 验证无副作用
- 每个用例使用 CDP 模拟真实用户操作（`Input.dispatchKeyEvent`）
- 断言使用 `runner.eval` 读取 `plugin.database.getEntry(id)` 和 IDB 数据

**验收标准**：
- `npm run build` 成功
- 所有 E2E 测试用例通过

---

## 附录：关键约束

### 不可修改的现有行为

| 文件 | 约束 |
|------|------|
| `src/main.ts` 中的 `handleDelete` | 不修改现有主动删除逻辑 |
| `src/main.ts` 中的 `handleRestore` | 不修改现有文件恢复逻辑 |
| `src/main.ts` 中的 checkbox updateListener | 不修改现有 checkbox 监听逻辑 |
| `src/core/TimerDatabase.ts` 现有方法 | 不修改，仅新增 `getEntry` |
| `src/core/TimerManager.ts` | 不修改 |
| `src/io/TimerParser.ts` | 不修改 |

### 新增文件清单

无新增文件。所有变更在现有文件中进行。

### 变更文件清单

| 文件路径 | 对应任务 | 变更类型 |
|----------|---------|---------|
| `src/core/TimerDatabase.ts` | T00 | 新增 `getEntry` 方法 |
| `src/main.ts` | T01-T04 | 新增函数 + 3 个方法 + 注册 updateListener |
| `tests/e2e-timer-test.mjs` | T05 | 新增 `chain_passive_delete` 测试链 |
