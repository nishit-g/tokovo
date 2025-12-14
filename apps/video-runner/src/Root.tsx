import React from "react";
import { Composition } from "remotion";
import { WhatsappCompleteShowcaseVideo } from "./WhatsappCompleteShowcaseVideo";
import { CinematicCameraShowcaseVideo } from "./CinematicCameraShowcaseVideo";
import { FullCinematicShowcaseVideo } from "./FullCinematicShowcaseVideo";
import { BreakupDramaDSLVideo } from "./BreakupDramaDSLVideo";
import { WhatsappMediaShowcaseVideo } from "./WhatsappMediaShowcaseVideo";
import { UltimateShowcaseVideo } from "./UltimateShowcaseVideo";
import { TwitterShowcaseVideo } from "./TwitterShowcaseVideo";
import { MultiAppShowcaseVideo } from "./MultiAppShowcaseVideo";
import { NotificationShowcaseVideo } from "./NotificationShowcaseVideo";
import { KeyboardTypingShowcase } from "./KeyboardTypingShowcase";
import { FullRealityShowcase } from "./FullRealityShowcase";
import { PhoneCallShowcase } from "./PhoneCallShowcase";
import { UltimateShowcase } from "./UltimateShowcase";


export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="UltimateShowcase2"
                component={UltimateShowcase}
                durationInFrames={780}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="PhoneCallShowcase"
                component={PhoneCallShowcase}
                durationInFrames={390}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="FullRealityShowcase"
                component={FullRealityShowcase}
                durationInFrames={1200}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="NotificationShowcase"
                component={NotificationShowcaseVideo}
                durationInFrames={1200}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="FullCinematicShowcase"
                component={FullCinematicShowcaseVideo}
                durationInFrames={720}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="CinematicCameraShowcase"
                component={CinematicCameraShowcaseVideo}
                durationInFrames={720}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="WhatsappCompleteShowcase"
                component={WhatsappCompleteShowcaseVideo}
                durationInFrames={1200}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="MultiAppShowcase"
                component={MultiAppShowcaseVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="TwitterShowcase"
                component={TwitterShowcaseVideo}
                durationInFrames={450}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="UltimateShowcase"
                component={UltimateShowcaseVideo}
                durationInFrames={750}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="WhatsappMediaShowcase"
                component={WhatsappMediaShowcaseVideo}
                durationInFrames={700}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="BreakupDramaDSL"
                component={BreakupDramaDSLVideo}
                durationInFrames={420}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="KeyboardTypingShowcase"
                component={KeyboardTypingShowcase}
                durationInFrames={600}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
