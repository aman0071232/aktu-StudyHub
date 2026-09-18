import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  ChevronRight,
  FileQuestion,
  FileText,
  GraduationCap,
  Layers3,
  LogOut,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

/* =========================================================
   DASHBOARD MANAGEMENT CARDS
========================================================= */

const dashboardCards = [
  {
    title: "Upload Resources",
    description:
      "Upload complete notes, short notes and expected questions.",
    icon: FileText,
    path: "/admin/resources",
    gradient: "from-[#EEE7FF] via-[#F8F4FF] to-[#E3D8FF]",
    iconBg: "bg-[#7046E8]",
    iconColor: "text-[#7046E8]",
  },
  {
    title: "Upload PYQs",
    description: "Add previous year papers from 2025 to 2021.",
    icon: FileQuestion,
    path: "/admin/pyqs",
    gradient: "from-[#ECFAF3] via-[#F7FFFB] to-[#CDEEDC]",
    iconBg: "bg-[#249B68]",
    iconColor: "text-[#249B68]",
  },
  {
    title: "Manage Subjects",
    description: "Add, edit or organize subjects inside semesters.",
    icon: BookOpen,
    path: "/admin/subjects",
    gradient: "from-[#FFECEF] via-[#FFF6F7] to-[#FFD9E5]",
    iconBg: "bg-[#E83E7A]",
    iconColor: "text-[#E83E7A]",
  },
  {
    title: "Manage Units",
    description: "Create and edit Unit 1, Unit 2, Unit 3 and more.",
    icon: Layers3,
    path: "/admin/units",
    gradient: "from-[#FFF7E3] via-[#FFFDF5] to-[#FFE7B5]",
    iconBg: "bg-[#E59A13]",
    iconColor: "text-[#E59A13]",
  },
];

/* =========================================================
   STAT CARDS
========================================================= */

const statCards = [
  {
    key: "semesters",
    label: "Semesters",
    icon: GraduationCap,
    gradient: "from-[#EEE7FF] to-[#F8F4FF]",
    iconBg: "bg-[#7046E8]/10",
    iconColor: "text-[#7046E8]",
  },
  {
    key: "subjects",
    label: "Subjects",
    icon: BookOpen,
    gradient: "from-[#FFECEF] to-[#FFF7F8]",
    iconBg: "bg-[#E83E7A]/10",
    iconColor: "text-[#E83E7A]",
  },
  {
    key: "units",
    label: "Total Units",
    icon: Layers3,
    gradient: "from-[#FFF7E3] to-[#FFFDF5]",
    iconBg: "bg-[#E59A13]/10",
    iconColor: "text-[#E59A13]",
  },
  {
    key: "resources",
    label: "Resources",
    icon: FileText,
    gradient: "from-[#ECFAF3] to-[#F7FFFB]",
    iconBg: "bg-[#249B68]/10",
    iconColor: "text-[#249B68]",
  },
];

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    semesters: 8,
    subjects: 0,
    units: 0,
    resources: 0,
    pyqs: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     GET CURRENT ADMIN
  ======================================================= */

  const getAdmin = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || "");
    }
  }, []);

  /* =======================================================
     FETCH RECENT ACTIVITY
  ======================================================= */

  const fetchRecentActivity = useCallback(async () => {
    try {
      const [resourcesResponse, pyqsResponse] = await Promise.all([
        supabase
          .from("resources")
          .select(
            "id, unit_id, resource_type, title, created_at, updated_at",
          )
          .order("created_at", { ascending: false })
          .limit(8),

        supabase
          .from("pyqs")
          .select("id, subject_id, year, title, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (resourcesResponse.error) {
        throw resourcesResponse.error;
      }

      if (pyqsResponse.error) {
        throw pyqsResponse.error;
      }

      const resources = resourcesResponse.data || [];
      const pyqs = pyqsResponse.data || [];

      /* -----------------------------------------------------
         FIND RELATED UNIT IDS
      ----------------------------------------------------- */

      const unitIds = [
        ...new Set(
          resources
            .map((item) => item.unit_id)
            .filter(Boolean),
        ),
      ];

      /* -----------------------------------------------------
         FIND RELATED SUBJECT IDS
      ----------------------------------------------------- */

      const subjectIds = [
        ...new Set(
          pyqs
            .map((item) => item.subject_id)
            .filter(Boolean),
        ),
      ];

      let units = [];
      let subjects = [];

      /* -----------------------------------------------------
         IMPORTANT:
         units table uses `title`, NOT `name`.
      ----------------------------------------------------- */

      if (unitIds.length > 0) {
        const { data, error } = await supabase
          .from("units")
          .select("id, subject_id, unit_number, title")
          .in("id", unitIds);

        if (!error) {
          units = data || [];
        }
      }

      /* -----------------------------------------------------
         FIND ALL SUBJECT IDS
      ----------------------------------------------------- */

      const allSubjectIds = [
        ...new Set([
          ...subjectIds,
          ...units
            .map((unit) => unit.subject_id)
            .filter(Boolean),
        ]),
      ];

      /* -----------------------------------------------------
         FETCH SUBJECT NAMES
      ----------------------------------------------------- */

      if (allSubjectIds.length > 0) {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name")
          .in("id", allSubjectIds);

        if (!error) {
          subjects = data || [];
        }
      }

      /* -----------------------------------------------------
         CREATE LOOKUP MAPS
      ----------------------------------------------------- */

      const subjectMap = new Map(
        subjects.map((subject) => [
          subject.id,
          subject.name,
        ]),
      );

      const unitMap = new Map(
        units.map((unit) => [unit.id, unit]),
      );

      /* -----------------------------------------------------
         RESOURCE ACTIVITIES
      ----------------------------------------------------- */

      const resourceActivities = resources.map((resource) => {
        const unit = unitMap.get(resource.unit_id);

        return {
          id: `resource-${resource.id}`,
          type: "resource",

          title:
            resource.title ||
            formatResourceType(resource.resource_type),

          subtitle: unit
            ? `${
                subjectMap.get(unit.subject_id) || "Subject"
              } • Unit ${unit.unit_number}`
            : "Study material",

          date: resource.created_at,

          icon: FileText,
          iconBg: "bg-[#EEE7FF]",
          iconColor: "text-[#7046E8]",
        };
      });

      /* -----------------------------------------------------
         PYQ ACTIVITIES
      ----------------------------------------------------- */

      const pyqActivities = pyqs.map((pyq) => ({
        id: `pyq-${pyq.id}`,
        type: "pyq",

        title:
          pyq.title ||
          `${pyq.year} Previous Year Paper`,

        subtitle: `${
          subjectMap.get(pyq.subject_id) || "Subject"
        } • ${pyq.year}`,

        date: pyq.created_at,

        icon: FileQuestion,
        iconBg: "bg-[#DDF4E8]",
        iconColor: "text-[#249B68]",
      }));

      /* -----------------------------------------------------
         COMBINE + SORT
      ----------------------------------------------------- */

      const combined = [
        ...resourceActivities,
        ...pyqActivities,
      ]
        .sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date),
        )
        .slice(0, 8);

      setRecentActivity(combined);
    } catch (error) {
      console.error(
        "Recent activity error:",
        error,
      );

      setRecentActivity([]);
    }
  }, []);

  /* =======================================================
     FETCH DASHBOARD STATISTICS
  ======================================================= */

  const fetchDashboardData = useCallback(async () => {
    try {
      setErrorMessage("");

      const [
        subjectsResult,
        unitsResult,
        resourcesResult,
        pyqsResult,
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("units")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("resources")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("pyqs")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      const errors = [
        subjectsResult.error,
        unitsResult.error,
        resourcesResult.error,
        pyqsResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw errors[0];
      }

      setStats({
        semesters: 8,
        subjects: subjectsResult.count || 0,
        units: unitsResult.count || 0,
        resources: resourcesResult.count || 0,
        pyqs: pyqsResult.count || 0,
      });

      await fetchRecentActivity();
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error,
      );

      setErrorMessage(
        "Unable to load some dashboard statistics. Please refresh and try again.",
      );
    }
  }, [fetchRecentActivity]);

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadDashboard = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        await Promise.all([
          getAdmin(),
          fetchDashboardData(),
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAdmin, fetchDashboardData],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );

      setLoggingOut(false);
    }
  }

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdfb] px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE7FF] text-[#7046E8] shadow-[0_10px_35px_rgba(112,70,232,0.10)] sm:h-16 sm:w-16 sm:rounded-[22px]">
            <RefreshCw
              size={24}
              className="animate-spin sm:h-[27px] sm:w-[27px]"
            />
          </div>

          <h2 className="mt-5 font-display text-xl font-black text-[#211A26]">
            Loading dashboard
          </h2>

          <p className="mt-2 text-[13px] leading-5 text-[#817684] sm:text-sm">
            Fetching your StudyHub data...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-36 top-24 h-72 w-72 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:-left-40 sm:top-28 sm:h-[450px] sm:w-[450px]" />

        <div className="absolute -right-32 top-[38%] h-72 w-72 rounded-full bg-[#FFD7E5]/20 blur-3xl sm:right-[-130px] sm:h-[480px] sm:w-[480px]" />

        <div className="absolute -bottom-28 left-[30%] h-72 w-72 rounded-full bg-[#FFF0C9]/20 blur-3xl sm:bottom-[-160px] sm:left-[35%] sm:h-[420px] sm:w-[420px]" />
      </div>

      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24">
        {/* ===================================================
            DASHBOARD HEADER
        =================================================== */}

        <section className="relative overflow-hidden rounded-[24px] border border-[#E9E1EC] bg-gradient-to-br from-[#EEE7FF] via-white to-[#FFE8EF] p-5 shadow-[0_12px_40px_rgba(73,52,91,0.06)] sm:rounded-[30px] sm:p-8 lg:p-10">
          {/* Decorative circle */}

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/50 blur-3xl sm:-right-20 sm:-top-24 sm:h-72 sm:w-72" />

          <div className="relative flex flex-col gap-6 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">
            {/* Header text */}

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7046E8] shadow-sm sm:gap-2 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
                <Sparkles
                  size={12}
                  className="sm:h-[13px] sm:w-[13px]"
                />

                Secure Admin Portal
              </div>

              <h1 className="mt-4 font-display text-[32px] font-black leading-[1.05] tracking-[-0.05em] text-[#211A26] sm:mt-5 sm:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#817684] sm:text-base sm:leading-6">
                Manage AKTU StudyHub content, upload PDFs
                and keep your study material organized from
                one place.
              </p>

              {email && (
                <div className="mt-4 max-w-full">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#968A99] sm:text-xs sm:tracking-normal">
                    Signed in as
                  </p>

                  <p className="mt-0.5 break-all text-[11px] font-extrabold text-[#7046E8] sm:text-xs">
                    {email}
                  </p>
                </div>
              )}
            </div>

            {/* Header actions */}

            <div className="flex items-center gap-3">
              {/* Refresh */}

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                title="Refresh dashboard"
                aria-label="Refresh dashboard"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/85 text-[#7046E8] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12 sm:rounded-[16px]"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              {/* Settings decoration */}

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/80 text-[#7046E8] shadow-[0_10px_30px_rgba(112,70,232,0.10)] sm:h-20 sm:w-20 sm:rounded-[24px]">
                <Settings2
                  size={25}
                  className="sm:h-[34px] sm:w-[34px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {errorMessage && (
          <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[#F2D6D6] bg-[#FFF5F5] px-4 py-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
            <p className="text-[13px] font-semibold leading-5 text-[#B34C4C] sm:text-sm">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="w-full shrink-0 rounded-[11px] bg-white px-4 py-2.5 text-xs font-extrabold text-[#B34C4C] shadow-sm transition hover:bg-[#FFF9F9] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===================================================
            LIVE STATS
        =================================================== */}

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key];

            return (
              <div
                key={card.key}
                className={`group relative overflow-hidden rounded-[18px] border border-[#E9E1EC] bg-gradient-to-br ${card.gradient} p-4 shadow-[0_7px_24px_rgba(73,52,91,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(73,52,91,0.08)] sm:rounded-[22px] sm:p-5`}
              >
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/40 blur-2xl sm:-right-7 sm:-top-7 sm:h-20 sm:w-20" />

                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-[11px] ${card.iconBg} ${card.iconColor} sm:h-11 sm:w-11 sm:rounded-[14px]`}
                >
                  <Icon
                    size={17}
                    className="sm:h-5 sm:w-5"
                  />
                </div>

                <p className="relative mt-3 font-display text-[25px] font-black leading-none text-[#211A26] sm:mt-5 sm:text-3xl">
                  {value}
                </p>

                <p className="relative mt-1.5 text-[10px] font-bold text-[#817684] sm:text-xs">
                  {card.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* ===================================================
            PYQ MINI STATISTIC
        =================================================== */}

        <section className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#E9E1EC] bg-white px-4 py-3.5 shadow-[0_8px_25px_rgba(73,52,91,0.03)] sm:rounded-[20px] sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#DDF4E8] text-[#249B68] sm:h-10 sm:w-10 sm:rounded-[13px]">
                <FileQuestion
                  size={17}
                  className="sm:h-[18px] sm:w-[18px]"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12px] font-extrabold text-[#211A26] sm:text-sm">
                  Previous Year Questions
                </p>

                <p className="mt-0.5 truncate text-[10px] text-[#817684] sm:text-xs">
                  Papers currently available in StudyHub
                </p>
              </div>
            </div>

            <p className="shrink-0 font-display text-xl font-black text-[#249B68] sm:text-2xl">
              {stats.pyqs}
            </p>
          </div>
        </section>

        {/* ===================================================
            CONTENT MANAGEMENT
        =================================================== */}

        <section className="mt-9 sm:mt-12">
          <div className="mb-5 sm:mb-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7046E8] sm:text-[10px]">
              Content Management
            </p>

            <h2 className="mt-1 font-display text-[24px] font-black leading-tight text-[#211A26] sm:text-3xl">
              What do you want to manage?
            </h2>

            <p className="mt-1 text-[12px] leading-5 text-[#817684] sm:text-sm">
              Control every part of your AKTU StudyHub
              content.
            </p>
          </div>

          {/* Management cards */}

          <div className="grid gap-3.5 sm:gap-5 md:grid-cols-2">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => navigate(card.path)}
                  className={`group relative overflow-hidden rounded-[20px] border border-white bg-gradient-to-br ${card.gradient} p-4.5 text-left shadow-[0_8px_28px_rgba(73,52,91,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(73,52,91,0.10)] active:scale-[0.99] sm:rounded-[26px] sm:p-6`}
                >
                  {/* Decorative glow */}

                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/40 blur-3xl transition duration-500 group-hover:scale-125 sm:-right-16 sm:-top-16 sm:h-40 sm:w-40" />

                  {/* Icon + arrow */}

                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${card.iconBg} text-white shadow-sm sm:h-[52px] sm:w-[52px] sm:rounded-[16px]`}
                    >
                      <Icon
                        size={19}
                        className="sm:h-[22px] sm:w-[22px]"
                      />
                    </div>

                    <ChevronRight
                      size={19}
                      className="text-[#817684] transition duration-300 group-hover:translate-x-1 group-hover:text-[#7046E8] sm:h-[21px] sm:w-[21px]"
                    />
                  </div>

                  <h3 className="relative mt-4 font-display text-[17px] font-black leading-tight text-[#211A26] sm:mt-6 sm:text-xl">
                    {card.title}
                  </h3>

                  <p className="relative mt-2 text-[12px] leading-5 text-[#817684] sm:max-w-lg sm:text-sm sm:leading-6">
                    {card.description}
                  </p>

                  <span className="relative mt-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#7046E8] sm:mt-5 sm:gap-2 sm:text-xs">
                    Open manager

                    <ChevronRight
                      size={13}
                      className="sm:h-[15px] sm:w-[15px]"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            RECENT ACTIVITY
        =================================================== */}

        <section className="mt-9 sm:mt-12">
          <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6 sm:items-end">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#249B68] sm:text-[10px]">
                Activity
              </p>

              <h2 className="mt-1 font-display text-[24px] font-black leading-tight text-[#211A26] sm:text-3xl">
                Recent uploads
              </h2>

              <p className="mt-1 text-[12px] leading-5 text-[#817684] sm:text-sm">
                The latest resources and PYQs added to
                StudyHub.
              </p>
            </div>

            <Activity
              size={21}
              className="mt-1 shrink-0 text-[#249B68] sm:h-[23px] sm:w-[23px]"
            />
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#E9E1EC] bg-white shadow-[0_8px_28px_rgba(73,52,91,0.04)] sm:rounded-[24px]">
            {/* Empty state */}

            {recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6 sm:py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F7F3F8] text-[#9B909F] sm:h-14 sm:w-14 sm:rounded-[18px]">
                  <Activity
                    size={20}
                    className="sm:h-[23px] sm:w-[23px]"
                  />
                </div>

                <h3 className="mt-4 font-display text-base font-black text-[#211A26] sm:text-lg">
                  No recent uploads
                </h3>

                <p className="mt-1 text-[12px] leading-5 text-[#817684] sm:text-sm">
                  Your latest resources and PYQs will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EBF1]">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.id}
                      className="group flex min-w-0 items-center gap-3 px-4 py-3.5 transition hover:bg-[#FCFAFD] sm:gap-4 sm:px-6 sm:py-4"
                    >
                      {/* Activity icon */}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${activity.iconBg} ${activity.iconColor} sm:h-11 sm:w-11 sm:rounded-[14px]`}
                      >
                        <Icon
                          size={17}
                          className="sm:h-[19px] sm:w-[19px]"
                        />
                      </div>

                      {/* Activity information */}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-extrabold text-[#211A26] sm:text-sm">
                          {activity.title}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] font-semibold text-[#817684] sm:mt-1 sm:text-xs">
                          {activity.subtitle}
                        </p>

                        {/* Time on mobile */}

                        <p className="mt-1 text-[9px] font-bold text-[#A198A4] sm:hidden">
                          {formatRelativeTime(
                            activity.date,
                          )}
                        </p>
                      </div>

                      {/* Time on desktop */}

                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-[11px] font-bold text-[#A198A4]">
                          {formatRelativeTime(
                            activity.date,
                          )}
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className="shrink-0 text-[#C0B8C3] transition group-hover:translate-x-1 group-hover:text-[#7046E8] sm:h-[17px] sm:w-[17px]"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            QUICK UPLOAD
        =================================================== */}

        <section className="mt-9 grid gap-3.5 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {/* Upload study material */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/resources")
            }
            className="group rounded-[20px] border border-[#E9E1EC] bg-white p-4.5 text-left shadow-[0_8px_28px_rgba(73,52,91,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(73,52,91,0.08)] active:scale-[0.99] sm:rounded-[24px] sm:p-6"
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#EEE7FF] text-[#7046E8] sm:h-12 sm:w-12 sm:rounded-[15px]">
                <UploadCloud
                  size={19}
                  className="sm:h-[21px] sm:w-[21px]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[15px] font-black text-[#211A26] sm:text-lg">
                  Upload study material
                </h3>

                <p className="mt-0.5 truncate text-[10px] text-[#817684] sm:mt-1 sm:text-xs">
                  Notes, short notes and expected questions
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-[#9B909F] transition group-hover:translate-x-1 group-hover:text-[#7046E8] sm:h-[19px] sm:w-[19px]"
              />
            </div>
          </button>

          {/* Upload PYQ */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/pyqs")
            }
            className="group rounded-[20px] border border-[#E9E1EC] bg-white p-4.5 text-left shadow-[0_8px_28px_rgba(73,52,91,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(73,52,91,0.08)] active:scale-[0.99] sm:rounded-[24px] sm:p-6"
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#DDF4E8] text-[#249B68] sm:h-12 sm:w-12 sm:rounded-[15px]">
                <Plus
                  size={19}
                  className="sm:h-[21px] sm:w-[21px]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[15px] font-black text-[#211A26] sm:text-lg">
                  Upload a PYQ
                </h3>

                <p className="mt-0.5 truncate text-[10px] text-[#817684] sm:mt-1 sm:text-xs">
                  Add a previous year paper to any subject
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-[#9B909F] transition group-hover:translate-x-1 group-hover:text-[#249B68] sm:h-[19px] sm:w-[19px]"
              />
            </div>
          </button>
        </section>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div className="mt-9 flex justify-center sm:mt-12">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-[13px] px-5 py-3 text-[12px] font-extrabold text-[#817684] transition hover:bg-[#FFF0F0] hover:text-[#D14B4B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <LogOut
              size={16}
              className="sm:h-[17px] sm:w-[17px]"
            />

            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   RESOURCE TYPE LABEL
========================================================= */

function formatResourceType(type) {
  const labels = {
    notes: "Complete Unit Notes",
    short_notes: "Short Notes",
    expected_questions: "Expected Questions",
  };

  return labels[type] || "Study Material";
}

/* =========================================================
   RELATIVE TIME
========================================================= */

function formatRelativeTime(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor(
    (now - date) / 1000,
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

export default AdminDashboard;