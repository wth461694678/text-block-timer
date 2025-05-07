'use strict';

const obsidian = require('obsidian');

// Regex constants
const TIMER_REGEX = /<span class="timer-btn" timerId="([^"]+)" Status="([^"]+)" AccumulatedTime="([^"]+)" currentStartTimeStamp="([^"]+)" lineId="([^"]+)"([^>]*)>([^<]+)<\/span>/;
const UPDATE_INTERVAL = 1000;

// —— Utility: Format time and render span —— //
class TimerRenderer {
    static render(timerData) {
        const formatted = new Date(timerData.AccumulatedTime * 1000)
            .toISOString()
            .substr(11, 8);
        const colorStyle =
            timerData.Status === 'Running' ? 'style="color: #10b981;"' : '';
        return `<span class="timer-btn" timerId="${timerData.timerId}" Status="${timerData.Status}" AccumulatedTime="${timerData.AccumulatedTime}" currentStartTimeStamp="${timerData.currentStartTimeStamp}" lineId="${timerData.lineId}" ${colorStyle}>【⏳${formatted} 】 </span>`;
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
        this.manager = new TimerManager();
        // Stores context for each timerId: { editor, lineNum }
        this.timerContexts = new Map();

        // Add to editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', this.onEditorMenu.bind(this))
        );

        // Register "Toggle timer" command
        this.addCommand({
            id: 'toggle-timer',
            name: 'Toggle timer',
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText);

                if (parsed) {
                    if (parsed.Status === 'Running') {
                        this.handlePause(parsed, editor, lineNum);
                    } else if (parsed.Status === 'Paused') {
                        this.handleContinue(parsed, editor, lineNum);
                    } else {
                        this.handleStart(editor, lineNum);
                    }
                } else {
                    this.handleStart(editor, lineNum);
                }
            },
        });
    }

    onunload() {
        this.manager.clearAll();
        this.timerContexts.clear();
    }

    onEditorMenu(menu, editor, view) {
        const cursor = editor.getCursor();
        const lineNum = cursor.line;
        const lineText = editor.getLine(lineNum);
        const parsed = TimerParser.parse(lineText);
        const status = parsed ? parsed.Status : null;

        if (status === 'Running') {
            menu.addItem((item) =>
                item
                .setTitle('暂停计时')
                .setIcon('pause')
                .onClick(() => this.handlePause(parsed, editor, lineNum))
            );
        } else if (status === 'Paused') {
            menu.addItem((item) =>
                item
                .setTitle('继续计时')
                .setIcon('play')
                .onClick(() => this.handleContinue(parsed, editor, lineNum))
            );
        } else {
            menu.addItem((item) =>
                item
                .setTitle('开始计时')
                .setIcon('play')
                .onClick(() => this.handleStart(editor, lineNum))
            );
        }
    }

    handleStart(editor, lineNum) {
        const timerId = this.updateTimer('init', editor, lineNum);
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
    }

    handleContinue(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
    }

    handlePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
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

        const leaves = this.app.workspace.getLeavesOfType('markdown');
        for (const leaf of leaves) {
            if (!leaf.view || !leaf.view.editor) continue;
            const e = leaf.view.editor;
            for (let i = 0; i < e.lineCount(); i++) {
                const txt = e.getLine(i);
                if (txt.includes(`timerId="${timerId}"`)) {
                    this.timerContexts.set(timerId, { editor: e, lineNum: i });
                    this.updateTimer('update', e, i, timerId);
                    return;
                }
            }
        }

        this.manager.stop(timerId);
        this.timerContexts.delete(timerId);
    }

    /**
     * Unified update interface
     * @param action - init | continue | pause | update
     */
    updateTimer(action, editor, lineNum, timerId = null) {
        const lineText = editor.getLine(lineNum);
        const parsed = TimerParser.parse(lineText);
        const now = Math.floor(Date.now() / 1000);

        let data;
        switch (action) {
            case 'init':
                data = {
                    timerId: Date.now().toString(),
                    lineId: lineNum,
                    Status: 'Paused',
                    AccumulatedTime: 0,
                    currentStartTimeStamp: null,
                };
                break;
            case 'continue':
                {
                    const old = parsed || {};
                    data = {
                        timerId: timerId || old.timerId || Date.now().toString(),
                        lineId: lineNum,
                        Status: 'Running',
                        AccumulatedTime: old.AccumulatedTime || 0,
                        currentStartTimeStamp: now,
                    };
                    break;
                }
            case 'pause':
                {
                    const old = parsed;
                    const elapsed = old ?
                        now - old.currentStartTimeStamp : 0;
                    data = {
                        timerId: old.timerId,
                        lineId: lineNum,
                        Status: 'Paused',
                        AccumulatedTime:
                            (old.AccumulatedTime || 0) + elapsed,
                        currentStartTimeStamp: null,
                    };
                    break;
                }
            case 'update':
                {
                    const old = parsed;
                    const elapsed = old ?
                        now - old.currentStartTimeStamp : 0;
                    data = {
                        timerId: old.timerId,
                        lineId: lineNum,
                        Status: 'Running',
                        AccumulatedTime:
                            (old.AccumulatedTime || 0) + elapsed,
                        currentStartTimeStamp: now,
                    };
                    break;
                }
            default:
                throw new Error('Unknown action ' + action);
        }

        // Render new span
        const newSpan = TimerRenderer.render(data);

        // Determine insertion position:
        // 1. Use existing span's position if present
        // 2. Otherwise calculate based on indentation and checkboxes
        let before, after;
        if (parsed) {
            before = parsed.beforeIndex;
            after = parsed.afterIndex;
        } else {
            // Calculate insertion position after indentation and checkboxes
            const indentMatch = /^(\s*)/.exec(lineText);
            const indentLen = indentMatch ? indentMatch[1].length : 0;

            // Check for markdown checkbox or list patterns after indentation
            const afterIndent = lineText.slice(indentLen);
            const checkboxMatch = /^([+\-*]\s\[[^\]]\]\s+|\s*[-+*]\s+)/.exec(afterIndent);
            const checkboxLen = checkboxMatch ? checkboxMatch[1].length : 0;

            before = after = indentLen + checkboxLen;
        }

        editor.replaceRange(
            newSpan, { line: lineNum, ch: before }, { line: lineNum, ch: after }
        );
        return data.timerId;
    }
}

module.exports = TimerPlugin;