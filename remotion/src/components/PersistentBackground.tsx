import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../styles";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Slow drifting gradient
  const gradientAngle = interpolate(frame, [0, 3600], [135, 225]);
  
  // Subtle pulsing accent circles
  const pulse1 = Math.sin(frame * 0.02) * 0.15 + 0.15;
  const pulse2 = Math.sin(frame * 0.015 + 2) * 0.1 + 0.1;
  
  const x1 = interpolate(frame, [0, 3600], [10, 60]);
  const y1 = interpolate(frame, [0, 3600], [20, 80]);
  const x2 = interpolate(frame, [0, 3600], [80, 30]);
  const y2 = interpolate(frame, [0, 3600], [70, 20]);

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gradientAngle}deg, ${COLORS.deepNavy} 0%, ${COLORS.navy} 40%, ${COLORS.darkGray} 100%)`,
        }}
      />
      {/* Floating accent orbs */}
      <div
        style={{
          position: "absolute",
          left: `${x1}%`,
          top: `${y1}%`,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.electricGreen}${Math.round(pulse1 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: "blur(80px)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${x2}%`,
          top: `${y2}%`,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}${Math.round(pulse2 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: "blur(80px)",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.white}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.white}08 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: interpolate(frame, [0, 60], [0, 0.3], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};
