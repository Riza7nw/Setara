"use client";

import { useEffect, useState } from "react";

const scenes: [string, string][][] = [
  [
    ["Dua anak. Satu mimpi.", "Nara dan Bima sama-sama ingin menjadi guru."],
    ["Jarak yang tidak sama.", "Nara berjalan ke sekolah. Bima perlu menyeberangi sungai."],
    ["Dukungan membuka jalan.", "Mimpi sama kuat, kebutuhan dukungannya berbeda."],
  ],
  [
    ["Apa arti 9 tahun?", "RLS merangkum lama pendidikan formal, bukan umur seseorang."],
    ["Rata-rata bukan semua orang.", "Ada yang bersekolah lebih lama, ada yang lebih singkat."],
    ["Angka bukan batas.", "RLS tidak mengukur kecerdasan dan tidak meramalkan masa depan."],
  ],
  [
    ["Bagaimana jika hambatannya berkurang?", "Bus sekolah bisa membuat perjalanan lebih terjangkau."],
    ["Biaya lebih ringan, jalan lebih terbuka.", "Beasiswa dan dukungan guru bisa membantu keberlanjutan belajar."],
    ["Dampak perlu dibuktikan.", "Data dan evaluasi nyata membantu kita memahami perubahan."],
  ],
];

export default function StoryScene({ story, active = true }: { story: number; active?: boolean }) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  useEffect(() => {
    setScene(0);
    setPlaying(false);
  }, [story]);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (scene < 2) setScene(scene + 1);
      else setPlaying(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, [playing, scene]);

  return (
    <div className={`story-player scene-${story}`}>
      <div className="player-top">
        <span>CERITA VISUAL · TANPA SUARA</span>
        <span>{scene + 1} / 3</span>
      </div>
      <div className="scene-landscape" aria-hidden="true">
        <div className="scene-sun" />
        <div className="scene-road" />
        <div className="scene-school">
          <span>SEKOLAH</span>
          <i />
          <i />
          <i />
        </div>
        <div className="scene-person">
          <i />
          <b />
        </div>
        <div className="scene-person second">
          <i />
          <b />
        </div>
      </div>
      <div className="scene-caption" aria-live="polite">
        <h3>{scenes[story][scene][0]}</h3>
        <p>{scenes[story][scene][1]}</p>
      </div>
      <div className="player-controls">
        <button
          onClick={() => {
            if (scene === 2 && !playing) setScene(0);
            setPlaying(!playing);
          }}
          aria-label={playing ? "Jeda cerita" : "Putar cerita"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="m7 4 14 8-14 8z" />}
          </svg>
          {playing ? "Jeda" : "Putar cerita"}
        </button>
        <div className="scene-steps">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={scene === i ? "current" : ""}
              aria-label={`Adegan ${i + 1}`}
              aria-pressed={scene === i}
              onClick={() => {
                setScene(i);
                setPlaying(false);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <span>± 17 detik</span>
      </div>
    </div>
  );
}
