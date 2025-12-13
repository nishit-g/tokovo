/**
 * Multi-POV Demo Episode
 * 
 * NOTE: This is a blueprint/reference for multi-device episodes.
 * The current DSL doesn't fully support multi-device/camera operations yet,
 * so this file serves as documentation for the intended API.
 * 
 * For now, multi-POV episodes should be created using JSON format
 * until the DSL is extended.
 * 
 * Demonstrates:
 * - Two characters (Alice & Bob) with separate phones
 * - Camera cuts between devices
 * - Split screen layouts (horizontal, vertical, PIP)
 * - Camera effects (zoom, shake)
 */

// This is a reference for future DSL API design
// Multi-device support requires extending EpisodeBuilder

/*
Example of intended future API:

ep.device("AlicePhone", "iphone16", d => {
    d.owner("Alice");  // Future: owner method
    d.app("app_whatsapp");
    d.conversation("dm_bob", { name: "Bob" });
});

ep.device("BobPhone", "iphone16", d => {
    d.owner("Bob");
    d.app("app_whatsapp");
    d.conversation("dm_alice", { name: "Alice" });
});

// Future: Camera builder for cuts and layouts
ep.camera(c => {
    c.at("3s").cut("BobPhone");
    c.at("6s").layout("SPLIT_HORIZONTAL", "AlicePhone", "BobPhone");
    c.at("12s").layout("PIP", "BobPhone", "AlicePhone", { position: "top-right" });
    c.at("24s").shake("AlicePhone", { intensity: 8 });
});

// Future: Scene builder for cross-device coordination
ep.scene("split-view", s => {
    s.device("AlicePhone", d => d.beat("waiting", b => b.send("Where are you?")));
    s.device("BobPhone", d => d.beat("reply", b => b.send("On my way!")));
});
*/

// For now, use the JSON format in multi-pov-demo.json
// This file exists to document the intended API extension

export const multiPovNotes = {
    status: "blueprint",
    referenceFile: "../packages/episodes/src/examples/multi-pov-demo.json",
    futureFeatures: [
        "ep.device().owner(name) - Set device owner for POV",
        "ep.camera(c => c.cut/layout/zoom/shake) - Camera operations",
        "ep.scene() - Cross-device scene coordination",
    ]
};
