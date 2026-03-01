select 
    ------------- 维度 ------------
    '${YYYYMMDD}' as p_date
    ,active.vopenid
    ,active.vroleid -- string (必填)玩家角色id，nzm该字段为playerid
    ,active.vgameappid -- string (必填)游戏appid。无论是否正式环境，都报正式的appid
    ,active.platidlst -- int (必填)0:ios,1:android,2:pc,12:鸿蒙 -> 连接
    ,active.env -- string 服务器环境
    ------------- 指标 ------------
    ,active.vrolename -- string (必填)玩家角色名
    ,coalesce(levelup.playerlevel,active.playerlevel) as playerlevel
    ,active.guildid -- string (安全补充)玩家公会id，没有公会则上报0
    ,active.guildname -- string (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如|或者\t，\n,\r  以及空格），则记录时去掉，比如 张|三 记为 张三
    ,active.playerregtimestamp -- datetime (安全补充)注册时间
    ,active.playerregdate
    ,active.totalgamedur -- uint64 (安全补充)游戏总时长，秒
    ,active.onlinedur
    ,coalesce(fatigue.fatiguevalue,0) as fatiguevalue 
    ,coalesce(fight.totalfightcnt,0) as totalfightcnt
    ,coalesce(fight.pvpfightcnt,0) as pvpfightcnt
    ,coalesce(fight.pvefightcnt,0) as pvefightcnt
    ,coalesce(fight.modetypefightcntjson,'{}') as modetypefightcntjson
    ,coalesce(fight.pvpfightdur,0) as pvpfightdur
    ,coalesce(fight.pvefightdur,0) as pvefightdur
    ,coalesce(fight.modetypefightdurjson,'{}') as modetypefightdurjson
    ,coalesce(schemecnt.pveschemecnt,if(active.onlinedur is null,null,0)) as pveschemecnt
    ,coalesce(schemecnt.pvpschemecnt,if(active.onlinedur is null,null,0)) as pvpschemecnt
    ,coalesce(schemecnt.pveschemechangecnt,if(active.onlinedur is null,null,0)) as pveschemechangecnt
    ,coalesce(schemecnt.pvpschemechangecnt,if(active.onlinedur is null,null,0)) as pvpschemechangecnt
    ,coalesce(selectedschemeinfo.selectedschemejson,if(active.onlinedur is null,null,'{}')) as selectedschemejson
    ,coalesce(weaponown.weaponcnt,0) as weaponcnt
    ,coalesce(weaponown.weaponcntjson,'{}') as weaponcntjson
    ,coalesce(weaponown.weapontypecnt,0) as weapontypecnt
    ,coalesce(weaponown.weaponqualitytypecntjson,'{}') as weaponqualitytypecntjson
    ,coalesce(weaponown.weaponqualitycntjson,'{}') as weaponqualitycntjson
    ,coalesce(weaponown.weaponlst,'') as weaponlst
    ,coalesce(moduleown.modulecnt,0) as modulecnt
    ,coalesce(moduleown.modulecntjson,'{}') as modulecntjson
    ,coalesce(moduleown.moduletypecnt,0) as moduletypecnt
    ,coalesce(moduleown.modulequalitytypecntjson,'{}') as modulequalitytypecntjson
    ,coalesce(moduleown.modulequalitycntjson,'{}') as modulequalitycntjson
    ,coalesce(moduleown.modulelst,'') as modulelst
    ,coalesce(talentscheme.talentlevel,if(active.onlinedur is null,null,0)) as talentlevel
    ,'{}' as talentbranchleveljson
    ,coalesce(talentop.talentaddcnt,0) as talentaddcnt 
    ,coalesce(talentop.talentreducecnt,0) as talentreducecnt 
    ,coalesce(talentop.talentresetcnt,0) as talentresetcnt 
    ,coalesce(dailytaskfinishcnt,0) as dailytaskfinishcnt
    -- 2025/11/20 新增
    ,coalesce(schemechange.schemechangestr,'000000;000000') as schemechangestr

    -- 2026/1/10 新增abs()
    ,talentscheme.talentschemejson
    ,talenttype.talenttypejson
    ,coalesce(talenttype.talenttypediscnt,if(active.onlinedur is null,null,0)) as talenttypediscnt
from 
------------------------- login+logout --------------------------
(select 
    vopenid
    ,vRoleID -- string (必填)玩家角色ID，NZM该字段为PlayerID
    ,vGameAppid -- string (必填)游戏APPID。无论是否正式环境，都报正式的appid
    ,concat_ws(',',collect_set(platid)) as platidlst -- string
    ,Env -- string 服务器环境
    ,max(array(dteventtime,vRoleName))[1] as vrolename -- string (必填)玩家角色名
    ,max(playerlevel) as playerlevel  -- int (必填)等级
    ,max(array(dteventtime,guildid))[1] as guildid -- string (安全补充)玩家公会ID，没有公会则上报0
    ,max(array(dteventtime,guildname))[1] as guildname -- string (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如|或者\t，\n,\r  以及空格），则记录时去掉，比如 张|三 记为 张三
    ,max(playerregtimestamp) as playerregtimestamp -- datetime (安全补充)注册时间
    ,from_unixtime(max(playerregtimestamp),'yyyyMMdd') as playerregdate
    ,max(totalgamedur) as totalgamedur -- uint64 (安全补充)游戏总时长，秒
    ,sum(Onlinedur) as Onlinedur
from 
(select
    vopenid
    ,vRoleID -- string (必填)玩家角色ID，NZM该字段为PlayerID
    ,vGameAppid -- string (必填)游戏APPID。无论是否正式环境，都报正式的appid
    ,cast(PlatID as string) as platid -- int (必填)0:ios,1:android,2:PC,12:鸿蒙
    ,Env -- string 服务器环境
    ,dteventtime
    ,vRoleName -- string (必填)玩家角色名
    ,iLevel as playerlevel -- int (必填)等级
    ,if(iGuildID = '0',null,iGuildID) as guildid -- string (安全补充)玩家公会ID，没有公会则上报0
    ,vGuildName as guildname -- string (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如|或者\t，\n,\r  以及空格），则记录时去掉，比如 张|三 记为 张三
    ,unix_timestamp(RegisterTime) as playerregtimestamp -- datetime (安全补充)注册时间
    ,TotalGameTime as totalgamedur -- uint64 (安全补充)游戏总时长，秒
    ,0 as onlinedur
from
    ieg_tdbank::codez_dsl_playerlogin_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and loginresult = 0
union all 
select
    vopenid
    ,vRoleID -- string (必填)玩家角色ID，NZM该字段为PlayerID
    ,vGameAppid -- string (必填)游戏APPID。无论是否正式环境，都报正式的appid
    ,cast(PlatID as string) as platid -- int (必填)0:ios,1:android,2:PC,12:鸿蒙
    ,Env -- string 服务器环境
    ,dteventtime
    ,vRoleName -- string (必填)玩家角色名
    ,iLevel as playerlevel -- int (必填)等级 
    ,if(iGuildID = '0',null,iGuildID) as guildid -- string (安全补充)玩家公会ID，没有公会则上报0
    ,vGuildName as guildname -- string (安全补充)玩家公会名,只保留中文字符、英文和数字。如果昵称中带有特殊字符（比如|或者\t，\n,\r  以及空格），则记录时去掉，比如 张|三 记为 张三
    ,unix_timestamp(RegisterTime) as playerregtimestamp -- datetime (安全补充)注册时间
    ,TotalGameTime as totalgamedur -- uint64 (安全补充)游戏总时长，秒
    ,OnlineTime as onlinedur -- int (必填)本次登录在线时间(秒)
from
    ieg_tdbank::codez_dsl_PlayerLogout_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live')
group by 
    vopenid
    ,vRoleID
    ,vGameAppid
    ,Env)active
left join 
(------------------------- 疲劳值变更流水 --------------------------
select
    vRoleID -- string (必填)玩家角色ID
    ,Env -- string 服务器环境
    ,sum(iAddFatigueValue) as fatiguevalue -- int (必填)变更数值
from
    ieg_tdbank::codez_dsl_FatigueFlow_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
group by 
    vroleid
    ,env)fatigue on active.vroleid = fatigue.vroleid and active.env = fatigue.env
left join 
(select 
    vopenid
    ,vroleid
    ,env
    ,cast(max(array(unix_timestamp(dteventtime),playerlevel))[1] as bigint) as playerlevel
from 
(
------------------------- playerexp：CBT3正式测 只上报赛季前等级 从1到4 --------------------------
select
    vopenid
    ,vRoleID -- string (必填)玩家角色ID，NZM该字段为PlayerID
    ,env
    ,dteventtime
    ,cast(AfterLevel as bigint) -4 as playerlevel -- int (必填)动作后等级 从赛季前等级1 2 3 变为 -3 -2 -1 
from
    ieg_tdbank::codez_dsl_PlayerExpFlow_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and afterlevel < 4 -- 当赛季前等级 = 4时，同时会上报一条赛季等级 = 1，这条去掉
union all 
------------------------- seasonlevel：CBT3正式测 只上报赛季后等级 从1开始，赛季前等级-4 = 赛季等级1 --------------------------
select
    vopenid
    ,vroleid
    ,env
    ,dteventtime
    ,cast(seasonlevel as bigint) as playerlevel
from
    ieg_tdbank::codez_dsl_seasonlevel_fht0
where 
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live')
group by 
    vopenid
    ,vroleid
    ,env
    )levelup on active.vroleid = levelup.vroleid and active.env = levelup.env
left join 
(------------------------- 对局结算 --------------------------
select 
    vroleid
    ,env 
    ,sum(fightcnt) as totalfightcnt
    ,sum(if(gamemode = 2,fightcnt,0)) as pvpfightcnt
    ,sum(if(gamemode = 3,fightcnt,0)) as pvefightcnt
    ,concat('{',wm_concat(concat('"',modetype,'":',fightcnt),','),'}') as modetypefightcntjson
    ,sum(if(gamemode = 2,fightdur,0)) as pvpfightdur
    ,sum(if(gamemode = 3,fightdur,0)) as pvefightdur
    ,concat('{',wm_concat(concat('"',modetype,'":',fightdur),','),'}') as modetypefightdurjson
from 
(select
    vroleid
    ,env
    ,gamemode
    ,modetype
    ,count(distinct dsroomid) as fightcnt
    ,sum(playerdur) as fightdur
from 
(select
    vroleid
    ,env
    ,dsroomid
    ,igamemode as gamemode
    ,imodetype as modetype
    ,iduration as playerdur
from
    ieg_tdbank::codez_dsl_gamedetail_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and vopenid > ''
union all 
select
    vroleid
    ,env
    ,dsroomid
    ,igamemode  as gamemode 
    ,imodetype as modetype
    ,iduration as playerdur
from
    ieg_tdbank::codez_dsl_dropoutdetail_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and vopenid > '')
group by 
    vroleid
    ,env
    ,gamemode
    ,modetype)
group by 
    vroleid
    ,env)fight on active.vroleid = fight.vroleid and active.env = fight.env
left join 
(------------------------- 生效背包数 ----------------------
select
    vroleid
    ,env
    ,count(distinct if(schemetabtype = 1,schemeid,null)) as pveschemecnt
    ,count(distinct if(schemetabtype = 2,schemeid,null)) as pvpschemecnt
    ,count(if(schemetabtype = 1 and reporttype in (4,6),1,0)) as pveschemechangecnt
    ,count(if(schemetabtype = 2 and reporttype in (4,6),1,0)) as pvpschemechangecnt
from
    ieg_tdbank::codez_dsl_playerselectedschemeinfo_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and concat(weaponid1,weaponid2,weaponid3) > '000'
    and env = 'live'
    and reporttype in (4,5,6)
group by 
    vroleid
    ,env)schemecnt on active.vroleid = schemecnt.vroleid and active.env = schemecnt.env
left join 
(------------------------- 首发背包信息 ----------------------
select 
    vroleid
    ,env
    ,concat('{',wm_concat(concat('"',SchemeTabType,'":',schemejson),','),'}') as selectedschemejson
from 
(select
    vroleid
    ,env
    ,case when SchemeTabType = 1 then 'pve' when SchemeTabType = 2 then 'pvp' end as SchemeTabType
    ,concat('{','"weapon1"',':'
    ,'{','"id"',':',WeaponID1
    ,',"modulelst"',':','"',Weapon1ModuleList,'"'
    ,'}'
    ,',"weapon2"',':'
    ,'{','"id"',':',WeaponID2
    ,',"modulelst"',':','"',Weapon2ModuleList,'"'
    ,'}'
    ,',"weapon3"',':'
    ,'{','"id"',':',WeaponID3
    ,'}'
    ,',"seasonskillid"',':',SeasonSkillID
    ,',"seasontalentmgelst"',':','"',SeasonTalentList,'"'
    ,'}') as schemejson
    ,row_number() over (partition by vroleid,env,SchemeTabType,SchemeID order by dteventtime desc) as rn 
from
    ieg_tdbank::codez_dsl_playerselectedschemeinfo_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and concat(weaponid1,weaponid2,weaponid3) > '000'
    and env = 'live'
    and reporttype in (5)
    and selectedschemeid = schemeid)
where 
    rn = 1
group by 
    vroleid
    ,env)selectedschemeinfo on active.vroleid = selectedschemeinfo.vroleid and active.env = selectedschemeinfo.env
left join 
( ------------------------- 武器拥有数量 ------------------------- 
select 
    vroleid
    ,env
    ,sum(itemcnt) as weaponcnt
    ,concat('{',wm_concat(concat('"',itemid,'":',itemcnt),','),'}') as weaponcntjson
    ,sum(1) as weapontypecnt
    ,concat('{','"1"',':',count(distinct if(itemquality = 1,itemid,null))
       ,',"2"',':',count(distinct if(itemquality = 2,itemid,null))
       ,',"3"',':',count(distinct if(itemquality = 3,itemid,null))
       ,',"4"',':',count(distinct if(itemquality = 4,itemid,null))
       ,',"5"',':',count(distinct if(itemquality = 5,itemid,null))
    ,'}') as weaponqualitytypecntjson
    ,concat('{','"1"',':',sum(if(itemquality = 1,itemcnt,0))
       ,',"2"',':',sum(if(itemquality = 2,itemcnt,0))
       ,',"3"',':',sum(if(itemquality = 3,itemcnt,0))
       ,',"4"',':',sum(if(itemquality = 4,itemcnt,0))
       ,',"5"',':',sum(if(itemquality = 5,itemcnt,0))
    ,'}') as weaponqualitycntjson
    ,wm_concat(itemid,';') as  weaponlst
from
    codez_mid_analysis.dwd_w_codez_item_di
where 
    p_date = '${YYYYMMDD}'
    and env = 'live'
    and itemtype = 2 and itemsubtype = 1
group by 
    vroleid
    ,env)weaponown on active.vroleid = weaponown.vroleid and active.env = weaponown.env
left join 
( ------------------------- 插件拥有数量 ------------------------- 
select 
    vroleid
    ,env
    ,sum(itemcnt) as modulecnt
    ,concat('{',wm_concat(concat('"',itemid,'":',itemcnt),','),'}') as modulecntjson
    ,sum(1) as moduletypecnt
    ,concat('{','"1"',':',count(distinct if(itemquality = 1,itemid,null))
       ,',"2"',':',count(distinct if(itemquality = 2,itemid,null))
       ,',"3"',':',count(distinct if(itemquality = 3,itemid,null))
       ,',"4"',':',count(distinct if(itemquality = 4,itemid,null))
       ,',"5"',':',count(distinct if(itemquality = 5,itemid,null))
    ,'}') as modulequalitytypecntjson
    ,concat('{','"1"',':',sum(if(itemquality = 1,itemcnt,0))
       ,',"2"',':',sum(if(itemquality = 2,itemcnt,0))
       ,',"3"',':',sum(if(itemquality = 3,itemcnt,0))
       ,',"4"',':',sum(if(itemquality = 4,itemcnt,0))
       ,',"5"',':',sum(if(itemquality = 5,itemcnt,0))
    ,'}') as modulequalitycntjson
    ,wm_concat(itemid,';') as  modulelst
from
    codez_mid_analysis.dwd_w_codez_item_di
where 
    p_date = '${YYYYMMDD}'
    and env = 'live'
    and itemtype = 2 and itemsubtype = 7
group by 
    vroleid
    ,env)moduleown on active.vroleid = moduleown.vroleid and active.env = moduleown.env
left join 
(------------------------- 赛季天赋编辑 --------------------------
select
    vRoleID -- string (必填)玩家角色ID
    ,env -- string 环境
    ,sum(if(op = 1,1,0)) as talentaddcnt
    ,sum(if(op = 2,1,0)) as talentreducecnt
    ,sum(if(op = 3,1,0)) as talentresetcnt
from
    ieg_tdbank::codez_dsl_SeasonTalent_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and Op in (1,2,3)  -- int 操作：1.升级，2.降级. 3.重置所有天赋. 4.开赛（全量）5.登出(全量)
group by 
    vRoleID
    ,env)talentop on active.vroleid = talentop.vroleid and active.env = talentop.env
left join
(------------------------- 任务 --------------------------
select
    vroleid -- string (必填)玩家角色ID
    ,env -- string 环境
    ,count(distinct taskid) as dailytaskfinishcnt
from
    ieg_tdbank::codez_dsl_SeasonTask_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and env = 'live'
    and tasktype = 1 and status = 2
group by 
    vroleid
    ,env)dailytask on active.vroleid = dailytask.vroleid and active.env = dailytask.env
left join 
(------------------------- 当天编辑背包数 ----------------------
select
    vroleid
    ,env
    ,concat(
        cast(max(if(schemetabtype = 1 and schemeid = 1,1,0)) as string)
        ,cast(max(if(schemetabtype = 1 and schemeid = 2,1,0)) as string)
        ,cast(max(if(schemetabtype = 1 and schemeid = 3,1,0)) as string)
        ,cast(max(if(schemetabtype = 1 and schemeid = 4,1,0)) as string)
        ,cast(max(if(schemetabtype = 1 and schemeid = 5,1,0)) as string)
        ,cast(max(if(schemetabtype = 1 and schemeid = 6,1,0)) as string)
        ,';'
        ,cast(max(if(schemetabtype = 2 and schemeid = 1,1,0)) as string)
        ,cast(max(if(schemetabtype = 2 and schemeid = 2,1,0)) as string)
        ,cast(max(if(schemetabtype = 2 and schemeid = 3,1,0)) as string)
        ,cast(max(if(schemetabtype = 2 and schemeid = 4,1,0)) as string)
        ,cast(max(if(schemetabtype = 2 and schemeid = 5,1,0)) as string)
        ,cast(max(if(schemetabtype = 2 and schemeid = 6,1,0)) as string)
        ) as schemechangestr
from
    ieg_tdbank::codez_dsl_playerselectedschemeinfo_fht0
where
    tdbank_imp_date between '${YYYYMMDD}00' and '${YYYYMMDD}23'
    and reporttype in (4,6) 
    and env = 'live'
group by 
    vroleid
    ,env)schemechange on active.vroleid = schemechange.vroleid and active.env = schemechange.env
-- 日终天赋方案
left join
(select 
    p_date
    ,vroleid
    ,env
    ,max(talentlevel) as talentlevel
    ,concat('{',
        wm_concat(concat('"',schemeid,'":',
            concat(
                '{',
                '"seasonid":',seasonid,',',
                '"talentlevel":',talentlevel,',',
                '"talenttypeid":',talenttypeid,',',
                '"talenttypename":"',talenttypename,'",',
                '"relatedskill":',relatedskill,
                '}'
            )
        ),',')
    ,'}') as talentschemejson
from
(select 
    p_date
    ,vroleid
    ,env
    -- 每个schemeid，包含的关键信息：哪个天赋
    ,schemeid
    ,max(seasonid) as seasonid
    ,sum(talentlevel) as talentlevel
    ,max(talenttypeid) talenttypeid
    ,max(talenttypename) as talenttypename
    ,max(relatedskill) as relatedskill
    ,max(talentname) as talentname
from
    codez_mid_analysis.dwd_w_codez_seasontalent_talentid_di
where 
    p_date between '${YYYYMMDD}' and '${YYYYMMDD}'
    and env = 'live'
group by 
    p_date
    ,vroleid
    ,env
    ,schemeid)
group by 
    p_date,
    vroleid
    ,env)talentscheme on active.vroleid = talentscheme.vroleid and active.env = talentscheme.env
left join
(select 
    p_date
    ,vroleid
    ,env
    ,concat('{',
        wm_concat(concat('"',talenttypename,'":',
            concat(
                '{',
                '"maxlevel":',maxtalentlevel,',',
                '"usingschemecnt":',usingschemecnt,
                '}'
            )
        ),',')
    ,'}') as talenttypejson
    ,count(1) as talenttypediscnt
from
(select 
    p_date
    ,vroleid
    ,env
    ,talenttypename
    ,max(talentlevel) as maxtalentlevel
    ,count(1) as usingschemecnt
from 
(select 
    p_date
    ,vroleid
    ,env
    ,schemeid
    ,max(seasonid) as seasonid
    ,sum(talentlevel) as talentlevel
    ,max(talenttypeid) talenttypeid
    ,max(talenttypename) as talenttypename
    ,max(relatedskill) as relatedskill
    ,max(talentname) as talentname
from
    codez_mid_analysis.dwd_w_codez_seasontalent_talentid_di
where 
    p_date between '${YYYYMMDD}' and '${YYYYMMDD}'
    and env = 'live'
group by 
    p_date
    ,vroleid
    ,env
    ,schemeid)
group by 
    p_date
    ,vroleid
    ,env
    ,talenttypename)
group by
    p_date
    ,vroleid
    ,env)talenttype on active.vroleid = talenttype.vroleid and active.env = talenttype.env