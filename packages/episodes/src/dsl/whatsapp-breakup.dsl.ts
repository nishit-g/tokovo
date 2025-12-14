/**
 * WhatsApp Breakup Story - The End
 * 
 * An emotional conversation where someone breaks up with their partner
 * over WhatsApp after 2 years together.
 * 
 * DSL version of whatsapp-breakup-01.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const whatsappBreakup = episode("whatsapp-breakup")
    .meta({
        title: "WhatsApp Breakup Story - The End",
        fps: 30,
    })
    .device("main_phone", {
        profile: iPhone,
        isLocked: true,
    })
    .app("app_whatsapp", {
        conversationId: "conv_1",
        conversationName: "Alex ❤️",
    })
    .initialMessages("conv_1", [
        { from: "me", text: "Hey, are you free to talk?", status: "read" },
        { from: "me", text: "There's something I need to tell you...", status: "read" },
    ])

    // Beat 1: Phone unlock
    .beat("unlock", (b) => {
        b.wait("0.5s");  // 15 frames
        // Device unlock happens automatically
    })

    // Beat 2: Alex responds
    .beat("alex-responds", (b) => {
        b.wait("1s");
        b.typing("Alex ❤️").for("2s");
        b.receive("Alex ❤️", "Yeah I'm here, what's going on?");
        b.wait("1s");
        b.receive("Alex ❤️", "You're scaring me...");
    })

    // Beat 3: Breaking the news
    .beat("breaking-news", (b) => {
        b.wait("1s");
        b.send("I've been thinking a lot lately");
        b.wait("1s");
        b.send("About us. About where this is going.");
    })

    // Beat 4: Alex's confusion
    .beat("alex-confusion", (b) => {
        b.typing("Alex ❤️").for("2s");
        b.receive("Alex ❤️", "What do you mean? I thought everything was fine?");
    })

    // Beat 5: The admission
    .beat("the-admission", (b) => {
        b.wait("1s");
        b.send("It's not you. It's really not.");
        b.wait("1s");
        b.send("I just don't think I can do this anymore");
    })

    // Beat 6: Alex's shock
    .beat("alex-shock", (b) => {
        b.typing("Alex ❤️").for("1s");
        b.receive("Alex ❤️", "Are you breaking up with me??");
        b.wait("1s");
        b.receive("Alex ❤️", "Over TEXT?!");
    })

    // Beat 7: Apology
    .beat("apology", (b) => {
        b.wait("1s");
        b.send("I didn't know how else to say it");
        b.wait("1s");
        b.send("I'm sorry Alex. I really am.");
    })

    // Beat 8: Alex's hurt
    .beat("alex-hurt", (b) => {
        b.typing("Alex ❤️").for("2s");
        b.receive("Alex ❤️", "After 2 years? You're doing this over WhatsApp?");
        b.wait("1s");
        b.receive("Alex ❤️", "I gave you everything 😢");
    })

    // Beat 9: Self-focus
    .beat("self-focus", (b) => {
        b.wait("1s");
        b.send("I know. And I'm grateful for every moment we had.");
        b.wait("1s");
        b.send("But I need to focus on myself right now");
    })

    // Beat 10: Final goodbye
    .beat("final-goodbye", (b) => {
        b.typing("Alex ❤️").for("2s");
        b.receive("Alex ❤️", "...");
        b.wait("1s");
        b.receive("Alex ❤️", "I hope you find what you're looking for");
        b.wait("1s");
        b.receive("Alex ❤️", "Goodbye.");
    })

    .build();

export default whatsappBreakup;
