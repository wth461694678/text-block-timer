[English](README.md) | [中文](README.zh.md)

# Text Block Timer Plugin

A text block timing tool designed for Obsidian, allowing you to add timing functionality to any text line in your notes.

## Features

- Add timers to text lines (count-up timing)
- ▶️/⏸️ Supports start, pause, and continue timing, with multi-segment timing accumulation for a single task
- ⏳ Real-time display of accumulated time
- 📊 Timing data is persistently saved

## Installation Method

1. In Obsidian, open "Settings" → "Community Plugins"
2. Click "Browse" and search for "Text Block Timer"
3. Install and enable the plugin

## Usage Method

### (1) Command Palette + Shortcuts (Recommended ⭐️)
1. Assign a shortcut for the command "Text Block Timer: Toggle timer" for quick access
2. Place your cursor on a text block, press the shortcut to start, pause, or continue
<img src="https://github.com/wth461694678/text-block-timer/blob/main/command_shortcut.gif" width="50%" alt="">

### (2) Mouse Operations
1. Right-click on a text line
2. Select "Start Timer", "Pause Timer", or "Continue Timer"
3. The timer will display in the format `【⏳00:00:00 】` at the start of the text block
<img src="https://github.com/wth461694678/text-block-timer/blob/main/right_click.gif" width="50%" alt="">

## Notes

- It is recommended to keep the file (containing a running tiemr) open; otherwise, the real-time second updates of the timer may fail.
- However, the file will record the timer state, which can be manually resumed.

## Development Information

- Developer: frankthwang
- Version: 1.0.0
