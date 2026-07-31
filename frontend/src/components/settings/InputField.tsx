import { AlertTriangle } from "lucide-react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  icon: Icon,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-rose-300 focus:ring-rose-500" : "border-slate-200"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

