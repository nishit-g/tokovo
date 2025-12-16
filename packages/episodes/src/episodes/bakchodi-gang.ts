import { episode, EpisodeDefinition } from "@tokovo/dsl";


export const bakchodiGangEpisode: EpisodeDefinition = episode("bakchodi-gang", ep => {
    ep.config({
        title: "Berozgaar Engineers 🛠️",
        fps: 30,
    });

    ep.device("RahulPhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("group_engineers", {
            name: "Berozgaar Engineers 🛠️",
            type: "group",
            avatar: "/avatars/group_be.png" // We assume this exists or fallback
        });

        // ACT 1: The Scheme
        d.beat("the_scheme", b => {
            b.wait("1s");
            b.camera(c => c.focus("profile", { duration: "10s", preset: "dramatic" }));

            // Vicky enters with a bang
            b.receive("Vicky", "Oye BC log! Utho bhenchod! Ek faadu scheme haath lagi hai! 💰💰");
            b.wait("0.5s");
            b.receive("Vicky", "21 din mein paisa double BC. Trust me bro. Is baar pakka! 🤑");

            // READING SCAN EFFECT (Cinematic Left-to-Right)
            // 1. Cut to start of message (Left) - Zoomed in ("dramatic")
            // b.camera(c => c.focus("lastMessage", { align: { x: 0.15, y: 0.5 }, preset: "dramatic", duration: "5s" }));
            // // 2. Smoothly scan to end (Right)
            // b.camera(c => c.focus("lastMessage", { align: { x: 0.85, y: 0.5 }, preset: "dramatic", duration: "2.5s", easing: "linear" }));

            // Start with a dramatic profile focus to establish the "character"
            b.wait("2s");

            // Then cut to standard view
            // b.camera(c => c.reset({ duration: "0.5s" }));

            // Rahul (Me) is skeptical
            b.typing("me").for("1.5s");
            b.send("Fir shuru ho gaya tu MC? 😂");
            b.send("Pichli baar Laxmi Chit Fund mein mera 500 duba tha bhadwe.");
            b.send("Tu sudhrega nahi na bsdike?");

            // Sameer the innocent
            b.wait("1s");
            b.typing("Sameer").for("2s");
            b.receive("Sameer", "Vicky bhai, is this legit? 🤔");
            b.wait("0.5s");
            b.receive("Sameer", "Priya bhi invest karegi kya? I need to know...");

            // Camera focus on Sameer's dumb message - SEMANTIC FOCUS
            b.camera(c => {
                c.punchGlide("lastMessage", { intensity: 1.5 });
            });

            // Rahul roasts Sameer
            b.wait("0.5s");
            b.send("Abey Saale Simp ke chode! 🤬");
            b.send("Priya ke chakkar mein tu apni kidney bech dega BC.");
            b.send("Gandu aadmi.");
        });

        // ACT 2: The Pitch
        d.beat("the_pitch", b => {
            b.wait("1s");
            b.receive("Vicky", "Arre suno toh gandu log! Crypto hai bhai. Future hai ye!");
            b.typing("Vicky").for("1s");
            b.receive("Vicky", "'DogeElonMars' coin. 🚀 To the moon BC!");
            b.receive("Vicky", "Elon Musk ne tweet kiya hai (shayad).");

            // Semantic Track - Follow the flow
            b.camera(c => {
                c.track("lastMessage", { duration: "5s", smoothing: 0.1 });
            });
            b.react(b.send("Elon Musk ne tweet kiya hai (shayad)."), "me", "🤣");

            b.wait("0.5s");
            b.send("Elon Musk teri gaand maarega kisi din BC.");
            b.send("Chup chap naukri dhund le bsdike.");
        });

        // ACT 3: The Entry
        d.beat("priya_entry", b => {
            b.wait("2s");

            // Reset camera before entry
            b.camera(c => {
                c.reset({ duration: "0.5s" });
            });

            // Priya enters
            b.receive("Priya", "Hey guys! What's going on? 😊");

            // Everyone stops - Focus on her message
            b.camera(c => {
                c.focus("lastMessage", { duration: "0.4s" });
            });

            // Sameer instantly replies
            b.typing("Sameer").for("0.1s"); // Fast typing
            b.receive("Sameer", "Hey Priya! 😍 Vicky was just telling us how he's going to become a billionaire.");

            b.wait("1s");
            b.send("Lol. Vicky billionaire nahi, bhikari banega BC.");
            b.send("Aur hum sabko Panvel le jayega ye chutiya.");
        });

        // ACT 4: The Roast
        d.beat("the_roast", b => {
            b.receive("Vicky", "Abey saalon, mazak uda lo. Randi rona band karo.");
            b.receive("Vicky", "Jab main Lambo mein aunga na...");

            b.wait("1s");
            b.send("Toh main Uber samajh ke baith jaunga. 🚗");

            // Group laugh
            b.typing("Priya").for("1s");
            b.receive("Priya", "Haha guys chill! 😂");
            b.receive("Priya", "Btw, anyone up for coffee? ☕");
        });

        // ACT 5: The Conclusion
        d.beat("conclusion", b => {
            // Sameer jumps in
            b.receive("Sameer", "Meeee! 🙋‍♂️ I'm free!");
            b.receive("Sameer", "(Currently unemployed anyway loool)");

            b.wait("1s");
            b.receive("Vicky", "Coffee ka paisa nahi hai BC. कंगाल hu main.");
            b.receive("Vicky", "Scheme mein laga diya sab. 🥲 Lag gaye lode.");

            // Final camera pull out
            b.camera(c => {
                c.reset({ duration: "1s" });
            });
        });

        // ACT 6: Navigation Test
        d.beat("navigation_test", b => {
            // Navigate to Chat List
            b.goBack({ duration: "0.5s" });
            b.wait("1s");

            // Navigate back to this chat
            b.openChat("group_engineers", { duration: "0.5s" });
            b.wait("1s");

            // Navigate to Chat List again
            b.showScreen("chats-list", { duration: "0.5s" });
            b.wait("1s");
        });

        // ACT 7: ARCHITECTURE VERIFICATION
        d.beat("camera_test", b => {
            // Return to chat
            b.openChat("group_engineers");
            b.wait("1s");

            b.send("--- ARCHITECTURE CHECK ---");
            b.wait("0.5s");

            // 1. INPUT AREA (Sticky Anchor)
            // Should frame the bottom bar perfectly without scrolling
            b.send("Testing Input Area (Sticky)...");
            b.camera(c => c.focus("inputArea", { duration: "1s", preset: "subtle" }));
            b.wait("1.5s");
            // Simulate typing to ensure anchor is stable
            b.typing("me").for("2s");
            b.wait("1s");

            // 2. LAST MESSAGE (Scrolled Anchor)
            // Should jump to the latest message, compensating for scroll
            b.send("Testing Last Message (Scrolled)...");
            b.camera(c => c.focus("lastMessage", { duration: "1s", preset: "dramatic" }));
            b.wait("2s");

            // 3. TRACKING TEST
            b.send("Testing Tracking (New Message)...");
            // Setup tracking BEFORE message arrives
            b.camera(c => c.track("lastMessage", { duration: "4s", preset: "operatorFollow" }));
            b.wait("0.5s");
            b.receive("Vicky", "Tracking kaam kar raha hai kya? 🎥");
            b.wait("1s");
            b.receive("Sameer", "Woh camera mere peeche aa raha hai! 🏃‍♂️");

            // 4. RESET
            b.camera(c => c.reset({ duration: "1s" }));
            b.wait("1s");
            b.send("VERIFICATION COMPLETE. ✅");
        });
    });
});
