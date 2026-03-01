/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
--机甲战胜率情况
SELECT
    real_player_num
     ,count(distinct case when WinCampType=1 then concat(gamedetail.RoomID,RoundID) else null end)/count(distinct concat(gamedetail.RoomID,RoundID)) as 机甲方胜率
from
(SELECT
    RoomID,RoundID,WinCampType
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan')gamedetail
JOIN
(SELECT
    RoomID,count(distinct vopenid) as real_player_num
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan'
group BY
    RoomID)roomdetail on gamedetail.roomid = roomdetail.roomid
group BY
    real_player_num





--分阵营平均伤害
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030423'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
damage as
(SELECT
    distinct RoomID,RoundID,WinCampType,vopenid,CampType,if(CampType=0,HumanTotalDamage,MechaTotalDamage) as totaldamage
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030423'
    and env = 'tiyan')

SELECT
    CampType
    ,avg(totaldamage) as totaldamage
from
    player
    join
    damage on player.vopenid = damage.vopenid 
group BY
    CampType


--分段位分真人数胜率
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
   tdbank_imp_date BETWEEN '2025033100' and '2025040323'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
roomdetail as 
(SELECT
    RoomID,RoundID,WinCampType,camptype,vopenid  
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025040300' and '2025040423'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
),
player_num as
(SELECT
    RoomID,RoundID,max(RoomRank) as RoomRank,
    count(distinct case when CampType=0 then vopenid else null end) as human_player_num,
    count(distinct case when CampType=1 then vopenid else null end) as Mecha_player_num    
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025040400' and '2025040423'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
group BY
    RoomID,RoundID
)
SELECT
    human_player_num
    ,Mecha_player_num
    ,RoomRank
    ,count(distinct concat(roomdetail.roomid,roomdetail.roundid)) as round_num
    ,count(distinct case when WinCampType = 1 then concat(roomdetail.roomid,roomdetail.roundid) else null end)/count(distinct concat(roomdetail.roomid,roomdetail.roundid)) as Mecha_win_rate
from
    player
join
    roomdetail on player.vopenid = roomdetail.vopenid
join
    player_num on roomdetail.roomid = player_num.roomid and roomdetail.RoundID = player_num.RoundID
group BY
    human_player_num
    ,Mecha_player_num
    ,RoomRank






--机甲战分真人数真人英雄数情况
with aa as
(select
    a.vOpenID
from
    (--注册且目标用户
    select
        vOpenID
    from
        ieg_tdbank :: codez_dsl_PlayerRegister_fht0
    where
        tdbank_imp_date between 2025033100 and 2025040123
        and env='tiyan'
    group by
        vOpenID
    )a
join
    codez_mid_analysis::temp_nzm_ceqq20250303 as b on a.vOpenID=b.vopenid
)
SELECT
    human_player_num
    ,Mecha_player_num
    ,avg(hero_player_num) as avg_hero
    ,count(distinct gamedetail.roomid,gamedetail.roundid) as round_num
from
(SELECT
    RoomID,RoundID,count(distinct if(HumanScore > 56850 and CampType = 0, vopenid,null)) as hero_player_num
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0 a join aa on a.vopenid=aa.vopenid
WHERE
    tdbank_imp_date between '2025030300' and '2025030423'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
group BY
    RoomID,RoundID)gamedetail
JOIN
(SELECT
    RoomID,RoundID,
    count(distinct case when CampType=0 then vopenid else null end) as human_player_num,
    count(distinct case when CampType=1 then vopenid else null end) as Mecha_player_num    
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0 a join aa on a.vopenid=aa.vopenid
WHERE
    tdbank_imp_date between '2025030300' and '2025030423'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
group BY
    RoomID,RoundID)roomdetail on gamedetail.roomid = roomdetail.roomid and gamedetail.RoundID = roomdetail.RoundID
group BY 
    human_player_num
    ,Mecha_player_num
--分段位情况

--机甲战分真人数真人英雄数情况
SELECT
    RoomRank
    ,human_player_num
    ,Mecha_player_num
    ,avg(hero_player_num) as avg_hero
    ,count(distinct gamedetail.roomid,gamedetail.roundid) as round_num
from
(SELECT
    RoomID,RoundID,count(distinct if(HumanScore > 56850 and CampType = 0, vopenid,null)) as hero_player_num
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
group BY
    RoomID,RoundID)gamedetail
JOIN
(SELECT
    RoomID,RoundID,max(RoomRank) as RoomRank,
    count(distinct case when CampType=0 then vopenid else null end) as human_player_num,
    count(distinct case when CampType=1 then vopenid else null end) as Mecha_player_num    
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan'
    and IsDropOut = 0
    and DungeonID=3001001
group BY
    RoomID,RoundID)roomdetail on gamedetail.roomid = roomdetail.roomid and gamedetail.RoundID = roomdetail.RoundID
group BY
    RoomRank
    ,human_player_num
    ,Mecha_player_num





--1v7数据
select
    gamedetail.*
from
(select
    roomid
    ,RoundID
from
(SELECT
    RoomID,RoundID,count(distinct if(camptype =0, vopenid,null)) as human_player_num,count(distinct if(camptype =1, vopenid,null)) as Mecha_player_num
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan'
group BY
    RoomID,RoundID) WHERE human_player_num = 7 and Mecha_player_num = 1
limit 5)room_round
join
(select
    *
from
    ieg_tdbank::codez_dsl_playermecharoundgamedetail_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025040123'
    and env = 'tiyan') gamedetail on room_round.roomid = gamedetail.roomid and room_round.roundid = gamedetail.roundid;