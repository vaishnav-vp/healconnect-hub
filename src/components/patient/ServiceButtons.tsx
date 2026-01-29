import { Button } from "@/components/ui/button";
import { FileText, Activity, ExternalLink } from "lucide-react";

interface ServiceButtonsProps
{
  onServiceUsed: (service: "medical_report_analyzer" | "diabetes_prediction") => void;
}

export function ServiceButtons({ onServiceUsed }: ServiceButtonsProps)
{
  const handleMedicalReport = () =>
  {
    // Open external URL (placeholder - replace with actual URL)
    window.open("https://medical-report-analyzer-for-all.streamlit.app/", "_blank");
    onServiceUsed("medical_report_analyzer");
  };

  const handleDiabetesPrediction = () =>
  {
    // Open external URL (placeholder - replace with actual URL)
    window.open("https://check-your-diabetes-here.streamlit.app/", "_blank");
    onServiceUsed("diabetes_prediction");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Button
        onClick={handleMedicalReport}
        variant="outline"
        className="h-auto py-8 flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText size={28} className="text-primary" />
        </div>
        <div className="text-center">
          <span className="font-semibold block">Medical Report Analyzer</span>
          <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            Opens in new tab <ExternalLink size={10} />
          </span>
        </div>
      </Button>

      <Button
        onClick={handleDiabetesPrediction}
        variant="outline"
        className="h-auto py-8 flex-col gap-3 hover:border-patient hover:bg-patient/5 transition-all"
      >
        <div className="w-14 h-14 rounded-full bg-patient/10 flex items-center justify-center">
          <Activity size={28} className="text-patient" />
        </div>
        <div className="text-center">
          <span className="font-semibold block">Diabetes Prediction</span>
          <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            Opens in new tab <ExternalLink size={10} />
          </span>
        </div>
      </Button>
    </div>
  );
}
