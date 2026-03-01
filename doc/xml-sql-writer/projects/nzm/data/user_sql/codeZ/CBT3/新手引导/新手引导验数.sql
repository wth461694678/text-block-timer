-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
SELECT
    *
from
    codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025072500' and '2025072512'
    and guideid < 202
    and vopenid in (SELECT vopenid from codez_dsl_playerBeginnerGuideFlow2_fht0 where tdbank_imp_date between '2025072500' and '2025072512' and guideid = 201)



SELECT
        dteventtime,
        vgameappid,
        platid,
        izoneareaid,
        vopenid,
        vroleid,
        env,
        --IF(guideid DIV 1000 = 3, 1000 + guideid % 3000, guideid) AS guideid,
        guideid,
        result,
        stepid,
        --IF(stepid DIV 100000 = 3, 100000 + stepid % 300000, stepid) AS stepid,
        duration
    FROM ieg_tdbank.codez_dsl_playerbeginnerguideflow2_fht0
    WHERE tdbank_imp_date between '2025090800' and '2025093012'

--追猎新手bug
SELECT
    *
from
    codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025092900' and '2025092923'
    and guideid = 9113
    and vopenid not in (SELECT vopenid from codez_dsl_playerBeginnerGuideFlow2_fht0 where tdbank_imp_date between '2025092900' and '2025092923' and guideid = 9110)




--开火模式偏好
select
    SelectFireMode
    ,count(distinct vopenid)    as num
from
(select
    distinct
    vopenid
    ,max(SelectFireMode) as SelectFireMode
from
    ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025072800' and '2025072923'
    and vopenid in (select vopenid from codez_mid_analysis::codez_vopenid_ce20250728)
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0 
    WHERE
    tdbank_imp_date between '2025072800' and '2025072923')
group BY
    vopenid
)
group BY
    SelectFireMode


--布局模式偏好
select
    SelectHUDLayout
    ,count(distinct vopenid)    as num
from
(select
    vopenid
    ,max(SelectHUDLayout) as SelectHUDLayout
    --,ROW_NUMBER() OVER (PARTITION BY vopenid ORDER BY dteventtime DESC) AS rn
from
    ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025072800' and '2025072923'
    and vopenid in (select vopenid from codez_mid_analysis::codez_vopenid_ce20250728)
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2025072800' and '2025072923')
group BY
    vopenid
)
-- where
--     rn = 1
group BY
    SelectHUDLayout


--冰点缘起人数
select
    iptype
    ,count(distinct allo.vopenid) as num
from
(select
    vopenid
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date between '2025090800' and '2025091423'
    and DungeonID=2004051
    --and vopenid in (select vopenid from codez_mid_analysis::codez_vopenid_cbt3_20250908)
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0 where
    tdbank_imp_date between '2025090800' and '2025091423'))allo
JOIN
(select
    *
from
    codez_mid_analysis::codez_vopenid_cbt3_20250908)codez on allo.vopenid = codez.vopenid
group BY
    iptype




/* 说明：
1、数据集结果中时间字段请自行规整到小时，天等粒度
2、以下为系统内置参数:
   ${:sys_appcode} 业务 code，${:sys_starttime} 起始时间，${:sys_endtime} 结束时间
   运行时，平台会根据当次业务 code，查询范围起止时间（格式 2022-01-01 00:00:00）自动替换上述系统参数
3、若用户需要自定义添加参数，请使用 ${param} 格式
   运行时，平台会使用用户配置的值来替换自定义参数
 */
select
   distinct
   regi.*
   ,iptype
   ,gametype
   ,if(skipguide.vopenid is not null,1,0) as is_skip
from
(select
   *
from
   codez_dsl_playerregister_fht0
where
    tdbank_imp_date between '2025111800' and '2025111823'
   and vrolename = '烬锋精英漫游者') regi
left join
(
select
   *
from
   codez_dsl_veteranplayerskipbeginnerguide_fht0
where
   tdbank_imp_date between '2025111800' and '2025111823'
   and vopenid in ('194052868841674','217094993156580') 
)skipguide on regi.vopenid = skipguide.vopenid



--星海虫影时间
select
    SUM(Duration) /COUNT(DISTINCT vopenid) AS AVG_Duration
from
(select
    vopenid
    ,guideid
    ,max(Duration) as Duration
from
    codez_dsl_playerBeginnerGuideFlow2_fht0
where
    tdbank_imp_date between '2025072800' and '2025080123'
    AND guideid <= 201
group BY
    vopenid
    ,guideid)



--星海虫影时间CE3
SELECT
    count(DISTINCT vopenid)
    ,AVG(diff_seconds)/60 AS avg_diff_seconds
FROM (
select  
    regi.vopenid,
unix_timestamp(guide.end_dteventtime) - unix_timestamp(regi.regi_dteventtime) AS diff_seconds
    FROM (
        SELECT
            vopenid,
            MIN(dteventtime) AS regi_dteventtime
        FROM
            codez_dsl_playerregister_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025072800' AND '2025072823'
            -- AND vopenid IN (
            --     SELECT vopenid
            --     FROM codez_mid_analysis.codez_vopenid_ce20250728
            -- )
        GROUP BY vopenid
    ) regi
    JOIN (
        SELECT
            vopenid,
            MIN(dteventtime) AS end_dteventtime
        FROM
            codez_dsl_playerBeginnerGuideFlow2_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025072800' AND '2025072823'
            AND stepid = 80000
        GROUP BY vopenid
    ) guide ON regi.vopenid = guide.vopenid
    join
    (
    select
        distinct
        vopenid
    from
        codez_mid_analysis::codez_vopenid_ce20250728
    ) whitelist on regi.vopenid = whitelist.vopenid
    left JOIN
    (select
        vopenid
        ,min(dteventtime) as logout_dteventtime
    from
        codez_dsl_playerlogout_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025072800' AND '2025072823'
    group BY
        vopenid)logout on regi.vopenid = logout.vopenid
    where
        logout_dteventtime > end_dteventtime
) t



--星海虫影时间CBT3
SELECT
    count(DISTINCT vopenid)
    ,AVG(diff_seconds)/60 AS avg_diff_seconds
FROM (
select  
    regi.vopenid,
unix_timestamp(guide.end_dteventtime) - unix_timestamp(regi.regi_dteventtime) AS diff_seconds
    FROM (
        SELECT
            vopenid,
            MIN(dteventtime) AS regi_dteventtime
        FROM
            codez_dsl_playerregister_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025112000' AND '2025112023'
            -- AND vopenid IN (
            --     SELECT vopenid
            --     FROM codez_mid_analysis.codez_vopenid_ce20250728
            -- )
        GROUP BY vopenid
    ) regi
    JOIN (
        SELECT
            vopenid,
            MIN(dteventtime) AS end_dteventtime
        FROM
            codez_dsl_playerBeginnerGuideFlow2_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025112000' AND '2025112023'
            AND stepid = 80000
        GROUP BY vopenid
    ) guide ON regi.vopenid = guide.vopenid
    join
    (
    select
        distinct
        vopenid
    from
        codez_mid_analysis::dim_codez_vopenid_whitelist_ce20251120
    ) whitelist on regi.vopenid = whitelist.vopenid
    left JOIN
    (select
        vopenid
        ,min(dteventtime) as logout_dteventtime
    from
        codez_dsl_playerlogout_fht0
        WHERE
            tdbank_imp_date BETWEEN '2025112000' AND '2025112023'
    group BY
        vopenid)logout on regi.vopenid = logout.vopenid
    where
        logout_dteventtime > end_dteventtime
) t




--星海虫影时间
select
    avg(iFinTime)
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
where
    tdbank_imp_date between '2025072800' and '2025080123'
    and iDungeonID=2013001
    and vopenid in (select vopenid from codez_mid_analysis::codez_vopenid_ce20250728)
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0 where
    tdbank_imp_date between '2025072800' and '2025080123')


--首周新手玩家后期是否会回归
select
    mode
    ,count(distinct guideid_stay.vopenid) as player_num
    ,count(distinct logout.vopenid)/count(distinct guideid_stay.vopenid) as stay_rate
from
(select
    vopenid
    ,guideid
    ,step_rank
    ,mode
from
(select
    guideid_stay.vopenid
    ,guideid_stay.guideid
    ,mode
    ,step_rank
    ,row_number()over(PARTITION BY guideid_stay.vopenid order by step_rank desc) as guide_rank
from
(SELECT
    vopenid
    ,stepid
    ,guideid
from
    ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025091423'
    and vopenid in (select vopenid from codez_mid_analysis::codez_vopenid_cbt3_20250908))guideid_stay
left join
(SELECT
    mode,
    stepid,
    guideid,
    MAX(step_rank) AS step_rank,
    step_content,
    guide_type,
    `system` AS plat_system
FROM
    codez_ret_cbt3_beginnerguide_conf
GROUP BY
    mode,
    stepid,
    guideid,
    step_content,
    guide_type,
    `system`)beginnerguide on guideid_stay.guideid = beginnerguide.guideid and guideid_stay.stepid = beginnerguide.stepid)
where
    guide_rank = 1)guideid_stay
left JOIN
(select vopenid from ieg_tdbank::codez_dsl_playerlogout_fht0 where
    tdbank_imp_date between '2025091500' and '2025092123') logout on guideid_stay.vopenid = logout.vopenid
group BY
    mode



select
is_skip
,is_logout
,count(distinct vopenid) as player_num
from
(select
   distinct
   regi.*
   ,if(skipguide.vopenid is not null,1,0) as is_skip
   ,if(logout.vopenid is not null,1,0) as is_logout
from
(select
   *
from
   ieg_tdbank::codez_dsl_playerregister_fht0
where
   tdbank_imp_date between '2025111700' and '2025111723') regi
left join
(select
   distinct
   vopenid
   --,1 as is_skip
from
   ieg_tdbank::codez_dsl_veteranplayerskipbeginnerguide_fht0
where
   tdbank_imp_date between '2025111700' and '2025111723')skipguide on regi.vopenid = skipguide.vopenid
left join
(
    select vopenid from ieg_tdbank::codez_dsl_playerlogout_fht0 where
    tdbank_imp_date between '2025111800' and '2025111823'
)logout on regi.vopenid = logout.vopenid)
group by
is_skip
,is_logout



--是否跳过新手引导
(
SELECT
vgameappid,
vopenid,
env,
-1 as is_skip
FROM
ieg_tdbank::codez_dsl_playerregister_fht0
where tdbank_imp_date>='${YYYYMMDD}' and tdbank_imp_date<'${YYYYMM(DD+1)}'  
vGameAppid,env,vOpenID
union
SELECT
    vgameappid,
    vopenid,
    env,
   ,max(isveteranplayer) as is_skip
FROM
   ieg_tdbank::codez_dsl_playerBeginnerGuideFlow2_fht0
where
   tdbank_imp_date>='${YYYYMMDD}' and tdbank_imp_date<'${YYYYMM(DD+1)}' 
   and IsExtraData = 1 and SelectFireMode = 0 and SelectHUDLayout = 0
group by
    vgameappid,
    vopenid,
    env)





SELECT
            param1 as dungeon_id,
            param2 as map_id,
            param4 as '模式',
            param7 as '地图',
            param8 as '难度'
        from
            codez_ret_excelconfiginfo_conf
        where
            configname = 'FubenEntranceInfo'
        group by 
            param1,
            param2,
            param4,
            param7,
            param8