import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Home as HomeIcon,
  Search,
  Sparkles,
} from "lucide-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

// Student pages
import About from "./pages/About";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import Semester from "./pages/Semester";
import Subject from "./pages/Subject";
import Unit from "./pages/Unit";
import PYQs from "./pages/PYQs";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminUnits from "./pages/admin/AdminUnits";
import AdminResources from "./pages/admin/AdminResources";
import AdminPYQs from "./pages/admin/AdminPYQs";


/* =========================================================
   404 PAGE
========================================================= */

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-[#fffdfb]">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#DCCFFF]/35 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#FFD4C2]/30 blur-3xl" />

      <div className="pointer-events-none absolute left-[15%] top-[25%] text-[#7046E8]/20">
        <Sparkles size={32} />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full text-center">

          {/* 404 */}
          <div className="relative mx-auto w-fit">
            <h1 className="select-none font-display text-[110px] font-black leading-none tracking-[-0.08em] text-[#EEE7FF] sm:text-[160px]">
              404
            </h1>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-[#7046E8] shadow-[0_12px_35px_rgba(73,52,91,0.10)] ring-1 ring-[#E9E1EC] sm:h-20 sm:w-20 sm:rounded-[24px]">
                <Search
                  size={28}
                  strokeWidth={2.2}
                  className="sm:h-9 sm:w-9"
                />
              </div>
            </div>
          </div>

          {/* Heading */}
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7046E8] sm:text-xs">
            Page Not Found
          </p>

          <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.045em] text-[#211A26] sm:text-4xl lg:text-5xl">
            Looks like this page took a study break.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#817684] sm:text-base sm:leading-7">
            The page you're looking for doesn't exist or the URL may have
            changed. Let's get you back to your AKTU preparation.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(112,70,232,0.20)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(112,70,232,0.25)] sm:w-auto"
            >
              <HomeIcon
                size={17}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              Back to Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/semester/1")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#E4DDE8] bg-white px-6 py-3.5 text-sm font-extrabold text-[#62586A] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D6C9ED] hover:text-[#7046E8] sm:w-auto"
            >
              <ArrowLeft
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />

              Browse Semesters
            </button>

          </div>

          {/* Small help card */}
          <div className="mx-auto mt-10 max-w-lg rounded-[20px] border border-[#E9E1EC] bg-white/80 p-4 shadow-[0_8px_25px_rgba(73,52,91,0.05)] backdrop-blur-md sm:p-5">
            <p className="text-xs leading-5 text-[#817684] sm:text-sm">
              Looking for study material?
              <button
                type="button"
                onClick={() => navigate("/search")}
                className="ml-1 font-black text-[#7046E8] underline decoration-[#DCCFFF] underline-offset-4 transition hover:text-[#5835BE]"
              >
                Search StudyHub
              </button>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}


/* =========================================================
   STUDENT LAYOUT
========================================================= */

function StudentLayout() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Search */}
        <Route
          path="/search"
          element={<SearchPage />}
        />

        {/* About */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* PYQs */}
        <Route
          path="/pyqs"
          element={<PYQs />}
        />

        {/* Semester */}
        <Route
          path="/semester/:semesterNumber"
          element={<Semester />}
        />

        {/* Subject */}
        <Route
          path="/semester/:semesterNumber/subject/:subjectId"
          element={<Subject />}
        />

        {/* Unit */}
        <Route
          path="/semester/:semesterNumber/subject/:subjectId/unit/:unitId"
          element={<Unit />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

      <Footer />
    </>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            ADMIN LOGIN
            PUBLIC ROUTE
        ================================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =================================================
            PROTECTED ADMIN ROUTES
        ================================================= */}

        <Route element={<AdminRoute />}>

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* /admin → /admin/dashboard */}
            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            {/* Subjects */}
            <Route
              path="subjects"
              element={<AdminSubjects />}
            />

            {/* Units */}
            <Route
              path="units"
              element={<AdminUnits />}
            />

            {/* Resources */}
            <Route
              path="resources"
              element={<AdminResources />}
            />

            {/* PYQs */}
            <Route
              path="pyqs"
              element={<AdminPYQs />}
            />

          </Route>

        </Route>


        {/* =================================================
            PUBLIC STUDENT WEBSITE

            IMPORTANT:
            This comes AFTER admin routes.
        ================================================= */}

        <Route
          path="/*"
          element={<StudentLayout />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;