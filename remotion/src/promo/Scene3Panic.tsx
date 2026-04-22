import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";
import { PhoneFrame } from "./PhoneFrame";

export const Scene3Panic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Strobe red overlay
  const strobe = interpolate(Math.sin(frame * 0.4), [-1, 1], [0.0, 0.18]);

  // Phone in
  const phoneSpring = spring({ frame: frame - 5, fps, config: { damping: 16 } });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);

  // Press button (frame ~50)
  const pressFrame = frame - 50;
  const pressScale = pressFrame > 0 && pressFrame < 15 ? 0.9 : 1;

  // Alert ripples after press
  const ripples = [0, 1, 2].map((i) => {
    const start = 60 + i * 18;
    const p = interpolate(frame, [start, start + 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { p };
  });

  // Title appears after press
  const titleSpring = spring({ frame: frame - 90, fps, config: { damping: 16 } });
  const titleOp = titleSpring;
  const titleX = interpolate(titleSpring, [0, 1], [60, 0]);

  // Network nodes light up
  const nodes = [
    { x: 25, y: 30, label: "TMPD", delay: 100 },
    { x: 70, y: 25, label: "Ward 38", delay: 115 },
    { x: 80, y: 70, label: "Family", delay: 130 },
    { x: 20, y: 75, label: "Owner", delay: 145 },
  ];

  // Response counter
  const responders = Math.min(4, Math.floor(interpolate(frame, [100, 200], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  return (
    <AbsoluteFill>
      {/* Red strobe overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.red}${Math.round(strobe * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", height: "100%" }}>
        {/* Left: phone with PANIC */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ transform: `scale(${phoneScale * pressScale})`, opacity: phoneSpring }}>
            <PhoneFrame>
              {/* Top status */}
              <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center" }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.red, letterSpacing: "0.3em", fontWeight: 700 }}>
                  EMERGENCY MODE
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.white, fontWeight: 700, marginTop: 6 }}>
                  Press &amp; hold for SOS
                </div>
              </div>

              {/* Big PANIC button */}
              <div
                style={{
                  position: "absolute",
                  top: 200,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, #ff6b6b, ${COLORS.red})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.display,
                  fontWeight: 900,
                  fontSize: 56,
                  color: COLORS.white,
                  boxShadow: `0 0 100px ${COLORS.red}, 0 20px 40px rgba(0,0,0,0.5)`,
                }}
              >
                SOS
              </div>

              {/* Concentric ripples */}
              {ripples.map((r, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 200 + 120,
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${1 + r.p * 4})`,
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    border: `3px solid ${COLORS.red}`,
                    opacity: 1 - r.p,
                  }}
                />
              ))}

              {/* Status under button */}
              <div
                style={{
                  position: "absolute",
                  top: 480,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  opacity: interpolate(frame, [70, 100], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.lightGray, letterSpacing: "0.2em" }}>
                  ALERT BROADCAST
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 36, fontWeight: 900, color: COLORS.electricGreen, marginTop: 8 }}>
                  {responders}/4 responding
                </div>
              </div>

              {/* Bottom location chip */}
              <div
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: 20,
                  right: 20,
                  background: `${COLORS.deepNavy}E6`,
                  borderRadius: 14,
                  padding: 14,
                  border: `1px solid ${COLORS.electricGreen}60`,
                  fontFamily: FONTS.body,
                  color: COLORS.white,
                  fontSize: 13,
                }}
              >
                📍 Volga St · Live location streaming
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* Right: response network */}
        <div style={{ flex: 1, paddingRight: 120, paddingLeft: 40 }}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              color: COLORS.red,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              opacity: titleOp,
              transform: `translateX(${titleX}px)`,
              marginBottom: 20,
            }}
          >
            🛡 One tap. Whole network.
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 110,
              fontWeight: 900,
              color: COLORS.white,
              lineHeight: 1.0,
              opacity: titleOp,
              transform: `translateX(${titleX}px)`,
            }}
          >
            Safety
            <br />
            <span style={{ color: COLORS.red }}>that arrives.</span>
          </div>

          {/* Mini network visualization */}
          <div
            style={{
              marginTop: 50,
              position: "relative",
              width: 500,
              height: 280,
              background: `${COLORS.deepNavy}AA`,
              borderRadius: 24,
              border: `1px solid ${COLORS.red}40`,
              padding: 20,
              opacity: interpolate(frame, [90, 120], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.lightGray, letterSpacing: "0.2em" }}>
              ALERTING NOW
            </div>

            {/* Center node */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: COLORS.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.white,
                fontWeight: 900,
                fontSize: 22,
                boxShadow: `0 0 40px ${COLORS.red}`,
              }}
            >
              !
            </div>

            {/* Nodes */}
            {nodes.map((n, i) => {
              const lit = frame >= n.delay;
              const pulse = lit ? 0.5 + Math.sin(frame * 0.2 + i) * 0.3 : 0;
              return (
                <div key={n.label}>
                  {/* Line */}
                  <svg
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                    viewBox="0 0 500 280"
                  >
                    <line
                      x1="250"
                      y1="140"
                      x2={n.x * 5}
                      y2={n.y * 2.4 + 40}
                      stroke={lit ? COLORS.electricGreen : `${COLORS.white}20`}
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      opacity={lit ? 0.7 : 0.2}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: `${n.y}%`,
                      left: `${n.x}%`,
                      transform: "translate(-50%, -50%)",
                      padding: "10px 16px",
                      background: lit ? COLORS.electricGreen : `${COLORS.white}10`,
                      color: lit ? COLORS.deepNavy : COLORS.lightGray,
                      borderRadius: 12,
                      fontFamily: FONTS.body,
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: lit ? `0 0 ${20 + pulse * 30}px ${COLORS.electricGreen}` : "none",
                    }}
                  >
                    {n.label} {lit && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
