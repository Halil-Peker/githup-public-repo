import React from "react";

const ForkIcon = ({ className = "", fill = "#fff", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    className={`w-4 h-4 ${className}`}
    {...props}
  >
    <path
      d="M12 5.83a3.001 3.001 0 1 1 2 0V9H9v1.17a3.001 3.001 0 1 1-2 0V9H2V5.83a3.001 3.001 0 1 1 2 0V7h8V5.83zM7 12v2h2v-2H7zM2 2v2h2V2H2zm10 0v2h2V2h-2z"
      fillRule="evenodd"
    />
  </svg>
);

export default ForkIcon;