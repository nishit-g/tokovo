import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

export const aiGeneratedTestEpisode: SceneIR = createEpisode(
  "ai-generated-test-01",
  (ep) => {
    ep.config({ fps: 30, title: "Late Night Text Drama" });

    ep.device("phone", "iphone16", (d) => {
      d.app("app_whatsapp");
      d.conversation("ex_chat", { name: "Ex", avatar: "ex.png" });

      d.beat("hook", (b) => {
        b.wait("1s");
        b.receive("Ex", "hey");
        b.wait("2s");
        b.receive("Ex", "you up?");
        b.wait("3s");
      });

      d.beat("engage", (b) => {
        b.send("what do you want");
        b.wait("2s");

        b.typing("Ex").for("2s");
        b.receive("Ex", "I've been thinking about us");
        b.wait("3s");

        b.send("there is no us anymore");
        b.wait("2s");
      });

      d.beat("reveal", (b) => {
        b.typing("Ex").for("3s");
        b.receive("Ex", "I made a mistake leaving you");
        b.wait("4s");

        b.typing("Ex").for("2s");
        b.receive("Ex", "I'm still in love with you");
        b.wait("5s");
      });

      d.beat("response", (b) => {
        b.typing("Me").for("1s");
        b.wait("1s");
        b.typing("Me").for("1.5s");
        b.send("I've moved on");
        b.wait("2s");
        const lastMsg = b.send("You should too");
        b.wait("1s");
        b.read(lastMsg);
        b.wait("3s");
      });
    });
  },
);

export { aiGeneratedTestEpisode as default };
