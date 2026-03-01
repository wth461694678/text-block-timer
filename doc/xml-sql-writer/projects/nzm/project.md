# 项目配置：NZM（逆战猎手）

## 基本信息

- **项目ID**: `nzm`
- **项目名称**: 逆战猎手 (NZM / CodeZ)
- **项目描述**: NZM 项目的 TLOG 日志系统，基于 metalib 格式的 XML 表定义
- **创建日期**: 2026-02-13

## 数据源配置

### TDW 表命名规则
- 带命名空间: `ieg_tdbank::codez_dsl_{StructName}_fht0`
- 不带命名空间: `codez_dsl_{StructName}_fht0`
- 库名.表名用 `.` 连接: `ieg_tdbank.codez_dsl_{StructName}_fht0`

### SR 表命名规则
- SR 侧: `codez_dev_sr.codez_dev.{table_name}`
- SR 侧日志表: `codez_log.{table_name}`
- 中间表: `codez_mid_analysis.{table_name}` 或 `codez_dev.{table_name}`

### 分区字段
- TDW 表: `tdbank_imp_date`（格式 `YYYYMMDDHH`，10位含小时）
- SR 中间表: `p_date`（格式 `YYYYMMDD`）
- SR 日志表: `dteventdate`（格式 `YYYY-MM-DD`）
- SR 标签表: `dtstatdate`（格式 `YYYY-MM-DD`）
- 道具流水表: `idate`（格式 `YYYY-MM-DD`）

### 参数化变量
- TDW: `${BEGIN_DATE}` / `${END_DATE}`
- SR: `${:sys_starttime}` / `${:sys_endtime}`
- 中间表日期: `${YYYYMMDD}`

### 分区格式示例
- TDW: `tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'`（一整天）
- SR 中间表: `p_date = '${YYYYMMDD}'`
- SR 日志表: `dteventdate between 'YYYY-MM-DD HH:MM:SS' and 'YYYY-MM-DD HH:MM:SS'`

## 通用字段

几乎所有表都以以下必填字段开头：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| GameSvrId | string | 登录服务ID |
| dtEventTime | datetime | 事件时间 (YYYY-MM-DD HH:MM:SS) |
| vGameAppid | string | 游戏APPID |
| PlatID | int | 平台: 0=iOS, 1=Android, 2=PC, 12=鸿蒙 |
| iZoneAreaID | int | 注册服ID |
| vOpenID | string | 用户OPENID |
| vRoleID | string | 角色ID |

## 目录结构

```
projects/nzm/
├── project.md                # 本文件 - 项目配置
├── caliber_memory.md         # 项目业务口径记忆
├── table_schema_summary.md   # 表结构摘要（自动生成）
├── data/
│   ├── xml/                  # XML 表结构定义
│   └── user_sql/             # 用户历史 SQL
│       ├── codeZ/            # TDW 表 SQL
│       └── codeSR/           # SR 表 SQL
└── scripts/                  # 项目专属脚本（可选）
```

---
