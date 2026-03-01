-- ============================================
-- 需求: 玩家定义(is_core)和IP类型(from_tag)分类统计
-- 口径说明:
--   玩家定义: is_core 字段（核心/次核/其他玩家）
--   IP类型: from_tag 字段（ip/not ip/其他玩家）— 可忽略
--   在线时长: ads_sr_codez_actv_di 表 onln_time, platid=255 全平台
--   付费金额: ads_sr_codez_pay_di 表 pay_amt, platid=255 全平台
--   注册平台: SR侧注册表 codez_log.codez_dsl_playerregister_fht0, 分区字段 dteventdate
-- 数据源: SR 表（dwd_sr_codez_player_losstag_di, ads_sr_codez_actv_di, ads_sr_codez_pay_di, dim_sr_codez_player_losstag_df, codez_log.codez_dsl_playerregister_fht0）
-- ============================================

select 
a.dtstatdate,
a.vopenid,
a.itype,
onln_time,
pay_amt,
payid,
a.a1 as 玩家定义,
a.a2 as IP类型,
tatalnums as totalnum,
platid_new as regi_platid,
usernum
from 
(
select 
a.dtstatdate,
a.vopenid,
a.itype,
onln_time,
platid_new,
pay_amt,
c.vopenid as payid,
COALESCE(is_core,'其他玩家') as a1,
COALESCE(from_tag,'其他玩家') as a2
from 
(
select
*
from
dwd_sr_codez_player_losstag_di
where
dtstatdate between '${:sys_starttime}' and '${:sys_endtime}'
)a
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
)regi on a.vopenid = regi.vopenid
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
)a 
left join 
(
select
dtstatdate,
COALESCE(is_core,'其他玩家') as a1,
COALESCE(from_tag,'其他玩家') as a2,
count(distinct suin) as usernum
from
dim_sr_codez_player_losstag_df
where
dtstatdate between '${:sys_starttime}' and '${:sys_endtime}'
group by dtstatdate,
COALESCE(is_core,'其他玩家'),
COALESCE(from_tag,'其他玩家')
)b 
on a.dtstatdate = b.dtstatdate and a.a1 = b.a1 and a.a2 = b.a2
left join 
(
select 
'核心' as is_core,
'ip' as from_tag,
8974986 as tatalnums
union all 
select 
'次核' as is_core,
'ip' as from_tag,
5577465 as tatalnums
union all 
select 
'核心' as is_core,
'not ip' as from_tag,
4225014 as tatalnums
union all 
select 
'次核' as is_core,
'not ip' as from_tag,
4822535 as tatalnums

)d
on a.a1 = d.is_core and a.a2 = d.from_tag
--where a.a1 <>'其他玩家' and a.a2 <>'其他玩家'
