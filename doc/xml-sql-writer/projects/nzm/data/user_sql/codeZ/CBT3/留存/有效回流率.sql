-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
【有效回流率】注册首周活跃>=2天的玩家有7.3万，版本更新后首周活跃>=2天的玩家有3.2万，有效回流率为44.2%（PC38.7%，手游46.2%）

备注：有效回流率为测试首日注册用户，版本更新后首周(0929-1005)活跃>=2天的玩家数/注册首周(0908~0914)活跃>=2天的玩家数



--有效回流率为测试首日注册用户，版本更新后首周活跃>=2天的玩家数/注册首周活跃>=2天的玩家数
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
first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
    AND env = 'live' 
    --and vopenid in (SELECT vopenid FROM first_day_register)
GROUP BY
    vopenid),
update_first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as update_first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025092900' AND '2025100523'
    AND env = 'live' 
GROUP BY
    vopenid)

SELECT
    platid
    ,count(distinct if(first_week_act.first_week_act_days >= 2, first_day_register.vopenid, null)) as first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 2, first_day_register.vopenid, null)) as update_first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 2, first_day_register.vopenid, null)) / count(distinct if(first_week_act.first_week_act_days >= 2, first_day_register.vopenid, null)) as eff_return_rate
from
    first_day_register
LEFT JOIN
    first_week_act on first_day_register.vopenid = first_week_act.vopenid
left JOIN
    update_first_week_act on first_day_register.vopenid = update_first_week_act.vopenid
GROUP BY
    platid

--有效回流率为测试首日注册用户，版本更新后首周活跃>=2天的玩家数/注册首周活跃>=2天的玩家数，限制分母包含分子
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
first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
    AND env = 'live' 
GROUP BY
    vopenid),
update_first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as update_first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025092900' AND '2025100523'
    AND env = 'live' 
GROUP BY
    vopenid)

SELECT
    count(distinct if(first_week_act.first_week_act_days >= 2, first_day_register.vopenid, null)) as first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 2, first_day_register.vopenid, null)) as update_first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 2, first_day_register.vopenid, null)) / count(distinct if(first_week_act.first_week_act_days >= 2, first_day_register.vopenid, null)) as eff_return_rate
from
    first_week_act
JOIN
    first_day_register on first_week_act.vopenid = first_day_register.vopenid
left JOIN
    update_first_week_act on first_week_act.vopenid = update_first_week_act.vopenid
-- where
--     first_week_act.first_week_act_days >= 2
GROUP BY
    platid



--留存验证
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
first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
    AND env = 'live' 
    --and vopenid in (SELECT vopenid FROM first_day_register)
GROUP BY
    vopenid),
update_first_week_act AS (
SELECT
    vopenid
    ,count(DISTINCT substr(tdbank_imp_date,1,8)) as update_first_week_act_days
FROM
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date BETWEEN '2025100700' AND '2025100723'
    AND env = 'live' 
    --and vopenid in (SELECT vopenid FROM first_day_register)
GROUP BY
    vopenid)

SELECT
    count(distinct if(first_week_act.first_week_act_days >= 1, first_day_register.vopenid, null)) as first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 1, first_day_register.vopenid, null)) as update_first_week_act_player_num
    ,count(distinct if(update_first_week_act.update_first_week_act_days >= 1, first_day_register.vopenid, null)) / count(distinct if(first_week_act.first_week_act_days >= 1, first_day_register.vopenid, null)) as eff_return_rate
from
    first_day_register
LEFT JOIN
    first_week_act on first_day_register.vopenid = first_week_act.vopenid
left JOIN
    update_first_week_act on first_day_register.vopenid = update_first_week_act.vopenid
