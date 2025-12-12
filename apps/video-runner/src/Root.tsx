import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramVideo } from "./InstagramVideo";
import { NotificationCallDemoVideo } from "./NotificationCallDemoVideo";
import { HomeScreenGroupDemoVideo } from "./HomeScreenGroupDemoVideo";

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
                id="InstagramDMTest"
                component={InstagramVideo}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="NotificationCallDemo"
                component={NotificationCallDemoVideo}
                durationInFrames={720}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="HomeScreenGroupDemo"
                component={HomeScreenGroupDemoVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
