# NZM TLOG 表结构摘要

> 自动提取时间: 2026-02-24 10:49

> 共解析 2 个 XML 文件，262 张表

---

## 表目录

| 序号 | 表名 | 描述 | 字段数 | 来源文件 |
|------|------|------|--------|----------|
| 1 | PlayerRegister | (必填)玩家创建角色 | 32 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 2 | PlayerPreRegister | (必填)玩家预创建角色 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 3 | PlayerLogin | (必填)玩家登陆 | 56 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 4 | PlayerLogout | (必填)玩家登出 | 51 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 5 | onlinecnt | (必填)实时在线日志，每分钟一条 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 6 | ClientLoading | 客户端Loading时长，只在成功进入局内时上报 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 7 | ClientLoadingScreen | 用于监控客户端进不同地图的屏幕等待时长 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 8 | ClientReconnect | 用于监控客户端断线重连表现统计 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 9 | PlayerExpFlow | (必填)玩家经验流水 | 23 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 10 | MoneyFlow | (必填)货币流水 | 21 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 11 | ShopFlow | (必填)商店流水 | 29 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 12 | MallClick2 | 商城点击流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 13 | MallBuy | 商城购买流水 | 39 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 14 | MallLottery | 商城抽奖流水 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 15 | GGBondMallLotteryClientFlow | 客户端猪猪侠抽奖流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 16 | LotteryClientFlow | 客户端放回抽奖通用流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 17 | MallLotteryClientFlow | 客户端不放回抽奖通用流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 18 | ItemFlow | (必填)道具流水 | 34 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 19 | DropMaxHoldItemFlow | (必填)超过持有上限丢弃道具流水表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 20 | AwardFlow | (必填)奖励流水 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 21 | PlayerSeasonLotteryFlow | 赛季补给抽奖流水 | 21 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 22 | PlayerShopLotteryFlow | 红角抽奖流水 | 27 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 23 | ClaimTrackRewardFlow | 红角抽奖进度奖励领取流水 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 24 | ReceiveMail | 邮件领取 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 25 | ResponseAddFriendFlow | 操作好友申请流水 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 26 | ManageFriendFlow | 操作好友流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 27 | WXMiniGameLogin | 微信小游戏玩家登录 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 28 | ClientLoginDS | 玩家登录DS（客户端上报） | 31 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 29 | PlayerLogInOutDS | 玩家登录登出DS（服务器MatchOpener上报） | 18 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 30 | GameDetail | 副本类单局流水表 | 52 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 31 | BotGameDetail | 副本类单局流水表 | 41 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 32 | BotGameStatisReport | 副本类单局流水表 | 58 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 33 | DropOutDetail | 副本类单局中途退出信息表 | 37 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 34 | GameTotal | 副本类 单局游戏总体数据 | 33 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 35 | GameTotalPlayerInfo | 单局结算时游戏玩家信息 | 36 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 36 | SpaceTimeHuntGameTotal | 时空追猎专用的GameTotal | 54 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 37 | PlayerDeathAndReviveStaticsData | 玩家死亡复活位置信息上报表 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 38 | ChallengeSubDungeonGameTotal | 挑战玩法子关卡数据 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 39 | PlayerChallengeSubDungeonGameDetails | 玩家挑战玩法子关卡数据 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 40 | GameBossDetail | 副本类 Boss战斗流水表 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 41 | MonsterKillTimes | 怪物击杀玩家的统计 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 42 | BossKillSkills | Boss击杀玩家的统计 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 43 | MonstersShieldBrokenStatus | 副本局内怪物被破盾的数据统计 | 19 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 44 | CharComInGameUsage | 精绝女王局内红包tglog | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 45 | PlayerReceiveHongbaoStatics | 玩家局内收到红包,DS直接上报 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 46 | PlayerGiveHongbaoStatics | 玩家局内发出红包,DS直接上报 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 47 | SpaceTimeHuntGameDetail2 | 时空追猎相关的单局结算信息 | 172 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 48 | SKZLTacticalSkill | 玩家局内时空追猎战术技能上报表，由DS直接上报 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 49 | SpaceTimeHuntPlayerUnlockSkill | 时空追猎玩法玩家战术支援技能解锁/升级表 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 50 | SpaceTimeHuntPlayerGetRewards | 时空追猎玩法玩家获取奖励表 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 51 | PlayerMechaInfoStaticsData | 玩家局内机甲表 由DS直接上报 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 52 | PlayerMechaSkillDamageData | 玩家机甲技能伤害上报表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 53 | MechaGameRoundTotal | 机甲战类回合房间流水表 | 25 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 54 | PlayerMechaRoundGameDetail | 机甲战类回合玩家流水表 | 67 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 55 | PlayerMechaComponentFlow | 机甲组件获得流水 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 56 | PlayerMechaChangeFlow | 机甲修改部件流水 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 57 | PlayerMechaCoreFlow | 机甲核心流水 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 58 | PlayerWeaponReportingData | 玩家局内武器数据上报 | 81 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 59 | PlayerDamageStatData | 单局玩家伤害数据上报 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 60 | PlayerDeathStatData | 本局中杀死本玩家的结算ID的数据上报 | 31 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 61 | HuntingFieldGameDetail | 猎场专用的玩家结算数据上报 | 19 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 62 | PlayerHuntingFieldShopRecord | 玩家猎场局内道具购买记录 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 63 | PlayerHuntingFieldPartitionGameDetail | 玩家猎场分区数据上报 | 61 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 64 | PlayerWeaponModuleFlow | 模组装载流水表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 65 | PlayerWeaponFlow | 武器获得流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 66 | PlayerHighLightDPStaticsFlow | 玩家历史战绩操作流水表 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 67 | PlayerDsConn | 玩家DS网络统计，保留一个月 | 71 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 68 | DsNetConn | DS网络统计，保留一个月 | 30 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 69 | PlayerLobbyConn | 玩家lobby网络统计，保留一个月 | 38 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 70 | PlayerSelectedSchemeInfo | 玩家选择预设数据记录 | 62 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 71 | PlayerDSChangeSchemeFlow | 玩家局内切换预设流水 | 109 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 72 | ClientSettingChange | 客户端设置变更流水 | 172 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 73 | WeaponUIStat | 武器界面点击率 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 74 | HUDSettingChange | 自定义HUD设置变更流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 75 | PlayerHUDOperationFlow | 玩家按键操作流水，按键状态变化时上报之前按键组合的数据。由于上报极其频繁，只限制白名单玩家开启，白名单由IDIP接口SetHUDOperationReport来控制（可在nzsvr.woa.com配置） | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 76 | LittlePackageDownload | 小包下载 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 77 | ASAIadinfo | 苹果商店买量ASA信息的采集上报 | 29 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 78 | ActivityFlow | 玩家活动完成流水，保留一个月 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 79 | ActivityCenterTaskFlow | 活动中心任务参与流水 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 80 | HunterMissionStatusChange | 猎场周期活动任务状态变更 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 81 | PlayerBeginnerGuideFlow2 | 玩家新手引导完成情况流水 | 18 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 82 | VeteranPlayerSkipBeginnerGuide | 老手跳过新手历程 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 83 | RookieMissionStatusChange | 新手5日活跃任务状态变更 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 84 | RookieMissionClick | 新手5日活跃任务点击 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 85 | PlayerFuncUnlock | 功能解锁流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 86 | PlayerAchievementInfo | 玩家成就信息表，玩家完成/领取某一个成就之后上报，以玩家的PlayerID为上报Key | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 87 | PlayerAchAndTitlePageInfo2 | 玩家成就和称号页面访问次数 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 88 | PlayerDFlow | 玩家DFlow流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 89 | PlayerTeamInfoData | 玩家组队状态表 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 90 | RoomMatchAllocStart | 玩家开始匹配副本 | 25 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 91 | RoomMatchAllocResult | 玩家匹配副本结果 | 28 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 92 | RoomMatchStartMatchPlayerAndBotNum | 匹配开赛的总人数和Bot数 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 93 | CreateUnion | 创建工会 | 24 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 94 | ModifyUnion | 修改公会信息 | 31 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 95 | ApplyJoinUnion | 申请加入工会 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 96 | JoinUnion | 加入工会 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 97 | QuitUnion | 退出工会 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 98 | AppointOrRemoveMemberRole | 工会职位变动 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 99 | DismissUnion | 工会解散 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 100 | UnionGroupFlow | 社团群流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 101 | SecTalkFlow | 聊天信息发送日志 | 34 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 102 | SecEditFlow | 资料编辑日志 | 22 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 103 | SecSNSFlow | 社交操作日志 | 28 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 104 | SecRankingListFlow | 排行榜上榜日志 | 21 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 105 | SecAntiDataFlow | 安全特征日志 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 106 | SecVerifyFlow | 服务端校验结果日志 | 24 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 107 | SecGetReportData2Flow | 玩家GetReportData2上报流水 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 108 | SecMoveReport | 玩家移动方向键操作记录，用于安全挂机检测。每3min及单局结束上报 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 109 | SecTriggerClickFlow | 玩家开火、技能键操作记录，用于安全挂机检测。每3min及单局结束上报 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 110 | SecShopOpenFlow | 玩家对局商店操作记录。单局结束上报 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 111 | ClickedLobbyButton | 大厅界面点击统计 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 112 | SeasonTask | (必填)赛季任务 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 113 | SeasonLevel | (必填)赛季等级变更 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 114 | SeasonExpFlow | (必填)赛季经验流水 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 115 | SeasonGrow | (必填)赛季成长流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 116 | SeasonTalent | 赛季天赋 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 117 | SeasonBuyBP | 赛季BP | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 118 | SeasonBPLevelUp | 赛季BP等级升级 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 119 | SeasonTaskPhaseEnter | 赛季任务阶段界面进入上报 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 120 | SignIn | 签到 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 121 | ReceiveSignInAward | 领取签到奖励 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 122 | CheckSignInAward | 查看签到奖励 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 123 | VideoActivityReward | 领取卖点视频活动奖励 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 124 | PlayerTDTowerUnLock | 塔防陷阱任务解锁情况 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 125 | PlayerTDTowerWaitUnLock | 塔防陷阱任务完成后的等待解锁状态 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 126 | PlayerTDTowerTaskAccept | 塔防陷阱任务接取情况 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 127 | TDTrapAndGunClick2 | 玩家塔防相关的点击数据 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 128 | TDSelectPosOpen | 玩家塔防位置选择 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 129 | PlayerTDTowerChangeSkin | 塔防科技塔换肤解锁情况 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 130 | PlayerTDSelectPosition | 塔防玩家站位选择 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 131 | PlayerTDGunChangeSkin | 塔防装置枪换肤解锁情况 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 132 | PlayerTDGunUnLock | 塔防装置枪解锁情况 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 133 | PlayerTDTalentUpdate | 塔防科技树天赋点更新情况 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 134 | PlayerTDTowerFavor | 塔防陷阱收藏情况 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 135 | PlayerChosenTDAffix | 玩家选择的塔防科技词条 | 40 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 136 | PlayerTowerDefenseRoundGameDetail | 玩家塔防波次流水表 | 46 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 137 | TowerDefensePlayerTrapGameDetail | 塔防陷阱单局流水表 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 138 | TowerDefenseBossGameDetail | 塔防Boss单局流水表 | 23 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 139 | TDTopDownMode | 玩家塔防俯视图摆塔流水表 | 18 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 140 | TDRangeMode | 玩家塔防训练场控制面板出怪流水表 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 141 | PlayerTowerDefensePlayerWeaponShareDetail | 玩家塔防商店武器购买/拾取流水表 | 22 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 142 | FatigueFlow | 疲劳值变更流水 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 143 | RandomChestOpenFlow | 通用随机宝箱开启流水 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 144 | LadderRankLevelFlow | 排位段位流水 | 25 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 145 | PlayerDepositPropsStatis | 玩家背包道具存量 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 146 | CustomRoomRoomInfo | 创建或者修改房间信息 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 147 | CustomRoomPlayerChange | 自建房房间内玩家变更 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 148 | CustomRoomMatchInfo | 自建房房间状态变更 | 23 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 149 | GoldHunterModeInfo | 赏金猎人房间信息 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 150 | PlayerStandAloneDungeonProgress | 客户端本地关卡进度上报 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 151 | ComplaintDetail | 举报数据上报 | 23 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 152 | ProbabilityGuaranteeFlow | 玩家概率保底状态变更流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 153 | RogueLikeSubDungeonGameDetail | 爬塔单局玩法的子关卡表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 154 | HuntingFieldSubDungeonGameDetail | 猎场单局玩法的子关卡表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 155 | HuntingFieldMangaSkipInfo | 猎场玩法跳过信息 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 156 | PlayerRogueLikeSubDungeonStatics | 爬塔玩法子关卡玩家表 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 157 | PlayerCollectionUnlockFlow | 玩家藏品解锁表 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 158 | PlayerCollectionLevelFlow | 玩家藏品到达等级/奖励表 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 159 | PlayerMonthCardUnlockFlow | 玩家月卡解锁表 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 160 | PlayerMonthCardAwardFlow | 玩家月卡奖励表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 161 | HuntingRankGameTotal | 猎场排位游戏总体数据 | 30 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 162 | PlayerLoginPrivilegeMailFlow | 登录特权邮件奖励流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 163 | PlayerPrivilegeStatusFlow | 网吧及高校用户特权流水 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 164 | DsGameLogPerfAllStat | DS整体性能统计 | 53 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 165 | DsGameLogStartupTimingInfo | DS启动耗时统计 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 166 | DsGameLogStartMatchTimeout | (DS上报)等待游戏开始超时 | 22 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 167 | DsGameLogBotAbnormalEvent | Bot异常信息上报表 | 20 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 168 | DsPlayerDisconnect | (DS上报)局内连接断开流水, Shutdown、CleanUp、Channel::CleanUp、KickPlayer等属于正常断开 | 30 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 169 | ClientDisconnectWithDS | (客户端上报)局内连接断开：不包括正常断开 | 23 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 170 | ExcelConfigInfo | 配置表上报信息 | 36 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 171 | DSAStatus | (DSA上报)各机器局内在线与负载 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 172 | ClientLoadedAssets | 客户端资源加载统计，缓冲区满了后上报 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 173 | PlayerUpdateInterestChannelFlow | 玩家更新兴趣频道流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 174 | RTProbabilityGuaranteeFlow | 玩家随机宝箱概率保底状态变更流水 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 175 | PlayerBDDamageStatData | 单局玩家构筑伤害数据 | 42 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 176 | PlayerMechaBDDamageStatData | 单局玩家机甲构筑伤害数据 | 26 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 177 | PlayerCommercialGiftPackageFlow | 商业化礼包流水表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 178 | ActivityCenterClick | 活动中心按钮点击 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 179 | ActivityCenterSetDemandGift | 活动中心设置需求礼物 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 180 | ActivityCenterPresentGift | 活动中心赠送礼物 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 181 | ActivityCenterReceiveGift | 活动中心接收礼物 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 182 | EnterLottery | 客户端发起抽奖上报 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 183 | LoginPushAdvertiseClick | 拍脸图切换 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 184 | LoginPushAdvertiseJump | 拍脸图跳转 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 185 | LobbyAdvertiseClick | 商业化推荐切换 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 186 | ClickedLobbyAdvertiseJump | 商业化推荐跳转 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 187 | ClientVisitMiniCommunity | 访问微社区 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 188 | ClientBuildRecommendApplyScheme | 构筑推荐方案应用 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 189 | StrategicStockPileReward | 战备蓄能活动奖励领取 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 190 | ActivityCenterStoreExchange | 活动中心商店兑换 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 191 | ActivityCenterPlayerReturn | 玩家回归奖励 | 19 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 192 | ActivityCenterPickOptionalTask | 玩家自选任务 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 193 | MallRecoClientFlow | 客户端推荐页面流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 194 | MechaClientFlow | 客户端机甲流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 195 | NotifyAwardUseClientFlow | 客户端获得奖励界面流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 196 | ClientActJump | 玩家跳转活动 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 197 | GCDStoryExploration | 鬼吹灯玩家探索奖励日志 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 198 | GCDStoryDeployment | 鬼吹灯玩家派遣日志 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 199 | GCDStoryRewardGeneral | 鬼吹灯玩家成功领奖日志 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 200 | GuiGuBeiChuanTa | 鬼吹灯古碑传拓日志 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 201 | YiJiKanTanCatchUp | 鬼吹灯遗迹勘探追赶日志 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 202 | PlayerFirstRechargeDoneFlow | 玩家完成首充 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 203 | MidasFlow | 米大师流水 | 35 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 204 | PlayerTractionGiftPackageNodeTrigger | 牵引礼包节点触发 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 205 | PlayerTractionGiftPackageNodeReceive | 牵引礼包节点领取 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 206 | MallRecharge | 商城充值流水 | 22 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 207 | TimeLimitPropUsedFlow | 限时道具使用流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 208 | ModifyGameNickFlow | 修改玩家昵称 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 209 | ModifyGenderFlow | 修改玩家性别 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 210 | ModifyPersonalSignFlow | 修改个性签名 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 211 | ModifyPersonalPageLocationFlow | 修改个人主页地址位置 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 212 | ModifyPrefPlayTimeFlow | 修改游玩时段 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 213 | ModifyPrefGameModeFlow | 修改偏好模式 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 214 | ModifyPrefPlayModeFlow | 修改偏好打法 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 215 | ModifyWantTypeFlow | 修改想找类型 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 216 | ModifyPersonalPageLabelsFlow | 修改个人主页标签 | 16 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 217 | ModifyUsedAvatarFlow | 使用玩家头像 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 218 | ModifyUsedAvatarFrameFlow | 使用玩家头像框 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 219 | ModifyUsedProfileCardFlow | 使用玩家个人名片 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 220 | GiveLikeFlow | 玩家点赞 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 221 | PersonalPageViewFlow | 访问他人个人主页 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 222 | PlayerClickButtonFlow | 玩家按钮点击响应流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 223 | PlayerBrowseFlow | 玩家浏览流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 224 | PersonalPageLadderPrivate | 个人主页段位隐私 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 225 | PlatSubscribeFlow | 双平台订阅结果 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 226 | SeasonCollectionOperate | 玩家每天/每周/每月/赛季/的赠送，求赠行为次数。以及对方回应求赠行为次数 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 227 | SeasonCollectionReward | 赛季收集领奖次数 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 228 | SeasonOrnamentCompose | 赛季挂饰合成 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 229 | SeasonChartViewPropFlow | 赛季图鉴道具获得流水 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 230 | SeasonChartViewReward | 赛季图鉴领奖 | 10 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 231 | PlayerCommercialExchangeShop | 商业化兑换商店流水 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 232 | BuildRecommendClickStrategy | 构筑推荐攻略访问 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 233 | SavingActivityRewardFlow | 储蓄活动奖励变更流水 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 234 | InvitationBackActivityInvitor | 拉回活动发起邀请 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 235 | InvitationBackActivityInvitee | 拉回活动受邀请 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 236 | CreateUnionPartner | 社团搭子求组发布 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 237 | UnionReserve | 社团预约组队 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 238 | UnionImmediateTeamUp | 社团立刻组队的日志 | 9 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 239 | PlayerInteractFlow | 玩家点赞/酸柠檬流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 240 | PlayerLoginWeaponStatis | 玩家登录登出武器统计 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 241 | PlayerSurrenderStatis | 投降统计流水 | 11 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 242 | MicOpenFlow | 开麦交流流水 | 19 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 243 | ReceiverFlow | 玩家操作听筒流水 | 14 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 244 | PlayerReputationScoreFlow | 玩家信誉分流水 | 12 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 245 | WeaponFragmentAwardFlow | 武器碎片收集奖励 | 13 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 246 | AwardSeasonBattleProfitUpdateFlow | 奖励首胜次数变更流水日志 | 18 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 247 | PlayerHideAndSeekRoundGameDetail | 躲猫猫回合玩家流水表 | 29 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 248 | HideAndSeekGameRoundTotal | 躲猫猫回合房间流水表 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 249 | InjectLuckyMoney | 发放红包 | 15 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 250 | GrabLuckyMoney | 抢红包 | 17 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 251 | MallZeroYuanBuy | 商城0元购监控 | 27 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 252 | DsGameLogPlayerCurAwardScore | 已作废 | 19 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 253 | DsGameLogPlayerCurAwardScore2 | DS玩家当前奖励阶段分数上报 | 18 | nzm_tlog_desc_tdw_20260127_v1.xml |
| 254 | dwd_sr_codez_player_activetag_di | 玩家活跃标签宽表（日增量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev | 4 | sr_tables_desc.xml |
| 255 | dwd_sr_codez_player_losstag_di | 玩家流失标签宽表（日增量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev | 5 | sr_tables_desc.xml |
| 256 | dim_sr_codez_player_losstag_df | 玩家流失标签维度表（日全量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev | 4 | sr_tables_desc.xml |
| 257 | ads_sr_codez_actv_di | 活跃汇总表（日增量），分区字段 dteventtime，命名空间 codez_dev_sr.codez_dev | 4 | sr_tables_desc.xml |
| 258 | ads_sr_codez_pay_di | 付费汇总表（日增量），分区字段 dteventtime，命名空间 codez_dev_sr.codez_dev | 4 | sr_tables_desc.xml |
| 259 | codez_ret_excelconfiginfo_conf | 通用配置表，命名空间 codez_dev_sr.codez_dev 或 codez_dev，通过 configname 区分不同配置类型 | 9 | sr_tables_desc.xml |
| 260 | dwd_sr_codez_social_wide_di | 社交宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev | 1 | sr_tables_desc.xml |
| 261 | dwd_sr_codez_item_di | 道具宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev | 1 | sr_tables_desc.xml |
| 262 | dwd_sr_codez_matchteamtype_di | 组队类型宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev | 1 | sr_tables_desc.xml |

---

## 详细表结构

### 1. PlayerRegister

- **描述**: (必填)玩家创建角色
- **字段数**: 32
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (可填)客户端版本 |
| SystemSoftware | string | (可填)移动终端操作系统版本 - 不上报(Login有报) |
| SystemHardware | string | (可填)移动终端机型 - 不上报(Login有报) |
| TelecomOper | string | (必填)运营商 - 不上报(Login有报) |
| Network | string | (可填)3G/WIFI/2G - 不上报(Login有报) |
| ScreenWidth | int | (可填)显示屏宽度 - 不上报 |
| ScreenHight | int | (可填)显示屏高度 - 不上报 |
| Density | float | (可填)像素密度 - 不上报(Login有报) |
| RegChannel | int | (必填)注册渠道(ios为1001,安卓和PC为飞鹰渠道号) |
| CpuHardware | string | (可填)cpu类型/频率/核数 - 不上报(Login有报) |
| Memory | int | (可填)内存信息单位M - 不上报(Login有报) |
| GLRender | string | (可填)opengl render信息 - 没用到，报空 |
| GLVersion | string | (可填)opengl版本信息 - 没用到，报空 |
| DeviceId | string | (必选)设备ID,安卓上报IMEI,IOS上报IDFA(报原始信息,不要加密) - 不上报(Login有报) |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| vClientIPV6 | string | (必填)客户端IPV6地址(若客户端使用IPV6通信则记录) - 暂不上报 |
| ANDROID_OAID | string | (必填)匿名设备标识符,安卓上报(正确值为16/36/64位)(报原始信息,不要加密) - 不上报 |
| IOS_CAID | string | (必填)匿名设备标识符,IOS上报(正确值为32位)(报原始信息,不要加密) - 不上报 |
| Env | string | 服务器环境 |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| country | string | (必填)国家名称，使用中文 |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| RegistChannel | string | 同RegChannel。命名是复用的其它项目，方便数据同学复用 |
| IsPreRegister | int | 是否预注册过，1 有预注册 0 无预注册 |

---

### 2. PlayerPreRegister

- **描述**: (必填)玩家预创建角色
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。由于预注册时不区分账号类型，所以这里统一填0 |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| vGameNick | string | (必填)玩家预注册角色名 |
| PreRegistChannel | string | 预注册渠道号 |
| Result | int | 预注册结果，成功为0，-1 昵称非法，-2 昵称被抢注，-3已预注册过，-4其它 |

---

### 3. PlayerLogin

- **描述**: (必填)玩家登陆
- **字段数**: 56
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| iVipLevel | int | (可填)VIP等级 - 没用到，报0 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| PlayerFriendsNum | int | (必填)玩家好友数量 |
| ClientVersion | string | (必填)客户端版本 |
| SystemSoftware | string | (可填)移动终端操作系统版本 |
| SystemHardware | string | (必填)移动终端机型 |
| TelecomOper | string | (必填)运营商 - 报的PLMN，含义可查mcc-mnc.net |
| Network | string | (必填)3G/WIFI/2G |
| ScreenWidth | int | (可填)显示屏宽度 - 暂未上报 |
| ScreenHight | int | (可填)显示屏高度 - 暂未上报 |
| Density | float | (可填)像素密度 |
| LoginChannel | int | (必填)登录渠道(ios为1001,安卓和PC为飞鹰渠道号) |
| vHeaderID | string | (必填)玩家角色头像ID - 暂未用到，报空 |
| CpuHardware | string | (可填)CPU型号 |
| Memory | int | (可填)内存信息单位M |
| GLRender | string | (可填)opengl render信息 |
| GLVersion | string | (可填)opengl版本信息 |
| DeviceId | string | (必选)设备ID,安卓上报IMEI,IOS上报IDFA(报原始信息,不要加密) - iPhone用户未授权时取到的是全零值 |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| vClientIPV6 | string | (必填)客户端IPV6地址(若客户端使用IPV6通信则记录) - 暂未用到，报空 |
| ANDROID_OAID | string | (必填)匿名设备标识符,安卓上报(正确值为16/36/64位)(报原始信息,不要加密) |
| IOS_CAID | string | (必填)匿名设备标识符,IOS上报(正确值为32位)(报原始信息,不要加密) |
| PlatformUserTag | string | (可填)用户授权状态列表，json格式，key是授权信息编号(全部授权 1/个人信息授权 2/好友链 3)，value是授权状态(未授权 0/已授权 1) - 暂未上报 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID - 已废弃，报空 |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| country | string | (必填)国家名称，使用中文 |
| LoginResult | int | 登录成功填0，否则填错误码。只考虑lobby能感知到的情况 |
| IsReconnect | int | 是否重连 |
| LoginTimeMs | int | 登录时长。从lobby收到LoginReq到发出LoginRes的耗时，毫秒 |
| GpuHardware | string | (可填)GPU型号 |
| ServerIp | string | 登录连的服务器IP |
| LobbyUrl | string | 登录使用的URL |
| vHeadUrl | string | (安全补充)玩家角色头像URL |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| iGuildID | string | (安全补充)玩家公会ID，没有公会则上报0 |
| vGuildName | string | (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如/或者\t，\n,\r  以及空格），则记录时去掉，比如 张/三 记为 张三 |
| RegisterTime | datetime | (安全补充)注册时间 |
| TotalGameTime | uint64 | (安全补充)游戏总时长，秒 |
| RoleTotalCash | int | (安全补充)玩家角色累计充值 - 后续有了再报 |
| CouponNum | uint64 | (安全补充)当前点券（充值货币）存量 - 后续有了再报 |
| is_gamematrix | int | (可填)本次是否云游戏登录，1-是，0-否 |
| LoginChannelStr | string | 同LoginChannel。命名是复用的其它项目，方便数据同学复用 |
| OLD_CAID | string | 此字段为 iOS 设备的上个版本的 CAID， |
| UserAgent | string | 此字段为用户浏览器代理信息，安卓可选上报，iOS 必须上报原值，鸿蒙可选上报 |
| AceInitErrCode | uint32 | 客户端ACE SDK初始化执行后的error_code，安全那边要求该字段上报TLog |
| cloud_gaming_type | string | 云游戏类型。PC:适配PC类型, H5:适配H5类型, APP:适配APP类型, WXMinProgram:微信小游戏 |

---

### 4. PlayerLogout

- **描述**: (必填)玩家登出
- **字段数**: 51
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| iVipLevel | int | (可填)VIP等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| OnlineTime | int | (必填)本次登录在线时间(秒) |
| PlayerFriendsNum | int | (必填)玩家好友数量 |
| ClientVersion | string | (必填)客户端版本 |
| SystemSoftware | string | (可填)移动终端操作系统版本 - Login已报，这里报空 |
| SystemHardware | string | (必填)移动终端机型 - Login已报，这里报空 |
| TelecomOper | string | (必填)运营商 - Login已报，这里报空 |
| Network | string | (必填)3G/WIFI/2G - Login已报，这里报空 |
| ScreenWidth | int | (可填)显示屏宽度 - Login已报，这里报空 |
| ScreenHight | int | (可填)显示高度 - Login已报，这里报空 |
| Density | float | (可填)像素密度 - Login已报，这里报空 |
| LoginChannel | int | (可填)登录渠道(ios为1001,安卓根据渠道包id) - Login已报，这里报空 |
| vHeaderID | string | (必填)玩家角色头像ID - Login已报，这里报空 |
| CpuHardware | string | (可填)cpu类型;频率;核数 - Login已报，这里报空 |
| Memory | int | (可填)内存信息单位M - Login已报，这里报空 |
| GLRender | string | (可填)opengl render信息 - Login已报，这里报空 |
| GLVersion | string | (可填)opengl版本信息 - Login已报，这里报空 |
| DeviceId | string | (必选)设备ID,安卓上报IMEI,IOS上报IDFA(报原始信息,不要加密) - Login已报，这里报空 |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| vClientIPV6 | string | (必填)客户端IPV6地址(若客户端使用IPV6通信则记录) - Login已报，这里报空 |
| ANDROID_OAID | string | (必填)匿名设备标识符,安卓上报(正确值为16/36/64位)(报原始信息,不要加密) - Login已报，这里报空 |
| IOS_CAID | string | (必填)匿名设备标识符,IOS上报(正确值为32位)(报原始信息,不要加密) - Login已报，这里报空 |
| PlatformUserTag | string | (可填)用户授权状态列表，json格式，key是授权信息编号(全部授权 1/个人信息授权 2/好友链 3)，value是授权状态(未授权 0/已授权 1) - Login已报，这里报空 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID - 已废弃，报空 |
| LogoutReason | int | 玩家登录原因 bind with EPlayerLogoutReason |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| country | string | (必填)国家名称，使用中文 |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| vHeadUrl | string | (安全补充)玩家角色头像URL |
| iGuildID | string | (安全补充)玩家公会ID，没有公会则上报0 |
| vGuildName | string | (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如/或者\t，\n,\r  以及空格），则记录时去掉，比如 张/三 记为 张三 |
| RegisterTime | datetime | (安全补充)注册时间 |
| TotalGameTime | uint64 | (安全补充)游戏总时长，秒 |
| EXPAddTotal | uint64 | (安全补充)本次在线获得总经验 |
| EXPReduceTotal | uint64 | (安全补充)本次在线消耗总经验 - 暂无玩法能消耗经验的，报0 |
| CouponAddTotal | uint64 | (安全补充)本次在线获得总点券（指充值货币）数 - 后续有了再报 |
| CouponReduceTotal | uint64 | (安全补充)本次在线消耗总点券（指充值货币）数 - 后续有了再报 |
| AllFriendNum | int | 总好友数量 |
| GameFriendNum | int | 游戏好友数量 |
| PlatformFriendNum | int | 平台好友数量 |

---

### 5. onlinecnt

- **描述**: (必填)实时在线日志，每分钟一条
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| gameappid | string | (必填)游戏APPID |
| timekey | int | (必填)当前时间的时间戳，即当前的unixtime |
| country | string | (必填)国家名称，使用中文。国服填空 |
| zoneareaid | int | (必填)分区id |
| onlinecntios | int | (必填)ios在线人数 |
| onlinecntandroid | int | (必填)android在线人数 |
| onlinecntpc | int | (可填)pc在线人数,没有PC端时上报0值 |
| Env | string | 服务器环境 |
| Total | int | 总在线 |
| WX | int | 微信在线人数 |
| QQ | int | QQ在线人数 |
| AQQ | int | Android QQ 总在线 |
| AWX | int | Android 微信总在线 |
| IQQ | int | iOS QQ 总在线 |
| IWX | int | iOS 微信总在线 |
| IGUEST | int | iOS guest 总在线 |
| Simulator | int | 模拟器总在线 |
| CloudGame | int | 云游戏总在线 |

---

### 6. ClientLoading

- **描述**: 客户端Loading时长，只在成功进入局内时上报
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| LoadingTimeNotice | uint64 | 启动到公告，毫秒 |
| LoadingTimeLogin | uint64 | 公告到平台登录，毫秒 |
| LoadingTimeStartGame | uint64 | 平台登录到开始游戏，毫秒 |
| LoadingTimeInGame | uint64 | 开始游戏到局内，毫秒 |

---

### 7. ClientLoadingScreen

- **描述**: 用于监控客户端进不同地图的屏幕等待时长
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| iMapId | int | 加载的地图ID |
| LoadingKey | string | 策划指定的，对于特殊地图和任务逻辑使用特殊的loading配置 |
| LoadingTime | uint64 | 总加载时间，毫秒 |
| iPreMapId | int | 之前的地图ID，如果没有，则填0 |
| bTimeout | int | 是否超时，0表示未超时，1表示超时 |

---

### 8. ClientReconnect

- **描述**: 用于监控客户端断线重连表现统计
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| Reason | int | 重连原因，1是TCP，2是DS，3是TCP和DS |
| bSuccess | int | 是否重连成功，0表示失败，1表示成功 |
| bInGame | int | 是否局内触发重连，0表示局外，1表示局内 |
| Duration | uint64 | 重连耗时，单位为秒 |
| ExceptTimeMs | uint64 | 网络错误时间Ms |
| vEventOpenID | string | (必填)网络异常用户OPENID号 |
| vEventRoleID | string | (必填)网络异常玩家的PlayerID |

---

### 9. PlayerExpFlow

- **描述**: (必填)玩家经验流水
- **字段数**: 23
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| iVipLevel | int | (可填)VIP等级 - 没用到，报0 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| ExpChange | int | (必填)经验变化 |
| BeforeLevel | int | (可填)动作前等级 |
| AfterLevel | int | (必填)动作后等级 |
| iTime | int | (必填)从玩家注册到本次经验变更，玩家在线总时长，秒 |
| Reason | int | (必填)经验流动一级原因 |
| SubReason | int | (必填)经验流动二级原因 - 没用到，报0 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID - 已废弃，报空 |
| AreaID | int | 大区ID：1-9为正式服 |
| BeforeExp | int | 玩家原经验数值 |
| ExpChangeOri | int | 原始经验变化（未加成) - 暂无，报0 |
| ExpRateType | int | 经验加成类型 - 暂无，报0 |

---

### 10. MoneyFlow

- **描述**: (必填)货币流水
- **字段数**: 21
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| iVipLevel | int | (可填)VIP等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| Sequence | biguint | (可填)用于关联一次动作产生多条不同类型的货币流动日志 |
| AfterMoney | int | (可填)动作后的金钱数 |
| iMoney | int | (必填)动作涉及的金钱数 |
| Reason | int | (必填)货币流动一级原因。代码搜enum PropsChangeReason，或找程序同学获取 |
| SubReason | int | (可填)货币流动二级原因。没用到，填0 |
| AddOrReduce | int | (必填)增加 0/减少 1 |
| iMoneyType | uint64 | (必填)货币道具ID，可在P4中NZMobile\Documents\plan\道具基础信息(新).xlsx查询。NZ点-45222010001，NZ券-45255010001 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |

---

### 11. ShopFlow

- **描述**: (必填)商店流水
- **字段数**: 29
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |
| ShopId | uint32 | 购买商品的商店id（基础商店1=系统2=活动3=奇遇，根据BaseShopConfig配置定义） |
| ShopTable | uint32 | 购买商店页签（购买商品的商店类型为0时需要，0=推荐，1=礼包，2=枪械，3=道具，4=外观，5=载具） |
| ShopSubTable | uint32 | 购买商店子页签（购买商品的商店类型为0时需要，类型待定） |
| GroupId | uint32 | 商品组id |
| ItemId | uint32 | 商品id |
| PropId | uint64 | 道具id |
| PropLevel | int | 道具等级 |
| Hot | int | 是否为推荐商品(0,1) |
| BuyCount | int | 购买商品数量 |
| ItemCount | int | 购买后商品数量 |
| Money1Id | uint64 | 消耗货币1类型 |
| Money1Count | int | 消耗货币1数量 |
| Money1Remain | int | 消耗货币1剩余数量 |
| Money2Id | uint64 | 消耗货币2类型 |
| Money2Count | int | 消耗货币2数量 |
| Money2Remain | int | 消耗货币2剩余数量 |
| Result | int | 错误码 |

---

### 12. MallClick2

- **描述**: 商城点击流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| TabId | uint32 | 商城一级页签 |
| SubTabId | uint32 | 商城二级页签 |
| ActivityPageId | uint32 | 各活动页面（包括抽奖活动、礼包活动）的浏览 |

---

### 13. MallBuy

- **描述**: 商城购买流水
- **字段数**: 39
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ZoneId | int | 支付环境ID |
| SeasonLevel | int | 赛季等级 |
| SeasonID | int | 赛季ID |
| AreaID | int | 大区ID：1-9为正式服 |
| CategoryType | int | 商城类型 EMallCategoryType |
| ShopId | uint32 | 商城ID |
| GoodsId | uint32 | 商品ID |
| BuyCount | int | 购买商品数量 |
| ItemCount | int | 购买后商品数量 |
| Money1Id | uint64 | 消耗货币1类型 |
| Money1Count | int | 消耗货币1数量 |
| Money1Remain | int | 消耗货币1剩余数量 |
| Money2Id | uint64 | 消耗货币2类型 |
| Money2Count | int | 消耗货币2数量 |
| Money2Remain | int | 消耗货币2剩余数量 |
| Result | int | 错误码 |
| DiscountTicketList | string | 使用优惠券ID，多个以 ; 分割 |
| CostPropList | string | 支出列表以 ; 分割 propId:propNum;propId:propNum |
| RecivePropList | string | 产出列表以 ; 分割 propId:propNum;propId:propNum |
| GiftPropList | string | 产出列表以 ; 分割 propId:propNum;propId:propNum |
| SellingPrice | int32 | 原始售价 |
| DiscountPrice | int32 | 配置折扣后售价 |
| UseTicketPrice | int32 | 使用优惠券后售价 |
| FinalPrice | int32 | 实际最终售价 |
| OrderState | int32 | 1.下单 3.发货 （通常逆战点/RMB 会有下单及收货状态，普通订单直接发货） |
| OrderId | string | 本次交易的订单ID（RMB/逆战点交易） |
| AttrBuyType | int32 | 额外购买属性，新手限时折扣，新手限时定价 |
| AttrBuyParams | string | 额外购买属性，内容 |
| AttrBuyEffective | string | 额外购买属性，生效属性 |

---

### 14. MallLottery

- **描述**: 商城抽奖流水
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| SeasonID | int | 赛季ID |
| AreaID | int | 大区ID：1-9为正式服 |
| LotteryId | uint32 | 奖池ID |
| AwardIndex | int32 | 奖励索引 |
| CurrDraw | uint32 | 当前第几抽 |
| TotalDraw | uint32 | 总的抽奖次数 |
| CostList | string | 消耗列表以 ; 分割 propId:propNum;propId:propNum |
| PropList | string | 产出列表以 ; 分割 propId:propNum;propId:propNum |
| IsCriticalHit | int | 0、未产生 1、产生（是否产生暴击） |
| Result | int | 错误码 |
| CostPropId | uint64 | 抽奖券ID |
| CostPropNum | uint64 | 抽奖券数量 |
| RewardId | uint64 | 奖励的ID |
| RewardNum | uint64 | 奖励的数量 |
| CostItemId | int32 | 奖励的商品ID |

---

### 15. GGBondMallLotteryClientFlow

- **描述**: 客户端猪猪侠抽奖流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| Action | string | 盲盒交互/界面曝光/玩家每次进入抽奖界面时记录等 |
| Incr | uint32 | 交互记录 |
| ExtraData | string | 附加补充参数 |

---

### 16. LotteryClientFlow

- **描述**: 客户端放回抽奖通用流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| LotteryId | uint32 | 奖池ID |
| ActionType | string | 操作类型 |
| ActionValue | string | 操作细节 |

---

### 17. MallLotteryClientFlow

- **描述**: 客户端不放回抽奖通用流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| LotteryId | uint32 | 奖池ID |
| ActionType | string | 操作类型 |
| ActionValue | string | 操作细节 |

---

### 18. ItemFlow

- **描述**: (必填)道具流水
- **字段数**: 34
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| iVipLevel | int | (可填)VIP等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| Sequence | biguint | (可填)用于关联一次购买产生多条不同类型的货币日志 |
| iGoodsType | int | (必填)道具类型 |
| iGoodsId | bigint | (必填)道具ID |
| iCount | int | (必填)数量 |
| AfterCount | int | (必填)动作后的物品存量 |
| Reason | int | (必填)道具流动一级原因。代码搜enum PropsChangeReason，或找程序同学获取 |
| SubReason | int | (必填)道具流动二级原因。填0 |
| iMoney | int | (必填)花费代币或金币购买道具情况下输出消耗的钱数量，否则填0 |
| iMoneyType | int | (必填)货币道具ID，可在P4中NZMobile\Documents\plan\道具基础信息(新).xlsx查询 。暂时填0 |
| AddOrReduce | int | (必填)增加 0/减少 1 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |
| iPropID | string | 道具ID，NZM该字段为PropID |
| iPropGID | string | 道具GID，NZM该字段为PropGID |
| iGoodsSubType | int | (必填)道具中类 |
| iSeasonBpID | int | (选填)道具为赛季BP经验时，需要用BpID来区分记录 |
| iGoodsSubSubType | int | (必填)道具子类 |
| iGoodsThirdType | int | (必填)道具预备子类 |
| iActivityID | int | (选填)活动id |
| RoomID | uint64 | (选填)由副本产出时，记录单局ID |
| DungeonArea | int | (选填)由副本产出时，记录猎场区域/塔防波次信息，猎场模式下：1:推进 2:区域 3:破障 4:BOSS |
| DropID | uint64 | (选填)由奖励系统产出时，对应的掉落ID |

---

### 19. DropMaxHoldItemFlow

- **描述**: (必填)超过持有上限丢弃道具流水表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| Sequence | biguint | (必填)用于关联一次丢弃产生多条不同道具 |
| iPropID | string | (必填)道具ID，NZM该字段为PropID |
| iAddCount | int | (必填)本应添加数量 |
| iDropCount | int | (必填)丢弃数量 |
| Reason | int | (必填)奖励原因 |

---

### 20. AwardFlow

- **描述**: (必填)奖励流水
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| Sequence | biguint | (必填)用于关联一次奖励产生多条不同道具 |
| AwardID | string | (必填)奖励ID |
| GroupInfo | string | (废弃)奖励组已获取次数 无奖励组时为空，MS18废弃，改为由极品控制tlog上报 |
| iGoodsId | string | (必填)道具ID |
| iCount | int | (必填)道具数量 |
| iGoodsLevel | int | (必填)道具等级 |
| Reason | int | (必填)奖励原因 |
| iFatigueValue | int | (必填)当前疲劳值 |
| fFatigueCorrelation | float | (必填)奖励倍数 |
| iIsExtraAward | int | (必填)是否额外奖励 |
| iAdaptiveDropNum | int | (必填)自适应掉落配置序号，如果不含自适应掉落则为0 |
| iAdaptiveDropCount | int | (必填)自适应掉落数量，如果不含自适应掉落则为0 |
| iGuaranteeWeightAdd | int | (必填)保底掉落加成权重值，0:未加成权重，-1:必出掉落，其他:加成的权重值 |
| iScriptDropCount | int | (废弃)剧本掉落次数，0:未配置剧本掉落，-1:剧本掉落次数已执行完，其他:剧本掉落执行次数 |
| iSeasonBpID | int | (选填)道具为赛季BP经验时，需要用BpID来区分记录 |
| IsAFK | int | (选填)副本掉落时，会判定玩家是否挂机(消极游戏)，0:否，1:是 |

---

### 21. PlayerSeasonLotteryFlow

- **描述**: 赛季补给抽奖流水
- **字段数**: 21
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| iSeasonID | int | 赛季id |
| iSeasonLevel | int | 赛季等级 |
| iLotteryTyep | int | 抽奖类型1：单抽；2：10连抽 |
| iCostBoxNum | int | 扣减的赛季补给箱数量 |
| LotteryPropId | biguint | 抽奖获得的道具id |
| LotteryPropNum | int | 抽奖获得的道具数量 |
| Sequence | biguint | 抽奖唯一流水序号 |
| iEnsureCount | int | 当前保底触发次数 |
| iIsEnsure | int | 本次抽奖是否命中了保底，1命中，0没命中 |
| Result | int | 发送邮件的错误码，发送成功为0 |
| RewardId | biguint | 奖励id |

---

### 22. PlayerShopLotteryFlow

- **描述**: 红角抽奖流水
- **字段数**: 27
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| iSeasonID | int | 赛季id |
| iSeasonLevel | int | 赛季等级 |
| iActivityLottery | biguint | 活动id |
| iLotteryTyep | int | 抽奖类型1：单抽；2：10连抽 |
| iCostTicketNum | int | 扣减的抽奖券数量 |
| LotteryPropId | biguint | 抽奖获得的道具id |
| LotteryPropNum | int | 抽奖获得的道具数量 |
| Sequence | biguint | 抽奖唯一流水序号 |
| TotalLotteryCnt | int | 本活动中累计抽奖次数 |
| GiftProps | string | 赠品列表，格式为itemid1,num1;itemid2,num2; |
| Result | int | 抽奖的错误码，成功为0 |
| RewardId | biguint | 奖励id |
| SaveHistorySucc | int | 保存历史记录是否成功，成功为1 |
| ErrMsg | string | 错误提示信息 |
| HitFlag | int | 暴击产出道具为1，其他为0 |
| CostPropId | biguint | 抽奖代币的道具id |
| CostItemId | biguint | 抽奖代币的商品id |

---

### 23. ClaimTrackRewardFlow

- **描述**: 红角抽奖进度奖励领取流水
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| iActivityLottery | biguint | 活动id |
| TrackId | biguint | 轨道进度id |
| RewardPropId | biguint | 进度奖励获得的道具id |
| iRewardPropNum | int | 进度奖励获得的道具数量 |
| Sequence | biguint | 领取奖励唯一流水序号 |
| Result | int | 领取奖励的错误码，成功为0 |
| ErrMsg | string | 错误提示信息 |

---

### 24. ReceiveMail

- **描述**: 邮件领取
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeqId | uint64 | 邮件唯一ID |
| MailId | uint32 | 邮件模板ID |
| Title | string | 邮件标题 |
| Attachment | string | 附件内容，格式 道具ID1:数量1;道具ID2:数量2;... |
| State | uint32 | 邮件状态，1.未读 2.已读未领取 3.领取 4.一键领取 |

---

### 25. ResponseAddFriendFlow

- **描述**: 操作好友申请流水
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iFriendApplyResult | int | 通过好友申请时，记录结果：0，同意；1，拒绝；2，拉黑 |
| iFriendListNum | int | 记录该玩家操作后好友列表所拥有的好友数 |
| iApplySource | int | 记录通过好友申请时，申请来源 |
| vApplyOpenId | string | 记录发送此条好友申请的玩家Openid |

---

### 26. ManageFriendFlow

- **描述**: 操作好友流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| vTargetOpenId | string | 被删除玩家的OpenId |
| iIntimacy | int | 好友的请密度 |
| iType | int | 删除好友:1；拉黑好友:2 |

---

### 27. WXMiniGameLogin

- **描述**: 微信小游戏玩家登录
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。由于预注册时不区分账号类型，所以这里统一填0 |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| LoginChannel | int | (必填)登录渠道(ios为1001,安卓根据渠道包id,PC固定为10430644) - 取自MSDKLoginRet.ChannelId |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| ANDROID_OAID | string | (必填)匿名设备标识符,安卓上报(正确值为16/36/64位)(报原始信息,不要加密) |
| IOS_CAID | string | (必填)匿名设备标识符,IOS上报(正确值为32位)(报原始信息,不要加密) |
| wx_openid | string | (必填)用户在该微信小游戏下的openid（调用wx.login/qq.login所得到的openid，微信用户在微信小游戏 appid 下的唯一用户标识（appid 不同，则获取到的 openid 就不同），可用于永久标记一个用户） |
| unionid | string | (选填)用户在同个微信开发者账号下的unionid（微信用户在同一个微信开发者账号下的唯一用户标识（开发者账号不同，则获取到的 unionid 就不同），可用于永久标记一个用户） |
| minigame_channel | string | (必填)小游戏投放渠道，用于区分不同广告渠道来源：巨量引擎、AMS、快手、bilibili、小红书、微博、其他(非广告渠道)，枚举值分别是：bytedance、ams、kuaishou、bilibili、xhs、weibo、other |
| clue_token | string | (选填)投巨量时必填，小游戏冷启动参数 clue_token（巨量引擎广告带来），默认为空字符串 |
| req_id | string | (选填)投巨量时必填，小游戏冷启动参数 req_id（巨量引擎广告带来），默认为空字符串 |
| click_id | string | (选填)投AMS 或 小红书时必填，小游戏冷启动参数 click_id（AMS 或 小红书 广告带来），默认为空字符串。请通过 minigame_channel 字段的值来区分是 ams 或 小红书 媒体下的 click_id |
| callback | string | (选填)投快手时必填，小游戏冷启动参数 callback（快手广告带来），默认为空字符串 |
| trackid | string | (选填)投B站或微博时必填，小游戏冷启动参数 trackid（bilibili广告或微博广告带来），默认为空字符串。请通过 minigame_channel 字段的值来区分是 B站 或 微博 媒体下的 trackid |
| minigame_platid | int | (选填)微信小游戏运行在哪个平台的平台id，该值由本 SDK 的 getReportData() 方法获取和返回，小游戏项目组可按需调用。取值：未知 -1 / iOS 0 / 安卓 1 / windows 2 / mac 3 / 开发者工具 4。请注意，minigame_platid 不要跟 platid 字段搞混，不是一个东西，不要将 minigame_platid 直接赋值给 tlog 的 platid 字段，会影响经分统计分析。 |

---

### 28. ClientLoginDS

- **描述**: 玩家登录DS（客户端上报）
- **字段数**: 31
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| RoomId | biguint | DsRoomID |
| Env | string | 服务器环境 |
| ClientVersion | string | (必填)客户端版本 |
| SystemSoftware | string | (可填)移动终端操作系统版本 |
| SystemHardware | string | (必填)移动终端机型 |
| TelecomOper | string | (必填)运营商 - 报的PLMN，含义可查mcc-mnc.net |
| Network | string | (必填)3G/WIFI/2G |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| vClientIPV6 | string | (必填)客户端IPV6地址(若客户端使用IPV6通信则记录) - 暂未用到，报空 |
| DsIP | string | 客户端连接DS使用的IP |
| DsPort | uint32 | 客户端连接DS使用的端口 |
| MapID | int | 地图ID |
| LoginResult | int | 登录成功填0，否则填错误码(参考ENetworkFailure) |
| IsReconnect | int | 是否重连 |
| ReconnectReason | int | 重连理由：1-杀进程，2-断线，3-切DS，0-其他 |
| IsSwitchDs | int | 是否DS切换导致登入, 0-否，1-是 |
| LoginTimeMs | int | 从收到重连通知到连接成功或失败的时长，毫秒。 |
| LoadingTimeMs | int | 地图加载时长，毫秒。登录成功时有效 |
| DsIpRecommendRank | int | 推荐IP排名，从1开始 |
| IsFinalFailure | int | 本次失败是否最终失败 |
| TryCnt | int | 这是第几次尝试连接 |
| PrevNetwork | string | (必填)3G/WIFI/2G, 重连之前使用的网络 |
| DsHost | string | 客户端连接DS使用的Host（连域名时填域名，否则填IP） |
| ErrStr | string | 连接失败错误信息 |

---

### 29. PlayerLogInOutDS

- **描述**: 玩家登录登出DS（服务器MatchOpener上报）
- **字段数**: 18
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| RoomId | string | DsRoomID |
| Env | string | 服务器环境 |
| LogInOut | int | LogInDs = 1, LogOutDs = 2 |
| MapID | int | 地图ID |
| GameMode | int | 游戏模式 详见MatchGameTypeEnums |
| ModeType | int | 模式ID  详见MatchModeTypeEnums |
| SubModeType | int | 子模式ID |
| DungeonID | int | 副本ID，如有 |
| RegionID | int | 大世界的RegionID，如有 |
| PlaneID | int | 位面ID，如有 |
| IsWin | int | 是否通关 |

---

### 30. GameDetail

- **描述**: 副本类单局流水表
- **字段数**: 52
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| dtGameStartTime | datetime | 游戏开始时间 |
| iFinTime | int | 整个游戏时间(秒) |
| iDuration | int | 玩家参与游戏时间(秒) |
| DsRoomId | biguint | 房间id |
| iEndGameReason | int | 0=正常结算,1=团灭失败,2=离线过长被服务器踢出 |
| iIsWin | int | 0=平局 1=胜利 2=失败 |
| iGameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| iModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| iSubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| iMapId | int | 地图ID |
| iProcedureId | int | 副本流程ID |
| iGroupId | int | 局内阵营ID，仅类PVP模式上报 |
| TeamId | biguint | 真实队伍ID，虚拟队伍不上报 |
| iKills | int | 玩家击杀数 |
| iDeaths | int | 玩家被杀数 |
| Damage | biguint | 玩家造成的伤害 |
| iAssists | int | 玩家助攻次数 |
| SelfCampScore | biguint | 己方阵营分数 |
| EnemyCampScore | biguint | 敌方阵营分数 |
| iDungeonID | int | 副本ID |
| iPlayerNum | int | 结算时局内人数 |
| iScore | int | 游戏评分 |
| iSchemeGameScore | int | 预设系统评分 |
| RespawnCount | int | 玩家复活次数 |
| FightingDuration | int | 玩家处于战斗状态的时长 |
| PlayerSkillStaticsStr | string | 玩家技能释放的统计信息，拼接字符串，拼接逻辑为[SkillID_1:SkillSlotType_1:UsedCount_1,SkillID_2:SkillSlotType_2:UsedCount_2] |
| RankLevelBf | int | 变化前的段位等级 |
| RankLevelScoreDelta | int | 排位分差值 |
| Rank | int | 玩家个人排名 |
| IsWarm | int | 是否是温暖局。非0表示为温暖局 |
| HideScoreDelta | int | 玩家隐藏分差值 |
| SeasonLevel | int | 玩家的赛季等级 |
| RealPlayerNumWhenStart | uint | 开赛时的真人玩家人数 |
| iMatchType | int | 赛事类型 |
| SeasonId | int | 赛季ID,PVP排位赛赛季id |
| iBotType | int | Bot类型,1是行为树，2是强化 |
| BigSeasonId | int | 大赛季Id |
| IsMatchRankLockTime | int | 是否在副本锁榜后开赛 |
| AffixTotalLevel | int | 单局的词条总等级 |
| AffixInfo | string | 词条的详细数据 Affix_ID1:Level_1,Affix_ID2:Level_2 |
| RogueAgentStatus | int | 0=没触发, 1=触发但没完成, 2=触发且完成 |
| CurseTreasureStatus | int | 诅咒宝箱状态，同上 |

---

### 31. BotGameDetail

- **描述**: 副本类单局流水表
- **字段数**: 41
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| iLevel | int | 玩家等级 |
| dtGameStartTime | datetime | 游戏开始时间 |
| iFinTime | int | 整个游戏时间(秒) |
| iDuration | int | 玩家参与游戏时间(秒) |
| DsRoomId | biguint | 房间id |
| iEndGameReason | int | 0=正常结算,1=团灭失败,2=离线过长被服务器踢出 |
| iIsWin | int | 0=平局 1=胜利 2=失败 |
| iGameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| iModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| iSubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| iMapId | int | 地图ID |
| iProcedureId | int | 副本流程ID |
| iGroupId | int | 局内阵营ID，仅类PVP模式上报 |
| TeamId | biguint | 真实队伍ID，虚拟队伍不上报 |
| iKills | int | 玩家击杀数 |
| iDeaths | int | 玩家被杀数 |
| Damage | biguint | 玩家造成的伤害 |
| iAssists | int | 玩家助攻次数 |
| SelfCampScore | biguint | 己方阵营分数 |
| EnemyCampScore | biguint | 敌方阵营分数 |
| iDungeonID | int | 副本ID |
| iPlayerNum | int | 结算时局内人数 |
| iScore | int | 游戏评分 |
| iSchemeGameScore | int | 预设系统评分 |
| RespawnCount | int | 玩家复活次数 |
| FightingDuration | int | 玩家处于战斗状态的时长 |
| PlayerSkillStaticsStr | string | 玩家技能释放的统计信息，拼接字符串，拼接逻辑为[SkillID_1:SkillSlotType_1:UsedCount_1,SkillID_2:SkillSlotType_2:UsedCount_2] |
| Rank | int | 玩家个人排名 |
| IsWarm | int | 是否是温暖局。非0表示为温暖局 |
| RealPlayerNumWhenStart | uint | 开赛时的真人玩家人数 |
| iMatchType | int | 赛事类型 |
| SeasonId | int | 赛季ID,PVP排位赛赛季id |
| iBotType | int | Bot类型,1是行为树，2是强化 |
| BigSeasonId | int | 大赛季Id |
| iBotId | int | iBotId,bot投放方案id，对应bot所有配置 |
| iBotHosting | int | 是否是托管bot |

---

### 32. BotGameStatisReport

- **描述**: 副本类单局流水表
- **字段数**: 58
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| iLevel | int | 玩家等级 |
| dtGameStartTime | datetime | 游戏开始时间 |
| iFinTime | int | 整个游戏时间(秒) |
| iDuration | int | 玩家参与游戏时间(秒) |
| DsRoomId | biguint | 房间id |
| iEndGameReason | int | 0=正常结算,1=团灭失败,2=离线过长被服务器踢出 |
| iIsWin | int | 0=平局 1=胜利 2=失败 |
| iGameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| iModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| iSubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| iMapId | int | 地图ID |
| iTimesofJump | int | 跳跃次数 |
| iTimesOfJumpFail | int | 跳跃失败次数 |
| iTimesOfSwitchWeapon | int | 切武器次数 |
| iTimesOfSwitchWeaponFails | int | 切武器失败次数 |
| iTimesOfTeleport | int | 传送次数 |
| iTimesOfTeleportless50m | int | 传送小于50m |
| iTimesOfTeleportOver50mless70m | int | 传送大于50m小于70 |
| iTimesOfTeleportOver70less100m | int | 传送大于70m小于100 |
| iTimesOfTeleportOver100mless150m | int | 传送大于100m小于150 |
| iTimesOfTeleportover150m | int | 传送大于150 |
| iTimesofHangs | int | 卡住次数 |
| iTimesofAbnormalFalls | int | 异常Fall次数 |
| iTimesofAbnormalTeleports | int | 异常传送次数 |
| iTimesOfTargetSeekerFails | int | 锁敌失败次数 |
| iTimesOfMoveFails | int | 移动失败总次数 |
| iTimesOfBTStop | int | 行为树不动次数 |
| iTimesofBlocked | int | block被打断 |
| iTimesofAOffPath | int | Agent在导航外面 |
| iTimesofAborted | int | 异常退出 |
| iTimesOfForcedScript | uint | 被蓝图脚本打断了 |
| iTimesOfInvalidPath | int | 路径异常 |
| iTimesOfMoveStops | int | 移动停止次数 |
| iTimesOfNewRequest | int | 新请求阻断了 |
| iTimesOfRequestMoves | int | 移动发起请求次数 |
| iTimesOfMoveless1m | int | 移动小于1m次数 |
| iTimesOfMoveOver1mless3m | int | 移动大于1m小于3m次数 |
| iTimesOfMoveOver3mless5m | int | 移动大于3m小于5m次数 |
| iTimesOfMoveOver5mless10m | int | 移动大于5m小于10m次数 |
| iTimesOfMoveOver10m | int | 移动大于10m次数 |
| iTimesofReload | int | 移动大于10m次数 |
| iTimesofAbortNode | int | 移动大于10m次数 |
| iTimesofTargetLoss | int | 移动大于10m次数 |
| iTimesOfIncorrectAngle | int | 移动大于10m次数 |
| iTimesOfSelfStop | int | 移动大于10m次数 |
| iTimesOfFire | int | 移动大于10m次数 |
| iTimesOfFireLess1s | int | 移动大于10m次数 |
| iTimesOfFireOver1sLess3s | int | 移动大于10m次数 |
| iTimesOfFireOver3sLess5s | int | 移动大于10m次数 |
| iTimesOfFireOver5s | int | 移动大于10m次数 |
| iBotType | int | Bot类型,1是行为树，2是强化 |
| iBotId | int | iBotId,bot投放方案id，对应bot所有配置 |
| bIsHosting | int | 是否为托管模式,1是托管，0是非托管 |

---

### 33. DropOutDetail

- **描述**: 副本类单局中途退出信息表
- **字段数**: 37
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| dtGameStartTime | datetime | 游戏开始时间 |
| iDuration | int | 玩家参与游戏时间(秒) |
| DsRoomId | biguint | 房间id |
| iDropOutReason | int | 玩家中途退出原因，详见EDropMatchReason |
| iGameMode | int | 游戏模式。详见GameDetail表里的该字段描述 |
| iModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| iSubModeType | int | 子模式ID。详见GameDetail表里的该字段描述 |
| iMapId | int | 地图ID |
| iProcedureId | int | 副本流程ID |
| iGroupId | int | 局内阵营ID，仅类PVP模式上报 |
| TeamId | biguint | 真实队伍ID，虚拟队伍不上报 |
| iKills | int | 玩家击杀数 |
| iDeaths | int | 玩家被杀数 |
| Damage | biguint | 玩家造成的伤害 |
| iAssists | int | 玩家助攻次数 |
| fLocationX | float | 玩家中途退出的位置_X轴坐标 |
| fLocationY | float | 玩家中途退出的位置_Y轴坐标 |
| fLocationZ | float | 玩家中途退出的位置_Z轴坐标 |
| iDungeonID | int | 副本ID |
| iDropOutQuestID | int | 中途退出的子QuestID |
| iDropOutAreaID | int | 中途退出的区域ID |
| iSeasonLevel | int | 赛季等级 |
| RealPlayerNumWhenStart | uint | 开赛时的真人玩家人数 |
| iMatchType | int | 赛事类型 |
| IsInBossBattle | int | 是否在Boss战时中退 |
| AffixTotalLevel | int | 单局的词条总等级 |
| AffixInfo | string | 词条的详细数据 Affix_ID1:Level_1,Affix_ID2:Level_2 |

---

### 34. GameTotal

- **描述**: 副本类 单局游戏总体数据
- **字段数**: 33
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为空 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为空 |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | uint64 | DS房间ID |
| iGameMode | int | 游戏模式。详见GameDetail表里的该字段描述 |
| iModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| iSubModeType | int | 子模式ID。详见GameDetail表里的该字段描述 |
| iMapId | int | 地图ID |
| iDungeonID | int | 副本ID |
| dtGameStartTime | datetime | 游戏开始时间 |
| iFinTime | int | 整个游戏时间(秒) |
| iProcedureId | int | 副本流程ID |
| iEndGameReason | int | 0=正常结算,1=团灭失败,2=离线过长被服务器踢出 |
| iIsWin | int | 0=失败 1=胜利 2=平局 |
| iPlayerNum | int | 结算时玩家人数 |
| iDropNum | int | 中途退出人数 |
| iScore | int | 单局评分 |
| BotNumWhenStart | uint | 开赛时的Bot人数 |
| MaxBotNum | uint | 单局最大Bot人数 |
| BotNumWhenEnd | uint | 结算时的Bot人数 |
| DisconnectNum | int | 结算时掉线且未重连人数 |
| HalfJoinNum | int | 中途加入的人数 |
| RealPlayerNumWhenStart | uint | 开赛时的真人玩家人数 |
| iMatchType | int | 赛事类型 |
| RLBot | int | RLBot强化bot人数 |
| SurrenderDetail | string | 投降投票细节 发起时间,同意人数,拒绝人数; |
| GameEndBySurrender | int | 游戏是否因有人投降而结束 注意并不代表是本方投降 |

---

### 35. GameTotalPlayerInfo

- **描述**: 单局结算时游戏玩家信息
- **字段数**: 36
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为空 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为空 |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | uint64 | DS房间ID |
| iGameMode | int | 游戏模式。详见GameDetail表里的该字段描述 |
| iModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| iSubModeType | int | 子模式ID。详见GameDetail表里的该字段描述 |
| iMapId | int | 地图ID |
| iDungeonID | int | 副本ID |
| dtGameStartTime | datetime | 游戏开始时间 |
| iFinTime | int | 整个游戏时间(秒) |
| iProcedureId | int | 副本流程ID |
| iEndGameReason | int | 0=正常结算,1=团灭失败,2=离线过长被服务器踢出 |
| iIsWin | int | 0=失败 1=胜利 2=平局 |
| OpenID_1 | string | 玩家1的OpenID |
| OpenID_2 | string | 玩家2的OpenID |
| OpenID_3 | string | 玩家3的OpenID |
| OpenID_4 | string | 玩家4的OpenID |
| OpenID_5 | string | 玩家5的OpenID |
| OpenID_6 | string | 玩家6的OpenID |
| OpenID_7 | string | 玩家7的OpenID |
| OpenID_8 | string | 玩家8的OpenID |
| OpenID_9 | string | 玩家9的OpenID |
| OpenID_10 | string | 玩家10的OpenID |
| OpenID_11 | string | 玩家11的OpenID |
| OpenID_12 | string | 玩家12的OpenID |
| OpenID_13 | string | 玩家13的OpenID |
| OpenID_14 | string | 玩家14的OpenID |
| OpenID_15 | string | 玩家15的OpenID |
| OpenID_16 | string | 玩家16的OpenID |

---

### 36. SpaceTimeHuntGameTotal

- **描述**: 时空追猎专用的GameTotal
- **字段数**: 54
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为空 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为空 |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | uint64 | DS房间ID |
| iDungeonID | int | 副本ID |
| BossBattleCounts | int | Boss战斗单局进行次数 |
| BossBattleFinishCounts | int | Boss战斗完成次数 |
| BossBattleDuration | float | Boss战斗耗时 |
| PlayerDeathCounts | int | 玩家死亡次数 |
| AllBossCount | int | 这局开启BOSS战总次数 |
| IsPositiveBoss_1 | int | 玩家第1次开启BOSS战是主动开启还是被动开启 |
| IsSuccessBoss_1 | int | 该次boss挑战是否成功 |
| PlayerCountBoss_1 | int | boss战参与玩家数量 |
| GoldCountBoss_1 | int | 玩家第1次开启BOSS战时金币存量 |
| Skill1_Boss1 | int | 玩家第1次开启BOSS战时的第1种战术技能的金币价值 |
| Skill2_Boss1 | int | 玩家第1次开启BOSS战时的第2种战术技能的金币价值 |
| Skill3_Boss1 | int | 玩家第1次开启BOSS战时的第3种战术技能的金币价值 |
| Skill4_Boss1 | int | 玩家第1次开启BOSS战时的第4种战术技能的金币价值 |
| Skill5_Boss1 | int | 玩家第1次开启BOSS战时的第5种战术技能的金币价值 |
| Skill6_Boss1 | int | 玩家第1次开启BOSS战时的第6种战术技能的金币价值 |
| GoldUsedCountBoss_1 | int | 玩家第1次BOSS战中使用的金币价值 |
| IsPositiveBoss_2 | int | 玩家第2次开启BOSS战是主动开启还是被动开启 |
| IsSuccessBoss_2 | int | 该次boss挑战是否成功 |
| PlayerCountBoss_2 | int | boss战参与玩家数量 |
| GoldCountBoss_2 | int | 玩家第2次开启BOSS战时金币存量 |
| Skill1_Boss2 | int | 玩家第2次开启BOSS战时的第1种战术技能的金币价值 |
| Skill2_Boss2 | int | 玩家第2次开启BOSS战时的第2种战术技能的金币价值 |
| Skill3_Boss2 | int | 玩家第2次开启BOSS战时的第3种战术技能的金币价值 |
| Skill4_Boss2 | int | 玩家第2次开启BOSS战时的第4种战术技能的金币价值 |
| Skill5_Boss2 | int | 玩家第2次开启BOSS战时的第5种战术技能的金币价值 |
| Skill6_Boss2 | int | 玩家第2次开启BOSS战时的第6种战术技能的金币价值 |
| GoldUsedCountBoss_2 | int | 玩家第2次BOSS战中使用的金币价值 |
| IsPositiveBoss_3 | int | 玩家第3次开启BOSS战是主动开启还是被动开启 |
| IsSuccessBoss_3 | int | 该次boss挑战是否成功 |
| PlayerCountBoss_3 | int | boss战参与玩家数量 |
| GoldCountBoss_3 | int | 玩家第3次开启BOSS战时金币存量 |
| Skill1_Boss3 | int | 玩家第3次开启BOSS战时的第1种战术技能的金币价值 |
| Skill2_Boss3 | int | 玩家第3次开启BOSS战时的第2种战术技能的金币价值 |
| Skill3_Boss3 | int | 玩家第3次开启BOSS战时的第3种战术技能的金币价值 |
| Skill4_Boss3 | int | 玩家第3次开启BOSS战时的第4种战术技能的金币价值 |
| Skill5_Boss3 | int | 玩家第3次开启BOSS战时的第5种战术技能的金币价值 |
| Skill6_Boss3 | int | 玩家第3次开启BOSS战时的第6种战术技能的金币价值 |
| GoldUsedCountBoss_3 | int | 玩家第3次BOSS战中使用的金币价值 |
| EvacuateModeFinishTime | int | 撤离模式收集目标完成时间 |
| EvacuateModeFirstStart | int | 撤离模式首次开启生存时间 |
| EvacuateModeHandInCount | int | 撤离模式资料累计提交次数 |
| EvacuateModeStartCount | int | 撤离模式开启生存流程次数 |
| EvacuateModePlayerNum | int | 撤离模式成功撤离玩家人数 |

---

### 37. PlayerDeathAndReviveStaticsData

- **描述**: 玩家死亡复活位置信息上报表
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| DeathLocString | string | 玩家死亡拼接字符串 拼接逻辑为[LocX1,LocY1,LocZ1,SpA,SpB;LocX2,LocY2,LocZ2,SpA,SpB,...] |
| ReviveLocString | string | 玩家复活拼接字符串 拼接逻辑为[LocX1,LocY1,LocZ1,SpA,SpB;LocX2,LocY2,LocZ2,SpA,SpB,...] |
| KillLocString | string | (暂未上报)玩家击杀其他人时自身位置拼接字符串 拼接逻辑为[LocX1;LocY1;LocZ1,LocX2;LocY2;LocZ2,...,LocXn;LocYn;LocZn] |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| iBotType | int | Bot类型,1是行为树，2是强化 |

---

### 38. ChallengeSubDungeonGameTotal

- **描述**: 挑战玩法子关卡数据
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | string | 该房间ID |
| DungeonID | int | 该局副本ID |
| SubQuestID | int | 该局子关卡ID |
| FinishTime | int | 通关时间 |
| AllWipedOutTime | int | 团灭次数 |

---

### 39. PlayerChallengeSubDungeonGameDetails

- **描述**: 玩家挑战玩法子关卡数据
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| DungeonID | int | 该局副本ID |
| RoomID | string | 该房间ID |
| SubQuestID | int | 该局子关卡ID |
| FreeReviveCoinUsedCount | int | 免费复活币使用次数 |
| PaidReviveCoinUsedCount | int | 付费复活币使用次数 |
| ReFillTime | int | 弹药补给次数 |
| DeathCount | int | 死亡次数 |

---

### 40. GameBossDetail

- **描述**: 副本类 Boss战斗流水表
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| BossID | uint64 | BossID |
| iIsBossKilled | int | 该boss是否被击杀 |
| iPlayerRankDivision | int | 玩家段位 |
| iTeamNum | int | 队伍人数 |
| iBattleTime | int | boss战斗时间 |
| dtWipeTime | datetime | 团灭时间 |
| LethalSkillID1 | uint64 | 致死ID_1 |
| vPlayerID1 | uint64 | 死亡玩家_1 |
| LethalSkillID2 | uint64 | 致死ID_2 |
| vPlayerID2 | uint64 | 死亡玩家_2 |
| LethalSkillID3 | uint64 | 致死ID_3 |
| vPlayerID3 | uint64 | 死亡玩家_3 |
| LethalSkillID4 | uint64 | 致死ID_4 |
| vPlayerID4 | uint64 | 死亡玩家_4 |
| LethalSkillID5 | uint64 | 致死ID_5 |
| vPlayerID5 | uint64 | 死亡玩家_5 |
| DungeonID | int | DungeonID |

---

### 41. MonsterKillTimes

- **描述**: 怪物击杀玩家的统计
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| QuestID | string | QuestID |
| MonsterID | uint64 | MonsterID |
| KillCount | int | 击杀次数 |

---

### 42. BossKillSkills

- **描述**: Boss击杀玩家的统计
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| BossID | string | BossID |
| SkillID | uint64 | SkillID |
| KillCount | int | 击杀次数 |

---

### 43. MonstersShieldBrokenStatus

- **描述**: 副本局内怪物被破盾的数据统计
- **字段数**: 19
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| FireBrokenCount | int | 燃烧元素被破盾的数量 |
| CryoBrokenCount | int | 急冻元素被破盾的数量 |
| ShockBrokenCount | int | 电击元素被破盾的数量 |
| CorrosiveBrokenCount | int | 腐蚀元素被破盾的数量 |
| KineticBrokenCount | int | 物理元素被破盾的数量 |
| FireKilledCount | int | 燃烧元素被击杀的数量 |
| CryoKilledCount | int | 急冻元素被击杀的数量 |
| ShockKilledCount | int | 电击元素被击杀的数量 |
| CorrosiveKilledCount | int | 腐蚀元素被击杀的数量 |
| KineticKilledCount | int | 物理元素被击杀的数量 |

---

### 44. CharComInGameUsage

- **描述**: 精绝女王局内红包tglog
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| ModeType | int | 模式类型 |
| MapID | int | 地图ID |
| TeamNumber | int | 队伍人数 |
| ActionType | int | 0=打开轮盘未执行操作，1=打开轮盘使用3p动画，2=打开轮盘使用1p动画,3=打开轮盘使用语音，4=打开轮盘使用失败 |
| SlotID | int | 使用轮盘的栏位 |
| SlotFeature | int | 1=无功能，2=有指定功能 |

---

### 45. PlayerReceiveHongbaoStatics

- **描述**: 玩家局内收到红包,DS直接上报
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| ReceivedGoldCount | int | 收到的红包金额 |
| VolumeName | string | 发出红包对应的volume名称 |

---

### 46. PlayerGiveHongbaoStatics

- **描述**: 玩家局内发出红包,DS直接上报
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，不涉及，上报空 |
| vRoleID | string | (必填)玩家角色ID，不涉及，上报空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| HongbaoValues | string | 发出的红包金额列表，[Value1;Value2] |
| VolumeName | string | 发出红包对应的volume名称 |

---

### 47. SpaceTimeHuntGameDetail2

- **描述**: 时空追猎相关的单局结算信息
- **字段数**: 172
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| DungeonID | int | 该局副本ID |
| Level | int | 玩家等级 |
| SchemeScore | int | 玩家的评分档次 |
| Death | int | 玩家死亡次数 |
| SelfRevive | int | 玩家自主复活次数 |
| TeamHelpRevive | int | 玩家被队友拉起复活次数 |
| FinishCommonMission | int | 玩家完成普通任务次数 |
| FinishAdvancedMission | int | 玩家完成高级任务次数 |
| FinishChallengeMission | int | 玩家完成挑战任务次数 |
| FinishAddOnMission | int | 玩家完成加成任务次数 |
| CommonMissionDeath | int | 玩家在普通任务中死亡次数 |
| AdvancedMissionDeath | int | 玩家在高级任务中死亡次数 |
| ChallengeMissionDeath | int | 玩家在挑战任务中死亡次数 |
| AddOnMissionDeath | int | 玩家完成加成任务时死亡次数 |
| GoldCoin | int | 玩家获得金币数量 |
| GoldCoinByMonster | int | 玩家通过击杀获得金币数量 |
| GoldCoinByMission | int | 玩家通过完成任务获得金币数量 |
| UseGoldCoin | int | 玩家使用金币数量 |
| BuyTechnicalWeaponCount | int | 玩家购买战术武器数量 |
| BuyTechnicalWeaponCoin | int | 玩家购买战术武器消耗金币 |
| RefreshTreasureCount | int | 玩家使用金币刷新时空宝藏数量 |
| RefreshTreasureCoin | int | 玩家购买时空宝藏消耗金币 |
| TechnicalSkill1 | int | 战术技能1使用次数 |
| TechnicalSkill2 | int | 战术技能2使用次数 |
| TechnicalSkill3 | int | 战术技能3使用次数 |
| TechnicalSkill4 | int | 战术技能4使用次数 |
| TechnicalSkill5 | int | 战术技能5使用次数 |
| TechnicalSkill6 | int | 战术技能6使用次数 |
| MechaCounts | int | 玩家使用机甲的次数 |
| RoomID | string | 该房间ID |
| TreasureCount | int | 玩家获取宝藏个数 |
| Treasure_1_Time | int | 获取宝藏1的时间 |
| Treasure_1_Source | int | 获取宝藏1的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_2_Time | int | 获取宝藏2的时间 |
| Treasure_2_Source | int | 获取宝藏2的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_3_Time | int | 获取宝藏3的时间 |
| Treasure_3_Source | int | 获取宝藏3的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_4_Time | int | 获取宝藏4的时间 |
| Treasure_4_Source | int | 获取宝藏4的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_5_Time | int | 获取宝藏5的时间 |
| Treasure_5_Source | int | 获取宝藏5的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_6_Time | int | 获取宝藏6的时间 |
| Treasure_6_Source | int | 获取宝藏6的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_7_Time | int | 获取宝藏7的时间 |
| Treasure_7_Source | int | 获取宝藏7的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_8_Time | int | 获取宝藏8的时间 |
| Treasure_8_Source | int | 获取宝藏8的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_9_Time | int | 获取宝藏9的时间 |
| Treasure_9_Source | int | 获取宝藏9的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_10_Time | int | 获取宝藏10的时间 |
| Treasure_10_Source | int | 获取宝藏10的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_11_Time | int | 获取宝藏11的时间 |
| Treasure_11_Source | int | 获取宝藏11的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| PhaseAwardTime | int | 阶段奖励次数 |
| FreeReviveCount | int | 免费复活次数 |
| FreeCoinReviveCount | int | 免费复活币复活次数 |
| CoinReviveCount | int | 复活币复活次数 |
| RidingMechaTime | int | 驾驶机甲时间 |
| TechnicalSkill7 | int | 战术技能7使用次数 |
| TechnicalSkill8 | int | 战术技能8使用次数 |
| TechnicalSkill9 | int | 战术技能9使用次数 |
| TechnicalSkill10 | int | 战术技能10使用次数 |
| TechnicalSkill11 | int | 战术技能11使用次数 |
| TechnicalSkill12 | int | 战术技能12使用次数 |
| TechnicalID1 | uint64 | 战术技能1ID |
| TechnicalID2 | uint64 | 战术技能2ID |
| TechnicalID3 | uint64 | 战术技能3ID |
| TechnicalID4 | uint64 | 战术技能4ID |
| TechnicalID5 | uint64 | 战术技能5ID |
| TechnicalID6 | uint64 | 战术技能6ID |
| TechnicalID7 | uint64 | 战术技能7ID |
| TechnicalID8 | uint64 | 战术技能8ID |
| TechnicalID9 | uint64 | 战术技能9ID |
| TechnicalID10 | uint64 | 战术技能10ID |
| TechnicalID11 | uint64 | 战术技能11ID |
| TechnicalID12 | uint64 | 战术技能12ID |
| TechnicalBought1 | int | 战术技能1购买次数 |
| TechnicalBought2 | int | 战术技能2购买次数 |
| TechnicalBought3 | int | 战术技能3购买次数 |
| TechnicalBought4 | int | 战术技能4购买次数 |
| TechnicalBought5 | int | 战术技能5购买次数 |
| TechnicalBought6 | int | 战术技能6购买次数 |
| TechnicalBought7 | int | 战术技能7购买次数 |
| TechnicalBought8 | int | 战术技能8购买次数 |
| TechnicalBought9 | int | 战术技能9购买次数 |
| TechnicalBought10 | int | 战术技能10购买次数 |
| TechnicalBought11 | int | 战术技能11购买次数 |
| TechnicalBought12 | int | 战术技能12购买次数 |
| Treasure_1_ID | int | 获取宝藏1的ID |
| Treasure_2_ID | int | 获取宝藏2的ID |
| Treasure_3_ID | int | 获取宝藏3的ID |
| Treasure_4_ID | int | 获取宝藏4的ID |
| Treasure_5_ID | int | 获取宝藏5的ID |
| Treasure_6_ID | int | 获取宝藏6的ID |
| Treasure_7_ID | int | 获取宝藏7的ID |
| Treasure_8_ID | int | 获取宝藏8的ID |
| Treasure_9_ID | int | 获取宝藏9的ID |
| Treasure_10_ID | int | 获取宝藏10的ID |
| Treasure_11_ID | int | 获取宝藏11的ID |
| Treasure_12_ID | int | 获取宝藏12的ID |
| Treasure_12_Time | int | 获取宝藏12的时间 |
| Treasure_12_Source | int | 获取宝藏12的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_13_ID | int | 获取宝藏13的ID |
| Treasure_13_Time | int | 获取宝藏13的时间 |
| Treasure_13_Source | int | 获取宝藏13的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_14_ID | int | 获取宝藏14的ID |
| Treasure_14_Time | int | 获取宝藏14的时间 |
| Treasure_14_Source | int | 获取宝藏14的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_15_ID | int | 获取宝藏15的ID |
| Treasure_15_Time | int | 获取宝藏15的时间 |
| Treasure_15_Source | int | 获取宝藏15的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_16_ID | int | 获取宝藏16的ID |
| Treasure_16_Time | int | 获取宝藏16的时间 |
| Treasure_16_Source | int | 获取宝藏16的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_17_ID | int | 获取宝藏17的ID |
| Treasure_17_Time | int | 获取宝藏17的时间 |
| Treasure_17_Source | int | 获取宝藏17的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_18_ID | int | 获取宝藏18的ID |
| Treasure_18_Time | int | 获取宝藏18的时间 |
| Treasure_18_Source | int | 获取宝藏18的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_19_ID | int | 获取宝藏19的ID |
| Treasure_19_Time | int | 获取宝藏19的时间 |
| Treasure_19_Source | int | 获取宝藏19的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_20_ID | int | 获取宝藏20的ID |
| Treasure_20_Time | int | 获取宝藏20的时间 |
| Treasure_20_Source | int | 获取宝藏20的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_21_ID | int | 获取宝藏21的ID |
| Treasure_21_Time | int | 获取宝藏21的时间 |
| Treasure_21_Source | int | 获取宝藏21的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_22_ID | int | 获取宝藏22的ID |
| Treasure_22_Time | int | 获取宝藏22的时间 |
| Treasure_22_Source | int | 获取宝藏22的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_23_ID | int | 获取宝藏23的ID |
| Treasure_23_Time | int | 获取宝藏23的时间 |
| Treasure_23_Source | int | 获取宝藏23的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_24_ID | int | 获取宝藏24的ID |
| Treasure_24_Time | int | 获取宝藏24的时间 |
| Treasure_24_Source | int | 获取宝藏24的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_25_ID | int | 获取宝藏25的ID |
| Treasure_25_Time | int | 获取宝藏25的时间 |
| Treasure_25_Source | int | 获取宝藏25的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_26_ID | int | 获取宝藏26的ID |
| Treasure_26_Time | int | 获取宝藏26的时间 |
| Treasure_26_Source | int | 获取宝藏26的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_27_ID | int | 获取宝藏27的ID |
| Treasure_27_Time | int | 获取宝藏27的时间 |
| Treasure_27_Source | int | 获取宝藏27的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_28_ID | int | 获取宝藏28的ID |
| Treasure_28_Time | int | 获取宝藏28的时间 |
| Treasure_28_Source | int | 获取宝藏28的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_29_ID | int | 获取宝藏29的ID |
| Treasure_29_Time | int | 获取宝藏29的时间 |
| Treasure_29_Source | int | 获取宝藏29的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| Treasure_30_ID | int | 获取宝藏30的ID |
| Treasure_30_Time | int | 获取宝藏30的时间 |
| Treasure_30_Source | int | 获取宝藏30的来源, 0=GM,1=任务,2=玩法物件,3=提交资料,4=月卡 |
| CollectionCount | int | 玩家收集的资料数量 |
| HandInCount | int | 玩家上交资料的数量 |
| KillCountWhenCollection | int | 玩家收集期的杀怪数量 |
| OpenTreasureCount | int | 玩家开启宝箱的个数 |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| iBotType | int | Bot类型,1是行为树，2是强化 |

---

### 48. SKZLTacticalSkill

- **描述**: 玩家局内时空追猎战术技能上报表，由DS直接上报
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为0 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为0 |
| Env | string | 服务器环境 |
| Level | uint32 | 玩家等级 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| SkillID | int | 战术资源技能ID |
| LocX | float | 战术资源释放的位置X |
| LocY | float | 战术资源释放的位置Y |
| LocZ | float | 战术资源释放的位置Z |

---

### 49. SpaceTimeHuntPlayerUnlockSkill

- **描述**: 时空追猎玩法玩家战术支援技能解锁/升级表
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| UnlockSkillID | bigint | 此次解锁/升级的战术支援技能ID |
| SkillLevel | int | 解锁/升级后的战术支援技能等级 |
| IsUpgradeSkill | int | 是否为升级技能，0解锁 1升级 |

---

### 50. SpaceTimeHuntPlayerGetRewards

- **描述**: 时空追猎玩法玩家获取奖励表
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| CycleID | int | 时空追猎循环ID |
| ChallengeID | int | 时空追猎挑战ID |

---

### 51. PlayerMechaInfoStaticsData

- **描述**: 玩家局内机甲表 由DS直接上报
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为0 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为0 |
| Env | string | 服务器环境 |
| Level | uint32 | 玩家等级 |
| MechaProtoID | int | 机甲ID |
| TriggerMechaNum | int | 召唤次数 |
| RecycleType | int | 回收类型 |
| ExistTime | float | 存活时长 |
| DrivingTime | float | 驾驶时长 |
| HoveringNum | int | 悬浮次数 |
| DashNum | int | Dash次数 |
| KillEnemyNums | int | 杀怪数量 |
| TotalDamage | float | 累计伤害 |
| KillEliteNums | int | 杀死小怪数量 |
| TotalEliteDamage | float | 对小怪伤害 |
| KillBossNums | int | 杀死Boss数量 |
| TotalBossDamage | float | 对Boss伤害 |
| TotalReceiveHarm | float | 累计承受伤害 |
| HangingPlayerStr | string | 挂载玩家数据(数组) 拼接逻辑为[PlayerID1;Counts1;Time1,...,] |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |

---

### 52. PlayerMechaSkillDamageData

- **描述**: 玩家机甲技能伤害上报表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| MechaProtoID | int | 机甲原型ID |
| SkillDamageID | int | 机甲伤害ID |
| SkillDamage | string | 伤害总量 |
| SkillCounts | int | 机甲技能释放次数 |

---

### 53. MechaGameRoundTotal

- **描述**: 机甲战类回合房间流水表
- **字段数**: 25
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| RoomRank | int | 房间段位 |
| Duration | int | 游戏时长 |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| MechaCount | int | 机甲数量 |
| HumanCount | int | 人类数量 |
| MechaDeathCount | int | 机甲被击杀数 |
| HumanDeathCount | int | 人类被击杀数 |
| RoundID | int | 回合ID |
| SpecialWeaponDrop | string | 大杀器刷新统计 ID:Count,DropCount; |
| SpecialWeaponRefresh | string | 大杀器刷新位置统计 ID:位置,刷新-被捡起来耗时; |

---

### 54. PlayerMechaRoundGameDetail

- **描述**: 机甲战类回合玩家流水表
- **字段数**: 67
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| RoomRank | int | 房间段位 |
| PlayerRank | int | 玩家段位 |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| RoundID | int | 回合ID |
| IsDropOut | int | 是否中途退出 |
| CampType | int | 阵营：0人类 1机甲 |
| MechaID | uint64 | 机甲ID |
| IsWin | int | 是否胜利 |
| WinCampType | int | 获胜方阵营：0人类 1机甲 |
| GameDuration | int | 回合时间 |
| AliveDuration | int | 存活时间 |
| HumanKillCount | int | 作为人类击杀数 |
| MechaKillCount | int | 作为机甲击杀数 |
| HumanTotalDamage | int64 | 作为人类该回合总伤害 |
| MechaTotalDamage | int64 | 作为机甲该回合总伤害 |
| SuperWeaponDamage | int64 | 大杀器造成的总伤害 |
| HumanSufferDamage | int64 | 作为人类承受伤害 |
| MechaSufferDamage | int64 | 作为机甲承受伤害 |
| DashDamage | int64 | 冲刺伤害 |
| CrushDamage | int64 | 碾压伤害 |
| HumanWeaponDamage | int64 | 作为人类武器伤害 |
| HumanWeaponSkillDamage | int64 | 作为人类武器技能伤害 |
| MechaWeaponDamage | int64 | 作为机甲武器伤害 |
| MechaWeaponSkillDamage | int64 | 作为机甲武器技能伤害 |
| HumanScore | int | 作为人类得分 |
| MechaScore | int | 作为机甲得分 |
| MechaSkillStat | string | 技能统计skill_id,use_count,damage;组 |
| TenacityBrokenTimes | int | 破韧次数 |
| SlotInfo | string | 插槽统计slot_id,component_id,broken_count（受损次数）;组 |
| BreakMechaComponentCount | int | 人类击破机甲部位次数 |
| MechaAliveDuration | int | 机甲存活时间 |
| HumanAliveDuration | int | 人类存活时间 |
| MechaPickDropCount | int | 废弃字段 --- 机甲拾取补给箱次数 |
| PickRocketLauncherCount | int | 废弃字段 --- 拾取火箭筒大杀器次数 |
| PickBomberCount | int | 废弃字段 --- 拾取投掷炸弹大杀器次数 |
| PickPlasmaRayGunCount | int | 废弃字段 --- 拾取等离子射线枪大杀器次数 |
| RocketLauncherExhaustedCount | int | 废弃字段 --- 火箭筒大杀器弹药耗尽次数 |
| BomberExhaustedCount | int | 废弃字段 --- 投掷炸弹大杀器弹药耗尽次数 |
| PlasmaRayGunExhaustedCount | int | 废弃字段 --- 等离子射线枪大杀器弹药耗尽次数 |
| RocketLauncherDamage | int64 | 废弃字段 --- 火箭筒大杀器造成伤害 |
| BomberDamage | int64 | 废弃字段 --- 投掷炸弹大杀器造成伤害 |
| PlasmaRayGunDamage | int64 | 废弃字段 --- 等离子射线枪大杀器造成伤害 |
| MechaLevelStat | string | 机甲等级统计 Level,停留时长,平均存活时间; |
| HumanLevelStat | string | 人类等级统计 Level,停留时长,平均存活时间; |
| SelfRepairSuccessCount | int | 机甲成功使用自修复技能的次数 |
| MechaLevel | int | 机甲等级 |
| HumanLevel | int | 人类等级 |
| SuperWeaponDetail | string | {id,拾取次数,耗尽次数,伤害,使用次数} |
| PickSupplyBox | string | 机甲拾取补给箱子 {剩余弹药量,剩余血量} |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| iBotType | int | Bot类型,1是行为树，2是强化 |

---

### 55. PlayerMechaComponentFlow

- **描述**: 机甲组件获得流水
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |
| ItemID | uint64 | 道具ID |
| MechaID | uint64 | 机甲ID |
| ComponentID | uint64 | 组件ID |
| UnlockType | int32 | 0:通过发放道具的方式永久解锁 1:任务解锁 2:购买 3:随机甲默认解锁  4:临时解锁 10:该组件被锁定不可再用 |
| ConsumptionID | uint64 | 解锁时扣除的道具消耗ID |

---

### 56. PlayerMechaChangeFlow

- **描述**: 机甲修改部件流水
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |
| MechaID | uint64 | 机甲ID |
| SuitType | int | 套装类型 1:PvP 2:PvE |
| WeaponID | uint64 | 武器ID |
| TacticID | uint64 | 战术挂机ID |
| AdjunctID | uint64 | 辅助挂件ID |
| ExpertID | uint64 | 专属挂件ID |
| SkinID | uint64 | 皮肤ID |
| ColorschemeID | uint64 | 配色ID |

---

### 57. PlayerMechaCoreFlow

- **描述**: 机甲核心流水
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| RoleGID | string | 玩家角色ID，NZM该字段为RoleGID |
| AreaID | int | 大区ID：1-9为正式服 |
| SeasonID | int | 赛季ID |
| CoreID | int | 机甲核心ID |
| CurrentLevel | int | 当前等级 |
| CompletedTask | string | 已完成任务 |
| RemainingTask | string | 剩余任务 |

---

### 58. PlayerWeaponReportingData

- **描述**: 玩家局内武器数据上报
- **字段数**: 81
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| WeaponID | string | 武器ID |
| UseTime | float | 使用时长 |
| CombatUseTime | float | 战斗状态下使用时长 |
| NormalShotTime | int | 腰射开火次数 |
| NormalHitTime | int | 腰射命中次数 |
| AimShotTime | int | 开镜开火次数 |
| AimHitTime | int | 开镜命中次数 |
| Damage | string | 伤害量 |
| EnergyActivateTime | int | 能量激活次数 |
| DungeonID | int | 副本ID |
| DropCount | int | 局内投放次数 [局内武器] |
| PickCount | int | 局内捡起次数 [局内武器] |
| Score | int | 枪械养成分数 |
| AllTime | int | 单局总时长 |
| KillAllMonsterCount | int | 击杀目标总数 |
| KillTraps | int | 击杀陷阱总数,击杀目标的MonsterType==1 |
| KillTrans | int | 击杀透明怪总数,击杀目标的MonsterType==2 |
| KillDusts | int | 击杀透明怪总数, 击杀目标的MonsterType==3 |
| KillCapitals | int | 击杀队长总数, 击杀目标的MonsterType==4 |
| KillElites | int | 击杀精英总数, 击杀目标的MonsterType==5 |
| KillMiniBoss | int | 击杀MiniBoss总数, 击杀目标的MonsterType==6 |
| KillBoss | int | 击杀Boss总数, 击杀目标的MonsterType==7 |
| KillWorldBoss | int | 击杀WorldBoss总数, 击杀目标的MonsterType==8 |
| Distance05 | int | [0米，5米)击杀怪物数 |
| Distance510 | int | [5米，10米)击杀怪物数 |
| Distance1015 | int | [10米，15米)击杀怪物数 |
| Distance1520 | int | [15米，20米)击杀怪物数 |
| Distance2030 | int | [20米，30米)击杀怪物数 |
| Distance3040 | int | [30米，40米)击杀怪物数 |
| Distance4050 | int | [40米，50米)击杀怪物数 |
| Distance5060 | int | [50米，60米)击杀怪物数 |
| Distance6070 | int | [60米，70米)击杀怪物数 |
| Distance7080 | int | [70米，80米)击杀怪物数 |
| Distance80100 | int | [80米，100米)击杀怪物数 |
| Distance100plus | int | [100米，++)击杀怪物数 |
| Intervals | string | （技能专属）本局上一次使用同ID技能的平均间隔时间 格式为[SkillID1,Intervals1;SkillID2,Intervals2;etc] |
| AllFireCount | int | 总开火次数 |
| AllHitCount | int | 总命中次数 |
| FireWhileEnergy | int | 能量激活时开火次数 |
| HitWhileEnergy | int | 能量激活时命中次数 |
| WeakPointHitCount | int | 命中弱点次数 |
| CriticalHitCount | int | 造成暴击次数 |
| ElementType | int | 元素 0:无属性伤害 1:火系伤害 2:冰系伤害 3:电系伤害 4:毒系伤害 5:物理伤害 |
| ToughnessDamageType | int | 冲量类型 0:无 1:冲击 2:贯穿 3:爆炸 |
| WeaponTypeID | int | 武器类型ID |
| WeaponAmmoType | string | 武器槽位ID |
| DSAreaID | int | DS内区域 |
| DamageDistance05 | float | [0米，5米)伤害总量 |
| DamageDistance510 | float | [5米，10米)伤害总量 |
| DamageDistance1015 | float | [10米，15米)伤害总量 |
| DamageDistance1520 | float | [15米，20米)伤害总量 |
| DamageDistance2030 | float | [20米，30米)伤害总量 |
| DamageDistance3040 | float | [30米，40米)伤害总量 |
| DamageDistance4050 | float | [40米，50米)伤害总量 |
| DamageDistance5060 | float | [50米，60米)伤害总量 |
| DamageDistance6070 | float | [60米，70米)伤害总量 |
| DamageDistance7080 | float | [70米，80米)伤害总量 |
| DamageDistance80100 | float | [80米，100米)伤害总量 |
| DamageDistance100plus | float | 100+伤害总量 |
| HitCntDistance05 | int | [0米，5米)命中次数 |
| HitCntDistance510 | int | [5米，10米)命中次数 |
| HitCntDistance1015 | int | [10米，15米)命中次数 |
| HitCntDistance1520 | int | [15米，20米)命中次数 |
| HitCntDistance2030 | int | [20米，30米)命中次数 |
| HitCntDistance3040 | int | [30米，40米)命中次数 |
| HitCntDistance4050 | int | [40米，50米)命中次数 |
| HitCntDistance5060 | int | [50米，60米)命中次数 |
| HitCntDistance6070 | int | [60米，70米)命中次数 |
| HitCntDistance7080 | int | [70米，80米)命中次数 |
| HitCntDistance80100 | int | [80米，100米)命中次数 |
| HitCntDistance100plus | int | 100+命中次数 |

---

### 59. PlayerDamageStatData

- **描述**: 单局玩家伤害数据上报
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| NumericalID | uint64 | 本局中，由本玩家ASC作为攻击方的结算ID |
| Count | int32 | 本局中由本玩家ASC作为攻击方的结算ID的执行次数 |
| CriticalCount | int32 | 本局中由本玩家ASC作为攻击方的结算ID的暴击次数 |
| KillTargetCount | int32 | 本局中由本玩家ASC作为攻击方的结算ID的击杀敌人次数 |
| RealDamageTotal | string | 本局中由本玩家ASC作为攻击方的结算ID的总伤害(不计算溢出伤害) |
| DamageTotal | string | 本局中由本玩家ASC作为攻击方的结算ID的总伤害(计算溢出伤害) |
| TargetIsBossCount | int32 | 本局中由本玩家ASC作为攻击方的结算ID对BOSS类型敌人施加的次数 |
| DamageTotalOnBoss | string | 本局中由本玩家ASC作为攻击方的结算ID对BOSS类型敌人造成的总伤害(计算溢出伤害) |
| NumericalIDLevel | int32 | 结算ID等级 |
| DungeonID | int32 | 副本ID |

---

### 60. PlayerDeathStatData

- **描述**: 本局中杀死本玩家的结算ID的数据上报
- **字段数**: 31
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| NumericalID1 | uint64 | 本局中杀死本玩家的结算ID_1 |
| Count1 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_1 |
| NumericalID2 | uint64 | 本局中杀死本玩家的结算ID_2 |
| Count2 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_2 |
| NumericalID3 | uint64 | 本局中杀死本玩家的结算ID_3 |
| Count3 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_3 |
| NumericalID4 | uint64 | 本局中杀死本玩家的结算ID_4 |
| Count4 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_4 |
| NumericalID5 | uint64 | 本局中杀死本玩家的结算ID_5 |
| Count5 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_5 |
| NumericalID6 | uint64 | 本局中杀死本玩家的结算ID_6 |
| Count6 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_6 |
| NumericalID7 | uint64 | 本局中杀死本玩家的结算ID_7 |
| Count7 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_7 |
| NumericalID8 | uint64 | 本局中杀死本玩家的结算ID_8 |
| Count8 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_8 |
| NumericalID9 | uint64 | 本局中杀死本玩家的结算ID_9 |
| Count9 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_9 |
| NumericalID10 | uint64 | 本局中杀死本玩家的结算ID_10 |
| Count10 | int32 | 本局中杀死本玩家的结算ID对本玩家的击杀次数_10 |
| DungeonID | int32 | DungeonID |

---

### 61. HuntingFieldGameDetail

- **描述**: 猎场专用的玩家结算数据上报
- **字段数**: 19
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| CoinsGained | int | 猎场获取代币量 |
| CoinsUsed | int | 猎场消耗代币量 |
| FreeRebirthCoinsUsed | int | 免费复活币使用次数 |
| PaidRebirthCoinsUsed | int | 付费复活币使用次数 |
| WeaponStatics | string | 玩家武器id，丢枪次数，捡枪次数，武器的来源字符串。拼接逻辑 |
| DungeonID | int | 副本ID |
| IsParticipantSpecBoss | int | 是否参与极品Boss战 |
| IsGetSpecItem | int | 是否结算时获得极品 |
| IsGoingEggRoom | int | 是否进入彩蛋房间，0=没有进入彩蛋房间 1=成功进入 2=尝试密码但是失败 3=没有任何尝试 |

---

### 62. PlayerHuntingFieldShopRecord

- **描述**: 玩家猎场局内道具购买记录
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| CommodityID | int | 商品ID |
| Count | int | 购买数量 |
| CoinsUsed | int | 消耗的代币数量 |
| ShopID | int | 商店ID |
| ShopIndex | int | 局内第几个商店 |
| ShopLocX | float | 商店x轴坐标 |
| ShopLocY | float | 商店y轴坐标 |
| ShopLocZ | float | 商店z轴坐标 |
| ItemID | uint64 | 随机商品随到的 Item id |

---

### 63. PlayerHuntingFieldPartitionGameDetail

- **描述**: 玩家猎场分区数据上报
- **字段数**: 61
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| AreaID | int | 猎场区域 |
| IsWin | int | 是否胜利 |
| UsedTime | int | 通关时长（或失败） |
| Attack | int | 攻击力 |
| CoinsGot | int | 钱 |
| HoldingWeapon1 | int64 | 所持武器1 |
| HoldingWeapon2 | int64 | 所持武器2 |
| HoldingWeapon3 | int64 | 所持武器3 |
| RebirthCoinsUsed | int | 复活币使用次数 |
| MissionDuration | int | 任务时长 |
| MissionFailedTimes | int | 任务失败次数 |
| BossBattleDuration | int | BOSS战时长 |
| DeathCountInBossBattle | int | BOSS战死亡次数 |
| RebirthCoinsUsedInBossBattle | int | BOSS战复活币使用次数 |
| TeamWipedTimesInBossBattle | int | BOSS战团灭次数 |
| EasterEggsOccurredCounts | int | 彩蛋怪触发次数 |
| EasterEggsGotCounts | int | 彩蛋怪击落次数 |
| ShopBuyAttack | int32 | 进入末段商店前的攻击力 |
| GameTime | int | 通关时长 |
| BattleTime | int | 战斗时长 |
| NonBattleTime | int | 非战斗时长 |
| ReloadTime | int | 弹药补给次数 |
| Level | int | 玩家等级 |
| SchemeID | int | 成长方案ID |
| DSLevel | int | 玩家局内等级 |
| BossName | string | BOSS名称 |
| BossGetGoldCount | int | BOSS获取金币数 |
| MissionID | int | 任务ID |
| MisssonGetGoldCount | int | 任务获取金币数 |
| PaidRebirthInBossBattle | int | BOSS战付费复活币使用次数 |
| PaidRebirthCoinCount | int | 总付费复活币使用 |
| Score | int | 分数获得数 |
| GoldWithMonster | int | 刷怪获取金币数 |
| RegularEnemyTime | int | 无限刷怪区域刷怪时长 |
| PaidSkills | string | 购买的具体猎场技能 |
| GivenGold | string | 赠与金额以及对象[PlayerID_1:Gold_1,PlayerID_2:Gold_2...] |
| AveragePoints | int | 玩家在每个boss关平均的积分数量统计 |
| MissionFinishTime | int | 完成任务的时长 |
| PropUseDetail | string | 道具使用情况 PropId,Location,KillNum,DeathNum,AceNum; Location定义参考HuntingRankGameTotal的GameProgress |
| PropUseCount | string | 道具使用次数 PropId_1:Count;PropId_2:Count; |
| MissionInfoStr | string | 任务信息 [ID,FailedCount,Time] |
| FromSewerToLeave | int | 任务完成后离开该子关卡下水道的时长 |
| PassiveSkillStr | string | 购买随机被动Tlog 金币购买=1 战术点购买=2 [1,Count,Skill;1,Count,Skill;2,Count;Skill] |
| TacticsPoint | int | 战术点数量 |
| KilledByWhichMonster | string | 击杀玩家的怪物 Index:MonsterID; |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| RogueAgentStatus | int | 0=没触发, 1=触发但没完成, 2=触发且完成 |
| CurseTreasureStatus | int | 诅咒宝箱状态，同上 |
| iBotType | int | Bot类型,1是行为树，2是强化 |

---

### 64. PlayerWeaponModuleFlow

- **描述**: 模组装载流水表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| WeaponID | uint64 | 武器ID |
| WeaponGID | uint64 | 武器GID |
| OpType | int | 装卸类型, 1: 装上. 2: 卸下 |
| SlotID | int | 槽位ID |
| ModuleItemID | uint64 | 被操作的模组道具ID |
| Score | int | 操作模组之后武器的总评分 |

---

### 65. PlayerWeaponFlow

- **描述**: 武器获得流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | (必填)环境名 |
| WeaponID | uint64 | 武器ID |
| WeaponGID | uint64 | 武器GID |
| PassiveSkillList | string | 武器被动技能列表 |

---

### 66. PlayerHighLightDPStaticsFlow

- **描述**: 玩家历史战绩操作流水表
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | (必填)环境名 |
| Operation | int | 0=取消,1=置顶 |
| DsRoomID | string | DsRoomID |

---

### 67. PlayerDsConn

- **描述**: 玩家DS网络统计，保留一个月
- **字段数**: 71
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| EventId | biguint | 游戏事件ID |
| ServerIP | string | 服务器所对应的BUSIP |
| IdcID | uint32 | idc ID |
| GameType | uint32 | 游戏模式 |
| ModeType | uint32 | 模式 |
| SubModeType | uint32 | 子模式 |
| MapId | uint32 | 地图ID |
| InPacketsLost | uint64 | 接收丢失包数 |
| InPackets | uint64 | 接收包数 |
| InBytes | uint64 | 接收字节数 |
| OutPacketsLost | uint64 | 发送丢失包数 |
| OutPackets | uint64 | 发送包数 |
| OutBytes | uint64 | 发送字节数 |
| AvgPing | uint32 | 平均ping值 |
| LaunchModule | int | ds是哪个模块拉起来的 |
| EnterType | uint | 是否是中途加入 |
| ClientIP | string | 客户端IP |
| ClientPort | uint32 | 客户端端口号 |
| ClientISP | uint32 | 玩家运营商 |
| ClientISPStr | string | 玩家运营商 |
| ClientCountry | string | 玩家国家 |
| ClientProvince | string | 玩家省份 |
| ClientCity | string | 玩家城市 |
| ClientRegion | string | 玩家区县 |
| DsaIP | string | DSA的IP地址 |
| ClientRealLoss | float | 客户端到服务器丢包率，0~1的值 |
| ClientEffectiveLoss | float | 客户端到服务器有效丢包率，0~1的值 |
| ServerRealLoss | float | 服务器到客户端丢包率，0~1的值 |
| ServerEffectiveLoss | float | 服务器到客户端有效丢包率，0~1的值 |
| RoomId | biguint | 房间id |
| DsIP | string | 客户端连接DS使用的IP |
| DsPort | uint32 | 客户端连接DS使用的端口 |
| DsISP | uint32 | DS外网VIP的ISP ID(1电信,2联通,3移动,4CAP,5BGP,6香港,7电信备,8联通备,9移动备,10CAP备) |
| DsISPStr | string | DS外网VIP的ISP字符串(电信 联通 移动 CAP BGP 香港) |
| SampleCnt | uint32 | 玩家网络ping值的样本数 |
| Jitter | uint32 | 玩家网络ping值的标准差(体现波动情况) |
| GameTimeS | uint32 | 延时采样数，通常每分钟采样一次 |
| Delay50ms | uint32 | 延时在[0~50ms)之间的样本量 |
| Delay100ms | uint32 | 延时在[50~100ms)之间的样本量 |
| Delay150ms | uint32 | 延时在[100~150ms)之间的样本量 |
| Delay200ms | uint32 | 延时在[150~200ms)之间的样本量 |
| Delay300ms | uint32 | 延时在[200~300ms)之间的样本量 |
| Delay400ms | uint32 | 延时在[300~400ms)之间的样本量 |
| Delay500ms | uint32 | 延时在[400~500ms)之间的样本量 |
| Delay600ms | uint32 | 延时在[500~600ms)之间的样本量 |
| DelayOthers | uint32 | 延时>600ms的样本量 |
| UsedDualChannel | int | 是否使用了双通道 |
| C1InPackets | uint64 | [主通道]接收包数 |
| C1InBytes | uint64 | [主通道]接收字节数 |
| C1OutPackets | uint64 | [主通道]发送包数 |
| C1OutBytes | uint64 | [主通道]发送字节数 |
| C2InPackets | uint64 | [副通道]接收包数 |
| C2InBytes | uint64 | [副通道]接收字节数 |
| C2OutPackets | uint64 | [副通道]发送包数 |
| C2OutBytes | uint64 | [副通道]发送字节数 |
| ActiveNetworkType | string | [活跃]网络类型 |
| C1NetworkType | string | [主通道]网络类型 |
| C2NetworkType | string | [副通道]网络类型 |
| AdjustPosCnt | int | 拉扯次数 |
| ForcePosUpCnt | int | 强制更新位置次数 |
| AvgAdjustDist | int | 平均拉扯距离 |
| MaxAdjustDist | int | 最大拉扯距离 |
| DsVersion | string | DS版本号 |

---

### 68. DsNetConn

- **描述**: DS网络统计，保留一个月
- **字段数**: 30
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| EventId | biguint | 游戏事件ID |
| GameType | uint32 | 游戏模式 |
| ModeType | uint32 | 模式 |
| SubModeType | uint32 | 子模式 |
| MapId | uint32 | 地图ID |
| ConnectCount | uint64 | 连接次数 |
| TimeoutCount | uint64 | 连接超时断开次数 |
| RecvErrCount | uint64 | 连接出现接收错误次数 |
| CloseCount | uint64 | 连接关闭次数 |
| InBytes | uint64 | 接收字节数 |
| InPackets | uint64 | 接收包数 |
| InPacketsLost | uint64 | 接收丢失包数 |
| OutBytes | uint64 | 发送字节数 |
| OutPackets | uint64 | 发送包数 |
| OutPacketsLost | uint64 | 发送丢失包数 |
| ServerIP | string | 服务器所对应的BUSIP |
| IdcID | uint32 | idc ID |
| RoomId | biguint | 房间id |
| DsaIP | string | DSA的IP地址 |
| PlayerCount | uint32 | 玩家数量 |
| RefuseLoginCount | uint32 | 拒绝玩家登陆的次数 |
| DsVersion | string | DS版本号 |

---

### 69. PlayerLobbyConn

- **描述**: 玩家lobby网络统计，保留一个月
- **字段数**: 38
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| ClientIP | uint32 | 玩家ip |
| ClientIPStr | string | 玩家ip(点分十进制) |
| ClientISP | uint32 | 玩家运营商 |
| ClientISPStr | string | 玩家运营商字符串 |
| ClientCountry | uint32 | 玩家国家 |
| ClientCountryStr | string | 玩家国家字符串 |
| ClientProvince | uint32 | 玩家省份 |
| ClientProvinceStr | string | 玩家省份字符串 |
| ClientCity | uint32 | 玩家城市 |
| ClientCityStr | string | 玩家城市字符串 |
| ClientRegion | uint32 | 玩家区县 |
| ClientRegionStr | string | 玩家区县字符串 |
| LobbyIP | uint32 | 大厅ip |
| LobbyIPStr | string | 大厅ip(点分十进制) |
| LobbyISP | uint32 | 大厅运营商 |
| LobbyISPStr | string | 大厅运营商字符串 |
| LobbyCountry | uint32 | 大厅国家 |
| LobbyCountryStr | string | 大厅国家字符串 |
| LobbyProvince | uint32 | 大厅省份 |
| LobbyProvinceStr | string | 大厅省份字符串 |
| LobbyCity | uint32 | 大厅城市 |
| LobbyCityStr | string | 大厅城市字符串 |
| LobbyRegion | uint32 | 大厅区县 |
| LobbyRegionStr | string | 大厅区县字符串 |
| MaxRtt | uint32 | 客户端心跳的最大Rtt |
| MinRtt | uint32 | 客户端心跳的最小Rtt |
| AvgRtt | uint32 | 客户端心跳的平均Rtt |
| HeartbeatCnt | uint32 | 客户端心跳次数 |
| HeartbeatLossCnt | uint32 | 客户端心跳丢包数(不准确 可能是息屏导致的) |
| BssId | string | 客户端连的WIFI路由的ID |

---

### 70. PlayerSelectedSchemeInfo

- **描述**: 玩家选择预设数据记录
- **字段数**: 62
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| GameMode | int | (必填)游戏模式 详见MatchGameTypeEnums |
| ModeType | int | (必填)模式ID  详见MatchModeTypeEnums |
| MapID | int | (必填)地图ID |
| DungeonID | int | (必填)副本ID |
| SelectedSchemeID | int | (必填)选择预设方案ID |
| WeaponID1 | string | (必填)1号武器槽位武器ID |
| WeaponID2 | string | (必填)2号武器槽位武器ID |
| WeaponID3 | string | (必填)3号武器槽位武器ID |
| RolePropID | string | (必填)角色ID |
| WarframeID1 | string | (废弃)1号核芯槽位核芯ID |
| WarframeID2 | string | (废弃)2号核芯槽位核芯ID |
| WarframeID3 | string | (废弃)3号核芯槽位核芯ID |
| WarframeID4 | string | (废弃)4号核芯槽位核芯ID |
| WarframeID5 | string | (废弃)5号核芯槽位核芯ID |
| WarframeID6 | string | (废弃)6号核芯槽位核芯ID |
| StructuralWeaponID | string | (废弃)构型武器ID |
| RoomID | biguint | (必填)房间ID |
| ReportType | int | (必填)上报类型，开局1/结算2/切换预设方案3/更换槽位道具4/玩家登出5/装备赛季技能6 |
| Weapon1MGE | string | (废弃)1号武器槽位装配MGE，格式：MgeId1:MgeConfigId2,MgeId2:MgeConfigId2 |
| Weapon2MGE | string | (废弃)2号武器槽位装配MGE，格式：MgeId1:MgeConfigId2,MgeId2:MgeConfigId2 |
| Weapon3MGE | string | (废弃)3号武器槽位装配MGE，格式：MgeId1:MgeConfigId2,MgeId2:MgeConfigId2 |
| Warframe1MGE | string | (废弃)1号战甲槽位装配被动技能，格式：id:level |
| Warframe2MGE | string | (废弃)2号战甲槽位装配被动技能，格式：id:level |
| Warframe3MGE | string | (废弃)3号战甲槽位装配被动技能，格式：id:level |
| Warframe4MGE | string | (废弃)4号战甲槽位装配MGE，格式：MgeId:MgeConfigId |
| Warframe5MGE | string | (废弃)5号战甲槽位装配MGE，格式：MgeId:MgeConfigId |
| Warframe6MGE | string | (废弃)6号战甲槽位装配MGE，格式：MgeId:MgeConfigId |
| WarframeSuitMGE | string | (废弃)战甲套装装配MGE，格式：MgeId1:MgeConfigId1,MgeId2:MgeConfigId2 - 暂时不用，报空 |
| Warframe1RandAttr | string | (废弃)1号战甲槽位装配随机属性，格式：AttrId1:AttrValue1;AttrId2:AttrValue2;... |
| Warframe2RandAttr | string | (废弃)2号战甲槽位装配随机属性，格式：AttrId1:AttrValue1;AttrId2:AttrValue2;... |
| Warframe3RandAttr | string | (废弃)3号战甲槽位装配随机属性，格式：AttrId1:AttrValue1;AttrId2:AttrValue2;... |
| Warframe1Score | uint64 | (废弃)1号战甲槽位装配评分 |
| Warframe2Score | uint64 | (废弃)2号战甲槽位装配评分 |
| Warframe3Score | uint64 | (废弃)3号战甲槽位装配评分 |
| SchemeTabType | int | (必填)预设方案页签类型，PVE1 PVP2 |
| SchemeID | int | (必填)预设方案ID |
| ScoreSum | uint64 | (必填)预设方案总评分 |
| Weapon1Score | uint64 | (废弃)1号武器槽位装配评分 |
| Weapon2Score | uint64 | (废弃)2号武器槽位装配评分 |
| Weapon3Score | uint64 | (废弃)3号武器槽位装配评分 |
| Weapon1GID | uint64 | (必填)1号武器槽位武器GID |
| Weapon2GID | uint64 | (必填)2号武器槽位武器GID |
| Weapon3GID | uint64 | (必填)3号武器槽位武器GID |
| Warframe1GID | uint64 | (废弃)1号核芯槽位核芯GID |
| Warframe2GID | uint64 | (废弃)2号核芯槽位核芯GID |
| Warframe3GID | uint64 | (废弃)3号核芯槽位核芯GID |
| Weapon1ModuleList | string | (必填)1号武器槽位装配插件，格式：ItemId1;ItemId2;ItemId3;ItemId4 |
| Weapon2ModuleList | string | (必填)2号武器槽位装配插件，格式：ItemId1;ItemId2;ItemId3;ItemId4 |
| SeasonSkillID | uint64 | (必填)赛季技能ID |
| SeasonTalentList | string | (必填)赛季技能天赋数据列表，格式：TalentID1,Level1;TalentID2,Level2;...;TalentIDn,Leveln; |
| SkillTalentLevelSum | uint32 | (必填)生效赛季技能天赋总等级 |
| GeneralTalentLevelSum | uint32 | (必填)生效赛季通用天赋总等级 |

---

### 71. PlayerDSChangeSchemeFlow

- **描述**: 玩家局内切换预设流水
- **字段数**: 109
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| DungeonID | int | (必填)副本ID |
| RoomID | biguint | (必填)房间ID |
| ChangeTimeSec1 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID1 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID1 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec2 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID2 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID2 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec3 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID3 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID3 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec4 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID4 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID4 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec5 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID5 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID5 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec6 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID6 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID6 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec7 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID7 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID7 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec8 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID8 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID8 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec9 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID9 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID9 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec10 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID10 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID10 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec11 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID11 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID11 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec12 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID12 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID12 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec13 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID13 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID13 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec14 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID14 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID14 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec15 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID15 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID15 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec16 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID16 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID16 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec17 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID17 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID17 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec18 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID18 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID18 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec19 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID19 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID19 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec20 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID20 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID20 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec21 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID21 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID21 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec22 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID22 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID22 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec23 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID23 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID23 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec24 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID24 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID24 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec25 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID25 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID25 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec26 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID26 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID26 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec27 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID27 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID27 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec28 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID28 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID28 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec29 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID29 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID29 | int | (必填)切换后选择预设方案ID |
| ChangeTimeSec30 | int | (必填)切换预设方案时间戳，单位：秒 |
| BeforeSchemeID30 | int | (必填)切换前选择预设方案ID |
| AfterSchemeID30 | int | (必填)切换后选择预设方案ID |
| ChangeCount | int | (必填)切换次数，和策划约定最多统计30次的，多了的丢弃 |
| Scheme1UseTime | int | (必填)预设方案1使用时间，单位：秒 |
| Scheme2UseTime | int | (必填)预设方案2使用时间，单位：秒 |
| Scheme3UseTime | int | (必填)预设方案3使用时间，单位：秒 |
| Scheme4UseTime | int | (必填)预设方案4使用时间，单位：秒 |
| Scheme5UseTime | int | (必填)预设方案5使用时间，单位：秒 |
| Scheme6UseTime | int | (必填)预设方案6使用时间，单位：秒 |

---

### 72. ClientSettingChange

- **描述**: 客户端设置变更流水
- **字段数**: 172
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| HighFrameRateMode | int | 帧率设置：1性能模式、2普通模式、3高帧率模式 |
| FovRange | int | 视角范围：最小45，最大80 |
| RifleAutoLowerSetting | int | 开火后自动落镜（步枪、冲锋枪）：1开启、2关闭 |
| SGAutoLowerSetting | int | 开火后自动落镜（霰弹）：1开启、2关闭 |
| SniperAutoLowerSetting | int | 开火后自动落镜（狙击）：1开启、2关闭 |
| PistolAutoLowerSetting | int | 开火后自动落镜（手枪）：1开启、2关闭 |
| LauncherAutoLowerSetting | int | 开火后自动落镜（发射）：1开启、2关闭 |
| SGFiremode | int | 开火模式（霰弹）：1按下开火、2松手开火 |
| SniperFiremode | int | 开火模式（狙击）：1按下开火、2松手开火 |
| PistolFiremode | int | 开火模式（手枪）：1按下开火、2松手开火 |
| LauncherFiremode | int | 开火模式（发射）：1按下开火、2松手开火 |
| AimAssistSwitch | int | 辅助瞄准：1开启、2关闭 |
| AimMode | int | 开镜模式：1点击开镜、2长按开镜 |
| JumpButtonSetting | int | 跳跃键转向：1开启、2关闭 |
| LiftButtonSetting | int | 开镜键转向：1开启、2关闭 |
| ReloadButtonSetting | int | 换弹键转向：1开启、2关闭 |
| GyroscopeMode | int | 陀螺仪开关：1关闭、2总是开启、3开镜开启、4开火开启 |
| GyroscopeHorizontalReversal | int | 陀螺仪水平反向：1开启、2关闭 |
| GyroscopeVerticalReverse | int | 陀螺仪垂直反向：1开启、2关闭 |
| ModeTypeElection | int | 自定义方案选择：1方案一号、2方案二号、3方案三号 |
| MechaModeTypeElection | int | 方案选择：4方案一号（机甲）、5方案二号（机甲）、6方案三号（机甲） |
| GlobalShootMode | int | 全局射击模式：1一键举镜、2腰射、3自动开火、4自定义 |
| AutoFireShowFireBtn | int | 自动开火时显示开火按钮：1开启、2关闭 |
| EnableFixedAreaDoFInAim | int | 枪械开镜景深模糊：1开启、2关闭 |
| LimitAutoShootDistance | int | 限制腰射自动开火距离：1开启、2关闭 |
| RifleShootMode | int | 步枪射击模式：1一键开镜开火、2腰射、3自动开火 |
| SniperShootMode | int | 狙击枪射击模式：1一键开镜开火、2腰射、3自动开火 |
| SGShootMode | int | 霰弹枪射击模式：1腰射、2自动开火 |
| RLauncherShootMode | int | 火箭发射器射击模式：1腰射、2自动开火 |
| SubmachineShootMode | int | 冲锋枪射击模式：1一键开镜开火、2腰射、3自动开火 |
| MGShootMode | int | 机枪射击模式：1一键开镜开火、2腰射、3自动开火 |
| PistolShootMode | int | 手枪射击模式：1一键开镜开火、2腰射、3自动开火 |
| GLauncherShootMode | int | 榴弹发射器射击模式：1一键开镜开火、2腰射、3自动开火 |
| LaserShootMode | int | 激光武器射击模式：1一键开镜开火、2腰射、3自动开火 |
| MechaShootMode | int | 机甲武器射击模式：1腰射、2自动开火 |
| TotalVolume | int | 总音量：最小0，最大100 |
| BGMVolume | int | 音乐音量：最小0，最大100 |
| EffectVolume | int | 音效音量：最小0，最大100 |
| TurnSpeedModeContent | int | 转向加速度方式：1固定速度、2速度加速 |
| GlobalSensiSpeed | int | 全局灵敏度：最小20，最大300 |
| TurnSensiSpeed | int | 转向速度：最小20，最大200 |
| ScreenSlidingTurnSensiAimSpeedLowRatio | int | 开镜转向速度（低倍镜）：最小0，最大300 |
| ScreenSlidingTurnSensiAimSpeedMidRatio | int | 开镜转向速度（中倍镜）：最小0，最大300 |
| ScreenSlidingTurnSensiAimSpeedHighRatio | int | 开镜转向速度（高倍镜）：最小0，最大300 |
| FireSensiSpeed | int | 射击转向速度：最小20，最大200 |
| ScreenSlidingFireSensiAimSpeedLowRatio | int | 开镜射击转向速度（低倍镜）：最小0，最大300 |
| ScreenSlidingFireSensiAimSpeedMidRatio | int | 开镜射击转向速度（中倍镜）：最小0，最大300 |
| ScreenSlidingFireSensiAimSpeedHighRatio | int | 开镜射击转向速度（高倍镜）：最小0，最大300 |
| GyroscopeGlobalSensiSpeed | int | 陀螺仪全局灵敏度：最小0，最大300 |
| GyroscopeHorizontalSensiSpeed | int | 陀螺仪水平方向灵敏度：最小0，最大300 |
| GyroscopeVerticalSensiSpeed | int | 陀螺仪垂直方向灵敏度：最小0，最大300 |
| GyroscopeTurnSensiSpeed | int | 陀螺仪转向速度：最小0，最大300 |
| GyroscopeFireSensiSpeed | int | 陀螺仪射击转向速度：最小0，最大300 |
| GyroscopeTurnSensiAimSpeedLowRatio | int | 陀螺仪开镜转向速度（低倍镜）：最小0，最大300 |
| GyroscopeFireSensiAimSpeedLowRatio | int | 陀螺仪开镜射击转向速度（低倍镜）：最小0，最大300 |
| GyroscopeTurnSensiAimSpeedMidRatio | int | 陀螺仪开镜转向速度（中倍镜）：最小0，最大300 |
| GyroscopeFireSensiAimSpeedMidRatio | int | 陀螺仪开镜射击转向速度（中倍镜）：最小0，最大300 |
| GyroscopeTurnSensiAimSpeedHighRatio | int | 陀螺仪开镜转向速度（高倍镜）：最小0，最大300 |
| GyroscopeFireSensiAimSpeedHighRatio | int | 陀螺仪开镜设计转向速度（高倍镜）：最小0，最大300 |
| ScreenQuality | int | 画质设置：1流畅、2标准、3精致、4高清、5极致、6自定义 |
| TurnAccelSpeedModeFactor | int | 加速度值 |
| DMRShootMode | int | 射手步枪射击模式 |
| AutoGLauncherShootMode | int | 连发榴弹射击模式 |
| BowShootMode | int | 弓箭射击模式 |
| BlasterShootMode | int | 喷射器射击模式 |
| MeleeShootMode | int | 近战武器射击模式 |
| GrenadeShootMode | int | 投掷物射击模式 |
| FireInterruptReload | int | 开火打断换弹 |
| AutoLiftFireSetting | int | 一键举镜立即开火 |
| OneClickSwitchWeaponButton | int | 一键切枪按钮 |
| OneClickSwitchWeaponRule | int | 切枪规则 |
| SMGAutoLowerSetting | int | 开火后自动落镜（冲锋枪） |
| DMRAutoLowerSetting | int | 开火后自动落镜（射手步枪） |
| MGAutoLowerSetting | int | 开火后自动落镜（机枪） |
| GLauncherAutoLowerSetting | int | 开火后自动落镜（单发榴弹） |
| AutoGLauncherAutoLowerSetting | int | 开火后自动落镜（连发榴弹） |
| LaserAutoLowerSetting | int | 开火后自动落镜（激光武器） |
| BowAutoLowerSetting | int | 开火后自动落镜（弓箭） |
| GLauncherFiremode | int | 开火方式设置（单发榴弹） |
| AutoGLauncherFiremode | int | 开火方式设置（连发榴弹） |
| DMRFiremode | int | 开火方式设置（射手步枪） |
| FrontendViewType | int | 局内/局外 1局外 2局内 |
| SummonMechaType | int | 机甲召唤方式 1点击后松手召唤 2点击后选点召唤 |
| TacticalSkillReleaseMethod | int | 追猎技能释放方式  1点击后选点释放 2点击后立即释放 |
| ShowGunPerformButton | int | 显示鉴枪按钮 1开 2关 |
| SpaceWarEnableRoll | int | 太空站开启翻滚 1开 2关 |
| HuntingGroundEnableKillText | int | 显示连杀勋章和连杀UI（猎场模式） 1开 2关 |
| TowerDefenseEnableKillText | int | 显示连杀勋章和连杀UI（追猎模式） 1开 2关 |
| SpaceEnableKillText | int | 显示连杀勋章和连杀UI（塔防模式） 1开 2关 |
| TowerDefenseEnableCoinText | int | 塔防模式获得金币跳字 1开 2关  |
| PVPDamageEffectVisible | int | PVP模式伤害跳字 1开 2关 |
| ShowHpAndShieldNumber | int | 血条和护盾条显示数值 1开 2关 |
| SmallMapDirection | int | 小地图方向（非塔防模式）1随玩家朝向旋转 2始终不变 |
| TowerDefenseSmallMapDirection | int | 小地图方向（塔防模式）1随玩家朝向旋转 2始终不变 |
| SmallMapCenter | int | 小地图中心（非塔防模式） 1玩家位置 2始终固定 |
| TowerDefenseSmallMapCenter | int | 小地图中心（塔防模式） 1玩家位置 2始终固定 |
| TowerDefenseSmallMapDisplayType | int | 小地图形状（塔防模式）1圆形 2方形 |
| PVPMechaSmallMapDisplayType | int | 小地图形状（机甲战模式） 1圆形 2方形 |
| TreasureStorageSetting | int | 获得宝箱时自动存储 1自动存储 2自动开启 |
| AutoFireDelayTimeScale | float | 自动开火等待时间 快中慢 |
| AutoFireInterruptTimeScale | float | 自动开火中断等待时间 快中慢 |
| QualityLevel | int | 画质设置 1流畅 2标准 3精致 4高清 5极致 |
| FpsLevel | int | 帧数设置 1低 2中 3高 4超高 5极限 690帧 |
| AntiAliasing | int | 抗锯齿 1开 2关 |
| MechaFovRange | float | 机甲视角范围 最小70 最大100 |
| MechaCamSwitcherType | int | 机甲视角切换方案 1三种视角切换 2第一/三人称居中 3第一/三人称偏左 |
| VoiceVolume | int | 语音音量 最小0 最大100 |
| DolbySound | int | 杜比音效 1开 2关 |
| MicVolume | int | 麦克风音量 最小0 最大100 |
| ReceiverVolume | int | 听筒音量 最小0 最大100 |
| AllowStrangerFriend | int | 允许陌生人好友申请 1开 2关 |
| MuteOnMinimize | int | 游戏最小化时静音 1开 2关 |
| SuperSamplingQuality | int | 超分辨质量 1质量 2平衡 3性能 |
| SuperSamplingEnable | int | 超分辨率方法 1关闭 2DLSS 3FSR2 |
| AnimationQuality | int | 动画质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| FogQuality | int | 体积雾质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| PostprocessQuality | int | 后处理质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| ShadowQuality | int | 阴影质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| TextureStreamingQuality | int | 流送质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| TextureStreamingPoolSize | int | 纹理质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| ShaderQuality | int | 着色器质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| GIQuality | int | 全局光照质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| FocusDOF | int | 聚焦景深 1开 2关 |
| LODDistance | int | 场景视距 1自动 2流畅 3标准 4精致 5高清 6极致 |
| DetailMode | int | 场景细节 1自动 2流畅 3标准 4精致 5高清 6极致 |
| RefractionQuality | int | 扭曲质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| ParticleQuality | int | 粒子效果质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| AOQuality | int | 环境遮蔽质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| TextureFilterQuality | int | 纹理过滤质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| ReflectionQuality | int | 反射质量 1自动 2流畅 3标准 4精致 5高清 6极致 |
| AntiAliasingEnable | int | 抗锯齿方法 1TAA 2关闭 |
| MotionBlur | int | 全屏动态模糊 1开启 2关闭 |
| VerticalSync | int | 垂直同步 1开启 2关闭 |
| PCBackFpsLevel | int | 后台帧数 |
| PCLobbyFpsLevel | int | 局外帧数 |
| DisplayRegionRatio | int | 显示区域宽高比 |
| Brightness | int | 亮度调节 |
| RenderRefreshRate | int | 屏幕刷新率 |
| RenderResolution | int | 分辨率 |
| RenderMode | int | 显示模式 |
| RenderUsingGPU | int | 显示适配器 |
| RenderUsingMonitor | int | 显示器 |
| MouseFireSensiAimSpeed_HighRatio | int | 开镜射击转向速度（高倍镜） |
| MouseFireSensiAimSpeed_MidRatio | int | 开镜射击转向速度（中倍镜） |
| MouseFireSensiAimSpeed_LowRatio | int | 开镜射击转向速度（低倍镜） |
| MouseFireSensiSpeed | int | 射击转向速度 |
| MouseTurnSensiAimSpeed_HighRatio | int | 开镜转向速度（高倍镜） |
| MouseTurnSensiAimSpeed_MidRatio | int | 开镜转向速度（中倍镜） |
| MouseTurnSensiAimSpeed_LowRatio | int | 开镜转向速度（低倍镜） |
| MouseTurnSensiSpeed | int | 转向速度 |
| MouseTurnSensiAimRelScreenDistFactor | float | 屏幕距离系数 |
| MouseTurnSensiAimRelSpeed_HighRatio | float | 开镜转向灵敏度（高倍镜） |
| MouseTurnSensiAimRelSpeed_MidRatio | float | 开镜转向灵敏度（中倍镜） |
| MouseTurnSensiAimRelSpeed_LowRatio | float | 开镜转向灵敏度（低倍镜） |
| MouseAimSpeedModeContent | int | 开镜灵敏度类型 |
| MouseHorizontalSensiSpeed | int | 水平灵敏度 |
| MouseVerticalSensiSpeed | int | 垂直灵敏度 |
| MouseGlobalSensiSpeed | int | 全局灵敏度 |
| MouseResolutionAdaptingSensitivity | int | 灵敏度绑定分辨率 |
| MouseSensiChangeMode | int | 灵敏度切换模式 |
| StationaryMovementButton | int | 固定摇杆 1固定 0非固定 |
| MechaStationaryMovementButton | int | 机甲是否固定摇杆 1固定 0非固定 |
| UseWeaponItemMvpSetting | int | 武器栏是否居中 1居中 0不居中 |

---

### 73. WeaponUIStat

- **描述**: 武器界面点击率
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| ButtonStat | string | 所有按键的统计，各按键“;”分隔，按键各属性用“,”分隔。属性有：按键名,点击次数 |

---

### 74. HUDSettingChange

- **描述**: 自定义HUD设置变更流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| HudIndex | int | 配置变更的HUD序号，1~3为玩家模式，4~6为机甲模式 |
| NewSetting | string | 所有按键的配置，各按键“;”分隔，按键各属性用“,”分隔。属性有：按键名,区域(1:左上 2:左下 3:右上 4:右下),大小(相对默认大小的百分比50~200),透明度(0~100),是否禁用(0或1),是否隐藏(0或1) |

---

### 75. PlayerHUDOperationFlow

- **描述**: 玩家按键操作流水，按键状态变化时上报之前按键组合的数据。由于上报极其频繁，只限制白名单玩家开启，白名单由IDIP接口SetHUDOperationReport来控制（可在nzsvr.woa.com配置）
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| RoomId | uint64 | 房间id |
| iModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| iDungeonID | int | 副本ID。目前只针对副本场景上报 |
| DungeonType | string | 副本类型 |
| DungeonName | string | 副本名称 |
| KeyCombination | string | 之前的按键组合，多个按键用+分隔，比如边移动边开火“Move+Fire” |
| Duration | uint32 | 之前按键组合持续时长，毫秒 |

---

### 76. LittlePackageDownload

- **描述**: 小包下载
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| ModuleKey | string | 用于标识下载的是哪个小包 |
| DownloadStatus | int | 1表示开始下载，2表示下载完成 |
| DownloadTrigger | int | 触发类型：1界面内下载, 2下载中心下载, 3自动下载 |

---

### 77. ASAIadinfo

- **描述**: 苹果商店买量ASA信息的采集上报
- **字段数**: 29
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| Attribution | int | 归因值。是否从 AppStore 搜索广告下载。请上报 0 (对应 API 返回 false) 或 1 (对应 API 返回 true) |
| OrgID | int | 拥有该广告系列的组织标识符。orgId 与Apple Ads用户界面中的帐户相同 |
| CampaignID | int | 广告系列的唯一标识符 |
| ConversionType | string | 用户转化类型： download或redownload |
| claimType | string | 归因类型：Impression（展示归因）/Click（点击归因）经浏览展示归因：claimType = Impression，表示用户在过去24小时内浏览了相应的 Apple Ads广告系列中的广告但未点击。经点击归因：claimType=Click，表示用户点击了广告。请注意，点击归因窗口为 30 天，且点击归因优先于曝光归因。若ASA只想统计点击归因用户转化效果，必须上报该字段。限制：请注意，带有年龄和性别定向的广告系列不支持经浏览展示归因。 |
| ClickDate | string | 用户点击广告系列中的广告的日期和时间。此字段仅出现在详细归因结果记录中。只有接入苹果ATT框架的app，且用户开启了“app跟踪同意”的情况下，才可获取该字段信息。接入ATT框架的app可选，未接入ATT框架的app上报为空 |
| impressionDate | string | 在Apple Ads中广告展示发生的日期和时间。此字段仅出现在经浏览详细归因记录中。只有接入苹果ATT框架的app，且用户开启了“app跟踪同意”的情况下，才可获取该字段信息接入ATT框架的app可选，未接入ATT框架的app上报为空 |
| AdgroupID | int | 广告组的标识符 |
| CountryOrRegion | string | 广告系列的国家或地区 |
| KeywordID | int | 关键字的标识符。请注意，当启用搜索匹配时，API 不会在归因响应中返回keywordId |
| AdId | int | 表示广告对象和广告组之间分配关系的标识符 |
| OrgName | string | 基于 Apple Search Ads 业务场景，记录广告系列组名称。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| CampaignName | string | 基于 Apple Search Ads 业务场景，记录广告系列名称。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| AdgroupName | string | 基于 Apple Search Ads 业务场景，记录广告组名称。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| Keyword | string | 基于 Apple Search Ads 业务场景，记录搜索关键词。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| KeywordMatchtype | string | 基于 Apple Search Ads 业务场景，记录广告关键词匹配类型。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| CreativesetID | string | 已弃用，2023年更新为 AdService Framework 的 adid 字段 |
| CreativesetName | string | 基于 Apple Search Ads 业务场景，记录 Creative Set 名称。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| PurchaseDate | string | 基于 Apple Search Ads 业务场景，记录用户首次下载时间。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |
| ConversionDate | string | 基于 Apple Search Ads 业务场景，记录用户下载时间。AdService Framework 无对应字段，若通过此 API 请求，则上报空值 |

---

### 78. ActivityFlow

- **描述**: 玩家活动完成流水，保留一个月
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| ActivityName | string | 活动名称 |
| ActivityId | biguint | 活动id |
| RefreshPeriodType | uint32 | 刷新类型 2日刷新 3周刷新 |
| ListenerGid | biguint | 监听器的GID |
| ListenerRegisterTime | datetime | 监听器注册时间，格式 YYYY-MM-DD HH:MM:SS |

---

### 79. ActivityCenterTaskFlow

- **描述**: 活动中心任务参与流水
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | uint64 | 活动ID |
| TaskId | uint32 | 任务ID |
| Reason | uint32 | 变更原因(0.接取任务 1.完成任务 2.领奖) |
| MainId | uint32 | 任务总ID |
| GroupId | uint32 | 任务组ID |
| StageId | uint32 | 任务阶段ID |

---

### 80. HunterMissionStatusChange

- **描述**: 猎场周期活动任务状态变更
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| MissionId | uint32 | 任务id |
| IsAchieved | int | 是否完成 |

---

### 81. PlayerBeginnerGuideFlow2

- **描述**: 玩家新手引导完成情况流水
- **字段数**: 18
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| iLevel | int | (必填)等级 |
| GuideId | uint32 | 引导编号 |
| Result | int32 | 结果：0表示正常完成，其它见EBeginnerGuideCompleteResult |
| StepId | uint32 | 步骤ID，仅非正常完成时有效 |
| Duration | uint32 | 完成用时 |
| IsExtraData | int | 该条Log是否用来上报引导额外信息 |
| SelectFireMode | uint32 | 玩家选择的开火模式偏好 |
| SelectHUDLayout | uint32 | 玩家选择的HUD布局偏好 |
| IsVeteranPlayer | int | 是否为老玩家 |
| cloud_gaming_type | int | 云游戏类型。0:不是云游戏, 1:适配PC类型, 2:适配H5类型, 3:适配APP类型, 4:微信小游戏 |

---

### 82. VeteranPlayerSkipBeginnerGuide

- **描述**: 老手跳过新手历程
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | (必填)环境名 |
| iLevel | int | (必填)等级 |
| SkipGuidesCnt | int | 跳过引导的数量 |

---

### 83. RookieMissionStatusChange

- **描述**: 新手5日活跃任务状态变更
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| GroupId | uint32 | 任务组id |
| MissionId | uint32 | 任务id |
| IsAchieved | int | 是否完成 |
| IsAwarded | int | 是否领奖 |

---

### 84. RookieMissionClick

- **描述**: 新手5日活跃任务点击
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| GroupId | uint32 | 任务组id |
| MissionId | uint32 | 任务id |
| ClickType | int | 点击类型:1.前往, 2.查看 |

---

### 85. PlayerFuncUnlock

- **描述**: 功能解锁流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | (必填)环境名 |
| iLevel | int | (必填)等级 |
| UnlockFuncIds | string | 新解锁ID列表 |
| RelockFuncIds | string | 重新上锁ID列表 |

---

### 86. PlayerAchievementInfo

- **描述**: 玩家成就信息表，玩家完成/领取某一个成就之后上报，以玩家的PlayerID为上报Key
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| AchievementId | int | 成就ID |
| Action | int | 0=成就完成 1=领取成就奖励 2=获得徽章 3=设置徽章上墙 4=获得称号 5=佩戴称号 |
| Abnormal | int | 0=成就正常完成 1=关注的监听器不在通知列表中，视为任务已完成。Action==0时有效 |
| BadgeIDList | string | 徽章ID列表 |
| TitleID | uint64 | 称号ID |

---

### 87. PlayerAchAndTitlePageInfo2

- **描述**: 玩家成就和称号页面访问次数
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| Env | string | 服务器环境 |
| iLevel | int | (必填)等级 |
| TitlePageCount | int | 称号页签访问 |
| TitleChangeCount | int | 称号更换 |
| AchEditPageCount | int | 成就编辑界面访问 |
| CareerAchPageCount | int | 生涯成就界面访问 |
| BadgePopCount | int | 单个徽章弹窗 |

---

### 88. PlayerDFlow

- **描述**: 玩家DFlow流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| DFlowAssetName | string | DFlow资源名称 |
| DFlowNodeIndex | int | 同一DFlow中的顺序号 |
| IsJump | int | 是否跳过 |

---

### 89. PlayerTeamInfoData

- **描述**: 玩家组队状态表
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| TeamID | string | 队伍ID |
| Operate | int | 0=入队 1=出队 |
| MatchType | int | 赛事类型 bind with PVP匹配赛 = 1 PVP排位赛 = 2 |
| CreateTeamType | int | 创建队伍的方式 0 = 邀请好友创建 1 = 自行创建 |
| Count | int | 队伍人数 |

---

### 90. RoomMatchAllocStart

- **描述**: 玩家开始匹配副本
- **字段数**: 25
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| GameMode | int | (必填)游戏模式 详见MatchGameTypeEnums |
| ModeType | int | (必填)模式ID  详见MatchModeTypeEnums |
| MapID | int | 地图ID |
| TeamID | string | (必填)队伍ID |
| DungeonID | int | (必填)副本ID |
| AllocType | int | (必填)入队类型 正常发起匹配 0/受邀加入队伍 1 |
| MatchType | int | (必填)赛事类型，PVE都为0 PVP匹配赛1 PVP排位赛2 PVE猎场竞速排位赛3 |
| RankLevel | int | PVP比赛和PVE猎场竞速排位赛中玩家的排位等级，其余赛事时为0 |
| EloScore | int | PVP比赛和PVE猎场竞速排位赛中玩家的隐藏分，其余赛事时为0 |
| WarmLevel | int | PVP比赛和PVE猎场竞速排位赛中玩家的温暖等级，其余赛事时为0 |
| IsConfirmMatch | int | PVP比赛和PVE猎场竞速排位赛中玩家是否为定级赛，其余赛事时为0 |
| TeamApplySource | int | 入队来源，0 好友/1 世界聊天/2 组队平台/3 创建队伍 |
| SeasonID | int | (必填)赛季ID |
| IsAllowedHalfJoin | int | (必填)是否允许中途加入，0 不允许/1 允许 |
| MatchAllocID | bigint | (必填)匹配ID，使用玩家开始匹配时的时间戳作为该玩家的唯一匹配ID |

---

### 91. RoomMatchAllocResult

- **描述**: 玩家匹配副本结果
- **字段数**: 28
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| GameMode | int | (必填)游戏模式 详见MatchGameTypeEnums |
| ModeType | int | (必填)模式ID  详见MatchModeTypeEnums |
| MapID | int | 地图ID |
| TeamID | string | (必填)队伍ID |
| Result | int | (必填)结果 成功 0/匹配超时 1/取消匹配 2 |
| RoomID | string | (必填)匹配成功时的房间ID |
| MatchTime | int | (必填)匹配时长，单位为毫秒 |
| DungeonID | int | (必填)副本ID |
| TeamMemberNum | int | (必填)队伍人数 |
| StartMatchType | int | (必填)开赛类型 未开赛 -1/满员开赛 0/人数不足提前开赛 1/中途加入已开赛单局 2/中途邀请玩家进入副本 3 |
| MatchType | int | (必填)赛事类型，PVE都为0 PVP匹配赛1 PVP排位赛2 PVE猎场竞速排位赛3 |
| RankLevel | int | PVP比赛和PVE猎场竞速排位赛中玩家的排位等级，其余赛事时为0 |
| EloScore | int | PVP比赛和PVE猎场竞速排位赛中玩家的隐藏分，其余赛事时为0 |
| WarmLevel | int | PVP比赛和PVE猎场竞速排位赛中玩家的温暖等级，其余赛事时为0 |
| IsConfirmMatch | int | PVP比赛和PVE猎场竞速排位赛中玩家是否为定级赛，其余赛事时为0 |
| RankScore | int | PVP比赛和PVE猎场竞速排位赛中玩家的排位分，其余赛事时为0 |
| SeasonID | int | (必填)赛季ID |
| MatchAllocID | bigint | (必填)匹配ID，使用玩家开始匹配时的时间戳作为该玩家的唯一匹配ID |

---

### 92. RoomMatchStartMatchPlayerAndBotNum

- **描述**: 匹配开赛的总人数和Bot数
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| GameMode | int | (必填)游戏模式 详见MatchGameTypeEnums |
| ModeType | int | (必填)模式ID  详见MatchModeTypeEnums |
| DungeonID | int | (必填)副本ID |
| RoomID | string | (必填)匹配成功时的房间ID |
| TotalPlayerNum | int | (必填)总人数(真人+Bot) |
| BotPlayerNum | int | (必填)Bot数 |

---

### 93. CreateUnion

- **描述**: 创建工会
- **字段数**: 24
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| UnionRole | uint32 | 职位 |
| BeforeNum | uint32 | 操作前公会人数 |
| AfterNum | uint32 | 操作后公会人数 |
| UnionDeclaration | string | 公会宣言 |
| UnionType | uint32 | 公会类型 |
| UnionTag | string | 公会标签 格式:tagId1;tagId2;... |
| JoinMode | uint32 | 公会审批类型 |
| RegularDay | int32 | 常在日期 |
| RegularTime | int32 | 常在时段 |
| PrefGameMode | int32 | 偏好模式 |
| PrefPlayMode | int32 | 偏好打法 |
| Area | string | 所在地 |

---

### 94. ModifyUnion

- **描述**: 修改公会信息
- **字段数**: 31
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 公会id |
| UnionName | string | 公会名称 |
| UnionRole | uint32 | 职位 |
| BeforeDeclaration | string | 修改前公会宣言 |
| AfterDeclaration | string | 修改后公会宣言 |
| BeforeType | uint32 | 修改前公会类型 |
| AfterType | uint32 | 修改后公会类型 |
| BeforeTag | string | 修改前公会标签 格式:tagId1;tagId2;... |
| AfterTag | string | 修改后公会标签 格式:tagId1;tagId2;... |
| BeforeJoinMode | uint32 | 修改前公会审批类型 |
| AfterJoinMode | uint32 | 修改后公会审批类型 |
| BeforeRegularDay | int32 | 修改前常在日期 |
| AfterRegularDay | int32 | 修改后常在日期 |
| BeforeRegularTime | int32 | 修改前常在时段 |
| AfterRegularTime | int32 | 修改后常在时段 |
| BeforePrefGameMode | int32 | 修改前偏好模式 |
| AfterPrefGameMode | int32 | 修改后偏好模式 |
| BeforePrefPlayMode | int32 | 修改前偏好打法 |
| AfterPrefPlayMode | int32 | 修改后偏好打法 |
| BeforeArea | string | 修改前所在地 |
| AfterArea | string | 修改后所在地 |

---

### 95. ApplyJoinUnion

- **描述**: 申请加入工会
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| UnionRole | uint32 | 职位 |
| BeforeNum | uint32 | 操作前公会人数 |
| AfterNum | uint32 | 操作后公会人数 |

---

### 96. JoinUnion

- **描述**: 加入工会
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| UnionRole | uint32 | 职位 |
| BeforeNum | uint32 | 操作前公会人数 |
| AfterNum | uint32 | 操作后公会人数 |
| UnionType | uint32 | 公会类型 |
| UnionTag | string | 公会标签 格式:tagId1;tagId2;... |

---

### 97. QuitUnion

- **描述**: 退出工会
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| UnionRole | uint32 | 职位 |
| BeforeNum | uint32 | 操作前公会人数 |
| AfterNum | uint32 | 操作后公会人数 |
| UnionType | uint32 | 公会类型 |
| UnionTag | string | 公会标签 格式:tagId1;tagId2;... |

---

### 98. AppointOrRemoveMemberRole

- **描述**: 工会职位变动
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| SrcRole | uint32 | 变动前的职位 |
| DstRole | uint32 | 变动后的职位 |
| OpPlayerId | biguint | 发起变更的玩家id |

---

### 99. DismissUnion

- **描述**: 工会解散
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| UnionId | biguint | 工会id |
| UnionName | string | 工会名称 |
| UnionRole | uint32 | 职位 |
| BeforeNum | uint32 | 操作前公会人数 |
| AfterNum | uint32 | 操作后公会人数 |

---

### 100. UnionGroupFlow

- **描述**: 社团群流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| UnionId | biguint | 工会id |
| UnionNum | uint32 | 操作前公会人数 |
| GroupType | int32 | 群聊类型 1=微信 2=QQ 3=iOS 游客 4=fb openid |
| Operate | int32 | 操作类型 0=建立群聊；1=解绑群聊；2=加入群聊 |

---

### 101. SecTalkFlow

- **描述**: 聊天信息发送日志
- **字段数**: 34
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本 |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| vClientIP | string | (可填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| iLevel | int | (可填)等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| vHeadUrl | string | (可填)玩家角色头像URL |
| ReceiverOpenID | string | (可填)接收方OPENID号/GOPENID号 |
| ReceiverPlatID | int | (可填)接收方PlatID 0:ios,1:android,2:PC,12:鸿蒙 |
| ReceiverAreaID | int | (可填)接收方微信 1 /手Q 2 /游客 3 |
| ReceiverZoneAreaID | int | (可填)接收方针对分区分服的游戏填写分区id，用来唯一标示一个区；非分区分服游戏请填写0 |
| ReceiverRoleID | string | (必填)接收方角色唯一ID |
| ReceiverRoleName | string | (可填)接收方角色昵称只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如/，\t，\n，\r以及空格，文本复制的回车），则记录时去掉，比如 张/三 记为 张三 |
| SceneID | int | (必填)信息场景类型，1001世界、1002队伍、1003好友私聊、1004组队喊话、1005社团聊天，详见https://ace.woa.com/#/console/service/access-access-flow |
| Contents | string | (必填)信息内容，目前最多能发送单条512字节的信息内容只保留中文字符、英文和数字。如果内容中带有影响结构的特殊字符（比如/，\t，\n，\r以及空格，文本复制的回车），则记录时去掉，比如 张/三 记为 张三 |
| MsgType | int | (必填)聊天信息类型，0 为文字信息，1 为语音信息（音转文输入后无法听语音则为文字信息，否则为语音信息） |
| SpeechOriginalVoiceID | string | (可填)语音的原始内容fileid或url |
| MsgCharType | int | (必填)点对点聊天角色类型，0非好友，1好友，2非点对点 |
| TemplateSign | int | (必填)该发言是否为系统模板 0否 1是 2部分为系统模板 |
| TotalCash | int | (安全补充)玩家角色累计充值 - 后续有了再报 |
| iGuildID | uint64 | (安全补充)玩家公会ID,没有公会则上报0 |
| vGuildName | string | (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如/或者\t，\n,\r  以及空格），则记录时去掉，比如 张/三 记为 张三 |
| DungeonId | uint64 | (策划需求)副本ID |
| RoomId | uint64 | (策划需求)DS ROOM ID |
| RoundId | int | (策划需求)波次 |

---

### 102. SecEditFlow

- **描述**: 资料编辑日志
- **字段数**: 22
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本 |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| vClientIP | string | (可填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| iLevel | int | (可填)等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| vHeadUrl | string | (可填)玩家角色头像URL |
| SceneID | int | (必填)信息场景类型，101创角、102改名、103创公会、104公会改名、108创建公会宣言、109修改公会宣言、110创建房间名称、111修改房间名称、112创建队伍昵称、113修改队伍昵称、114修改个人签名，详见https://ace.woa.com/#/console/service/access-access-flow |
| Contents | string | (必填)信息内容，目前最多能发送单条512字节的信息内容只保留中文字符、英文和数字。如果内容中带有影响结构的特殊字符（比如/，\t，\n，\r以及空格，文本复制的回车），则记录时去掉，比如 张/三 记为 张三 |
| MsgType | int | (必填)编辑类型，0 为文字信息，1 为语音信息 |
| SpeechOriginalVoiceID | string | (可填)语音的原始内容fileid或url |
| TotalCash | int | (安全补充)玩家角色累计充值 - 较敏感，先不报 |
| CurrencyID | uint64 | (安全补充)(可填)通用ID，使用该ID对同一场景下的不同内容进行识别，将应用于处罚接口，如公会ID、方案ID等 |

---

### 103. SecSNSFlow

- **描述**: 社交操作日志
- **字段数**: 28
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本 |
| AreaID | int | (必填)用户处罚大区ID：1-9为正式服 |
| AccountType | int | (必填)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| vClientIP | string | (必填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| iLevel | int | (必填)等级 |
| iRoleCE | int | (必填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| vHeadUrl | string | (必填)玩家角色头像URL |
| ReceiverOpenID | string | (可填)接收方OPENID号/GOPENID号 |
| ReceiverPlatID | int | (可填)接收方PlatID 0:ios,1:android,2:PC,12:鸿蒙。2008场景不便获取，填-1 |
| ReceiverAreaID | int | (可填)接收方大区ID：1-9为正式服，由于用全区全服，所以与发送方一样 |
| ReceiverZoneAreaID | int | (可填)接收方针对分区分服的游戏填写分区id，用来唯一标示一个区；非分区分服游戏请填写0 |
| ReceiverRoleID | string | (必填)接收方角色唯一ID |
| ReceiverRoleName | string | (可填)接收方角色昵称只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如/，\t，\n，\r以及空格，文本复制的回车），则记录时去掉，比如 张/三 记为 张三 |
| SceneID | int | (必填)操作场景类型，2001好友申请 2002加入公会申请 2003加入队伍申请 2004邀请玩家加入队伍 2005邀请玩家加入公会 2006申请加入房间 2007邀请玩家加入房间 2008点赞 2009分享，详见https://ace.woa.com/#/console/service/access-access-flow |
| Contents | string | (必填)附言内容，目前最多能发送单条512字节的信息内容只保留中文字符、英文和数字。如果内容中带有影响结构的特殊字符（比如/，\t，\n，\r以及空格，文本复制的回车），则记录时去掉，比如 张/三 记为 张三 |
| TotalCash | int | (必填)玩家角色累计充值 - 后续有了再报 |
| iGuildID | uint64 | (可填)玩家公会ID，没有公会则上报0 |
| RelationShip | int | (可填)好友申请时两人关系，仅当SceneID=2001好友申请时有效 |
| iApplySource | int | 记录通过好友申请时，申请来源 |

---

### 104. SecRankingListFlow

- **描述**: 排行榜上榜日志
- **字段数**: 21
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本 |
| AreaID | int | (安全补充)用户处罚大区ID：1-9为正式服 |
| AccountType | int | (安全补充)用户的账号类型：1 QQ号、2 微信openid、4 QQ openid、7 游客，详见https://doc.weixin.qq.com/sheet/e3_AVcAzAauAIcwmftCL0RSpOJqWQPz3?scode=AJEAIQdfAAoggukgSmAVcAzAauAIc |
| vClientIP | string | (可填)客户端IP(后台服务器记录与玩家通信时的IP地址) |
| iLevel | int | (可填)等级 |
| iRoleCE | int | (可填)玩家角色战力Combat Effectiveness - 没用到，报0 |
| vHeadUrl | string | (可填)玩家角色头像URL |
| ListType | int | (必填)上榜类型 1副本评分 2副本通关时间 4预设评分 5段位榜 6PVP机甲战得分榜 |
| CurrentRank | int | (必填)当前排名 |
| RankScore | int64 | (必填)当前分数，与上报数据类型相关，如上榜的是等级就上报等级，以此类推 |
| IsLine | int64 | (必填)本条日志是实时打印还是离线打印（1.实时，每次主动变更榜单排名打印一条 2.离线，每日定时打印榜单上所有玩家的数据，每个玩家一条） |
| SubListType | int | (必填)上榜子类型，段位榜用省份ID，其它用的dungeonId |

---

### 105. SecAntiDataFlow

- **描述**: 安全特征日志
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| OpenID | string | (必填)用户OPENID号 |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| AreaID | int | 大区ID：1-9为正式服 |
| ZoneID | int | 针对分区分服的游戏填写分区id，用来唯一标示一个区；非分区分服游戏请填写0 - NZM业务填0 |
| BattleID | biguint | (必填)本局唯一ID，NZM业务填的房间ID，开放世界场景填0，协议丢失场景填当前所在房间ID |
| ClientVersion | string | (必填)客户端版本号 |
| AntiData | string | 安全特征值。协议丢失时为空；心跳协议上报多次重复后也会报空 |
| Protocol | int | 确认当游戏数据正常通信，轻特征数据1分钟未上报，打印该字段，0正常 1协议丢失 |
| Source | int | 数据上报来源：1.关键协议（开赛和结算时走局内上报），2.心跳协议（每15秒走局外上报，有重复时不上报） |
| Env | string | (必填)服务器环境 |

---

### 106. SecVerifyFlow

- **描述**: 服务端校验结果日志
- **字段数**: 24
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| ClientVersion | string | 客户端版本 |
| AreaID | int | (必填)用户处罚大区ID，1-9为正式服 |
| vClientIP | string | 客户端IP |
| vHeadUrl | string | 头像URL |
| GuildID | string | (可填)玩家公会ID,没有公会则上报0 |
| RoomID | string | DSRoomID |
| MapID | int | MapID |
| ModeID | int | ModeType |
| DungeonID | int | DungeonID |
| ErrCode | int | (必填)错误码。标识作弊类型，如1表示HP异常，2表示Damage异常，3表示Skill CD异常... |
| OptionalValue1 | string | (可填)可选数值1。对错误码的辅助说明，比如当errCode等于3时，此字段可存储Skill ID。 |
| OptionalValue2 | string | (可填)可选数值2。对错误码的辅助说明，比如当errCode等于3时，此字段可存储实际CD值。 |
| OptionalValue3 | string | (可填)可选数值3。对错误码的辅助说明，比如当errCode等于3时，此字段可存储理论CD值。 |
| OptionalValue4 | string | (可填)可选数值4。可选数值的弹性较大，可自由使用，但要有相应地文档说明。 |

---

### 107. SecGetReportData2Flow

- **描述**: 玩家GetReportData2上报流水
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)针对分区分服的游戏填写分区id。这里统一填0 |
| OpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本号 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | string | (必填)本局房间ID，多个玩家在同一房间对局共用此ID |
| BattleID | string | (必填)本局唯一ID，NZM业务填的房间ID |
| ReportTiming | int | (必填)上报时机类型，分定时与随对应日志打点共同上报两种情况，0：定时上报（每分钟上报1次）1：对局开始 2：对局结算 |
| GetReportData2 | string | (必填)客户端上报的从安全sdk接口获取的数据 |
| ReportJournalName | string | 上报时机对应的日志名，即随哪条日志一同上报。这里统一为空 |
| Env | string | 服务器环境 |

---

### 108. SecMoveReport

- **描述**: 玩家移动方向键操作记录，用于安全挂机检测。每3min及单局结束上报
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本号 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomId | uint64 | 房间id |
| PageNo | int | 此流水为本局的第几条 |
| LastPage | int | 此流水为本局的最后一条，1是，0否 |
| FlowDataStr | string | 流水数据字符串。从对局开始每0.5秒记一次移动轮盘角度，以正前为0度，逆时针递增，共360度，未移动记-1。本字段记录前140个数据的原始角度。PC只有8方向，角度记录为45整数倍 |
| FlowDataStr2 | string | 角度分布字符串。每10度一个区间，将360度划分成36个区间。每次采样得到一个角度，则将对应区间的次数加一。最后上报每个区间的统计值 |

---

### 109. SecTriggerClickFlow

- **描述**: 玩家开火、技能键操作记录，用于安全挂机检测。每3min及单局结束上报
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本号 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomId | uint64 | 房间id |
| PageNo | int | 此流水为本局的第几条 |
| LastPage | int | 此流水为本局的最后一条，1是，0否 |
| RoundStartTime | uint32 | 对局开始时间戳UNIX格式 |
| FlowDataStr | string | 记录攻击及技能释放点击信息，包括时间、按键ID、屏幕X、Y坐标。时间用相对时间，单局开始为0，单位秒。PC端X和Y坐标为空(逗号仍要)。上报统计周期前50条。格式：时间a,A,ax,ay;时间b,B,bx,by,时间c,C,cx,cy... |

---

### 110. SecShopOpenFlow

- **描述**: 玩家对局商店操作记录。单局结束上报
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| vRoleName | string | (必填)玩家角色名 |
| ClientVersion | string | (必填)客户端版本号 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomId | uint64 | 房间id |
| RoundStartTime | uint32 | 对局开始时间戳UNIX格式 |
| OperationList | string | 打开商店序列记录，每次打开关闭商店为一条记录，只记前20条（通常不会超出）。记录间用;分隔，每条记录格式“打开商店页面时间,购买道具ID列表(用:分割),关闭页面时间”，时间用相对时间，单局开始为0，单位秒。 |

---

### 111. ClickedLobbyButton

- **描述**: 大厅界面点击统计
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| LobbyButtonID | uint32 | 大厅按钮ID，参考UE数据表LobbyEntry |
| ActivityID | uint32 | 玩法界面按钮对应的活动ID |

---

### 112. SeasonTask

- **描述**: (必填)赛季任务
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| TaskType | int | 赛季任务类型 1：每日，2：每周, 3: 挑战 4: 成长 |
| TaskID | int | 赛季任务ID |
| Status | int | 0:领取,未完成;1:完成未领奖;2:完成已领奖 |
| LoopCount | int | 如果TaskType是每周,这里表示轮次数量 |

---

### 113. SeasonLevel

- **描述**: (必填)赛季等级变更
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| SeasonLevel | int | 赛季等级 |
| MilestoneLevel | int | 里程碑等级 |

---

### 114. SeasonExpFlow

- **描述**: (必填)赛季经验流水
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| ExpAdded | int | 增加了多少赛季经验 |
| Exp | int64 | 增加之后的经验 |
| Level | int | 增加经验之后的等级 |
| Week | int | 本赛季的第几周 |
| WeekExp | int | 周经验 |

---

### 115. SeasonGrow

- **描述**: (必填)赛季成长流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| PhaseLevel | int | 成长阶段等级 |

---

### 116. SeasonTalent

- **描述**: 赛季天赋
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| Op | int | 操作：1.升级，2.降级. 3.重置所有天赋. 4.开赛（全量）5.登出(全量) |
| TalentID | int | 天赋ID：Op为1,2时有效 |
| TalentLevel | int | 操作后的等级Op为1.2时有效 |
| TalentPhase | int | 当前阶段 |
| RoomID | uint64 | 房间ID，仅Op为4有效 |
| DungeonID | int | 副本ID，仅Op为4有效 |
| LogoutID | int64 | 登出ID，登出时来判断批次. Op为 5.时有效 |
| SchemeType | int64 | 预设方案类型 1 PVE 2 PVP |
| SchemeID | int64 | 预设方案ID |

---

### 117. SeasonBuyBP

- **描述**: 赛季BP
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| BuyType | int | 购买什么？1.BP本身。2.该BP下的等级 |
| BuyBPID | int | 战令ID: BuyType  |
| BuyLevel | int | 如果 BuyType 为 2，则表示购买的等级数量 |

---

### 118. SeasonBPLevelUp

- **描述**: 赛季BP等级升级
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| BPID | int | 战令ID |
| BPLevelBefore | int | 升级之前的等级 |
| BPLevel | int | 升级之后的等级 |
| IsPaid | int | 是否付费购买 |

---

### 119. SeasonTaskPhaseEnter

- **描述**: 赛季任务阶段界面进入上报
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| SeasonID | int | 赛季ID |
| TaskType | int | 1.主线，2.挑战 |
| PhaseID | int | 阶段ID（TaskType 1 和 2 都生效). |
| EntryID | int | 挑战任务的入口ID(TaskType为2时生效) |

---

### 120. SignIn

- **描述**: 签到
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SignInId | uint32 | 签到ID |
| SignInIndex | uint32 | 签到次序 |

---

### 121. ReceiveSignInAward

- **描述**: 领取签到奖励
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SignInId | uint32 | 签到活动ID |
| SignInIndex | uint32 | 签到次序 |
| RewardId | uint64 | 奖励ID |

---

### 122. CheckSignInAward

- **描述**: 查看签到奖励
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| RewardId | uint64 | 奖励ID |

---

### 123. VideoActivityReward

- **描述**: 领取卖点视频活动奖励
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint32 | 活动ID |
| VideoActivityRewardID | uint32 | 奖励ID |

---

### 124. PlayerTDTowerUnLock

- **描述**: 塔防陷阱任务解锁情况
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iTowerID | int | 塔防陷阱ID |
| iUnLockBranch | int | 0=本体 1=4级 |
| bRefund | int | 是否退款取消解锁 |

---

### 125. PlayerTDTowerWaitUnLock

- **描述**: 塔防陷阱任务完成后的等待解锁状态
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iTowerID | int | 塔防陷阱ID |
| iTowerBranch | int | 0=本体 1=4级 |
| iPropId | uint64 | 道具ID |

---

### 126. PlayerTDTowerTaskAccept

- **描述**: 塔防陷阱任务接取情况
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iTowerID | int | 塔防陷阱ID |
| iUnLockBranch | int | 0=本体 1=4级 |

---

### 127. TDTrapAndGunClick2

- **描述**: 玩家塔防相关的点击数据
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| ReportTypeDesc | string | 上报点击类型 |
| TowerId | int | 塔ID |
| BranchId | int | 0,1,2 其中0代表着tower本体 |
| TowerCenterTabName | int | 陷阱研究中心分页名称 1 -> 研究 , 2 ->皮肤 |
| bNotGetFilter | int | 是否勾选陷阱未拥有筛选 |
| bNotResearchFilter | int | 是否勾选陷阱分支未研究筛选 |
| EffectFilterType | int | 效果筛选类型 0是全部 其他对应陷阱效果表id |
| PosFilter | int | 位置筛选类型 0是全部 地面1 墙壁2 天空3 |
| GunId | int | 装置枪id |
| GunViewTabName | int | 装置枪分页名称 1 -> 介绍 , 2 ->皮肤  |
| ClickTimes | int | 本次点击次数 |

---

### 128. TDSelectPosOpen

- **描述**: 玩家塔防位置选择
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| ClickTimes | int | 本次点击次数 |

---

### 129. PlayerTDTowerChangeSkin

- **描述**: 塔防科技塔换肤解锁情况
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iTowerID | int | 塔防科技塔ID |
| iSkinID | int | 皮肤ID |

---

### 130. PlayerTDSelectPosition

- **描述**: 塔防玩家站位选择
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| Position | int | 0=None, 1=进攻 2=支援 3=选择 |

---

### 131. PlayerTDGunChangeSkin

- **描述**: 塔防装置枪换肤解锁情况
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iGunID | int | 塔防装置枪ID |
| iSkinID | int | 皮肤ID |
| EquippedGunID | int | 装备的塔防装置枪ID |

---

### 132. PlayerTDGunUnLock

- **描述**: 塔防装置枪解锁情况
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iGunID | int | 塔防科技塔ID |

---

### 133. PlayerTDTalentUpdate

- **描述**: 塔防科技树天赋点更新情况
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iSeasonID | int | 赛季ID |
| iType | int | 更新类型 0=重置 1=激活 |
| iBranchID | uint32 | 科技树分支ID |
| iPointID | uint64 | 科技树天赋点ID |

---

### 134. PlayerTDTowerFavor

- **描述**: 塔防陷阱收藏情况
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| iType | int | 更新类型 0=取消收藏 1=收藏 |
| iTowerID | uint32 | 塔防陷阱ID |

---

### 135. PlayerChosenTDAffix

- **描述**: 玩家选择的塔防科技词条
- **字段数**: 40
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| AffixID1 | int | 玩家选择词条1 |
| AffixLevel1 | int | 玩家选择词条等级1 |
| AffixID2 | int | 玩家选择词条2 |
| AffixLevel2 | int | 玩家选择词条等级2 |
| AffixID3 | int | 玩家选择词条3 |
| AffixLevel3 | int | 玩家选择词条等级3 |
| AffixID4 | int | 玩家选择词条4 |
| AffixLevel4 | int | 玩家选择词条等级4 |
| AffixID5 | int | 玩家选择词条5 |
| AffixLevel5 | int | 玩家选择词条等级5 |
| AffixID6 | int | 玩家选择词条6 |
| AffixLevel6 | int | 玩家选择词条等级6 |
| AffixID7 | int | 玩家选择词条7 |
| AffixLevel7 | int | 玩家选择词条等级7 |
| AffixID8 | int | 玩家选择词条8 |
| AffixLevel8 | int | 玩家选择词条等级8 |
| AffixID9 | int | 玩家选择词条9 |
| AffixLevel9 | int | 玩家选择词条等级9 |
| AffixID10 | int | 玩家选择词条10 |
| AffixLevel10 | int | 玩家选择词条等级10 |
| AffixID11 | int | 玩家选择词条11 |
| AffixLevel11 | int | 玩家选择词条等级11 |
| AffixID12 | int | 玩家选择词条12 |
| AffixLevel12 | int | 玩家选择词条等级12 |
| AffixID13 | int | 玩家选择词条13 |
| AffixLevel13 | int | 玩家选择词条等级13 |
| AffixID14 | int | 玩家选择词条14 |
| AffixLevel14 | int | 玩家选择词条等级14 |
| AffixID15 | int | 玩家选择词条15 |
| AffixLevel15 | int | 玩家选择词条等级15 |

---

### 136. PlayerTowerDefenseRoundGameDetail

- **描述**: 玩家塔防波次流水表
- **字段数**: 46
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| RoundID | int | 波次ID |
| DropOut | int | 是否中途退出 |
| TeamId | string | 局外组队的队伍ID，为0表示没有队伍 |
| IsWin | int | 0=平局 1=胜利 2=失败 |
| GameDuration | int | 游戏时间(秒) |
| BattleDuration | int | 战斗游戏时长(秒) |
| FreeRebirthCoinsUsed | int64 | 免费复活币使用次数 |
| PaidRebirthCoinsUsed | int64 | 付费复活币使用次数 |
| LegendaryDropsNum | int | 极品掉落数 |
| DeathCount | int | 死亡次数 |
| TeleportPointUsed | int | 传送点使用次数 |
| WeaponKilled | int | 武器击杀怪物数 |
| TrapKilled | int | 陷阱击杀怪物数 |
| AmmoResupplyTimes | int | 弹药补给次数 |
| ShopUsedTimes | int | 商店使用次数 |
| GoldCoinsGained | int | 金币获取数 |
| GoldCoinsGainedByKill | int | 金币获取数-击杀怪物 |
| GoldCoinsGainedByAssist | int | 金币获取数-助攻 |
| GoldCoinsGainedByTrap | int | 金币获取数-陷阱提供 |
| GoldCoinsUsed | int | 金币使用数 |
| Score | int64 | 局内分 |
| KillScore | int64 | 击杀分 |
| AssistScore | int64 | 助攻分 |
| BuildTrapCount | int | 玩家本轮建造过的陷阱数量 |
| AllWeaponDamage | int64 | 玩家武器伤害 |
| AllTrapsDamage | int64 | 玩家塔的伤害 |
| AllDamages | int64 | 总伤害 |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| iBotType | int | Bot类型,1是行为树，2是强化 |

---

### 137. TowerDefensePlayerTrapGameDetail

- **描述**: 塔防陷阱单局流水表
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| TrapId | string | 陷阱ID |
| PlaceCount | int | 使用个数 |
| RecycleCount | int | 售出次数 |
| KillNum | int | 击杀数 |
| Damage | int64 | 伤害 |
| TriggerCount | int | 触发次数 |
| UseDuration | int | 使用时间 |
| UpgradeCountLevel2 | int | 升级到Level2次数 |
| UpgradeCountLevel3 | int | 升级到Level3次数 |
| UpgradeCountLevel4 | int | 升级到Level4次数 |

---

### 138. TowerDefenseBossGameDetail

- **描述**: 塔防Boss单局流水表
- **字段数**: 23
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| BossId | string | BossID |
| RoundID | int | 回合ID |
| AceCount | int | BOSS战水晶被攻陷次数 |
| DestroyTrapCount | int | 摧毁陷阱次数 |
| DamageFromTrap | int64 | 从陷阱中受到的伤害 |
| DamageFromWeapon | int64 | 从武器中受到的伤害 |
| IsWin | int | 最终是否胜利 |

---

### 139. TDTopDownMode

- **描述**: 玩家塔防俯视图摆塔流水表
- **字段数**: 18
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| ModeEnterTimes | int | 俯视放塔模式进入次数 |
| ModeExitTimes | int | 俯视放塔模式退出次数 |
| UpgradeTrapTimes | int | 升级陷阱次数 |
| RecycleTrapTimes | int | 回收陷阱次数 |
| RotateTrapTimes | int | 旋转陷阱次数 |
| UseTimeLength | int | 使用时长 |
| SwitchToFloorTimes | string | 切换到指定楼层的次数 |
| DragPlaceInfos | string | 拖拽放塔 |
| ClickPlaceInfos | string | 点击放塔 |

---

### 140. TDRangeMode

- **描述**: 玩家塔防训练场控制面板出怪流水表
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| ModeEnterTimes | int | 使用控制面板成功出怪次数 |
| CustomDataInfos | string | 自定义出怪详情: 出怪口,怪物ID1;怪物ID2;出怪口,怪物ID3;怪物ID4 |
| WaveDataInfos | string | 系统怪物组合详情: 难度,波次;难度,波次 |

---

### 141. PlayerTowerDefensePlayerWeaponShareDetail

- **描述**: 玩家塔防商店武器购买/拾取流水表
- **字段数**: 22
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | string | 该房间ID |
| GameMode | int | 游戏模式。详见MatchGameTypeEnums (2:PVP,3:PVE,4:OPW) |
| ModeType | int | 模式ID。详见MatchModeTypeEnums (130:开发测试,131:故事模式,132:挑战模式,133:苍茫迷踪,134:猎场,135:月球防御战,136:时空追猎,137:随机副本,138:主线玩法,192:大世界,193:位面) |
| SubModeType | int | 子模式ID。详见MatchSubModeTypeEnums (1:EASY,2:NORMAL,3:HARD,16:PVPKill100) |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| WeaponGiveClickTimes | int | 玩家点开发枪界面的次数 |
| GoldCoinsCost | int64 | 玩家成功购买武器所花费金币总数 |
| WeaponBoughtTimes | int | 玩家成功购买了武器的次数 |
| WeaponPickupTimes | int | 玩家成功拾取了武器的次数 |
| WeaponBoughtDetails | string | 玩家购买武器详情: WeaponItemID0:cnt0;WeaponItemID1:cnt1;20104000008:3;20104000009:3 |
| WeaponPickupDetails | string | 玩家拾取武器详情: WeaponItemID0:cnt0;WeaponItemID1:cnt1;20104000008:3;20104000009:3 |

---

### 142. FatigueFlow

- **描述**: 疲劳值变更流水
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iDungeonID | int | 副本ID，如有 |
| RoomId | biguint | DsRoomID，如有 |
| iAddStage | int | (必填)变更环节，-1系统清空或自动发放 0结算 1中途退出 |
| iBeforeFatigueValue | int | (必填)变更前数值 |
| iAddFatigueValue | int | (必填)变更数值 |
| iAfterFatigueValue | int | (必填)变更后数值 |

---

### 143. RandomChestOpenFlow

- **描述**: 通用随机宝箱开启流水
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iPropID | biguint | (必填)道具ID |
| iPropNum | int | (必填)道具数量 |
| iRarityResult | int | (必填)品质结果 |
| Sequence | biguint | (必填)用于关联奖励流水日志 |
| BatchIndex | int | (必填)批量开启时的序号，从1开始 |
| iScriptCount | int | (必填)剧本次数，0:未配置剧本，-1:剧本次数已执行完，其他:剧本执行次数 |

---

### 144. LadderRankLevelFlow

- **描述**: 排位段位流水
- **字段数**: 25
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| MatchType | int | 赛事类型 |
| RankLevel | int | 段位 |
| HideScore | int | 隐藏分 |
| RankScore | int | 排位分 |
| RankLevelBf | int | 变化前段位 |
| HideScoreBf | int | 变化前隐藏分 |
| RankScoreBf | int | 变化前排位分 |
| ConfirmLevel | int | 是否定级赛 |
| GameMode | int | 游戏模式。详见GameDetail表里的该字段描述 |
| ModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| SubModeType | int | 子模式ID。详见GameDetail表里的该字段描述 |
| DungeonID | int | 副本ID |
| RoomId | biguint | 房间ID |
| SeasonID | int | 赛季ID |
| OpponentRoomId | int | (废弃)对手房间ID |
| OpponentRoomId2 | biguint | 对手房间ID |

---

### 145. PlayerDepositPropsStatis

- **描述**: 玩家背包道具存量
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| Sequence | biguint | (必填)批量上报时用于标识同一批次的唯一序号 |
| PropsStatis | string | (必填)道具列表，格式为itemid1,num1;itemid2,num2; |

---

### 146. CustomRoomRoomInfo

- **描述**: 创建或者修改房间信息
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| CustomRoomID | string | 自建房ID |
| RoomType | int | 房间类型 0=普通 1=赏金 |
| GoldPrice | int | 赏金房间的预扣款，如果为负数则是返还 |
| DungeonID | int | 房间DungeonID |
| Operate | int | 房间操作状态 0=创建 1=修改 2=解散 |
| RoomID | string | DS房间ID |
| HalfJoin | int | 是否中途加入 |
| CompleteStatus | int | 完成状态 0=开始 1=正常结束 2=异常结束 |

---

### 147. CustomRoomPlayerChange

- **描述**: 自建房房间内玩家变更
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| CustomRoomID | string | 自建房ID |
| ApplySource | int | 玩家加入房间的途径 0=退出 1=创建，2=组队平台，3=社团房间，4=世界招募，5=公会招募 6=兴趣频道 7邀请 8申请 |
| HalfJoin | int | 是否是副本中途加入 |
| PlayerCount | int | 玩家个数 |
| MaxPlayerCount | int | 最大玩家个数 |
| OperationType | int | 0=加入 1=踢出 2=退出 |

---

### 148. CustomRoomMatchInfo

- **描述**: 自建房房间状态变更
- **字段数**: 23
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| CustomRoomID | string | 自建房ID |
| RoomID | string | DS房间ID |
| DungeonID | int | 房间DungeonID |
| PlayerCount | int | 玩家个数 |
| BotCount | int | Bot个数 |
| MatchProcess | int | 房间的开赛状态 0=开始 1=异常结束 2=正常结束 |
| PlayerID_1 | string | PlayerID_1 |
| PlayerApplySource_1 | int | Player_1的来源 |
| PlayerID_2 | string | PlayerID_2 |
| PlayerApplySource_2 | int | Player_2的来源 |
| PlayerID_3 | string | PlayerID_3 |
| PlayerApplySource_3 | int | Player_3的来源 |
| PlayerID_4 | string | PlayerID_4 |
| PlayerApplySource_4 | int | Player_4的来源 |
| CreatedTime | int | 创建时间 |

---

### 149. GoldHunterModeInfo

- **描述**: 赏金猎人房间信息
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| CustomRoomID | string | 自建房ID |
| RoomID | string | DS房间ID |
| DungeonID | int | 房间DungeonID |
| CompleteStatus | int | 完成状态 0=创建 1=完成 2=未完成 |
| DistributionInfo | string | 分发情况 [player_id:type:error:amount,...] type(1=奖励 2=退款), error(0=成功 1=失败), amount(数量) |
| RewardItemID | string | 赏金道具ID |

---

### 150. PlayerStandAloneDungeonProgress

- **描述**: 客户端本地关卡进度上报
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| DungeonID | int | DungeonID |
| DungeonProcess | int | 本地进度 |
| IsFinished | int | 是否完成 |

---

### 151. ComplaintDetail

- **描述**: 举报数据上报
- **字段数**: 23
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号  |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iGameMode | int | 游戏模式。详见GameDetail表里的该字段描述 |
| iModeType | int | 模式ID。详见GameDetail表里的该字段描述 |
| iSubModeType | int | 子模式ID。详见GameDetail表里的该字段描述 |
| iMapId | int | 地图ID |
| iDungeonID | int | 副本ID |
| ReportID | int | 举报id，根据举报类型上报 |
| PlayerID | biguint | (必填)举报者playerid |
| PlayerOpenID | string | (必填)举报者openid |
| TargetID | biguint | (必填)被举报者playerid |
| TargetOpenID | string | (必填)被举报者openid |
| ReportType | int | 举报reason |
| RoomId | biguint | 房间roomid |
| SceneType | int | 举报场景 |
| categoryType | int | 举报类型 |

---

### 152. ProbabilityGuaranteeFlow

- **描述**: 玩家概率保底状态变更流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| Sequence | biguint | (必填)用于关联一次奖励产生多条不同道具 |
| GuaranteeID | uint64 | (必填)保底配置ID |
| GuaranteeCount | int | (必填)保底累计次数 |

---

### 153. RogueLikeSubDungeonGameDetail

- **描述**: 爬塔单局玩法的子关卡表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| SubId | int | SubID |
| BossName | string | Boss名称 |
| Stars | int | 通关星级 |
| GameTime | int | 通关时长 |

---

### 154. HuntingFieldSubDungeonGameDetail

- **描述**: 猎场单局玩法的子关卡表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| AreaID | int | AreaID |
| Card1 | int | 随机卡片1 |
| Card2 | int | 随机卡片2 |
| Card3 | int | 随机卡片3 |

---

### 155. HuntingFieldMangaSkipInfo

- **描述**: 猎场玩法跳过信息
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| InfoSeq | int | 跳过组件内的自增唯一序号，由于过滤了无投票记录的动态漫数据，序号可能不连续 |
| DungeonAreaID | int | AreaID |
| GPRowName | string | 动态漫名称GPFuncName_RowName |
| Source | int | 用于区分播放使用的接口 0-在Quest中调用动态漫接口 1-游戏开局动态漫 2-老式的Cutscene接口 MultiPlayCinematicDialogueOnServer |
| VotedPlayers | string | [player_id_1,player_id_2] |
| bIsSkip | int | 是否跳过 |

---

### 156. PlayerRogueLikeSubDungeonStatics

- **描述**: 爬塔玩法子关卡玩家表
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家ID |
| Env | string | (必填)服务器环境 |
| vRoleName | string | (必填)玩家角色名 |
| RoomID | string | 该房间ID |
| DungeonID | int | 副本ID |
| SubId | int | SubID |
| AmmoSupplyCount | int | 弹药补给次数 |
| PlayerChosenCardStr | string | 本局获得的卡牌数据，拼接字符串[CardID,Level;CardID,Level;...] |

---

### 157. PlayerCollectionUnlockFlow

- **描述**: 玩家藏品解锁表
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| CollectionId | uint64 | 藏品ID |
| CurCollectionLevel | int | 藏品等级 |
| CollectionNum | int | 已解锁藏品数量 |

---

### 158. PlayerCollectionLevelFlow

- **描述**: 玩家藏品到达等级/奖励表
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| CollectionLevel | int | 藏品ID |
| ReachLevel | int | 为1代表玩家等级达到该级 |
| GainLevelAward | int | 为1代表此流水表示玩家领取该等级的奖励 |

---

### 159. PlayerMonthCardUnlockFlow

- **描述**: 玩家月卡解锁表
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| MonthCardID | uint64 | 月卡ID |
| ReceiveTime | datetime | 月卡解锁时间 本次生效周期内，第一次解锁的时间 |
| ExpiredTime | datetime | 月卡过期时间 |
| UnlockDays | int | 本次解锁天数 |
| UnlockType | int | 月卡解锁方式 0:普通解锁 1:自动补发 |
| RemainDays | int | 剩余有效天数 |

---

### 160. PlayerMonthCardAwardFlow

- **描述**: 玩家月卡奖励表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| MonthCardID | uint64 | 月卡ID |
| IsExpiredSendMail | int | 月卡过期 通过邮件自动发的奖励 |
| DailyAwardDays | int | 领奖天数 |
| FestivalAwardLevel | int | 节假日奖励等级 如果是0代表没有 EMonthCardAwardType 1普通奖励 5神话 |
| FestivalId | int | 节假日ID 为0代表没有 |

---

### 161. HuntingRankGameTotal

- **描述**: 猎场排位游戏总体数据
- **字段数**: 30
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，GameTotal中为空 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID，GameTotal中为空 |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| RoomID | uint64 | DS房间ID |
| OpponentRoomID | uint64 | 对手的DS房间ID |
| MatchID | uint64 | 关联两个房间的局外BP房间ID |
| iMapId | int | 地图ID |
| iDungeonID | int | 副本ID |
| RoomRank | int | 房间段位 |
| dtGameStartTime | datetime | 游戏开始时间 |
| GameDuration | int | 游戏时间(秒) |
| iEndGameReason | int | EHuntingRankEndGameReason |
| iIsWin | int | 0=失败 1=胜利 2=平局 |
| iDropNum | int | 中途退出人数 |
| DeployCardList | string | 本局部署词条 |
| GameProgress | string | 游戏进度 ChildQuestIndex,ChildQuestProgress,BossQuestIndex,BossProgress |
| RingBellCount | int | 敲钟次数 |
| CardList | string | 本局随机出来的卡池 |
| SeasonId | int | 赛季ID |
| RoundOneCardDetail | string | 回合一选卡细节 CardId:Count; |
| RoundTwoCardDetail | string | 回合二选卡细节 CardId:Count; |
| RoundThreeCardDetail | string | 回合三选卡细节 CardId:Count; |
| DeployCardPlayerNum | int | 参与了选卡环节的玩家人数 |
| IsWarmGame | int | 是否是温暖局 |

---

### 162. PlayerLoginPrivilegeMailFlow

- **描述**: 登录特权邮件奖励流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| iPrivilegeFrom | int | qq:1 wx:2 |
| MailSeq | uint64 | 发送邮件的seq |
| Result | int | 发送邮件的错误码，发送成功为0 |

---

### 163. PlayerPrivilegeStatusFlow

- **描述**: 网吧及高校用户特权流水
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| NetbarPrivilegeStatus | int | 无网吧特权：0; 网吧普通特权:1; 网吧高级特权:2 |
| CollgePrivilegeStatus | int | 无高校特权：0; 高校特权:1 |
| CollgePrivilegeValidTimeSec | uint32 | 高校特权有效时间 |
| Result | int | 检查特权时的错误码，成功为0 |

---

### 164. DsGameLogPerfAllStat

- **描述**: DS整体性能统计
- **字段数**: 53
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS,一般填time(null) |
| RoomId | biguint | 房间ID |
| MatchServiceType | uint32 | 开赛入口：排位，匹配，自建房等，参考MatchServiceModuleEnums |
| DungeonId | uint32 | 副本ID |
| ModeType | uint32 | 游戏模式：参考MatchModeTypeEnums |
| MapId | uint32 | 地图id |
| AvgFPS | float | 平均帧率 |
| AvgCpuUsage | int | 平均CPU使用率 |
| AvgMemUsage | uint64 | 平均PSS内存大小:MB |
| PacketsInPerSec | uint32 | 上行：平均每秒收包数 |
| LostInPerSec | float | 上行：平均每秒丢包数 |
| PacketsOutPerSec | uint32 | 下行：平均每秒发包数 |
| LostOutPerSec | float | 下行：平均每秒丢包数 |
| KBytesInPerSec | float | 上行：平均每秒流量 |
| KBytesOutPerSec | float | 下行：平均每秒流量 |
| MaxMonsters | uint32 | 最大怪物数 |
| AvgGTCpuUsage | int |  |
| NetQueuedBits | int |  |
| NetSaturatedCnt | int | 网络饱和次数 |
| MaxTickTime | float | 最长帧时间，单位：ms |
| MaxTickTS | float | 最长帧出现时间，单位：s |
| MinFPS | float | 最小帧率 |
| MaxFPS | float | 最大帧率 |
| MoveAdjustCnt | int | 移动拉扯次数 |
| MaxBunchSize | int | 最大Bunch包大小(Byte) |
| MaxBunchSizeOfGameState | int | 最大GameState Bunch包大小(Byte) |
| MaxChannelsUsed | int | 单连接Actor通道使用量 |
| MaxInKBytesPerSec | float | 单玩家平均流量最大值 |
| PeakInKBytesPerSec | float | 单玩家瞬时流量峰值 |
| MaxOutKBytesPerSec | float | 单玩家平均流量最大值 |
| PeakOutKBytesPerSec | float | 单玩家瞬时流量峰值 |
| LogFileSize | int | 压缩前log文件大小：MB |
| StatRealTime | int | Perf统计时长:s |
| Env | string | 环境 |
| MaxPlayers | uint32 | 最大玩家数量 |
| AvgPlayers | float | 平均玩家数量 |
| MaxBots | uint32 | 最大BOT数量 |
| AvgBots | float | 平均BOT数量 |
| AvgMonsters | float | 平均怪物数量 |
| TotalMGEStartActionCount | uint32 |  |
| HostIP | string | DS机器IP |
| TotalAddBuffConnt | uint32 |  |
| TotalBuffEffectCount | uint32 |  |
| AvgRssUsage | uint64 | 平均RSS内存大小:MB |
| DsVersion | string | DS版本号 |
| IdcZoneId | int | 机器所属IDC ZoneId |
| InstanceType | string | 节点机型 |
| SubModeType | uint32 | 子模式：一般用于区分难度，详见MatchSubModeTypeEnums |
| Reason | string | 结束原因 |
| IsSucc | int | 是否成功通关 |
| OutSavings | float | 流量压缩优化比例 |
| BuildType | int | DS构建类型 |

---

### 165. DsGameLogStartupTimingInfo

- **描述**: DS启动耗时统计
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS,一般填time(null) |
| RoomId | biguint | 房间ID |
| MatchServiceType | uint32 | 开赛入口：排位，匹配，自建房等 |
| DungeonId | uint32 | 副本ID |
| ModeType | uint32 | 游戏模式：普通，三军，五军等 |
| MapId | uint32 | 地图id |
| DsVersion | string | DS版本号 |
| TotalStartUpTime | float | 启动总耗时 |
| EngineInitTime | float | 引擎初始化时间 |
| MapLoadTime | float | 主关卡加载时间 |
| LevelStreamingTime | float | LevelStreaming时间 |
| bChildProc | int | 是否子进程 |
| bFatherProc | int | 是否父进程 |
| env | string | 环境 |
| InstanceType | string | 节点机型 |

---

### 166. DsGameLogStartMatchTimeout

- **描述**: (DS上报)等待游戏开始超时
- **字段数**: 22
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，可能为空 |
| vRoleID | string | (必填)玩家角色ID，可能为空 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| DsVersion | string | DS版本号 |
| IdcZoneId | int | 机器所属IDC ZoneId |
| HostIP | string | DS机器IP |
| InstanceType | string | 节点机型 |
| MatchServiceType | uint32 | 开赛入口：排位，匹配，自建房等，直接取的服务器模块ID，详见ENZMModule |
| GameType | uint32 | 游戏类型：如PVE、PVP，详见MatchGameTypeEnums |
| ModeType | uint32 | 游戏模式：如猎场、塔防，详见MatchModeTypeEnums |
| SubModeType | uint32 | 子模式：一般用于区分难度，详见MatchSubModeTypeEnums |
| MapId | uint32 | 地图ID,详见EntranceInfo_new.csv |
| DungeonId | uint32 | 副本ID,详见EntranceInfo_new.csv |
| Reason | string | 原因包括：NoInPackets,NoConnections,NoPreLogin,NoLogin |
| PlayerNum | int | 登录超时玩家数量，不包括BOT |
| PlayerList | string | 登录超时玩家列表 |

---

### 167. DsGameLogBotAbnormalEvent

- **描述**: Bot异常信息上报表
- **字段数**: 20
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS,一般填time(null) |
| RoomId | biguint | 房间ID |
| MatchServiceType | uint32 | 开赛入口：排位，匹配，自建房等 |
| DungeonId | uint32 | 副本ID |
| ModeType | uint32 | 游戏模式：普通，三军，五军等 |
| MapId | uint32 | 地图id |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| AccountType | int | (必填)账号类型，与上面AppID对应 |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| vOpenid | string | (必填)用户OPENID号 |
| PlayerId | biguint | 用户ID,一般填写task_ptr->data.player_id |
| RoleGid | biguint | 玩家的RoleGid |
| AbnormalType | int | 游戏事件AbnormalType,1是Falling,2是StuckStatus,3是Teleport |
| GameTime | float | 游戏事件GameTime |
| LocationX | float | 游戏事件LocationX |
| LocationY | float | 游戏事件LocationY |
| LocationZ | float | 游戏事件LocationZ |
| Env | string | 环境 |
| BotId | uint32 | BotId |

---

### 168. DsPlayerDisconnect

- **描述**: (DS上报)局内连接断开流水, Shutdown、CleanUp、Channel::CleanUp、KickPlayer等属于正常断开
- **字段数**: 30
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号，可能为空 |
| vRoleID | string | (必填)玩家角色ID，可能为空 |
| Env | string | 服务器环境 |
| Level | uint32 | 玩家等级 |
| RoomID | uint64 | DS房间ID |
| DsVersion | string | DS版本号 |
| IdcZoneId | int | 机器所属IDC ZoneId |
| HostIP | string | DS机器IP |
| InstanceType | string | 节点机型 |
| MatchServiceType | uint32 | 开赛入口：排位，匹配，自建房等，直接取的服务器模块ID，详见ENZMModule |
| GameType | uint32 | 游戏类型：如PVE、PVP，详见MatchGameTypeEnums |
| ModeType | uint32 | 游戏模式：如猎场、塔防，详见MatchModeTypeEnums |
| SubModeType | uint32 | 子模式：一般用于区分难度，详见MatchSubModeTypeEnums |
| MapId | uint32 | 地图ID,详见EntranceInfo_new.csv |
| DungeonId | uint32 | 副本ID,详见EntranceInfo_new.csv |
| ClientIP | string | 客户端IP |
| ClientPort | uint16 | 客户端端口 |
| Reason | string | 断连原因 |
| SubReason | string | 细分原因 |
| ErrLog | string | 前一条错误log |
| ConnectDuration | float | 连接建立时长 |
| Loc | string | 当时玩家坐标 |
| DsRPort | uint16 | DS Real Port |
| DsVIP | string | DS VIP |
| DsVPort | uint16 | DS VPort |

---

### 169. ClientDisconnectWithDS

- **描述**: (客户端上报)局内连接断开：不包括正常断开
- **字段数**: 23
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| iLevel | int | (必填)等级 |
| RoomId | biguint | 房间ID |
| GameType | uint32 | 游戏类型：如PVE、PVP，详见MatchGameTypeEnums |
| ModeType | uint32 | 游戏模式：如猎场、塔防，详见MatchModeTypeEnums |
| SubModeType | uint32 | 子模式：一般用于区分难度，详见MatchSubModeTypeEnums |
| MapId | uint32 | 地图ID,详见EntranceInfo_new.csv |
| DungeonId | uint32 | 副本ID,详见EntranceInfo_new.csv |
| ClientVersion | string | DS版本号 |
| DsVIP | string | DS VIP |
| DsVPort | uint16 | DS VPort |
| Reason | string | 断连原因 |
| SubReason | string | 细分原因 |
| ErrLog | string | 前一条错误log |
| ConnectDuration | float | 连接建立时长 |
| Loc | string | 当时玩家坐标 |

---

### 170. ExcelConfigInfo

- **描述**: 配置表上报信息
- **字段数**: 36
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS,一般填time(null) |
| env | string | 环境 |
| branchpath | string | 配置表所在分支名 |
| configname | string | 配置表信息 |
| rownumber | int64 | 行号 |
| param1 | string | param1 |
| param2 | string | param2 |
| param3 | string | param3 |
| param4 | string | param4 |
| param5 | string | param5 |
| param6 | string | param6 |
| param7 | string | param7 |
| param8 | string | param8 |
| param9 | string | param9 |
| param10 | string | param10 |
| param11 | string | param11 |
| param12 | string | param12 |
| param13 | string | param13 |
| param14 | string | param14 |
| param15 | string | param15 |
| param16 | string | param16 |
| param17 | string | param17 |
| param18 | string | param18 |
| param19 | string | param19 |
| param20 | string | param20 |
| param21 | string | param21 |
| param22 | string | param22 |
| param23 | string | param23 |
| param24 | string | param24 |
| param25 | string | param25 |
| param26 | string | param26 |
| param27 | string | param27 |
| param28 | string | param28 |
| param29 | string | param29 |
| param30 | string | param30 |

---

### 171. DSAStatus

- **描述**: (DSA上报)各机器局内在线与负载
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| Env | string | 服务器环境 |
| IdcZoneId | int | 机器所属IDC ZoneId |
| HostIP | string | DS机器IP |
| Players | int | 玩家数量 |
| Bots | int | BOT数量 |
| Monsters | int | 怪物数量 |
| Rooms | int | 单局数量 |
| InstanceType | string | 节点机型 |
| CpuUsage | int | CPU使用率*100 |
| MemUsed | int | 已使用内存:MB |
| MemTotal | int | 总内存:MB |

---

### 172. ClientLoadedAssets

- **描述**: 客户端资源加载统计，缓冲区满了后上报
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| ClientVersion | string | (必填)客户端版本号 |
| ReportID | uint64 | 上报id |
| AssetList | string | 客户端中成功加载的资源，可能会比较大，如10K。由于走客户端上报，所以先不定义太大 |

---

### 173. PlayerUpdateInterestChannelFlow

- **描述**: 玩家更新兴趣频道流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| BeforeUpdate | string | (必填)更新前兴趣列表 |
| AfterUpdate | string | (必填)更新后兴趣列表 |

---

### 174. RTProbabilityGuaranteeFlow

- **描述**: 玩家随机宝箱概率保底状态变更流水
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| PropID | uint64 | (必填)随机宝箱道具ID |
| Sequence | biguint | (必填)用于关联一次奖励产生多条不同道具 |
| BatchIndex | int | (必填)批量开启时的序号，从1开始 |
| GuaranteeInfo | string | (必填)保底信息，格式为：ID1:累计次数1;ID2:累计次数2;ID3:累计次数3 |

---

### 175. PlayerBDDamageStatData

- **描述**: 单局玩家构筑伤害数据
- **字段数**: 42
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| DungeonID | int | (必填)副本ID |
| RoomID | uint64 | (必填)房间ID |
| SchemeID | int | (必填)预设方案ID |
| WeaponID | uint64 | (必填)武器道具ID |
| WeaponGID | uint64 | (必填)武器道具GID |
| WeaponModuleList | string | (必填)武器槽位装配插件，格式：Index1:ItemId1;Index2:ItemId2;Index3:ItemId3;Index4:ItemId4 |
| SeasonSkillID | uint64 | (必填)赛季技能ID |
| SeasonSkillLevel | int | (必填)赛季技能等级 |
| UseTime | float | (必填)使用总时长，单位：秒 |
| CombatUseTime | float | (必填)战斗状态使用总时长，单位：秒 |
| WeaponDamage | uint64 | (必填)武器造成的伤害 |
| WeaponSkillUseCount | int | (必填)武器主动技能使用次数 |
| WeaponSkillDamage | uint64 | (必填)武器主动技能造成的伤害 |
| SeasonSkillUseCount | int | (必填)赛季技能使用次数 |
| SeasonSkillDamage | uint64 | (必填)赛季技能造成的伤害 |
| OtherDamage | uint64 | (必填)其他伤害(没有明确定义口径的，比如增伤部分) |
| NumericalList | string | (必填)结算ID列表，格式：NumericalId1:Damage1:Damage1DividedByRadio; |
| OriginalWeaponItemID | uint64 | (必填)原武器ID |
| SeasonSkillHealing | float | 赛季技能治疗量 |
| SeasonSkillControlCount | int | 赛季技能造成的控制次数 |
| SeasonSkillGatheringStrengthStartCount | int | 赛季技能蓄力开始次数 |
| SeasonSkillGatheringStrengthCount | int | 赛季技能蓄力成功次数 |
| SeasonSkillPositiveCount | int | 赛季技能增益次数 |
| SeasonSkillDieInUsing | int | 赛季技能使用中死亡次数 |
| AreaType | int | 区域信息，猎场模式下：1:推进 2:区域 3:破障 4:BOSS |
| BotID | int | 为bot玩家时，记录bot的bot_id |
| BotTestGroupID | int | 为bot玩家时，记录bot的bot_test_group_id |
| WeaponDamage_EDR | uint | 武器伤害。移除猎场增幅 |
| WeaponSkillDamage_EDR | uint | 武器技能伤害。移除猎场增幅 |
| SeasonSkillDamage_EDR | uint | 赛季技能伤害。移除猎场增幅 |
| OtherDamage_EDR | uint | 其他伤害。移除猎场增幅 |
| BotTaskStressID | uint | 为bot玩家时，记录bot的压测任务id |

---

### 176. PlayerMechaBDDamageStatData

- **描述**: 单局玩家机甲构筑伤害数据
- **字段数**: 26
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| DungeonID | int | (必填)副本ID |
| RoomID | uint64 | (必填)房间ID |
| MechaID | uint64 | (必填)机甲ID |
| MechaSkinID | uint64 | (必填)机甲皮肤 |
| MechaColorID | uint64 | (必填)机甲涂装 |
| MechaComponentInfo | string | (必填)机甲装配信息 武器ID;战术挂件ID;辅助挂件ID;专属挂件ID |
| MechaCoreInfo | string | (必填)机甲核心信息 CoreID;CoreLevel |
| UseTime | float | (必填)使用总时长，单位：秒 |
| CombatUseTime | float | (必填)战斗状态使用总时长，单位：秒 |
| WeaponDamage | uint64 | (必填)机甲主武器射击伤害 |
| TacticSkillInfo | string | (必填)战术技能统计 伤害;激活时长;使用次数 |
| AssistSkillInfo | string | (必填)辅助技能统计 伤害;激活时长;使用次数 |
| UltimateSkillInfo | string | (必填)大招技能统计 伤害;激活时长;使用次数 |
| OtherDamage | uint64 | (必填)其他伤害(没有明确定义口径的，比如增伤部分) |
| NumericalList | string | (必填)结算ID列表，格式：NumericalId1:Damage1;NumericalId2:Damage2;NumericalId3:Damage3; |
| BotID | int | 为bot玩家时，记录bot的bot_id |

---

### 177. PlayerCommercialGiftPackageFlow

- **描述**: 商业化礼包流水表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| CommercePackID | uint32 | 礼包ID |
| CommercePackName | string | 礼包名称 |
| CommercePackType | int | 礼包类型 |
| ChapterId | uint32 | 章ID |
| SectionId | uint32 | 节ID |

---

### 178. ActivityCenterClick

- **描述**: 活动中心按钮点击
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| SeasonLevel | int | 赛季等级 |
| Center | uint32 | 活动中心入口(0.未点击 1.点击) |
| GroupId | uint32 | 活动中心页签分类ID |
| ActivityId | uint64 | 活动ID |

---

### 179. ActivityCenterSetDemandGift

- **描述**: 活动中心设置需求礼物
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| GiftList | string | 礼物列表(格式:prop1,num1;prop2,num2;...) |

---

### 180. ActivityCenterPresentGift

- **描述**: 活动中心赠送礼物
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| ReceiverId | uint64 | 接收方玩家ID |
| GiftList | string | 礼物列表(格式:prop1,num1;prop2,num2;...) |

---

### 181. ActivityCenterReceiveGift

- **描述**: 活动中心接收礼物
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| GiverId | uint64 | 赠送者玩家ID |
| GiftList | string | 礼物列表(格式:prop1,num1;prop2,num2;...) |

---

### 182. EnterLottery

- **描述**: 客户端发起抽奖上报
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| LotteryID | uint32 | 抽奖ID |

---

### 183. LoginPushAdvertiseClick

- **描述**: 拍脸图切换
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| SeasonLevel | int | 赛季等级 |
| srcId | uint32 | 切换前ID |
| DestId | uint32 | 切换后ID |
| operation | uint32 | 操作类型(0.关闭 1.左切换 2.右切换) |

---

### 184. LoginPushAdvertiseJump

- **描述**: 拍脸图跳转
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| SeasonLevel | int | 赛季等级 |
| LoginPushId | uint32 | 拍脸图ID |
| JumpId | uint32 | 跳转ID |

---

### 185. LobbyAdvertiseClick

- **描述**: 商业化推荐切换
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| SeasonLevel | int | 赛季等级 |
| LobbyType | uint32 | 推荐位类型(0.主推荐位 1.副推荐位) |
| srcId | uint32 | 切换前ID |
| DestId | uint32 | 切换后ID |
| operation | uint32 | 操作类型(0.左切换 1.右切换) |

---

### 186. ClickedLobbyAdvertiseJump

- **描述**: 商业化推荐跳转
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| LobbyType | uint32 | 推荐位类型(0.主推荐位 1.副推荐位) |
| LobbyId | uint32 | 推荐位ID |
| JumpId | uint32 | 跳转ID |
| url | string | 跳转链接 |

---

### 187. ClientVisitMiniCommunity

- **描述**: 访问微社区
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| source | int | 访问来源(0.主界面 1.背包 2.武器) |

---

### 188. ClientBuildRecommendApplyScheme

- **描述**: 构筑推荐方案应用
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | 登陆的游戏服务器编号 |
| dtEventTime | datetime | 游戏事件的时间，格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | (必填)环境名 |
| Level | uint32 | 玩家等级 |
| shareCode | string | 方案码 |
| applyResult | int | 应用结果(二进制组合表示 0.完全成功 1.武器填充 2.武器缺失 4.插件填充 8.插件缺失） |

---

### 189. StrategicStockPileReward

- **描述**: 战备蓄能活动奖励领取
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | uint64 | 活动ID |
| Source | uint32 | 奖励来源(0.过载充能 1.稳态回充) |
| RewardNum | uint32 | 获得燃料数量 |
| UsedLottery | uint32 | 消耗电池数量 |

---

### 190. ActivityCenterStoreExchange

- **描述**: 活动中心商店兑换
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| StoreId | uint32 | 商店ID |
| RewardId | uint64 | 奖励ID |
| PurchaseNum | uint32 | 兑换数量 |
| Price | uint32 | 消耗代币数量 |

---

### 191. ActivityCenterPlayerReturn

- **描述**: 玩家回归奖励
- **字段数**: 19
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | uint64 | 回归活动ID |
| OfflineDays | int | 离线天数 |
| ReturnCnt | int | 第几次回归 |
| IsReturnPlayer | int | 是否回归玩家 0不是 1是 |
| RewardType | int | 奖励类型 0登陆奖励 1签到奖励 2回归增益奖励 |
| RewardDropIdList | string | 奖励ID列表 |
| RewardSendResult | int | 奖励发放状态 0成功 非0失败 |
| ReturnPlayerLogin | int | 1回归玩家登录 |

---

### 192. ActivityCenterPickOptionalTask

- **描述**: 玩家自选任务
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | uint64 | 活动ID |
| PickedTaskNum | uint32 | 选择的任务数量 |
| TaskIdList | string | 选择的任务ID |

---

### 193. MallRecoClientFlow

- **描述**: 客户端推荐页面流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| ActionType | string | 操作类型 |
| ActionValue | string | 操作细节 |

---

### 194. MechaClientFlow

- **描述**: 客户端机甲流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| ActionType | string | 操作类型 |
| ActionValue | string | 操作细节 |

---

### 195. NotifyAwardUseClientFlow

- **描述**: 客户端获得奖励界面流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| ActionType | string | 操作类型 |
| ActionValue | string | 操作细节 |

---

### 196. ClientActJump

- **描述**: 玩家跳转活动
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| ActivityID | int64 | 活动ID |
| JumpID | int32 | 跳转ID |

---

### 197. GCDStoryExploration

- **描述**: 鬼吹灯玩家探索奖励日志
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| AreaID | int32 | 兑换的故事卡的区域ID |
| ExploreCount | int32 | 本区域第几次兑换 |

---

### 198. GCDStoryDeployment

- **描述**: 鬼吹灯玩家派遣日志
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| AreaID | int32 | 派遣区域ID |
| Type | int32 | 派遣类型 0表示派遣 1表示领奖 |
| RewardID | int32 | 奖励ID |
| RewardCount | int32 | 奖励数量 |

---

### 199. GCDStoryRewardGeneral

- **描述**: 鬼吹灯玩家成功领奖日志
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| RewardList | string | 奖励列表 |
| Action | int32 | 玩家动作 |
| ExtraInfo | string | 额外信息 |

---

### 200. GuiGuBeiChuanTa

- **描述**: 鬼吹灯古碑传拓日志
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | int64 | 活动ID |
| Difficulty | int32 | 难度 直接上报难度ID |
| AcquireWay | int32 | 获取方式 0重置 1普通鉴文 2完美鉴文 |
| RewardNum | int32 | 奖励数量 |
| ConsumeStoneNum | int32 | 消耗的碎石碑数量 |

---

### 201. YiJiKanTanCatchUp

- **描述**: 鬼吹灯遗迹勘探追赶日志
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| ActivityId | int64 | 活动ID |
| MissionID | int64 | 任务ID |
| MissionCompleteCnt | int32 | 任务完成次数 |
| RewardID | int64 | 奖励ID |
| RewardNum | int32 | 奖励数量 |

---

### 202. PlayerFirstRechargeDoneFlow

- **描述**: 玩家完成首充
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonLevel | int | 赛季等级 |
| Reason | int | (必填)货币流动一级原因 |
| iMoney | int | (必填)动作涉及的金钱数 |

---

### 203. MidasFlow

- **描述**: 米大师流水
- **字段数**: 35
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ZoneId | int | 支付环境ID |
| SeasonLevel | int | 赛季等级 |
| Result | int | 处理结果，见错误码 |
| Reason | int32 | 原因 |
| OrderId | string | 订单ID（游戏业务侧） |
| OrderType | int32 | 订单类型，见 MidasOrderType，0RMB直购，1点券 |
| MidasOrderId | string | 订单ID（米大师侧） |
| OrderState | int32 | 订单状态，见 MidasOrderState |
| Pf | string | PF |
| PfKey | string | PF_KEY |
| AccessToken | string | Access token |
| PayToken | string | 支付token |
| PayTokenExpiredTime | int64 | 过期时间戳 |
| ShopId | int32 | 商城shop ID |
| GoodsId | int32 | 商城goods ID |
| ProductId | string | 商品Id |
| Quantity | int32 | 商品购买数量 |
| SellingPrice | int32 | 游戏侧下单时的原始单价(分) |
| OrigPrice | int32 | 米大师发货时原始单价(分) |
| ActivityId | string | 营销活动Id |
| ActivitySellPrice | int32 | 活动售价(分) |
| ActivityModelId | string | 活动模型ID |
| ActivityModelType | int32 | 活动类型 |
| MidasRet | int32 | 米大师错误码 |
| MidasErrCode | string | 米大师错误码（子串） |
| MidasMsg | string | 米大师错误信息 |

---

### 204. PlayerTractionGiftPackageNodeTrigger

- **描述**: 牵引礼包节点触发
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| SeasonLevel | int | 赛季等级 |
| ChapterId | uint32 | 章ID |
| SectionId | uint32 | 节ID |

---

### 205. PlayerTractionGiftPackageNodeReceive

- **描述**: 牵引礼包节点领取
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | 赛季ID |
| SeasonLevel | int | 赛季等级 |
| ChapterId | uint32 | 章ID |
| SectionId | uint32 | 节ID |

---

### 206. MallRecharge

- **描述**: 商城充值流水
- **字段数**: 22
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ZoneId | int | 支付环境ID |
| SeasonLevel | int | 赛季等级 |
| SeasonID | int | 赛季ID |
| AreaID | int | 大区ID：1-9为正式服 |
| ShopId | uint32 | 商城ID |
| GoodsId | uint32 | 商品ID |
| BuyCount | int | 购买商品数量 |
| FinalPrice | int32 | 充值花了多少（分） |
| GetTicketsNum | int32 | 获得多少逆战点（参考当时的配置，不一定是最终值） |
| Result | int | 错误码 |
| OrderState | int32 | 1.下单 2.收货 （通常逆战点/RMB 会有下单及收货状态，普通订单直接发货） |
| OrderId | string | 本次交易的订单ID（RMB/逆战点交易） |

---

### 207. TimeLimitPropUsedFlow

- **描述**: 限时道具使用流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iTimeLimitPropID | uint64 | （必填）限时道具ID |
| iTemplatePropID | uint64 | （必填）模板道具ID，永久和限时为同一个模板ID |
| iPropGID | uint64 | （必填）道具GID，唯一ID |

---

### 208. ModifyGameNickFlow

- **描述**: 修改玩家昵称
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| vOldGameNick | string | 修改前的玩家昵称 |
| vNewGameNick | string | 修改后的玩家昵称 |

---

### 209. ModifyGenderFlow

- **描述**: 修改玩家性别
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldGender | int | 修改前的性别 |
| iNewGender | int | 修改后的性别 |

---

### 210. ModifyPersonalSignFlow

- **描述**: 修改个性签名
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| vOldSign | string | 修改前的个性签名 |
| vNewSign | string | 修改后的个性签名 |

---

### 211. ModifyPersonalPageLocationFlow

- **描述**: 修改个人主页地址位置
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldLocation | uint64 | 修改前的LocationID |
| iNewLocation | uint64 | 修改后的LocationID |
| vOldSArea | string | 修改前的地理位置 |
| vNewSArea | string | 修改后的地理位置 |

---

### 212. ModifyPrefPlayTimeFlow

- **描述**: 修改游玩时段
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldPlayDay | int | 修改前的游玩时段（工作日/周末） |
| iOldPlayTime | int | 修改前的游玩时段（白天/夜晚） |
| iNewPlayDay | int | 修改后的游玩时段（工作日/周末） |
| iNewPlayTime | int | 修改后的游玩时段（白天/夜晚） |

---

### 213. ModifyPrefGameModeFlow

- **描述**: 修改偏好模式
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldPrefGameMode | int | 修改前的偏好模式 |
| iNewPrefGameMode | int | 修改后的偏好模式 |

---

### 214. ModifyPrefPlayModeFlow

- **描述**: 修改偏好打法
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldPrefPlayMode | int | 修改前的偏好打法 |
| iNewPrefPlayMode | int | 修改后的偏好打法 |

---

### 215. ModifyWantTypeFlow

- **描述**: 修改想找类型
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldWantType | int | 修改前的想找类型 |
| iNewWantType | int | 修改后的想找类型 |

---

### 216. ModifyPersonalPageLabelsFlow

- **描述**: 修改个人主页标签
- **字段数**: 16
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldLabel1 | int | 修改前的标签类型1 |
| iOldLabel2 | int | 修改前的标签类型2 |
| iOldLabel3 | int | 修改前的标签类型3 |
| iNewLabel1 | int | 修改后的标签类型1 |
| iNewLabel2 | int | 修改后的标签类型2 |
| iNewLabel3 | int | 修改后的标签类型3 |

---

### 217. ModifyUsedAvatarFlow

- **描述**: 使用玩家头像
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldAvatar | uint64 | 修改前的头像 |
| iNewAvatar | uint64 | 修改后的头像 |
| IsAuto | int | 是否过期自动替换，0-否，1-是 |

---

### 218. ModifyUsedAvatarFrameFlow

- **描述**: 使用玩家头像框
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldAvatarFrame | uint64 | 修改前的头像框 |
| iNewAvatarFrame | uint64 | 修改后的头像框 |
| IsAuto | int | 是否过期自动替换，0-否，1-是 |

---

### 219. ModifyUsedProfileCardFlow

- **描述**: 使用玩家个人名片
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iOldProfileCard | uint64 | 修改前的个人名片 |
| iNewProfileCard | uint64 | 修改后的个人名片 |
| IsAuto | int | 是否过期自动替换，0-否，1-是 |

---

### 220. GiveLikeFlow

- **描述**: 玩家点赞
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| iIsLike | int | 是否点赞，1-点赞，0-取消点赞 |
| BeLikedPlayerID | biguint | 被点赞的玩家ID |

---

### 221. PersonalPageViewFlow

- **描述**: 访问他人个人主页
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| Env | string | 服务器环境 |
| iLevel | int | (必填)等级 |
| PlayerId | biguint | 被访问的玩家ID |

---

### 222. PlayerClickButtonFlow

- **描述**: 玩家按钮点击响应流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| Action | string | 操作类型（首充/牵引礼包/...） |
| ButtonID | uint32 | 大厅按钮ID |

---

### 223. PlayerBrowseFlow

- **描述**: 玩家浏览流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| Level | int | (必填)等级 |
| Action | string | 操作类型（首充/牵引礼包/...） |
| View | uint32 | 界面ID |

---

### 224. PersonalPageLadderPrivate

- **描述**: 个人主页段位隐私
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| vOldLadderPrivateTag | string | 修改前的段位隐私，0=不显示，1=pvp段位，2=pve段位。0单独存在，1和2可同时存在 |
| vNewLadderPrivateTag | string | 修改后的段位隐私，0=不显示，1=pvp段位，2=pve段位。0单独存在，1和2可同时存在 |

---

### 225. PlatSubscribeFlow

- **描述**: 双平台订阅结果
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| AccountType | int | (必填)账号类型，1-微信，2-QQ |
| SubscribeID | string | (必填)订阅ID |
| SubscribeResult | int | (必填)订阅结果，1-已订阅，2-未订阅 |

---

### 226. SeasonCollectionOperate

- **描述**: 玩家每天/每周/每月/赛季/的赠送，求赠行为次数。以及对方回应求赠行为次数
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | (必填)赛季ID |
| PropId | uint64 | (必填)道具id |
| Operate | int | (必填)行为，1-赠送，2-求赠，3-回应求赠 4-接受礼物 |
| Uid | uint64 | (必填)消息唯一ID，用于关联 |
| TargetOpenID | string | 操作目标的OpenID |

---

### 227. SeasonCollectionReward

- **描述**: 赛季收集领奖次数
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| SeasonID | int | (必填)赛季ID |
| GroupID | int | (必填)组ID |

---

### 228. SeasonOrnamentCompose

- **描述**: 赛季挂饰合成
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| LeftPropIDList | string | (合成源头的道具ID，多个用英文分号分割 |
| RightPropIDList | string | 合成了的目标道具ID,多个用英文分好分割 |

---

### 229. SeasonChartViewPropFlow

- **描述**: 赛季图鉴道具获得流水
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| PropID | int | (必填)图鉴道具ID |

---

### 230. SeasonChartViewReward

- **描述**: 赛季图鉴领奖
- **字段数**: 10
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ProgressID | int | (必填)图鉴进度 ID |

---

### 231. PlayerCommercialExchangeShop

- **描述**: 商业化兑换商店流水
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| iSeasonID | int | 赛季id |
| iSeasonLevel | int | 赛季等级 |
| iActivityLottery | biguint | 活动id |
| iRewardId | biguint | 奖励id |
| iRewardNum | uint | 奖励数量 |
| iExchangeNum | uint | 兑换次数 |
| Result | int | 发送邮件的错误码，发送成功为0 |

---

### 232. BuildRecommendClickStrategy

- **描述**: 构筑推荐攻略访问
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| env | string | 环境 |
| iLevel | int | (必填)等级 |
| StrategyID | int | 攻略ID |
| ClickTimes | int | 访问次数 |

---

### 233. SavingActivityRewardFlow

- **描述**: 储蓄活动奖励变更流水
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| Reward | string | 储蓄奖励(格式prop_id1:num1;prop_id1:num2;...) |
| Reason | uint32 | 变更原因(0.新增 1.领取) |

---

### 234. InvitationBackActivityInvitor

- **描述**: 拉回活动发起邀请
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| InviteeId | string | 受邀请人ID |
| InvitationType | uint32 | 邀请类型(0.上线 1.对局) |

---

### 235. InvitationBackActivityInvitee

- **描述**: 拉回活动受邀请
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| InvitorId | string | 发起邀请人ID |
| InvitationType | uint32 | 邀请类型(0.上线 1.对局) |

---

### 236. CreateUnionPartner

- **描述**: 社团搭子求组发布
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| Declaration | string | 宣言 |
| Tag | string | 标签 格式:tagId1;tagId2;... |
| RegularDay | int32 | 常在日期 |
| RegularTime | int32 | 常在时段 |
| PrefGameMode | int32 | 偏好模式 |
| PrefPlayMode | int32 | 偏好打法 |
| Area | string | 所在地 |

---

### 237. UnionReserve

- **描述**: 社团预约组队
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ReserveId | uint64 | 预约ID |
| Operation | uint32 | 操作类型(0.创建 1.取消 2.同意 3.拒绝) |
| Members | string | 预约成员(ID1;ID2;...) |
| TeamType | uint32 | 组队类型(0.PVP 1.PVE) |

---

### 238. UnionImmediateTeamUp

- **描述**: 社团立刻组队的日志
- **字段数**: 9
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |

---

### 239. PlayerInteractFlow

- **描述**: 玩家点赞/酸柠檬流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| TargetPlayerID | uint64 | 对方PlayerID |
| InteractType | int | 0点赞 1酸柠檬 |
| IsFriend | int | 是否好友关系 |

---

### 240. PlayerLoginWeaponStatis

- **描述**: 玩家登录登出武器统计
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | (必填)服务器环境 |
| isLogin | int | (必填)登录or登出，1-登录，0-登出 |
| Sequence | biguint | (必填)批量上报时用于标识同一批次的唯一序号 |
| WeaponStatis | string | (必填)武器列表，格式为武器道具ID1,原武器ID1,剩余天数;武器道具ID2,原武器ID2,剩余天数;... 永久武器剩余天数报-1 |

---

### 241. PlayerSurrenderStatis

- **描述**: 投降统计流水
- **字段数**: 11
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| RoomId | uint64 | 对局ID |
| Detail | string | 发起时间,本人投票;  投票结果:0同意 1拒绝 2没投票 |

---

### 242. MicOpenFlow

- **描述**: 开麦交流流水
- **字段数**: 19
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| GameIn | int | 局内/局外，0=局外；1=局内 |
| MicType | int | 开麦模式，0=常驻开麦；1=按键开麦 |
| MicTime | int | 单次开麦时长 |
| RoomId | uint64 | 对局ID |
| TeamID | uint64 | 队伍ID |
| MapID | int | 地图ID |
| Relationship | int | 接受语音的关系：遍历房间内全部的队友，返回其与玩家关系的最小的，0=游戏好友；1=平台好友；2=社团成员；3=最近同玩；4=陌生人；5=黑名单； |
| ApplySource | int | 0=创建；1=组队平台；2=社团房间；3=世界招募；4=社团频道招募；5=兴趣频道招募；6=邀请游戏好友；7= 邀请平台好友；8= 邀请社团好友；9= 邀请最近同玩；10=申请；11=抖音一键上车；12=小程序邀请 |
| MicChannel | int | 开麦频道：0=全部；1=阵营；2=组队 |
| MicState | int | 开关状态：0=关闭； 1=开启； |

---

### 243. ReceiverFlow

- **描述**: 玩家操作听筒流水
- **字段数**: 14
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| GameIn | int | 局内/局外，0=局外；1=局内 |
| RoomId | uint64 | 对局ID |
| MapID | int | 地图ID |
| ReceiverState | int | 当前听筒状态:0=关闭听筒；1=开启听筒；2=切换至全部；3=切换至阵营；4=切换组队 |
| ReceiverTime | int | 持续时间 |

---

### 244. PlayerReputationScoreFlow

- **描述**: 玩家信誉分流水
- **字段数**: 12
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| iLevel | int | (必填)等级 |
| Env | string | 环境 |
| iValue | int | (必填)请求修改值 |
| iBeforeValue | int | (必填)修改前值 |
| iAfterValue | int | (必填)修改后值 |

---

### 245. WeaponFragmentAwardFlow

- **描述**: 武器碎片收集奖励
- **字段数**: 13
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| WeaponId | uint64 | 武器ID |
| FragmentProgress | string | 武器碎片数收集进度 |
| IsFail | int | 是否失败 |

---

### 246. AwardSeasonBattleProfitUpdateFlow

- **描述**: 奖励首胜次数变更流水日志
- **字段数**: 18
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| PlayerID | uint64 | (必填)获得掉落的玩家ID |
| SeasonID | int | (必填)赛季ID |
| HoldNum | uint32 | (必填)首胜剩余次数 |
| DeltaNum | int | (必填)首胜变更次数，正值为获得，负值为消耗，0说明：1.每日获得和当次消耗抵消了 2.每日获得时已达上限 |
| Sequence | biguint | (必填)用于关联奖励流水日志 |
| Reason | int | (必填)首胜变更原因，1.系统发放/重置 2.副本首胜消耗 3.首胜卡储备 4.网吧首胜次数消耗 |
| NetbarNum | uint32 | (必填)网吧首胜剩余次数 |
| NetbarDeltaNum | int | (必填)网吧首胜变更次数，正值为获得，负值为消耗，0说明：1.每日获得和当次消耗抵消了 2.每日获得时已达上限 |

---

### 247. PlayerHideAndSeekRoundGameDetail

- **描述**: 躲猫猫回合玩家流水表
- **字段数**: 29
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| AreaID | int | 大区ID：1-9为正式服 |
| iLevel | int | 玩家等级 |
| RoomID | uint64 | 该房间ID |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| RoundID | int | 回合ID |
| IsWin | int | 是否胜利 |
| CampType | int | 阵营：1找猫者 2躲藏者 |
| AliveDuration | int | 存活时间 |
| UseSkillCount | int | 使用技能次数 |
| IsDropOut | int | 是否中途退出 |
| DropOutState | int | 中退的游戏阶段 |
| IsAliveOnEnd | int | 躲藏者时 游戏结束时是否存活 |
| TransformationItemIdList | string | 躲藏者使用的道具ID |
| HiderBuyTransformationItemId | uint64 | 开局时购买的道具ID |
| HiderDeathRoundState | int32 | 被逮捕时游戏阶段 |
| HiderDeathTransformationItemId | uint64 | 被逮捕时使用的道具ID |
| UseTransformationItemSpecialSkillCount | int32 | 使用变身道具自带的特殊技能次数 只在变身道具有自带技能时统计数据 |
| SeekerBuyItemId | int | 找猫者开局时购买的道具 |
| SeekerPickSkillIdList | string | SeekerPickSkillIdList |
| IsBot | int | 是否是人机 |

---

### 248. HideAndSeekGameRoundTotal

- **描述**: 躲猫猫回合房间流水表
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| Env | string | 服务器环境 |
| RoomID | uint64 | 该房间ID |
| MapId | int | 地图ID |
| DungeonID | int | 副本ID |
| RoundID | int | 回合ID |
| WinnerCampType | int | 胜利阵营 1找猫者 2躲藏者 |
| HiderAliveCount | int | 躲藏者存活人数 |
| HiderDeathCount | int | 躲藏者被逮捕人数 |

---

### 249. InjectLuckyMoney

- **描述**: 发放红包
- **字段数**: 15
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| ActivitySubId | uint32 | 子活动ID |
| RoundId | uint32 | 活动轮次 |
| Num | uint32 | 注入红包数量 |
| Type | uint32 | 红包类型(0.真实红包, 1.注水红包) |

---

### 250. GrabLuckyMoney

- **描述**: 抢红包
- **字段数**: 17
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ActivityId | uint64 | 活动ID |
| ActivitySubId | uint32 | 子活动ID |
| RoundId | uint32 | 活动轮次 |
| Type | uint32 | 红包类型(0.真实红包, 1.注水红包) |
| RewardId | uint32 | 奖励ID |
| BigReward | uint32 | 是否大奖 |
| EmptyTime | int64 | 红包抢空时间 |

---

### 251. MallZeroYuanBuy

- **描述**: 商城0元购监控
- **字段数**: 27
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID，NZM该字段为PlayerID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| env | string | 环境 |
| ZoneId | int | 支付环境ID |
| SeasonLevel | int | 赛季等级 |
| SeasonID | int | 赛季ID |
| AreaID | int | 大区ID：1-9为正式服 |
| ShopId | uint32 | 商城ID |
| GoodsId | uint32 | 商品ID |
| BuyCount | int | 购买商品数量 |
| ItemCount | int | 购买后商品数量 |
| Result | int | 错误码 |
| DiscountTicketList | string | 使用优惠券ID，多个以 ; 分割 |
| CostPropList | string | 支出列表以 ; 分割 propId:propNum;propId:propNum |
| RecivePropList | string | 产出列表以 ; 分割 propId:propNum;propId:propNum |
| GiftPropList | string | 产出列表以 ; 分割 propId:propNum;propId:propNum |
| SellingPrice | int32 | 原始售价 |
| DiscountPrice | int32 | 配置折扣后售价 |
| UseTicketPrice | int32 | 使用优惠券后售价 |
| FinalPrice | int32 | 实际最终售价 |

---

### 252. DsGameLogPlayerCurAwardScore

- **描述**: 已作废
- **字段数**: 19
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| vRoleName | string | (必填)玩家角色名 |
| iLevel | int | (必填)等级 |
| Env | string | 服务器环境 |
| RoomID | uint64 | DS房间ID |
| DungeonID | int | 副本ID |
| DungeonArea | int | 副本区域 |
| DropID | uint64 | 掉落ID |
| Score | uint64 | 当前玩家的总积分 |
| TotalScore | uint64 | 所有玩家的总积分 |
| CurrentAwardScore | uint64 | 当前奖励阶段当前玩家的积分 |
| CurrentTotalAwardScore | uint64 | 当前奖励阶段所有玩家的积分 |
| CurrentAwardScorePercentage | float | 当前奖励阶段当前玩家积分占比 |

---

### 253. DsGameLogPlayerCurAwardScore2

- **描述**: DS玩家当前奖励阶段分数上报
- **字段数**: 18
- **来源**: nzm_tlog_desc_tdw_20260127_v1.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| GameSvrId | string | (必填)登录服务ID，分区服场景使用，合服后上报合服后服务器ID。 |
| dtEventTime | datetime | (必填)游戏事件的时间, 格式 YYYY-MM-DD HH:MM:SS |
| vGameAppid | string | (必填)游戏APPID。无论是否正式环境，都报正式的appid |
| PlatID | int | (必填)0:ios,1:android,2:PC,12:鸿蒙 |
| iZoneAreaID | int | (必填)注册服ID，分区服场景使用。其他场景时填写0 |
| vOpenID | string | (必填)用户OPENID号 |
| vRoleID | string | (必填)玩家角色ID |
| Env | string | 服务器环境 |
| iLevel | int | (必填)等级 |
| RoomID | uint64 | DS房间ID |
| DungeonID | int | 副本ID |
| DungeonArea | int | 副本区域 |
| DropID | uint64 | 掉落ID |
| Score | uint64 | 当前玩家的总积分 |
| TotalScore | uint64 | 所有玩家的总积分 |
| CurrentAwardScore | uint64 | 当前奖励阶段当前玩家的积分 |
| CurrentTotalAwardScore | uint64 | 当前奖励阶段所有玩家的积分 |
| CurrentAwardScorePercentage | float | 当前奖励阶段当前玩家积分占比 |

---

### 254. dwd_sr_codez_player_activetag_di

- **描述**: 玩家活跃标签宽表（日增量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev
- **字段数**: 4
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| dtstatdate | string | 统计日期，格式 YYYY-MM-DD，分区字段 |
| vopenid | string | 用户OPENID |
| itype | int | 游戏活跃类型：1=近一个月活跃，2=近2~3个月活跃，3=流失3个月以上 |
| busi_name | string | 游戏来源渠道名称，NULL表示盘外来源（用COALESCE处理） |

---

### 255. dwd_sr_codez_player_losstag_di

- **描述**: 玩家流失标签宽表（日增量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev
- **字段数**: 5
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| dtstatdate | string | 统计日期，格式 YYYY-MM-DD，分区字段 |
| vopenid | string | 用户OPENID |
| itype | int | 玩家IP类型编码 |
| is_core | string | 玩家定义：核心/次核/NULL(其他玩家) |
| from_tag | string | IP类型标签：ip/not ip/NULL(其他玩家)，可忽略 |

---

### 256. dim_sr_codez_player_losstag_df

- **描述**: 玩家流失标签维度表（日全量），分区字段 dtstatdate，命名空间 codez_dev_sr.codez_dev
- **字段数**: 4
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| dtstatdate | string | 统计日期，格式 YYYY-MM-DD，分区字段 |
| suin | string | 用户标识（用于去重统计用户数） |
| is_core | string | 玩家定义：核心/次核/NULL(其他玩家) |
| from_tag | string | IP类型标签：ip/not ip/NULL(其他玩家)，可忽略 |

---

### 257. ads_sr_codez_actv_di

- **描述**: 活跃汇总表（日增量），分区字段 dteventtime，命名空间 codez_dev_sr.codez_dev
- **字段数**: 4
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| dteventtime | string | 事件日期，格式 YYYY-MM-DD，分区字段 |
| vopenid | string | 用户OPENID |
| platid | int | 平台ID，255=全平台汇总，0=iOS，1=Android，2=PC，12=鸿蒙 |
| onln_time | int | 在线时长（单位待确认，可能为秒或分钟） |

---

### 258. ads_sr_codez_pay_di

- **描述**: 付费汇总表（日增量），分区字段 dteventtime，命名空间 codez_dev_sr.codez_dev
- **字段数**: 4
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| dteventtime | string | 事件日期，格式 YYYY-MM-DD，分区字段 |
| vopenid | string | 用户OPENID |
| platid | int | 平台ID，255=全平台汇总，0=iOS，1=Android，2=PC，12=鸿蒙 |
| pay_amt | float | 付费金额（单位待确认，可能为元） |

---

### 259. codez_ret_excelconfiginfo_conf

- **描述**: 通用配置表，命名空间 codez_dev_sr.codez_dev 或 codez_dev，通过 configname 区分不同配置类型
- **字段数**: 9
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| configname | string | 配置类型名称，如 FubenEntranceInfo |
| param1 | string | 参数1，FubenEntranceInfo 时为 dungeon_id（需 CAST AS BIGINT） |
| param2 | string | 参数2，FubenEntranceInfo 时为 map_id |
| param3 | string | 参数3 |
| param4 | string | 参数4，FubenEntranceInfo 时为玩法模式名称(mode_name)，已知值：塔防/机甲战/僵尸猎场/猎场竞速/时空追猎/躲猫猫 |
| param5 | string | 参数5，FubenEntranceInfo 且 param4=僵尸猎场 时为猎场副本细分分类 |
| param6 | string | 参数6 |
| param7 | string | 参数7，FubenEntranceInfo 时为 map_name |
| param8 | string | 参数8，FubenEntranceInfo 时为难度 |

---

### 260. dwd_sr_codez_social_wide_di

- **描述**: 社交宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev
- **字段数**: 1
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| p_date | string | 分区日期，格式 YYYY-MM-DD |

---

### 261. dwd_sr_codez_item_di

- **描述**: 道具宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev
- **字段数**: 1
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| p_date | string | 分区日期，格式 YYYY-MM-DD |

---

### 262. dwd_sr_codez_matchteamtype_di

- **描述**: 组队类型宽表（日增量），分区字段 p_date，命名空间 codez_dev_sr.codez_dev
- **字段数**: 1
- **来源**: sr_tables_desc.xml

| 字段名 | 类型 | 描述 |
|--------|------|------|
| p_date | string | 分区日期，格式 YYYY-MM-DD |

---

