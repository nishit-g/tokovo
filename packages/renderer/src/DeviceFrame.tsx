import React from "react";
import { DeviceProfile, iPhone16Frame, PixelFrame, StatusBar } from "@tokovo/devices";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices"; // Import profiles to look them up

export const DeviceFrame: React.FC<{ profileId: string; isLocked?: boolean; notifications?: any[]; children: React.ReactNode; variant?: "ios" | "android" }> = ({ profileId, isLocked, notifications, children, variant }) => {
    // Strategy pattern: Select frame component based on profile ID
    const FrameComponent = profileId === "iphone16" ? iPhone16Frame :
        profileId === "pixel" ? PixelFrame : React.Fragment;

    // Determine props to pass to the FrameComponent
    const frameProps = {};
    if (profileId === "iphone16" || profileId === "pixel") {
        if (variant) {
            Object.assign(frameProps, { variant });
        }
    }

    return (
        <FrameComponent {...frameProps}>
            <StatusBar time="10:41" variant={variant} />
            {children}
            {isLocked && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)", // Dimmed lock screen
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 300,
                    color: "white",
                    zIndex: 2000
                }}>
                    <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 60 }}>Locked</div>

                    {/* Notifications Stack */}
                    <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 24 }}>
                        {notifications?.map((notif) => (
                            <div key={notif.id} style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                backdropFilter: "blur(40px)",
                                borderRadius: 42,
                                padding: "36px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 39, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                                    <span>{notif.appId === "app_whatsapp" ? "WhatsApp" : notif.appId}</span>
                                    <span style={{ fontWeight: 400, fontSize: 36, color: "rgba(255,255,255,0.6)" }}>now</span>
                                </div>
                                <div style={{ fontSize: 42, fontWeight: 600 }}>{notif.title}</div>
                                <div style={{ fontSize: 42 }}>{notif.body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </FrameComponent>
    );
};
