-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--小包下载
select
    *
from
    ieg_tdbank::codez_dsl_LittlePackageDownload_fht0
WHERE
    tdbank_imp_date BETWEEN '2025070700' AND '2025070723'