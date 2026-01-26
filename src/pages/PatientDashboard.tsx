import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  Calendar,
  FileText,
  Pill,
  Heart,
  Clock,
  User,
  Bell,
} from "lucide-react";

export default function PatientDashboard() {
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

  const upcomingAppointments = [
    {
      doctor: "Dr. Sarah Mitchell",
      specialty: "General Physician",
      date: "Jan 28, 2026",
      time: "10:00 AM",
    },
    {
      doctor: "Dr. James Lee",
      specialty: "Cardiologist",
      date: "Feb 5, 2026",
      time: "2:30 PM",
    },
  ];

  const healthMetrics = [
    { label: "Heart Rate", value: "72 bpm", icon: Heart, status: "normal" },
    { label: "Prescriptions", value: "3 Active", icon: Pill, status: "normal" },
    { label: "Last Checkup", value: "2 weeks ago", icon: Clock, status: "warning" },
    { label: "Reports", value: "5 New", icon: FileText, status: "info" },
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
              <div className="w-10 h-10 rounded-full bg-patient-light flex items-center justify-center">
                <User size={20} className="text-patient" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile.full_name || "Patient"}</p>
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
            Welcome, {profile.full_name?.split(" ")[0] || "Patient"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your health journey with ease.
          </p>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {healthMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className="medical-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon
                  className={
                    metric.status === "normal"
                      ? "text-primary"
                      : metric.status === "warning"
                      ? "text-amber-500"
                      : "text-patient"
                  }
                  size={24}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    metric.status === "normal"
                      ? "bg-green-500"
                      : metric.status === "warning"
                      ? "bg-amber-500"
                      : "bg-patient"
                  }`}
                />
              </div>
              <p className="text-xl font-semibold font-display mb-1">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="medical-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Upcoming Appointments
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.doctor}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{apt.doctor}</p>
                      <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-doctor-light flex items-center justify-center">
                      <Calendar size={18} className="text-doctor" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {apt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Calendar className="mr-2" size={18} />
              Book New Appointment
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="medical-card p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <h2 className="font-display text-xl font-semibold mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Calendar size={24} className="text-primary" />
                <span>Appointments</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <FileText size={24} className="text-primary" />
                <span>Medical Records</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Pill size={24} className="text-primary" />
                <span>Prescriptions</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Heart size={24} className="text-primary" />
                <span>Health Tracker</span>
              </Button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="font-medium text-primary mb-2">Health Tip of the Day</h3>
              <p className="text-sm text-muted-foreground">
                Stay hydrated! Aim to drink at least 8 glasses of water daily to maintain optimal health.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
