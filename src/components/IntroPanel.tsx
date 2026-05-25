import { useEffect, useState } from "react";
import { getAcademicYear } from "../utils/useAcademicYear";

interface IntroPanelProps {
  onEnter: () => void;
}

export default function IntroPanel({ onEnter }: IntroPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const academicYear = getAcademicYear();

  const features = [
    {
      icon: (
        <svg
          width="18"
          height="18"
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
      label: "Manage Faculty & Rooms",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
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
      label: "Build Weekly Schedules",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      label: "Detect Conflicts Instantly",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
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
      label: "Export & Print Ready",
    },
  ];

  return (
    <>
      <style>{`
        .intro-root {
          position: fixed;
          inset: 0;
          z-index: 500;
          display: flex;
          flex-direction: row;
          overflow: hidden;
          background: var(--bg, #f9f9f8);
        }

        /* ── Left logo panel ── */
        .intro-left {
          width: 42%;
          min-width: 220px;
          background: #800000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 36px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .intro-logo {
          opacity: 0;
          transform: scale(0.88);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.3,0.64,1);
        }
        .intro-logo.visible {
          opacity: 1;
          transform: scale(1);
        }

        .intro-logo img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.35));
          display: block;
        }

        .intro-uni {
          margin-top: 28px;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
        }
        .intro-uni.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-uni-eyebrow {
          color: rgba(255,255,255,0.5);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-display, 'Geist', system-ui, sans-serif);
          margin: 0;
        }

        .intro-uni-name {
          color: rgba(255,255,255,0.85);
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          margin-top: 4px;
        }

        /* ── Right content panel ── */
        .intro-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 60px;
          overflow: auto;
        }

        .intro-eyebrow-wrap {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s;
        }
        .intro-eyebrow-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffe8e8;
          color: #800000;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: var(--radius-sm, 6px);
          border: 1px solid #800000;
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          margin-bottom: 20px;
        }

        .intro-headline-wrap {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s;
        }
        .intro-headline-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-h1 {
          font-family: var(--font-display, 'Geist', system-ui, sans-serif);
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          color: var(--text, #18181b);
          line-height: 1.12;
          margin: 0 0 14px;
        }

        .intro-h1 span { color: #800000; }

        .intro-desc {
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          font-size: 0.97rem;
          font-weight: 400;
          color: var(--text-muted, #71717a);
          line-height: 1.7;
          margin: 0 0 36px;
          max-width: 400px;
        }

        /* ── Feature grid ── */
        .intro-features-wrap {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease 0.28s, transform 0.5s ease 0.28s;
          margin-bottom: 44px;
          max-width: 440px;
        }
        .intro-features-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 20px;
        }

        .intro-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md, 10px);
          background: var(--card, #ffffff);
          border: 1px solid var(--border, #ebebea);
          box-shadow: var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04));
        }

        .intro-feature-icon { color: #800000; flex-shrink: 0; }

        .intro-feature-label {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text, #18181b);
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          line-height: 1.3;
        }

        /* ── CTA ── */
        .intro-cta-wrap {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease 0.38s, transform 0.5s ease 0.38s;
        }
        .intro-cta-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 28px;
          background: #800000;
          color: #fff;
          border: none;
          border-radius: var(--radius-md, 10px);
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s;
        }
        .intro-cta-btn:hover {
          background: #6b0000;
          transform: translateY(-1px);
        }

        .intro-cta-note {
          margin-top: 14px;
          font-size: 0.75rem;
          color: var(--text-subtle, #a1a1aa);
          font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
        }

        /* ── Responsive: tablet (≤ 768px) ── */
        @media (max-width: 768px) {
          .intro-root {
            flex-direction: column;
          }

          .intro-left {
            width: 100%;
            min-width: unset;
            padding: 36px 24px 28px;
            flex-direction: row;
            justify-content: center;
            gap: 20px;
          }

          .intro-logo img {
            width: 72px;
            height: 72px;
          }

          .intro-uni {
            margin-top: 0;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .intro-right {
            padding: 32px 24px 40px;
            justify-content: flex-start;
          }

          .intro-h1 {
            font-size: clamp(1.6rem, 5vw, 2.2rem);
          }

          .intro-desc {
            font-size: 0.9rem;
            margin-bottom: 28px;
          }

          .intro-features {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .intro-features-wrap {
            margin-bottom: 32px;
          }
        }

        /* ── Responsive: mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          .intro-left {
            padding: 24px 16px 20px;
            gap: 14px;
          }

          .intro-logo img {
            width: 52px;
            height: 52px;
          }

          .intro-uni-eyebrow {
            font-size: 0.6rem;
          }

          .intro-uni-name {
            font-size: 0.75rem;
          }

          .intro-right {
            padding: 24px 16px 36px;
          }

          .intro-h1 {
            font-size: 1.65rem;
          }

          .intro-features {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .intro-cta-btn {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }
        }
      `}</style>

      <div className="intro-root">
        {/* ── Left: Logo panel ── */}
        <div className="intro-left">
          <div className={`intro-logo${visible ? " visible" : ""}`}>
            <img
              src="IT DEpt Logo.png"
              alt="Technology Education Department logo"
            />
          </div>

          <div className={`intro-uni${visible ? " visible" : ""}`}>
            <p className="intro-uni-eyebrow">Romblon State University</p>
            <p className="intro-uni-name">Technology Department</p>
          </div>
        </div>

        {/* ── Right: Content panel ── */}
        <div className="intro-right">
          {/* Eyebrow badge */}
          <div className={`intro-eyebrow-wrap${visible ? " visible" : ""}`}>
            <span className="intro-badge">{academicYear}</span>
          </div>

          {/* Headline + description */}
          <div className={`intro-headline-wrap${visible ? " visible" : ""}`}>
            <h1 className="intro-h1">
              Tech Dept
              <br />
              <span>Mini-Scheduler</span>
            </h1>
            <p className="intro-desc">
              A lightweight scheduling tool for faculty, rooms, and courses —
              built for the Technology Education Department.
            </p>
          </div>

          {/* Feature grid */}
          <div className={`intro-features-wrap${visible ? " visible" : ""}`}>
            <div className="intro-features">
              {features.map((f) => (
                <div key={f.label} className="intro-feature-item">
                  <span className="intro-feature-icon">{f.icon}</span>
                  <span className="intro-feature-label">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`intro-cta-wrap${visible ? " visible" : ""}`}>
            <button className="intro-cta-btn" onClick={onEnter}>
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <p className="intro-cta-note">
              Data is saved locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
