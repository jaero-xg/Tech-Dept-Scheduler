// ==================== SCHEDULE PANEL ====================
// Replaces schedule-panel from index.html + schedule-renderer.js
// Requires: roomAssignment.ts and scheduleGenerator.ts to be implemented first.
// Excel export functions are imported from excelExport.ts (stub calls shown).

import { useState, useMemo } from "react";
import { useAppContext, useAppActions } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import { DAYS, TIME_SLOTS } from "../lib/constants";
import { generateSchedule } from "../lib/scheduleGenerator";
import { scoreRoomCompatibility } from "../lib/roomAssignment";
import {
  exportClassExcel,
  exportFacultyExcel,
  exportAllClassesExcel,
  exportAllFacultyExcel,
  exportUtilizationExcel,
} from "../lib/excelExport";
import type { ScheduleEntry } from "../lib/types";

interface SchedulePanelProps {
  isActive: boolean;
}

// ── Lunch break is inserted before slot index 9 (1:00 PM) ────────────────────
const LUNCH_SLOT_INDEX = 9;

export default function SchedulePanel({ isActive }: SchedulePanelProps) {
  const { state } = useAppContext();
  const actions = useAppActions();
  const showToast = useToast();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  // ── Generate schedule ─────────────────────────────────────────────────────
  function handleGenerate() {
    if (!state.courses.length) {
      showToast("No courses to schedule");
      return;
    }
    const { schedule, conflicts } = generateSchedule(state);
    actions.setSchedule(schedule);
    if (conflicts.length > 0) {
      showToast(
        `Schedule generated with ${conflicts.length} conflict(s). Check console.`,
      );
      console.warn("Scheduling conflicts:", conflicts);
    } else {
      showToast("Schedule generated successfully!");
    }
  }

  // ── Derived filter values (parsed to number or empty) ─────────────────────
  const filterInstId = filterInstructor ? parseInt(filterInstructor) : null;
  const filterClassId = filterClass ? parseInt(filterClass) : null;
  const filterRoomId = filterRoom ? parseInt(filterRoom) : null;

  // ── Filtered schedule entries ──────────────────────────────────────────────
  const filtered = useMemo<ScheduleEntry[]>(() => {
    return state.schedule.filter((s) => {
      if (s.isImmersion) return false;
      if (filterInstId && !s.instructorIds.includes(filterInstId)) return false;
      if (filterClassId && s.classId !== filterClassId) return false;
      if (filterRoomId && s.roomId !== filterRoomId) return false;
      return true;
    });
  }, [state.schedule, filterInstId, filterClassId, filterRoomId]);

  // ── Filtered immersion entries (shown as banner above grid) ───────────────
  const immersionEntries = useMemo<ScheduleEntry[]>(() => {
    return state.schedule.filter((s) => {
      if (!s.isImmersion) return false;
      if (filterInstId && !s.instructorIds.includes(filterInstId)) return false;
      if (filterClassId && s.classId !== filterClassId) return false;
      return true;
    });
  }, [state.schedule, filterInstId, filterClassId]);

  // ── Derived button states (mirrors updateExcelButtons) ────────────────────
  const hasData = state.courses.length > 0 || state.instructors.length > 0;
  const hasSched = state.schedule.length > 0;
  const selectedClass = filterClassId
    ? state.classes.find((c) => c.id === filterClassId)
    : null;
  const selectedInstructor = filterInstId
    ? state.instructors.find((i) => i.id === filterInstId)
    : null;

  // ── Lookup helpers ────────────────────────────────────────────────────────
  function getCourse(id: number) {
    return state.courses.find((c) => c.id === id);
  }
  function getRoom(id: number | null) {
    return id ? state.rooms.find((r) => r.id === id) : null;
  }
  function getClass(id: number) {
    return state.classes.find((c) => c.id === id);
  }
  function getInstructorNames(ids: number[]) {
    return ids
      .map((iid) => state.instructors.find((i) => i.id === iid)?.name)
      .filter(Boolean)
      .join(", ");
  }

  // ── Entry CSS class by course type ───────────────────────────────────────
  function entryClass(type: string) {
    if (type === "lab-w-lect") return "entry-lab";
    if (type === "lect-w-lab") return "entry-lect-lab";
    return "entry-pure";
  }

  // ── Excel export handlers ─────────────────────────────────────────────────
  function handleExportClass() {
    if (!filterClassId || !hasSched) return;
    exportClassExcel(filterClassId, state, showToast);
  }

  function handleExportFaculty() {
    if (!filterInstId || !hasSched) return;
    exportFacultyExcel(filterInstId, state, showToast);
  }

  function handleExportAllClasses() {
    if (!hasData) return;
    exportAllClassesExcel(state, showToast);
  }

  function handleExportAllFaculty() {
    if (!hasData) return;
    exportAllFacultyExcel(state, showToast);
  }

  function handleExportUtilization() {
    if (!hasSched) return;
    exportUtilizationExcel(state, showToast);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="schedule-panel" className={`panel${isActive ? " active" : ""}`}>
      {/* ── Controls row: Generate + Filters ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {/* Generate button */}
          <button className="btn btn-primary" onClick={handleGenerate}>
            Generate Schedule
          </button>

          {/* Filters */}
          <select
            value={filterInstructor}
            onChange={(e) => setFilterInstructor(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--card)",
              minWidth: "180px",
            }}
          >
            <option value="">All Instructors</option>
            {state.instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--card)",
              minWidth: "180px",
            }}
          >
            <option value="">All Classes</option>
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--card)",
              minWidth: "180px",
            }}
          >
            <option value="">All Rooms</option>
            {state.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Excel Export buttons ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "12px" }}>Export to Excel</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Filtered single exports — need a filter selection + generated schedule */}
          <button
            className="btn btn-success btn-sm"
            disabled={!(filterClassId && hasSched)}
            onClick={handleExportClass}
          >
            {selectedClass ? `Excel: ${selectedClass.name}` : "Excel: Class"}
          </button>

          <button
            className="btn btn-success btn-sm"
            disabled={!(filterInstId && hasSched)}
            onClick={handleExportFaculty}
          >
            {selectedInstructor
              ? `Excel: ${selectedInstructor.name.split(" ").pop()}`
              : "Excel: Faculty"}
          </button>

          {/* Print all — enabled as soon as any data exists */}
          <button
            className="btn btn-success btn-sm"
            disabled={!hasData}
            onClick={handleExportAllClasses}
          >
            All Classes
          </button>

          <button
            className="btn btn-success btn-sm"
            disabled={!hasData}
            onClick={handleExportAllFaculty}
          >
            All Faculty
          </button>

          {/* Room utilization — needs generated schedule */}
          <button
            className="btn btn-success btn-sm"
            disabled={!hasSched}
            onClick={handleExportUtilization}
          >
            Room Utilization
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: "var(--lab)" }} />
          <span>Lab with Lecture</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ background: "var(--lect-lab)" }}
          />
          <span>Lecture with Lab</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "var(--pure)" }} />
          <span>Pure Lecture / Immersion</span>
        </div>
      </div>

      {/* ── Schedule grid or empty state ── */}
      {!state.schedule.length ? (
        <div className="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>Click "Generate Schedule" to create the weekly schedule</p>
        </div>
      ) : (
        <>
          {/* ── Immersion banner ── */}
          {immersionEntries.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              {immersionEntries.map((e, idx) => {
                const course = getCourse(e.courseId);
                const cls = getClass(e.classId);
                const insts = getInstructorNames(e.instructorIds);
                if (!course) return null;
                return (
                  <div
                    key={idx}
                    className="schedule-entry entry-pure"
                    style={{ marginBottom: "6px", padding: "10px 14px" }}
                  >
                    <strong>{course.code}</strong> — {course.name}
                    <span
                      style={{
                        float: "right",
                        fontSize: "0.75rem",
                        background: "var(--primary)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Immersion
                    </span>
                    <br />
                    <small>
                      Class: {cls ? `BSIT ${cls.year} BLK ${cls.block}` : "N/A"}{" "}
                      | Faculty: {insts}
                    </small>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Weekly grid ── */}
          <div className="schedule-scroll-wrapper">
            <div className="schedule-grid">
              {/* Header row */}
              <div className="schedule-header">Time</div>
              {DAYS.map((d) => (
                <div className="schedule-header" key={d}>
                  {d}
                </div>
              ))}

              {/* Time slot rows */}
              {TIME_SLOTS.map((time, slot) => (
                <>
                  {/* Lunch separator before 1:00 PM (slot 9) */}
                  {slot === LUNCH_SLOT_INDEX && (
                    <>
                      <div
                        key="lunch-label"
                        className="time-slot"
                        style={{ background: "var(--bg)", fontWeight: 600 }}
                      >
                        LUNCH
                      </div>
                      {DAYS.map((d) => (
                        <div
                          key={`lunch-${d}`}
                          className="schedule-cell"
                          style={{ background: "var(--bg)" }}
                        />
                      ))}
                    </>
                  )}

                  {/* Time label */}
                  <div className="time-slot" key={`time-${slot}`}>
                    {time}
                  </div>

                  {/* Day cells */}
                  {Array.from({ length: 5 }, (_, day) => {
                    const entries = filtered.filter(
                      (s) => s.day === day && s.startSlot === slot,
                    );
                    return (
                      <div
                        className="schedule-cell"
                        key={`cell-${slot}-${day}`}
                      >
                        {entries.map((e, ei) => {
                          const course = getCourse(e.courseId);
                          const room = getRoom(e.roomId);
                          const cls = getClass(e.classId);
                          const insts = getInstructorNames(e.instructorIds);
                          if (!course) return null;

                          const endTime =
                            TIME_SLOTS[e.startSlot + e.duration] ?? "?";
                          const roomScore = scoreRoomCompatibility(
                            room?.type ?? "",
                            course.type,
                          );
                          const roomBadge =
                            roomScore === 3 ? "✓" : roomScore === 2 ? "~" : "!";
                          const pattern = e.dayPattern ?? "";

                          return (
                            <div
                              key={ei}
                              className={`schedule-entry ${entryClass(course.type)}`}
                              title={`${course.name} — ${insts} — ${room?.name ?? "N/A"}`}
                            >
                              <strong>{course.code}</strong>
                              <span
                                style={{
                                  float: "right",
                                  fontSize: "0.6rem",
                                  opacity: 0.8,
                                }}
                              >
                                {roomBadge} {pattern}
                              </span>
                              <br />
                              {cls && `BSIT ${cls.year} BLK ${cls.block}`}
                              <br />
                              {time}–{endTime}
                              <br />
                              <small>
                                {room?.name ?? "N/A"} | {insts}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
