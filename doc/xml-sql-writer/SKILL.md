---
name: xml-sql-writer
description: This skill should be used when a user imports XML files containing database table definitions/schemas and needs to generate SQL queries based on business requirements. It automatically parses XML table structures, generates accurate SQL, asks clarifying questions when data caliber/口径 is ambiguous, and persistently remembers user-defined business calibers for future use. Trigger keywords include XML, SQL, 建表, 表结构, 口径, 数据查询, 写SQL, 生成SQL.
---

# Multi-Project XML to SQL Writer

## Overview

This skill generates SQL queries from XML table definitions, supporting **multiple projects with isolated business logic but unified coding standards**. Each project has its own table definitions, caliber memory, and user SQL history, while sharing a common SQL coding style.

## Architecture: Multi-Project with Shared Standards

```
xml-sql-writer/
├── SKILL.md                          # 本文件 — 主入口 & 工作流定义
├── shared/                           # 跨项目共享资源（统一风格）
│   ├── coding_style.md               # 统一 SQL 编码规范 ★
│   ├── global_calibers.md            # 全局通用口径（非业务特定）
│   ├── xml_parsing_guide.md          # XML metalib 格式解析指南
│   ├── starrocks_functions.md         # StarRocks 函数完整参考（436个函数）
│   └── scripts/
│       └── extract_schema.py         # 多项目表结构提取脚本
└── projects/                         # 各项目独立空间（业务隔离）
    ├── nzm/                          # 逆战猎手项目
    │   ├── project.md                # 项目配置（表命名、分区、参数化变量等）
    │   ├── caliber_memory.md         # 项目业务口径记忆 ★
    │   ├── table_schema_summary.md   # 表结构摘要（自动生成）
    │   └── data/
    │       ├── xml/                  # XML 表结构定义
    │       └── user_sql/             # 用户历史 SQL
    └── {new_project}/                # 新项目（按需创建）
        ├── project.md
        ├── caliber_memory.md
        ├── table_schema_summary.md
        └── data/
            ├── xml/
            └── user_sql/
```

### 核心原则

| 维度 | 隔离 / 共享 | 说明 |
|------|-------------|------|
| **SQL 代码风格** | 共享 | `shared/coding_style.md` — 所有项目统一格式 |
| **全局通用口径** | 共享 | `shared/global_calibers.md` — 百分比格式、分区优先等 |
| **SR 函数参考** | 共享 | `shared/starrocks_functions.md` |
| **XML 解析规则** | 共享 | `shared/xml_parsing_guide.md` |
| **业务口径** | 隔离 | `projects/{id}/caliber_memory.md` — 各项目独立 |
| **表结构定义** | 隔离 | `projects/{id}/data/xml/` — 各项目独立 |
| **表命名规则** | 隔离 | `projects/{id}/project.md` — 各项目独立 |
| **用户SQL历史** | 隔离 | `projects/{id}/data/user_sql/` — 各项目独立 |

---

## Step 0: 项目识别与路由

**每次收到用户请求时，必须首先确定当前项目**：

### 0a: 自动识别项目

1. **扫描 `projects/` 目录**，获取所有已注册项目列表
2. 根据以下线索判断项目：
   - 用户明确指定项目名（如"NZM的DAU"、"写一个逆战猎手的SQL"）
   - 用户提到的表名/字段名（如 `codez_*` → NZM 项目）
   - 上下文对话历史中已确定的项目
   - 用户上传的 XML 文件内容（`metalib name` 属性）

### 0b: 项目不明确时询问

如果无法自动判断，用 `ask_followup_question` 询问：
```
ask_followup_question(
  title="项目选择",
  questions=[
    {"id":"project", "question":"请选择当前要查询的项目：", "options":["NZM (逆战猎手)", "创建新项目...", "以上都不对，我手动输入"], "multiSelect":false}
  ]
)
```

### 0c: 创建新项目

当用户需要创建新项目时，执行以下流程：

1. 询问项目基本信息（项目ID、项目名称）
2. 创建项目目录结构：
   ```
   projects/{project_id}/
   ├── project.md                # 从模板生成
   ├── caliber_memory.md         # 空的口径记忆模板
   ├── data/
   │   ├── xml/                  # 等待用户导入 XML
   │   └── user_sql/             # 等待用户导入 SQL
   ```
3. 如果用户提供了 XML 文件：
   - 保存到 `projects/{project_id}/data/xml/`
   - 运行 `python shared/scripts/extract_schema.py --project {project_id}` 生成表结构摘要
4. 通知用户：`项目「{名称}」已创建，可以开始查询了。`

#### 新项目 caliber_memory.md 模板

```markdown
# {项目名称} 项目数据口径记忆库

> 本文件用于持久化存储 {项目名称} 项目的业务口径定义。
> 跨项目通用口径请参见 `../../shared/global_calibers.md`。
> **此文件是永久记忆，不可删除已有条目，只可追加或修正。**

---

## 通用口径

（待添加）

---

## 业务口径

（待添加）

---

## 字段映射备注

（待添加）

---
```

#### 新项目 project.md 模板

```markdown
# 项目配置：{项目名称}

## 基本信息

- **项目ID**: `{project_id}`
- **项目名称**: {项目名称}
- **项目描述**: {描述}
- **创建日期**: {日期}

## 数据源配置

### 表命名规则
（根据用户提供的信息填写）

### 分区字段
（根据用户提供的信息填写）

### 参数化变量
（根据用户提供的信息填写）

## 通用字段
（从 XML 中提取后填写）

---
```

### 0d: 确定项目后加载资源

确定项目后，设置当前项目路径变量（概念上）：
- `PROJECT_DIR` = `projects/{project_id}/`
- `PROJECT_CALIBER` = `projects/{project_id}/caliber_memory.md`
- `PROJECT_SCHEMA` = `projects/{project_id}/table_schema_summary.md`
- `PROJECT_CONFIG` = `projects/{project_id}/project.md`
- `PROJECT_XML_DIR` = `projects/{project_id}/data/xml/`
- `PROJECT_SQL_DIR` = `projects/{project_id}/data/user_sql/`

---

## Step 1: Understand Table Structure

当用户提出数据查询需求时：

1. 读取当前项目的 `project.md` 获取表命名规则和分区配置
2. 读取当前项目的 `table_schema_summary.md` 定位相关表
3. 对于详细字段信息，用 `search_content` 在项目的 `data/xml/` 目录中 grep 搜索
4. 搜索模式：
   - 找表: `<struct name="TableName"`
   - 找字段: `name="FieldName"`

### XML File Management

当用户提供新的/更新的 XML 文件时：
1. 保存到当前项目的 `data/xml/` 目录
2. 运行 `python shared/scripts/extract_schema.py --project {project_id}` 重新生成表结构摘要
3. 对比前后差异，报告变更

### User SQL File Management

用户提供 SQL 文件时：
1. 保存到当前项目的 `data/user_sql/` 下，按主题分目录
2. 分析 SQL 提取口径、表关联模式、代码风格
3. 将发现的口径保存到**当前项目的** `caliber_memory.md`

---

## Step 2: Check Caliber Memory and User SQL Patterns

**必须同时读取两层口径记忆**：

1. **全局通用口径**: 读取 `shared/global_calibers.md`
2. **项目业务口径**: 读取当前项目的 `caliber_memory.md`
3. **用户 SQL 模式**: 如当前项目 `data/user_sql/` 中有相关 SQL 文件，读取学习
4. 当沿用已保存口径时，告知用户：`已沿用已保存口径「[名称]」: [定义]`

---

## Step 3: Ambiguity Detection and Proactive Clarification

**CRITICAL**: 在生成 SQL 前，**必须系统化地生成口径确认清单**。

### Step 3a: 系统化口径清单生成

按以下 **四大类维度** 逐一扫描：

#### 一、人群口径（统计谁？）

| 检查项 | 说明 | 常见选项 |
|--------|------|----------|
| **玩家粒度** | 按账号还是角色 | 账号维度 / 角色维度 |
| **人群范围** | 统计对象是否有限定 | 全体 / 新增 / 活跃 / 付费 / 回流 / 特定等级段 |
| **Bot过滤** | 是否排除机器人 | 排除Bot / 包含Bot / 仅Bot |
| **测试账号** | 是否排除测试账号 | 排除 / 包含所有 |

#### 二、环境与范围口径（统计哪里？）

| 检查项 | 说明 | 常见选项 |
|--------|------|----------|
| **服务器环境** | 正式服/测试服 | 仅正式服 / 仅测试服 / 全部 |
| **平台范围** | 包含哪些平台 | 全平台 / 分端 / 仅移动端 / 仅PC |
| **大区/分区** | 是否限定特定大区 | 全部 / 特定 |
| **玩法/模式** | 涉及哪些游戏模式 | 全部 / 特定 / 按玩法分组 |
| **赛季范围** | 是否限定赛季 | 当前 / 特定 / 全部 |

#### 三、指标口径（统计什么？）

| 检查项 | 说明 |
|--------|------|
| **核心指标定义** | 每个业务术语的精确含义 |
| **统计粒度** | 人次 vs 去重人数 |
| **聚合维度** | 按天/小时/周/平台/玩法等 |
| **比率计算** | 分子分母分别是什么 |
| **排除条件** | 是否排除特定结果 |

#### 四、时间口径（统计什么时间？）

| 检查项 | 说明 | 常见选项 |
|--------|------|----------|
| **时间范围** | 精确日期范围 | 参数化 / 固定日期 |
| **模糊时间词** | "最近"等 | 必须转化为精确分区范围 |
| **时间聚合** | 按什么粒度聚合 | 天 / 小时 / 周 |

### Step 3b: 过滤已有口径

1. 读取 `shared/global_calibers.md` + 当前项目的 `caliber_memory.md`
2. 已有明确口径的：不再询问，直接沿用，告知：`已沿用已保存口径「[名称]」: [定义]`
3. 未定义/模糊的：纳入确认清单

### Step 3c: 使用 ask_followup_question 确认

**CRITICAL**: 口径确认**必须**使用 `ask_followup_question` 工具。

规则：
- 每个问题提供清晰选项，末尾追加 `"以上都不对，我手动输入"`
- 多选场景设置 `multiSelect: true`
- 问题数量 1~4 个（工具限制），超过则分批
- 已保存口径**不再询问**
- 指标定义类问题：选项中给出具体计算公式或 SQL 片段

### Step 3d: 手动输入处理

用户选择 `"以上都不对，我手动输入"` 时：
1. 接收用户文本补充
2. 保存到**当前项目的** `caliber_memory.md`
3. 告知：`已保存口径「[名称]」到项目记忆。`

---

## Step 4: Generate SQL

口径确认后生成 SQL：

1. **读取统一代码风格**: 读取 `shared/coding_style.md` 获取 SQL 编码规范
2. **读取项目配置**: 读取当前项目 `project.md` 获取表命名规则、分区字段、参数化变量格式
3. **生成 SQL**：严格遵循以下规范：
   - `shared/coding_style.md` 中的所有格式要求（禁止CTE、前导逗号、小写关键字、分区优先等）
   - 当前项目 `project.md` 中的表命名规则和分区格式
   - 当前项目 `caliber_memory.md` 中的中间表优先原则
4. 如当前项目 `data/user_sql/` 中有类似查询，参考其风格
5. **SR 函数参考**: 不确定某个 SR 函数时，搜索 `shared/starrocks_functions.md`

### SQL Output Template

```sql
-- ============================================
-- 项目: [{项目名称}]
-- 需求: [业务需求简述]
-- 口径说明:
--   [口径1]: [定义]
--   [口径2]: [定义]
-- 数据源: [表名]
-- 时间范围: [日期范围]
-- ============================================

select
    ...
from
    ...
where
    [分区字段] between '...' and '...'   -- 分区过滤置顶
    and ...
group by
    ...
order by ...
```

---

## Step 5: Caliber Memory Persistence — 口径保存到正确层级

**CRITICAL**: 口径确认后必须立即自动保存，按以下规则分层：

| 口径类型 | 保存位置 | 示例 |
|----------|----------|------|
| SQL编写规范（跨项目通用） | `shared/global_calibers.md` | 分区优先、禁止CTE、百分比格式 |
| SQL代码风格更新 | `shared/coding_style.md` | 缩进、逗号风格、别名规则 |
| 项目业务口径 | `projects/{id}/caliber_memory.md` | DAU定义、留存口径、特定表映射 |
| 项目字段映射 | `projects/{id}/caliber_memory.md` | 表名对照、分区格式 |

保存格式：
```markdown
### [口径名称]
- 定义：[具体定义]
- 相关表：[涉及的表名]
- 关键字段：[使用的字段]
- 备注：[附加说明]
- 来源：用户于 [日期] 提供
```

确认后告知用户：`已保存口径「[名称]」到 [全局记忆/项目记忆]。`

---

## Step 6: 自动记忆 — 对话中新口径必须主动写入

**CRITICAL**: 对话过程中出现以下任一情况时，**主动自动写入**对应的记忆文件：

1. **新口径定义** → 当前项目 `caliber_memory.md`
2. **字段名纠正** → 当前项目 `caliber_memory.md`
3. **新表/新字段信息** → 当前项目 `caliber_memory.md`
4. **业务规则细节** → 当前项目 `caliber_memory.md`
5. **SQL 风格变更（通用）** → `shared/coding_style.md` + `shared/global_calibers.md`
6. **数据源变更** → 当前项目 `caliber_memory.md`

**Rules:**
- NEVER delete existing caliber entries（任何层级）
- If updated, add new version with note referencing the old one
- Always check caliber memory BEFORE asking questions
- When applying a saved caliber, inform the user which layer it came from

---

## Step 7: Learning from User SQL

用户提供 SQL 文件时：

1. 保存到当前项目的 `data/user_sql/` 下
2. 分析提取：表使用模式、WHERE 条件、表命名规则、业务逻辑、代码风格
3. **业务口径** → 保存到当前项目 `caliber_memory.md`
4. **通用风格发现** → 如果是新的通用风格规则，更新 `shared/coding_style.md`
5. 报告学习结果

---

## Resources

### shared/ （跨项目共享）

- `coding_style.md` — 统一 SQL 编码规范。**每次生成 SQL 前必须读取。**
- `global_calibers.md` — 全局通用口径记忆。**每次 SQL 任务开始时读取。**
- `xml_parsing_guide.md` — XML metalib 格式解析指南。
- `starrocks_functions.md` — StarRocks 函数完整参考文档（436个函数）。不确定函数用法时可搜索。
- `scripts/extract_schema.py` — 多项目表结构提取脚本：
  ```bash
  python shared/scripts/extract_schema.py --project nzm    # 提取特定项目
  python shared/scripts/extract_schema.py --all             # 提取所有项目
  ```

### projects/{project_id}/ （项目独立）

- `project.md` — 项目配置（表命名规则、分区、参数化变量等）。**每次 SQL 任务开始时读取。**
- `caliber_memory.md` — 项目业务口径记忆。**每次 SQL 任务开始时读取。**
- `table_schema_summary.md` — 表结构摘要（自动生成）。用 `search_content` grep 定位表/字段。
- `data/xml/` — XML 表结构定义原文件。
- `data/user_sql/` — 用户历史 SQL 参考。

---

## Quick Reference: 工作流摘要

```
用户请求
    │
    ▼
[Step 0] 识别项目 → 加载 projects/{id}/
    │
    ▼
[Step 1] 理解表结构 → 读 project.md + table_schema_summary.md + XML grep
    │
    ▼
[Step 2] 检查口径 → 读 shared/global_calibers.md + projects/{id}/caliber_memory.md
    │                  + 读 projects/{id}/data/user_sql/ 学习模式
    ▼
[Step 3] 口径确认 → 已有口径沿用 + ask_followup_question 确认模糊项
    │
    ▼
[Step 4] 生成 SQL → 读 shared/coding_style.md + project.md → 输出 SQL
    │
    ▼
[Step 5] 口径持久化 → 自动保存到对应层级
    │
    ▼
[Step 6] 自动记忆 → 对话中新发现自动写入
    │
    ▼
[Step 7] 学习SQL → 用户提供SQL时分析并记忆
```
