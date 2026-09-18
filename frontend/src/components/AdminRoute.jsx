import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      setLoading(true);

      /*
       * First check whether someone is logged in.
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        return;
      }

      /*
       * Now check whether this user exists
       * in our admin_users table.
       */
      const { data: adminUser, error } =
        await supabase
          .from("admin_users")
          .select("id, email")
          .eq("id", user.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Admin verification error:",
          error
        );

        setAuthorized(false);
        return;
      }

      /*
       * User is authorized only when
       * an admin_users record exists.
       */
      setAuthorized(Boolean(adminUser));
    } catch (error) {
      console.error(
        "Admin route error:",
        error
      );

      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  /*
   * While Supabase checks the session,
   * show a small loading screen.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdfb]">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE7FF]">
            <Loader2
              size={26}
              className="animate-spin text-[#7046E8]"
            />
          </div>

          <p className="text-sm font-semibold text-[#817687]">
            Checking admin access...
          </p>

        </div>

      </div>
    );
  }

  /*
   * Not authorized → login page.
   */
  if (!authorized) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  /*
   * Authorized → render the requested
   * admin page.
   */
  return <Outlet />;
}