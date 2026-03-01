-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************


--玩家组队类型
select
    tdbank_imp_date
    ,dteventtime
    ,platid
    ,izoneareaid
    ,vopenid
    ,vroleid
    ,env
    ,customroomid
    ,roomid
    ,dungeonid
    ,playercount
    ,botcount
    ,matchprocess
    ,playerid_1
    ,case when playercount = 1 then "自建房单排"
    when 7 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) or 8 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) then "好友组队"
    when 3 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) or 5 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) then "社团组队"
    when 2 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) or 4 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) or 6 in (playerapplysource_2, playerapplysource_3, playerapplysource_4) then "世界招募"
    else '其他' end as playerapplysource_1
    ,playerid_2
    ,case when playerapplysource_2 in (7,8) then "好友组队"
    when playerapplysource_2 in (3,5) then "社团组队"
    when playerapplysource_2 in (2,4,6) then "世界招募"
    else '其他' end as playerapplysource_2
    ,playerid_3
    ,case when playerapplysource_3 in (7,8) then "好友组队"
    when playerapplysource_3 in (3,5) then "社团组队"
    when playerapplysource_3 in (2,4,6) then "世界招募"
    else '其他' end as playerapplysource_3
    ,playerid_4
    ,case when playerapplysource_4 in (7,8) then "好友组队"
    when playerapplysource_4 in (3,5) then "社团组队"
    when playerapplysource_4 in (2,4,6) then "世界招募"
    else '其他' end as playerapplysource_4
    ,createdtime
from    
    ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
WHERE
    tdbank_imp_date BETWEEN '2025072110' and '2025072110'



-- 第 1 步：计算房间类型
WITH base AS (
    SELECT *,
           CASE
               WHEN playercount = 1 THEN '自建房单排'
               WHEN 7 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 8 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '好友组队'
               WHEN 3 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 5 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '社团组队'
               WHEN 2 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 4 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
                    OR 6 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '世界招募'
               ELSE '其他'
           END AS room_team_type
    FROM ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
    WHERE tdbank_imp_date BETWEEN '2025072110' AND '2025072110'
    and MatchProcess = 0
)

-- 第 2 步：拆成 4 行（UNION ALL）
, players AS (
    SELECT b.*, playerid_1 AS playerid, playerapplysource_1 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_2 AS playerid, playerapplysource_2 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_3 AS playerid, playerapplysource_3 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_4 AS playerid, playerapplysource_4 AS applysource FROM base b
)
-- 第 3 步：过滤 applysource = 0
-- 第 4 步：根据规则得到最终 team_type
, team_type AS (
SELECT
    tdbank_imp_date,
    dteventtime,
    platid,
    izoneareaid,
    env,
    customroomid,
    roomid,
    dungeonid,
    playercount,
    playerid,
    CASE
        WHEN applysource = 1 THEN room_team_type
        WHEN applysource IN (7,8) THEN '好友组队'
        WHEN applysource IN (3,5) THEN '社团组队'
        WHEN applysource IN (2,4,6) THEN '世界招募'
        ELSE '其他'
    END AS team_type
FROM players
WHERE applysource <> 0),
matchallocresult as (
select
    tdbank_imp_date,
    dteventtime,
    platid,
    izoneareaid,
    env,
    -1 as customroomid,
    roomid,
    dungeonid,
    1 as playercount,
    vroleid as playerid,
    '单人匹配' as team_type
from
    ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
WHERE 
    tdbank_imp_date BETWEEN '2025072110' AND '2025072110'
    and Result = 0
)
select
    *
from
    team_type
UNION ALL
select
    *
from
    matchallocresult

-- 1. 自定义房间
SELECT  tdbank_imp_date,
        dteventtime,
        platid,
        izoneareaid,
        env,
        customroomid,
        roomid,
        dungeonid,
        playercount,
        playerid,
        CASE
            WHEN applysource = 1 THEN room_team_type
            WHEN applysource IN (7,8) THEN '好友组队'
            WHEN applysource IN (3,5) THEN '社团组队'
            WHEN applysource IN (2,4,6) THEN '世界招募'
            ELSE '其他'
        END AS team_type
FROM (
    SELECT  *,
            CASE
                WHEN playercount = 1 THEN '自建房单排'
                WHEN 7 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     OR 8 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     THEN '好友组队'
                WHEN 3 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     OR 5 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     THEN '社团组队'
                WHEN 2 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     OR 4 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     OR 6 IN (playerapplysource_1,playerapplysource_2,playerapplysource_3,playerapplysource_4)
                     THEN '世界招募'
                ELSE '其他'
            END AS room_team_type
    FROM ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
    WHERE tdbank_imp_date BETWEEN '2025072110' AND '2025072110'
      AND MatchProcess = 0
) t
LATERAL VIEW OUTER stack(
    4,
    playerid_1, playerapplysource_1,
    playerid_2, playerapplysource_2,
    playerid_3, playerapplysource_3,
    playerid_4, playerapplysource_4
) s AS playerid, applysource
WHERE applysource <> 0

UNION ALL

-- 2. 单人匹配
SELECT  tdbank_imp_date,
        dteventtime,
        platid,
        izoneareaid,
        env,
        -1            AS customroomid,
        roomid,
        dungeonid,
        1             AS playercount,
        vroleid       AS playerid,
        '单人匹配'     AS team_type
FROM ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
WHERE tdbank_imp_date BETWEEN '2025072110' AND '2025072110'
  AND Result = 0;



--查bug
-- 第 1 步：计算房间类型
WITH base AS (
    SELECT *,
           CASE
               WHEN playercount = 1 THEN '自建房单排'
               WHEN 7 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 8 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '好友组队'
               WHEN 3 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 5 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '社团组队'
               WHEN 2 IN (playerapplysource_1, playerapplysource_2,
                          playerapplysource_3, playerapplysource_4)
                    OR 4 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
                    OR 6 IN (playerapplysource_1, playerapplysource_2,
                             playerapplysource_3, playerapplysource_4)
               THEN '世界招募'
               ELSE '其他'
           END AS room_team_type
    FROM ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
    WHERE tdbank_imp_date BETWEEN '2025072010' AND '2025072410'
)

-- 第 2 步：拆成 4 行（UNION ALL）
, players AS (
    SELECT b.*, playerid_1 AS playerid, playerapplysource_1 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_2 AS playerid, playerapplysource_2 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_3 AS playerid, playerapplysource_3 AS applysource FROM base b
    UNION ALL
    SELECT b.*, playerid_4 AS playerid, playerapplysource_4 AS applysource FROM base b
)
select
    *
from players
order by roomid
--     WHERE
--         roomid = 2917663879372783723

-- 第 3 步：过滤 applysource = 0
-- 第 4 步：根据规则得到最终 team_type
select
    *
from
(SELECT
    tdbank_imp_date,
    dteventtime,
    platid,
    izoneareaid,
    vopenid,
    vroleid,
    env,
    customroomid,
    roomid,
    dungeonid,
    playercount,
    botcount,
    matchprocess,
    createdtime,
    playerid,
    applysource,
    CASE
        WHEN applysource = 1 THEN room_team_type
        WHEN applysource IN (7,8) THEN '好友组队'
        WHEN applysource IN (3,5) THEN '社团组队'
        WHEN applysource IN (2,4,6) THEN '世界招募'
        ELSE '其他'
    END AS team_type
FROM players
WHERE applysource <> 0
AND ENV <> 'yace')
where team_type = '其他'



select
    *
FROM ieg_tdbank::codez_dsl_CustomRoomMatchInfo_fht0
    WHERE tdbank_imp_date BETWEEN '2025071710' AND '2025071723'
    and customroomid = 8935170829565788168