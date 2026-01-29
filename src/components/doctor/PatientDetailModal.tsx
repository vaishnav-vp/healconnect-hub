import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText,
  Activity,
  ExternalLink,
  User,
  Calendar,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";

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

interface PatientDetailModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientUpdated: () => void;
}

export function PatientDetailModal({
  patient,
  open,
  onOpenChange,
  onPatientUpdated,
}: PatientDetailModalProps) {
  const [checkNotes, setCheckNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!patient) return null;

  const handleServiceCheck = async (
    service: "medical_report" | "diabetes_prediction"
  ) => {
    // Open external URL
    const url =
      service === "medical_report"
        ? "https://example.com/medical-report-analyzer"
        : "https://example.com/diabetes-prediction";
    window.open(url, "_blank");
  };

  const handleLogCheck = async (
    service: "medical_report" | "diabetes_prediction"
  ) => {
    if (!patient) return;
    setLoading(true);

    try {
      const updateData =
        service === "medical_report"
          ? { medical_report_analyzed: true }
          : { diabetes_prediction_performed: true };

      // Append notes if provided
      const newNotes = checkNotes.trim()
        ? `${patient.notes || ""}\n[${format(new Date(), "MMM d, yyyy HH:mm")}] ${
            service === "medical_report" ? "Report Analyzed" : "Diabetes Check"
          }: ${checkNotes}`.trim()
        : patient.notes;

      const { error } = await supabase
        .from("patients")
        .update({ ...updateData, notes: newNotes })
        .eq("id", patient.id);

      if (error) throw error;

      toast.success(
        `${service === "medical_report" ? "Report analysis" : "Diabetes check"} logged successfully`
      );
      setCheckNotes("");
      onPatientUpdated();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to log check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-patient-light flex items-center justify-center">
              <User size={20} className="text-patient" />
            </div>
            <div>
              <span className="block">{patient.name}</span>
              <span className="text-sm font-mono text-muted-foreground font-normal">
                {patient.patient_id}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Age:</span>
            <span className="font-medium">{patient.age || "N/A"} years</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Gender:</span>
            <span className="font-medium capitalize">{patient.gender || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Added:</span>
            <span className="font-medium">
              {format(new Date(patient.created_at), "PPP")}
            </span>
          </div>
        </div>

        {/* Service Status */}
        <div className="flex gap-4 py-4 border-b border-border">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              patient.medical_report_analyzed
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {patient.medical_report_analyzed ? (
              <CheckCircle size={16} />
            ) : (
              <FileText size={16} />
            )}
            <span className="text-sm font-medium">
              {patient.medical_report_analyzed ? "Report Analyzed" : "Report Pending"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              patient.diabetes_prediction_performed
                ? "bg-patient/10 text-patient"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {patient.diabetes_prediction_performed ? (
              <CheckCircle size={16} />
            ) : (
              <Activity size={16} />
            )}
            <span className="text-sm font-medium">
              {patient.diabetes_prediction_performed
                ? "Diabetes Checked"
                : "Diabetes Pending"}
            </span>
          </div>
        </div>

        {/* Services Tabs */}
        <Tabs defaultValue="report" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="report" className="gap-2">
              <FileText size={16} />
              Medical Report
            </TabsTrigger>
            <TabsTrigger value="diabetes" className="gap-2">
              <Activity size={16} />
              Diabetes Check
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Medical Report Analyzer</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze patient's medical reports using the external tool.
              </p>
              <Button
                onClick={() => handleServiceCheck("medical_report")}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink size={16} />
                Open Report Analyzer
              </Button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Log notes after checking (optional)
              </label>
              <Textarea
                placeholder="Enter any observations or findings..."
                value={checkNotes}
                onChange={(e) => setCheckNotes(e.target.value)}
                rows={3}
              />
              <Button
                onClick={() => handleLogCheck("medical_report")}
                disabled={loading || patient.medical_report_analyzed}
                className="gap-2"
              >
                <ClipboardList size={16} />
                {patient.medical_report_analyzed
                  ? "Already Logged"
                  : "Log Report Check"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="diabetes" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Diabetes Prediction Tool</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Run diabetes prediction analysis for the patient.
              </p>
              <Button
                onClick={() => handleServiceCheck("diabetes_prediction")}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink size={16} />
                Open Diabetes Predictor
              </Button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Log notes after checking (optional)
              </label>
              <Textarea
                placeholder="Enter any observations or findings..."
                value={checkNotes}
                onChange={(e) => setCheckNotes(e.target.value)}
                rows={3}
              />
              <Button
                onClick={() => handleLogCheck("diabetes_prediction")}
                disabled={loading || patient.diabetes_prediction_performed}
                className="gap-2"
              >
                <ClipboardList size={16} />
                {patient.diabetes_prediction_performed
                  ? "Already Logged"
                  : "Log Diabetes Check"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Existing Notes */}
        {patient.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Patient Notes</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
              {patient.notes}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
