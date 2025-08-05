[English](https://github.com/wth461694678/text-block-timer/blob/main/README.md) | [中文](https://github.com/wth461694678/text-block-timer/blob/main/README.zh.md)

# Text Block Timer Plugin

A text block timing tool designed for Obsidian, allowing you to add a **count-up stopwatch** function to any text line in your notes.

## Features

![Demo](https://github.com/wth461694678/text-block-timer/blob/main/demo/demo.gif)

- Add timers to any text line, supporting multiple timers running simultaneously (stopwatch function).
- ▶️/⏸️ Start, pause, and resume timing for tasks.
- ⏳ Real-time display of cumulative time cost.
- 💾 Persistent storage of timing data.
- 🔄 Users can optionally choose whether to continue timing when files or Obsidian is closed (by default, closing a file will not cause failure of the real-time stopwatch).
- By modifying the task status, you can automatically trigger the start and update of the timer

## How to use

### 1. Command Palette + Shortcut (Recommended⭐️)

1. Configure a shortcut for the command "Text Block Timer: Toggle timer" for quick access.
2. When the cursor is on a text block, press the shortcut key to start, pause, resume, or delete the timer.
3. The timer will be displayed in the format `【⏳00:00:00 】` at the beginning of the text line.

![Command Shortcut](https://github.com/wth461694678/text-block-timer/blob/main/demo/command_shortcut.gif)

### 2. Mouse Operations (Not Recommended)

1. Right-click on a text line.
2. Select "Start Timer", "Pause Timer", "Resume Timer", or "Delete Timer".

![Right Click](https://github.com/wth461694678/text-block-timer/blob/main/demo/right_click.gif)

### 3. Control Timer by Task Status Automatically (Recommended⭐️)

1. For For Common Users, you can directly change the task status [ ] to trigger the start and update of the timer (Suits for everyone, however not convenient enough, especially for Windows users.)
2. ⭐️For `Task Plugin` Users, you can trigger the start and update of timers by simply clicking the checkbox (Convenient but needs pre-settings)

![controlbycheckbox](https://github.com/wth461694678/text-block-timer/blob/main/demo/controlbycheckbox.gif)

## Custom Settings

Users can customize the following options in the plugin Settings:

### 1. Whether to continue timing after the file or Obsidian closed

Users can freely choose whether to continue the timing after closing the file or disabling Obsidian.

#### 1.1 never stops unless the user stops manually

After a user closes a file or exits Obsidian, the timer will still "time in the background". When the file is opened next time, the time spent during the closure period will be counted as the timer time and the timing will automatically resume.

![settings_never](https://github.com/wth461694678/text-block-timer/blob/main/demo/settings_never.gif)

#### 1.2 auto-stop only when exiting Obsidian. Background timing continues when closing files (recommended, default option)

After the user closes a file, the timer will still "time in the background". When the file is opened next time, the time spent during the closing period will be counted as the timer time and the timing will automatically resume.
However, once the user exits Obsidian, all timers will stop immediately to prevent significant data errors caused by the user forgetting to manually close the timers.

![settings_quit](https://github.com/wth461694678/text-block-timer/blob/main/demo/settings_quit.gif)

#### 1.3 auto-stop immediately when closing a file

After the user closes a file, all timers will stop immediately. However, if a file is closed by mistake, it may cause the timer to pause.

![settings_close](https://github.com/wth461694678/text-block-timer/blob/main/demo/settings_close.gif)

### 2. Timer insert position

Users can choose to insert a timer label either before or after the text block.
![insert_position](https://github.com/wth461694678/text-block-timer/blob/main/demo/insert_position.png)

### 3. Control Timer by Task Status Automatically - Path Control

In the default settings, path control is disabled. When you only want to use the timer in specific folders, you can use a whitelist or blacklist to control it, which will only take effect in one of the two ways.

- Disable path control：this feature can always take place
  ![pathControl_no](https://github.com/wth461694678/text-block-timer/blob/main/demo/pathControl_no.gif)
- Whitelist：only folders in the whitelist will work
  ![pathControl_white](https://github.com/wth461694678/text-block-timer/blob/main/demo/pathControl_white.gif)
- Blacklist：folders in the blacklist will not work
  ![pathControl_black](https://github.com/wth461694678/text-block-timer/blob/main/demo/pathControl_black.gif)

## Version Log:
- V1.0.5
  1. **==Major Feature==**: This plugin now supports usage on the Mobile end!
  2. **==Major Optimization==**: Added support for **read-only mode**, now the timer can be updated in real time and data can be persisted even in read-only mode.
  3. **==Major Feature==**: Added a timer deletion function, which can be accessed through the command line or right-click menu.
  4. **Slimming Plan for Timer Blocks**: The length of Timer blocks has been significantly reduced by 60% in version V1.0.5.
  5. Bug Fix: Fixed the issue where time display was incorrect after exceeding 24 hours.

- V1.0.4
  1. **==Major Feature==**: Now you can control the timer switch by the checkbox in the task front.
  2. Improve the function of creating timers, now it will not directly expose the span's source code
- V1.0.3
  1. **==Major Optimization==**: Closing a file no longer causes the timer to fail. Users can freely choose whether to continue timing when the or Obsidian is closed (see custom settings).
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
- Version: 1.0.5
