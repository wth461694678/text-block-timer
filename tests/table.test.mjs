import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { parseHTML } from 'linkedom';
const require = createRequire(import.meta.url);
const output = await build({ stdin: { contents: "export * from './src/io/TableCell'; export * from './src/io/TimerParser'; export * from './src/io/TimerFileManager';", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, external: ['@codemirror/state'] });
const mod = { exports: {} };
new Function('require', 'module', 'exports', output.outputFiles[0].text)(require, mod, mod.exports);
const { tableCells, tableTarget, timerCursor, TimerParser, TimerFileManager } = mod.exports;
globalThis.document = parseHTML('<html></html>').document;
const span = (id, dur = 0) => `<span class="timer-r" id="${id}" data-dur="${dur}" data-ts="1">【00:00】</span>`;
function editor(rows, line = 2, ch = 3) {
    return { getLine: i => rows[i], lineCount: () => rows.length, getCursor: () => ({ line, ch }), replaceRange(text, a, b) { rows[a.line] = rows[a.line].slice(0, a.ch) + text + rows[a.line].slice(b.ch); } };
}
test('insertion stays inside the selected cell, at head and tail', () => {
    for (const row of ['| left | right |', 'left | right', '| left |   |']) {
        const rows = ['| A | B |', '| --- | --- |', row];
        const cell = tableCells(row)[1];
        const ed = editor(rows, 2, cell.from + 1);
        const fm = new TimerFileManager({}, {});
        for (const where of ['head', 'tail']) {
            const p = fm.calculateInsertPosition(ed, 2, where).before;
            assert.ok(p >= cell.from && p <= cell.to);
            assert.equal(tableCells(row.slice(0, p) + span('new') + row.slice(p)).length, 2);
        }
    }
});
test('escaped pipes and empty cells preserve column boundaries', () => {
    assert.equal(tableCells('| a\\|b | | c |').length, 3);
    assert.equal(tableCells('| `a\\|b` | c |').length, 2);
    assert.equal(tableCells('| a\\\\|b | c |').length, 3);
});
test('headers are editable, separator rows and outer boundaries are blocked', () => {
    const ed = editor(['| A | B |', '| :--- | ---: |', '| x | y |']);
    assert.ok(tableTarget(ed, 0, 2).cell);
    assert.equal(tableTarget(ed, 1, 3).cell, null);
    assert.equal(tableTarget(ed, 2, 0).cell, null);
    assert.equal(tableTarget(editor(['a | b']), 0, 2), null);
});
test('commands select only the current cell and return absolute span offsets', () => {
    const row = `| ${span('a')} first | ${span('b')} second | empty |`;
    const ed = editor(['| A | B | C |', '| --- | --- | --- |', row]);
    const cells = tableCells(row);
    assert.equal(TimerParser.parseAtCursor(ed, 2, cells[1].from + 1).timerId, 'b');
    const parsed = TimerParser.parseAtCursor(ed, 2, cells[1].from + 1);
    assert.equal(row.slice(parsed.beforeIndex, parsed.afterIndex), span('b'));
    assert.equal(TimerParser.parseAtCursor(ed, 2, cells[2].from + 1), null);
    assert.deepEqual(TimerParser.parseAll(row).map(t => t.timerId), ['a', 'b']);
});
test('updating second timer in edit mode preserves first timer and table', async () => {
    const row = `| ${span('a')} | ${span('b')} |`;
    const rows = ['| A | B |', '| --- | --- |', row];
    const ed = editor(rows);
    const fm = new TimerFileManager({}, {});
    await fm.writeTimer('b', { class: 'timer-p', timerId: 'b', dur: 123, ts: 1 }, { editor: ed }, {}, 2, TimerParser.parse(row, 'auto', 'b'));
    assert.ok(rows[2].includes(span('a')));
    assert.equal(TimerParser.parse(rows[2], 'auto', 'b').dur, 123);
    assert.equal(tableCells(rows[2]).length, 2);
});
test('reading mode atomically updates both timers by ID, including moved rows', async () => {
    let content = `intro\n| ${span('a')} | ${span('b')} |`;
    let queue = Promise.resolve();
    const vault = { process(file, fn) { queue = queue.then(() => { content = fn(content); }); return queue; } };
    const fm = new TimerFileManager({ vault }, {});
    const view = { getMode: () => 'preview' };
    await Promise.all(['a', 'b'].map((id, i) => fm.writeTimer(id, { class: 'timer-r', timerId: id, dur: 100 + i, ts: 1 }, view, {}, 0, { timerId: id })));
    assert.equal(TimerParser.parse(content, 'auto', 'a').dur, 100);
    assert.equal(TimerParser.parse(content, 'auto', 'b').dur, 101);
    assert.equal(content.split('\n')[0], 'intro');
});

function liveEditor(rows, column) {
    // Reproduces Live Preview: nested cell is active, outer cursor is at column 0.
    const ed = editor(rows, 2, 0);
    ed.offsetToPos = offset => {
        const prefix = rows.join('\n').slice(0, offset).split('\n');
        return { line: prefix.length - 1, ch: prefix.at(-1).length };
    };
    const cell = { getAbsoluteOffsets: () => ({ textStart: rows[0].length + rows[1].length + 2 + tableCells(rows[2])[column].from }) };
    ed.editorComponent = { tableCell: { cell } };
    ed.inTableCell = true;
    ed.getTableSelection = () => [];
    return ed;
}
test('Live Preview empty cell uses cell source position, not stale outer cursor', async () => {
    const rows = ['| 1 | 2 |', '| --- | --- |', '|   |   |'];
    const ed = liveEditor(rows, 0);
    assert.deepEqual(ed.getCursor(), { line: 2, ch: 0 });
    const cursor = timerCursor(ed);
    assert.equal(cursor.line, 2);
    assert.ok(cursor.ch > 0);
    const fm = new TimerFileManager({}, { timerInsertLocation: 'head' });
    await fm.writeTimer('first', { class: 'timer-r', timerId: 'first', dur: 0, ts: 1 }, { editor: ed }, {}, cursor.line);
    assert.ok(rows[2].startsWith('|'));
    assert.equal(tableCells(rows[2]).length, 2);
    assert.equal(TimerParser.parseAtCursor(ed, 2, timerCursor(ed).ch).timerId, 'first');
    assert.equal(rows[0], '| 1 | 2 |');
    assert.equal(rows[1], '| --- | --- |');
});
test('Live Preview second-cell insertion and pause preserve first-cell timer', async () => {
    const first = span('first');
    const rows = ['| 1 | 2 |', '| --- | --- |', '| ' + first + ' |   |'];
    const ed = liveEditor(rows, 1);
    const fm = new TimerFileManager({}, { timerInsertLocation: 'tail' });
    const cursor = timerCursor(ed);
    assert.equal(TimerParser.parseAtCursor(ed, cursor.line, cursor.ch), null);
    await fm.writeTimer('second', { class: 'timer-r', timerId: 'second', dur: 0, ts: 1 }, { editor: ed }, {}, cursor.line);
    const selected = timerCursor(ed);
    const parsed = TimerParser.parseAtCursor(ed, selected.line, selected.ch);
    assert.equal(parsed.timerId, 'second');
    await fm.writeTimer('second', { ...parsed, class: 'timer-p', dur: 12 }, { editor: ed }, {}, selected.line, parsed);
    assert.ok(rows[2].includes(first));
    assert.equal(TimerParser.parse(rows[2], 'auto', 'second').class, 'timer-p');
    assert.equal(tableCells(rows[2]).length, 2);
});
test('Live Preview selection without a nested editor resolves a single selected cell', () => {
    const rows = ['| 1 | 2 |', '| --- | --- |', '|   |   |'];
    const ed = liveEditor(rows, 1);
    const cell = ed.editorComponent.tableCell.cell;
    ed.editorComponent = {};
    ed.getTableSelection = () => [cell];
    assert.equal(timerCursor(ed).ch, tableCells(rows[2])[1].from);
    ed.getTableSelection = () => [cell, cell];
    assert.equal(timerCursor(ed), null);
});
test('unsupported table internals fail closed instead of corrupting a stale outer line', () => {
    const ed = editor(['| 1 | 2 |', '| --- | --- |', '|   |   |'], 2, 0);
    ed.inTableCell = true;
    assert.equal(timerCursor(ed), null);
    ed.editorComponent = { tableCell: { cell: {} } };
    assert.equal(timerCursor(ed), null);
});
