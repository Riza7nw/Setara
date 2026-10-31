"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Sidebar from "./Sidebar";
import StoryScene from "./StoryScene";
import Statistics from "./Statistics";
import { formatRls, provinces } from "@/data/provinces";
import { rlsData } from "@/data/rls";
import { stories } from "@/data/stories";
import { quizQuestions } from "@/data/quiz";
import indonesiaShape from "@/data/indonesia-shape.json";

const screens = [
  "beranda",
  "kenalan",
  "jelajah",
  "kalkulator",
  "banding",
  "simulator",
  "statistika",
  "kuis",
  "papan-peringkat",
];

function hashScreen() {
  const hash = window.location.hash.slice(1);
  return screens.includes(hash) ? hash : "beranda";
}

function useScreenNavigation() {
  const mainRef = useRef<HTMLElement>(null);
  const [screen, setScreen] = useState(hashScreen);

  const scrollToScreen = useCallback((id: string, smooth = true) => {
    const main = mainRef.current;
    const target = document.getElementById(id);
    if (!main || !target) return;
    const top = target.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
    main.scrollTo({
      top,
      behavior:
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : ("instant" as ScrollBehavior),
    });
    target.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    scrollToScreen(hashScreen(), false);

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setScreen(best.target.id);
      },
      { root: main, threshold: [0.55, 0.8] },
    );
    screens.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onHash = () => scrollToScreen(hashScreen());
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const mainTop = main.getBoundingClientRect().top;
        const nearest = screens
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => Boolean(el))
          .sort(
            (a, b) =>
              Math.abs(a.getBoundingClientRect().top - mainTop) - Math.abs(b.getBoundingClientRect().top - mainTop),
          )[0];
        if (nearest && window.location.hash !== `#${nearest.id}`) {
          window.history.replaceState(null, "", `#${nearest.id}`);
        }
      }, 180);
    };

    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onHash);
    window.addEventListener("hashchange", onHash);
    const resizeObserver = new ResizeObserver(() => scrollToScreen(hashScreen(), false));
    resizeObserver.observe(main);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      clearTimeout(timer);
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onHash);
      window.removeEventListener("hashchange", onHash);
    };
  }, [scrollToScreen]);

  const goTo = useCallback(
    (id: string) => {
      if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
      scrollToScreen(id);
    },
    [scrollToScreen],
  );

  return { mainRef, screen, goTo };
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function FlowIcon({ type }: { type: number }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {type === 0 ? (
        <>
          <path d="M5 7h9l2 3 2-3h9v19h-9l-2 2-2-2H5zM16 10v18" />
          <path d="M8 12h5m-5 5h5m6-5h5m-5 5h5" />
        </>
      ) : type === 1 ? (
        <>
          <rect x="7" y="3" width="18" height="26" rx="3" />
          <path d="M11 8h10M11 14h2m5 0h3m-10 5h2m5 0h3m-10 5h2m5 0h3" />
        </>
      ) : type === 2 ? (
        <path d="M6 27V14h7v13m6 0V5h7v22M3 27h26" />
      ) : type === 3 ? (
        <>
          <path d="M6 5v22M16 5v22M26 5v22" />
          <circle cx="6" cy="12" r="3" fill="var(--cream)" />
          <circle cx="16" cy="21" r="3" fill="var(--cream)" />
          <circle cx="26" cy="10" r="3" fill="var(--cream)" />
        </>
      ) : (
        <>
          <path d="M5 25 12 17l6 3 9-14M5 5v23h24" />
          <circle cx="12" cy="17" r="2" />
        </>
      )}
    </svg>
  );
}

type FlowSection = [id: string, number: string, eyebrow: string, title: string, lead: string];

const flowSections: FlowSection[] = [
  ["cerita", "01", "KENALAN DENGAN RLS", "Sebelum membandingkan, kenali artinya.", "Satu ukuran untuk memahami kesempatan. Tiga cerita untuk melihat konteksnya."],
  ["kalkulator", "03", "SEKARANG, TENTANG KAMU", "Mimpimu punya perjalanan sendiri.", "Setelah mengenal daerahmu, coba hubungkan dengan tujuanmu."],
  ["banding", "04", "PERLUAS SUDUT PANDANG", "Beda daerah, beda kesempatan.", "Bukan siapa yang lebih baik. Mari lihat kondisi yang berbeda."],
  ["simulator", "05", "DARI MEMAHAMI KE MENCOBA", "Kalau jalannya kita buka bersama?", "Coba dukungan yang bisa mengurangi hambatan pendidikan."],
  ["statistika", "06", "BACA DATA LEBIH DALAM", "Kenali cara angka bercerita.", "Bongkar rata-rata, temukan variasi yang tersembunyi."],
];

const nextLabels = [
  "Jelajahi peta Indonesia",
  "Lihat dua daerah berdampingan",
  "Coba buka kesempatan",
  "Pahami angka lebih dalam",
  "Uji pemahamanmu",
];

const heroSteps = [
  { years: 6, title: "Langkah awal mengenal dunia.", text: "SD: umumnya 6 tahun pendidikan formal." },
  { years: 9, title: "Rasa ingin tahu terus tumbuh.", text: "SMP: total umumnya 9 tahun sejak masuk SD." },
  { years: 12, title: "Makin dekat dengan pilihanmu.", text: "SMA / SMK: total umumnya 12 tahun sejak SD." },
  { years: 16, title: "Mimpi bisa melangkah lebih jauh.", text: "Sarjana: total umumnya 16 tahun sejak masuk SD." },
];

const heroStepButtons = [
  { cls: "step-one", years: "6", level: "SD", label: "Pilih jenjang SD" },
  { cls: "step-two", years: "9", level: "SMP", label: "Pilih jenjang SMP" },
  { cls: "step-three", years: "12", level: "SMA / SMK", label: "Pilih jenjang SMA atau SMK" },
  { cls: "step-four", years: "16", level: "SARJANA", label: "Pilih jenjang Sarjana" },
];

const supportSliders = [
  ["Bantuan biaya belajar", "Biaya lebih ringan dapat membantu siswa bertahan sekolah."],
  ["Transportasi sekolah", "Perjalanan lebih terjangkau dapat memudahkan kehadiran."],
  ["Dukungan untuk guru", "Guru yang didukung dapat membantu proses belajar."],
];

type Score = { name: string; score: number };

const project = (lon: number, lat: number) => [(lon - 94) * 18, (6.5 - lat) * 18];

const mapPath = (indonesiaShape as number[][][][])
  .map((polygon) =>
    polygon
      .map((ring) => ring.map(([lon, lat], i) => `${i ? "L" : "M"}${project(lon, lat).join(",")}`).join(" ") + " Z")
      .join(" "),
  )
  .join(" ");

function loadScores(): Score[] {
  try {
    return (JSON.parse(localStorage.getItem("setara-scores") || "[]") as Score[])
      .filter((s) => typeof s.name == "string" && Number.isFinite(s.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export default function SetaraApp() {
  const { mainRef, screen, goTo } = useScreenNavigation();
  const [heroStep, setHeroStep] = useState(2);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [storyFormat, setStoryFormat] = useState<"visual" | "baca">("visual");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapProvince, setMapProvince] = useState(12);
  const [modal, setModal] = useState<string | null>(null);
  const [story, setStory] = useState(0);
  const [compareA, setCompareA] = useState(10);
  const [compareB, setCompareB] = useState(37);
  const [nickname, setNickname] = useState("");
  const [homeProvince, setHomeProvince] = useState(12);
  const [goalYears, setGoalYears] = useState(12);
  const [goalAge, setGoalAge] = useState(18);
  const [journeyShown, setJourneyShown] = useState(false);
  const [support, setSupport] = useState([0, 0, 0]);
  const [quizName, setQuizName] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [scores, setScores] = useState<Score[]>(loadScores);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);

  const open = (target: string | null) => {
    if (target === "peringkat") {
      setModal(target);
      return;
    }
    setModal(null);
    if (target) goTo(target === "cerita" ? "kenalan" : target);
  };

  const resetQuiz = () => {
    setQuestion(0);
    setPoints(0);
    setAnswer(null);
    setQuizDone(false);
    setQuizStarted(false);
  };

  const selected = provinces[mapProvince];

  const renderTool = (tool: string) => (
    <>
      {tool === "cerita" && (
        <>
          <div className="eyebrow">CERITA {story + 1} DARI 3 · BACA ATAU PUTAR CERITA</div>
          <h2>{stories[story].title}</h2>
          <div className="story-tabs">
            {stories.map((s, i) => (
              <button key={s.tag} className={story === i ? "active" : ""} onClick={() => setStory(i)}>
                {i + 1}. {s.tag}
              </button>
            ))}
          </div>
          <div className="story-format-tabs">
            <button
              className={storyFormat === "visual" ? "active" : ""}
              aria-pressed={storyFormat === "visual"}
              onClick={() => setStoryFormat("visual")}
            >
              Putar cerita visual
            </button>
            <button
              className={storyFormat === "baca" ? "active" : ""}
              aria-pressed={storyFormat === "baca"}
              onClick={() => setStoryFormat("baca")}
            >
              Baca naskah
            </button>
          </div>
          {storyFormat === "visual" && <StoryScene story={story} active={screen === "kenalan"} />}
          {storyFormat === "baca" && (
            <>
              <div className="reading-label">LEBIH SUKA MEMBACA? INI CERITANYA.</div>
              <p className="story-text">{stories[story].text}</p>
            </>
          )}
          <button className="button primary" onClick={() => (story < 2 ? setStory(story + 1) : open("jelajah"))}>
            {story < 2 ? "Cerita berikutnya" : "Lanjut jelajah peta"} <Arrow />
          </button>
        </>
      )}
      {tool === "kalkulator" && (
        <>
          <h2>Sejauh apa mimpimu?</h2>
          <p>Tujuanmu adalah milikmu. Data membantu memberi konteks, bukan menentukan batas.</p>
          <form
            hidden={journeyShown}
            onSubmit={(e) => {
              e.preventDefault();
              setJourneyShown(true);
            }}
            className="form-grid"
          >
            <label>
              Nama panggilan
              <input
                required
                maxLength={30}
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setJourneyShown(false);
                }}
                placeholder="Siapa namamu?"
              />
            </label>
            <label>
              Provinsi asal
              <select
                value={homeProvince}
                onChange={(e) => {
                  setHomeProvince(+e.target.value);
                  setJourneyShown(false);
                }}
              >
                {provinces.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tujuan pendidikan
              <select
                value={goalYears}
                onChange={(e) => {
                  setGoalYears(+e.target.value);
                  setJourneyShown(false);
                }}
              >
                <option value={6}>SD · 6 tahun</option>
                <option value={9}>SMP · 9 tahun</option>
                <option value={12}>SMA / SMK · 12 tahun</option>
                <option value={15}>Diploma III · 15 tahun</option>
                <option value={16}>Sarjana · 16 tahun</option>
                <option value={18}>Magister · 18 tahun</option>
              </select>
            </label>
            <label>
              Target umur lulus
              <input
                required
                type="number"
                min="6"
                max="100"
                value={goalAge}
                onChange={(e) => {
                  setGoalAge(+e.target.value);
                  setJourneyShown(false);
                }}
              />
            </label>
            <button className="button primary">
              {"Lihat perjalananku "}
              <Arrow />
            </button>
          </form>
          {journeyShown && (
            <div className="result">
              <h3>{nickname}, jalanmu masih terbuka.</h3>
              <p>
                Targetmu setara estimasi <strong>{goalYears} tahun pendidikan formal</strong>, dengan target lulus usia{" "}
                {goalAge} tahun. RLS BPS 2025 {provinces[homeProvince].name} adalah {formatRls(provinces[homeProvince].rls)}{" "}
                tahun.
              </p>
              <strong>
                Selisih lama pendidikan: {formatRls(Math.abs(goalYears - provinces[homeProvince].rls))} tahun{" "}
                {goalYears >= provinces[homeProvince].rls ? "di atas" : "di bawah"} RLS daerah.
              </strong>
              <p>
                Umur lulus tidak dipakai dalam perbandingan. Durasi jenjang adalah estimasi umum tanpa mengulang kelas. Ini
                bukan ramalan kemampuan atau masa depanmu.
              </p>
              <button className="text-button" onClick={() => setJourneyShown(false)}>
                {"Ubah tujuan pendidikanku "}
                <Arrow />
              </button>
            </div>
          )}
        </>
      )}
      {tool === "banding" && (
        <>
          <h2>Dua daerah. Dua realitas.</h2>
          <p>Bandingkan kondisi dan kesempatan pendidikan, bukan kecerdasan penduduk.</p>
          <div className="form-grid">
            {[compareA, compareB].map((value, slot) => (
              <label key={slot}>
                {"Provinsi "}
                {slot === 0 ? "pertama" : "kedua"}
                <select
                  value={value}
                  onChange={(e) => (slot === 0 ? setCompareA(+e.target.value) : setCompareB(+e.target.value))}
                >
                  {provinces.map((p, i) => (
                    <option key={p.name} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="comparison">
            {[compareA, compareB].map((value, slot) => (
              <div key={slot} className="bar-row">
                <div>
                  <strong>{provinces[value].name}</strong>
                  <span>{formatRls(provinces[value].rls)} tahun</span>
                </div>
                <div className="bar-track">
                  <div style={{ width: `${(provinces[value].rls / 12) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="result">
            <span>SELISIH RLS · BPS 2025</span>
            <h2>
              {formatRls(Math.abs(provinces[compareA].rls - provinces[compareB].rls))} <small>tahun</small>
            </h2>
            <p>
              Angka berbeda mengajak kita melihat akses, biaya, dan dukungan yang tersedia. Angka ini tidak menjelaskan
              penyebab secara langsung.
            </p>
          </div>
        </>
      )}
      {tool === "simulator" && (
        <>
          <h2>Buka lebih banyak jalan.</h2>
          <p>Geser dukungan dan lihat cara model sederhana ini merespons.</p>
          <div className="simulation-number">
            <span>{formatRls(8 + support[0] * 0.006 + support[1] * 0.004 + support[2] * 0.005)}</span> tahun{" "}
            <small>Indikator RLS BPS 2025 · awal 8,0 tahun</small>
          </div>
          {supportSliders.map(([label, hint], i) => (
            <label key={label} className="range-label">
              <span>
                {label}
                <strong>{support[i]}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={support[i]}
                onChange={(e) => setSupport(support.map((v, j) => (j === i ? +e.target.value : v)))}
              />
              <small>{hint}</small>
            </label>
          ))}
          <div className="notice">
            <strong>Model pembelajaran sederhana, bukan prediksi resmi.</strong>
            <p>
              Rumus ilustratif: 8 + 0,006 × biaya + 0,004 × transportasi + 0,005 × guru. Bobot dibuat untuk belajar, bukan
              hasil penelitian. Dampak nyata membutuhkan waktu dan evaluasi.
            </p>
          </div>
          <button className="text-button" onClick={() => setSupport([0, 0, 0])}>
            Atur ulang dukungan ↺
          </button>
        </>
      )}
      {tool === "statistika" && <Statistics />}
      {tool === "kuis" && (
        <>
          {quizStarted ? (
            quizDone ? (
              <>
                <div className="eyebrow">PERJALANAN SELESAI</div>
                <h2>Terima kasih, {quizName}.</h2>
                <div className="simulation-number">
                  <span>{points.toLocaleString("id-ID")}</span> / 1.500 poin
                </div>
                <p>
                  Memahami kesempatan pendidikan tidak berhenti di skor. Cerita mana yang ingin kamu bagikan ke temanmu?
                </p>
                <button className="button primary" onClick={resetQuiz}>
                  Coba lagi ↺
                </button>
                <button className="text-button" onClick={() => open("peringkat")}>
                  {"Lihat papan peringkat "}
                  <Arrow />
                </button>
              </>
            ) : (
              <>
                <div className="quiz-progress">
                  <span>
                    SOAL {question + 1} / 15 · CERITA {Math.floor(question / 5) + 1}
                  </span>
                  <strong>{points} poin</strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${((question + 1) / 15) * 100}%` }} />
                </div>
                <h2 className="question">{quizQuestions[question][0]}</h2>
                <div className="answers">
                  {quizQuestions[question][1].map((option, i) => (
                    <button
                      key={option}
                      disabled={answer !== null}
                      className={
                        answer === null ? "" : i === quizQuestions[question][2] ? "correct" : answer === i ? "incorrect" : ""
                      }
                      onClick={() => {
                        setAnswer(i);
                        if (i === quizQuestions[question][2]) setPoints(points + 100);
                      }}
                    >
                      <span>{String.fromCharCode(65 + i)}</span>
                      {option}
                      {answer !== null && i === quizQuestions[question][2] && <b>✓</b>}
                    </button>
                  ))}
                </div>
                {answer !== null && (
                  <div className="result">
                    <strong>
                      {answer === quizQuestions[question][2] ? "Tepat, kamu melihat konteksnya." : "Mari lihat dari sudut lain."}
                    </strong>
                    <p>{quizQuestions[question][3]}</p>
                    <button
                      className="button primary"
                      onClick={() => {
                        if (question < 14) {
                          setQuestion(question + 1);
                          setAnswer(null);
                        } else {
                          const next = [...scores, { name: quizName.trim(), score: points }]
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5);
                          setScores(next);
                          try {
                            localStorage.setItem("setara-scores", JSON.stringify(next));
                          } catch {}
                          setQuizDone(true);
                        }
                      }}
                    >
                      {question === 14 ? "Lihat hasil" : "Soal berikutnya"} <Arrow />
                    </button>
                  </div>
                )}
                <button className="text-button" onClick={resetQuiz}>
                  Mulai ulang kuis ↺
                </button>
              </>
            )
          ) : (
            <>
              <div className="eyebrow">15 SOAL · 3 CERITA · 1.500 POIN</div>
              <h2>Seberapa jauh kamu melihat?</h2>
              <p>Setiap jawaban benar bernilai 100 poin. Baca penjelasannya, tidak perlu terburu-buru.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuizStarted(true);
                }}
              >
                <label>
                  Nama di papan peringkat
                  <input
                    required
                    maxLength={24}
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Nama panggilanmu"
                  />
                </label>
                <p className="local-note">Nama dan skor hanya tersimpan di perangkat ini.</p>
                <button className="button primary">
                  {"Mulai menjawab "}
                  <Arrow />
                </button>
              </form>
            </>
          )}
        </>
      )}
      {tool === "peringkat" && (
        <>
          <h2>Papan rasa ingin tahu.</h2>
          <p>Lima skor tertinggi yang disimpan di perangkat ini.</p>
          {scores.length ? (
            scores.map((s, i) => (
              <div key={i} className="score-row">
                <span>0{i + 1}</span>
                <strong>{s.name}</strong>
                <b>{s.score.toLocaleString("id-ID")} poin</b>
              </div>
            ))
          ) : (
            <div className="result">Belum ada skor. Coba kuis dan buka percakapan baru.</div>
          )}
          <div className="notice">
            Bukan peringkat seluruh pengunjung atau antarperangkat. Penyimpanan dapat hilang jika data peramban dihapus atau
            dibatasi.
          </div>
          <button
            className="button primary"
            onClick={() => {
              resetQuiz();
              open("kuis");
            }}
          >
            {"Ikut mencoba "}
            <Arrow />
          </button>
        </>
      )}
      {tool && tool !== "kuis" && tool !== "cerita" && tool !== "statistika" && tool !== "peringkat" && (
        <p className="local-note">
          Data provinsi: BPS, RLS tahun 2025. Simulator tetap merupakan model pembelajaran sederhana, bukan prediksi resmi.
        </p>
      )}
    </>
  );

  const renderFlow = ([id, number, eyebrow, title, lead]: FlowSection, index: number) => (
    <section key={id} id={id === "cerita" ? "kenalan" : id} tabIndex={-1} className={`flow-section flow-${id}`}>
      <div className="flow-heading">
        <div className="flow-number">{number}</div>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <FlowIcon type={index} />
      </div>
      {id === "cerita" && (
        <div className="lesson-navigation" aria-label="Isi Kenalan dengan RLS">
          <button className={storiesOpen ? "" : "active"} aria-pressed={!storiesOpen} onClick={() => setStoriesOpen(false)}>
            Apa itu RLS?
          </button>
          <button className={storiesOpen ? "active" : ""} aria-pressed={storiesOpen} onClick={() => setStoriesOpen(true)}>
            {"Tiga cerita tentang kesempatan "}
            <span>01–03</span>
          </button>
        </div>
      )}
      {id === "cerita" && !storiesOpen && (
        <div className="rls-intro-panel">
          <div>
            <span className="eyebrow">APA ITU RLS?</span>
            <h3>Lama sekolah. Bukan usia lulus.</h3>
            <p>
              <strong>Rata-rata Lama Sekolah (RLS)</strong> menunjukkan rata-rata tahun pendidikan formal yang telah
              ditempuh penduduk <strong>usia 25 tahun ke atas</strong>. Angka ini membantu membaca kondisi pendidikan,
              bukan mengukur kecerdasan atau meramalkan masa depan.
            </p>
          </div>
          <div className="rls-example">
            <span>CONTOH SEDERHANA</span>
            <strong>6 + 9 + 12</strong>
            <p>
              Dibagi 3 orang = <b>9 tahun</b>.
              <br />
              Rata-ratanya sama, perjalanan tiap orang berbeda.
            </p>
            <small>Contoh belajar, bukan data provinsi.</small>
          </div>
        </div>
      )}
      {id === "cerita" && !storiesOpen && (
        <button className="button primary begin-stories" onClick={() => setStoriesOpen(true)}>
          {"Kenali lewat tiga cerita "}
          <Arrow />
        </button>
      )}
      {(id !== "cerita" || storiesOpen) && <div className={`inline-tool modal tool-${id}`}>{renderTool(id)}</div>}
      <a className="next-section" href={id === "cerita" ? "#jelajah" : `#${flowSections[index + 1]?.[0] || "kuis"}`}>
        <span>LANJUT JELAJAH</span>
        {nextLabels[index]} <Arrow />
      </a>
    </section>
  );

  const onShellClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const id = (e.target as HTMLElement).closest('a[href^="#"]')?.getAttribute("href")?.slice(1);
    if (id && screens.includes(id)) {
      e.preventDefault();
      goTo(id);
    }
  };

  return (
    <div
      onClick={onShellClick}
      data-screen={screen}
      className={`app-shell screen-experience ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${
        quizStarted && !quizDone ? "quiz-in-progress" : ""
      }`}
    >
      <Sidebar active={screen} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="page-content">
        <header className="site-header">
          <a href="#" className="brand" aria-label="Setara, beranda">
            <span className="brand-symbol">
              s<span>↗</span>
            </span>
            setara<span className="brand-dot">.</span>
          </a>
          <nav>
            <a href="#jelajah">Jelajah peta</a>
            <a href="#coba">Ruang eksplorasi</a>
            <a href="#kenalan">Kenalan dengan RLS</a>
          </nav>
          <button
            className="header-cta"
            onClick={() => {
              resetQuiz();
              open("kuis");
            }}
          >
            {"Uji pemahamanmu "}
            <Arrow diagonal />
          </button>
        </header>
        <main ref={mainRef} aria-label="Jelajah pendidikan Indonesia">
          <section id="beranda" className="hero" tabIndex={-1}>
            <div className="hero-atmosphere" aria-hidden="true">
              <div className="hero-orb" />
              <div className="hero-crosshair" />
              <span className="hero-coordinate">7°25′ LS / 109°14′ BT</span>
            </div>
            <div className="hero-topline">
              <span>
                <i /> SEBUAH RUANG UNTUK RASA INGIN TAHU
              </span>
              <span>INDONESIA · 38 PROVINSI</span>
            </div>
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" /> RUANG EKSPLORASI PENDIDIKAN INDONESIA
              </div>
              <h1>
                Beda titik.
                <br />
                Setara{" "}
                <span className="dream">
                  mimpi
                  <svg viewBox="0 0 300 20">
                    <path d="M3 14Q120 0 296 9M15 19Q149 8 283 14" />
                  </svg>
                </span>
                .
              </h1>
              <p>
                Di negeri yang sama, perjalanan sekolah kita
                <br className="desktop-break" /> bisa berbeda. Apa yang ada di balik angkanya?
              </p>
              <a className="button primary" href="#kenalan">
                {"Temukan ceritanya "}
                <Arrow />
              </a>
              <div className="hero-hint">
                <span className="small-star">✳</span> Tak perlu daftar. Cukup rasa ingin tahu.
              </div>
              <div className="hero-insight" aria-live="polite">
                <span className="insight-number">
                  {heroSteps[heroStep].years}
                  <small>TAHUN</small>
                </span>
                <div>
                  <strong>{heroSteps[heroStep].title}</strong>
                  <p>{heroSteps[heroStep].text}</p>
                </div>
              </div>
            </div>
            <div className="hero-art" aria-label="Ilustrasi tangga pendidikan: titik mulai berbeda, mimpi sama besarnya">
              <div className="art-grid" />
              <div className="art-stage-ring" aria-hidden="true" />
              <div className="touch-invitation">
                <span className="touch-pulse" />
                Sentuh tangganya. Mulai ceritamu.
              </div>
              <span className="art-caption">KESEMPATAN BUKAN SOAL KEMAMPUAN.</span>
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              {heroStepButtons.map((step, i) => (
                <button
                  key={step.cls}
                  type="button"
                  className={`step ${step.cls} ${heroStep === i ? "is-chosen" : ""}`}
                  onClick={() => setHeroStep(i)}
                  aria-pressed={heroStep === i}
                  aria-label={step.label}
                >
                  <span>{step.years}</span>
                  <small>TAHUN</small>
                  <i>{step.level}</i>
                </button>
              ))}
              <svg className="journey-line" viewBox="0 0 600 360" fill="none">
                <path
                  d="M48 287C148 300 79 175 211 195S303 72 428 94 505 34 542 23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                />
                <path d="m527 25 16-4-1 17" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="person person-one">
                <span />
                <i />
                <b />
                <em />
              </div>
              <div className="person person-two">
                <span />
                <i />
                <b />
                <em />
              </div>
              <div className="art-note">
                Titik mulai boleh beda.
                <br />
                <strong>Mimpi sama besarnya.</strong>
                <svg viewBox="0 0 60 45">
                  <path d="M3 4q15 34 48 25m-10-8 11 9-14 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="art-sticker">
                BUKA JALAN.
                <br />
                {"BUKAN BATASAN. "}
                <Arrow diagonal />
              </div>
              <span className="art-footnote">Ilustrasi jenjang pendidikan · Bukan data RLS</span>
            </div>
            <div className="hero-bottomline">
              <span className="hero-page-number">
                {"01 "}
                <i>/ 09</i>
              </span>
              <a href="#kenalan">
                <span>GULIR UNTUK MEMBUKA PERSPEKTIF</span>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <rect x="6" y="2" width="20" height="28" rx="10" stroke="currentColor" />
                  <path d="M16 8v12m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </a>
              <span className="hero-bottom-note">
                Kesempatan berbeda.
                <br />
                <strong>Keinginan belajar setara.</strong>
              </span>
            </div>
          </section>
          {renderFlow(flowSections[0], 0)}
          <section id="jelajah" className="map-section" tabIndex={-1}>
            <div className="section-heading">
              <div>
                <div className="eyebrow">02 / LIHAT LEBIH DEKAT</div>
                <h2>
                  Satu Indonesia.
                  <br />
                  <span>Banyak perjalanan.</span>
                </h2>
              </div>
              <p>
                Sentuh satu titik. Temukan cerita pendidikan
                <br />
                dari 38 provinsi di Indonesia.
              </p>
            </div>
            <div className="map-layout">
              <div className="map-area">
                <div className="map-top">
                  <span>
                    <i /> 38 PROVINSI, 38 PERSPEKTIF
                  </span>
                  <span className="data-badge">BPS · 2025</span>
                </div>
                <svg
                  className="indonesia-map"
                  viewBox="0 -15 870 350"
                  role="group"
                  aria-label="Peta interaktif Indonesia, pilih titik ibu kota"
                >
                  <defs>
                    <pattern id="maptexture" width="5" height="5" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r=".5" fill="#a5b1a0" />
                    </pattern>
                  </defs>
                  <path d={mapPath} fill="#dce1d3" stroke="#b0bba8" strokeWidth="1" />
                  <path d={mapPath} fill="url(#maptexture)" />
                  {provinces.map((p, i) => {
                    const [x, y] = project(p.lon, p.lat);
                    const isSelected = mapProvince === i;
                    return (
                      <g
                        key={p.name}
                        role="button"
                        tabIndex={0}
                        aria-label={`${p.name}, RLS ${formatRls(p.rls)} tahun`}
                        onClick={() => setMapProvince(i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setMapProvince(i);
                          }
                        }}
                        className={`map-pin ${isSelected ? "selected" : ""}`}
                      >
                        <circle cx={x} cy={y} r="12" fill="transparent" />
                        {isSelected && <circle cx={x} cy={y} r="13" className="pin-halo" />}
                        <circle cx={x} cy={y} r={isSelected ? 6 : 3.5} className="pin-dot" />
                        {isSelected && (
                          <>
                            <rect x={Math.min(x - 36, 745)} y={y - 39} width="110" height="24" rx="5" fill="#172c31" />
                            <text x={Math.min(x + 19, 800)} y={y - 23} textAnchor="middle" fill="white" fontSize="10">
                              {p.name}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
                <div className="map-bottom">
                  <span>
                    <i className="legend-dot" /> Titik ibu kota provinsi
                  </span>
                  <span>
                    {"Pilih titik untuk menjelajah "}
                    <Arrow diagonal />
                  </span>
                </div>
              </div>
              <aside className="province-detail">
                <label htmlFor="province">MAU JELAJAH KE MANA?</label>
                <select id="province" value={mapProvince} onChange={(e) => setMapProvince(+e.target.value)}>
                  {provinces.map((p, i) => (
                    <option key={p.name} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="province-caption">RATA-RATA LAMA SEKOLAH</div>
                <div className="big-rls">
                  {formatRls(selected.rls)}
                  <span>tahun</span>
                </div>
                <div className="capital">
                  <span className="target-icon">◎</span> Ibu kota: {selected.capital}
                </div>
                <p>Angka ini menggambarkan lama sekolah rata-rata, bukan batas mimpi orang yang tinggal di sini.</p>
                <div className="province-note">
                  Sumber: BPS, RLS tahun 2025.
                  <br />
                  <a href={rlsData.url} target="_blank" rel="noreferrer">
                    Lihat tabel sumber ↗
                  </a>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setCompareA(mapProvince);
                    open("banding");
                  }}
                >
                  {"Bandingkan dengan provinsi lain "}
                  <Arrow />
                </button>
              </aside>
            </div>
          </section>
          <div id="coba" className="journey-intro">
            <span className="eyebrow">LANJUTKAN RASA INGIN TAHUMU</span>
            <p>Dari memahami cerita, menjelajahi tempat, sampai membuka kesempatan.</p>
            <span>Jelajahi ke bawah ↓</span>
          </div>
          {flowSections.slice(1).map((section, i) => renderFlow(section, i + 1))}
          <section id="kuis" tabIndex={-1} className="flow-section flow-quiz">
            <div className="flow-heading">
              <div className="flow-number">07</div>
              <div>
                <div className="eyebrow">BAWA PULANG PEMAHAMAN BARU</div>
                <h2>Angkanya sudah. Sekarang, ceritanya?</h2>
                <p>Uji pemahamanmu, lalu ajak temanmu ikut mencoba.</p>
              </div>
            </div>
            <div className="quiz-inline-layout">
              <div className="inline-tool modal tool-quiz">{renderTool("kuis")}</div>
            </div>
            <a className="next-section" href="#papan-peringkat">
              <span>LANJUT JELAJAH</span>
              {"Lihat papan peringkat "}
              <Arrow />
            </a>
          </section>
          <section className="closing">
            <span className="closing-star">✳</span>
            <h2>
              Angka membantu kita melihat.
              <br />
              <span>Kepedulian membantu kita bergerak.</span>
            </h2>
            <p>
              Pendidikan bukan perlombaan siapa paling jauh.
              <br />
              Ini tentang memastikan setiap orang punya jalan.
            </p>
            <a href="#jelajah">Jelajahi lagi ↑</a>
          </section>
          <section id="papan-peringkat" tabIndex={-1} className="flow-section final-ranking">
            <div className="eyebrow">SETARA / 08</div>
            <h2>Papan peringkat</h2>
            <p className="ranking-subtitle">Rayakan rasa ingin tahu, bukan sekadar jawaban benar.</p>
            <div className="ranking-panel">
              <div className="ranking-panel-heading">
                <div>
                  <span className="eyebrow">PENJELAJAH PENUH RASA INGIN TAHU</span>
                  <h3>Lima jejak teratas</h3>
                </div>
                <button className="ranking-expand" onClick={() => open("peringkat")}>
                  {"Lihat peringkat lengkap "}
                  <Arrow diagonal />
                </button>
              </div>
              {scores.length ? (
                <div className="ranking-rows">
                  {scores.map((s, i) => (
                    <div key={i} className="score-row">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <strong>{s.name}</strong>
                      <b>
                        {s.score.toLocaleString("id-ID")} <small>poin</small>
                      </b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ranking-empty">
                  <svg
                    width="45"
                    height="45"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M7 3h10v7q0 5-5 5t-5-5ZM7 5H3v3q0 4 5 4m9-7h4v3q0 4-5 4m-4 3v6m-4 0h8" />
                  </svg>
                  <h3>Tempat pertama masih menunggumu.</h3>
                  <p>Selesaikan kuis dan mulai jejak pertamamu di sini.</p>
                  <button className="button primary" onClick={() => open("kuis")}>
                    {"Ikuti tantangan "}
                    <Arrow />
                  </button>
                </div>
              )}
              <p className="ranking-local-note">
                <span className="circle-info">i</span> Peringkat tersimpan hanya di peramban dan perangkat ini, belum
                terhubung antarperangkat.
              </p>
            </div>
          </section>
        </main>
        <footer>
          <a href="#" className="brand">
            setara.
          </a>
          <span>Ruang belajar tentang kesempatan pendidikan Indonesia.</span>
          <span>Proyek edukasi · SMK Telkom Purwokerto</span>
        </footer>
      </div>
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="modal">
          <div className="modal-top">
            <span className="eyebrow">SETARA / RUANG EKSPLORASI</span>
            <button className="close" aria-label="Tutup" onClick={() => setModal(null)}>
              ×
            </button>
          </div>
          {renderTool("peringkat")}
        </div>
      </dialog>
    </div>
  );
}
