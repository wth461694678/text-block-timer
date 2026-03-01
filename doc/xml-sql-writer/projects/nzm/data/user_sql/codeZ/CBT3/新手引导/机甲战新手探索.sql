-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--新手引导流程中，玩过机甲战的玩家的比例
SELECT
    count(distinct gamedetail.vopenid) as pvp_player_num
    ,count(distinct guideflow.vopenid) as guide_player_num
    ,sum(if(level_1_time>pvp_time,1,0)) as learn_player_num
FROM
(SELECT
    vopenid
    ,min(dteventtime) as level_1_time
from
    codez_dsl_playerBeginnerGuideFlow2_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025091423'
    and guideid = 806
    and env = 'live'
GROUP BY
    vopenid)guideflow
left join
(SELECT
    vopenid
    ,min(dteventtime) as pvp_time
FROM
    codez_dsl_gamedetail_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025091423'
    and iModeType = 65
    and env = 'live'
GROUP BY
    vopenid)gamedetail on guideflow.vopenid = gamedetail.vopenid

