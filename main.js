'use strict';

const obsidian = require('obsidian');

const { ViewPlugin, EditorView } = require('@codemirror/view');

// Regex constants
const UPDATE_INTERVAL = 1000;
// —— Checkbox regexes —— //
const ORDERED_LIST = /(^\s*#*\d+\.\s)/
const UNORDERED_LIST = /(^\s*#*[-/+/*]\s)/
const HEADER = /(^\s*#+\s)/
const POTENTIAL_CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{0,2})\]/
const CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{1})\]\s+/




// —— Utility: Format time and render span —— //
class TimerRenderer {
    static render(timerData) {
        const formatted = new Date(timerData.AccumulatedTime * 1000)
            .toISOString()
            .substr(11, 8);
        const colorStyle =
            timerData.Status === 'Running' ? 'style="color: #10b981;"' : '';
        return `<span class="timer-btn" data-timerId="${timerData.timerId}" data-Status="${timerData.Status}" data-AccumulatedTime="${timerData.AccumulatedTime}" data-currentStartTimeStamp="${timerData.currentStartTimeStamp}" data-lineId="${timerData.lineId}" data-PLT="${timerData.PLT}" ${colorStyle}>【⏳${formatted} 】</span>`;
    }
}

// —— Utility: Parse existing span data —— //
class TimerParser {
    static parse(lineText) {
        // const spanMatch = lineText.match(/<span class="timer-btn"[^>]*>/);
        const spanMatch = lineText.match(/<span class="timer-btn"[^>]*>.*?<\/span>/);
        if (!spanMatch) return null;

        const spanTag = spanMatch[0];
        const attributesText = spanTag.substring(6, spanTag.length - 1).replace(/data-/g, ''); //remove "<span " and ">"; 


        const attributes = {};
        const attributeList = attributesText.split(/\s+/); //split by space
        for (const attribute of attributeList) {
            if (attribute.includes('=')) {
                const [key, value] = attribute.split('=', 2);
                attributes[key] = value.replace(/"/g, '').replace(/'/g, '');
            } else {
                attributes[attribute] = true; //handle attributes without value (such as disabled)
            }
        }

        return {
            raw: spanTag,
            beforeIndex: spanMatch.index,
            afterIndex: spanMatch.index + spanTag.length,
            timerId: attributes.timerId || null,
            Status: attributes.Status || null,
            AccumulatedTime: parseInt(attributes.AccumulatedTime, 10) || 0,
            currentStartTimeStamp: parseInt(attributes.currentStartTimeStamp, 10) || null,
            lineId: parseInt(attributes.lineId, 10) || null,
            PLT: parseInt(attributes.PLT, 10) || 0,
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
        // console.log('start timerId:', timerId);
    }

    stop(timerId) {
        const id = this.timers.get(timerId);
        if (id) {
            clearInterval(id);
            this.timers.delete(timerId);
            // console.log('stop timerId:', timerId);
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
        this.fileFirstOpen = true;
        this.pluginLoadTime = Date.now();

        this.default_settings = {
            autoStopTimers: 'quit', // default value
            timerInsertLocation: 'head', // default value
            enableCheckboxToTimer: true, // enable checkbox to timer by default
            runningCheckboxState: '/', // enable running checkbox state by default
            pausedCheckboxState: '-xX', // enable paused checkbox state by default
            checkboxToTimerPathRestriction: 'disable', // disable checkbox to timer path restriction by default
            pathRestrictionPaths: [] // disable path restriction by default
        };

        await this.loadSettings();

        // Get current interface language
        const currentLanguage = window.localStorage.getItem('language');
        // console.log('Current Obsidian Interface Language:', currentLanguage);

        if (currentLanguage === 'zh') {
            this.command_name = '启动计时器/切换计时器状态';
            this.action_paused = '暂停计时';
            this.action_continue = '继续计时';
            this.action_start = '开始计时';
        } else if (currentLanguage === 'zh-TW') {
            this.command_name = '啟動計時器/切換計時器狀態';
            this.action_paused = '暫停計時';
            this.action_continue = '繼續計時';
            this.action_start = '開始計時';
        } else if (currentLanguage === 'ja') {
            this.command_name = 'タイマーを始める/切替タイマ';
            this.action_paused = 'タイマーを止める';
            this.action_continue = 'タイマーを続ける';
            this.action_start = 'タイマーを始める';
        } else if (currentLanguage === 'ko') {
            this.command_name = '타이머 전환';
            this.action_paused = '타이머 일시 정지';
            this.action_continue = '타이머 계속';
            this.action_start = '타이머 시작';
        } else {
            this.command_name = 'toggle-timer';
            this.action_paused = 'Pause Timer';
            this.action_continue = 'Continue Timer';
            this.action_start = 'Start Timer';
        }

        // Add to editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', this.onEditorMenu.bind(this))
        );

        // Register "Toggle timer" command
        this.addCommand({
            id: 'toggle-timer',
            name: this.command_name,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                // console.log('lineText:', lineText);
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

        // Listen to file open event
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );


        // Register settings
        this.addSettingTab(new TimerSettingTab(this.app, this));

        // Judge enableCheckboxToTimer

        this.registerEditorExtension(
            EditorView.updateListener.of((update) => {
                // const file = this.app.workspace.getActiveFile();
                // console.log(file.path)
                // console.log('enableCheckboxToTimer:', this.settings.enableCheckboxToTimer);
                // console.log('checkPathRestriction:', this.checkPathRestriction());
                if (update.docChanged && this.settings.enableCheckboxToTimer && this.checkPathRestriction()) {
                    const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                    if (!view) return;

                    const oldDoc = update.startState.doc;
                    const newDoc = update.state.doc;

                    // Directly handle changes in iterChanges iterator
                    update.changes.iterChanges((oldFrom, oldTo, newFrom, newTo, inserted) => {
                        // Analyze text in old document before changes
                        const oldStartLine = oldDoc.lineAt(oldFrom).number;
                        const oldEndLine = oldDoc.lineAt(oldTo).number;
                        const newStartLine = newDoc.lineAt(newFrom).number;
                        const newEndLine = newDoc.lineAt(newTo).number;

                        // If the maximum value of the four values is greater than the minimum value, directly return
                        if (Math.max(oldStartLine, oldEndLine, newStartLine, newEndLine) !== Math.min(oldStartLine, oldEndLine, newStartLine, newEndLine)) return;
                        const lineNum = newStartLine - 1

                        const oldLineText = oldDoc.lineAt(oldFrom).text;
                        const newLineText = newDoc.lineAt(newFrom).text;
                        // console.log('oldLineText:', oldLineText);
                        // console.log('newLineText:', newLineText);


                        // If oldLineText doesn't satisfy POTENTIAL_CHECKBOX_REGEX or newLineText doesn't satisfy CHECKBOX_REGEX
                        if (!POTENTIAL_CHECKBOX_REGEX.test(oldLineText) || !CHECKBOX_REGEX.test(newLineText)) return;

                        // Based on strict regular expressions, parse oldLineText and newLineText to get checkboxState
                        const oldCheckboxState = oldLineText.match(CHECKBOX_REGEX) ? oldLineText.match(CHECKBOX_REGEX)[2] : undefined // undefined or 1 symbol， ?oldLineText.match(CHECKBOX_REGEX)[2]:'';
                        const newCheckboxState = newLineText.match(CHECKBOX_REGEX)[2];

                        // console.log('oldCheckboxState:', oldCheckboxState);
                        // console.log('newCheckboxState:', newCheckboxState);

                        if (!this.settings.runningCheckboxState.includes(oldCheckboxState) && this.settings.runningCheckboxState.includes(newCheckboxState)) {
                            // parse newLineText，handleStart if there's no timer，handleContinue if there's timer and status is paused
                            // console.log('parsedLineText:', newLineText);
                            const parsed = TimerParser.parse(newLineText);
                            if (!parsed) {
                                this.handleStart(view.editor, lineNum);
                                return;
                            } else if (parsed.Status === 'Paused') {
                                this.handleContinue(parsed, view.editor, lineNum);
                            }
                        }

                        if (!this.settings.pausedCheckboxState.includes(oldCheckboxState) && this.settings.pausedCheckboxState.includes(newCheckboxState)) {
                            // parse newLineText，diretcly return if there's no timer，handlePause if there's timer and status is running
                            const parsed = TimerParser.parse(newLineText);
                            if (!parsed) {
                                return;
                            } else if (parsed.Status === 'Running') {
                                this.handlePause(parsed, view.editor, lineNum);
                            }
                        }

                    });
                }
            })
        );

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
                .setTitle(this.action_paused)
                .setIcon('pause')
                .onClick(() => this.handlePause(parsed, editor, lineNum))
            );
        } else if (status === 'Paused') {
            menu.addItem((item) =>
                item
                .setTitle(this.action_continue)
                .setIcon('play')
                .onClick(() => this.handleContinue(parsed, editor, lineNum))
            );
        } else {
            menu.addItem((item) =>
                item
                .setTitle(this.action_start)
                .setIcon('play')
                .onClick(() => this.handleStart(editor, lineNum))
            );
        }
    }

    checkPathRestriction() {
        const restriction = this.settings.checkboxToTimerPathRestriction;
        const paths = this.settings.pathRestrictionPaths;

        if (restriction === 'disable') return true;

        // Get File Path
        const currentFile = this.app.workspace.getActiveFile();
        if (!currentFile) return false;

        const currentFilePath = currentFile.path;

        if (restriction === 'whitelist') {
            for (const path of paths) {
                // console.log(path)
                // console.log(currentFilePath)
                // console.log(currentFilePath.startsWith(path))
                if (currentFilePath.startsWith(path))
                    return true;
            }
            return false
        } else if (restriction === 'blacklist') {
            for (const path of paths) {
                // console.log(path)
                // console.log(currentFilePath)
                // console.log(currentFilePath.startsWith(path))
                if (currentFilePath.startsWith(path)) {
                    return false;
                }
            }
            return true
        } else {
            return false
        }
    }



    handleStart(editor, lineNum) {
        const timerId = this.updateTimer('init', editor, lineNum);
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
    }

    handleContinue(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, parsed, timerId);
    }

    handlePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.stop(timerId);
        this.updateTimer('pause', editor, lineNum, parsed, timerId);
    }

    handleRestore(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.updateTimer('restore', editor, lineNum, parsed, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
    }

    handleForcePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.updateTimer('forcepause', editor, lineNum, parsed, timerId);
    }


    onTick(timerId) {
        const ctx = this.timerContexts.get(timerId);
        if (ctx) {
            const { editor, lineNum } = ctx;
            const lineText = editor.getLine(lineNum) || '';
            if (lineText.includes(`timerId="${timerId}"`)) {
                const parsed = TimerParser.parse(lineText);
                this.updateTimer('update', editor, lineNum, parsed, timerId);
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
                    const parsed = TimerParser.parse(txt);
                    this.updateTimer('update', e, i, parsed, timerId);
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
    updateTimer(action, editor, lineNum, parsed = null, timerId = null) {

        var lineText = editor.getLine(lineNum);
        // console.log('lineNum:', lineNum, 'lineText:', lineText);

        var parsed = parsed ? parsed : TimerParser.parse(lineText);
        const now = Math.floor(Date.now() / 1000);

        let data;
        switch (action) {
            case 'init': //
                data = {
                    timerId: Date.now().toString(),
                    lineId: lineNum,
                    Status: 'Running',
                    AccumulatedTime: 0,
                    currentStartTimeStamp: now,
                    PLT: this.pluginLoadTime,
                };
                break;
            case 'continue':
                {
                    const old = parsed || {};
                    const elapsed = 0;
                    data = {
                        timerId: timerId || old.timerId || Date.now().toString(),
                        lineId: lineNum,
                        Status: 'Running',
                        AccumulatedTime:
                            (old.AccumulatedTime || 0) + elapsed,
                        currentStartTimeStamp: now,
                        PLT: this.pluginLoadTime,
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
                        currentStartTimeStamp: now,
                        PLT: this.pluginLoadTime,
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
                        PLT: this.pluginLoadTime,
                    };
                    break;
                }
            case 'restore':
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
                        PLT: this.pluginLoadTime,
                    };
                    break;
                }
            case 'forcepause':
                {
                    const old = parsed;
                    data = {
                        timerId: old.timerId,
                        lineId: lineNum,
                        Status: 'Paused',
                        AccumulatedTime:
                            (old.AccumulatedTime || 0),
                        currentStartTimeStamp: now,
                        PLT: this.pluginLoadTime,
                    };
                    break;
                }
            default:
                throw new Error('Unknown action ' + action);
        }

        // Render new span
        var newSpan = TimerRenderer.render(data);

        // in init case, add space before and after the newSpan to avoid explosion of raw html elements 
        if (action === 'init') {
            newSpan = ' ' + newSpan + ' ';
        }

        // Determine insertion position:
        // 1. Use existing span's position if present
        // 2. Otherwise calculate based on indentation and checkboxes
        let before, after;
        if (parsed) {
            before = parsed.beforeIndex;
            after = parsed.afterIndex;
        } else if (this.settings.timerInsertLocation === 'head') {

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

            if (checkboxLen > 0) {
                var textleft = lineText.slice(checkboxLen);
                // console.log('textleft after olcheckbox:', textleft);
                before = after = checkboxLen;
            } else if (orderedListLen > 0) {
                var textleft = lineText.slice(orderedListLen);
                // console.log('textleft after ol:', textleft);
                before = after = orderedListLen;
            } else if (ulLen > 0) {
                var textleft = lineText.slice(ulLen);
                // console.log('textleft after ul:', textleft);
                before = after = ulLen;
            } else if (headerLen > 0) {
                var textleft = lineText.slice(headerLen);
                // console.log('textleft after header:', textleft);
                before = after = headerLen;
            } else {
                before = after = 0;
            }
            before = before ? before : 0;
            after = after ? after : 0;
        } else if (this.settings.timerInsertLocation === 'tail') {
            before = after = lineText.length;
        }

        // console.log('lineNum:', lineNum, 'before:', before, 'after:', after);
        editor.replaceRange(
            newSpan, { line: lineNum, ch: before }, { line: lineNum, ch: after }
        );
        // console.log('lineNum:', lineNum, 'before:', before, 'after:', after);
        return data.timerId;
    }

    onFileOpen(event) {
        if (this.fileFirstOpen) {
            // If it is the first time onFileOpen event is listened, for each leaf, execute restore timers
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.editor) {
                    const editor = leaf.view.editor;
                    this.restoreTimers(editor);
                }
            }
            this.fileFirstOpen = false;
        } else {
            // If it is not the first time onFileOpen event is listened, for each leaf, execute restore timers
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.file === event) {
                    const editor = leaf.view.editor;
                    if (editor) {
                        // this.restoreTimers(editor);

                        // start a timer, every 1 second, check line count
                        const checkInterval = setInterval(() => {
                            const lineCount = editor.lineCount();
                            if (lineCount > 1) {
                                // if line count is greater than 1, execute restore logic
                                this.restoreTimers(editor);
                                clearInterval(checkInterval);
                            }
                        }, 100);

                        break;
                    }
                }
            }
        }
    }

    restoreTimers(editor) {
        const lineCount = editor.lineCount();
        for (let i = 0; i < lineCount; i++) {
            const lineText = editor.getLine(i);
            const parsed = TimerParser.parse(lineText);
            if (parsed && parsed.Status === 'Running' && !this.manager.timers.has(parsed.timerId)) {

                if (this.settings.autoStopTimers === 'never') {
                    // For timers with status Running and timerId not in this.manager, execute pause and continue operation (immediate recovery)
                    this.handleRestore(parsed, editor, i);
                } else if (this.settings.autoStopTimers === 'quit') {
                    // For timers with status Running and timerId not in this.manager, if timer's startup time is equal to current plugin startup time, continue, otherwise force pause
                    // console.log('PLT:', parsed.PLT, 'pluginLoadTime:', this.pluginLoadTime);
                    if (parsed.PLT === this.pluginLoadTime) {
                        this.handleRestore(parsed, editor, i);
                    } else {
                        this.handleForcePause(parsed, editor, i);
                    }
                } else if (this.settings.autoStopTimers === 'close') {
                    // For timers with status Running and timerId not in this.manager, execute pause operation
                    this.handleForcePause(parsed, editor, i);
                }

            }
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, this.default_settings, await this.loadData());
    }


    async saveSettings() {
        await this.saveData(this.settings);
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

        // Load current language settings
        const currentLanguage = window.localStorage.getItem('language') || 'en';
        let lang;
        // Simplified Chinese
        if (currentLanguage === 'zh') {
            lang = {
                name: '文本块计时器',
                desc: '强烈建议配合快捷键使用',
                tutorial: '更多图片和视频教程，请访问：',
                askforvote: '如果你喜欢这款插件，请为我的Github项目点个Star🌟',
                issue: '如果有任何问题或建议，可以在Github项目中提出Issue，并注明使用的插件版本和复现步骤',
                sections: {
                    basic: {
                        name: '通用设置',
                    },
                    bycommand: {
                        name: '通过命令行控制计时器',
                        desc: '强烈建议给命令`启动计时器/切换计时器状态`添加一个快捷键，并使用快捷键控制计时器'
                    },
                    byeditormenu: {
                        name: '通过右键菜单控制计时器',
                        desc: '你可以通过右键菜单快速体验计时器功能，但并不推荐这种使用方式（尤其是Mac系统）'
                    },
                    bycheckbox: {
                        name: '通过任务状态自动控制计时器',
                        desc: '你可以在切换任务状态（复选框类型）的同时，自动生成或更新计时器，对Tasks Plugin（任务插件）用户友好'
                    },
                },
                autostop: {
                    name: '自动停止计时器',
                    desc: '哪些行为视作用户手动停止计时器',
                    choice: {
                        never: '从不停止，除非用户手动停止',
                        quit: '仅退出 Obsidian 时停止，关闭文件依然后台计时',
                        close: '关闭文件时立即停止',
                    }
                },
                insertlocation: {
                    name: '计时器插入位置',
                    desc: '配合Day Planner插件使用时，推荐在文本后插入',
                    choice: {
                        head: '在文本前插入',
                        tail: '在文本后插入',
                    }
                },
                enableCheckboxToTimer: {
                    name: '使用任务状态控制计时器',
                    desc: '启用此功能后，你可以通过更改任务框的状态自动控制计时器的启动、暂停、继续',
                    runningSymbolStr: {
                        name: '触发计时器开始/继续的任务状态符号',
                        desc: '任务状态符号应为合法的单个字符，如 /, 如希望多种符号都能触发计时器开始/继续，请直接把这些字符连接起来，如/>+'
                    },
                    pausedSymbolStr: {
                        name: '触发计时器暂停的任务状态符号',
                        desc: '任务状态符号应为合法的单个字符，如 x, 如希望多种符号都能触发计时器暂停，请直接把这些字符连接起来，如xX-'
                    },
                    pathControl: {
                        name: '是否启用路径控制',
                        desc: '是否需要限制在哪些文件夹内才能用任务状态控制计时器，注意：当路径直接指向文件时，必须显式声明文件后缀。如 `日记/2025`是个目录,`日记/20250101.md`是文件。',
                        choice: {
                            disable: '不启用路径控制，vault下所有文件都可以用任务状态控制计时器',
                            whitelist: '启用白名单路径控制，只有白名单路径中的文件才能用任务状态控制计时器',
                            blacklist: '启用黑名单路径控制，只有黑名单路径以外的文件才能用任务状态控制计时器',
                        }
                    }
                }
            };
        }
        // Traditional Chinese
        else if (currentLanguage === 'zh-TW') {
            lang = {
                name: '文本塊計時器',
                desc: '強烈建議配合快捷鍵使用',
                tutorial: '更多圖片和視頻教程，請訪問：',
                askforvote: '如果你喜歡這個插件，請為我的Github專案點個Star🌟',
                issue: '如果有任何問題或建議，請在Github專案中提出Issue，並註明使用的插件版本和複現步驟',
                sections: {
                    basic: {
                        name: '通用設定',
                    },
                    bycommand: {
                        name: '通過命令列控制計時器',
                        desc: '強烈建議給命令列『啟動計時器/切換計時器狀態』添加一個快捷鍵，並使用快捷鍵控制計時器'
                    },
                    byeditormenu: {
                        name: '通過右鍵選單控制計時器',
                        desc: '在目標文本區塊處右鍵下拉選單，點擊計時器功能按鈕'
                    },
                    bycheckbox: {
                        name: '通過任務狀態自動控制計時器',
                        desc: '你可以在切換任務狀態的同時，自动生成或更新計時器，對Tasks Plugin（任務插件）用戶友好'
                    },
                },
                autostop: {
                    name: '自動停止計時器',
                    desc: '哪些行為視作用戶手動停止計時器',
                    choice: {
                        never: '從不停止，除非用戶手動停止',
                        quit: '僅退出 Obsidian 時停止，關閉文件依然後台計時',
                        close: '關閉文件時立即停止',
                    }
                },
                insertlocation: {
                    name: '計時器插入位置',
                    desc: '與 Day Planner 插件搭配使用時，建議在文本後插入',
                    choice: {
                        head: '在文本前插入',
                        tail: '在文本後插入',
                    }
                },
                enableCheckboxToTimer: {
                    name: '使用任務狀態控制計時器',
                    desc: '啟用此功能後，你可以通過更改任務框的狀態自動控制計時器的啟動、暫停、繼續',
                    runningSymbolStr: {
                        name: '觸發計時器開始/繼續的任務狀態符號',
                        desc: '任務狀態符號應為合法的單個字符，如 /, 如希望多種符號都能觸發計時器開始/继续，請直接把这些符號連接起來，如/>+'
                    },
                    pausedSymbolStr: {
                        name: '觸發計時器暫停的任務狀態符號',
                        desc: '任務狀態符號應為合法的單個字符，如 x, 如希望多種符號都能觸發計時器暫停，請直接把这些符號連接起來，如xX-'
                    },
                    pathControl: {
                        name: '是否啟用路徑控制',
                        desc: '是否需要限制在哪些路徑下才能用任務狀態控制計時器，註意：當路徑直接指向文件時，必須顯式聲明文件後綴。如 `日記/2025`是個目錄,`日記/20250101.md`是文件。',
                        choice: {
                            disable: '不啟用路徑控制，vault下所有文件都可以用任務狀態控制計時器',
                            whitelist: '啟用白名單路徑控制，只有白名單路徑中的文件才能用任務狀態控制計時器',
                            blacklist: '啟用黑名單路徑控制，只有黑名單路徑以外的文件才能用任務狀態控制計時器',
                        }
                    }
                }
            };
        }
        // Japanese
        else if (currentLanguage === 'ja') {
            lang = {
                name: 'テキストブロックタイマー',
                desc: 'ストップウォッチを追加して時間の消費を追跡します',
                tutorial: '画像や動画のチュートリアルはこちら：',
                askforvote: 'このプラグインが気に入ったら、GitHub プロジェクトに ⭐ をお願いします！',
                issue: '問題や提案があれば、GitHub プロジェクトに Issue を立ててください。プラグインのバージョンと再現手順を明記してください。',
                sections: {
                    basic: { name: '汎用設定です' },
                    bycommand: {
                        name: 'コマンドでタイマーを制御',
                        desc: 'ショートカットを toggle-timer コマンドに割り当てることを強く推奨します。'
                    },
                    byeditormenu: {
                        name: '右クリックメニューでタイマーを制御',
                        desc: 'すぐに体験したい場合は右クリックで操作できますが、Mac ユーザーの場合は非推奨です。'
                    },
                    bycheckbox: {
                        name: 'チェックボックスでタイマーを自動制御',
                        desc: 'チェックボックスを切り替えるだけでタイマーが自動作成・更新されます。Tasks プラグインユーザーに特に便利です。'
                    }
                },
                autostop: {
                    name: 'タイマーの自動停止',
                    desc: 'どのアクションでタイマーを自動停止しますか？',
                    choice: {
                        never: '手動で停止するまで絶対に停止しない',
                        quit: 'Obsidian を終了したら停止、ファイルを閉じてもタイマーは継続',
                        close: 'ファイルを閉じたら自動停止'
                    }
                },
                insertlocation: {
                    name: 'タイマーの挿入位置',
                    desc: 'Day Planner プラグインと併用する場合は「テキストの後ろ」に挿入することを推奨します。',
                    choice: {
                        head: 'テキストの前に挿入',
                        tail: 'テキストの後に挿入'
                    }
                },
                enableCheckboxToTimer: {
                    name: 'タスク状態制御タイマーを使います',
                    desc: 'この機能を有効にすると、タスクボックスの状態を変更することでタイマーの起動、停止、継続を自働的に制御できます。',
                    runningSymbolStr: {
                        name: '実行中記号',
                        desc: 'タイマー実行中を示す単一文字。複数は直接連結、例：/>+'
                    },
                    pausedSymbolStr: {
                        name: '一時停止記号',
                        desc: 'タイマー一時停止を示す単一文字。複数は直接連結、例：xX-'
                    },
                    pathControl: {
                        name: 'パス制限',
                        desc: '制限を通過したフォルダ/ファイルのみチェックボックス連動を利用可能です。注意:パスが直接ファイルを指す場合は、ファイルのサフィックスを書く必要があります。例：フォルダ DailyNote/2025 ファイル DailyNote/2025/20250101.md',
                        choice: {
                            disable: '制限なし（全ファイルで有効）',
                            whitelist: 'ホワイトリスト内のファイルのみ有効',
                            blacklist: 'ブラックリスト内のファイルは無効'
                        }
                    }
                }
            };
        }
        // Korean
        else if (currentLanguage === 'ko') {
            lang = {
                name: '텍스트 블록 타이머',
                desc: '단축키와 함께 사용하는 것이 좋습니다',
                tutorial: '더 많은 사진과 비디오 튜토리얼은 다음을 방문하십시오: ',
                askforvote: '이 플러그인이 마음에 드신다면, 제 github 프로젝트의 별을 클릭해 주세요⭐',
                issue: '문제나 제안 사항이 있을 경우 Github 프로젝트에서 Issue를 생성해 주시기 바랍니다. 플러그인 버전과 재현 단계를 명시해 주세요',
                sections: {
                    basic: {
                        name: '일반 설정',
                    },
                    bycommand: {
                        name: '명령줄로 타이머 제어',
                        desc: '명령줄 `타이머 시작/상태 전환`에 단축키를 추가하는 것을 강력추천하며, 단축키를 사용하여 타이머를 제어할 수 있습니다'
                    },
                    byeditormenu: {
                        name: '우클릭 메뉴로 타이머 제어',
                        desc: '목표 텍스트 블록에서 우클릭 드롭다운 메뉴를 열고, 타이머 기능 버튼을 클릭합니다'
                    },
                    bycheckbox: {
                        name: '체크박스를 통한 자동 타이머 제어',
                        desc: '태스크 상태를 전환하는 동안 타이머를 자동으로 생성하거나 업데이트할 수 있으며,  Tasks Plugin 사용자들에게 매우 우호적입니다'
                    },
                },
                autostop: {
                    name: '타이머 자동 정지',
                    desc: '사용자가 타이머를 수동으로 정지한 것으로 간주되는 동작은?',
                    choice: {
                        never: '사용자가 수동으로 중지하지 않는 한 정지하지 않습니다',
                        quit: 'obsidian을 종료할 때만 종료되며, 닫기 파일은 여전히 백그라운드 타임을 유지한다',
                        close: '파일을 닫을 때 즉시 정지합니다',
                    }
                },
                insertlocation: {
                    name: '타이머 삽입 위치',
                    desc: 'Day Planner 플러그인과 함께 사용할 때는 텍스트 뒤에 삽입하는 것을 추천합니다',
                    choice: {
                        head: '텍스트 앞에 삽입합니다',
                        tail: '텍스트 뒤에 삽입합니다',
                    }
                },
                enableCheckboxToTimer: {
                    name: '체크박스로 타이머 제어',
                    desc: '이 기능을 사용하면 작업 상자의 상태를 변경하여 타이머의 시작, 일시 정지, 계속을 자동으로 제어할 수 있습니다',
                    runningSymbolStr: {
                        name: '타이머 시작/재개 체크박스 상태 기호',
                        desc: '시작/재개를 나타내는 체크박스 상태 기호를 지정합니다. 여러 기호를 조합하여 사용할 수 있습니다. 예: />+',
                    },
                    pausedSymbolStr: {
                        name: '타이머 일시정지 체크박스 상태 기호',
                        desc: '일시정지를 나타내는 체크박스 상태 기호를 지정합니다. 여러 기호를 조합하여 사용할 수 있습니다. 예: xX-',
                    },
                    pathControl: {
                        name: '경로 제어 활성화',
                        desc: '체크박스 상태로 타이머를 제어할 수 있는 폴더를 제한합니다，참고:경로가 파일을 직접 지칭할 때는 파일 접미사를 써야 한다，예를 들어,`일기/2025`는 카탈로그이고,`일기/20250101.md`는 파일이다',
                        choice: {
                            disable: '경로 제어를 사용하지 않고 볼트 (vault)의 모든 파일에서 작업 상태 타이머를 제어할 수 있다',
                            whitelist: '화이트리스트 경로로 제한하고, 화이트리스트 경로 내의 파일만이 체크박스 상태로 타이머 제어를 할 수 있습니다',
                            blacklist: '블랙리스트 경로를 제외하고, 블랙리스트 경로 외의 파일에서 체크박스 상태로 타이머 제어를 활성화합니다',
                        }
                    }
                }
            };
        }
        // English
        else {
            lang = {
                name: 'Text Block Timer',
                desc: 'Add a StopWatch to follow your time consumption',
                tutorial: 'For more image and video tutorials, please visit: ',
                askforvote: 'If you like this plugin, please give my Github project a Star🌟',
                issue: 'If you have any issues or suggestions, please raise an Issue in the Github project and specify the plugin version you are using along with the reproduction steps',
                sections: {
                    basic: {
                        name: 'Basic Settings',
                    },
                    bycommand: {
                        name: 'Control Timer By Command',
                        desc: 'Bind a shortcut to command `toggle-timer` is strongly recommended.'
                    },
                    byeditormenu: {
                        name: 'Control Timer By Right-Click Dropdown Menu',
                        desc: 'For quick experience, you can use right click to control timer. However it is not recommended especially for Mac users.'
                    },
                    bycheckbox: {
                        name: 'Control Timer By Checkbox Automatically',
                        desc: 'You can focus on toggling checkboxes with timers automatically created and updated for you, especially friendly for Tasks Plugin users.'
                    },

                },

                autostop: {
                    name: 'Auto Stop Timers',
                    desc: 'Which actions should stop the timer automatically?',
                    choice: {
                        never: 'Never Stop unless user stop timer manually',
                        quit: 'Auto stop when quit Obsidian, continue timing when file closed',
                        close: 'Auto stop when file closed'
                    }
                },

                insertlocation: {
                    name: 'Timer Insert Position',
                    desc: 'When used with the Day Planner plugin, it is recommended to insert after the text',
                    choice: {
                        head: 'Insert before text',
                        tail: 'Insert after text'
                    }
                },

                enableCheckboxToTimer: {
                    name: 'Enable Checkbox to Timer',
                    desc: 'Enable this feature to automatically control timers via checkbox states',
                    runningSymbolStr: {
                        name: 'Running State Symbols',
                        desc: 'Symbols (single characters) that indicate a running timer. Multiple symbols should be combined directly, e.g. />+'
                    },
                    pausedSymbolStr: {
                        name: 'Paused State Symbols',
                        desc: 'Symbols (single characters) that indicate a paused timer. Multiple symbols should be combined directly, e.g. xX-'
                    },
                    pathControl: {
                        name: 'Path Restriction',
                        desc: 'Only folders pass restrictions can use checkbox states to control timers. Note: When the path directly points to the file, the file suffix must be explicitly declared. Folder Example: `DailyNote/2025` File Example: `DailyNote/2025/20250101.md`',
                        choice: {
                            disable: 'No restriction - all files in the vault can use this feature',
                            whitelist: 'Only files in whitelisted paths can use this feature',
                            blacklist: 'Files in blacklisted paths cannot use this feature'
                        }
                    }
                }
            };
        }

        containerEl.createEl('h1', { text: lang.name });
        containerEl.createEl('h2', { text: lang.desc });
        containerEl.createEl('div', { text: '' });
        // Create a new block for displaying tutorial information and links
        const tutorialInfo = containerEl.createEl('div');
        tutorialInfo.addClass('tutorial-info');

        // Create a paragraph element
        const tutorialParagraph = tutorialInfo.createEl('p');
        tutorialParagraph.setText(lang.tutorial);

        // Create a link element
        const tutorialLink = tutorialParagraph.createEl('a');
        tutorialLink.href = 'https://github.com/wth461694678/text-block-timer';
        tutorialLink.setText('GitHub');
        tutorialLink.target = '_blank'; // Open link in a new tab

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('p', { text: lang.askforvote });

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('p', { text: lang.issue });

        containerEl.createEl('h3', { text: lang.sections.basic.name });
        // Auto stop timers settings
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


        // Timer insert location settings
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


        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.bycommand.name });
        new obsidian.Setting(containerEl)
            .setName(lang.sections.bycommand.desc);


        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.byeditormenu.name });
        new obsidian.Setting(containerEl)
            .setName(lang.sections.byeditormenu.desc);


        containerEl.createEl('div', { text: '' });
        // Add a horizontal line
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
                        this.display(); // 重新渲染设置页面
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
                            // 去除方括号
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