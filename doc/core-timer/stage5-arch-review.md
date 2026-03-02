# 🏛️ 架构 Review: Core Timer

**审查日期**: 2026-03-02  |  **状态**: 补充归档  |  **对应技术方案**: stage4-tech-design.md

---

## 一、审查清单

### 模块设计

- [x] **单一职责**: 每个模块职责明确 — TimerDataUpdater 只做计算，TimerManager 只管内存状态，TimerFileManager 只管文件 IO
- [x] **依赖方向**: 单向依赖，核心层不依赖 UI 层/IO 层
- [x] **接口清晰**: TimerData 接口贯穿全流程，模块间通过标准接口通信
- [x] **无循环依赖**: TimerPlugin 作为协调者，其余模块互不直接依赖

### 数据架构

- [x] **三层一致性**: 状态变更同步三层（Markdown/JSON/IDB）
- [x] **tick 性能优化**: 每秒只写 IDB + 内存，不触发 JSON flush
- [x] **onunload 安全**: flushSync 确保正常关闭不丢数据
- [x] **崩溃恢复**: recoverCrashedTimers 补偿异常退出期间的时长

### 扩展性

- [x] **设置可扩展**: TimerSettings 接口可增加字段，DEFAULT_SETTINGS 合并保障向后兼容
- [x] **格式可升级**: v1→v2 迁移路径已验证
- [x] **i18n 可扩展**: 增加新语言只需在 TRANSLATIONS 中添加 key

### 性能

- [x] **tick 并发安全**: runningTicks Set 防止重叠执行
- [x] **后台节流**: visibilitychange 监听，后台跳过 tick
- [x] **位置缓存**: 避免每秒全文搜索，降低 O(n) 到 O(1)
- [x] **IDB 原子事务**: tickUpdate 一个事务完成两个 store 的更新

---

## 二、已知风险

| 风险 | 严重程度 | 缓解措施 |
|------|----------|----------|
| 位置缓存失效（用户编辑行号变化） | 中 | findTimerGlobally 全文搜索兜底 |
| flushSync 使用 Node.js fs 模块 | 低 | 仅在 onunload 时调用，移动端降级为 async flush |
| HTML 内嵌 Markdown 的兼容性 | 低 | 无法避免，是核心设计约束 |
| 长时间后台运行 ts 漂移 | 低 | 后台跳过 tick，恢复前台时 ts 自动补偿 |

---

## 三、技术方案修正

无修正。技术方案基于实际代码编写，与实现一致。

---

## 四、结论

核心计时器的架构设计成熟稳健，职责分离清晰，数据一致性保障到位，性能优化措施全面。审查通过。
