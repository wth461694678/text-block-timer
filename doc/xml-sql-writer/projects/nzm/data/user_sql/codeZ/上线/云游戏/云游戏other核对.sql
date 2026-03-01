-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--minigame+login
select
    login.*
    ,wxlogin.*
from
(select
    *
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
    and is_gamematrix = 1
    and loginresult= 0
    and loginchannelstr in ('59000004','59000005'))login

left join
(select
    *
from
ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823')wxlogin on login.vopenid = wxlogin.vopenid




--wx登录
select
    loginchannel
    ,count(distinct vopenid) as uv
from
ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
group by
    loginchannel



--登录
select
    loginchannelstr
    ,count(distinct vopenid) as uv
from
ieg_tdbank::codez_dsl_playerLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
    and loginresult = 0
    and is_gamematrix = 1
    and loginchannelstr in ('59000004','59000005')
group by
    loginchannelstr


--other情况
select
    minigame_channel
    ,platid
    ,loginchannelstr
    ,vgameappid
    ,count(distinct wxlogin.vopenid) as player_num
from
(select
    minigame_channel
    ,vopenid
    ,dteventtime
from
    (select
    minigame_channel
    ,vopenid
    ,dteventtime
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
from
ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823')
where 
    rn = 1)wxlogin
join
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823') register on wxlogin.vopenid = register.vopenid
left join
(select
    vopenid
    ,platid
    ,loginchannelstr
    ,vgameappid
    ,dteventtime
from(select
    vopenid
    ,platid
    ,loginchannelstr
    ,vgameappid
    ,dteventtime
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
    and is_gamematrix = 1
    and loginresult = 0
    and loginchannelstr in ('59000005', '59000004'))
where
    rn= 1)login on wxlogin.vopenid = login.vopenid
group by
    minigame_channel
    ,platid
    ,loginchannelstr
    ,vgameappid



--未登录玩家
select
    OnlineTime
    ,count(distinct login.vopenid) as player_num
from
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
    and is_gamematrix = 1
    and loginresult= 0
    and loginchannelstr in ('59000005')
    and vopenid not in (select distinct vopenid from ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'))login
left join
(select
    vopenid
    ,sum(OnlineTime) as OnlineTime
from
    ieg_tdbank::codez_dsl_playerlogout_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
group by
    vopenid)logout on login.vopenid = logout.vopenid
join
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823') register on login.vopenid = register.vopenid
group by
    OnlineTime
order by
    OnlineTime



--玩家小游戏登录记录
select
    minigame_channel
    ,vopenid
    ,dteventtime
from
ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'




select
    vopenid
    ,platid
    ,loginchannelstr
    ,vgameappid
    ,dteventtime
from(select
    vopenid
    ,platid
    ,loginchannelstr
    ,vgameappid
    ,dteventtime
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
where
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823'
    and is_gamematrix = 1
    and loginresult = 0
    and loginchannelstr in ('59000005', '59000004'))
where
    rn= 1



select
    minigame_channel
    ,vopenid
    ,dteventtime
from
    (select
    minigame_channel
    ,vopenid
    ,dteventtime
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
from
ieg_tdbank::codez_dsl_WXMiniGameLogin_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011800' AND '2026011823')
where 
    rn = 1