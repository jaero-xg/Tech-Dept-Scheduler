// ==================== APP CONTEXT ====================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type {
  AppState,
  Instructor,
  ClassEntry,
  Room,
  CatalogEntry,
  Course,
  ScheduleEntry,
} from "../lib/types";

const LS = {
  INSTRUCTORS: "store_instructors",
  CLASSES: "store_classes",
  ROOMS: "store_rooms",
  CATALOG: "courseCatalog",
  COURSES: "courseSaved",
  SCHEDULE: "store_schedule",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildInitialState(): AppState {
  return {
    instructors: load(LS.INSTRUCTORS, []),
    classes: load(LS.CLASSES, []),
    rooms: load(LS.ROOMS, []),
    catalog: load(LS.CATALOG, []),
    courses: load(LS.COURSES, []),
    schedule: load(LS.SCHEDULE, []),
  };
}

// ── Action types ──────────────────────────────────────────────────────────────
export type Action =
  | { type: "ADD_INSTRUCTOR"; payload: Instructor }
  | { type: "REMOVE_INSTRUCTOR"; payload: number }
  | { type: "UPDATE_INSTRUCTOR"; payload: { id: number; name: string } }
  | { type: "ADD_CLASS"; payload: ClassEntry }
  | { type: "REMOVE_CLASS"; payload: number }
  | {
      type: "UPDATE_CLASS";
      payload: { id: number; year: string; block: string };
    }
  | { type: "ADD_ROOM"; payload: Room }
  | { type: "REMOVE_ROOM"; payload: number }
  | {
      type: "UPDATE_ROOM";
      payload: { id: number; name: string; type: Room["type"] };
    }
  | { type: "ADD_CATALOG"; payload: CatalogEntry }
  | { type: "REMOVE_CATALOG"; payload: string }
  | {
      type: "UPDATE_CATALOG";
      payload: { oldCode: string; code: string; description: string };
    }
  | { type: "ADD_COURSE"; payload: Course }
  | { type: "REMOVE_COURSE"; payload: number }
  | { type: "SET_SCHEDULE"; payload: ScheduleEntry[] };

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_INSTRUCTOR":
      return { ...state, instructors: [...state.instructors, action.payload] };

    case "REMOVE_INSTRUCTOR": {
      const id = action.payload;
      return {
        ...state,
        instructors: state.instructors.filter((i) => i.id !== id),
        courses: state.courses.map((c) => ({
          ...c,
          instructors: c.instructors.filter((iid) => iid !== id),
        })),
      };
    }

    case "UPDATE_INSTRUCTOR":
      return {
        ...state,
        instructors: state.instructors.map((i) =>
          i.id === action.payload.id ? { ...i, name: action.payload.name } : i,
        ),
      };

    case "ADD_CLASS":
      return { ...state, classes: [...state.classes, action.payload] };

    case "REMOVE_CLASS": {
      const id = action.payload;
      return {
        ...state,
        classes: state.classes.filter((c) => c.id !== id),
        courses: state.courses.map((c) => ({
          ...c,
          classes: c.classes.filter((cid) => cid !== id),
        })),
      };
    }

    case "UPDATE_CLASS": {
      const { id, year, block } = action.payload;
      return {
        ...state,
        classes: state.classes.map((c) =>
          c.id === id
            ? {
                ...c,
                year,
                block: block.toUpperCase(),
                name: `${year}${block.toUpperCase()}`,
              }
            : c,
        ),
      };
    }

    case "ADD_ROOM":
      return { ...state, rooms: [...state.rooms, action.payload] };

    case "REMOVE_ROOM": {
      const id = action.payload;
      return {
        ...state,
        rooms: state.rooms.filter((r) => r.id !== id),
        courses: state.courses.filter((c) => c.id !== id),
      };
    }

    case "UPDATE_ROOM":
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.id
            ? { ...r, name: action.payload.name, type: action.payload.type }
            : r,
        ),
      };

    case "ADD_CATALOG":
      return { ...state, catalog: [...state.catalog, action.payload] };

    case "REMOVE_CATALOG":
      return {
        ...state,
        catalog: state.catalog.filter((e) => e.code !== action.payload),
      };

    case "UPDATE_CATALOG":
      return {
        ...state,
        catalog: state.catalog.map((e) =>
          e.code === action.payload.oldCode
            ? {
                code: action.payload.code,
                description: action.payload.description,
              }
            : e,
        ),
      };

    case "ADD_COURSE":
      return { ...state, courses: [...state.courses, action.payload] };

    case "REMOVE_COURSE":
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.payload),
      };

    case "SET_SCHEDULE":
      return { ...state, schedule: action.payload };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  useEffect(() => {
    localStorage.setItem(LS.INSTRUCTORS, JSON.stringify(state.instructors));
  }, [state.instructors]);
  useEffect(() => {
    localStorage.setItem(LS.CLASSES, JSON.stringify(state.classes));
  }, [state.classes]);
  useEffect(() => {
    localStorage.setItem(LS.ROOMS, JSON.stringify(state.rooms));
  }, [state.rooms]);
  useEffect(() => {
    localStorage.setItem(LS.CATALOG, JSON.stringify(state.catalog));
  }, [state.catalog]);
  useEffect(() => {
    localStorage.setItem(LS.COURSES, JSON.stringify(state.courses));
  }, [state.courses]);
  useEffect(() => {
    localStorage.setItem(LS.SCHEDULE, JSON.stringify(state.schedule));
  }, [state.schedule]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
}

// ── Action creators ───────────────────────────────────────────────────────────
export function useAppActions() {
  const { dispatch, state } = useAppContext();

  return {
    // Instructors
    addInstructor: useCallback(
      (name: string): "ok" | "exists" => {
        if (state.instructors.find((i: Instructor) => i.name === name))
          return "exists";
        dispatch({ type: "ADD_INSTRUCTOR", payload: { id: Date.now(), name } });
        return "ok";
      },
      [dispatch, state.instructors],
    ),
    removeInstructor: useCallback(
      (id: number) => dispatch({ type: "REMOVE_INSTRUCTOR", payload: id }),
      [dispatch],
    ),
    updateInstructor: useCallback(
      (id: number, name: string) =>
        dispatch({ type: "UPDATE_INSTRUCTOR", payload: { id, name } }),
      [dispatch],
    ),

    // Classes
    addClass: useCallback(
      (year: string, block: string): "ok" | "exists" => {
        const name = `${year}${block.toUpperCase()}`;
        if (state.classes.find((c: ClassEntry) => c.name === name))
          return "exists";
        dispatch({
          type: "ADD_CLASS",
          payload: { id: Date.now(), year, block: block.toUpperCase(), name },
        });
        return "ok";
      },
      [dispatch, state.classes],
    ),
    removeClass: useCallback(
      (id: number) => dispatch({ type: "REMOVE_CLASS", payload: id }),
      [dispatch],
    ),
    updateClass: useCallback(
      (id: number, year: string, block: string) =>
        dispatch({ type: "UPDATE_CLASS", payload: { id, year, block } }),
      [dispatch],
    ),

    // Rooms
    addRoom: useCallback(
      (name: string, type: Room["type"]): "ok" | "exists" => {
        if (state.rooms.find((r: Room) => r.name === name)) return "exists";
        dispatch({ type: "ADD_ROOM", payload: { id: Date.now(), name, type } });
        return "ok";
      },
      [dispatch, state.rooms],
    ),
    removeRoom: useCallback(
      (id: number) => dispatch({ type: "REMOVE_ROOM", payload: id }),
      [dispatch],
    ),
    updateRoom: useCallback(
      (id: number, name: string, type: Room["type"]) =>
        dispatch({ type: "UPDATE_ROOM", payload: { id, name, type } }),
      [dispatch],
    ),

    // Catalog
    addCatalogEntry: useCallback(
      (code: string, description: string): "ok" | "exists" => {
        if (
          state.catalog.find(
            (c: CatalogEntry) => c.code.toLowerCase() === code.toLowerCase(),
          )
        )
          return "exists";
        dispatch({ type: "ADD_CATALOG", payload: { code, description } });
        return "ok";
      },
      [dispatch, state.catalog],
    ),
    removeCatalogEntry: useCallback(
      (code: string) => dispatch({ type: "REMOVE_CATALOG", payload: code }),
      [dispatch],
    ),
    updateCatalogEntry: useCallback(
      (oldCode: string, code: string, description: string) =>
        dispatch({
          type: "UPDATE_CATALOG",
          payload: { oldCode, code, description },
        }),
      [dispatch],
    ),

    // Courses
    addCourse: useCallback(
      (course: Omit<Course, "id">) =>
        dispatch({
          type: "ADD_COURSE",
          payload: { id: Date.now(), ...course },
        }),
      [dispatch],
    ),
    removeCourse: useCallback(
      (id: number) => dispatch({ type: "REMOVE_COURSE", payload: id }),
      [dispatch],
    ),

    // Schedule
    setSchedule: useCallback(
      (schedule: ScheduleEntry[]) =>
        dispatch({ type: "SET_SCHEDULE", payload: schedule }),
      [dispatch],
    ),
  };
}
