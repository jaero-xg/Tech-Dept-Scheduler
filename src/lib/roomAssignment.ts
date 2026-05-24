// src/lib/roomAssignment.ts
import { TIME_SLOTS } from "./constants";
import type { AppState, Course } from "./types";

const ROOM_COMPATIBILITY: Record<string, {
  preferred: string[]; acceptable: string[]; emergency: string[];
}> = {
  immersion:    { preferred: [],                   acceptable: [],         emergency: [] },
  "lab-w-lect": { preferred: ["hybrid"],           acceptable: [],         emergency: [] },
  "lect-w-lab": { preferred: ["hybrid","lecture"], acceptable: [],         emergency: [] },
  "pure-lect":  { preferred: ["lecture"],          acceptable: ["hybrid"], emergency: [] },
};

export function scoreRoomCompatibility(roomType: string, courseType: string): number {
  if (courseType === "immersion") return -1;
  const compat = ROOM_COMPATIBILITY[courseType];
  if (!compat) return 0;
  if (compat.preferred.includes(roomType)) return 3;
  if (compat.acceptable.includes(roomType)) return 2;
  if (compat.emergency.includes(roomType)) return 1;
  return 0;
}

function isRoomAvailable(
  roomId: number,
  day: number,
  startSlot: number,
  duration: number,
  scheduled: Map<string, { roomId: number | null }[]>,
): boolean {
  for (let i = 0; i < duration; i++) {
    const key = `${day}-${startSlot + i}`;
    const existing = scheduled.get(key) ?? [];
    if (existing.some((e) => e.roomId === roomId)) return false;
  }
  return true;
}

function isSlotFreeForAll(
  dayIndices: number[],
  slot: number,
  duration: number,
  course: Course,
  classId: number,
  scheduled: Map<string, { roomId: number | null; instructorIds: number[]; classId: number }[]>,
): boolean {
  for (const day of dayIndices) {
    for (let i = 0; i < duration; i++) {
      const key = `${day}-${slot + i}`;
      const existing = scheduled.get(key) ?? [];
      for (const iid of course.instructors) {
        if (existing.some((e) => e.instructorIds.includes(iid))) return false;
      }
      if (existing.some((e) => e.classId === classId)) return false;
    }
  }
  return true;
}

function isValidTimeSlot(slot: number, duration: number, timeSlots: string[]): boolean {
  for (let i = 0; i < duration; i++) {
    const time = timeSlots[slot + i];
    if (!time) return false;
    const isPM = time.includes("PM");
    const [h, m] = time.replace(/\s*(AM|PM)/, "").split(":").map(Number);
    const mins = (isPM && h !== 12 ? h + 12 : h) * 60 + m;
    if (mins < 450 || (mins >= 690 && mins < 780) || mins > 1020) return false;
  }
  return true;
}

export function findSameSlotForDays(
  course: Course,
  classId: number,
  dayIndices: number[],
  duration: number,
  scheduled: Map<string, any[]>,
  state: AppState,
): { slot: number; room: { id: number | null; name: string; type: string } } | null {

  for (let slot = 0; slot + duration <= TIME_SLOTS.length; slot++) {
    if (!isValidTimeSlot(slot, duration, TIME_SLOTS)) continue;
    if (!isSlotFreeForAll(dayIndices, slot, duration, course, classId, scheduled)) continue;

    if (course.type === "immersion") return { slot, room: { id: null, name: "N/A", type: "none" } };

    const scoredRooms = state.rooms
      .map((r) => ({ room: r, score: scoreRoomCompatibility(r.type, course.type) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { room } of scoredRooms) {
      const freeOnAll = dayIndices.every((day) =>
        isRoomAvailable(room.id, day, slot, duration, scheduled)
      );
      if (freeOnAll) return { slot, room };
    }
  }
  return null;
}