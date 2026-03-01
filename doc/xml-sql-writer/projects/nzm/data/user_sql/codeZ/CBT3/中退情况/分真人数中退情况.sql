-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************



--除挑战模式PVE对局中退人数分布
with player as 
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025090800' and '2025101223'
),
gamedetail_begin as 
(select
    gd.*
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    dsroomID
    ,param8
    ,count(distinct vopenid) as real_player_num
    ,count(distinct if(is_quit=1,vopenid,null)) as quit_player_num
    ,if(count(distinct if(is_quit=1,vopenid,null))>0,1,0) as is_quit_room
from
    gamedetail_begin
    join
    (select
   distinct
      param1 as dungeon_id,
      param2 as map_id,
      param4,
      param7,
      param8
   from
      codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo') excelconfig on gamedetail_begin.iDungeonID = excelconfig.dungeon_id
where
    param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','挑战模式') and param4 = '塔防'
group by
    dsroomID
    ,param8
)
select
    param8
    ,real_player_num
    ,quit_player_num
    ,count(distinct dsroomID) as desk_num
from
    quit_info
group by
    param8
    ,real_player_num
    ,quit_player_num



--挑战模式分真人数中退情况
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
   tdbank_imp_date BETWEEN '2025090800' and '2025101223'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::codez_vopenid_ce20250728)nzqq on regi.vopenid = nzqq.vopenid),
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
        and iDungeonID in (
2002111,
2002112,
2002211,
2002212,
2002511,
2002512)
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
        and iDungeonID in (
2002111,
2002112,
2002211,
2002212,
2002511,
2002512)
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




--多于4真人对局数
--除挑战模式PVE对局中退人数分布
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
   tdbank_imp_date BETWEEN '2025090800' and '2025101223'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::codez_vopenid_ce20250728)nzqq on regi.vopenid = nzqq.vopenid),
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
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
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    dsroomID
    ,iDungeonID
    ,count(distinct vopenid) as real_player_num
    ,count(distinct if(is_quit=1,vopenid,null)) as quit_player_num
    ,if(count(distinct if(is_quit=1,vopenid,null))>0,1,0) as is_quit_room
from
    gamedetail_begin
group by
    dsroomID
    ,iDungeonID
)
select
    *
from
    quit_info
where
    real_player_num > 4




select
    distinct
    iDungeonID
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' and '2025101223'

select
   distinct
      param1 as dungeon_id,
      param2 as map_id,
      param4,
      param7,
      param8
   from
      codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'