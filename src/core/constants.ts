// —— Timer update interval (ms) —— //
export const UPDATE_INTERVAL = 1000;

// —— Base62 character set —— //
export const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// —— Checkbox regexes —— //
export const ORDERED_LIST = /(^\s*#*\d+\.\s)/;
export const UNORDERED_LIST = /(^\s*#*[-/+/*]\s)/;
export const HEADER = /(^\s*#+\s)/;
export const POTENTIAL_CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{0,2})\]/;
export const CHECKBOX_REGEX = /^(?:(\s*)(?:[-+*]|\d+\.)\s+)\[(.{1})\]\s+/;

// —— Debug flag —— //
export const DEBUG = false;
