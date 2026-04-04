import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const problems = [
  { icon: "💳", label: "No Digital Payments", desc: "Cash-only means leakage & risk" },
  { icon: "📍", label: "No GPS Tracking", desc: "Vehicles vanish between ranks" },
  { icon: "👤", label: "No Accountability", desc: "Drivers unverified & unmonitored" },
  { icon: "🏛️", label: "No Visibility", desc: "Government can't regulate the invisible" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Title */}
      <Sequence from={0} durationInFrames={540}>
        <div style={{
          position: "absolute", top: 80, left: 80, right: 80,
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <span style={{
            fontFamily: FONTS.display, fontSize: 80, fontWeight: 700,
            color: COLORS.red, letterSpacing: "-0.02em",
          }}>
            THE PROBLEM
          </span>
          <div style={{
            width: interpolate(frame, [10, 50], [0, 300], { extrapolateRight: "clamp" }),
            height: 4, background: COLORS.red, marginTop: 10,
          }} />
        </div>
      </Sequence>
      
      {/* Problem cards */}
      <div style={{
        position: "absolute", top: 250, left: 80, right: 80, bottom: 200,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40,
      }}>
        {problems.map((p, i) => {
          const delay = 60 + i * 45;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
          const x = interpolate(s, [0, 1], [i % 2 === 0 ? -200 : 200, 0]);
          const op = interpolate(s, [0, 1], [0, 1]);
          
          // Glitch effect on appear
          const glitchX = frame >= delay && frame < delay + 8 ? Math.sin(frame * 20) * 5 : 0;
          
          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateX(${x + glitchX}px)`,
              background: `linear-gradient(135deg, ${COLORS.darkGray}CC, ${COLORS.navy}CC)`,
              borderRadius: 16,
              padding: "40px 48px",
              border: `1px solid ${COLORS.red}30`,
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <span style={{ fontSize: 48 }}>{p.icon}</span>
              <span style={{
                fontFamily: FONTS.display, fontSize: 36, color: COLORS.white,
                fontWeight: 600,
              }}>
                {p.label}
              </span>
              <span style={{
                fontFamily: FONTS.body, fontSize: 24, color: COLORS.lightGray,
              }}>
                {p.desc}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Pulsing warning indicator */}
      <div style={{
        position: "absolute", top: 90, right: 80,
        opacity: Math.sin(frame * 0.15) * 0.5 + 0.5,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: COLORS.red,
          boxShadow: `0 0 20px ${COLORS.red}80`,
        }} />
      </div>
    </AbsoluteFill>
  );
};
