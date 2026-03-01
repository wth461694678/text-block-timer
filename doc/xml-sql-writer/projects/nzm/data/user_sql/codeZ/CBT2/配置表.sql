-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************


select
    substr(tdbank_imp_date,1,8) as p_date 
    ,param1 as ItemID
    ,param2 as Name
    ,param3 as MainType
    ,param4 as MidType
    ,param5 as Quality
from 
    ieg_tdbank.codez_dsl_excelconfiginfo_fht0 
where 
    tdbank_imp_date between '2025060400' and '2025060423'
    and branchpath = 'main_code'
    and configname = 'CommonItemTable'