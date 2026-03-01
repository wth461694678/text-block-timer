    select
	case when ios_inewusernum2>0 then concat(round(ios_istayusernum2*100/ios_inewusernum2,2),'%','(',ios_istayusernum2,')') else '0%' end as ios_real_ret2,
	case when ios_inewusernum3>0 then concat(round(ios_istayusernum3*100/ios_inewusernum3,2),'%','(',ios_istayusernum3,')') else '0%' end as ios_real_ret3,
	'' as ios_real_ret7,
	'' as ios_real_ret14,

    case when android_inewusernum2>0 then concat(round(android_istayusernum2*100/android_inewusernum2,2),'%','(',android_istayusernum2,')') else '0%' end as android_real_ret2,
	case when android_inewusernum3>0 then concat(round(android_istayusernum3*100/android_inewusernum3,2),'%','(',android_istayusernum3,')') else '0%' end as android_real_ret3,
	'' as android_real_ret7,
	'' as android_real_ret14,

    case when pc_inewusernum2>0 then concat(round(pc_istayusernum2*100/pc_inewusernum2,2),'%','(',pc_istayusernum2,')') else '0%' end as pc_real_ret2,
	case when pc_inewusernum3>0 then concat(round(pc_istayusernum3*100/pc_inewusernum3,2),'%','(',pc_istayusernum3,')') else '0%' end as pc_real_ret3,
	'' as pc_real_ret7,
	'' as pc_real_ret14,

    case when cloud_inewusernum2>0 then concat(round(cloud_istayusernum2*100/cloud_inewusernum2,2),'%','(',cloud_istayusernum2,')') else '0%' end as cloud_real_ret2,
	case when cloud_inewusernum3>0 then concat(round(cloud_istayusernum3*100/cloud_inewusernum3,2),'%','(',cloud_istayusernum3,')') else '0%' end as cloud_real_ret3,
	'' as cloud_real_ret7,
	'' as cloud_real_ret14
from
(
select
		sum(case when a.reg_days=1 and reg_platid = 0 then ireg_user else 0 end) as ios_istayusernum2,
		sum(case when a.reg_days=2 and reg_platid = 0 then ireg_user else 0 end) as ios_istayusernum3,

        sum(case when a.reg_days=1 and reg_platid = 1 then ireg_user else 0 end) as android_istayusernum2,
		sum(case when a.reg_days=2 and reg_platid = 1 then ireg_user else 0 end) as android_istayusernum3,

        sum(case when a.reg_days=1 and reg_platid = 2 then ireg_user else 0 end) as pc_istayusernum2,
		sum(case when a.reg_days=2 and reg_platid = 2 then ireg_user else 0 end) as pc_istayusernum3,

        sum(case when a.reg_days=1 and reg_platid = 59 then ireg_user else 0 end) as cloud_istayusernum2,
		sum(case when a.reg_days=2 and reg_platid = 59 then ireg_user else 0 end) as cloud_istayusernum3,

		sum(case when a.reg_days=1 and reg_platid = 0 then iusernum else 0 end) as ios_inewusernum2,
		sum(case when a.reg_days=2 and reg_platid = 0 then iusernum else 0 end) as ios_inewusernum3,

        sum(case when a.reg_days=1 and reg_platid = 1  then iusernum else 0 end) as android_inewusernum2,
		sum(case when a.reg_days=2 and reg_platid = 1  then iusernum else 0 end) as android_inewusernum3,

        sum(case when a.reg_days=1 and reg_platid = 2 then iusernum else 0 end) as pc_inewusernum2,
		sum(case when a.reg_days=2 and reg_platid = 2 then iusernum else 0 end) as pc_inewusernum3,

        sum(case when a.reg_days=1 and reg_platid = 59 then iusernum else 0 end) as cloud_inewusernum2,
		sum(case when a.reg_days=2 and reg_platid = 59 then iusernum else 0 end) as cloud_inewusernum3
from
(
select
a.reg_platid,
a.reg_days,
max(act_num_accu) as ireg_user ,
max(reg_num) as iusernum
from
(
select login_vtime,a.reg_platid,reg_days,sum(act_num) over(partition by reg_platid,reg_days order by login_vtime) as act_num_accu
from
    (
            SELECT 
            case when is_cloud_reg = 1 then 59 else a.reg_platid end as reg_platid,
            login_vtime,
            reg_days,count(1) as act_num
            from
            (

            select reg_date,a.reg_platid,if(substr(regchannel,1,2) = '59',1,0) as is_cloud_reg ,a.vopenid,login_vtime,datediff(substring(login_vtime,1,10),reg_date) as reg_days
            from
            (select dteventdate as reg_date,dteventtime_da,platid as reg_platid,vopenid ,regchannel
            from codez_log.codez_dsl_playerregister_fht0
            where  dteventdate >= '2026-01-05' and dteventdate>STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s') -interval 7 day
                    and dteventdate< STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s')
            and env = 'live'
            ) a

            left join

            (select min(date_trunc('minute',dteventtime)) as login_vtime,vopenid
                    from codez_event
                    where event='BillowActiveBigtable'
                    and case when substr(now(),12,2) = '00' then dteventtime> days_sub(STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s'), 1)
                    else dteventtime> days_sub(STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s'), 0) end 
                    and dteventtime<= seconds_sub(STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d %H:00:00'), '%Y-%m-%d %H:%i:%s'), 1)
                    and platid=255 
                    group by vopenid
            ) b
            on a.vopenid = b.vopenid

            ) a
            group by case when is_cloud_reg = 1 then 59 else a.reg_platid end,reg_days,login_vtime

    ) a
) a

left join

(
select
			reg_platid,case when substr(now(),12,2) = '00' then (reg_days - 1) else  reg_days end as reg_days,reg_num
		from
        (
        select case when is_cloud_reg = 1 then 59 else a.platid end as reg_platid,
        CASE WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 0 day) THEN 0
                WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 1 day) THEN 1
            WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 2 day) THEN 2
            WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 3 day) THEN 3
            WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 4 day) THEN 4
            WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 5 day) THEN 5
            WHEN date_trunc('day',dteventdate)=date_trunc('day', now()-interval 6 day) THEN 6 end  AS reg_days,
                count(distinct vopenid) as reg_num
        from
        (select platid,dteventdate,vopenid,regchannel,if(substr(regchannel,1,2) = '59',1,0) as is_cloud_reg
        from codez_log.codez_dsl_playerregister_fht0
        where dteventdate >= '2026-01-05' and dteventdate>STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s') -interval 7 day
                and dteventdate< STR_TO_DATE(DATE_FORMAT(now(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s')
        and env = 'live'
        ) a
        group by case when is_cloud_reg = 1 then 59  else a.platid end,date_trunc('day',dteventdate)
        ) a
)b
on  a.reg_platid=b.reg_platid and a.reg_days=b.reg_days
group by a.reg_platid,
a.reg_days

) a
) b
