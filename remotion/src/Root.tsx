import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 2 minutes = 120 seconds × 30fps = 3600 frames
export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={3600}
    fps={30}
    width={1920}
    height={1080}
  />
);
