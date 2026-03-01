/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--一阶登录比
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
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
act_player as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid),
next_week as 
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as three_act_days
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025040700' and '2025041323'
    and env = 'tiyan'
group by
    vopenid)
select
    count(distinct if(act_days >= 2,player.vopenid,null)) as two_day_player
    ,count(distinct if(act_days >= 3,player.vopenid,null)) as three_day_player
    ,count(distinct if(act_days >= 3 and next_week.vopenid is not null,player.vopenid,null)) as next_week_player
from
    player
left join
    act_player on player.vopenid = act_player.vopenid
left join
    next_week on player.vopenid = next_week.vopenid

--首次测试
with player as 
(select
    distinct
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
   tdbank_imp_date BETWEEN '2024090600' and '2024090623'
   )regi
),
act_player as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2024090600' and '2024091223'
    and env = 'tiyan'
group by
    vopenid)
select
    count(distinct if(act_days >= 2,player.vopenid,null)) as two_day_player
    ,count(distinct if(act_days >= 3,player.vopenid,null)) as three_day_player
    --,count(distinct if(act_days >= 3 and next_week.vopenid is not null,player.vopenid,null)) as next_week_player
from
    player
left join
    act_player on player.vopenid = act_player.vopenid










--登录比验证
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
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
act_player as
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as act_days
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040623'
    and env = 'tiyan'
group by
    vopenid),
next_week as 
(select
    vopenid
    ,count(distinct substr(tdbank_imp_date,1,8)) as three_act_days
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025040700' and '2025041323'
    and env = 'tiyan'
group by
    vopenid)
select
    act_days
    ,if(next_week.vopenid is not null,1,0) as is_next_week
    ,count(distinct player.vopenid) as player_num
from
    player
left join
    act_player on player.vopenid = act_player.vopenid
left join
    next_week on player.vopenid = next_week.vopenid
group by
    act_days
    ,if(next_week.vopenid is not null,1,0)


--
select
    count(distinct vopenid)
    --,sum(OnlineTime) as onlinetime
    --,sum(OnlineTime/3600)/count(distinct substr(tdbank_imp_date,1,8)) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2024090100' and '2024093023'
    and env = 'tiyan'