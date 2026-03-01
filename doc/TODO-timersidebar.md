1. [ ] 新增功能：当通过timer-sidebar点击跳转，定位不到源文件时，需要触发一次全局搜索这个timer，重新定位并跳转到搜索到的位置，如搜索不到则在数据库中标记为已删除，并从sidebar中删除
2. [ ] bug：数据库记录的lineText中，应该剔除timer的HTML源代码
3. [ ] 新增功能：需要引入echarts，在明细的上方绘制统计图，具体图表类型参考https://echarts.apache.org/examples/zh/editor.html?c=dataset-link，默认：上方为按project的时长占比饼图，下方为各project的7日逐日时长走势，时长指标单位要根据实际的时长展示为秒/分钟/小时。具体展示几天的日期需要提供时间筛选器。时长的聚合单位也要提供日/周/月/年选项。
