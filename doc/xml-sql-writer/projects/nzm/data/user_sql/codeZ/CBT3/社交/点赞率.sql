-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--点赞率
select
    *
from
    ieg_tdbank::codez_dsl_SecSNSFlow_fht0
WHEre
    tdbank_imp_date BETWEEN '2025091400' AND '2025091423'
   and env = 'live'
   and vopenid = '278818377740273'
group by
    SceneID