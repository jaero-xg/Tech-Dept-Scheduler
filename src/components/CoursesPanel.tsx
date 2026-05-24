// ==================== COURSES PANEL ====================
// Replaces courses-panel from index.html + course-setup.js (courses section)

import { useState } from "react";
import { useAppContext, useAppActions } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import { COURSE_TYPE_LABELS, UNITS_MAP, HOURS_MAP } from "../lib/constants";
import type { CourseType } from "../lib/types";

interface CoursesPanelProps {
  isActive: boolean;
}

export default function CoursesPanel({ isActive }: CoursesPanelProps) {
  const { state } = useAppContext();
  const actions = useAppActions();
  const showToast = useToast();

  // ── Local form state ────────────────────────────────────────────────────────
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("pure-lect");
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);

  // ── Derived: sync description when code changes ───────────────────────────
  function handleCodeChange(code: string) {
    setSelectedCode(code);
    const entry = state.catalog.find((c) => c.code === code);
    setSelectedName(entry ? entry.description : "");
  }

  // ── Checkbox helpers ───────────────────────────────────────────────────────
  function toggleInstructor(id: number) {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleClass(id: number) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // ── Add course ─────────────────────────────────────────────────────────────
  function handleAddCourse() {
    if (!selectedCode || !selectedName) {
      showToast("Please select a course code and name");
      return;
    }
    if (selectedInstructors.length === 0) {
      showToast("Please select at least one instructor");
      return;
    }
    if (selectedClasses.length === 0) {
      showToast("Please select at least one class");
      return;
    }

    actions.addCourse({
      code: selectedCode,
      name: selectedName,
      type: courseType,
      instructors: selectedInstructors,
      classes: selectedClasses,
      hours: HOURS_MAP[courseType],
      units: UNITS_MAP[courseType],
    });

    // Reset form
    setSelectedCode("");
    setSelectedName("");
    setCourseType("pure-lect");
    setSelectedInstructors([]);
    setSelectedClasses([]);

    showToast("Course added");
  }

  // ── Remove course ──────────────────────────────────────────────────────────
  function handleRemoveCourse(id: number) {
    actions.removeCourse(id);
    showToast("Course removed");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div id="courses-panel" className={`panel${isActive ? " active" : ""}`}>
      {/* ── Add Course Form ── */}
      <div className="card">
        <h2>Add Course</h2>

        <div className="form-grid">
          {/* Course Code */}
          <div className="form-group">
            <label>Course Code</label>
            <select
              value={selectedCode}
              onChange={(e) => handleCodeChange(e.target.value)}
            >
              <option value="">— Select Course Code —</option>
              {state.catalog.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Course Name / Description — auto-filled from catalog */}
          <div className="form-group">
            <label>Course Name / Description</label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {!selectedCode ? (
                <option value="">— Select a code first —</option>
              ) : (
                <option value={selectedName}>{selectedName}</option>
              )}
            </select>
          </div>

          {/* Course Type */}
          <div className="form-group">
            <label>Type</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
            >
              {Object.entries(COURSE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          {/* Instructors checkboxes */}
          <div className="form-group">
            <label>Instructors</label>
            <div className="checkbox-group">
              {state.instructors.length === 0 ? (
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
                  No instructors added yet. Add them in Setup.
                </p>
              ) : (
                state.instructors.map((i) => (
                  <label className="checkbox-item" key={i.id}>
                    <input
                      type="checkbox"
                      checked={selectedInstructors.includes(i.id)}
                      onChange={() => toggleInstructor(i.id)}
                    />
                    {i.name}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Classes checkboxes */}
          <div className="form-group">
            <label>Classes</label>
            <div className="checkbox-group">
              {state.classes.length === 0 ? (
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
                  No classes added yet. Add them in Setup.
                </p>
              ) : (
                state.classes.map((c) => (
                  <label className="checkbox-item" key={c.id}>
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(c.id)}
                      onChange={() => toggleClass(c.id)}
                    />
                    BSIT {c.year} BLOCK {c.block}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button className="btn btn-primary" onClick={handleAddCourse}>
            Add Course
          </button>
        </div>
      </div>

      {/* ── Courses List ── */}
      <div className="card">
        <h2>Courses List</h2>
        <div className="list-container">
          {state.courses.length === 0 ? (
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
              No courses added yet.
            </p>
          ) : (
            state.courses.map((course) => {
              const instNames = course.instructors
                .map((iid) => state.instructors.find((i) => i.id === iid)?.name)
                .filter(Boolean)
                .join(", ");

              const classNames = course.classes
                .map((cid) => {
                  const cl = state.classes.find((c) => c.id === cid);
                  return cl ? `BSIT ${cl.year} BLOCK ${cl.block}` : null;
                })
                .filter(Boolean)
                .join(", ");

              return (
                <div className="list-item" key={course.id}>
                  <div className="list-item-info">
                    <div className="list-item-title">
                      {course.code} — {course.name}
                    </div>
                    <div className="list-item-sub">
                      {COURSE_TYPE_LABELS[course.type]} | Room:{" "}
                      <em>Auto-assigned</em>
                    </div>
                    <div className="list-item-sub">
                      Instructors: {instNames}
                    </div>
                    <div className="list-item-sub">Classes: {classNames}</div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
