/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--塔防挑战中退情况
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
   tdbank_imp_date BETWEEN '2025033100' and '2025040623'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
TowerDefense as 
(select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
    ,roomid
    ,roundid
    ,DropOut
    ,FreeRebirthCoinsUsed
    ,PaidRebirthCoinsUsed
    ,DeathCount
    ,BuildTrapCount
    ,GameDuration
    ,BattleDuration
    ,iswin
    ,TeleportPointUsed
    ,WeaponKilled
    ,TrapKilled
    ,GoldCoinsGained
    ,GoldCoinsGainedByKill 
    ,(WeaponKilled+TrapKilled)/BattleDuration as avgkill_sec
    ,WeaponKilled/BattleDuration as avg_weaponkill_sec
    ,TrapKilled/BattleDuration as avg_TrapKill_sec
from
    codez_dsl_PlayerTowerDefenseRoundGameDetail_fht0
where
    tdbank_imp_date BETWEEN '2025033100' and '2025040623'
    and dungeonid = 2003007),
-- trapgamedetail as 
-- (select
--     substr(tdbank_imp_date,1,8) as p_date
--     ,roomid
--     ,roundid
--     ,sum(damage)/max(UseDuration) as trap_dps
-- from
--     codez_dsl_TowerDefensePlayerTrapGameDetail_fht0
-- where
--     tdbank_imp_date BETWEEN '2025033100' and '2025040623'
--     and dungeonid = 2003007
--     ),
round_player_num as 
(select
    p_date
    ,roomid
    ,roundid
    ,count(distinct vopenid) as real_player_num
    -- ,avg(trap_dps) as trap_dps
from
    TowerDefense
-- join
--     trapgamedetail on TowerDefense.p_date = trapgamedetail.p_date and TowerDefense.roomid = trapgamedetail.roomid and TowerDefense.roundid = trapgamedetail.roundid
group BY
    p_date
    ,roomid
    ,roundid)
select
    TowerDefense.p_date
    ,TowerDefense.roundid
    ,real_player_num
    ,iswin
    ,count(distinct TowerDefense.roomid) as desk_num
    ,avg(DropOut) as avg_dropout
    ,avg(FreeRebirthCoinsUsed) as avg_FreeRebirthCoinsUsed
    ,avg(PaidRebirthCoinsUsed) as avg_PaidRebirthCoinsUsed
    ,avg(DeathCount) as avg_DeathCount
    ,avg(BuildTrapCount) as avg_BuildTrapCount
    ,avg(GameDuration) as avg_GameDuration
    ,avg(BattleDuration) as avg_BattleDuration
    ,avg(TeleportPointUsed) as avg_TeleportPointUsed
    ,avg(WeaponKilled) as avg_WeaponKilled
    ,avg(TrapKilled) as avg_TrapKilled
    ,avg(GoldCoinsGained) as avg_GoldCoinsGained
    ,avg(GoldCoinsGainedByKill) as avg_GoldCoinsGainedByKill
    ,avg(avgkill_sec) as avg_avgkill_sec
    ,avg(avg_weaponkill_sec) as avg_avg_weaponkill_sec
    ,avg(avg_Trapkill_sec) as avg_avg_Trapkill_sec
    --,avg(trap_dps) as trap_dps
from
    player
join
    TowerDefense on player.vopenid = TowerDefense.vopenid
join
    round_player_num on TowerDefense.roomid = round_player_num.roomid and TowerDefense.roundid = round_player_num.roundid and TowerDefense.p_date = round_player_num.p_date
group by
    TowerDefense.p_date
    ,TowerDefense.roundid
    ,iswin
    ,real_player_num