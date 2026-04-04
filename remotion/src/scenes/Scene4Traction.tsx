import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const milestones = [
  { label: "CIPC Registered", icon: "✅", detail: "Company & IP protected" },
  { label: "SARS Compliant", icon: "✅", detail: "Tax clearance secured" },
  { label: "POPIA Framework", icon: "🔒", detail: "Full privacy compliance" },
  { label: "Trademarks Filed", icon: "™️", detail: "TukConnect & Poortlink" },
  { label: "Platform Built", icon: "🚀", detail: "Live, functional product" },
  { label: "Pilot: Eersterust", icon: "📍", detail: "Ready to deploy" },
];

export const Scene4Traction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{
        position: "absolute", top: 60, left: 80,
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span style={{
          fontFamily: FONTS.display, fontSize: 80, fontWeight: 700,
          color: COLORS.gold,
        }}>
          TRACTION
        </span>
        <div style={{
          fontFamily: FONTS.body, fontSize: 28, color: COLORS.lightGray,
          letterSpacing: "0.1em", marginTop: 4,
        }}>
          We're not just an idea — we've built it.
        </div>
      </div>
      
      {/* Timeline */}
      <div style={{
        position: "absolute", top: 240, left: 120, right: 120, bottom: 120,
      }}>
        {/* Vertical progress line */}
        <div style={{
          position: "absolute", left: 30, top: 0,
          width: 3,
          height: interpolate(frame, [30, 500], [0, 700], { extrapolateRight: "clamp" }),
          background: `linear-gradient(180deg, ${COLORS.electricGreen}, ${COLORS.gold})`,
        }} />
        
        {milestones.map((m, i) => {
          const delay = 60 + i * 60;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
          const x = interpolate(s, [0, 1], [100, 0]);
          const op = interpolate(s, [0, 1], [0, 1]);
          
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 30,
              marginBottom: 20, opacity: op, transform: `translateX(${x}px)`,
            }}>
              {/* Dot on timeline */}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLORS.electricGreen}30, ${COLORS.darkGray})`,
                border: `2px solid ${COLORS.electricGreen}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, flexShrink: 0,
              }}>
                {m.icon}
              </div>
              
              {/* Content */}
              <div style={{
                background: `${COLORS.darkGray}AA`,
                borderRadius: 12, padding: "20px 32px",
                border: `1px solid ${COLORS.electricGreen}20`,
                flex: 1,
              }}>
                <div style={{
                  fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, fontWeight: 600,
                }}>
                  {m.label}
                </div>
                <div style={{
                  fontFamily: FONTS.body, fontSize: 20, color: COLORS.lightGray, marginTop: 4,
                }}>
                  {m.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
