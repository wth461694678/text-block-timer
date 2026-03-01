/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--CBT2
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025033123'
   )regi
join
(SELECT
    vopenid
   ,case when iptype in ('2 逆战流失','1 逆战活跃') then '1-逆战IP'
   when iptype in ('3 逆战非经验') then '2-非逆战IP'
   when iptype in ('4 裂变玩家','5 活动玩家') then '3-裂变活动玩家' 
   else '其他' end as iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
act_player as 
(select
    vopenid
    ,min(tdbank_imp_date) as min_log_time
from
    codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040200' and '2025040223'
group BY
    vopenid
),
first_day_player as
(select 
    iptype
    ,count(distinct vopenid) as player_num
from
    player
group BY
    iptype)
select
    player.iptype
    ,min_log_time
    ,count(distinct act_player.vopenid)/player_num as return_rate
from
    player
left join
    act_player on player.vopenid = act_player.vopenid
join
    first_day_player on player.iptype = first_day_player.iptype
group BY
    player.iptype
    ,min_log_time
    ,player_num


--CE
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030323'
   )regi
join
(SELECT
    vopenid
   ,case when iptype in ('2 逆战流失','1 逆战活跃') then '1-逆战IP'
   when iptype in ('3 逆战非经验') then '2-非逆战IP'
   when iptype in ('4 裂变玩家','5 活动玩家') then '3-裂变活动玩家' 
   else '其他' end as iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
act_player as 
(select
    vopenid
    ,min(tdbank_imp_date) as min_log_time
from
    codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030500' and '2025030523'
group BY
    vopenid
),
first_day_player as
(select 
    iptype
    ,count(distinct vopenid) as player_num
from
    player
group BY
    iptype)
select
    player.iptype
    ,min_log_time
    ,count(distinct act_player.vopenid)/player_num as return_rate
from
    player
left join
    act_player on player.vopenid = act_player.vopenid
join
    first_day_player on player.iptype = first_day_player.iptype
group BY
    player.iptype
    ,min_log_time
    ,player_num




--CBT2三留
--CBT2
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
    ,gametype
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025033123'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331
WHERE
    iptype<>'3 逆战非经验')nzqq on regi.vopenid = nzqq.vopenid),
act_player as 
(select
    vopenid
    ,min(tdbank_imp_date) as min_log_time
from
    codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040200' and '2025040223'
group BY
    vopenid
),
first_day_player as
(select 
    iptype
    ,count(distinct vopenid) as player_num
from
    player
group BY
    iptype)
select
    player.gametype
    ,count(distinct player.vopenid) as player_num
    ,count(distinct act_player.vopenid)/count(distinct player.vopenid) as return_rate
from
    player
left join
    act_player on player.vopenid = act_player.vopenid
group BY
    player.gametype



--分IP人数
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
    ,gametype
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025033123'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331
)nzqq on regi.vopenid = nzqq.vopenid)
select
    iptype
    ,count(distinct vopenid) as player_num
from
    player
group BY
    iptype