import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";
import { PhoneFrame } from "./PhoneFrame";

export const Scene2Payment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const titleOp = titleSpring;

  // Phone slides in from right
  const phoneSpring = spring({ frame: frame - 20, fps, config: { damping: 16 } });
  const phoneX = interpolate(phoneSpring, [0, 1], [400, 0]);

  // QR appears, then card swipe
  const qrSpring = spring({ frame: frame - 50, fps, config: { damping: 14 } });
  const qrScale = interpolate(qrSpring, [0, 1], [0.3, 1]);

  // Money counter — driver earnings rising
  const earnings = Math.round(interpolate(frame, [70, 320], [0, 1247], { extrapolateRight: "clamp" }));

  // Confirmation tick (appears around frame 220)
  const tickSpring = spring({ frame: frame - 220, fps, config: { damping: 8, stiffness: 120 } });
  const tickScale = tickSpring;

  // R received chip animation - flying coins
  const coinAnims = Array.from({ length: 6 }).map((_, i) => {
    const start = 230 + i * 8;
    const p = interpolate(frame, [start, start + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      x: interpolate(p, [0, 1], [0, -200 - i * 30]),
      y: interpolate(p, [0, 1], [0, -100 - i * 20]) + Math.sin(p * Math.PI) * -80,
      op: interpolate(p, [0, 0.7, 1], [0, 1, 0]),
      rot: p * 720,
    };
  });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      {/* Left: copy & earnings */}
      <div style={{ flex: 1, paddingLeft: 120, paddingRight: 40 }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.gold,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: titleOp,
            marginBottom: 20,
          }}
        >
          💳 Cash. QR. Card.
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 110,
            fontWeight: 900,
            color: COLORS.white,
            lineHeight: 1.0,
            opacity: titleOp,
          }}
        >
          Every fare,
          <br />
          <span style={{ color: COLORS.gold }}>tracked.</span>
        </div>

        {/* Driver earnings card */}
        <div
          style={{
            marginTop: 50,
            background: `linear-gradient(135deg, ${COLORS.deepNavy}, ${COLORS.darkGray})`,
            border: `1px solid ${COLORS.gold}60`,
            borderRadius: 24,
            padding: 32,
            maxWidth: 500,
            opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" }),
            position: "relative",
            overflow: "visible",
          }}
        >
          <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.lightGray, letterSpacing: "0.2em" }}>
            DRIVER EARNINGS · TODAY
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 84,
              fontWeight: 900,
              color: COLORS.gold,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            R {earnings.toLocaleString()}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.electricGreen, marginTop: 10 }}>
            ↑ 38% vs cash-only week
          </div>

          {/* Flying coins */}
          {coinAnims.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 60,
                right: 60,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, ${COLORS.gold}, #b8860b)`,
                border: `2px solid ${COLORS.white}`,
                color: COLORS.deepNavy,
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg)`,
                opacity: c.op,
                boxShadow: `0 0 20px ${COLORS.gold}`,
              }}
            >
              R
            </div>
          ))}
        </div>
      </div>

      {/* Right: phone with payment */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `translateX(${phoneX}px)`, opacity: phoneSpring }}>
          <PhoneFrame>
            {/* Header */}
            <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center" }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.electricGreen, letterSpacing: "0.3em" }}>
                SECURE PAYMENT
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.white, fontWeight: 700, marginTop: 6 }}>
                R 47.50
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.lightGray, marginTop: 2 }}>
                Eersterust → Mamelodi
              </div>
            </div>

            {/* QR code */}
            <div
              style={{
                position: "absolute",
                top: 170,
                left: "50%",
                transform: `translateX(-50%) scale(${qrScale})`,
                width: 240,
                height: 240,
                background: COLORS.white,
                borderRadius: 18,
                padding: 16,
                boxShadow: `0 0 60px ${COLORS.electricGreen}80`,
              }}
            >
              {/* Fake QR pattern */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: 2,
                }}
              >
                {Array.from({ length: 144 }).map((_, i) => {
                  const x = i % 12;
                  const y = Math.floor(i / 12);
                  const isCorner = (x < 3 && y < 3) || (x > 8 && y < 3) || (x < 3 && y > 8);
                  const filled = isCorner || ((i * 7 + 13) % 3 === 0);
                  return (
                    <div
                      key={i}
                      style={{
                        background: filled ? "#000" : "transparent",
                        borderRadius: 2,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Payment methods chips */}
            <div
              style={{
                position: "absolute",
                top: 440,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {["QR Pay", "Tap Card", "Cash", "SnapScan"].map((m, i) => (
                <div
                  key={m}
                  style={{
                    padding: "8px 14px",
                    background: i === 0 ? COLORS.electricGreen : `${COLORS.white}15`,
                    color: i === 0 ? COLORS.deepNavy : COLORS.white,
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 20,
                    border: `1px solid ${i === 0 ? COLORS.electricGreen : COLORS.white}30`,
                  }}
                >
                  {m}
                </div>
              ))}
            </div>

            {/* Confirmation tick */}
            <div
              style={{
                position: "absolute",
                top: 520,
                left: "50%",
                transform: `translateX(-50%) scale(${tickScale})`,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: COLORS.electricGreen,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                color: COLORS.deepNavy,
                fontWeight: 900,
                boxShadow: `0 0 60px ${COLORS.electricGreen}`,
              }}
            >
              ✓
            </div>

            {/* Paid label */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: 900,
                color: COLORS.electricGreen,
                opacity: tickScale,
                letterSpacing: "0.2em",
              }}
            >
              PAID · INSTANT
            </div>
          </PhoneFrame>
        </div>
      </div>
    </AbsoluteFill>
  );
};
