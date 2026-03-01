/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--玩家组队情况
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(
select
        cast(param1 as string)  as idungeonid,
        param4 as mode_type,
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
      and param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','挑战模式')),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,map_difficulty
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
)
select
    -- Teaminfo.p_date
    -- ,
    --iptype
    if(teamernum>=2,'组队','单人') as teamernum
    ,mode_type
    ,map_difficulty
    ,count(distinct dsroomid,Teaminfo.vopenid) as player_num 
    ,avg(Teaminfo.onlinetime) as avg_onlinetime
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=2,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=6,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_7
from
    Teaminfo
left join
    act_state on Teaminfo.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
    -- iptype
    -- ,mode_type
    if(teamernum>=2,'组队','单人')
    ,mode_type
    ,map_difficulty



--分IP玩家组队率
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
)
select
    iptype
    ,teamernum
    ,count(distinct dsroomid,vopenid) as desk_num
from
    Teaminfo
group by
    iptype
    ,teamernum


--分模式组排率
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,map_name
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
)
select
    mode_type
    ,map_name
    ,iDungeonID
    ,teamernum
    ,count(distinct dsroomid,vopenid) as desk_num
from
    Teaminfo
group by
    mode_type
    ,map_name
    ,iDungeonID
    ,teamernum






--分IP玩家组队留存
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030523'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis.temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025030300' and '2025030523'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025030300' and '2025030523'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030523'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041,3001001)
)
select
    -- Teaminfo.p_date
    -- ,
    iptype
    ,case when teamernum > 1 then '多人' else '单人' end as teamtype
    ,count(distinct Teaminfo.vopenid,dsroomid) as player_desk_num
    --,mode_type
    -- ,count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as player_day_num 
    -- ,avg(Teaminfo.onlinetime) as avg_onlinetime
    -- ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_2
    -- ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=2,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_3
    -- ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=6,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_7
from
    Teaminfo
left join
    act_state on Teaminfo.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
    iptype
    --,mode_type
    ,case when teamernum > 1 then '多人' else '单人' end



--分模式留存
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
)
select
    -- Teaminfo.p_date
    -- ,
    iptype
    ,teamernum
    ,mode_type
    ,count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as player_day_num 
    ,avg(Teaminfo.onlinetime) as avg_onlinetime
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=2,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,Teaminfo.p_date)=6,act_state.vopenid,null))/count(distinct concat(Teaminfo.p_date,Teaminfo.vopenid)) as retained_rate_7
from
    Teaminfo
left join
    act_state on Teaminfo.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
    iptype
    ,mode_type
    ,teamernum



--分IP组队玩家对应留存
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
    ,if(IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart)>1,1,0) as if_team
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
),
team_num as
(select
    vopenid
    ,p_date
    ,iptype
    ,onlinetime
    ,sum(if_team) as team_desk_num
    ,if(sum(if_team) > 0,1,0) as team_player
from
    Teaminfo
group by
    vopenid
    ,p_date
    ,iptype
    ,onlinetime
)
select
    -- Teaminfo.p_date
    -- ,
    iptype
    ,team_player
    --,mode_type
    ,count(distinct concat(Team_num.p_date,Team_num.vopenid)) as player_day_num 
    ,avg(Team_num.onlinetime) as avg_onlinetime
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=2,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=6,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_7
from
    Team_num
left join
    act_state on Team_num.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
    iptype
    ,team_player



--分IP分模式组队玩家对应留存
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,map_name as mode_name
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
    ,if(IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart)>1,1,0) as if_team
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041)
),
team_num as
(select
    vopenid
    ,p_date
    ,iptype
    ,mode_type
    ,onlinetime
    ,mode_name
    ,sum(if_team) as team_desk_num
    ,if(sum(if_team) > 0,1,0) as team_player
from
    Teaminfo
group by
    vopenid
    ,p_date
    ,mode_type
    ,mode_name
    ,iptype
    ,onlinetime
)
select
    -- Teaminfo.p_date
    -- ,
    iptype
    ,mode_name
    ,team_player
    --,mode_type
    ,count(distinct concat(Team_num.p_date,Team_num.vopenid)) as player_day_num 
    ,avg(Team_num.onlinetime) as avg_onlinetime
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=2,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=6,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_7
from
    Team_num
left join
    act_state on Team_num.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
    iptype
    ,mode_name
    ,team_player



--分评分分难度猎场是否组队对应留存
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
match_result as
(select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType 
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and Result = 0
),
Schemeinfo as (select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,max(cast(ScoreSum as bigint)) as ScoreSum
    ,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
gamedetail as 
(select
    gd.*
    ,iptype
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    ) gd
join
    player on gd.vopenid= player.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
act_state as
(select
    logout.vopenid
    ,logout.p_date
    ,onlinetime
    ,CASE
            WHEN CAST(ScoreSum AS DOUBLE) < 0 THEN '(-∞,0)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 0 AND CAST(ScoreSum AS DOUBLE) < 400 THEN '[0,400)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 400 AND CAST(ScoreSum AS DOUBLE) < 800 THEN '[400,800)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 800 AND CAST(ScoreSum AS DOUBLE) < 1200 THEN '[800,1200)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 1200 AND CAST(ScoreSum AS DOUBLE) < 1600 THEN '[1200,1600)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 1600 AND CAST(ScoreSum AS DOUBLE) < 2000 THEN '[1600,2000)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 2000 AND CAST(ScoreSum AS DOUBLE) < 2400 THEN '[2000,2400)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 2400 AND CAST(ScoreSum AS DOUBLE) < 2800 THEN '[2400,2800)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 2800 AND CAST(ScoreSum AS DOUBLE) < 3000 THEN '[2800,3000)'
            WHEN CAST(ScoreSum AS DOUBLE) >= 3000 THEN '[3000,+∞)'
            ELSE NULL
        END AS scoresum
from
(select
    vopenid
    ,sum(OnlineTime)/3600 as onlinetime
    ,substr(tdbank_imp_date,1,8) as p_date
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8))logout
left join
    Schemeinfo on logout.vopenid = Schemeinfo.vopenid and logout.p_date= Schemeinfo.p_date
),
Teaminfo as
(select
    dsroomID
    ,gamedetail.iDungeonID
    ,mode_type
    ,gamedetail.vopenid
    ,iptype
    ,gamedetail.p_date
    ,onlinetime
    ,map_name as mode_name
    ,ScoreSum
    ,IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart) AS Teamernum
    ,if(IF(match_result.vopenid IS NOT NULL, TeamMemberNum, RealPlayerNumWhenStart)>1,1,0) as if_team
    ,mod(gamedetail.iDungeonID-1,10) as hard_type
from
    gamedetail
left JOIN
    match_result on gamedetail.dsroomid = match_result.roomid and gamedetail.vopenid = match_result.vopenid
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041) and mode_type = '僵尸猎场'
),
team_num as
(select
    vopenid
    ,p_date
    ,iptype
    ,mode_type
    ,onlinetime
    ,mode_name
    ,ScoreSum
    ,hard_type
    ,sum(if_team) as team_desk_num
    ,if(sum(if_team) > 0,1,0) as team_player
from
    Teaminfo
group by
    vopenid
    ,p_date
    ,mode_type
    ,mode_name
    ,iptype
    ,onlinetime
    ,ScoreSum
    ,hard_type
)
select
    -- Teaminfo.p_date
    -- ,
     Team_num.ScoreSum
    ,hard_type
    ,team_player
    --,mode_type
    ,count(distinct concat(Team_num.p_date,Team_num.vopenid)) as player_day_num 
    ,avg(Team_num.onlinetime) as avg_onlinetime
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=1,concat(act_state.p_date,act_state.vopenid),null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=2,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,Team_num.p_date)=6,act_state.vopenid,null))/count(distinct concat(Team_num.p_date,Team_num.vopenid)) as retained_rate_7
from
    Team_num
left join
    act_state on Team_num.vopenid = act_state.vopenid
group by
    -- Teaminfo.p_date
    -- ,
     Team_num.ScoreSum
    ,hard_type
    ,team_player






