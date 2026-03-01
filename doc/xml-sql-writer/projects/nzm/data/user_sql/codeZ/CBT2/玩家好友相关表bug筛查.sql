/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--ResponseAddFriendFlow
SELECT
    *
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041323'


--ManageFriendFlow
SELECT
    *
from
    ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041323'


--CustomRoomPlayerChange
SELECT
    *
from
    ieg_tdbank::codez_dsl_CustomRoomPlayerChange_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041323'
order BY
    CustomRoomID
    ,dtEventTime

--CustomRoomMatchInfo
SELECT
    *
from
    ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025041323'
order BY
    CustomRoomID
    ,dtEventTime