-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--赛季天赋上报



--平均赛季等级
select
    count(distinct talent.vopenid)
    ,avg(ilevel)
from
(select
   distinct 
   vopenid
   ,ilevel
from
   dwd_sr_codez_seasontalent_di
where
   dteventtime between '2025-07-28 00:00:00' AND '2025-07-28 23:59:59'
   and op = 5
   and env = 'live')talent
join
(select
   *
from
   codez_vopenid_ce20250728)codezz on talent.vopenid = codezz.vopenid



--平均赛季天赋等级
select
   avg(sum_talentlevel)
from
(select
   vopenid
   ,sum(talentlevel) as sum_talentlevel
from
   dwd_sr_codez_seasontalent_di
where
   dteventtime between '2025-07-28 00:00:00' AND '2025-07-28 00:00:00'
   and op = 5
   and env = 'live'
group by
    vopenid)talent
join
(select
   *
from
   codez_vopenid_ce20250728)codezz on talent.vopenid = codezz.vopenid


--平均分支总等级
-- 平均分支总等级
SELECT
    AVG(branch_total_level_1) AS avg_talentlevel_1,
    AVG(branch_total_level_2) AS avg_talentlevel_2,
    AVG(branch_total_level_3) AS avg_talentlevel_3,
    AVG(branch_total_level_4) AS avg_talentlevel_4,
    AVG(branch_total_level_5) AS avg_talentlevel_5
FROM (
    SELECT
        t.vopenid,
        SUM(CASE WHEN branch = 1 THEN talentlevel ELSE 0 END) AS branch_total_level_1,
        SUM(CASE WHEN branch = 2 THEN talentlevel ELSE 0 END) AS branch_total_level_2,
        SUM(CASE WHEN branch = 3 THEN talentlevel ELSE 0 END) AS branch_total_level_3,
        SUM(CASE WHEN branch = 4 THEN talentlevel ELSE 0 END) AS branch_total_level_4,
        SUM(CASE WHEN branch = 5 THEN talentlevel ELSE 0 END) AS branch_total_level_5
    FROM (
        SELECT
            vopenid,
            talentlevel,
            CAST(FLOOR(talentid / 10000) - 10 AS INT) AS branch
        FROM dwd_sr_codez_seasontalent_di
        WHERE dteventtime BETWEEN '2025-07-28 00:00:00' AND '2025-07-28 23:59:59'
          AND op = 5
          AND env = 'live'
    ) t
    JOIN codez_vopenid_ce20250728 c
      ON t.vopenid = c.vopenid
    GROUP BY t.vopenid
) AS player_branch_total;


--天赋偏好
select
    

(
    SELECT
        t.vopenid,
        SUM(CASE WHEN branch = 1 THEN talentlevel ELSE 0 END) AS branch_total_level_1,
        SUM(CASE WHEN branch = 2 THEN talentlevel ELSE 0 END) AS branch_total_level_2,
        SUM(CASE WHEN branch = 3 THEN talentlevel ELSE 0 END) AS branch_total_level_3,
        SUM(CASE WHEN branch = 4 THEN talentlevel ELSE 0 END) AS branch_total_level_4,
        SUM(CASE WHEN branch = 5 THEN talentlevel ELSE 0 END) AS branch_total_level_5
    FROM (
        SELECT
            vopenid,
            talentlevel,
            CAST(FLOOR(talentid / 10000) - 10 AS INT) AS branch
        FROM dwd_sr_codez_seasontalent_di
        WHERE dteventtime BETWEEN '2025-07-28 00:00:00' AND '2025-07-28 23:59:59'
          AND op = 5
          AND env = 'live'
    ) t
    JOIN codez_vopenid_ce20250728 c
      ON t.vopenid = c.vopenid
    GROUP BY t.vopenid
) AS player_branch_total;
