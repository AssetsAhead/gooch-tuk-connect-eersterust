import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene6Ask: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Central amount reveal
  const amountSpring = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 60 } });
  const amountScale = interpolate(amountSpring, [0, 1], [0.3, 1]);
  
  // Use of funds items
  const uses = [
    "50 vehicle deployment",
    "Eersterust pilot operations",
    "DOT licensing process",
    "Team & marketing",
  ];
  
  // Final tagline
  const taglineSpring = spring({ frame: frame - 280, fps, config: { damping: 20 } });
  const taglineOp = interpolate(taglineSpring, [0, 1], [0, 1]);
  const taglineScale = interpolate(taglineSpring, [0, 1], [0.9, 1]);
  
  // Closing pulse
  const closePulse = frame > 350 ? Math.sin((frame - 350) * 0.08) * 0.15 + 1 : 1;

  return (
    <AbsoluteFill>
      {/* The Ask */}
      <Sequence from={0} durationInFrames={450}>
        <div style={{
          position: "absolute", top: 60, left: 0, right: 0, textAlign: "center",
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <span style={{
            fontFamily: FONTS.body, fontSize: 28, color: COLORS.lightGray,
            letterSpacing: "0.25em",
          }}>
            SEED FUNDING ROUND
          </span>
        </div>
      </Sequence>
      
      {/* R2 MILLION */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          transform: `scale(${amountScale})`,
          opacity: amountSpring,
          textAlign: "center",
        }}>
          <span style={{
            fontFamily: FONTS.display, fontSize: 180, fontWeight: 700,
            color: COLORS.gold,
            textShadow: `0 0 60px ${COLORS.gold}50`,
            letterSpacing: "-0.02em",
          }}>
            R2M
          </span>
          <div style={{
            fontFamily: FONTS.body, fontSize: 32, color: COLORS.lightGray,
            letterSpacing: "0.15em", marginTop: -10,
          }}>
            SEED INVESTMENT
          </div>
        </div>
        
        {/* Use of funds */}
        <div style={{ marginTop: 50, display: "flex", gap: 24 }}>
          {uses.map((u, i) => {
            const delay = 100 + i * 35;
            const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
            return (
              <div key={i} style={{
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                background: `${COLORS.darkGray}CC`,
                borderRadius: 12, padding: "16px 24px",
                border: `1px solid ${COLORS.gold}30`,
              }}>
                <span style={{
                  fontFamily: FONTS.body, fontSize: 18, color: COLORS.white,
                }}>
                  {u}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Final tagline */}
      <Sequence from={280} durationInFrames={170}>
        <div style={{
          position: "absolute", bottom: 160, left: 0, right: 0, textAlign: "center",
          opacity: taglineOp,
          transform: `scale(${taglineScale * closePulse})`,
        }}>
          <span style={{
            fontFamily: FONTS.display, fontSize: 64, fontWeight: 700,
            color: COLORS.electricGreen,
            textShadow: `0 0 40px ${COLORS.electricGreen}50`,
          }}>
            The Future Moves With Us.
          </span>
          <div style={{
            fontFamily: FONTS.body, fontSize: 24, color: COLORS.gold,
            letterSpacing: "0.2em", marginTop: 12,
          }}>
            TUKCONNECT — POORTLINK (PTY) LTD
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
