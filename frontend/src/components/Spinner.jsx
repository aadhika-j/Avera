import React from "react";

export const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const ButtonSpinner = () => (
  <div
    className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin inline-block align-middle mr-2"
    role="status"
  />
);

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <Spinner size="lg" />
    <p className="text-slate-500 font-medium animate-pulse text-sm tracking-widest uppercase">
      Loading...
    </p>
  </div>
);
