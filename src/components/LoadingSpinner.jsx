export default function LoadingSpinner({ size = "md", text = "" }) {
  const sizeClasses = {
    sm: "spinner-sm",
    md: "spinner-md",
    lg: "spinner-lg",
  };

  return (
    <div className="loading-container" id="loading-spinner">
      <div className={`spinner ${sizeClasses[size] || "spinner-md"}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
