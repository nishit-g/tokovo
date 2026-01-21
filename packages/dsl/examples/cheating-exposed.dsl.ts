import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

export const cheatingExposedEpisode: SceneIR = createEpisode(
  "cheating-exposed-01",
  (ep) => {
    ep.config({ fps: 30, title: "My Best Friend Exposed My Boyfriend" });

    ep.device("phone", "iphone16", (d) => {
      d.app("app_whatsapp");
      d.conversation("bestie_chat", { name: "Sarah 💕", avatar: "sarah.png" });
      d.conversation("bf_chat", { name: "Jake ❤️", avatar: "jake.png" });

      d.beat("normal_morning", (b) => {
        b.wait("1s");
        b.receive("Jake ❤️", "good morning beautiful 😘");
        b.wait("2s");
        b.send("morning babe! miss you");
        b.wait("1.5s");
        b.typing("Jake ❤️").for("1.5s");
        b.receive("Jake ❤️", "miss you too, can't wait for tonight");
        b.wait("2s");
        b.send("me too 🥰");
        b.wait("2s");
      });

      d.beat("friend_urgent", (b) => {
        b.receive("Sarah 💕", "hey");
        b.wait("1s");
        b.receive("Sarah 💕", "are you free rn?");
        b.wait("1.5s");
        b.send("yeah what's up");
        b.wait("1s");
        b.typing("Sarah 💕").for("2s");
        b.receive("Sarah 💕", "I need to show you something");
        b.wait("1.5s");
        b.send("okay? you're scaring me");
        b.wait("2s");
      });

      d.beat("hesitation", (b) => {
        b.typing("Sarah 💕").for("2s");
        b.wait("1s");
        b.typing("Sarah 💕").for("1.5s");
        b.wait("500ms");
        b.typing("Sarah 💕").for("2s");
        b.receive("Sarah 💕", "I don't know how to say this");
        b.wait("2s");
        b.send("just tell me");
        b.wait("1.5s");
        b.typing("Sarah 💕").for("1s");
        b.receive("Sarah 💕", "promise you won't hate me for telling you");
        b.wait("2s");
        b.send("I promise, what is it??");
        b.wait("2s");
      });

      d.beat("the_reveal", (b) => {
        b.typing("Sarah 💕").for("1s");
        b.receive("Sarah 💕", "I saw Jake last night");
        b.wait("2s");
        b.send("okay? he said he was at home");
        b.wait("2s");
        b.typing("Sarah 💕").for("2s");
        b.receive("Sarah 💕", "he wasn't alone");
        b.wait("3s");
        b.send("what do you mean");
        b.wait("1.5s");
        b.typing("Sarah 💕").for("1.5s");
        b.receive("Sarah 💕", "I took photos");
        b.wait("2s");
        b.receive("Sarah 💕", "I'm so sorry");
        b.wait("2s");
      });

      d.beat("screenshot_drop", (b) => {
        b.receiveImage("Sarah 💕", { url: "evidence1.jpg" });
        b.wait("4s");
        b.receiveImage("Sarah 💕", { url: "evidence2.jpg" });
        b.wait("4s");
        b.send("is that...");
        b.wait("1s");
        b.send("that's his car");
        b.wait("2s");
        b.typing("Sarah 💕").for("1s");
        b.receive("Sarah 💕", "I know");
        b.wait("1.5s");
        b.receive("Sarah 💕", "I recognized it immediately");
        b.wait("3s");
      });

      d.beat("denial_then_rage", (b) => {
        b.send("there has to be an explanation");
        b.wait("1.5s");
        b.typing("Sarah 💕").for("2s");
        b.receive("Sarah 💕", "babe...");
        b.wait("1s");
        b.receive("Sarah 💕", "they were kissing");
        b.wait("3s");
        b.send("WHO IS SHE");
        b.wait("1s");
        b.typing("Sarah 💕").for("2s");
        b.receive("Sarah 💕", "I don't know her");
        b.wait("1s");
        b.receive("Sarah 💕", "but I got a closer photo");
        b.wait("2s");
        b.receiveImage("Sarah 💕", { url: "evidence3.jpg" });
        b.wait("5s");
      });

      d.beat("confrontation_decision", (b) => {
        b.send("I'm going to be sick");
        b.wait("2s");
        b.typing("Sarah 💕").for("1s");
        b.receive("Sarah 💕", "I'm so sorry");
        b.wait("1s");
        b.receive("Sarah 💕", "what are you going to do?");
        b.wait("2s");
        b.send("I'm calling him right now");
        b.wait("1.5s");
        b.typing("Sarah 💕").for("1s");
        b.receive("Sarah 💕", "do you want me to come over?");
        b.wait("1.5s");
        b.send("yes please");
        b.wait("1s");
        b.send("I can't believe this is happening");
        b.wait("3s");
      });

      d.beat("confronting_jake", (b) => {
        b.send("Jake we need to talk");
        b.wait("2s");
        b.typing("Jake ❤️").for("1.5s");
        b.receive("Jake ❤️", "hey! what's up babe");
        b.wait("1.5s");
        b.send("where were you last night");
        b.wait("2s");
        b.typing("Jake ❤️").for("1s");
        b.receive("Jake ❤️", "I told you, I was home");
        b.wait("1.5s");
        b.receive("Jake ❤️", "why?");
        b.wait("2s");
      });

      d.beat("sending_evidence", (b) => {
        b.send("really?");
        b.wait("1s");
        b.send("then explain this");
        b.wait("1s");
        b.sendImage({ url: "evidence1.jpg" });
        b.wait("3s");
        b.sendImage({ url: "evidence3.jpg" });
        b.wait("4s");
      });

      d.beat("caught", (b) => {
        b.typing("Jake ❤️").for("3s");
        b.wait("2s");
        b.typing("Jake ❤️").for("2s");
        b.wait("1.5s");
        b.typing("Jake ❤️").for("2s");
        b.receive("Jake ❤️", "I can explain");
        b.wait("2s");
        b.send("DON'T");
        b.wait("1s");
        b.send("I don't want to hear it");
        b.wait("2s");
        b.typing("Jake ❤️").for("2s");
        b.receive("Jake ❤️", "babe please");
        b.wait("1.5s");
        b.receive("Jake ❤️", "it's not what it looks like");
        b.wait("2s");
      });

      d.beat("the_breakup", (b) => {
        b.send("IT'S EXACTLY WHAT IT LOOKS LIKE");
        b.wait("1.5s");
        b.send("we're done");
        b.wait("2s");
        b.typing("Jake ❤️").for("1.5s");
        b.receive("Jake ❤️", "no please don't do this");
        b.wait("1.5s");
        b.receive("Jake ❤️", "I love you");
        b.wait("2s");
        b.send("you should have thought about that before");
        b.wait("1.5s");
        b.send("lose my number");
        b.wait("3s");
      });

      d.beat("aftermath", (b) => {
        b.typing("Jake ❤️").for("2s");
        b.receive("Jake ❤️", "please let me explain");
        b.wait("2s");
        b.typing("Jake ❤️").for("1.5s");
        b.receive("Jake ❤️", "I made a mistake");
        b.wait("2s");
        b.receive("Jake ❤️", "it meant nothing");
        b.wait("2s");
        b.typing("Jake ❤️").for("1s");
        b.receive("Jake ❤️", "answer me");
        b.wait("3s");
        b.receive("Jake ❤️", "please");
        b.wait("4s");
      });

      d.beat("final_message", (b) => {
        b.send("goodbye Jake");
        b.wait("2s");
        const lastMsg = b.send("don't contact me again");
        b.wait("1s");
        b.read(lastMsg);
        b.wait("4s");
      });
    });
  },
);

export { cheatingExposedEpisode as default };
