# ✅ 测试用例：删除计时器功能扩展（Delete Timer Enhancement）

**文档版本**: v1.0 | **创建日期**: 2026-03-02 | **对应 PRD**: stage1-PRD.md v1.0 | **对应技术方案**: stage4-tech-design.md v1.0

---

## 一、测试范围

### In Scope

- 编辑器被动删除检测（paused / running 计时器）
- 被动删除后的三层数据一致性（JSON + IDB + UI）
- Ctrl+Z 撤销恢复
- Running 计时器删除时的时长结算
- 剪切粘贴（同文件）
- 多个计时器同时删除
- 幂等性验证
- Sidebar 和 StatusBar 同步更新

### Out of Scope

- 跨文件剪切粘贴（E2E 测试框架暂不支持多文件操作）
- 移动端测试（需真机环境）
- 预览模式（不在功能 scope 内）
- 外部修改 .md 文件（不在功能 scope 内）

---

## 二、测试用例

### TC-01: 被动删除 paused 计时器

- **前置条件**: 存在一个 paused 状态的计时器在测试行上
- **操作步骤**:
  1. 将光标移动到计时器所在行
  2. 通过编辑器 API 选中整行文本（`selectLine`）
  3. 使用编辑器 API 替换选中内容为空字符串（模拟 Delete 键）
  4. 等待 2 秒让副作用生效
- **预期结果**:
  - JSON 层: timer state = 'deleted'
  - IDB 层: timer state = 'deleted'
  - Sidebar: 该计时器卡片消失
  - 行文本: 不包含 timer span
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: `runner.eval` 选中并删除行内容 → 验证 JSON state via `p.database.getEntry(id)` 和 IDB via `idbGetTimer(id)`

---

### TC-02: 被动删除 running 计时器 + 时长结算

- **前置条件**: 存在一个 running 状态的计时器，已运行数秒
- **操作步骤**:
  1. 创建 timer → 等待 ~3 秒累计时长
  2. 将光标移动到计时器所在行
  3. 选中整行并删除
  4. 等待 2 秒
- **预期结果**:
  - JSON 层: timer state = 'deleted'，`total_dur_sec > 0`
  - IDB 层: timer state = 'deleted'
  - daily_dur: 今天的日期下有该 timer 的时长记录 > 0
  - TimerManager: 该 timer 不再运行
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 创建 timer → sleep → 选中删除 → 验证 JSON/IDB state + daily_dur via `idbGetDailyByTimer(id)`

---

### TC-03: Ctrl+Z 恢复 paused 计时器

- **前置条件**: TC-01 已执行（paused timer 已被动删除）
- **操作步骤**:
  1. TC-01 执行后
  2. 执行 Obsidian undo 命令 (`editor:undo`)
  3. 等待 2 秒
- **预期结果**:
  - JSON 层: timer state = 'paused'
  - IDB 层: timer state = 'paused'
  - 行文本: 重新包含 timer span
  - Sidebar: 该计时器卡片重新出现
  - total_dur_sec: 与删除前一致
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 接续 TC-01 → `executeCommandById('editor:undo')` → 验证 state=paused + span 存在

---

### TC-04: Ctrl+Z 恢复 running 计时器 → 变为 paused

- **前置条件**: TC-02 已执行（running timer 已被动删除）
- **操作步骤**:
  1. TC-02 执行后
  2. 执行 Obsidian undo 命令
  3. 等待 2 秒
- **预期结果**:
  - JSON 层: timer state = 'paused'（不是 running）
  - IDB 层: timer state = 'paused'
  - TimerManager: 该 timer 不在运行（不自动恢复 running）
  - 行文本: 包含 timer span
- **优先级**: P0
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 接续 TC-02 → undo → 验证 state=paused（非 running）

---

### TC-05: 剪切粘贴同文件 → 删除后恢复

- **前置条件**: 存在一个 paused 计时器
- **操作步骤**:
  1. 选中包含计时器的整行
  2. 执行剪切（通过编辑器 API 模拟）
  3. 等待 2 秒
  4. 验证 timer 为 deleted
  5. 将光标移到文件末尾
  6. 粘贴（通过编辑器 API 模拟）
  7. 等待 2 秒
- **预期结果**:
  - 剪切后: JSON state = 'deleted'
  - 粘贴后: JSON state = 'paused'
  - file_path: 不变（同文件）
  - line_num: 更新为新行号
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 使用 editor replaceRange 模拟剪切（保存文本 → 删除行），然后在末尾 replaceRange 模拟粘贴

---

### TC-06: 多个计时器同时被动删除

- **前置条件**: 连续两行各有一个 paused 计时器
- **操作步骤**:
  1. 选中两行文本
  2. 删除
  3. 等待 2 秒
- **预期结果**:
  - 两个 timer 的 JSON state 均为 'deleted'
  - 两个 timer 的 IDB state 均为 'deleted'
- **优先级**: P1
- **类型**: 功能
- **可自动化**: 是
- **自动化实现提示**: 创建两个 timer → 选中多行 → replaceRange 删除 → 验证两个都 deleted

---

### TC-07: 幂等性 — 已 deleted 的 timer 不重复处理

- **前置条件**: 一个 timer 已处于 deleted 状态
- **操作步骤**:
  1. 通过 eval 直接调用 `plugin.handlePassiveDelete(timerId)` 验证幂等
  2. 记录 daily_dur 值
  3. 再次调用 `handlePassiveDelete(timerId)`
  4. 验证 daily_dur 无变化
- **预期结果**:
  - state 仍为 'deleted'
  - daily_dur 无新增条目
  - 无异常/报错
- **优先级**: P1
- **类型**: 边界
- **可自动化**: 是
- **自动化实现提示**: 注意此用例允许直接调用内部方法进行断言验证（验证幂等性，不是操作驱动）

---

### TC-08: 编辑非计时器行不触发被动删除

- **前置条件**: 文件中存在计时器，光标在不含计时器的行上
- **操作步骤**:
  1. 在不含计时器的行上输入文字
  2. 等待 1 秒
- **预期结果**:
  - 计时器的 JSON state 不变
  - 无异常/报错
- **优先级**: P1
- **类型**: 边界
- **可自动化**: 是
- **自动化实现提示**: 记录 timer state → 编辑其他行 → 验证 state 不变

---

## 三、E2E 自动化测试链设计

### 测试链划分

| 链名 | 包含用例 | 依赖链 | 预估时长 |
|------|---------|--------|---------|
| `passive_delete` | TC-01 ~ TC-08 | `preflight` | ~45s |

### 测试链执行流程

```
chain_passive_delete:
  1. 创建测试行 + paused timer
  2. TC-01: 被动删除 paused timer
  3. TC-03: Ctrl+Z 恢复
  4. 再次删除 → 准备给 TC-05
  5. TC-05: 剪切粘贴恢复
  6. 清理 → 创建 running timer
  7. TC-02: 被动删除 running timer + 时长结算
  8. TC-04: Ctrl+Z 恢复 running → paused
  9. 清理 → 创建两个 timer
  10. TC-06: 多 timer 同时删除
  11. TC-07: 幂等性验证
  12. TC-08: 非计时器行编辑不触发
  13. 清理测试数据
```

### 断言策略

- **JSON 层**: `runner.eval('app.plugins.plugins["text-block-timer"].database.getEntry("id")?.state')`
- **IDB 层**: `runner.evalAsync(idbGetTimer(id))` → `JSON.parse(raw).state`
- **daily_dur (IDB)**: `runner.evalAsync(idbGetDailyByTimer(id))` → 检查今天日期有记录
- **daily_dur (JSON)**: `runner.eval` 读取 `p.database.getDailyDur()`
- **Sidebar**: `runner.eval` 查询 `.timer-card` DOM 元素
- **行文本**: `runner.eval('app.workspace.activeEditor.editor.getLine(n)')` → 检查是否包含 `class="timer-`
- **TimerManager**: `runner.eval('p.manager.getTimerData("id")')` → 检查是否为 null
- **跨层一致性**: JSON state === IDB state，且 deleted 时 Sidebar 无卡片、running 时 Manager 有数据

### 操作方式

| 操作 | 实现方式 |
|------|----------|
| 创建计时器 | `app.commands.executeCommandById('text-block-timer:toggle-timer')` |
| 暂停计时器 | `app.commands.executeCommandById('text-block-timer:toggle-timer')` |
| 选中整行 | `editor.setSelection({line: n, ch: 0}, {line: n+1, ch: 0})` |
| 删除选中内容 | `editor.replaceSelection('')` |
| Undo | `app.commands.executeCommandById('editor:undo')` |
| 剪切 | 保存 `editor.getLine(n)` → `editor.replaceRange('', ...)` → 粘贴用 `replaceRange(saved, ...)` |
| 移动光标 | `editor.setCursor({line: n, ch: 0})` |

---

## 四、移动端测试要点

本功能核心逻辑（CM6 updateListener）在移动端同样有效，但以下场景需移动端手动验证：

| 测试点 | 说明 |
|--------|------|
| 触控删除 | 长按选中文本 → 点击删除 → 验证被动删除触发 |
| 触控粘贴 | 长按 → 粘贴 → 验证被动恢复触发 |
| 三指 Undo (iOS) | 三指向左滑动撤销 → 验证恢复 |
| 软键盘 Backspace | 使用软键盘的退格键逐字删除 timer span → 验证被动删除触发 |
