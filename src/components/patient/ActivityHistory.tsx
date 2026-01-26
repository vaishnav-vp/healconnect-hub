import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, FileText, Activity } from "lucide-react";
import { format } from "date-fns";

interface PatientActivity {
  id: string;
  service_used: string;
  notes: string | null;
  created_at: string;
}

interface ActivityHistoryProps {
  refreshTrigger: number;
}

export function ActivityHistory({ refreshTrigger }: ActivityHistoryProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<PatientActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, refreshTrigger]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("patient_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "medical_report_analyzer":
        return <FileText size={16} className="text-primary" />;
      case "diabetes_prediction":
        return <Activity size={16} className="text-patient" />;
      default:
        return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case "medical_report_analyzer":
        return "Medical Report Analyzer";
      case "diabetes_prediction":
        return "Diabetes Prediction";
      default:
        return service;
    }
  };

  if (loading) {
    return (
      <div className="medical-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="medical-card p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
        <p className="text-muted-foreground">
          Use a service above and log your activity to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="medical-card p-6">
      <h2 className="font-display text-xl font-semibold mb-4">
        Activity History
      </h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                  {getServiceIcon(activity.service_used)}
                </div>
                <div>
                  <p className="font-medium">
                    {getServiceLabel(activity.service_used)}
                  </p>
                  {activity.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.notes}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(activity.created_at), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
