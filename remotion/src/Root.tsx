import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { PromoVideo } from "./promo/PromoVideo";

// Main investor pitch (~95s)
// Promo: 60s = 1800 frames @ 30fps
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={2850}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="promo"
      component={PromoVideo}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
