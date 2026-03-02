# 🏛️ 架构 Review：删除计时器功能扩展

**文档版本**: v1.0 | **创建日期**: 2026-03-02 | **对应技术方案**: stage4-tech-design.md v1.0 | **状态**: 已完成

---

## Review 总评

技术方案整体设计合理，架构健康度良好。核心设计决策（正则替代 DOM 解析、幂等检查、不复用 handleRestore）均有充分理由。发现 **1 处必须修复的设计问题** 和 **1 处优化建议**。

---

## 关键问题（Must Fix）

### Issue-1: `TimerDatabase.data` 是 private，技术方案中直接访问不合法

- **位置**: stage4-tech-design.md 第 5.2 节 `registerPassiveDeletionDetector` 和第 5.4 节 `handlePassiveRestore`
- **问题**: 技术方案中使用 `this.database.data?.timers[timerId]` 直接访问 private 属性。虽然 TypeScript 的 private 只是编译期检查（运行时可访问），但这违反了项目的封装约定——目前没有任何外部代码访问 `database.data`。
- **风险等级**: 🟡 中等（编译期 TypeScript 会报错，导致无法构建）
- **建议方案**: 在 `TimerDatabase` 中新增一个公开方法 `getEntry(timerId: string): TimerEntry | null`，用于查询单条 timer entry 及其状态。这也符合最小暴露原则（只暴露必要的查询能力，不暴露整个 data 对象）。

**修复代码**：

```typescript
// TimerDatabase.ts — 新增公开查询方法
/**
 * Get a single timer entry by ID.
 * Returns null if timer not found or database not loaded.
 */
getEntry(timerId: string): TimerEntry | null {
    return this.data?.timers[timerId] ?? null;
}
```

技术方案中所有 `this.database.data?.timers[timerId]` 替换为 `this.database.getEntry(timerId)`。

---

## 优化建议（Nice to Have）

### Suggestion-1: 考虑将 `extractTimerIdsFromText` 移入 `TimerParser` 作为静态方法

- **当前设计**: `extractTimerIdsFromText` 作为 `main.ts` 中的顶层函数
- **建议**: 将其移入 `TimerParser` 类作为 `static extractTimerIds(text: string)` 方法，与现有的 `parse` 方法放在一起，职责内聚
- **决策**: Nice to Have。当前方案可行且影响范围小（函数仅在 main.ts 中使用），暂不强制修改。可在后续重构时统一。

---

## 审查维度详情

### A. 架构健康度

- [x] 单一职责：新增逻辑集中在 `TimerPlugin`（协调者模式），与现有风格一致 ✅
- [x] 无循环依赖：`main.ts` → `TimerDatabase` / `TimerIndexedDB` / `TimerManager`，单向依赖 ✅
- [x] 架构风格一致：遵循现有的"协调者模式 + 纯函数状态机 + 三层数据同步" ✅
- [x] 耦合度可控：新增方法都是独立的，不修改现有方法 ✅

### B. 性能风险

- [x] 主线程阻塞：updateListener 中仅使用正则 + 同步内存操作，无阻塞风险 ✅
- [x] 大数据量：正则扫描仅限变更行范围，与计时器总数无关 ✅
- [x] 内存泄漏：无新增事件监听器或定时器（通过 `registerEditorExtension` 自动清理） ✅
- [x] 移动端兼容：CM6 updateListener 在移动端同样有效，正则性能无差异 ✅

### C. 数据安全

- [x] 三层同步：JSON 同步更新 → IDB 异步同步 → UI 同步回调，顺序正确 ✅
- [x] 崩溃恢复：被动删除后 JSON 立即更新，IDB 异步但有 seedFromJSON 兜底 ✅
- [x] 并发写入：幂等检查基于 JSON 内存层同步读取，同一事件循环内不会冲突 ✅

### D. 边界情况

- [x] 跨天场景：`computeRunningSessionSegments` 已处理跨天分段 ✅
- [x] 空/异常数据：`getEntry` 返回 null 时 handlePassiveDelete 直接 return ✅
- [x] 文件被外部修改：不在 scope 内（依赖全量扫描处理） ✅
- [x] Obsidian 版本兼容：使用的 CM6 API 均为稳定 API ✅

### E. 可测试性

- [x] 核心逻辑可被 E2E 覆盖：通过 CDP 模拟编辑器操作触发被动删除/恢复 ✅
- [x] 断言边界清晰：JSON/IDB/UI 三层均可通过 CDP eval 查询验证 ✅

---

## 结论: ⚠️ 有条件通过

Issue-1 已自动修复（在技术方案中补充 `getEntry` 方法并替换直接访问）。修复后方案可进入 Phase 6。
