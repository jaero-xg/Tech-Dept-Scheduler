// Header.tsx
type TabId = "setup" | "courses" | "schedule";

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "courses", label: "Courses" },
  { id: "schedule", label: "Schedule" },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header>
      <div className="school-logo-name">
        <img
          id="header-logo-img"
          src="IT DEpt Logo.png"
          alt="IT Department Logo"
        />
        <h1>Technology Department Mini-Scheduler</h1>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
