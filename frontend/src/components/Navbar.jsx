import {
  ArrowRight,
  BookOpen,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");

  // ==========================================================
  // SCROLL STATE
  // ==========================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ==========================================================
  // DETERMINE ACTIVE NAV ITEM FROM CURRENT ROUTE
  // ==========================================================

  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;

    // Search
    if (path === "/search") {
      setActive("Search");
      return;
    }

    // About page
    if (path === "/about") {
      setActive("About");
      return;
    }

    // PYQ page
    if (path === "/pyqs") {
      setActive("PYQs");
      return;
    }

    // Admin pages
    if (path.startsWith("/admin")) {
      setActive("");
      return;
    }

    // Semester pages
    if (path.startsWith("/semester")) {
      setActive("Semesters");
      return;
    }

    // Home page
    if (path === "/") {
      if (hash === "#semesters") {
        setActive("Semesters");
      } else if (hash === "#resources") {
        setActive("Resources");
      } else if (hash === "#pyqs") {
        setActive("PYQs");
      } else if (hash === "#about") {
        setActive("About");
      } else {
        setActive("Home");
      }

      return;
    }

    setActive("");
  }, [location.pathname, location.hash]);

  // ==========================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      // "/" → Search
      if (event.key === "/" && !isTyping(event)) {
        event.preventDefault();

        // Already on search page
        if (location.pathname === "/search") {
          document.getElementById("global-search")?.focus();
          return;
        }

        navigate("/search");
        return;
      }

      // Escape → close mobile menu
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location.pathname, navigate]);

  // ==========================================================
  // GO TO HOME + SECTION
  // ==========================================================

  const goToHomeSection = (section) => {
    setMobileOpen(false);

    // Already on homepage
    if (location.pathname === "/") {
      if (!section) {
        window.history.replaceState(null, "", "/");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        setActive("Home");
        return;
      }

      const element = document.getElementById(section);

      if (element) {
        window.history.replaceState(null, "", `/#${section}`);

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        if (section === "semesters") {
          setActive("Semesters");
        } else if (section === "resources") {
          setActive("Resources");
        } else if (section === "pyqs") {
          setActive("PYQs");
        }

        return;
      }
    }

    // Coming from another route
    if (section) {
      navigate(`/#${section}`);
    } else {
      navigate("/");
    }
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation = (name, section = null) => {
    setActive(name);
    setMobileOpen(false);

    // HOME
    if (name === "Home") {
      goToHomeSection(null);
      return;
    }

    // SEMESTERS
    if (name === "Semesters") {
      goToHomeSection("semesters");
      return;
    }

    // RESOURCES
    if (name === "Resources") {
      goToHomeSection("resources");
      return;
    }

    // ========================================================
    // PYQs → DEDICATED PAGE
    // ========================================================

    if (name === "PYQs") {
      navigate("/pyqs");
      return;
    }

    // ========================================================
    // ABOUT → DEDICATED PAGE
    // ========================================================

    if (name === "About") {
      navigate("/about");
      return;
    }

    // SEARCH
    if (name === "Search") {
      navigate("/search");
      return;
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchClick = () => {
    setMobileOpen(false);

    if (location.pathname === "/search") {
      setTimeout(() => {
        document.getElementById("global-search")?.focus();
      }, 50);

      return;
    }

    navigate("/search");
  };

  // ==========================================================
  // ADMIN ROUTES
  // ==========================================================

  const isAdminRoute = location.pathname.startsWith("/admin");

  // ==========================================================
  // ADMIN NAVBAR
  // ==========================================================

  if (isAdminRoute) {
    return (
      <>
        <header
          className="
            fixed
            left-0
            right-0
            top-0
            z-50
            border-b
            border-[#eee7ef]
            bg-[#fffdfb]/95
            backdrop-blur-xl
          "
        >
          <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 sm:px-7 lg:px-8">
            {/* Admin brand */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-3"
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-gradient-to-br
                  from-[#7046E8]
                  via-[#8152DF]
                  to-[#C45BB8]
                  shadow-[0_8px_20px_rgba(112,70,232,0.20)]
                  transition-all
                  duration-300
                  group-hover:-translate-y-0.5
                "
              >
                <BookOpen size={20} className="text-white" />
              </div>

              <div className="text-left">
                <p className="font-display text-[15px] font-extrabold tracking-[-0.025em] text-[#211A26]">
                  AKTU StudyHub
                </p>

                <p className="text-[9px] font-semibold text-[#928793]">
                  Admin Portal
                </p>
              </div>
            </button>

            {/* View website */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                group
                flex
                items-center
                gap-1.5
                rounded-[12px]
                bg-gradient-to-r
                from-[#7046E8]
                to-[#B15AC8]
                px-4
                py-2.5
                text-xs
                font-extrabold
                text-white
                shadow-[0_8px_20px_rgba(112,70,232,0.16)]
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
            >
              View Website

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </header>

        <div className="h-[68px]" />
      </>
    );
  }

  // ==========================================================
  // MAIN NAVBAR
  // ==========================================================

  return (
    <>
      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          border-b
          border-[#eee7ef]/80
          bg-[#fffdfb]/90
          backdrop-blur-xl
          transition-all
          duration-500
        "
      >
        <div
          className={`
            mx-auto
            flex
            h-[72px]
            w-full
            max-w-7xl
            items-center
            justify-between
            px-5
            transition-all
            duration-500
            sm:px-7
            lg:px-8
            ${scrolled ? "h-[68px]" : ""}
          `}
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <button
            type="button"
            onClick={() => handleNavigation("Home")}
            className="group relative flex shrink-0 items-center gap-3"
          >
            {/* Logo */}

            <div className="relative">
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#8E6AF2] to-[#F18CA9] opacity-0 blur-xl transition duration-500 group-hover:opacity-40" />

              <div
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[14px]
                  bg-gradient-to-br
                  from-[#7046E8]
                  via-[#8152DF]
                  to-[#C45BB8]
                  shadow-[0_8px_20px_rgba(112,70,232,0.20)]
                  transition-all
                  duration-500
                  group-hover:-translate-y-1
                  group-hover:rotate-[-3deg]
                  group-hover:shadow-[0_14px_28px_rgba(112,70,232,0.28)]
                "
              >
                <BookOpen
                  size={21}
                  strokeWidth={2}
                  className="relative z-10 text-white transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute -left-8 top-0 h-full w-5 rotate-[20deg] bg-white/30 blur-sm transition-all duration-700 group-hover:left-14" />

                <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/20 blur-md" />
              </div>

              <Sparkles
                size={11}
                className="
                  absolute
                  -right-2
                  -top-2
                  text-[#E98BAA]
                  opacity-0
                  transition-all
                  duration-500
                  group-hover:rotate-12
                  group-hover:opacity-100
                "
              />
            </div>

            {/* Brand text */}

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[16px] font-extrabold tracking-[-0.025em] text-[#211A26]">
                  AKTU StudyHub
                </span>

                <span className="hidden rounded-full bg-gradient-to-r from-[#EEE7FF] to-[#FFE8EF] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#7046E8] lg:inline-block">
                  Beta
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold text-[#928793]">
                Study smarter. Score better.
              </p>
            </div>
          </button>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
            <NavLink
              label="Home"
              active={active === "Home"}
              onClick={() => handleNavigation("Home")}
            />

            <NavLink
              label="Semesters"
              active={active === "Semesters"}
              onClick={() => handleNavigation("Semesters", "semesters")}
            />

            <NavLink
              label="Resources"
              active={active === "Resources"}
              onClick={() => handleNavigation("Resources", "resources")}
            />

            <NavLink
              label="PYQs"
              active={active === "PYQs"}
              sparkle
              onClick={() => handleNavigation("PYQs")}
            />

            <NavLink
              label="About"
              active={active === "About"}
              onClick={() => handleNavigation("About")}
            />
          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="hidden items-center gap-2 md:flex">
            {/* Search */}

            <button
              type="button"
              onClick={handleSearchClick}
              className="
                group
                flex
                h-10
                items-center
                gap-2
                rounded-[13px]
                border
                border-[#E3DBE7]
                bg-white/70
                px-3
                text-[#817586]
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#CDBCF4]
                hover:bg-white
                hover:text-[#7046E8]
                hover:shadow-md
              "
            >
              <Search
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span className="text-xs font-semibold">Search</span>

              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-[#E7E0EA] bg-[#F8F5F9] text-[9px] font-bold text-[#9C919F]">
                /
              </span>
            </button>

            {/* Explore */}

            <button
              type="button"
              onClick={() => handleNavigation("Semesters", "semesters")}
              className="
                group
                flex
                h-10
                items-center
                gap-1.5
                rounded-[13px]
                bg-gradient-to-r
                from-[#7046E8]
                via-[#8250DD]
                to-[#B15AC8]
                px-4
                text-xs
                font-extrabold
                text-white
                shadow-[0_8px_20px_rgba(112,70,232,0.18)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_12px_25px_rgba(112,70,232,0.25)]
              "
            >
              Explore

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[13px]
              border
              border-[#E3DBE7]
              bg-white/80
              text-[#413747]
              shadow-sm
              transition-all
              duration-300
              hover:border-[#CDBCF4]
              hover:text-[#7046E8]
              md:hidden
            "
          >
            <div className="transition-transform duration-300">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>

        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <div
          className={`
            overflow-hidden
            transition-all
            duration-500
            md:hidden
            ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="border-t border-[#EAE2ED] px-5 pb-5 pt-4">
            <div className="rounded-[20px] border border-[#E8E0EA] bg-gradient-to-br from-[#F9F5FF] via-white to-[#FFF4F0] p-2">
              {/* Home */}

              <MobileNavLink
                label="Home"
                icon="⌂"
                active={active === "Home"}
                delay="0ms"
                onClick={() => handleNavigation("Home")}
              />

              {/* Semesters */}

              <MobileNavLink
                label="Semesters"
                icon="01"
                active={active === "Semesters"}
                delay="60ms"
                onClick={() => handleNavigation("Semesters", "semesters")}
              />

              {/* Resources */}

              <MobileNavLink
                label="Resources"
                icon="✦"
                active={active === "Resources"}
                delay="120ms"
                onClick={() => handleNavigation("Resources", "resources")}
              />

              {/* PYQs */}

              <MobileNavLink
                label="Previous Year Papers"
                icon="↗"
                active={active === "PYQs"}
                delay="180ms"
                onClick={() => handleNavigation("PYQs")}
              />

              {/* About */}

              <MobileNavLink
                label="About"
                icon="i"
                active={active === "About"}
                delay="240ms"
                onClick={() => handleNavigation("About")}
              />

              <div className="my-2 h-px bg-[#E9E1EB]" />

              {/* Mobile search */}

              <button
                type="button"
                onClick={handleSearchClick}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-[14px]
                  bg-white
                  px-4
                  py-3.5
                  text-left
                  shadow-sm
                  transition
                  hover:bg-[#F8F4FF]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8DFFF] to-[#FFE7EF] text-[#7046E8]">
                    <Search size={16} />
                  </div>

                  <span className="text-sm font-bold text-[#514757]">
                    Search resources
                  </span>
                </div>

                <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-[#F5F1F7] text-[10px] font-bold text-[#958A99]">
                  /
                </span>
              </button>

              {/* Mobile CTA */}

              <button
                type="button"
                onClick={() => handleNavigation("Semesters", "semesters")}
                className="
                  group
                  mt-2
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  bg-gradient-to-r
                  from-[#7046E8]
                  to-[#B15AC8]
                  px-4
                  py-3.5
                  text-sm
                  font-extrabold
                  text-white
                  shadow-lg
                "
              >
                Explore AKTU Resources

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed navbar spacer */}

      <div className="h-[72px]" />
    </>
  );
}

/* =========================================================
   DESKTOP NAV LINK
========================================================= */

function NavLink({ label, active, sparkle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        flex
        items-center
        gap-1.5
        rounded-full
        px-4
        py-2.5
        text-[12px]
        font-bold
        transition-all
        duration-300
        ${
          active
            ? "bg-gradient-to-r from-[#EEE7FF] to-[#FFF0F4] text-[#6342CE] shadow-sm"
            : "text-[#706577] hover:bg-white hover:text-[#6342CE]"
        }
      `}
    >
      {label}

      {sparkle && (
        <Sparkles
          size={11}
          className={`
            transition-all
            duration-300
            ${
              active
                ? "rotate-12 text-[#E38BA9]"
                : "text-[#A994B2] group-hover:rotate-12 group-hover:text-[#E38BA9]"
            }
          `}
        />
      )}

      <span
        className={`
          absolute
          bottom-[3px]
          left-1/2
          h-[2px]
          -translate-x-1/2
          rounded-full
          bg-gradient-to-r
          from-[#7046E8]
          to-[#E7789B]
          transition-all
          duration-300
          ${
            active
              ? "w-4 opacity-100"
              : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-100"
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function MobileNavLink({ label, icon, active, delay, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        animationDelay: delay,
      }}
      className={`
        animate-fade-down
        group
        flex
        w-full
        items-center
        gap-3
        rounded-[14px]
        px-3
        py-3
        text-left
        transition-all
        duration-300
        ${active ? "bg-white shadow-sm" : "hover:bg-white/70"}
      `}
    >
      <span
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          text-[11px]
          font-extrabold
          transition-all
          duration-300
          ${
            active
              ? "bg-gradient-to-br from-[#E4D8FF] to-[#FFDDEB] text-[#7046E8]"
              : "bg-[#F3EEF5] text-[#8D8291] group-hover:bg-[#ECE4FF] group-hover:text-[#7046E8]"
          }
        `}
      >
        {icon}
      </span>

      <span
        className={`
          text-sm
          font-bold
          ${active ? "text-[#5F40C9]" : "text-[#5B5161]"}
        `}
      >
        {label}
      </span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7046E8]" />
      )}
    </button>
  );
}

/* =========================================================
   HELPER
========================================================= */

function isTyping(event) {
  const target = event.target;

  if (!target) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export default Navbar;