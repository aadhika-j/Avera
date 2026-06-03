import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      data-theme={theme}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};

export default ThemeToggle;
