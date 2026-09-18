import {
  ArrowRight,
  BookOpen,
  FileQuestion,
  Search,
  Sparkles,
  NotebookPen,
  GraduationCap,
} from "lucide-react";

function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-[#eee8ef] bg-[#fffdfb]"
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 animate-pulse-soft rounded-full bg-[#D9CCFF]/35 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 animate-pulse-soft rounded-full bg-[#FFD4C0]/30 blur-3xl [animation-delay:1.5s]" />

      <div className="pointer-events-none absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 animate-pulse-soft rounded-full bg-[#F5C8DF]/20 blur-3xl [animation-delay:3s]" />

      {/* Decorative icons */}

      <div className="pointer-events-none absolute left-[8%] top-[28%] hidden animate-float text-[#8060E8]/25 lg:block">
        <Sparkles size={28} />
      </div>

      <div className="pointer-events-none absolute right-[8%] top-[32%] hidden animate-float-side text-[#E79A70]/30 lg:block">
        <GraduationCap size={36} />
      </div>

      <div className="pointer-events-none absolute bottom-[18%] left-[15%] hidden animate-float-side text-[#E39ABB]/25 lg:block">
        <NotebookPen size={27} />
      </div>

      {/* =====================================================
          HERO CONTAINER
      ===================================================== */}

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:px-10 lg:pb-20 lg:pt-20">
        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}

          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#E2D7FA] bg-gradient-to-r from-[#F1EBFF] via-[#FFF1F5] to-[#FFF5ED] px-4 py-2 text-xs font-bold text-[#6544D7] shadow-sm sm:text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <Sparkles size={12} />
            </span>
            Built specially for AKTU students
          </div>

          {/* Heading */}

          <h1 className="animate-fade-up delay-100 mt-6 font-display text-[40px] font-extrabold leading-[1.08] tracking-[-0.055em] text-[#171520] sm:text-6xl lg:text-[66px]">
            Your entire AKTU
            <span className="mt-1 block bg-gradient-to-r from-[#6744E4] via-[#A24BC9] to-[#E87591] bg-clip-text text-transparent">
              preparation, in one place.
            </span>
          </h1>

          {/* Description */}

          <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#716878] sm:text-[17px]">
            Unit-wise notes, quick revision material, expected questions and
            previous-year papers — beautifully organized semester by semester.
          </p>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="animate-scale-in delay-300 mx-auto mt-8 flex w-full max-w-2xl items-center rounded-[18px] border border-[#E4DCE8] bg-white/90 p-2 shadow-[0_18px_50px_rgba(82,58,99,0.09)] backdrop-blur-xl transition-all duration-300 focus-within:border-[#C7B6F2] focus-within:shadow-[0_20px_60px_rgba(112,70,232,0.14)]">
            <div className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#E8DFFF] to-[#FFE6EE] text-[#7046E8]">
              <Search size={18} />
            </div>

            <input
              id="global-search"
              type="text"
              placeholder="Search subjects, topics, notes or papers..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-medium text-[#28222D] outline-none placeholder:text-[#A49AA7] sm:text-[15px]"
            />

            <button
              type="button"
              className="group flex shrink-0 items-center gap-2 rounded-[13px] bg-gradient-to-r from-[#7046E8] via-[#824FE2] to-[#B15CCB] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7046E8]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#7046E8]/30"
            >
              Search
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* =================================================
              STUDY RESOURCES PREVIEW
          ================================================= */}

          <div className="animate-fade-up delay-400 relative mx-auto mt-12 max-w-5xl">
            {/* Outer frame */}

            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-[#E6DDEA]
                bg-gradient-to-br
                from-[#F3EEFF]
                via-[#FFFDFC]
                to-[#FFF1EA]
                p-3
                shadow-[0_25px_70px_rgba(78,57,91,0.11)]
                sm:p-4
              "
            >
              {/* Decorative background glow */}

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#D9CCFF]/35 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 left-20 h-52 w-52 rounded-full bg-[#FFD0DF]/25 blur-3xl" />

              {/* Inner frame */}

              <div className="relative rounded-[22px] border border-white/90 bg-white/55 p-5 backdrop-blur-xl sm:p-6">
                {/* Header */}

                <div className="flex items-center justify-between border-b border-[#EAE2ED] pb-5">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E4D8FF] to-[#FFDDEB] text-[#7046E8] shadow-sm">
                      <BookOpen size={20} />
                    </div>

                    <div>
                      <p className="font-display text-sm font-extrabold text-[#302834] sm:text-[15px]">
                        Study Resources
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#968B9B] sm:text-xs">
                        Everything organized for your semester
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-white bg-gradient-to-r from-[#EEE8FF] to-[#FFF0F4] px-3.5 py-1.5 text-[10px] font-extrabold text-[#6E4BD4] shadow-sm sm:text-xs">
                    8 Semesters
                  </div>
                </div>

                {/* Resource previews */}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PreviewCard
                    icon={<BookOpen size={20} />}
                    title="Unit Notes"
                    gradient="from-[#EEE7FF] via-[#E5DCFF] to-[#D9CCFF]"
                    iconBg="bg-[#E2D7FF]"
                    iconColor="text-[#7046E8]"
                  />

                  <PreviewCard
                    icon={<NotebookPen size={20} />}
                    title="Short Notes"
                    gradient="from-[#FFECEF] via-[#FFDDE5] to-[#FFC9D7]"
                    iconBg="bg-[#FFDCE7]"
                    iconColor="text-[#E83E7A]"
                  />

                  <PreviewCard
                    icon={<Sparkles size={20} />}
                    title="Expected Qs"
                    gradient="from-[#FFF7E3] via-[#FFF0C8] to-[#FFE2AA]"
                    iconBg="bg-[#FFE9BD]"
                    iconColor="text-[#E59A13]"
                  />

                  <PreviewCard
                    icon={<FileQuestion size={20} />}
                    title="5-Year PYQs"
                    gradient="from-[#E9FAF3] via-[#D9F4E8] to-[#BEEAD5]"
                    iconBg="bg-[#D2F1E1]"
                    iconColor="text-[#249B68]"
                  />
                </div>
              </div>
            </div>

            {/* Floating decoration */}

            <div className="pointer-events-none absolute -left-8 top-1/2 hidden -translate-y-1/2 animate-float text-[#E7A6C2]/30 lg:block">
              <NotebookPen size={28} />
            </div>
          </div>

          {/* =================================================
              CTA BUTTONS
          ================================================= */}

          <div className="animate-fade-up delay-500 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Primary */}

            <a
              href="#semesters"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#7046E8]
                via-[#8050E2]
                to-[#A958D0]
                px-6
                py-3.5
                text-sm
                font-extrabold
                text-white
                shadow-[0_10px_25px_rgba(112,70,232,0.22)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_16px_32px_rgba(112,70,232,0.28)]
              "
            >
              Explore Semesters
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            {/* Secondary */}

            <a
              href="#resources"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-[14px]
                border
                border-[#DDD3E2]
                bg-gradient-to-br
                from-white
                to-[#FAF5FF]
                px-6
                py-3.5
                text-sm
                font-bold
                text-[#514757]
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#CFC0F3]
                hover:text-[#6846D4]
                hover:shadow-md
              "
            >
              Browse Resources
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PREVIEW CARD
========================================================= */

function PreviewCard({ icon, title, gradient, iconBg, iconColor }) {
  return (
    <div
      className={`
        group
        relative
        min-h-[115px]
        overflow-hidden
        rounded-[18px]
        border
        border-white/90
        bg-gradient-to-br
        ${gradient}
        p-4
        text-left
        shadow-[0_5px_18px_rgba(73,52,91,0.06)]
        transition-all
        duration-500
        hover:-translate-y-1.5
        hover:shadow-[0_14px_28px_rgba(73,52,91,0.11)]
      `}
    >
      {/* Decorative circle */}

      <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-white/25 transition duration-500 group-hover:scale-125" />

      {/* Icon */}

      <div
        className={`
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-[12px]
          ${iconBg}
          ${iconColor}
          shadow-sm
          ring-1
          ring-white/70
          transition-all
          duration-500
          group-hover:scale-110
          group-hover:-rotate-3
        `}
      >
        {icon}
      </div>

      {/* Title */}

      <p className="relative mt-4 font-display text-[13px] font-extrabold text-[#38313D] sm:text-[14px]">
        {title}
      </p>
    </div>
  );
}

export default Hero;
