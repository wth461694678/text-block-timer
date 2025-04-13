'use strict';

var obsidian = require('obsidian');

class TimerPlugin extends obsidian.Plugin {

    async onload() {
        // console.log('Loading Timer Plugin');

        // 用于存储所有计时器的映射
        this.timers = new Map();

        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => { // 监听编辑器菜单事件
                const cursor = editor.getCursor();
                const lineId = cursor.line;
                const lineText = editor.getLine(lineId);

                // 使用正则表达式匹配当前行的内容，内容格式为 `<span class="timer-btn" timerId="${timerData.timerId}" Status="${timerData.Status}" AccumulatedTime="${timerData.AccumulatedTime}" currentStartTimeStamp="${timerData.currentStartTimeStamp}" lineId="${timerData.lineId}" ${colorStyle}>${timerData.statusicon} ⏳${formattedTime}</span>`
                const regex = /<span class="timer-btn" timerId="([^"]+)" Status="([^"]+)" AccumulatedTime="([^"]+)" currentStartTimeStamp="([^"]+)" lineId="([^"]+)"([^>]+)>([^<]+)<\/span>/;

                // const regex = /<span class="timer-btn" timerId="([^"]+)" Status="([^"]+)" AccumulatedTime="([^"]+)" currentStartTimeStamp="([^"]+)" lineId="([^"]+)".*>([^<]+)<\/span>/;
                const timerMatch = lineText.match(regex);

                // 提示解析结果
                if (timerMatch) {
                    const timerData = {
                        timerId: timerMatch[1],
                        Status: timerMatch[2],
                        AccumulatedTime: timerMatch[3],
                        currentStartTimeStamp: timerMatch[4],
                    };
                    // new obsidian.Notice(`Timer Data: ID=${timerData.timerId}, Status=${timerData.Status}, Accumulated Time=${timerData.AccumulatedTime} seconds, Start Time=${timerData.currentStartTimeStamp}`);
                } else {
                    // new obsidian.Notice('No timer data found in this line');
                }

                // 获取timerMatch的状态
                const timerStatus = timerMatch ? timerMatch[2] : null;

                // 如果timer在计时中，暂停计时按钮
                if (timerStatus === 'Running') {
                    menu.addItem((item) => {
                        item
                            .setTitle('暂停计时')
                            .setIcon('pause')
                            .onClick(() => {
                                // new obsidian.Notice('暂停计时');
                                this.stopTimer(timerMatch[1], editor, cursor.line);
                            });
                    });
                } // 如果timer在暂停中，继续计时按钮
                else if (timerStatus === 'Paused') {
                    menu.addItem((item) => {
                        item
                            .setTitle('继续计时')
                            .setIcon('play')
                            .onClick(() => {
                                // new obsidian.Notice('继续计时');
                                this.startTimer(editor, cursor.line, timerMatch[1]);
                            });
                    });
                } // 否则，开始/继续计时
                else {
                    menu.addItem((item) => {
                        item
                            .setTitle('开始计时')
                            .setIcon('play')
                            .onClick(() => {
                                // new obsidian.Notice('开始计时');
                                this.initTimer(editor, lineId);
                                // this.startTimer(editor, lineId, Date.now().toString());
                            });
                    });
                }

            })
        );
    }

    // 开始计时器
    initTimer(editor, lineId) {

        // 更新计时器状态
        this.updateTimerInfo(editor, 'init', lineId);

        // // 更新计时器状态
        // this.updateTimerInfo(editor, 'continue', lineId);

        // // 创建一个定时器
        // const intervalId = setInterval(() => {
        //     this.updateTimerInfo(editor, 'update', lineId, timerId);
        // }, 1000);

        // // 将定时器存储到映射中
        // this.timers.set(timerId, intervalId);
    }

    // 开始计时器
    startTimer(editor, lineId, timerId) {
        // 更新计时器状态
        this.updateTimerInfo(editor, 'continue', lineId);

        // 创建一个定时器
        const intervalId = setInterval(() => {
            this.updateTimerInfo(editor, 'update', lineId, timerId);
        }, 1000);

        // 将定时器存储到映射中
        this.timers.set(timerId, intervalId);
    }

    // 停止计时器
    stopTimer(timerId, editor, lineId) {
        if (this.timers.has(timerId)) {
            // 获取定时器ID并清除定时器
            const intervalId = this.timers.get(timerId);

            clearInterval(intervalId);

            // 从映射中移除定时器
            this.timers.delete(timerId);
        }

        // 更新计时器状态
        this.updateTimerInfo(editor, 'pause', lineId);


    }

    // 更新计时器信息
    updateTimerInfo(editor, action, lineId, timerId = null) {
        const cursor = editor.getCursor();
        let regex = /<span class="timer-btn" timerId="([^"]+)" Status="([^"]+)" AccumulatedTime="([^"]+)" currentStartTimeStamp="([^"]+)" lineId="([^"]+)"(.*?)>([^<]+)<\/span>/;
        let lineText = editor.getLine(lineId);
        let timerMatch = lineText.match(regex);
        let timerInfoStart = timerMatch ? timerMatch.index : lineText.length;
        let timerInfoEnd = timerInfoStart + (timerMatch ? timerMatch[0].length : 0);

        // 将timerData定义在if语句外部
        let timerData;
        if (action === 'init') {
            timerData = {
                timerId: Date.now().toString(),
                lineId: cursor.line,
                Status: 'Paused',
                AccumulatedTime: 0,
                currentStartTimeStamp: null,
                statusicon: '▶️',
            }
        } else if (action === 'continue') {
            timerData = {
                // 如果没有timerId，则使用当前时间戳作为ID
                timerId: timerMatch ? timerMatch[1] : Date.now().toString(),
                lineId: cursor.line,
                Status: 'Running',
                // 如果没有，就用0作为AccumulatedTime
                AccumulatedTime: timerMatch ? parseInt(timerMatch[3], 10) : 0,
                currentStartTimeStamp: Math.floor(Date.now() / 1000),
                statusicon: '⏸️',
            };
        } else if (action === 'pause') {
            timerData = {
                timerId: timerMatch[1],
                lineId: cursor.line,
                Status: 'Paused',
                AccumulatedTime: parseInt(timerMatch[3], 10) + (Math.floor(Date.now() / 1000) - parseInt(timerMatch[4], 10)),
                currentStartTimeStamp: null,
                statusicon: '▶️',
            };
        } else if (action === 'update') {

            // 用LineText.includes检查匹配到的文本中是否有timerId=timerId
            if (!lineText.includes(`timerId="${timerId}"`)) {
                // console.log(`!lineText.includes(timerId=${timerId})`);
                // 如果没有匹配到，则在全文本中查找timerId，返回找到timerId=timerId的第一行
                // console.log('start to find timerId in all lines,looking for timerId:', timerId);
                // console.log('editor:', editor);
                let allLines = editor.getValue().split('\n');
                // console.log('allLines:', allLines)
                let lineIndex = allLines.findIndex(line => line.includes(`timerId="${timerId}"`));
                // console.log('filtered lineIndex:', lineIndex);
                if (lineIndex !== -1) {
                    lineId = lineIndex;
                    lineText = allLines[lineIndex];
                } else {
                    // 销毁定时器
                    if (this.timers.has(timerId)) {
                        const intervalId = this.timers.get(timerId);
                        clearInterval(intervalId);
                        this.timers.delete(timerId);
                        // console.log('Timer with ID', timerId, 'destroyed');
                    }
                }
            }
            // console.log('lineId:', lineId);
            // console.log('lineText:', lineText);
            timerMatch = lineText.match(regex);
            timerInfoStart = timerMatch ? timerMatch.index : lineText.length;
            timerInfoEnd = timerInfoStart + (timerMatch ? timerMatch[0].length : 0);

            timerData = {
                timerId: timerMatch[1],
                lineId: lineId,
                Status: 'Running',
                AccumulatedTime: parseInt(timerMatch[3], 10) + (Math.floor(Date.now() / 1000) - parseInt(timerMatch[4], 10)),
                currentStartTimeStamp: Math.floor(Date.now() / 1000),
                statusicon: '⏸️',
            };
        } else {
            throw new Error('Invalid action');
        }

        const formattedTime = new Date(timerData.AccumulatedTime * 1000).toISOString().substr(11, 8);
        const colorStyle = timerData.Status === 'Running' ? 'style="color: #10b981;"' : '';
        const updatedTimerInfo = `<span class="timer-btn" timerId="${timerData.timerId}" Status="${timerData.Status}" AccumulatedTime="${timerData.AccumulatedTime}" currentStartTimeStamp="${timerData.currentStartTimeStamp}" lineId="${timerData.lineId}" ${colorStyle}>${timerData.statusicon} ⏳${formattedTime}</span>`;

        editor.replaceRange(updatedTimerInfo, { line: lineId, ch: timerInfoStart }, { line: lineId, ch: timerInfoEnd });
    }

    onunload() {
        // console.log('Unloading Timer Plugin');

        // 清除所有计时器
        for (const intervalId of this.timers.values()) {
            clearInterval(intervalId);
        }
    }
}

module.exports = TimerPlugin;