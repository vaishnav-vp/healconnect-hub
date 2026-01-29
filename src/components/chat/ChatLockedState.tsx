import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Stethoscope, UserCircle } from "lucide-react";

export function ChatLockedState() {
  const navigate = useNavigate();

  const handleLogin = (role: "doctor" | "patient") => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Sign in Required</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Please sign in to use the chatbot and get personalized medical assistance.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-[200px]">
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={() => handleLogin("patient")}
        >
          <UserCircle size={18} />
          Login as Patient
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => handleLogin("doctor")}
        >
          <Stethoscope size={18} />
          Login as Doctor
        </Button>
      </div>
    </div>
  );
}
