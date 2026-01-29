import { supabase } from "@/integrations/supabase/client";

export type AppRole = "doctor" | "patient";

// Doctor signup with license number (no email required - we generate a pseudo email)
export async function signUpDoctor(
  licenseNumber: string,
  password: string,
  fullName: string
) {
  // Check if license number already exists
  const { data: exists, error: checkError } = await supabase.rpc(
    "license_number_exists",
    { p_license_number: licenseNumber }
  );

  if (checkError) throw checkError;
  if (exists) throw new Error("This license number is already registered");

  // Generate a pseudo-email from the license number
  const pseudoEmail = `${licenseNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@doctor.medicare.local`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: pseudoEmail,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
        license_number: licenseNumber,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("No user returned from signup");

  // Add the role to user_roles table
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: authData.user.id, role: "doctor" as AppRole });

  if (roleError) throw roleError;

  // Update profile with full name and license number
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, license_number: licenseNumber })
    .eq("user_id", authData.user.id);

  if (profileError) throw profileError;

  return authData;
}

// Doctor login with license number
export async function signInDoctor(licenseNumber: string, password: string) {
  // Get the email associated with this license number
  const { data: email, error: lookupError } = await supabase.rpc(
    "get_email_by_license",
    { p_license_number: licenseNumber }
  );

  if (lookupError) throw lookupError;
  if (!email) {
    throw new Error(
      "Doctor account not found. Please sign up using a valid license number."
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Patient signup (standard email-based)
export async function signUp(
  email: string,
  password: string,
  role: AppRole,
  fullName: string
) {
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

// Standard email-based sign in (for patients)
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
