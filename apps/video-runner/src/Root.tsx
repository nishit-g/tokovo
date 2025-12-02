import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="TokovoExample"
                component={Video}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
