function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
}) {
  const baseStyles =
    "rounded-lg px-5 py-2.5 font-semibold transition";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",

    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",

    danger:
      "bg-red-500 text-white hover:bg-red-600",

    outline:
      "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;