import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  ChevronRight,
  FileQuestion,
  FileText,
  Globe,
  Layers3,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: Activity,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Subjects",
        path: "/admin/subjects",
        icon: BookOpen,
      },
      {
        label: "Units",
        path: "/admin/units",
        icon: Layers3,
      },
      {
        label: "Resources",
        path: "/admin/resources",
        icon: FileText,
      },
      {
        label: "PYQs",
        path: "/admin/pyqs",
        icon: FileQuestion,
      },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function getAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || "");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffdfb] text-[#211A26]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#211A26]/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-50
          flex
          flex-col
          border-r
          border-[#E9E1EC]
          bg-white/95
          backdrop-blur-xl
          transition-all
          duration-300
          lg:translate-x-0
          ${collapsed ? "lg:w-[88px]" : "lg:w-[260px]"}
          ${
            mobileOpen
              ? "w-[280px] translate-x-0"
              : "w-[280px] -translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Brand */}
        <div
          className={`
            flex
            h-[76px]
            shrink-0
            items-center
            border-b
            border-[#F0EBF1]
            px-5
            ${collapsed ? "lg:justify-center lg:px-3" : ""}
          `}
        >
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#7046E8] via-[#8152DF] to-[#C45BB8] text-white shadow-[0_8px_20px_rgba(112,70,232,0.20)] transition duration-300 group-hover:-translate-y-0.5">
              <BookOpen
                size={21}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
              />

              <div className="absolute -left-8 top-0 h-full w-5 rotate-[20deg] bg-white/30 blur-sm transition-all duration-700 group-hover:left-14" />
            </div>

            <div
              className={`
                text-left
                transition-all
                duration-200
                ${collapsed ? "lg:hidden" : ""}
              `}
            >
              <p className="font-display text-[15px] font-black tracking-[-0.02em] text-[#211A26]">
                AKTU StudyHub
              </p>

              <p className="mt-0.5 text-[10px] font-bold text-[#928793]">
                Admin Panel
              </p>
            </div>
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-[11px] text-[#817684] hover:bg-[#F7F3F8] hover:text-[#7046E8] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {navigation.map((section) => (
            <div key={section.label} className="mb-7 last:mb-0">
              <p
                className={`
                  mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A198A4]
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) => `
                        group
                        flex
                        items-center
                        gap-3
                        rounded-[14px]
                        px-3
                        py-3
                        text-sm
                        font-bold
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#EEE7FF] to-[#FFF0F4] text-[#6342CE] shadow-sm"
                            : "text-[#706577] hover:bg-[#FAF7FB] hover:text-[#6342CE]"
                        }
                        ${collapsed ? "lg:justify-center lg:px-0" : ""}
                      `}
                    >
                      <Icon size={18} strokeWidth={2} className="shrink-0" />

                      <span
                        className={`
                          flex-1
                          transition-all
                          duration-200
                          ${collapsed ? "lg:hidden" : ""}
                        `}
                      >
                        {item.label}
                      </span>

                      <ChevronRight
                        size={15}
                        className={`
                          text-[#B8AFBC]
                          transition
                          group-hover:translate-x-0.5
                          ${collapsed ? "lg:hidden" : ""}
                        `}
                      />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#F0EBF1] p-3">
          {/* View website */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`
              group
              mb-1
              flex
              w-full
              items-center
              gap-3
              rounded-[14px]
              px-3
              py-3
              text-sm
              font-bold
              text-[#706577]
              transition
              hover:bg-[#F7FBF9]
              hover:text-[#249B68]
              ${collapsed ? "lg:justify-center lg:px-0" : ""}
            `}
          >
            <Globe size={18} className="shrink-0" />

            <span className={`${collapsed ? "lg:hidden" : ""}`}>
              View StudyHub
            </span>
          </button>

          {/* Account */}
          {!collapsed && (
            <div className="mb-2 mt-2 rounded-[14px] bg-[#FAF8FB] px-3 py-3 lg:block">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#A198A4]">
                Signed in as
              </p>

              <p className="mt-1 truncate text-xs font-bold text-[#7046E8]">
                {email || "Administrator"}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Sign out" : undefined}
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-[14px]
              px-3
              py-3
              text-sm
              font-bold
              text-[#817684]
              transition
              hover:bg-[#FFF1F1]
              hover:text-[#D14B4B]
              disabled:opacity-50
              ${collapsed ? "lg:justify-center lg:px-0" : ""}
            `}
          >
            <LogOut size={18} className="shrink-0" />

            <span className={`${collapsed ? "lg:hidden" : ""}`}>
              {loggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>

        {/* Collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[86px] hidden h-7 w-7 items-center justify-center rounded-full border border-[#E6DFE8] bg-white text-[#817684] shadow-sm transition hover:text-[#7046E8] lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen size={14} />
          ) : (
            <PanelLeftClose size={14} />
          )}
        </button>
      </aside>

      {/* Main area */}
      <div
        className={`
          min-h-screen
          transition-all
          duration-300
          ${collapsed ? "lg:pl-[88px]" : "lg:pl-[260px]"}
        `}
      >
        {/* Admin top bar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E9E1EC] bg-[#fffdfb]/85 px-5 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#E3DBE7] bg-white text-[#514757] shadow-sm lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu size={19} />
            </button>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8]">
                AKTU StudyHub
              </p>

              <h2 className="font-display text-lg font-black text-[#211A26]">
                Administration
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="h-2 w-2 rounded-full bg-[#249B68] shadow-[0_0_0_5px_rgba(36,155,104,0.10)]" />

            <span className="text-xs font-bold text-[#817684]">
              Admin access active
            </span>
          </div>
        </header>

        {/* Page */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
