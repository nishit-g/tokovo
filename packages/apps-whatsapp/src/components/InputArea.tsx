import React from "react";
import { Platform, getAppConfig, getTokens } from "@tokovo/core";
import { PlusCircleIcon, CameraFillIcon, MicrophoneFillIcon } from "./icons";

interface InputAreaProps {
    text?: string;
    platform?: Platform;
}

export const InputArea: React.FC<InputAreaProps> = ({ text, platform = "ios" }) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `${config.bubblePadding}px 30px`,
            gap: 24,
            borderTop: "1px solid rgba(0,0,0,0.1)"
        }}>
            {/* Plus button */}
            <PlusCircleIcon />

            {/* Input field */}
            <div style={{
                flex: 1,
                minHeight: 100, // Slightly reduced
                backgroundColor: config.inputBg,
                borderRadius: 24, // More rounded like latest WA
                padding: "20px 36px",
                display: "flex",
                alignItems: "center",
                fontSize: 48,
                color: text ? config.inputTextColor : config.inputPlaceholderColor,
                fontFamily: tokens.fontFamily,
                border: "1px solid #E5E5EA",
                boxShadow: "0 1px 1px rgba(0,0,0,0.04)"
            }}>
                {text || ""}
                {/* Sticker Icon could go here inside input on right */}
                {!text && (
                   <div style={{ marginLeft: "auto", opacity: 0.5 }}>
                       {/* Sticker icon placeholder */}
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                           <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" />
                           <path d="M9 9H9.01" />
                           <path d="M15 9H15.01" />
                       </svg>
                   </div>
                )}
            </div>

            {/* Right icons */}
            {text ? (
                <div style={{
                    width: 105,
                    height: 105,
                    borderRadius: "50%",
                    backgroundColor: config.sendButtonColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <svg width="54" height="54" viewBox="0 0 18 18" fill="white">
                        <path d="M2 9L9 2L16 9M9 2V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(90 9 9)" />
                    </svg>
                </div>
            ) : (
                <>
                    <CameraFillIcon />
                    <MicrophoneFillIcon />
                </>
            )}
        </div>
    );
};
