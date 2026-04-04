import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const mapOpacity = interpolate(frame, [0, 40], [0, 0.15], { extrapolateRight: "clamp" });
  
  // "15 MILLION" counter
  const counterSpring = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 80 } });
  const counterScale = interpolate(counterSpring, [0, 1], [0.3, 1]);
  const counterOp = frame >= 30 ? counterSpring : 0;
  
  // "passengers daily" slide in
  const dailySpring = spring({ frame: frame - 60, fps, config: { damping: 15 } });
  const dailyY = interpolate(dailySpring, [0, 1], [60, 0]);
  const dailyOp = frame >= 60 ? dailySpring : 0;
  
  // R90 BILLION impact
  const billionSpring = spring({ frame: frame - 180, fps, config: { damping: 8, stiffness: 100 } });
  const billionScale = interpolate(billionSpring, [0, 1], [3, 1]);
  const billionOp = frame >= 180 ? billionSpring : 0;
  
  // "Yet..." text
  const yetSpring = spring({ frame: frame - 330, fps, config: { damping: 20 } });
  const yetX = interpolate(yetSpring, [0, 1], [-100, 0]);
  const yetOp = frame >= 330 ? yetSpring : 0;
  
  // Scan line effect
  const scanY = interpolate(frame % 120, [0, 120], [0, 1080]);

  return (
    <AbsoluteFill>
      {/* SA Map silhouette hint */}
      <div style={{
        position: "absolute", inset: 0, opacity: mapOpacity,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 800, height: 800, borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
          border: `2px solid ${COLORS.electricGreen}40`,
          transform: "rotate(-15deg)",
        }} />
      </div>
      
      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: scanY, height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.electricGreen}30, transparent)`,
      }} />
      
      {/* Top label */}
      <div style={{
        position: "absolute", top: 60, left: 80,
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span style={{
          fontFamily: FONTS.body, fontSize: 20, color: COLORS.electricGreen,
          letterSpacing: "0.3em", textTransform: "uppercase",
        }}>
          South Africa's Minibus Taxi Industry
        </span>
      </div>
      
      {/* Main centered content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* 15 MILLION */}
        <div style={{
          transform: `scale(${counterScale})`,
          opacity: counterOp,
          textAlign: "center",
        }}>
          <span style={{
            fontFamily: FONTS.display, fontSize: 160, fontWeight: 700,
            color: COLORS.electricGreen, letterSpacing: "-0.03em",
            textShadow: `0 0 60px ${COLORS.electricGreen}60`,
          }}>
            15 MILLION
          </span>
        </div>
        
        {/* passengers daily */}
        <div style={{ opacity: dailyOp, transform: `translateY(${dailyY}px)`, marginTop: -20 }}>
          <span style={{
            fontFamily: FONTS.body, fontSize: 48, color: COLORS.lightGray,
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>
            passengers every single day
          </span>
        </div>
        
        {/* R90 BILLION */}
        <div style={{
          marginTop: 60,
          opacity: billionOp,
          transform: `scale(${billionScale})`,
          textAlign: "center",
        }}>
          <span style={{
            fontFamily: FONTS.display, fontSize: 200, fontWeight: 700,
            color: COLORS.gold,
            textShadow: `0 0 80px ${COLORS.gold}50`,
            letterSpacing: "-0.03em",
          }}>
            R90B
          </span>
          <div style={{
            fontFamily: FONTS.body, fontSize: 36, color: COLORS.lightGray,
            letterSpacing: "0.2em", marginTop: -10,
          }}>
            MARKET OPPORTUNITY
          </div>
        </div>
      </div>
      
      {/* Yet... */}
      <div style={{
        position: "absolute", bottom: 200, left: 120,
        opacity: yetOp, transform: `translateX(${yetX}px)`,
      }}>
        <span style={{
          fontFamily: FONTS.display, fontSize: 72, color: COLORS.red,
          fontStyle: "italic",
        }}>
          Yet it runs on cash, paper & handshakes.
        </span>
      </div>
    </AbsoluteFill>
  );
};
