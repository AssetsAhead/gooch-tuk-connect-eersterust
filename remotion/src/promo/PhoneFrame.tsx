import React from "react";
import { COLORS } from "../styles";

export const PhoneFrame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  return (
    <div
      style={{
        width: 380,
        height: 780,
        borderRadius: 50,
        background: "#000",
        padding: 12,
        boxShadow: `0 60px 120px rgba(0,0,0,0.7), 0 0 0 2px ${COLORS.electricGreen}40, 0 0 80px ${COLORS.electricGreen}30`,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 40,
          overflow: "hidden",
          background: COLORS.deepNavy,
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 28,
            background: "#000",
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            zIndex: 10,
          }}
        />
        {children}
      </div>
    </div>
  );
};
