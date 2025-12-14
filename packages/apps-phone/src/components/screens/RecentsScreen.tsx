/**
 * Recents Screen - Call History
 * 
 * Displays list of recent calls.
 */

import React from "react";

interface RecentsScreenProps {
    platform?: "ios" | "android";
    callLog?: any[];
}

/**
 * RecentsScreen - Call history list
 */
export const RecentsScreen: React.FC<RecentsScreenProps> = ({
    platform = "ios",
    callLog = []
}) => {
    // Sample call history for demo
    const sampleCalls = [
        { id: "1", name: "Alice", type: "outgoing", time: "2:34 PM" },
        { id: "2", name: "Bob", type: "missed", time: "Yesterday" },
        { id: "3", name: "Charlie", type: "incoming", time: "Yesterday" },
    ];

    const calls = callLog.length > 0 ? callLog : sampleCalls;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: platform === "ios" ? "#000" : "#121212",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "60px 20px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                <div
                    style={{
                        fontSize: 34,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: platform === "ios"
                            ? "SF Pro Display, -apple-system, sans-serif"
                            : "Roboto, sans-serif",
                    }}
                >
                    Recents
                </div>
            </div>

            {/* Call list */}
            <div style={{ flex: 1, overflow: "auto" }}>
                {calls.map((call: any) => (
                    <div
                        key={call.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "16px 20px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                backgroundColor: "#4a90d9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 16,
                            }}
                        >
                            <span style={{ color: "#fff", fontSize: 20 }}>
                                {call.name[0]}
                            </span>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontSize: 17,
                                    fontWeight: 500,
                                    color: call.type === "missed" ? "#FF3B30" : "#fff",
                                }}
                            >
                                {call.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: "rgba(255,255,255,0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <span>
                                    {call.type === "outgoing" ? "↗" : call.type === "incoming" ? "↙" : "✕"}
                                </span>
                                {call.type}
                            </div>
                        </div>

                        {/* Time */}
                        <div
                            style={{
                                fontSize: 15,
                                color: "rgba(255,255,255,0.5)",
                            }}
                        >
                            {call.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
