import React from "react";

const Button = ({ children, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full bg-teal-800 hover:bg-teal-900 disabled:bg-teal-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-md"
    >
      {children}
    </button>
  );
};

export default Button;