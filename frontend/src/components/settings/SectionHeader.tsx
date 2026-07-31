import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SectionHeader({
  icon: Icon,
  title,
  description,
  isOpen,
  onToggle,
}: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
        <p className="text-sm text-slate-500 truncate">{description}</p>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors shrink-0"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </button>
  );
}

