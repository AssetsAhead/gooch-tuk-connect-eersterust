import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene7FareEconomics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Worst case column
  const worstSpring = spring({ frame: frame - 60, fps, config: { damping: 18 } });
  // Utopia column
  const utopiaSpring = spring({ frame: frame - 120, fps, config: { damping: 18 } });

  const worstItems = [
    { label: "Fare price", value: "R15" },
    { label: "Trips/day", value: "30" },
    { label: "Daily gross", value: "R450" },
    { label: "SaaS portion", value: "R0.55" },
    { label: "Transaction fee", value: "—" },
    { label: "Platform rev/fare", value: "R0.55" },
    { label: "Monthly (per vehicle)", value: "R450" },
  ];

  const utopiaItems = [
    { label: "Fare price", value: "R20" },
    { label: "Trips/day", value: "50" },
    { label: "Daily gross", value: "R1,000" },
    { label: "SaaS portion", value: "R0.33" },
    { label: "Transaction fee", value: "R0.30" },
    { label: "Platform rev/fare", value: "R2.83" },
    { label: "Monthly (per vehicle)", value: "R4,245" },
  ];

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{
        position: "absolute", top: 50, left: 80,
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span style={{
          fontFamily: FONTS.display, fontSize: 68, fontWeight: 700, color: COLORS.accentBlue,
        }}>
          REVENUE PER FARE
        </span>
        <div style={{
          fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray,
          letterSpacing: "0.1em", marginTop: 4,
        }}>
          Unit economics — worst case vs. full potential
        </div>
      </div>

      {/* Two-column comparison */}
      <div style={{
        position: "absolute", top: 200, left: 80, right: 80, bottom: 120,
        display: "flex", gap: 40,
      }}>
        {/* Worst Case */}
        <div style={{
          flex: 1, opacity: worstSpring,
          transform: `translateY(${interpolate(worstSpring, [0, 1], [50, 0])}px)`,
          background: `linear-gradient(180deg, ${COLORS.red}15, ${COLORS.darkGray})`,
          borderRadius: 20, padding: "32px",
          border: `2px solid ${COLORS.red}40`,
        }}>
          <div style={{
            fontFamily: FONTS.display, fontSize: 32, color: COLORS.red, fontWeight: 700,
            marginBottom: 8,
          }}>
            ⚠️ WORST CASE
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 16, color: COLORS.lightGray, marginBottom: 24,
          }}>
            Cash only, minimal adoption, 30 trips/day
          </div>
          {worstItems.map((item, i) => {
            const s = spring({ frame: frame - 80 - i * 20, fps, config: { damping: 20 } });
            const isTotal = i === worstItems.length - 1;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                opacity: s, padding: "10px 0",
                borderBottom: isTotal ? "none" : `1px solid ${COLORS.darkGray}`,
                borderTop: isTotal ? `2px solid ${COLORS.red}40` : "none",
                marginTop: isTotal ? 8 : 0,
              }}>
                <span style={{
                  fontFamily: FONTS.body, fontSize: isTotal ? 22 : 20,
                  color: isTotal ? COLORS.white : COLORS.lightGray,
                  fontWeight: isTotal ? 700 : 400,
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: FONTS.display, fontSize: isTotal ? 28 : 24,
                  color: isTotal ? COLORS.red : COLORS.white,
                  fontWeight: 700,
                }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Utopia */}
        <div style={{
          flex: 1, opacity: utopiaSpring,
          transform: `translateY(${interpolate(utopiaSpring, [0, 1], [50, 0])}px)`,
          background: `linear-gradient(180deg, ${COLORS.electricGreen}15, ${COLORS.darkGray})`,
          borderRadius: 20, padding: "32px",
          border: `2px solid ${COLORS.electricGreen}40`,
        }}>
          <div style={{
            fontFamily: FONTS.display, fontSize: 32, color: COLORS.electricGreen, fontWeight: 700,
            marginBottom: 8,
          }}>
            🚀 FULL POTENTIAL
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 16, color: COLORS.lightGray, marginBottom: 24,
          }}>
            Digital payments, all 6 streams, 50 trips/day
          </div>
          {utopiaItems.map((item, i) => {
            const s = spring({ frame: frame - 140 - i * 20, fps, config: { damping: 20 } });
            const isTotal = i === utopiaItems.length - 1;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                opacity: s, padding: "10px 0",
                borderBottom: isTotal ? "none" : `1px solid ${COLORS.darkGray}`,
                borderTop: isTotal ? `2px solid ${COLORS.electricGreen}40` : "none",
                marginTop: isTotal ? 8 : 0,
              }}>
                <span style={{
                  fontFamily: FONTS.body, fontSize: isTotal ? 22 : 20,
                  color: isTotal ? COLORS.white : COLORS.lightGray,
                  fontWeight: isTotal ? 700 : 400,
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: FONTS.display, fontSize: isTotal ? 28 : 24,
                  color: isTotal ? COLORS.electricGreen : COLORS.white,
                  fontWeight: 700,
                }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom insight */}
      <Sequence from={350} durationInFrames={280}>
        {(() => {
          const s = spring({ frame: frame - 350, fps, config: { damping: 15 } });
          return (
            <div style={{
              position: "absolute", bottom: 60, left: 80, right: 80,
              opacity: s, textAlign: "center",
              background: `linear-gradient(135deg, ${COLORS.electricGreen}10, ${COLORS.accentBlue}10)`,
              borderRadius: 12, padding: "18px 40px",
              border: `1px solid ${COLORS.electricGreen}30`,
            }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray }}>
                Per 50 vehicles:{" "}
              </span>
              <span style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.red, fontWeight: 700 }}>
                R22,500/mo worst
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.lightGray }}>
                {" → "}
              </span>
              <span style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.electricGreen, fontWeight: 700 }}>
                R212,250/mo full
              </span>
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
