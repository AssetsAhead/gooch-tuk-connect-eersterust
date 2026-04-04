import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // South Africa map outline fade in
  const mapOpacity = interpolate(frame, [0, 40], [0, 0.15], { extrapolateRight: "clamp" });
  
  // "15 MILLION" counter
  const counterSpring = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 80 } });
  const counterScale = interpolate(counterSpring, [0, 1], [0.3, 1]);
  
  // "passengers daily" slide in
  const dailyY = interpolate(spring({ frame: frame - 60, fps, config: { damping: 15 } }), [0, 1], [60, 0]);
  const dailyOp = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  
  // R90 BILLION impact
  const billionSpring = spring({ frame: frame - 180, fps, config: { damping: 8, stiffness: 100 } });
  const billionScale = interpolate(billionSpring, [0, 1], [3, 1]);
  const billionOp = interpolate(frame, [180, 210], [0, 1], { extrapolateRight: "clamp" });
  
  // "Yet..." text
  const yetOp = interpolate(frame, [330, 360], [0, 1], { extrapolateRight: "clamp" });
  const yetX = interpolate(spring({ frame: frame - 330, fps, config: { damping: 20 } }), [0, 1], [-100, 0]);
  
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
      
      {/* Main content */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* 15 MILLION */}
        <Sequence from={30} durationInFrames={480}>
          <div style={{
            transform: `scale(${counterScale})`,
            opacity: counterSpring,
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
        </Sequence>
        
        {/* passengers daily */}
        <Sequence from={60} durationInFrames={450}>
          <div style={{ opacity: dailyOp, transform: `translateY(${dailyY}px)`, marginTop: -20 }}>
            <span style={{
              fontFamily: FONTS.body, fontSize: 48, color: COLORS.lightGray,
              letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              passengers every single day
            </span>
          </div>
        </Sequence>
        
        {/* R90 BILLION */}
        <Sequence from={180} durationInFrames={330}>
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
        </Sequence>
        
        {/* Yet... */}
        <Sequence from={330} durationInFrames={200}>
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
        </Sequence>
      </div>
      
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
    </AbsoluteFill>
  );
};
