-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
SELECT
    vopenid
    ,max(platid) as platid
    ,count(distinct platid) as plat_num
    ,sum(onlinetime) as onlinetime
    ,sum(gametime) as gametime
from
(SELECT 
    vopenid
    ,platid
    ,0 as onlinetime
    ,0 as gametime
FROM 
    ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE 
    tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
    and loginresult = 0
UNION all
SELECT 
    vopenid
    ,platid
    ,onlinetime
    ,0 as gametime
FROM 
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE 
    tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
union all
SELECT
    vopenid
    ,platid
    ,0 as onlinetime
    ,iDuration as gametime
FROM
    ieg_tdbank::codez_dsl_GameDetail_fht0
WHERE 
    tdbank_imp_date BETWEEN '2025090800' AND '2025090823')
group BY
    vopenid




--活跃留存
WITH daily_active AS (
  SELECT
    substr(tdbank_imp_date, 1, 8) AS day,   -- 取 yyyyMMdd
    vopenid
  FROM playerlogout
  -- 如需限定时间范围，可加 WHERE 条件，例如：
  WHERE substr(tdbank_imp_date, 1, 8) BETWEEN '20250908' AND '20250930'
  GROUP BY substr(tdbank_imp_date, 1, 8), vopenid
),

retention AS (
  SELECT
    a.day AS day,
    COUNT(DISTINCT a.vopenid) AS dau,
    COUNT(DISTINCT CASE WHEN b.vopenid IS NOT NULL THEN a.vopenid END) AS next_day_active
  FROM daily_active a
  LEFT JOIN daily_active b
    ON b.vopenid = a.vopenid
   AND b.day = from_unixtime(unix_timestamp(a.day,'yyyyMMdd') + 86400, 'yyyyMMdd')  -- 次日
  GROUP BY a.day
)

SELECT
  day,
  dau,
  next_day_active,
  CASE WHEN dau = 0 THEN 0.0 ELSE next_day_active / dau END AS next_day_retention_rate
FROM retention
-- 如果不需要最后一天（因为没有次日），可在这里过滤：
-- WHERE day < (SELECT max(day) FROM daily_active)
ORDER BY day;