import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import SemesterCard from "../components/SemesterCard";
import ResourceCard from "../components/ResourceCard";
import Stats from "../components/Stats";

const semesters = [
  { number: 1, name: "1st Semester" },
  { number: 2, name: "2nd Semester" },
  { number: 3, name: "3rd Semester" },
  { number: 4, name: "4th Semester" },
  { number: 5, name: "5th Semester" },
  { number: 6, name: "6th Semester" },
  { number: 7, name: "7th Semester" },
  { number: 8, name: "8th Semester" },
];

const resources = ["notes", "shortNotes", "questions", "pyqs"];

function Home() {
  const navigate = useNavigate();

  // ============================================================
  // SMOOTH SCROLL HELPER
  // ============================================================

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fcfaf7]">
      <main className="w-full overflow-x-hidden">
        {/* =====================================================
            HERO
        ===================================================== */}

        <Hero />

        {/* =====================================================
            STATS
        ===================================================== */}

        <Stats />

        {/* =====================================================
            SEMESTERS
        ===================================================== */}

        <section
          id="semesters"
          className="relative scroll-mt-20 overflow-hidden bg-[#f9f6fa]"
        >
          {/* Background decorations */}

          <div className="pointer-events-none absolute -left-40 top-20 h-64 w-64 rounded-full bg-[#d8c9ff]/20 blur-3xl sm:-left-32 sm:h-72 sm:w-72" />

          <div className="pointer-events-none absolute -right-40 bottom-10 h-64 w-64 rounded-full bg-[#ffd0bd]/20 blur-3xl sm:-right-32 sm:h-80 sm:w-80" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#fff0bd]/10 blur-3xl sm:h-56 sm:w-56" />

          <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            {/* Section heading */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
              <div className="animate-fade-up min-w-0 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7253d8] shadow-sm ring-1 ring-[#ebe2ef] sm:text-[10px] sm:tracking-[0.16em]">
                  <Sparkles size={12} />
                  Explore
                </div>

                <h2 className="mt-4 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#211a26] sm:text-4xl lg:text-[42px]">
                  Choose your semester
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#786d7d] sm:text-base">
                  Select your semester to discover subjects, notes, expected
                  questions and previous-year papers.
                </p>
              </div>

              {/* Browse PYQs */}

              <button
                type="button"
                onClick={() => navigate("/pyqs")}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#211a26] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da] sm:mt-0 sm:w-auto sm:shrink-0"
              >
                Browse PYQs

                <span className="transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            {/* Semester cards */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {semesters.map((semester, index) => (
                <div
                  key={semester.number}
                  className="animate-fade-up min-w-0"
                  style={{
                    animationDelay: `${100 + index * 70}ms`,
                  }}
                >
                  <SemesterCard
                    number={semester.number}
                    name={semester.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            RESOURCES
        ===================================================== */}

        <section
          id="resources"
          className="relative scroll-mt-20 overflow-hidden bg-white"
        >
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#eee5ff]/40 blur-3xl sm:right-0 sm:h-96 sm:w-96" />

          <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-[#ffe4d9]/20 blur-3xl sm:-left-20 sm:h-72 sm:w-72" />

          <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="animate-fade-up max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f0ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7253d8] sm:text-[10px] sm:tracking-[0.16em]">
                <Sparkles size={12} />
                Resources
              </div>

              <h2 className="mt-4 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#211a26] sm:text-4xl lg:text-[42px]">
                Everything you need to prepare
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#786d7d] sm:text-base">
                Learn the chapter, revise faster, practice important questions
                and analyze previous-year papers.
              </p>
            </div>

            {/* Resource cards */}

            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {resources.map((type, index) => (
                <div
                  key={type}
                  className="animate-fade-up min-w-0"
                  style={{
                    animationDelay: `${150 + index * 100}ms`,
                  }}
                >
                  <ResourceCard type={type} />
                </div>
              ))}
            </div>

            {/* Small resource guidance */}

            <div className="mt-6 flex flex-col gap-4 rounded-[18px] border border-[#eee7f1] bg-[#fcfafc] p-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:rounded-[20px] sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#332a38]">
                  Everything is organized unit-wise.
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8a7f8d]">
                  Choose a semester and subject to find the exact material you
                  need.
                </p>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection("semesters")}
                className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#211a26] px-4 py-2.5 text-xs font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7046E8] sm:w-fit"
              >
                Explore semesters

                <span className="transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            PYQ FEATURE
        ===================================================== */}

        <section
          id="pyqs"
          className="relative scroll-mt-20 overflow-hidden bg-[#f9f6fa]"
        >
          <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-[#d9caff]/20 blur-3xl sm:-left-32 sm:h-80 sm:w-80" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#ffd1bd]/20 blur-3xl sm:-right-32 sm:h-96 sm:w-96" />

          <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="gradient-border animate-fade-up relative overflow-hidden rounded-[24px] border border-[#e7dfea] bg-gradient-to-br from-[#f1ebff] via-[#fffdfb] to-[#fff0e9] p-5 shadow-sm sm:rounded-[30px] sm:p-10 lg:p-14">
              {/* Animated blobs */}

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 animate-float rounded-full bg-[#cdbdff]/35 blur-3xl sm:-right-16 sm:-top-16 sm:h-64 sm:w-64" />

              <div className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 animate-pulse-soft rounded-full bg-[#ffb895]/25 blur-3xl sm:-bottom-20 sm:right-32 sm:h-56 sm:w-56" />

              <div className="pointer-events-none absolute -left-24 bottom-10 h-36 w-36 rounded-full bg-[#e4f5e9]/50 blur-3xl sm:-left-20 sm:h-40 sm:w-40" />

              <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dfd2fa] bg-white/70 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7253d8] backdrop-blur sm:text-[10px] sm:tracking-[0.16em]">
                  <Sparkles size={12} />
                  Previous Year Papers
                </div>

                <h2 className="mt-4 max-w-xl font-display text-[30px] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#211a26] sm:mt-5 sm:text-4xl lg:text-5xl">
                  Practice what AKTU has actually asked.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#776b7d] sm:mt-5 sm:text-base sm:leading-7">
                  Find previous-year papers by semester, subject and year.
                  Practice real exam patterns and prepare with greater
                  confidence.
                </p>

                {/* Browse PYQs */}

                <button
                  type="button"
                  onClick={() => navigate("/pyqs")}
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#211a26] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da] sm:mt-8 sm:w-auto"
                >
                  Browse PYQs

                  <span className="transition duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <p className="mt-3 text-[10px] font-semibold leading-5 text-[#968b9b]">
                  Choose a semester and subject to access available papers.
                </p>
              </div>

              {/* Floating paper */}

              <div className="absolute bottom-8 right-10 hidden w-64 rotate-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xl backdrop-blur-md lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f6ed] text-[#419d6c]">
                    📄
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#332a38]">
                      Previous Papers
                    </p>

                    <p className="text-[10px] text-[#978c9c]">
                      2021 — 2025
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-2 rounded-full bg-[#eee8f1]" />
                  <div className="h-2 w-4/5 rounded-full bg-[#eee8f1]" />
                  <div className="h-2 w-3/5 rounded-full bg-[#eee8f1]" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#e8f6ed] px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-[#419d6c]">
                    Practice
                  </span>

                  <span className="text-[10px] font-bold text-[#8f8493]">
                    PDF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#eee5ff]/40 blur-3xl sm:h-72 sm:w-72" />

          <div className="relative mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-8 sm:py-20">
            <div className="animate-fade-up">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e9e1ff] to-[#ffe9df] text-[#6d4bd5] shadow-sm sm:h-14 sm:w-14">
                <Sparkles size={22} className="sm:h-6 sm:w-6" />
              </div>

              <h2 className="mt-5 font-display text-[30px] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#211a26] sm:mt-6 sm:text-4xl">
                Study less randomly.

                <span className="block bg-gradient-to-r from-[#6847df] to-[#e9846d] bg-clip-text text-transparent">
                  Prepare more strategically.
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#786d7d] sm:text-base sm:leading-7">
                Everything you need for your AKTU preparation, organized
                exactly where you need it.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection("semesters")}
                className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#211a26] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da] sm:mt-7 sm:w-auto"
              >
                Start exploring

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;