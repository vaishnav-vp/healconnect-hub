import { useParams, Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { type AppRole } from "@/lib/auth";

export default function Login() {
  const { role } = useParams<{ role: string }>();

  if (role !== "doctor" && role !== "patient") {
    return <Navigate to="/" replace />;
  }

  return <AuthForm role={role as AppRole} />;
}
