import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene5Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo zoom in
  const logoSpring = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 90 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.4, 1]);
  const logoOp = logoSpring;

  // Brand name
  const brandSpring = spring({ frame: frame - 25, fps, config: { damping: 18 } });
  const brandY = interpolate(brandSpring, [0, 1], [30, 0]);
  const brandOp = brandSpring;

  // Tagline
  const taglineSpring = spring({ frame: frame - 55, fps, config: { damping: 20 } });
  const taglineOp = taglineSpring;

  // Tri-brand chips
  const chipsSpring = spring({ frame: frame - 80, fps, config: { damping: 16 } });
  const chipsY = interpolate(chipsSpring, [0, 1], [40, 0]);
  const chipsOp = chipsSpring;

  // URL
  const urlSpring = spring({ frame: frame - 110, fps, config: { damping: 20 } });
  const urlOp = urlSpring;

  // Final glow pulse
  const glow = 0.5 + Math.sin(frame * 0.08) * 0.3;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Big radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, ${COLORS.electricGreen}${Math.round(glow * 60).toString(16).padStart(2, "0")}, transparent 60%)`,
        }}
      />

      {/* Logo monogram (P) */}
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${COLORS.electricGreen}, #00b85e)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.display,
          fontSize: 140,
          fontWeight: 900,
          color: COLORS.deepNavy,
          boxShadow: `0 0 ${60 + glow * 80}px ${COLORS.electricGreen}, 0 30px 60px rgba(0,0,0,0.5)`,
          transform: `scale(${logoScale})`,
          opacity: logoOp,
          marginBottom: 40,
        }}
      >
        P
      </div>

      {/* Brand name */}
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 160,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          opacity: brandOp,
          transform: `translateY(${brandY}px)`,
        }}
      >
        Poort<span style={{ color: COLORS.electricGreen }}>Link</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 24,
          fontFamily: FONTS.body,
          fontSize: 38,
          color: COLORS.lightGray,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          opacity: taglineOp,
          fontWeight: 300,
        }}
      >
        The future moves with us.
      </div>

      {/* Tri-brand chips */}
      <div
        style={{
          marginTop: 50,
          display: "flex",
          gap: 20,
          opacity: chipsOp,
          transform: `translateY(${chipsY}px)`,
        }}
      >
        {[
          { label: "PoortLink", color: COLORS.electricGreen },
          { label: "TukConnect", color: COLORS.gold },
          { label: "MojaRide", color: COLORS.accentBlue },
        ].map((b) => (
          <div
            key={b.label}
            style={{
              padding: "14px 28px",
              background: `${COLORS.deepNavy}AA`,
              border: `2px solid ${b.color}`,
              borderRadius: 100,
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 22,
              color: b.color,
              boxShadow: `0 0 30px ${b.color}40`,
            }}
          >
            {b.label}
          </div>
        ))}
      </div>

      {/* URL */}
      <div
        style={{
          marginTop: 50,
          fontFamily: FONTS.body,
          fontSize: 28,
          color: COLORS.gold,
          letterSpacing: "0.2em",
          opacity: urlOp,
          fontWeight: 600,
        }}
      >
        tukconnect.lovable.app
      </div>
    </AbsoluteFill>
  );
};
