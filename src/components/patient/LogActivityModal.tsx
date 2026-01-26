import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LogActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: "medical_report_analyzer" | "diabetes_prediction" | null;
  onActivityLogged: () => void;
}

export function LogActivityModal({
  open,
  onOpenChange,
  preselectedService,
  onActivityLogged,
}: LogActivityModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<string>(preselectedService || "");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
    }
  }, [preselectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("patient_activities").insert({
        user_id: user.id,
        service_used: service,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Activity Logged",
        description: "Your service activity has been recorded.",
      });

      setService("");
      setNotes("");
      onOpenChange(false);
      onActivityLogged();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Service Activity</DialogTitle>
            <DialogDescription>
              Record which service you used and any notes about your experience.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Service Used *</Label>
              <Select value={service} onValueChange={setService} required>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_report_analyzer">
                    Medical Report Analyzer
                  </SelectItem>
                  <SelectItem value="diabetes_prediction">
                    Diabetes Prediction
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about your experience..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !service}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
