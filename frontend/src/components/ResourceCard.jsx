import {
  ArrowUpRight,
  BookOpen,
  FileQuestion,
  Flame,
  NotebookPen,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Resource themes
|--------------------------------------------------------------------------
*/

const resourceThemes = {
  notes: {
    icon: BookOpen,
    label: "Study Material",
    title: "Unit-wise Notes",
    description:
      "Complete study material organized unit by unit for every subject.",
    gradient:
      "from-[#F0E9FF] via-[#E8DFFF] to-[#D9CCFF]",
    iconBg: "bg-[#E4D8FF]",
    iconColor: "text-[#7046E8]",
    accent: "#7046E8",
  },

  shortNotes: {
    icon: NotebookPen,
    label: "Quick Revision",
    title: "Short Notes",
    description:
      "Quick revision material designed for efficient last-minute preparation.",
    gradient:
      "from-[#FFECEF] via-[#FFDDE5] to-[#FFC9D7]",
    iconBg: "bg-[#FFDCE7]",
    iconColor: "text-[#E83E7A]",
    accent: "#E83E7A",
  },

  questions: {
    icon: Flame,
    label: "Exam Focus",
    title: "Expected Questions",
    description:
      "Chapter-wise important questions to focus on before your exam.",
    gradient:
      "from-[#FFF7E3] via-[#FFF0C8] to-[#FFE3AA]",
    iconBg: "bg-[#FFE9BD]",
    iconColor: "text-[#E59A13]",
    accent: "#D88908",
  },

  pyqs: {
    icon: FileQuestion,
    label: "Previous Papers",
    title: "5-Year PYQs",
    description:
      "Previous-year question papers organized by semester and subject.",
    gradient:
      "from-[#E9FAF3] via-[#D9F4E8] to-[#BEEAD5]",
    iconBg: "bg-[#D0F0DF]",
    iconColor: "text-[#249B68]",
    accent: "#249B68",
  },
};

function ResourceCard({ type, onClick }) {
  const resource = resourceThemes[type];

  if (!resource) {
    return null;
  }

  const Icon = resource.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        min-h-[225px]
        w-full
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-gradient-to-br
        ${resource.gradient}
        p-6
        text-left
        shadow-[0_8px_24px_rgba(73,52,91,0.07)]
        transition-all
        duration-500
        ease-out
        hover:-translate-y-2
        hover:shadow-[0_22px_44px_rgba(73,52,91,0.14)]
        active:translate-y-0
      `}
    >
      {/* --------------------------------------------------
          Decorative background shapes
      -------------------------------------------------- */}

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -bottom-12
          h-36
          w-36
          rounded-full
          bg-white/25
          blur-sm
          transition-all
          duration-700
          group-hover:scale-125
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-30px]
          bottom-[-35px]
          h-28
          w-52
          rotate-[-25deg]
          rounded-[40px]
          bg-white/15
          transition-all
          duration-700
          group-hover:translate-x-2
        "
      />

      {/* --------------------------------------------------
          Top row
      -------------------------------------------------- */}

      <div className="relative z-10 flex items-start justify-between">

        {/* Icon */}
        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-[14px]
            ${resource.iconBg}
            ${resource.iconColor}
            shadow-sm
            ring-1
            ring-white/60
            backdrop-blur-sm
            transition-all
            duration-500
            group-hover:scale-110
            group-hover:-rotate-3
          `}
        >
          <Icon
            size={22}
            strokeWidth={2}
          />
        </div>

        {/* Arrow */}
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/75
            text-[#606875]
            shadow-sm
            ring-1
            ring-white/70
            backdrop-blur-sm
            transition-all
            duration-500
            group-hover:rotate-6
            group-hover:bg-white
            group-hover:shadow-md
          "
        >
          <ArrowUpRight
            size={17}
            className="
              transition-transform
              duration-500
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </div>
      </div>

      {/* --------------------------------------------------
          Large decorative icon
      -------------------------------------------------- */}

      <div
        className={`
          pointer-events-none
          absolute
          right-5
          top-[58px]
          opacity-[0.10]
          transition-all
          duration-700
          group-hover:scale-110
          group-hover:opacity-[0.18]
          ${resource.iconColor}
        `}
      >
        <Icon
          size={72}
          strokeWidth={1.4}
        />
      </div>

      {/* --------------------------------------------------
          Content
      -------------------------------------------------- */}

      <div className="relative z-10 mt-7">

        {/* Label */}
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#5D6470]/80">
          {resource.label}
        </p>

        {/* Title */}
        <h3 className="mt-1.5 max-w-[90%] font-display text-[20px] font-extrabold leading-tight tracking-[-0.03em] text-[#171923] sm:text-[21px]">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="mt-2 max-w-[95%] text-[13px] font-medium leading-[1.55] text-[#5E6570] sm:text-[14px]">
          {resource.description}
        </p>

        {/* Explore */}
        <div
          className="
            mt-5
            flex
            items-center
            gap-1.5
            text-[12px]
            font-extrabold
            text-[#262A34]
            transition-all
            duration-300
            group-hover:gap-2.5
          "
        >
          <span>Explore resource</span>

          <ArrowUpRight
            size={14}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </div>

        {/* Accent line */}
        <div
          className="
            mt-4
            h-[3px]
            w-8
            rounded-full
            transition-all
            duration-500
            group-hover:w-14
          "
          style={{
            backgroundColor: resource.accent,
          }}
        />
      </div>
    </button>
  );
}

export default ResourceCard;