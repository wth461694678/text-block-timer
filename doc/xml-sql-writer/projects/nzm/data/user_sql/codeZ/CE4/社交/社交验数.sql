-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--好友数量
select
    allfriendnum
    ,gamefriendnum
    ,platfriendnum
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
where
    tdbank_imp_date between '2025112000' and '2025112323'

--自己号验数
select
    vopenid,
       allfriendnum,
       gamefriendnum,
       platformfriendnum
from ieg_tdbank::codez_dsl_playerlogout_fht0
where
    tdbank_imp_date between '2025112000' and '2025112023'
    and vopenid = 278818377740273
limit 1000;
--王哥号验数
select
    vopenid,
    dteventtime,
       allfriendnum,
       gamefriendnum,
       platformfriendnum
from ieg_tdbank::codez_dsl_playerlogout_fht0
where
    tdbank_imp_date between '2025112400' and '2025112523'
    and vopenid = 86493793676867

--聊天信息发送
select
    *
from
    ieg_tdbank::codez_dsl_sectalkflow_fht0
where
    tdbank_imp_date between '2025112400' and '2025112523'
    and dungeonid = 



select
    TeamApplySource
    ,count(distinct vopenid,teamid)
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date between '2025112000' and '2025112523'
group by
    TeamApplySource


--匹配人数
select
    substr(tdbank_imp_date,1,8) as p_date
    ,teammembernum
    ,count(distinct teamid,roomid) as match_num
from
    ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0
where
    tdbank_imp_date between '2025090800' and '2025101323'
    and result= 0
group by
    substr(tdbank_imp_date,1,8)
    ,teammembernum


--组队人数
select
   p_date
   ,playercount
   ,count(distinct roomid,vroleid)
from
   dwd_sr_codez_teamtype_di
where
   p_Date between '2025-09-08T00:00:00' and '2025-10-13T23:59:59'
group by
    p_date
    ,playercount

--组队状态表
select
    *
from
    ieg_tdbank::codez_dsl_PlayerTeamInfoData_fht0
where
    tdbank_imp_date between '2025112400' and '2025112523'

--自建房组队流水
select
    substr(tdbank_imp_date,1,8) as p_date
    ,PlayerCount
    ,count(distinct CustomRoomID,RoomID)
from
    ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
where
    tdbank_imp_date between '2025090800' and '2025101323'
    and matchprocess = 0
group by
    substr(tdbank_imp_date,1,8)
    ,PlayerCount



--玩家组队信息
select
DTEVENTTIME,
    VROLEID,
    TeamApplySource
from
    ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
where
    tdbank_imp_date between '2025121717' and '2025121717'
    and vroleid in ('547425351941547','491734809683041')
    --and vroleid in ('559762450710842','532784653121128','498569969867236')



--申请好友流水
select
    DTEVENTTIME,
    VROLEID,
    ReceiverRoleID,
    iApplySource
from
    ieg_tdbank::codez_dsl_SecSNSFlow_fht0
where
    SceneID = 2001
    and tdbank_imp_date between '2025122220' and '2025122221'
order by
    dteventtime



--同意好友申请流水
select
    DTEVENTTIME,
    VROLEID,
    vapplyopenid,
    iApplySource
from
    ieg_tdbank::codez_dsl_responseaddfriendflow_fht0
where
    tdbank_imp_date between '2025122214' and '2025122221'
    and iFriendApplyResult = 0
order by
    dteventtime


    