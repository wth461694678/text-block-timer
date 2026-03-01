# SQL 统一代码风格规范

> 本文件定义跨项目的统一 SQL 编码规范，所有项目生成的 SQL 必须遵循此风格。
> **此文件为全局共享配置，修改会影响所有项目。**

---

## 一、SQL 结构规范

### 1.1 禁止使用 CTE，使用子查询嵌套
- **不使用** `WITH ... AS` (CTE) 格式
- 使用 `SELECT` 子查询嵌套（即 `FROM (SELECT ...) alias` 的形式）
- 所有生成的 SQL 必须遵循此规则

### 1.2 整体结构
- `select ... from (...)alias left join (...)alias on ...` 大嵌套结构
- 别名紧跟括号：`)active`、`)fatigue`、`)fight`，右括号后直接跟别名，无空格

### 1.3 别名命名
- 子查询别名应有业务含义（如 `reg`、`prefer`、`battle`、`dungeon_conf`、`active`）
- **禁止**使用无意义的 `t1`、`t2`、`p`、`pp`、`f`、`d` 等

### 1.4 注释规范
- 子查询前用注释分隔线标注模块名：
  ```sql
  ------------------------- 注册玩家 --------------------------
  ```
- SQL 开头必须有头部注释块：
  ```sql
  -- ============================================
  -- 需求: [业务需求简述]
  -- 口径说明:
  --   [口径1]: [定义]
  --   [口径2]: [定义]
  -- 数据源: [表名]
  -- 时间范围: [日期范围]
  -- ============================================
  ```

---

## 二、格式细节

### 2.1 关键字
- 全小写：`select`, `from`, `where`, `group by`, `left join`, `union all`, `order by`, `having`, `on`, `as`, `and`, `or`, `in`, `between`, `case`, `when`, `then`, `else`, `end`

### 2.2 逗号风格
- 前置逗号（leading comma），每行开头逗号：
  ```sql
  select
      column_a
      ,column_b
      ,column_c
  ```

### 2.3 缩进
- 4 空格缩进

### 2.4 条件格式
- 条件紧凑：`and env = 'live'`
- `CAST` 写法：`cast(col as string)`, `cast(col as bigint)`（SR 不支持 `signed`/`unsigned`，用 `bigint`/`int` 代替）
- 空值处理：`coalesce(t.col, 0)`, `coalesce(t.col, '')`, `coalesce(t.col, '{}')`

---

## 三、性能规范

### 3.1 分区字段优先
- 每个子查询的 WHERE 条件中，**分区字段过滤必须写在第一行**
- 常见分区字段：`tdbank_imp_date` / `dteventdate` / `dtstatdate` / `dteventtime` / `p_date` / `idate`
- 不要把分区过滤放在 JOIN ON 中，应下沉到子查询的 WHERE 里
- 每张表在被引用时都应尽早通过分区字段裁剪数据范围

### 3.2 中间表优先
- 生成 SQL 前，必须先检查项目的口径记忆中记录的中间表字段
- 若需要的字段已在中间表中存在，应直接从中间表取值，而非重新从明细表聚合计算

### 3.3 表来源优先级（跨库关联）
- 第一优先：全 TDW 表（同库关联性能最优）
- 第二优先：全 SR 表
- 第三优先：TDW 关联 SR（仅当某些表只在 SR 侧有时才混用）

---

## 四、引擎规范

### 4.1 优先使用 SR 引擎
- SR 引擎可直接查询 TDW 表，因此数据源表名优先用 TDW 命名
- 函数语法优先使用 SR（MySQL 风格），不使用 Hive 特有函数

### 4.2 SR 平台特殊要求
- SQL **不以分号 `;` 结尾**
- 最外层必须套 `select * from (...) a`
- 参数化变量使用 `${:sys_starttime}` / `${:sys_endtime}`

### 4.3 SR 函数映射（Hive → SR）

| Hive 函数 | SR 等价函数 | 备注 |
|-----------|------------|------|
| collect_list(col) | array_agg(col) | 聚合为数组 |
| collect_set(col) | array_agg(distinct col) | 聚合为去重数组 |
| array_contains(arr,val) | array_contains(arr,val) | 同名可用 |
| concat_ws(sep, arr) | array_join(arr, sep) | 数组转字符串 |
| size(arr) | array_length(arr) / cardinality(arr) | 数组长度 |
| sort_array(arr) | array_sort(arr) | 数组排序 |
| explode(arr) | unnest(arr)（TABLE FUNCTION） | 数组展开 |
| posexplode(arr) | 无直接等价，用 unnest + 序号 | |
| split(str,sep) | split(str,sep) | SR 也支持 |
| get_json_object(json,path) | json_query(json,path) / get_json_string/int/double | JSON 提取 |
| lateral view explode | unnest (TABLE FUNCTION) | 行展开 |
| NVL(a,b) | ifnull(a,b) / coalesce(a,b) | 空值替换 |
| datediff(a,b) | datediff(a,b) | 同名可用 |
| date_add(dt,N) | date_add(dt, interval N day) | 语法略不同 |
| date_sub(dt,N) | date_sub(dt, interval N day) | 语法略不同 |
| from_unixtime(ts,'fmt') | from_unixtime(ts,'fmt') | 同名可用 |
| unix_timestamp(dt) | unix_timestamp(dt) | 同名可用 |
| regexp_extract(str,pat,idx) | regexp_extract(str,pat,idx) | 同名可用 |
| concat(a,b,...) | concat(a,b,...) | 同名可用 |
| substr/substring | substr/substring | 同名可用 |
| if(cond,a,b) | if(cond,a,b) | 同名可用 |
| case when | case when | 标准SQL |
| cast(x as type) | cast(x as type) | 同名，注意 bigint 对应 |

### 4.4 SR 特有函数

| 函数 | 用途 |
|------|------|
| group_concat(col [order by ...] separator sep) | 聚合拼接字符串 |
| retention(conditions...) | 留存分析专用聚合函数 |
| window_funnel(window, timestamp, events...) | 漏斗分析函数 |
| any_value(col) | 取任意非NULL值 |
| array_sortby(arr, sort_arr) | 按另一数组排序 |
| array_filter(arr, lambda) | Lambda 过滤数组 |
| array_map(lambda, arr) | Lambda 映射数组 |
| json_object(k1,v1,k2,v2...) | 构造JSON对象 |
| json_array(v1,v2,...) | 构造JSON数组 |
| parse_json(str) | 解析JSON字符串 |
| equiwidth_bucket(val,min,max,n) | 等宽分桶 |

---

## 五、百分比与数值格式

- 所有百分比指标统一用小数形式展示（如 0.65 表示 65%），不乘以 100
- 适用于所有 SQL 输出中的比率/占比字段

---
