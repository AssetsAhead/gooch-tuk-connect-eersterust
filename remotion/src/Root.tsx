import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// ~2:40 = 160 seconds × 30fps = 4800 frames
export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={4200}
    fps={30}
    width={1920}
    height={1080}
  />
);
