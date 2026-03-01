-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--聚类特征
with player as 
(select 
    *
from 
    codez_mid_analysis.codez_vopenid_cbt3_20250908
),

--注册表字段
regi as
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025090823'
    AND env = 'live'
),
--登出表字段
logout as 
(select

(SELECT
    vopenid
    ,vroleid
    ,PlayerFriendsNum
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    AND env = 'live')
),

--添加好友数
add_friend as
(select
    vopenid
    ,count(distinct vapplyopenid) as add_friend_num
from
(select
    vopenid
    ,vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live'
UNION all
select
    vapplyopenid as vopenid
    ,vopenid as vapplyopenid 
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
    and env = 'live')
group by
    vopenid),

--删除好友数
DELETE_FRIEND as
(select 
    vopenid
    ,count(distinct vTargetOpenId) as delete_friend_num
from
(
    select
        vopenid
        ,vTargetOpenId
    from
        ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
    WHERE
        tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
        and env = 'live'
    UNION all
    select
        vTargetOpenId as vopenid
        ,vopenid as vTargetOpenId
    from
        ieg_tdbank::codez_dsl_ManageFriendFlow_fht0
    WHERE
        tdbank_imp_date between '${BEGIN_DATE}' and '${END_DATE}'
        and env = 'live'
)
group by
    vopenid)

select
    player.vopenid
    ,PlayerFriendsNum
    ,add_friend_num
    ,delete_friend_num
from
    player
    JOIN
    regi on player.vopenid = regi.vopenid
    left JOIN
    logout on player.vopenid = logout.vopenid
    left JOIN
    add_friend on player.vopenid = add_friend.vopenid
    left JOIN
    delete_friend on player.vopenid = delete_friend.vopenid