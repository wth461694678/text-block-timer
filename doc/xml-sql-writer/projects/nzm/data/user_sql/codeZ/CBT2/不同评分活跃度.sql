/*
SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
*/
-- --达到不同评分活跃度
-- with player as 
-- (select
--     regi.vopenid
-- from
-- (SELECT
--    distinct 
--    dteventtime
--    ,vopenid
--    ,env
--    ,SystemHardware
-- FROM
--    codez_dsl_playerregister_fht0 as codez_dsl_playerregister_fht0
-- WHERE 
--    tdbank_imp_date BETWEEN '2025030300' and '2025030923'
--    )regi
-- join
-- (SELECT
--    qq
--    ,vopenid
--    ,iptype
--    ,gametype
--    ,channel
-- from
--    codez_mid_analysis::temp_nzm_ceqq20250303)nzqq on regi.vopenid = nzqq.vopenid),
-- Schemeinfo as (select
--     vopenid
--     ,substr(tdbank_imp_date,1,8) as p_date
--     ,max(cast(ScoreSum as bigint)) as ScoreSum
--     --,dense_rank()over(PARTITION by vopenid order by substr(tdbank_imp_date,1,8)) as day_rank
-- from
--     ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
-- WHERE
--     tdbank_imp_date between '2025030300' and '2025030923'
-- group by
--     vopenid
--     ,substr(tdbank_imp_date,1,8)),
-- online_time as
-- (select
--     vopenid
--     ,substr(tdbank_imp_date,1,8) as p_date
--     ,sum(OnlineTime) as onlinetime
-- from
--     ieg_tdbank::codez_dsl_Playerlogout_fht0
-- WHERE
--     tdbank_imp_date between '2025030300' and '2025030923'
--     and env = 'tiyan'
-- group by
--     vopenid
--     ,substr(tdbank_imp_date,1,8))
-- select 
    
-- from
--     player
-- left join
--     Schemeinfo on player.vopenid = Schemeinfo.vopenid
-- left join
--     online_time on player.vopenid = online_time.vopenid




--
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
   tdbank_imp_date BETWEEN '2025033100' and '2025040923'
   )regi
join
(SELECT
   vopenid
   ,iptype
   ,gametype
from
   codez_mid_analysis::temp_nzm_cbt2vopenid20250331)nzqq on regi.vopenid = nzqq.vopenid),
Schemeinfo AS (
    SELECT
        vopenid,
        substr(tdbank_imp_date, 1, 8) AS p_date,
        MAX(CAST(ScoreSum AS BIGINT)) AS ScoreSum
    FROM
        ieg_tdbank::codez_dsl_PlayerSelectedSchemeInfo_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' AND '2025040923'
    GROUP BY
        vopenid,
        substr(tdbank_imp_date, 1, 8)
),
online_time AS (
    SELECT
        vopenid,
        substr(tdbank_imp_date, 1, 8) AS p_date,
        sum(OnlineTime) as onlinetime
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025033100' AND '2025040923'
        AND env = 'tiyan'
    GROUP BY
        vopenid,
        substr(tdbank_imp_date, 1, 8)
),
combined AS (
    SELECT
        s.vopenid,
        s.p_date,
        s.ScoreSum,
        ot.onlinetime
    FROM
        player
    JOIN
        Schemeinfo s ON player.vopenid = s.vopenid
    LEFT JOIN
        online_time ot ON player.vopenid = ot.vopenid AND s.p_date = ot.p_date
),
-- 定义 ScoreSum 区间
score_buckets AS (
    SELECT
        c.vopenid,
        c.p_date,
        c.ScoreSum,
        c.onlinetime,
        CASE
            WHEN CAST(c.ScoreSum AS DOUBLE) < 0 THEN '(-∞,0)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 0 AND CAST(c.ScoreSum AS DOUBLE) < 400 THEN '[0,400)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 400 AND CAST(c.ScoreSum AS DOUBLE) < 800 THEN '[400,800)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 800 AND CAST(c.ScoreSum AS DOUBLE) < 1200 THEN '[800,1200)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 1200 AND CAST(c.ScoreSum AS DOUBLE) < 1600 THEN '[1200,1600)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 1600 AND CAST(c.ScoreSum AS DOUBLE) < 2000 THEN '[1600,2000)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 2000 AND CAST(c.ScoreSum AS DOUBLE) < 2400 THEN '[2000,2400)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 2400 AND CAST(c.ScoreSum AS DOUBLE) < 2800 THEN '[2400,2800)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 2800 AND CAST(c.ScoreSum AS DOUBLE) < 3000 THEN '[2800,3000)'
            WHEN CAST(c.ScoreSum AS DOUBLE) >= 3000 THEN '[3000,+∞)'
            ELSE NULL
        END AS scoresum_interval
    FROM
        combined c
),
-- 计算每个玩家前一天和后一天的活跃时长
player_with_window AS (
    SELECT
        sb.vopenid,
        sb.p_date,
        sb.scoresum_interval,
        sb.onlinetime,
        COALESCE(prev_time.onlinetime,0) AS prev_onlinetime,
        COALESCE(next_time.onlinetime,0) AS next_onlinetime
    FROM (
        SELECT
            vopenid,
            p_date,
            scoresum_interval,
            onlinetime
        FROM
            score_buckets
    ) AS sb
    LEFT JOIN
        online_time AS prev_time
    ON
        sb.vopenid = prev_time.vopenid
        AND prev_time.p_date = date_add(sb.p_date,-1)
    LEFT JOIN
        online_time AS next_time
    ON
        sb.vopenid = next_time.vopenid
        AND next_time.p_date = date_add(sb.p_date,1)
)
SELECT
    p.p_date,
    p.scoresum_interval,
    COUNT(DISTINCT p.vopenid) AS player_count,
    sum(p.prev_onlinetime) AS avg_online_prev_day,
    sum(p.onlinetime) AS avg_online_current_day,
    sum(p.next_onlinetime) AS avg_online_next_day
FROM
    player_with_window p
GROUP BY
    p.p_date,
    p.scoresum_interval
ORDER BY
    p.p_date,
    -- 可根据需要调整排序顺序
    CASE
        WHEN p.scoresum_interval = '(-∞,0)' THEN 1
        WHEN p.scoresum_interval = '[0,400)' THEN 2
        WHEN p.scoresum_interval = '[400,800)' THEN 3
        WHEN p.scoresum_interval = '[800,1200)' THEN 4
        WHEN p.scoresum_interval = '[1200,1600)' THEN 5
        WHEN p.scoresum_interval = '[1600,2000)' THEN 6
        WHEN p.scoresum_interval = '[2000,2400)' THEN 7
        WHEN p.scoresum_interval = '[2400,2800)' THEN 8
        WHEN p.scoresum_interval = '[2800,3000)' THEN 9
        WHEN p.scoresum_interval = '[3000,+∞)' THEN 10
        ELSE 11
    END;



--活跃登录比
WITH player AS (
    SELECT
        regi.vopenid
        ,gametype
    FROM (
        SELECT DISTINCT 
            dteventtime,
            vopenid,
            env,
            SystemHardware
        FROM
            codez_dsl_playerregister_fht0
        WHERE 
            tdbank_imp_date BETWEEN '2025030300' AND '2025030923'
    ) AS regi
    JOIN (
        SELECT
            qq,
            vopenid,
            iptype,
            gametype,
            channel
        FROM
            codez_mid_analysis::temp_nzm_ceqq20250303
    ) AS nzqq 
    ON regi.vopenid = nzqq.vopenid
),
act_days AS (
    SELECT
        vopenid,
        count(distinct substr(tdbank_imp_date, 1, 8)) AS act_days
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025030300' AND '2025030923'
        AND env = 'tiyan'
    GROUP BY
        vopenid
)
select
    gametype
    ,act_days
    ,count(distinct player.vopenid) as player_num
from
    player
left join
    act_days on player.vopenid = act_days.vopenid
group by
    gametype
    ,act_days
