import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene4Owner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 16 } });
  const titleOp = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  // Dashboard slides up
  const dashSpring = spring({ frame: frame - 30, fps, config: { damping: 18 } });
  const dashY = interpolate(dashSpring, [0, 1], [80, 0]);
  const dashOp = dashSpring;

  // Animated revenue numbers
  const revenue = Math.round(interpolate(frame, [50, 280], [12450, 84720], { extrapolateRight: "clamp" }));
  const trips = Math.round(interpolate(frame, [50, 280], [142, 1247], { extrapolateRight: "clamp" }));
  const skim = Math.max(0, Math.round(interpolate(frame, [50, 280], [18, 2], { extrapolateRight: "clamp" })));

  // Bar chart bars
  const bars = [0.4, 0.65, 0.55, 0.85, 0.7, 0.95, 0.88];
  const barProgress = interpolate(frame, [80, 200], [0, 1], { extrapolateRight: "clamp" });

  // Live vehicle dots on mini map
  const vehicles = [
    { x: 20, y: 40 },
    { x: 55, y: 25 },
    { x: 75, y: 60 },
    { x: 35, y: 70 },
    { x: 80, y: 35 },
    { x: 45, y: 50 },
  ];

  return (
    <AbsoluteFill style={{ padding: 80 }}>
      {/* Top heading */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.electricGreen,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: titleOp,
            marginBottom: 16,
          }}
        >
          📊 Owner Command Center
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 78,
            fontWeight: 900,
            color: COLORS.white,
            lineHeight: 1.0,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}
        >
          See <span style={{ color: COLORS.electricGreen }}>every cent.</span> Stop the leak.
        </div>
      </div>

      {/* Dashboard grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gridTemplateRows: "auto auto",
          gap: 20,
          flex: 1,
          opacity: dashOp,
          transform: `translateY(${dashY}px)`,
        }}
      >
        {/* Revenue card (big) */}
        <div
          style={{
            gridColumn: "1",
            gridRow: "1 / span 2",
            background: `linear-gradient(135deg, ${COLORS.deepNavy}EE, ${COLORS.darkGray}EE)`,
            border: `1px solid ${COLORS.electricGreen}40`,
            borderRadius: 24,
            padding: 36,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.lightGray, letterSpacing: "0.3em" }}>
            FLEET REVENUE · THIS WEEK
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 110,
              fontWeight: 900,
              color: COLORS.electricGreen,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            R {revenue.toLocaleString()}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.lightGray, marginTop: 8 }}>
            {trips.toLocaleString()} trips · 12 vehicles · live
          </div>

          {/* Bar chart */}
          <div
            style={{
              marginTop: 30,
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              padding: "20px 0",
              borderTop: `1px solid ${COLORS.white}10`,
            }}
          >
            {bars.map((b, i) => {
              const h = b * barProgress;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${h * 180}px`,
                      background: `linear-gradient(180deg, ${COLORS.electricGreen}, ${COLORS.electricGreen}60)`,
                      borderRadius: "8px 8px 0 0",
                      boxShadow: `0 0 20px ${COLORS.electricGreen}40`,
                    }}
                  />
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.lightGray }}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anti-skim card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepNavy}EE, ${COLORS.darkGray}EE)`,
            border: `1px solid ${COLORS.gold}60`,
            borderRadius: 24,
            padding: 28,
          }}
        >
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.lightGray, letterSpacing: "0.3em" }}>
            CASH SKIMMING
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 80,
              fontWeight: 900,
              color: skim > 5 ? COLORS.red : COLORS.electricGreen,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {skim}%
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.lightGray, marginTop: 6 }}>
            ↓ from 24% pre-launch
          </div>
          <div
            style={{
              marginTop: 16,
              padding: "8px 12px",
              background: `${COLORS.electricGreen}20`,
              borderRadius: 10,
              fontFamily: FONTS.body,
              fontSize: 13,
              color: COLORS.electricGreen,
              fontWeight: 700,
            }}
          >
            ✓ Anti-skim AI active
          </div>
        </div>

        {/* Live fleet map */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepNavy}EE, ${COLORS.darkGray}EE)`,
            border: `1px solid ${COLORS.electricGreen}40`,
            borderRadius: 24,
            padding: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.lightGray, letterSpacing: "0.3em" }}>
            LIVE FLEET · EERSTERUST
          </div>

          {/* Map area */}
          <div
            style={{
              position: "absolute",
              inset: "70px 28px 28px 28px",
              borderRadius: 14,
              background: `radial-gradient(ellipse at 50% 50%, ${COLORS.navy}, ${COLORS.deepNavy})`,
              border: `1px solid ${COLORS.electricGreen}30`,
              overflow: "hidden",
            }}
          >
            {/* Grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(${COLORS.electricGreen}15 1px, transparent 1px), linear-gradient(90deg, ${COLORS.electricGreen}15 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />
            {vehicles.map((v, i) => {
              const pulse = 0.5 + Math.sin(frame * 0.15 + i) * 0.5;
              const driftX = Math.sin(frame * 0.02 + i) * 8;
              const driftY = Math.cos(frame * 0.02 + i * 1.3) * 6;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: `${v.y}%`,
                    left: `${v.x}%`,
                    transform: `translate(${driftX}px, ${driftY}px)`,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: COLORS.gold,
                    border: `2px solid ${COLORS.white}`,
                    boxShadow: `0 0 ${10 + pulse * 15}px ${COLORS.gold}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
