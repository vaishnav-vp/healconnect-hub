import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  Stethoscope,
  User,
  Shield,
  Clock,
  Heart,
  ArrowRight,
  Check,
} from "lucide-react";
import { useEffect } from "react";

export default function Index() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user && role) {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your medical records and schedule anytime, anywhere.",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Get tailored health insights and recommendations.",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-12 pb-24">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-patient/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Heart size={16} className="animate-pulse-soft" />
            Trusted by healthcare professionals
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in leading-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-primary to-patient bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            Streamline patient care, manage appointments, and access medical records—all in one secure platform designed for doctors and patients.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Button
              size="lg"
              onClick={() => navigate("/login/doctor")}
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold shadow-button gap-3 group"
            >
              <Stethoscope size={22} />
              Login as Doctor
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login/patient")}
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold gap-3 group border-2 hover:bg-patient/5 hover:border-patient hover:text-patient"
            >
              <User size={22} />
              Login as Patient
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="medical-card p-6 text-center animate-slide-up"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-primary" size={26} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold mb-4">
                  Why Choose MediCare+?
                </h2>
                <p className="text-muted-foreground mb-6">
                  We've built a platform that puts patients and healthcare providers first, making healthcare management simpler and more efficient.
                </p>
                <ul className="space-y-3">
                  {[
                    "Intuitive appointment scheduling",
                    "Secure electronic health records",
                    "Real-time communication tools",
                    "Comprehensive analytics dashboard",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="medical-card p-8 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4">
                      <p className="font-display text-4xl font-bold text-primary">10k+</p>
                      <p className="text-sm text-muted-foreground">Patients</p>
                    </div>
                    <div className="text-center p-4">
                      <p className="font-display text-4xl font-bold text-primary">500+</p>
                      <p className="text-sm text-muted-foreground">Doctors</p>
                    </div>
                    <div className="text-center p-4">
                      <p className="font-display text-4xl font-bold text-primary">50k+</p>
                      <p className="text-sm text-muted-foreground">Appointments</p>
                    </div>
                    <div className="text-center p-4">
                      <p className="font-display text-4xl font-bold text-primary">99%</p>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2026 MediCare+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
