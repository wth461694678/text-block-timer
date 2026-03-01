

-- ******************************************
-- 聚类特征
-- ******************************************
with player as 
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026011323'
    AND env = 'live'
    and registchannel not like '59%'
),

-- 登出表字段
logout as 
(SELECT 
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days 
    ,max(case when ilevel < 0 then -3-ilevel else ilevel end) as ilevel
    ,max(case when iGuildID<>0 then 1 else 0 end) as iGuildID
    ,sum(OnlineTime) as OnlineTime_all
    ,if(sum(if(platid = 2,OnlineTime,0))>0,1,0) as if_pc
    ,max(gamefriendnum) as gamefriendnum
    ,max(PlatformFriendNum) as PlatformFriendNum
    ,max(allfriendnum) as allfriendnum
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    AND env = 'live'
group BY
    vopenid
),

-- BP等级
BPlevel as
(select 
    vopenid
    ,max(BPLevel) as BPLevel
from
    ieg_tdbank::codez_dsl_SeasonBPLevelUp_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group BY
    vopenid
),

-- 社交（修正字段）
team_rate as
(select
    vopenid
    ,sum(teamnum) as teamnum
    ,sum(world_chat_times) as world_chat_times
    ,sum(friend_chat_times) as friend_chat_times
    ,sum(give_gift_times) as give_gift_times
    ,sum(get_gift_times) as get_gift_times
from
    codez_dev_sr.codez_dev.dwd_sr_codez_social_wide_di
where p_date between '${sys_starttime}' and '${sys_endtime}'
group by
    vopenid
),

-- 好友组队局数
friend_team as (
select
    vopenid
    ,count(distinct roomid) as friend_game_num 
from
    codez_dev_sr.codez_dev.dwd_sr_codez_matchteamtype_di
where p_date between '${sys_starttime}' and '${sys_endtime}'
and final_TeamApplySource in (7,10,11)
group by
    vopenid
),

-- 猎场赠送金币次数（修正：添加逗号）
lc_givegold as (
select
    vopenid,  -- ★修正：添加逗号
    sum(LENGTH(GivenGold) - LENGTH(REPLACE(GivenGold, ':', ''))) as givegold_times
from
    ieg_tdbank::codez_dsl_PlayerHuntingFieldPartitionGameDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),

-- 塔防陷阱伤害占比
defense as  
(select  
vopenid  
,avg(trap_damage_rate) as trap_damage_rate  
,avg(BuildTrapCount) as BuildTrapCount  
from  
(select  
vopenid  
,roomid  
,sum(BuildTrapCount) as BuildTrapCount  
,sum(AllTrapsDamage)/sum(AllDamages) as trap_damage_rate  
from  
ieg_tdbank::codez_dsl_PlayerTowerDefenseRoundGameDetail_fht0  
WHERE  
tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'  
and env = 'live'  
group by  
vopenid  
,roomid)  
group by  
vopenid),

-- 各模式占比、猎场相关指标（修正：添加GROUP BY）
gamedetail as 
(select
    gamedetail_sub.vopenid
    ,count(distinct dsroomid) as game_num
    ,avg(if(map_id = '僵尸猎场',iswin,null)) as lc_win_rate
    ,avg(if(map_id = '僵尸猎场',is_drop,null)) as lc_drop_rate
    ,avg(if(map_id = '塔防',iswin,null)) as tf_win_rate
    ,avg(if(map_id = '塔防',is_drop,null)) as tf_drop_rate
    ,avg(if(map_id = '僵尸猎场' and is_drop = 0,lc_rank,null)) as lc_rank
    ,avg(if(map_id = '塔防' and is_drop = 0,lc_rank,null)) as tf_rank
    ,count(distinct if(map_id = '僵尸猎场', dsroomid,null))/count(distinct dsroomid) as lc_rate
    ,count(distinct if(map_id = '时空追猎', dsroomid,null))/count(distinct dsroomid) as zl_rate
    ,count(distinct if(map_id = '塔防', dsroomid,null))/count(distinct dsroomid) as tf_rate
    ,count(distinct if(map_id = '机甲战', dsroomid,null))/count(distinct dsroomid) as jj_rate
    ,count(distinct if(map_id = '挑战副本', dsroomid,null))/count(distinct dsroomid) as tz_rate
    ,count(distinct if(map_id = '猎场竞速', dsroomid,null))/count(distinct dsroomid) as js_rate
    ,sum(if(map_id = '僵尸猎场',ikills,0))/nullif(count(distinct if(map_id = '僵尸猎场', dsroomid,null)),0) as lc_avg_kills
    ,sum(if(map_id = '僵尸猎场',ideaths,0))/nullif(count(distinct if(map_id = '僵尸猎场', dsroomid,null)),0) as lc_avg_die
    ,sum(if(map_id = '僵尸猎场',Damage,0))/nullif(sum(if(map_id = '僵尸猎场',iDuration,0)),0) as lc_avg_dps
    ,sum(if(map_id = '僵尸猎场',iDuration,0))/nullif(count(distinct if(map_id = '僵尸猎场', dsroomid,null)),0) as lc_avg_duration
    ,max(if(map_id = '僵尸猎场',map_difficulty,0)) as lc_max_difficulty
    ,max(if(map_id = '塔防',map_difficulty,0)) as tf_max_difficulty
    ,avg(iswin) as win_rate
    ,avg(is_drop) as drop_rate
    ,count(distinct iDungeonid) as dungeon_num
    ,sum(if(idungeonid = 2004013,is_drop,0))/nullif(count(distinct if(idungeonid = 2004013, dsroomid,null)),0) as ddh_hero_droprate
    ,avg(if(map_id = '塔防',iIsBossKilled,null)) as tf_boss_kill_rate
from
(select
    vopenid
    ,dsroomid
    ,iDungeonID
    ,iDuration
    ,ikills
    ,ideaths
    ,Damage
    ,0 as is_drop
    ,rank as lc_rank
    ,if(iIswin = 1, 1, 0) as iswin
from
    ieg_tdbank::codez_dsl_GameDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
union all
select
    vopenid
    ,dsroomid
    ,iDungeonID
    ,iDuration
    ,ikills
    ,ideaths
    ,Damage
    ,1 as is_drop
    ,0 as lc_rank
    ,0 as iswin
from
    ieg_tdbank::codez_dsl_dropoutDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
) gamedetail_sub
LEFT JOIN
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      param8,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '挑战模式' then 6
      when param8 = '挑战' then 6
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','竞技') or param4 = '机甲战')
) excelconfig on gamedetail_sub.iDungeonID = excelconfig.dungeon_id
left join
(select
    vopenid
    ,roomid
    ,DungeonID
    ,min(iIsBossKilled) as iIsBossKilled
from
    ieg_tdbank::codez_dsl_GameBossDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
    ,roomid
    ,dungeonID
) bossdetail on gamedetail_sub.vopenid = bossdetail.vopenid 
    and gamedetail_sub.dsroomid = bossdetail.roomid 
    and gamedetail_sub.iDungeonID = bossdetail.DungeonID
GROUP BY gamedetail_sub.vopenid  -- ★修正：添加GROUP BY
),

-- 机甲战段位
jj_rank as
(select
    vopenid,
max(if(cast(DungeonID as string) like '300%', ranklevel, null)) as jj_ranklevel,
max(if(cast(DungeonID as string) like '200%', ranklevel, null)) as js_ranklevel
from
    ieg_tdbank::codez_dsl_LadderRankLevelFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
GROUP BY
    vopenid
),

-- 抽奖次数（修正：group by字段）
lottery as
(select
    vopenid
    ,max(CurrDraw) as lottery_num
from
    ieg_tdbank::codez_dsl_MallLottery_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid  -- ★修正：原为MallLottery
),  -- ★修正：添加逗号

-- 任务完成情况
TASK_FINISHED as
(SELECT
    vopenid
    ,COUNT(DISTINCT IF(tasktype = 1, concat(tdbank_imp_date,taskid),null)) AS DAYLIY_TASK_FINISHED
    ,COUNT(DISTINCT IF(tasktype = 2, concat(tdbank_imp_date,taskid),null)) AS WEEKLY_TASK_FINISHED
    ,COUNT(DISTINCT IF(tasktype = 3, concat(tdbank_imp_date,taskid),null)) AS chanllege_TASK_FINISHED
    ,COUNT(DISTINCT IF(tasktype = 4, concat(tdbank_imp_date,taskid),null)) AS season_TASK_FINISHED
FROM
    ieg_tdbank::codez_dsl_SeasonTask_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    and status = 2
GROUP BY
    vopenid
),

-- 金枪个数、紫枪个数等（修正字段名）
GUN_Warframe as 
(select
    vopenid,
    -- 武器（修正字段名以匹配SELECT）
    COUNT(DISTINCT CASE WHEN itemtype = 2 and SUBSTR(itemid, 4, 2) != '13' and SUBSTR(itemid, 8, 1) = '0' and itemquality = 3 and itemsubtype = 1 THEN itemid END) as purple_gun_num,
    COUNT(DISTINCT CASE WHEN itemtype = 2 and SUBSTR(itemid, 4, 2) != '13' and SUBSTR(itemid, 8, 1) = '0' and itemquality = 4 and itemsubtype = 1 THEN itemid END) as gold_gun_num,
    COUNT(DISTINCT CASE WHEN itemtype = 2 and SUBSTR(itemid, 4, 2) != '13' and SUBSTR(itemid, 8, 1) = '0' and itemquality = 4 and itemsubtype = 1 and itemid in (20116000008,20106000011,20107000026,20103000016) THEN itemid END) as Golden_Gun_bus,
    COUNT(DISTINCT CASE WHEN itemtype = 2 and SUBSTR(itemid, 4, 2) = '13' and SUBSTR(itemid, 8, 1) = '0' and itemquality = 3 and itemsubtype = 1 THEN itemid END) as purple_Knife,
    COUNT(DISTINCT CASE WHEN itemtype = 2 and SUBSTR(itemid, 4, 2) = '13' and SUBSTR(itemid, 8, 1) = '0' and itemquality = 4 and itemsubtype = 1 THEN itemid END) as Golden_Knife,
    -- 插件（修正字段名）
    COUNT(DISTINCT CASE WHEN itemtype = 2 and itemquality = 3 and itemsubtype = 7 THEN itemid END) as purple_plugin_num,
    COUNT(DISTINCT CASE WHEN itemtype = 2 and itemquality = 4 and itemsubtype = 7 THEN itemid END) as gold_plugin_num,
    -- 蓝图
    sum(CASE WHEN itemtype = 2 and itemquality = 3 and itemsubtype = 9 THEN itemcnt END) as purple_Gun_dwg,
    sum(CASE WHEN itemtype = 2 and itemquality = 4 and itemsubtype = 9 THEN itemcnt END) as Golden_Gun_dwg,
    -- 碎片
    max(CASE WHEN itemquality = 4 and itemid = 40305110000 THEN itemcnt END) as Golden_Gun_frag,
    -- 体验卡
    sum(CASE WHEN itemtype = 4 and itemquality = 3 and itemsubtype = 3 and SUBSTR(itemid, 7, 2) = 12 THEN itemcnt END) as purple_Gun_exp,
    sum(CASE WHEN itemtype = 4 and itemquality = 4 and itemsubtype = 3 and SUBSTR(itemid, 7, 2) = 12 THEN itemcnt END) as Golden_Gun_exp

from
    codez_dev_sr.codez_dev.dwd_sr_codez_item_di 
where p_date between '${sys_starttime}' and '${sys_endtime}'
   and env = 'live'
   and itemquality >= 3
   and itemtype in (2,4)
   and itemthreetype != 11
   and itemthreetype != 80
group by 
    vopenid
),

-- 插件合成数
plug_add as
(select
    vopenid,
    SUM(IF(AddOrReduce=0, iCount, 0)) as plug_comp_add
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    and Reason = 143
group by
    vopenid
),

-- 推荐方案使用次数
clientbuild as
(select
    vopenid
    ,count(distinct dteventtime) as clientbuild_num
from
    ieg_tdbank::codez_dsl_ClientBuildRecommendApplyScheme_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),

-- 平均赛季技能使用次数
PlayerBDDamage as 
(select
    vopenid
    ,avg(SeasonSkillUseCount) as avg_SeasonSkillUseCount
    ,avg(SchemeID_num) as avg_SchemeID_num
from
(select
    vopenid
    ,roomid
    ,sum(SeasonSkillUseCount) as SeasonSkillUseCount
    ,count(distinct SchemeID) as SchemeID_num
from
    ieg_tdbank::codez_dsl_PlayerBDDamageStatData_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
    ,roomid
) t
group by
    vopenid
),

-- 武器体验数
weapon_exp as
(select
    vopenid
    ,count(distinct WeaponID1) + count(distinct WeaponID2) + count(distinct WeaponID3) as weapon_exp_num
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    and ReportType in (1,2,3)
group by
    vopenid
),

-- 平均切换背包次数
agme_bag_use as
(select
    vopenid
    ,avg(ChangeCount) as ChangeCount
from
    ieg_tdbank::codez_dsl_PlayerDSChangeSchemeFlow_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),

-- BP购买
BP_buy as 
(select
    vopenid,
    1 as BP_buy
from
    ieg_tdbank::codez_dsl_seasonbuybp_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    and BuyType = 1
group by
    vopenid
),

-- 角色购买（★修正：添加CTE名称）
role_buy as
(select
    vopenid,
    count(distinct goodsid) as role_buy_num
from
    ieg_tdbank::codez_dsl_mallbuy_fht0
where
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}' 
    and orderstate = 3 
    and env = 'live' 
    and Money1Id = 45222010001 
    and goodsid in (300090002,300090003)
group by
    vopenid
),

-- 玩家随机宝箱获得和使用数
randombox as 
(select
    vopenid
    ,SUM(IF(AddOrReduce=0, iCount, 0)) as BOX_ADD
    ,SUM(IF(AddOrReduce=1, iCount, 0)) as BOX_USE
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    AND iGoodsId IN ('40305070001','40305070005')
group by
    vopenid
),

-- PVP背包使用数、PVE背包使用数
bag_use as
(SELECT
    vopenid
    ,count(distinct if(SchemeTabType = 1 and WeaponID1<>'0', SchemeID, null)) as pve_bag_num
    ,count(distinct if(SchemeTabType = 2 and WeaponID1<>'0', SchemeID, null)) as pvp_bag_num
FROM
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
GROUP BY
    vopenid
),


-- 付费金额
tbwater as
(select 
    vopenid
    ,sum(imoney)/100 as imoney
from 
    hy_idog_oss::codez_mid_tbwater
where dtstatdate >= '${dtstatdate_begin}' and dtstatdate <= '${dtstatdate_end}' and platid = 255
group by
    vopenid
),

-- 进入彩蛋房间次数
caidan_room as
(select
    vopenid
    ,count(distinct if(isgoingeggroom=1,roomid,null))/nullif(count(distinct roomid),0) as caidan_room_num
from
    ieg_tdbank::codez_dsl_HuntingFieldGameDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),

-- 留存判断
is_Stay as
(select
    distinct 
    vopenid
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_return}' and '${END_return}'
    AND env = 'live'
)

-- ==================== 最终查询 ====================
select
    player.vopenid,
    
    -- logout
    IFNULL(logout.ilevel, 0)                            as ilevel,
    IFNULL(logout.iGuildID, 0)                          as iGuildID,
    IFNULL(logout.OnlineTime_all, 0)                    as OnlineTime_all,
    IFNULL(logout.act_days, 0)                          as act_days,
    IFNULL(logout.gamefriendnum, 0)                     as gamefriendnum,          -- ★补全
    IFNULL(logout.PlatformFriendNum, 0)                 as PlatformFriendNum,      -- ★补全
    IFNULL(logout.allfriendnum, 0)                      as allfriendnum,           -- ★补全
    ifnull(logout.if_pc,0)                              as if_pc,

    IFNULL(gamedetail.game_num, 0)/IFNULL(logout.act_days, 0)  as game_num_peractday,



    -- gamedetail（包含win_drop_rate）
    IFNULL(gamedetail.game_num, 0)                      as game_num,
    IFNULL(gamedetail.lc_rate, 0)                       as lc_rate,
    IFNULL(gamedetail.zl_rate, 0)                       as zl_rate,               -- ★补全
    IFNULL(gamedetail.tf_rate, 0)                       as tf_rate,
    IFNULL(gamedetail.jj_rate, 0)                       as jj_rate,
    IFNULL(gamedetail.tz_rate, 0)                       as tz_rate,
    IFNULL(gamedetail.js_rate, 0)                       as js_rate,
    IFNULL(gamedetail.lc_avg_kills, 0)                  as lc_avg_kills,
    IFNULL(gamedetail.lc_avg_die, 0)                    as lc_avg_die,
    IFNULL(gamedetail.lc_avg_dps, 0)                    as lc_avg_dps,
    IFNULL(gamedetail.lc_avg_duration, 0)               as lc_avg_duration,
    IFNULL(gamedetail.lc_max_difficulty, 0)             as lc_max_difficulty,
    IFNULL(gamedetail.tf_max_difficulty, 0)             as tf_max_difficulty,
    IFNULL(gamedetail.lc_win_rate, 0)                   as lc_win_rate,           -- ★补全
    IFNULL(gamedetail.lc_drop_rate, 0)                  as lc_drop_rate,          -- ★补全
    IFNULL(gamedetail.tf_win_rate, 0)                   as tf_win_rate,           -- ★补全
    IFNULL(gamedetail.tf_drop_rate, 0)                  as tf_drop_rate,          -- ★补全
    IFNULL(gamedetail.lc_rank, 0)                       as lc_rank,               -- ★补全
    IFNULL(gamedetail.tf_rank, 0)                       as tf_rank,               -- ★补全
    IFNULL(gamedetail.dungeon_num, 0)                   as dungeon_num,           -- ★补全
    IFNULL(gamedetail.ddh_hero_droprate, 0)             as ddh_hero_droprate,     -- ★补全
    IFNULL(gamedetail.tf_boss_kill_rate, 0)             as tf_boss_kill_rate,     -- ★补全
    IFNULL(jj_rank.jj_ranklevel, 0)                        as jj_avg_rank,
    IFNULL(jj_rank.js_ranklevel, 0)                        as js_avg_rank,
    IFNULL(gamedetail.win_rate, 0)             as win_rate,     -- ★补全
    IFNULL(gamedetail.drop_rate, 0)             as drop_rate,     -- ★补全
    

    -- defense（塔防陷阱相关）
    IFNULL(defense.BuildTrapCount, 0)               as BuildTrapCount,    -- ★新增

    -- team_rate
    IFNULL(team_rate.teamnum, 0)                        as teamnum,               -- ★补全
    IFNULL(team_rate.world_chat_times, 0)               as world_chat_times,      -- ★补全
    IFNULL(team_rate.friend_chat_times, 0)              as friend_chat_times,     -- ★补全
    IFNULL(team_rate.give_gift_times, 0)                as give_gift_times,       -- ★补全
    IFNULL(team_rate.get_gift_times, 0)                 as get_gift_times,        -- ★补全

    -- TASK_FINISHED
    IFNULL(TASK_FINISHED.DAYLIY_TASK_FINISHED, 0)       as DAYLIY_TASK_FINISHED,
    IFNULL(TASK_FINISHED.WEEKLY_TASK_FINISHED, 0)       as WEEKLY_TASK_FINISHED,
    IFNULL(TASK_FINISHED.chanllege_TASK_FINISHED, 0)    as chanllege_TASK_FINISHED,
    IFNULL(TASK_FINISHED.season_TASK_FINISHED, 0)       as season_TASK_FINISHED,

    -- GUN_Warframe
    IFNULL(GUN_Warframe.gold_gun_num, 0)                as gold_gun_num,
    IFNULL(GUN_Warframe.purple_gun_num, 0)              as purple_gun_num,
    IFNULL(GUN_Warframe.gold_plugin_num, 0)             as gold_plugin_num,
    IFNULL(GUN_Warframe.purple_plugin_num, 0)           as purple_plugin_num,
    IFNULL(GUN_Warframe.Golden_Gun_bus, 0)              as Golden_Gun_bus,        -- ★补全
    IFNULL(GUN_Warframe.purple_Knife, 0)                as purple_Knife,          -- ★补全
    IFNULL(GUN_Warframe.Golden_Knife, 0)                as Golden_Knife,          -- ★补全
    IFNULL(GUN_Warframe.purple_Gun_dwg, 0)              as purple_Gun_dwg,        -- ★补全
    IFNULL(GUN_Warframe.Golden_Gun_dwg, 0)              as Golden_Gun_dwg,        -- ★补全
    IFNULL(GUN_Warframe.Golden_Gun_frag, 0)             as Golden_Gun_frag,       -- ★补全
    IFNULL(GUN_Warframe.purple_Gun_exp, 0)              as purple_Gun_exp,        -- ★补全
    IFNULL(GUN_Warframe.Golden_Gun_exp, 0)              as Golden_Gun_exp,        -- ★补全

    -- bag_use
    IFNULL(bag_use.pve_bag_num, 0)                      as pve_bag_num,
    IFNULL(bag_use.pvp_bag_num, 0)                      as pvp_bag_num,

    -- tbwater
    IFNULL(tbwater.imoney, 0)                           as imoney,
    if(IFNULL(tbwater.imoney, 0) > 0, 1, 0)             as ifcost,

    -- caidan_room
    coalesce(IFNULL(caidan_room.caidan_room_num, 0)/ifnull(game_num*lc_rate,0),0)              as caidan_room_rate,

    -- is_Stay
    If(is_Stay.vopenid is not null, 1, 0)               as stay_rate,

    -- randombox
    IFNULL(randombox.BOX_ADD, 0)                        as BOX_ADD,
    IFNULL(randombox.BOX_USE, 0)                        as BOX_USE,

    -- ★补全：以下为原CTE中定义但未读取的字段
    IFNULL(BPlevel.BPLevel, 0)                          as BPLevel,
    coalesce(IFNULL(friend_team.friend_game_num, 0)/ifnull(game_num,0),0)              as friend_game_rate,
    IFNULL(lc_givegold.givegold_times, 0)               as givegold_times,
    IFNULL(defense.trap_damage_rate, 0)                 as trap_damage_rate,
    IFNULL(lottery.lottery_num, 0)                      as lottery_num,
    IFNULL(plug_add.plug_comp_add, 0)                   as plug_comp_add,
    IFNULL(clientbuild.clientbuild_num, 0)              as clientbuild_num,
    IFNULL(PlayerBDDamage.avg_SeasonSkillUseCount, 0)   as avg_SeasonSkillUseCount,
    IFNULL(PlayerBDDamage.avg_SchemeID_num, 0)          as avg_SchemeID_num,
    IFNULL(weapon_exp.weapon_exp_num, 0)                as weapon_exp_num,
    IFNULL(agme_bag_use.ChangeCount, 0)                 as avg_ChangeCount,
    IFNULL(BP_buy.BP_buy, 0)                            as BP_buy,
    IFNULL(role_buy.role_buy_num, 0)                    as role_buy_num

from
    player
    -- ★修正：移除不存在的regi表
    left JOIN logout on player.vopenid = logout.vopenid
    left JOIN bag_use on player.vopenid = bag_use.vopenid
    left JOIN GUN_Warframe on player.vopenid = GUN_Warframe.vopenid
    left JOIN TASK_FINISHED on player.vopenid = TASK_FINISHED.vopenid
    left JOIN gamedetail on player.vopenid = gamedetail.vopenid
    left JOIN team_rate on player.vopenid = team_rate.vopenid  -- ★修正：改为vopenid关联
    left JOIN tbwater on player.vopenid = tbwater.vopenid
    left JOIN caidan_room on player.vopenid = caidan_room.vopenid
    left JOIN is_Stay on player.vopenid = is_Stay.vopenid
    left JOIN jj_rank on player.vopenid = jj_rank.vopenid
    left JOIN randombox on player.vopenid = randombox.vopenid
    -- ★补全：添加原CTE但未JOIN的表
    left JOIN BPlevel on player.vopenid = BPlevel.vopenid
    left JOIN friend_team on player.vopenid = friend_team.vopenid
    left JOIN lc_givegold on player.vopenid = lc_givegold.vopenid
    left JOIN defense on player.vopenid = defense.vopenid
    left JOIN lottery on player.vopenid = lottery.vopenid
    left JOIN plug_add on player.vopenid = plug_add.vopenid
    left JOIN clientbuild on player.vopenid = clientbuild.vopenid
    left JOIN PlayerBDDamage on player.vopenid = PlayerBDDamage.vopenid
    left JOIN weapon_exp on player.vopenid = weapon_exp.vopenid
    left JOIN agme_bag_use on player.vopenid = agme_bag_use.vopenid
    left JOIN BP_buy on player.vopenid = BP_buy.vopenid
    left JOIN role_buy on player.vopenid = role_buy.vopenid
;