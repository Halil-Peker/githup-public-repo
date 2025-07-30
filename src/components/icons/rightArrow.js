import React from "react";

const RightArrowIcon = ({ 
  className = "", 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg
    className={`w-4 h-4 mx-1 text-gray-500 group-hover:text-gray-300 ${className}`}
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default RightArrowIcon;