import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  signIn,
  signUp,
  signInDoctor,
  signUpDoctor,
  type AppRole,
} from "@/lib/auth";
import { Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface AuthFormProps {
  role: AppRole;
}

export function AuthForm({ role }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isDoctor = role === "doctor";
  const roleLabel = isDoctor ? "Doctor" : "Patient";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDoctor) {
        // Doctor authentication uses license number
        if (isLogin) {
          if (!licenseNumber.trim()) {
            throw new Error("Please enter your medical license number");
          }
          await signInDoctor(licenseNumber, password);
          toast({
            title: "Welcome back, Doctor!",
            description: "You've successfully signed in.",
          });
        } else {
          if (!licenseNumber.trim()) {
            throw new Error("Medical license number is required");
          }
          if (!fullName.trim()) {
            throw new Error("Full name is required");
          }
          await signUpDoctor(licenseNumber, password, fullName);
          toast({
            title: "Account created!",
            description: "Welcome to MediCare+, Doctor.",
          });
        }
      } else {
        // Patient authentication uses email
        if (isLogin) {
          await signIn(email, password);
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        } else {
          await signUp(email, password, role, fullName);
          toast({
            title: "Account created!",
            description: "Welcome to MediCare+.",
          });
        }
      }
      navigate(`/${role}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {isLogin ? `${roleLabel} Login` : `${roleLabel} Sign Up`}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? "Welcome back! Please sign in to continue."
                : "Create your account to get started."}
            </p>
          </div>

          <div className="medical-card p-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
                isDoctor
                  ? "bg-doctor-light text-doctor"
                  : "bg-patient-light text-patient"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDoctor ? "bg-doctor" : "bg-patient"
                }`}
              />
              {roleLabel} Portal
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={isDoctor ? "Dr. John Smith" : "John Smith"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="h-12"
                  />
                </div>
              )}

              {isDoctor ? (
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="e.g., MED-12345-XX"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your unique medical license number
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold shadow-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="font-semibold text-primary">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="font-semibold text-primary">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
