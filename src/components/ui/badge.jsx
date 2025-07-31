import * as React from "react"

const badgeVariants = {
  default: "border-transparent bg-gray-900 text-white hover:bg-gray-800",
  secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
  outline: "text-gray-900 border-gray-200",
}

function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = badgeVariants[variant] || badgeVariants.default;
  
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${variantClass} ${className}`} 
      {...props} 
    />
  )
}

export { Badge }

