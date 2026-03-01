-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************


--分模式中退率
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
   tdbank_imp_date BETWEEN '2025072800' and '2025080123'
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
        ,if(iIsWin = 1 ,1,0) as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,0 as is_quit 
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    union ALL
    SELECT 
        vopenid
        ,dsroomID
        ,0 as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,1 as is_quit 
    from 
        ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    gamedetail_begin.*
    ,excelconfig.*
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
    param8 in ('普通','英雄','炼狱','困难','折磨','折磨II')
)
select
    param4 as map_id
    ,count(distinct vopenid,dsroomID) as player_room_num
    ,count(distinct vopenid) as player_num
    ,count(distinct dsroomID) as room_num
    ,count(distinct if(iIsWin=1,vopenid,null)) as win_player_num
    ,avg(is_quit) as quit_rate
    ,avg(iIsWin) as win_rate
from
    quit_info
group by
    param4





--分天分模式中退率
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
   tdbank_imp_date BETWEEN '2025072800' and '2025080123'
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
        ,if(iIsWin = 1 ,1,0) as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,0 as is_quit 
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    union ALL
    SELECT 
        vopenid
        ,dsroomID
        ,0 as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,1 as is_quit 
    from 
        ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    gamedetail_begin.*
    ,excelconfig.*
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
    param8 in ('普通','英雄','炼狱','困难','折磨','折磨II')
)
select
    p_date
    ,param4 as map_id
    ,count(distinct vopenid,dsroomID) as player_room_num
    ,count(distinct vopenid) as player_num
    ,count(distinct dsroomID) as room_num
    ,count(distinct if(iIsWin=1,vopenid,null)) as win_player_num
    ,count(distinct if(is_quit=1,concat(vopenid,'_',dsroomID),null))/count(distinct vopenid,dsroomID) as quit_rate
    ,avg(iIsWin) as win_rate
from
    quit_info
group by
    p_date
    ,param4



--分模式中退率
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
   tdbank_imp_date BETWEEN '2025072800' and '2025080123'
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
        ,if(iIsWin = 1 ,1,0) as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,0 as is_quit 
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    union ALL
    SELECT 
        vopenid
        ,dsroomID
        ,0 as iIsWin
        ,RealPlayerNumWhenStart
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
        ,1 as is_quit 
    from 
        ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025072800' and '2025080123'
    ) gd
join
    player on gd.vopenid= player.vopenid),
quit_info as 
(select
    gamedetail_begin.*
    ,excelconfig.*
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
    param8 in ('普通','英雄','炼狱','困难','折磨','折磨II')
)
select
    param4 as map_id
    ,count(distinct vopenid,dsroomID) as player_room_num
    ,count(distinct vopenid) as player_num
    ,count(distinct dsroomID) as room_num
    ,count(distinct if(iIsWin=1,vopenid,null)) as win_player_num
    ,count(distinct if(is_quit=1,concat(vopenid,'_',dsroomID),null))/count(distinct vopenid,dsroomID) as quit_rate
    ,avg(iIsWin) as win_rate
from
    quit_info
group by
    param4