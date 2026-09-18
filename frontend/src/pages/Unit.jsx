import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileQuestion,
  FileText,
  Flame,
  GraduationCap,
  Layers3,
  NotebookPen,
  Sparkles,
} from "lucide-react";

import { supabase } from "../lib/supabase";

// =============================================================
// RESOURCE TYPES
// =============================================================

const RESOURCE_TYPES = [
  {
    key: "notes",
    title: "Complete Unit Notes",
    description: "Detailed notes covering the complete unit.",
    label: "Study Material",
    icon: FileText,
    gradient: "from-[#EEE7FF] via-[#F8F4FF] to-[#E3D8FF]",
    iconBg: "bg-[#E2D7FF]",
    iconColor: "text-[#7046E8]",
  },
  {
    key: "short_notes",
    title: "Short Notes",
    description:
      "Quick revision material for last-minute preparation.",
    label: "Quick Revision",
    icon: NotebookPen,
    gradient: "from-[#FFECEF] via-[#FFF6F7] to-[#FFD9E5]",
    iconBg: "bg-[#FFDCE8]",
    iconColor: "text-[#E83E7A]",
  },
  {
    key: "expected_questions",
    title: "Expected Questions",
    description:
      "Important questions to practise before the exam.",
    label: "Exam Focus",
    icon: Flame,
    gradient: "from-[#FFF7E3] via-[#FFFDF5] to-[#FFE7B5]",
    iconBg: "bg-[#FFE9B9]",
    iconColor: "text-[#E59A13]",
  },
];

// =============================================================
// MAIN COMPONENT
// =============================================================

function Unit() {
  const { semesterNumber, subjectId, unitId } = useParams();
  const navigate = useNavigate();

  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState(null);
  const [unit, setUnit] = useState(null);
  const [resources, setResources] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [allUnits, setAllUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unitNumber = Number(unitId);

  // ===========================================================
  // FETCH UNIT DATA
  // ===========================================================

  useEffect(() => {
    fetchUnitData();
  }, [semesterNumber, subjectId, unitId]);

  async function fetchUnitData() {
    try {
      setLoading(true);
      setError("");

      // ---------------------------------------------------------
      // FIND SEMESTER
      // ---------------------------------------------------------

      const { data: semesterData, error: semesterError } =
        await supabase
          .from("semesters")
          .select("*")
          .eq(
            "semester_number",
            Number(semesterNumber)
          )
          .single();

      if (semesterError) {
        throw semesterError;
      }

      // ---------------------------------------------------------
      // FIND SUBJECT
      // ---------------------------------------------------------

      const { data: subjectData, error: subjectError } =
        await supabase
          .from("subjects")
          .select("*")
          .eq("semester_id", semesterData.id)
          .eq("slug", subjectId)
          .single();

      if (subjectError) {
        throw subjectError;
      }

      // ---------------------------------------------------------
      // FIND CURRENT UNIT
      // ---------------------------------------------------------

      const { data: unitData, error: unitError } =
        await supabase
          .from("units")
          .select("*")
          .eq("subject_id", subjectData.id)
          .eq("unit_number", unitNumber)
          .single();

      if (unitError) {
        throw unitError;
      }

      // ---------------------------------------------------------
      // FIND ALL UNITS
      // ---------------------------------------------------------

      const { data: unitsData, error: unitsError } =
        await supabase
          .from("units")
          .select("id, unit_number, title")
          .eq("subject_id", subjectData.id)
          .order("unit_number", {
            ascending: true,
          });

      if (unitsError) {
        throw unitsError;
      }

      // ---------------------------------------------------------
      // FIND RESOURCES
      // ---------------------------------------------------------

      const { data: resourceData, error: resourceError } =
        await supabase
          .from("resources")
          .select("*")
          .eq("unit_id", unitData.id)
          .order("created_at", {
            ascending: true,
          });

      if (resourceError) {
        throw resourceError;
      }

      // ---------------------------------------------------------
      // FIND PYQs
      // ---------------------------------------------------------

      const { data: pyqData, error: pyqError } =
        await supabase
          .from("pyqs")
          .select("*")
          .eq("subject_id", subjectData.id)
          .order("year", {
            ascending: false,
          });

      if (pyqError) {
        throw pyqError;
      }

      setSemester(semesterData);
      setSubject(subjectData);
      setUnit(unitData);
      setAllUnits(unitsData || []);
      setResources(resourceData || []);
      setPyqs(pyqData || []);
    } catch (err) {
      console.error("Error loading unit:", err);

      setSemester(null);
      setSubject(null);
      setUnit(null);
      setAllUnits([]);
      setResources([]);
      setPyqs([]);

      setError(
        err.message || "We couldn't find this unit."
      );
    } finally {
      setLoading(false);
    }
  }

  // ===========================================================
  // RESOURCE CARDS
  // ===========================================================

  const resourceCards = useMemo(() => {
    return RESOURCE_TYPES.map((config) => ({
      ...config,
      resource:
        resources.find(
          (item) =>
            item.resource_type === config.key
        ) || null,
    }));
  }, [resources]);

  // ===========================================================
  // UNIT NAVIGATION
  // ===========================================================

  const currentIndex = allUnits.findIndex(
    (item) =>
      Number(item.unit_number) === unitNumber
  );

  const previousUnit =
    currentIndex > 0
      ? allUnits[currentIndex - 1]
      : null;

  const nextUnit =
    currentIndex >= 0 &&
    currentIndex < allUnits.length - 1
      ? allUnits[currentIndex + 1]
      : null;

  // ===========================================================
  // RESOURCE STATS
  // ===========================================================

  const availableResources = resourceCards.filter(
    (item) => Boolean(item.resource?.file_url)
  ).length;

  const missingResources =
    RESOURCE_TYPES.length - availableResources;

  // ===========================================================
  // OPEN RESOURCE FILE
  // ===========================================================

  function openFile(fileUrl, resourceType) {
    if (!fileUrl) return;

    // TXT files can be opened directly in a new browser tab.
    // PDFs are also opened directly in a new tab.
    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ===========================================================
  // UNIT PATH
  // ===========================================================

  function getUnitPath(number) {
    return `/semester/${semester.semester_number}/subject/${subject.slug}/unit/${number}`;
  }

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
        <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#DCCFFF]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute -right-40 top-60 h-72 w-72 rounded-full bg-[#FFD4C2]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-7 sm:px-8 sm:pb-24 sm:pt-10 lg:px-10">
          <div className="animate-pulse">
            <div className="mb-6 h-3.5 w-56 rounded-full bg-[#eee8f2] sm:mb-7 sm:h-4 sm:w-80" />

            <div className="rounded-[24px] bg-[#F3EDFF] p-5 sm:rounded-[30px] sm:p-12">
              <div className="h-8 w-32 rounded-full bg-white/70 sm:w-36" />

              <div className="mt-5 h-12 max-w-3xl rounded-xl bg-white/70 sm:mt-6 sm:h-14" />

              <div className="mt-4 h-5 max-w-2xl rounded bg-white/60" />

              <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                <div className="h-14 rounded-2xl bg-white/60" />
                <div className="h-14 rounded-2xl bg-white/60" />
                <div className="h-14 rounded-2xl bg-white/60" />
              </div>
            </div>

            <div className="mt-10 h-8 w-60 rounded bg-[#eee8f2] sm:mt-12 sm:w-72" />

            <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-56 rounded-[22px] bg-[#f5f0f6] sm:h-60 sm:rounded-[26px]"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ===========================================================
  // ERROR / NOT FOUND
  // ===========================================================

  if (!semester || !subject || !unit) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
        <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#DCCFFF]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute -right-40 top-60 h-72 w-72 rounded-full bg-[#FFD4C2]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="relative mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-4">
          <div className="w-full text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#E5DAFF] to-[#FFE1EA] text-[#7046E8] shadow-sm sm:h-16 sm:w-16 sm:rounded-[20px]">
              <Layers3 size={25} />
            </div>

            <h1 className="mt-5 font-display text-3xl font-black tracking-[-0.04em] text-[#211A26] sm:mt-6 sm:text-4xl">
              Unit not found
            </h1>

            <p className="mx-auto mt-3 max-w-md break-words text-sm leading-6 text-[#817684]">
              {error ||
                "We couldn't find the unit you're looking for."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/semester/${semesterNumber}/subject/${subjectId}`
                )
              }
              className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(112,70,232,0.20)] transition-all duration-300 hover:-translate-y-1 sm:w-auto"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to Subject
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ===========================================================
  // MAIN PAGE
  // ===========================================================

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#fffdfb]">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -right-40 top-80 h-72 w-72 rounded-full bg-[#FFD4C2]/25 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#D8F2E5]/20 blur-3xl sm:h-80 sm:w-80" />

      <div className="pointer-events-none absolute left-[6%] top-[28%] hidden animate-float text-[#8060E8]/20 lg:block">
        <Sparkles size={30} />
      </div>

      <div className="pointer-events-none absolute right-[7%] top-[46%] hidden animate-float-side text-[#E79A70]/20 lg:block">
        <Layers3 size={38} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:px-10">
        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="mb-5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[10px] font-semibold text-[#8D8291] sm:mb-7 sm:gap-2 sm:text-xs">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 transition-colors hover:text-[#7046E8]"
          >
            Home
          </button>

          <ArrowRight
            size={11}
            className="shrink-0 sm:h-[13px] sm:w-[13px]"
          />

          <button
            type="button"
            onClick={() =>
              navigate(
                `/semester/${semester.semester_number}`
              )
            }
            className="max-w-[25%] shrink-0 truncate transition-colors hover:text-[#7046E8] sm:max-w-none"
          >
            {semester.name}
          </button>

          <ArrowRight
            size={11}
            className="shrink-0 sm:h-[13px] sm:w-[13px]"
          />

          <button
            type="button"
            onClick={() =>
              navigate(
                `/semester/${semester.semester_number}/subject/${subject.slug}`
              )
            }
            className="min-w-0 max-w-[42%] truncate transition-colors hover:text-[#7046E8] sm:max-w-[220px]"
          >
            {subject.name}
          </button>

          <ArrowRight
            size={11}
            className="shrink-0 sm:h-[13px] sm:w-[13px]"
          />

          <span className="shrink-0 font-black text-[#7046E8]">
            Unit {unit.unit_number}
          </span>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[24px] border border-[#E9E0EC] bg-gradient-to-br from-[#EEE7FF] via-[#FFFDFC] to-[#FFEFE7] p-5 shadow-[0_15px_45px_rgba(72,52,88,0.07)] sm:rounded-[32px] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D8CAFF]/40 blur-3xl sm:h-80 sm:w-80" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#FFD3E0]/30 blur-3xl sm:h-64 sm:w-64" />

          <div className="relative">
            {/* Back */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/semester/${semester.semester_number}/subject/${subject.slug}`
                )
              }
              className="group mb-6 inline-flex max-w-full items-center gap-2 text-xs font-bold text-[#756A7A] transition hover:-translate-x-1 hover:text-[#7046E8] sm:mb-7 sm:text-sm"
            >
              <ArrowLeft
                size={16}
                className="shrink-0 transition-transform group-hover:-translate-x-1 sm:h-[17px] sm:w-[17px]"
              />

              <span className="truncate">
                Back to {subject.name}
              </span>
            </button>

            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end lg:gap-9">
              {/* Left */}

              <div className="max-w-3xl min-w-0">
                <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#7046E8] shadow-sm backdrop-blur-md sm:mb-5 sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.13em]">
                  <GraduationCap
                    size={12}
                    className="shrink-0 sm:h-[13px] sm:w-[13px]"
                  />

                  <span className="truncate">
                    {semester.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-white/70 text-[#7046E8] shadow-sm backdrop-blur-md sm:h-14 sm:w-14 sm:rounded-[17px]">
                    <Layers3
                      size={22}
                      className="sm:h-[25px] sm:w-[25px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#918693] sm:text-[9px] sm:tracking-[0.15em]">
                      Current Unit
                    </p>

                    <span className="text-xs font-black uppercase tracking-[0.13em] text-[#756A7A] sm:text-sm sm:tracking-[0.16em]">
                      Unit{" "}
                      {String(unit.unit_number).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>
                </div>

                <h1 className="mt-4 break-words font-display text-[32px] font-black leading-[1.05] tracking-[-0.055em] text-[#211A26] sm:mt-5 sm:text-5xl lg:text-[54px]">
                  {unit.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716778] sm:mt-4 sm:text-base sm:leading-7">
                  {unit.description ||
                    `Study ${unit.title} with organized notes, quick revision material and important exam questions.`}
                </p>
              </div>

              {/* Stats */}

              <div className="grid w-full shrink-0 grid-cols-3 gap-2 sm:gap-3 lg:w-auto lg:grid-cols-2">
                <Stat
                  icon={FileText}
                  label="Resources"
                  value={resources.length}
                />

                <Stat
                  icon={CalendarDays}
                  label="PYQs"
                  value={pyqs.length}
                />

                <Stat
                  icon={CheckCircle2}
                  label="Available"
                  value={`${availableResources}/3`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RESOURCES
        ===================================================== */}

        <section className="mt-10 sm:mt-14">
          <div className="mb-6 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8] sm:text-[10px] sm:tracking-[0.17em]">
                Study Resources
              </p>

              <h2 className="mt-1.5 break-words font-display text-[25px] font-black leading-tight tracking-[-0.035em] text-[#211A26] sm:text-[34px]">
                Everything you need for this unit
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-[#817684] sm:text-sm sm:leading-6">
                Learn, revise and practise directly from StudyHub.
              </p>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[13px] border border-[#E8E0EC] bg-white px-3.5 py-2.5 text-[10px] font-extrabold text-[#716778] shadow-sm sm:rounded-[14px] sm:px-4 sm:text-xs">
              <CheckCircle2
                size={14}
                className="text-[#249B68]"
              />

              {availableResources} of 3 available
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {resourceCards.map((item) => (
              <ResourceCard
                key={item.key}
                item={item}
                onOpen={() =>
                  openFile(item.resource?.file_url)
                }
              />
            ))}
          </div>

          {missingResources > 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-[17px] border border-[#E9E1EC] bg-white/80 px-4 py-3.5 shadow-[0_6px_22px_rgba(73,52,91,0.04)] sm:mt-5 sm:rounded-[18px] sm:px-5 sm:py-4">
              <Clock3
                size={16}
                className="mt-0.5 shrink-0 text-[#A198A4]"
              />

              <p className="text-[11px] leading-5 text-[#817684] sm:text-xs">
                <span className="font-black text-[#403746]">
                  Some resources are coming soon.
                </span>{" "}
                New study files will appear here automatically after
                the admin uploads them.
              </p>
            </div>
          )}
        </section>

        {/* =====================================================
            PYQs
        ===================================================== */}

        <section className="mt-12 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#249B68] sm:text-[10px] sm:tracking-[0.17em]">
                Previous Year Papers
              </p>

              <h2 className="mt-1.5 break-words font-display text-[25px] font-black leading-tight tracking-[-0.035em] text-[#211A26] sm:text-[34px]">
                Practice what AKTU asked
              </h2>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#817684] sm:text-sm sm:leading-6">
                Previous-year papers for {subject.name} are
                available here for focused exam preparation.
              </p>
            </div>

            {pyqs.length > 0 && (
              <div className="flex w-fit shrink-0 items-center gap-2 rounded-[13px] border border-[#D9EFE2] bg-[#F4FBF7] px-3.5 py-2.5 text-[10px] font-extrabold text-[#249B68] sm:rounded-[14px] sm:px-4 sm:text-xs">
                <FileQuestion size={14} />

                {pyqs.length}{" "}
                {pyqs.length === 1 ? "Paper" : "Papers"}
              </div>
            )}
          </div>

          {pyqs.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-[21px] border border-[#E7DFEA] bg-white shadow-[0_10px_30px_rgba(73,52,91,0.05)] sm:mt-7 sm:rounded-[26px]">
              <div className="divide-y divide-[#EEE8F0]">
                {pyqs.map((paper, index) => (
                  <div
                    key={paper.id}
                    className="group flex min-w-0 items-center justify-between gap-2.5 p-3.5 transition hover:bg-[#FCFAFF] sm:gap-4 sm:p-5 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div
                        className={`
                          flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]
                          sm:h-12 sm:w-12 sm:rounded-[15px]
                          ${
                            index % 4 === 0
                              ? "bg-[#EEE7FF] text-[#7046E8]"
                              : index % 4 === 1
                                ? "bg-[#FFECEF] text-[#E83E7A]"
                                : index % 4 === 2
                                  ? "bg-[#FFF4D8] text-[#B77A0B]"
                                  : "bg-[#E9FAF3] text-[#249B68]"
                          }
                        `}
                      >
                        <FileText
                          size={18}
                          className="sm:h-5 sm:w-5"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#978B99] sm:text-[9px] sm:tracking-[0.15em]">
                          {paper.year} · Question Paper
                        </p>

                        <h3 className="mt-1 truncate font-display text-sm font-black text-[#211A26] sm:text-lg">
                          {paper.title ||
                            `${paper.year} Question Paper`}
                        </h3>
                      </div>
                    </div>

                    {paper.file_url && (
                      <a
                        href={paper.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-[#249B68] px-2.5 text-[10px] font-extrabold text-white shadow-[0_6px_15px_rgba(36,155,104,0.15)] transition hover:-translate-y-0.5 hover:bg-[#1F875B] sm:h-auto sm:gap-2 sm:rounded-[12px] sm:px-3.5 sm:py-2.5 sm:text-xs"
                      >
                        <span className="hidden sm:inline">
                          Open PDF
                        </span>

                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-[#DCD5DF] bg-white px-4 py-10 text-center shadow-[0_10px_30px_rgba(73,52,91,0.04)] sm:mt-7 sm:rounded-[26px] sm:p-10">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-[17px] bg-[#E9FAF3] text-[#249B68] sm:h-14 sm:w-14 sm:rounded-[18px]">
                <FileQuestion size={23} />
              </div>

              <h3 className="mt-4 font-display text-lg font-black text-[#211A26]">
                No PYQs uploaded yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#817684] sm:text-sm sm:leading-6">
                Previous-year papers will appear here as soon
                as they are uploaded from the admin dashboard.
              </p>
            </div>
          )}
        </section>

        {/* =====================================================
            QUICK TIPS
        ===================================================== */}

        <section className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 sm:grid-cols-3">
          <InfoCard
            icon={Clock3}
            title="Quick Revision"
            description="Use short notes for fast preparation before your exam."
            gradient="from-[#FFECEF] to-[#FFF7F9]"
            iconBg="bg-[#FFECEF]"
            iconColor="text-[#E83E7A]"
          />

          <InfoCard
            icon={Flame}
            title="Exam Focus"
            description="Expected questions highlight topics worth revising carefully."
            gradient="from-[#FFF7E3] to-[#FFFDF7]"
            iconBg="bg-[#FFF4D8]"
            iconColor="text-[#E59A13]"
          />

          <InfoCard
            icon={Download}
            title="Easy Access"
            description="Open uploaded study files directly in your browser whenever you need them."
            gradient="from-[#E9FAF3] to-[#F8FFFB]"
            iconBg="bg-[#E9FAF3]"
            iconColor="text-[#249B68]"
          />
        </section>

        {/* =====================================================
            UNIT NAVIGATION
        ===================================================== */}

        <div className="mt-10 border-t border-[#EAE3ED] pt-6 sm:mt-14 sm:pt-7">
          <div className="grid gap-2.5 sm:grid-cols-3 sm:items-center sm:gap-3">
            {/* Previous */}

            <div className="sm:justify-self-start">
              {previousUnit ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      getUnitPath(
                        previousUnit.unit_number
                      )
                    )
                  }
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-[13px] border border-[#E6DFE8] bg-white px-4 py-3 text-xs font-extrabold text-[#62586A] shadow-sm transition hover:-translate-x-1 hover:border-[#D9CDF1] hover:text-[#7046E8] sm:w-auto sm:rounded-[14px] sm:px-5 sm:text-sm"
                >
                  <ArrowLeft
                    size={16}
                    className="transition group-hover:-translate-x-1"
                  />

                  <span>
                    Unit {previousUnit.unit_number}
                  </span>
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>

            {/* All Units */}

            <div className="sm:justify-self-center">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/semester/${semester.semester_number}/subject/${subject.slug}`
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-[13px] bg-white px-4 py-3 text-xs font-extrabold text-[#62586A] shadow-sm ring-1 ring-[#E6DFE8] transition hover:-translate-y-0.5 hover:text-[#7046E8] sm:w-auto sm:rounded-[14px] sm:px-5 sm:text-sm"
              >
                <Layers3 size={16} />

                All Units
              </button>
            </div>

            {/* Next */}

            <div className="sm:justify-self-end">
              {nextUnit ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      getUnitPath(nextUnit.unit_number)
                    )
                  }
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#211A26] px-4 py-3 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(33,26,38,0.12)] transition hover:translate-x-1 hover:shadow-[0_12px_25px_rgba(33,26,38,0.18)] sm:w-auto sm:rounded-[14px] sm:px-5 sm:text-sm"
                >
                  <span>
                    Unit {nextUnit.unit_number}
                  </span>

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
          </div>

          {/* Progress */}

          {allUnits.length > 0 &&
            currentIndex >= 0 && (
              <div className="mx-auto mt-5 max-w-md sm:mt-6">
                <div className="mb-2 flex items-center justify-between text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#9A909D] sm:text-[9px] sm:tracking-[0.13em]">
                  <span>Course Progress</span>

                  <span>
                    {currentIndex + 1} / {allUnits.length}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#EEE8F0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7046E8] to-[#E83E7A] transition-all duration-700"
                    style={{
                      width: `${
                        ((currentIndex + 1) /
                          allUnits.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}

// =============================================================
// STAT
// =============================================================

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-[15px] border border-white/80 bg-white/60 px-2.5 py-2.5 shadow-sm backdrop-blur-md sm:min-w-[105px] sm:rounded-[18px] sm:px-4 sm:py-3">
      <div className="flex items-center gap-1.5 text-[#7046E8] sm:gap-2">
        <Icon
          size={14}
          className="shrink-0 sm:h-[15px] sm:w-[15px]"
        />

        <span className="truncate text-[7px] font-extrabold uppercase tracking-[0.08em] text-[#817684] sm:text-[9px] sm:tracking-[0.12em]">
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
// RESOURCE CARD
// =============================================================

function ResourceCard({ item, onOpen }) {
  const Icon = item.icon;
  const available = Boolean(item.resource?.file_url);

  const fileUrl = item.resource?.file_url || "";
  const fileName = fileUrl.split("?")[0].split("/").pop()?.toLowerCase() || "";
  const isTxt = fileName.endsWith(".txt");
  const fileLabel = isTxt ? "Open TXT" : "Open PDF";

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!available}
      className={`
        group relative min-h-[220px] overflow-hidden rounded-[22px]
        border border-white/90 bg-gradient-to-br ${item.gradient}
        p-5 text-left shadow-[0_9px_28px_rgba(73,52,91,0.05)]
        transition-all duration-500
        sm:min-h-[250px] sm:rounded-[26px] sm:p-6
        ${
          available
            ? "cursor-pointer hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(73,52,91,0.13)]"
            : "cursor-default opacity-80"
        }
      `}
    >
      {/* Glow */}

      <div className="pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full bg-white/40 blur-2xl transition duration-700 group-hover:scale-125 sm:h-40 sm:w-40" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Icon */}

        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]
            ${item.iconBg} ${item.iconColor}
            shadow-[0_8px_18px_rgba(73,52,91,0.10)]
            ring-4 ring-white/50
            transition duration-500
            sm:h-13 sm:w-13 sm:rounded-[16px]
            ${
              available
                ? "group-hover:scale-110 group-hover:-rotate-3"
                : ""
            }
          `}
        >
          <Icon
            size={20}
            className="sm:h-[22px] sm:w-[22px]"
          />
        </div>

        {/* Status */}

        <div
          className={`
            flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5
            text-[8px] font-extrabold uppercase tracking-[0.06em]
            sm:gap-1.5 sm:px-3 sm:text-[9px] sm:tracking-[0.08em]
            ${
              available
                ? "bg-white/80 text-[#249B68]"
                : "bg-white/65 text-[#918693]"
            }
          `}
        >
          {available ? (
            <>
              <CheckCircle2 size={11} />
              Available
            </>
          ) : (
            <>
              <Clock3 size={11} />
              Soon
            </>
          )}
        </div>
      </div>

      {/* Content */}

      <div className="relative z-10 mt-7 sm:mt-8">
        <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#918693] sm:text-[9px] sm:tracking-[0.15em]">
          {item.label}
        </p>

        <h3 className="mt-1.5 break-words font-display text-[19px] font-black leading-tight tracking-[-0.025em] text-[#211A26] sm:text-[20px]">
          {item.title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-[#716778] sm:text-[13px]">
          {item.description}
        </p>

        {/* Action */}

        <div
          className={`
            mt-5 inline-flex items-center gap-1.5 rounded-[10px]
            px-2.5 py-2 text-[10px] font-extrabold
            sm:mt-6 sm:gap-2 sm:rounded-[11px] sm:px-3 sm:text-xs
            ${
              available
                ? "bg-white/70 text-[#5E5364]"
                : "bg-white/50 text-[#8A8291]"
            }
          `}
        >
          {available ? (
            <>
              <Download size={13} />

              {fileLabel}

              <ExternalLink
                size={11}
                className="transition group-hover:translate-x-0.5"
              />
            </>
          ) : (
            <>
              <Clock3 size={13} />

              Material coming soon
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// =============================================================
// INFO CARD
// =============================================================

function InfoCard({
  icon: Icon,
  title,
  description,
  gradient,
  iconBg,
  iconColor,
}) {
  return (
    <div
      className={`
        rounded-[19px] border border-[#E9E1EC]
        bg-gradient-to-br ${gradient}
        p-4 shadow-[0_7px_24px_rgba(73,52,91,0.04)]
        transition duration-300 hover:-translate-y-1
        sm:rounded-[22px] sm:p-5
      `}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${iconBg} ${iconColor} sm:h-11 sm:w-11 sm:rounded-[14px]`}
        >
          <Icon
            size={18}
            className="sm:h-[19px] sm:w-[19px]"
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-sm font-black text-[#302833]">
            {title}
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-[#817684] sm:text-xs">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Unit;