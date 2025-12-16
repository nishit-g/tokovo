import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramVideo } from "./InstagramVideo";
import { NotificationCallDemoVideo } from "./NotificationCallDemoVideo";
import { HomeScreenGroupDemoVideo } from "./HomeScreenGroupDemoVideo";
import { WhatsappPsychoticDemoVideo } from "./WhatsappPsychoticDemoVideo";
import { WhatsappProductionDemoVideo } from "./WhatsappProductionDemoVideo";
import { WhatsappCompleteShowcaseVideo } from "./WhatsappCompleteShowcaseVideo";
import { CameraShowcaseVideo } from "./CameraShowcaseVideo";
import { CinematicCameraShowcaseVideo } from "./CinematicCameraShowcaseVideo";
import { FullCinematicShowcaseVideo } from "./FullCinematicShowcaseVideo";
import { MultiPovDemoVideo } from "./MultiPovDemoVideo";
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
import { SemanticCameraShowcase } from "./SemanticCameraShowcase";
import { AutoDirectorShowcase } from "./AutoDirectorShowcase";
import { ManualCameraShowcase } from "./ManualCameraShowcase";
import { NotificationShowcase } from "./showcases/NotificationShowcase";
import { BakchodiGangVideo } from "./BakchodiGangVideo";


export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="AutoDirectorShowcase"
                component={AutoDirectorShowcase}
                durationInFrames={450}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="NotificationShowcase2"
                component={NotificationShowcase}
                durationInFrames={450}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="ManualCameraShowcase"
                component={ManualCameraShowcase}
                durationInFrames={1400}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="SemanticCameraShowcase"
                component={SemanticCameraShowcase}
                durationInFrames={660}
                fps={30}
                width={1080}
                height={1920}
            />
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
                id="WhatsappProductionDemo"
                component={WhatsappProductionDemoVideo}
                durationInFrames={900}
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
                id="MultiPovDemo"
                component={MultiPovDemoVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="CameraShowcase"
                component={CameraShowcaseVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
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
            <Composition
                id="WhatsappPsychoticDemo"
                component={WhatsappPsychoticDemoVideo}
                durationInFrames={600}
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
            <Composition
                id="BakchodiGang"
                component={BakchodiGangVideo}
                durationInFrames={1500}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
