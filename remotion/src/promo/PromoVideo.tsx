import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { PersistentBackground } from "../components/PersistentBackground";
import { Scene1Hail } from "./Scene1Hail";
import { Scene2Payment } from "./Scene2Payment";
import { Scene3Panic } from "./Scene3Panic";
import { Scene4Owner } from "./Scene4Owner";
import { Scene5Brand } from "./Scene5Brand";
import { COLORS } from "../styles";

// 60 sec @ 30fps = 1800 frames
// Sequences: 360 + 360 + 360 + 360 + 360 = 1800 (transitions overlap)
// With 4 transitions of 24f overlap → effective ~1704; pad to 1800.
export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deepNavy }}>
      <PersistentBackground />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene1Hail />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene2Payment />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene3Panic />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene4Owner />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 30 })}
        />
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene5Brand />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
