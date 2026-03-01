# NZM 项目数据口径记忆库

> 本文件用于持久化存储 NZM（逆战猎手）项目的业务口径定义。
> 跨项目通用口径请参见 `../../shared/global_calibers.md`。
> **此文件是永久记忆，不可删除已有条目，只可追加或修正。**

---

## 通用口径

### DAU (日活跃用户数) / 活跃判断
- 定义：当日在 PlayerLogin（loginresult=0）和 PlayerLogout 表中出现过即算活跃，两表 UNION 去重
- 统计粒度：账号维度 (vopenid)
- 相关表：PlayerLogin, PlayerLogout
- 关键字段：vopenid, loginresult(仅Login表需=0), env, LoginChannelStr/registchannel, PlatID
- 环境过滤：env = 'live'（正式服）
- **活跃时长**：使用当天**登出表(PlayerLogout)的 OnlineTime 字段之和**，单位为秒（输出可转分钟 /60）
- 平台分类：分为四类展示：
  - **移动端**: PlatID IN (0, 1, 12)，即 iOS(0) + Android(1) + 鸿蒙(12) 合并
  - **PC端**: PlatID = 2
  - **云游戏**: 登录渠道 LoginChannelStr like '59%'（不按PlatID判断，优先级高于PlatID分类）
  - **汇总**: 全部去重 DAU
  - 注意：云游戏判定优先于 PlatID 分类，即渠道59开头的不再计入移动端/PC端
- 备注：DAU 需要同时统计登录表和登出表的记录进行 UNION 去重
- 来源：用户于 2026-02-13 提供，2026-02-27 更新（活跃时长口径：登出表 OnlineTime 之和）

### 云游戏判定
- 定义：登录渠道(LoginChannelStr/registchannel)以 '59' 开头的记录视为云游戏
- 判定方式：LoginChannelStr like '59%' 或 substr(registchannel,1,2) = '59'
- 相关字段：LoginChannelStr（登录表）, registchannel（注册表）, is_gamematrix（云游戏标记字段,1=是）
- 备注：云游戏的 reg_platid 统一映射为 59
- 来源：用户于 2026-02-13 提供

### 正式服环境
- 定义：env = 'live' 为正式服环境
- 备注：测试服环境为 env = 'tiyan'
- 来源：从用户 SQL 中学习，2026-02-13

### 日活跃度分段
- 定义：按玩家当日对局数(totalfightcnt)划分活跃度等级
- 分段：
  - **未开局**：totalfightcnt = 0 或 NULL
  - **低活**：1 ≤ totalfightcnt < 3
  - **中活**：3 ≤ totalfightcnt < 6
  - **高活**：6 ≤ totalfightcnt < 10
  - **满活**：totalfightcnt ≥ 10
- 数据源：`codez_dev.dwd_w_codez_vroleid_summary_wide_di` 的 `totalfightcnt` 字段
- 来源：用户于 2026-02-27 提供

### 周活跃度分段
- 定义：按玩家周对局数划分活跃度等级
- 分段：
  - **未开局**：对局数 = 0 或 NULL
  - **低活**：0 < 对局数 ≤ 4
  - **中活**：5 ≤ 对局数 ≤ 10
  - **高活**：11 ≤ 对局数 ≤ 25
  - **满活-4局**：26 ≤ 对局数 ≤ 37
  - **满活-7局**：38 ≤ 对局数 ≤ 64
  - **极限-10局**：对局数 > 64
- 来源：用户于 2026-02-27 提供

### 付费分R分段
- 定义：按玩家累计付费金额(元)划分付费等级
- 数据源：`codez.codez_mid_tbwater`（SR侧），金额字段 `imoney`（单位分，需 /100 转元），`platid = 255`（全平台）
- 计算：`SUM(imoney) / 100` 得到元为单位的累计付费
- 分段：
  - **1.小R**：0 < 金额 ≤ 256
  - **2.中R**：256 < 金额 ≤ 650
  - **3.中大R**：650 < 金额 ≤ 1500
  - **4.大R**：1500 < 金额 ≤ 3000
  - **5.超R**：金额 > 3000
- 备注：金额为0或NULL的玩家不参与分R（即免费玩家不在此分类中）
- 来源：用户于 2026-02-27 提供

### 配置表使用优先级
- **优先使用 codez_mid_analysis 库的中间表**，其次才用 SR 库 codez_dev_sr.codez_dev 的表
- 具体优先级：
  | 查询需求 | 优先使用（TDW中间表） | 备选（SR库） |
  |---------|---------------------|-------------|
  | 通用配置（configname过滤） | codez_mid_analysis.codez_ret_excelconfiginfo_conf | codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf |
  | 副本/玩法映射 | codez_mid_analysis.codez_ret_dungeon_conf（字段更直观：dungeonid, modetype, dungeonname等） | codez_ret_excelconfiginfo_conf where configname='FubenEntranceInfo' |
  | 武器映射 | codez_mid_analysis.codez_ret_weapon_conf（weaponid→weaponname/weapontypename等） | 无 |
  | 赛季天赋映射 | codez_mid_analysis.tmp_codez_seasontalent_conf（talentid→talentname等） | 无 |
- 备注：codez_mid_analysis 中间表无分区字段，可直接全表查询；SR 库的 codez_ret_excelconfiginfo_conf 也无分区
- 来源：用户于 2026-02-28 提供

### 表来源选择优先级（跨库关联规则）
- **第一优先：全 TDW 表**（ieg_tdbank.* + codez_mid_analysis.*），尽量让一条 SQL 中所有表都来自 TDW 侧
- **第二优先：全 SR 表**（codez_dev_sr.codez_dev.* + codez_log.*），如果 TDW 表不能满足需求
- **第三优先：TDW 关联 SR**，仅当某些表只在 SR 侧有时才混用
- 备注：这是为了减少跨库查询开销，同库关联性能更优
- 来源：用户于 2026-02-28 提供

---

## 业务口径

### 首日注册玩家
- 定义：2026年1月13日（上线首日）注册且当日登录成功的玩家
- 判定条件：PlayerRegister 表中注册日期为 2026-01-13，且 PlayerLogin 表中同日有 loginresult=0 的登录记录
- 相关表：PlayerRegister, PlayerLogin
- 关键字段：vopenid, dtEventTime/tdbank_imp_date, loginresult
- 环境过滤：env = 'live'
- 备注：仅「注册」不够，必须同时在当日「登录成功」才算首日注册玩家
- 来源：用户于 2026-02-24 提供

### 留存
- 定义：注册日后第N天在中间表中有记录即算留存
- 统计粒度：vopenid
- **数据源**：优先使用中间表 `codez_mid_analysis.dwd_w_codez_vroleid_summary_wide_di`（p_date 格式 YYYYMMDD）
- **推荐写法（SR 引擎兼容）**：使用 `array_agg(p_date)` 聚合活跃日列表，再用 `array_contains(activedays_list, date_add(注册日, N-1))` 判断第N天是否活跃
  - SR 支持 `array_agg`（等价 Hive 的 collect_list）和 `array_contains`（与 Hive 同名）
  - 参考代码风格：`data/user_sql/codeZ/上线/留存/留存代码.sql`
- 相关表：dwd_w_codez_vroleid_summary_wide_di（推荐）, PlayerLogin, PlayerLogout（备选）
- 环境过滤：env = 'live'
- 来源：从用户 SQL 文件「留存代码.sql」学习，2026-02-28 更新（SR支持array_agg+array_contains）

### 匹配成功率
- 定义：匹配成功次数(RoomMatchAllocResult 表中 Result=0) / 发起匹配总次数(RoomMatchAllocStart 表记录数) × 100%
- 统计粒度：按次数统计（非去重账号）
- 模式拆分维度：通过 DungeonID 关联 SR 配置表获取玩法模式名称
  - 配置表: `codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf` WHERE configname = 'FubenEntranceInfo'
  - 关联: Start/Result 表的 DungeonID = 配置表的 param1 (dungeon_id)
  - 模式名称字段: param4（玩法模式名，如 僵尸猎场、塔防、机甲战、故事模式 等）
  - 其他可用字段: param2 = map_id, param7 = map_name, param8 = 难度
- 相关表：RoomMatchAllocStart, RoomMatchAllocResult, codez_ret_excelconfiginfo_conf
- 关联方式：Start 表和 Result 表可通过两种方式关联：
  - **简单场景**: 通过 `MatchAllocID` 直接关联
  - **复杂场景（需要组队来源等信息时）**: 通过 `vRoleID + TeamID + 时间约束` 关联
- 过滤 Bot：`CAST(vRoleID AS BIGINT) >> 63 <= 0`
- 环境过滤：env = 'live'
- 分端展示（可选）：匹配表中按 PlatID 分端，不拆云游戏
- 来源：用户于 2026-02-13 提供，多次更新

### 跨端匹配
- 定义：同一个 RoomID 中存在不同 PlatID 的玩家（移动端和PC端混合）
- 跨端判定：按 RoomID 聚合后，若 `count(distinct case when platid in (0,1,12) then 'mobile' when platid=2 then 'pc' end) > 1` 则为跨端
- 分端定义：移动端 PlatID IN (0,1,12) / PC端 PlatID = 2
- 统计粒度：房间维度（每个 RoomID 算一次）
- 跨端来源分类：
  - **官方匹配跨端**：跨端房间中存在 final_TeamApplySource = 0 的玩家
  - **玩家自发组队跨端**：跨端房间中存在 final_TeamApplySource ∉ {0, -1} 且队伍内部有移动端+PC端
- 来源：用户于 2026-02-13 提供

### 组队来源判定 (TeamApplySource)
- 原始字段：RoomMatchAllocStart 表的 TeamApplySource
  - 0=单排, 1=创建队伍, 2=组队平台, 3=社团队伍, 4=世界招募, 5=公会招募
  - 6=兴趣频道, 7=邀请游戏好友, 8=申请, 9=抖音一键上车, 10=邀请微信好友
  - 11=邀请QQ好友, 12=邀请社团好友, 13=邀请最近同玩玩家, 14=小程序邀请
  - 15=邀请系统推荐的好友, 16=邀请附近好友, 17=玩家头像交互面板邀请, 18=活动邀请
- **最终来源 (final_TeamApplySource) 逻辑**：
  - 若 TeamApplySource=1(创建队伍) 且 TeamMemberNum=1 → 自建房单排(-1)
  - 若 TeamApplySource=1(创建队伍) 且 TeamMemberNum>1 → 取同 RoomID+MapID+TeamID 内按优先级排序的最佳来源
  - 其他情况 → 使用原始 TeamApplySource
- **best_team_source 优先级**（从高到低）：
  7 > 12 > 13 > 10 > 11 > 9 > 14 > 15 > 16 > 17 > 8 > 3 > 2 > 4 > 5 > 6 > 18 > 1
- 来源：用户于 2026-02-13 提供完整 SQL 逻辑

### 组队率
- 定义：组队匹配人次占比 = final_TeamApplySource 不为 0 和 -1 的匹配成功人次 / 全部匹配成功人次 × 100%
- 统计粒度：按人次统计
- 来源：用户于 2026-02-13 提供

### 武器DPS
- 定义：每把武器在每局中的 DPS = WeaponDamage / CombatUseTime
- 数据源：PlayerBDDamageStatData
- 过滤 Bot：BotID = 0 或 BotID IS NULL
- 来源：用户于 2026-02-13 提供

### 玩家定义 (is_core)
- 定义：基于 `dwd_sr_codez_player_losstag_di` 表的 `is_core` 字段分类
- 分类：核心 / 次核 / 其他玩家（COALESCE(is_core, '其他玩家')）
- 来源：用户于 2026-02-24 提供

### 回流玩家
- 定义：已注册满7天以上 + 最近连续7日未活跃 + 目标日期当天有活跃记录
- 活跃判定：PlayerLogin (loginresult=0) UNION PlayerLogout
- 来源：用户于 2026-02-24 提供

### 首日玩法偏好
- 定义：按首日对局时长最长的玩法作为玩法偏好，取 TOP1
- **玩法口径**：`codez_mid_analysis.codez_ret_dungeon_conf` 表的 **modetype** 字段
- 数据源：GameDetail + DropOutDetail 明细表取首日对局
- 计算方式：按 vopenid + idungeonid 聚合 sum(iDuration)，用 max_by(modetype, total_dur) 取时长最大的玩法
- 来源：用户于 2026-02-28 提供

### 对局明细（完整对局 + 中退）
- 定义：玩家的完整对局记录需合并 GameDetail（完整对局）和 DropOutDetail（中退记录）
- 计算方式：`GameDetail UNION ALL DropOutDetail`
- 大厅过滤：`idungeonid <> 2004001`
- 对局时长：`iDuration` 字段，单位为秒
- 来源：用户于 2026-02-24 提供

### 游戏活跃类型 (itype in activetag)
- 数据源：`dwd_sr_codez_player_activetag_di` 表的 `itype` 字段
- 分类：1=近一个月活跃, 2=近2~3个月活跃, 3=流失3个月以上
- 来源：用户于 2026-02-24 提供

### 游戏来源 (busi_name)
- 数据源：`dwd_sr_codez_player_activetag_di` 表的 `busi_name` 字段
- 空值处理：COALESCE(busi_name, '盘外来源')
- 来源：用户于 2026-02-24 提供

### activetag 表关联注意事项
- **该表仅在玩家注册当天上报数据**
- `dtstatdate` 必须与玩家的注册日期对齐
- 来源：2026-02-24 排查发现

### 玩法类型映射（FubenEntranceInfo 配置表 param4）
- 已知 param4 玩法类型：塔防、机甲战、僵尸猎场、猎场竞速、时空追猎、躲猫猫
- param5 = 僵尸猎场的细分分类
- 关联方式：CAST(param1 AS BIGINT) = DungeonID / idungeonid
- 来源：用户于 2026-02-24 提供

### ItemFlow 表 Reason 值
- Reason = 67：猎场产出
- 来源：用户于 2026-02-28 提供

### 猎场地图与专属金近战映射
- 映射关系：
  | 猎场地图(param7) | 专属金近战 | igoodsid |
  |---|---|---|
  | 昆仑神宫 | 蛇神之矛 | 20113000044 |
  | 昆仑神宫 | 蛇神之剑 | 20113000045 |
  | 精绝古城 | 血怨 | 20113000037 |
  | 大都会 | 死亡之拥 | 20113000007 |
  | 冰点源起 | 冰点双锋 | 20113000030 |
  | 黑暗复活节 | 死神镰刀 | 20113000004 |
- 来源：用户于 2026-02-28 提供

### 武器产出统计
- 数据源：`codez_dev.dwd_sr_codez_itemflow_conf_di`（分区 `idate`，格式 `YYYY-MM-DD`）
- 基础过滤：`itemtype = 2`, `AddOrReduce = 0`
- 排除：`itemthreetype != 11`（机甲）、`itemthreetype != 80`（大杀器）
- 武器分类规则：基于 igoodsid 字段
  - 枪械 vs 近战：`SUBSTR(igoodsid, 4, 2) != '13'` 为枪械，`= '13'` 为近战
  - 永久 vs 临时：`SUBSTR(igoodsid, 8, 1) = '0'` 为永久，`!= '0'` 为临时
  - 品质：2=蓝色, 3=紫色, 4=金色
- 来源：用户于 2026-02-27 提供

---

## 字段映射备注

### TDW 表名映射规则
- TDW 格式（带命名空间）: `ieg_tdbank::codez_dsl_{StructName}_fht0`
- TDW 格式（不带命名空间）: `codez_dsl_{StructName}_fht0`
- 分区字段：`tdbank_imp_date`，格式为 `YYYYMMDDHH`（10位含小时）
- 日期提取：`substr(tdbank_imp_date, 1, 8)` 获取日期部分

### 常见表名对照
| XML struct name | TDW 表名 |
|-----------------|----------|
| PlayerRegister | codez_dsl_playerregister_fht0 |
| PlayerLogin | codez_dsl_playerlogin_fht0 |
| PlayerLogout | codez_dsl_playerlogout_fht0 |
| GameDetail | codez_dsl_gamedetail_fht0 |
| DropOutDetail | codez_dsl_dropoutdetail_fht0 |
| GameTotal | codez_dsl_gametotal_fht0 |
| ItemFlow | codez_dsl_Itemflow_fht0 |
| MoneyFlow | codez_dsl_moneyflow_fht0 |
| MallBuy | codez_dsl_mallbuy_fht0 |
| MallLottery | codez_dsl_MallLottery_fht0 |
| BotGameStatisReport | codez_dsl_BotGameStatisReport_fht0 |
| WXMiniGameLogin | codez_dsl_WXMiniGameLogin_fht0 |
| RoomMatchAllocResult | codez_dsl_RoomMatchAllocResult_fht0 |
| SeasonBPLevelUp | codez_dsl_SeasonBPLevelUp_fht0 |
| SeasonTask | codez_dsl_SeasonTask_fht0 |
| GameBossDetail | codez_dsl_GameBossDetail_fht0 |
| PlayerClickButtonFlow | codez_dsl_PlayerClickButtonFlow_fht0 |
| SeasonLevel | codez_dsl_SeasonLevel_fht0 |
| LadderRankLevelFlow | codez_dsl_LadderRankLevelFlow_fht0 |
| SeasonBuyBP | codez_dsl_seasonbuybp_fht0 |

### SR 表（策划配置表 & SR 侧宽表/汇总表）

**配置表**：
- 副本信息: `codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf`
  - configname = 'FubenEntranceInfo'
  - param1=dungeon_id, param2=map_id, param4=玩法模式名, param7=map_name, param8=难度

**SR 侧宽表/汇总表**：
- 社交宽表: `codez_dev_sr.codez_dev.dwd_sr_codez_social_wide_di`（p_date）
- 道具宽表: `codez_dev_sr.codez_dev.dwd_sr_codez_item_di`（p_date）
- 组队类型: `codez_dev_sr.codez_dev.dwd_sr_codez_matchteamtype_di`（p_date）
- 玩家活跃标签: `dwd_sr_codez_player_activetag_di`（dtstatdate）
- 玩家流失标签: `dwd_sr_codez_player_losstag_di`（dtstatdate，命名空间 codez）
- 活跃汇总: `ads_sr_codez_actv_di`（dteventtime），platid=255全平台
- 付费汇总: `ads_sr_codez_pay_di`（dteventtime），platid=255全平台
- 玩家聚类: `codez_dev.codez_player_cluster_tag`（无分区）

**SR 侧同结构 TDW 表**：
- 命名空间: `codez_log.*`，分区: `dteventdate`

### 付费数据表
- 付费流水: `hy_idog_oss::codez_mid_tbwater`（dtstatdate，imoney 单位分，platid=255全平台）

### 中间表/临时表
- 命名空间: `codez_mid_analysis::temp_nzm_*`
- 实时活跃大表: `codez_event`（event='BillowActiveBigtable', platid=255）

### 中间表：dwd_w_codez_vroleid_summary_wide_di
- 表名：`codez_dev.dwd_w_codez_vroleid_summary_wide_di`
- 分区：`p_date`（YYYYMMDD）
- 粒度：vroleid + env + p_date
- 当查询中需要 vopenid/vroleid × p_date 时，优先使用此表

#### 维度字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| p_date | string | 日期分区 YYYYMMDD |
| vopenid | string | 账号ID |
| vroleid | string | 角色ID |
| vgameappid | string | 游戏APPID |
| platidlst | string | 平台列表（逗号分隔） |
| env | string | 服务器环境 |

#### 基础信息字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| vrolename | string | 角色名 |
| playerlevel | bigint | 等级 |
| guildid | string | 公会ID |
| guildname | string | 公会名 |
| playerregtimestamp | bigint | 注册时间戳 |
| playerregdate | string | 注册日期 yyyyMMdd |

#### 活跃与时长字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| totalgamedur | bigint | 游戏总时长（秒，累计） |
| onlinedur | bigint | 当日在线时长（秒） |
| fatiguevalue | bigint | 当日疲劳值变更量 |

#### 对局相关字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| totalfightcnt | int | 当日总对局数 |
| pvpfightcnt | int | PVP对局数 |
| pvefightcnt | int | PVE对局数 |
| modetypefightcntjson | string | 按模式类型对局数JSON |
| pvpfightdur | bigint | PVP时长（秒） |
| pvefightdur | bigint | PVE时长（秒） |
| modetypefightdurjson | string | 按模式类型时长JSON |

#### 背包/武器/插件/天赋/任务字段
- weaponcnt, weapontypecnt, weaponqualitytypecntjson, weaponlst
- modulecnt, moduletypecnt, modulequalitytypecntjson, modulelst
- talentlevel, talentaddcnt, talentreducecnt, talentresetcnt
- dailytaskfinishcnt
- 详见中间表逻辑SQL

---
