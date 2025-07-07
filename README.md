# Text Block Timer Plugin

A text block timing tool designed for Obsidian, allowing you to add a **count-up stopwatch** function to any text line in your notes.

## Features

![Demo](https://github.com/wth461694678/text-block-timer/blob/main/demo.gif)

- Add timers to any text line, supporting multiple timers running simultaneously (stopwatch function).
- ▶️/⏸️ Start, pause, and resume timing for tasks.
- ⏳ Real-time display of cumulative time cost.
- 💾 Persistent storage of timing data.
- 🔄 Users can optionally choose whether to continue timing when files or Obsidian is closed (by default, closing a file will not cause failure of the real-time stopwatch).

## Usage

### (I) Command Palette + Shortcut (Recommended⭐️)

1. Configure a shortcut for the command "Text Block Timer: Toggle timer" for quick access.
2. When the cursor is on a text block, press the shortcut key to start, pause, or resume.
3. The timer will be displayed in the format `【⏳00:00:00 】` at the beginning of the text line.

![Command Shortcut](https://github.com/wth461694678/text-block-timer/blob/main/command_shortcut.gif)

### (II) Mouse Operations

1. Right-click on a text line.
2. Select "Start Timer," "Pause Timer," or "Resume Timer."

![Right Click](https://github.com/wth461694678/text-block-timer/blob/main/right_click.gif)

## Version Log:

- V1.0.3
  1. ==Major Optimization==: Closing a file no longer causes the timer to fail. Users can freely choose whether to continue timing when the or Obsidian is closed (see custom settings).
  2. Added custom settings: Users can now choose the position to insert the timer (before or after texts).
  3. Improve compatibility with markdown, adding support for ordered checkboxes and headings.
- V1.0.2
  1. Added language support for Chinese, English, Japanese, and Korean.
- V1.0.1
  1. Improved display effects by adding a space before the time label.
  2. Fixed the issue where adding a timer to a task list caused the task checkbox to fail.
- V1.0.0
  1. Plugin release

## Development Information

- Developer: frankthwang
- Version: 1.0.3