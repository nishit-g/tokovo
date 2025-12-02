import React from "react";

export const StatusBar: React.FC<{ time?: string; variant?: "ios" | "android" }> = ({ time = "9:41", variant = "ios" }) => {
    const isAndroid = variant === "android";

    return (
        <div style={{
            width: "100%",
            height: isAndroid ? 90 : 60, // Android status bar is usually taller
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isAndroid ? "0 45px" : "0 30px",
            boxSizing: "border-box",
            fontSize: isAndroid ? 36 : 24,
            fontWeight: "bold",
            color: isAndroid ? "white" : "black", // Default to white for Android (usually on dark bg or transparent)
            position: "absolute",
            top: isAndroid ? 15 : 15,
            left: 0,
            zIndex: 20,
            fontFamily: isAndroid ? "Roboto, sans-serif" : "inherit"
        }}>
            <div>{time}</div>
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                {isAndroid ? (
                    <>
                        {/* Android Icons */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L24 6H0L12 21Z" /></svg> {/* Wifi-ish */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg> {/* Battery */}
                    </>
                ) : (
                    <>
                        {/* iOS Icons placeholders */}
                        <span>📶</span>
                        <span>Wi-Fi</span>
                        <span>🔋</span>
                    </>
                )}
            </div>
        </div>
    );
};
