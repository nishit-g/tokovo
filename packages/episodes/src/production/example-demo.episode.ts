// example-demo.episode.ts
//
// IMPORTANT: This episode does NOT register the plugin.
// Plugin registration is handled by the app entry point (e.g., video-runner/Root.tsx)
// before any episodes run. Episodes only use DSL APIs.
//
import { createEpisode, beat } from "@tokovo/episodes";

export const exampleDemoEpisode = createEpisode({
  id: "example-demo",
  title: "Demo Notes Demo",

  script: () => {
    beat("intro", (b) => {
      b.use("app_demo")
        .createNote({ title: "Hello World", content: "This is my first note!" })
        .wait(1000);
    });

    beat("view", (b) => {
      b.use("app_demo")
        .viewNote("note-1")
        .wait(2000);
    });

    beat("edit", (b) => {
      b.use("app_demo")
        .editNote("note-1", { content: "Updated content!" })
        .wait(1000);
    });
  },
});
