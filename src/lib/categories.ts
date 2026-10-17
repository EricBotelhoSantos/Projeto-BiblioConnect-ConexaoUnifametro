import { BookOpenText, Briefcase, Cpu, GraduationCap, HeartPulse, Landmark, Scale } from "lucide-react";
import type { Category } from "./types";

export const CATEGORIES: { name: Category; icon: React.ElementType }[] = [
  { name: "Tecnologia e Computação", icon: Cpu },
  { name: "Saúde", icon: HeartPulse },
  { name: "Administração", icon: Briefcase },
  { name: "Direito", icon: Scale },
  { name: "Educação", icon: GraduationCap },
  { name: "Ciências Humanas", icon: Landmark },
  { name: "Literatura", icon: BookOpenText },
];
