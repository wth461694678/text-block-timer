-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

select
    DungeonID
    ,areaid
    ,count(distinct vopenid,roomid) as user_cnt 
from
  ieg_tdbank::codez_dsl_playerhuntingfieldpartitiongamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
group by
    DungeonID
    ,areaid
order by
    DungeonID
    ,areaid


--对局表
select
    iDungeonID
    ,count(distinct vopenid,dsroomid) as user_cnt
from
(select
    vopenid
    ,dsroomid
    ,iDungeonID
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
union
select
    vopenid
    ,dsroomid
    ,iDungeonID
    ,iDuration
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
)
group by
    idungeonid
order by
    idungeonid


--问题定位
select
    *
from
(select
    vopenid
    ,dsroomid
    ,iDungeonID
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011
union
select
    vopenid
    ,dsroomid
    ,iDungeonID
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011
        --and iDropOutAreaID <>0
)
where
    dsroomid not in (select distinct roomid from ieg_tdbank::codez_dsl_playerhuntingfieldpartitiongamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323' and DungeonID = 2004011
        AND env = 'live')




select
    count(distinct vopenid,dsroomid) as desk_num
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
where
    tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
    AND env = 'live'
        and iDungeonID = 2004011
        and iDropOutAreaID <>0




select
    *
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011
        and dsroomid in (select
    dsroomid
from
(select
    vopenid
    ,dsroomid
    ,iDungeonID
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011
union
select
    vopenid
    ,dsroomid
    ,iDungeonID
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011
        --and iDropOutAreaID <>0
)
where
    dsroomid not in (select distinct roomid from ieg_tdbank::codez_dsl_playerhuntingfieldpartitiongamedetail_fht0
    WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323' and DungeonID = 2004011
        AND env = 'live'))




select
    *
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323'
        AND env = 'live'
        and iDungeonID = 2004011


---最后一个子关卡时长
select
    hunt.*
    ,dropout.*
from
(select
    vopenid
    ,roomid
    ,AreaID
    ,UsedTime
from
    ieg_tdbank::codez_dsl_playerhuntingfieldpartitiongamedetail_fht0
WHERE
        tdbank_imp_date BETWEEN '2026011300' AND '2026011323' and DungeonID = 2004011
        AND env = 'live'
)hunt 
join
(select
    vopenid
    ,dsroomid
    ,iDuration
from    ieg_tdbank::codez_dsl_dropoutdetail_fht0
where
    tdbank_imp_date BETWEEN '2026011300' AND '2026011323') dropout on hunt.vopenid = dropout.vopenid and hunt.roomid = dropout.dsroomid
order by
hunt.roomid
    ,hunt.AreaID