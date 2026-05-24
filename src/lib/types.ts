// ==================== SHARED TYPES ====================

export type RoomType = "hybrid" | "lecture";

export type CourseType = "immersion" | "lab-w-lect" | "lect-w-lab" | "pure-lect";

export interface Instructor {
  id: number;
  name: string;
}

export interface ClassEntry {
  id: number;
  year: string;
  block: string;
  name: string; // e.g. "11" = year1 block1
}

export interface Room {
  id: number;
  name: string;
  type: RoomType;
}

export interface CatalogEntry {
  code: string;
  description: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  type: CourseType;
  instructors: number[]; // instructor ids
  classes: number[];     // classEntry ids
  hours: number;
  units: number;
}

export interface ScheduleEntry {
  courseId: number;
  classId: number;
  day: number;         // 0=Mon … 4=Fri, -1=immersion
  startSlot: number;   // index into TIME_SLOTS, -1=immersion
  duration: number;    // in 30-min slots
  roomId: number | null;
  roomName: string;
  roomType: string;
  instructorIds: number[];
  isImmersion?: boolean;
  dayPattern: string;
}

export interface AppState {
  instructors: Instructor[];
  classes: ClassEntry[];
  rooms: Room[];
  catalog: CatalogEntry[];
  courses: Course[];
  schedule: ScheduleEntry[];
}