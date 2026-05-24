// ==================== SETUP PANEL ====================

import { useState } from "react";
import { useAppContext, useAppActions } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import { YEAR_LABELS, YEAR_SUFFIX } from "../lib/constants";
import type { RoomType } from "../lib/types";

interface SetupPanelProps {
  isActive: boolean;
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const EditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Icon button styles ────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  padding: 0,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  transition: "background 0.15s, border-color 0.15s, color 0.15s",
  flexShrink: 0,
};

const editBtnStyle: React.CSSProperties = {
  ...iconBtn,
  color: "var(--text-muted)",
};

const trashBtnStyle: React.CSSProperties = {
  ...iconBtn,
  color: "var(--text-muted)",
};

const saveBtnStyle: React.CSSProperties = {
  ...iconBtn,
  color: "var(--success)",
  background: "var(--success-soft)",
  borderColor: "#b2f2bb",
};

const cancelBtnStyle: React.CSSProperties = {
  ...iconBtn,
  color: "var(--text-muted)",
  background: "var(--bg)",
  borderColor: "var(--border)",
};

const inlineInput: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid var(--primary)",
  borderRadius: 6,
  fontSize: "0.875rem",
  fontFamily: "inherit",
  background: "#fff",
  color: "var(--text)",
  outline: "none",
  boxShadow: "0 0 0 3px rgba(59,91,219,0.08)",
};

export default function SetupPanel({ isActive }: SetupPanelProps) {
  const { state } = useAppContext();
  const actions = useAppActions();
  const showToast = useToast();

  // ── Add form state ──────────────────────────────────────────────────────────
  const [instructorName, setInstructorName] = useState("");
  const [classYear, setClassYear] = useState("1");
  const [classBlock, setClassBlock] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("hybrid");
  const [catalogCode, setCatalogCode] = useState("");
  const [catalogDesc, setCatalogDesc] = useState("");

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingInstructor, setEditingInstructor] = useState<number | null>(
    null,
  );
  const [editInstructorName, setEditInstructorName] = useState("");

  const [editingClass, setEditingClass] = useState<number | null>(null);
  const [editClassYear, setEditClassYear] = useState("1");
  const [editClassBlock, setEditClassBlock] = useState("");

  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomType, setEditRoomType] = useState<RoomType>("hybrid");

  const [editingCatalog, setEditingCatalog] = useState<string | null>(null);
  const [editCatalogCode, setEditCatalogCode] = useState("");
  const [editCatalogDesc, setEditCatalogDesc] = useState("");

  // ── Add handlers ────────────────────────────────────────────────────────────
  function handleAddInstructor() {
    const name = instructorName.trim();
    if (!name) {
      showToast("Please enter instructor name");
      return;
    }
    if (actions.addInstructor(name) === "exists") {
      showToast("Instructor already exists");
      return;
    }
    setInstructorName("");
    showToast("Instructor added");
  }

  function handleAddClass() {
    const block = classBlock.trim();
    if (!block) {
      showToast("Please enter block");
      return;
    }
    if (actions.addClass(classYear, block) === "exists") {
      showToast("Class already exists");
      return;
    }
    setClassBlock("");
    showToast("Class added");
  }

  function handleAddRoom() {
    const name = roomName.trim();
    if (!name) {
      showToast("Please enter room name");
      return;
    }
    if (actions.addRoom(name, roomType) === "exists") {
      showToast("Room already exists");
      return;
    }
    setRoomName("");
    showToast("Room added");
  }

  function handleAddCatalog() {
    const code = catalogCode.trim();
    const desc = catalogDesc.trim();
    if (!code || !desc) {
      showToast("Please fill in both fields");
      return;
    }
    if (actions.addCatalogEntry(code, desc) === "exists") {
      showToast(`"${code}" already exists`);
      return;
    }
    setCatalogCode("");
    setCatalogDesc("");
    showToast(`"${code}" added to catalog`);
  }

  // ── Edit save handlers ───────────────────────────────────────────────────────
  function saveInstructor(id: number) {
    const name = editInstructorName.trim();
    if (!name) {
      showToast("Name cannot be empty");
      return;
    }
    actions.updateInstructor(id, name);
    setEditingInstructor(null);
    showToast("Instructor updated");
  }

  function saveClass(id: number) {
    const block = editClassBlock.trim();
    if (!block) {
      showToast("Block cannot be empty");
      return;
    }
    actions.updateClass(id, editClassYear, block);
    setEditingClass(null);
    showToast("Class updated");
  }

  function saveRoom(id: number) {
    const name = editRoomName.trim();
    if (!name) {
      showToast("Room name cannot be empty");
      return;
    }
    actions.updateRoom(id, name, editRoomType);
    setEditingRoom(null);
    showToast("Room updated");
  }

  function saveCatalog(oldCode: string) {
    const code = editCatalogCode.trim();
    const desc = editCatalogDesc.trim();
    if (!code || !desc) {
      showToast("Please fill in both fields");
      return;
    }
    actions.updateCatalogEntry(oldCode, code, desc);
    setEditingCatalog(null);
    showToast("Catalog entry updated");
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div id="setup-panel" className={`panel${isActive ? " active" : ""}`}>
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Faculty", value: state.instructors.length },
          { label: "Classes", value: state.classes.length },
          { label: "Rooms", value: state.rooms.length },
          { label: "Courses", value: state.courses.length },
        ].map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Faculty ── */}
      <div className="card">
        <h2>Faculty</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Smith"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddInstructor()}
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" onClick={handleAddInstructor}>
              Add Faculty
            </button>
          </div>
        </div>
        <div className="list-container">
          {state.instructors.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No instructors added yet.
            </p>
          ) : (
            state.instructors.map((i) => (
              <div className="list-item" key={i.id}>
                {editingInstructor === i.id ? (
                  <>
                    <input
                      style={{ ...inlineInput, flex: 1, marginRight: 8 }}
                      value={editInstructorName}
                      onChange={(e) => setEditInstructorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveInstructor(i.id);
                        if (e.key === "Escape") setEditingInstructor(null);
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={saveBtnStyle}
                        title="Save"
                        onClick={() => saveInstructor(i.id)}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        style={cancelBtnStyle}
                        title="Cancel"
                        onClick={() => setEditingInstructor(null)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="list-item-info">
                      <div className="list-item-title">{i.name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={editBtnStyle}
                        title="Edit"
                        onClick={() => {
                          setEditingInstructor(i.id);
                          setEditInstructorName(i.name);
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--primary-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--primary)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#bac8ff";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        style={trashBtnStyle}
                        title="Remove"
                        onClick={() => {
                          actions.removeInstructor(i.id);
                          showToast("Instructor removed");
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--danger-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--danger)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Classes ── */}
      <div className="card">
        <h2>Classes (Year &amp; Block)</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Year</label>
            <select
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
            >
              {["1", "2", "3", "4"].map((y) => (
                <option key={y} value={y}>
                  {YEAR_LABELS[y]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Block</label>
            <input
              type="text"
              placeholder="e.g. 1, 2, 3"
              value={classBlock}
              onChange={(e) => setClassBlock(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" onClick={handleAddClass}>
              Add Class
            </button>
          </div>
        </div>
        <div className="list-container">
          {state.classes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No classes added yet.
            </p>
          ) : (
            state.classes.map((c) => (
              <div className="list-item" key={c.id}>
                {editingClass === c.id ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flex: 1,
                        marginRight: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <select
                        style={{ ...inlineInput, minWidth: 110 }}
                        value={editClassYear}
                        onChange={(e) => setEditClassYear(e.target.value)}
                      >
                        {["1", "2", "3", "4"].map((y) => (
                          <option key={y} value={y}>
                            {YEAR_LABELS[y]}
                          </option>
                        ))}
                      </select>
                      <input
                        style={{ ...inlineInput, width: 80 }}
                        placeholder="Block"
                        value={editClassBlock}
                        onChange={(e) => setEditClassBlock(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveClass(c.id);
                          if (e.key === "Escape") setEditingClass(null);
                        }}
                        autoFocus
                      />
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={saveBtnStyle}
                        title="Save"
                        onClick={() => saveClass(c.id)}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        style={cancelBtnStyle}
                        title="Cancel"
                        onClick={() => setEditingClass(null)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="list-item-info">
                      <div className="list-item-title">
                        BSIT {c.year} - BLOCK {c.block}
                      </div>
                      <div className="list-item-sub">
                        {c.year}
                        {YEAR_SUFFIX[parseInt(c.year) - 1]} Year — Block{" "}
                        {c.block}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={editBtnStyle}
                        title="Edit"
                        onClick={() => {
                          setEditingClass(c.id);
                          setEditClassYear(c.year);
                          setEditClassBlock(c.block);
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--primary-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--primary)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#bac8ff";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        style={trashBtnStyle}
                        title="Remove"
                        onClick={() => {
                          actions.removeClass(c.id);
                          showToast("Class removed");
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--danger-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--danger)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Rooms ── */}
      <div className="card">
        <h2>Rooms</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Room Name / Number</label>
            <input
              type="text"
              placeholder="e.g. Room 26"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
            >
              <option value="hybrid">Hybrid (Lecture + Laboratory)</option>
              <option value="lecture">Lecture Only</option>
            </select>
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" onClick={handleAddRoom}>
              Add Room
            </button>
          </div>
        </div>
        <div className="list-container">
          {state.rooms.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No rooms added yet.
            </p>
          ) : (
            state.rooms.map((r) => (
              <div className="list-item" key={r.id}>
                {editingRoom === r.id ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flex: 1,
                        marginRight: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        style={{ ...inlineInput, flex: 1, minWidth: 100 }}
                        placeholder="Room name"
                        value={editRoomName}
                        onChange={(e) => setEditRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRoom(r.id);
                          if (e.key === "Escape") setEditingRoom(null);
                        }}
                        autoFocus
                      />
                      <select
                        style={{ ...inlineInput, minWidth: 160 }}
                        value={editRoomType}
                        onChange={(e) =>
                          setEditRoomType(e.target.value as RoomType)
                        }
                      >
                        <option value="hybrid">Hybrid</option>
                        <option value="lecture">Lecture Only</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={saveBtnStyle}
                        title="Save"
                        onClick={() => saveRoom(r.id)}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        style={cancelBtnStyle}
                        title="Cancel"
                        onClick={() => setEditingRoom(null)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="list-item-info">
                      <div className="list-item-title">{r.name}</div>
                      <div className="list-item-sub">
                        {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={editBtnStyle}
                        title="Edit"
                        onClick={() => {
                          setEditingRoom(r.id);
                          setEditRoomName(r.name);
                          setEditRoomType(r.type);
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--primary-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--primary)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#bac8ff";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        style={trashBtnStyle}
                        title="Remove"
                        onClick={() => {
                          actions.removeRoom(r.id);
                          showToast("Room removed");
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--danger-soft)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--danger)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Course Catalog ── */}
      <div className="card">
        <h2>Course Catalog</h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          Define reusable course codes and descriptions here. They will appear
          as dropdowns in the Courses tab.
        </p>
        <div className="form-grid">
          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              placeholder="e.g. CS101"
              value={catalogCode}
              onChange={(e) => setCatalogCode(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Course Description</label>
            <input
              type="text"
              placeholder="e.g. Programming Fundamentals"
              value={catalogDesc}
              onChange={(e) => setCatalogDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCatalog()}
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" onClick={handleAddCatalog}>
              Add to Catalog
            </button>
          </div>
        </div>
        <div className="list-container">
          {state.catalog.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No catalog entries yet.
            </p>
          ) : (
            state.catalog.map((e) => (
              <div className="list-item" key={e.code}>
                {editingCatalog === e.code ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flex: 1,
                        marginRight: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        style={{ ...inlineInput, width: 100 }}
                        placeholder="Code"
                        value={editCatalogCode}
                        onChange={(ev) => setEditCatalogCode(ev.target.value)}
                        autoFocus
                        onKeyDown={(ev) => {
                          if (ev.key === "Escape") setEditingCatalog(null);
                        }}
                      />
                      <input
                        style={{ ...inlineInput, flex: 1, minWidth: 160 }}
                        placeholder="Description"
                        value={editCatalogDesc}
                        onChange={(ev) => setEditCatalogDesc(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") saveCatalog(e.code);
                          if (ev.key === "Escape") setEditingCatalog(null);
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={saveBtnStyle}
                        title="Save"
                        onClick={() => saveCatalog(e.code)}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        style={cancelBtnStyle}
                        title="Cancel"
                        onClick={() => setEditingCatalog(null)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="list-item-info">
                      <div className="list-item-title">{e.code}</div>
                      <div className="list-item-sub">{e.description}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={editBtnStyle}
                        title="Edit"
                        onClick={() => {
                          setEditingCatalog(e.code);
                          setEditCatalogCode(e.code);
                          setEditCatalogDesc(e.description);
                        }}
                        onMouseEnter={(ev) => {
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.background = "var(--primary-soft)";
                          (ev.currentTarget as HTMLButtonElement).style.color =
                            "var(--primary)";
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#bac8ff";
                        }}
                        onMouseLeave={(ev) => {
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (ev.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        style={trashBtnStyle}
                        title="Remove"
                        onClick={() => {
                          actions.removeCatalogEntry(e.code);
                          showToast(`"${e.code}" removed`);
                        }}
                        onMouseEnter={(ev) => {
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.background = "var(--danger-soft)";
                          (ev.currentTarget as HTMLButtonElement).style.color =
                            "var(--danger)";
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(ev) => {
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (ev.currentTarget as HTMLButtonElement).style.color =
                            "var(--text-muted)";
                          (
                            ev.currentTarget as HTMLButtonElement
                          ).style.borderColor = "transparent";
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
