-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--各模式组队比例
select
    map_id
    ,map_difficulty
    ,team_type
    ,count(distinct dteventtime,roomid) as team_count
from
(select
    distinct 
    cast(dungeonid as string) as  dungeonid
   ,case when team_type in ('好友组队','社团组队','世界招募') then '组队'
   else team_type end as team_type
   ,dteventtime
   ,roomid
from
   dwd_sr_codez_teamtype_di
where
   p_Date BETWEEN '2025-09-08T00:00:00' and '2025-10-12T00:00:00'
   and env = 'live')teamtype
JOIN
(select
   distinct
      cast(param1 as string) as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      case when param8 = '普通' then '1-普通'
      when param8 = '英雄' then '3-英雄'
      when param8 = '炼狱' then '4-炼狱'
      when param8 = '困难' then '2-困难'
      when param8 = '折磨' then '5-折磨'
      when param8 = '折磨II' then '6-竞速'
      when param8 = '挑战模式' then '7-挑战模式'
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','挑战模式') ) excelconfig on teamtype.DungeonID = excelconfig.dungeon_id
group BY
    map_id
    ,map_difficulty
    ,team_type
order by
    map_id
    ,map_difficulty
    ,team_type



-- 各模式组队比例（2025-09-08 ~ 2025-09-14）
-- 竞速模式(modetype=141) 手动映射为「猎场竞速 / 6-竞速」
----------------------------------------------------------
with team_raw as (
    select
        dungeonid,
        modetype,
        case when team_type in ('好友组队','社团组队','世界招募') then '组队'
             else '单排' end as team_type,
        dteventtime,
        roomid,
        vroleid
    from dwd_sr_codez_teamtype_di
    where p_date between '2025-09-08T00:00:00' and '2025-09-14T00:00:00'
      and env = 'live'
),

-- 普通副本配置
normal_cfg as (
    select
        cast(param1 as string)  as dungeon_id,
        param4 as map_id,
        case param8
            when '普通'   then '1-普通'
            when '困难'   then '2-困难'
            when '英雄'   then '3-英雄'
            when '炼狱'   then '4-炼狱'
            when '折磨'   then '5-折磨'
            else param8
        end as map_difficulty
    from codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
    where configname = 'FubenEntranceInfo'
      and param8 in ('普通','英雄','炼狱','困难','折磨','折磨II')
),

-- -- 竞速模式单独一条流
-- speed_team as (
--     select
--         '猎场竞速' as map_id,
--         '6-竞速'   as map_difficulty,
--         team_type,
--         count(distinct concat(dteventtime,'|',roomid)) as team_count
--     from team_raw
--     where modetype = 141
--     group by team_type
-- ),

-- 普通模式关联配置
normal_team as (
    select
        c.map_id,
        c.map_difficulty,
        t.team_type,
        count(distinct concat(t.dteventtime,'|',t.vroleid)) as team_count
    from team_raw t
    join normal_cfg c
      on cast(t.dungeonid as string) = c.dungeon_id
    group by c.map_id, c.map_difficulty, t.team_type
)

-- 合并结果
select * from normal_team


--循环CE
with team_raw as (
    select
        dungeonid,
        modetype,
        case when team_type in ('好友组队','社团组队','世界招募') then '组队'
             else '单排' end as team_type,
        dteventtime,
        roomid,
        vroleid
    from dwd_sr_codez_teamtype_di
    where p_date between '2025-07-28T00:00:00' and '2025-08-03T00:00:00'
      and env = 'live'
),

-- 普通副本配置
normal_cfg as (
    select
        cast(param1 as string)  as dungeon_id,
        param4 as map_id,
        case param8
            when '普通'   then '1-普通'
            when '困难'   then '2-困难'
            when '英雄'   then '3-英雄'
            when '炼狱'   then '4-炼狱'
            when '折磨'   then '5-折磨'
            else param8
        end as map_difficulty
    from codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
    where configname = 'FubenEntranceInfo'
      and param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','挑战模式')
),

-- -- 竞速模式单独一条流
-- speed_team as (
--     select
--         '猎场竞速' as map_id,
--         '6-竞速'   as map_difficulty,
--         team_type,
--         count(distinct concat(dteventtime,'|',roomid)) as team_count
--     from team_raw
--     where modetype = 141
--     group by team_type
-- ),

-- 普通模式关联配置
normal_team as (
    select
        c.map_id,
        c.map_difficulty,
        t.team_type,
        count(distinct concat(t.dteventtime,'|',t.vroleid)) as team_count
    from team_raw t
    join normal_cfg c
      on cast(t.dungeonid as string) = c.dungeon_id
    group by c.map_id, c.map_difficulty, t.team_type
)

-- 合并结果
select * from normal_team






--CBT3机甲战和猎场竞速组队率
select
    modetype
    ,is_team
    ,RankLevel
    ,count(distinct teamid,vopenid) as team_num
from
(select
    alloc.modetype
    ,vopenid
    ,alloc.teamid
    ,RankLevel
    ,if(team_num >= 2,1,0) as is_team
from
(select
    modetype
    ,TeamID
    ,vopenid
    ,RankLevel
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date BETWEEN '2025090800' AND '2025101223'
    and ModeType in (141,65)
    and env = 'live')ALLOC
join
(select
    modetype
    ,TeamID
    ,count(distinct vopenid) as team_num
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date BETWEEN '2025090800' AND '2025101223'
    and ModeType in (141,65)
    and env = 'live'
group by
    modetype
    ,TeamID) team on ALLOC.TeamID = team.TeamID and ALLOC.modetype = team.modetype)
group by
    modetype
    ,is_team
    ,RankLevel


--CBT2
select
    modetype
    ,is_team
    ,count(distinct teamid,vopenid) as team_num
from
(select
    alloc.modetype
    ,vopenid
    ,alloc.teamid
    ,if(team_num >= 2,1,0) as is_team
from
(select
    modetype
    ,TeamID
    ,vopenid
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date BETWEEN '2025033100' AND '2025040623'
    and DungeonID = 3001001)ALLOC
join
(select
    modetype
    ,TeamID
    ,count(distinct vopenid) as team_num
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date BETWEEN '2025033100' AND '2025040623'
    and DungeonID = 3001001
group by
    modetype
    ,TeamID) team on ALLOC.TeamID = team.TeamID and ALLOC.modetype = team.modetype)
group by
    modetype
    ,is_team