-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
-- 有不同bot的情况下的通关率数据 
select iDungeonID,map_id,map_difficulty,param8,
case when tuoguan_num > 0 then '有托管bot' else '无托管bot' end as bot_type,
case when bot_total > 0 then '有bot' else '无bot' end as bot_type2,
count(distinct t1.dsroomid) as room_cnt,
sum(t1.ikills) as player_kill,
sum(t1.iscore) as player_score,
count(distinct t1.vopenid,t1.dsroomid) as cnt,
count(distinct case when iiswin = 1 then concat(t1.vopenid,'-',t1.dsroomid) else null end) as win_cnt
FROM
(
    SELECT
    dsroomid,ikills,iscore,vopenid,iDungeonID,iiswin,substr(tdbank_imp_date,1,8) as dt
    FROM
    codez_dsl_gamedetail_fht0
    where
    tdbank_imp_date BETWEEN 2026011800 and 2026020123
    and env = 'live'
) t1
left join 
(
    select dsroomid,count(1) as bot_total,
    count(case when vroleid in ('9223372036954775809','9223372036954775810','9223372036954775811') then 1 else null end) as tuoguan_num
    from codez_dsl_BotGameStatisReport_fht0
    where tdbank_imp_date BETWEEN 2026011800 and 2026020123
    and env = 'live'
    group by dsroomid
) t2
on t1.dsroomid = t2.dsroomid
left join
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      param8,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '挑战模式' then 6
      when param8 = '挑战' then 6
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where configname = 'FubenEntranceInfo') bot on t1.iDungeonID = bot.dungeon_id
group by iDungeonID,map_id,map_difficulty,param8,
case when tuoguan_num > 0 then '有托管bot' else '无托管bot' end,
case when bot_total > 0 then '有bot' else '无bot' end


--中退后是否有托管bot
witH DROPOUT as 
(SELECT
    dsroomid,idungeonID,count(distinct vopenid) as player_cnt
    FROM
    codez_dsl_dropoutdetail_fht0
    where
    tdbank_imp_date BETWEEN 2026011800 and 2026020123
    and env = 'live'
    group by
    dsroomid,idungeonID),
BOT as
(
    select dsroomid,
    count(case when vroleid in ('9223372036954775809','9223372036954775810','9223372036954775811') then 1 else null end) as tuoguan_num
    from codez_dsl_BotGameStatisReport_fht0
    where tdbank_imp_date BETWEEN 2026011800 and 2026020123
    and env = 'live'
    group by dsroomid
),
map_info as 
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      param8,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '挑战模式' then 6
      when param8 = '挑战' then 6
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where configname = 'FubenEntranceInfo'
   and param4 = '僵尸猎场')
select
    iDungeonID,
    map_id,
    map_difficulty,
    count(distinct dropout.dsroomid) as room_cnt,
    sum(player_cnt) as player_cnt,
    sum(tuoguan_num)/sum(player_cnt) as tuoguan_rate
from
    DROPOUT
    left join
    bot on dropout.dsroomid = bot.dsroomid
    left join
    map_info on dropout.iDungeonID = map_info.dungeon_id
where
    player_cnt < 4
group by
    iDungeonID,
    map_id,
    map_difficulty


--玩家中退后是否有托管bot
witH DROPOUT as 
(SELECT
    dsroomid,idungeonID,count(distinct vopenid) as player_cnt
    FROM
    codez_dsl_dropoutdetail_fht0
    where
    tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    and ((iDungeonID > 2004050 and iDropOutQuestID >= 4 and iDropOutQuestID <9) or (idungeonID in (2004023,2004024,2004025) and iDropOutQuestID > 3) or (idungeonID = 2004022 and iDropOutQuestID >= 3) or (idungeonID < 2004020 and iDropOutQuestID >= 3))
    group by
    dsroomid,idungeonID),
BOT as
(
    select dsroomid,
    count(case when vroleid in ('9223372036954775809','9223372036954775810','9223372036954775811') then 1 else null end) as tuoguan_num
    from codez_dsl_BotGameStatisReport_fht0
    where tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    group by dsroomid
),
map_info as 
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
      param8,
      case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '挑战模式' then 6
      when param8 = '挑战' then 6
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where configname = 'FubenEntranceInfo'
   and param4 = '僵尸猎场'),
single_player as
(select
    roomid
    ,count(distinct vopenid) as player_cnt
from
    codez_dsl_RoomMatchAllocResult_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    and TeamMemberNum = 4
    and CAST(vRoleID AS BIGINT) >> 63 <= 0
group by
    roomid
having player_cnt = 1)

select
    iDungeonID,
    map_id,
    map_difficulty,
    count(distinct dropout.dsroomid) as room_cnt,
    sum(player_cnt) as player_cnt,
    sum(tuoguan_num)/sum(player_cnt) as tuoguan_rate
from
    DROPOUT
    left join
    bot on dropout.dsroomid = bot.dsroomid
    left join
    map_info on dropout.iDungeonID = map_info.dungeon_id
where
    player_cnt < 4
    and dropout.dsroomid not in (select roomid from single_player)
group by
    iDungeonID,
    map_id,
    map_difficulty


--log获取
witH DROPOUT as 
(SELECT
    dsroomid,idungeonID,count(distinct vopenid) as player_cnt
    FROM
    codez_dsl_dropoutdetail_fht0
    where
    tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and idungeonID = 2004023
    and env = 'live'
    and ((iDungeonID > 2004050 and iDropOutQuestID >= 2 and iDropOutQuestID <9) or (idungeonID < 2004050 and iDropOutQuestID > 2))
    group by
    dsroomid,idungeonID),
BOT as
(
    select dsroomid,
    count(case when vroleid in ('9223372036954775809','9223372036954775810','9223372036954775811') then 1 else null end) as tuoguan_num
    from codez_dsl_BotGameStatisReport_fht0
    where tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    group by dsroomid
),
single_player as
(select
    roomid
    ,count(distinct vopenid) as player_cnt
from
    codez_dsl_RoomMatchAllocResult_fht0
where tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    and TeamMemberNum = 4
    and CAST(vRoleID AS BIGINT) >> 63 <= 0
group by
    roomid
having player_cnt = 1)

select
    -- iDungeonID,
    -- map_id,
    -- map_difficulty,
    -- count(distinct dropout.dsroomid) as room_cnt,
    -- sum(player_cnt) as player_cnt,
    -- sum(tuoguan_num)/sum(player_cnt) as tuoguan_rate
    dropout.dsroomid
from
    DROPOUT
    left join
    bot on dropout.dsroomid = bot.dsroomid
where
    player_cnt < 4
    and dropout.dsroomid not in (select roomid from single_player)
    and tuoguan_num  < player_cnt



--log获取
select
    *
 FROM
    codez_dsl_dropoutdetail_fht0
    where
    tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    and dsroomid in (72074086750306414,
72074086792773667,
72074087194902572,
72074087368966180,
72074087484833841)

select
    *
 FROM
    codez_dsl_BotGameStatisReport_fht0
    where
    tdbank_imp_date BETWEEN '2026011800' and '2026020123'
    and env = 'live'
    and dsroomid in (72074086750306414,
72074086792773667,
72074087194902572,
72074087368966180,
72074087484833841)
