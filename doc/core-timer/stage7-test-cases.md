# 🧪 测试用例: Core Timer

**文档版本**: v1.0  |  **创建日期**: 2026-03-02  |  **状态**: 补充归档

---

## 一、现有测试覆盖（已实现）

### Chain: preflight（环境验证）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| PRE-01 | Plugin is loaded | 插件实例存在 |
| PRE-02 | Active file is open in editor | 有打开的编辑器 |
| PRE-03 | IDB is initialized | IndexedDB 已打开 |

### Chain: basic（基础生命周期 + 三层数据一致性）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| B-01 | START timer on test line | Markdown 行内出现 timer-r span |
| B-02 | IDB: timer entry exists with state=running | IDB timers store 有 running 记录 |
| B-03 | IDB tickDelta: daily_dur accumulates ~1s/tick | 等待 3s，daily_dur delta ≈ 3s（±1s） |
| B-04 | Status bar: shows running timer info | 状态栏显示 running 信息 |
| B-05 | PAUSE timer | span 变为 timer-p，时长冻结 |
| B-06 | IDB: timer state=paused after PAUSE | IDB state 为 paused |
| B-07 | IDB: daily_dur not double-written on pause | pause 不会重复写 daily_dur |
| B-08 | Cross-layer: JSON total_dur ≈ IDB total_dur (±2s) | JSON 和 IDB 时长一致 |
| B-09 | Cross-layer: JSON daily_dur ≈ IDB daily_dur (±2s) | JSON 和 IDB 日统计一致 |
| B-10 | CONTINUE timer | span 变为 timer-r，继续计时 |
| B-11 | IDB: state=running after CONTINUE | IDB state 为 running |
| B-12 | PAUSE again for duration adjustment test | 再次暂停 |

### Chain: adjust（时间调整）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| ADJ-01 | Record pre-adjustment IDB state | 记录调整前 total_dur 和 daily_dur |
| ADJ-02 | Manual set duration: decrease via handleSetDuration | 调用 handleSetDuration 减少时长 |
| ADJ-03 | IDB: daily_dur adjusted correctly after decrease | daily_dur LIFO 扣除正确 |
| ADJ-04 | CONTINUE for accumulation retest | 继续，验证减少后的基础正确 |
| ADJ-05 | PAUSE after accumulation | 暂停，验证累计正确 |
| ADJ-06 | IDB: no double-write after continue→pause cycle | 无重复写入 |

### Chain: seed（IDB seeding）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| SEED-01 | seedIndexedDB: clearAll removes stale data on reload | 重新 seed 后 IDB 数据与 JSON 一致 |

### Chain: crossday（跨天处理）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| CD-01 | Patch Date to yesterday 23:59:55 | 时间补丁成功 |
| CD-02 | START timer at yesterday 23:59:55 | 计时器在昨天启动 |
| CD-03 | IDB has yesterday daily_dur from ticks | 昨天的 daily_dur > 0 |
| CD-04 | Patched time has crossed to today | 时间自然跨过午夜 |
| CD-05 | checkDayBoundary detected — JSON has yesterday entry | JSON daily_dur 有昨天的条目 |
| CD-06 | IDB daily_dur has BOTH yesterday and today entries | IDB 有两天的记录 |
| CD-07 | Sidebar chart auto-splits BEFORE pause | Sidebar 图表自动拆分 |
| CD-08 | PAUSE and verify total = sum of daily_dur | 总时长 = 各天之和 |
| CD-09 | Sidebar chart still correct after pause | 暂停后图表不变 |
| CD-10 | Restore original Date | 时间恢复 |
| CD-11 | Cleanup — delete timer | 清理 |

### Chain: crossday_adjust（跨天 + 时间调整）

| 用例 | 描述 | 验证点 |
|------|------|--------|
| CDA-01 | Patch to day1 noon, start timer | 3 天前启动 |
| CDA-02 | Cross day1→day2: checkDayBoundary splits | 跨第一天，day1 有记录 |
| CDA-03 | Cross day2→day3: second boundary | 跨第二天，day2 有记录 |
| CDA-04 | Pause: total = sum(day1+day2+day3) | 三天总和正确 |
| CDA-05 | Decrease: LIFO deducts from day3 first | LIFO 从最近日期扣除 |
| CDA-06 | Increase: delta added to today | 增加量加到 today |
| CDA-07 | Cleanup | 清理 |

---

## 二、待补充测试用例

### Chain: checkbox（Checkbox 联动 — 新增）

| 用例 | 描述 | 验证点 | 优先级 |
|------|------|--------|--------|
| CB-01 | Checkbox `[ ]` → `[/]` 自动启动计时器 | 行内出现 timer-r span | P0 |
| CB-02 | Checkbox `[/]` → `[x]` 自动暂停计时器 | span 变为 timer-p | P0 |
| CB-03 | Checkbox `[x]` → `[/]` 恢复计时器 | span 变为 timer-r | P0 |
| CB-04 | Checkbox `[ ]` → `[x]` 不创建计时器 | 行内无 timer span | P1 |
| CB-05 | 非 Checkbox 行编辑不触发 | 已有 timer 状态不变 | P1 |
| CB-06 | enableCheckboxToTimer=false 时 Checkbox 不触发 | 行内无 timer span | P1 |

### Chain: restore（文件打开恢复 — 新增）

| 用例 | 描述 | 验证点 | 优先级 |
|------|------|--------|--------|
| RST-01 | autoStopTimers='never': 运行中 timer 恢复运行 | manager.hasTimer()=true | P0 |
| RST-02 | autoStopTimers='quit': 本次 session 启动的恢复 | startedIds 中的 timer 恢复 | P0 |
| RST-03 | autoStopTimers='quit': 非本次 session 的强制暂停 | span 变为 timer-p | P0 |
| RST-04 | autoStopTimers='close': 全部强制暂停 | 所有 timer span 为 timer-p | P0 |
| RST-05 | 恢复后三层数据一致 | JSON/IDB/Markdown dur 一致 | P0 |

### Chain: crash_recovery（崩溃恢复 — 新增）

| 用例 | 描述 | 验证点 | 优先级 |
|------|------|--------|--------|
| CR-01 | 模拟崩溃：JSON 中 state=running 的 timer | recoverCrashedTimers 检测到 | P0 |
| CR-02 | 崩溃恢复后 state 变为 paused | JSON entry.state === 'paused' | P0 |
| CR-03 | 崩溃期间时长正确结算到 daily_dur | daily_dur[date][timerId] > 0 | P0 |
| CR-04 | IDB 同步崩溃恢复结果 | IDB entry.state === 'paused' | P1 |

### Chain: settings（设置面板 — 新增）

| 用例 | 描述 | 验证点 | 优先级 |
|------|------|--------|--------|
| SET-01 | 修改 timerInsertLocation='tail' 后新建 timer | span 出现在行尾 | P1 |
| SET-02 | 修改 timerInsertLocation='head' 后新建 timer | span 出现在行首（checkbox 后） | P1 |
| SET-03 | 修改 runningIcon 后启动 timer | Widget 显示新图标 | P2 |
| SET-04 | 修改 pausedIcon 后暂停 timer | Widget 显示新图标 | P2 |
| SET-05 | 修改 timeDisplayFormat='smart' | Widget 时间格式改变 | P2 |

### Chain: onunload（正常退出结算 — 新增）

| 用例 | 描述 | 验证点 | 优先级 |
|------|------|--------|--------|
| UNL-01 | 调用 onunload 前有 running timer | manager.timers.size > 0 | P0 |
| UNL-02 | onunload 后 JSON 中 state 仍为 running（不暂停） | JSON entry.state === 'running' | P0 |
| UNL-03 | onunload 后 JSON 已 flushSync 到磁盘 | JSON 文件内容与内存一致 | P0 |

---

## 三、测试基础设施

### E2E 测试框架

- **连接方式**: Chrome DevTools Protocol (CDP)
- **远程调试端口**: 9222
- **运行命令**: `node tests/e2e-timer-test.mjs [chain_name...]`
- **测试文件**: 使用 `_e2e_timer_test.md` 作为测试用 Markdown 文件
- **超时**: 默认 10s per test case
- **结果格式**: ✅ PASS / ❌ FAIL + 详细日志

### 辅助工具

- `runner.eval(expr)`: 在 Obsidian 上下文中执行 JS
- `runner.run(name, fn)`: 运行单个测试用例
- `runner.executeCommand(id)`: 执行 Obsidian 命令
- `runner.setCursorToLine(n)`: 设置光标位置
- `patchDate(offset)`: 模拟时间偏移（跨天测试用）
- `sleep(ms)`: 异步等待

### 测试隔离

- 每个 chain 使用独立测试行（动态创建）
- chain 间通过 `deps` 和 `cleanup` 保证执行顺序和清理
- `cleanup_basic` chain 负责删除 basic chain 创建的测试行
