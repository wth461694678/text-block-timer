--分组队人数留存情况
 with team_type as
(select
TO_DATE('20250728' ,'yyyymmdd') as date_new
,teamtype.*
,codez.*
,excelconfig.*
from
(select
   *
from
   dwd_sr_codez_teamtype_di
where
   p_Date = '2025-07-28T00:00:00'
   and env = 'live')teamtype
join
(SELECT
   vroleid
   ,vopenid
   ,env
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025072800' AND '2025072823')regi on teamtype.vroleid = regi.vroleid
join
(select
   *
from
   codez_vopenid_ce20250728)codez on regi.vopenid = codez.vopenid
join
(select
   distinct
      param1 as dungeon_id,
      param2 as map_id,
      param4 as mode_type,
      param7,
      param8
   from
      codez_ret_excelconfiginfo_conf
   where
   configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II'))) excelconfig on teamtype.dungeonid  = excelconfig.dungeon_id
),
act_state as 
(select
   TO_DATE((tdbank_imp_date,1,8) ,'yyyymmdd') as p_date
   ,vopenid
   ,sum(OnlineTime)/3600 as onlinetime
from
   ieg_tdbank::codez_dsl_playerlogout_fht0
WHERE
   tdbank_imp_date BETWEEN '2025072800' AND '2025080123'
group by
   TO_DATE((tdbank_imp_date,1,8) ,'yyyymmdd')
   ,vopenid
)
select
    -- team_type.p_date
    -- ,
    iptype
    ,playercount
    ,mode_type
    ,count(distinct team_type.vopenid) as player_num 
    --,avg(team_type.onlinetime) as avg_onlinetime
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=1,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_2
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=2,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_3
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=6,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_7
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=1,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=2,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=6,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_7
from
    team_type
left join
    act_state on team_type.vopenid = act_state.vopenid
group by
    -- team_type.p_date
    -- ,
    iptype
    ,mode_type
    ,playercount



--CBT3组队次留情况
--分组队人数留存情况
 with team_type as
(select
TO_DATE('20250908' ,'yyyymmdd') as date_new
,teamtype.*
,codez.*
,excelconfig.*
from
(select
   *
from
   dwd_sr_codez_teamtype_di
where
   p_Date = '2025-09-08T00:00:00'
   and env = 'live')teamtype
join
(SELECT
   vroleid
   ,vopenid
   ,env
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025090800' AND '2025090823')regi on teamtype.vroleid = regi.vroleid
join
(select
   *
from
   codez_vopenid_cbt3_20250908)codez on regi.vopenid = codez.vopenid
join
(select
   distinct
      param1 as dungeon_id,
      param2 as map_id,
      param4 as mode_type,
      param7,
      param8
   from
      codez_ret_excelconfiginfo_conf
   where
   configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速') or param4 = '机甲战')) excelconfig on teamtype.dungeonid  = excelconfig.dungeon_id
),
act_state as 
(select
   TO_DATE(substr(tdbank_imp_date,1,8) ,'yyyymmdd') as p_date
   ,vopenid
   ,sum(OnlineTime)/3600 as onlinetime
from
   ieg_tdbank::codez_dsl_playerlogout_fht0
WHERE
   tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
group by
   TO_DATE(substr(tdbank_imp_date,1,8) ,'yyyymmdd')
   ,vopenid
)
select
    -- team_type.p_date
    -- ,
    iptype
    ,if(playercount>=2,'组队','单人') as team_type
    --,mode_type
    ,count(distinct team_type.vopenid) as player_num 
    --,avg(team_type.onlinetime) as avg_onlinetime
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=1,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_2
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=2,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_3
    ,sum(if(datediff(act_state.p_date,team_type.date_new)=6,onlinetime,0))/count(distinct concat(team_type.p_date,team_type.vopenid)) as onlinetime_7
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=1,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_2
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=2,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_3
    ,count(distinct if(datediff(act_state.p_date,team_type.date_new)=6,act_state.vopenid,null))/count(distinct concat(team_type.p_date,team_type.vopenid)) as retained_rate_7
from
    team_type
left join
    act_state on team_type.vopenid = act_state.vopenid
group by
    -- team_type.p_date
    -- ,
    iptype
    --,mode_type
    ,if(playercount>=2,'组队','单人')


---玩家好友人数
--聚类特征
with player as 
(select 
    *
from 
    codez_mid_analysis.codez_vopenid_cbt3_20250908
),

--注册表字段
regi as
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025090823'
    AND env = 'live'
),
--添加好友数
add_friend as
(select
    vopenid
    ,count(distinct vapplyopenid) as add_friend_num
from
(select
    vopenid
    ,vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
UNION all
select
    vapplyopenid as vopenid
    ,vopenid as vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live')
group by
    vopenid)
select
    add_friend.add_friend_num
    ,count(distinct player.vopenid) as player_num
from
    player
    join
    regi on player.vopenid = regi.vopenid
    left join
    add_friend on player.vopenid = add_friend.vopenid
group by
    add_friend.add_friend_num