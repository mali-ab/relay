import React from "react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Preparing your session...",
  fullScreen = true,
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm text-slate-800"
    : "flex flex-col items-center justify-center p-8 text-slate-700 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-100"></div>
        
        <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600"></div>

        <div className="absolute h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></div>
      </div>

      <p className="mt-6 text-sm font-semibold tracking-wide text-slate-700 animate-pulse">
        {message}
      </p>

      <span className="mt-2 text-xs text-slate-400 font-mono tracking-wider uppercase">
        Relay Video Services
      </span>
    </div>
  );
};

export default Loading;