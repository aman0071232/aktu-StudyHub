import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------------
      // Sign in using Supabase Authentication
      // ---------------------------------------------------

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Login failed. Please try again.");
      }

      // ---------------------------------------------------
      // Make sure this user is actually an admin
      // ---------------------------------------------------

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!adminUser) {
        await supabase.auth.signOut();

        throw new Error(
          "You are not authorized to access the admin portal."
        );
      }

      // ---------------------------------------------------
      // Successful admin login
      // ---------------------------------------------------

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message || "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
      {/* ==================================================
          BACKGROUND DECORATION
      ================================================== */}

      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-[#DCCFFF]/35 blur-3xl sm:-left-40 sm:top-20 sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#FFD5E4]/30 blur-3xl sm:-right-40 sm:h-[450px] sm:w-[450px]" />

      <div className="pointer-events-none absolute left-[45%] top-[25%] hidden h-72 w-72 rounded-full bg-[#FFF0C9]/25 blur-3xl sm:block" />

      <div className="pointer-events-none absolute left-[7%] top-[28%] animate-float text-[#7046E8]/15">
        <Sparkles size={24} className="sm:h-8 sm:w-8" />
      </div>

      <div className="pointer-events-none absolute right-[8%] top-[18%] animate-float-side text-[#E83E7A]/15">
        <Sparkles size={22} className="sm:h-7 sm:w-7" />
      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="w-full max-w-md">
          {/* ==================================================
              BRAND
          ================================================== */}

          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7046E8] to-[#B15AC8] text-white shadow-[0_15px_35px_rgba(112,70,232,0.22)] sm:h-16 sm:w-16 sm:rounded-[20px]">
              <BookOpen size={25} className="sm:h-[29px] sm:w-[29px]" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5">
              <h1 className="font-display text-[22px] font-black tracking-tight text-[#211A26] sm:text-2xl">
                AKTU StudyHub
              </h1>

              <span className="rounded-full bg-[#F1E9FF] px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider text-[#7046E8] sm:text-[9px]">
                Admin
              </span>
            </div>

            <p className="mt-2 px-4 text-[13px] leading-5 text-[#817684] sm:text-sm">
              Manage your study material securely.
            </p>
          </div>

          {/* ==================================================
              LOGIN CARD
          ================================================== */}

          <div className="relative overflow-hidden rounded-[24px] border border-[#E9E1EC] bg-white/90 p-5 shadow-[0_20px_55px_rgba(73,52,91,0.10)] backdrop-blur-xl sm:rounded-[30px] sm:p-9">
            {/* Card decoration */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#EEE7FF]/70 blur-2xl sm:-right-20 sm:-top-20 sm:h-44 sm:w-44" />

            <div className="relative">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="mb-6 sm:mb-7">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F5F0FF] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7046E8] sm:gap-2 sm:px-3 sm:text-[10px]">
                  <ShieldCheck size={12} className="sm:h-[13px] sm:w-[13px]" />
                  Secure Admin Access
                </div>

                <h2 className="font-display text-[28px] font-black tracking-[-0.04em] text-[#211A26] sm:text-3xl">
                  Welcome back
                </h2>

                <p className="mt-2 text-[13px] leading-5 text-[#817684] sm:text-sm sm:leading-6">
                  Sign in to manage semesters, subjects, units and PDFs.
                </p>
              </div>

              {/* ==================================================
                  ERROR MESSAGE
              ================================================== */}

              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3 text-[13px] font-medium leading-5 text-red-600 sm:px-4 sm:text-sm">
                  {error}
                </div>
              )}

              {/* ==================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#655B69] sm:text-xs"
                  >
                    Admin Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8EA0] sm:left-4 sm:h-[18px] sm:w-[18px]"
                    />

                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your admin email"
                      autoComplete="email"
                      inputMode="email"
                      className="h-12 w-full rounded-[14px] border border-[#E5DEE8] bg-[#FCFAFD] pl-10 pr-3 text-[13px] font-medium text-[#211A26] outline-none transition-all placeholder:text-[#A69BAA] focus:border-[#B49AEF] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:h-13 sm:rounded-[15px] sm:pl-11 sm:pr-4 sm:text-sm"
                    />
                  </div>
                </div>

                {/* ==================================================
                    PASSWORD
                ================================================== */}

                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#655B69] sm:text-xs"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8EA0] sm:left-4 sm:h-[18px] sm:w-[18px]"
                    />

                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-[14px] border border-[#E5DEE8] bg-[#FCFAFD] pl-10 pr-12 text-[13px] font-medium text-[#211A26] outline-none transition-all placeholder:text-[#A69BAA] focus:border-[#B49AEF] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:h-13 sm:rounded-[15px] sm:pl-11 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#918692] transition hover:bg-[#F4EFF8] hover:text-[#7046E8] active:scale-95 sm:right-3"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(112,70,232,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(112,70,232,0.27)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-13 sm:rounded-[15px] sm:text-sm"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Admin

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1 sm:h-[17px] sm:w-[17px]"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* ==================================================
                  SECURITY NOTE
              ================================================== */}

              <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-[#F8F5FA] p-3.5 sm:mt-7 sm:gap-3 sm:p-4">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#7046E8] sm:h-[18px] sm:w-[18px]"
                />

                <p className="text-[11px] leading-[18px] text-[#817684] sm:text-xs sm:leading-5">
                  This area is restricted to authorized StudyHub
                  administrators. Students don't need an account to access
                  study material.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              BACK TO WEBSITE
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mx-auto mt-5 flex items-center gap-2 text-[13px] font-bold text-[#817684] transition hover:text-[#7046E8] sm:mt-6 sm:text-sm"
          >
            <ArrowLeft size={15} className="sm:h-4 sm:w-4" />
            Back to StudyHub
          </button>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;