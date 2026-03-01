/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--2025040412-2025040423在线玩家
with player as 
(select
    distinct
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025040423'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331
)nzqq on regi.vopenid = nzqq.vopenid),
online_player as (
select
   vopenid
FROM
   codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
UNION
select
   vopenid
FROM
   codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
union
select
   vopenid
FROM
   codez_dsl_playerlogout_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
union
select
   vopenid
FROM
   codez_dsl_gamedetail_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
union
select
   vopenid
FROM
   codez_dsl_ClickedLobbyButton_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
),
playerlogin as 
(select
distinct
   vopenid
FROM
   codez_dsl_playerlogin_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025040412' and '2025040423'
)
select
    player.vopenid
    ,if(playerlogin.vopenid is not null,1,0) as is_login
from
    player
join
    online_player on player.vopenid = online_player.vopenid
left join
    playerlogin on player.vopenid = playerlogin.vopenid