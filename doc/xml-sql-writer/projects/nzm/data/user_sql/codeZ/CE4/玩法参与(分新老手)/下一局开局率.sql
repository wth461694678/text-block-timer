-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************



WITH base_data AS (
    -- 完整对局数据
    SELECT
        -- 基础字段
        GameSvrId,
        dtEventTime,
        vGameAppid,
        PlatID,
        iZoneAreaID,
        vOpenID,
        vRoleID,
        Env,
        AreaID,
        iLevel,
        -- 对局字段
        iduration,
        DsRoomId,
        iIsWin,
        iKills,
        iDeaths,
        Damage,
        iDungeonID,
        0 AS is_quit,
        UNIX_TIMESTAMP(dtEventTime) AS game_end_ts
    FROM ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE tdbank_imp_date BETWEEN '2025112000' AND '2025112023'
    
    UNION ALL
    
    -- 中退对局数据
    SELECT
        -- 基础字段
        GameSvrId,
        dtEventTime,
        vGameAppid,
        PlatID,
        iZoneAreaID,
        vOpenID,
        vRoleID,
        Env,
        AreaID,
        iLevel,
        -- 对局字段
        iduration,
        DsRoomId,
        -1 AS iIsWin,
        iKills,
        iDeaths,
        Damage,
        iDungeonID,
        1 AS is_quit,
        UNIX_TIMESTAMP(dtEventTime) AS game_end_ts
    FROM ieg_tdbank::codez_dsl_dropoutdetail_fht0
    WHERE tdbank_imp_date BETWEEN '2025112000' AND '2025112023' 
      AND iDungeonID <> 2004001
),

-- 只保留非中退局，作为"下一局"的候选
non_quit_games AS (
    SELECT vOpenID, DsRoomId, game_end_ts
    FROM base_data
    WHERE is_quit = 0
),

-- 为每局找到下一个非中退局的结束时间
with_next_game AS (
    SELECT 
        a.*,
        MIN(b.game_end_ts) AS next_non_quit_end_ts
    FROM base_data a
    LEFT JOIN non_quit_games b 
        ON a.vOpenID = b.vOpenID 
        AND b.game_end_ts > a.game_end_ts
        AND b.DsRoomId <> a.DsRoomId
    GROUP BY 
        -- 基础字段
        a.GameSvrId,
        a.dtEventTime,
        a.vGameAppid,
        a.PlatID,
        a.iZoneAreaID,
        a.vOpenID,
        a.vRoleID,
        a.Env,
        a.AreaID,
        a.iLevel,
        -- 对局字段
        a.iduration,
        a.DsRoomId,
        a.iIsWin,
        a.iKills,
        a.iDeaths,
        a.Damage,
        a.iDungeonID,
        a.is_quit,
        a.game_end_ts
)

-- 最终结果
SELECT 
    -- 基础字段
    GameSvrId,
    dtEventTime,
    vGameAppid,
    PlatID,
    iZoneAreaID,
    vOpenID,
    vRoleID,
    Env,
    AreaID,
    iLevel,
    -- 对局字段
    iduration,
    DsRoomId,
    iIsWin,
    iKills,
    iDeaths,
    Damage,
    iDungeonID,
    is_quit,
    -- 计算字段
    next_non_quit_end_ts,
    CASE 
        WHEN next_non_quit_end_ts IS NOT NULL 
             AND (next_non_quit_end_ts - game_end_ts) <= 3600
        THEN 1 
        ELSE 0 
    END AS has_next_game
FROM with_next_game