# NZM TLOG XML 解析指南

## XML 格式说明

NZM 项目使用 `metalib` 格式的 XML 定义 TLOG 日志表结构。

### 根结构

```xml
<metalib tagsetversion="1" name="nzmtlog" version="2">
  <macrosgroup name="PlatID" desc="...">
    <macro name="IOS" value="0" desc="ios"/>
    ...
  </macrosgroup>

  <struct name="TableName" version="1" desc="表描述">
    <entry name="FieldName" type="FieldType" size="N" defaultvalue="X" desc="字段描述"/>
    ...
  </struct>
</metalib>
```

### 关键标签

| 标签 | 说明 |
|------|------|
| `<metalib>` | 根节点，name 属性为项目名 |
| `<macrosgroup>` | 枚举/常量定义组 |
| `<macro>` | 单个枚举值定义 |
| `<struct>` | 表定义，name=表名, desc=表描述 |
| `<entry>` | 字段定义 |

### Entry 属性

| 属性 | 说明 | 必填 |
|------|------|------|
| `name` | 字段名 | 是 |
| `type` | 字段类型 | 是 |
| `size` | 字段长度（string类型） | 否 |
| `defaultvalue` | 默认值 | 否 |
| `desc` | 字段描述/注释 | 是 |
| `index` | 索引标记 | 否 |

### 字段类型映射

| XML type | TDW/Hive 类型 | 说明 |
|----------|---------------|------|
| string | STRING | 字符串 |
| int | INT | 整数 |
| int32 | INT | 32位整数 |
| uint32 | BIGINT | 无符号32位（TDW无unsigned） |
| bigint | BIGINT | 大整数 |
| biguint | BIGINT | 无符号大整数 |
| uint64 | BIGINT | 无符号64位 |
| int64 | BIGINT | 64位整数 |
| float | FLOAT | 浮点数 |
| double | DOUBLE | 双精度浮点 |
| datetime | STRING | 时间格式 YYYY-MM-DD HH:MM:SS |

## NZM TLOG 通用字段

几乎所有表都以以下必填字段开头（固定顺序）：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| GameSvrId | string | 登录服务ID |
| dtEventTime | datetime | 事件时间 |
| vGameAppid | string | 游戏APPID |
| PlatID | int | 平台: 0=iOS, 1=Android, 2=PC, 12=鸿蒙 |
| iZoneAreaID | int | 注册服ID |
| vOpenID | string | 用户OPENID |
| vRoleID | string | 角色ID (= PlayerID) |

大部分表还包含：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| vRoleName | string | 角色名 |
| iLevel | int | 等级 |
| Env / env | string | 服务器环境 |

## 表分类概览

| 分类 | 代表表名 | 用途 |
|------|----------|------|
| 玩家注册/登录 | PlayerRegister, PlayerLogin, PlayerLogout | 用户生命周期 |
| 在线统计 | onlinecnt | 实时在线 |
| 经济系统 | MoneyFlow, ShopFlow, ItemFlow, MallBuy | 货币/道具/商城 |
| 单局数据 | GameDetail, GameTotal, DropOutDetail | 副本/对局数据 |
| 匹配系统 | RoomMatchAllocStart, RoomMatchAllocResult | 匹配流程 |
| 社交系统 | CreateUnion, ManageFriendFlow | 工会/好友 |
| 活动系统 | ActivityFlow, AwardFlow | 活动/奖励 |
| 安全/监控 | SecTalkFlow, MallZeroYuanBuy | 安全相关 |
| DS(Dedicated Server) | DsGameLog*, PlayerLogInOutDS | 专用服务器 |
| 客户端性能 | ClientLoading, ClientReconnect, PlayerPingReport | 性能监控 |
| PVP/赛季 | PVPGameDetail, PVPGameTotal | PVP 对战数据 |
| 时空追猎 | SpaceTimeHuntGameTotal, SpaceTimeHuntGameDetail2 | 时空追猎玩法 |

## 解析策略

1. 搜索 `references/table_schema_summary.md` 中的表目录快速定位相关表
2. 用 `search_content` 在 XML 原文中 grep `<struct name="表名"` 获取完整字段定义
3. 注意 `desc` 中的 `(必填)` / `(可填)` 标注
4. 注意 `desc` 中的枚举值说明（如 `详见XxxEnums`）
5. 注意已作废的表（desc 中标注 `已作废`）
