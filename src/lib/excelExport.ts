// ==================== EXCEL EXPORT ====================
// Port of excel-export.js. Uses SheetJS (xlsx) via npm install xlsx.
// All functions accept AppState + showToast instead of reading window.store.
//
// Install: npm install xlsx
// Import in vite: import * as XLSX from "xlsx";

import * as XLSX from "xlsx";
import { TIME_SLOTS } from "./constants";
import type { AppState, Course, ClassEntry, Instructor, ScheduleEntry } from "./types";

type ShowToast = (msg: string) => void;

// ── LEC / LAB hours helper ────────────────────────────────────────────────────
function getLecLab(course: Course): { lec: number; lab: number } {
  switch (course.type) {
    case "lab-w-lect":  return { lec: 0, lab: 3 };
    case "lect-w-lab":  return { lec: 2, lab: 0 };
    case "pure-lect":   return { lec: 3, lab: 0 };
    case "immersion":   return { lec: course.units, lab: 0 };
    default:            return { lec: 0, lab: 0 };
  }
}

// ── Day label from entries ────────────────────────────────────────────────────
function buildDayLabel(entries: ScheduleEntry[]): string {
  if (!entries.length) return "";
  if (entries[0].isImmersion) return "Immersion";
  if (entries[0].dayPattern) return entries[0].dayPattern;
  const map = ["M", "T", "W", "TH", "F"];
  const unique = [...new Set(entries.map((e) => e.day))].sort((a, b) => a - b);
  if (unique.length === 3 && unique[0] === 0 && unique[1] === 2 && unique[2] === 4) return "MWF";
  if (unique.length === 2 && unique[0] === 1 && unique[1] === 3) return "TTH";
  return unique.map((d) => map[d]).join("/");
}

// ── Time string from slot ─────────────────────────────────────────────────────
function buildTimeString(startSlot: number, duration: number): string {
  if (startSlot < 0) return "TBA";
  const s = TIME_SLOTS[startSlot] ?? "?";
  const e = TIME_SLOTS[startSlot + duration] ?? "?";
  return `${s}-${e}`;
}

// ── Group entries by courseId+classId ─────────────────────────────────────────
function groupEntries(arr: ScheduleEntry[]): Map<string, ScheduleEntry[]> {
  const map = new Map<string, ScheduleEntry[]>();
  for (const entry of arr) {
    const key = `${entry.courseId}_${entry.classId}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return map;
}

// ── Sort rows by day pattern, then time ──────────────────────────────────────
const DAY_ORDER: Record<string, number> = {
  MWF: 0, MW: 1, WF: 2, MF: 3, TTH: 4,
  T: 5, M: 6, W: 7, TH: 8, F: 9, Immersion: 99,
};

function sortRows<T extends { _day: string; _time: string }>(rows: T[]): T[] {
  return rows.sort((a, b) => {
    const da = DAY_ORDER[a._day] ?? 50;
    const db = DAY_ORDER[b._day] ?? 50;
    if (da !== db) return da - db;
    return a._time.localeCompare(b._time);
  });
}

// ── SheetJS helpers ───────────────────────────────────────────────────────────
type WsCell = { v: string | number; t: string; s?: object };
type Ws = Record<string, WsCell | object>;

function sc(r: number, c: number): string {
  return XLSX.utils.encode_cell({ r, c });
}

function setC(ws: Ws, r: number, c: number, v: string | number, s?: object) {
  ws[sc(r, c)] = { v: v ?? "", t: typeof v === "number" ? "n" : "s", s };
}

function addMerge(ws: Ws, r1: number, c1: number, r2: number, c2: number) {
  if (!ws["!merges"]) (ws as Record<string, unknown>)["!merges"] = [];
  (ws["!merges"] as object[]).push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

interface StyleOpts {
  sz?: number; bold?: boolean; fc?: string; bg?: string;
  ha?: "center" | "left" | "right"; wrap?: boolean; italic?: boolean;
}

function mkS(o: StyleOpts) {
  return {
    font: { name: "Arial", sz: o.sz ?? 9, bold: !!o.bold, color: { rgb: o.fc ?? "000000" }, italic: !!o.italic },
    fill: { patternType: "solid", fgColor: { rgb: o.bg ?? "FFFFFF" } },
    alignment: { horizontal: o.ha ?? "center", vertical: "center", wrapText: !!o.wrap },
    border: {
      top:    { style: "thin", color: { rgb: "BBBBBB" } },
      bottom: { style: "thin", color: { rgb: "BBBBBB" } },
      left:   { style: "thin", color: { rgb: "BBBBBB" } },
      right:  { style: "thin", color: { rgb: "BBBBBB" } },
    },
  };
}

const S = {
  title:    mkS({ bold: true, sz: 11, ha: "left" }),
  preHdr:   mkS({ bold: true, sz: 9, bg: "D9D9D9" }),
  preBlank: mkS({ sz: 9, bg: "D9D9D9" }),
  colHdr:   mkS({ bold: true, sz: 9, bg: "D9D9D9" }),
  facLbl:   mkS({ bold: true, sz: 10, ha: "left" }),
  facName:  mkS({ bold: true, sz: 10, ha: "left" }),
  d0:       mkS({ ha: "center" }),
  d1:       mkS({ ha: "center", bg: "F5F5F5" }),
  d0L:      mkS({ ha: "left", wrap: true }),
  d1L:      mkS({ ha: "left", bg: "F5F5F5", wrap: true }),
  sub:      mkS({ bold: true, sz: 9, bg: "E0E0E0" }),
  subLbl:   mkS({ bold: true, sz: 9, ha: "right", bg: "E0E0E0" }),
  blank:    mkS({}),
};

const COL_WIDTHS = [20, 8, 13, 44, 7, 6, 6, 32, 16];

function finalizeSheet(ws: Ws, lastRow: number) {
  (ws as Record<string, unknown>)["!cols"] = COL_WIDTHS.map((w) => ({ wch: w }));
  (ws as Record<string, unknown>)["!ref"] = XLSX.utils.encode_range(
    { r: 0, c: 0 },
    { r: Math.max(lastRow - 1, 0), c: 8 },
  );
  (ws as Record<string, unknown>)["!pageSetup"] = {
    orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
  };
  (ws as Record<string, unknown>)["!printOptions"] = { gridLines: false };
  (ws as Record<string, unknown>)["!margins"] = {
    left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3,
  };
}

// ── CLASS BLOCK ───────────────────────────────────────────────────────────────
// Cols: TIME | DAY | CODE | TITLE | UNITS | LEC | LAB | FACULTY | ROOM
function buildClassBlock(ws: Ws, cls: ClassEntry, state: AppState, R: number): number {
  const label = `BSIT ${cls.year} - Block${cls.block}`;

  // Row 1: class name merged across all 9 cols
  setC(ws, R, 0, label, S.title);
  for (let c = 1; c < 9; c++) setC(ws, R, c, "", S.blank);
  addMerge(ws, R, 0, R, 8);
  R++;

  // Row 2: pre-header
  for (let c = 0; c < 5; c++) setC(ws, R, c, "", S.preBlank);
  setC(ws, R, 5, "HOURS/WEEK", S.preHdr);
  setC(ws, R, 6, "", S.preHdr);
  setC(ws, R, 7, "", S.preBlank);
  setC(ws, R, 8, "", S.preBlank);
  addMerge(ws, R, 0, R, 4);
  addMerge(ws, R, 5, R, 6);
  R++;

  // Row 3: column headers
  ["TIME", "DAY", "COURSE CODE", "COURSE TITLE", "UNITS", "LEC", "LAB", "FACULTY", "ROOM"]
    .forEach((h, c) => setC(ws, R, c, h, S.colHdr));
  R++;

  // Collect data
  const clsEntries = state.schedule.filter((s) => s.classId === cls.id && !s.isImmersion);
  const clsImm     = state.schedule.filter((s) => s.classId === cls.id && s.isImmersion);
  const grouped = groupEntries(clsEntries);

  interface Row { _day: string; _time: string; time: string; day: string; code: string; title: string; units: number; lec: number; lab: number; faculty: string; room: string }
  const rows: Row[] = [];

  for (const entry of clsImm) {
    const course = state.courses.find((c) => c.id === entry.courseId);
    if (!course) continue;
    const insts = entry.instructorIds
      .map((iid) => state.instructors.find((i) => i.id === iid)?.name)
      .filter(Boolean).join(", ");
    const { lec, lab } = getLecLab(course);
    rows.push({ _day: "Immersion", _time: "", time: "Immersion", day: "Immersion", code: course.code, title: course.name, units: course.units, lec, lab, faculty: insts, room: "N/A" });
  }

  for (const [, entries] of grouped) {
    const course = state.courses.find((c) => c.id === entries[0].courseId);
    if (!course) continue;
    const room  = state.rooms.find((r) => r.id === entries[0].roomId);
    const insts = entries[0].instructorIds
      .map((iid) => state.instructors.find((i) => i.id === iid)?.name)
      .filter(Boolean).join(", ");
    const day  = buildDayLabel(entries);
    const time = buildTimeString(entries[0].startSlot, entries[0].duration);
    const { lec, lab } = getLecLab(course);
    rows.push({ _day: day, _time: time, time, day, code: course.code, title: course.name, units: course.units, lec, lab, faculty: insts, room: room?.name ?? "N/A" });
  }

  sortRows(rows);

  rows.forEach((row, ri) => {
    const alt = ri % 2 === 1;
    setC(ws, R, 0, row.time,    alt ? S.d1  : S.d0);
    setC(ws, R, 1, row.day,     alt ? S.d1  : S.d0);
    setC(ws, R, 2, row.code,    alt ? S.d1  : S.d0);
    setC(ws, R, 3, row.title,   alt ? S.d1L : S.d0L);
    setC(ws, R, 4, row.units,   alt ? S.d1  : S.d0);
    setC(ws, R, 5, row.lec,     alt ? S.d1  : S.d0);
    setC(ws, R, 6, row.lab,     alt ? S.d1  : S.d0);
    setC(ws, R, 7, row.faculty, alt ? S.d1L : S.d0L);
    setC(ws, R, 8, row.room,    alt ? S.d1  : S.d0);
    R++;
  });

  // Sub-total
  const uSum = rows.reduce((s, r) => s + (r.units || 0), 0);
  const lSum = rows.reduce((s, r) => s + (r.lec   || 0), 0);
  const bSum = rows.reduce((s, r) => s + (r.lab   || 0), 0);
  for (let c = 0; c < 9; c++) setC(ws, R, c, "", S.sub);
  setC(ws, R, 3, "Sub-Total", S.subLbl);
  setC(ws, R, 4, uSum, S.sub);
  setC(ws, R, 5, lSum, S.sub);
  setC(ws, R, 6, bSum, S.sub);
  addMerge(ws, R, 0, R, 2);
  R++;
  R++; // spacer
  return R;
}

// ── FACULTY BLOCK ─────────────────────────────────────────────────────────────
// Cols: TIME | DAY | CODE | TITLE | UNITS | LEC | LAB | ROOM | CLASS
function buildFacultyBlock(ws: Ws, instructor: Instructor, state: AppState, R: number): number {
  setC(ws, R, 0, "Faculty:", S.facLbl);
  setC(ws, R, 1, instructor.name, S.facName);
  for (let c = 2; c < 5; c++) setC(ws, R, c, "", S.blank);
  setC(ws, R, 5, "HOURS/WEEK", S.preHdr);
  setC(ws, R, 6, "", S.preHdr);
  setC(ws, R, 7, "", S.preBlank);
  setC(ws, R, 8, "", S.preBlank);
  addMerge(ws, R, 1, R, 4);
  addMerge(ws, R, 5, R, 6);
  R++;

  ["Time", "DAY", "COURSE CODE", "COURSE TITLE", "UNITS", "LEC", "LAB", "ROOM", "CLASS"]
    .forEach((h, c) => setC(ws, R, c, h, S.colHdr));
  R++;

  const facEntries = state.schedule.filter((s) => s.instructorIds.includes(instructor.id) && !s.isImmersion);
  const facImm     = state.schedule.filter((s) => s.instructorIds.includes(instructor.id) && s.isImmersion);
  const grouped = groupEntries(facEntries);

  interface FRow { _day: string; _time: string; time: string; day: string; code: string; title: string; units: number; lec: number; lab: number; room: string; cls: string }
  const rows: FRow[] = [];

  for (const entry of facImm) {
    const course = state.courses.find((c) => c.id === entry.courseId);
    if (!course) continue;
    const cls = state.classes.find((c) => c.id === entry.classId);
    const { lec, lab } = getLecLab(course);
    rows.push({ _day: "Immersion", _time: "", time: "Immersion", day: "Immersion", code: course.code, title: course.name, units: course.units, lec, lab, room: "N/A", cls: cls ? `BSIT ${cls.year} - Block${cls.block}` : "N/A" });
  }

  for (const [, entries] of grouped) {
    const course = state.courses.find((c) => c.id === entries[0].courseId);
    if (!course) continue;
    const room = state.rooms.find((r) => r.id === entries[0].roomId);
    const cls  = state.classes.find((c) => c.id === entries[0].classId);
    const day  = buildDayLabel(entries);
    const time = buildTimeString(entries[0].startSlot, entries[0].duration);
    const { lec, lab } = getLecLab(course);
    rows.push({ _day: day, _time: time, time, day, code: course.code, title: course.name, units: course.units, lec, lab, room: room?.name ?? "N/A", cls: cls ? `BSIT ${cls.year} - Block${cls.block}` : "N/A" });
  }

  sortRows(rows);

  rows.forEach((row, ri) => {
    const alt = ri % 2 === 1;
    setC(ws, R, 0, row.time,  alt ? S.d1  : S.d0);
    setC(ws, R, 1, row.day,   alt ? S.d1  : S.d0);
    setC(ws, R, 2, row.code,  alt ? S.d1  : S.d0);
    setC(ws, R, 3, row.title, alt ? S.d1L : S.d0L);
    setC(ws, R, 4, row.units, alt ? S.d1  : S.d0);
    setC(ws, R, 5, row.lec,   alt ? S.d1  : S.d0);
    setC(ws, R, 6, row.lab,   alt ? S.d1  : S.d0);
    setC(ws, R, 7, row.room,  alt ? S.d1  : S.d0);
    setC(ws, R, 8, row.cls,   alt ? S.d1  : S.d0);
    R++;
  });

  const uSum = rows.reduce((s, r) => s + (r.units || 0), 0);
  const lSum = rows.reduce((s, r) => s + (r.lec   || 0), 0);
  const bSum = rows.reduce((s, r) => s + (r.lab   || 0), 0);
  for (let c = 0; c < 9; c++) setC(ws, R, c, "", S.sub);
  setC(ws, R, 3, "Sub - Total", S.subLbl);
  setC(ws, R, 4, uSum, S.sub);
  setC(ws, R, 5, lSum, S.sub);
  setC(ws, R, 6, bSum, S.sub);
  addMerge(ws, R, 0, R, 2);
  R++;
  R++; // spacer
  return R;
}

// ── PUBLIC EXPORT FUNCTIONS ───────────────────────────────────────────────────

export function exportClassExcel(classId: number, state: AppState, showToast: ShowToast) {
  const cls = state.classes.find((c) => c.id === classId);
  if (!cls) { showToast("Select a class first"); return; }
  const wb = XLSX.utils.book_new();
  const ws: Ws = {};
  const R = buildClassBlock(ws, cls, state, 0);
  finalizeSheet(ws, R);
  XLSX.utils.book_append_sheet(wb, ws, `BSIT${cls.year}B${cls.block}`);
  XLSX.writeFile(wb, `Schedule_BSIT${cls.year}_Block${cls.block}.xlsx`);
  showToast(`Excel: BSIT ${cls.year} Block ${cls.block}`);
}

export function exportFacultyExcel(instructorId: number, state: AppState, showToast: ShowToast) {
  const inst = state.instructors.find((i) => i.id === instructorId);
  if (!inst) { showToast("Select a faculty first"); return; }
  const wb = XLSX.utils.book_new();
  const ws: Ws = {};
  const R = buildFacultyBlock(ws, inst, state, 0);
  finalizeSheet(ws, R);
  const tabName = inst.name.trim().split(/\s+/).pop()!.substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, tabName);
  XLSX.writeFile(wb, `Schedule_${inst.name.replace(/\s+/g, "_")}.xlsx`);
  showToast(`Excel: ${inst.name}`);
}

export function exportAllClassesExcel(state: AppState, showToast: ShowToast) {
  if (!state.classes.length) { showToast("No class data to export"); return; }
  const wb = XLSX.utils.book_new();
  const wsAll: Ws = {};
  let R = 0;
  for (const cls of state.classes) R = buildClassBlock(wsAll, cls, state, R);
  finalizeSheet(wsAll, R);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Classes");
  for (const cls of state.classes) {
    const ws: Ws = {};
    const endR = buildClassBlock(ws, cls, state, 0);
    finalizeSheet(ws, endR);
    XLSX.utils.book_append_sheet(wb, ws, `BSIT${cls.year}B${cls.block}`.substring(0, 31));
  }
  XLSX.writeFile(wb, "Schedule_All_Classes.xlsx");
  showToast("Downloaded: Schedule_All_Classes.xlsx");
}

export function exportAllFacultyExcel(state: AppState, showToast: ShowToast) {
  if (!state.instructors.length) { showToast("No faculty data to export"); return; }
  const wb = XLSX.utils.book_new();
  const wsAll: Ws = {};
  let R = 0;
  for (const inst of state.instructors) R = buildFacultyBlock(wsAll, inst, state, R);
  finalizeSheet(wsAll, R);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Faculty");
  for (const inst of state.instructors) {
    const ws: Ws = {};
    const endR = buildFacultyBlock(ws, inst, state, 0);
    finalizeSheet(ws, endR);
    let tab = inst.name.trim().split(/\s+/).pop()!.substring(0, 28);
    if ((wb.SheetNames as string[]).includes(tab)) tab = tab.substring(0, 25) + "_" + inst.id;
    XLSX.utils.book_append_sheet(wb, ws, tab.substring(0, 31));
  }
  XLSX.writeFile(wb, "Schedule_All_Faculty.xlsx");
  showToast("Downloaded: Schedule_All_Faculty.xlsx");
}

export function exportUtilizationExcel(state: AppState, showToast: ShowToast) {
  if (!state.schedule.length) { showToast("Generate a schedule first"); return; }

  const wb = XLSX.utils.book_new();
  const rooms = state.rooms.map((r) => r.name);

  function buildLookup(patternDays: number[]) {
    const lookup: Record<string, { code: string; block: string; teacher: string }> = {};
    for (const entry of state.schedule) {
      if (entry.isImmersion) continue;
      if (!patternDays.includes(entry.day)) continue;
      const course = state.courses.find((c) => c.id === entry.courseId);
      const room   = state.rooms.find((r) => r.id === entry.roomId);
      const cls    = state.classes.find((c) => c.id === entry.classId);
      const insts  = entry.instructorIds
        .map((iid) => state.instructors.find((i) => i.id === iid)?.name)
        .filter(Boolean).join(", ");
      if (!course || !room) continue;
      const timeLabel = buildTimeString(entry.startSlot, entry.duration);
      const key = `${timeLabel}||${room.name}`;
      if (!lookup[key]) lookup[key] = { code: course.code, block: "", teacher: insts };
      const blockLabel = cls ? `BSIT ${cls.year} - BLK ${cls.block}` : "";
      if (blockLabel && !lookup[key].block.includes(blockLabel)) {
        lookup[key].block = lookup[key].block ? `${lookup[key].block}\n${blockLabel}` : blockLabel;
      }
    }
    return lookup;
  }

  const mwfLookup = buildLookup([0, 2, 4]);
  const tthLookup = buildLookup([1, 3]);

  const SLOTS = [
    "7:30 AM-8:30 AM", "8:30 AM-9:30 AM", "9:30 AM-10:30 AM", "10:30 AM-11:30 AM",
    "1:00 PM-2:00 PM",  "2:00 PM-3:00 PM",  "3:00 PM-4:00 PM",  "4:00 PM-5:00 PM",
  ];

  function normalize(t: string) { return (t ?? "").replace(/\s+/g, "").toLowerCase(); }
  function lookupCell(lookup: typeof mwfLookup, slotLabel: string, roomName: string) {
    const key = `${slotLabel}||${roomName}`;
    if (lookup[key]) return lookup[key];
    const normSlot = normalize(slotLabel);
    for (const k of Object.keys(lookup)) {
      const [ks, kr] = k.split("||");
      if (normalize(ks) === normSlot && kr === roomName) return lookup[k];
    }
    return null;
  }

  const HDR_BG  = "1F3864";
  const SUB_BG  = "2E75B6";
  const TBL_HDR = "BDD7EE";
  const TIME_BG = "DDEBF7";
  const ALT_BG  = "EBF3FB";
  const FOOT_BG = "F2F2F2";

  function mkU(o: StyleOpts) {
    return {
      font: { name: "Arial", sz: o.sz ?? 9, bold: !!o.bold, color: { rgb: o.fc ?? "000000" }, italic: !!o.italic },
      fill: { patternType: "solid", fgColor: { rgb: o.bg ?? "FFFFFF" } },
      alignment: { horizontal: o.ha ?? "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "888888" } }, bottom: { style: "thin", color: { rgb: "888888" } },
        left: { style: "thin", color: { rgb: "888888" } }, right: { style: "thin", color: { rgb: "888888" } },
      },
    };
  }

  function buildUtilSheet(
    sheetName: string,
    slots: string[],
    lookup: typeof mwfLookup,
    patternLabel: string,
  ) {
    const ws: Record<string, unknown> = {};
    ws["!merges"] = [] as object[];
    const mG = (r1: number, c1: number, r2: number, c2: number) =>
      (ws["!merges"] as object[]).push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    const sC = (r: number, c: number, v: string | number, s: object) => {
      ws[XLSX.utils.encode_cell({ r, c })] = { v: v ?? "", t: typeof v === "number" ? "n" : "s", s };
    };

    const TIME_COL  = 1;
    const ROOM_START = 2;
    const lastCol = ROOM_START + rooms.length - 1;
    let R = 0;

    const hdrF = { patternType: "solid", fgColor: { rgb: HDR_BG } };
    const hdrA = { horizontal: "center", vertical: "center" };

    // Header rows
    mG(R, TIME_COL, R, lastCol);
    sC(R, TIME_COL, "Republic of the Philippines", { font: { name: "Arial", sz: 10, color: { rgb: "FFFFFF" } }, fill: hdrF, alignment: hdrA }); R++;
    mG(R, TIME_COL, R, lastCol);
    sC(R, TIME_COL, "ROMBLON STATE UNIVERSITY", { font: { name: "Arial", sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: hdrF, alignment: hdrA }); R++;
    mG(R, TIME_COL, R, lastCol);
    sC(R, TIME_COL, "Campus / College / Institute:  TECHNOLOGY DEPARTMENT", { font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } }, fill: { patternType: "solid", fgColor: { rgb: SUB_BG } }, alignment: { horizontal: "left", vertical: "center" } }); R++;
    mG(R, TIME_COL, R, lastCol);
    sC(R, TIME_COL, "Classroom Utilization Plan  for  A.Y. / Sem:  2025-2026 / SECOND SEMESTER", { font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } }, fill: { patternType: "solid", fgColor: { rgb: SUB_BG } }, alignment: { horizontal: "left", vertical: "center" } }); R++;
    mG(R, TIME_COL, R, lastCol);
    sC(R, TIME_COL, `SCHEDULE:  ${patternLabel}`, { font: { name: "Arial", sz: 11, bold: true, color: { rgb: "1F3864" } }, fill: { patternType: "solid", fgColor: { rgb: "D6E4F0" } }, alignment: { horizontal: "center", vertical: "center" } }); R++;
    R++; // spacer

    // Column headers
    sC(R, TIME_COL, "TIME", mkU({ bold: true, sz: 9, bg: TBL_HDR }));
    for (let i = 0; i < rooms.length; i++) sC(R, ROOM_START + i, rooms[i], mkU({ bold: true, sz: 9, bg: TBL_HDR }));
    R++;

    // Data rows (3 sub-rows per slot)
    slots.forEach((slot, si) => {
      const r1  = R;
      const alt = si % 2 === 1;
      const rowBg = alt ? ALT_BG : "FFFFFF";
      mG(r1, TIME_COL, r1 + 2, TIME_COL);
      sC(r1, TIME_COL, slot, mkU({ bold: true, sz: 9, bg: TIME_BG }));
      for (let i = 0; i < rooms.length; i++) {
        const col  = ROOM_START + i;
        const cell = lookupCell(lookup, slot, rooms[i]);
        const lines = [cell?.code ?? "", cell?.block ?? "", cell?.teacher ?? ""];
        for (let sub = 0; sub < 3; sub++) {
          sC(R + sub, col, lines[sub], mkU({ sz: 8, bold: sub === 0 && !!lines[sub], bg: rowBg }));
        }
      }
      R += 3;
    });

    // Footer signatures
    R++;
    mG(R, TIME_COL, R, TIME_COL + 1); sC(R, TIME_COL, "Prepared by:", mkU({ sz: 9, bold: true, bg: FOOT_BG, ha: "left" }));
    mG(R, TIME_COL + 3, R, TIME_COL + 4); sC(R, TIME_COL + 3, "Certified Correct by:", mkU({ sz: 9, bold: true, bg: FOOT_BG, ha: "left" }));
    if (TIME_COL + 6 <= lastCol) { mG(R, TIME_COL + 6, R, lastCol); sC(R, TIME_COL + 6, "Recommending Approval:", mkU({ sz: 9, bold: true, bg: FOOT_BG, ha: "left" })); }
    R += 4;
    const sigS = mkU({ sz: 9, italic: true, bg: FOOT_BG, ha: "center" });
    mG(R, TIME_COL, R, TIME_COL + 1); sC(R, TIME_COL, "College Secretary", sigS);
    mG(R, TIME_COL + 3, R, TIME_COL + 4); sC(R, TIME_COL + 3, "Program Chairperson", sigS);
    if (TIME_COL + 6 <= lastCol) { mG(R, TIME_COL + 6, R, lastCol); sC(R, TIME_COL + 6, "Program Chairperson", sigS); }
    R += 3;
    if (TIME_COL + 6 <= lastCol) {
      mG(R, TIME_COL + 6, R, lastCol); sC(R, TIME_COL + 6, "Approved by:", mkU({ sz: 9, bold: true, bg: FOOT_BG, ha: "left" }));
      R += 2;
      mG(R, TIME_COL + 6, R, lastCol); sC(R, TIME_COL + 6, "College Dean", sigS);
    }

    const roomW = Math.max(12, Math.floor(110 / rooms.length));
    ws["!cols"] = [{ wch: 2 }, { wch: 18 }, ...rooms.map(() => ({ wch: roomW }))];
    ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: R, c: lastCol });
    ws["!pageSetup"] = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
    ws["!printOptions"] = { gridLines: false };
    ws["!margins"] = { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  buildUtilSheet("MWF Time Slots", SLOTS, mwfLookup, "MWF");
  buildUtilSheet("TTH Time Slots", SLOTS, tthLookup, "TTH");
  XLSX.writeFile(wb, "Classroom_Utilization.xlsx");
  showToast("Downloaded: Classroom_Utilization.xlsx");
}