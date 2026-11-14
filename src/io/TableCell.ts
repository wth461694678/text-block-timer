import type { Editor, EditorPosition } from 'obsidian';

export interface CellRange { from: number; to: number }

// Markdown table pipes are separators unless escaped, including inside code spans.
export function tableCells(text: string): CellRange[] {
    const pipes: number[] = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] !== '|') continue;
        let slashes = 0;
        for (let j = i - 1; j >= 0 && text[j] === '\\'; j--) slashes++;
        if (slashes % 2 === 0) pipes.push(i);
    }
    if (!pipes.length) return [];
    const bounds = [-1, ...pipes, text.length];
    const cells = bounds.slice(0, -1).map((left, i) => ({ from: left + 1, to: bounds[i + 1] }));
    if (!text.slice(0, pipes[0]).trim()) cells.shift();
    if (!text.slice(pipes[pipes.length - 1] + 1).trim()) cells.pop();
    return cells;
}

export function isTableSeparator(text: string): boolean {
    const cells = tableCells(text);
    return cells.length > 0 && cells.every(c => /^:?-+:?$/.test(text.slice(c.from, c.to).trim()));
}

/** null means ordinary text; a table row with no cell at the cursor is blocked. */
export function tableTarget(editor: Pick<Editor, 'getLine' | 'lineCount'>, line: number, ch: number): { cell: CellRange | null } | null {
    const text = editor.getLine(line);
    const cells = tableCells(text);
    if (!cells.length) return null;
    let separator = -1;
    if (line + 1 < editor.lineCount() && isTableSeparator(editor.getLine(line + 1))) separator = line + 1;
    else {
        for (let i = line; i >= 1; i--) {
            const row = editor.getLine(i);
            if (isTableSeparator(row)) { separator = i; break; }
            if (!tableCells(row).length) break;
        }
    }
    if (separator < 1 || tableCells(editor.getLine(separator - 1)).length !== tableCells(editor.getLine(separator)).length) return null;
    if (line === separator) return { cell: null };
    return { cell: cells.find(c => ch >= c.from && ch <= c.to) ?? null };
}

/**
 * Live Preview edits a cell in a nested CodeMirror editor. The public outer
 * editor's cursor can still point outside that cell (especially an empty cell).
 * Keep this guarded adapter separate from Markdown parsing: these table APIs
 * are internal to Obsidian and must not silently fall back to a stale cursor.
 */
export function timerCursor(editor: Editor): EditorPosition | null {
    const internal = editor as Editor & {
        inTableCell?: boolean;
        editorComponent?: { tableCell?: { cell?: LiveTableCell } };
        getTableSelection?: () => LiveTableCell[];
    };
    const active = internal.editorComponent?.tableCell;
    const selected = internal.getTableSelection?.() ?? [];
    // A command operates on one cell, never an ambiguous rectangular selection.
    if (selected.length > 1) return null;
    const cell = selected[0] ?? active?.cell;
    if (cell) {
        const offsets = cell.getAbsoluteOffsets?.();
        if (!offsets || !Number.isInteger(offsets.textStart) || offsets.textStart < 0) return null;
        const cursor = editor.offsetToPos(offsets.textStart);
        // Validate the mapped position against the current Markdown document.
        return tableTarget(editor, cursor.line, cursor.ch)?.cell ? cursor : null;
    }
    if (active || internal.inTableCell) return null;
    return editor.getCursor();
}

interface LiveTableCell {
    getAbsoluteOffsets?: () => { textStart: number };
}
