-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
  

select
    pcce.vopenid,
    vroleid,
    if(reggi_2.vopenid is null, 0, 1) as is_new
from
(select
    vopenid
from
codez_mid_analysis.codez_vopenid_whitelist_pcce20251223) pcce
join
(select
    vopenid
    ,vroleid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
where
    tdbank_imp_date between '2025122300' and '2025122323')regi on pcce.vopenid = regi.vopenid
left join
(select
    distinct 
    vopenid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
where
    tdbank_imp_date between '2024122300' and '2025122223')reggi_2 on pcce.vopenid = reggi_2.vopenid






select
    count(distinct vopenid) as player_num
from
    ieg_tdbank::codez_dsl_playerbeginnerguideflow2_fht0
where
    tdbank_imp_date between '2025122300' and '2025122523'
    and guideid = 805

select
stepid
    ,count(distinct regi.vopenid) as player_num
from
(select
    vopenid
    ,vroleid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
where
    tdbank_imp_date between '2025122300' and '2025122523'
    and areaid = 1)regi
join
(select
    stepid,vopenid
from
    ieg_tdbank::codez_dsl_playerbeginnerguideflow2_fht0
where
    tdbank_imp_date between '2025122300' and '2025122523'
    and guideid = 805)guide on regi.vopenid = guide.vopenid
group by
    stepid
order by
    stepid


select
    registertime_num
    ,count(distinct vopenid) as player_num
from
(select
   distinct
	vopenid
   ,count(distinct registertime) as registertime_num
from
	codez_dsl_playerlogout_fht0
where
tdbank_imp_date between '2025122300' and '2025122523'
group by
    vopenid
)
group by
    registertime_num