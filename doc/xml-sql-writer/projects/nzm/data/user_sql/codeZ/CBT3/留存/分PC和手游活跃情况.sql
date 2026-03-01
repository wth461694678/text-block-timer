-- ******************************************
-- 首日(9月8日)注册用户的分端活跃统计
-- ******************************************

WITH 
-- 9月8日注册的用户
first_day_register AS (
    SELECT DISTINCT
        vopenid
    FROM
        ieg_tdbank::codez_dsl_Playerregister_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
        AND env = 'live'
),
-- 登出活跃数据
logout_activity AS (
    SELECT
        vopenid,
        platid,
        SUBSTR(tdbank_imp_date, 1, 8) AS p_date
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025092123'
        AND env = 'live'
)
SELECT
    la.p_date,
    COUNT(DISTINCT fr.vopenid) AS total_active_users,  -- 总活跃用户数
    COUNT(DISTINCT CASE WHEN la.platid IN (0,1) THEN fr.vopenid END) AS mob_active_users,  -- 移动端活跃
    COUNT(DISTINCT CASE WHEN la.platid = 2 THEN fr.vopenid END) AS pc_active_users,  -- PC端活跃
    COUNT(DISTINCT CASE WHEN la.platid = 2 THEN fr.vopenid END)/COUNT(DISTINCT fr.vopenid) as pc_active_rate
FROM
    first_day_register fr
    LEFT JOIN logout_activity la ON fr.vopenid = la.vopenid
WHERE
    la.p_date IS NOT NULL  -- 只统计有活跃的日期
GROUP BY
    la.p_date
ORDER BY
    la.p_date;



--双栖用户数量及比例

SELECT
    plat_num
    ,count(distinct vopenid) as player_num
from
(SELECT
        vopenid,
        count(DISTINCT CASE WHEN platid IN (0,1) then 'mob' else 'pc' end) as plat_num 
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025101323'
        AND env = 'live'
    group BY
    vopenid
)
group by
    plat_num

--手机端
SELECT
    plat_num
    ,count(distinct vopenid) as player_num
from
(SELECT
        vopenid,
        count(DISTINCT CASE WHEN platid IN (0,1) then 'mob' else 'pc' end) as plat_num 
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025101323'
        AND env = 'live'
    and vopenid not in (SELECT
        distinct 
        vopenid
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025101323'
        AND env = 'live' and platid = 2)
    group BY
    vopenid
)
group by
    plat_num

--PC端
SELECT
    plat_num
    ,count(distinct vopenid) as player_num
from
(SELECT
        vopenid,
        count(DISTINCT CASE WHEN platid IN (0,1) then 'mob' else 'pc' end) as plat_num 
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025101323'
        AND env = 'live'
    and vopenid not in (SELECT
        distinct 
        vopenid
    FROM
        ieg_tdbank::codez_dsl_Playerlogout_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025101323'
        AND env = 'live' and platid in (0,1))
    group BY
    vopenid
)
group by
    plat_num