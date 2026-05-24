// ==================== CONSTANTS ====================
// Ported from store.js

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const TIME_SLOTS = [
  "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

export const PATTERNS: Record<string, number[]> = {
  MWF: [0, 2, 4],
  TTH: [1, 3],
  MW:  [0, 2],
  WF:  [2, 4],
  MF:  [0, 4],
  M:   [0],
  T:   [1],
  W:   [2],
  TH:  [3],
  F:   [4],
};

export const YEAR_LABELS: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
};

export const YEAR_SUFFIX = ["st", "nd", "rd", "th"];

export const COURSE_TYPE_LABELS: Record<string, string> = {
  immersion:    "Immersion (6 units)",
  "lab-w-lect": "Lab with Lecture (3 hrs/wk, 1 unit)",
  "lect-w-lab": "Lecture with Lab (2 hrs/wk, 2 units)",
  "pure-lect":  "Pure Lecture (3 hrs/wk, 3 units)",
};

export const UNITS_MAP: Record<string, number> = {
  immersion:    6,
  "lab-w-lect": 1,
  "lect-w-lab": 2,
  "pure-lect":  3,
};

export const HOURS_MAP: Record<string, number> = {
  immersion:    0,
  "lab-w-lect": 3,
  "lect-w-lab": 2,
  "pure-lect":  3,
};