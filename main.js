'use strict';

const obsidian = require('obsidian');

const { EditorView, Decoration, WidgetType } = require('@codemirror/view');
const { Transaction, RangeSetBuilder, StateField, StateEffect } = require('@codemirror/state');
const { syntaxTree } = require('@codemirror/language');
const { keymap } = require('@codemirror/view');

// —— Timer Widget: Display folded timer span —— //
class TimerWidget extends WidgetType {
    constructor(htmlText, startPos, endPos) {
        super();
        this.htmlText = htmlText;
        this.startPos = startPos;
        this.endPos = endPos;
    }

    toDOM() {
        const span = document.createElement('span');
        span.className = 'timer-widget-display';

        // Extract visible content from HTML (【⏳00:00:00 】)
        const match = this.htmlText.match(/>([^<]*)<\/span>/);
        span.textContent = match ? match[1] : '[Timer]';

        // Add hover title to show what it is
        span.title = 'Timer (click to edit)';

        return span;
    }

    ignoreEvent(event) {
        // Don't ignore events - let them propagate for proper handling
        return false;
    }
}

// —— Timer Span Folding Field —— //
const timerFoldingField = StateField.define({
    create(state) {
        return buildTimerFolding(state);
    },

    update(decorations, tr) {
        if (tr.docChanged) {
            return buildTimerFolding(tr.state);
        }
        return decorations.map(tr.changes);
    }
});

function buildTimerFolding(state) {
    const builder = new RangeSetBuilder();
    const timerRegex = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*">【[^<]*】<\/span>/g;

    for (let pos = 0; pos < state.doc.length;) {
        const line = state.doc.lineAt(pos);
        const lineText = line.text;

        let match;
        timerRegex.lastIndex = 0;
        while ((match = timerRegex.exec(lineText)) !== null) {
            const start = line.from + match.index;
            const end = start + match[0].length;
            const htmlText = match[0];

            // Replace the entire HTML span with a widget that acts as an atomic unit
            builder.add(start, end, Decoration.replace({
                widget: new TimerWidget(htmlText, start, end),
                inclusive: true,
                block: false,
                side: 1 // Position cursor after the widget
            }));
        }

        pos = line.to + 1;
    }

    return builder.finish();
}

// —— Timer Widget Keymap Handler —— //
const timerWidgetKeymap = keymap.of([{
        key: 'Backspace',
        run(view) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;

            // Check if cursor is right after a timer widget
            const line = state.doc.lineAt(pos);
            const timerRegex = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*">【[^<]*】<\/span>/g;

            let match;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;

                // If cursor is right after timer, delete the entire timer
                if (pos === spanEnd) {
                    dispatch(state.update({
                        changes: { from: spanStart, to: spanEnd, insert: '' }
                    }));
                    return true;
                }
            }

            return false; // Let default behavior handle it
        }
    },
    {
        key: 'Delete',
        run(view) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;

            // Check if cursor is right before a timer widget
            const line = state.doc.lineAt(pos);
            const timerRegex = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*">【[^<]*】<\/span>/g;

            let match;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;

                // If cursor is right before timer, delete the entire timer
                if (pos === spanStart) {
                    dispatch(state.update({
                        changes: { from: spanStart, to: spanEnd, insert: '' }
                    }));
                    return true;
                }
            }

            return false; // Let default behavior handle it
        }
    },
    {
        key: 'ArrowLeft',
        run(view) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;

            // Check if cursor is at or inside a timer widget
            const line = state.doc.lineAt(pos);
            const timerRegex = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*">【[^<]*】<\/span>/g;

            let match;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;

                // If cursor is within timer span, jump to before it
                if (pos > spanStart && pos <= spanEnd) {
                    dispatch(state.update({
                        selection: { anchor: spanStart }
                    }));
                    return true;
                }
            }

            return false; // Let default behavior handle it
        }
    },
    {
        key: 'ArrowRight',
        run(view) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;

            // Check if cursor is at or inside a timer widget
            const line = state.doc.lineAt(pos);
            const timerRegex = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*">【[^<]*】<\/span>/g;

            let match;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;

                // If cursor is within timer span, jump to after it
                if (pos >= spanStart && pos < spanEnd) {
                    dispatch(state.update({
                        selection: { anchor: spanEnd }
                    }));
                    return true;
                }
            }

            return false; // Let default behavior handle it
        }
    }
]);

// —— Regex constants —— //
const UPDATE_INTERVAL = 1000;

// —— Base62 工具函数常量 —— //
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// —— Checkbox regexes —— //
const ORDERED_LIST = /(^\s*#*\d+\.\s)/
const UNORDERED_LIST = /(^\s*#*[-/+/*]\s)/
const HEADER = /(^\s*#+\s)/
const POTENTIAL_CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{0,2})\]/
const CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{1})\]\s+/

const DEBUG = false;


// Performance monitor: lightweight sync/async timing collector
class PerfMonitor {
    constructor() {
        this.enabled = false;
        this.data = new Map(); // name -> { count, total }
        this.sessionName = null;
        this.startTime = 0;
        this.endTime = 0;
        // 调用间隔监控
        this.intervalTracking = false;
        this.intervals = new Map(); // methodName -> { lastCallTime, gaps: [] }
    }

    startSession() {
        this.enabled = true;
        this.startTime = Date.now();

        // 输出简短的使用方法说明
        console.log('[PerfMonitor] 使用方法:');
        console.log('• PerfMonitorStart() - 开始监控');
        console.log('• PerfMonitorStop() - 停止监控并查看报告');

        // 自动包装核心类
        PerfMonitor.wrapCoreClasses();
    }

    stopSession() {
        this.enabled = false;
        this.endTime = Date.now();
        console.log(`[PerfMonitor] session stopped, duration ${this.endTime - this.startTime} ms`);
        this.print();

        // 自动重置数据（静默重置，不输出日志）
        this.reset(true);
    }

    reset(silent = false) {
        this.data.clear();
        this.intervals.clear();
        if (!silent) {
            console.log('[PerfMonitor] reset');
        }
    }

    // 启用调用间隔监控
    enableIntervalTracking() {
        this.intervalTracking = true;
        console.log('[PerfMonitor] interval tracking enabled');
    }

    // 禁用调用间隔监控
    disableIntervalTracking() {
        this.intervalTracking = false;
        console.log('[PerfMonitor] interval tracking disabled');
    }

    // 记录调用间隔
    recordInterval(name) {
        if (!this.intervalTracking) return;

        const now = Date.now();
        if (!this.intervals.has(name)) {
            this.intervals.set(name, { lastCallTime: now, gaps: [] });
            return;
        }

        const interval = this.intervals.get(name);
        const gap = now - interval.lastCallTime;
        interval.gaps.push(gap);
        interval.lastCallTime = now;

        // 检测异常间隔（超过5秒）
        if (gap > 5000) {
            console.warn(`[PerfMonitor] ${name} 异常间隔: ${gap}ms，可能是后台节流恢复`);
        }
    }

    // 打印间隔统计
    printIntervals() {
        if (!this.intervalTracking) {
            console.log('[PerfMonitor] interval tracking not enabled');
            return;
        }

        console.group('[PerfMonitor] Interval Analysis');
        this.intervals.forEach((data, name) => {
            if (data.gaps.length === 0) {
                console.log(`${name}: no intervals recorded`);
                return;
            }

            const gaps = data.gaps;
            const min = Math.min(...gaps);
            const max = Math.max(...gaps);
            const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
            const abnormal = gaps.filter(g => g > 5000).length;

            console.log(`${name}: ${gaps.length} intervals, min ${min}ms, max ${max}ms, avg ${avg}ms, abnormal(>5s) ${abnormal}`);
        });
        console.groupEnd();
    }

    record(name, ms) {
        if (!this.data.has(name)) this.data.set(name, { count: 0, total: 0, max: 0 });
        const v = this.data.get(name);
        v.count += 1;
        v.total += ms;
        if (ms > v.max) v.max = ms;
    }

    // helper: time a synchronous function
    timeSync(name, fn, ...args) {
        const t0 = Date.now();
        const res = fn(...args);
        const t1 = Date.now();
        this.record(name, t1 - t0);
        return res;
    }

    // helper: time an async function (returns promise)
    timeAsync(name, fn, ...args) {
        const t0 = Date.now();
        return Promise.resolve(fn(...args)).then((r) => {
            this.record(name, Date.now() - t0);
            return r;
        });
    }

    print() {
        const rows = Array.from(this.data.entries()).map(([k, v]) => ({ k, count: v.count, total: v.total, avg: Math.round(v.total / v.count), max: v.max }));
        rows.sort((a, b) => b.total - a.total);
        console.group('[PerfMonitor] Summary');
        rows.forEach(r => console.log(`${r.k}: ${r.total}ms over ${r.count} calls (avg ${r.avg}ms, max ${r.max}ms)`));
        console.groupEnd();
    }

    // wrap a method (object can be prototype or class/static object)
    wrapMethod(object, methodName, displayName = null) {
        if (!object) return;
        const orig = object[methodName];
        if (!orig || orig._perfmonitor_wrapped) return;
        const name = displayName || `${object.constructor && object.constructor.name ? object.constructor.name : 'obj'}.${methodName}`;
        const self = this;
        object[methodName] = function(...args) {
            if (!window.__PerfMonitor || !window.__PerfMonitor.enabled) return orig.apply(this, args);

            // 记录调用间隔
            self.recordInterval(name);

            const t0 = Date.now();
            try {
                const res = orig.apply(this, args);
                if (res && typeof res.then === 'function') {
                    return res.then(r => {
                        self.record(name, Date.now() - t0);
                        return r;
                    }).catch(e => {
                        self.record(name, Date.now() - t0);
                        throw e;
                    });
                } else {
                    self.record(name, Date.now() - t0);
                    return res;
                }
            } catch (err) {
                self.record(name, Date.now() - t0);
                throw err;
            }
        };
        object[methodName]._perfmonitor_wrapped = true;
    }

    // convenience: wrap multiple methods on an object
    wrapMethods(object, methodNames, prefix = '') {
        for (const m of methodNames) this.wrapMethod(object, m, prefix ? `${prefix}.${m}` : m);
    }

    // 静态方法：初始化全局性能监控（仅在DEBUG模式下）
    static initGlobalMonitor() {
        if (!window.__PerfMonitor) {
            window.__PerfMonitor = new PerfMonitor();

            // 暴露简化的控制函数到全局
            window.PerfMonitorStart = () => window.__PerfMonitor.startSession();
            window.PerfMonitorStop = () => window.__PerfMonitor.stopSession();
            window.PerfMonitorPrint = () => window.__PerfMonitor.print();

            // 调用间隔监控控制
            window.PerfMonitorIntervalStart = () => window.__PerfMonitor.enableIntervalTracking();
            window.PerfMonitorIntervalStop = () => window.__PerfMonitor.disableIntervalTracking();
            window.PerfMonitorIntervalPrint = () => window.__PerfMonitor.printIntervals();

            console.log('[PerfMonitor] Debug mode enabled. Use PerfMonitorStart() to begin monitoring.');
        }
    }

    // 静态方法：包装核心类
    static wrapCoreClasses() {
        if (!DEBUG || !window.__PerfMonitor) return;

        try {
            // TimerManager
            if (typeof TimerManager !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerManager.prototype, ['startTimer', 'stopTimer', 'updateTimerData', 'getTimerData', 'hasTimer', 'clearAll'], 'TimerManager');
            }
            if (typeof TimerFileManager !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerFileManager.prototype, ['writeTimer', 'updateTimerByIdWithSearch', 'findTimerGlobally', 'calculateInsertPosition', 'upgradeOldTimers'], 'TimerFileManager');
            }
            if (typeof TimerParser !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerParser, ['parse', 'parseOldFormat', 'parseNewFormat'], 'TimerParser');
            }
            if (typeof TimerRenderer !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerRenderer, ['render'], 'TimerRenderer');
            }
            if (typeof TimerDataUpdater !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerDataUpdater, ['calculate'], 'TimerDataUpdater');
            }

            // TimerPlugin methods - wrap prototype methods after class is defined
            if (typeof TimerPlugin !== 'undefined') {
                window.__PerfMonitor.wrapMethods(TimerPlugin.prototype, ['onload', 'onunload', 'onEditorMenu', 'onFileOpen', 'restoreTimers', 'handleStart', 'handlePause', 'handleContinue', 'handleDelete', 'onTick'], 'TimerPlugin');
            }

            // console.log('[PerfMonitor] Core classes wrapped. Start session with PerfMonitorStart()');
        } catch (e) {
            console.error('[PerfMonitor] Wrap failed:', e);
        }
    }
}

function compressId(timestamp) {
    if (!timestamp) timestamp = Date.now();
    let num = timestamp;
    if (num === 0) return 't0';

    let result = '';
    while (num > 0) {
        result = BASE62_CHARS[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

const TRANSLATIONS = {
    en: {
        command_name: {
            toggle: "Toggle timer",
            delete: "Delete timer"
        },
        action_start: "Start timer",
        action_paused: "Pause timer",
        action_continue: "Continue timer",
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
                }
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
                    }
                }
            }
        }
    },
    zh: {
        command_name: {
            toggle: "启动计时器/切换计时器状态",
            delete: "删除计时器"
        },
        action_start: "开始计时",
        action_paused: "暂停计时",
        action_continue: "继续计时",
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
                }
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
                    }
                }
            }
        }
    },
    zhTW: {
        command_name: {
            toggle: "啟動計時器/切換計時器狀態",
            delete: "刪除計時器"
        },
        action_start: "開始計時",
        action_paused: "暫停計時",
        action_continue: "繼續計時",
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
                }
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
                    }
                }
            }
        }
    },
    ja: {
        command_name: {
            toggle: "タイマーを始める/切替タイマ",
            delete: "タイマーを削除"
        },
        action_start: "タイマーを始める",
        action_paused: "タイマーを止める",
        action_continue: "タイマーを続ける",
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
                }
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
                    }
                }
            }
        }
    },
    ko: {
        command_name: {
            toggle: "타이머 시작/상태 전환",
            delete: "타이머 삭제"
        },
        action_start: "타이머 시작",
        action_paused: "타이머 일시 정지",
        action_continue: "타이머 계속",
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
                }
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
                    }
                }
            }
        }
    }
};

// Helper function to get translation
function getTranslation(key) {
    const currentLanguage = window.localStorage.getItem('language') || 'en';
    const lang = TRANSLATIONS[currentLanguage.replace('zh-TW', 'zhTW')] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
}


// —— TimerDataUpdater - Pure function for timer data calculations —— //
class TimerDataUpdater {
    static calculate(action, oldData, now = Math.floor(Date.now() / 1000)) {
        let newData;
        switch (action) {
            case 'init':
                newData = {
                    class: 'timer-r',
                    timerId: compressId(),
                    dur: 0,
                    ts: now
                };
                break;
            case 'continue':
                newData = {
                    ...oldData,
                    class: 'timer-r',
                    ts: now
                };
                break;

            case 'pause':
                const elapsed = oldData ? now - oldData.ts : 0;
                newData = {
                    ...oldData,
                    class: 'timer-p',
                    dur: (oldData.dur || 0) + elapsed,
                    ts: now
                };
                break;

            case 'update':
                if (oldData.class !== 'timer-r') return oldData;
                const updateElapsed = now - oldData.ts;
                newData = {
                    ...oldData,
                    dur: (oldData.dur || 0) + updateElapsed,
                    ts: now
                };
                break;

            case 'restore':
                const restoreElapsed = oldData ? now - oldData.ts : 0;
                newData = {
                    ...oldData,
                    class: 'timer-r',
                    dur: (oldData.dur || 0) + restoreElapsed,
                    ts: now
                };
                break;

            case 'forcepause':
                newData = {
                    ...oldData,
                    class: 'timer-p'
                };
                break;

            default:
                newData = oldData;
                break;
        }
        return newData;
    }
}

// —— Enhanced TimerManager - Data and lifecycle management —— //
class TimerManager {
    constructor() {
        this.timers = new Map(); // timerId -> { intervalId, data }
        this.startedIds = new Set(); // 记录本次onload以来所有启动过的timerId
        this.runningTicks = new Set(); // 记录正在执行onTick的timerId，防止重叠执行

        // 页面可见性监控
        this.isVisible = !document.hidden;
        this.lastVisibleTime = Date.now();
        this.backgroundThreshold = 1000; // 1分钟 = 60000ms
        this.setupVisibilityMonitor();
    }

    setupVisibilityMonitor() {
        const handleVisibilityChange = () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.lastVisibleTime = Date.now();
                if (DEBUG) {
                    console.log('[TimerManager] 页面回到前台');
                }
            } else {
                if (DEBUG) {
                    console.log('[TimerManager] 页面进入后台');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 记录初始状态
        if (this.isVisible) {
            this.lastVisibleTime = Date.now();
        }
    }

    // 检查是否应该跳过onTick（后台超过1分钟）
    shouldSkipTick() {
        if (this.isVisible) {
            return false; // 前台时不跳过
        }

        const backgroundDuration = Date.now() - this.lastVisibleTime;
        const shouldSkip = backgroundDuration > this.backgroundThreshold;

        if (shouldSkip && DEBUG) {
            console.log(`[TimerManager] 后台时间 ${Math.round(backgroundDuration/1000)}s，跳过onTick`);
        }

        return shouldSkip;
    }

    startTimer(timerId, initialData, tickCallback) {
        // 如果已存在，直接返回
        if (this.hasTimer(timerId)) {
            return;
        }

        const intervalId = setInterval(() => {
            tickCallback(timerId);
        }, UPDATE_INTERVAL);

        this.timers.set(timerId, {
            intervalId,
            data: initialData
        });

        this.startedIds.add(timerId);

        if (DEBUG) {
            console.log(`Timer started: ${timerId}`);
        }
    }

    stopTimer(timerId) {
        const timer = this.timers.get(timerId);
        if (timer) {
            clearInterval(timer.intervalId);
            this.timers.delete(timerId);
        }

        if (DEBUG) {
            console.log(`Timer stopped: ${timerId}`);
        }
    }

    updateTimerData(timerId, newData) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.data = newData;
        }
    }

    getTimerData(timerId) {
        const timer = this.timers.get(timerId);
        return timer ? timer.data : null;
    }

    hasTimer(timerId) {
        return this.timers.has(timerId);
    }

    isStartedInThisSession(timerId) {
        return this.startedIds.has(timerId);
    }

    getAllTimers() {
        const result = new Map();
        this.timers.forEach((timer, id) => {
            result.set(id, timer.data);
        });
        return result;
    }

    clearAll() {
        this.timers.forEach((timer, id) => {
            clearInterval(timer.intervalId);
        });
        this.timers.clear();
        this.startedIds.clear();
        this.runningTicks.clear();
    }
}

// —— TimerFileManager - File operations and location management —— //
class TimerFileManager {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
        this.locations = new Map(); // timerId -> { view, lineNum }
    }

    async writeTimer(timerId, timerData, view, file, lineNum, parsedResult = null) {
        // 判断view模式
        if (view.getMode && view.getMode() === 'preview') {
            // ===== 预览模式处理 =====
            // 1. 读取文件内容
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            let modified = false;

            // 2. 逐行查找包含指定timerId的行
            let line = lines[lineNum];

            // 3. 构造新的timer span
            const newSpan = TimerRenderer.render(timerData, this.settings);

            // 4. 替换行内容
            const timerRE = /<span class="timer-[rp]"[^>]*>.*?<\/span>/;

            if (line.match(timerRE)) {
                lines[lineNum] = line.replace(timerRE, newSpan);
                modified = true;
            } else if (parsedResult === null) {
                // 初始化场景：在指定位置插入
                const position = this.calculateInsertPosition({ getLine: () => line },
                    0,
                    this.settings.timerInsertLocation
                );
                if (position.before === 0) {
                    lines[lineNum] = newSpan + ' ' + line;
                } else if (position.before === line.length) {
                    lines[lineNum] = line + ' ' + newSpan;
                } else {
                    lines[lineNum] = line.substring(0, position.before) + ' ' + newSpan + ' ' + line.substring(position.before);
                }
                modified = true;
            }

            // 5. 写回文件
            if (modified) {
                await this.app.vault.modify(file, lines.join('\n'));
            }

            return timerId;


        } else {
            // ===== 编辑模式：保持原有逻辑完全不变 =====
            const editor = view.editor;
            // const lineText = editor.getLine(lineNum) || '';

            // 1. Render new span
            const newSpan = TimerRenderer.render(timerData, this.settings);

            // 2. Use provided parsed result or parse if needed
            // const parsed = parsedResult || (timerId ? TimerParser.parse(lineText, timerId) : null);

            // 3. Determine insertion position
            let before, after;
            let needsSpacing = false;

            if (parsedResult && parsedResult.timerId === timerId) {
                // Update existing timer
                before = parsedResult.beforeIndex;
                after = parsedResult.afterIndex;
            } else {
                // Insert new timer
                const position = this.calculateInsertPosition(
                    editor,
                    lineNum,
                    this.settings.timerInsertLocation
                );
                before = position.before;
                after = position.after;
                needsSpacing = true; // New timer needs spacing
            }

            // 4. Add spacing for new timers
            const finalSpan = needsSpacing ? ' ' + newSpan + ' ' : newSpan;

            // 5. Execute write
            if (editor.cm && editor.cm.dispatch) {
                const from = editor.posToOffset({ line: lineNum, ch: before });
                const to = editor.posToOffset({ line: lineNum, ch: after });

                editor.cm.dispatch({
                    changes: { from, to, insert: finalSpan },
                    annotations: Transaction.addToHistory.of(false)
                });
            } else {
                editor.replaceRange(
                    finalSpan, { line: lineNum, ch: before }, { line: lineNum, ch: after }
                );
            }

            // 6. Update location record
            this.locations.set(timerId, { view, file, lineNum });
        }

        return timerId;
    }


    async updateTimerByIdWithSearch(timerId, timerData) {
        // 1. 从缓存中获取位置信息
        const { view, file, lineNum } = this.locations.get(timerId);
        // timer生命周期管理：文件关闭：按设置要求控制是否关闭计时器，但文件关闭时固定不会进行写入
        if (!view.file) {
            if (this.settings.autoStopTimers === 'close') {
                return false
            } else {
                return true
            }
        } else {
            // 当文件打开的时候：
            let lineText;
            if (view.getMode() === 'source') {
                lineText = view.editor.getLine(lineNum);
            } else if (view.getMode() === 'preview') {
                const content = await this.app.vault.read(file);
                lineText = content.split('\n')[lineNum] || '';
            }
            const parsed = TimerParser.parse(lineText, 'auto', timerId);
            if (parsed) {
                this.writeTimer(timerId, timerData, view, file, lineNum, parsed);
                return true;
            } else {
                // 执行全局查找
                const foundparsed = await this.findTimerGlobally(timerId);
                if (foundparsed) {
                    this.writeTimer(timerId, timerData, foundparsed.view, foundparsed.file, foundparsed.lineNum, foundparsed.parsed);
                    return true;
                } else {
                    console.warn(`Timer with ID ${timerId} not found in file ${file.path}, stop Timer`);
                    return false;
                }
            }
            return false; // 意外情况，结束计时
        }
    }

    async findTimerGlobally(timerId) {
        // 1. 从缓存中获取位置信息
        const { view, file, lineNum } = this.locations.get(timerId);
        if (view.getMode() === 'source') {
            const editor = view.editor;
            for (let i = 0; i < editor.lineCount(); i++) {
                const lineText = editor.getLine(i);
                const parsed = TimerParser.parse(lineText, 'auto', timerId);
                // 同时检查新旧格式
                if (parsed && parsed.timerId === timerId) {
                    return { view: view, file: file, lineNum: i, parsed: parsed };
                }
            }
        } else if (view.getMode() === 'preview') {
            const content = await this.app.vault.read(file);
            // 遍历每一行，判断是否包含timerId
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i];
                const parsed = TimerParser.parse(lineText, 'auto', timerId);
                // 同时检查新旧格式
                if (parsed && parsed.timerId === timerId) {
                    return { view: view, file: file, lineNum: i, parsed: parsed };
                }
            }
        }
        return null;
    }

    calculateInsertPosition(editor, lineNum, insertLocation) {
        const lineText = editor.getLine(lineNum) || '';

        if (insertLocation === 'head') {
            // checkbox
            const checkboxMatch = CHECKBOX_REGEX.exec(lineText);
            const checkboxLen = checkboxMatch ? checkboxMatch[0].length : 0;
            // ol
            const orderedListMatch = ORDERED_LIST.exec(lineText);
            const orderedListLen = orderedListMatch ? orderedListMatch[0].length : 0;
            // ul
            const ulMatch = UNORDERED_LIST.exec(lineText);
            const ulLen = ulMatch ? ulMatch[0].length : 0;
            // header
            const headerMatch = HEADER.exec(lineText);
            const headerLen = headerMatch ? headerMatch[0].length : 0;

            let position = 0;
            if (checkboxLen > 0) {
                position = checkboxLen;
            } else if (orderedListLen > 0) {
                position = orderedListLen;
            } else if (ulLen > 0) {
                position = ulLen;
            } else if (headerLen > 0) {
                position = headerLen;
            }

            return { before: position, after: position };
        } else if (insertLocation === 'tail') {
            const len = lineText.length;
            return { before: len, after: len };
        }

        // Default to head
        return { before: 0, after: 0 };
    }

    clearLocations() {
        this.locations.clear();
    }


    async upgradeOldTimers(file) {

        // 直接读取文件内容
        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        let modified = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // 使用TimerParser.parse检查是否有timer
            const parsed = TimerParser.parse(line, 'v1');

            // 检查是否为旧版timer
            if (parsed) {
                modified = true;

                // 构造新的timer span
                const newSpan = TimerRenderer.render(parsed, this.settings);

                // 替换旧的span为新的span
                const oldSpanRegex = new RegExp(`<span class="timer-btn"[^>]*>.*?<\/span>`);
                lines[i] = line.replace(oldSpanRegex, newSpan);
            }
        }

        // 如果有修改，写入文件
        if (modified) {
            const newContent = lines.join('\n');
            await this.app.vault.modify(file, newContent);
        }
    }
}

// —— Utility: Format time according to selected format —— //
class TimeFormatter {
    // Format options: 
    // 'smart' - Hide "00:" when hours=0, show full time when hours>0
    // 'full' - Always show with HH:MM:SS format
    static formatTime(totalSeconds, format = 'full') {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        switch (format) {
            case 'full':
                // Always show HH:MM:SS
                return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
            case 'smart':
                // Hide hours if 0, show MM:SS only
                // But if hours > 0, show full HH:MM:SS
                if (hours === 0) {
                    return `${formattedMinutes}:${formattedSeconds}`;
                } else {
                    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
                }
            default:
                return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }
    }
}

// —— Utility: Format time and render span —— //
class TimerRenderer {
    static render(timerData, settings = null) {

        const totalSeconds = timerData.dur;

        // Get time format from settings or use default
        const timeFormat = settings && settings.timeDisplayFormat ? settings.timeDisplayFormat : 'full';
        const formatted = TimeFormatter.formatTime(totalSeconds, timeFormat);

        // 根据设置和计时器状态选择图标
        let timericon;
        if (settings) {
            // 允许用户只设置其中一个图标，未设置的使用默认值
            const runningIcon = settings.runningIcon !== undefined ? settings.runningIcon : '⏳';
            const pausedIcon = settings.pausedIcon !== undefined ? settings.pausedIcon : '💐';
            timericon = timerData.class === 'timer-r' ? runningIcon : pausedIcon;
        } else {
            // 回退到默认图标
            timericon = timerData.class === 'timer-r' ? '⏳' : '💐';
        }

        return `<span class="${timerData.class}" id="${timerData.timerId}" data-dur="${timerData.dur}" data-ts="${timerData.ts}">【${timericon}${formatted} 】</span>`;
    }
}

// —— Utility: Parse existing span data —— //
class TimerParser {
    static parse(lineText, version = 'auto', targetTimerId = null) {
        const tpl = document.createElement('template');
        tpl.innerHTML = lineText.trim(); // .replace(/data-/g, '')

        // 优先检查老版本,如果匹配上直接返回（如果限制了version === v2 直接跳过）
        if (version === 'v1' || version === 'auto') {
            const oldSelector = targetTimerId ? `.timer-btn[timerId="${targetTimerId}"]` : '.timer-btn';
            const oldTimer = tpl.content.querySelector(oldSelector);
            if (oldTimer) {
                const parsed = this.parseOldFormat(lineText, oldTimer);
                if (parsed) {
                    return parsed;
                }
            }
        };
        // 再检查新版本，如果匹配上直接返回（如果限制了version === v1 直接跳过）
        if (version === 'v2' || version === 'auto') {
            const newSelector = targetTimerId ? `.timer-r[id="${targetTimerId}"], .timer-p[id="${targetTimerId}"]` : '.timer-r, .timer-p';
            const newTimer = tpl.content.querySelector(newSelector);
            if (newTimer) {
                const parsed = this.parseNewFormat(lineText, newTimer);
                if (parsed) {
                    return parsed;
                }
            }
        };
        return null;
    }

    static parseOldFormat(lineText, timerEl) {
        // 提取老格式属性
        const oldId = timerEl.getAttribute('timerId') || timerEl.getAttribute('data-timerId');
        const status = timerEl.getAttribute('Status') || timerEl.getAttribute('data-Status');
        const dur = parseInt(timerEl.getAttribute('AccumulatedTime') || timerEl.getAttribute('data-AccumulatedTime'), 10);
        const ts = parseInt(timerEl.getAttribute('currentStartTimeStamp') || timerEl.getAttribute('data-currentStartTimeStamp'), 10);

        // 转换为新格式ID
        const newId = oldId ? compressId(parseInt(oldId)) : compressId();

        // 获取位置信息
        const regex = new RegExp(`<span[^>]*timerId="${oldId}"[^>]*>.*?</span>`);
        const match = lineText.match(regex);

        if (!match) {
            return null;
        }

        return {
            class: status === 'Running' ? 'timer-r' : 'timer-p',
            timerId: newId,
            dur: dur,
            ts: ts,
            beforeIndex: match.index,
            afterIndex: match.index + match[0].length
        };
    }

    static parseNewFormat(lineText, timerEl) {
        // 提取新格式属性
        const timerId = timerEl.id;
        const className = timerEl.className; // 直接获取class
        const dur = parseInt(timerEl.dataset.dur, 10);
        const ts = parseInt(timerEl.dataset.ts, 10);

        // 获取位置信息
        const regex = new RegExp(`<span[^>]*id="${timerId}"[^>]*>.*?</span>`);
        const match = lineText.match(regex);

        if (!match) {
            return null;
        }

        return {
            class: className,
            timerId: timerId,
            dur: dur,
            ts: ts,
            beforeIndex: match.index,
            afterIndex: match.index + match[0].length
        };
    }
}

// —— Main plugin class —— //
class TimerPlugin extends obsidian.Plugin {
    async onload() {
        PerfMonitor.initGlobalMonitor();

        this.manager = new TimerManager();
        this.fileFirstOpen = true;

        this.default_settings = {
            autoStopTimers: 'quit',
            timerInsertLocation: 'head',
            enableCheckboxToTimer: true,
            runningCheckboxState: '/',
            pausedCheckboxState: '-xX',
            checkboxToTimerPathRestriction: 'disable',
            pathRestrictionPaths: [],
            runningIcon: '⏳',
            pausedIcon: '💐',
            timeDisplayFormat: 'full'
        };

        await this.loadSettings();

        // Initialize TimerFileManager with settings
        this.fileManager = new TimerFileManager(this.app, this.settings);

        // Add to editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', this.onEditorMenu.bind(this))
        );

        // Register "Toggle timer" command
        this.addCommand({
            id: 'toggle-timer',
            icon: 'timer',
            name: getTranslation('command_name').toggle,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText, 'auto');

                if (parsed) {
                    if (parsed.class === 'timer-r') {
                        this.handlePause(view, lineNum, parsed);
                    } else if (parsed.class === 'timer-p') {
                        this.handleContinue(view, lineNum, parsed);
                    } else {
                        // this.handleStart(view, lineNum, parsed); // 好像是废逻辑
                    }
                } else {
                    this.handleStart(view, lineNum, null); // 只有这里会生效
                }
            },
        });



        // Register "Toggle timer" command
        this.addCommand({
            id: 'delete-timer',
            icon: 'timer-off',
            name: getTranslation('command_name').delete,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText, 'auto');

                this.handleDelete(view, lineNum, parsed);
            },
        });

        // Listen to file open event
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );

        // Register settings
        this.addSettingTab(new TimerSettingTab(this.app, this));

        // Register timer folding decoration to hide HTML in edit mode
        this.registerEditorExtension([
            timerFoldingField,
            EditorView.decorations.of((view) => {
                try {
                    return view.state.field(timerFoldingField);
                } catch (e) {
                    return null;
                }
            }),
            timerWidgetKeymap
        ]);

        // Judge enableCheckboxToTimer
        this.registerEditorExtension(
            EditorView.updateListener.of((update) => {
                if (update.docChanged && this.settings.enableCheckboxToTimer && this.checkPathRestriction()) {
                    const view = this.app.workspace.getActiveViewOfType(obsidian.FileView);
                    const oldDoc = update.startState.doc;
                    const newDoc = update.state.doc;

                    update.changes.iterChanges((oldFrom, oldTo, newFrom, newTo, inserted) => {
                        const oldStartLine = oldDoc.lineAt(oldFrom).number;
                        const oldEndLine = oldDoc.lineAt(oldTo).number;
                        const newStartLine = newDoc.lineAt(newFrom).number;
                        const newEndLine = newDoc.lineAt(newTo).number;

                        if (Math.max(oldStartLine, oldEndLine, newStartLine, newEndLine) !== Math.min(oldStartLine, oldEndLine, newStartLine, newEndLine)) return;
                        const lineNum = newStartLine - 1;

                        const oldLineText = oldDoc.lineAt(oldFrom).text;
                        const newLineText = newDoc.lineAt(newFrom).text;

                        if (!POTENTIAL_CHECKBOX_REGEX.test(oldLineText) || !CHECKBOX_REGEX.test(newLineText)) return;

                        const oldCheckboxState = oldLineText.match(POTENTIAL_CHECKBOX_REGEX)[2];
                        const newCheckboxState = newLineText.match(CHECKBOX_REGEX)[2];

                        if (oldCheckboxState !== newCheckboxState) {
                            this.toggleTimerbyCheckboxState(oldCheckboxState, newCheckboxState, newLineText, view, lineNum);
                        }

                    });
                }
            })
        );

        this.registerDomEvent(document, 'pointerdown', (e) => {
            if (e.target.classList.contains('task-list-item-checkbox')) {
                if (this.settings.enableCheckboxToTimer && this.checkPathRestriction()) {
                    const view = this.app.workspace.getActiveViewOfType(obsidian.FileView);
                    if (!view) return;
                    if (view.getMode() !== 'preview') return;

                    const file = view.file;
                    const beforeLines = view.data.split('\n');

                    const handlePointerUp = () => {
                        if (DEBUG) {
                            console.log('pointerup');
                        }
                        document.removeEventListener('pointerup', handlePointerUp);

                        let count = 0;
                        const max = 10;
                        const id = setInterval(async() => {
                            count++;
                            const content = await this.app.vault.read(file);
                            const afterLines = content.split('\n');

                            let found = false;
                            for (let lineNum = 0; lineNum < beforeLines.length; lineNum++) {
                                // 1. 先判断是否相同，相同则跳过
                                const oldLineText = beforeLines[lineNum];
                                const newLineText = afterLines[lineNum];
                                if (oldLineText === newLineText) continue;
                                // 2. 再判断是否是checkbox，不是则跳过
                                if (!CHECKBOX_REGEX.test(oldLineText) || !CHECKBOX_REGEX.test(newLineText)) continue;
                                const oldCheckboxState = oldLineText.match(CHECKBOX_REGEX)[2];
                                const newCheckboxState = newLineText.match(CHECKBOX_REGEX)[2];
                                // 3. 再判断是否是checkbox的状态，仅在状态变化时才触发
                                if (oldCheckboxState !== newCheckboxState) {
                                    if (DEBUG) {
                                        console.log(`第 ${lineNum} 行发生变化`);
                                        console.log('变化前：' + beforeLines[lineNum]);
                                        console.log('变化后：' + afterLines[lineNum]);
                                    }
                                    this.toggleTimerbyCheckboxState(oldCheckboxState, newCheckboxState, newLineText, view, lineNum);
                                    found = true;
                                }
                            }
                            if (found) {
                                if (DEBUG) {
                                    console.log('找到变化');
                                }
                                clearInterval(id);
                            }
                            if (count === max) {
                                if (DEBUG) {
                                    console.log('次数达到上限，未找到变化，停止监听');
                                }
                                clearInterval(id);
                            }
                        }, 100);
                    };

                    document.addEventListener('pointerup', handlePointerUp);
                }
            }
        });

    }

    onunload() {
        this.manager.clearAll();
        this.fileManager.clearLocations();
    }


    onEditorMenu(menu, editor, view) {
        const cursor = editor.getCursor();
        const lineNum = cursor.line;
        const lineText = editor.getLine(lineNum);
        const parsed = TimerParser.parse(lineText, 'auto');
        const className = parsed ? parsed.class : null;

        if (className === 'timer-r') {
            menu.addItem((item) =>
                item
                .setTitle(getTranslation('action_paused'))
                .setIcon('pause')
                .onClick(() => this.handlePause(view, lineNum, parsed))
            );
        } else if (className === 'timer-p') {
            menu.addItem((item) =>
                item
                .setTitle(getTranslation('action_continue'))
                .setIcon('play')
                .onClick(() => this.handleContinue(view, lineNum, parsed))
            );
        } else {
            menu.addItem((item) =>
                item
                .setTitle(getTranslation('action_start'))
                .setIcon('play')
                .onClick(() => this.handleStart(view, lineNum, null))
            );
        }

        // Add delete option for existing timers
        if (parsed && parsed.timerId) {
            menu.addItem((item) =>
                item
                .setTitle('Delete timer')
                .setIcon('trash')
                .onClick(() => this.handleDelete(view, lineNum, parsed))
            );
        }
    }

    checkPathRestriction() {
        const restriction = this.settings.checkboxToTimerPathRestriction;
        const paths = this.settings.pathRestrictionPaths;

        if (restriction === 'disable') return true;

        const currentFile = this.app.workspace.getActiveFile();
        const currentFilePath = currentFile.path;

        if (restriction === 'whitelist') {
            for (const path of paths) {
                if (currentFilePath.startsWith(path))
                    return true;
            }
            return false;
        } else if (restriction === 'blacklist') {
            for (const path of paths) {
                if (currentFilePath.startsWith(path)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    handleStart(view, lineNum, parsedData) {
        const initialData = TimerDataUpdater.calculate('init', {});
        const timerId = initialData.timerId;
        const file = view.file;

        // 1. Start timer in manager
        this.manager.startTimer(timerId, initialData, this.onTick.bind(this));
        // 记录位置
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        // 2. Write to file
        this.fileManager.writeTimer(timerId, initialData, view, file, lineNum, null); // 这个parsedData永远是null

    }

    handleContinue(view, lineNum, parsedData) {
        if (!parsedData || !parsedData.timerId) return;

        const timerId = parsedData.timerId;
        const currentData = this.manager.getTimerData(timerId) || parsedData;
        const newData = TimerDataUpdater.calculate('continue', currentData);
        const file = view.file;

        // 1. Start timer with updated data
        this.manager.startTimer(timerId, newData, this.onTick.bind(this));
        // 记录位置
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        // 2. Update file
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);
    }

    handlePause(view, lineNum, parsedData) {
        if (!parsedData || !parsedData.timerId) return;

        const timerId = parsedData.timerId;
        const currentData = this.manager.getTimerData(timerId) || parsedData;
        const newData = TimerDataUpdater.calculate('pause', currentData);

        // 1. Stop timer
        this.manager.stopTimer(timerId);

        // 2. Update file
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

    }

    handleDelete(view, lineNum, parsedData) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;
        // 1. Stop timer if running
        this.manager.stopTimer(timerId);
        // 2. Remove from locations
        this.fileManager.locations.delete(timerId);
        // 3. Remove from text (only in edit mode)
        if (view.getMode() === 'source') {
            const editor = view.editor;
            editor.replaceRange(
                '', { line: lineNum, ch: parsedData.beforeIndex }, { line: lineNum, ch: parsedData.afterIndex }
            );
        }
    }

    handleRestore(view, lineNum, parsedData) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;
        const newData = TimerDataUpdater.calculate('restore', parsedData);
        const file = view.file;
        // 1. Start timer
        this.manager.startTimer(timerId, newData, this.onTick.bind(this));
        // 记录位置
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        // 2. Update file
        this.fileManager.writeTimer(timerId, newData, view, file, lineNum, parsedData);

    }

    handleForcePause(view, lineNum, parsedData) {
        if (!parsedData || !parsedData.timerId) return;

        const timerId = parsedData.timerId;
        const newData = TimerDataUpdater.calculate('forcepause', parsedData);

        // Update file only (don't start timer)
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);
    }

    async onTick(timerId) {
        // 可见性检查：后台超过1分钟时跳过
        if (this.manager.shouldSkipTick()) {
            if (DEBUG) {
                console.log(`页面后台超过1分钟，跳过 onTick: ${timerId}`);
            }
            return;
        }

        // 防重叠执行：如果该timer的onTick正在执行，跳过本次调用
        if (this.manager.runningTicks.has(timerId)) {
            if (DEBUG) {
                console.log(`跳过重叠的 onTick: ${timerId}`);
            }
            return;
        }

        // 标记开始执行
        this.manager.runningTicks.add(timerId);

        try {
            // 1. Get and update data
            const oldData = this.manager.getTimerData(timerId);
            if (!oldData || oldData.class !== 'timer-r') return;

            const newData = TimerDataUpdater.calculate('update', oldData);
            this.manager.updateTimerData(timerId, newData);

            // 2. Update file (includes search logic)
            const updated = await this.fileManager.updateTimerByIdWithSearch(timerId, newData);

            if (!updated) {
                // Timer no longer exists, stop it
                this.manager.stopTimer(timerId);
            }
        } finally {
            // 确保无论成功还是异常都会清理执行标记
            this.manager.runningTicks.delete(timerId);
        }
    }

    async onFileOpen(event) {
        // 先执行升级
        if (event) {
            await this.fileManager.upgradeOldTimers(event);
        }
        // 再执行restore
        if (this.fileFirstOpen) {
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.editor) {
                    this.restoreTimers(leaf.view);
                }
            }
            this.fileFirstOpen = false;
        } else {
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.editor && leaf.view.file === event) {
                    const editor = leaf.view.editor;
                    const checkInterval = setInterval(() => {
                        const lineCount = editor.lineCount();
                        if (lineCount > 1) {
                            this.restoreTimers(leaf.view);
                            clearInterval(checkInterval);
                        }
                    }, 100);
                }
            }
        }

    }



    restoreTimers(view) {
        const editor = view.editor;
        const lineCount = editor.lineCount();

        for (let i = 0; i < lineCount; i++) {
            const lineText = editor.getLine(i);
            const parsed = TimerParser.parse(lineText, 'auto');
            if (parsed && parsed.class === 'timer-r') {
                // && !this.manager.hasTimer(parsed.timerId)

                if (this.settings.autoStopTimers === 'never') {
                    this.handleRestore(view, i, parsed);
                } else if (this.settings.autoStopTimers === 'quit') {
                    if (this.manager.isStartedInThisSession(parsed.timerId)) {
                        this.handleRestore(view, i, parsed);
                    } else {
                        this.handleForcePause(view, i, parsed);
                    }
                } else if (this.settings.autoStopTimers === 'close') {
                    this.handleForcePause(view, i, parsed);
                }
            }
        }
    }


    async loadSettings() {
        this.settings = Object.assign({}, this.default_settings, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update fileManager settings
        if (this.fileManager) {
            this.fileManager.settings = this.settings;
        }
    }

    toggleTimerbyCheckboxState(oldCheckboxState, newCheckboxState, newLineText, view, lineNum) {

        if (oldCheckboxState === '') {
            oldCheckboxState = ' '
        }

        if (!this.settings.runningCheckboxState.includes(oldCheckboxState) && this.settings.runningCheckboxState.includes(newCheckboxState)) {
            const parsed = TimerParser.parse(newLineText, 'auto');
            if (!parsed) {
                this.handleStart(view, lineNum, null);
            } else if (parsed.class === 'timer-p') {
                this.handleContinue(view, lineNum, parsed);
            }
        }

        if (!this.settings.pausedCheckboxState.includes(oldCheckboxState) && this.settings.pausedCheckboxState.includes(newCheckboxState)) {
            const parsed = TimerParser.parse(newLineText, 'auto');
            if (parsed && parsed.class === 'timer-r') {
                this.handlePause(view, lineNum, parsed);
            }
        }
    }
}

class TimerSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    processPath(filePath) {
        if (filePath.endsWith('/')) {
            return filePath;
        }
        const pathSegments = filePath.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment.includes('.')) {
            return filePath;
        }
        return filePath + '/';
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        const lang = getTranslation('settings');

        containerEl.createEl('h1', { text: lang.name });
        containerEl.createEl('h2', { text: lang.desc });
        containerEl.createEl('div', { text: '' });

        const tutorialInfo = containerEl.createEl('div');
        tutorialInfo.addClass('tutorial-info');

        const tutorialParagraph = tutorialInfo.createEl('p');
        tutorialParagraph.setText(lang.tutorial);

        const tutorialLink = tutorialParagraph.createEl('a');
        tutorialLink.href = 'https://github.com/wth461694678/text-block-timer';
        tutorialLink.setText('GitHub');
        tutorialLink.target = '_blank';

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('p', { text: lang.askforvote });

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('p', { text: lang.issue });

        containerEl.createEl('h3', { text: lang.sections.basic.name });

        new obsidian.Setting(containerEl)
            .setName(lang.autostop.name)
            .setDesc(lang.autostop.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('never', lang.autostop.choice.never)
                    .addOption('quit', lang.autostop.choice.quit)
                    .addOption('close', lang.autostop.choice.close)
                    .setValue(this.plugin.settings.autoStopTimers)
                    .onChange(async(value) => {
                        this.plugin.settings.autoStopTimers = value;
                        await this.plugin.saveSettings();
                    });
            });

        new obsidian.Setting(containerEl)
            .setName(lang.insertlocation.name)
            .setDesc(lang.insertlocation.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('head', lang.insertlocation.choice.head)
                    .addOption('tail', lang.insertlocation.choice.tail)
                    .setValue(this.plugin.settings.timerInsertLocation)
                    .onChange(async(value) => {
                        this.plugin.settings.timerInsertLocation = value;
                        await this.plugin.saveSettings();
                    });
            });

        // Timer icon settings
        new obsidian.Setting(containerEl)
            .setName(lang.timerIcon.runningIcon.name)
            .setDesc(lang.timerIcon.runningIcon.desc)
            .addText(text => {
                text
                    .setValue(this.plugin.settings.runningIcon)
                    .onChange(async(value) => {
                        this.plugin.settings.runningIcon = value || '⏳';
                        await this.plugin.saveSettings();
                    });
            });

        new obsidian.Setting(containerEl)
            .setName(lang.timerIcon.pausedIcon.name)
            .setDesc(lang.timerIcon.pausedIcon.desc)
            .addText(text => {
                text
                    .setValue(this.plugin.settings.pausedIcon)
                    .onChange(async(value) => {
                        this.plugin.settings.pausedIcon = value || '💐';
                        await this.plugin.saveSettings();
                    });
            });

        // Time display format settings
        const timeFormatLang = lang.timeDisplayFormat;
        new obsidian.Setting(containerEl)
            .setName(timeFormatLang.name)
            .setDesc(timeFormatLang.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('full', timeFormatLang.choice.full)
                    .addOption('smart', timeFormatLang.choice.smart)
                    .setValue(this.plugin.settings.timeDisplayFormat || 'full')
                    .onChange(async(value) => {
                        this.plugin.settings.timeDisplayFormat = value;
                        await this.plugin.saveSettings();
                    });
            });

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.bycommand.name });
        new obsidian.Setting(containerEl)
            .setName(lang.sections.bycommand.desc);

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.byeditormenu.name });
        new obsidian.Setting(containerEl)
            .setName(lang.sections.byeditormenu.desc);
        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.bycheckbox.name });

        new obsidian.Setting(containerEl)
            .setName(lang.sections.bycheckbox.desc);

        // Checkbox to Timer feature settings
        const checkboxToTimerSetting = new obsidian.Setting(containerEl);
        checkboxToTimerSetting
            .setName(lang.enableCheckboxToTimer.name)
            .setDesc(lang.enableCheckboxToTimer.desc)
            .addToggle(toggle => {
                toggle
                    .setValue(this.plugin.settings.enableCheckboxToTimer)
                    .onChange(async(value) => {
                        this.plugin.settings.enableCheckboxToTimer = value;
                        await this.plugin.saveSettings();
                        this.display(); // Re-render settings page
                    });
            });

        // Checkbox to Timer feature settings
        if (this.plugin.settings.enableCheckboxToTimer) {
            new obsidian.Setting(containerEl)
                .setName(lang.enableCheckboxToTimer.runningSymbolStr.name)
                .setDesc(lang.enableCheckboxToTimer.runningSymbolStr.desc)
                .addText(text => {
                    text
                        .setPlaceholder('combine symbols directly, eg /')
                        .setValue(this.plugin.settings.runningCheckboxState)
                        .onChange(async(value) => {
                            // Remove square brackets
                            const cleanedValue = value.replace(/\[|\]/g, '');
                            this.plugin.settings.runningCheckboxState = cleanedValue;
                            await this.plugin.saveSettings();
                        });
                });

            new obsidian.Setting(containerEl)
                .setName(lang.enableCheckboxToTimer.pausedSymbolStr.name)
                .setDesc(lang.enableCheckboxToTimer.pausedSymbolStr.desc)
                .addText(text => {
                    text
                        .setPlaceholder('combine symbols directly, eg -xX')
                        .setValue(this.plugin.settings.pausedCheckboxState)
                        .onChange(async(value) => {
                            const cleanedValue = value.replace(/\[|\]/g, '');
                            this.plugin.settings.pausedCheckboxState = cleanedValue;
                            await this.plugin.saveSettings();
                        });
                });

            const pathRestrictionSetting = new obsidian.Setting(containerEl);
            pathRestrictionSetting
                .setName(lang.enableCheckboxToTimer.pathControl.name)
                .setDesc(lang.enableCheckboxToTimer.pathControl.desc)
                .addDropdown(dropdown => {
                    dropdown
                        .addOption('disable', lang.enableCheckboxToTimer.pathControl.choice.disable)
                        .addOption('whitelist', lang.enableCheckboxToTimer.pathControl.choice.whitelist)
                        .addOption('blacklist', lang.enableCheckboxToTimer.pathControl.choice.blacklist)
                        .setValue(this.plugin.settings.checkboxToTimerPathRestriction)
                        .onChange(async(value) => {
                            this.plugin.settings.checkboxToTimerPathRestriction = value;
                            await this.plugin.saveSettings();
                            this.display();
                        });
                });

            // If whitelist or blacklist is selected, display path input box
            if (this.plugin.settings.checkboxToTimerPathRestriction !== 'disable') {
                const pathsContainer = containerEl.createDiv();
                pathsContainer.addClass('paths-container');

                const addPath = (value = '') => {
                    const pathItem = pathsContainer.createDiv();
                    pathItem.addClass('path-item');

                    const buttonContainer = pathItem.createDiv();
                    buttonContainer.addClass('button-container');

                    const pathInput = buttonContainer.createEl('input');
                    pathInput.type = 'text';
                    pathInput.value = value;
                    pathInput.style.width = 'calc(100% - 60px)';
                    pathInput.addEventListener('input', async(event) => {
                        const paths = this.plugin.settings.pathRestrictionPaths || [];
                        const index = Array.from(pathsContainer.children).indexOf(pathItem);
                        paths[index] = event.target.value;
                        const newPaths = paths.map(path => this.processPath(path));
                        this.plugin.settings.pathRestrictionPaths = newPaths;
                        await this.plugin.saveSettings();
                    });
                    pathInput.addEventListener('blur', () => {
                        if (pathInput.value.trim() === '' && pathsContainer.children.length > 1) {
                            pathItem.remove();
                            const paths = this.plugin.settings.pathRestrictionPaths || [];
                            const index = Array.from(pathsContainer.children).indexOf(pathItem);
                            if (index > -1) {
                                paths.splice(index, 1);
                                const newPaths = paths.map(path => this.processPath(path));
                                this.plugin.settings.pathRestrictionPaths = newPaths;
                                this.plugin.saveSettings();
                            }
                        }
                    });

                    const addButton = buttonContainer.createEl('button');
                    addButton.textContent = '+';
                    addButton.style.margin = '0 3px';
                    addButton.style.padding = '0 5px';
                    addButton.addEventListener('click', () => {
                        addPath('');
                    });

                    const removeButton = buttonContainer.createEl('button');
                    removeButton.textContent = '-';
                    removeButton.style.margin = '0 3px';
                    removeButton.style.padding = '0 5px';
                    removeButton.addEventListener('click', () => {
                        pathItem.remove();
                        const paths = this.plugin.settings.pathRestrictionPaths || [];
                        const index = Array.from(pathsContainer.children).indexOf(pathItem);
                        if (index > -1) {
                            paths.splice(index, 1);
                            const newPaths = paths.map(path => this.processPath(path));
                            this.plugin.settings.pathRestrictionPaths = newPaths;
                            this.plugin.saveSettings();
                        }
                    });

                    // Hide removeButton initially, unless there are multiple paths
                    if (pathsContainer.children.length === 1) {
                        removeButton.style.display = 'none';
                    } else {
                        removeButton.style.display = 'inline-block';
                    }
                };

                // Initialize path input box
                const paths = this.plugin.settings.pathRestrictionPaths || [];
                paths.forEach(path => {
                    addPath(path);
                });

                // If there are no paths, add an empty input box
                if (paths.length === 0) {
                    addPath('');
                }
            }
        }
    }
}

module.exports = TimerPlugin;
/* nosourcemap */