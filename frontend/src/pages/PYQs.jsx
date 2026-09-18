import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  FileText,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { semesters } from "../data/semesters";
import { supabase } from "../lib/supabase";

const YEARS = [2025, 2024, 2023, 2022, 2021];

// =============================================================
// YEAR STYLES
// =============================================================

const YEAR_STYLES = [
  {
    card:
      "from-[#EEE7FF] via-[#FAF7FF] to-[#E3D8FF]",
    iconBg: "bg-[#E2D7FF]",
    iconColor: "text-[#7046E8]",
    badge: "bg-[#F1EBFF] text-[#7046E8]",
  },
  {
    card:
      "from-[#FFECEF] via-[#FFF8F9] to-[#FFD9E5]",
    iconBg: "bg-[#FFDDE8]",
    iconColor: "text-[#E83E7A]",
    badge: "bg-[#FFF0F4] text-[#D65D86]",
  },
  {
    card:
      "from-[#FFF7E3] via-[#FFFDF7] to-[#FFE7B5]",
    iconBg: "bg-[#FFE9B9]",
    iconColor: "text-[#E59A13]",
    badge: "bg-[#FFF7E4] text-[#B97B12]",
  },
  {
    card:
      "from-[#E9FAF3] via-[#F8FFFB] to-[#CDEEDC]",
    iconBg: "bg-[#D5F0E1]",
    iconColor: "text-[#249B68]",
    badge: "bg-[#ECFAF2] text-[#249B68]",
  },
  {
    card:
      "from-[#FFF0E8] via-[#FFF9F5] to-[#FFDCC8]",
    iconBg: "bg-[#FFE0CF]",
    iconColor: "text-[#D87848]",
    badge: "bg-[#FFF1E9] text-[#C5683E]",
  },
];

// =============================================================
// MAIN
// =============================================================

export default function PYQs() {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSemester, setSelectedSemester] =
    useState("all");

  const [selectedSubject, setSelectedSubject] =
    useState("all");

  const [selectedYear, setSelectedYear] =
    useState("all");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH PYQs + SUBJECTS
  // ==========================================================

  useEffect(() => {
    fetchPYQs();
  }, []);

  async function fetchPYQs() {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // Fetch subjects
      // --------------------------------------------------------

      const {
        data: subjectData,
        error: subjectError,
      } = await supabase
        .from("subjects")
        .select("id, semester_id, name, slug")
        .order("id", {
          ascending: true,
        });

      if (subjectError) {
        throw subjectError;
      }

      // --------------------------------------------------------
      // Fetch PYQs
      // --------------------------------------------------------

      const {
        data: pyqData,
        error: pyqError,
      } = await supabase
        .from("pyqs")
        .select(
          "id, subject_id, year, title, file_url, created_at"
        )
        .order("year", {
          ascending: false,
        });

      if (pyqError) {
        throw pyqError;
      }

      setSubjects(subjectData || []);
      setPapers(pyqData || []);
    } catch (err) {
      console.error("Error loading PYQs:", err);

      setError(
        err.message ||
          "Unable to load previous-year papers."
      );

      setSubjects([]);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // SUBJECT LOOKUP
  // ==========================================================

  const subjectMap = useMemo(() => {
    const map = {};

    subjects.forEach((subject) => {
      map[subject.id] = subject;
    });

    return map;
  }, [subjects]);

  // ==========================================================
  // FILTER SUBJECTS BY SEMESTER
  // ==========================================================

  const semesterSubjects = useMemo(() => {
    if (selectedSemester === "all") {
      return subjects;
    }

    return subjects.filter(
      (subject) =>
        Number(subject.semester_id) ===
        Number(selectedSemester)
    );
  }, [subjects, selectedSemester]);

  // ==========================================================
  // RESET SUBJECT WHEN SEMESTER CHANGES
  // ==========================================================

  useEffect(() => {
    if (
      selectedSubject !== "all" &&
      !semesterSubjects.some(
        (subject) =>
          String(subject.id) ===
          String(selectedSubject)
      )
    ) {
      setSelectedSubject("all");
    }
  }, [
    selectedSemester,
    semesterSubjects,
    selectedSubject,
  ]);

  // ==========================================================
  // FILTER PAPERS
  // ==========================================================

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return papers.filter((paper) => {
      const subject =
        subjectMap[paper.subject_id];

      if (!subject) {
        return false;
      }

      // Semester

      if (
        selectedSemester !== "all" &&
        Number(subject.semester_id) !==
          Number(selectedSemester)
      ) {
        return false;
      }

      // Subject

      if (
        selectedSubject !== "all" &&
        String(subject.id) !==
          String(selectedSubject)
      ) {
        return false;
      }

      // Year

      if (
        selectedYear !== "all" &&
        Number(paper.year) !==
          Number(selectedYear)
      ) {
        return false;
      }

      // Search

      if (query) {
        const searchableText = [
          paper.title || "",
          String(paper.year || ""),
          subject.name || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    papers,
    subjectMap,
    selectedSemester,
    selectedSubject,
    selectedYear,
    search,
  ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        papers
          .map((paper) => Number(paper.year))
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a);
  }, [papers]);

  const totalSubjectsWithPYQs = useMemo(() => {
    return new Set(
      papers.map((paper) => paper.subject_id)
    ).size;
  }, [papers]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSelectedSemester("all");
    setSelectedSubject("all");
    setSelectedYear("all");
    setSearch("");
  };

  const hasFilters =
    selectedSemester !== "all" ||
    selectedSubject !== "all" ||
    selectedYear !== "all" ||
    search.trim() !== "";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
        <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#DCCFFF]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute -right-40 top-60 h-72 w-72 rounded-full bg-[#FFD4C2]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded-full bg-[#eee8f2] sm:w-28" />

            <div className="mt-6 h-12 max-w-2xl rounded-xl bg-[#eee8f2] sm:h-14" />

            <div className="mt-4 h-5 max-w-xl rounded bg-[#f1ecf3]" />

            <div className="mt-8 h-24 rounded-[22px] bg-[#f4eff5] sm:mt-10 sm:h-28 sm:rounded-[26px]" />

            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-52 rounded-[22px] bg-[#f4eff5] sm:h-56 sm:rounded-[26px]"
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-[35vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE7FF]">
                <Loader2
                  size={28}
                  className="animate-spin text-[#7046E8]"
                />
              </div>

              <p className="text-sm font-bold text-[#817687]">
                Loading previous-year papers...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#fffdfb]">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -right-40 top-[35%] h-72 w-72 rounded-full bg-[#FFD4C2]/25 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#D8F2E5]/20 blur-3xl sm:h-80 sm:w-80" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:px-10">
        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#766B7B] transition hover:-translate-x-1 hover:text-[#7046E8] sm:mb-8 sm:text-sm"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1 sm:h-[17px] sm:w-[17px]"
          />

          Back to Home
        </button>

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[24px] border border-[#E9E0EC] bg-gradient-to-br from-[#EEE7FF] via-[#FFFDFC] to-[#FFEFE7] p-5 shadow-[0_15px_45px_rgba(72,52,88,0.07)] sm:rounded-[32px] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D8CAFF]/40 blur-3xl sm:h-80 sm:w-80" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#FFD3E0]/30 blur-3xl sm:h-64 sm:w-64" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7046E8] shadow-sm backdrop-blur-md sm:px-3.5 sm:text-[10px] sm:tracking-[0.15em]">
              <FileQuestion size={12} />

              Previous Year Papers
            </div>

            <div className="mt-4 flex flex-col justify-between gap-7 sm:mt-5 lg:flex-row lg:items-end lg:gap-8">
              <div className="max-w-3xl min-w-0">
                <h1 className="break-words font-display text-[32px] font-black leading-[1.05] tracking-[-0.055em] text-[#211A26] sm:text-5xl lg:text-[56px]">
                  Practice what AKTU asked.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#716778] sm:mt-5 sm:text-base sm:leading-7">
                  Find previous-year question papers by
                  semester, subject and year. Practice real
                  exam patterns and prepare with confidence.
                </p>
              </div>

              {/* Stats */}

              <div className="grid w-full shrink-0 grid-cols-2 gap-2.5 sm:gap-3 lg:w-auto">
                <HeroStat
                  icon={FileQuestion}
                  value={papers.length}
                  label="Papers"
                />

                <HeroStat
                  icon={BookOpen}
                  value={totalSubjectsWithPYQs}
                  label="Subjects"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <section className="mt-7 rounded-[22px] border border-[#E8E0EC] bg-white p-4 shadow-[0_9px_28px_rgba(73,52,91,0.05)] sm:mt-10 sm:rounded-[26px] sm:p-6">
          <div className="flex flex-col gap-5">
            {/* Heading */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8] sm:text-[10px] sm:tracking-[0.16em]">
                  Find a paper
                </p>

                <h2 className="mt-1 font-display text-lg font-black text-[#302833] sm:text-xl">
                  Filter previous-year papers
                </h2>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#F7F2F8] px-3 py-2 text-[11px] font-bold text-[#766B7B] transition hover:bg-[#EEE7FF] hover:text-[#7046E8] sm:px-3.5 sm:text-xs"
                >
                  <X size={13} />

                  Clear filters
                </button>
              )}
            </div>

            {/* Search */}

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A909D] sm:left-4 sm:h-[18px] sm:w-[18px]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by subject, title or year..."
                className="w-full rounded-[14px] border border-[#E4DCE7] bg-[#FCFAFD] py-3.5 pl-10 pr-10 text-xs font-medium text-[#3D3545] outline-none transition focus:border-[#7046E8] focus:bg-white focus:ring-4 focus:ring-[#7046E8]/10 sm:pl-11 sm:pr-11 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9A909D] transition hover:bg-[#EEE7FF] hover:text-[#7046E8] sm:right-3"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Select filters */}

            <div className="grid gap-3 sm:grid-cols-3">
              <FilterSelect
                label="Semester"
                value={selectedSemester}
                onChange={(event) =>
                  setSelectedSemester(
                    event.target.value
                  )
                }
                options={[
                  {
                    value: "all",
                    label: "All Semesters",
                  },
                  ...semesters.map((semester) => ({
                    value: String(semester.id),
                    label: semester.name,
                  })),
                ]}
              />

              <FilterSelect
                label="Subject"
                value={selectedSubject}
                onChange={(event) =>
                  setSelectedSubject(
                    event.target.value
                  )
                }
                options={[
                  {
                    value: "all",
                    label: "All Subjects",
                  },
                  ...semesterSubjects.map((subject) => ({
                    value: String(subject.id),
                    label: subject.name,
                  })),
                ]}
              />

              <FilterSelect
                label="Year"
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(
                    event.target.value
                  )
                }
                options={[
                  {
                    value: "all",
                    label: "All Years",
                  },
                  ...YEARS.map((year) => ({
                    value: String(year),
                    label: String(year),
                  })),
                ]}
              />
            </div>

            {/* Result count */}

            <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EEE8F0] pt-3.5 sm:gap-2 sm:pt-4">
              <CheckCircle2
                size={14}
                className="text-[#249B68]"
              />

              <span className="text-[11px] font-bold text-[#756A7A] sm:text-xs">
                {filteredPapers.length}{" "}
                {filteredPapers.length === 1
                  ? "paper"
                  : "papers"}{" "}
                found
              </span>

              {availableYears.length > 0 && (
                <span className="text-[10px] text-[#A097A4] sm:text-xs">
                  · {Math.min(...availableYears)}–
                  {Math.max(...availableYears)}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-[#FFD0DC] bg-[#FFF2F5] p-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-black text-[#C63768]">
                Unable to load PYQs
              </p>

              <p className="mt-1 break-words text-xs text-[#D66B8E]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPYQs}
              className="w-fit shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#C63768] shadow-sm transition hover:-translate-y-0.5"
            >
              Try again
            </button>
          </div>
        )}

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <section className="mt-9 sm:mt-10">
          {filteredPapers.length > 0 ? (
            <>
              <div className="mb-5 sm:mb-6">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#249B68] sm:text-[10px] sm:tracking-[0.16em]">
                  Available Papers
                </p>

                <h2 className="mt-1 font-display text-[25px] font-black tracking-[-0.03em] text-[#211A26] sm:text-3xl">
                  Previous-year papers
                </h2>
              </div>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {filteredPapers.map((paper, index) => {
                  const subject =
                    subjectMap[paper.subject_id];

                  const style =
                    YEAR_STYLES[
                      index % YEAR_STYLES.length
                    ];

                  const semesterData =
                    semesters.find(
                      (semester) =>
                        Number(semester.id) ===
                        Number(subject?.semester_id)
                    );

                  return (
                    <div
                      key={paper.id}
                      className={`
                        group relative overflow-hidden
                        rounded-[22px]
                        border border-white/90
                        bg-gradient-to-br
                        ${style.card}
                        p-5
                        shadow-[0_9px_28px_rgba(73,52,91,0.05)]
                        transition-all duration-500
                        hover:-translate-y-2
                        hover:shadow-[0_22px_45px_rgba(73,52,91,0.12)]
                        sm:rounded-[26px] sm:p-6
                      `}
                    >
                      {/* Glow */}

                      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-white/45 blur-3xl transition duration-700 group-hover:scale-125 sm:h-44 sm:w-44" />

                      <div className="relative z-10">
                        {/* Top */}

                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`
                              flex h-11 w-11 shrink-0
                              items-center justify-center
                              rounded-[14px]
                              ${style.iconBg}
                              ${style.iconColor}
                              shadow-sm
                              ring-4 ring-white/50
                              transition duration-500
                              group-hover:scale-110
                              group-hover:rotate-[-3deg]
                              sm:h-13 sm:w-13 sm:rounded-[16px]
                            `}
                          >
                            <FileText
                              size={19}
                              className="sm:h-[22px] sm:w-[22px]"
                            />
                          </div>

                          <div
                            className={`
                              shrink-0 rounded-full
                              px-2.5 py-1.5
                              text-[8px] font-extrabold
                              uppercase tracking-[0.08em]
                              sm:px-3 sm:text-[9px]
                              sm:tracking-[0.1em]
                              ${style.badge}
                            `}
                          >
                            {paper.year}
                          </div>
                        </div>

                        {/* Content */}

                        <div className="mt-6 sm:mt-7">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {semesterData && (
                              <span className="max-w-[65%] truncate rounded-full bg-white/65 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#817684] sm:text-[9px] sm:tracking-[0.08em]">
                                {semesterData.name}
                              </span>
                            )}

                            <span className="rounded-full bg-white/65 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#817684] sm:text-[9px] sm:tracking-[0.08em]">
                              {paper.year}
                            </span>
                          </div>

                          <h3 className="mt-3 break-words font-display text-lg font-black leading-6 tracking-[-0.025em] text-[#211A26] sm:text-xl sm:leading-7">
                            {paper.title ||
                              `${paper.year} Question Paper`}
                          </h3>

                          <p className="mt-2 truncate text-xs font-semibold text-[#716778] sm:text-sm">
                            {subject?.name || "Subject"}
                          </p>
                        </div>

                        {/* Footer */}

                        <div className="mt-6 flex items-center justify-between gap-3 sm:mt-7">
                          <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-[#8A8290] sm:gap-2 sm:text-xs">
                            <CalendarDays
                              size={13}
                              className={`shrink-0 ${style.iconColor}`}
                            />

                            <span>
                              {paper.year}
                            </span>
                          </div>

                          {paper.file_url && (
                            <a
                              href={paper.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="group/open inline-flex shrink-0 items-center gap-1.5 rounded-[11px] bg-[#211A26] px-3 py-2.5 text-[10px] font-extrabold text-white shadow-[0_7px_18px_rgba(33,26,38,0.12)] transition hover:-translate-y-0.5 hover:bg-[#7046E8] sm:gap-2 sm:rounded-[12px] sm:px-4 sm:text-xs"
                            >
                              <span className="sm:hidden">
                                Open
                              </span>

                              <span className="hidden sm:inline">
                                Open PDF
                              </span>

                              <ExternalLink
                                size={12}
                                className="transition-transform duration-300 group-hover/open:translate-x-0.5"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="relative overflow-hidden rounded-[23px] border border-dashed border-[#DCD5DF] bg-white px-4 py-12 text-center shadow-[0_10px_30px_rgba(73,52,91,0.04)] sm:rounded-[28px] sm:px-6 sm:py-16">
              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#EEE7FF]/60 blur-3xl sm:h-48 sm:w-48" />

              <div className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#E9E0FF] to-[#FFE4EC] text-[#7046E8] sm:h-16 sm:w-16 sm:rounded-[20px]">
                  <FileQuestion size={25} />
                </div>

                <h3 className="mt-5 font-display text-xl font-black text-[#302833] sm:text-2xl">
                  No papers found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#817684] sm:text-sm sm:leading-6">
                  {hasFilters
                    ? "Try changing your filters or search term to find more previous-year papers."
                    : "Previous-year papers will appear here after they are uploaded by the admin."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-[#211A26] px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#7046E8]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ====================================================
            STUDY TIP
        ==================================================== */}

        <section className="mt-10 overflow-hidden rounded-[22px] border border-[#E8E0EC] bg-gradient-to-r from-[#F5F0FF] via-white to-[#FFF3EE] p-5 sm:mt-12 sm:rounded-[24px] sm:p-7">
          <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E9E0FF] text-[#7046E8] sm:h-12 sm:w-12 sm:rounded-[15px]">
              <Sparkles
                size={19}
                className="sm:h-[21px] sm:w-[21px]"
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-display text-sm font-black text-[#302833]">
                Smart way to use PYQs
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[#817684] sm:text-xs">
                Start with the latest papers, identify
                repeated topics, then revise the relevant
                unit notes before attempting the paper again.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            BOTTOM
        ==================================================== */}

        <div className="mt-10 flex justify-center sm:mt-12">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 rounded-[13px] border border-[#E4DCE7] bg-white px-4 py-3 text-xs font-extrabold text-[#62586A] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D7C9F0] hover:text-[#7046E8] sm:rounded-[14px] sm:px-5"
          >
            <ArrowLeft
              size={15}
              className="transition group-hover:-translate-x-1"
            />

            Back to StudyHub
          </button>
        </div>
      </div>
    </main>
  );
}

// =============================================================
// HERO STAT
// =============================================================

function HeroStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="min-w-0 rounded-[15px] border border-white/80 bg-white/60 px-3 py-2.5 shadow-sm backdrop-blur-md sm:min-w-[105px] sm:rounded-[18px] sm:px-4 sm:py-3">
      <div className="flex items-center gap-1.5 text-[#7046E8] sm:gap-2">
        <Icon
          size={14}
          className="shrink-0 sm:h-[15px] sm:w-[15px]"
        />

        <span className="truncate text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#817684] sm:text-[9px] sm:tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-1 font-display text-lg font-black text-[#211A26] sm:text-xl">
        {value}
      </p>
    </div>
  );
}

// =============================================================
// FILTER SELECT
// =============================================================

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#918693] sm:text-[10px] sm:tracking-[0.12em]">
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-[13px]
          border
          border-[#E4DCE7]
          bg-[#FCFAFD]
          px-3
          py-3
          text-xs
          font-semibold
          text-[#514757]
          outline-none
          transition
          focus:border-[#7046E8]
          focus:bg-white
          focus:ring-4
          focus:ring-[#7046E8]/10
          sm:rounded-[14px]
          sm:px-3.5
          sm:text-sm
        "
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}