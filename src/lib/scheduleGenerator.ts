// ==================== SCHEDULE GENERATOR ====================
// Pure port of schedule-generator.js.
// Takes AppState, returns { schedule, conflicts } — no side effects, no DOM.

import { PATTERNS } from "./constants";
import { findSameSlotForDays } from "./roomAssignment";
import type { AppState, ScheduleEntry } from "./types";

// ── Day index → short label ───────────────────────────────────────────────────
const DAY_MAP = ["M", "T", "W", "TH", "F"];

export function dayIndicesToLabel(indices: number[]): string {
  const sorted = [...indices].sort((a, b) => a - b);
  if (sorted.length === 3 && sorted[0] === 0 && sorted[1] === 2 && sorted[2] === 4) return "MWF";
  if (sorted.length === 2 && sorted[0] === 1 && sorted[1] === 3) return "TTH";
  return sorted.map((i) => DAY_MAP[i]).join("/");
}

// ── Pattern candidates per course type ───────────────────────────────────────
// Each candidate describes which days to use and how long each session is (in 30-min slots).
interface PatternCandidate {
  days: number[];
  sessionDuration: number; // in 30-min slots (2 = 1 hr, 3 = 1.5 hr, 4 = 2 hr, 6 = 3 hr)
  sessions: number;        // how many of the days to use
}

function getPatternCandidates(type: string): PatternCandidate[] {
  const isPureLect = type === "pure-lect";
  const isLabWLect = type === "lab-w-lect";
  const isLectWLab = type === "lect-w-lab";

  if (isPureLect || isLabWLect) {
    // 3 hours total
    return [
      { days: PATTERNS.MWF, sessionDuration: 2, sessions: 3 }, // MWF 1hr each
      { days: PATTERNS.TTH, sessionDuration: 3, sessions: 2 }, // TTH 1.5hr each
      { days: PATTERNS.MW,  sessionDuration: 2, sessions: 2 }, // MW 1hr each (partial)
      { days: PATTERNS.WF,  sessionDuration: 2, sessions: 2 }, // WF 1hr each
      { days: [0], sessionDuration: 6, sessions: 1 },           // Single day 3hr block
      { days: [1], sessionDuration: 6, sessions: 1 },
      { days: [2], sessionDuration: 6, sessions: 1 },
      { days: [3], sessionDuration: 6, sessions: 1 },
      { days: [4], sessionDuration: 6, sessions: 1 },
    ];
  }

  if (isLectWLab) {
    // 2 hours total
    return [
      { days: PATTERNS.TTH, sessionDuration: 2, sessions: 2 }, // TTH 1hr each
      { days: PATTERNS.MW,  sessionDuration: 2, sessions: 2 }, // MW 1hr each
      { days: PATTERNS.WF,  sessionDuration: 2, sessions: 2 }, // WF 1hr each
      { days: PATTERNS.MWF, sessionDuration: 2, sessions: 2 }, // any 2 of MWF
      { days: [0], sessionDuration: 4, sessions: 1 },           // Single day 2hr block
      { days: [1], sessionDuration: 4, sessions: 1 },
      { days: [2], sessionDuration: 4, sessions: 1 },
      { days: [3], sessionDuration: 4, sessions: 1 },
      { days: [4], sessionDuration: 4, sessions: 1 },
    ];
  }

  return []; // immersion — handled separately
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateSchedule(state: AppState): {
  schedule: ScheduleEntry[];
  conflicts: string[];
} {
  const schedule: ScheduleEntry[] = [];
  const conflicts: string[] = [];

  // Booking map: key = "day-slot", value = list of bookings at that slot
  const scheduled = new Map<string, ScheduleEntry[]>();

  function bookSlots(
    day: number,
    slot: number,
    duration: number,
    entry: ScheduleEntry,
  ) {
    for (let i = 0; i < duration; i++) {
      const key = `${day}-${slot + i}`;
      if (!scheduled.has(key)) scheduled.set(key, []);
      scheduled.get(key)!.push(entry);
    }
  }

  // Sort: immersion first, then by hours needed descending (fill big blocks first)
  const TYPE_ORDER: Record<string, number> = {
    immersion:    0,
    "lab-w-lect": 1,
    "pure-lect":  2,
    "lect-w-lab": 3,
  };
  const sortedCourses = [...state.courses].sort(
    (a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9),
  );

  for (const course of sortedCourses) {
    // ── Immersion: no room, no time slot ──────────────────────────────────
    if (course.type === "immersion") {
      for (const classId of course.classes) {
        const entry: ScheduleEntry = {
          courseId: course.id,
          classId,
          day: -1,
          startSlot: -1,
          duration: 0,
          roomId: null,
          roomName: "N/A",
          roomType: "none",
          instructorIds: [...course.instructors],
          isImmersion: true,
          dayPattern: "Immersion",
        };
        schedule.push(entry);
      }
      continue;
    }

    // ── Regular courses ────────────────────────────────────────────────────
    const patternCandidates = getPatternCandidates(course.type);

    for (const classId of course.classes) {
      let scheduledOk = false;

      for (const pattern of patternCandidates) {
        const { days: patDays, sessionDuration, sessions } = pattern;
        // Use only as many days as the pattern needs
        const useDays = patDays.slice(0, sessions);

        const result = findSameSlotForDays(
          course,
          classId,
          useDays,
          sessionDuration,
          scheduled,
          state,
        );

        if (result) {
          const { slot, room } = result;
          const dayLabel = dayIndicesToLabel(useDays);

          for (const day of useDays) {
            const entry: ScheduleEntry = {
              courseId: course.id,
              classId,
              day,
              startSlot: slot,
              duration: sessionDuration,
              roomId: room?.id ?? null,
              roomName: room?.name ?? "N/A",
              roomType: room?.type ?? "none",
              instructorIds: [...course.instructors],
              isImmersion: false,
              dayPattern: dayLabel,
            };
            schedule.push(entry);
            bookSlots(day, slot, sessionDuration, entry);
          }

          scheduledOk = true;
          break;
        }
      }

      if (!scheduledOk) {
        const cls = state.classes.find((c) => c.id === classId);
        conflicts.push(
          `${course.code} for class ${cls?.name ?? classId}: Could not find a valid same-time slot.`,
        );
      }
    }
  }

  return { schedule, conflicts };
}