import React from "react";
import { InstagramState } from "../../types";

const NotificationItem: React.FC<{ type: string; username: string; time: string; text?: string; avatar: string }> = ({ type, username, time, text, avatar }) => (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 30px", gap: 20 }}>
        <div style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            backgroundImage: `url(${avatar})`,
            backgroundSize: "cover",
            backgroundColor: "#333"
        }} />
        <div style={{ flex: 1, fontSize: 30, lineHeight: "1.3" }}>
            <span style={{ fontWeight: "bold" }}>{username}</span>
            {" "}
            {type === "like" && "liked your photo."}
            {type === "follow" && "started following you."}
            {type === "comment" && `commented: ${text}`}
            {" "}
            <span style={{ color: "#888" }}>{time}</span>
        </div>
        {type === "follow" ? (
            <div style={{
                backgroundColor: "#0095f6",
                color: "white",
                padding: "10px 30px",
                borderRadius: 10,
                fontSize: 28,
                fontWeight: "600"
            }}>
                Follow
            </div>
        ) : (
            <div style={{
                width: 90,
                height: 90,
                backgroundColor: "#333",
                backgroundImage: `url(https://picsum.photos/seed/post1/100/100)`, // Mock post image
                backgroundSize: "cover"
            }} />
        )}
    </div>
);

export const NotificationsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Mock notifications
    const notifications = [
        { id: "n1", type: "like", username: "alice_wonder", time: "2m", avatar: "https://i.pravatar.cc/150?u=alice" },
        { id: "n2", type: "follow", username: "bob_builder", time: "15m", avatar: "https://i.pravatar.cc/150?u=bob" },
        { id: "n3", type: "comment", username: "charlie_chaplin", time: "1h", text: "Great shot! 🔥", avatar: "https://i.pravatar.cc/150?u=charlie" },
        { id: "n4", type: "like", username: "dave_diver", time: "3h", avatar: "https://i.pravatar.cc/150?u=dave" },
        { id: "n5", type: "follow", username: "eve_hacker", time: "5h", avatar: "https://i.pravatar.cc/150?u=eve" },
    ];

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                padding: "0 30px",
                marginTop: 60,
                fontSize: 42,
                fontWeight: "bold",
                borderBottom: "1px solid #222"
            }}>
                Notifications
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ padding: "20px 0" }}>
                    <div style={{ padding: "0 30px 20px", fontSize: 32, fontWeight: "bold" }}>New</div>
                    {notifications.slice(0, 2).map(n => (
                        <NotificationItem key={n.id} {...n} />
                    ))}
                    <div style={{ padding: "40px 30px 20px", fontSize: 32, fontWeight: "bold" }}>Today</div>
                    {notifications.slice(2).map(n => (
                        <NotificationItem key={n.id} {...n} />
                    ))}
                </div>
            </div>
        </div>
    );
};
