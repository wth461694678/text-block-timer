--玩家匹配质量
with player as 
(select
    distinct
    regi.vopenid
    ,iptype
from
(SELECT
    distinct 
    vopenid 
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025033100' and '2025041323'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
map_info as
(select mode_type,
       map_name,
       idungeonid
from codm_thive::nzm_map_id_type_name),
gamedetail as 
(select
    gd.iDungeonID
    ,p_date
    ,map_name
    ,mode_type
    ,dsroomID
    ,count(distinct gd.vopenid) as real_player_num
    ,max(iSchemeGameScore) - min(iSchemeGameScore) as score_gap
from
    (SELECT 
        vopenid
        ,dsroomID
        ,RealPlayerNumWhenStart
        ,iSchemeGameScore
        ,iDungeonID
        ,substr(tdbank_imp_date,1,8) as p_date
    from 
        ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' and '2025041323'
    ) gd
join
    player on gd.vopenid= player.vopenid
left join
    map_info on gd.iDungeonID = map_info.iDungeonID
group BY
    gd.iDungeonID
    ,map_name
    ,mode_type
    ,dsroomID
    ,p_date
)
select
    p_date
    -- ,iDungeonID
    -- ,map_name
    ,mode_type
    ,real_player_num
    ,count(distinct dsroomid) as desk_num
    ,avg(score_gap)
from
    gamedetail
group BY
    -- iDungeonID
    -- ,map_name
    mode_type
    ,p_date
    ,real_player_num
order BY
    p_date
    ,real_player_num