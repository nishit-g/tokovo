import { createLayoutCinematicSubjectProvider } from "@tokovo/core";
import { TYPEWRITER_APP_ID } from "../constants.js";

const SUBJECT_IDS = [
  "desk",
  "paper",
  "page_1",
  "page_2",
  "page_3",
  "textArea",
  "cursor",
  "typewriter",
  "signature",
] as const;

export const TypewriterCinematicSubjects = createLayoutCinematicSubjectProvider(
  {
    ownerId: TYPEWRITER_APP_ID,
    semanticSubjectIds: SUBJECT_IDS,
  },
);
