select 
    t1.p_date
    ,count(t1.vopenid) as vopenid
    ,count(if(array_contains(activedays_list,date_add(t1.p_date,1)),t1.vopenid,null))/count(t1.vopenid) as vopenid_d2rate
    ,count(if(array_contains(activedays_list,date_add(t1.p_date,2)),t1.vopenid,null))/count(t1.vopenid) as vopenid_d3rate
    ,count(if(array_contains(activedays_list,date_add(t1.p_date,6)),t1.vopenid,null))/count(t1.vopenid) as vopenid_d7rate
    ,count(if(array_contains(activedays_list,date_add(t1.p_date,13)),t1.vopenid,null))/count(t1.vopenid) as vopenid_d14rate
    ,count(if(array_contains(activedays_list,date_add(t1.p_date,29)),t1.vopenid,null))/count(t1.vopenid) as vopenid_d30rate
from 
    (select * from battleinfo where battletype is not null)t1 
left join 
    (select 
        vopenid
        ,array_agg(p_date) as activedays_list
    from 
        codez_mid_analysis.dwd_w_codez_vroleid_summary_wide_di -- 活跃宽表
    where 
        p_date between '20260113' and '20260119'
    group by 
        vopenid)t2 on t1.vopenid=t2.vopenid
group by 
    t1.p_date