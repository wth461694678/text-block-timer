[English](README.md) | [中文](README.zh.md)

# 文本块计时器插件

一个为Obsidian设计的文本块计时工具，可以在笔记中为任意文本行添加计时功能。

## 功能特性

   <img src="https://github.com/wth461694678/text-block-timer/blob/main/demo.gif" width="50%" alt="">

- 为任意文本行添加计时器，支持同时执行多个计时器（正计时）
- ▶️/⏸️ 支持开始、暂停、继续计时，支持一个任务的多段计时累计
- ⏳ 实时显示累计时间
- 💾 计时数据持久化保存

## 使用方法

### （一）命令行+快捷键（推荐⭐️）

1. 为命令 "Text Block Timer: Toggle timer" 配置快捷键，方便快速使用
2. 当光标在某个文本块时，按下快捷键，即可实现timer的开始、暂停、继续操作
   <img src="https://github.com/wth461694678/text-block-timer/blob/main/command_shortcut.gif" width="50%" alt="">

### （二）鼠标操作

1. 在文本行上右键点击
2. 选择"开始计时"、"暂停计时"或"继续计时"
3. 计时器会以 `【⏳00:00:00 】`格式显示在文本块的行首
   <img src="https://github.com/wth461694678/text-block-timer/blob/main/right_click.gif" width="50%" alt="">

## 注意事项

- 建议保持文本块所在文件打开，否则会导致计时器的实时跳秒失效。但文件会保留计时器状态，下次打开文件时可以手动恢复计时。

## 开发信息

- 开发者: frankthwang
- 版本: 1.0.1
