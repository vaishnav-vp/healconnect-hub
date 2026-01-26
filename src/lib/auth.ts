import { supabase } from "@/integrations/supabase/client";

export type AppRole = "doctor" | "patient";

export async function signUp(email: string, password: string, role: AppRole, fullName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("No user returned from signup");

  // Add the role to user_roles table
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: authData.user.id, role });

  if (roleError) throw roleError;

  // Update profile with full name
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("user_id", authData.user.id);

  if (profileError) throw profileError;

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase.rpc("get_user_role", {
    _user_id: userId,
  });

  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }

  return data as AppRole | null;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
