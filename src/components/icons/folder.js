import React from "react";

const FolderIcon = ({ className = "", stroke = "currentColor", ...props }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke={stroke}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

export default FolderIcon;