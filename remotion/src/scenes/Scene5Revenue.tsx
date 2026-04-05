import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const streams = [
  { title: "SaaS Subscriptions", amount: "R499/mo", desc: "Per vehicle fleet management", color: COLORS.electricGreen, width: 55 },
  { title: "Transaction Fees", amount: "1.5%", desc: "On every digital payment", color: COLORS.accentBlue, width: 40 },
  { title: "SASSA Processing", amount: "R5/verify", desc: "Grant verification fees", color: COLORS.gold, width: 20 },
  { title: "Advertising", amount: "Wraps+Ads", desc: "Vehicle wraps & in-app banners", color: "#FF6B6B", width: 30 },
  { title: "Fintech & VAS", amount: "Referrals", desc: "Micro-loans, airtime, electricity", color: "#A78BFA", width: 25 },
  { title: "Data Analytics", amount: "Licensing", desc: "Anonymised transport insights", color: "#38BDF8", width: 35 },
];

export const Scene5Revenue: React.FC = () => {
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
          fontFamily: FONTS.display, fontSize: 72, fontWeight: 700, color: COLORS.electricGreen,
        }}>
          REVENUE MODEL
        </span>
        <div style={{
          fontFamily: FONTS.body, fontSize: 24, color: COLORS.lightGray,
         letterSpacing: "0.1em", marginTop: 4,
        }}>
          Six diversified income streams
        </div>
      </div>
      
      {/* Revenue stream cards */}
      <div style={{
        position: "absolute", top: 220, left: 80, right: 80, bottom: 100,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {streams.map((s, i) => {
          const delay = 40 + i * 50;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 18 } });
          const barWidth = interpolate(sp, [0, 1], [0, s.width]);
          const op = interpolate(sp, [0, 1], [0, 1]);
          const x = interpolate(sp, [0, 1], [-60, 0]);
          
          return (
            <div key={i} style={{ opacity: op, transform: `translateX(${x}px)` }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: FONTS.display, fontSize: 40, fontWeight: 700, color: s.color,
                }}>
                  {s.amount}
                </span>
                <div>
                  <div style={{
                    fontFamily: FONTS.display, fontSize: 26, color: COLORS.white, fontWeight: 600,
                  }}>
                    {s.title}
                  </div>
                  <div style={{
                    fontFamily: FONTS.body, fontSize: 18, color: COLORS.lightGray,
                  }}>
                    {s.desc}
                  </div>
                </div>
              </div>
              {/* Animated bar */}
              <div style={{
                width: "100%", height: 8, borderRadius: 4,
                background: `${COLORS.darkGray}`,
              }}>
                <div style={{
                  width: `${barWidth}%`, height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`,
                  boxShadow: `0 0 20px ${s.color}40`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total market callout */}
      <Sequence from={360} durationInFrames={270}>
        <div style={{
          position: "absolute", bottom: 140, right: 80,
          opacity: interpolate(spring({ frame: frame - 360, fps, config: { damping: 15 } }), [0, 1], [0, 1]),
          transform: `scale(${interpolate(spring({ frame: frame - 360, fps, config: { damping: 12 } }), [0, 1], [0.8, 1])})`,
          background: `linear-gradient(135deg, ${COLORS.electricGreen}20, ${COLORS.gold}20)`,
          borderRadius: 16, padding: "24px 40px",
          border: `1px solid ${COLORS.gold}40`,
        }}>
          <span style={{
            fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray,
          }}>
            TAM: R90B industry × {" "}
          </span>
          <span style={{
            fontFamily: FONTS.display, fontSize: 36, color: COLORS.gold, fontWeight: 700,
          }}>
            First-Mover Advantage
          </span>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
