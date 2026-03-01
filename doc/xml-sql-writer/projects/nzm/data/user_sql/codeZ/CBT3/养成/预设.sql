-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--玩家选择预设数据
select
    *
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date > '2025070700'

1318105001;1318107001;1318103001;1318110001;1318106001;1318123001;1318115001;1318116001


select
    *
from
    ieg_tdbank::codez_dsl_PlayerDSChangeSchemeFlow_fht0
WHERE
    tdbank_imp_date > '2025070700'