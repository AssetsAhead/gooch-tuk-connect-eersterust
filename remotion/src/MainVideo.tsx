import { AbsoluteFill, Series, useCurrentFrame } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4Traction } from "./scenes/Scene4Traction";
import { Scene5Customer } from "./scenes/Scene5Customer";
import { Scene5Revenue } from "./scenes/Scene5Revenue";
import { Scene7FareEconomics } from "./scenes/Scene7FareEconomics";
import { Scene6Ask } from "./scenes/Scene6Ask";
import { PersistentBackground } from "./components/PersistentBackground";
import { SubtitleBar } from "./components/SubtitleBar";
import { COLORS } from "./styles";

// Scene durations
// 1: Hook 540 | 2: Problem 540 | 3: Solution 720 | 4: Traction 540
// 5: Customer 630 | 6: Revenue 630 | 7: Fare Economics 630 | 8: Ask 450
// Total: 4680 (+ buffer = 4800)

const subtitles: { text: string; from: number; to: number }[] = [
  // Scene 1: Hook (0–360)
  { text: "South Africa's minibus taxi industry...", from: 20, to: 90 },
  { text: "moves 15 million passengers daily.", from: 90, to: 170 },
  { text: "A R90 BILLION market.", from: 170, to: 260 },
  { text: "Yet it runs on cash, paper, and handshakes.", from: 260, to: 350 },

  // Scene 2: Problem (360–720)
  { text: "No digital payments. No GPS tracking.", from: 380, to: 470 },
  { text: "No driver accountability.", from: 470, to: 550 },
  { text: "Passengers feel unsafe. Owners lose money.", from: 550, to: 640 },
  { text: "Government can't regulate what it can't see.", from: 640, to: 710 },

  // Scene 3: Solution (720–1170)
  { text: "Introducing TukConnect — powered by Poortlink.", from: 740, to: 840 },
  { text: "Real-time GPS tracking for every vehicle.", from: 840, to: 930 },
  { text: "Facial recognition clocking for drivers.", from: 930, to: 1020 },
  { text: "SASSA grant verification for fare discounts.", from: 1020, to: 1100 },
  { text: "Digital payments replacing cash risk.", from: 1100, to: 1165 },

  // Scene 4: Traction (1170–1470)
  { text: "We're not just an idea — we've built it.", from: 1190, to: 1270 },
  { text: "CIPC registered. SARS compliant.", from: 1270, to: 1340 },
  { text: "POPIA framework. Trademarks filed.", from: 1340, to: 1410 },
  { text: "Eersterust pilot ready to launch.", from: 1410, to: 1465 },

  // Scene 5: Target Customer (1470–1830)
  { text: "Primary customer: Vehicle Owners.", from: 1490, to: 1570 },
  { text: "Solving operational opacity — cash skimming.", from: 1570, to: 1660 },
  { text: "Scale multiplier: Taxi Associations.", from: 1660, to: 1740 },
  { text: "DOT licensing delay = competitive moat.", from: 1740, to: 1825 },

  // Scene 6: Revenue Model (1830–2190)
  { text: "Six diversified revenue streams.", from: 1850, to: 1930 },
  { text: "SaaS subscriptions for fleet owners.", from: 1930, to: 2010 },
  { text: "Transaction fees on every digital payment.", from: 2010, to: 2090 },
  { text: "SASSA verification. Advertising. Fintech. Data.", from: 2090, to: 2185 },

  // Scene 7: Fare Economics (2190–2550)
  { text: "Worst case: R0.55 per fare (cash only, 30 trips).", from: 2210, to: 2320 },
  { text: "Full potential: R2.83 per fare (all streams, 50 trips).", from: 2320, to: 2440 },
  { text: "50 vehicles: R22,500 → R212,250 per month.", from: 2440, to: 2545 },

  // Scene 8: Ask (2550–2850)
  { text: "We're raising R2 million in seed funding.", from: 2570, to: 2660 },
  { text: "Deploy 50 vehicles. Prove the model.", from: 2660, to: 2740 },
  { text: "Then scale nationally.", from: 2740, to: 2800 },
  { text: "TukConnect — The future moves with us.", from: 2800, to: 2845 },
];

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deepNavy }}>
      <PersistentBackground />

      <Series>
        <Series.Sequence durationInFrames={540}>
          <Scene1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={540}>
          <Scene2Problem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={720}>
          <Scene3Solution />
        </Series.Sequence>
        <Series.Sequence durationInFrames={450}>
          <Scene4Traction />
        </Series.Sequence>
        <Series.Sequence durationInFrames={510}>
          <Scene5Customer />
        </Series.Sequence>
        <Series.Sequence durationInFrames={480}>
          <Scene5Revenue />
        </Series.Sequence>
        <Series.Sequence durationInFrames={510}>
          <Scene7FareEconomics />
        </Series.Sequence>
        <Series.Sequence durationInFrames={390}>
          <Scene6Ask />
        </Series.Sequence>
      </Series>

      <SubtitleBar subtitles={subtitles} />
    </AbsoluteFill>
  );
};
