"use client";

import { useEffect, useState } from "react";
import { formatRls, provinces } from "@/data/provinces";
import { rlsData } from "@/data/rls";

type Concept = "min" | "max" | "mean" | "range";

const concepts: [Concept, string, string][] = [
  ["min", "Minimum", "Nilai terendah"],
  ["max", "Maksimum", "Nilai tertinggi"],
  ["mean", "Rata-rata", "Rata-rata sederhana"],
  ["range", "Rentang", "Rentang antarprovinsi"],
];

const shortLabel: Record<Concept, string> = { min: "Min", max: "Max", mean: "Mean", range: "Range" };

export default function Statistics() {
  const [page, setPage] = useState(0);
  const [showNational, setShowNational] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 760px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const onChange = () => {
      setIsMobile(query.matches);
      setPage(0);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const perPage = isMobile ? 4 : 8;
  const pageCount = Math.ceil(provinces.length / perPage);
  const [concept, setConcept] = useState<Concept>("range");
  const [picked, setPicked] = useState<string | null>(null);

  const values = provinces.map((p) => p.rls);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const minNames = provinces.filter((p) => p.rls === min).map((p) => p.name).join(", ");
  const maxNames = provinces.filter((p) => p.rls === max).map((p) => p.name).join(", ");
  const value = concept === "min" ? min : concept === "max" ? max : concept === "range" ? max - min : mean;
  const explanation =
    concept === "min"
      ? `Nilai terendah terdapat di ${minNames}. Ini menggambarkan kondisi pendidikan, bukan kemampuan penduduknya.`
      : concept === "max"
        ? `Nilai tertinggi terdapat di ${maxNames}. Bukan berarti setiap penduduk menempuh pendidikan selama itu.`
        : concept === "mean"
          ? "Jumlah RLS seluruh 38 provinsi dibagi 38. Setiap provinsi memiliki bobot sama; hasilnya bukan RLS nasional."
          : `Selisih nilai tertinggi dan terendah: ${formatRls(max)} − ${formatRls(min)} = ${formatRls(max - min)} tahun. Makin lebar rentangnya, makin besar jarak antarujung data.`;

  return (
    <>
      <div className="statistics-top">
        <p>38 provinsi · RLS BPS 2025 · Satuan tahun</p>
        <span>Sentuh konsep, lalu telusuri batangnya.</span>
      </div>
      <div className="statistics-view-tabs">
        <button className={showNational ? "" : "active"} aria-pressed={!showNational} onClick={() => setShowNational(false)}>
          Grafik provinsi
        </button>
        <button className={showNational ? "active" : ""} aria-pressed={showNational} onClick={() => setShowNational(true)}>
          Mengapa berbeda dari nasional?
        </button>
      </div>
      {!showNational && (
        <>
          <div className="stat-concepts" aria-label="Pilih konsep statistika">
            {concepts.map(([key, label]) => (
              <button
                key={key}
                className={concept === key ? "active" : ""}
                aria-pressed={concept === key}
                onClick={() => {
                  setConcept(key);
                  if (key === "min" || key === "max") {
                    const index = provinces.findIndex((p) => p.rls === (key === "min" ? min : max));
                    setPage(Math.floor(index / perPage));
                  }
                }}
              >
                {label}
                <small>{shortLabel[key]}</small>
              </button>
            ))}
          </div>
          <div className="stat-summary" aria-live="polite">
            <span>{concepts.find(([key]) => key === concept)?.[2]}</span>
            <h3>
              {formatRls(value)} <span>tahun</span>
            </h3>
            <p>{explanation}</p>
          </div>
          <div className="horizontal-chart" aria-label="Grafik batang RLS 38 provinsi tahun 2025">
            {provinces.slice(page * perPage, (page + 1) * perPage).map((p) => {
              const extreme =
                (concept === "min" && p.rls === min) ||
                (concept === "max" && p.rls === max) ||
                (concept === "range" && (p.rls === min || p.rls === max));
              return (
                <button
                  key={p.code}
                  className={`province-bar ${extreme ? "is-extreme" : ""} ${picked === p.name ? "is-picked" : ""}`}
                  onClick={() => setPicked(p.name)}
                  aria-pressed={picked === p.name}
                  aria-label={`${p.name}, ${formatRls(p.rls)} tahun${extreme ? ", nilai batas" : ""}`}
                >
                  <span className="bar-province-name">{p.name}</span>
                  <span className="horizontal-track">
                    <span style={{ width: `${(p.rls / 12) * 100}%` }} />
                  </span>
                  <strong>{formatRls(p.rls)}</strong>
                </button>
              );
            })}
          </div>
          <div className="chart-caption">
            <span>Skala seluruh batang: 0–12 tahun. Nilai ditampilkan dengan dua desimal.</span>
            <strong aria-live="polite">
              {picked
                ? `${picked}: ${formatRls(provinces.find((p) => p.name === picked)!.rls)} tahun`
                : "Pilih batang untuk menandai provinsi."}
            </strong>
          </div>
          <div className="chart-pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              ← Sebelumnya
            </button>
            <span>
              {page * perPage + 1}–{Math.min((page + 1) * perPage, 38)} dari 38 provinsi{" "}
              <small>
                Halaman {page + 1} / {pageCount}
              </small>
            </span>
            <button disabled={page === pageCount - 1} onClick={() => setPage(page + 1)}>
              Berikutnya →
            </button>
          </div>
        </>
      )}
      {showNational && (
        <div className="national-explainer">
          <div>
            <span>RATA-RATA SEDERHANA 38 PROVINSI</span>
            <strong>
              {formatRls(mean)} <small>tahun</small>
            </strong>
            <p>Setiap provinsi diberi bobot yang sama.</p>
          </div>
          <span className="not-equal" aria-label="berbeda dengan">
            ≠
          </span>
          <div>
            <span>RLS NASIONAL BPS 2025</span>
            <strong>
              {formatRls(rlsData.national)} <small>tahun</small>
            </strong>
            <p>Dibobot menurut jumlah penduduk usia 25 tahun ke atas, bukan rata-rata sederhana provinsi.</p>
          </div>
        </div>
      )}
      <p className="source-credit">
        Sumber:{" "}
        <a href={rlsData.url} target="_blank" rel="noreferrer">
          BPS — {rlsData.title}, 2025 ↗
        </a>
        . Pembaruan tabel: 5 November 2025. Hasil olah data menggunakan seluruh nilai dua desimal, dibulatkan hanya saat
        ditampilkan.
      </p>
    </>
  );
}
