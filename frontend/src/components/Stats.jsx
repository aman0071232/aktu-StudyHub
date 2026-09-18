import {
  BookOpen,
  FileQuestion,
  Sparkles,
  Users,
} from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    number: "8",
    label: "Semesters",
    gradient: "from-[#EEE7FF] to-[#E4D8FF]",
    iconColor: "text-[#7046E8]",
  },
  {
    icon: FileQuestion,
    number: "5+",
    label: "Years of PYQs",
    gradient: "from-[#FFECEF] to-[#FFDCE7]",
    iconColor: "text-[#E83E7A]",
  },
  {
    icon: Sparkles,
    number: "100%",
    label: "Free Access",
    gradient: "from-[#FFF7E3] to-[#FFE9BD]",
    iconColor: "text-[#E59A13]",
  },
  {
    icon: Users,
    number: "24/7",
    label: "Available",
    gradient: "from-[#E9FAF3] to-[#D2F1E1]",
    iconColor: "text-[#249B68]",
  },
];

function Stats() {
  return (
    <section className="relative overflow-hidden border-b border-[#E9E1EA] bg-gradient-to-r from-[#FCFAFF] via-[#FFFDFC] to-[#FFF9F6]">

      {/* Background glow */}

      <div className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full bg-[#DCCFFF]/20 blur-3xl" />

      <div className="pointer-events-none absolute right-1/4 top-0 h-40 w-40 rounded-full bg-[#FFD4C0]/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-2 sm:grid-cols-4">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`
                group
                relative
                flex
                items-center
                justify-center
                gap-3
                px-5
                py-7
                transition-all
                duration-300
                hover:bg-white/50
                ${
                  index !== 0
                    ? "border-l border-[#EAE3EC]"
                    : ""
                }
                ${
                  index >= 2
                    ? "border-t border-[#EAE3EC] sm:border-t-0"
                    : ""
                }
              `}
            >

              {/* Icon */}

              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-gradient-to-br
                  ${item.gradient}
                  ${item.iconColor}
                  shadow-sm
                  ring-1
                  ring-white
                  transition-all
                  duration-300
                  group-hover:-translate-y-1
                  group-hover:scale-105
                `}
              >
                <Icon size={18} />
              </div>

              {/* Text */}

              <div>
                <p className="font-display text-xl font-extrabold leading-none tracking-[-0.02em] text-[#211A26]">
                  {item.number}
                </p>

                <p className="mt-1 text-[10px] font-semibold text-[#8A7F91] sm:text-[11px]">
                  {item.label}
                </p>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}

export default Stats;