[English](README.md) | [中文](README.zh.md)

# Text Block Timer Plugin

A text block timing tool designed for Obsidian, allowing you to add **count-up** timing functionality to any text line in your notes.

## Features

   <img src="https://github.com/wth461694678/text-block-timer/blob/main/demo.gif" width="75%" alt="">

- Add timers to any text line as many as you wsh (count-up timing)
- ▶️/⏸️ Supports start, pause, and continue timing, with multi-segment timing accumulation for a single task
- ⏳ Real-time display of accumulated time
- [💾](https://www.emojiall.com/zh-hans/emoji/%F0%9F%92%BE) Timing data is persistently saved

## Usage Method

[Strongly Recommended] Write your task first before adding a timer!

### (1) Command Palette + Shortcuts (Recommended ⭐️)

1. Assign a shortcut for the command "Text Block Timer: Toggle timer" for quick access
2. Place your cursor on a text block, press the shortcut to start, pause, or continue
   <img src="https://github.com/wth461694678/text-block-timer/blob/main/command_shortcut.gif" width="75%" alt="">

### (2) Mouse Operations

1. Right-click on a text line
2. Select "Start Timer", "Pause Timer", or "Continue Timer"
3. The timer will display in the format `【⏳00:00:00 】` at the start of the text block
   <img src="https://github.com/wth461694678/text-block-timer/blob/main/right_click.gif" width="75%" alt="">

## Notes

- It is recommended to keep the file (containing a running tiemr) open; otherwise, the real-time second updates of the timer may fail.
- However, the file will record the timer state, which can be manually resumed.

## Changelog:
- V1.0.1
   1. A space is added before the time tag to better distinguish it from your content.
   2. Fixed the issue where adding a timer disrupted the structure of checkboxes in Markdown.
- V1.0.0
   1. Plugin release

## Development Information

- Developer: frankthwang
- Version: 1.0.1
