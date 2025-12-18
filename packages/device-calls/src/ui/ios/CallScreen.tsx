/**
 * iOS 17 Call Screen
 * 
 * Features:
 * - Contact Poster layout (Full bleed image/color)
 * - Depth effect typography (simulated)
 * - Glassmorphism controls
 */

import React, { useMemo } from "react";
import { AppViewProps } from "@tokovo/core";
import { PhoneTheme } from "../../theme";
import { useStrings } from "../../i18n";

export const CallScreenIOS: React.FC<AppViewProps> = ({ world, deviceId, t }) => {
    const strings = useStrings();
    const device = world.devices[deviceId || Object.keys(world.devices)[0]];
    const call = device?.call;

    // Safety: No call state?
    if (!call || call.status === "ended") return null;

    const isIncoming = call.status === "incoming" || call.status === "ringing";
    const isActive = call.status === "active";

    // --- Contact Poster Logic ---
    // Extract metadata or default
    const posterColor = typeof call.callerMetadata?.posterColor === 'string' ? call.callerMetadata.posterColor : "#8e8e93";
    const posterImage = typeof call.callerMetadata?.posterImage === 'string' ? call.callerMetadata.posterImage : null;
    const name = call.callerName || "Unknown";

    // Background Style
    const backgroundStyle: React.CSSProperties = posterImage
        ? {
            backgroundImage: `url(${posterImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : {
            backgroundColor: posterColor,
            background: `linear-gradient(180deg, ${posterColor} 0%, #000 100%)`,
        };

    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            color: "white",
            fontFamily: PhoneTheme.typography.fontFamily,
            ...backgroundStyle
        }}>
            {/* Overlay Gradient for readability */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 80%)",
                pointerEvents: "none"
            }} />

            {/* --- Top Metadata (Name/Status) --- */}
            <div style={{
                marginTop: 60, // Safe Area
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 10,
            }}>
                {/* Contact Poster Name (Big, Bold) */}
                <div style={{
                    fontSize: 48,
                    fontWeight: 300, // iOS 17 Thin Weight preference for Name
                    letterSpacing: -0.5,
                    marginBottom: 8,
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                }}>
                    {name}
                </div>

                {isIncoming && (
                    <div style={{
                        fontSize: 18,
                        fontWeight: 500,
                        opacity: 0.8,
                        color: "rgba(255,255,255,0.7)"
                    }}>
                        {strings.incomingCall}
                    </div>
                )}

                {isActive && (
                    <div style={{
                        fontSize: 18,
                        fontWeight: 500,
                        opacity: 0.8,
                        // TODO: Format duration
                        color: "rgba(255,255,255,0.7)"
                    }}>
                        00:24
                    </div>
                )}
            </div>

            <div style={{ flex: 1 }} />

            {/* --- Bottom Controls --- */}
            <div style={{
                paddingBottom: 60, // Safe Area
                paddingLeft: 32,
                paddingRight: 32,
                display: "flex",
                flexDirection: "column",
                gap: 40,
                zIndex: 10,
            }}>

                {/* Active Controls Grid */}
                {isActive && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 16,
                        marginBottom: 20
                    }}>
                        <ControlButton icon="mic.slash.fill" label={strings.mute} active={call.isMuted} />
                        <ControlButton icon="keypad" label={strings.keypad} />
                        <ControlButton icon="speaker.wave.3.fill" label={strings.speaker} active={call.isSpeakerOn} />
                        <ControlButton icon="plus" label={strings.addCall} />
                        <ControlButton icon="video.fill" label={strings.video} />
                        <ControlButton icon="person.circle.fill" label={strings.contacts} />
                    </div>
                )}

                {/* Primary Action Buttons */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 20px"
                }}>
                    {isIncoming ? (
                        <>
                            {/* Decline */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <BigButton color={PhoneTheme.colors.decline} icon="phone.down.fill" />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{strings.decline}</span>
                            </div>

                            {/* Accept */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <BigButton color={PhoneTheme.colors.accept} icon="phone.fill" />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{strings.accept}</span>
                            </div>
                        </>
                    ) : (
                        /* End Call (Centered) */
                        <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <BigButton color={PhoneTheme.colors.decline} icon="phone.down.fill" size={72} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// --- Subcomponents ---

const ControlButton: React.FC<{ icon: string, label: string, active?: boolean }> = ({ icon, label, active }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: active ? "white" : "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active ? "black" : "white",
            fontSize: 28
        }}>
            {/* Placeholder Icon */}
            <div />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
    </div>
);

const BigButton: React.FC<{ color: string, icon: string, size?: number }> = ({ color, icon, size = 64 }) => (
    <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }}>
        {/* Placeholder Icon */}
        <div style={{ width: size / 2, height: size / 2, background: "white" }} />
    </div>
);
