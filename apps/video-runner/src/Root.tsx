import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramTourVideo } from "./InstagramTourVideo";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="TokovoExample"
                component={Video}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="AndroidNotificationTest"
                component={AndroidVideo}
                durationInFrames={150}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="InstagramTour"
                component={InstagramTourVideo}
                durationInFrames={350}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
