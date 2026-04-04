import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const AnimatedNumber: React.FC<{
  value: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  color?: string;
  size?: number;
}> = ({ value, prefix = "", suffix = "", delay = 0, color = COLORS.electricGreen, size = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 80 } });
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
      <span style={{ fontFamily: FONTS.display, fontSize: size, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
        {prefix}{value}{suffix}
      </span>
    </div>
  );
};
