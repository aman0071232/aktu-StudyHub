import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  BarChart3,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Settings,
  Trophy,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Semester visual themes
|--------------------------------------------------------------------------
| Each semester gets its own pastel gradient + accent color + icon.
*/

const semesterThemes = [
  {
    gradient:
      "from-[#F0E9FF] via-[#E8DFFF] to-[#D9CCFF]",
    accent: "#7046E8",
    numberBg: "bg-[#E6DCFF]",
    numberText: "text-[#6840D8]",
    icon: GraduationCap,
    iconColor: "text-[#8060E8]",
  },

  {
    gradient:
      "from-[#FFECEF] via-[#FFDDE5] to-[#FFC9D7]",
    accent: "#F04F7C",
    numberBg: "bg-[#FFDCE5]",
    numberText: "text-[#E43D6D]",
    icon: FileText,
    iconColor: "text-[#F07899]",
  },

  {
    gradient:
      "from-[#E8F4FF] via-[#D9ECFF] to-[#C8E1FF]",
    accent: "#1672E8",
    numberBg: "bg-[#D6E9FF]",
    numberText: "text-[#1265D2]",
    icon: BookOpen,
    iconColor: "text-[#5B9CEB]",
  },

  {
    gradient:
      "from-[#FFF7E3] via-[#FFF0C8] to-[#FFE5AA]",
    accent: "#E89A14",
    numberBg: "bg-[#FFECC6]",
    numberText: "text-[#C77D00]",
    icon: Lightbulb,
    iconColor: "text-[#E6AD42]",
  },

  {
    gradient:
      "from-[#FFF0F8] via-[#FFE3F2] to-[#FFCFE8]",
    accent: "#E93488",
    numberBg: "bg-[#FFD9ED]",
    numberText: "text-[#D92278]",
    icon: BarChart3,
    iconColor: "text-[#E65C9D]",
  },

  {
    gradient:
      "from-[#E9FAF3] via-[#D9F4E8] to-[#BEEAD5]",
    accent: "#249B68",
    numberBg: "bg-[#D2F1E1]",
    numberText: "text-[#21885D]",
    icon: Settings,
    iconColor: "text-[#53B78A]",
  },

  {
    gradient:
      "from-[#F2EDFF] via-[#E7DDFF] to-[#D7C8FF]",
    accent: "#5E32D8",
    numberBg: "bg-[#E2D7FF]",
    numberText: "text-[#542BC7]",
    icon: Code2,
    iconColor: "text-[#8062DD]",
  },

  {
    gradient:
      "from-[#FFF2E9] via-[#FFE5D5] to-[#FFD4BD]",
    accent: "#E87927",
    numberBg: "bg-[#FFE1CC]",
    numberText: "text-[#D76518]",
    icon: Trophy,
    iconColor: "text-[#ED985F]",
  },
];

function SemesterCard({ number, name }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/semester/${number}`);
  };  const theme =
    semesterThemes[(number - 1) % semesterThemes.length];

  const Icon = theme.icon;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group
        relative
        min-h-[184px]
        w-full
        overflow-hidden
        rounded-[20px]
        border
        border-white/80
        bg-gradient-to-br
        ${theme.gradient}
        p-5
        text-left
        shadow-[0_8px_24px_rgba(73,52,91,0.07)]
        transition-all
        duration-500
        ease-out
        hover:-translate-y-2
        hover:shadow-[0_20px_40px_rgba(73,52,91,0.13)]
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
          -right-7
          -bottom-9
          h-28
          w-28
          rounded-full
          bg-white/25
          blur-[2px]
          transition-all
          duration-700
          group-hover:scale-125
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-10px]
          bottom-[-22px]
          h-24
          w-40
          rotate-[-25deg]
          rounded-[35px]
          bg-white/15
          transition-all
          duration-700
          group-hover:translate-x-2
          group-hover:rotate-[-18deg]
        "
      />

      {/* --------------------------------------------------
          Top row
      -------------------------------------------------- */}

      <div className="relative z-10 flex items-start justify-between">

        {/* Number */}
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-[13px]
            ${theme.numberBg}
            ${theme.numberText}
            shadow-sm
            ring-1
            ring-white/50
            backdrop-blur-sm
            transition-all
            duration-500
            group-hover:scale-110
            group-hover:-rotate-2
          `}
        >
          <span className="font-display text-[14px] font-extrabold">
            {String(number).padStart(2, "0")}
          </span>
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
            text-[#667080]
            shadow-sm
            ring-1
            ring-white/70
            backdrop-blur-sm
            transition-all
            duration-500
            group-hover:-translate-y-0.5
            group-hover:rotate-6
            group-hover:bg-white
            group-hover:shadow-md
          "
        >
          <ArrowUpRight
            size={17}
            strokeWidth={2}
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
          Large background icon
      -------------------------------------------------- */}

      <div
        className={`
          pointer-events-none
          absolute
          right-5
          top-[58px]
          opacity-25
          transition-all
          duration-700
          group-hover:scale-110
          group-hover:rotate-[-5deg]
          group-hover:opacity-40
          ${theme.iconColor}
        `}
      >
        <Icon
          size={52}
          strokeWidth={1.7}
        />
      </div>

      {/* --------------------------------------------------
          Content
      -------------------------------------------------- */}

      <div className="relative z-10 mt-7 max-w-[82%]">

        {/* Small label */}
        <div className="flex items-center gap-1.5">
          <BookOpen
            size={11}
            strokeWidth={2}
            className="text-[#5E6470]/75"
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#59616D]/80">
            Semester
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1.5 font-display text-[18px] font-extrabold leading-tight tracking-[-0.025em] text-[#161925] sm:text-[19px]">
          {name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-[12px] font-medium leading-5 text-[#5E6470] sm:text-[13px]">
          Explore subjects & study material
        </p>

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
            backgroundColor: theme.accent,
          }}
        />
      </div>

      {/* --------------------------------------------------
          Bottom glow
      -------------------------------------------------- */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-16
          w-2/3
          bg-white/10
          blur-xl
          transition-all
          duration-500
          group-hover:bg-white/20
        "
      />
    </button>
  );
}

export default SemesterCard;