/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--对局中退人数分布
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
   tdbank_imp_date BETWEEN '2025033100' and '2025040923'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
gamedetail_begin as 
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
        ,0 as is_quit 
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    union ALL
    SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,1 as is_quit 
    from 
        ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    dsroomID
    ,if(count(distinct if(is_quit=1,vopenid,null))>0,1,0) as is_quit_room
from
    gamedetail_begin
group by
    dsroomID
),
desk_num as
(select
    vopenid
    ,p_date
    ,count(distinct dsroomID) as desknum
from
    gamedetail_begin
group by
    vopenid
    ,p_date),
gamedetail as 
(select
    gamedetail_begin.*
    ,is_quit_room
    ,desknum
from
    gamedetail_begin 
left join
    quit_info on gamedetail_begin.dsroomID = quit_info.dsroomID
left join
    desk_num on gamedetail_begin.vopenid = desk_num.vopenid and gamedetail_begin.p_Date = desk_num.p_date
),
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
    tdbank_imp_date between '2025033100' and '2025040923'
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
    ,is_quit_room
    ,is_quit
    ,desknum
from
    gamedetail
left JOIN
    map_info on gamedetail.iDungeonID = map_info.idungeonid
left join
    act_state on gamedetail.p_date = act_state.p_date and gamedetail.vopenid = act_state.vopenid
WHERE
    gamedetail.iDungeonID not in (2004010,2003010,3001004,2005041,3001001)
)
select
    desknum
    ,is_quit_room
    ,is_quit
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
    desknum
    ,is_quit_room
    ,is_quit











--对局中退人数分布
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
   tdbank_imp_date BETWEEN '2025033100' and '2025040923'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
gamedetail_begin as 
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
        ,0 as is_quit 
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
        and iDungeonID not in (2004010,2003010,3001004,2005041,3001001)
    union ALL
    SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,1 as is_quit 
    from 
        ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025040823'
        and iDungeonID not in (2004010,2003010,3001004,2005041,3001001)
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    dsroomID
    ,count(distinct vopenid) as real_player_num
    ,count(distinct if(is_quit=1,vopenid,null)) as quit_player_num
    ,if(count(distinct if(is_quit=1,vopenid,null))>0,1,0) as is_quit_room
from
    gamedetail_begin
group by
    dsroomID
)
select
    real_player_num
    ,quit_player_num
    ,count(distinct dsroomID) as desk_num
from
    quit_info
group by
    real_player_num
    ,quit_player_num

