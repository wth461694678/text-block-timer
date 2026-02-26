import { EditorView, Decoration, DecorationSet, WidgetType } from '@codemirror/view';
import { RangeSetBuilder, StateField, EditorSelection } from '@codemirror/state';
import { keymap } from '@codemirror/view';

// Shared regex — matches timer spans with optional data-project attribute
const TIMER_SPAN_REGEX = /<span\s+class="timer-[rp]"\s+id="[^"]*"\s+data-dur="[^"]*"\s+data-ts="[^"]*"(?:\s+data-project="[^"]*")?>【[^<]*】<\/span>/g;

function makeTimerRegex() {
    return new RegExp(TIMER_SPAN_REGEX.source, 'g');
}

// —— Timer Widget: Display folded timer span —— //
export class TimerWidget extends WidgetType {
    htmlText: string;
    startPos: number;
    endPos: number;

    constructor(htmlText: string, startPos: number, endPos: number) {
        super();
        this.htmlText = htmlText;
        this.startPos = startPos;
        this.endPos = endPos;
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        const isRunning = this.htmlText.includes('class="timer-r"');
        const stateClass = isRunning ? 'timer-widget-running' : 'timer-widget-paused';
        span.className = `timer-widget-display ${stateClass}`;

        const match = this.htmlText.match(/>([^<]*)<\/span>/);
        span.textContent = match ? match[1] : '[Timer]';

        return span;
    }

    ignoreEvent(_event: Event): boolean {
        return false;
    }

    // Required for CodeMirror to avoid unnecessary re-renders
    eq(other: TimerWidget): boolean {
        return this.htmlText === other.htmlText;
    }
}

// —— Timer Span Folding Field —— //
// Always folds every timer span — cursor position is handled separately by timerCursorEscape
export const timerFoldingField = StateField.define<DecorationSet>({
    create(state) {
        return buildTimerFolding(state);
    },
    update(decorations, tr) {
        if (tr.docChanged) {
            return buildTimerFolding(tr.state);
        }
        return decorations.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
});

function buildTimerFolding(state: any): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const timerRegex = makeTimerRegex();

    for (let pos = 0; pos < state.doc.length;) {
        const line = state.doc.lineAt(pos);
        const lineText = line.text;

        let match: RegExpExecArray | null;
        timerRegex.lastIndex = 0;
        while ((match = timerRegex.exec(lineText)) !== null) {
            const start = line.from + match.index;
            const end = start + match[0].length;

            builder.add(start, end, Decoration.replace({
                widget: new TimerWidget(match[0], start, end),
                inclusive: false,
                block: false,
            }));
        }

        pos = line.to + 1;
    }

    return builder.finish();
}

// —— Cursor escape: snap cursor out of timer spans on any selection change —— //
// This handles mouse clicks, touch, and any other way cursor can land inside a span
export const timerCursorEscape = EditorView.updateListener.of((update) => {
    if (!update.selectionSet) return;

    const state = update.state;
    const sel = state.selection.main;

    // Handle both collapsed cursor and selection range
    const positions = sel.empty ? [sel.head] : [sel.anchor, sel.head];

    for (const pos of positions) {
        const line = state.doc.lineAt(pos);
        const timerRegex = makeTimerRegex();
        timerRegex.lastIndex = 0;

        let match: RegExpExecArray | null;
        while ((match = timerRegex.exec(line.text)) !== null) {
            const spanStart = line.from + match.index;
            const spanEnd = spanStart + match[0].length;

            // Cursor is strictly inside (not at boundaries)
            if (pos > spanStart && pos < spanEnd) {
                // Snap to nearest boundary based on previous position
                const prevPos = update.startState.selection.main.head;
                const target = prevPos <= spanStart ? spanStart : spanEnd;

                // Use requestAnimationFrame to avoid dispatching inside an update
                requestAnimationFrame(() => {
                    update.view.dispatch({
                        selection: EditorSelection.cursor(target),
                        scrollIntoView: false,
                    });
                });
                return;
            }
        }
    }
});

// —— Timer Widget Keymap Handler —— //
export const timerWidgetKeymap = keymap.of([
    {
        key: 'Backspace',
        run(view: EditorView) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;
            const line = state.doc.lineAt(pos);
            const timerRegex = makeTimerRegex();

            let match: RegExpExecArray | null;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;
                if (pos === spanEnd) {
                    dispatch(state.update({ changes: { from: spanStart, to: spanEnd, insert: '' } }));
                    return true;
                }
            }
            return false;
        }
    },
    {
        key: 'Delete',
        run(view: EditorView) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;
            const line = state.doc.lineAt(pos);
            const timerRegex = makeTimerRegex();

            let match: RegExpExecArray | null;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;
                if (pos === spanStart) {
                    dispatch(state.update({ changes: { from: spanStart, to: spanEnd, insert: '' } }));
                    return true;
                }
            }
            return false;
        }
    },
    {
        key: 'ArrowLeft',
        run(view: EditorView) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;
            const line = state.doc.lineAt(pos);
            const timerRegex = makeTimerRegex();

            let match: RegExpExecArray | null;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;
                // Cursor is at the right boundary — jump to left boundary
                if (pos === spanEnd) {
                    dispatch(state.update({ selection: { anchor: spanStart } }));
                    return true;
                }
            }
            return false;
        }
    },
    {
        key: 'ArrowRight',
        run(view: EditorView) {
            const { state, dispatch } = view;
            const pos = state.selection.main.head;
            const line = state.doc.lineAt(pos);
            const timerRegex = makeTimerRegex();

            let match: RegExpExecArray | null;
            timerRegex.lastIndex = 0;
            while ((match = timerRegex.exec(line.text)) !== null) {
                const spanStart = line.from + match.index;
                const spanEnd = spanStart + match[0].length;
                // Cursor is at the left boundary — jump to right boundary
                if (pos === spanStart) {
                    dispatch(state.update({ selection: { anchor: spanEnd } }));
                    return true;
                }
            }
            return false;
        }
    }
]);
