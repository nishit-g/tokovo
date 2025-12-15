import { episode } from "@tokovo/dsl";

export const bakchodiGangEpisode = episode("bakchodi-gang", ep => {
    ep.config({
        title: "Berozgaar Engineers 🛠️",
        fps: 30,
    });

    ep.device("RahulPhone", "iphone16", d => {
        // Define the group chat
        d.app("app_whatsapp");
        d.conversation("group_engineers", {
            name: "Berozgaar Engineers 🛠️",
            type: "group",
            avatar: "/avatars/group_be.png" // We assume this exists or fallback
        });

        // ACT 1: The Scheme
        d.beat("the_scheme", b => {
            b.wait("1s");

            // Vicky enters with a bang
            b.receive("Vicky", "Bhai log ek scheme hai! 💰💰");
            b.wait("0.5s");
            b.receive("Vicky", "Double paisa in 21 days! Trust me bro.");

            // Rahul (Me) is skeptical
            b.typing("me").for("1.5s");
            b.send("Fir shuru ho gaya tu? 😂");
            b.send("Pichli baar Laxmi Chit Fund mein mera 500 duba tha.");

            // Sameer the innocent
            b.wait("1s");
            b.typing("Sameer").for("2s");
            b.receive("Sameer", "Vicky bhai, is this legit? 🤔");
            b.wait("0.5s");
            b.receive("Sameer", "Priya bhi invest karegi kya?");

            // Camera focus on Sameer's dumb message
            ep.camera(c => {
                c.pushIn(0.1, { originY: 0.8, duration: "0.5s" });
            });

            // Rahul roasts Sameer
            b.wait("0.5s");
            b.send("Saale Simp! 😂");
            b.send("Priya ke chakkar mein tu kidney bech dega.");
        });

        // ACT 2: The Pitch
        d.beat("the_pitch", b => {
            b.wait("1s");
            b.receive("Vicky", "Arre suno toh! Crypto hai bhai.");
            b.typing("Vicky").for("1s");
            b.receive("Vicky", "'DogeElonMars' coin. 🚀");
            b.receive("Vicky", "Elon Musk ne tweet kiya hai (shayad).");

            // Dramatic reaction
            ep.camera(c => {
                c.shake("RahulPhone", { intensity: 5, duration: "0.5s" });
            });
            b.react(b.send("Elon Musk ne tweet kiya hai (shayad)."), "me", "🤣");
        });

        // ACT 3: The Entry
        d.beat("priya_entry", b => {
            b.wait("2s");

            // Priya enters
            b.receive("Priya", "Hey guys! What's going on? 😊");

            // Everyone stops
            ep.camera(c => {
                c.follow(0.5, 0.85, { duration: "1s" });
            });

            // Sameer instantly replies
            b.typing("Sameer").for("0.1s"); // Fast typing
            b.receive("Sameer", "Hey Priya! 😍 Vicky was just telling us how he's going to become a billionaire.");

            b.wait("1s");
            b.send("Lol. Vicky billionaire nahi, bhikari banega.");
            b.send("Aur hum sabko Panvel le jayega.");
        });

        // ACT 4: The Roast
        d.beat("the_roast", b => {
            b.receive("Vicky", "Abey saalon, mazak uda lo.");
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
            b.receive("Vicky", "Coffee ka paisa nahi hai.");
            b.receive("Vicky", "Scheme mein laga diya sab. 🥲");

            // Final camera pull out
            ep.camera(c => {
                c.reset({ duration: "1s" });
            });
        });
    });
});
