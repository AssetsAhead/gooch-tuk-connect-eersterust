import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";
import { PhoneFrame } from "./PhoneFrame";

export const Scene1Hail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOp = titleSpring;

  const subSpring = spring({ frame: frame - 25, fps, config: { damping: 20 } });
  const subOp = subSpring;

  const phoneSpring = spring({ frame: frame - 40, fps, config: { damping: 14, stiffness: 90 } });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.7, 1]);
  const phoneOp = phoneSpring;

  // Pin pulses on the map
  const pinPulse = (Math.sin(frame * 0.15) + 1) / 2;

  // Driver dot moving toward pickup
  const driverProgress = interpolate(frame, [80, 280], [0, 1], { extrapolateRight: "clamp" });

  // ETA countdown
  const eta = Math.max(1, Math.round(interpolate(frame, [80, 320], [8, 1], { extrapolateRight: "clamp" })));

  // Tap ripple
  const tapFrame = frame - 70;
  const rippleScale = interpolate(tapFrame, [0, 30], [0, 4], { extrapolateRight: "clamp" });
  const rippleOp = interpolate(tapFrame, [0, 30], [0.8, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      {/* Left: copy */}
      <div style={{ flex: 1, paddingLeft: 120, paddingRight: 40 }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.electricGreen,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: titleOp,
            transform: `translateY(${titleY * 0.5}px)`,
            marginBottom: 20,
          }}
        >
          ⏱ Tap. Match. Move.
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 110,
            fontWeight: 900,
            color: COLORS.white,
            lineHeight: 1.0,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Hail a ride
          <br />
          <span style={{ color: COLORS.electricGreen }}>in seconds.</span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.lightGray,
            maxWidth: 600,
            opacity: subOp,
          }}
        >
          Real-time GPS. Live driver tracking. ETA you can trust — built for South African streets.
        </div>
      </div>

      {/* Right: phone with map */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${phoneScale})`, opacity: phoneOp }}>
          <PhoneFrame>
            {/* Map background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `
                  radial-gradient(ellipse at 50% 60%, ${COLORS.navy} 0%, ${COLORS.deepNavy} 100%),
                  linear-gradient(135deg, ${COLORS.deepNavy}, ${COLORS.darkGray})
                `,
              }}
            />
            {/* Grid roads */}
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, opacity: 0.35 }}
              viewBox="0 0 380 780"
            >
              <defs>
                <pattern id="grid-roads" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.electricGreen} strokeWidth="0.5" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-roads)" />
              {/* Curving road */}
              <path
                d="M 0 600 Q 100 500 190 450 T 380 320"
                stroke={COLORS.electricGreen}
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 60 780 L 60 200 Q 60 150 120 130 L 380 130"
                stroke={COLORS.gold}
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
            </svg>

            {/* Pickup pin (top header) */}
            <div
              style={{
                position: "absolute",
                top: 60,
                left: 20,
                right: 20,
                background: `${COLORS.deepNavy}E6`,
                borderRadius: 14,
                padding: 14,
                border: `1px solid ${COLORS.electricGreen}40`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.electricGreen, letterSpacing: "0.2em" }}>
                PICKUP
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.white, fontWeight: 700, marginTop: 4 }}>
                Volga St, Eersterust
              </div>
            </div>

            {/* Pickup pin on map */}
            <div
              style={{
                position: "absolute",
                top: 420,
                left: 170,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: COLORS.electricGreen,
                border: `4px solid ${COLORS.white}`,
                boxShadow: `0 0 20px ${COLORS.electricGreen}`,
              }}
            />
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                top: 420 - 30 * pinPulse,
                left: 170 - 30 * pinPulse,
                width: 24 + 60 * pinPulse,
                height: 24 + 60 * pinPulse,
                borderRadius: "50%",
                border: `2px solid ${COLORS.electricGreen}`,
                opacity: 1 - pinPulse,
              }}
            />

            {/* Driver tuk-tuk dot */}
            <div
              style={{
                position: "absolute",
                top: interpolate(driverProgress, [0, 1], [620, 432]),
                left: interpolate(driverProgress, [0, 1], [40, 175]),
                width: 36,
                height: 36,
                borderRadius: 10,
                background: COLORS.gold,
                border: `3px solid ${COLORS.white}`,
                boxShadow: `0 0 25px ${COLORS.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🛺
            </div>

            {/* Tap ripple */}
            <div
              style={{
                position: "absolute",
                top: 420,
                left: 170,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `3px solid ${COLORS.white}`,
                transform: `scale(${rippleScale})`,
                opacity: rippleOp,
              }}
            />

            {/* ETA card bottom */}
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 20,
                right: 20,
                background: COLORS.electricGreen,
                borderRadius: 18,
                padding: 18,
                opacity: phoneOp,
              }}
            >
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.deepNavy, letterSpacing: "0.2em", fontWeight: 700 }}>
                YOUR DRIVER · DEVAN
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 56, fontWeight: 900, color: COLORS.deepNavy, lineHeight: 1 }}>
                  {eta} min
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.deepNavy, fontWeight: 600 }}>
                  ⭐ 4.9 · GP-EER-12
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </AbsoluteFill>
  );
};
