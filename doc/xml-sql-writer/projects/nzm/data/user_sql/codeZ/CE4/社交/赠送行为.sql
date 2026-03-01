-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

--赠送参与情况
select
    logout.p_date
    ,count(distinct logout.vopenid) as user_count
    ,count(distinct if(season_collection.vopenid is not null,logout.vopenid,null)) as season_collection_user_count
    ,count(distinct if(season_collection.vopenid is not null,logout.vopenid,null))/count(distinct logout.vopenid) as season_collection_rate
from
(select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
union
select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
)logout
join
(select distinct vopenid from dim_codez_vopenid_whitelist_ce20251120) whitelist on logout.vopenid = whitelist.vopenid 
left join
(SELECT
    distinct
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
)season_collection on logout.vopenid = season_collection.vopenid and logout.p_date = season_collection.p_date
group by
    logout.p_date


--道具赠送情况
select
    propid
    ,count(1) as prop_count
from
(select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
)logout
join
(select distinct vopenid from dim_codez_vopenid_whitelist_ce20251120) whitelist on logout.vopenid = whitelist.vopenid 
left join
(SELECT
    PropId
    ,vopenid
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
   and Operate = 1
)season_collection on logout.vopenid = season_collection.vopenid
group by
    propid


--索要次数分布
select
    propid
    ,count(1) as prop_count
from
(select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
)logout
join
(select distinct vopenid from dim_codez_vopenid_whitelist_ce20251120) whitelist on logout.vopenid = whitelist.vopenid 
left join
(SELECT
    PropId
    ,vopenid
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
   and Operate = 2
)season_collection on logout.vopenid = season_collection.vopenid
group by
    propid



--最多操作次数
select
    operate
    ,max(Operate_times)
from
(select
    substr(tdbank_imp_date,1,8) as p_date
    ,vopenid
from
    ieg_tdbank::codez_dsl_Playerregister_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
)logout
join
(select distinct vopenid from dim_codez_vopenid_whitelist_ce20251120) whitelist on logout.vopenid = whitelist.vopenid 
left join
(SELECT
    vopenid
    ,operate
    ,count(1) as Operate_times
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
group by
    vopenid
    ,operate
)season_collection on logout.vopenid = season_collection.vopenid
group by
    operate

--索要五次玩家索要记录
select
    *
from
    ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
   and Operate = 2
   and vopenid = 56162616591600
   
in (select distinct vopenid from(SELECT
    vopenid
    ,count(1) as Operate_times
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025112000' and '2025112323'
   and Operate = 2
   and vopenid in (select distinct vopenid from dim_codez_vopenid_whitelist_ce20251120)
group by
    vopenid
having Operate_times >= 5))


--测试记录查询
SELECT
    *
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025111200' and '2025111223'
   and vopenid in (select distinct vopenid from ieg_tdbank::codez_dsl_Playerlogout_fht0 where tdbank_imp_date between '2025111200' and '2025111223' and vrolename = '叫妈妈改名后')

--测试记录查询
SELECT
    *
FROM
   ieg_tdbank::codez_dsl_SeasonCollectionOperate_fht0
where
   tdbank_imp_date between '2025111200' and '2025111223'
   and vopenid in (select distinct vopenid from ieg_tdbank::codez_dsl_Playerlogout_fht0 where tdbank_imp_date between '2025111200' and '2025111223' and vrolename = '行不行细狗')




    SELECT
        param1
        ,param2
    FROM ieg_tdbank.codez_dsl_excelconfiginfo_fht0
    WHERE
        tdbank_imp_date BETWEEN '2025090800' AND '2025090823'
        AND branchpath = 'cbt3'
        AND configname = 'CommonItemTable'



SELECT
        distinct branchpath
    FROM ieg_tdbank.codez_dsl_excelconfiginfo_fht0
    WHERE
        tdbank_imp_date > '2025112000' AND '2025090823'
        AND branchpath = 'main_code'
        AND configname = 'CommonItemTable'