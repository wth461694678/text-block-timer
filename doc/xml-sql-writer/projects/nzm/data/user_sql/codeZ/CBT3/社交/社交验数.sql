-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************


select
   vopenid
   ,roomid
   ,DungeonID
   ,TeamMemberNum 
   ,StartMatchType
   ,result
   ,teamid
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
WHERE
    tdbank_imp_date BETWEEN '2025033100' and '2025040923'



--冬雪251、哇哈哈哈哈178

--好友申请(验证完毕)
select
   *
from
    ieg_tdbank::codez_dsl_SecSNSFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025070200' and '2025070223'
    and vopenid in (17809359486547, 251309676410472)


--同意好友申请(验证完毕)
select
   *
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025070200' and '2025070223'
    and vopenid in (17809359486547, 251309676410472)

--删除好友(验证完毕)
select
   *
from
    ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025070200' and '2025070223'
    and vopenid in (17809359486547, 251309676410472)

--兴趣频道
select
    *
from
    ieg_tdbank::codez_dsl_PlayerUpdateInterestChannelFlow_fht0





--自建房验数
--玩家openid获取
select
    *
from
    ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2025091400' and '2025091423'
    --and vroleid = 425307667827872
    and vrolename in ('裁决之神审判')
    AND vopenid in (486221899969712, 449170298434209)

select
    max(tdbank_imp_date)
from
    ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2025091400' and '2025091423'

--玩家openid获取
select
    DISTINCT 
    vopenid
    ,vroleid
    ,vrolename
from
    ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2025072400' and '2025072423'
    and vrolename in ('hhhsss','23hhh','朔刃血刃阵线','曜刃宸锋喙')
    AND vopenid in (486221899969712, 449170298434209)

--创建或修改房间信息
select
    *
from
    ieg_tdbank::codez_dsl_CustomRoomRoomInfo_fht0
WHERE
    tdbank_imp_date BETWEEN '20250718716' and '2025070716'
    AND CUSTOMROOMID = 864719933735665664
    AND vopenid in ('204746923259056', '167695321723553')

DESC ieg_tdbank::codez_dsl_CustomRoomRoomInfo_fht0


--自建房房间内玩家变更
select
    *
from
    ieg_tdbank::codez_dsl_CustomRoomPlayerChange_fht0
WHERE
    tdbank_imp_date BETWEEN '2025072110' and '2025072110'
    AND CUSTOMROOMID = 8935170742812377156
    and vopenid = 143832691117216

--
--自建房房间内玩家变更加入途径验数
select
    *
from
    ieg_tdbank::codez_dsl_CustomRoomPlayerChange_fht0
WHERE
    tdbank_imp_date BETWEEN '2025091400' and '2025091423'
    and vroleid = '560293354450929'
group BY
    applysource



--自建房房间状态变更
select
    *
from
    ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
WHERE
    tdbank_imp_date BETWEEN '2025091400' and '2025091423'
    and CUSTOMROOMID = '72650156888571904'
    and matchprocess = 0
    and vroleid = '425307667827872'
