import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/config";
import { sanitizeEmail } from "../utils/security";

const AuthContext = createContext(null);
const ADMIN_ROLES = new Set(["admin", "superadmin"]);

async function loadAdminUser(authUser) {
  if (!authUser) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) throw error;
  if (!ADMIN_ROLES.has(profile.role) || profile.status !== "active") {
    throw new Error("This account does not have active administrator access.");
  }

  return {
    ...authUser,
    profile,
    displayName:
      profile.full_name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Administrator",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Unable to restore Supabase session:", error);

      try {
        const adminUser = await loadAdminUser(data.session?.user);
        if (mounted) setUser(adminUser);
      } catch (profileError) {
        console.error("Administrator profile validation failed:", profileError);
        await supabase.auth.signOut();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(async () => {
        if (!mounted) return;
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          setUser(await loadAdminUser(session.user));
        } catch (profileError) {
          console.error("Administrator profile validation failed:", profileError);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    const validateAccess = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .single();
      if (error || !ADMIN_ROLES.has(profile?.role) || profile?.status !== "active") {
        await supabase.auth.signOut();
        setUser(null);
      }
    };
    const channel = supabase.channel(`admin-access-${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${user.id}`,
      }, validateAccess)
      .subscribe();
    const handleFocus = () => validateAccess();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeEmail(email),
      password,
    });
    if (error) throw error;

    try {
      const adminUser = await loadAdminUser(data.user);
      setUser(adminUser);
      return adminUser;
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
