import { AbsoluteFill, Series, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4Traction } from "./scenes/Scene4Traction";
import { Scene5Revenue } from "./scenes/Scene5Revenue";
import { Scene6Ask } from "./scenes/Scene6Ask";
import { PersistentBackground } from "./components/PersistentBackground";
import { SubtitleBar } from "./components/SubtitleBar";
import { COLORS } from "./styles";

loadOswald();
loadInter();

// Subtitles timed to scenes
const subtitles: { text: string; from: number; to: number }[] = [
  // Scene 1: Hook (0-540)
  { text: "South Africa's minibus taxi industry...", from: 30, to: 120 },
  { text: "moves 15 million passengers daily.", from: 120, to: 240 },
  { text: "A R90 BILLION market.", from: 240, to: 390 },
  { text: "Yet it runs on cash, paper, and handshakes.", from: 390, to: 530 },
  
  // Scene 2: Problem (540-1080)
  { text: "No digital payments. No GPS tracking.", from: 570, to: 700 },
  { text: "No driver accountability.", from: 700, to: 810 },
  { text: "Passengers feel unsafe. Owners lose money.", from: 810, to: 960 },
  { text: "Government can't regulate what it can't see.", from: 960, to: 1070 },
  
  // Scene 3: Solution (1080-1800)
  { text: "Introducing TukConnect — powered by Poortlink.", from: 1110, to: 1260 },
  { text: "Real-time GPS tracking for every vehicle.", from: 1260, to: 1400 },
  { text: "Facial recognition clocking for drivers.", from: 1400, to: 1540 },
  { text: "SASSA grant verification for fare discounts.", from: 1540, to: 1680 },
  { text: "Digital payments replacing cash risk.", from: 1680, to: 1790 },
  
  // Scene 4: Traction (1800-2520)
  { text: "We're not just an idea — we've built it.", from: 1830, to: 1960 },
  { text: "CIPC registered. SARS compliant.", from: 1960, to: 2100 },
  { text: "POPIA privacy framework — fully implemented.", from: 2100, to: 2250 },
  { text: "Trademark applications filed.", from: 2250, to: 2370 },
  { text: "Eersterust pilot ready to launch.", from: 2370, to: 2510 },
  
  // Scene 5: Revenue (2520-3150)
  { text: "Revenue from six diversified streams:", from: 2550, to: 2650 },
  { text: "SaaS subscriptions for fleet owners.", from: 2650, to: 2760 },
  { text: "Transaction fees on every digital payment.", from: 2760, to: 2870 },
  { text: "SASSA verification processing fees.", from: 2870, to: 2960 },
  { text: "Vehicle wraps and in-app advertising.", from: 2960, to: 3040 },
  { text: "Fintech referrals: micro-loans, airtime, electricity.", from: 3040, to: 3100 },
  { text: "Data analytics licensing to government.", from: 3100, to: 3150 },
  
  // Scene 6: Ask (3150-3600)
  { text: "We're raising R2 million in seed funding.", from: 3180, to: 3310 },
  { text: "To deploy 50 vehicles. Prove the model.", from: 3310, to: 3430 },
  { text: "Then scale nationally.", from: 3430, to: 3540 },
  { text: "TukConnect — The future moves with us.", from: 3540, to: 3590 },
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
        <Series.Sequence durationInFrames={720}>
          <Scene4Traction />
        </Series.Sequence>
        <Series.Sequence durationInFrames={630}>
          <Scene5Revenue />
        </Series.Sequence>
        <Series.Sequence durationInFrames={450}>
          <Scene6Ask />
        </Series.Sequence>
      </Series>
      
      <SubtitleBar subtitles={subtitles} />
    </AbsoluteFill>
  );
};
