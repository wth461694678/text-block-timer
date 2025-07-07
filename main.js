'use strict';

const obsidian = require('obsidian');

// Regex constants
const TIMER_REGEX     = /<span class="timer-btn" timerId="([^"]+)" Status="([^"]+)" AccumulatedTime="([^"]+)" currentStartTimeStamp="([^"]+)" lineId="([^"]+)"([^>]*)>([^<]+)<\/span>/;
const UPDATE_INTERVAL = 1000;

// —— Checkbox regexes —— //
const START_CHECKBOX = /^\s*[-+*]\s+\[\/]\s*/;    // '- [/] '
const PAUSE_CHECKBOX = /^\s*[-+*]\s+\[-\]\s*/;    // '- [-] '
const DONE_CHECKBOX  = /^\s*[-+*]\s+\[[xX]\]\s*/; // '- [x] '

// —— Utility: Format time and render span —— //
class TimerRenderer {
    static render(timerData) {
        const formatted = new Date(timerData.AccumulatedTime * 1000)
            .toISOString()
            .substr(11, 8);
        const colorStyle =
            timerData.Status === 'Running' ? 'style="color: #10b981;"' : '';
        return `<span class="timer-btn" timerId="${timerData.timerId}" Status="${timerData.Status}" AccumulatedTime="${timerData.AccumulatedTime}" currentStartTimeStamp="${timerData.currentStartTimeStamp}" lineId="${timerData.lineId}" ${colorStyle}>【⏳${formatted} 】</span>`;
    }
}

// —— Utility: Parse existing span data —— //
class TimerParser {
    static parse(lineText) {
        const m = lineText.match(TIMER_REGEX);
        if (!m) return null;
        return {
            raw: m[0],
            beforeIndex: m.index,
            afterIndex: m.index + m[0].length,
            timerId: m[1],
            Status: m[2],
            AccumulatedTime: parseInt(m[3], 10),
            currentStartTimeStamp: parseInt(m[4], 10),
            lineId: parseInt(m[5], 10),
        };
    }
}

// —— Timer lifecycle management —— //
class TimerManager {
    constructor() {
        this.timers = new Map(); // timerId -> intervalId
    }

    start(timerId, tickCallback) {
        if (this.timers.has(timerId)) return;
        const id = setInterval(() => tickCallback(timerId), UPDATE_INTERVAL);
        this.timers.set(timerId, id);
    }

    stop(timerId) {
        const id = this.timers.get(timerId);
        if (id) {
            clearInterval(id);
            this.timers.delete(timerId);
        }
    }

    clearAll() {
        for (const id of this.timers.values()) {
            clearInterval(id);
        }
        this.timers.clear();
    }
}

// —— Main plugin class —— //
class TimerPlugin extends obsidian.Plugin {
    async onload() {
        this.manager       = new TimerManager();
        this.timerContexts = new Map();

        // Localization logic...
        const lang = window.localStorage.getItem('language');
        if (lang === 'zh')       { this.command_name = '启动计时器/切换计时器状态'; this.action_paused = '暂停计时'; this.action_continue = '继续计时'; this.action_start = '开始计时'; }
        else if (lang === 'zh-TW'){ this.command_name = '啟動計時器/切換計時器狀態'; this.action_paused = '暫停計時'; this.action_continue = '繼續計時'; this.action_start = '開始計時'; }
        else if (lang === 'ja')   { this.command_name = 'タイマーを始める/切替タイマ'; this.action_paused = 'タイマーを止める'; this.action_continue = 'タイマーを続ける'; this.action_start = 'タイマーを始める'; }
        else if (lang === 'ko')   { this.command_name = '타이머 전환'; this.action_paused = '타이머 일시 정지'; this.action_continue = '타이머 계속'; this.action_start = '타이머 시작'; }
        else                      { this.command_name = 'toggle-timer'; this.action_paused = 'Pause Timer'; this.action_continue = 'Continue Timer'; this.action_start = 'Start Timer'; }

        // Context-menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', this.onEditorMenu.bind(this))
        );

        // —— Auto-start / auto-pause on checkbox flips —— //
        this.registerEvent(
            this.app.workspace.on('editor-change', editor => {
                const lineNum = editor.getCursor().line;
                const line    = editor.getLine(lineNum);
                const parsed  = TimerParser.parse(line);

                // Auto-start when marking "- [/]"
                if (!parsed && START_CHECKBOX.test(line)) {
                    this.handleStart(editor, lineNum);
                    return;
                }

                // Auto-pause when marking "[x]" or "[-]"
                if (parsed && parsed.Status === 'Running' && (DONE_CHECKBOX.test(line) || PAUSE_CHECKBOX.test(line))) {
                    this.handlePause(parsed, editor, lineNum);
                    return;
                }
            })
        );

        // Toggle command
        this.addCommand({
            id: 'toggle-timer',
            name: this.command_name,
            editorCallback: (editor, view) => {
                const lineNum = editor.getCursor().line;
                const parsed  = TimerParser.parse(editor.getLine(lineNum));
                if (parsed) {
                    if (parsed.Status === 'Running') this.handlePause(parsed, editor, lineNum);
                    else if (parsed.Status === 'Paused') this.handleContinue(parsed, editor, lineNum);
                } else {
                    this.handleStart(editor, lineNum);
                }
            }
        });
    }

    onunload() {
        this.manager.clearAll();
        this.timerContexts.clear();
    }

    onEditorMenu(menu, editor) {
        const lineNum = editor.getCursor().line;
        const parsed  = TimerParser.parse(editor.getLine(lineNum));
        const status  = parsed && parsed.Status;
        if (status === 'Running') {
            menu.addItem(item => item.setTitle(this.action_paused).setIcon('pause').onClick(() => this.handlePause(parsed, editor, lineNum)));
        } else if (status === 'Paused') {
            menu.addItem(item => item.setTitle(this.action_continue).setIcon('play').onClick(() => this.handleContinue(parsed, editor, lineNum)));
        } else {
            menu.addItem(item => item.setTitle(this.action_start).setIcon('play').onClick(() => this.handleStart(editor, lineNum)));
        }
    }

    handleStart(editor, lineNum) {
        const timerId = this.updateTimer('init', editor, lineNum);
        const endCh   = editor.getLine(lineNum).length;
        editor.setCursor({ line: lineNum, ch: endCh });
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
    }

    handleContinue(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        const endCh   = editor.getLine(lineNum).length;
        editor.setCursor({ line: lineNum, ch: endCh });
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
    }

    handlePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        const endCh   = editor.getLine(lineNum).length;
        editor.setCursor({ line: lineNum, ch: endCh });
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.stop(timerId);
        this.updateTimer('pause', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
    }

    onTick(timerId) {
        const ctx = this.timerContexts.get(timerId);
        if (ctx) {
            const { editor, lineNum } = ctx;
            const lineText = editor.getLine(lineNum) || '';
            if (lineText.includes(`timerId="${timerId}"`)) {
                this.updateTimer('update', editor, lineNum, timerId);
                return;
            }
        }
        for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
            const v = leaf.view;
            if (!v.editor) continue;
            for (let i = 0; i < v.editor.lineCount(); i++) {
                const txt = v.editor.getLine(i);
                if (txt.includes(`timerId="${timerId}"`)) {
                    this.timerContexts.set(timerId, { editor: v.editor, lineNum: i });
                    this.updateTimer('update', v.editor, i, timerId);
                    return;
                }
            }
        }
        this.manager.stop(timerId);
        this.timerContexts.delete(timerId);
    }

    updateTimer(action, editor, lineNum, timerId = null) {
        const lineText = editor.getLine(lineNum);
        const parsed   = TimerParser.parse(lineText);
        const now      = Math.floor(Date.now() / 1000);
        let data;
        switch (action) {
            case 'init':
                data = { timerId: Date.now().toString(), lineId: lineNum, Status: 'Paused', AccumulatedTime: 0, currentStartTimeStamp: null };
                break;
            case 'continue': {
                const old = parsed || {};
                data = { timerId: old.timerId || Date.now().toString(), lineId: lineNum, Status: 'Running', AccumulatedTime: old.AccumulatedTime || 0, currentStartTimeStamp: now };
                break;
            }
            case 'pause': {
                const old     = parsed;
                const elapsed = old ? now - old.currentStartTimeStamp : 0;
                data = { timerId: old.timerId, lineId: lineNum, Status: 'Paused', AccumulatedTime: (old.AccumulatedTime || 0) + elapsed, currentStartTimeStamp: null };
                break;
            }
            case 'update': {
                const old     = parsed;
                const elapsed = old ? now - old.currentStartTimeStamp : 0;
                data = { timerId: old.timerId, lineId: lineNum, Status: 'Running', AccumulatedTime: (old.AccumulatedTime || 0) + elapsed, currentStartTimeStamp: now };
                break;
            }
            default:
                throw new Error('Unknown action ' + action);
        }

        const newSpan = TimerRenderer.render(data);

        let before, after;
        if (parsed) {
            before = parsed.beforeIndex;
            after  = parsed.afterIndex;
        } else {
            const indentMatch = /^(\s*)/.exec(lineText);
            const indentLen   = indentMatch ? indentMatch[1].length : 0;
            const afterIndent = lineText.slice(indentLen);
            const boxMatch    = /^([+\-*]\s\[[^\]]\]\s+|\s*[-+*]\s+)/.exec(afterIndent);
            const boxLen      = boxMatch ? boxMatch[1].length : 0;
            before = after = indentLen + boxLen;
        }

        editor.replaceRange(newSpan,
            { line: lineNum, ch: before },
            { line: lineNum, ch: after }
        );

        return data.timerId;
    }
}

module.exports = TimerPlugin;
/* nosourcemap */
