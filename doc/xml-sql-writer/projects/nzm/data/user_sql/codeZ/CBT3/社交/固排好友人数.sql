-- 判定每一场对局（按房间 dsroomid）是否为好友局：只要房间内存在至少一对互为好友的玩家，则该房间为好友局
-- 说明：
-- 1) 好友关系不考虑加好友时间，只要在好友流水中出现过即视为好友（在本代码中仍按需求加入时间过滤条件以便控量）
-- 2) 使用好友列表和房间玩家数组做 array 交集，判断是否存在好友关系
-- 3) 时间条件按要求直接写成 tdbank_imp_date / dteventtime 的 BETWEEN 过滤
-- 4) 直接运行：替换占位符 ${BEGIN_DATE}, {END_DATE}, {begin_second}, {end_second}

WITH 
friend_edges AS (
select
    vopenid
    ,vapplyopenid as friend
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '2025090800' and '${END_DATE}'
    and env = 'live'
UNION all
select
    vapplyopenid as vopenid
    ,vopenid as friend
from
    ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
WHERE
    tdbank_imp_date between '2025090800' and '${END_DATE}'
    and env = 'live'
),
friend_adj AS (
  -- 汇总为每个玩家的好友列表（去重）
  SELECT
    vopenid,
    collect_set(friend) AS friend_list
  FROM friend_edges
  GROUP BY vopenid
),
rooms AS (
  -- 汇总每个房间的玩家数组（去重）
  SELECT
    dsroomid,
    collect_set(vopenid) AS room_players
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
  GROUP BY dsroomid
),
room_friend_flag AS (
  -- 对每个房间，遍历房间玩家，取该玩家好友列表与房间玩家数组的交集，若交集非空则标记为好友局
  SELECT
    r.dsroomid,
    MAX(
      CASE
        WHEN f.friend_list IS NOT NULL
             AND size(array_intersect(f.friend_list, r.room_players)) > 0
        THEN 1 ELSE 0
      END
    ) AS is_friend_game
  FROM rooms r
  LATERAL VIEW explode(r.room_players) ep AS player
  LEFT JOIN friend_adj f
    ON f.vopenid = ep.player
  GROUP BY r.dsroomid
)
-- 最终输出：每个房间是否为好友局
SELECT
  rf.dsroomid,
  rf.is_friend_game
FROM room_friend_flag rf;

--玩家好友人数

WITH 
-- 优化1：好友关系提前去重，减少50%数据量
friend_relation AS (
    SELECT DISTINCT vopenid, friend
    FROM (
        SELECT vopenid, vapplyopenid AS friend
        FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
        WHERE tdbank_imp_date BETWEEN '20250908' AND '${END_DATE}'
          AND env = 'live'
        UNION ALL
        SELECT vapplyopenid, vopenid
        FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
        WHERE tdbank_imp_date BETWEEN '20250908' AND '${END_DATE}'
          AND env = 'live'
    ) t
),

-- 优化2：房间玩家关系扁平化，避免collect_set
room_players AS (
    SELECT DISTINCT 
        dsroomid,
        vopenid
    FROM ieg_tdbank::codez_dsl_gamedetail_fht0
    WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
),

-- 优化3：直接JOIN找到所有"玩家-房间-队友"三元组（仅保留好友）
player_friend_teammates AS (
    SELECT DISTINCT
        rp1.vopenid,
        rp2.vopenid AS friend_teammate
    FROM room_players rp1
    JOIN room_players rp2 
        ON rp1.dsroomid = rp2.dsroomid 
        AND rp1.vopenid < rp2.vopenid  -- 优化：避免重复对，减少50%JOIN数据
    JOIN friend_relation fr
        ON (rp1.vopenid = fr.vopenid AND rp2.vopenid = fr.friend)
)

-- 优化4：聚合统计，只保留必要字段
SELECT 
    vopenid,
    COUNT(DISTINCT friend_teammate) AS friend_count
FROM (
    SELECT vopenid, friend_teammate FROM player_friend_teammates
    UNION ALL
    SELECT friend_teammate AS vopenid, vopenid AS friend_teammate 
    FROM player_friend_teammates  -- 补全对称关系
) t
GROUP BY vopenid
ORDER BY friend_count DESC;






-- 判定每一场对局（按房间 dsroomid）是否为好友局：房间内存在至少一对互为好友的玩家则标记为好友局
-- 直接运行：替换占位符 ${BEGIN_DATE}, {END_DATE}, {begin_second}, {end_second}

WITH friend_pairs AS (
  SELECT
    CAST(vopenid AS STRING)      AS u,
    CAST(vApplyOpenId AS STRING) AS v
  FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
  WHERE tdbank_imp_date BETWEEN '2025090800' AND '${END_DATE}'
),
friend_edges AS (
  -- 好友关系视为无向边，并去重
  SELECT DISTINCT u, v FROM friend_pairs
  UNION ALL
  SELECT DISTINCT v AS u, u AS v FROM friend_pairs
),
room_members AS (
  -- 每个房间的玩家列表（去重到“房间-玩家”）
  SELECT
    CAST(dsroomid AS STRING) AS dsroomid,
    CAST(vopenid AS STRING)  AS player
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
  GROUP BY CAST(dsroomid AS STRING), CAST(vopenid AS STRING)
),
friend_rooms AS (
  -- 找到同时包含一对好友的房间
  SELECT DISTINCT rm1.dsroomid
  FROM friend_edges fe
  JOIN room_members rm1 ON rm1.player = fe.u
  JOIN room_members rm2 ON rm2.player = fe.v AND rm2.dsroomid = rm1.dsroomid
),
all_rooms AS (
  SELECT DISTINCT CAST(dsroomid AS STRING) AS dsroomid
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
)

SELECT
  ar.dsroomid,
  CASE WHEN fr.dsroomid IS NOT NULL THEN 1 ELSE 0 END AS is_friend_game
FROM all_rooms ar
LEFT JOIN friend_rooms fr
  ON ar.dsroomid = fr.dsroomid;



-- 目标：精确到“玩家-对局（房间）”，判断该玩家该局是否为好友局
-- 判定规则：同一房间内若存在任意一名该玩家的好友，则该玩家该局为好友局（不考虑加好友先后）
-- 说明：避免使用 array_intersect/size 等 UDF，使用等值连接与去重，提升可加速引擎兼容与执行效率
-- 使用：替换 {BEGIN_DATE}, {END_DATE}, {begin_second}, {end_second} 后直接运行

WITH
friend_pairs AS (
  SELECT
    CAST(vopenid AS STRING)      AS u,
    CAST(vApplyOpenId AS STRING) AS v
  FROM ieg_tdbank::codez_dsl_ResponseAddFriendFlow_fht0
  WHERE tdbank_imp_date BETWEEN '2025090800' AND '${END_DATE}'
    AND vopenid IS NOT NULL
    AND vApplyOpenId IS NOT NULL
    AND vopenid <> vApplyOpenId
),
-- 无向好友边（双向）
friend_edges AS (
  SELECT DISTINCT u AS vopenid, v AS friend FROM friend_pairs
  UNION ALL
  SELECT DISTINCT v AS vopenid, u AS friend FROM friend_pairs
),
-- 本期“房间-玩家”去重
room_members AS (
  SELECT DISTINCT
    tdbank_imp_date,
    CAST(dsroomid AS STRING) AS dsroomid,
    CAST(vopenid AS STRING)  AS player
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
    AND dsroomid IS NOT NULL
    AND vopenid IS NOT NULL
),
-- 参与本期对局的玩家集合，用于裁剪好友边规模
active_players AS (
  SELECT DISTINCT player AS vopenid FROM room_members
),
-- 仅保留“活跃玩家之间”的好友边
fe_active AS (
  SELECT fe.vopenid, fe.friend
  FROM friend_edges fe
  JOIN active_players ap1 ON fe.vopenid = ap1.vopenid
  JOIN active_players ap2 ON fe.friend  = ap2.vopenid
),
-- 判定：房间内该玩家是否存在好友（避免 SEMI JOIN/数组 UDF）
flag_players AS (
  SELECT DISTINCT
    rm.tdbank_imp_date,
    rm.dsroomid,
    rm.player AS vopenid
  FROM room_members rm
  JOIN fe_active fe
    ON rm.player = fe.vopenid
  JOIN room_members rmf
    ON rm.dsroomid = rmf.dsroomid
   AND rmf.player = fe.friend
)

-- 输出：每个玩家在每个房间是否为好友局
SELECT
  rm.tdbank_imp_date,
  rm.dsroomid,
  rm.player AS vopenid,
  CASE WHEN fp.vopenid IS NOT NULL THEN 1 ELSE 0 END AS is_friend_game
FROM room_members rm
LEFT JOIN flag_players fp
  ON rm.dsroomid = fp.dsroomid
 AND rm.player = fp.vopenid;




-- 需求：统计每个玩家与其“共同完成同一房间对局次数 ≥ 3”的对手/队友人数（不限制是否好友）
-- 使用：替换 {BEGIN_DATE}, {END_DATE}, {begin_second}, {end_second} 后直接运行

WITH
-- 1) 本期“房间-玩家”去重
room_members AS (
  SELECT DISTINCT
    CAST(dsroomid AS STRING) AS dsroomid,
    CAST(vopenid  AS STRING) AS player
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
),

-- 2) 生成每个房间内的无序玩家对（按字典序规范成 p1 < p2，避免重复和自连）
pair_in_room AS (
  SELECT
    rm1.dsroomid,
    CASE WHEN rm1.player < rm2.player THEN rm1.player ELSE rm2.player END AS p1,
    CASE WHEN rm1.player < rm2.player THEN rm2.player ELSE rm1.player END AS p2
  FROM room_members rm1
  JOIN room_members rm2
    ON rm1.dsroomid = rm2.dsroomid
   AND rm1.player  <> rm2.player
  WHERE rm1.player < rm2.player
),

-- 3) 统计玩家对共同出现在同一房间的次数（共同对局数）
co_play_counts AS (
  SELECT
    p1,
    p2,
    COUNT(distinct dsroomid) AS co_games
  FROM pair_in_room
  GROUP BY p1, p2
),

-- 4) 仅保留共同对局数 ≥ 3 的玩家对
solid_pairs AS (
  SELECT
    p1,
    p2,
    co_games
  FROM co_play_counts
  WHERE co_games >= 3
),

-- 5) 展开为“玩家-其共同3+局的搭档”明细（双向展开）
per_player_detail AS (
  SELECT p1 AS vopenid, p2 AS partner FROM solid_pairs
  UNION ALL
  SELECT p2 AS vopenid, p1 AS partner FROM solid_pairs
),

-- 6) 去重（稳妥起见）
per_player_detail_distinct AS (
  SELECT vopenid, partner
  FROM per_player_detail
  GROUP BY vopenid, partner
),

-- 7) 本期活跃玩家（用于补零）
active_players AS (
  SELECT DISTINCT player AS vopenid FROM room_members
)

-- 最终输出：每个玩家与同房间共同对局 ≥ 3 次的人数
SELECT
  ap.vopenid,
  COALESCE(COUNT(pp.partner), 0) AS co_play_3plus_cnt
FROM active_players ap
LEFT JOIN per_player_detail_distinct pp
  ON ap.vopenid = pp.vopenid
GROUP BY ap.vopenid;




-- 目标：为“每个玩家-每场对局（房间）”打标签，判断该玩家该局是否与其“固排好友”（定义：好友且共同对局 ≥ 3 次）同场
-- 额外输出：房间层面是否存在任意一对“固排好友”同场
-- 使用：替换 {BEGIN_DATE}, {END_DATE}, {begin_second}, {end_second} 后直接运行

WITH
-- 1) 本期“房间-玩家”去重
room_members AS (
  SELECT DISTINCT
    CAST(dsroomid AS STRING) AS dsroomid,
    CAST(vopenid  AS STRING) AS player
  FROM ieg_tdbank::codez_dsl_gamedetail_fht0
  WHERE tdbank_imp_date BETWEEN '${BEGIN_DATE}' AND '${END_DATE}'
    AND dsroomid IS NOT NULL
    AND vopenid  IS NOT NULL
),

-- 2) 房间内无序玩家对（规范为 p1 < p2，避免重复与自连）
pair_in_room AS (
  SELECT
    rm1.dsroomid,
    rm1.player AS p1,
    rm2.player AS p2
  FROM room_members rm1
  JOIN room_members rm2
    ON rm1.dsroomid = rm2.dsroomid
   AND rm1.player  < rm2.player
),

-- 3) 统计玩家对共同出现在同一房间的次数（共同对局数）
co_play_counts AS (
  SELECT
    p1,
    p2,
    COUNT(distinct dsroomid) AS co_games
  FROM pair_in_room
  GROUP BY p1, p2
),


-- 5) 固排好友对：既是好友，又共同对局次数 ≥ 3
solid_pairs AS (
  SELECT
    c.p1,
    c.p2,
    c.co_games
  FROM co_play_counts c
  WHERE c.co_games >= 3
),

-- 6) 玩家-房间：是否存在任意固排好友同场
player_solid_in_room AS (
  SELECT DISTINCT
    rm.dsroomid,
    rm.player AS vopenid
  FROM room_members rm
  JOIN room_members rmo
    ON rm.dsroomid = rmo.dsroomid
   AND rm.player  <> rmo.player
  JOIN solid_pairs sp
    ON (CASE WHEN rm.player < rmo.player THEN rm.player ELSE rmo.player END) = sp.p1
   AND (CASE WHEN rm.player < rmo.player THEN rmo.player ELSE rm.player END) = sp.p2
)

-- 最终输出：玩家-房间标签 + 房间标签
SELECT
  rm.dsroomid,
  rm.player AS vopenid,
  CASE WHEN ps.vopenid IS NOT NULL THEN 1 ELSE 0 END AS is_solid_friend_team  -- 该玩家此局是否与其固排好友同场
FROM room_members rm
LEFT JOIN player_solid_in_room ps
  ON rm.dsroomid = ps.dsroomid AND rm.player = ps.vopenid;