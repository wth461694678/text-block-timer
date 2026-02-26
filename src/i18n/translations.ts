// —— Translations —— //
export const TRANSLATIONS: Record<string, any> = {
    en: {
        command_name: {
            toggle: "Toggle timer",
            delete: "Delete timer",
            timeAdjust: "Time Adjustment"
        },
        action_start: "Start timer",
        action_paused: "Pause timer",
        action_continue: "Continue timer",
        timeBackfill: {
            menu: "Time Adjustment",
            title: "Set Time Cost To",
            disabledTip: "Only works on paused timers",
            hours: "Hours",
            minutes: "Minutes",
            seconds: "Seconds",
            save: "Save"
        },
        settings: {
            name: "Text Block Timer Settings",
            desc: "Configure timer behavior",
            tutorial: "For detailed instructions, visit: ",
            askforvote: "If you find this plugin helpful, please consider giving it a star on GitHub!🌟",
            issue: "If you encounter any issues, please report them on GitHub along with version and steps to reproduce.",
            sections: {
                basic: { name: "Basic Settings" },
                bycommand: {
                    name: "Timer by Command",
                    desc: "Use the command palette to toggle timers"
                },
                byeditormenu: {
                    name: "Timer by Editor Menu",
                    desc: "Right-click in the editor to access timer options"
                },
                bycheckbox: {
                    name: "Timer by Checkbox",
                    desc: "Configure checkbox-based timer controls"
                },
                appearance: { name: "Appearance Settings" }
            },
            autostop: {
                name: "Auto-stop timers",
                desc: "When to automatically stop running timers",
                choice: {
                    never: "Never",
                    quit: "On Obsidian quit",
                    close: "On file close"
                }
            },
            insertlocation: {
                name: "Timer insert location",
                desc: "End of line recommened if you use Day Planner Plugin as well.",
                choice: {
                    head: "Beginning of line",
                    tail: "End of line"
                }
            },
            timerIcon: {
                runningIcon: {
                    name: "Running timer icon",
                    desc: "Set the icon displayed for running timers (default: ⏳)"
                },
                pausedIcon: {
                    name: "Paused timer icon",
                    desc: "Set the icon displayed for paused timers (default: 💐)"
                }
            },
            timeDisplayFormat: {
                name: "Time Display Format",
                desc: "Choose how the time is displayed",
                choice: {
                    full: "Full Format (HH:MM:SS) - Always show hours, minutes, and seconds",
                    smart: "Smart Format - Hide hours when zero (MM:SS), show full format (HH:MM:SS) when > 1 hour"
                }
            },
            timerDisplayStyle: {
                name: "Timer Display Style",
                desc: "Choose the visual style for timer display (applies to both edit and reading modes)",
                choice: {
                    badge: "Badge - Timer shown as a styled badge with background and border",
                    plain: "Plain - Timer shown as simple colored text"
                }
            },
            timerColors: {
                runningText: {
                    name: "Running Timer Text Color",
                    desc: "Text color for running timers"
                },
                runningBg: {
                    name: "Running Timer Background Color",
                    desc: "Background color for running timers (badge mode only)"
                },
                pausedText: {
                    name: "Paused Timer Text Color",
                    desc: "Text color for paused timers"
                },
                pausedBg: {
                    name: "Paused Timer Background Color",
                    desc: "Background color for paused timers (badge mode only)"
                }
            },
            enableCheckboxToTimer: {
                name: "Enable checkbox to timer",
                desc: "Allow checkboxes to control timers",
                runningSymbolStr: {
                    name: "Running checkbox state",
                    desc: "Checkbox symbols that start/continue timers"
                },
                pausedSymbolStr: {
                    name: "Paused checkbox state",
                    desc: "Checkbox symbols that pause timers"
                },
                pathControl: {
                    name: "Path restriction",
                    desc: "Control which files can use checkbox timers",
                    choice: {
                        disable: "No restrictions",
                        whitelist: "Whitelist",
                        blacklist: "Blacklist"
                    },
                    manage: {
                        name: "Path control (File Groups)",
                        descTemplate: "File-group based path control. {count} group(s) defined. Feature is enabled when the file matches any group (blacklist > whitelist within each group). Leave empty to apply to all files.",
                        btn: "Manage"
                    }
                }
            },
            statusBar: {
                sectionTitle: "Status Bar",
                show: {
                    name: "Show status bar",
                    desc: "Display timer info in the bottom status bar."
                },
                mode: {
                    name: "Status bar display mode",
                    desc: "Choose what duration to show: the longest running timer, or the total of all running timers.",
                    choice: {
                        max: "Longest running timer",
                        total: "Total running duration"
                    }
                },
                noRunning: "No running timers",
                running: "running"
            },
            sidebar: {
                sectionTitle: "Timer Sidebar",
                tabPosition: {
                    name: "Sidebar tab position",
                    desc: "The tab index (1-based) where the Timer Sidebar should be placed in the right panel. Default: 4."
                },
                defaultView: {
                    name: "Default view",
                    desc: "Default scope when opening the sidebar.",
                    choice: {
                        openTabs: "Current session",
                        activeFile: "Current file",
                        all: "All"
                    }
                },
                defaultFilter: {
                    name: "Default status filter",
                    choice: {
                        all: "All",
                        running: "Running",
                        paused: "Paused"
                    }
                },
                defaultGroupFilter: {
                    name: "Default group filter",
                    desc: "Pre-select a file group when opening the global view. Only takes effect when the default view is \"All\".",
                    none: "None (show all)"
                },
                defaultSort: {
                    name: "Default sort",
                    choice: {
                        status: "Status first",
                        durDesc: "Duration ↓",
                        durAsc: "Duration ↑",
                        filenameAsc: "Filename ↑",
                        filenameDesc: "Filename ↓",
                        updated: "Recently updated"
                    }
                },
                autoRefresh: {
                    name: "Auto refresh sidebar",
                    desc: "Refresh running timer durations every second."
                },
                fileGroups: {
                    name: "File Groups",
                    descTemplate: "Manage named file groups to filter the global view. {count} group(s) defined.",
                    btn: "Manage"
                },
                scopeLabels: {
                    activeFile: "Current file",
                    openTabs: "Current session",
                    all: "All"
                },
                filterLabels: {
                    all: "All",
                    running: "Running",
                    paused: "Paused"
                },
                sortLabels: {
                    status: "Status first",
                    durDesc: "Duration ↓",
                    durAsc: "Duration ↑",
                    filenameDesc: "Filename ↓",
                    filenameAsc: "Filename ↑",
                    updated: "Recently updated"
                },
                allGroups: "All groups",
                allViewNotice: "All-library view is under development",
                summary: {
                    timerCount: "Timers",
                    duration: "Duration",
                    total: "Total"
                },
                emptyState: {
                    activeFile: "No timers in current file",
                    openTabs: "No timers in current session",
                    all: "No timer data"
                },
                actions: {
                    pause: "Pause",
                    resume: "Resume"
                }
            }
        }
    },
    zh: {
        command_name: {
            toggle: "启动计时器/切换计时器状态",
            delete: "删除计时器",
            timeAdjust: "调整耗时"
        },
        action_start: "开始计时",
        action_paused: "暂停计时",
        action_continue: "继续计时",
        timeBackfill: {
            menu: "调整耗时",
            title: "设定耗时为",
            disabledTip: "仅对暂停中的计时器生效",
            hours: "小时",
            minutes: "分钟",
            seconds: "秒",
            save: "保存"
        },
        settings: {
            name: "文本块计时器设置",
            desc: "配置计时器行为",
            tutorial: "更多图片和视频教程，请访问：",
            askforvote: "如果你喜欢这款插件，请为我的Github项目点个Star🌟",
            issue: "如果有任何问题或建议，可以在Github项目中提出Issue，并注明使用的插件版本和复现步骤，中国用户遇到阻断BUG可以直接联系微信Franklin_wth",
            sections: {
                basic: { name: "通用设置" },
                bycommand: {
                    name: "通过命令行控制计时器",
                    desc: "强烈建议给命令`启动计时器/切换计时器状态`添加一个快捷键，并使用快捷键控制计时器"
                },
                byeditormenu: {
                    name: "通过右键菜单控制计时器",
                    desc: "你可以通过右键菜单快速体验计时器功能，但并不推荐这种使用方式（尤其是Mac系统）"
                },
                bycheckbox: {
                    name: "通过任务状态自动控制计时器",
                    desc: "你可以在切换任务状态（复选框类型）的同时，自动生成或更新计时器，对Tasks Plugin（任务插件）用户友好"
                },
                appearance: { name: "外观设置" }
            },
            autostop: {
                name: "自动停止计时器",
                desc: "哪些行为视作用户手动停止计时器",
                choice: {
                    never: "从不停止，除非用户手动停止",
                    quit: "仅退出 Obsidian 时停止，关闭文件依然后台计时",
                    close: "关闭文件时立即停止"
                }
            },
            insertlocation: {
                name: "计时器插入位置",
                desc: "配合Day Planner插件使用时，推荐在文本后插入",
                choice: {
                    head: "在文本前插入",
                    tail: "在文本后插入"
                }
            },
            timerIcon: {
                runningIcon: {
                    name: "运行中计时器图标",
                    desc: "设置运行中计时器显示的图标（默认: ⏳）"
                },
                pausedIcon: {
                    name: "暂停计时器图标",
                    desc: "设置暂停计时器显示的图标（默认: 💐）"
                }
            },
            timeDisplayFormat: {
                name: "时间显示格式",
                desc: "选择时间的显示方式",
                choice: {
                    full: "完整格式 (HH:MM:SS) - 总是显示小时、分钟和秒数",
                    smart: "智能格式 - 小时为零时隐藏 (MM:SS)，超过1小时时显示完整格式 (HH:MM:SS)"
                }
            },
            timerDisplayStyle: {
                name: "计时器显示风格",
                desc: "选择计时器的显示风格（同时应用于编辑模式和阅读模式）",
                choice: {
                    badge: "徽章样式 - 带背景色和边框的标签风格",
                    plain: "纯文本样式 - 仅显示彩色文字"
                }
            },
            timerColors: {
                runningText: {
                    name: "运行中计时器文字颜色",
                    desc: "运行中计时器的文字颜色"
                },
                runningBg: {
                    name: "运行中计时器背景颜色",
                    desc: "运行中计时器的背景颜色（仅徽章模式）"
                },
                pausedText: {
                    name: "已暂停计时器文字颜色",
                    desc: "已暂停计时器的文字颜色"
                },
                pausedBg: {
                    name: "已暂停计时器背景颜色",
                    desc: "已暂停计时器的背景颜色（仅徽章模式）"
                }
            },
            enableCheckboxToTimer: {
                name: "使用任务状态控制计时器",
                desc: "启用此功能后，你可以通过更改任务框的状态自动控制计时器的启动、暂停、继续",
                runningSymbolStr: {
                    name: "触发计时器开始/继续的任务状态符号",
                    desc: "任务状态符号应为合法的单个字符，如 /, 如希望多种符号都能触发计时器开始/继续，请直接把这些字符连接起来，如/>+"
                },
                pausedSymbolStr: {
                    name: "触发计时器暂停的任务状态符号",
                    desc: "任务状态符号应为合法的单个字符，如 x, 如希望多种符号都能触发计时器暂停，请直接把这些字符连接起来，如xX-"
                },
                pathControl: {
                    name: "是否启用路径控制",
                    desc: "是否需要限制在哪些文件夹内才能用任务状态控制计时器，注意：当路径直接指向文件时，必须显式声明文件后缀。如 `日记/2025`是个目录,`日记/20250101.md`是文件。",
                    choice: {
                        disable: "不启用路径控制，vault下所有文件都可以用任务状态控制计时器",
                        whitelist: "启用白名单路径控制，只有白名单路径中的文件才能用任务状态控制计时器",
                        blacklist: "启用黑名单路径控制，只有黑名单路径以外的文件才能用任务状态控制计时器"
                    },
                    manage: {
                        name: "路径控制（文件组）",
                        descTemplate: "基于文件组的路径控制，已定义 {count} 个组。文件匹配任意一个组即可启用功能（组内黑名单优先于白名单）。留空则对所有文件生效。",
                        btn: "管理"
                    }
                }
            },
            statusBar: {
                sectionTitle: "状态栏",
                show: {
                    name: "显示状态栏",
                    desc: "在底部状态栏显示计时器信息。"
                },
                mode: {
                    name: "状态栏显示模式",
                    desc: "选择显示的时长：最长运行计时器的时长，或所有运行中计时器的总时长。",
                    choice: {
                        max: "运行中最长时长",
                        total: "运行中总时长"
                    }
                },
                noRunning: "无运行中计时器",
                running: "运行中"
            },
            sidebar: {
                sectionTitle: "计时器侧边栏",
                tabPosition: {
                    name: "侧边栏标签位置",
                    desc: "计时器侧边栏在右侧面板中的标签序号（从1开始）。默认：4。"
                },
                defaultView: {
                    name: "默认视图",
                    desc: "打开侧边栏时的默认展示范围。",
                    choice: {
                        openTabs: "当前会话",
                        activeFile: "当前文件",
                        all: "全部"
                    }
                },
                defaultFilter: {
                    name: "默认状态筛选",
                    choice: {
                        all: "全部",
                        running: "运行中",
                        paused: "已暂停"
                    }
                },
                defaultGroupFilter: {
                    name: "默认文件组筛选",
                    desc: "打开全局视图时预先选中的文件组。仅在默认视图为\"全部\"时生效。",
                    none: "不限（显示全部）"
                },
                defaultSort: {
                    name: "默认排序",
                    choice: {
                        status: "状态优先",
                        durDesc: "时长↓",
                        durAsc: "时长↑",
                        filenameAsc: "文件名↑",
                        filenameDesc: "文件名↓",
                        updated: "最近更新"
                    }
                },
                autoRefresh: {
                    name: "自动刷新侧边栏",
                    desc: "每秒刷新运行中计时器的时长。"
                },
                fileGroups: {
                    name: "文件组",
                    descTemplate: "管理命名文件组，用于在全局视图中筛选。已定义 {count} 个组。",
                    btn: "管理"
                },
                scopeLabels: {
                    activeFile: "当前文件",
                    openTabs: "当前会话",
                    all: "全部"
                },
                filterLabels: {
                    all: "全部",
                    running: "运行中",
                    paused: "已暂停"
                },
                sortLabels: {
                    status: "状态优先",
                    durDesc: "时长↓",
                    durAsc: "时长↑",
                    filenameDesc: "文件名↓",
                    filenameAsc: "文件名↑",
                    updated: "最近更新"
                },
                allGroups: "全局",
                allViewNotice: "全库视图功能开发中",
                summary: {
                    timerCount: "计时器数量",
                    duration: "时长统计",
                    total: "总计"
                },
                emptyState: {
                    activeFile: "当前文件没有计时器",
                    openTabs: "当前会话没有计时器",
                    all: "暂无计时器数据"
                },
                actions: {
                    pause: "暂停",
                    resume: "继续"
                }
            }
        }
    },
    zhTW: {
        command_name: {
            toggle: "啟動計時器/切換計時器狀態",
            delete: "刪除計時器",
            timeAdjust: "調整耗時"
        },
        action_start: "開始計時",
        action_paused: "暫停計時",
        action_continue: "繼續計時",
        timeBackfill: {
            menu: "調整耗時",
            title: "設定耗時為",
            disabledTip: "僅對暫停中的計時器生效",
            hours: "小時",
            minutes: "分鐘",
            seconds: "秒",
            save: "保存"
        },
        settings: {
            name: "文本塊計時器設定",
            desc: "配置計時器行為",
            tutorial: "更多圖片和視頻教程，請訪問：",
            askforvote: "如果你喜歡這個插件，請為我的Github專案點個Star🌟",
            issue: "如果有任何問題或建議，請在Github專案中提出Issue，並註明使用的插件版本和複現步驟",
            sections: {
                basic: { name: "通用設定" },
                bycommand: {
                    name: "通過命令列控制計時器",
                    desc: "強烈建議給命令列『啟動計時器/切換計時器狀態』添加一個快捷鍵，並使用快捷鍵控制計時器"
                },
                byeditormenu: {
                    name: "通過右鍵選單控制計時器",
                    desc: "在目標文本區塊處右鍵下拉選單，點擊計時器功能按鈕"
                },
                bycheckbox: {
                    name: "通過任務狀態自動控制計時器",
                    desc: "你可以在切換任務狀態的同時，自动生成或更新計時器，對Tasks Plugin（任務插件）用戶友好"
                },
                appearance: { name: "外觀設定" }
            },
            autostop: {
                name: "自動停止計時器",
                desc: "哪些行為視作用戶手動停止計時器",
                choice: {
                    never: "從不停止，除非用戶手動停止",
                    quit: "僅退出 Obsidian 時停止，關閉文件依然後台計時",
                    close: "關閉文件時立即停止"
                }
            },
            insertlocation: {
                name: "計時器插入位置",
                desc: "與 Day Planner 插件搭配使用時，建議在文本後插入",
                choice: {
                    head: "在文本前插入",
                    tail: "在文本後插入"
                }
            },
            timerIcon: {
                runningIcon: {
                    name: "運行中計時器圖標",
                    desc: "設置運行中計時器顯示的圖標（默認: ⏳）"
                },
                pausedIcon: {
                    name: "暫停計時器圖標",
                    desc: "設置暫停計時器顯示的圖標（默認: 💐）"
                }
            },
            timeDisplayFormat: {
                name: "時間顯示格式",
                desc: "選擇時間的顯示方式",
                choice: {
                    full: "完整格式 (HH:MM:SS) - 總是顯示小時、分鐘和秒數",
                    smart: "智能格式 - 小時為零時隱藏 (MM:SS)，超過1小時時顯示完整格式 (HH:MM:SS)"
                }
            },
            timerDisplayStyle: {
                name: "計時器顯示風格",
                desc: "選擇計時器的顯示風格（同時應用於編輯模式和閱讀模式）",
                choice: {
                    badge: "徽章樣式 - 帶背景色和邊框的標籤風格",
                    plain: "純文字樣式 - 僅顯示彩色文字"
                }
            },
            timerColors: {
                runningText: {
                    name: "運行中計時器文字顏色",
                    desc: "運行中計時器的文字顏色"
                },
                runningBg: {
                    name: "運行中計時器背景顏色",
                    desc: "運行中計時器的背景顏色（僅徽章模式）"
                },
                pausedText: {
                    name: "已暫停計時器文字顏色",
                    desc: "已暫停計時器的文字顏色"
                },
                pausedBg: {
                    name: "已暫停計時器背景顏色",
                    desc: "已暫停計時器的背景顏色（僅徽章模式）"
                }
            },
            enableCheckboxToTimer: {
                name: "使用任務狀態控制計時器",
                desc: "啟用此功能後，你可以通過更改任務框的狀態自動控制計時器的啟動、暫停、繼續",
                runningSymbolStr: {
                    name: "觸發計時器開始/繼續的任務狀態符號",
                    desc: "任務狀態符號應為合法的單個字符，如 /, 如希望多種符號都能觸發計時器開始/继续，請直接把这些符號連接起來，如/>+"
                },
                pausedSymbolStr: {
                    name: "觸發計時器暫停的任務狀態符號",
                    desc: "任務狀態符號應為合法的單個字符，如 x, 如希望多種符號都能觸發計時器暫停，請直接把这些符號連接起來，如xX-"
                },
                pathControl: {
                    name: "是否啟用路徑控制",
                    desc: "是否需要限制在哪些路徑下才能用任務狀態控制計時器，註意：當路徑直接指向文件時，必須顯式聲明文件後綴。如 `日記/2025`是個目錄,`日記/20250101.md`是文件。",
                    choice: {
                        disable: "不啟用路徑控制，vault下所有文件都可以用任務狀態控制計時器",
                        whitelist: "啟用白名單路徑控制，只有白名單路徑中的文件才能用任務狀態控制計時器",
                        blacklist: "啟用黑名單路徑控制，只有黑名單路徑以外的文件才能用任務狀態控制計時器"
                    },
                    manage: {
                        name: "路徑控制（文件組）",
                        descTemplate: "基於文件組的路徑控制，已定義 {count} 個組。文件匹配任意一個組即可啟用功能（組內黑名單優先於白名單）。留空則對所有文件生效。",
                        btn: "管理"
                    }
                }
            },
            statusBar: {
                sectionTitle: "狀態列",
                show: {
                    name: "顯示狀態列",
                    desc: "在底部狀態列顯示計時器資訊。"
                },
                mode: {
                    name: "狀態列顯示模式",
                    desc: "選擇顯示的時長：最長運行計時器的時長，或所有運行中計時器的總時長。",
                    choice: {
                        max: "最長運行計時器",
                        total: "運行中總時長"
                    }
                },
                noRunning: "無運行中計時器",
                running: "運行中"
            },
            sidebar: {
                sectionTitle: "計時器側邊欄",
                tabPosition: {
                    name: "側邊欄標籤位置",
                    desc: "計時器側邊欄在右側面板中的標籤序號（從1開始）。預設：4。"
                },
                defaultView: {
                    name: "預設視圖",
                    desc: "開啟側邊欄時的預設展示範圍。",
                    choice: {
                        openTabs: "當前工作階段",
                        activeFile: "當前文件",
                        all: "全部"
                    }
                },
                defaultFilter: {
                    name: "預設狀態篩選",
                    choice: {
                        all: "全部",
                        running: "運行中",
                        paused: "已暫停"
                    }
                },
                defaultGroupFilter: {
                    name: "預設文件組篩選",
                    desc: "開啟全局視圖時預先選中的文件組。僅在預設視圖為「全部」時生效。",
                    none: "不限（顯示全部）"
                },
                defaultSort: {
                    name: "預設排序",
                    choice: {
                        status: "狀態優先",
                        durDesc: "時長↓",
                        durAsc: "時長↑",
                        filenameAsc: "文件名↑",
                        filenameDesc: "文件名↓",
                        updated: "最近更新"
                    }
                },
                autoRefresh: {
                    name: "自動刷新側邊欄",
                    desc: "每秒刷新運行中計時器的時長。"
                },
                fileGroups: {
                    name: "文件組",
                    descTemplate: "管理命名文件組，用於在全局視圖中篩選。已定義 {count} 個組。",
                    btn: "管理"
                },
                scopeLabels: {
                    activeFile: "當前文件",
                    openTabs: "當前工作階段",
                    all: "全部"
                },
                filterLabels: {
                    all: "全部",
                    running: "運行中",
                    paused: "已暫停"
                },
                sortLabels: {
                    status: "狀態優先",
                    durDesc: "時長↓",
                    durAsc: "時長↑",
                    filenameDesc: "文件名↓",
                    filenameAsc: "文件名↑",
                    updated: "最近更新"
                },
                allGroups: "全部分組",
                allViewNotice: "全庫視圖功能開發中",
                summary: {
                    timerCount: "計時器",
                    duration: "時長統計",
                    total: "總計"
                },
                emptyState: {
                    activeFile: "當前文件沒有計時器",
                    openTabs: "當前工作階段沒有計時器",
                    all: "暫無計時器數據"
                },
                actions: {
                    pause: "暫停",
                    resume: "繼續"
                }
            }
        }
    },
    ja: {
        command_name: {
            toggle: "タイマーを始める/切替タイマ",
            delete: "タイマーを削除",
            timeAdjust: "時間調整"
        },
        action_start: "タイマーを始める",
        action_paused: "タイマーを止める",
        action_continue: "タイマーを続ける",
        timeBackfill: {
            menu: "調整耗時",
            title: "時間を設定",
            disabledTip: "一時停止中のタイマーのみ有効",
            hours: "時間",
            minutes: "分",
            seconds: "秒",
            save: "保存"
        },
        settings: {
            name: "テキストブロックタイマー設定",
            desc: "タイマーの動作を設定します",
            tutorial: "画像や動画のチュートリアルはこちら：",
            askforvote: "このプラグインが気に入ったら、GitHub プロジェクトに ⭐ をお願いします！",
            issue: "問題や提案があれば、GitHub プロジェクトに Issue を立ててください。プラグインのバージョンと再現手順を明記してください。",
            sections: {
                basic: { name: "汎用設定です" },
                bycommand: {
                    name: "コマンドでタイマーを制御",
                    desc: "ショートカットを toggle-timer コマンドに割り当てることを強く推奨します。"
                },
                byeditormenu: {
                    name: "右クリックメニューでタイマーを制御",
                    desc: "すぐに体験したい場合は右クリックで操作できますが、Mac ユーザーの場合は非推奨です。"
                },
                bycheckbox: {
                    name: "チェックボックスでタイマーを自動制御",
                    desc: "チェックボックスを切り替えるだけでタイマーが自動作成・更新されます。Tasks プラグインユーザーに特に便利です。"
                },
                appearance: { name: "外観設定" }
            },
            autostop: {
                name: "タイマーの自動停止",
                desc: "どのアクションでタイマーを自動停止しますか？",
                choice: {
                    never: "手動で停止するまで絶対に停止しない",
                    quit: "Obsidian を終了したら停止、ファイルを閉じてもタイマーは継続",
                    close: "ファイルを閉じたら自動停止"
                }
            },
            insertlocation: {
                name: "タイマーの挿入位置",
                desc: "Day Planner プラグインと併用する場合は「テキストの後ろ」に挿入することを推奨します。",
                choice: {
                    head: "テキストの前に挿入",
                    tail: "テキストの後に挿入"
                }
            },
            timerIcon: {
                runningIcon: {
                    name: "実行中タイマーアイコン",
                    desc: "実行中タイマーに表示するアイコンを設定（デフォルト: ⏳）"
                },
                pausedIcon: {
                    name: "一時停止タイマーアイコン",
                    desc: "一時停止タイマーに表示するアイコンを設定（デフォルト: 💐）"
                }
            },
            timeDisplayFormat: {
                name: "時間表示形式",
                desc: "時間の表示方法を選択してください",
                choice: {
                    full: "フルフォーマット (HH:MM:SS) - 常に時間、分、秒を表示",
                    smart: "スマートフォーマット - 0時間の場合は非表示 (MM:SS)、1時間以上の場合はフルフォーマット (HH:MM:SS) を表示"
                }
            },
            timerDisplayStyle: {
                name: "タイマー表示スタイル",
                desc: "タイマーの表示スタイルを選択してください（編集モードと閲覧モードの両方に適用されます）",
                choice: {
                    badge: "バッジスタイル - 背景色と枠線付きのラベルスタイル",
                    plain: "プレーンスタイル - シンプルなカラーテキスト"
                }
            },
            timerColors: {
                runningText: {
                    name: "実行中タイマーの文字色",
                    desc: "実行中タイマーのテキスト色"
                },
                runningBg: {
                    name: "実行中タイマーの背景色",
                    desc: "実行中タイマーの背景色（バッジモードのみ）"
                },
                pausedText: {
                    name: "一時停止タイマーの文字色",
                    desc: "一時停止タイマーのテキスト色"
                },
                pausedBg: {
                    name: "一時停止タイマーの背景色",
                    desc: "一時停止タイマーの背景色（バッジモードのみ）"
                }
            },
            enableCheckboxToTimer: {
                name: "タスク状態制御タイマーを使います",
                desc: "この機能を有効にすると、タスクボックスの状態を変更することでタイマーの起動、停止、継続を自働的に制御できます。",
                runningSymbolStr: {
                    name: "実行中記号",
                    desc: "タイマー実行中を示す単一文字。複数は直接連結、例：/>+"
                },
                pausedSymbolStr: {
                    name: "一時停止記号",
                    desc: "タイマー一時停止を示す単一文字。複数は直接連結、例：xX-"
                },
                pathControl: {
                    name: "パス制限",
                    desc: "制限を通過したフォルダ/ファイルのみチェックボックス連動を利用可能です。注意:パスが直接ファイルを指す場合は、ファイルのサフィックスを書く必要があります。例：フォルダ DailyNote/2025 ファイル DailyNote/2025/20250101.md",
                    choice: {
                        disable: "制限なし（全ファイルで有効）",
                        whitelist: "ホワイトリスト内のファイルのみ有効",
                        blacklist: "ブラックリスト内のファイルは無効"
                    },
                    manage: {
                        name: "パス制御（ファイルグループ）",
                        descTemplate: "ファイルグループによるパス制御。{count} 個のグループが定義されています。いずれかのグループに一致すると機能が有効になります（グループ内ではブラックリストが優先）。空の場合は全ファイルに適用。",
                        btn: "管理"
                    }
                }
            },
            statusBar: {
                sectionTitle: "ステータスバー",
                show: {
                    name: "ステータスバーを表示",
                    desc: "下部ステータスバーにタイマー情報を表示します。"
                },
                mode: {
                    name: "ステータスバー表示モード",
                    desc: "表示する時間を選択：最長実行タイマーの時間、または全実行中タイマーの合計時間。",
                    choice: {
                        max: "最長実行タイマー",
                        total: "実行中合計時間"
                    }
                },
                noRunning: "実行中のタイマーなし",
                running: "実行中"
            },
            sidebar: {
                sectionTitle: "タイマーサイドバー",
                tabPosition: {
                    name: "サイドバータブ位置",
                    desc: "右パネルでのタイマーサイドバーのタブ番号（1始まり）。デフォルト：4。"
                },
                defaultView: {
                    name: "デフォルトビュー",
                    desc: "サイドバーを開いたときのデフォルト表示範囲。",
                    choice: {
                        openTabs: "現在のセッション",
                        activeFile: "現在のファイル",
                        all: "すべて"
                    }
                },
                defaultFilter: {
                    name: "デフォルトステータスフィルター",
                    choice: {
                        all: "すべて",
                        running: "実行中",
                        paused: "一時停止"
                    }
                },
                defaultGroupFilter: {
                    name: "デフォルトグループフィルター",
                    desc: "グローバルビューを開いたときに事前選択するファイルグループ。デフォルトビューが「すべて」の場合のみ有効。",
                    none: "なし（すべて表示）"
                },
                defaultSort: {
                    name: "デフォルト並び替え",
                    choice: {
                        status: "状態優先",
                        durDesc: "時間↓",
                        durAsc: "時間↑",
                        filenameAsc: "ファイル名↑",
                        filenameDesc: "ファイル名↓",
                        updated: "最近更新"
                    }
                },
                autoRefresh: {
                    name: "サイドバー自動更新",
                    desc: "実行中タイマーの時間を毎秒更新します。"
                },
                fileGroups: {
                    name: "ファイルグループ",
                    descTemplate: "グローバルビューのフィルタリング用ファイルグループを管理。{count} 個のグループが定義されています。",
                    btn: "管理"
                },
                scopeLabels: {
                    activeFile: "現在のファイル",
                    openTabs: "現在のセッション",
                    all: "すべて"
                },
                filterLabels: {
                    all: "すべて",
                    running: "実行中",
                    paused: "一時停止"
                },
                sortLabels: {
                    status: "状態優先",
                    durDesc: "時間↓",
                    durAsc: "時間↑",
                    filenameDesc: "ファイル名↓",
                    filenameAsc: "ファイル名↑",
                    updated: "最近更新"
                },
                allGroups: "すべてのグループ",
                allViewNotice: "全ライブラリビューは開発中です",
                summary: {
                    timerCount: "タイマー",
                    duration: "時間統計",
                    total: "合計"
                },
                emptyState: {
                    activeFile: "現在のファイルにタイマーはありません",
                    openTabs: "現在のセッションにタイマーはありません",
                    all: "タイマーデータがありません"
                },
                actions: {
                    pause: "一時停止",
                    resume: "再開"
                }
            }
        }
    },
    ko: {
        command_name: {
            toggle: "타이머 시작/상태 전환",
            delete: "타이머 삭제",
            timeAdjust: "시간 조정"
        },
        action_start: "타이머 시작",
        action_paused: "타이머 일시 정지",
        action_continue: "타이머 계속",
        timeBackfill: {
            menu: "시간 조정",
            title: "시간 설정",
            disabledTip: "일시정지된 타이머에서만 작동합니다",
            hours: "시간",
            minutes: "분",
            seconds: "초",
            save: "저장"
        },
        settings: {
            name: "텍스트 블록 타이머 설정",
            desc: "타이머 동작 설정",
            tutorial: "더 많은 사진과 비디오 튜토리얼은 다음을 방문하십시오: ",
            askforvote: "이 플러그인이 마음에 드신다면, 제 github 프로젝트의 별을 클릭해 주세요⭐",
            issue: "문제나 제안 사항이 있을 경우 Github 프로젝트에서 Issue를 생성해 주시기 바랍니다. 플러그인 버전과 재현 단계를 명시해 주세요",
            sections: {
                basic: { name: "일반 설정" },
                bycommand: {
                    name: "명령줄로 타이머 제어",
                    desc: "명령줄 `타이머 시작/상태 전환`에 단축키를 추가하는 것을 강력추천하며, 단축키를 사용하여 타이머를 제어할 수 있습니다"
                },
                byeditormenu: {
                    name: "우클릭 메뉴로 타이머 제어",
                    desc: "목표 텍스트 블록에서 우클릭 드롭다운 메뉴를 열고, 타이머 기능 버튼을 클릭합니다"
                },
                bycheckbox: {
                    name: "체크박스를 통한 자동 타이머 제어",
                    desc: "태스크 상태를 전환하는 동안 타이머를 자동으로 생성하거나 업데이트할 수 있으며,  Tasks Plugin 사용자들에게 매우 우호적입니다"
                },
                appearance: { name: "외관 설정" }
            },
            autostop: {
                name: "타이머 자동 정지",
                desc: "사용자가 타이머를 수동으로 정지한 것으로 간주되는 동작은?",
                choice: {
                    never: "사용자가 수동으로 중지하지 않는 한 정지하지 않습니다",
                    quit: "obsidian을 종료할 때만 종료되며, 닫기 파일은 여전히 백그라운드 타임을 유지한다",
                    close: "파일을 닫을 때 즉시 정지합니다"
                }
            },
            insertlocation: {
                name: "타이머 삽입 위치",
                desc: "Day Planner 플러그인과 함께 사용할 때는 텍스트 뒤에 삽입하는 것을 추천합니다",
                choice: {
                    head: "텍스트 앞에 삽입합니다",
                    tail: "텍스트 뒤에 삽입합니다"
                }
            },
            timerIcon: {
                runningIcon: {
                    name: "실행 중 타이머 아이콘",
                    desc: "실행 중 타이머에 표시할 아이콘 설정 (기본값: ⏳)"
                },
                pausedIcon: {
                    name: "일시정지 타이머 아이콘",
                    desc: "일시정지 타이머에 표시할 아이콘 설정 (기본값: 💐)"
                }
            },
            timeDisplayFormat: {
                name: "시간 표시 형식",
                desc: "시간 표시 방법을 선택하세요",
                choice: {
                    full: "전체 형식 (HH:MM:SS) - 항상 시간, 분, 초를 표시합니다",
                    smart: "스마트 형식 - 0시간일 때 숨김 (MM:SS), 1시간 이상일 때 전체 형식 (HH:MM:SS) 표시"
                }
            },
            timerDisplayStyle: {
                name: "타이머 표시 스타일",
                desc: "타이머의 표시 스타일을 선택하세요 (편집 모드와 읽기 모드 모두에 적용됩니다)",
                choice: {
                    badge: "배지 스타일 - 배경색과 테두리가 있는 라벨 스타일",
                    plain: "일반 스타일 - 심플한 컬러 텍스트"
                }
            },
            timerColors: {
                runningText: {
                    name: "실행 중 타이머 텍스트 색상",
                    desc: "실행 중인 타이머의 텍스트 색상"
                },
                runningBg: {
                    name: "실행 중 타이머 배경 색상",
                    desc: "실행 중인 타이머의 배경 색상 (배지 모드 전용)"
                },
                pausedText: {
                    name: "일시정지 타이머 텍스트 색상",
                    desc: "일시정지된 타이머의 텍스트 색상"
                },
                pausedBg: {
                    name: "일시정지 타이머 배경 색상",
                    desc: "일시정지된 타이머의 배경 색상 (배지 모드 전용)"
                }
            },
            enableCheckboxToTimer: {
                name: "체크박스로 타이머 제어",
                desc: "이 기능을 사용하면 작업 상자의 상태를 변경하여 타이머의 시작, 일시 정지, 계속을 자동으로 제어할 수 있습니다",
                runningSymbolStr: {
                    name: "타이머 시작/재개 체크박스 상태 기호",
                    desc: "시작/재개를 나타내는 체크박스 상태 기호를 지정합니다. 여러 기호를 조합하여 사용할 수 있습니다. 예: />+"
                },
                pausedSymbolStr: {
                    name: "타이머 일시정지 체크박스 상태 기호",
                    desc: "일시정지를 나타내는 체크박스 상태 기호를 지정합니다. 여러 기호를 조합하여 사용할 수 있습니다. 예: xX-"
                },
                pathControl: {
                    name: "경로 제어 활성화",
                    desc: "체크박스 상태로 타이머를 제어할 수 있는 폴더를 제한합니다，참고:경로가 파일을 직접 지칭할 때는 파일 접미사를 써야 한다，예를 들어,`일기/2025`는 카탈로그이고,`일기/20250101.md`는 파일이다",
                    choice: {
                        disable: "경로 제어를 사용하지 않고 볼트 (vault)의 모든 파일에서 작업 상태 타이머를 제어할 수 있다",
                        whitelist: "화이트리스트 경로로 제한하고, 화이트리스트 경로 내의 파일만이 체크박스 상태로 타이머 제어를 할 수 있습니다",
                        blacklist: "블랙리스트 경로를 제외하고, 블랙리스트 경로 외의 파일에서 체크박스 상태로 타이머 제어를 활성화합니다"
                    },
                    manage: {
                        name: "경로 제어 (파일 그룹)",
                        descTemplate: "파일 그룹 기반 경로 제어. {count}개의 그룹이 정의되어 있습니다. 파일이 어느 그룹과 일치하면 기능이 활성화됩니다 (그룹 내 블랙리스트 우선). 비워두면 모든 파일에 적용됩니다.",
                        btn: "관리"
                    }
                }
            },
            statusBar: {
                sectionTitle: "상태 표시줄",
                show: {
                    name: "상태 표시줄 표시",
                    desc: "하단 상태 표시줄에 타이머 정보를 표시합니다."
                },
                mode: {
                    name: "상태 표시줄 표시 모드",
                    desc: "표시할 시간을 선택하세요: 가장 긴 실행 타이머의 시간 또는 모든 실행 중 타이머의 총 시간.",
                    choice: {
                        max: "가장 긴 실행 타이머",
                        total: "실행 중 총 시간"
                    }
                },
                noRunning: "실행 중인 타이머 없음",
                running: "실행 중"
            },
            sidebar: {
                sectionTitle: "타이머 사이드바",
                tabPosition: {
                    name: "사이드바 탭 위치",
                    desc: "오른쪽 패널에서 타이머 사이드바의 탭 번호 (1부터 시작). 기본값: 4."
                },
                defaultView: {
                    name: "기본 보기",
                    desc: "사이드바를 열 때의 기본 표시 범위.",
                    choice: {
                        openTabs: "현재 세션",
                        activeFile: "현재 파일",
                        all: "전체"
                    }
                },
                defaultFilter: {
                    name: "기본 상태 필터",
                    choice: {
                        all: "전체",
                        running: "실행 중",
                        paused: "일시 정지"
                    }
                },
                defaultGroupFilter: {
                    name: "기본 그룹 필터",
                    desc: "전역 보기를 열 때 미리 선택할 파일 그룹. 기본 보기가 '전체'일 때만 적용됩니다.",
                    none: "없음 (전체 표시)"
                },
                defaultSort: {
                    name: "기본 정렬",
                    choice: {
                        status: "상태 우선",
                        durDesc: "시간↓",
                        durAsc: "시간↑",
                        filenameAsc: "파일명↑",
                        filenameDesc: "파일명↓",
                        updated: "최근 업데이트"
                    }
                },
                autoRefresh: {
                    name: "사이드바 자동 새로 고침",
                    desc: "실행 중 타이머의 시간을 매초 새로 고침합니다."
                },
                fileGroups: {
                    name: "파일 그룹",
                    descTemplate: "전역 보기 필터링을 위한 파일 그룹을 관리합니다. {count}개의 그룹이 정의되어 있습니다.",
                    btn: "관리"
                },
                scopeLabels: {
                    activeFile: "현재 파일",
                    openTabs: "현재 세션",
                    all: "전체"
                },
                filterLabels: {
                    all: "전체",
                    running: "실행 중",
                    paused: "일시 정지"
                },
                sortLabels: {
                    status: "상태 우선",
                    durDesc: "시간↓",
                    durAsc: "시간↑",
                    filenameDesc: "파일명↓",
                    filenameAsc: "파일명↑",
                    updated: "최근 업데이트"
                },
                allGroups: "전체 그룹",
                allViewNotice: "전체 라이브러리 보기는 개발 중입니다",
                summary: {
                    timerCount: "타이머",
                    duration: "시간 통계",
                    total: "합계"
                },
                emptyState: {
                    activeFile: "현재 파일에 타이머가 없습니다",
                    openTabs: "현재 세션에 타이머가 없습니다",
                    all: "타이머 데이터가 없습니다"
                },
                actions: {
                    pause: "일시 정지",
                    resume: "재개"
                }
            }
        }
    }
};

// Helper function to get translation
export function getTranslation(key: string): any {
    const currentLanguage = window.localStorage.getItem('language') || 'en';
    const lang = TRANSLATIONS[currentLanguage.replace('zh-TW', 'zhTW')] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
}
