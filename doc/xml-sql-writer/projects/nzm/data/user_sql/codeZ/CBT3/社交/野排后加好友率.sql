-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--玩家战斗情况情况
SELECT
    vopenid --玩家ID
    ,imodetype --地图类型
    ,dteventtime --对局结束时间
    ,dsroomid
FROM
   ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025090800' and '2025091423'
   and env = 'live'
union all
SELECT
    vopenid
    ,imodetype
    ,dteventtime
    ,dsroomid
from
   ieg_tdbank::codez_dsl_DropOutDetail_fht0
WHERE
   tdbank_imp_date BETWEEN '2025090800' and '2025091423'
   and env = 'live'

--加好友行为
select
    vopenid --被申请者id
    ,dteventtime --加好友时间
    ,vApplyOpenId --申请者id
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
where
    tdbank_imp_date BETWEEN '2025090800' and '2025091423'
    and env = 'live'
    and iFriendApplyResult = 0

--野排后加好友率
WITH 
-- 1. 合并对局流水
battle_data AS (
    SELECT
        vopenid,
        imodetype,
        dteventtime,
        dsroomid
    FROM ieg_tdbank::codez_dsl_GameDetail_fht0
    WHERE tdbank_imp_date BETWEEN '20250908' AND '20250914'
        AND env = 'live'
    UNION ALL
    SELECT
        vopenid,
        imodetype,
        dteventtime,
        dsroomid
    FROM ieg_tdbank::codez_dsl_DropOutDetail_fht0
    WHERE tdbank_imp_date BETWEEN '20250908' AND '20250914'
        AND env = 'live'
),

-- 2. 找出同局的玩家配对
battle_pairs AS (
    SELECT
        t1.vopenid AS player1,
        t2.vopenid AS player2,
        t1.imodetype,
        t1.dsroomid,
        MAX(t1.dteventtime) AS battle_end_time
    FROM battle_data t1
    JOIN battle_data t2
        ON t1.dsroomid = t2.dsroomid
        AND t1.vopenid < t2.vopenid
    GROUP BY t1.vopenid, t2.vopenid, t1.imodetype, t1.dsroomid
),

-- 3. 加好友数据
friend_add AS (
    SELECT
        vopenid AS receiver_id,
        vApplyOpenId AS sender_id,
        dteventtime AS add_time
    FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
    WHERE tdbank_imp_date BETWEEN '20250908' AND '20250914'
        AND env = 'live'
        AND iFriendApplyResult = 0
),

-- 4. 匹配对局后的加好友行为（考虑双向）
battle_with_friend AS (
    SELECT
        bp.imodetype,
        bp.dsroomid,
        bp.player1,
        bp.player2,
        bp.battle_end_time,
        CASE
            WHEN fa1.add_time IS NOT NULL OR fa2.add_time IS NOT NULL
            THEN 1
            ELSE 0
        END AS is_friend_added
    FROM battle_pairs bp
    LEFT JOIN friend_add fa1
        ON bp.player1 = fa1.sender_id
        AND bp.player2 = fa1.receiver_id
        AND fa1.add_time > bp.battle_end_time
        AND unix_timestamp(fa1.add_time) <= unix_timestamp(bp.battle_end_time) + 86400
    LEFT JOIN friend_add fa2
        ON bp.player2 = fa2.sender_id
        AND bp.player1 = fa2.receiver_id
        AND fa2.add_time > bp.battle_end_time
        AND unix_timestamp(fa2.add_time) <= unix_timestamp(bp.battle_end_time) + 86400
)

-- 5. 计算各地图类型的加好友比例
SELECT
    imodetype AS imodetype_id,
    CASE imodetype
        WHEN 0 THEN '无'
        WHEN 64 THEN '爆破pvp'
        WHEN 65 THEN '机甲pvp'
        WHEN 66 THEN '太空站'
        WHEN 70 THEN '团队淘汰竞赛'
        WHEN 128 THEN 'PVE Begin'
        WHEN 130 THEN '备类测试图'
        WHEN 131 THEN '故事模式'
        WHEN 132 THEN '挑战模式'
        WHEN 133 THEN '苍茫本'
        WHEN 134 THEN '猎场'
        WHEN 135 THEN '月球防御战'
        WHEN 136 THEN '时空追猎'
        WHEN 137 THEN '多人副本'
        WHEN 138 THEN '主线玩法'
        WHEN 139 THEN '塔防'
        WHEN 140 THEN '爬塔模式'
        WHEN 141 THEN '猎场排位'
        WHEN 191 THEN 'PVE End'
        WHEN 192 THEN '开放世界'
        WHEN 193 THEN '位面'
        WHEN 4096 THEN '64x64'
        ELSE '未知'
    END AS imodetype_name,
    COUNT(DISTINCT dsroomid) AS total_battles,
    COUNT(DISTINCT CONCAT(dsroomid,'_',player1, '_', player2)) AS total_pairs,
    SUM(is_friend_added) AS friend_added_pairs,
    ROUND(100.0 * SUM(is_friend_added) / COUNT(*), 2) AS friend_add_ratio
FROM battle_with_friend
GROUP BY imodetype
ORDER BY imodetype;


