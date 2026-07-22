import React from "react";
import { useXExperience } from "../../experience/context.js";
import { requireUser, requireXState } from "../../runtime/selectors.js";
import { Avatar } from "../primitives/Avatar.js";
import { IconButton } from "../primitives/Chrome.js";
import { XIcon } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";

export const ComposeScreen: React.FC<XScreenProps> = ({ world, deviceId }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  if (!state.currentUserId) throw new Error("X_CURRENT_USER_REQUIRED: compose screen requires currentUserId");
  const user = requireUser(state, state.currentUserId, "compose.currentUserId");
  const draft = state.composer.draft;
  const remaining = 280 - Array.from(draft).length;
  const canPost = Boolean(draft.trim()) && remaining >= 0 && state.composer.status !== "sending";

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", background: experience.colors.background }}>
      <header style={{ height: 58, minHeight: 58, paddingInline: 8, display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center" }}>
        <IconButton icon="close" label={experience.t("cancel")} size={22} />
        <span style={{ color: experience.colors.accent, fontSize: 13, fontWeight: 650 }}>{experience.t("draft")}</span>
        <div style={{ marginInlineEnd: 8, padding: "8px 18px", borderRadius: 22, background: canPost ? experience.colors.accent : experience.colors.textTertiary, color: "#fff", fontSize: 14, fontWeight: 750, opacity: draft.trim() ? 1 : .62 }}>
          {state.composer.status === "sending" ? experience.t("posting") : experience.t("post")}
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: `${experience.metrics.avatar}px minmax(0,1fr)`, gap: 12, padding: "10px 16px 0" }}>
        <Avatar user={user} size={experience.metrics.avatar} />
        <div
          data-x-anchor="x.composer.editor"
          role="textbox"
          aria-label={experience.t("composePlaceholder")}
          style={{
            minWidth: 0,
            paddingTop: 3,
            fontSize: 20 * experience.type.scale,
            lineHeight: 1.32,
            letterSpacing: "-.012em",
            whiteSpace: "pre-wrap",
            unicodeBidi: "plaintext",
            color: draft ? experience.colors.text : experience.colors.textSecondary,
          }}
        >
          {draft || experience.t("composePlaceholder")}
          {draft && state.composer.status === "idle" ? <span aria-hidden style={{ display: "inline-block", width: 2, height: "1.04em", marginInlineStart: 1, verticalAlign: "-.12em", background: experience.colors.accent }} /> : null}
        </div>
      </div>

      <div style={{ marginInline: 16, padding: "10px 0", display: "flex", alignItems: "center", gap: 7, color: experience.colors.accent, borderBottom: `1px solid ${experience.colors.border}`, fontSize: 13, fontWeight: 650 }}>
        <XIcon name="globe" size={16} /> {experience.t("everyoneCanReply")}
      </div>
      {state.composer.status === "failed" ? (
        <div role="alert" style={{ margin: "0 16px 6px", color: experience.colors.danger, fontSize: 12, fontWeight: 650 }}>
          {state.composer.error ?? experience.t("failed")}
        </div>
      ) : null}
      <div data-x-anchor="x.composer.actions" style={{ height: 54, minHeight: 54, paddingInline: 10, display: "flex", alignItems: "center", gap: 1, color: experience.colors.accent }}>
        <IconButton icon="image" label="Add media" size={20} />
        <IconButton icon="video" label="Add video" size={20} />
        <IconButton icon="location" label="Add location" size={20} />
        <IconButton icon="smile" label="Add emoji" size={20} />
        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {draft ? (
            <span style={{ color: remaining < 0 ? experience.colors.danger : remaining < 20 ? experience.colors.textSecondary : "transparent", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{remaining}</span>
          ) : null}
          <span style={{ width: 27, height: 27, display: "grid", placeItems: "center", borderRadius: "50%", border: `1px solid ${experience.colors.borderStrong}` }}><XIcon name="plus" size={16} /></span>
        </div>
      </div>
    </div>
  );
};
