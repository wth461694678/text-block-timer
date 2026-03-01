-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
  

--分IP类型公会参与率 
select
   iptype
   ,avg(if_gonghui) as avg_if_gonghui
from
(SELECT
   vroleid
   ,vopenid
   ,env
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025090800' AND '2025091423')regi
join
(select
   *
from
   codez_vopenid_cbt3_20250908)codez on regi.vopenid = codez.vopenid
left join
(select
    vopenid
    ,if(max(iGuildID)<>'0',1,0) as if_gonghui
from
    ieg_tdbank::codez_dsl_playerlogout_fht0
where
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
GROUP BY
    vopenid)logout on regi.vopenid = logout.vopenid
group BY
    iptype

--玩家加入工会后，迅速领取工会相关任务的比例
select
    case when gap_seconds < 300 then '1-10min'
    when gap_seconds >= 300 and gap_seconds < 3600 then '2-10min-1h'
    when gap_seconds >= 3600 then '3-1h以上'
    else '4-未完成' end as gap_seconds
    ,count(distinct vopenid) as player_num
from
(select
   uniontime.vopenid
   ,UNIX_TIMESTAMP(task_time)- UNIX_TIMESTAMP(union_time) as gap_seconds
from
--加入公会时间
(select
    vopenid
    ,min(dteventtime) as union_time
from
    ieg_tdbank::codez_dsl_JoinUnion_fht0
where
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
group by
    vopenid)uniontime
left join
--首次领取公会任务时间
(select
    vopenid
    ,min(dteventtime) as task_time
from
    ieg_tdbank::codez_dsl_SeasonTask_fht0
where
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
    and Status = 2
    and taskid in (702)
group by
    vopenid)seaontask on uniontime.vopenid = seaontask.vopenid)
group by
    case when gap_seconds < 300 then '1-10min'
    when gap_seconds >= 300 and gap_seconds < 3600 then '2-10min-1h'
    when gap_seconds >= 3600 then '3-1h以上'
    else '4-未完成' end

--