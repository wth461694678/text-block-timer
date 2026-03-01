-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--玩家组队类型（含优先级替换逻辑）
SELECT 
    GameSvrId,
    vGameAppid,
    PlatID,
    iZoneAreaID,
    vOpenID,
    vRoleID,
    vRoleName,
    iLevel,
    Env,
    GameMode,
    ModeType,
    MapID,
    TeamID,
    DungeonID,
    MatchType,
    RankLevel,
    EloScore,
    WarmLevel,
    IsConfirmMatch,
    SeasonID,
    start_time,
    AllocType,
    IsAllowedHalfJoin,
    result_time,
    Result,
    RoomID,
    MatchTime,
    TeamMemberNum,
    StartMatchType,
    RankScore,
    TeamApplySource AS original_TeamApplySource,
    
    -- 最终来源
    CASE 
        WHEN TeamApplySource = 1 AND TeamMemberNum = 1 THEN -1  -- 自建房单排
        WHEN TeamApplySource = 1 AND TeamMemberNum > 1 AND best_team_source != 1 THEN best_team_source
        ELSE TeamApplySource
    END AS final_TeamApplySource,
    
    -- 最终来源描述
    CASE 
        WHEN TeamApplySource = 1 AND TeamMemberNum = 1 THEN '自建房单排'
        WHEN TeamApplySource = 1 AND TeamMemberNum > 1 AND best_team_source != 1 THEN
            CASE best_team_source
                WHEN 2  THEN '组队平台'
                WHEN 3  THEN '社团队伍'
                WHEN 4  THEN '世界招募'
                WHEN 5  THEN '公会招募'
                WHEN 6  THEN '兴趣频道'
                WHEN 7  THEN '邀请游戏好友'
                WHEN 8  THEN '申请'
                WHEN 9  THEN '抖音一键上车'
                WHEN 10 THEN '邀请微信好友'
                WHEN 11 THEN '邀请QQ好友'
                WHEN 12 THEN '邀请社团好友'
                WHEN 13 THEN '邀请最近同玩玩家'
                WHEN 14 THEN '小程序邀请'
                WHEN 15 THEN '邀请系统推荐的好友'
                WHEN 16 THEN '邀请附近好友'
                WHEN 17 THEN '玩家头像交互面板邀请'
                WHEN 18 THEN '活动邀请'
                ELSE '未知来源'
            END
        ELSE
            CASE TeamApplySource
                WHEN 0  THEN '单排'
                WHEN 1  THEN '创建队伍'
                WHEN 2  THEN '组队平台'
                WHEN 3  THEN '社团队伍'
                WHEN 4  THEN '世界招募'
                WHEN 5  THEN '公会招募'
                WHEN 6  THEN '兴趣频道'
                WHEN 7  THEN '邀请游戏好友'
                WHEN 8  THEN '申请'
                WHEN 9  THEN '抖音一键上车'
                WHEN 10 THEN '邀请微信好友'
                WHEN 11 THEN '邀请QQ好友'
                WHEN 12 THEN '邀请社团好友'
                WHEN 13 THEN '邀请最近同玩玩家'
                WHEN 14 THEN '小程序邀请'
                WHEN 15 THEN '邀请系统推荐的好友'
                WHEN 16 THEN '邀请附近好友'
                WHEN 17 THEN '玩家头像交互面板邀请'
                WHEN 18 THEN '活动邀请'
                ELSE '未知来源'
            END
    END AS final_TeamApplySourceDesc

FROM (
    SELECT 
        t1.*,
        FIRST_VALUE(TeamApplySource) OVER (
            PARTITION BY RoomID, MapID, TeamID 
            ORDER BY 
                CASE TeamApplySource
                    WHEN 7  THEN 1   -- 邀请游戏好友
                    WHEN 12 THEN 2   -- 邀请社团好友
                    WHEN 13 THEN 3   -- 邀请最近同玩玩家
                    WHEN 10 THEN 4   -- 邀请微信好友
                    WHEN 11 THEN 5   -- 邀请QQ好友
                    WHEN 9  THEN 6   -- 抖音一键上车
                    WHEN 14 THEN 7   -- 小程序邀请
                    WHEN 15 THEN 8   -- 邀请系统推荐的好友
                    WHEN 16 THEN 9   -- 邀请附近好友
                    WHEN 17 THEN 10  -- 玩家头像交互面板邀请
                    WHEN 8  THEN 11  -- 申请
                    WHEN 3  THEN 12  -- 社团队伍
                    WHEN 2  THEN 13  -- 组队平台
                    WHEN 4  THEN 14  -- 世界招募
                    WHEN 5  THEN 15  -- 公会招募
                    WHEN 6  THEN 16  -- 兴趣频道
                    WHEN 18 THEN 17  -- 活动邀请
                    WHEN 1  THEN 999 -- 创建队伍
                    ELSE 1000
                END
        ) AS best_team_source
    FROM (
        SELECT 
            s.GameSvrId,
            s.vGameAppid,
            s.PlatID,
            s.iZoneAreaID,
            s.vOpenID,
            s.vRoleID,
            s.vRoleName,
            s.iLevel,
            s.Env,
            s.GameMode,
            s.ModeType,
            s.MapID,
            s.TeamID,
            s.DungeonID,
            s.MatchType,
            s.RankLevel,
            s.EloScore,
            s.WarmLevel,
            s.IsConfirmMatch,
            s.SeasonID,
            s.dtEventTime         AS start_time,
            s.AllocType,
            s.TeamApplySource,
            s.IsAllowedHalfJoin,
            r.dtEventTime         AS result_time,
            r.Result,
            r.RoomID,
            r.MatchTime,
            r.TeamMemberNum,
            r.StartMatchType,
            r.RankScore
        FROM (
            SELECT 
                GameSvrId,
                dtEventTime,
                vGameAppid,
                PlatID,
                iZoneAreaID,
                vOpenID,
                vRoleID,
                vRoleName,
                iLevel,
                Env,
                GameMode,
                ModeType,
                MapID,
                TeamID,
                DungeonID,
                AllocType,
                MatchType,
                RankLevel,
                EloScore,
                WarmLevel,
                IsConfirmMatch,
                TeamApplySource,
                SeasonID,
                IsAllowedHalfJoin
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
        ) s
        JOIN (
            SELECT 
                GameSvrId,
                dtEventTime,
                vGameAppid,
                PlatID,
                iZoneAreaID,
                vOpenID,
                vRoleID,
                vRoleName,
                iLevel,
                Env,
                GameMode,
                ModeType,
                MapID,
                TeamID,
                Result,
                RoomID,
                MatchTime,
                DungeonID,
                TeamMemberNum,
                StartMatchType,
                MatchType,
                RankLevel,
                EloScore,
                WarmLevel,
                IsConfirmMatch,
                RankScore,
                SeasonID
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
        ) r ON 
            s.vRoleID = r.vRoleID
            AND s.TeamID = r.TeamID
            AND unix_timestamp(s.dtEventTime) BETWEEN 
                (unix_timestamp(r.dtEventTime) - r.MatchTime/1000 - 1)
                AND unix_timestamp(r.dtEventTime)
    ) t1
) t2



--玩家组队类型（简洁高效版）
SELECT 
    t1.*,
    -- 最终来源
    CASE 
        WHEN t1.TeamApplySource = 1 AND t1.TeamMemberNum = 1 THEN -1
        WHEN t1.TeamApplySource = 1 AND t1.TeamMemberNum > 1 AND tp.best_source IS NOT NULL THEN tp.best_source
        ELSE t1.TeamApplySource
    END AS final_TeamApplySource,
    
    -- 最终来源描述
    CASE 
        CASE 
            WHEN t1.TeamApplySource = 1 AND t1.TeamMemberNum = 1 THEN -1
            WHEN t1.TeamApplySource = 1 AND t1.TeamMemberNum > 1 AND tp.best_source IS NOT NULL THEN tp.best_source
            ELSE t1.TeamApplySource
        END
        WHEN -1 THEN '自建房单排'
        WHEN 0  THEN '退出'
        WHEN 1  THEN '创建队伍'
        WHEN 2  THEN '组队平台'
        WHEN 3  THEN '社团队伍'
        WHEN 4  THEN '世界招募'
        WHEN 5  THEN '公会招募'
        WHEN 6  THEN '兴趣频道'
        WHEN 7  THEN '邀请游戏好友'
        WHEN 8  THEN '申请'
        WHEN 9  THEN '抖音一键上车'
        WHEN 10 THEN '邀请微信好友'
        WHEN 11 THEN '邀请QQ好友'
        WHEN 12 THEN '邀请社团好友'
        WHEN 13 THEN '邀请最近同玩玩家'
        WHEN 14 THEN '小程序邀请'
        WHEN 15 THEN '邀请系统推荐的好友'
        WHEN 16 THEN '邀请附近好友'
        WHEN 17 THEN '玩家头像交互面板邀请'
        WHEN 18 THEN '活动邀请'
        ELSE '未知来源'
    END AS final_TeamApplySourceDesc

FROM (
    SELECT 
        s.GameSvrId,
        s.vGameAppid,
        s.PlatID,
        s.iZoneAreaID,
        s.vOpenID,
        s.vRoleID,
        s.vRoleName,
        s.iLevel,
        s.Env,
        s.GameMode,
        s.ModeType,
        s.MapID,
        s.TeamID,
        s.DungeonID,
        s.MatchType,
        s.RankLevel,
        s.EloScore,
        s.WarmLevel,
        s.IsConfirmMatch,
        s.SeasonID,
        s.dtEventTime AS start_time,
        s.AllocType,
        s.TeamApplySource,
        s.IsAllowedHalfJoin,
        r.dtEventTime AS result_time,
        r.Result,
        r.RoomID,
        r.MatchTime,
        r.TeamMemberNum,
        r.StartMatchType,
        r.RankScore
    FROM (
        SELECT *, unix_timestamp(dtEventTime) AS start_ts
        FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
        WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
    ) s
    JOIN (
        SELECT *, unix_timestamp(dtEventTime) AS result_ts, MatchTime/1000 AS match_sec
        FROM ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
        WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
    ) r ON 
        s.vRoleID = r.vRoleID
        AND s.TeamID = r.TeamID
        AND s.start_ts BETWEEN r.result_ts - r.match_sec - 1 AND r.result_ts
) t1
LEFT JOIN (
    -- 每队最优来源（聚合一次计算）
    SELECT 
        RoomID, MapID, TeamID,
        CAST(SPLIT(MIN(CONCAT(LPAD(CAST(pri AS STRING),4,'0'),'|',CAST(TeamApplySource AS STRING))),'\\|')[1] AS INT) AS best_source
    FROM (
        SELECT 
            r.RoomID, s.MapID, s.TeamID, s.TeamApplySource,
            CASE s.TeamApplySource
                WHEN 7 THEN 1 WHEN 12 THEN 2 WHEN 13 THEN 3 WHEN 10 THEN 4 WHEN 11 THEN 5
                WHEN 9 THEN 6 WHEN 14 THEN 7 WHEN 15 THEN 8 WHEN 16 THEN 9 WHEN 17 THEN 10
                WHEN 8 THEN 11 WHEN 3 THEN 12 WHEN 2 THEN 13 WHEN 4 THEN 14 WHEN 5 THEN 15
                WHEN 6 THEN 16 WHEN 18 THEN 17 ELSE 1000
            END AS pri
        FROM (
            SELECT vRoleID, TeamID, MapID, TeamApplySource, unix_timestamp(dtEventTime) AS start_ts
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
              AND TeamApplySource NOT IN (0, 1)  -- 只看有效来源
        ) s
        JOIN (
            SELECT vRoleID, TeamID, RoomID, unix_timestamp(dtEventTime) AS result_ts, MatchTime/1000 AS match_sec
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
        ) r ON s.vRoleID = r.vRoleID AND s.TeamID = r.TeamID
           AND s.start_ts BETWEEN r.result_ts - r.match_sec - 1 AND r.result_ts
    ) x
    GROUP BY RoomID, MapID, TeamID
) tp ON t1.RoomID = tp.RoomID AND t1.MapID = tp.MapID AND t1.TeamID = tp.TeamID





--组队类型逻辑验证
SELECT 
    '${YYYYMMDD}' AS p_date,
    GameSvrId,
    vGameAppid,
    PlatID,
    iZoneAreaID,
    vOpenID,
    vRoleID,
    vRoleName,
    iLevel,
    Env,
    GameMode,
    ModeType,
    MapID,
    TeamID,
    DungeonID,
    MatchType,
    RankLevel,
    EloScore,
    WarmLevel,
    IsConfirmMatch,
    SeasonID,
    start_time,
    AllocType,
    IsAllowedHalfJoin,
    result_time,
    Result,
    RoomID,
    MatchTime,
    TeamMemberNum,
    StartMatchType,
    RankScore,
    TeamApplySource AS original_TeamApplySource,
    
    -- 最终来源
    CASE 
        WHEN TeamApplySource = 1 AND TeamMemberNum = 1 THEN -1  -- 自建房单排
        WHEN TeamApplySource = 1 AND TeamMemberNum > 1 AND best_team_source != 1 THEN best_team_source
        ELSE TeamApplySource
    END AS final_TeamApplySource,
    
    -- 最终来源描述
    CASE 
        WHEN TeamApplySource = 1 AND TeamMemberNum = 1 THEN '自建房单排'
        WHEN TeamApplySource = 1 AND TeamMemberNum > 1 AND best_team_source != 1 THEN
            CASE best_team_source
                WHEN 2  THEN '组队平台'
                WHEN 3  THEN '社团队伍'
                WHEN 4  THEN '世界招募'
                WHEN 5  THEN '公会招募'
                WHEN 6  THEN '兴趣频道'
                WHEN 7  THEN '邀请游戏好友'
                WHEN 8  THEN '申请'
                WHEN 9  THEN '抖音一键上车'
                WHEN 10 THEN '邀请微信好友'
                WHEN 11 THEN '邀请QQ好友'
                WHEN 12 THEN '邀请社团好友'
                WHEN 13 THEN '邀请最近同玩玩家'
                WHEN 14 THEN '小程序邀请'
                WHEN 15 THEN '邀请系统推荐的好友'
                WHEN 16 THEN '邀请附近好友'
                WHEN 17 THEN '玩家头像交互面板邀请'
                WHEN 18 THEN '活动邀请'
                ELSE '未知来源'
            END
        ELSE
            CASE TeamApplySource
                WHEN 0  THEN '单排'
                WHEN 1  THEN '创建队伍'
                WHEN 2  THEN '组队平台'
                WHEN 3  THEN '社团队伍'
                WHEN 4  THEN '世界招募'
                WHEN 5  THEN '公会招募'
                WHEN 6  THEN '兴趣频道'
                WHEN 7  THEN '邀请游戏好友'
                WHEN 8  THEN '申请'
                WHEN 9  THEN '抖音一键上车'
                WHEN 10 THEN '邀请微信好友'
                WHEN 11 THEN '邀请QQ好友'
                WHEN 12 THEN '邀请社团好友'
                WHEN 13 THEN '邀请最近同玩玩家'
                WHEN 14 THEN '小程序邀请'
                WHEN 15 THEN '邀请系统推荐的好友'
                WHEN 16 THEN '邀请附近好友'
                WHEN 17 THEN '玩家头像交互面板邀请'
                WHEN 18 THEN '活动邀请'
                ELSE '未知来源'
            END
    END AS final_TeamApplySourceDesc

FROM (
    SELECT 
        t1.*,
        FIRST_VALUE(TeamApplySource) OVER (
            PARTITION BY RoomID, MapID, TeamID 
            ORDER BY 
                CASE TeamApplySource
                    WHEN 7  THEN 1   -- 邀请游戏好友
                    WHEN 12 THEN 2   -- 邀请社团好友
                    WHEN 13 THEN 3   -- 邀请最近同玩玩家
                    WHEN 10 THEN 4   -- 邀请微信好友
                    WHEN 11 THEN 5   -- 邀请QQ好友
                    WHEN 9  THEN 6   -- 抖音一键上车
                    WHEN 14 THEN 7   -- 小程序邀请
                    WHEN 15 THEN 8   -- 邀请系统推荐的好友
                    WHEN 16 THEN 9   -- 邀请附近好友
                    WHEN 17 THEN 10  -- 玩家头像交互面板邀请
                    WHEN 8  THEN 11  -- 申请
                    WHEN 3  THEN 12  -- 社团队伍
                    WHEN 2  THEN 13  -- 组队平台
                    WHEN 4  THEN 14  -- 世界招募
                    WHEN 5  THEN 15  -- 公会招募
                    WHEN 6  THEN 16  -- 兴趣频道
                    WHEN 18 THEN 17  -- 活动邀请
                    WHEN 1  THEN 999 -- 创建队伍
                    ELSE 1000
                END
        ) AS best_team_source
    FROM (
        SELECT 
            s.GameSvrId,
            s.vGameAppid,
            s.PlatID,
            s.iZoneAreaID,
            s.vOpenID,
            s.vRoleID,
            s.vRoleName,
            s.iLevel,
            s.Env,
            s.GameMode,
            s.ModeType,
            s.MapID,
            s.TeamID,
            s.DungeonID,
            s.MatchType,
            s.RankLevel,
            s.EloScore,
            s.WarmLevel,
            s.IsConfirmMatch,
            s.SeasonID,
            s.dtEventTime         AS start_time,
            s.AllocType,
            s.TeamApplySource,
            s.IsAllowedHalfJoin,
            r.dtEventTime         AS result_time,
            r.Result,
            r.RoomID,
            r.MatchTime,
            r.TeamMemberNum,
            r.StartMatchType,
            r.RankScore
        FROM (
            SELECT 
                GameSvrId,
                dtEventTime,
                vGameAppid,
                PlatID,
                iZoneAreaID,
                vOpenID,
                vRoleID,
                vRoleName,
                iLevel,
                Env,
                GameMode,
                ModeType,
                MapID,
                TeamID,
                DungeonID,
                AllocType,
                MatchType,
                RankLevel,
                EloScore,
                WarmLevel,
                IsConfirmMatch,
                TeamApplySource,
                SeasonID,
                IsAllowedHalfJoin
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
        ) s
        JOIN (
            SELECT 
                GameSvrId,
                dtEventTime,
                vGameAppid,
                PlatID,
                iZoneAreaID,
                vOpenID,
                vRoleID,
                vRoleName,
                iLevel,
                Env,
                GameMode,
                ModeType,
                MapID,
                TeamID,
                Result,
                RoomID,
                MatchTime,
                DungeonID,
                TeamMemberNum,
                StartMatchType,
                MatchType,
                RankLevel,
                EloScore,
                WarmLevel,
                IsConfirmMatch,
                RankScore,
                SeasonID
            FROM ieg_tdbank::codez_dsl_RoomMatchAllocResult_fht0
            WHERE tdbank_imp_date BETWEEN '${YYYYMMDD}00' AND '${YYYYMMDD}23'
        ) r ON 
            s.vRoleID = r.vRoleID
            AND s.TeamID = r.TeamID
            AND unix_timestamp(s.dtEventTime) BETWEEN 
                (unix_timestamp(r.dtEventTime) - r.MatchTime/1000 - 1)
                AND unix_timestamp(r.dtEventTime)
    ) t1
) t2





--好友人数分布


--好友申请来源分布&成功率




--公会人数占比
select
    Afternum
    ,count(unionid) as union_cnt
from
(select
unionid
,AfterNum
from
(select
    UnionId
    ,AfterNum
    ,row_number()over(partition by UnionId order by dtEventTime desc) as rn
from
(select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_CreateUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416'
union all
select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_ApplyJoinUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416'
union all
select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_JoinUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416'
union all
select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_QuitUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416'
union all
select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_DismissUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416'))
where rn = 1)group by
AfterNum



select
count(distinct UnionId)
from
(select
    UnionId
    ,AfterNum
    ,dtEventTime
from
    ieg_tdbank::codez_dsl_CreateUnion_fht0
WHERE tdbank_imp_date BETWEEN '2026011300' and '2026011416')



select
    State
    ,count(distinct vopenid)
from
    ieg_tdbank::codez_dsl_ReceiveMail_fht0
WHERE tdbank_imp_date BETWEEN '2026011500' and '2026011523'
and title = '充值失败补发'
group by
    state





(SELECT
    dteventtime,
    vopenid,
        TeamApplySource
    FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0  
    WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011923'  
    AND CAST(vRoleID AS BIGINT) >> 63 <= 0 
    and vopenid = 80538554422454)start
join
(select
    vopenid
    ,dteventtime
    ,MatchTime
    ,roomid 
FROM ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0  
            WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011923' 
            and vopenid = 80538554422454
            and roomid = 	
72074390107537541) result on start.vopenid = result.vopenid and start.dteventtime+matchtime = result.dteventtime



SELECT 
    start.*
    ,result.*
FROM (
    SELECT
        *
    FROM ieg_tdbank::codez_dsl_RoomMatchAllocStart_fht0  
    WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011923'  
        AND CAST(vRoleID AS BIGINT) >> 63 <= 0 
        AND vopenid = '80538554422454'
        and dteventtime = '2026-01-19 22:34:42'
) start
JOIN (
    SELECT
        *
    FROM ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0  
    WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011923' 
        --AND vopenid = '80538554422454'
        AND roomid = '72074390107537541'
) result 
ON start.vopenid = result.vopenid 




SELECT

    MatchTime
    ,count(distinct roomid)
FROM ieg_tdbank::codez_dsl_RoomMatchAllocresult_fht0  
WHERE tdbank_imp_date BETWEEN '2026011300' AND '2026011923' 
group by MatchTime




selcet CAST(9297819568192045067 AS BIGINT) >> 63