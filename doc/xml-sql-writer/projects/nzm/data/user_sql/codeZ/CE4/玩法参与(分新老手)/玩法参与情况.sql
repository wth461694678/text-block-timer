-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--玩法参与率&平均局数
select
    is_skip
    ,count(distinct neworold.vopenid) as player_num
    ,count(distinct if(mode_name = '僵尸猎场',neworold.vopenid,null)) / count(distinct neworold.vopenid) as lc_rate
    ,count(distinct if(mode_name = '塔防',neworold.vopenid,null))/ count(distinct neworold.vopenid) as tf_rate
    ,count(distinct if(mode_name = '机甲战',neworold.vopenid,null))/ count(distinct neworold.vopenid) as jj_rate
    ,count(distinct if(mode_name = '挑战副本',neworold.vopenid,null))/ count(distinct neworold.vopenid) as tz_rate
    ,count(distinct if(mode_name = '时空追猎',neworold.vopenid,null))/ count(distinct neworold.vopenid) as sk_rate
    ,count(distinct if(mode_name = '僵尸猎场',concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct if(mode_name = '僵尸猎场',neworold.vopenid,null)) as lc_avg_num
    ,count(distinct if(mode_name = '塔防',concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct if(mode_name = '塔防',neworold.vopenid,null)) as tf_avg_num
    ,count(distinct if(mode_name = '机甲战',concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct if(mode_name = '机甲战',neworold.vopenid,null)) as jj_avg_num
    ,count(distinct if(mode_name = '挑战副本',concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct if(mode_name = '挑战副本',neworold.vopenid,null)) as tz_avg_num
    ,count(distinct if(mode_name = '时空追猎',concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct if(mode_name = '时空追猎',neworold.vopenid,null)) as sk_avg_num
    -- ,sum(if(mode_name = '僵尸猎场' and iIsWin = 1,iduration,0))/count(distinct if(mode_name = '僵尸猎场' and iIsWin = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null)) as  lc_avg_duration
    -- ,sum(if(mode_name = '塔防' and iIsWin = 1,iduration,0))/count(distinct if(mode_name = '塔防' and iIsWin = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null)) as  tf_avg_duration
    -- ,count(distinct if(mode_name = '僵尸猎场' and is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  lc_quit_rate
    -- ,count(distinct if(mode_name = '塔防' and is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  tf_quit_rate
    -- ,count(distinct if(mode_name = '机甲战' and is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  jj_quit_rate
    -- ,count(distinct if(mode_name = '挑战副本' and is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  tz_quit_rate
    -- ,count(distinct if(mode_name = '时空追猎' and is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  sk_quit_rate
from
(SELECT
    vopenid
   ,max(isveteranplayer) as is_skip
FROM
   ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
where
   tdbank_imp_date between '2025112000' and '2025112023'
   and IsExtraData = 1 and SelectFireMode = 0 and SelectHUDLayout = 0
group by
    vopenid)neworold
join
(select
   distinct
   vopenid
from
   dim_codez_vopenid_whitelist_ce20251120) whitelist on neworold.vopenid = whitelist.vopenid
left join
(select
    vopenid
    ,iduration
    ,DsRoomId
    ,iIsWin
    ,iKills
    ,iDeaths
    ,Damage
    ,iDungeonID
    ,0 as is_quit
from 
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025112000' and '2025112023'
union all
select
    vopenid
    ,iduration
    ,DsRoomId
    ,-1 as iIsWin
    ,iKills
    ,iDeaths
    ,Damage
    ,iDungeonID
    ,1 as is_quit
from 
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025112000' and '2025112023' and iDungeonID <> 2004001
) gamedetail on neworold.vopenid = gamedetail.vopenid
left join
(SELECT
    param1 as dungeon_id,
    param2 as map_id,
    param4 as mode_name,
    param7 as map_name,
    param8 as difficulty
from
    codez_ret_excelconfiginfo_conf
where
    configname = 'FubenEntranceInfo'
group by 
    param1,
    param2,
    param4,
    param7,
    param8)excel on gamedetail.iDungeonID = excel.dungeon_id
group by
    is_skip



--分地图分难度通关时长&中退率
select
    is_skip
    ,dungeon_id
    ,mode_name
    ,map_name
    ,difficulty
    ,map_difficulty
    ,count(distinct neworold.vopenid) as player_count
    ,count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as desk_num
    ,count(distinct if(iIsWin = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  win_rate
    ,sum(if(iIsWin = 1,iduration,0)/60)/count(distinct if(iIsWin = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null)) as  avg_duration
    ,count(distinct if(is_quit = 1,concat(neworold.vopenid,'_',gamedetail.DsRoomId),null))/count(distinct concat(neworold.vopenid,'_',gamedetail.DsRoomId)) as  quit_rate
from
(SELECT
    vopenid
   ,max(isveteranplayer) as is_skip
FROM
   ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
where
   tdbank_imp_date between '2025112000' and '2025112023'
   and IsExtraData = 1 and SelectFireMode = 0 and SelectHUDLayout = 0
group by
    vopenid)neworold
join
(select
   distinct
   vopenid
from
   dim_codez_vopenid_whitelist_ce20251120) whitelist on neworold.vopenid = whitelist.vopenid
left join
(select
    vopenid
    ,iduration
    ,DsRoomId
    ,iIsWin
    ,iKills
    ,iDeaths
    ,Damage
    ,iDungeonID
    ,0 as is_quit
from 
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025112000' and '2025112023'
union all
select
    vopenid
    ,iduration
    ,DsRoomId
    ,-1 as iIsWin
    ,iKills
    ,iDeaths
    ,Damage
    ,iDungeonID
    ,1 as is_quit
from 
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025112000' and '2025112023'
) gamedetail on neworold.vopenid = gamedetail.vopenid
left join
(SELECT
    param1 as dungeon_id,
    param2 as map_id,
    param4 as mode_name,
    param7 as map_name,
    case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '折磨II' then 6
      else 0
      end as difficulty
    ,param8 as map_difficulty
from
    codez_ret_excelconfiginfo_conf
where
    configname = 'FubenEntranceInfo'
group by 
    param1,
    param2,
    param4,
    param7,
    param8)excel on gamedetail.iDungeonID = excel.dungeon_id
group by
    is_skip
    ,dungeon_id
    ,mode_name
    ,map_name
    ,difficulty
    ,map_difficulty
order by
    is_skip
    ,mode_name
    ,difficulty
    ,map_name
    ,dungeon_id



--玩家在线时长对比
SELECT 
    time_range,
    time_order,
    is_skip,
    COUNT(*) as player_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage_total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(PARTITION BY time_range), 2) as percentage_in_range
FROM (
    SELECT 
        neworold.vopenid,
        neworold.is_skip,
        COALESCE(logout.OnlineTime, 0) as OnlineTime,
        CASE 
            WHEN COALESCE(logout.OnlineTime, 0) < 600 THEN '0-10分钟'
            WHEN COALESCE(logout.OnlineTime, 0) >= 600 AND COALESCE(logout.OnlineTime, 0) < 1200 THEN '10-20分钟'
            WHEN COALESCE(logout.OnlineTime, 0) >= 1200 AND COALESCE(logout.OnlineTime, 0) < 1800 THEN '20-30分钟'
            WHEN COALESCE(logout.OnlineTime, 0) >= 1800 AND COALESCE(logout.OnlineTime, 0) < 3600 THEN '30-60分钟'
            WHEN COALESCE(logout.OnlineTime, 0) >= 3600 AND COALESCE(logout.OnlineTime, 0) < 7200 THEN '1-2小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 7200 AND COALESCE(logout.OnlineTime, 0) < 10800 THEN '2-3小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 10800 AND COALESCE(logout.OnlineTime, 0) < 14400 THEN '3-4小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 14400 AND COALESCE(logout.OnlineTime, 0) < 18000 THEN '4-5小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 18000 AND COALESCE(logout.OnlineTime, 0) < 21600 THEN '5-6小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 21600 AND COALESCE(logout.OnlineTime, 0) < 25200 THEN '6-7小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 25200 AND COALESCE(logout.OnlineTime, 0) < 28800 THEN '7-8小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 28800 AND COALESCE(logout.OnlineTime, 0) < 32400 THEN '8-9小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 32400 AND COALESCE(logout.OnlineTime, 0) < 36000 THEN '9-10小时'
            WHEN COALESCE(logout.OnlineTime, 0) >= 36000 THEN '10小时以上'
            ELSE '未知'
        END as time_range,
        CASE 
            WHEN COALESCE(logout.OnlineTime, 0) < 600 THEN 1
            WHEN COALESCE(logout.OnlineTime, 0) >= 600 AND COALESCE(logout.OnlineTime, 0) < 1200 THEN 2
            WHEN COALESCE(logout.OnlineTime, 0) >= 1200 AND COALESCE(logout.OnlineTime, 0) < 1800 THEN 3
            WHEN COALESCE(logout.OnlineTime, 0) >= 1800 AND COALESCE(logout.OnlineTime, 0) < 3600 THEN 4
            WHEN COALESCE(logout.OnlineTime, 0) >= 3600 AND COALESCE(logout.OnlineTime, 0) < 7200 THEN 5
            WHEN COALESCE(logout.OnlineTime, 0) >= 7200 AND COALESCE(logout.OnlineTime, 0) < 10800 THEN 6
            WHEN COALESCE(logout.OnlineTime, 0) >= 10800 AND COALESCE(logout.OnlineTime, 0) < 14400 THEN 7
            WHEN COALESCE(logout.OnlineTime, 0) >= 14400 AND COALESCE(logout.OnlineTime, 0) < 18000 THEN 8
            WHEN COALESCE(logout.OnlineTime, 0) >= 18000 AND COALESCE(logout.OnlineTime, 0) < 21600 THEN 9
            WHEN COALESCE(logout.OnlineTime, 0) >= 21600 AND COALESCE(logout.OnlineTime, 0) < 25200 THEN 10
            WHEN COALESCE(logout.OnlineTime, 0) >= 25200 AND COALESCE(logout.OnlineTime, 0) < 28800 THEN 11
            WHEN COALESCE(logout.OnlineTime, 0) >= 28800 AND COALESCE(logout.OnlineTime, 0) < 32400 THEN 12
            WHEN COALESCE(logout.OnlineTime, 0) >= 32400 AND COALESCE(logout.OnlineTime, 0) < 36000 THEN 13
            WHEN COALESCE(logout.OnlineTime, 0) >= 36000 THEN 14
            ELSE 99
        END as time_order
    FROM
        (SELECT
            vopenid,
            max(isveteranplayer) as is_skip
        FROM
            ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
        WHERE
            tdbank_imp_date between '2025112000' and '2025112023'
            and IsExtraData = 1 
            and SelectFireMode = 0 
            and SelectHUDLayout = 0
        GROUP BY
            vopenid) neworold
        JOIN
        (SELECT
            distinct vopenid
        FROM
            dim_codez_vopenid_whitelist_ce20251120) whitelist 
        ON neworold.vopenid = whitelist.vopenid
        LEFT JOIN
        (SELECT
            vopenid,
            sum(OnlineTime) as OnlineTime
        FROM
            ieg_tdbank::codez_dsl_playerlogout_fht0
        WHERE
            tdbank_imp_date between '2025112000' and '2025112023'
        GROUP BY
            vopenid) logout 
        ON neworold.vopenid = logout.vopenid
) result
GROUP BY 
    time_range, time_order, is_skip
ORDER BY 
    time_order, is_skip;


--真新手玩家和假新手玩家对比(限制非IP)







