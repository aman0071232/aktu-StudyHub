import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  FileText,
  Layers3,
  Loader2,
  Sparkles,
} from "lucide-react";

import { semesters } from "../data/semesters";
import { supabase } from "../lib/supabase";

export default function Subject() {
  const { semesterNumber, subjectId } = useParams();
  const navigate = useNavigate();

  const semester = semesters.find(
    (item) => item.id === Number(semesterNumber)
  );

  const [dbSubject, setDbSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [pyqs, setPyqs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH SUBJECT DATA
  // ==========================================================

  useEffect(() => {
    if (!semester || !subjectId) {
      setLoading(false);
      return;
    }

    fetchSubjectData();
  }, [semesterNumber, subjectId]);

  async function fetchSubjectData() {
    try {
      setLoading(true);
      setError("");

      // ---------------------------------------------------------
      // FIND SUBJECT
      // ---------------------------------------------------------

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", semester.id)
        .eq("slug", subjectId)
        .single();

      if (subjectError) {
        throw new Error(
          subjectError.message || "Subject could not be found."
        );
      }

      setDbSubject(subjectData);

      // ---------------------------------------------------------
      // GET UNITS
      // ---------------------------------------------------------

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .eq("subject_id", subjectData.id)
        .order("unit_number", {
          ascending: true,
        });

      if (unitsError) {
        throw new Error(unitsError.message);
      }

      const loadedUnits = unitsData || [];

      // ---------------------------------------------------------
      // GET RESOURCE COUNTS FOR ALL UNITS
      // ---------------------------------------------------------

      let unitsWithResources = loadedUnits;

      if (loadedUnits.length > 0) {
        const unitIds = loadedUnits.map((unit) => unit.id);

        const { data: resourcesData, error: resourcesError } =
          await supabase
            .from("resources")
            .select("id, unit_id, resource_type")
            .in("unit_id", unitIds);

        if (resourcesError) {
          console.error("Resource count error:", resourcesError);
        } else {
          const resourceMap = {};

          (resourcesData || []).forEach((resource) => {
            if (!resourceMap[resource.unit_id]) {
              resourceMap[resource.unit_id] = [];
            }

            resourceMap[resource.unit_id].push(resource);
          });

          unitsWithResources = loadedUnits.map((unit) => ({
            ...unit,
            resources: resourceMap[unit.id] || [],
          }));
        }
      }

      setUnits(unitsWithResources);

      // ---------------------------------------------------------
      // GET PYQs
      // ---------------------------------------------------------

      const { data: pyqData, error: pyqError } = await supabase
        .from("pyqs")
        .select("*")
        .eq("subject_id", subjectData.id)
        .order("year", {
          ascending: false,
        });

      if (pyqError) {
        throw new Error(pyqError.message);
      }

      setPyqs(pyqData || []);
    } catch (err) {
      console.error("Subject loading error:", err);

      setError(err.message || "Unable to load subject.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // INVALID SEMESTER
  // ---------------------------------------------------------

  if (!semester) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-4 py-16 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFECEF] text-[#E83E7A] sm:h-16 sm:w-16 sm:rounded-[22px]">
            <BookOpen size={26} className="sm:h-7 sm:w-7" />
          </div>

          <h1 className="font-display text-2xl font-black text-[#292330] sm:text-3xl">
            Semester not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#817687]">
            The semester you're looking for doesn't exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#7046E8] px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#6037D0] sm:w-auto"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-4 py-16 sm:px-5 sm:py-20">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#EEE7FF] text-[#7046E8] shadow-[0_10px_30px_rgba(112,70,232,0.10)] sm:h-16 sm:w-16 sm:rounded-[22px]">
              <Loader2
                size={29}
                className="animate-spin sm:h-[31px] sm:w-[31px]"
              />
            </div>

            <p className="mt-5 text-sm font-bold text-[#817687]">
              Loading subject...
            </p>

            <p className="mt-1 text-xs text-[#A198A4]">
              Fetching units and study material
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // SUBJECT NOT FOUND
  // ---------------------------------------------------------

  if (!dbSubject) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-4 py-16 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFECEF] text-[#E83E7A] sm:h-16 sm:w-16 sm:rounded-[22px]">
            <BookOpen size={26} className="sm:h-7 sm:w-7" />
          </div>

          <h1 className="font-display text-2xl font-black text-[#292330] sm:text-3xl">
            Subject unavailable
          </h1>

          <p className="mt-3 text-sm text-[#817687]">
            This subject could not be found.
          </p>

          {error && (
            <p className="mt-2 break-words text-sm font-semibold text-[#C63768]">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate(`/semester/${semester.id}`)}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B052C8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(112,70,232,0.18)] transition hover:-translate-y-1 sm:w-auto"
          >
            <ArrowLeft size={18} />
            Back to Semester
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // CALCULATED STATS
  // ---------------------------------------------------------

  const totalResources = units.reduce(
    (total, unit) => total + (unit.resources?.length || 0),
    0
  );

  const resourceTypes = new Set(
    units.flatMap((unit) =>
      (unit.resources || []).map(
        (resource) => resource.resource_type
      )
    )
  );

  const gradients = [
    "from-[#EEE7FF] via-[#F9F6FF] to-[#E4D9FF]",
    "from-[#FFECEF] via-[#FFF8F9] to-[#FFD9E5]",
    "from-[#FFF7E3] via-[#FFFDF6] to-[#FFE7B5]",
    "from-[#E9FAF3] via-[#F8FFFB] to-[#CDEEDC]",
    "from-[#F5ECFF] via-[#FFFAFE] to-[#E9D9FF]",
  ];

  const iconBackgrounds = [
    "bg-[#7046E8]",
    "bg-[#E83E7A]",
    "bg-[#E59A13]",
    "bg-[#249B68]",
    "bg-[#8B5CF6]",
  ];

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#fffdfb] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-10">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-44 top-32 h-72 w-72 rounded-full bg-[#EEE7FF] opacity-60 blur-3xl sm:-left-32 sm:h-80 sm:w-80" />

        <div className="absolute -right-40 top-[40%] h-72 w-72 rounded-full bg-[#FFECEF] opacity-50 blur-3xl sm:right-[-80px] sm:h-80 sm:w-80" />

        <div className="absolute bottom-0 left-[25%] h-64 w-64 rounded-full bg-[#FFF4D8] opacity-50 blur-3xl sm:left-[35%] sm:h-72 sm:w-72" />
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="mb-4 flex min-w-0 items-center gap-1 text-[10px] font-semibold text-[#958A99] sm:mb-5 sm:gap-1.5 sm:text-xs">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 transition hover:text-[#7046E8]"
          >
            Home
          </button>

          <ChevronRight size={12} className="shrink-0" />

          <button
            type="button"
            onClick={() =>
              navigate(`/semester/${semester.id}`)
            }
            className="max-w-[32%] truncate transition hover:text-[#7046E8] sm:max-w-none"
          >
            {semester.name}
          </button>

          <ChevronRight size={12} className="shrink-0" />

          <span className="min-w-0 truncate font-bold text-[#5E5364]">
            {dbSubject.name}
          </span>
        </div>

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(`/semester/${semester.id}`)
          }
          className="mb-6 flex items-center gap-2 text-xs font-bold text-[#706678] transition hover:-translate-x-1 hover:text-[#7046E8] sm:mb-7 sm:text-sm"
        >
          <ArrowLeft size={17} />

          Back to {semester.name}
        </button>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[24px] border border-[#E9E1EC] bg-gradient-to-br from-[#EEE7FF] via-[#FFF9FC] to-[#FFE8EF] p-5 shadow-[0_15px_45px_rgba(91,61,122,0.07)] sm:rounded-[32px] sm:p-10">
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/50 blur-3xl sm:-right-20 sm:-top-24 sm:h-72 sm:w-72" />

          <div className="pointer-events-none absolute -bottom-24 right-[5%] h-44 w-44 rounded-full bg-[#E5D8FF]/70 blur-3xl sm:-bottom-20 sm:right-[20%] sm:h-52 sm:w-52" />

          <div className="relative z-10">
            {/* Badge */}

            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7046E8] shadow-sm sm:px-4 sm:text-[10px] sm:tracking-[0.14em]">
              <Sparkles
                size={12}
                className="shrink-0"
              />

              <span className="truncate">
                {semester.name}
              </span>
            </div>

            {/* Title */}

            <h1 className="mt-4 max-w-4xl break-words font-display text-[31px] font-black leading-[1.08] tracking-[-0.045em] text-[#292330] sm:mt-5 sm:text-5xl lg:text-6xl">
              {dbSubject.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#756B7C] sm:mt-5 sm:text-base sm:leading-7">
              Explore complete unit-wise study material, short notes,
              expected questions and previous year question papers.
            </p>

            {/* Stats */}

            <div className="mt-6 flex flex-wrap gap-2 sm:mt-7 sm:gap-2.5">
              <StatPill
                icon={<Layers3 size={14} />}
                value={units.length}
                label={units.length === 1 ? "Unit" : "Units"}
              />

              <StatPill
                icon={<FileText size={14} />}
                value={totalResources}
                label={
                  totalResources === 1
                    ? "Resource"
                    : "Resources"
                }
              />

              <StatPill
                icon={<FileQuestion size={14} />}
                value={pyqs.length}
                label={pyqs.length === 1 ? "PYQ" : "PYQs"}
              />

              {resourceTypes.size > 0 && (
                <StatPill
                  icon={<CheckCircle2 size={14} />}
                  value={resourceTypes.size}
                  label="Resource types"
                />
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#FFD0DC] bg-[#FFF2F5] px-4 py-3.5 text-xs font-semibold leading-5 text-[#C63768] sm:mt-6 sm:px-5 sm:py-4 sm:text-sm">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E83E7A]" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* =====================================================
            UNITS
        ===================================================== */}

        <section className="mt-10 sm:mt-14">
          <div className="mb-6 flex items-end justify-between gap-3 sm:mb-7">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8] sm:text-[10px] sm:tracking-[0.16em]">
                Course Material
              </p>

              <h2 className="mt-1 font-display text-[26px] font-black tracking-[-0.035em] text-[#302A38] sm:text-3xl">
                Explore Units
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#817687] sm:text-sm sm:leading-6">
                Select a unit to access all available resources.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 rounded-[14px] border border-[#F0E7C9] bg-[#FFF9E9] px-4 py-2.5 text-xs font-extrabold text-[#B77A0B] sm:flex">
              <Layers3 size={15} />
              {units.length}{" "}
              {units.length === 1 ? "Unit" : "Units"}
            </div>
          </div>

          {units.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#DDD2E9] bg-white px-4 py-12 text-center shadow-[0_8px_25px_rgba(73,52,91,0.03)] sm:rounded-[28px] sm:px-6 sm:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#EEE7FF] text-[#7046E8] sm:h-16 sm:w-16">
                <BookOpen size={26} />
              </div>

              <h3 className="mt-5 font-display text-xl font-black text-[#393141]">
                Units coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8A8291]">
                Study material for this subject will be added soon.
                Check back later for complete unit-wise resources.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {units.map((unit, index) => {
                const resourceCount =
                  unit.resources?.length || 0;

                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/semester/${semester.id}/subject/${dbSubject.slug}/unit/${unit.unit_number}`
                      )
                    }
                    className={`group relative min-h-[225px] overflow-hidden rounded-[22px] border border-white/80 bg-gradient-to-br ${
                      gradients[index % gradients.length]
                    } p-5 text-left shadow-[0_10px_30px_rgba(91,61,122,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(91,61,122,0.13)] focus:outline-none focus:ring-4 focus:ring-[#7046E8]/10 sm:min-h-[250px] sm:rounded-[28px] sm:p-6`}
                  >
                    {/* Glow */}

                    <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/50 blur-2xl transition duration-500 group-hover:scale-150" />

                    <div className="relative z-10">
                      {/* Top */}

                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                            iconBackgrounds[
                              index % iconBackgrounds.length
                            ]
                          } font-display text-sm font-black text-white shadow-[0_8px_18px_rgba(73,52,91,0.12)] transition duration-300 group-hover:scale-105 group-hover:rotate-[-2deg] sm:h-12 sm:w-12 sm:rounded-[16px] sm:text-base`}
                        >
                          {String(unit.unit_number).padStart(2, "0")}
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#7046E8] transition duration-300 group-hover:translate-x-1 group-hover:bg-white">
                          <ArrowRight size={17} />
                        </div>
                      </div>

                      {/* Unit label */}

                      <div className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8E8297] sm:mt-7 sm:text-[10px]">
                        Unit {unit.unit_number}
                      </div>

                      {/* Title */}

                      <h3 className="mt-1.5 break-words font-display text-[19px] font-black leading-6 text-[#332C3B] sm:text-xl sm:leading-tight">
                        {unit.title}
                      </h3>

                      {/* Description */}

                      {unit.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#756B7C] sm:text-sm sm:leading-6">
                          {unit.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-[#8A8291] sm:text-sm">
                          Access unit-wise study material.
                        </p>
                      )}

                      {/* Resources */}

                      <div className="mt-5 flex items-center justify-between gap-2 sm:mt-6">
                        <div className="flex min-w-0 items-center gap-2 text-[11px] font-extrabold text-[#7046E8] sm:text-xs">
                          <FileText
                            size={14}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {resourceCount === 0
                              ? "Material coming soon"
                              : `${resourceCount} ${
                                  resourceCount === 1
                                    ? "resource"
                                    : "resources"
                                }`}
                          </span>
                        </div>

                        {resourceCount > 0 && (
                          <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-[#6D6175] sm:text-[9px]">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom glow */}

                    <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-white/50 blur-3xl transition duration-500 group-hover:scale-125 sm:h-40 sm:w-40" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            PYQs
        ===================================================== */}

        <section className="mt-12 sm:mt-16">
          <div className="mb-6 flex items-end justify-between gap-3 sm:mb-7">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#E83E7A] sm:text-[10px] sm:tracking-[0.16em]">
                Practice
              </p>

              <h2 className="mt-1 font-display text-[26px] font-black tracking-[-0.035em] text-[#302A38] sm:text-3xl">
                Previous Year Papers
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#817687] sm:text-sm sm:leading-6">
                Practice with previous AKTU question papers.
              </p>
            </div>

            {pyqs.length > 0 && (
              <div className="hidden shrink-0 items-center gap-2 rounded-[14px] border border-[#F2D9E1] bg-[#FFF4F7] px-4 py-2.5 text-xs font-extrabold text-[#C14B72] sm:flex">
                <FileQuestion size={15} />

                {pyqs.length}{" "}
                {pyqs.length === 1 ? "Paper" : "Papers"}
              </div>
            )}
          </div>

          {pyqs.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#E6D9DF] bg-white px-4 py-12 text-center shadow-[0_8px_25px_rgba(73,52,91,0.03)] sm:rounded-[28px] sm:px-6 sm:py-14">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFECEF] text-[#E83E7A] sm:h-16 sm:w-16">
                <FileQuestion size={26} />
              </div>

              <h3 className="mt-5 font-display text-xl font-black text-[#393141]">
                Papers coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8A8291]">
                Previous year papers will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {pyqs.map((paper, index) => {
                const colors = [
                  {
                    bg: "bg-[#EEE7FF]",
                    text: "text-[#7046E8]",
                  },
                  {
                    bg: "bg-[#FFECEF]",
                    text: "text-[#E83E7A]",
                  },
                  {
                    bg: "bg-[#FFF4D8]",
                    text: "text-[#B77A0B]",
                  },
                  {
                    bg: "bg-[#E9FAF3]",
                    text: "text-[#249B68]",
                  },
                ];

                const color = colors[index % colors.length];

                return (
                  <div
                    key={paper.id}
                    className="group flex min-w-0 items-center gap-3 rounded-[19px] border border-[#EEE7F5] bg-white p-3.5 shadow-[0_8px_25px_rgba(91,61,122,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(91,61,122,0.10)] sm:gap-4 sm:rounded-[24px] sm:p-5"
                  >
                    {/* Year */}

                    <div
                      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[14px] ${color.bg} ${color.text} sm:h-14 sm:w-14 sm:rounded-[17px]`}
                    >
                      <FileText size={17} />

                      <span className="mt-0.5 text-[7px] font-black uppercase tracking-wide sm:text-[8px]">
                        PDF
                      </span>
                    </div>

                    {/* Info */}

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg font-black text-[#332C3B] sm:text-xl">
                        {paper.year}
                      </div>

                      <p className="mt-0.5 truncate text-[10px] font-semibold text-[#8A8291] sm:text-xs">
                        {paper.title ||
                          "Previous Year Question Paper"}
                      </p>
                    </div>

                    {/* Open */}

                    {paper.file_url && (
                      <a
                        href={paper.file_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="flex h-9 shrink-0 items-center gap-1 rounded-[10px] bg-[#7046E8] px-2.5 text-[10px] font-extrabold text-white shadow-[0_6px_15px_rgba(112,70,232,0.16)] transition hover:-translate-y-0.5 hover:bg-[#6037D0] sm:h-auto sm:gap-1.5 sm:rounded-[12px] sm:px-3.5 sm:py-2.5 sm:text-xs"
                      >
                        Open
                        <ArrowRight size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            BOTTOM NAVIGATION
        ===================================================== */}

        <section className="mt-12 flex flex-col gap-4 border-t border-[#EEE8F0] pt-7 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <button
            type="button"
            onClick={() =>
              navigate(`/semester/${semester.id}`)
            }
            className="group inline-flex items-center gap-2 text-xs font-extrabold text-[#706678] transition hover:text-[#7046E8] sm:text-sm"
          >
            <ArrowLeft
              size={17}
              className="transition group-hover:-translate-x-1"
            />

            Back to {semester.name}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 text-xs font-extrabold text-[#706678] transition hover:text-[#7046E8] sm:text-sm"
          >
            Browse all semesters

            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-1"
            />
          </button>
        </section>
      </div>
    </main>
  );
}

// =============================================================
// STAT PILL
// =============================================================

function StatPill({ icon, value, label }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-[12px] border border-white/80 bg-white/70 px-2.5 py-2 text-[10px] font-bold text-[#655A6C] shadow-sm backdrop-blur-sm sm:gap-2 sm:rounded-[13px] sm:px-3.5 sm:py-2 sm:text-xs">
      <span className="shrink-0 text-[#7046E8]">
        {icon}
      </span>

      <span className="font-black text-[#332C3B]">
        {value}
      </span>

      <span>{label}</span>
    </div>
  );
}