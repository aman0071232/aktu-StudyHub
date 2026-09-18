import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { semesters } from "../data/semesters";
import { supabase } from "../lib/supabase";

export default function Semester() {
  const { semesterNumber } = useParams();
  const navigate = useNavigate();

  const semester = semesters.find(
    (item) => item.id === Number(semesterNumber)
  );

  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH SUBJECTS
  // ==========================================================

  useEffect(() => {
    if (!semester) {
      setLoading(false);
      return;
    }

    fetchSubjects();
  }, [semesterNumber]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          *,
          units (
            id
          )
        `)
        .eq("semester_id", semester.id)
        .order("id", {
          ascending: true,
        });

      if (subjectsError) {
        throw new Error(subjectsError.message);
      }

      setSubjects(data || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load subjects.");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INVALID SEMESTER
  // ==========================================================

  if (!semester) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-4 py-16 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFECEF] text-[#E83E7A] sm:h-16 sm:w-16 sm:rounded-3xl">
            <BookOpen size={26} className="sm:h-7 sm:w-7" />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#292330] sm:text-3xl">
            Semester not found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817687]">
            The requested semester could not be found.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              mt-6
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-[#7046E8]
              to-[#B052C8]
              px-6
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-[#7046E8]/20
              transition
              hover:-translate-y-1
              sm:w-auto
            "
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(normalizedSearch)
  );

  // ==========================================================
  // CARD STYLES
  // ==========================================================

  const cardStyles = [
    {
      gradient:
        "from-[#EEE7FF] via-[#FAF7FF] to-[#E3D8FF]",
      iconBg: "bg-[#E3D7FF]",
      iconColor: "text-[#7046E8]",
      numberColor: "text-[#8065D4]",
    },
    {
      gradient:
        "from-[#FFECEF] via-[#FFF8F9] to-[#FFD9E5]",
      iconBg: "bg-[#FFDDE8]",
      iconColor: "text-[#E83E7A]",
      numberColor: "text-[#D26A8C]",
    },
    {
      gradient:
        "from-[#FFF7E3] via-[#FFFDF7] to-[#FFE7B5]",
      iconBg: "bg-[#FFE9B9]",
      iconColor: "text-[#E59A13]",
      numberColor: "text-[#C38A24]",
    },
    {
      gradient:
        "from-[#E9FAF3] via-[#F8FFFB] to-[#CDEEDC]",
      iconBg: "bg-[#D5F0E1]",
      iconColor: "text-[#249B68]",
      numberColor: "text-[#438B67]",
    },
    {
      gradient:
        "from-[#F5ECFF] via-[#FFFAFE] to-[#E9D9FF]",
      iconBg: "bg-[#E8DAFF]",
      iconColor: "text-[#8957D9]",
      numberColor: "text-[#8869BD]",
    },
    {
      gradient:
        "from-[#FFF0E8] via-[#FFF9F5] to-[#FFDCC8]",
      iconBg: "bg-[#FFE0CF]",
      iconColor: "text-[#D87848]",
      numberColor: "text-[#C27855]",
    },
  ];

  // ==========================================================
  // ICONS
  // ==========================================================

  const subjectIcons = [
    BookOpen,
    FileText,
    Layers,
    Sparkles,
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-4 py-16 sm:px-5 sm:py-20">
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE7FF]">
              <Loader2
                size={30}
                className="animate-spin text-[#7046E8]"
              />
            </div>

            <p className="text-sm font-semibold text-[#817687]">
              Loading subjects...
            </p>

            <p className="mt-1 text-xs text-[#A29AA6]">
              Preparing your semester
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#fffdfb] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* ======================================================
          BACKGROUND DECORATIONS
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-44 top-40 h-72 w-72 rounded-full bg-[#EEE7FF] opacity-50 blur-3xl sm:-left-32 sm:h-80 sm:w-80" />

        <div className="absolute -right-40 top-[35%] h-72 w-72 rounded-full bg-[#FFECEF] opacity-50 blur-3xl sm:right-0 sm:h-80 sm:w-80" />

        <div className="absolute bottom-0 left-[25%] h-64 w-64 rounded-full bg-[#FFF4D8] opacity-50 blur-3xl sm:left-[35%] sm:h-72 sm:w-72" />

        <div className="absolute right-[5%] top-[15%] h-48 w-48 rounded-full bg-[#E9FAF3] opacity-30 blur-3xl sm:right-[20%] sm:h-56 sm:w-56" />
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            group
            mb-6
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-[#706678]
            transition-all
            duration-300
            hover:-translate-x-1
            hover:text-[#7046E8]
            sm:mb-8
          "
        >
          <ArrowLeft
            size={18}
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />

          Back to Home
        </button>

        {/* ====================================================
            HERO
        ==================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-[#eee7f5]
            bg-gradient-to-br
            from-[#EEE7FF]
            via-[#FFF9FC]
            to-[#FFE8EF]
            p-5
            shadow-[0_15px_45px_rgba(91,61,122,0.07)]
            sm:rounded-[32px]
            sm:p-10
            lg:p-12
          "
        >
          {/* Decorative blobs */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-white/70 blur-3xl sm:-right-16 sm:-top-20 sm:h-64 sm:w-64" />

          <div className="pointer-events-none absolute -bottom-28 right-[5%] h-48 w-48 rounded-full bg-[#E4D8FF]/70 blur-3xl sm:-bottom-24 sm:right-[16%] sm:h-56 sm:w-56" />

          <div className="pointer-events-none absolute bottom-8 -left-24 h-36 w-36 rounded-full bg-[#FFE3D7]/40 blur-3xl sm:-left-20 sm:h-40 sm:w-40" />

          <div className="relative z-10">
            {/* Badge */}

            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#7046E8] shadow-sm backdrop-blur sm:mb-5 sm:px-4 sm:text-[10px] sm:tracking-[0.16em]">
              <Sparkles size={12} className="shrink-0 sm:h-[13px] sm:w-[13px]" />

              <span className="truncate">
                {semester.name}
              </span>
            </div>

            {/* Heading */}

            <h1 className="max-w-3xl font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#292330] sm:text-5xl lg:text-[54px]">
              Explore your subjects
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#756b7c] sm:mt-5 sm:text-base sm:leading-7">
              Select a subject to explore its units, study notes,
              expected questions and previous year papers.
            </p>

            {/* Hero mini stats */}

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 px-3 py-2.5 text-[11px] font-bold text-[#675C6D] backdrop-blur sm:px-3.5 sm:text-xs">
                <BookOpen
                  size={15}
                  className="shrink-0 text-[#7046E8]"
                />

                {subjects.length}{" "}
                {subjects.length === 1
                  ? "Subject"
                  : "Subjects"}
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 px-3 py-2.5 text-[11px] font-bold text-[#675C6D] backdrop-blur sm:px-3.5 sm:text-xs">
                <Layers
                  size={15}
                  className="shrink-0 text-[#E59A13]"
                />

                Unit-wise learning
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 px-3 py-2.5 text-[11px] font-bold text-[#675C6D] backdrop-blur sm:px-3.5 sm:text-xs">
                <FileText
                  size={15}
                  className="shrink-0 text-[#249B68]"
                />

                Notes + PYQs
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SUBJECT SECTION
        ==================================================== */}

        <section className="mt-10 sm:mt-14">
          {/* Section header */}

          <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8] sm:text-xs sm:tracking-[0.16em]">
                <Layers size={15} />

                Subjects
              </div>

              <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#302a38] sm:text-4xl">
                Choose your subject
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#817687]">
                Select a subject to explore its units and study
                material.
              </p>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b91a2]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subjects..."
                aria-label="Search subjects"
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-[#e5ddeb]
                  bg-white
                  py-3
                  pl-11
                  pr-11
                  text-sm
                  text-[#3d3545]
                  shadow-sm
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-[#aaa1b0]
                  focus:border-[#7046E8]
                  focus:ring-4
                  focus:ring-[#7046E8]/10
                  sm:h-auto
                  sm:py-4
                  sm:pl-12
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear subject search"
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-7
                    w-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-[#9B91A2]
                    transition
                    hover:bg-[#F3EEF5]
                    hover:text-[#7046E8]
                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#ffd0dc] bg-[#fff2f5] px-4 py-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#c63768]">
                  Unable to load subjects
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-[#d66b8e]">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSubjects}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#c63768] shadow-sm transition hover:-translate-y-0.5 sm:w-fit sm:shrink-0"
              >
                Try again
              </button>
            </div>
          )}

          {/* ==================================================
              SEARCH RESULT COUNT
          ================================================== */}

          {subjects.length > 0 && (
            <div className="mb-5 flex min-w-0 items-center justify-between gap-3 sm:mb-6">
              <p className="text-[11px] font-semibold text-[#8C8291] sm:text-xs">
                {search
                  ? `${filteredSubjects.length} ${
                      filteredSubjects.length === 1
                        ? "subject"
                        : "subjects"
                    } found`
                  : `${subjects.length} ${
                      subjects.length === 1
                        ? "subject"
                        : "subjects"
                    } available`}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 text-[11px] font-bold text-[#7046E8] transition hover:text-[#5632C1] sm:text-xs"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* ==================================================
              NO SUBJECTS
          ================================================== */}

          {filteredSubjects.length === 0 ? (
            <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[#ddd2e9] bg-white px-4 py-12 text-center shadow-sm sm:rounded-[30px] sm:px-6 sm:py-16">
              <div className="pointer-events-none absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 rounded-full bg-[#EEE7FF]/60 blur-3xl sm:h-40 sm:w-40" />

              <div className="relative">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#EEE7FF] text-[#7046E8] sm:h-16 sm:w-16 sm:rounded-3xl">
                  {search ? (
                    <Search size={25} />
                  ) : (
                    <BookOpen size={27} />
                  )}
                </div>

                <h3 className="font-display text-xl font-bold text-[#393141] sm:text-2xl">
                  {search
                    ? "No subjects found"
                    : "Subjects coming soon"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a8291]">
                  {search
                    ? `We couldn't find a subject matching "${search}". Try a different name.`
                    : "Study material for this semester will be added soon."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      bg-[#211A26]
                      px-5
                      py-3
                      text-xs
                      font-bold
                      text-white
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#7046E8]
                      sm:w-auto
                    "
                  >
                    Show all subjects
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ==================================================
               SUBJECT GRID
            ================================================== */

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {filteredSubjects.map((subject, index) => {
                const style =
                  cardStyles[index % cardStyles.length];

                const Icon =
                  subjectIcons[index % subjectIcons.length];

                const unitCount =
                  subject.units?.length || 0;

                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/semester/${semester.id}/subject/${subject.slug}`
                      )
                    }
                    className={`
                      group
                      animate-fade-up
                      relative
                      min-w-0
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-white/90
                      bg-gradient-to-br
                      ${style.gradient}
                      p-5
                      text-left
                      shadow-[0_10px_30px_rgba(91,61,122,0.06)]
                      transition-all
                      duration-500
                      hover:-translate-y-2
                      hover:shadow-[0_24px_50px_rgba(91,61,122,0.13)]
                      focus:outline-none
                      focus:ring-4
                      focus:ring-[#7046E8]/10
                      sm:rounded-[28px]
                      sm:p-6
                    `}
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    {/* Decorative glow */}

                    <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-white/50 blur-3xl transition duration-700 group-hover:scale-150 sm:h-44 sm:w-44" />

                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/30 blur-2xl transition duration-700 group-hover:scale-125 sm:h-24 sm:w-24" />

                    <div className="relative z-10">
                      {/* =================================================
                          TOP
                      ================================================= */}

                      <div className="mb-6 flex items-center justify-between sm:mb-7">
                        <div
                          className={`
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-[15px]
                            ${style.iconBg}
                            shadow-sm
                            transition-all
                            duration-500
                            group-hover:scale-105
                            group-hover:rotate-[-3deg]
                            sm:h-14
                            sm:w-14
                            sm:rounded-2xl
                          `}
                        >
                          <Icon
                            size={22}
                            strokeWidth={2}
                            className={style.iconColor}
                          />
                        </div>

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-white/70
                            text-[#7046E8]
                            shadow-sm
                            transition-all
                            duration-300
                            group-hover:translate-x-1
                            group-hover:bg-white
                            sm:h-10
                            sm:w-10
                          "
                        >
                          <ArrowRight size={17} />
                        </div>
                      </div>

                      {/* =================================================
                          NUMBER
                      ================================================= */}

                      <div
                        className={`
                          mb-2
                          text-[9px]
                          font-extrabold
                          uppercase
                          tracking-[0.17em]
                          ${style.numberColor}
                          sm:text-[10px]
                          sm:tracking-[0.18em]
                        `}
                      >
                        Subject{" "}
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* =================================================
                          NAME
                      ================================================= */}

                      <h3 className="min-h-0 break-words font-display text-[19px] font-extrabold leading-6 tracking-[-0.025em] text-[#332c3b] sm:min-h-[58px] sm:text-xl sm:leading-7">
                        {subject.name}
                      </h3>

                      {/* =================================================
                          DIVIDER
                      ================================================= */}

                      <div className="my-4 h-px bg-white/60 sm:my-5" />

                      {/* =================================================
                          UNIT COUNT
                      ================================================= */}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#6f6877] sm:text-sm">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/65">
                            <Layers
                              size={14}
                              className={style.iconColor}
                            />
                          </div>

                          <span>
                            {unitCount}{" "}
                            {unitCount === 1
                              ? "unit"
                              : "units"}
                          </span>
                        </div>

                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#938897] sm:text-[10px]">
                          Explore
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ==================================================
              TOTAL COUNT
          ================================================== */}

          {subjects.length > 0 && !search && (
            <div className="mt-7 flex justify-center sm:mt-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eee7f5] bg-white px-3.5 py-2.5 text-[11px] font-bold text-[#7b7082] shadow-sm sm:px-4 sm:text-xs">
                <FileText
                  size={14}
                  className="text-[#7046E8]"
                />

                {subjects.length}{" "}
                {subjects.length === 1
                  ? "subject"
                  : "subjects"}{" "}
                available
              </div>
            </div>
          )}
        </section>

        {/* ====================================================
            BOTTOM SPACING
        ==================================================== */}

        <div className="h-14 sm:h-20" />
      </div>
    </main>
  );
}