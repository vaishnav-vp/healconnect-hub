import { Heart } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="gradient-medical rounded-xl p-2">
          <Heart className="text-primary-foreground" size={icon} fill="currentColor" />
        </div>
      </div>
      <span className={`font-display font-bold text-foreground ${text}`}>
        MediCare<span className="text-primary">+</span>
      </span>
    </div>
  );
}
