import React from "react";

const LeftArrowIcon = ({ 
  className = "",
  stroke = "currentColor",
  strokeWidth = 2,
  size = 5, // default Tailwind size (w-5 h-5)
  ...props 
}) => (
  <svg
    className={`w-${size} h-${size} mr-2 ${className}`}
    fill="none"
    stroke={stroke}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

export default LeftArrowIcon;