"use client";

import { useEffect, useState } from "react";

const iconPaths = {
  home: "M3 10 12 3l9 7v11h-7v-7h-4v7H3z",
  book: "M12 5Q7 2 2 5v15q5-3 10 0 5-3 10 0V5q-5-3-10 0Zm0 0v15",
  map: "m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3Zm6-3v17m6-14v17",
  play: "m10 8 6 4-6 4zM5 3h14q2 0 2 2v14q0 2-2 2H5q-2 0-2-2V5q0-2 2-2Z",
  route: "M6 7v8q0 3 3 3h3m-3-13h7q4 0 4 4t-4 4h-3M6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  compare: "M7 3v18m-4-4 4 4 4-4M17 21V3m-4 4 4-4 4 4",
  lab: "M9 3h6m-5 0v7L3 21h18l-7-11V3M7 15h10",
  chart: "M3 3v18h18M7 16v-5m5 5V6m5 10V3",
  star: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z",
  cup: "M7 3h10v7q0 5-5 5t-5-5ZM7 5H3v3q0 4 5 4m9-7h4v3q0 4-5 4m-4 3v6m-4 0h8",
};

type IconName = keyof typeof iconPaths;

const navItems: [string, string, IconName][] = [
  ["beranda", "Beranda", "home"],
  ["kenalan", "Kenalan dengan RLS", "book"],
  ["jelajah", "Jelajah peta", "map"],
  ["kalkulator", "Perjalananmu", "route"],
  ["banding", "Bandingkan provinsi", "compare"],
  ["simulator", "Laboratorium kebijakan", "lab"],
  ["statistika", "Bermain dengan angka", "chart"],
  ["kuis", "Tantangan kuis", "star"],
  ["papan-peringkat", "Papan peringkat", "cup"],
];

function NavIcon({ name }: { name: IconName }) {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
};

export default function Sidebar({ collapsed, onToggle, active }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <div className="mobile-navigation">
        <a href="#beranda" className="brand">
          setara.
        </a>
        <button
          aria-expanded={mobileOpen}
          aria-controls="exploration-sidebar"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "Tutup menu" : "Menu jelajah"} <span aria-hidden="true">{mobileOpen ? "×" : "☰"}</span>
        </button>
      </div>
      {mobileOpen && (
        <button className="sidebar-backdrop" aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        id="exploration-sidebar"
        className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <a href="#beranda" className="brand" aria-label="Setara, beranda">
            <span className="route-brand">
              <NavIcon name="route" />
            </span>
            <span className="sidebar-wordmark">
              setara<span>.</span>
              <small>Setiap mimpi punya jalan</small>
            </span>
          </a>
          <button
            className="sidebar-toggle"
            aria-label={collapsed ? "Perluas sidebar" : "Ringkas sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggle}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M9 4v16m7-11-3 3 3 3" />
            </svg>
          </button>
        </div>
        <div className="sidebar-group-label">RUANG EKSPLORASI</div>
        <nav aria-label="Navigasi ruang eksplorasi">
          {navItems.map(([id, label, icon], index) => (
            <div key={id}>
              {index === 7 && <div className="sidebar-group-label action-label">SAATNYA IKUT AKSI</div>}
              <a
                href={`#${id}`}
                title={collapsed ? label : undefined}
                className={active === id ? "is-active" : ""}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <NavIcon name={icon} />
                <span className="nav-label">{label}</span>
                {id === "kuis" && <small className="nav-badge">15 soal</small>}
                {active === id && <i className="nav-active-dot" />}
              </a>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
