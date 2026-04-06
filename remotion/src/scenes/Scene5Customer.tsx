import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const timeline = [
  { phase: "PILOT", period: "Month 1–6", detail: "5–10 owners in Eersterust", color: COLORS.electricGreen },
  { phase: "SOFT LAUNCH", period: "Month 7–12", detail: "20–50 owners via word-of-mouth", color: COLORS.accentBlue },
  { phase: "TRACTION", period: "Month 13–18", detail: "First association deal (50+ vehicles)", color: COLORS.gold },
  { phase: "SCALE", period: "Month 19–30", detail: "Multiple associations + gov tenders", color: "#FF6B6B" },
];

export const Scene5Customer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{
        position: "absolute", top: 50, left: 80,
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span style={{
          fontFamily: FONTS.display, fontSize: 68, fontWeight: 700, color: COLORS.gold,
        }}>
          TARGET CUSTOMER
        </span>
        <div style={{
          fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray,
          letterSpacing: "0.1em", marginTop: 4,
        }}>
          Who buys in — and why
        </div>
      </div>

      {/* Primary Customer Card */}
      <Sequence from={30} durationInFrames={680}>
        {(() => {
          const s = spring({ frame: frame - 30, fps, config: { damping: 18 } });
          return (
            <div style={{
              position: "absolute", top: 190, left: 80, right: 980,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
              background: `linear-gradient(135deg, ${COLORS.electricGreen}15, ${COLORS.darkGray})`,
              borderRadius: 16, padding: "28px 32px",
              border: `2px solid ${COLORS.electricGreen}50`,
            }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.electricGreen, letterSpacing: "0.2em" }}>
                PRIMARY CUSTOMER
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 42, color: COLORS.white, fontWeight: 700, marginTop: 8 }}>
                Vehicle Owners
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 20, color: COLORS.lightGray, marginTop: 12, lineHeight: 1.5 }}>
                Solving "operational opacity" — cash skimming & unreported trips.
              </div>
              <div style={{
                marginTop: 16, background: `${COLORS.electricGreen}20`, borderRadius: 10, padding: "12px 20px",
              }}>
                <span style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.electricGreen, fontWeight: 700 }}>
                  R2,000–R5,000/mo
                </span>
                <span style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.lightGray, marginLeft: 12 }}>
                  recovered per vehicle
                </span>
              </div>
            </div>
          );
        })()}
      </Sequence>

      {/* Scale Multiplier Card */}
      <Sequence from={90} durationInFrames={620}>
        {(() => {
          const s = spring({ frame: frame - 90, fps, config: { damping: 18 } });
          return (
            <div style={{
              position: "absolute", top: 190, left: 980, right: 80,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [60, 0])}px)`,
              background: `linear-gradient(135deg, ${COLORS.gold}15, ${COLORS.darkGray})`,
              borderRadius: 16, padding: "28px 32px",
              border: `2px solid ${COLORS.gold}50`,
            }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.gold, letterSpacing: "0.2em" }}>
                SCALE MULTIPLIER
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 42, color: COLORS.white, fontWeight: 700, marginTop: 8 }}>
                Taxi Associations
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 20, color: COLORS.lightGray, marginTop: 12, lineHeight: 1.5 }}>
                1–2 early adopters create "visibility FOMO" → route-wide contracts.
              </div>
              <div style={{
                marginTop: 16, background: `${COLORS.gold}20`, borderRadius: 10, padding: "12px 20px",
              }}>
                <span style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.gold, fontWeight: 700 }}>
                  50+ vehicles
                </span>
                <span style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.lightGray, marginLeft: 12 }}>
                  per association deal
                </span>
              </div>
            </div>
          );
        })()}
      </Sequence>

      {/* PM Timeline */}
      <div style={{
        position: "absolute", top: 540, left: 80, right: 80,
        opacity: interpolate(frame, [150, 180], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontFamily: FONTS.body, fontSize: 18, color: COLORS.lightGray, letterSpacing: "0.2em", marginBottom: 16,
        }}>
          PROJECT TIMELINE
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {timeline.map((t, i) => {
            const delay = 200 + i * 50;
            const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
            return (
              <div key={i} style={{
                flex: 1, opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                borderTop: `4px solid ${t.color}`,
                background: `${COLORS.darkGray}CC`,
                borderRadius: "0 0 12px 12px", padding: "20px",
              }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 22, color: t.color, fontWeight: 700 }}>
                  {t.phase}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.white, marginTop: 6 }}>
                  {t.period}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.lightGray, marginTop: 4 }}>
                  {t.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Moat callout */}
      <Sequence from={420} durationInFrames={290}>
        {(() => {
          const s = spring({ frame: frame - 420, fps, config: { damping: 15 } });
          return (
            <div style={{
              position: "absolute", bottom: 80, left: 80, right: 80,
              opacity: s, textAlign: "center",
              background: `linear-gradient(135deg, ${COLORS.electricGreen}10, ${COLORS.gold}10)`,
              borderRadius: 12, padding: "20px 40px",
              border: `1px solid ${COLORS.gold}30`,
            }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray }}>
                3–6 month DOT licensing delay = competitive{" "}
              </span>
              <span style={{ fontFamily: FONTS.display, fontSize: 30, color: COLORS.gold, fontWeight: 700 }}>
                MOAT
              </span>
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
