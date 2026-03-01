--聚类特征
with player as 
(select
    distinct
    vopenid
from
    codez_log.codez_dsl_playerregister_fht0
),

--注册表字段
regi as
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026011323'
    AND env = 'live'
),
--登出表字段
logout as 
(SELECT 
    vopenid
    ,vroleid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days 
    ,max(case when ilevel < 0 then -3-ilevel else ilevel end) as ilevel
    ,max(case when iGuildID<>0 then 1 else 0 end) as iGuildID
    ,sum(OnlineTime) as OnlineTime_all
    ,sum(if(platid = 1,OnlineTime,0)) as OnlineTime_mobile
    ,sum(if(platid = 2,OnlineTime,0)) as OnlineTime_pc
    ,max(gamefriendnum) as gamefriendnum
    ,max(PlatformFriendNum) as PlatformFriendNum
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    AND env = 'live'
    and vroleid = '342151429318282'
group BY
    vopenid
    ,vroleid
),


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

--组队率
team_rate as
(select
   vroleid
   ,count(distinct if(team_type in ('单人匹配', '自建房单排') ,roomid,null))/count(distinct roomid) as single_rate
   ,count(distinct if(team_type in ('社团组队', '世界招募') ,roomid,null))/count(distinct roomid) as starnger_rate
   ,count(distinct if(team_type in ('好友组队') ,roomid,null))/count(distinct roomid) as friend_rate
from
   codez_dev_sr.codez_dev.dwd_sr_codez_teamtype_di
where
   p_Date between '${begin_second}' and '${end_second}'
   and env = 'live'
group by
    vroleid
),

--各模式占比、猎场平均对局时长、猎场平均dps、猎场最高地图难度、猎场平均击杀、猎场平均死亡
gamedetail as 
(select
    vopenid
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
    --,avg(if(map_id = '机甲战', rank,null)) as jj_avg_rank
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
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速') or param4 = '机甲战')) excelconfig on gamedetail.iDungeonID = excelconfig.dungeon_id
group by
    vopenid
),
--机甲战段位
jj_rank as
(select
    vopenid
    ,max(ranklevel) as ranklevel
from
    ieg_tdbank::codez_dsl_LadderRankLevelFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
GROUP BY
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
),


-- --天赋等级
-- talent_level as
-- (select
--     vopenid
--     ,sum(talentlevel) as sum_talentlevel
-- from
-- (select
--    vopenid
--    ,talentlevel
--    ,row_number()over(PARTITION by vopenid order by dteventtime desc) as rnk
-- from
--    codez_dev_sr.codez_dev.dwd_sr_codez_seasontalent_di
-- where
--    p_Date between '${begin_second}' and '${end_second}'
--    and op = 5
--    and env = 'live'
-- )
-- where
--     rnk = 1
-- group by
--     vopenid),

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

--进入彩蛋房间次数
caidan_room as
(select
    vopenid
    ,count(distinct if(isgoingeggroom=1,roomid,null))/count(distinct roomid) as caidan_room_num
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
is_Stay as
(select
    distinct 
    vopenid
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_return}' and '${END_return}'
    AND env = 'live') 

select
        player.vopenid,
    -- logout
    IFNULL(logout.ilevel,0)                         as ilevel,
    IFNULL(logout.iGuildID,0)                       as iGuildID,
    IFNULL(logout.OnlineTime_all,0)                 as OnlineTime_all,
    IFNULL(logout.OnlineTime_mobile,0)              as OnlineTime_mobile,
    IFNULL(logout.OnlineTime_pc,0)                  as OnlineTime_pc,
    ifnull(logout.act_days,0)                       as act_days,

    -- add_friend
    IFNULL(add_friend.add_friend_num,0)             as add_friend_num,

    -- delete_friend
    IFNULL(DELETE_FRIEND.delete_friend_num,0)       as delete_friend_num,

    -- win_drop_rate
    IFNULL(win_drop_rate.game_num,0)                as game_num,
    IFNULL(win_drop_rate.game_time,0)               as game_time,
    IFNULL(win_drop_rate.win_rate,0)                as win_rate,
    IFNULL(win_drop_rate.drop_rate,0)               as drop_rate,

    -- Fatigue
    IFNULL(Fatigue.Fatigue_all,0)                   as Fatigue_all,

    -- team_rate
    IFNULL(team_rate.single_rate,0)                 as single_rate,
    IFNULL(team_rate.starnger_rate,0)               as starnger_rate,
    IFNULL(team_rate.friend_rate,0)                 as friend_rate,

    -- gamedetail
    IFNULL(gamedetail.lc_rate,0)                    as lc_rate,
    --IFNULL(gamedetail.zl_rate,0)                    as zl_rate,
    IFNULL(gamedetail.tf_rate,0)                    as tf_rate,
    IFNULL(gamedetail.jj_rate,0)                    as jj_rate,
    IFNULL(gamedetail.js_rate,0)                    as js_rate,
    IFNULL(gamedetail.tz_rate,0)                    as tz_rate,
    IFNULL(gamedetail.lc_avg_kills,0)               as lc_avg_kills,
    IFNULL(gamedetail.lc_avg_die,0)                 as lc_avg_die,
    IFNULL(gamedetail.lc_avg_dps,0)                 as lc_avg_dps,
    IFNULL(gamedetail.lc_avg_duration,0)            as lc_avg_duration,
    IFNULL(gamedetail.lc_max_difficulty,0)          as lc_max_difficulty,
    IFNULL(gamedetail.tf_max_difficulty,0)          as tf_max_difficulty,
    IFNULL(ranklevel,0)                             as jj_avg_rank,

    -- TASK_FINISHED
    IFNULL(TASK_FINISHED.DAYLIY_TASK_FINISHED,0)    as DAYLIY_TASK_FINISHED,
    IFNULL(TASK_FINISHED.WEEKLY_TASK_FINISHED,0)    as WEEKLY_TASK_FINISHED,
    IFNULL(TASK_FINISHED.chanllege_TASK_FINISHED,0) as chanllege_TASK_FINISHED,
    IFNULL(TASK_FINISHED.season_TASK_FINISHED,0)    as season_TASK_FINISHED,

    -- GUN_Warframe
    IFNULL(GUN_Warframe.gold_gun_num,0)             as gold_gun_num,
    IFNULL(GUN_Warframe.purple_gun_num,0)           as purple_gun_num,
    IFNULL(GUN_Warframe.gold_plugin_num,0)          as gold_plugin_num,
    IFNULL(GUN_Warframe.purple_plugin_num,0)        as purple_plugin_num,
    IFNULL(GUN_Warframe.limit_gold_gun_num,0)       as limit_gold_gun_num,
    IFNULL(GUN_Warframe.limit_purple_gun_num,0)     as limit_purple_gun_num,

    -- bag_use
    IFNULL(bag_use.pve_bag_num,0)                   as pve_bag_num,
    IFNULL(bag_use.pvp_bag_num,0)                   as pvp_bag_num,

    -- -- talent_level
    -- IFNULL(talent_level.sum_talentlevel,0)          as sum_talentlevel,

    -- tbwater
    IFNULL(tbwater.imoney,0)                        as imoney,
    if(IFNULL(tbwater.imoney,0)>0,1,0)              as ifcost,

    IFNULL(caidan_room.caidan_room_num,0)           as caidan_room_num,
    IFNULL(caidan_room.give_gun_times,0)            as give_gun_times,
    IFNULL(caidan_room.get_gun_times,0)             as get_gun_times,
    If(is_Stay.vopenid is not null,1,0)             as stay_rete,
    ifnull(randombox.BOX_ADD,0)                     as BOX_ADD,
    ifnull(randombox.BOX_USE,0)                     as BOX_USE
from
    player
    JOIN
    regi on player.vopenid = regi.vopenid
    left JOIN
    logout on player.vopenid = logout.vopenid
    left JOIN
    bag_use on player.vopenid = bag_use.vopenid
    -- left JOIN
    -- talent_level on player.vopenid = talent_level.vopenid
    left JOIN
    GUN_Warframe on player.vopenid = GUN_Warframe.vopenid
    left JOIN
    TASK_FINISHED on player.vopenid = TASK_FINISHED.vopenid
    left JOIN
    gamedetail on player.vopenid = gamedetail.vopenid
    left JOIN
    add_friend on player.vopenid = add_friend.vopenid
    left JOIN
    DELETE_FRIEND on player.vopenid = DELETE_FRIEND.vopenid
    left JOIN
    win_drop_rate on player.vopenid = win_drop_rate.vopenid
    left JOIN
    team_rate on logout.vroleid = team_rate.vroleid
    left JOIN
    Fatigue on player.vopenid = Fatigue.vopenid
    left JOIN
    tbwater on player.vopenid = tbwater.vopenid
    left JOIN
    caidan_room on player.vopenid = caidan_room.vopenid
    left JOIN
    is_Stay on player.vopenid = is_Stay.vopenid
    left JOIN
    jj_rank on player.vopenid = jj_rank.vopenid
    left JOIN
    randombox on player.vopenid = randombox.vopenid





