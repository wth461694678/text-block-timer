-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--CBT3玩家对局数据
with
--注册表字段
regi as
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025090823'
    AND env = 'live'
),
gamedetail as
(select
    vopenid
    ,count(distinct dsroomid) as game_num
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
where
    tdbank_imp_date between '2025090800' and '2025091423'
    AND env = 'live'
group by
    vopenid)
select
    gamedetail.game_num
    ,count(distinct regi.vopenid) as user_num
from
    regi
    left join
    gamedetail
    on regi.vopenid = gamedetail.vopenid
group by
    gamedetail.game_num



WITH
-- 注册表字段
regi AS (
    SELECT DISTINCT vopenid
    FROM ieg_tdbank::codez_dsl_Playerregister_fht0
    WHERE tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
      AND env = 'live'
),

-- 按不同时间段统计对局数
gamedetail AS (
    SELECT
        vopenid,
        -- 第1天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025090823' 
                            THEN dsroomid END) AS day1_num,
        -- 前2天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025090923' 
                            THEN dsroomid END) AS day2_num,
        -- 前3天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025091023' 
                            THEN dsroomid END) AS day3_num,
        -- 前4天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025091123' 
                            THEN dsroomid END) AS day4_num,
        -- 前5天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025091223' 
                            THEN dsroomid END) AS day5_num,
        -- 前6天对局数
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025091323' 
                            THEN dsroomid END) AS day6_num,
        -- 首周对局数（7天）
        COUNT(DISTINCT CASE WHEN tdbank_imp_date BETWEEN '2025090800' AND '2025091423' 
                            THEN dsroomid END) AS week_num
    FROM ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
      AND env = 'live'
    GROUP BY vopenid
)

SELECT
    -- 各时间段与首周比值的均值
    AVG(CASE WHEN week_num > 0 THEN day1_num * 1.0 / week_num END) AS avg_day1_ratio,
    AVG(CASE WHEN week_num > 0 THEN day2_num * 1.0 / week_num END) AS avg_day2_ratio,
    AVG(CASE WHEN week_num > 0 THEN day3_num * 1.0 / week_num END) AS avg_day3_ratio,
    AVG(CASE WHEN week_num > 0 THEN day4_num * 1.0 / week_num END) AS avg_day4_ratio,
    AVG(CASE WHEN week_num > 0 THEN day5_num * 1.0 / week_num END) AS avg_day5_ratio,
    AVG(CASE WHEN week_num > 0 THEN day6_num * 1.0 / week_num END) AS avg_day6_ratio,
    COUNT(DISTINCT regi.vopenid) AS total_users
FROM regi
LEFT JOIN gamedetail ON regi.vopenid = gamedetail.vopenid




--逆战新进和收入
select
    


    --策划需求
    select
    buttonid
    ,count(distinct vopenid)
    from
    (select
    *
        FROM ieg_tdbank::codez_dsl_PlayerClickButtonFlow_fht0
    WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
    and env = 'live'
    and action = 'AppStoreReview')
    group by
    buttonid


--云游戏登录情况
select
    loginresult
    ,IsReconnect
    ,count(distinct vopenid)
FROM ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
    and env = 'live'
    and is_gamematrix= 1
group by
    loginresult
    ,IsReconnect

--玩家
select
    loginresult
    ,IsReconnect
    ,count(distinct vopenid)
FROM ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
    and env = 'live'
    and is_gamematrix= 1
group by
    loginresult
    ,IsReconnect
















--玩家每日对局数分布
WITH daily_game AS (
    SELECT
        SUBSTR(gamedetail_sub.tdbank_imp_date, 1, 8) AS dt,
        gamedetail_sub.vopenid,
        COUNT(DISTINCT IF(map_id != '机甲战', dsroomid, NULL)) 
        + 0.5 * COUNT(DISTINCT IF(map_id = '机甲战', dsroomid, NULL)) AS game_num
    FROM
    (
        SELECT
            tdbank_imp_date,
            vopenid,
            dsroomid,
            iDungeonID
        FROM ieg_tdbank::codez_dsl_GameDetail_fht0
        WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
          AND env = 'live'

        UNION ALL

        SELECT
            tdbank_imp_date,
            vopenid,
            dsroomid,
            iDungeonID
        FROM ieg_tdbank::codez_dsl_dropoutDetail_fht0
        WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
          AND env = 'live'
    ) gamedetail_sub
    LEFT JOIN
    (
        SELECT DISTINCT
            param1 AS dungeon_id,
            param4 AS map_id
        FROM codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
        WHERE configname = 'FubenEntranceInfo'
    ) excelconfig 
      ON gamedetail_sub.iDungeonID = excelconfig.dungeon_id
    GROUP BY SUBSTR(gamedetail_sub.tdbank_imp_date, 1, 8), gamedetail_sub.vopenid
)

SELECT
    dt,
    game_num,
    COUNT(*) AS player_cnt,
    ROUND(COUNT(*)/ SUM(COUNT(*)) OVER (PARTITION BY dt), 6) AS pct
FROM daily_game
GROUP BY dt, game_num
ORDER BY dt, game_num;


--周均对局数
WITH daily_game AS (
    SELECT
        SUBSTR(gamedetail_sub.tdbank_imp_date, 1, 8) AS dt,
        gamedetail_sub.vopenid,
        gamedetail_sub.dsroomid,
        excelconfig.map_id
    FROM
    (
        SELECT
            tdbank_imp_date,
            vopenid,
            dsroomid,
            iDungeonID
        FROM ieg_tdbank::codez_dsl_GameDetail_fht0
        WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
          AND env = 'live'

        UNION ALL

        SELECT
            tdbank_imp_date,
            vopenid,
            dsroomid,
            iDungeonID
        FROM ieg_tdbank::codez_dsl_dropoutDetail_fht0
        WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
          AND env = 'live'
    ) gamedetail_sub
    LEFT JOIN
    (
        SELECT DISTINCT
            param1 AS dungeon_id,
            param4 AS map_id
        FROM codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
        WHERE configname = 'FubenEntranceInfo'
          AND (param8 IN ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','竞技') 
               OR param4 = '机甲战')
    ) excelconfig 
      ON gamedetail_sub.iDungeonID = excelconfig.dungeon_id
),

-- ★ 按自定义周聚合
weekly_game AS (
    SELECT
        FLOOR(
            DATEDIFF(
                FROM_UNIXTIME(UNIX_TIMESTAMP(dt, 'yyyyMMdd')),
                FROM_UNIXTIME(UNIX_TIMESTAMP(SUBSTR('${BEGIN_DATE}', 1, 8), 'yyyyMMdd'))
            ) / 7
        ) + 1 AS week_num,
        vopenid,
        COUNT(DISTINCT IF(map_id != '机甲战', dsroomid, NULL)) 
        + 0.5 * COUNT(DISTINCT IF(map_id = '机甲战', dsroomid, NULL)) AS game_num
    FROM daily_game
    GROUP BY
        FLOOR(
            DATEDIFF(
                FROM_UNIXTIME(UNIX_TIMESTAMP(dt, 'yyyyMMdd')),
                FROM_UNIXTIME(UNIX_TIMESTAMP(SUBSTR('${BEGIN_DATE}', 1, 8), 'yyyyMMdd'))
            ) / 7
        ) + 1,
        vopenid
)

SELECT
    week_num,
    game_num,
    COUNT(*)  AS player_cnt,
    ROUND(COUNT(*)/ SUM(COUNT(*)) OVER (PARTITION BY week_num), 6) AS pct
FROM weekly_game
GROUP BY week_num, game_num
ORDER BY week_num, game_num;