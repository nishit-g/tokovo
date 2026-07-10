import { describe, expect, it } from "vitest";
import { actor, cast, episode } from "./code-first-episode.js";

function buildCanonicalAppTracks() {
  return episode("canonical-app-tracks", { fps: 24, duration: "3s" })
    .instagram("phone", (instagram) => {
      instagram.at("1s").navigate("home");
    })
    .linkedin("phone", (linkedin) => {
      linkedin.at("1s").navigate("feed");
    })
    .typewriter("desk", (typewriter) => {
      typewriter.at("1s").key("T");
    })
    .build();
}

describe("canonical code-first app tracks", () => {
  it("hides app factories and inherits the episode fps", () => {
    const ir = buildCanonicalAppTracks();

    expect(ir.events.map((event) => event.appId)).toEqual([
      "app_instagram",
      "app_linkedin",
      "app_typewriter",
    ]);
    expect(ir.events.map((event) => event.at)).toEqual([24, 24, 24]);
  });

  it("allocates declaration order per episode build", () => {
    expect(buildCanonicalAppTracks()).toEqual(buildCanonicalAppTracks());
  });

  it("authors scene-local time, reusable cast identities, handles, and camera intent", () => {
    const people = cast({
      me: actor("me", {
        name: "Me",
        identities: { x: { id: "x_me", handle: "me" } },
      }),
      riya: actor("riya", {
        name: "Riya",
        identities: {
          whatsapp: { name: "Riya G." },
          x: { id: "x_riya", handle: "riya" },
        },
      }),
    });

    const ir = episode("scene-language", { fps: 30, duration: "12s" })
      .scene("reveal", { at: "2s", duration: "5s" }, (scene) => {
        scene.conversation(
          {
            app: "whatsapp",
            deviceId: "phone",
            conversationId: "dm_riya",
            currentActor: people.me,
          },
          (chat) => {
            chat.open().wait("1s");
            const reveal = chat.receive(
              people.riya,
              "You should probably see this.",
              {
                hold: "1.5s",
              },
            );
            chat.reply("That explains everything.", reveal, { typed: true });
            scene.focus(reveal, { scale: 1.08 });
          },
        );
      })
      .scene("reaction", { at: "8s", duration: "3s" }, (scene) => {
        scene.social(
          { app: "x", deviceId: "phone", currentActor: people.me },
          (social) => {
            const post = social.post("A normal day online.", {
              id: "post_reaction",
            });
            social.wait("1s").comment(post, people.riya, "Define normal.");
            scene.follow(post, "1.5s", { scale: 1.1 });
          },
        );
      })
      .build();

    expect(people.riya.identity("whatsapp")).toMatchObject({
      id: "riya",
      name: "Riya G.",
    });
    expect(
      ir.events
        .filter((event) => event.kind === "APP")
        .map((event) => event.at),
    ).toEqual([60, 60, 90, 135, 240, 270]);
    expect(
      ir.events.some(
        (event) =>
          event.kind === "CAMERA" &&
          event.type === "FOCUS" &&
          event.payload.anchorId === "lastMessage",
      ),
    ).toBe(true);
    expect(ir.sections).toEqual([
      { id: "reveal", startFrame: 60, endFrame: 210 },
      { id: "reaction", startFrame: 240, endFrame: 330 },
    ]);
  });

  it("turns director intent into camera events without an explicit plugin", () => {
    const ir = episode("automatic-director", { fps: 24, duration: "4s" })
      .whatsapp("phone", "dm", (whatsapp) => {
        whatsapp.at("1s").receive("Riya", "Camera, take this one.");
      })
      .director("Cinematic")
      .build();

    expect(
      ir.events.some(
        (event) =>
          event.kind === "CAMERA" && event.payload.anchorId === "lastMessage",
      ),
    ).toBe(true);
  });

  it("keeps conversation verbs consistent across every messaging surface", () => {
    const me = actor("me", { name: "Me" });
    const riya = actor("riya", { name: "Riya" });
    const builder = episode("conversation-surfaces", {
      fps: 30,
      duration: "3s",
    });

    builder.scene("all chats", { at: "0s", duration: "2s" }, (scene) => {
      scene.conversation(
        {
          app: "whatsapp",
          deviceId: "phone",
          conversationId: "wa",
          currentActor: me,
        },
        (chat) => {
          chat.send("sent");
          chat.receive(riya, "received");
        },
      );
      scene.conversation(
        {
          app: "imessage",
          deviceId: "phone",
          conversationId: "im",
          currentActor: me,
        },
        (chat) => {
          chat.send("sent");
          chat.receive(riya, "received");
        },
      );
      scene.conversation(
        {
          app: "snapchat",
          deviceId: "phone",
          conversationId: "sc",
          currentActor: me,
        },
        (chat) => {
          chat.send("sent");
          chat.receive(riya, "received");
        },
      );
      scene.conversation(
        {
          app: "teams",
          deviceId: "phone",
          conversationId: "teams",
          currentActor: me,
        },
        (chat) => {
          chat.send("sent");
          chat.receive(riya, "received");
        },
      );
      for (const app of ["instagram", "linkedin", "x"] as const) {
        scene.conversation(
          {
            app,
            deviceId: "phone",
            conversationId: `${app}-dm`,
            currentActor: me,
          },
          (chat) => {
            chat.send("sent");
            chat.receive(riya, "received");
          },
        );
      }
    });

    const appIds = new Set(
      builder
        .build()
        .events.filter((event) => event.kind === "APP")
        .map((event) => event.appId),
    );
    expect(appIds).toEqual(
      new Set([
        "app_whatsapp",
        "app_imessage",
        "app_snapchat",
        "app_teams",
        "app_instagram",
        "app_linkedin",
        "app_x",
      ]),
    );
  });

  it("keeps social verbs consistent across Instagram, LinkedIn, and X", () => {
    const me = actor("me", { name: "Me" });
    const riya = actor("riya", { name: "Riya" });
    const ir = episode("social-surfaces", { fps: 30, duration: "3s" })
      .scene("all feeds", { at: "0s", duration: "2s" }, (scene) => {
        for (const app of ["instagram", "linkedin", "x"] as const) {
          scene.social(
            { app, deviceId: "phone", currentActor: me },
            (social) => {
              const post = social.post(`post on ${app}`);
              social.comment(post, riya, `reply on ${app}`);
              social.open(post);
            },
          );
        }
      })
      .build();

    expect(
      new Set(
        ir.events
          .filter((event) => event.kind === "APP")
          .map((event) => event.appId),
      ),
    ).toEqual(new Set(["app_instagram", "app_linkedin", "app_x"]));
  });

  it("fails when relative timing escapes a declared scene", () => {
    expect(() =>
      episode("scene-bounds", { fps: 30, duration: "3s" }).scene(
        "short",
        { at: "0s", duration: "1s" },
        (scene) => scene.wait("1.1s"),
      ),
    ).toThrow(/exceeds its 30-frame duration/);
  });
});
