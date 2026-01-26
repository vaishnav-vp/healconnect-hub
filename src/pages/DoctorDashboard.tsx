import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  Bell,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });

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
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const stats = [
    { label: "Today's Patients", value: "12", icon: Users, color: "text-primary" },
    { label: "Appointments", value: "8", icon: Calendar, color: "text-patient" },
    { label: "Reports Pending", value: "5", icon: FileText, color: "text-amber-500" },
    { label: "Critical Cases", value: "2", icon: Activity, color: "text-destructive" },
  ];

  const recentPatients = [
    { name: "Sarah Johnson", time: "9:00 AM", status: "Completed" },
    { name: "Michael Chen", time: "10:30 AM", status: "In Progress" },
    { name: "Emily Davis", time: "11:00 AM", status: "Waiting" },
    { name: "Robert Wilson", time: "2:00 PM", status: "Scheduled" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
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
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Good Morning, {profile.full_name?.split(" ")[0] || "Doctor"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your practice today.
          </p>
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

        {/* Recent Patients */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="medical-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <h2 className="font-display text-xl font-semibold mb-4">
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-patient-light flex items-center justify-center">
                      <Users size={18} className="text-patient" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.time}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : patient.status === "In Progress"
                        ? "bg-amber-100 text-amber-700"
                        : patient.status === "Waiting"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="medical-card p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <h2 className="font-display text-xl font-semibold mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Users size={24} className="text-primary" />
                <span>View Patients</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Calendar size={24} className="text-primary" />
                <span>Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <FileText size={24} className="text-primary" />
                <span>Reports</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Activity size={24} className="text-primary" />
                <span>Analytics</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
