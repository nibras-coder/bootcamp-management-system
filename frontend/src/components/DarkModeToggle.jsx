import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className={`theme-toggle ${darkMode ? "dark" : ""}`}
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      type="button"
    >
      <span className="theme-toggle-icon">
        {darkMode ? <FaMoon /> : <FaSun />}
      </span>

      <span className="theme-toggle-text">
        {darkMode ? "Dark" : "Light"}
      </span>
    </button>
  );
}