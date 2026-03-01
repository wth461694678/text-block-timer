-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--五阶登录比为测试首日注册用户，第五周活跃>=2天的玩家数/第四周活跃>=2天的玩家数
WITH 
-- 9月8日注册的用户
first_day_register AS (
    SELECT DISTINCT
        case when platid <= 1 then '手机' else 'PC' end as platid
        ,vopenid
    FROM
        ieg_tdbank::codez_dsl_Playerregister_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
        AND env = 'live'
),
fourth_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as fourth_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025092900' AND '2025100523'
    AND env = 'live' 
GROUP BY
    vopenid),
fifth_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as fifth_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025100600' AND '2025101223'
    AND env = 'live' 
GROUP BY
    vopenid)
SELECT
    count(distinct if(fourth_week_act.fourth_week_act_days >= 2, first_day_register.vopenid, null)) as fourth_week_act_player_num
    ,count(distinct if(fifth_week_act.fifth_week_act_days >= 2, first_day_register.vopenid, null)) as fifth_week_act_player_num
    ,count(distinct if(fifth_week_act.fifth_week_act_days >= 2, first_day_register.vopenid, null)) / count(distinct if(fourth_week_act.fourth_week_act_days >= 2, first_day_register.vopenid, null)) as fifth_login_rate
from
    first_day_register
LEFT JOIN
    fourth_week_act on first_day_register.vopenid = fourth_week_act.vopenid
left JOIN
    fifth_week_act on first_day_register.vopenid = fifth_week_act.vopenid