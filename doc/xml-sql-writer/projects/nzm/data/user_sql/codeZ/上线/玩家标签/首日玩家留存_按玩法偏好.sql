-- ============================================
-- 需求: 首日注册玩家后续留存，按首日玩法偏好分组
-- 口径说明:
--   首日注册玩家: 2026-01-13 注册（包含所有渠道）
--   玩法偏好: 首日对局时长最长的玩法作为偏好，取TOP1（用max_by简化）
--   留存: D2/D3/D7/D14/D30，中间表有活跃记录即留存
--   环境: env = 'live'
--   对局数据: GameDetail + DropOutDetail，排除大厅(idungeonid<>2004001)
-- 引擎: SR（全TDW表，函数用SR语法）
-- ============================================

select
    reg_prefer.mode_name
    ,count(reg_prefer.vopenid) as reg_cnt
    ,count(if(array_contains(active.activedays_list,date_add(reg_prefer.p_date,1)),reg_prefer.vopenid,null))/count(reg_prefer.vopenid) as d2_rate
    ,count(if(array_contains(active.activedays_list,date_add(reg_prefer.p_date,2)),reg_prefer.vopenid,null))/count(reg_prefer.vopenid) as d3_rate
    ,count(if(array_contains(active.activedays_list,date_add(reg_prefer.p_date,6)),reg_prefer.vopenid,null))/count(reg_prefer.vopenid) as d7_rate
    ,count(if(array_contains(active.activedays_list,date_add(reg_prefer.p_date,13)),reg_prefer.vopenid,null))/count(reg_prefer.vopenid) as d14_rate
    ,count(if(array_contains(active.activedays_list,date_add(reg_prefer.p_date,29)),reg_prefer.vopenid,null))/count(reg_prefer.vopenid) as d30_rate
from
(------------------------- 首日注册玩家 + 玩法偏好 --------------------------
select
    reg.vopenid
    ,'20260113' as p_date
    ,coalesce(prefer.mode_name,'无对局') as mode_name
from
    (select distinct vopenid
     from ieg_tdbank.codez_dsl_playerregister_fht0
     where tdbank_imp_date between '2026011300' and '2026011323'
           and env = 'live')reg
left join
    (------------------------- 用max_by取每人首日对局时长最长的玩法 --------------------------
    select
        battle.vopenid
        ,max_by(coalesce(dungeon_conf.modetype,'未知玩法'),battle.total_dur) as mode_name
    from
        (select
            vopenid
            ,idungeonid
            ,sum(iduration) as total_dur
        from
            (select vopenid, idungeonid, iduration
             from ieg_tdbank.codez_dsl_gamedetail_fht0
             where tdbank_imp_date between '2026011300' and '2026011323'
                   and env = 'live'
                   and idungeonid <> 2004001
                   and vopenid > ''
             union all
             select vopenid, idungeonid, iduration
             from ieg_tdbank.codez_dsl_dropoutdetail_fht0
             where tdbank_imp_date between '2026011300' and '2026011323'
                   and env = 'live'
                   and idungeonid <> 2004001
                   and vopenid > '')
        group by
            vopenid
            ,idungeonid)battle
    left join
        codez_mid_analysis.codez_ret_dungeon_conf dungeon_conf on battle.idungeonid = dungeon_conf.dungeonid
    group by
        battle.vopenid)prefer on reg.vopenid = prefer.vopenid)reg_prefer
left join
    (------------------------- 活跃日列表（中间表聚合） --------------------------
    select
        vopenid
        ,array_agg(p_date) as activedays_list
    from
        codez_mid_analysis.dwd_w_codez_vroleid_summary_wide_di
    where
        p_date between '20260113' and '20260211'
        and env = 'live'
    group by
        vopenid)active on reg_prefer.vopenid = active.vopenid
group by
    reg_prefer.mode_name
order by reg_cnt desc
