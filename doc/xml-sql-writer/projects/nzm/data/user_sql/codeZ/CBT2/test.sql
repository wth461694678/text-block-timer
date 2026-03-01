/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
select 
    guideid
    ,count(distinct vopenid) as player_num
    ,count(distinct if(RESULT= 0,vopenid,null)) as finish_player_num
from 
    ieg_tdbank::codez_dsl_playerbeginnerguideflow_fht0
WHERE
    tdbank_imp_date > '2025030309' 
    and vopenid in (select
        distinct vopenid
    from
        ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date > '2025010100' )
group BY
    guideid
order BY
    guideid

select 
   *
from 
    ieg_tdbank::codez_dsl_SeasonTalent_fht0
WHERE
    tdbank_imp_date > '2025010100' 
    and stepid= 0


desc ieg_tdbank::codez_dsl_PlayerWeaponFlow_fht0


--今日注册人数
select
    count(distinct regi.vopenid) as player_num
from
(select
    *
from
    ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030313'
    and env = 'tiyan')regi
inner join
(select
    vopenid
from
    temp_nzm_ceqq20250303)codezqq on regi.vopenid = codezqq.vopenid

------地图参与情况
with aa as (
  --全体注册用户
  select
    a.vOpenID
    ,iptype
  from
    (
      select
        vOpenID
      from
        ieg_tdbank :: codez_dsl_PlayerRegister_fht0 as a
      where
        tdbank_imp_date between '2025030300'
        and '2025030923'
        and env = 'tiyan'
      group by
        vOpenID
    ) a
    join codez_mid_analysis :: temp_nzm_ceqq20250303 as b on a.vOpenID = b.vopenid
)


select
    a.iptype,
  COUNT(DISTINCT a.vOpenID) 参与人数,
  COUNT(DISTINCT b.vOpenID) 完成人数
from
  (
    select
        iptype,
      DungeonID,
      a.vOpenID
    from
      ieg_tdbank :: codez_dsl_PlayerStandAloneDungeonProgress_fht0 a
      join aa on a.vopenid = aa.vopenid
    where
      tdbank_imp_date between '2025030300'
      and '2025030923'
      and DungeonID = 2013001
    GROUP by
        iptype,
      DungeonID,
      a.vOpenID
  ) a
  LEFT JOIN (
    select
    iptype,
      DungeonID,
      a.vOpenID,
      max(IsFinished) IsFinished
    from
      ieg_tdbank :: codez_dsl_PlayerStandAloneDungeonProgress_fht0 a
      join aa on a.vopenid = aa.vopenid
    where
      tdbank_imp_date between '2025030300'
      and '2025030923'
      and DungeonID = 2013001
    GROUP by
    iptype,
      DungeonID,
      a.vOpenID
      HAVING max(IsFinished)=1
  ) b on a.DungeonID = b.DungeonID and a.iptype = b.iptype
group by
    a.iptype




--聊天流水
select
    count(distinct Contents)
from
   ieg_tdbank :: codez_dsl_SecTalkFlow_fht0
where
    MsgType = 0
    and TemplateSign = 0
    and tdbank_imp_date between '2025033100' and '2025041323'
    and SceneID <> 1004



--分天赋路线人数
select
    talent_way
    ,count(distinct vopenid) as player_num
from
(select
    vopenid
    ,case when count(distinct talentid) >= 2 then '0-无偏好路线'
        when count(distinct talentid) = 1 then max(weapon_class)
        else '无路线' end as talent_way
from
(select
    talent.vopenid
    ,talent.talentid
    ,weapon_class
    ,dense_rank()over(PARTITION by talent.vopenid order by weapon_line desc) as max_line
from
(select
    vopenid
    ,talentid
    ,floor(talentid/100) as weapon_line
from
    ieg_tdbank::codez_dsl_SeasonTalent_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030723'
    and Op = 5)talent 
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)ceqq on talent.vopenid = ceqq.vopenid
left join
(select 
    distinct 
    talentid
    ,weapon_class
from 
    codez_mid_analysis::codez_talent2weapon)talent2weapon on talent.talentid = talent2weapon.talentid
WHERE
    weapon_class in ('手枪','榴弹','机枪','射手步枪'))
WHERE
    max_line = 1
group by
    vopenid)
group by
    talent_way

--分天赋路线留存率







--拥有两把相同武器的玩家两把武器都是用过的比例
select
    player.vopenid
    ,if(use_weapon.vopenid is not null, 1, 0) as use_two
from
(select
    vopenid
    ,WeaponID
    ,count(distinct PassiveSkillList) as weapon_num
from
    ieg_tdbank::codez_dsl_PlayerWeaponFlow_fht0
WHERE
    tdbank_imp_date > '2025010100'
group by
    vopenid
    ,WeaponID
HAVING
    weapon_num>=2)player
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on player.vopenid = nzqq.vopenid
left join
(select
    vopenid
    ,WeaponID
    ,count(distinct WeaponGID) as weapon_num
from
    (select
        vopenid
        ,WeaponID1 as weaponid
        ,Weapon1GID as weapongid
    from
        ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
    WHERE
        tdbank_imp_date > '2025010100'
    union ALL
    select
        vopenid
        ,WeaponID2 as weaponid
        ,Weapon2GID as weapongid
    from
        ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
    WHERE
        tdbank_imp_date > '2025010100'
    union all
    select
        vopenid
        ,WeaponID3 as weaponid
        ,Weapon3GID as weapongid
    from
        ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
    WHERE
        tdbank_imp_date > '2025010100')
group by
    vopenid
    ,WeaponID
HAVING
    weapon_num>=2)use_weapon on player.vopenid = use_weapon.vopenid and player.weaponid and use_weapon.weaponid

    

--玩家评分分布
select
    case when ilevel <= 4 then '1-4级'
    when ilevel <=8  then '5-8级'
    when ilevel <= 12 then '9-12级'
    when ilevel <= 16 then '13-16级'
    when ilevel <= 10 then '16-19级'
    else '20级+' end as level_group
    ,avg(ScoreSum) as avg_Scoresum
from
(select
    vopenid
    ,max(ilevel) as ilevel
    ,max(ScoreSum) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030323'
group by
    vopenid)
group by
    case when ilevel <= 4 then '1-4级'
    when ilevel <=8  then '5-8级'
    when ilevel <= 12 then '9-12级'
    when ilevel <= 16 then '13-16级'
    when ilevel <= 10 then '16-19级'
    else '20级+' end


--分等级人数
with player as 
(select
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
seasonlevel as
(select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
online_time as
(select
    vopenid
    ,sum(OnlineTime) as onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid)
select 
    case 
    when ilevel <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end as level_group
    ,count(distinct player.vopenid) as player_num
from
    player
left join
    seasonlevel on player.vopenid = seasonlevel.vopenid
group by
    case 
    when ilevel <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end



--分等级平均在线时长
--分等级人数
with player as 
(select
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
seasonlevel as
(select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
online_time as
(select
    vopenid
    ,sum(OnlineTime) as onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid)
select 
    COALESCE(ilevel,0) as ilevel
    ,count(distinct player.vopenid) as player_num
    ,avg(onlinetime/3600) as avg_onlinetime
from
    player
left join
    seasonlevel on player.vopenid = seasonlevel.vopenid
left join
    online_time on player.vopenid = online_time.vopenid
group by
    COALESCE(ilevel,0)

--分在线时长玩家评分分布
with player as 
(select
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
   tdbank_imp_date BETWEEN '2025033100' and '2025033123'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
online_time as
(select
    vopenid
    ,sum(OnlineTime) as onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025033123'
    and env = 'tiyan'
group by
    vopenid),
SchemeInfo as (select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025033123'
group by
    vopenid)
select
    floor(onlinetime/3600) as onlinetime
    ,CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 200)) THEN
    '[0,200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 200)and(cast(scoresum AS DOUBLE) < 400)) THEN
  '[200,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 600)) THEN
  '[400,600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 600)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[600,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1000)) THEN
  '[800,1000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1000)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[1000,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1400)) THEN
  '[1200,1400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1400)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1400,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 1800)) THEN
  '[1600,1800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1800)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1800,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)) THEN
  '[2000,+∞)'
  ELSE NULL
  END AS scoresum
    ,count(distinct player.vopenid) as player_num
from
    player
left join
   online_time on player.vopenid = online_time.vopenid
left join
   SchemeInfo on player.vopenid = SchemeInfo.vopenid
group by
    floor(onlinetime/3600)
    ,CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 200)) THEN
    '[0,200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 200)and(cast(scoresum AS DOUBLE) < 400)) THEN
  '[200,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 600)) THEN
  '[400,600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 600)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[600,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1000)) THEN
  '[800,1000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1000)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[1000,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1400)) THEN
  '[1200,1400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1400)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1400,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 1800)) THEN
  '[1600,1800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1800)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1800,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)) THEN
  '[2000,+∞)'
  ELSE NULL
  END
  
--分在线时长玩家平均评分
with player as 
(select
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
   tdbank_imp_date BETWEEN '2025033100' and '2025033123'
   )regi
join
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
online_time as
(select
    vopenid
    ,sum(OnlineTime) as onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025033123'
    and env = 'tiyan'
group by
    vopenid),
SchemeInfo as (select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025033123'
group by
    vopenid)
select
    floor(onlinetime/3600) as onlinetime
    ,avg(scoresum) as avg_Scoresum
    ,count(distinct player.vopenid) as player_num
from
    player
left join
   online_time on player.vopenid = online_time.vopenid
left join
   SchemeInfo on player.vopenid = SchemeInfo.vopenid
group by
    floor(onlinetime/3600)






--每日在线时长分布
with player as 
(select
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid)
select
    substr(tdbank_imp_date) as p_date
    ,sum(OnlineTime)/count(distinct vopenid) as avg_onlinetime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
    and vopenid in (select vopenid from player)
group by
    substr(tdbank_imp_date)
order by
    p_date



--最后等级分布
with player as 
(select
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
seasonlevel as (select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
active_player as (select
    vopenid
from
    codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
union
select
    vopenid
from
    codez_dsl_playerlogin_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
union
select
    vopenid
from
    codez_dsl_playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
)
select
    COALESCE(ilevel, 0) as ilevel
    ,count(distinct player.vopenid) as player_num
from
    player
left join
    seasonlevel on player.vopenid = seasonlevel.vopenid
where
    player.vopenid not in (select vopenid from active_player)
group by 
    COALESCE(ilevel, 0)
order by
    ilevel





--最后预设评分分布
with player as 
(select
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
SchemeInfo as (select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
group by
    vopenid),
active_player as (select
    vopenid
from
    codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
union
select
    vopenid
from
    codez_dsl_playerlogin_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
union
select
    vopenid
from
    codez_dsl_playerlogout_fht0
WHERE
    tdbank_imp_date between '2025030800' and '2025030923'
    and env = 'tiyan'
)
select
    CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 200)) THEN
    '[0,200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 200)and(cast(scoresum AS DOUBLE) < 400)) THEN
  '[200,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 600)) THEN
  '[400,600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 600)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[600,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1000)) THEN
  '[800,1000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1000)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[1000,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1400)) THEN
  '[1200,1400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1400)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1400,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 1800)) THEN
  '[1600,1800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1800)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1800,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)) THEN
  '[2000,+∞)'
  ELSE NULL
  END AS scoresum
    ,count(distinct player.vopenid) as player_num
from
    player
left join
    SchemeInfo on player.vopenid = SchemeInfo.vopenid
where
    player.vopenid not in (select vopenid from active_player)
group by 
    CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 200)) THEN
    '[0,200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 200)and(cast(scoresum AS DOUBLE) < 400)) THEN
  '[200,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 600)) THEN
  '[400,600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 600)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[600,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1000)) THEN
  '[800,1000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1000)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[1000,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1400)) THEN
  '[1200,1400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1400)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1400,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 1800)) THEN
  '[1600,1800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1800)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1800,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)) THEN
  '[2000,+∞)'
  ELSE NULL
  END




--分等级玩家评分分布
with seasonlevel as (select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
player as 
(select
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
SchemeInfo as (select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
group by
    vopenid)
select
    CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 400)) THEN
    '[0,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[0400,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[0800,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1200,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1600,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)and(cast(scoresum AS DOUBLE) < 2400)) THEN
  '[2000,2400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2400)and(cast(scoresum AS DOUBLE) < 2800)) THEN
  '[2400,2800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2800)and(cast(scoresum AS DOUBLE) < 3000)) THEN
  '[2800,3000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 3000)) THEN
  '[3000,+∞)'
  ELSE NULL
  END as scoresum,
        case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end as ilevel,
    count(distinct SchemeInfo.vopenid) as player_num
from
    player
    left join
    seasonlevel on player.vopenid = seasonlevel.vopenid
    left join
    SchemeInfo on player.vopenid = SchemeInfo.vopenid
group by
CASE
    WHEN ((cast(scoresum AS DOUBLE) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(scoresum AS DOUBLE) >= 0)and(cast(scoresum AS DOUBLE) < 400)) THEN
    '[0,400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 400)and(cast(scoresum AS DOUBLE) < 800)) THEN
  '[0400,800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 800)and(cast(scoresum AS DOUBLE) < 1200)) THEN
  '[0800,1200)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1200)and(cast(scoresum AS DOUBLE) < 1600)) THEN
  '[1200,1600)'
  WHEN ((cast(scoresum AS DOUBLE) >= 1600)and(cast(scoresum AS DOUBLE) < 2000)) THEN
  '[1600,2000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2000)and(cast(scoresum AS DOUBLE) < 2400)) THEN
  '[2000,2400)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2400)and(cast(scoresum AS DOUBLE) < 2800)) THEN
  '[2400,2800)'
  WHEN ((cast(scoresum AS DOUBLE) >= 2800)and(cast(scoresum AS DOUBLE) < 3000)) THEN
  '[2800,3000)'
  WHEN ((cast(scoresum AS DOUBLE) >= 3000)) THEN
  '[3000,+∞)'
  ELSE NULL
  END,
        case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end


--分等级评分构成
--分等级玩家评分分布
with bdproperty as 
(select 
    cast(ID as string) as ID
    ,cast(BD_score as bigint) as BD_score
from 
    codez_ret_BDproperty_conf), 
seasonlevel as (select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
player as 
(select
    regi.vopenid
from
(SELECT
   distinct 
   dteventtime
   ,vopenid
   ,env
   ,SystemHardware
FROM
   ieg_tdbank::codez_dsl_playerregister_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025030300' and '2025030923'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
schemein as(select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
group by
    vopenid
),
SchemeInfo as (
    select
    a.vopenid
    ,max(cast(a.ScoreSum as bigint)) as ScoreSum
    ,cast(max(array(cast(a.ScoreSum as bigint), WeaponID1))[1] as string) as WeaponID1
    ,cast(max(array(cast(a.ScoreSum as bigint), WeaponID2))[1] as string) as WeaponID2
    ,cast(max(array(cast(a.ScoreSum as bigint), WeaponID3))[1] as string) as WeaponID3
    ,cast(max(array(cast(a.ScoreSum as bigint), WarframeID1))[1] as string) as WarframeID1
    ,cast(max(array(cast(a.ScoreSum as bigint), WarframeID2))[1] as string) as WarframeID2
    ,cast(max(array(cast(a.ScoreSum as bigint), WarframeID3))[1] as string) as WarframeID3
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon1ModuleList,';')[0]))[1] as string) as Weapon1Module_1
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon1ModuleList,';')[1]))[1] as string) as Weapon1Module_2
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon1ModuleList,';')[2]))[1] as string) as Weapon1Module_3
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon1ModuleList,';')[3]))[1] as string) as Weapon1Module_4
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon2ModuleList,';')[0]))[1] as string) as Weapon2Module_1
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon2ModuleList,';')[1]))[1] as string) as Weapon2Module_2
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon2ModuleList,';')[2]))[1] as string) as Weapon2Module_3
    ,cast(max(array(cast(a.ScoreSum as bigint),split(Weapon2ModuleList,';')[3]))[1] as string) as Weapon2Module_4
from
(select
    *
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923') a
join
    schemein on a.vopenid = schemein.vopenid and cast(a.scoresum as bigint) = schemein.scoresum
group by
    a.vopenid
),
SchemeInfo_all as (
    select
        vopenid
        ,ScoreSum
        ,WeaponID1 as bdid
        ,'weapon' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,WeaponID2 as bdid
        ,'weapon' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,WeaponID3 as bdid
        ,'weapon' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,WarframeID1 as bdid
        ,'Warframe' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,WarframeID2 as bdid
        ,'Warframe' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,WarframeID3 as bdid
        ,'Warframe' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon1Module_1 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon1Module_2 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon1Module_3 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon1Module_4 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon2Module_1 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon2Module_2 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon2Module_3 as bdid
        ,'Module' as itype
    from
        SchemeInfo
    union
    select
        vopenid
        ,ScoreSum
        ,Weapon2Module_4 as bdid
        ,'Module' as itype
    from
        SchemeInfo
),
-- select
--     vopenid
--     ,SchemeInfo_all.bdid
--     ,bd_score
--     ,ScoreSum
--     ,itype
-- from
--     SchemeInfo_all
-- left join
--     bdproperty on SchemeInfo_all.bdid = bdproperty.id
-- where
--     vopenid in (select vopenid from player)

SchemeInfo_with_score as (
select
    vopenid
    ,scoresum
    ,itype
    ,sum(COALESCE(bd_score,0)) as type_score
from
    SchemeInfo_all
left join
    bdproperty on SchemeInfo_all.bdid = bdproperty.id
group by
    vopenid
    ,scoresum
    ,itype
)
select
        case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end as ilevel
    ,count(distinct player.vopenid) as player_num
    ,itype
    ,avg(ScoreSum) as avg_Scoresum
    ,avg(type_score) as type_score
from
    player
    left join
    SchemeInfo_with_score on player.vopenid = SchemeInfo_with_score.vopenid
    left join
    seasonlevel on player.vopenid = seasonlevel.vopenid
group by
case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end
    ,itype


--debug
select
    *
from
ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and vopenid = 87257392868020
    and scoresum = 3039 









--战斗BD分品质获取率
with bdproperty as 
(select 
    * 
from 
    codez_dev_sr.codez_dev::codez_ret_BDproperty_conf),
player as 
(select
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030924'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
seasonlevel as
(select
    vopenid
    ,max(SeasonLevel) as iLevel
from
    ieg_tdbank::codez_dsl_Seasonlevel_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
group by
    vopenid),
itemflow as
(select
    vopenid
    ,case when iGoodsType = 1 then '角色'
    when iGoodsType = 2 and iGoodsSubType = 7 then '插件'
    when iGoodsType = 2 and iGoodsSubType <> 7 then '武器'
    when iGoodsType = 5 then '核芯' else '其他' end as iGoodsType
    ,iGoodsId
    ,sum(iCount) as icount
from
    ieg_tdbank::codez_dsl_itemflow_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
    and AddOrReduce = 0
    and iGoodsType in (1,2,5)
group by
    vopenid
    ,case when iGoodsType = 1 then '角色'
    when iGoodsType = 2 and iGoodsSubType = 7 then '插件'
    when iGoodsType = 2 and iGoodsSubType <> 7 then '武器'
    when iGoodsType = 5 then '核芯' else '其他' end
    ,iGoodsId),
all_BD as (select
        player.vopenid
        ,COALESCE(ilevel,0) as ilevel
        ,iGoodsType
        ,iGoodsId
        ,BD_quality
        ,bd_level
        ,CASE
    WHEN ((cast(bd_score AS bigint) < 0)) THEN
    '(-∞,0)'
    WHEN ((cast(bd_score AS bigint) >= 0)and(cast(bd_score AS bigint) < 40)) THEN
    '0-[0,40)'
  WHEN ((cast(bd_score AS bigint) >= 40)and(cast(bd_score AS bigint) < 80)) THEN
  '1-[40,80)'
  WHEN ((cast(bd_score AS bigint) >= 80)and(cast(bd_score AS bigint) < 120)) THEN
  '2-[80,120)'
  WHEN ((cast(bd_score AS bigint) >= 120)and(cast(bd_score AS bigint) < 160)) THEN
  '3-[120,160)'
  WHEN ((cast(bd_score AS bigint) >= 160)and(cast(bd_score AS bigint) < 200)) THEN
  '4-[160,200)'
  WHEN ((cast(bd_score AS bigint) >= 200)and(cast(bd_score AS bigint) < 240)) THEN
  '5-[200,240)'
  WHEN ((cast(bd_score AS bigint) >= 240)) THEN
  '5-[240,+∞)'
  ELSE NULL
  END as bd_score
        ,icount
    from
        player
    left join
        SeasonLevel on player.vopenid = seasonlevel.vopenid
    left join
        itemflow on player.vopenid = itemflow.vopenid
    left join
        bdproperty on itemflow.iGoodsId = bdproperty.id)
select
    case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end as level_group
    ,iGoodsType
    ,BD_score
    ,count(distinct vopenid) as player_num
    ,sum(icount) as icount
    ,sum(icount)/count(distinct vopenid) as avg_count
from
    all_Bd
group by
    case 
    when COALESCE(ilevel,0) <= 0 then '0未解锁赛季等级'
    when ilevel <= 5 then '1,1-5级'
    when ilevel <= 10  then '2,6-10级'
    when ilevel <= 15 then '3,11-15级'
    when ilevel <= 20 then '4,16-20级'
    when ilevel <= 25 then '5,21-25级'
    when ilevel <= 30 then '6,26-30级'
    else '7,30级+' end
    ,iGoodsType
    ,BD_score





--网络质量
with player as 
(SELECT
    vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331),
PlayerDsConn as (select
    distinct 
    vopenid
    ,concat(vOpenID,dteventtime,EventId) as uniqid
    ,mapid
    ,GameTimeS
    ,Delay50ms
    ,Delay100ms
    ,Delay150ms
    ,Delay200ms
    ,Delay300ms
    ,Delay400ms
    ,Delay500ms
    ,Delay600ms
    ,DelayOthers
from
    ieg_tdbank::codez_dsl_PlayerDsConn_fht0
WHERE
    tdbank_imp_date between '2025033100' and '2025033123'
    and env = 'tiyan'),
mapname as (select dungeon_id,
       map_id,
       mode_type,
       map_name,
       dungeon_difficulty_des
from codez_dev_sr.codez_dev::codez_ret_mapname_conf),
all_dsnn as (
select
    player.vopenid
    ,mode_type
    ,GameTimeS
    ,Delay50ms
    ,Delay100ms
    ,Delay150ms
    ,Delay200ms
    ,Delay300ms
    ,Delay400ms
    ,Delay500ms
    ,Delay600ms
    ,DelayOthers
from
    player
left join
    PlayerDsConn on player.vopenid = PlayerDsConn.vopenid
left join
    mapname on PlayerDsConn.mapid = mapname.map_id
)
select
    mode_type
    ,sum(GameTimeS) as GameTimeS
    ,sum(Delay50ms)/sum(GameTimeS) as Delay50ms_rate
    ,sum(Delay100ms)/sum(GameTimeS) as Delay100ms_rate
    ,sum(Delay150ms)/sum(GameTimeS) as Delay150ms_rate
    ,sum(Delay200ms)/sum(GameTimeS) as Delay200ms_rate
    ,sum(Delay300ms)/sum(GameTimeS) as Delay300ms_rate
    ,sum(Delay400ms)/sum(GameTimeS) as Delay400ms_rate
    ,sum(Delay500ms)/sum(GameTimeS) as Delay500ms_rate
    ,sum(Delay600ms)/sum(GameTimeS) as Delay600ms_rate
    ,sum(DelayOthers)/sum(GameTimeS) as DelayOthers_rate
from
    all_dsnn
group by
    mode_type


--玩家设置
select
    distinct 
    HighFrameRateMode
    ,ScreenQuality
    ,count(distinct vopenid)
from 
    ieg_tdbank::codez_dsl_ClientSettingChange_fht0
WHERE
    tdbank_imp_date > '2025010100' 
group BY
    HighFrameRateMode
    ,ScreenQuality




--新手引导bug查询
with playerbegin as (SELECT
   guideflow.dteventtime as dteventtime
   ,vgameappid
   ,platid
   ,izoneareaid
   ,regi.vopenid as regi_vopenid
   ,guideflow.vopenid as guide_vopenid
   ,vroleid
   ,regi.env
   ,guideflow.guideid
   ,result
   ,stepid
   ,duration
   ,guide_step
   ,nzqq.*
   ,SystemHardware
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
   tdbank_imp_date BETWEEN '2025030300' and '2025030324'
   )regi
join
(SELECT
   qq
   ,vopenid
   ,iptype
   ,gametype
   ,channel
from
   codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid
left join
(SELECT
   distinct
   gamesvrid
   ,dteventtime
   ,vgameappid
   ,platid
   ,izoneareaid
   ,vopenid
   ,vroleid
   ,env
   ,guideid
   ,result
   ,stepid
   ,duration
   ,case when floor(guideid/100) = 1 then 'a-intro星海虫影'
      when floor(guideid/1) in (801,802) then 'b-流程1：换武器&进入猎场教学关'
      when floor(guideid/100) = 3 then 'c-猎场教学关'
      when floor(guideid/1) in (802,811) then 'd-装配插件&进入猎场大都会难度1'
      when floor(guideid/1) in (804,805) then 'f-机甲系统&进入机甲pvp'
      when floor(guideid/1) in (809,806,812) then 'h-赛季解锁&引导猎场黑暗复活节'
      when floor(guideid/1) in (813,803) then 'j-赛季目标奖励引导领取&追猎引导进入教学关'
      when floor(guideid/100) = 9 then 'k-追猎教学关'
      when floor(guideid/1) in (814) then 'l-引导天赋解锁'
      when floor(guideid/100) = 7 then '塔防教学关'
      else '其他' end as guide_step
FROM
   codez_dsl_playerbeginnerguideflow_fht0
WHERE
   tdbank_imp_date BETWEEN '2025030300' and '2025030423'
   )guideflow on regi.vopenid = guideflow.vopenid and regi.env = guideflow.env)
select
    vopenid
    ,qq
    ,dteventtime
    ,guideid
    ,SystemHardware
from
    playerbegin
where
    guideid in (911) and vopenid not in (select vopenid from playerbegin where guideid = 908)

union all
select
    vopenid
    ,qq
    ,'b-流程1：换武器&进入猎场教学关' as 缺少步骤
from
    playerbegin
where
    guide_step = 'c-猎场教学关' and vopenid not in (select vopenid from playerbegin where guide_step = 'b-流程1：换武器&进入猎场教学关')

union all
select
    vopenid
    ,qq
    ,'c-猎场教学关' as 缺少步骤
from
    playerbegin
where
    guide_step = 'd-装配插件&进入猎场大都会难度1' and vopenid not in (select vopenid from playerbegin where guide_step = 'c-猎场教学关')

union all
select
    vopenid
    ,qq
    ,'d-装配插件&进入猎场大都会难度1' as 缺少步骤
from
    playerbegin
where
    guide_step = 'f-机甲系统&进入机甲pvp' and vopenid not in (select vopenid from playerbegin where guide_step = 'd-装配插件&进入猎场大都会难度1')

union all
select
    vopenid
    ,qq
    ,'f-机甲系统&进入机甲pvp' as 缺少步骤
from
    playerbegin
where
    guide_step = 'h-赛季解锁&引导猎场黑暗复活节' and vopenid not in (select vopenid from playerbegin where guide_step = 'f-机甲系统&进入机甲pvp')

union all
select
    vopenid
    ,qq
    ,'h-赛季解锁&引导猎场黑暗复活节' as 缺少步骤
from
    playerbegin
where
    guide_step = 'j-赛季目标奖励引导领取&追猎引导进入教学关' and vopenid not in (select vopenid from playerbegin where guide_step = 'h-赛季解锁&引导猎场黑暗复活节')
union all
select
    vopenid
    ,qq
    ,'j-赛季目标奖励引导领取&追猎引导进入教学关' as 缺少步骤
from
    playerbegin
where
    guide_step = 'k-追猎教学关' and vopenid not in (select vopenid from playerbegin where guide_step = 'j-赛季目标奖励引导领取&追猎引导进入教学关')
union all
select
    vopenid
    ,qq
    ,'k-追猎教学关' as 缺少步骤
from
    playerbegin
where
    guide_step = 'l-引导天赋解锁' and vopenid not in (select vopenid from playerbegin where guide_step = 'k-追猎教学关')


select
    *
from



select bdid,
       name,
       type,
       quality,
       bd_level,
       bd_score
from codez_mid_analysis::codez_battlebd_property
limit 1000;


--战斗BD评分分布
select

--赛季等级
(select
    vopenid
    ,ilevel
    ,SeasonLevel
from
    codez_dsl_SeasonLevel_fht0
WHERE
   tdbank_imp_date BETWEEN '2025030500' and '2025030523'
   and vopenid in (select vopenid from codez_mid_analysis::temp_nzm_ceqq20250303)
order by
    ilevel
    ,SeasonLevel)

--问卷匹配
select
    *
from    
    codez_dsl_itemflow_fht0
WHERE
   tdbank_imp_date BETWEEN '2025030300' and '2025030723'
   and vopenid = 1896532589501050880

--战斗BD评分分布
select
    vopenid
    ,max(cast(ScoreSum as bigint)) as ScoreSum
from
    ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
WHERE
    tdbank_imp_date between '2025030300' and '2025030923'
    and env = 'tiyan'
    and vopenid in (206799404887487,
25126402057450,
60622646968238,
83458822675566,
30988901979772,
17030785447268,
97200097055209,
78800018725735,
97113749473512
)
group by
    vopenid