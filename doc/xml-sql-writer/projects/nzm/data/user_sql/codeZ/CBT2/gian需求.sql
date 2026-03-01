/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--分在线时长战力情况
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
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
Schemeinfo as (select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,max(cast(ScoreSum as bigint)) as ScoreSum
    ,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041023'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
online_time as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    ,sum(OnlineTime) as onlinetime
    ,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041023'
    and env = 'tiyan'
group by
    vopenid)
select 
    CASE
    WHEN ((cast(avg_onlinetime AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(avg_onlinetime AS DOUBLE) >= 0)and(cast(avg_onlinetime AS DOUBLE) < 1)) THEN
    '[0,1)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 1)and(cast(avg_onlinetime AS DOUBLE) < 2)) THEN
  '[1,2)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 2)and(cast(avg_onlinetime AS DOUBLE) < 3)) THEN
  '[2,3)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 3)and(cast(avg_onlinetime AS DOUBLE) < 4)) THEN
  '[3,4)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 4)and(cast(avg_onlinetime AS DOUBLE) < 5)) THEN
  '[4,5)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 5)and(cast(avg_onlinetime AS DOUBLE) < 6)) THEN
  '[5,6)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 6)and(cast(avg_onlinetime AS DOUBLE) < 7)) THEN
  '[6,7)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 7)and(cast(avg_onlinetime AS DOUBLE) < 8)) THEN
  '[7,8)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 8)and(cast(avg_onlinetime AS DOUBLE) < 9)) THEN
  '[8,9)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 9)and(cast(avg_onlinetime AS DOUBLE) < 10)) THEN
  '[9,10)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 10)) THEN
  '[10,+∞)'
  ELSE NULL
  ENd as avg_onlinetime
  ,day_rank
  ,count(distinct player.vopenid) as act_players
  ,avg(COALESCE(ScoreSum,0)) as avg_scoresum
from
    player
left join
    Schemeinfo on player.vopenid = Schemeinfo.vopenid
left join
    online_time on player.vopenid = online_time.vopenid
WHERE
    act_days = 11
group by
    CASE
    WHEN ((cast(avg_onlinetime AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(avg_onlinetime AS DOUBLE) >= 0)and(cast(avg_onlinetime AS DOUBLE) < 1)) THEN
    '[0,1)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 1)and(cast(avg_onlinetime AS DOUBLE) < 2)) THEN
  '[1,2)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 2)and(cast(avg_onlinetime AS DOUBLE) < 3)) THEN
  '[2,3)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 3)and(cast(avg_onlinetime AS DOUBLE) < 4)) THEN
  '[3,4)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 4)and(cast(avg_onlinetime AS DOUBLE) < 5)) THEN
  '[4,5)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 5)and(cast(avg_onlinetime AS DOUBLE) < 6)) THEN
  '[5,6)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 6)and(cast(avg_onlinetime AS DOUBLE) < 7)) THEN
  '[6,7)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 7)and(cast(avg_onlinetime AS DOUBLE) < 8)) THEN
  '[7,8)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 8)and(cast(avg_onlinetime AS DOUBLE) < 9)) THEN
  '[8,9)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 9)and(cast(avg_onlinetime AS DOUBLE) < 10)) THEN
  '[9,10)'
  WHEN ((cast(avg_onlinetime AS DOUBLE) >= 10)) THEN
  '[10,+∞)'
  ELSE NULL
  ENd
  ,day_rank



--分在线时长战力情况帮忙 
with player as 
(select
    regi.vopenid
    ,case when iptype in ('2 逆战流失','1 逆战活跃') then '1-逆战IP'
        when iptype in ('3 逆战非经验') then '2-非逆战IP'
        when iptype in ('4 裂变玩家','5 活动玩家') then '3-裂变活动玩家' 
        else '其他' end as iptype
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
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
Schemeinfo as (select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,max(cast(ScoreSum as bigint)) as ScoreSum
    ,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040923'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
online_time as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    ,sum(OnlineTime) as onlinetime
    ,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040923'
    and env = 'tiyan'
group by
    vopenid)
select 
iptype
  ,day_rank
  ,count(distinct player.vopenid) as act_players
  ,avg(COALESCE(ScoreSum,0)) as avg_scoresum
from
    player
left join
    Schemeinfo on player.vopenid = Schemeinfo.vopenid
left join
    online_time on player.vopenid = online_time.vopenid
WHERE
    act_days = 10
group by
iptype
  ,day_rank

--玩家分小时评分成长
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
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
Schemeinfo as (select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,max(cast(ScoreSum as bigint)) as ScoreSum
    ,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040923'
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)),
Schemeinfo as (select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
    --,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040923'
group by
    vopenid),
online_time as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    ,sum(OnlineTime)/3600 as onlinetime
    ,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040923'
    and env = 'tiyan'
group by
    vopenid)
select
    floor(onlinetime) as onlinetime
    ,count(distinct player.vopenid) as player_num
    ,avg(ScoreSum)
from
    player
left join
    Schemeinfo on player.vopenid = Schemeinfo.vopenid
left join
    online_time on player.vopenid = online_time.vopenid
group by
    floor(onlinetime)



