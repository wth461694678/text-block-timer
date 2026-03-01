/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--是否购买金枪玩家留存
with player as
(select
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030723'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid
join
(select
    vopenid
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030700' and '2025030723'
union
select
    vopenid
from
    ieg_tdbank::codez_dsl_playerlogout_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030700' and '2025030723'
)logout on regi.vopenid = logout.vopenid),
if_use as(
select
    vopenid
from
(select
    WeaponID1 as weaponid
    ,vopenid
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030700' and '2025030723'
   and ReportType = 1
union ALL
select
    WeaponID2 as weaponid
    ,vopenid
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030700' and '2025030723'
   and ReportType = 1
)
WHERE weaponid in ('20102000002','20106000002','20107000001','20116000001')
),
if_act as (
select
    vopenid
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030800' and '2025030823'
union
select
    vopenid
from
    ieg_tdbank::codez_dsl_playerlogout_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030800' and '2025030823'
),
game_part as (
select
    vopenid
    ,iIsWin
    ,p_date
from
(select
    vopenid
    ,iIsWin
    ,substr(tdbank_imp_date,1,8) as p_date
    ,idungeonid
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025030700' and '2025030823' and vopenid in (select vopenid from if_use))gamedetail
join
(select
    dungeon_id
    ,mode_type
from
    codez_ret_mapname_conf
where
   mode_type = '僵尸猎场'
)mapname on gamedetail.idungeonid = mapname.dungeon_id
),
game_act as (
select
    vopenid
    ,iIsWin
    ,p_date
from
(select
    vopenid
    ,iIsWin
    ,substr(tdbank_imp_date,1,8) as p_date
    ,idungeonid
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
    tdbank_imp_date BETWEEN '2025030800' and '2025030823')gamedetail
join
(select
    dungeon_id
    ,mode_type
from
    codez_ret_mapname_conf
where
   mode_type = '僵尸猎场'
))
select
    iIsWin
    ,count(distinct game_part.vopenid) as player_num
    ,count(distinct if_act.vopenid)/count(distinct game_part.vopenid) as return_rate
    ,count(distinct game_act.vopenid)/count(distinct game_part.vopenid) as game_return_rate
from 
    game_part
left join
    if_act on game_part.vopenid = if_act.vopenid
left join
    game_act on game_part.vopenid = game_act.vopenid
group BY
    iIsWin