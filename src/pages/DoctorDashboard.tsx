import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AddPatientModal } from "@/components/doctor/AddPatientModal";
import { PatientList } from "@/components/doctor/PatientList";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  Activity,
  Stethoscope,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [patientRefresh, setPatientRefresh] = useState(0);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Fetch patient count
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", user.id)
        .then(({ count }) => {
          setPatientCount(count || 0);
        });
    }
  }, [user, patientRefresh]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handlePatientAdded = () => {
    setPatientRefresh((prev) => prev + 1);
  };

  const stats = [
    { label: "Total Patients", value: patientCount.toString(), icon: Users, color: "text-primary" },
    { label: "Appointments", value: "8", icon: Calendar, color: "text-patient" },
    { label: "Reports Pending", value: "5", icon: FileText, color: "text-amber-500" },
    { label: "Critical Cases", value: "2", icon: Activity, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-doctor-light flex items-center justify-center">
                <Stethoscope size={20} className="text-doctor" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile.full_name || "Doctor"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome, {profile.full_name?.split(" ")[0] || "Doctor"}!
            </h1>
            <p className="text-muted-foreground">
              Manage your patients and track their health journey.
            </p>
          </div>
          <AddPatientModal onPatientAdded={handlePatientAdded} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="medical-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`${stat.color}`} size={24} />
                <span className="text-3xl font-bold font-display">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Patient List */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <PatientList refreshTrigger={patientRefresh} />
        </div>
      </main>
    </div>
  );
}
