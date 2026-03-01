-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--一键切枪分布
select
    platid
    ,oneclickswitchweaponbutton
    ,count(distinct vopenid) as player_num
from
(select
    vopenid
    ,case when platid = 2 then 'pc' else 'mobile' end as platid
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
    ,OneClickSwitchWeaponButton
    ,AutoFireDelayTimeScale
    ,AutoFireInterruptTimeScale
from
    codez_dsl_ClientSettingChange_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020223'
    and env = 'live')
where rn = 1
group by
    platid
    ,oneclickswitchweaponbutton



--自动开火前摇分布
select
    platid
    ,AutoFireDelayTimeScale
    ,count(distinct vopenid) as player_num
from
(select
    vopenid
    ,case when platid = 2 then 'pc' else 'mobile' end as platid
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
    ,OneClickSwitchWeaponButton
    ,AutoFireDelayTimeScale
    ,AutoFireInterruptTimeScale
from
    codez_dsl_ClientSettingChange_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020223'
    and env = 'live')
where rn = 1
group by
    platid
    ,AutoFireDelayTimeScale


--自动开火后摇分布
select
    platid
    ,AutoFireInterruptTimeScale
    ,count(distinct vopenid) as player_num
from
(select
    vopenid
    ,case when platid = 2 then 'pc' else 'mobile' end as platid
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
    ,OneClickSwitchWeaponButton
    ,AutoFireDelayTimeScale
    ,AutoFireInterruptTimeScale
from
    codez_dsl_ClientSettingChange_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020223'
    and env = 'live')
where rn = 1
group by
    platid
    ,AutoFireInterruptTimeScale

--全局射击模式
select
    platid
    ,GlobalShootMode
    ,count(distinct vopenid) as player_num
from
(select
    vopenid
    ,case when platid = 2 then 'pc' else 'mobile' end as platid
    ,row_number() over(partition by vopenid order by dteventtime desc) as rn
    ,OneClickSwitchWeaponButton
    ,GlobalShootMode
    ,AutoFireInterruptTimeScale
from
    codez_dsl_ClientSettingChange_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020423'
    and env = 'live')
where rn = 1
group by
    platid
    ,GlobalShootMode