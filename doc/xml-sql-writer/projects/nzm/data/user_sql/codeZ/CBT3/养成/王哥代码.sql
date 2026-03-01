-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************

------------------------- 日报：玩家预设背包启用情况 ------------------------- 注意：目前是用reporttype = 4 变更 滚出来启用过背包的玩家，在后续需要改为使用reporttype = 5 登出
    -- 圈定首日解锁背包系统的玩家
    select
        -- activedayn
        p_date 
        ,count(vopenid) as vopenidcnt
        ,count(distinct vopenid) as disvopenidcnt
        ,avg(sign((pvescheme1 + pvescheme2 + pvescheme3 + pvescheme4 + pvescheme5 + pvescheme6))) as pvepct
        ,avg(if((pvescheme1 + pvescheme2 + pvescheme3 + pvescheme4 + pvescheme5 + pvescheme6) = 0, null, (pvescheme1 + pvescheme2 + pvescheme3 + pvescheme4 + pvescheme5 + pvescheme6))) as pvecnt
        ,avg(sign((pvpscheme1 + pvpscheme2 + pvpscheme3 + pvpscheme4 + pvpscheme5 + pvpscheme6))) as pvppct
        ,avg(if((pvpscheme1 + pvpscheme2 + pvpscheme3 + pvpscheme4 + pvpscheme5 + pvpscheme6) = 0, null, (pvpscheme1 + pvpscheme2 + pvpscheme3 + pvpscheme4 + pvpscheme5 + pvpscheme6))) as pvpcnt
        -- *
    from 
    (select 
        t1.vopenid
        -- ,login.activedayn
        ,login.p_date
        ,max(nvl(pvescheme1,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme1
        ,max(nvl(pvescheme2,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme2
        ,max(nvl(pvescheme3,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme3
        ,max(nvl(pvescheme4,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme4
        ,max(nvl(pvescheme5,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme5
        ,max(nvl(pvescheme6,0)) over (partition by login.vopenid order by login.p_date asc) as pvescheme6
        ,max(nvl(pvpscheme1,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme1
        ,max(nvl(pvpscheme2,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme2
        ,max(nvl(pvpscheme3,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme3
        ,max(nvl(pvpscheme4,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme4
        ,max(nvl(pvpscheme5,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme5
        ,max(nvl(pvpscheme6,0)) over (partition by login.vopenid order by login.p_date asc) as pvpscheme6
    from 
    (-- 首日注册
    select
        distinct 
        vopenid
    from
        ieg_tdbank::codez_dsl_playerregister_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${start_date}23'
        and env = 'live')t1
    join (select vopenid from codez_mid_analysis.codez_vopenid_cbt3_20250908 )clean2 on t1.vopenid = clean2.vopenid
    join 
    ( -- 首日解锁背包系统 
    select
        distinct
        vopenid
    from
        ieg_tdbank::codez_dsl_playerbeginnerguideflow2_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${start_date}23'
        and env = 'live'
        and guideid = 800)t2 on t1.vopenid = t2.vopenid
    join 
    (select 
        vopenid
        ,p_date
    from 
    (select 
        distinct
        substr(tdbank_imp_date,1,8) as p_date 
        ,vopenid
    from
        ieg_tdbank::codez_dsl_playerlogin_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${end_date}23'
        and env = 'live'))login on t1.vopenid = login.vopenid
    left join 
    (select
        substr(tdbank_imp_date,1,8) as p_date 
        ,vopenid
        ,max(if(schemetabtype = 1 and schemeid = 1,1,0)) as pvescheme1
        ,max(if(schemetabtype = 1 and schemeid = 2,1,0)) as pvescheme2
        ,max(if(schemetabtype = 1 and schemeid = 3,1,0)) as pvescheme3
        ,max(if(schemetabtype = 1 and schemeid = 4,1,0)) as pvescheme4
        ,max(if(schemetabtype = 1 and schemeid = 5,1,0)) as pvescheme5
        ,max(if(schemetabtype = 1 and schemeid = 6,1,0)) as pvescheme6
        ,max(if(schemetabtype = 2 and schemeid = 1,1,0)) as pvpscheme1
        ,max(if(schemetabtype = 2 and schemeid = 2,1,0)) as pvpscheme2
        ,max(if(schemetabtype = 2 and schemeid = 3,1,0)) as pvpscheme3
        ,max(if(schemetabtype = 2 and schemeid = 4,1,0)) as pvpscheme4
        ,max(if(schemetabtype = 2 and schemeid = 5,1,0)) as pvpscheme5
        ,max(if(schemetabtype = 2 and schemeid = 6,1,0)) as pvpscheme6
    from
        ieg_tdbank::codez_dsl_playerselectedschemeinfo_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${end_date}23'
        and env = 'live'
        and concat(weaponid1,weaponid2,weaponid3) > '000'
        and reporttype in (4,6) 
    group by 
        substr(tdbank_imp_date,1,8)
        ,vopenid)t4 on login.vopenid = t4.vopenid and login.p_date = t4.p_date
    -- where 
    --     login.activedays = 2
        )
    group by 
        -- activedayn
        p_date;




    ------------------------- 日报：预设方案启用总览（分天分槽位操作率） -------------------------
    -- 圈定首日解锁背包系统的玩家
    select
        -- activedayn
        login.p_date
        ,count(t1.vopenid) as vopenidcnt
        ,count(distinct t1.vopenid) as vopeniddiscnt
        ,avg(sign(nvl(pvescheme1,0))) as pvescheme1changerate
        ,avg(sign(nvl(pvescheme2,0))) as pvescheme2changerate
        ,avg(sign(nvl(pvescheme3,0))) as pvescheme3changerate
        ,avg(sign(nvl(pvescheme4,0))) as pvescheme4changerate
        ,avg(sign(nvl(pvescheme5,0))) as pvescheme5changerate
        ,avg(sign(nvl(pvescheme6,0))) as pvescheme6changerate
        ,avg(sign(nvl(pvpscheme1,0))) as pvpscheme1changerate
        ,avg(sign(nvl(pvpscheme2,0))) as pvpscheme2changerate
        ,avg(sign(nvl(pvpscheme3,0))) as pvpscheme3changerate
        ,avg(sign(nvl(pvpscheme4,0))) as pvpscheme4changerate
        ,avg(sign(nvl(pvpscheme5,0))) as pvpscheme5changerate
        ,avg(sign(nvl(pvpscheme6,0))) as pvpscheme6changerate
        -- *
    from 
    (-- 首日注册
    select
        distinct 
        vopenid
    from
        ieg_tdbank::codez_dsl_playerregister_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${start_date}23'
        and env = 'live')t1
    join (select vopenid from codez_mid_analysis.codez_vopenid_cbt3_20250908 )clean2 on t1.vopenid = clean2.vopenid
    join 
    ( -- 首日解锁背包系统 
    select
        distinct
        vopenid
    from
        ieg_tdbank::codez_dsl_playerbeginnerguideflow2_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${start_date}23'
        and env = 'live'
        and guideid = 800)t2 on t1.vopenid = t2.vopenid
    join 
    (select 
        vopenid
        ,p_date
        ,row_number() over (partition by vopenid order by p_date asc) as activedayn
        -- ,count(p_date) over (partition by vopenid) as activedays
    from 
    (select 
        distinct
        substr(tdbank_imp_date,1,8) as p_date 
        ,vopenid
    from
        ieg_tdbank::codez_dsl_playerlogin_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${end_date}23'
        and env = 'live'))login on t1.vopenid = login.vopenid
    left join 
    (select
        substr(tdbank_imp_date,1,8) as p_date 
        ,vopenid
        ,max(if(schemetabtype = 1 and schemeid = 1,1,0)) as pvescheme1
        ,max(if(schemetabtype = 1 and schemeid = 2,1,0)) as pvescheme2
        ,max(if(schemetabtype = 1 and schemeid = 3,1,0)) as pvescheme3
        ,max(if(schemetabtype = 1 and schemeid = 4,1,0)) as pvescheme4
        ,max(if(schemetabtype = 1 and schemeid = 5,1,0)) as pvescheme5
        ,max(if(schemetabtype = 1 and schemeid = 6,1,0)) as pvescheme6
        ,max(if(schemetabtype = 2 and schemeid = 1,1,0)) as pvpscheme1
        ,max(if(schemetabtype = 2 and schemeid = 2,1,0)) as pvpscheme2
        ,max(if(schemetabtype = 2 and schemeid = 3,1,0)) as pvpscheme3
        ,max(if(schemetabtype = 2 and schemeid = 4,1,0)) as pvpscheme4
        ,max(if(schemetabtype = 2 and schemeid = 5,1,0)) as pvpscheme5
        ,max(if(schemetabtype = 2 and schemeid = 6,1,0)) as pvpscheme6
    from
        ieg_tdbank::codez_dsl_playerselectedschemeinfo_fht0
    where
        tdbank_imp_date between '${start_date}00' and '${end_date}23'
        and env = 'live'
        and concat(weaponid1,weaponid2,weaponid3) > '000'
        and reporttype in (4,6)
    group by 
        substr(tdbank_imp_date,1,8)
        ,vopenid)t4 on login.vopenid = t4.vopenid and login.p_date = t4.p_date
    -- where 
    --     login.activedays = 2
    group by 
        -- activedayn
        login.p_date;