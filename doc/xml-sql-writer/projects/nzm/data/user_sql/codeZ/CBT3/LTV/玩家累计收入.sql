-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
-- 付费分析 - 前30天每日累计收入
SELECT 
    platid,
    COUNT(DISTINCT t1.vopenid) AS userx_register,
    SUM(imoney) AS imoney_total,
    COUNT(DISTINCT t2.vopenid) AS userx_pay,
    
    -- 前30天每日累计收入
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 0 THEN imoney END) AS imoney_day1,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 1 THEN imoney END) AS imoney_day2,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 2 THEN imoney END) AS imoney_day3,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 3 THEN imoney END) AS imoney_day4,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 4 THEN imoney END) AS imoney_day5,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 5 THEN imoney END) AS imoney_day6,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 6 THEN imoney END) AS imoney_day7,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 7 THEN imoney END) AS imoney_day8,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 8 THEN imoney END) AS imoney_day9,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 9 THEN imoney END) AS imoney_day10,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 10 THEN imoney END) AS imoney_day11,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 11 THEN imoney END) AS imoney_day12,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 12 THEN imoney END) AS imoney_day13,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 13 THEN imoney END) AS imoney_day14,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 14 THEN imoney END) AS imoney_day15,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 15 THEN imoney END) AS imoney_day16,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 16 THEN imoney END) AS imoney_day17,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 17 THEN imoney END) AS imoney_day18,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 18 THEN imoney END) AS imoney_day19,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 19 THEN imoney END) AS imoney_day20,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 20 THEN imoney END) AS imoney_day21,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 21 THEN imoney END) AS imoney_day22,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 22 THEN imoney END) AS imoney_day23,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 23 THEN imoney END) AS imoney_day24,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 24 THEN imoney END) AS imoney_day25,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 25 THEN imoney END) AS imoney_day26,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 26 THEN imoney END) AS imoney_day27,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 27 THEN imoney END) AS imoney_day28,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 28 THEN imoney END) AS imoney_day29,
    SUM(CASE WHEN DATEDIFF(t2.dtstatdate, t1.day) <= 29 THEN imoney END) AS imoney_day30

FROM
    -- 注册用户表
    (SELECT
        vopenid,
        platid,
        SUBSTR(tdbank_imp_date, 1, 8) AS day
    FROM
        ieg_tdbank::codez_dsl_playerregister_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
        AND env = 'live'
    GROUP BY
        vOpenID, platid, SUBSTR(tdbank_imp_date, 1, 8)) t1
        
LEFT JOIN
    -- 付费流水表
    (SELECT 
        SUM(imoney)/100 AS imoney,
        vopenid,
        dtstatdate
    FROM 
        hy_idog_oss::codez_v_water
    WHERE 
        dtstatdate BETWEEN '20250908' AND '20250908'
    GROUP BY 
        vopenid, dtstatdate) t2
ON t1.vopenid = t2.vopenid

GROUP BY platid;






SELECT
        platid,
        count(distinct vopenid) as user_count
    FROM
        ieg_tdbank::codez_dsl_playerregister_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
        AND env = 'live'
    GROUP BY
        platid



SELECT
    platid,
    count(distinct vopenid) as user_count
FROM
    ieg_tdbank::codez_dsl_playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
    --AND env = 'live'
GROUP BY
    platid