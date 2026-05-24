import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./hooks/useToast";
import { usePWA } from "./hooks/usePWA";
import Header from "./components/Header";
import SetupPanel from "./components/SetupPanel";
import CoursesPanel from "./components/CoursesPanel";
import SchedulePanel from "./components/SchedulePanel";

export type TabId = "setup" | "courses" | "schedule";

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("setup");
  const { canInstall, triggerInstall, dismissInstall } = usePWA();

  return (
    <div className="container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <SetupPanel isActive={activeTab === "setup"} />
      <CoursesPanel isActive={activeTab === "courses"} />
      <SchedulePanel isActive={activeTab === "schedule"} />

      {canInstall && (
        <div id="pwa-banner">
          <div id="pwa-banner-inner">
            <div id="pwa-banner-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <div>
                <div id="pwa-banner-title">Install Tech Scheduler</div>
                <div id="pwa-banner-sub">
                  Add to your home screen for quick access — works offline too.
                </div>
              </div>
            </div>
            <div id="pwa-banner-actions">
              <button id="pwa-install-btn" onClick={triggerInstall}>
                Install App
              </button>
              <button id="pwa-dismiss-btn" onClick={dismissInstall}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}
