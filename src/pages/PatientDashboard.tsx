import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ServiceButtons } from "@/components/patient/ServiceButtons";
import { LogActivityModal } from "@/components/patient/LogActivityModal";
import { ActivityHistory } from "@/components/patient/ActivityHistory";
import {
  LogOut,
  User,
  Bell,
  ClipboardList,
} from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; patient_id: string | null }>({
    full_name: null,
    patient_id: null,
  });
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<
    "medical_report_analyzer" | "diabetes_prediction" | null
  >(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, patient_id")
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

  const handleServiceUsed = (service: "medical_report_analyzer" | "diabetes_prediction") => {
    setPreselectedService(service);
    setLogModalOpen(true);
  };

  const handleActivityLogged = () => {
    setActivityRefresh((prev) => prev + 1);
  };

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
        {/* Welcome Section with Patient ID */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome, {profile.full_name?.split(" ")[0] || "Patient"}!
              </h1>
              <p className="text-muted-foreground">
                Access your health services and track your activity.
              </p>
            </div>
            {profile.patient_id && (
              <div className="medical-card px-4 py-3 flex items-center gap-3">
                <ClipboardList size={20} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Your Patient ID</p>
                  <p className="font-mono font-semibold text-primary">
                    {profile.patient_id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Buttons */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="medical-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">
              Health Services
            </h2>
            <ServiceButtons onServiceUsed={handleServiceUsed} />
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setPreselectedService(null);
                  setLogModalOpen(true);
                }}
              >
                <ClipboardList size={16} className="mr-2" />
                Log Activity Manually
              </Button>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <ActivityHistory refreshTrigger={activityRefresh} />
        </div>
      </main>

      {/* Log Activity Modal */}
      <LogActivityModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        preselectedService={preselectedService}
        onActivityLogged={handleActivityLogged}
      />
    </div>
  );
}
