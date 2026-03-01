-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

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
    tdbank_imp_date between '2025090800' and '2025091711'
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0 
    WHERE
    tdbank_imp_date between '2025090800' and '2025091711')
    and SelectFireMode <> 0
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
    tdbank_imp_date between '2025090800' and '2025091711'
    and vopenid in (select vopenid from ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025091711')
    and SelectHUDLayout <> 0
group BY
    vopenid
)
-- where
--     rn = 1
group BY
    SelectHUDLayout