import {
  BookOpen,
  GitBranch,
  Mail,
  ArrowUpRight,
} from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-[#e9e1ea] bg-[#201a26] text-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">

        {/* =====================================================
            FOOTER MAIN CONTENT
        ===================================================== */}

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#8060ed] to-[#e9957a] shadow-lg">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="font-display text-[16px] font-extrabold">
                  AKTU StudyHub
                </p>

                <p className="text-[11px] text-[#a79baa]">
                  Study smarter. Score better.
                </p>
              </div>

            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-[#aaa0ad]">
              A centralized study platform designed to help AKTU
              students find notes, expected questions and previous-year
              papers without unnecessary sign-ups.
            </p>
          </div>

          {/* =================================================
              PLATFORM
          ================================================= */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8f8392]">
              Platform
            </p>

            <div className="mt-4 flex flex-col gap-3">

              <FooterLink href="#semesters">
                Semesters
              </FooterLink>

              <FooterLink href="#resources">
                Resources
              </FooterLink>

              <FooterLink href="#pyqs">
                Previous Papers
              </FooterLink>

            </div>
          </div>

          {/* =================================================
              CONNECT
          ================================================= */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8f8392]">
              Connect
            </p>

            <div className="mt-4 flex gap-2">

              <SocialButton
                icon={<GitBranch size={16} />}
              />

              <SocialButton
                icon={<Mail size={16} />}
              />

            </div>
          </div>

        </div>

        {/* =====================================================
            COPYRIGHT
        ===================================================== */}

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#857a89] sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 AKTU StudyHub. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Built for students
            <ArrowUpRight size={12} />
          </p>

        </div>

        {/* =====================================================
            MADE WITH LOVE
        ===================================================== */}

        <div className="mt-6 border-t border-white/5 pt-5 text-center">
          <p className="text-sm font-medium text-[#8f8392]">
            Made with{" "}
            <span className="mx-1 text-[#E85D75]">♥</span>
            by{" "}
            <span className="font-bold text-[#b9a3ff]">
              Aman
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER LINK
========================================================= */

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="w-fit text-sm text-[#aaa0ad] transition hover:translate-x-1 hover:text-white"
    >
      {children}
    </a>
  );
}

/* =========================================================
   SOCIAL BUTTON
========================================================= */

function SocialButton({ icon }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#aaa0ad] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      {icon}
    </button>
  );
}

export default Footer;