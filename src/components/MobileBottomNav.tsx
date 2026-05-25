import { type ReactNode } from "react";
import type { TabId } from "../App";

interface MobileBottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
}: MobileBottomNavProps) {
  const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
    {
      id: "setup",
      label: "Setup",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "courses",
      label: "Courses",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 90;
            background: var(--card);
            border-top: 1px solid var(--border);
            box-shadow: 0 -4px 24px rgba(0,0,0,0.07);
            height: 64px;
          }

          .mob-nav-btn {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            border: none;
            background: none;
            color: var(--text-subtle);
            font-family: var(--font-body);
            font-size: 0.68rem;
            font-weight: 500;
            letter-spacing: 0.02em;
            cursor: pointer;
            padding: 8px 4px;
            transition: color 0.15s;
            position: relative;
          }

          .mob-nav-btn svg {
            width: 22px;
            height: 22px;
            stroke: currentColor;
            transition: stroke 0.15s;
          }

          .mob-nav-btn span {
            line-height: 1;
          }

          .mob-nav-btn.active {
            color: #800000;
          }

          .mob-nav-btn:not(.active):hover {
            color: var(--text-muted);
          }

          .container {
            padding-bottom: 80px;
          }
        }

        @media (max-width: 600px) {
          .mob-nav-btn svg {
            width: 20px;
            height: 20px;
          }

          .mob-nav-btn {
            font-size: 0.65rem;
          }
        }
      `}</style>

      <nav className="mobile-bottom-nav" id="mobile-bottom-nav">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`mob-nav-btn${activeTab === id ? " active" : ""}`}
            onClick={() => onTabChange(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
