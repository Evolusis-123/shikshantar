import type { ReactNode } from "react";
import "./GradientText.css";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: "horizontal" | "vertical" | "diagonal";
}

export default function GradientText({
  children,
  className = "",
  colors = ["#1e2a4a", "#ff6a00", "#1e2a4a"],
  animationSpeed = 8,
  showBorder = false,
  direction = "horizontal",
}: GradientTextProps) {
  const gradientAngle =
    direction === "horizontal" ? "to right" : direction === "vertical" ? "to bottom" : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");
  const backgroundSize =
    direction === "horizontal" ? "300% 100%" : direction === "vertical" ? "100% 300%" : "300% 300%";

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`animated-gradient-text ${showBorder ? "with-border" : ""} ${className}`.trim()}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle} />}
      <span className="text-content" style={gradientStyle}>
        {children}
      </span>
    </div>
  );
}
