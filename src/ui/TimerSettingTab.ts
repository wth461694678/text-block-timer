import { App, Modal, PluginSettingTab, Setting } from 'obsidian';
import { getTranslation } from '../i18n/translations';
import { TimerFileGroup } from '../core/TimerFileGroupFilter';

export interface TimerSettings {
    autoStopTimers: 'never' | 'quit' | 'close';
    timerInsertLocation: 'head' | 'tail';
    enableCheckboxToTimer: boolean;
    runningCheckboxState: string;
    pausedCheckboxState: string;
    checkboxToTimerPathRestriction: 'disable' | 'whitelist' | 'blacklist';
    pathRestrictionPaths: string[];
    checkboxPathGroups: TimerFileGroup[];
    runningIcon: string;
    pausedIcon: string;
    timeDisplayFormat: string;
    timerDisplayStyle: string;
    runningTextColor: string;
    runningBgColor: string;
    pausedTextColor: string;
    pausedBgColor: string;
    // Status bar settings
    showStatusBar: boolean;
    statusBarMode: 'max' | 'total';
    // Sidebar settings
    sidebarTabPosition: number;
    sidebarDefaultScope: 'active-file' | 'open-tabs' | 'all';
    sidebarDefaultFilter: 'all' | 'running' | 'paused';
    sidebarDefaultSort: 'status' | 'dur-desc' | 'dur-asc' | 'filename-desc' | 'filename-asc' | 'updated';
    sidebarDefaultGroup: string; // group id, empty string = no filter
    autoRefreshSidebar: boolean;
    timerFileGroups: TimerFileGroup[];
}

export class TimerSettingTab extends PluginSettingTab {
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    processPath(filePath: string): string {
        // If already ends with /, it's explicitly a folder — keep as-is
        if (filePath.endsWith('/')) return filePath;
        const lastSegment = filePath.split('/').pop() ?? '';
        // Only treat as a file if it has an explicit extension (contains a dot)
        // Otherwise treat as a folder segment and append /
        if (lastSegment.includes('.')) return filePath;
        return filePath + '/';
    }

    rgbaToHex(rgba: string): string {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return rgba;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        const lang = getTranslation('settings');

        containerEl.createEl('h1', { text: lang.name });

        const introBlock = containerEl.createEl('div', { cls: 'timer-plugin-intro' });
        introBlock.style.cssText = 'background: var(--background-secondary); border-radius: 8px; padding: 12px 16px; margin: 8px 0 16px 0; font-size: 13px; line-height: 1.8; color: var(--text-muted);';

        const tutorialLine = introBlock.createEl('p');
        tutorialLine.style.cssText = 'margin: 0 0 4px 0;';
        tutorialLine.appendText(lang.tutorial);
        const tutorialLink = tutorialLine.createEl('a');
        tutorialLink.href = 'https://github.com/wth461694678/text-block-timer';
        tutorialLink.setText('GitHub');
        tutorialLink.target = '_blank';

        const voteLine = introBlock.createEl('p');
        voteLine.style.cssText = 'margin: 0 0 4px 0;';
        voteLine.setText(lang.askforvote);

        const issueLine = introBlock.createEl('p');
        issueLine.style.cssText = 'margin: 0;';
        issueLine.setText(lang.issue);

        containerEl.createEl('h3', { text: lang.sections.basic.name });

        new Setting(containerEl)
            .setName(lang.autostop.name)
            .setDesc(lang.autostop.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('never', lang.autostop.choice.never)
                    .addOption('quit', lang.autostop.choice.quit)
                    .addOption('close', lang.autostop.choice.close)
                    .setValue(this.plugin.settings.autoStopTimers)
                    .onChange(async (value) => {
                        this.plugin.settings.autoStopTimers = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName(lang.insertlocation.name)
            .setDesc(lang.insertlocation.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('head', lang.insertlocation.choice.head)
                    .addOption('tail', lang.insertlocation.choice.tail)
                    .setValue(this.plugin.settings.timerInsertLocation)
                    .onChange(async (value) => {
                        this.plugin.settings.timerInsertLocation = value;
                        await this.plugin.saveSettings();
                    });
            });

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.bycommand.name });
        new Setting(containerEl).setName(lang.sections.bycommand.desc);

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.byeditormenu.name });
        new Setting(containerEl).setName(lang.sections.byeditormenu.desc);

        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.bycheckbox.name });
        new Setting(containerEl).setName(lang.sections.bycheckbox.desc);

        const checkboxToTimerSetting = new Setting(containerEl);
        checkboxToTimerSetting
            .setName(lang.enableCheckboxToTimer.name)
            .setDesc(lang.enableCheckboxToTimer.desc)
            .addToggle(toggle => {
                toggle
                    .setValue(this.plugin.settings.enableCheckboxToTimer)
                    .onChange(async (value) => {
                        this.plugin.settings.enableCheckboxToTimer = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });

        if (this.plugin.settings.enableCheckboxToTimer) {
            new Setting(containerEl)
                .setName(lang.enableCheckboxToTimer.runningSymbolStr.name)
                .setDesc(lang.enableCheckboxToTimer.runningSymbolStr.desc)
                .addText(text => {
                    text
                        .setPlaceholder('combine symbols directly, eg /')
                        .setValue(this.plugin.settings.runningCheckboxState)
                        .onChange(async (value) => {
                            const cleanedValue = value.replace(/\[|\]/g, '');
                            this.plugin.settings.runningCheckboxState = cleanedValue;
                            await this.plugin.saveSettings();
                        });
                });

            new Setting(containerEl)
                .setName(lang.enableCheckboxToTimer.pausedSymbolStr.name)
                .setDesc(lang.enableCheckboxToTimer.pausedSymbolStr.desc)
                .addText(text => {
                    text
                        .setPlaceholder('combine symbols directly, eg -xX')
                        .setValue(this.plugin.settings.pausedCheckboxState)
                        .onChange(async (value) => {
                            const cleanedValue = value.replace(/\[|\]/g, '');
                            this.plugin.settings.pausedCheckboxState = cleanedValue;
                            await this.plugin.saveSettings();
                        });
                });

        const cbGroupCount = () => (this.plugin.settings.checkboxPathGroups ?? []).length;
        const cbManageLang = lang.enableCheckboxToTimer.pathControl.manage;
        const cbDesc = () => cbManageLang.descTemplate.replace('{count}', String(cbGroupCount()));
        const cbPathSetting = new Setting(containerEl)
            .setName(cbManageLang.name)
            .setDesc(cbDesc())
            .addButton(btn => btn
                .setButtonText(cbManageLang.btn)
                .onClick(() => {
                    new CheckboxPathGroupsModal(this.app, this.plugin, () => {
                        cbPathSetting.setDesc(cbDesc());
                    }).open();
                })
            );
        }

        // ===== Appearance Settings Section =====
        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: lang.sections.appearance.name });

        const timeFormatLang = lang.timeDisplayFormat;
        new Setting(containerEl)
            .setName(timeFormatLang.name)
            .setDesc(timeFormatLang.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('full', timeFormatLang.choice.full)
                    .addOption('smart', timeFormatLang.choice.smart)
                    .setValue(this.plugin.settings.timeDisplayFormat || 'full')
                    .onChange(async (value) => {
                        this.plugin.settings.timeDisplayFormat = value;
                        await this.plugin.saveSettings();
                    });
            });

        const displayStyleLang = lang.timerDisplayStyle;
        new Setting(containerEl)
            .setName(displayStyleLang.name)
            .setDesc(displayStyleLang.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('badge', displayStyleLang.choice.badge)
                    .addOption('plain', displayStyleLang.choice.plain)
                    .setValue(this.plugin.settings.timerDisplayStyle || 'badge')
                    .onChange(async (value) => {
                        this.plugin.settings.timerDisplayStyle = value;
                        await this.plugin.saveSettings();
                        this.plugin.applyDisplayStyle();
                        this.display();
                    });
            });

        const colorLang = lang.timerColors;
        const isBadge = (this.plugin.settings.timerDisplayStyle || 'badge') === 'badge';

        const addColorSetting = (name: string, desc: string, settingKey: string, defaultColor: string) => {
            const setting = new Setting(containerEl).setName(name).setDesc(desc);
            setting.controlEl.createEl('input', {
                type: 'color',
                value: this.plugin.settings[settingKey] || defaultColor,
                cls: 'timer-color-input-native'
            }, (input) => {
                input.style.width = '40px';
                input.style.height = '30px';
                input.style.border = 'none';
                input.style.padding = '0';
                input.style.cursor = 'pointer';
                input.style.backgroundColor = 'transparent';
                input.addEventListener('input', async (e) => {
                    this.plugin.settings[settingKey] = (e.target as HTMLInputElement).value;
                    if (settingKey.endsWith('BgColor')) {
                        const hex = (e.target as HTMLInputElement).value;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        this.plugin.settings[settingKey] = `rgba(${r}, ${g}, ${b}, 0.15)`;
                    }
                    await this.plugin.saveSettings();
                    this.plugin.applyTimerColors();
                });
            });
            return setting;
        };

        // Running timer icon
        new Setting(containerEl)
            .setName(lang.timerIcon.runningIcon.name)
            .setDesc(lang.timerIcon.runningIcon.desc)
            .addText(text => {
                text
                    .setValue(this.plugin.settings.runningIcon)
                    .onChange(async (value) => {
                        this.plugin.settings.runningIcon = value || '⏳';
                        await this.plugin.saveSettings();
                    });
            });

        addColorSetting(colorLang.runningText.name, colorLang.runningText.desc, 'runningTextColor', '#10b981');

        if (isBadge) {
            const runBgSetting = new Setting(containerEl)
                .setName(colorLang.runningBg.name)
                .setDesc(colorLang.runningBg.desc);
            runBgSetting.controlEl.createEl('input', {
                type: 'color',
                value: this.rgbaToHex(this.plugin.settings.runningBgColor || 'rgba(16, 185, 129, 0.15)'),
                cls: 'timer-color-input-native'
            }, (input) => {
                input.style.width = '40px';
                input.style.height = '30px';
                input.style.border = 'none';
                input.style.padding = '0';
                input.style.cursor = 'pointer';
                input.style.backgroundColor = 'transparent';
                input.addEventListener('input', async (e) => {
                    const hex = (e.target as HTMLInputElement).value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    this.plugin.settings.runningBgColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
                    await this.plugin.saveSettings();
                    this.plugin.applyTimerColors();
                });
            });
        }

        // Paused timer icon
        new Setting(containerEl)
            .setName(lang.timerIcon.pausedIcon.name)
            .setDesc(lang.timerIcon.pausedIcon.desc)
            .addText(text => {
                text
                    .setValue(this.plugin.settings.pausedIcon)
                    .onChange(async (value) => {
                        this.plugin.settings.pausedIcon = value || '💐';
                        await this.plugin.saveSettings();
                    });
            });

        addColorSetting(colorLang.pausedText.name, colorLang.pausedText.desc, 'pausedTextColor', '#6b7280');

        if (isBadge) {
            const pausedBgSetting = new Setting(containerEl)
                .setName(colorLang.pausedBg.name)
                .setDesc(colorLang.pausedBg.desc);
            pausedBgSetting.controlEl.createEl('input', {
                type: 'color',
                value: this.rgbaToHex(this.plugin.settings.pausedBgColor || 'rgba(107, 114, 128, 0.12)'),
                cls: 'timer-color-input-native'
            }, (input) => {
                input.style.width = '40px';
                input.style.height = '30px';
                input.style.border = 'none';
                input.style.padding = '0';
                input.style.cursor = 'pointer';
                input.style.backgroundColor = 'transparent';
                input.addEventListener('input', async (e) => {
                    const hex = (e.target as HTMLInputElement).value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    this.plugin.settings.pausedBgColor = `rgba(${r}, ${g}, ${b}, 0.12)`;
                    await this.plugin.saveSettings();
                    this.plugin.applyTimerColors();
                });
            });
        }

        // ===== Status Bar Settings Section =====
        const sbLang = lang.statusBar;
        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: sbLang.sectionTitle });

        new Setting(containerEl)
            .setName(sbLang.show.name)
            .setDesc(sbLang.show.desc)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showStatusBar ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.showStatusBar = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStatusBar?.();
                    this.display();
                })
            );

        if (this.plugin.settings.showStatusBar ?? true) {
            new Setting(containerEl)
                .setName(sbLang.mode.name)
                .setDesc(sbLang.mode.desc)
                .addDropdown(dd => dd
                    .addOption('max', sbLang.mode.choice.max)
                    .addOption('total', sbLang.mode.choice.total)
                    .setValue(this.plugin.settings.statusBarMode ?? 'max')
                    .onChange(async (value) => {
                        this.plugin.settings.statusBarMode = value as 'max' | 'total';
                        await this.plugin.saveSettings();
                        this.plugin.updateStatusBar?.();
                    })
                );
        }

        // ===== Sidebar Settings Section =====
        const sidebarLang = lang.sidebar;
        containerEl.createEl('div', { text: '' });
        containerEl.createEl('h3', { text: sidebarLang.sectionTitle });

        new Setting(containerEl)
            .setName(sidebarLang.tabPosition.name)
            .setDesc(sidebarLang.tabPosition.desc)
            .addText(text => text
                .setPlaceholder('4')
                .setValue(String(this.plugin.settings.sidebarTabPosition ?? 4))
                .onChange(async (value) => {
                    const num = parseInt(value);
                    this.plugin.settings.sidebarTabPosition = isNaN(num) || num < 1 ? 1 : num;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(sidebarLang.defaultView.name)
            .setDesc(sidebarLang.defaultView.desc)
            .addDropdown(dd => dd
                .addOption('open-tabs', sidebarLang.defaultView.choice.openTabs)
                .addOption('active-file', sidebarLang.defaultView.choice.activeFile)
                .addOption('all', sidebarLang.defaultView.choice.all)
                .setValue(this.plugin.settings.sidebarDefaultScope ?? 'open-tabs')
                .onChange(async (value) => {
                    this.plugin.settings.sidebarDefaultScope = value as any;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(sidebarLang.defaultFilter.name)
            .addDropdown(dd => dd
                .addOption('all', sidebarLang.defaultFilter.choice.all)
                .addOption('running', sidebarLang.defaultFilter.choice.running)
                .addOption('paused', sidebarLang.defaultFilter.choice.paused)
                .setValue(this.plugin.settings.sidebarDefaultFilter ?? 'all')
                .onChange(async (value) => {
                    this.plugin.settings.sidebarDefaultFilter = value as any;
                    await this.plugin.saveSettings();
                })
            );

        // Default group filter — dynamically populated from timerFileGroups
        const dgLang = sidebarLang.defaultGroupFilter;
        const groupFilterSetting = new Setting(containerEl)
            .setName(dgLang.name)
            .setDesc(dgLang.desc)
            .addDropdown(dd => {
                dd.addOption('', dgLang.none);
                const groups: TimerFileGroup[] = this.plugin.settings.timerFileGroups ?? [];
                for (const g of groups) {
                    dd.addOption(g.id, g.name);
                }
                dd.setValue(this.plugin.settings.sidebarDefaultGroup ?? '')
                    .onChange(async (value) => {
                        this.plugin.settings.sidebarDefaultGroup = value;
                        await this.plugin.saveSettings();
                    });
                return dd;
            });
        // If no groups defined, show a hint
        if ((this.plugin.settings.timerFileGroups ?? []).length === 0) {
            groupFilterSetting.setDesc(dgLang.desc + ' (No groups defined yet — add groups in File Groups first.)');
        }

        new Setting(containerEl)
            .setName(sidebarLang.defaultSort.name)
            .addDropdown(dd => dd
                .addOption('status', sidebarLang.defaultSort.choice.status)
                .addOption('dur-desc', sidebarLang.defaultSort.choice.durDesc)
                .addOption('dur-asc', sidebarLang.defaultSort.choice.durAsc)
                .addOption('filename-asc', sidebarLang.defaultSort.choice.filenameAsc)
                .addOption('filename-desc', sidebarLang.defaultSort.choice.filenameDesc)
                .addOption('updated', sidebarLang.defaultSort.choice.updated)
                .setValue(this.plugin.settings.sidebarDefaultSort ?? 'status')
                .onChange(async (value) => {
                    this.plugin.settings.sidebarDefaultSort = value as any;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(sidebarLang.autoRefresh.name)
            .setDesc(sidebarLang.autoRefresh.desc)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRefreshSidebar ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.autoRefreshSidebar = value;
                    await this.plugin.saveSettings();
                })
            );

        // ===== File Groups (under Timer Sidebar) — opens a modal =====
        const groupCount = () => (this.plugin.settings.timerFileGroups ?? []).length;
        const fgDesc = () => sidebarLang.fileGroups.descTemplate.replace('{count}', String(groupCount()));
        const fileGroupSetting = new Setting(containerEl)
            .setName(sidebarLang.fileGroups.name)
            .setDesc(fgDesc())
            .addButton(btn => btn
                .setButtonText(sidebarLang.fileGroups.btn)
                .onClick(() => {
                    new FileGroupsModal(this.app, this.plugin, () => {
                        // Refresh the whole settings page so the default group dropdown
                        // also reflects any added/removed/renamed groups
                        this.display();
                    }).open();
                })
            );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// File Groups Modal
// ─────────────────────────────────────────────────────────────────────────────

class FileGroupsModal extends Modal {
    plugin: any;
    onCloseCallback: () => void;
    /** id of the group currently being edited, null = none */
    editingId: string | null = null;

    constructor(app: App, plugin: any, onClose: () => void) {
        super(app);
        this.plugin = plugin;
        this.onCloseCallback = onClose;
    }

    onOpen() {
        this.titleEl.setText('File Groups');
        this.render();
    }

    onClose() {
        this.contentEl.empty();
        this.onCloseCallback();
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();

        // ── Usage guide ──────────────────────────────────────────────────────
        const guide = contentEl.createDiv();
        guide.style.cssText = 'background: var(--background-secondary); border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; line-height: 1.8; color: var(--text-muted);';
        guide.createEl('strong', { text: 'How it works' });
        const ul = guide.createEl('ul');
        ul.style.cssText = 'margin: 4px 0 0 16px; padding: 0;';
        [
            'Blacklist takes priority over whitelist.',
            'Empty whitelist = match all files (only blacklist applies).',
            'Folder paths must end with  /  (e.g. Projects/Work/).',
            'Toggle the  .*  switch on a pattern to enable regex mode; use .* for any-length wildcard.',
            'Regex off: plain text is matched as a path prefix.',
        ].forEach(t => ul.createEl('li', { text: t }));        // ── Group list ───────────────────────────────────────────────────────
        const groups: TimerFileGroup[] = this.plugin.settings.timerFileGroups ?? [];

        if (groups.length === 0) {
            contentEl.createEl('p', {
                text: 'No file groups yet. Add one below.',
                cls: 'setting-item-description'
            });
        }

        for (const group of groups) {
            this.renderGroupRow(contentEl, group);
        }

        // ── Add new group ────────────────────────────────────────────────────
        const addRow = contentEl.createDiv();
        addRow.style.cssText = 'display: flex; gap: 8px; margin-top: 14px; align-items: center;';

        const nameInput = addRow.createEl('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'New group name (optional)';
        nameInput.style.cssText = 'flex: 1; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 13px;';

        const addBtn = addRow.createEl('button', { text: '+ Add Group' });
        addBtn.style.cssText = 'padding: 4px 12px; white-space: nowrap;';
        addBtn.addEventListener('click', async () => {
            const existingCount = (this.plugin.settings.timerFileGroups ?? []).length;
            const name = nameInput.value.trim() || `FileGroup${existingCount + 1}`;
            const newGroup: TimerFileGroup = {
                id: crypto.randomUUID(),
                name,
                whitelist: [],
                blacklist: []
            };
            if (!this.plugin.settings.timerFileGroups) this.plugin.settings.timerFileGroups = [];
            this.plugin.settings.timerFileGroups.push(newGroup);
            await this.plugin.saveSettings();
            this.plugin.notifySidebarSettingsChanged?.();
            this.editingId = newGroup.id;   // auto-expand the new group
            this.render();
        });
    }

    private renderGroupRow(container: HTMLElement, group: TimerFileGroup) {
        const isEditing = this.editingId === group.id;

        const card = container.createDiv();
        card.style.cssText = 'border: 1px solid var(--background-modifier-border); border-radius: 6px; margin-bottom: 8px; overflow: hidden;';

        // ── Summary row ──────────────────────────────────────────────────────
        const summary = card.createDiv();
        summary.style.cssText = 'display: flex; align-items: center; padding: 8px 12px; gap: 8px; cursor: pointer; background: var(--background-primary-alt);';
        summary.addEventListener('click', () => {
            this.editingId = isEditing ? null : group.id;
            this.render();
        });

        // Chevron
        const chevron = summary.createEl('span');
        chevron.style.cssText = 'font-size: 11px; color: var(--text-muted); transition: transform 0.15s; flex-shrink: 0;';
        chevron.setText(isEditing ? '\u25bc' : '\u25b6');

        // Name
        const nameSpan = summary.createEl('span');
        nameSpan.style.cssText = 'font-weight: 600; font-size: 13px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
        nameSpan.setText(group.name);

        // Preview badges
        const preview = summary.createEl('span');
        preview.style.cssText = 'font-size: 11px; color: var(--text-muted); flex-shrink: 0;';
        const wl = group.whitelist.length;
        const bl = group.blacklist.length;
        preview.setText(wl === 0 && bl === 0
            ? 'no patterns'
            : [wl > 0 ? `\u2713 ${wl}` : '', bl > 0 ? `\u2717 ${bl}` : ''].filter(Boolean).join('  '));

        // Delete button (stop propagation so it doesn't toggle expand)
        const delBtn = summary.createEl('button', { text: '\u2715' });
        delBtn.title = 'Delete group';
        delBtn.style.cssText = 'font-size: 11px; padding: 1px 6px; flex-shrink: 0; color: var(--text-muted);';
        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            this.plugin.settings.timerFileGroups = (this.plugin.settings.timerFileGroups ?? [])
                .filter((g: TimerFileGroup) => g.id !== group.id);
            await this.plugin.saveSettings();
            this.plugin.notifySidebarSettingsChanged?.();
            if (this.editingId === group.id) this.editingId = null;
            this.render();
        });

        if (!isEditing) return;

        // ── Edit panel ───────────────────────────────────────────────────────
        const panel = card.createDiv();
        panel.style.cssText = 'padding: 12px 14px; border-top: 1px solid var(--background-modifier-border); background: var(--background-primary);';

        // Editable name
        const nameRow = panel.createDiv();
        nameRow.style.cssText = 'margin-bottom: 10px;';
        const nameLabel = nameRow.createEl('div', { text: 'Name' });
        nameLabel.style.cssText = 'font-weight: 700; font-size: 13px; margin-bottom: 4px;';
        const nameInput = nameRow.createEl('input');
        nameInput.type = 'text';
        nameInput.value = group.name;
        nameInput.style.cssText = 'width: 100%; box-sizing: border-box; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 13px;';
        nameInput.addEventListener('change', async () => {
            const v = nameInput.value.trim();
            if (!v) { nameInput.value = group.name; return; }
            group.name = v;
            await this.plugin.saveSettings();
            this.plugin.notifySidebarSettingsChanged?.();
            this.render();
        });

        // Whitelist
        this.renderPatternArea(panel, 'Whitelist', '\u2713 matched files are included', group.whitelist, async (v) => {
            group.whitelist = v;
            await this.plugin.saveSettings();
            this.plugin.notifySidebarSettingsChanged?.();
        });

        // Blacklist
        this.renderPatternArea(panel, 'Blacklist', '\u2717 matched files are excluded (takes priority)', group.blacklist, async (v) => {
            group.blacklist = v;
            await this.plugin.saveSettings();
            this.plugin.notifySidebarSettingsChanged?.();
        });
    }

    private renderPatternArea(
        container: HTMLElement,
        label: string,
        hint: string,
        value: string[],
        onChange: (v: string[]) => Promise<void>
    ) {
        const wrap = container.createDiv();
        wrap.style.cssText = 'margin-bottom: 10px;';

        // Header row: label + hint + add button
        const labelRow = wrap.createDiv();
        labelRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
        labelRow.createEl('span', { text: label }).style.cssText = 'font-weight: 600; font-size: 12px;';
        labelRow.createEl('span', { text: hint }).style.cssText = 'font-size: 11px; color: var(--text-muted); flex: 1;';
        const addBtn = labelRow.createEl('button', { text: '+ Add' });
        addBtn.style.cssText = 'font-size: 11px; padding: 1px 8px;';

        // Pattern list container
        const listEl = wrap.createDiv();
        listEl.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';

        /** Parse a stored pattern string into { text, isRegex } */
        const parsePattern = (p: string): { text: string; isRegex: boolean } => {
            const m = p.match(/^\/(.*)\/([gimsuy]*)$/);
            if (m) return { text: m[1], isRegex: true };
            return { text: p, isRegex: false };
        };

        /** Serialize back to stored string */
        const serializePattern = (text: string, isRegex: boolean): string => {
            if (!isRegex) return text;
            return `/${text}/`;
        };

        /** Collect current values from DOM and call onChange */
        const collectAndSave = async () => {
            const rows = listEl.querySelectorAll<HTMLElement>('[data-pattern-row]');
            const patterns: string[] = [];
            rows.forEach(row => {
                const input = row.querySelector<HTMLInputElement>('input[type="text"]');
                const toggle = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
                if (!input) return;
                const text = input.value.trim();
                if (!text) return;
                patterns.push(serializePattern(text, toggle?.checked ?? false));
            });
            await onChange(patterns);
        };

        /** Render a single pattern row */
        const renderRow = (pattern: string) => {
            const { text, isRegex } = parsePattern(pattern);

            const row = listEl.createDiv();
            row.setAttribute('data-pattern-row', '1');
            row.style.cssText = 'display: flex; align-items: center; gap: 6px;';

            // Text input
            const input = row.createEl('input');
            input.type = 'text';
            input.value = text;
            input.placeholder = isRegex ? '^Daily.*/\\d{4}' : 'Projects/Work/';
            input.style.cssText = 'flex: 1; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 12px; font-family: var(--font-monospace);';
            input.addEventListener('change', collectAndSave);

            // Regex toggle (after input)
            const toggleWrap = row.createEl('label');
            toggleWrap.title = 'Enable regex';
            toggleWrap.style.cssText = 'display: flex; align-items: center; gap: 3px; cursor: pointer; flex-shrink: 0; font-size: 11px; color: var(--text-muted); user-select: none;';
            const checkbox = toggleWrap.createEl('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isRegex;
            checkbox.style.cssText = 'cursor: pointer; margin: 0;';
            toggleWrap.createEl('span', { text: '.*' }).style.cssText = `font-family: var(--font-monospace); font-size: 12px; font-weight: 600; color: ${isRegex ? 'var(--interactive-accent)' : 'var(--text-muted)'};`;

            // Update label color when toggled
            checkbox.addEventListener('change', () => {
                const dot = toggleWrap.querySelector('span');
                if (dot) dot.style.color = checkbox.checked ? 'var(--interactive-accent)' : 'var(--text-muted)';
                collectAndSave();
            });

            // Delete button
            const delBtn = row.createEl('button', { text: '✕' });
            delBtn.style.cssText = 'font-size: 11px; padding: 1px 6px; flex-shrink: 0; color: var(--text-muted);';
            delBtn.addEventListener('click', () => {
                row.remove();
                collectAndSave();
            });
        };

        // Render existing patterns
        value.forEach(p => renderRow(p));

        // Add new empty row
        addBtn.addEventListener('click', () => {
            renderRow('');
            // Focus the new input
            const inputs = listEl.querySelectorAll<HTMLInputElement>('input[type="text"]');
            inputs[inputs.length - 1]?.focus();
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox Path Groups Modal
// ─────────────────────────────────────────────────────────────────────────────

class CheckboxPathGroupsModal extends Modal {
    plugin: any;
    onCloseCallback: () => void;
    editingId: string | null = null;

    constructor(app: App, plugin: any, onClose: () => void) {
        super(app);
        this.plugin = plugin;
        this.onCloseCallback = onClose;
    }

    onOpen() {
        this.titleEl.setText('Checkbox Path Control — File Groups');
        this.render();
    }

    onClose() {
        this.contentEl.empty();
        this.onCloseCallback();
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();

        // ── Usage guide ──────────────────────────────────────────────────────
        const guide = contentEl.createDiv();
        guide.style.cssText = 'background: var(--background-secondary); border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; line-height: 1.8; color: var(--text-muted);';
        guide.createEl('strong', { text: 'How it works' });
        const ul = guide.createEl('ul');
        ul.style.cssText = 'margin: 4px 0 0 16px; padding: 0;';
        [
            'The feature is enabled for a file if it matches ANY of the groups below.',
            'Leave all groups empty to apply the feature to all files.',
            'Within each group: blacklist takes priority over whitelist.',
            'Empty whitelist in a group = match all files (only blacklist applies).',
            'Folder paths must end with  /  (e.g. Projects/Work/).',
            'Toggle the  .*  switch on a pattern to enable regex mode; use .* for any-length wildcard.',
        ].forEach(t => ul.createEl('li', { text: t }));

        // ── Group list ───────────────────────────────────────────────────────
        const groups: TimerFileGroup[] = this.plugin.settings.checkboxPathGroups ?? [];

        if (groups.length === 0) {
            contentEl.createEl('p', {
                text: 'No groups yet — feature applies to all files. Add a group to restrict.',
                cls: 'setting-item-description'
            });
        }

        for (const group of groups) {
            this.renderGroupRow(contentEl, group);
        }

        // ── Add new group ────────────────────────────────────────────────────
        const addRow = contentEl.createDiv();
        addRow.style.cssText = 'display: flex; gap: 8px; margin-top: 14px; align-items: center;';

        const nameInput = addRow.createEl('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'New group name (optional)';
        nameInput.style.cssText = 'flex: 1; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 13px;';

        const addBtn = addRow.createEl('button', { text: '+ Add Group' });
        addBtn.style.cssText = 'padding: 4px 12px; white-space: nowrap;';
        addBtn.addEventListener('click', async () => {
            const existingCount = (this.plugin.settings.checkboxPathGroups ?? []).length;
            const name = nameInput.value.trim() || `PathGroup${existingCount + 1}`;
            const newGroup: TimerFileGroup = {
                id: crypto.randomUUID(),
                name,
                whitelist: [],
                blacklist: []
            };
            if (!this.plugin.settings.checkboxPathGroups) this.plugin.settings.checkboxPathGroups = [];
            this.plugin.settings.checkboxPathGroups.push(newGroup);
            await this.plugin.saveSettings();
            this.editingId = newGroup.id;
            this.render();
        });
    }

    private renderGroupRow(container: HTMLElement, group: TimerFileGroup) {
        const isEditing = this.editingId === group.id;

        const card = container.createDiv();
        card.style.cssText = 'border: 1px solid var(--background-modifier-border); border-radius: 6px; margin-bottom: 8px; overflow: hidden;';

        // ── Summary row ──────────────────────────────────────────────────────
        const summary = card.createDiv();
        summary.style.cssText = 'display: flex; align-items: center; padding: 8px 12px; gap: 8px; cursor: pointer; background: var(--background-primary-alt);';
        summary.addEventListener('click', () => {
            this.editingId = isEditing ? null : group.id;
            this.render();
        });

        const chevron = summary.createEl('span');
        chevron.style.cssText = 'font-size: 11px; color: var(--text-muted); flex-shrink: 0;';
        chevron.setText(isEditing ? '\u25bc' : '\u25b6');

        const nameSpan = summary.createEl('span');
        nameSpan.style.cssText = 'font-weight: 600; font-size: 13px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
        nameSpan.setText(group.name);

        const preview = summary.createEl('span');
        preview.style.cssText = 'font-size: 11px; color: var(--text-muted); flex-shrink: 0;';
        const wl = group.whitelist.length;
        const bl = group.blacklist.length;
        preview.setText(wl === 0 && bl === 0
            ? 'no patterns'
            : [wl > 0 ? `\u2713 ${wl}` : '', bl > 0 ? `\u2717 ${bl}` : ''].filter(Boolean).join('  '));

        const delBtn = summary.createEl('button', { text: '\u2715' });
        delBtn.title = 'Delete group';
        delBtn.style.cssText = 'font-size: 11px; padding: 1px 6px; flex-shrink: 0; color: var(--text-muted);';
        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            this.plugin.settings.checkboxPathGroups = (this.plugin.settings.checkboxPathGroups ?? [])
                .filter((g: TimerFileGroup) => g.id !== group.id);
            await this.plugin.saveSettings();
            if (this.editingId === group.id) this.editingId = null;
            this.render();
        });

        if (!isEditing) return;

        // ── Edit panel ───────────────────────────────────────────────────────
        const panel = card.createDiv();
        panel.style.cssText = 'padding: 12px 14px; border-top: 1px solid var(--background-modifier-border); background: var(--background-primary);';

        const nameRow = panel.createDiv();
        nameRow.style.cssText = 'margin-bottom: 10px;';
        const nameLabel2 = nameRow.createEl('div', { text: 'Name' });
        nameLabel2.style.cssText = 'font-weight: 700; font-size: 13px; margin-bottom: 4px;';
        const nameInput = nameRow.createEl('input');
        nameInput.type = 'text';
        nameInput.value = group.name;
        nameInput.style.cssText = 'width: 100%; box-sizing: border-box; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 13px;';
        nameInput.addEventListener('change', async () => {
            const v = nameInput.value.trim();
            if (!v) { nameInput.value = group.name; return; }
            group.name = v;
            await this.plugin.saveSettings();
            this.render();
        });

        this.renderPatternArea(panel, 'Whitelist', '\u2713 matched files are included', group.whitelist, async (v) => {
            group.whitelist = v;
            await this.plugin.saveSettings();
        });

        this.renderPatternArea(panel, 'Blacklist', '\u2717 matched files are excluded (takes priority)', group.blacklist, async (v) => {
            group.blacklist = v;
            await this.plugin.saveSettings();
        });
    }

    private renderPatternArea(
        container: HTMLElement,
        label: string,
        hint: string,
        value: string[],
        onChange: (v: string[]) => Promise<void>
    ) {
        const wrap = container.createDiv();
        wrap.style.cssText = 'margin-bottom: 10px;';

        const labelRow = wrap.createDiv();
        labelRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
        labelRow.createEl('span', { text: label }).style.cssText = 'font-weight: 600; font-size: 12px;';
        labelRow.createEl('span', { text: hint }).style.cssText = 'font-size: 11px; color: var(--text-muted); flex: 1;';
        const addBtn = labelRow.createEl('button', { text: '+ Add' });
        addBtn.style.cssText = 'font-size: 11px; padding: 1px 8px;';

        const listEl = wrap.createDiv();
        listEl.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';

        const parsePattern = (p: string): { text: string; isRegex: boolean } => {
            const m = p.match(/^\/(.*)\/([gimsuy]*)$/);
            if (m) return { text: m[1], isRegex: true };
            return { text: p, isRegex: false };
        };

        const serializePattern = (text: string, isRegex: boolean): string => {
            if (!isRegex) return text;
            return `/${text}/`;
        };

        const collectAndSave = async () => {
            const rows = listEl.querySelectorAll<HTMLElement>('[data-pattern-row]');
            const patterns: string[] = [];
            rows.forEach(row => {
                const input = row.querySelector<HTMLInputElement>('input[type="text"]');
                const toggle = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
                if (!input) return;
                const text = input.value.trim();
                if (!text) return;
                patterns.push(serializePattern(text, toggle?.checked ?? false));
            });
            await onChange(patterns);
        };

        const renderRow = (pattern: string) => {
            const { text, isRegex } = parsePattern(pattern);

            const row = listEl.createDiv();
            row.setAttribute('data-pattern-row', '1');
            row.style.cssText = 'display: flex; align-items: center; gap: 6px;';

            // Text input (first)
            const input = row.createEl('input');
            input.type = 'text';
            input.value = text;
            input.placeholder = isRegex ? '^Daily.*/\\d{4}' : 'Projects/Work/';
            input.style.cssText = 'flex: 1; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-modifier-form-field); color: var(--text-normal); font-size: 12px; font-family: var(--font-monospace);';
            input.addEventListener('change', collectAndSave);

            // Regex toggle (after input)
            const toggleWrap = row.createEl('label');
            toggleWrap.title = 'Enable regex';
            toggleWrap.style.cssText = 'display: flex; align-items: center; gap: 3px; cursor: pointer; flex-shrink: 0; font-size: 11px; color: var(--text-muted); user-select: none;';
            const checkbox = toggleWrap.createEl('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isRegex;
            checkbox.style.cssText = 'cursor: pointer; margin: 0;';
            toggleWrap.createEl('span', { text: '.*' }).style.cssText = `font-family: var(--font-monospace); font-size: 12px; font-weight: 600; color: ${isRegex ? 'var(--interactive-accent)' : 'var(--text-muted)'};`;

            checkbox.addEventListener('change', () => {
                const dot = toggleWrap.querySelector('span');
                if (dot) dot.style.color = checkbox.checked ? 'var(--interactive-accent)' : 'var(--text-muted)';
                collectAndSave();
            });

            const delBtn = row.createEl('button', { text: '✕' });
            delBtn.style.cssText = 'font-size: 11px; padding: 1px 6px; flex-shrink: 0; color: var(--text-muted);';
            delBtn.addEventListener('click', () => {
                row.remove();
                collectAndSave();
            });
        };

        value.forEach(p => renderRow(p));

        addBtn.addEventListener('click', () => {
            renderRow('');
            const inputs = listEl.querySelectorAll<HTMLInputElement>('input[type="text"]');
            inputs[inputs.length - 1]?.focus();
        });
    }
}
