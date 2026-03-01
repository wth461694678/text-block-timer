with player as 
(select
    distinct
    vopenid
from
    ieg_tdbank::codez_dsl_playerregister_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026011323'
    AND env = 'live'
    and registchannel not like '59%'
),
act as 
(SELECT 
    substr(tdbank_imp_date, 1, 8) as p_date,
    vopenid
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2026011400' and '2026012623'
    AND env = 'live'
group BY
    vopenid,
    substr(tdbank_imp_date, 1, 8)
union 
SELECT 
    substr(tdbank_imp_date, 1, 8) as p_date,
    vopenid
from
    ieg_tdbank::codez_dsl_Playerlogin_fht0
WHERE
    tdbank_imp_date between '2026011400' and '2026012623'
    AND env = 'live'
    and loginresult = 0
group BY
    vopenid,
    substr(tdbank_imp_date, 1, 8)
)

SELECT 
    p.vopenid,
    MAX(CASE WHEN a.p_date = '20260114' THEN 1 ELSE 0 END) as D2,
    MAX(CASE WHEN a.p_date = '20260115' THEN 1 ELSE 0 END) as D3,
    MAX(CASE WHEN a.p_date = '20260116' THEN 1 ELSE 0 END) as D4,
    MAX(CASE WHEN a.p_date = '20260117' THEN 1 ELSE 0 END) as D5,
    MAX(CASE WHEN a.p_date = '20260118' THEN 1 ELSE 0 END) as D6,
    MAX(CASE WHEN a.p_date = '20260119' THEN 1 ELSE 0 END) as D7,
    MAX(CASE WHEN a.p_date = '20260120' THEN 1 ELSE 0 END) as D8,
    MAX(CASE WHEN a.p_date = '20260121' THEN 1 ELSE 0 END) as D9,
    MAX(CASE WHEN a.p_date = '20260122' THEN 1 ELSE 0 END) as D10,
    MAX(CASE WHEN a.p_date = '20260123' THEN 1 ELSE 0 END) as D11,
    MAX(CASE WHEN a.p_date = '20260124' THEN 1 ELSE 0 END) as D12,
    MAX(CASE WHEN a.p_date = '20260125' THEN 1 ELSE 0 END) as D13,
    MAX(CASE WHEN a.p_date = '20260126' THEN 1 ELSE 0 END) as D14,
    -- 次周留存：D8-D14任意一天活跃即为1
    MAX(CASE WHEN a.p_date BETWEEN '20260120' AND '20260126' THEN 1 ELSE 0 END) as week2_retention
FROM player p
LEFT JOIN act a ON p.vopenid = a.vopenid
GROUP BY p.vopenid



--赛季2级流水
SELECT 
    count(distinct vopenid) as player_num
from
    ieg_tdbank::codez_dsl_SeasonLevel_fht0
WHERE
    tdbank_imp_date between '2026011300' and '2026011923'
    AND env = 'live'
    and SeasonLevel >= 2