import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

type Subtitle = { text: string; from: number; to: number };

export const SubtitleBar: React.FC<{ subtitles: Subtitle[] }> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  
  const current = subtitles.find((s) => frame >= s.from && frame <= s.to);
  if (!current) return null;
  
  const progress = (frame - current.from) / (current.to - current.from);
  const fadeIn = interpolate(frame, [current.from, current.from + 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [current.to - 12, current.to], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);
  const y = interpolate(fadeIn, [0, 1], [20, 0]);
  
  // Typewriter reveal
  const charsToShow = Math.floor(interpolate(frame, [current.from, current.from + current.text.length * 1.2], [0, current.text.length], { extrapolateRight: "clamp" }));
  const displayText = current.text.slice(0, charsToShow);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          background: `${COLORS.deepNavy}CC`,
          borderRadius: 12,
          padding: "16px 40px",
          border: `1px solid ${COLORS.electricGreen}40`,
          maxWidth: 1400,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: 36,
            color: COLORS.white,
            letterSpacing: "0.02em",
            lineHeight: 1.4,
          }}
        >
          {displayText}
          <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: COLORS.electricGreen }}>|</span>
        </span>
      </div>
    </div>
  );
};
