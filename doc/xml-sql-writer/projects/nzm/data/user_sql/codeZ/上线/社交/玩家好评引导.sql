-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

---
select
    buttonid
    ,count(distinct vopenid) as player_num
from
    ieg_tdbank::codez_dsl_PlayerClickButtonFlow_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026012123'
    AND env = 'live'
    and Action = 'AppStoreReview'
group by
    buttonid


select
    env
    ,mapid
    ,GameIn
    ,MicType
    ,count(distinct vopenid,dteventtime) as use_times
from
    ieg_tdbank::codez_dsl_MicOpenFlow_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026020123'
group by
    env
    ,mapid
    ,GameIn
    ,MicType

