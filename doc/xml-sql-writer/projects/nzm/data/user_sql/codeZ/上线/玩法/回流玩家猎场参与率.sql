-- ============================================
-- 需求: 回流玩家在猎场各 param5 细分分类中的参与率
-- 口径说明:
--   回流玩家: 已注册7天以上 + 近7日未活跃 + 目标日当天有活跃
--   活跃判定: PlayerLogin(loginresult=0) UNION PlayerLogout
--   对局明细: GameDetail UNION ALL DropOutDetail，排除大厅(idungeonid <> 2004001)
--   猎场分类: FubenEntranceInfo 配置表 param4='僵尸猎场' 的 param5
--   参与率: 参与该分类的回流玩家数 / 总回流玩家数
-- 数据源: SR 表（codez_log.* 系列）
-- ============================================

WITH
-- ========== 公共维表：副本→玩法类型映射 ==========
map_td AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '塔防' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '塔防'
),
map_mech AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '机甲战' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '机甲战'
),
map_hunt AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '僵尸猎场' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '僵尸猎场'
),
map_race AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '猎场竞速' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '猎场竞速'
),
map_timehunt AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '时空追猎' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '时空追猎'
),
map_hideseek AS (
    SELECT DISTINCT CAST(param1 AS BIGINT) AS dungeon_id, '躲猫猫' AS play_type
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo' AND param4 = '躲猫猫'
),

dungeon_type_map AS (
    SELECT * FROM map_td
    UNION ALL SELECT * FROM map_mech
    UNION ALL SELECT * FROM map_hunt
    UNION ALL SELECT * FROM map_race
    UNION ALL SELECT * FROM map_timehunt
    UNION ALL SELECT * FROM map_hideseek
),

-- ★★★ 新增：猎场副本 → param5 明细映射 ★★★
hunt_detail_map AS (
    SELECT DISTINCT
        CAST(param1 AS BIGINT) AS dungeon_id,
        COALESCE(param5, '未知分类')  AS hunt_param5
    FROM codez_dev.codez_ret_excelconfiginfo_conf
    WHERE configname = 'FubenEntranceInfo'
      AND param4 = '僵尸猎场'
),

-- ========== 当天活跃玩家（回流日当天） ==========
act AS (
    SELECT vopenid
    FROM codez_log.codez_dsl_playerlogin_fht0
    WHERE dteventdate BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND dteventtime BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND loginresult = 0
        AND env = 'live'
    UNION
    SELECT vopenid
    FROM codez_log.codez_dsl_playerlogout_fht0
    WHERE dteventdate BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND dteventtime BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND env = 'live'
),

-- ========== 7日前已注册玩家 ==========
registered_before_7days AS (
    SELECT
        vopenid AS regi_vopenid,
        MAX(ilevel) AS ilevel,
        MAX(dteventdate) AS last_date
    FROM (
        SELECT vopenid, MAX(ilevel) AS ilevel, MAX(dteventdate) AS dteventdate
        FROM codez_log.codez_dsl_playerlogin_fht0
        WHERE dteventdate BETWEEN '2026-01-13 00:00:00' AND '2026-01-28 23:59:59'
            AND loginresult = 0 AND env = 'live'
        GROUP BY vopenid
        UNION ALL
        SELECT vopenid, MAX(ilevel) AS ilevel, MAX(dteventdate) AS dteventdate
        FROM codez_log.codez_dsl_playerlogout_fht0
        WHERE dteventdate BETWEEN '2026-01-13 00:00:00' AND '2026-01-28 23:59:59'
            AND env = 'live'
        GROUP BY vopenid
    ) a
    GROUP BY vopenid
),

-- ========== 最近7日活跃（流失窗口） ==========
last_7_days_active AS (
    SELECT vopenid
    FROM codez_log.codez_dsl_playerlogin_fht0
    WHERE dteventdate BETWEEN '2026-01-29 00:00:00' AND '2026-02-04 23:59:59'
        AND loginresult = 0 AND env = 'live'
    UNION
    SELECT vopenid
    FROM codez_log.codez_dsl_playerlogout_fht0
    WHERE dteventdate BETWEEN '2026-01-29 00:00:00' AND '2026-02-04 23:59:59'
        AND env = 'live'
),

-- ========== 回流玩家集合 ==========
return_players AS (
    SELECT r.regi_vopenid AS vopenid
    FROM registered_before_7days r
    LEFT JOIN last_7_days_active l ON r.regi_vopenid = l.vopenid
    INNER JOIN act               a ON r.regi_vopenid = a.vopenid
    WHERE l.vopenid IS NULL          -- 近7日未活跃
),

-- ========== 回流后：对局明细 ==========
after_game_raw AS (
    SELECT vopenid, idungeonid, FLOOR(iDuration / 60) AS duration_min
    FROM codez_log.codez_dsl_gamedetail_fht0
    WHERE dteventdate BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND env = 'live' AND idungeonid <> 2004001
    UNION ALL
    SELECT vopenid, idungeonid, FLOOR(iDuration / 60) AS duration_min
    FROM codez_log.codez_dsl_dropoutdetail_fht0
    WHERE dteventdate BETWEEN '2026-02-05 00:00:00' AND '2026-02-09 23:59:59'
        AND env = 'live' AND idungeonid <> 2004001
),

-- ★★★ 核心：回流玩家 × 猎场 param5 参与明细 ★★★
return_hunt_by_param5 AS (
    SELECT
        h.hunt_param5,
        COUNT(DISTINCT g.vopenid) AS participated_players,   -- 参与该 param5 的回流玩家数
        COUNT(*)                  AS match_count,            -- 对局次数
        SUM(g.duration_min)       AS total_duration_min      -- 总时长（分钟）
    FROM after_game_raw g
    INNER JOIN return_players rp  ON g.vopenid     = rp.vopenid      -- 仅回流玩家
    INNER JOIN hunt_detail_map h  ON g.idungeonid  = h.dungeon_id    -- 仅猎场副本
    GROUP BY h.hunt_param5
),

-- 回流玩家总数
return_total AS (
    SELECT COUNT(*) AS total_return_players
    FROM return_players
)

-- ========== 最终输出：猎场每类 param5 的参与率 ==========
SELECT
    '2026-02-05 00:00:00'                                                        AS dteventdate,
    hp.hunt_param5,
    rt.total_return_players,
    hp.participated_players,
    ROUND(hp.participated_players * 100.0 / rt.total_return_players, 2)        AS participation_rate_pct,
    hp.match_count,
    hp.total_duration_min,
    ROUND(hp.total_duration_min * 1.0 / NULLIF(hp.participated_players, 0), 1) AS avg_duration_per_player
FROM return_hunt_by_param5 hp
CROSS JOIN return_total rt
ORDER BY hp.participated_players DESC
