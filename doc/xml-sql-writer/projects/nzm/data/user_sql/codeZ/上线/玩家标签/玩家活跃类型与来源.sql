-- 玩家活跃类型与游戏来源查询
-- 数据源: dwd_sr_codez_player_activetag_di (活跃标签), ads_sr_codez_actv_di (在线时长), ads_sr_codez_pay_di (付费), codez_log.codez_dsl_playerregister_fht0 (注册)
-- itype: 1=近一个月活跃, 2=近2~3个月活跃, 3=流失3个月以上
-- busi_name: 游戏来源, NULL=盘外来源
select 
a.dtstatdate,
a.vopenid,
case when a.itype = 1 then '游戏近一个月活跃'
when a.itype = 2 then '游戏近期2~3个月活跃'
when a.itype = 3 then '游戏流失3个月以上'
else '其他' end as 游戏活跃类型,
COALESCE(onln_time,0) as onln_time,
pay_amt,
c.vopenid as payid,
platid_new as regi_platid,
COALESCE(busi_name,'盘外来源') as 游戏来源
from 
(
select
dtstatdate,
vopenid,
itype,
busi_name
from
dwd_sr_codez_player_activetag_di
where
dtstatdate between '${:sys_starttime}' and '${:sys_endtime}'
)a
join
(select
   dteventdate,
   case when registchannel like '59%' THEN '云游'
   when PlatID in (0,1,12) then '移动端'
   when PlatID = 2 then 'PC'
   else '未知' end as platid_new,
   vopenid
from
    codez_log.codez_dsl_playerregister_fht0
where
    dteventdate BETWEEN '${:sys_starttime}' and '${:sys_endtime}'
    and env = 'live'
)regi on a.dtstatdate = regi.dteventdate and a.vopenid = regi.vopenid
left join 
(
select 
dteventtime,
vopenid,
sum(onln_time) as onln_time
from 
ads_sr_codez_actv_di
where dteventtime  between '${:sys_starttime}' and '${:sys_endtime}' and platid = 255
group by 
dteventtime,
vopenid
)b 
on a.dtstatdate = b.dteventtime and a.vopenid = b.vopenid 
left join 
(
select 
dteventtime,
vopenid,
sum(pay_amt) as pay_amt
from 
ads_sr_codez_pay_di
where dteventtime  between '${:sys_starttime}' and '${:sys_endtime}' and platid = 255
group by 
dteventtime,
vopenid
)c
on a.dtstatdate = c.dteventtime and a.vopenid = c.vopenid
