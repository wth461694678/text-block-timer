-- ******************************************
-- 语法指引可参阅以下文档
-- SQL语法和常见问题文档汇总：https://iwiki.woa.com/pages/viewpage.action?pageId=443601698
-- SQL项目汇总iWiki：https://iwiki.woa.com/space/tdwwiki
-- SuperSQL项目汇总iWiki：https://iwiki.woa.com/space/supersqlwiki
-- ******************************************
--玩家聚类匹配(分天)
with act_player as
(SELECT
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,sum(OnlineTime) as OnlineTime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    AND env = 'live'
GROUP BY
    vopenid
    ,substr(tdbank_imp_date,1,8)
),
playerlabel as
(SELECT
    vopenid
    ,case when playercluster = 0  then '0-上线打卡玩家'
    when playercluster = 1 then '1-多栖玩家'
    when playercluster = 2 then '2-核心玩家'
    when playercluster = 3 then '3-猎场偏好玩家'
    when playercluster = 4 then '4-机甲偏好玩家'
    else '999' end as playercluster
from
    codez_clusterlabel_cbt3_all),
gamedetail as 
(select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,count(distinct dsroomid) as game_num
    ,max(if(map_id = '僵尸猎场', 1,0)) as lc_part_rate
    ,max(if(map_id = '塔防',1,0)) as tf_part_rate
    ,max(if(map_id = '机甲战',1,0)) as jj_part_rate
    ,max(if(map_id = '猎场竞速',1,0)) as js_part_rate
    ,max(if(map_id = '挑战副本',1,0)) as tz_part_rate
    ,count(distinct if(map_id = '僵尸猎场', dsroomid,null))/count(distinct dsroomid) as lc_rate
    --,count(distinct if(map_id = '时空追猎', dsroomid,null))/count(distinct dsroomid) as zl_rate
    ,count(distinct if(map_id = '塔防', dsroomid,null))/count(distinct dsroomid) as tf_rate
    ,count(distinct if(map_id = '机甲战', dsroomid,null))/count(distinct dsroomid) as jj_rate
    ,count(distinct if(map_id = '猎场竞速', dsroomid,null))/count(distinct dsroomid) as js_rate
    ,count(distinct if(map_id = '挑战副本', dsroomid,null))/count(distinct dsroomid) as tz_rate
    ,sum(if(map_id = '僵尸猎场',ikills,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_kills
    ,sum(if(map_id = '僵尸猎场',ideaths,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_die
    ,sum(if(map_id = '僵尸猎场',Damage,0))/sum(if(map_id = '僵尸猎场',iDuration,0)) as lc_avg_dps
    ,sum(if(map_id = '僵尸猎场',iDuration,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_duration
    ,max(if(map_id = '僵尸猎场',map_difficulty,0)) as lc_max_difficulty
    ,max(if(map_id = '塔防',map_difficulty,0)) as tf_max_difficulty
from
(select
    *
from
    ieg_tdbank::codez_dsl_GameDetail_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    and env = 'live') gamedetail 
JOIN
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
       case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '折磨II' then 6
      when param8 = '挑战模式' then 7
      when param8 = '竞速' then -1
      else -2
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','挑战模式') or param4 in ('机甲战','挑战副本'))) excelconfig on gamedetail.iDungeonID = excelconfig.dungeon_id
group by
    vopenid
    ,substr(tdbank_imp_date,1,8)
),
--金枪个数、紫枪个数、金插件个数、紫插件个数
GUN_Warframe as 
(select
    vopenid
    ,p_date
    ,SUM(gold_gun_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_gold_gun_num
    ,SUM(purple_gun_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_purple_gun_num
    ,SUM(gold_plugin_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_gold_plugin_num
    ,SUM(purple_plugin_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_purple_plugin_num
    ,SUM(limit_gold_gun_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_limit_gold_gun_num
    ,SUM(limit_purple_gun_num) OVER (PARTITION BY vopenid ORDER BY p_date) AS cumulative_limit_purple_gun_num
from
(select
    vopenid
    ,p_date
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as purple_gun_num
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_purple_gun_num
    ,sum(if(itemquality = 4 and igoodssubtype = 7,item_count,0)) as gold_plugin_num
    ,sum(if(itemquality = 3 and igoodssubtype = 7,item_count,0)) as purple_plugin_num
from
(select
    vopenid
    ,substr(tdbank_imp_date,1,8) as p_date
    ,iGoodsId
    ,iGoodsSubType
    --,sum(iCount) as item_count
    ,count(distinct iPropGID) as item_count
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    and env = 'live'
    and AddOrReduce = 0
    --and vrolename = '裁决之神审判'
    and iGoodsId not in ('20101000020','20103000016','20114000006')
    and iGoodsSubType in (1,7,9)
    and iGoodsType = 2
    --and reason in (67,82)
group by
    vopenid
    ,iGoodsId
    ,iGoodsSubType
    ,substr(tdbank_imp_date,1,8)
) itemflow
JOIN
(select
    distinct 
    itemId
    ,itemtype
    ,itemquality
    ,itemsubtype
from
    codez_dev_sr.codez_dev.dwd_sr_codez_item_di
where
    p_Date between '2025-09-08T00:00:00' and '2025-10-13T00:00:00'
    AND itemtype = 2) item on itemflow.iGoodsId = item.itemId
group by
    vopenid
    ,p_date
)
),
--付费金额
tbwater as
(
select 
    vopenid
    ,dtstatdate
    ,sum(imoney)/100 as imoney
from 
hy_idog_oss::codez_mid_tbwater
where dtstatdate >= '20250908' and dtstatdate <= '20251012' and platid = 255
group by
    vopenid
    ,dtstatdate)
SELECT
    playercluster
    ,act_player.p_date
    ,count(distinct playerlabel.vopenid) as playercount
    ,avg(OnlineTime) as avg_OnlineTime
    ,avg(game_num) as avg_game_num
    ,avg(lc_part_rate) as avg_lc_part_rate
    ,avg(tf_part_rate)  as avg_tf_part_rate
    ,avg(jj_part_rate) as avg_jj_part_rate
    ,avg(js_part_rate) as avg_js_part_rate
    ,avg(tz_part_rate) as avg_tz_part_rate
    ,avg(lc_rate) as avg_lc_rate
    ,avg(tf_rate) as avg_tf_rate
    ,avg(jj_rate) as avg_jj_rate
    ,avg(js_rate) as avg_js_rate
    ,avg(tz_rate) as avg_tz_rate
    ,avg(lc_avg_kills) as avg_lc_avg_kills
    ,avg(lc_avg_die) as avg_lc_avg_die
    ,avg(lc_avg_dps) as avg_lc_avg_dps
    ,avg(lc_avg_duration) as avg_lc_avg_duration
    ,avg(lc_max_difficulty) as avg_lc_max_difficulty
    ,avg(tf_max_difficulty) as avg_tf_max_difficulty
    ,avg(COALESCE(cumulative_gold_gun_num,0)) as avg_cumulative_gold_gun_num
    ,avg(COALESCE(cumulative_purple_gun_num,0)) as avg_cumulative_purple_gun_num
    ,avg(COALESCE(cumulative_gold_plugin_num,0)) as avg_cumulative_gold_plugin_num
    ,avg(COALESCE(cumulative_purple_plugin_num,0)) as avg_cumulative_purple_plugin_num    
    ,avg(COALESCE(cumulative_limit_gold_gun_num,0)) as avg_cumulative_limit_gold_gun_num
    ,avg(COALESCE(cumulative_limit_purple_gun_num,0)) as avg_cumulative_limit_purple_gun_num
    ,avg(COALESCE(imoney,0)) as avg_imoney
FROM
    playerlabel
left join
    act_player on playerlabel.vopenid = act_player.vopenid
left join
    gamedetail on playerlabel.vopenid = gamedetail.vopenid and act_player.p_date = gamedetail.p_date
left join
    GUN_Warframe on playerlabel.vopenid = GUN_Warframe.vopenid and act_player.p_date = GUN_Warframe.p_date
left join
    tbwater on playerlabel.vopenid = tbwater.vopenid and act_player.p_date = tbwater.dtstatdate
group by
    playercluster
    ,act_player.p_date





--玩家聚类匹配(汇总)
with act_player as
(SELECT
    vopenid
    --,substr(tdbank_imp_date,1,8) as p_date
    ,sum(OnlineTime) as OnlineTime
from
    ieg_tdbank::codez_dsl_Playerlogout_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    AND env = 'live'
GROUP BY
    vopenid
    --,substr(tdbank_imp_date,1,8)
),
playerlabel as
(SELECT
    vopenid
    ,case when playercluster = 0  then '0-上线打卡玩家'
    when playercluster = 1 then '1-多栖玩家'
    when playercluster = 2 then '2-核心塔防玩家'
    when playercluster = 3 then '3-猎场偏好玩家'
    when playercluster = 4 then '4-机甲偏好玩家'
    else '999' end as playercluster
from
    codez_clusterlabel_cbt3_all),
gamedetail as 
(select
    vopenid
    --,substr(tdbank_imp_date,1,8) as p_date
    ,count(distinct dsroomid) as game_num
    ,max(if(map_id = '僵尸猎场', 1,0)) as lc_part_rate
    ,max(if(map_id = '塔防',1,0)) as tf_part_rate
    ,max(if(map_id = '机甲战',1,0)) as jj_part_rate
    ,max(if(map_id = '猎场竞速',1,0)) as js_part_rate
    ,max(if(map_id = '挑战副本',1,0)) as tz_part_rate
    ,max(if(map_id = '时空追猎',1,0)) as zl_part_rate
    ,count(distinct if(map_id = '僵尸猎场', dsroomid,null))/count(distinct dsroomid) as lc_rate
    --,count(distinct if(map_id = '时空追猎', dsroomid,null))/count(distinct dsroomid) as zl_rate
    ,count(distinct if(map_id = '塔防', dsroomid,null))/count(distinct dsroomid) as tf_rate
    ,count(distinct if(map_id = '机甲战', dsroomid,null))/count(distinct dsroomid) as jj_rate
    ,count(distinct if(map_id = '猎场竞速', dsroomid,null))/count(distinct dsroomid) as js_rate
    ,count(distinct if(map_id = '挑战副本', dsroomid,null))/count(distinct dsroomid) as tz_rate
    ,count(distinct if(map_id = '时空追猎',dsroomid,null))/count(distinct dsroomid) as zl_rate
    ,sum(if(map_id = '僵尸猎场', iFinTime,0))/sum(iFinTime) as lc_time_rate
    ,sum(if(map_id = '塔防', iFinTime,0))/sum(iFinTime) as tf_time_rate
    ,sum(if(map_id = '机甲战', iFinTime,0))/sum(iFinTime) as jj_time_rate
    ,sum(if(map_id = '猎场竞速', iFinTime,0))/sum(iFinTime) as js_time_rate
    ,sum(if(map_id = '挑战副本', iFinTime,0))/sum(iFinTime) as tz_time_rate
    ,sum(if(map_id = '时空追猎', iFinTime,0))/sum(iFinTime) as zl_time_rate
    ,sum(if(map_id = '僵尸猎场',ikills,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_kills
    ,sum(if(map_id = '僵尸猎场',ideaths,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_die
    ,sum(if(map_id = '僵尸猎场',Damage,0))/sum(if(map_id = '僵尸猎场',iDuration,0)) as lc_avg_dps
    ,sum(if(map_id = '僵尸猎场',iDuration,0))/count(distinct if(map_id = '僵尸猎场', dsroomid,null)) as lc_avg_duration
    ,max(if(map_id = '僵尸猎场',map_difficulty,0)) as lc_max_difficulty
    ,max(if(map_id = '塔防',map_difficulty,0)) as tf_max_difficulty
from
(select
    *
from
    ieg_tdbank::codez_dsl_GameDetail_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    and env = 'live') gamedetail 
JOIN
(select
   distinct
      param1 as dungeon_id,
      param2,
      param4 as map_id,
      param7,
       case when param8 = '普通' then 1
      when param8 = '英雄' then 3
      when param8 = '炼狱' then 4
      when param8 = '困难' then 2
      when param8 = '折磨' then 5
      when param8 = '折磨II' then 6
      when param8 = '挑战模式' then 7
      when param8 = '竞速' then -1
      else -2
      end as map_difficulty
    from
      codez_dev_sr.codez_dev.codez_ret_excelconfiginfo_conf
   where  configname = 'FubenEntranceInfo'
   and (param8 in ('普通','英雄','炼狱','困难','折磨','折磨II','竞速','挑战模式') or param4 in ('机甲战','挑战副本','时空追猎'))) excelconfig on gamedetail.iDungeonID = excelconfig.dungeon_id
group by
    vopenid
    --,substr(tdbank_imp_date,1,8)
),
--金枪个数、紫枪个数、金插件个数、紫插件个数
GUN_Warframe as 
(select
    vopenid
    --,p_date
    ,SUM(gold_gun_num)  AS cumulative_gold_gun_num
    ,SUM(purple_gun_num)  AS cumulative_purple_gun_num
    ,SUM(gold_plugin_num)  AS cumulative_gold_plugin_num
    ,SUM(purple_plugin_num)  AS cumulative_purple_plugin_num
    ,SUM(limit_gold_gun_num)  AS cumulative_limit_gold_gun_num
    ,SUM(limit_purple_gun_num)  AS cumulative_limit_purple_gun_num
from
(select
    vopenid
    --,p_date
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) != '5' and igoodssubtype = 1,item_count,0)) as purple_gun_num
    ,sum(if(itemquality = 4 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_gold_gun_num
    ,sum(if(itemquality = 3 and SUBSTR(igoodsid, 8, 1) = '5' and igoodssubtype = 1,item_count,0)) as limit_purple_gun_num
    ,sum(if(itemquality = 4 and igoodssubtype = 7,item_count,0)) as gold_plugin_num
    ,sum(if(itemquality = 3 and igoodssubtype = 7,item_count,0)) as purple_plugin_num
from
(select
    vopenid
    -- ,substr(tdbank_imp_date,1,8) as p_date
    ,iGoodsId
    ,iGoodsSubType
    --,sum(iCount) as item_count
    ,count(distinct iPropGID) as item_count
from
    ieg_tdbank::codez_dsl_Itemflow_fht0
WHERE
    tdbank_imp_date between '2025090800' and '2025101223'
    and env = 'live'
    and AddOrReduce = 0
    --and vrolename = '裁决之神审判'
    and iGoodsId not in ('20101000020','20103000016','20114000006')
    and iGoodsSubType in (1,7,9)
    and iGoodsType = 2
    --and reason in (67,82)
group by
    vopenid
    ,iGoodsId
    ,iGoodsSubType
    --,substr(tdbank_imp_date,1,8)
) itemflow
JOIN
(select
    distinct 
    itemId
    ,itemtype
    ,itemquality
    ,itemsubtype
from
    codez_dev_sr.codez_dev.dwd_sr_codez_item_di
where
    p_Date between '2025-09-08T00:00:00' and '2025-10-13T00:00:00'
    AND itemtype = 2) item on itemflow.iGoodsId = item.itemId
group by
    vopenid
)
group by
    vopenid
),
--付费金额
tbwater as
(
select 
    vopenid
    --,dtstatdate
    ,sum(imoney)/100 as imoney
from 
hy_idog_oss::codez_mid_tbwater
where dtstatdate >= '20250908' and dtstatdate <= '20251012' and platid = 255
group by
    vopenid
    --,dtstatdate
    )
SELECT
    playercluster
    ,count(distinct playerlabel.vopenid) as playercount
    ,avg(OnlineTime) as avg_OnlineTime
    ,avg(game_num) as avg_game_num
    ,avg(lc_part_rate) as avg_lc_part_rate
    ,avg(tf_part_rate)  as avg_tf_part_rate
    ,avg(jj_part_rate) as avg_jj_part_rate
    ,avg(js_part_rate) as avg_js_part_rate
    ,avg(tz_part_rate) as avg_tz_part_rate
    ,avg(zl_part_rate) as avg_zl_part_rate
    ,avg(lc_rate) as avg_lc_rate
    ,avg(tf_rate) as avg_tf_rate
    ,avg(jj_rate) as avg_jj_rate
    ,avg(js_rate) as avg_js_rate
    ,avg(tz_rate) as avg_tz_rate
    ,avg(zl_rate) as avg_zl_rate
    ,avg(lc_time_rate) as avg_lc_time_rate
    ,avg(tf_time_rate) as avg_tf_time_rate
    ,avg(jj_time_rate) as avg_jj_time_rate
    ,avg(js_time_rate) as avg_js_time_rate
    ,avg(tz_time_rate) as avg_tz_time_rate
    ,avg(zl_time_rate) as avg_zl_time_rate
    ,avg(lc_avg_kills) as avg_lc_avg_kills
    ,avg(lc_avg_die) as avg_lc_avg_die
    ,avg(lc_avg_dps) as avg_lc_avg_dps
    ,avg(lc_avg_duration) as avg_lc_avg_duration
    ,avg(lc_max_difficulty) as avg_lc_max_difficulty
    ,avg(tf_max_difficulty) as avg_tf_max_difficulty
    ,avg(COALESCE(cumulative_gold_gun_num,0)) as avg_cumulative_gold_gun_num
    ,avg(COALESCE(cumulative_purple_gun_num,0)) as avg_cumulative_purple_gun_num
    ,avg(COALESCE(cumulative_gold_plugin_num,0)) as avg_cumulative_gold_plugin_num
    ,avg(COALESCE(cumulative_purple_plugin_num,0)) as avg_cumulative_purple_plugin_num    
    ,avg(COALESCE(cumulative_limit_gold_gun_num,0)) as avg_cumulative_limit_gold_gun_num
    ,avg(COALESCE(cumulative_limit_purple_gun_num,0)) as avg_cumulative_limit_purple_gun_num
    ,avg(COALESCE(imoney,0)) as avg_imoney
FROM
    playerlabel
left join
    act_player on playerlabel.vopenid = act_player.vopenid
left join
    gamedetail on playerlabel.vopenid = gamedetail.vopenid
left join
    GUN_Warframe on playerlabel.vopenid = GUN_Warframe.vopenid
left join
    tbwater on playerlabel.vopenid = tbwater.vopenid
group by
    playercluster