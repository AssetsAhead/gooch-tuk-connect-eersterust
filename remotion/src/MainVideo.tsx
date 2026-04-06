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
  // Scene 1: Hook (0–540)
  { text: "South Africa's minibus taxi industry...", from: 30, to: 120 },
  { text: "moves 15 million passengers daily.", from: 120, to: 240 },
  { text: "A R90 BILLION market.", from: 240, to: 390 },
  { text: "Yet it runs on cash, paper, and handshakes.", from: 390, to: 530 },

  // Scene 2: Problem (540–1080)
  { text: "No digital payments. No GPS tracking.", from: 570, to: 700 },
  { text: "No driver accountability.", from: 700, to: 810 },
  { text: "Passengers feel unsafe. Owners lose money.", from: 810, to: 960 },
  { text: "Government can't regulate what it can't see.", from: 960, to: 1070 },

  // Scene 3: Solution (1080–1800)
  { text: "Introducing TukConnect — powered by Poortlink.", from: 1110, to: 1260 },
  { text: "Real-time GPS tracking for every vehicle.", from: 1260, to: 1400 },
  { text: "Facial recognition clocking for drivers.", from: 1400, to: 1540 },
  { text: "SASSA grant verification for fare discounts.", from: 1540, to: 1680 },
  { text: "Digital payments replacing cash risk.", from: 1680, to: 1790 },

  // Scene 4: Traction (1800–2340)
  { text: "We're not just an idea — we've built it.", from: 1830, to: 1960 },
  { text: "CIPC registered. SARS compliant.", from: 1960, to: 2070 },
  { text: "POPIA framework. Trademarks filed.", from: 2070, to: 2200 },
  { text: "Eersterust pilot ready to launch.", from: 2200, to: 2330 },

  // Scene 5: Target Customer (2340–2970)
  { text: "Primary customer: Vehicle Owners.", from: 2370, to: 2500 },
  { text: "Solving operational opacity — cash skimming & unreported trips.", from: 2500, to: 2650 },
  { text: "Scale multiplier: Taxi Associations.", from: 2650, to: 2780 },
  { text: "One deal onboards an entire rank.", from: 2780, to: 2890 },
  { text: "DOT licensing delay = competitive moat.", from: 2890, to: 2960 },

  // Scene 6: Revenue Model (2970–3600)
  { text: "Six diversified revenue streams.", from: 3000, to: 3100 },
  { text: "SaaS subscriptions for fleet owners.", from: 3100, to: 3200 },
  { text: "Transaction fees on every digital payment.", from: 3200, to: 3310 },
  { text: "SASSA verification. Advertising. Fintech. Data.", from: 3310, to: 3450 },
  { text: "TAM: R90B industry × First-Mover Advantage.", from: 3450, to: 3590 },

  // Scene 7: Fare Economics (3600–4230)
  { text: "Revenue per fare — unit economics.", from: 3630, to: 3750 },
  { text: "Worst case: R0.55 per fare (cash only, 30 trips).", from: 3750, to: 3900 },
  { text: "Full potential: R2.83 per fare (all streams, 50 trips).", from: 3900, to: 4060 },
  { text: "50 vehicles: R22,500 → R212,250 per month.", from: 4060, to: 4220 },

  // Scene 8: Ask (4230–4680)
  { text: "We're raising R2 million in seed funding.", from: 4260, to: 4380 },
  { text: "Deploy 50 vehicles. Prove the model.", from: 4380, to: 4500 },
  { text: "Then scale nationally.", from: 4500, to: 4600 },
  { text: "TukConnect — The future moves with us.", from: 4600, to: 4670 },
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
