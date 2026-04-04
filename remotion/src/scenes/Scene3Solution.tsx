import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const features = [
  { icon: "📍", title: "Real-Time GPS", desc: "Track every vehicle, every route, live" },
  { icon: "🔐", title: "Facial Recognition", desc: "Biometric driver clocking & verification" },
  { icon: "🎫", title: "SASSA Verification", desc: "Grant holder discounts — verified instantly" },
  { icon: "💳", title: "Digital Payments", desc: "Cashless collection via Yoco integration" },
  { icon: "📊", title: "Fleet Analytics", desc: "Revenue tracking, compliance dashboards" },
  { icon: "🛡️", title: "Safety Network", desc: "Panic button, incident AI detection" },
];

export const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Title animation
  const titleSpring = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleSpring, [0, 1], [-80, 0]);

  return (
    <AbsoluteFill>
      {/* Brand reveal */}
      <Sequence from={0} durationInFrames={720}>
        <div style={{
          position: "absolute", top: 60, left: 0, right: 0,
          textAlign: "center",
          transform: `translateY(${titleY}px)`,
          opacity: titleSpring,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{
              width: interpolate(frame, [5, 40], [0, 60], { extrapolateRight: "clamp" }),
              height: 3, background: COLORS.electricGreen,
            }} />
            <span style={{
              fontFamily: FONTS.display, fontSize: 90, fontWeight: 700,
              color: COLORS.electricGreen,
              textShadow: `0 0 40px ${COLORS.electricGreen}40`,
            }}>
              TUKCONNECT
            </span>
            <div style={{
              width: interpolate(frame, [5, 40], [0, 60], { extrapolateRight: "clamp" }),
              height: 3, background: COLORS.electricGreen,
            }} />
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 24, color: COLORS.gold,
            letterSpacing: "0.3em", marginTop: 8,
            opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            POWERED BY POORTLINK (PTY) LTD
          </div>
        </div>
      </Sequence>
      
      {/* Feature cards - 3x2 grid */}
      <div style={{
        position: "absolute", top: 240, left: 60, right: 60, bottom: 100,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
      }}>
        {features.map((f, i) => {
          const delay = 80 + i * 40;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
          const scale = interpolate(s, [0, 1], [0.6, 1]);
          const op = interpolate(s, [0, 1], [0, 1]);
          
          // Highlight active feature
          const isActive = frame >= delay + 60 && frame < delay + 180;
          const glowIntensity = isActive ? Math.sin((frame - delay) * 0.1) * 0.3 + 0.3 : 0;
          
          return (
            <div key={i} style={{
              opacity: op,
              transform: `scale(${scale})`,
              background: `linear-gradient(160deg, ${COLORS.darkGray}DD, ${COLORS.navy}DD)`,
              borderRadius: 16,
              padding: "32px 28px",
              border: `1px solid ${isActive ? COLORS.electricGreen : COLORS.electricGreen + "20"}`,
              boxShadow: isActive ? `0 0 30px ${COLORS.electricGreen}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}` : "none",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <span style={{ fontSize: 44 }}>{f.icon}</span>
              <span style={{
                fontFamily: FONTS.display, fontSize: 28, color: COLORS.white, fontWeight: 600,
              }}>
                {f.title}
              </span>
              <span style={{
                fontFamily: FONTS.body, fontSize: 20, color: COLORS.lightGray, lineHeight: 1.4,
              }}>
                {f.desc}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
