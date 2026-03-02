# 🏗️ 架构评审：Timer Sidebar

**文档版本**: v1.0 | **创建日期**: 2026-02-25 | **对应技术方案**: stage4-tech-design.md v1.0 | **状态**: 已实现（回溯整理）

> 本文档为回溯性整理，架构评审结论已嵌入 tech-design 第十一章。此处提取为独立文档。

## 一、Review 总评

技术方案 v1.0 整体架构可行，与现有"协调者模式 + 纯函数状态机 + 三层数据同步"风格一致。原发现 **6 处设计缺陷** 和 **8 处遗漏**，已全部在技术方案对应章节修正。

## 二、审查维度

### A. 架构健康度

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 单一职责 | ✅ | TimerDatabase / TimerScanner / TimerSidebarView 各司其职 |
| 循环依赖 | ✅ | TimerPlugin 作为中心协调者，无循环依赖 |
| 架构风格一致 | ✅ | 遵循现有协调者模式、纯函数状态机、三层同步 |
| 模块耦合度 | ✅ | TimerSummary / TimerFileGroupFilter 为纯函数，零耦合 |

### B. 性能风险

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 主线程阻塞 | ⚠️→✅ | 原 `scanVault` 为同步全量加载，已改为 `AsyncGenerator` 流式扫描 |
| 大数据量 | ✅ | Map 索引 O(1) 查找，内存 < 3MB |
| 内存泄漏 | ⚠️→✅ | 已补充 `onClose()` 资源清理（ResizeObserver、AbortController） |
| 移动端后台 | ✅ | 状态栏仅在有运行中计时器时更新 |

### C. 数据安全

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 三层同步一致性 | ⚠️→✅ | 已改为使用独立 `timer-db.json` 文件，与 `data.json` 隔离 |
| 崩溃恢复 | ⚠️→✅ | 已补充 `onunload` 同步上报 + `recoverCrashedTimers` 逻辑 |
| 并发写入 | ✅ | 100ms debounce flush，单线程写入 |

### D. 边界情况

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 跨天场景 | ⚠️→✅ | `checkDayBoundary` 改为 async，每次 tick 检测日期变化 |
| 空/大数据防御 | ✅ | 各视图有空状态处理，全库扫描有进度提示和取消 |
| 文件外部修改/删除 | ✅ | 监听 vault `delete`/`rename` 事件 |
| Obsidian 版本兼容 | ✅ | 使用标准 ItemView API |

### E. 可测试性

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 核心逻辑可 E2E 覆盖 | ✅ | 侧边栏操作通过 CDP DOM 交互 + 数据断言 |
| 接口边界 | ✅ | TimerDatabase / TimerScanner 有明确接口 |

## 三、关键问题（已修正）

| 编号 | 标题 | 风险等级 | 修正位置 |
|------|------|----------|----------|
| Issue-1 | 跳转功能未设计实现方案 | 🟡 | tech-design 4.3 节 |
| Issue-2 | `timer-db.json` 与 `data.json` 数据隔离问题 | 🔴 | tech-design 2.1/2.5/4.1 节 |
| Issue-3 | `TimerParser` 未解析 `project` 字段 | 🟡 | tech-design 7.2/7.3/7.4 节 |
| Issue-4 | `onTick` 中 `checkDayBoundary` 未 await | 🔴 | tech-design 4.1/4.4 节 |
| Issue-5 | `scanVault` 全量内存加载性能问题 | 🟡 | tech-design 4.2 节 |
| Issue-6 | `onLayoutChange` 逻辑不完整 | 🟡 | tech-design 4.3 节 |

## 四、遗漏项（已补充）

| 编号 | 标题 | 修正位置 |
|------|------|----------|
| Missing-1 | `plugin_unload` session 上报 | tech-design 4.1/4.4 节 |
| Missing-2 | 崩溃恢复逻辑 | tech-design 4.1 节 |
| Missing-3 | `TimerSummary` 实现细节 | tech-design 3.2 节 |
| Missing-4 | `TimerFileGroupFilter` 实现细节 | tech-design 3.2 节 |
| Missing-5 | `data.json` 与 `timer-db.json` 存储隔离 | tech-design 2.5/4.1 节 |
| Missing-6 | 侧边栏宽度响应式适配 | tech-design 4.3 节 |
| Missing-7 | 全库扫描取消后状态处理 | tech-design 4.2/5.2 节 |
| Missing-8 | `TimerSidebarView.onClose()` 资源清理 | tech-design 4.3 节 |

## 五、结论

**⚠️ 有条件通过** → 全部 Must Fix 项已在 tech-design v1.0 中完成修正，可进入实现阶段。

## 六、性能评估总结

| 场景 | 评估结论 |
|------|----------|
| 每秒 tick 刷新侧边栏 | ✅ 仅更新文本节点，DOM 操作最小化 |
| 状态变更写数据库 | ✅ 100ms debounce flush |
| 全库扫描 | ✅ AsyncGenerator 流式处理，内存峰值 ≈ 单文件大小 |
| 内存索引查询 | ✅ Map O(1) 查找 |
| `onunload` 同步写入 | ✅ `fs.writeFileSync` 确保不丢数据 |
