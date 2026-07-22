import {
  createCameraProgramManifest,
  diffCameraPrograms,
  explainCameraProgramFrame,
} from "@tokovo/camera";
import { getEpisodeRenderData } from "./render-data.js";
import { getSharedVideoRunnerRuntime } from "./runtime.js";

async function requirePrograms(episodeId: string) {
  const renderData = await getEpisodeRenderData(episodeId);
  const cinematics = renderData.prepared.cinematics;
  if (!cinematics) {
    throw new Error(`Episode "${episodeId}" has no prepared cinematics.`);
  }
  return cinematics;
}

export async function getEpisodeCameraProgramManifests(episodeId: string) {
  const cinematics = await requirePrograms(episodeId);
  return {
    episodeId,
    storySignature: cinematics.storySignature,
    stageSignature: cinematics.stageProgram.signature,
    defaultCameraPlanId: cinematics.defaultCameraPlanId,
    programs: cinematics.cameraPrograms.map(createCameraProgramManifest),
  };
}

export async function getEpisodeCameraArtifact(input: {
  episodeId: string;
  cameraPlanId?: string;
}) {
  const cinematics = await requirePrograms(input.episodeId);
  const cameraPlanId = input.cameraPlanId ?? cinematics.defaultCameraPlanId;
  const program = cinematics.cameraPrograms.find(
    (candidate) => candidate.plan.id === cameraPlanId,
  );
  if (!program) {
    throw new Error(
      `CameraPlan "${cameraPlanId}" is not prepared for episode "${input.episodeId}".`,
    );
  }
  return {
    version: 1 as const,
    storySignature: cinematics.storySignature,
    stageSignature: cinematics.stageProgram.signature,
    selectedCameraPlanId: cameraPlanId,
    program: createCameraProgramManifest(program),
    plan: program.plan,
  };
}

export async function explainEpisodeCameraFrame(input: {
  episodeId: string;
  cameraPlanId?: string;
  outputId?: string;
  frame: number;
}) {
  const cinematics = await requirePrograms(input.episodeId);
  const cameraPlanId = input.cameraPlanId ?? cinematics.defaultCameraPlanId;
  const program = cinematics.cameraPrograms.find(
    (candidate) => candidate.plan.id === cameraPlanId,
  );
  if (!program) {
    throw new Error(
      `CameraPlan "${cameraPlanId}" is not prepared for episode "${input.episodeId}".`,
    );
  }
  const outputId = input.outputId ?? program.plan.outputs[0]?.id;
  if (!outputId)
    throw new Error(`CameraPlan "${cameraPlanId}" has no outputs.`);
  return {
    episodeId: input.episodeId,
    ...explainCameraProgramFrame({
      program,
      outputId,
      frame: input.frame,
    }),
  };
}

export async function diffEpisodeCameraPlans(input: {
  episodeId: string;
  leftCameraPlanId: string;
  rightCameraPlanId: string;
}) {
  const cinematics = await requirePrograms(input.episodeId);
  const get = (id: string) => {
    const program = cinematics.cameraPrograms.find(
      (candidate) => candidate.plan.id === id,
    );
    if (!program) {
      throw new Error(
        `CameraPlan "${id}" is not prepared for episode "${input.episodeId}".`,
      );
    }
    return program;
  };
  return {
    episodeId: input.episodeId,
    leftCameraPlanId: input.leftCameraPlanId,
    rightCameraPlanId: input.rightCameraPlanId,
    ...diffCameraPrograms(
      get(input.leftCameraPlanId),
      get(input.rightCameraPlanId),
    ),
  };
}

export function getRegisteredCinematicSubjectSchemas() {
  const registry =
    getSharedVideoRunnerRuntime().tokovoRegistries.plugins.cinematicSubjects;
  return registry.list().map((ownerId) => {
    const provider = registry.get(ownerId);
    if (!provider) {
      throw new Error(`Cinematic subject provider "${ownerId}" disappeared.`);
    }
    return provider.schema;
  });
}
