import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, FileText, Activity, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { PatientDetailModal } from "./PatientDetailModal";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  notes: string | null;
  medical_report_analyzed: boolean;
  diabetes_prediction_performed: boolean;
  created_at: string;
}

interface PatientListProps {
  refreshTrigger: number;
}

export function PatientList({ refreshTrigger }: PatientListProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user, refreshTrigger]);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handlePatientUpdated = () => {
    fetchPatients();
  };

  if (loading) {
    return (
      <div className="medical-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="medical-card p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No patients yet</h3>
        <p className="text-muted-foreground">
          Click "Add Patient" to add your first patient record.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="medical-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">
          Your Patients ({patients.length})
        </h2>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-patient-light flex items-center justify-center">
                    <Users size={18} className="text-patient" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {patient.patient_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {patient.age && (
                      <span className="text-sm text-muted-foreground">
                        {patient.age} yrs
                      </span>
                    )}
                    {patient.gender && (
                      <span className="text-sm text-muted-foreground capitalize ml-2">
                        • {patient.gender}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  {patient.medical_report_analyzed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      <FileText size={12} />
                      Report Analyzed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs">
                      <FileText size={12} />
                      Report Pending
                    </span>
                  )}
                  {patient.diabetes_prediction_performed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-patient/10 text-patient text-xs">
                      <Activity size={12} />
                      Diabetes Checked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs">
                      <Activity size={12} />
                      Diabetes Pending
                    </span>
                  )}
                </div>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {format(new Date(patient.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PatientDetailModal
        patient={selectedPatient}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPatientUpdated={handlePatientUpdated}
      />
    </>
  );
}
