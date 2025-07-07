[English](https://github.com/wth461694678/text-block-timer/blob/main/README.md) | [中文](https://github.com/wth461694678/text-block-timer/blob/main/README.zh.md)

# 文本块计时器插件

一个为Obsidian设计的文本块计时工具，可以在笔记中为任意文本行添加**正计时**功能。

## 功能特性

<img src="https://github.com/wth461694678/text-block-timer/blob/main/demo.gif" width="100%" alt="">

- 为任意文本行添加计时器，支持同时执行多个计时器（正计时）
- ▶️/⏸️ 支持开始、暂停、继续计时，支持任务分段耗时累计
- ⏳ 实时显示累计时间
- 💾 计时数据持久化保存
- 🔄 可自由选择关闭文件、关闭Obsidian后是否持续计时 （默认设置下，关闭文件不会导致实时计时失效）

## 使用方法

### 1. 命令行+快捷键（推荐⭐️）

1. 为命令 "Text Block Timer: Toggle timer" 配置快捷键，方便快速使用
2. 当光标在某个文本块时，按下快捷键，即可实现timer的开始、暂停、继续操作
3. 计时器会以 `【⏳00:00:00 】`格式显示在文本块的行首
<img src="https://github.com/wth461694678/text-block-timer/blob/main/command_shortcut.gif" width="80%" alt="">

### 2. 鼠标操作

1. 在文本行上右键点击
2. 选择"开始计时"、"暂停计时"或"继续计时"
<img src="https://github.com/wth461694678/text-block-timer/blob/main/right_click.gif" width="80%" alt="">

## 自定义设置

用户可以在插件设置中自定义以下选项：

### 1. 关闭文件或Obsidian后是否继续计时
用户可以自由选择关闭文件或关闭Obsidian后是否继续计时。

#### 1.1 从不停止，除非用户手动停止 
用户关闭文件、退出Obsidian后，计时器依然会“后台计时”，在下次打开文件时，会讲关闭期间的耗时计入计时器耗时，并自动恢复计时。

#### 1.2 仅退出Obsidian时停止，关闭文件依然后台计时（推荐，默认选项）
用户关闭文件后，计时器依然会“后台计时”，在下次打开文件时，会讲关闭期间的耗时计入计时器耗时，并自动恢复计时。
然而，用户退出Obsidian后，所有计时器会立即停止，防止用户忘记手动关闭计时器导致数据产生重大误差。

#### 1.3 关闭文件时立即停止
用户关闭文件后，所有计时器会立即停止，但在误关文件时，可能导致计时暂停。

### 2. 插入位置
用户可以选择在文本块的前面或后面插入计时器标签。
<img src="https://github.com/wth461694678/text-block-timer/blob/main/insert_position.png" width="80%" alt="">

## 版本日志：

- V1.0.3
  1. ==重大优化==：现在关闭文件不会导致计时器失效，用户可自由选择关闭文件或关闭Obsidian后是否持续计时（见自定义设置）
  2. 增加自定义设置：现在用户可自由选择插入文本块位置（文本前或文本后）
  3. 优化对Markdown的处理逻辑，增加对有序复选框、标题的支持
- V1.0.2
  1. 增加了对中文、英文、日语、韩语的语言支持
- V1.0.1
  1. 优化展示效果，在时间标签前添加了一个空格。
  2. 解决了在任务清单中添加计时器，导致任务勾选框失效的问题。
- V1.0.0
  1. 插件发布

## 开发信息

- 开发者: frankthwang
- 版本: 1.0.3