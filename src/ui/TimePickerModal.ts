import { App, Modal } from 'obsidian';

// —— Time Picker Modal - iPhone-style scroll wheel time picker —— //
export class TimePickerModal extends Modal {
    currentDur: number;
    lang: any;
    onSubmit: (newDur: number) => void;
    ITEM_HEIGHT = 36;
    VISIBLE_COUNT = 5;
    hourWheel!: { getValue: () => number };
    minuteWheel!: { getValue: () => number };
    secondWheel!: { getValue: () => number };

    constructor(app: App, currentDur: number, lang: any, onSubmit: (newDur: number) => void) {
        super(app);
        this.currentDur = currentDur || 0;
        this.lang = lang;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl, modalEl } = this;
        modalEl.addClass('timer-picker-modal');
        contentEl.empty();

        const curH = Math.min(999, Math.floor(this.currentDur / 3600));
        const curM = Math.floor((this.currentDur % 3600) / 60);
        const curS = this.currentDur % 60;

        const header = contentEl.createEl('div', { cls: 'timer-picker-header' });
        header.createEl('span', { text: this.lang.title, cls: 'timer-picker-title' });

        const wheelContainer = contentEl.createEl('div', { cls: 'timer-picker-wheels' });

        const highlightEl = wheelContainer.createEl('div', { cls: 'timer-picker-highlight' });
        const centerOffset = Math.floor(this.VISIBLE_COUNT / 2) * this.ITEM_HEIGHT;
        highlightEl.style.top = `${centerOffset - 1}px`;
        highlightEl.style.height = `${this.ITEM_HEIGHT + 2}px`;

        this.hourWheel = this._createWheel(wheelContainer, 1000, curH, null, false);

        const colon1 = wheelContainer.createEl('div', { cls: 'timer-picker-colon' });
        colon1.textContent = ':';
        colon1.style.top = `${centerOffset}px`;

        this.minuteWheel = this._createWheel(wheelContainer, 60, curM, null, true);

        const colon2 = wheelContainer.createEl('div', { cls: 'timer-picker-colon' });
        colon2.textContent = ':';
        colon2.style.top = `${centerOffset}px`;

        this.secondWheel = this._createWheel(wheelContainer, 60, curS, null, true);

        const footer = contentEl.createEl('div', { cls: 'timer-picker-footer' });
        const saveBtn = footer.createEl('button', { text: '✓', cls: 'timer-picker-save-btn' });

        saveBtn.addEventListener('click', () => {
            const h = this.hourWheel.getValue();
            const m = this.minuteWheel.getValue();
            const s = this.secondWheel.getValue();
            this.onSubmit(h * 3600 + m * 60 + s);
            this.close();
        });
    }

    _createWheel(parent: HTMLElement, count: number, initialValue: number, _label: string | null, circular: boolean): { getValue: () => number } {
        const ITEM_HEIGHT = this.ITEM_HEIGHT;
        const VISIBLE = this.VISIBLE_COUNT;
        const PADDING = Math.floor(VISIBLE / 2);
        const isCircular = !!circular;

        const col = parent.createEl('div', { cls: 'timer-picker-column' });
        const viewport = col.createEl('div', { cls: 'timer-picker-viewport' });
        viewport.style.height = `${ITEM_HEIGHT * VISIBLE}px`;

        const list = viewport.createEl('div', { cls: 'timer-picker-list' });

        const REPEAT_COUNT = isCircular ? 21 : 1;
        const totalItems = count * REPEAT_COUNT;
        const midRepeatStart = isCircular ? Math.floor(REPEAT_COUNT / 2) * count : 0;

        const items: HTMLElement[] = [];
        if (isCircular) {
            for (let i = -PADDING; i < totalItems + PADDING; i++) {
                const item = list.createEl('div', { cls: 'timer-picker-item' });
                item.style.height = `${ITEM_HEIGHT}px`;
                item.style.lineHeight = `${ITEM_HEIGHT}px`;
                if (i >= 0 && i < totalItems) {
                    const val = i % count;
                    item.textContent = String(val).padStart(2, '0');
                    item.dataset.value = String(val);
                } else {
                    item.textContent = '';
                    item.dataset.value = '';
                }
                items.push(item);
            }
        } else {
            for (let i = -PADDING; i < count + PADDING; i++) {
                const item = list.createEl('div', { cls: 'timer-picker-item' });
                item.style.height = `${ITEM_HEIGHT}px`;
                item.style.lineHeight = `${ITEM_HEIGHT}px`;
                if (i >= 0 && i < count) {
                    item.textContent = String(i).padStart(2, '0');
                    item.dataset.value = String(i);
                } else {
                    item.textContent = '';
                    item.dataset.value = '';
                }
                items.push(item);
            }
        }

        let currentIndex = isCircular ? (midRepeatStart + initialValue) : initialValue;
        let offset = -currentIndex * ITEM_HEIGHT;
        let startY = 0;
        let startOffset = 0;
        let isDragging = false;
        let lastY = 0;
        let velocity = 0;
        let lastTime = 0;
        let animFrame: number | null = null;

        const maxIndex = isCircular ? (totalItems - 1) : (count - 1);

        const setTransform = (y: number) => {
            list.style.transform = `translateY(${y}px)`;
        };

        const updateStyles = () => {
            items.forEach((el, i) => {
                const realIndex = i - PADDING;
                const distance = Math.abs(realIndex - currentIndex);
                if (distance === 0) {
                    el.style.opacity = '1';
                    el.style.fontSize = '20px';
                    el.style.fontWeight = '700';
                    el.style.color = 'var(--text-normal)';
                } else if (distance === 1) {
                    el.style.opacity = '0.6';
                    el.style.fontSize = '16px';
                    el.style.fontWeight = '400';
                    el.style.color = 'var(--text-muted)';
                } else if (distance === 2) {
                    el.style.opacity = '0.3';
                    el.style.fontSize = '14px';
                    el.style.fontWeight = '400';
                    el.style.color = 'var(--text-faint)';
                } else {
                    el.style.opacity = '0';
                    el.style.fontSize = '12px';
                    el.style.fontWeight = '400';
                    el.style.color = 'var(--text-faint)';
                }
            });
        };

        const snapTo = (index: number, animate: boolean) => {
            index = Math.max(0, Math.min(maxIndex, index));
            currentIndex = index;
            offset = -index * ITEM_HEIGHT;
            if (animate) {
                list.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
                setTransform(offset);
                setTimeout(() => {
                    list.style.transition = '';
                    if (isCircular) {
                        const val = currentIndex % count;
                        const recentered = midRepeatStart + val;
                        if (Math.abs(currentIndex - recentered) > count) {
                            currentIndex = recentered;
                            offset = -currentIndex * ITEM_HEIGHT;
                            setTransform(offset);
                        }
                    }
                }, 300);
            } else {
                setTransform(offset);
            }
            updateStyles();
        };

        const onStart = (y: number) => {
            if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
            list.style.transition = '';
            isDragging = true;
            startY = y;
            startOffset = offset;
            lastY = y;
            velocity = 0;
            lastTime = Date.now();
        };

        const onMove = (y: number) => {
            if (!isDragging) return;
            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) velocity = (y - lastY) / dt;
            lastY = y;
            lastTime = now;
            offset = startOffset + (y - startY);
            setTransform(offset);
            const approxIndex = Math.round(-offset / ITEM_HEIGHT);
            const clampedIndex = Math.max(0, Math.min(maxIndex, approxIndex));
            if (clampedIndex !== currentIndex) {
                currentIndex = clampedIndex;
                updateStyles();
            }
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const momentumDistance = velocity * 150;
            const targetOffset = offset + momentumDistance;
            let targetIndex = Math.round(-targetOffset / ITEM_HEIGHT);
            targetIndex = Math.max(0, Math.min(maxIndex, targetIndex));
            snapTo(targetIndex, true);
        };

        viewport.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onStart(e.clientY);
            const onMouseMove = (ev: MouseEvent) => onMove(ev.clientY);
            const onMouseUp = () => {
                onEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        viewport.addEventListener('touchstart', (e) => {
            onStart(e.touches[0].clientY);
        }, { passive: true });
        viewport.addEventListener('touchmove', (e) => {
            e.preventDefault();
            onMove(e.touches[0].clientY);
        }, { passive: false });
        viewport.addEventListener('touchend', () => onEnd());

        viewport.addEventListener('click', (e) => {
            const rect = viewport.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const clickedSlot = Math.floor(clickY / ITEM_HEIGHT);
            const targetIndex = currentIndex + (clickedSlot - PADDING);
            if (targetIndex >= 0 && targetIndex <= maxIndex) {
                snapTo(targetIndex, true);
            }
        });

        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            const targetIndex = Math.max(0, Math.min(maxIndex, currentIndex + direction));
            snapTo(targetIndex, true);
        }, { passive: false });

        snapTo(initialValue, false);

        return {
            getValue: () => isCircular ? (currentIndex % count) : currentIndex
        };
    }

    onClose() {
        this.contentEl.empty();
    }
}
