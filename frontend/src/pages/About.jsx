import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Unit-wise Study Material",
      description:
        "Find study material organized semester-wise, subject-wise and unit-wise so you can reach exactly what you need.",
      className:
        "from-[#f3eeff] to-[#fcfaff] border-[#e7def5]",
      iconClass: "bg-[#eee7ff] text-[#7046e8]",
    },
    {
      icon: FileText,
      title: "Short Notes",
      description:
        "Quick revision material designed to help you revise important concepts without going through lengthy resources.",
      className:
        "from-[#fff0e9] to-[#fffaf7] border-[#f1e0da]",
      iconClass: "bg-[#ffe8df] text-[#df7958]",
    },
    {
      icon: Target,
      title: "Expected Questions",
      description:
        "Focus your preparation on important and exam-oriented questions from the units you are studying.",
      className:
        "from-[#fff8df] to-[#fffdf4] border-[#eee6cc]",
      iconClass: "bg-[#fff1c7] text-[#c7962d]",
    },
    {
      icon: GraduationCap,
      title: "Previous Year Papers",
      description:
        "Practice available previous-year papers and get a better understanding of real AKTU examination patterns.",
      className:
        "from-[#edf8f0] to-[#fafffb] border-[#dcebe1]",
      iconClass: "bg-[#dff2e5] text-[#419d6c]",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: GraduationCap,
      title: "Choose your semester",
      description: "Start by selecting the semester you are currently studying.",
      bg: "bg-[#f3eeff]",
      iconBg: "bg-white text-[#7046e8]",
      numberColor: "text-[#d9caff]",
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Select your subject",
      description: "Open the subject for which you want to prepare.",
      bg: "bg-[#fff0e9]",
      iconBg: "bg-white text-[#df7958]",
      numberColor: "text-[#ffd0bd]",
    },
    {
      number: "03",
      icon: Search,
      title: "Choose a unit",
      description: "Go directly to the unit and explore its available resources.",
      bg: "bg-[#edf8f0]",
      iconBg: "bg-white text-[#419d6c]",
      numberColor: "text-[#c8e8d3]",
    },
    {
      number: "04",
      icon: Zap,
      title: "Study & practice",
      description: "Use notes, questions and PYQs to prepare more strategically.",
      bg: "bg-[#fff8df]",
      iconBg: "bg-white text-[#c7962d]",
      numberColor: "text-[#f0dda0]",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfaf7]">
      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f3ff] via-[#fffdfb] to-[#fff1ea]">
          {/* Background decoration */}

          <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#d8c9ff]/30 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#ffd0bd]/25 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#fff0bd]/25 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              {/* Hero text */}

              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e5dbed] bg-white/80 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7253d8] shadow-sm backdrop-blur">
                  <Sparkles size={12} />
                  About AKTU StudyHub
                </div>

                <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-[-0.05em] text-[#211a26] sm:text-5xl lg:text-[62px]">
                  AKTU preparation,
                  <span className="block bg-gradient-to-r from-[#6847df] via-[#8557df] to-[#e9846d] bg-clip-text text-transparent">
                    made simpler.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#786d7d] sm:text-base">
                  AKTU StudyHub is a student-focused platform designed to
                  bring semester preparation resources together in one simple,
                  organized place.
                </p>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#786d7d] sm:text-base">
                  Instead of searching through scattered PDFs and different
                  sources, students can move from semester to subject to unit
                  and find the material they need.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/semester/1")}
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#211a26] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da]"
                  >
                    Start exploring
                    <ArrowRight
                      size={16}
                      className="transition duration-300 group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/pyqs")}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e3dbe7] bg-white/80 px-5 py-3.5 text-sm font-bold text-[#332a38] shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <FileText size={16} />
                    Browse PYQs
                  </button>
                </div>
              </div>

              {/* Hero visual */}

              <div className="relative mx-auto w-full max-w-lg animate-fade-up">
                {/* Main dashboard-style card */}

                <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_30px_80px_rgba(57,38,77,0.12)] backdrop-blur-xl sm:p-8">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d9caff]/50 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#ffd0bd]/40 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee7ff] text-[#7046e8]">
                        <GraduationCap size={28} />
                      </div>

                      <span className="rounded-full bg-[#edf8f0] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#419d6c]">
                        Student Hub
                      </span>
                    </div>

                    <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#948796]">
                      Your study journey
                    </p>

                    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#211a26] sm:text-3xl">
                      Everything in one flow.
                    </h2>

                    {/* Visual journey */}

                    <div className="mt-7 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-[#f5f0ff] p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7046e8] shadow-sm">
                          <GraduationCap size={17} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-[#332a38]">
                            Semester
                          </p>

                          <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-[#ded3f5]" />
                        </div>

                        <span className="text-[9px] font-bold text-[#8c8092]">
                          01
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-[#fff1eb] p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#df7958] shadow-sm">
                          <BookOpen size={17} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-[#332a38]">
                            Subject
                          </p>

                          <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-[#f2d3c8]" />
                        </div>

                        <span className="text-[9px] font-bold text-[#8c8092]">
                          02
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-[#edf8f0] p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#419d6c] shadow-sm">
                          <FileText size={17} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-[#332a38]">
                            Unit Resources
                          </p>

                          <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-[#cce6d5]" />
                        </div>

                        <span className="text-[9px] font-bold text-[#8c8092]">
                          03
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-[#fff8df] p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#c7962d] shadow-sm">
                          <Target size={17} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-[#332a38]">
                            Prepare
                          </p>

                          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-[#eddfa9]" />
                        </div>

                        <span className="text-[9px] font-bold text-[#8c8092]">
                          04
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}

                <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee7ff] text-[#7046e8]">
                    <Zap size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#938695]">
                      Simple
                    </p>

                    <p className="text-xs font-extrabold text-[#332a38]">
                      Find. Learn. Prepare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            OUR PURPOSE
        ===================================================== */}

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#eee5ff]/50 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              {/* Visual */}

              <div className="order-2 lg:order-1">
                <div className="relative mx-auto max-w-md">
                  <div className="rounded-[30px] border border-[#e8e0eb] bg-[#fcfafc] p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee7ff] text-[#7046e8]">
                        <Lightbulb size={25} />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#968a9b]">
                          The idea
                        </p>

                        <h3 className="mt-1 text-lg font-extrabold text-[#332a38]">
                          Less searching.
                        </h3>
                      </div>
                    </div>

                    <div className="mt-7 space-y-3">
                      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                        <div className="h-3 w-3 rounded-full bg-[#d8c9ff]" />
                        <span className="text-xs font-semibold text-[#756a7a]">
                          Scattered study PDFs
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                        <div className="h-3 w-3 rounded-full bg-[#ffd0bd]" />
                        <span className="text-xs font-semibold text-[#756a7a]">
                          Difficult resource discovery
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                        <div className="h-3 w-3 rounded-full bg-[#fff0bd]" />
                        <span className="text-xs font-semibold text-[#756a7a]">
                          Time wasted before studying
                        </span>
                      </div>
                    </div>

                    <div className="my-6 border-t border-dashed border-[#ddd3e0]" />

                    <div className="rounded-2xl bg-gradient-to-r from-[#f1ebff] to-[#fff0e9] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7046e8] shadow-sm">
                          <CheckCircle2 size={19} />
                        </div>

                        <div>
                          <p className="text-xs font-extrabold text-[#332a38]">
                            Organized StudyHub
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#8d8190]">
                            Find what you need faster.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}

              <div className="order-1 animate-fade-up lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f0ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7253d8]">
                  <Lightbulb size={12} />
                  Our purpose
                </div>

                <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#211a26] sm:text-4xl lg:text-5xl">
                  Studying is hard enough.
                  <span className="block text-[#7046e8]">
                    Finding resources shouldn't be.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#786d7d] sm:text-base">
                  Students often spend valuable preparation time looking for
                  the right notes, PDFs, questions and previous-year papers.
                  AKTU StudyHub aims to make that process more straightforward.
                </p>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#786d7d] sm:text-base">
                  The idea is simple: organize academic resources around the
                  student's natural journey — semester, subject and unit.
                </p>

                <div className="mt-7 flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf8f0] text-[#419d6c]">
                    <CheckCircle2 size={16} />
                  </div>

                  <p className="text-sm font-semibold leading-6 text-[#5f5364]">
                    One clear place to discover study material and prepare
                    more strategically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHAT YOU GET
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#f9f6fa]">
          <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#ffd8c8]/25 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="mx-auto max-w-2xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7253d8] shadow-sm ring-1 ring-[#ebe3ef]">
                <Sparkles size={12} />
                What you get
              </div>

              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#211a26] sm:text-4xl">
                Built around your preparation
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#786d7d] sm:text-base">
                Everything is designed to help you move from finding material
                to actually preparing.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className={`group animate-fade-up rounded-[24px] border bg-gradient-to-br p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl ${feature.className}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconClass} transition duration-300 group-hover:rotate-6`}
                    >
                      <Icon size={22} />
                    </div>

                    <h3 className="mt-5 text-base font-extrabold text-[#302632]">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-[#817586]">
                      {feature.description}
                    </p>

                    <div className="mt-5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#8b7f90]">
                      <CheckCircle2 size={13} />
                      Study smarter
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-[#e4f5e9]/40 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8df] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a77d22]">
                  <Zap size={12} />
                  How it works
                </div>

                <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#211a26] sm:text-4xl lg:text-5xl">
                  Four steps.
                  <span className="block text-[#7046e8]">
                    One simple study journey.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-[#786d7d] sm:text-base">
                  No complicated process. Pick where you are in your academic
                  journey and move directly to the resources you need.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/semester/1")}
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#211a26] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da]"
                >
                  Explore semesters
                  <ArrowRight
                    size={16}
                    className="transition duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className={`group animate-fade-up rounded-[24px] border border-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${step.bg}`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-display text-3xl font-black ${step.numberColor}`}
                        >
                          {step.number}
                        </span>

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${step.iconBg}`}
                        >
                          <Icon size={18} />
                        </div>
                      </div>

                      <h3 className="mt-6 text-sm font-extrabold text-[#332a38]">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-[#817586]">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            COMMUNITY / VISION
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#f9f6fa]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#e6dcff]/30 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:py-24">
            <div className="animate-fade-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#7046e8] shadow-sm ring-1 ring-[#ebe3ef]">
                <Users size={25} />
              </div>

              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8d8190]">
                The vision
              </p>

              <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#211a26] sm:text-4xl lg:text-5xl">
                Make academic preparation feel
                <span className="bg-gradient-to-r from-[#6847df] to-[#e9846d] bg-clip-text text-transparent">
                  {" "}
                  clear and manageable.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#786d7d] sm:text-base">
                AKTU StudyHub is built with a simple philosophy: students
                should spend more time learning and less time figuring out
                where to find what they need.
              </p>

              <div className="mx-auto mt-9 flex max-w-xl flex-wrap justify-center gap-3">
                <span className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#6847df] shadow-sm ring-1 ring-[#e8e0ef]">
                  Organized
                </span>

                <span className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#c86d4f] shadow-sm ring-1 ring-[#eee0db]">
                  Exam-focused
                </span>

                <span className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#419d6c] shadow-sm ring-1 ring-[#dfece4]">
                  Student-friendly
                </span>

                <span className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#a77d22] shadow-sm ring-1 ring-[#eee7d5]">
                  Simple
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#eee5ff]/40 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-24">
            <div className="animate-fade-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e9e1ff] to-[#ffe9df] text-[#6d4bd5] shadow-sm">
                <Sparkles size={24} />
              </div>

              <h2 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.035em] text-[#211a26] sm:text-4xl">
                Ready to start preparing?
                <span className="block bg-gradient-to-r from-[#6847df] to-[#e9846d] bg-clip-text text-transparent">
                  Your study journey starts here.
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#786d7d] sm:text-base">
                Choose your semester and start exploring organized study
                material for your AKTU preparation.
              </p>

              <button
                type="button"
                onClick={() => navigate("/semester/1")}
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#211a26] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#6847df] hover:to-[#9a61da]"
              >
                Explore semesters
                <ArrowRight
                  size={16}
                  className="transition duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;