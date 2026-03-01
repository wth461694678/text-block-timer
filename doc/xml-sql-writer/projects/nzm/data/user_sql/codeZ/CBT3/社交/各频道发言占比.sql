-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************


--各频道聊天占比
select
    -- PLATID
    -- ,SceneID
    -- ,count(1)
    distinct
    MsgType
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025101223'
group BY
    PLATID
    ,SceneID


--各频道发言率
select
    sec.sceneid
    ,count(distinct sec.vopenid) * 1.0 / max(total_regi) as chat_rate
    ,count(distinct sec.vopenid) as chat_player_num
    ,max(total_regi) as regi_player_num
    ,sum(sec.chat_num) * 1.0 / count(distinct sec.vopenid) as avg_chat_num
from
(
    select
        vopenid
        ,case when SceneID in (1002,1007) then 1002
        else SceneID end as sceneid
        ,count(1) as chat_num
    from ieg_tdbank::codez_dsl_SecTalkFlow_fht0
    WHERE tdbank_imp_date BETWEEN '2025090800' AND '2025101223'  -- 修正日期
    and MsgType = 1
    group by vopenid, SceneID
) sec
cross join
(
    select count(distinct vopenid) as total_regi
    from ieg_tdbank::codez_dsl_playerregister_fht0
    WHERE tdbank_imp_date BETWEEN '20250908' AND '20251012'
) regi
group by sec.sceneid


--语音消息数量

select
    substr(tdbank_imp_date,1,8) as p_date,
    contents
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025091500' AND '2025092523'
    and msgtype = 1


--世界聊天
select
    substr(tdbank_imp_date,1,8) as p_date,
    contents
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011307' AND '2026011923'
    and SceneID = 1001
    and (contents like '%折磨%' or contents like '%不死%')



--猎场局内聊天
select
    contents
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011307' AND '2026011323'
    and SceneID in (1006,1007)
    and DungeonId in (select param1 from codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo' and param4 = '僵尸猎场')


--塔防局内聊天
select
    contents
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011307' AND '2026011323'
    and SceneID in (1006,1007)
    and DungeonId in (select param1 from codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo' and param4 = '塔防')



--1006聊天
select
    *
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025101223'
    and SceneID = 1006


--1007聊天
select
    substr(tdbank_imp_date,1,8) as p_date,
    contents
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025101223'
    and SceneID in (1002,1007)


--队伍
select
    *
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
    and SceneID = 1002


--人均聊天次数
select
    if(PLATID>1,PLATID,1) as PLATID
    ,count(1)/count(distinct vopenid)
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2025090800' AND '2025091423'
group BY
    if(PLATID>1,PLATID,1)



SELECT
    *
FROM
   ieg_tdbank::codez_dsl_gamedetail_fht0
WHERE 
   tdbank_imp_date BETWEEN '2025090800' and '2025091423'
   and env = 'live'




select
    count(contents)
from
    ieg_tdbank::codez_dsl_SecTalkFlow_fht0
WHERE
    tdbank_imp_date BETWEEN '2026011521' AND '2026011521'
    and contents like '%回收%'



select
   *
from
	codez_dsl_itemflow_fht0
where
    tdbank_imp_date between '2026011521' and '2026011523'
and dteventtime between '2026-01-15 21:00:00' and  '2026-01-15 23:59:59'
--and reason = 3
and igoodsid = 20106000011
and vopenid in ('101158893252331',
'150800253258869',
'256143043736190',
'264815371445791')