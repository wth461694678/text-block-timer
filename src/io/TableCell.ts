import { Editor } from 'obsidian';

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
