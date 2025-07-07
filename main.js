'use strict';

const obsidian = require('obsidian');

// Regex constants
const UPDATE_INTERVAL = 1000;

// —— Utility: Format time and render span —— //
class TimerRenderer {
    static render(timerData) {
        const formatted = new Date(timerData.AccumulatedTime * 1000)
            .toISOString()
            .substr(11, 8);
        const colorStyle =
            timerData.Status === 'Running' ? 'style="color: #10b981;"' : '';
        return `<span class="timer-btn" timerId="${timerData.timerId}" Status="${timerData.Status}" AccumulatedTime="${timerData.AccumulatedTime}" currentStartTimeStamp="${timerData.currentStartTimeStamp}" lineId="${timerData.lineId}" PLT="${timerData.PLT}" ${colorStyle}>【⏳${formatted} 】 </span>`;
    }
}

// —— Utility: Parse existing span data —— //
class TimerParser {
    static parse(lineText) {
        // const spanMatch = lineText.match(/<span class="timer-btn"[^>]*>/);
        const spanMatch = lineText.match(/<span class="timer-btn"[^>]*>.*?<\/span>/);
        if (!spanMatch) return null;

        const spanTag = spanMatch[0];
        const attributesText = spanTag.substring(6, spanTag.length - 1); // 去掉 "<span " 和 ">"

        const attributes = {};
        const attributeList = attributesText.split(/\s+/); // 按空格分割成属性列表
        for (const attribute of attributeList) {
            if (attribute.includes('=')) {
                const [key, value] = attribute.split('=', 2);
                attributes[key] = value.replace(/"/g, '').replace(/'/g, '');
            } else {
                attributes[attribute] = true; // 处理没有值的属性（如 disabled）
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
        console.log('start timerId:', timerId);
    }

    stop(timerId) {
        const id = this.timers.get(timerId);
        if (id) {
            clearInterval(id);
            this.timers.delete(timerId);
            console.log('stop timerId:', timerId);
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
            timerInsertLocation: 'head' // default value
        };

        await this.loadSettings();

        // 获取当前界面语言
        const currentLanguage = window.localStorage.getItem('language');
        // console.log('Current Obsidian Interface Language:', currentLanguage);

        if (currentLanguage === 'zh') {
            this.plugin_name = '文本块计时器';
            this.plugin_desc = '强烈建议配合快捷键使用';
            this.command_name = '启动计时器/切换计时器状态';
            this.action_paused = '暂停计时';
            this.action_continue = '继续计时';
            this.action_start = '开始计时';
            this.setting_autostop_label = '自动停止计时器';
            this.setting_autostop_desc = '哪些行为视作用户手动停止计时器';
            this.setting_never = '从不停止，除非用户手动停止';
            this.setting_quit = '仅退出Obsidian时停止，关闭文件依然后台计时';
            this.setting_close = '关闭文件时立即停止';
            this.setting_insertlocation_label = '计时器插入位置';
            this.setting_insertlocation_head = '在文本前插入';
            this.setting_insertlocation_tail = '在文本后插入';
        } else if (currentLanguage === 'zh-TW') {
            this.plugin_name = '文本塊計時器';
            this.plugin_desc = '強烈建議配合快捷鍵使用';
            this.command_name = '啟動計時器/切換計時器狀態';
            this.action_paused = '暫停計時';
            this.action_continue = '繼續計時';
            this.action_start = '開始計時';
            this.setting_autostop_label = '自動停止計時器';
            this.setting_autostop_desc = '哪些行為視為用戶手動停止計時器';
            this.setting_never = '從不停止，除非用戶手動停止';
            this.setting_quit = '僅退出Obsidian時停止，關閉文件依後台計時';
            this.setting_close = '關閉文件時立即停止';
            this.setting_insertlocation_label = '計時器插入位置';
            this.setting_insertlocation_head = '在文本前插入';
            this.setting_insertlocation_tail = '在文本後插入';
        } else if (currentLanguage === 'ja') {
            this.plugin_name = 'テキストブロックタイマー';
            this.plugin_desc = 'ショートカットキーと合わせて使うのがおすすめです';
            this.command_name = 'タイマーを始める/切替タイマ';
            this.action_paused = 'タイマーを止める';
            this.action_continue = 'タイマーを続ける';
            this.action_start = 'タイマーを始める';
            this.setting_autostop_label = 'タイマー自動停止';
            this.setting_autostop_desc = 'ユーザーが手働でタイマーを停止したものとみなします';
            this.setting_never = 'ユーザーが手動で止めない限り停止しません';
            this.setting_quit = 'Obsidianをログアウトしたときだけ停止し、ファイルを閉じたままバックグラウンドカウントします';
            this.setting_close = 'ファイルを閉じたらすぐに停止します';
            this.setting_insertlocation_label = 'タイマー挿入位置です';
            this.setting_insertlocation_head = 'テキストの前に挿入します';
            this.setting_insertlocation_tail = 'テキストの後に挿入します';
        } else if (currentLanguage === 'ko') {
            this.plugin_name = '텍스트 블록 타이머';
            this.plugin_desc = '단축키에 맞춰 사용하는 것을 권장합니다';
            this.command_name = '타이머 전환';
            this.action_paused = '타이머 일시 정지';
            this.action_continue = '타이머 계속';
            this.action_start = '타이머 시작';
            this.setting_autostop_label = '타이머 자동 정지';
            this.setting_autostop_desc = '사용자가 타이머를 수동으로 종료한 것으로 간주할 행동입니다';
            this.setting_never = '사용자가 수동으로 중지하지 않는 한 정지하지 않는다';
            this.setting_quit = 'obsidian을 종료할 때만 종료되며, 닫기 파일은 여전히 백그라운드 타임을 유지한다';
            this.setting_close = '파일을 닫을 때 즉시 중지합니다';
            this.setting_insertlocation_label = '타이머 삽입 위치';
            this.setting_insertlocation_head = '텍스트 앞에 삽입';
            this.setting_insertlocation_tail = '텍스트 뒤에 삽입';

        } else {
            this.plugin_name = 'Text Block Timer';
            this.plugin_desc = 'It is strongly recommened to control timer by shortcut key';
            this.command_name = 'toggle-timer';
            this.action_paused = 'Pause Timer';
            this.action_continue = 'Continue Timer';
            this.action_start = 'Start Timer';
            this.setting_autostop_label = 'Auto Stop Timers';
            this.setting_autostop_desc = 'Which actions should stop the timer automatically?';
            this.setting_never = 'Never Stop unless user stop timer manually';
            this.setting_quit = 'Auto stop when quit Obsidian, continue timing when file closed';
            this.setting_close = 'Auto stop when file closed';
            this.setting_insertlocation_label = 'Timer insert position';
            this.setting_insertlocation_head = 'Insert before text';
            this.setting_insertlocation_tail = 'Insert after text';
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

        // 监听文件打开事件
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );


        // 注册设置
        this.addSettingTab(new TimerSettingTab(this.app, this));

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

    handleStart(editor, lineNum) {
        const timerId = this.updateTimer('init', editor, lineNum);
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        // this.timerContexts.set(timerId, { editor, lineNum });
    }

    handleContinue(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        this.updateTimer('continue', editor, lineNum, timerId);
        // this.timerContexts.set(timerId, { editor, lineNum });
    }

    handlePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.stop(timerId);
        this.updateTimer('pause', editor, lineNum, timerId);
        // this.timerContexts.set(timerId, { editor, lineNum });
    }

    handleRestore(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        // 在ontick之前,先把数据恢复
        this.updateTimer('restore', editor, lineNum, timerId);
        this.timerContexts.set(timerId, { editor, lineNum });
        this.manager.start(timerId, this.onTick.bind(this));
        // this.timerContexts.set(timerId, { editor, lineNum });
    }

    handleForcePause(parsed, editor, lineNum) {
        const timerId = parsed.timerId;
        // this.timerContexts.set(timerId, { editor, lineNum });
        // this.manager.stop(timerId);
        this.updateTimer('forcepause', editor, lineNum, timerId);
        // this.timerContexts.set(timerId, { editor, lineNum });
    }


    onTick(timerId) {
        const ctx = this.timerContexts.get(timerId);
        if (ctx) {
            const { editor, lineNum } = ctx;
            const lineText = editor.getLine(lineNum) || '';
            if (lineText.includes(`timerId="${timerId}"`)) {
                this.updateTimer('update', editor, lineNum, timerId);
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
            case 'init': // init:Timer初始化,TimerId为当前时间戳,初始化时为暂停状态,累计耗时=0,记录创建时的时间戳
                data = {
                    timerId: Date.now().toString(),
                    lineId: lineNum,
                    Status: 'Paused',
                    AccumulatedTime: 0,
                    currentStartTimeStamp: now,
                    PLT: this.pluginLoadTime,
                };
                break;
            case 'continue': // continue:暂停状态下启动: 启动瞬间的timer状态应当和暂停时状态相同,只是把status改为Running
                {
                    const old = parsed || {};
                    // const elapsed = old ?
                    //     now - old.currentStartTimeStamp : 0;
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
            case 'pause': // 逻辑应当与update一致,只是把状态改为Paused
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
            case 'update': // AccumulatedTime和currentStartTimeStamp应当更新为当前值
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
            case 'restore': // 把一个有遗留数据,且状态为Running的Timer, 把ontick失效期间的时间累加到AccumulatedTime, 把currentStartTimeStamp更新为当前时间戳, 把状态改为Running
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
            case 'forcepause': // forcepause: 强制暂停,一切保留原样,只是状态强制改写为暂停
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
        const newSpan = TimerRenderer.render(data);

        // Determine insertion position:
        // 1. Use existing span's position if present
        // 2. Otherwise calculate based on indentation and checkboxes
        let before, after;
        if (parsed) {
            before = parsed.beforeIndex;
            after = parsed.afterIndex;
        } else if (this.settings.timerInsertLocation === 'head') {

            // ol+checkbox
            const olcheckboxMatch = /(^\s*#*\d\.\s\[.?\]\s)/.exec(lineText);
            const olcheckboxLen = olcheckboxMatch ? olcheckboxMatch[0].length : 0;
            // ul+checkbox
            const ulcheckboxMatch = /(^\s*#*[-/+/*]\s\[.?\]\s)/.exec(lineText);
            const ulcheckboxLen = ulcheckboxMatch ? ulcheckboxMatch[0].length : 0;
            // ol
            const orderedListMatch = /(^\s*#*\d+\.\s)/.exec(lineText);
            const orderedListLen = orderedListMatch ? orderedListMatch[0].length : 0;
            // ul 
            const ulMatch = /(^\s*#*[-/+/*]\s)/.exec(lineText);
            const ulLen = ulMatch ? ulMatch[0].length : 0;
            // header
            const headerMatch = /(^\s*#+\s)/.exec(lineText);
            const headerLen = headerMatch ? headerMatch[0].length : 0;


            if (olcheckboxLen > 0) {
                var textleft
                textleft = lineText.slice(olcheckboxLen);
                console.log('textleft after olcheckbox:', textleft);
                before = after = olcheckboxLen;
            } else if (ulcheckboxLen > 0) {
                var textleft
                textleft = lineText.slice(ulcheckboxLen);
                console.log('textleft after checkbox:', textleft);
                before = after = ulcheckboxLen;
            } else if (orderedListLen > 0) {
                var textleft
                textleft = lineText.slice(orderedListLen);
                console.log('textleft after ol:', textleft);
                before = after = orderedListLen;
            } else if (ulLen > 0) {
                var textleft
                textleft = lineText.slice(ulLen);
                console.log('textleft after ul:', textleft);
                before = after = ulLen;
            } else if (headerLen > 0) {
                var textleft
                textleft = lineText.slice(headerLen);
                console.log('textleft after header:', textleft);
                before = after = headerLen;
            } else {
                before = after = 0;
            }
            before = before ? before : 0;
            after = after ? after : 0;
        } else if (this.settings.timerInsertLocation === 'tail') {
            before = after = lineText.length;
        }

        editor.replaceRange(
            newSpan, { line: lineNum, ch: before }, { line: lineNum, ch: after }
        );
        console.log('lineNum:', lineNum, 'before:', before, 'after:', after);
        return data.timerId;
    }

    // 用于标记是否是第一次监听到onFileOpen事件
    onFileOpen(event) {
        if (this.fileFirstOpen) {
            // 如果是第一次监听到onFileOpen事件，则针对每个leaf都执行一次恢复计时器的操作
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.editor) {
                    const editor = leaf.view.editor;
                    this.restoreTimers(editor);
                }
            }
            this.fileFirstOpen = false; // 标记为已处理过第一次监听
        } else {
            // 如果不是第一次监听，则按照原来的逻辑处理特定的文件
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if (leaf.view && leaf.view.file === event) {
                    const editor = leaf.view.editor;
                    if (editor) {
                        // 精简逻辑，可能有问题
                        // this.restoreTimers(editor);

                        // 启动一个定时器，每隔1秒检查文件行数
                        const checkInterval = setInterval(() => {
                            const lineCount = editor.lineCount();
                            if (lineCount > 1) {
                                // 如果行数大于1，则执行Restore逻辑
                                this.restoreTimers(editor);
                                clearInterval(checkInterval); // 删除定时器
                            }
                        }, 100);

                        break;
                    }
                }
            }
        }
    }

    // 新增Restore逻辑
    restoreTimers(editor) {
        const lineCount = editor.lineCount();
        for (let i = 0; i < lineCount; i++) {
            const lineText = editor.getLine(i);
            const parsed = TimerParser.parse(lineText);
            if (parsed && parsed.Status === 'Running' && !this.manager.timers.has(parsed.timerId)) {

                if (this.settings.autoStopTimers === 'never') {
                    // 对于状态为Running且timerId不在this.manager中的计时器，执行暂停和继续操作（立即恢复）
                    this.handleRestore(parsed, editor, i);
                } else if (this.settings.autoStopTimers === 'quit') {
                    // 对于状态为Running且timerId不在this.manager中的计时器，如果计时器的本次启动时间 等于 当前插件启动时间，则继续，否则强行暂停
                    console.log('PLT:', parsed.PLT, 'pluginLoadTime:', this.pluginLoadTime);
                    if (parsed.PLT === this.pluginLoadTime) {
                        this.handleRestore(parsed, editor, i);
                    } else {
                        this.handleForcePause(parsed, editor, i);
                    }
                } else if (this.settings.autoStopTimers === 'close') {
                    // 对于状态为Running且timerId不在this.manager中的计时器，执行暂停操作
                    this.handleForcePause(parsed, editor, i);
                }

            }
        }
    }

    // 设置项相关方法
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

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: this.plugin.plugin_name });
        containerEl.createEl('h3', { text: this.plugin.plugin_desc });

        new obsidian.Setting(containerEl)
            .setName(this.plugin.setting_autostop_label)
            .setDesc(this.plugin.setting_autostop_desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('never', this.plugin.setting_never)
                    .addOption('quit', this.plugin.setting_quit)
                    .addOption('close', this.plugin.setting_close)
                    .setValue(this.plugin.settings.autoStopTimers)
                    .onChange(async(value) => {
                        this.plugin.settings.autoStopTimers = value;
                        await this.plugin.saveSettings();
                    });
            });
        new obsidian.Setting(containerEl)
            .setName(this.plugin.setting_insertlocation_label)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('head', this.plugin.setting_insertlocation_head)
                    .addOption('tail', this.plugin.setting_insertlocation_tail)
                    .setValue(this.plugin.settings.timerInsertLocation)
                    .onChange(async(value) => {
                        this.plugin.settings.timerInsertLocation = value;
                        await this.plugin.saveSettings();
                    });
            });




        ;
    }
}

module.exports = TimerPlugin;