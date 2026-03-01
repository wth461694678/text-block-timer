-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--社交因果研究取数
--筛选首日注册
with player as 
(select 
    *
from 
    codez_mid_analysis.codez_vopenid_cbt3_20250908
),

--注册表字段
regi as
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025090823'
    AND env = 'live'
),
--登出表字段
logout as 
(SELECT
    vopenid
    ,vroleid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days 
    ,max(case when ilevel < 0 then -4-ilevel else ilevel end) as ilevel
    ,max(case when iGuildID<>0 then 1 else 0 end) as iGuildID
    ,sum(OnlineTime) as OnlineTime_all
    ,sum(if(platid = 1,OnlineTime,0)) as OnlineTime_mobile
    ,sum(if(platid = 2,OnlineTime,0)) as OnlineTime_pc
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    AND env = 'live'
group BY
    vopenid
    ,vroleid
),

--添加好友数
add_friend as
(select
    vopenid
    ,count(distinct vapplyopenid) as add_friend_num
from
(select
    vopenid
    ,vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
UNION all
select
    vapplyopenid as vopenid
    ,vopenid as vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live')
group by
    vopenid),

--删除好友数
DELETE_FRIEND as
(select 
    vopenid
    ,count(distinct vTargetOpenId) as delete_friend_num
from
(
    select
        vopenid
        ,vTargetOpenId
    from
        ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
    WHERE
        tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
        and env = 'live'
    UNION all
    select
        vTargetOpenId as vopenid
        ,vopenid as vTargetOpenId
    from
        ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
    WHERE
        tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
        and env = 'live'
)
group by
    vopenid),
--玩家聊天次数
talkflow as 
(
select
    vopenid
    ,count(distinct if(sceneid = 1001,concat(dteventtime,contents),null)) as world_talk
    ,count(distinct if(sceneid = 1003,concat(dteventtime,contents),null)) as friend_talk
    ,count(distinct if(sceneid = 1005,concat(dteventtime,contents),null)) as guild_talk
    ,count(distinct if(sceneid = 1006,concat(dteventtime,contents),null)) as game_talk
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),
--------------------------------------------------
--邀请组队
--招募组队比例
team_rate as
(select
   vroleid
   ,count(distinct if(team_type in ('单人匹配', '自建房单排') ,roomid,null))/count(distinct roomid) as single_rate
   ,count(distinct if(team_type in ('社团组队', '世界招募') ,roomid,null))/count(distinct roomid) as zhaomu_rate
   ,count(distinct if(team_type in ('好友组队') ,roomid,null))/count(distinct roomid) as invite_rate
from
   codez_dev_sr.codez_dev.dwd_sr_codez_teamtype_di
where
   p_Date between '${begin_second}' and '${end_second}'
   and env = 'live'
group by
    vroleid
),
-------------------------------------------------
--发枪次数
--收枪次数
caidan_room as
(select
    vopenid
    ,sum(cast(split(weaponstatics,';')[1] as bigint))/count(distinct roomid) as give_gun_times
    ,sum(cast(split(weaponstatics,';')[2] as bigint))/count(distinct roomid) as get_gun_times
from
    ieg_tdbank::codez_dsl_HuntingFieldGameDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
    ),
--各模式占比、猎场平均对局时长、猎场平均dps、猎场最高地图难度、猎场平均击杀、猎场平均死亡
gamedetail as 
(select
    gamedetail.vopenid
    ,count(distinct dsroomid) as total_game_num
    ,count(distinct if(map_id = '僵尸猎场', dsroomid,null))/count(distinct dsroomid) as lc_rate
    --,count(distinct if(map_id = '时空追猎', dsroomid,null))/count(distinct dsroomid) as zl_rate
    ,count(distinct if(map_id = '塔防', dsroomid,null))/count(distinct dsroomid) as tf_rate
    ,count(distinct if(map_id = '机甲战', dsroomid,null))/count(distinct dsroomid) as jj_rate
    ,count(distinct if(map_id = '猎场竞速', dsroomid,null))/count(distinct dsroomid) as js_rate
    ,count(distinct if(map_id = '挑战副本', dsroomid,null))/count(distinct dsroomid) as tz_rate
    ,sum(if(map_id = '僵尸猎场',ikills,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_kills
    ,sum(if(map_id = '僵尸猎场',ideaths,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_die
    ,sum(if(map_id = '僵尸猎场',Damage,0))/sum(if(map_id = '僵尸猎场',iDuration,0)) as lc_avg_dps
    ,sum(if(map_id = '僵尸猎场',iDuration,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_duration
    ,max(if(map_id = '僵尸猎场',map_difficulty,0)) as lc_max_difficulty
    ,max(if(map_id = '塔防',map_difficulty,0)) as tf_max_difficulty
    ,max(if(map_id = '机甲战', RankLevel,0)) as jj_max_rank
    ,max(if(map_id = '猎场竞速', RankLevel,0)) as js_max_rank
    ,sum(is_friend_game) as friend_game_num
    ,sum(if(map_id in ('塔防','僵尸猎场','挑战副本'),is_friend_game,0)) as pve_friend_num
    ,sum(if(map_id not in ('塔防','僵尸猎场','挑战副本'),is_friend_game,0)) as pvp_friend_num
    ,sum(if(map_id in ('塔防','僵尸猎场','挑战副本'),is_friend_game,0))/count(distinct dsroomid) as pve_friend_rate 
    ,sum(if(map_id not in ('塔防','僵尸猎场','挑战副本'),is_friend_game,0))/count(distinct dsroomid) as pvp_friend_rate
    ,sum(if(map_id in ('塔防','僵尸猎场','挑战副本') and map_difficulty > 3,is_friend_game,0)) as hard_pve_friend_num
    ,COALESCE(sum(if(map_id in ('塔防','僵尸猎场','挑战副本') and map_difficulty > 3,is_friend_game,0))/count(distinct if(map_id in ('塔防','僵尸猎场','挑战副本'),dsroomid,null)),0) as hard_pve_friend_rate 
from
(select
    *
from
    ieg_tdbank::codez_dsl_GameDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live') gamedetail 
JOIN
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '折磨II' then 6
      when param8 = '挑战模式' then 7
      when param8 = '竞速' then -1
      else -2
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','挑战模式') or param4 in ('机甲战','挑战副本'))) excelconfig on gamedetail.iDungeonID = excelconfig.dungeon_id
left JOIN
(select
    *
from
    ieg_tdbank::codez_dsl_LadderRankLevelFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live') labberrank on gamedetail.tdbank_imp_date = labberrank.tdbank_imp_date and gamedetail.vopenid = labberrank.vopenid and gamedetail.dsroomid = labberrank.roomid and gamedetail.idungeonid = labberrank.dungeonid
left JOIN
(select tdbank_imp_date,
       cast(dsroomid as bigint) as roomid,
       vopenid,
       is_friend_game
from codez_mid_analysis::codez_vopenid_room_isfriendgame
)friendgame on gamedetail.tdbank_imp_date = friendgame.tdbank_imp_date and gamedetail.dsroomid = friendgame.roomid and gamedetail.vopenid = friendgame.vopenid
group by
    gamedetail.vopenid
),
--金枪个数、紫枪个数、金插件个数、紫插件个数
GUN_Warframe as 
(select
    vopenid
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as purple_gun_num
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_purple_gun_num
    ,sum(if(itemquality = 4 and igoodssubtype = 7,item_count,0)) as gold_plugin_num
    ,sum(if(itemquality = 3 and igoodssubtype = 7,item_count,0)) as purple_plugin_num
from
(select
    vopenid
    ,iGoodsId
    ,iGoodsSubType
    --,sum(iCount) as item_count
    ,count(distinct iPropGID) as item_count
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    and AddOrReduce = 0
    --and vrolename = '裁决之神审判'
    and iGoodsId not in ('20101000020','20103000016','20114000006')
    and iGoodsSubType in (1,7,9)
    and iGoodsType = 2
    --and reason in (67,82)
group by
    vopenid
    ,iGoodsId
    ,iGoodsSubType
) itemflow
JOIN
(SELECT
    distinct 
        param1 AS itemid
        ,param5 as itemquality
    FROM ieg_tdbank.codez_dsl_excelconfiginfo_fht0
    WHERE
        tdbank_imp_date BETWEEN '${BEGIN_DATE}' and '${END_DATE}'
        AND branchpath = 'cbt3'
        AND configname = 'CommonItemTable'
        --AND param5 = 4  --金品质
        ) item on itemflow.iGoodsId = item.itemId
group by
    vopenid),
--付费金额
tbwater as
(
select 
    vopenid
    ,sum(imoney)/100 as imoney
from 
hy_idog_oss::codez_mid_tbwater
where dtstatdate >= '${dtstatdate_begin}' and dtstatdate <= '${dtstatdate_end}' and platid = 255
group by
    vopenid),
-- 1) 本期“房间-玩家”去重
room_members AS (
select
    dsroomid
    ,player
    ,map_difficulty
from
  (SELECT DISTINCT
    CAST(dsroomid AS STRING) AS dsroomid,
    CAST(vopenid  AS STRING) AS player,
    cast(iDungeonID as string) as iDungeonID
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
    and env = 'live')gamedetail
JOIN
(select
   distinct
      cast(param1 as string) as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '折磨II' then 6
      when param8 = '挑战模式' then 7
      when param8 = '竞速' then -1
      else -2
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','挑战模式') or param4 = '机甲战')) excelconfig on gamedetail.iDungeonID = excelconfig.dungeon_id
),

-- 2) 房间内无序玩家对（规范为 p1 < p2，避免重复与自连）
pair_in_room AS (
  SELECT
    rm1.map_difficulty,
    rm1.dsroomid,
    rm1.player AS p1,
    rm2.player AS p2
  FROM room_members rm1
  JOIN room_members rm2
    ON rm1.dsroomid = rm2.dsroomid
   AND rm1.player  < rm2.player
),

-- 3) 统计玩家对共同出现在同一房间的次数（共同对局数）
co_play_counts AS (
  SELECT
    p1,
    p2,
    COUNT(distinct dsroomid) AS co_games
  FROM pair_in_room
  GROUP BY p1, p2
),
--4) 统计高难度对局出现在同一房间次数

hard_co_play_counts AS (
    SELECT
    p1,
    p2,
    COUNT(distinct dsroomid) AS hard_co_games
  FROM pair_in_room
  WHERE map_difficulty > 3
  GROUP BY p1, p2),



solid_pairs AS (
  SELECT
    c.p1,
    c.p2,
    c.co_games
  FROM co_play_counts c
  WHERE c.co_games >= 3
),

hard_solid_pairs AS (
    SELECT
    c.p1,
    c.p2,
    c.hard_co_games
    FROM hard_co_play_counts c
    WHERE c.hard_co_games >= 3),

per_player_detail AS (
  SELECT p1 AS vopenid, p2 AS partner FROM solid_pairs
  UNION ALL
  SELECT p2 AS vopenid, p1 AS partner FROM solid_pairs
),

hard_per_player_detail AS (
    SELECT p1 AS vopenid, p2 AS partner FROM hard_solid_pairs
    UNION ALL
    SELECT p2 AS vopenid, p1 AS partner FROM hard_solid_pairs
),


-- 6) 去重（稳妥起见）
per_player_detail_distinct AS (
  SELECT vopenid, partner
  FROM per_player_detail
  GROUP BY vopenid, partner
),

hard_per_player_detail_distinct AS (
    SELECT vopenid, partner
    FROM hard_per_player_detail
    GROUP BY vopenid, partner
),

-- 6) 玩家-房间：是否存在任意固排好友同场
player_solid_in_room AS (
  SELECT DISTINCT
    rm.dsroomid,
    rm.player AS vopenid
  FROM room_members rm
  JOIN room_members rmo
    ON rm.dsroomid = rmo.dsroomid
   AND rm.player  <> rmo.player
  JOIN solid_pairs sp
    ON (CASE WHEN rm.player < rmo.player THEN rm.player ELSE rmo.player END) = sp.p1
   AND (CASE WHEN rm.player < rmo.player THEN rmo.player ELSE rm.player END) = sp.p2
),
solid_friend_game_num AS (
SELECT
  rm.player AS vopenid,
  count(distinct if(ps.vopenid IS NOT NULL, rm.dsroomid, NULL)) as solid_friend_game_num,
  count(distinct if(ps.vopenid IS NOT NULL and map_difficulty >3 , rm.dsroomid, NULL)) as hard_solid_friend_game_num
    -- 该玩家此局是否与其固排好友同场
FROM room_members rm
LEFT JOIN player_solid_in_room ps
  ON rm.dsroomid = ps.dsroomid AND rm.player = ps.vopenid
GROUP BY rm.player),
active_players AS (
  SELECT DISTINCT player AS vopenid FROM room_members
),

solid_player_num AS (SELECT
  ap.vopenid,
  COALESCE(COUNT(pp.partner), 0) AS co_play_3plus_cnt
FROM active_players ap
LEFT JOIN per_player_detail_distinct pp
  ON ap.vopenid = pp.vopenid
GROUP BY ap.vopenid),

hard_solid_player_num AS (
    SELECT
  ap.vopenid,
    COALESCE(COUNT(hpp.partner), 0) AS hard_co_play_3plus_cnt
    FROM active_players ap
    LEFT JOIN hard_per_player_detail_distinct hpp
    ON ap.vopenid = hpp.vopenid
    GROUP BY ap.vopenid),

givengold_times AS(select
    vopenid
    ,sum(LENGTH(givengold) - LENGTH(REPLACE(givengold, ':', ''))) AS givengold_TIMES
FROM ieg_tdbank::codez_dsl_PlayerHuntingFieldPartitionGameDetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
    and env = 'live'
GROUP BY
vopenid),
friend_relation AS (
    SELECT DISTINCT vopenid, friend
    FROM (
        SELECT vopenid, vapplyopenid AS friend
        FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
        WHERE tdbank_imp_date BETWEEN '20250908' AND '${END_DATE}'
          AND env = 'live'
        UNION ALL
        SELECT vapplyopenid, vopenid
        FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
        WHERE tdbank_imp_date BETWEEN '20250908' AND '${END_DATE}'
          AND env = 'live'
    ) t
),
friend_num as 
(select
    vopenid
    ,count(distinct friend) as friend_num
FROM friend_relation
GROUP BY vopenid),

-- 优化2：房间玩家关系扁平化，避免collect_set
room_players AS (
    SELECT DISTINCT 
        dsroomid,
        vopenid
    FROM ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
),

-- 优化3：直接JOIN找到所有"玩家-房间-队友"三元组（仅保留好友）
player_friend_teammates AS (
    SELECT DISTINCT
        rp1.vopenid,
        rp2.vopenid AS friend_teammate
    FROM room_players rp1
    JOIN room_players rp2 
        ON rp1.dsroomid = rp2.dsroomid 
        AND rp1.vopenid < rp2.vopenid  -- 优化：避免重复对，减少50%JOIN数据
    JOIN friend_relation fr
        ON (rp1.vopenid = fr.vopenid AND rp2.vopenid = fr.friend)
),

-- 优化4：聚合统计，只保留必要字段
game_friend_num AS (SELECT 
    vopenid,
    COUNT(DISTINCT friend_teammate) AS game_friend_count
FROM (
    SELECT vopenid, friend_teammate FROM player_friend_teammates
    UNION ALL
    SELECT friend_teammate AS vopenid, vopenid AS friend_teammate 
    FROM player_friend_teammates  -- 补全对称关系
) t
GROUP BY vopenid),


is_Stay as
(select
    distinct 
    vopenid
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_return}' and '${END_return}'
    AND env = 'live'),
--胜率、中退率
win_drop_rate as
(select
    vopenid
    ,count(distinct dsroomid) as game_num
    ,sum(iDuration) as game_time
    ,avg(iswin) as win_rate
    ,avg(isdrop) as drop_rate
from
(select
    vopenid
    ,dsroomid
    ,iDungeonID
    ,iDuration
    ,0 as isdrop
    ,if(iIswin = 1, 1,0) as iswin
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
    ,1 as isdrop
    ,0 as iswin
from
    ieg_tdbank::codez_dsl_DropOutDetail_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live')
group by
    vopenid
),
--疲劳值
Fatigue as
(select
    vopenid
    ,sum(iAddFatigueValue) as Fatigue_all
from
    ieg_tdbank::codez_dsl_Fatigueflow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
group by
    vopenid
),

--任务完成情况
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
--玩家随机宝箱获得和使用数
randombox as (select
    vopenid
    --,sum(iCount) as item_count
    ,SUM(IF(AddOrReduce=0, iCount,0)) as BOX_ADD
    ,SUM(IF(AddOrReduce=1, iCount,0)) as BOX_USE
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
    AND iGoodsId IN ('40305070001','40305070005')
group by
    vopenid
),
--PVP背包使用数、PVE背包使用数
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
)

SELECT
  p.vopenid,
  -- 登出/活跃
  IFNULL(la.ilevel, 0) AS ilevel,
  IFNULL(la.iGuildID, 0) AS iGuildID,
  IFNULL(la.OnlineTime_all, 0) AS OnlineTime_all,
  IFNULL(la.OnlineTime_mobile, 0) AS OnlineTime_mobile,
  IFNULL(la.OnlineTime_pc, 0) AS OnlineTime_pc,
  IFNULL(la.act_days, 0) AS act_days,

  -- 好友增删
  IFNULL(af.add_friend_num, 0) AS add_friend_num,
  IFNULL(af.add_friend_num, 0)-IFNULL(df.delete_friend_num, 0) AS friend_num,

  -- 聊天
  IFNULL(tf.world_talk, 0) AS world_talk,
  IFNULL(tf.friend_talk, 0) AS friend_talk,
  IFNULL(tf.guild_talk, 0) AS guild_talk,
  IFNULL(tf.game_talk, 0) AS game_talk,

  -- 组队比例
  IFNULL(trbo.single_rate, 0) AS single_rate,
  IFNULL(trbo.zhaomu_rate, 0) AS zhaomu_rate,
  IFNULL(trbo.invite_rate, 0) AS invite_rate,

  -- 猎场发/收枪
  IFNULL(cr.give_gun_times, 0) AS give_gun_times,
  IFNULL(cr.get_gun_times, 0) AS get_gun_times,

  -- 模式占比 & 猎场指标
  IFNULL(gd.total_game_num, 0) AS total_game_num,
  IFNULL(gd.lc_rate, 0) AS lc_rate,
  IFNULL(gd.tf_rate, 0) AS tf_rate,
  IFNULL(gd.jj_rate, 0) AS jj_rate,
  IFNULL(gd.js_rate, 0) AS js_rate,
  IFNULL(gd.tz_rate, 0) AS tz_rate,
  IFNULL(gd.lc_avg_kills, 0) AS lc_avg_kills,
  IFNULL(gd.lc_avg_die, 0) AS lc_avg_die,
  IFNULL(gd.lc_avg_dps, 0) AS lc_avg_dps,
  IFNULL(gd.lc_avg_duration, 0) AS lc_avg_duration,
  IFNULL(gd.lc_max_difficulty, 0) AS lc_max_difficulty,
  IFNULL(gd.tf_max_difficulty, 0) AS tf_max_difficulty,
  IFNULL(gd.jj_max_rank, 0) AS jj_max_rank,
  IFNULL(gd.js_max_rank, 0) AS js_max_rank,

  -- 好友同场
  IFNULL(gd.friend_game_num, 0) AS friend_game_num,
  IFNULL(gd.pve_friend_num, 0) AS pve_friend_num,
  IFNULL(gd.pvp_friend_num, 0) AS pvp_friend_num,
  IFNULL(gd.pve_friend_rate, 0) AS pve_friend_rate,
  IFNULL(gd.pvp_friend_rate, 0) AS pvp_friend_rate,
  IFNULL(gd.hard_pve_friend_num, 0) AS hard_pve_friend_num,
  IFNULL(gd.hard_pve_friend_rate, 0) AS hard_pve_friend_rate,

  -- 枪械/插件
  IFNULL(gw.gold_gun_num, 0) AS gold_gun_num,
  IFNULL(gw.purple_gun_num, 0) AS purple_gun_num,
  IFNULL(gw.limit_gold_gun_num, 0) AS limit_gold_gun_num,
  IFNULL(gw.limit_purple_gun_num, 0) AS limit_purple_gun_num,
  IFNULL(gw.gold_plugin_num, 0) AS gold_plugin_num,
  IFNULL(gw.purple_plugin_num, 0) AS purple_plugin_num,

  -- 付费
  IFNULL(tb.imoney, 0) AS imoney,

  -- 固排好友相关
  IFNULL(sfg.solid_friend_game_num, 0) AS solid_friend_game_num,
  IFNULL(sfg.hard_solid_friend_game_num, 0) AS hard_solid_friend_game_num,
  IFNULL(spn.co_play_3plus_cnt, 0) AS co_play_3plus_cnt,
  IFNULL(hspn.hard_co_play_3plus_cnt, 0) AS hard_co_play_3plus_cnt,

  -- 猎场给予金币次数
  IFNULL(ggt.givengold_times, 0) AS givengold_times,
  IFNULL(gf.game_friend_count, 0) AS game_friend_count,
  IF(is_Stay.vopenid IS NOT NULL, 1, 0) AS stay_rate,
  
  -- 胜率、中退率
  IFNULL(wdr.game_num, 0) AS game_num,
  IFNULL(wdr.game_time, 0) AS game_time,
  IFNULL(wdr.win_rate, 0) AS win_rate,
  IFNULL(wdr.drop_rate, 0) AS drop_rate,
  
  -- 疲劳值
  IFNULL(ftg.Fatigue_all, 0) AS Fatigue_all,
  
  -- 任务完成情况
  IFNULL(tf_task.DAYLIY_TASK_FINISHED, 0) AS DAYLIY_TASK_FINISHED,
  IFNULL(tf_task.WEEKLY_TASK_FINISHED, 0) AS WEEKLY_TASK_FINISHED,
  IFNULL(tf_task.chanllege_TASK_FINISHED, 0) AS chanllege_TASK_FINISHED,
  IFNULL(tf_task.season_TASK_FINISHED, 0) AS season_TASK_FINISHED,
  
  -- 随机宝箱获得和使用数
  IFNULL(rb.BOX_ADD, 0) AS BOX_ADD,
  IFNULL(rb.BOX_USE, 0) AS BOX_USE,
  
  -- PVP背包使用数、PVE背包使用数
  IFNULL(bu.pve_bag_num, 0) AS pve_bag_num,
  IFNULL(bu.pvp_bag_num, 0) AS pvp_bag_num

FROM player p
INNER JOIN regi r
  ON p.vopenid = r.vopenid
LEFT JOIN logout la
  ON p.vopenid = la.vopenid
LEFT JOIN add_friend af
  ON p.vopenid = af.vopenid
LEFT JOIN DELETE_FRIEND df
  ON p.vopenid = df.vopenid
LEFT JOIN talkflow tf
  ON p.vopenid = tf.vopenid
LEFT JOIN team_rate trbo
  ON la.vroleid = trbo.vroleid
LEFT JOIN caidan_room cr
  ON p.vopenid = cr.vopenid
LEFT JOIN gamedetail gd
  ON p.vopenid = gd.vopenid
LEFT JOIN GUN_Warframe gw
  ON p.vopenid = gw.vopenid
LEFT JOIN tbwater tb
  ON p.vopenid = tb.vopenid
LEFT JOIN solid_friend_game_num sfg
  ON p.vopenid = sfg.vopenid
LEFT JOIN solid_player_num spn
  ON p.vopenid = spn.vopenid
LEFT JOIN hard_solid_player_num hspn
  ON p.vopenid = hspn.vopenid
LEFT JOIN givengold_times ggt
  ON p.vopenid = ggt.vopenid
LEFT JOIN game_friend_num gf
  ON p.vopenid = gf.vopenid
LEFT JOIN friend_num fn
  ON p.vopenid = fn.vopenid
LEFT JOIN is_Stay is_Stay
  ON p.vopenid = is_Stay.vopenid
LEFT JOIN win_drop_rate wdr
  ON p.vopenid = wdr.vopenid
LEFT JOIN Fatigue ftg
  ON p.vopenid = ftg.vopenid
LEFT JOIN TASK_FINISHED tf_task
  ON p.vopenid = tf_task.vopenid
LEFT JOIN randombox rb
  ON p.vopenid = rb.vopenid
LEFT JOIN bag_use bu
  ON p.vopenid = bu.vopenid