import React from "react";
import { InstagramState } from "../../types";

const SearchBar = () => (
    <div style={{
        height: 80,
        backgroundColor: "#262626",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        margin: "20px 30px",
        gap: 20
    }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div style={{ fontSize: 32, color: "#888" }}>Search</div>
    </div>
);

export const ExploreView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Generate some mock explore content
    const exploreItems = Array.from({ length: 15 }).map((_, i) => ({
        id: `exp_${i}`,
        image: `https://picsum.photos/seed/exp${i}/500/500`,
        isLarge: i % 10 === 0 // Every 10th item is large (2x2)
    }));

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{ marginTop: 60 }}>
                <SearchBar />
            </div>

            <div style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                alignContent: "flex-start"
            }}>
                {exploreItems.map((item, i) => (
                    <div key={item.id} style={{
                        width: item.isLarge ? "calc(66.66% - 2px)" : "calc(33.33% - 2px)",
                        aspectRatio: item.isLarge ? "1/1" : "1/1",
                        backgroundColor: "#222",
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative"
                    }}>
                        {i % 5 === 0 && (
                            <div style={{ position: "absolute", top: 10, right: 10 }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                                    <path d="M2 2l20 20" stroke="none" />
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="none" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
