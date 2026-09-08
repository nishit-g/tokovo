import {
  createCameraProgramManifest,
  diffCameraPrograms,
  explainCameraProgramFrame,
} from "@tokovo/camera";
import {
  getEpisodeRenderData,
  type EpisodeRenderData,
} from "./render-data.js";
import { getSharedVideoRunnerRuntime } from "./runtime.js";

function requirePreparedPrograms(renderData: EpisodeRenderData) {
  const cinematics = renderData.prepared.cinematics;
  if (!cinematics) {
    throw new Error(
      `Episode "${renderData.episodeId}" has no prepared cinematics.`,
    );
  }
  return cinematics;
}

async function requirePrograms(episodeId: string) {
  return requirePreparedPrograms(await getEpisodeRenderData(episodeId));
}

export function getRenderDataCameraProgramManifests(
  renderData: EpisodeRenderData,
) {
  const cinematics = requirePreparedPrograms(renderData);
  return {
    episodeId: renderData.episodeId,
    storySignature: cinematics.storySignature,
    stageSignature: cinematics.stageProgram.signature,
    defaultCameraPlanId: cinematics.defaultCameraPlanId,
    programs: cinematics.cameraPrograms.map(createCameraProgramManifest),
  };
}

export async function getEpisodeCameraProgramManifests(episodeId: string) {
  return getRenderDataCameraProgramManifests(
    await getEpisodeRenderData(episodeId),
  );
}

export function getRenderDataCameraArtifact(input: {
  renderData: EpisodeRenderData;
  cameraPlanId?: string;
}) {
  const cinematics = requirePreparedPrograms(input.renderData);
  const cameraPlanId = input.cameraPlanId ?? cinematics.defaultCameraPlanId;
  const program = cinematics.cameraPrograms.find(
    (candidate) => candidate.plan.id === cameraPlanId,
  );
  if (!program) {
    throw new Error(
      `CameraPlan "${cameraPlanId}" is not prepared for episode "${input.renderData.episodeId}".`,
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

export async function getEpisodeCameraArtifact(input: {
  episodeId: string;
  cameraPlanId?: string;
}) {
  return getRenderDataCameraArtifact({
    renderData: await getEpisodeRenderData(input.episodeId),
    cameraPlanId: input.cameraPlanId,
  });
}

export function explainRenderDataCameraFrame(input: {
  renderData: EpisodeRenderData;
  cameraPlanId?: string;
  outputId?: string;
  frame: number;
}) {
  const cinematics = requirePreparedPrograms(input.renderData);
  const cameraPlanId = input.cameraPlanId ?? cinematics.defaultCameraPlanId;
  const program = cinematics.cameraPrograms.find(
    (candidate) => candidate.plan.id === cameraPlanId,
  );
  if (!program) {
    throw new Error(
      `CameraPlan "${cameraPlanId}" is not prepared for episode "${input.renderData.episodeId}".`,
    );
  }
  const outputId = input.outputId ?? program.plan.outputs[0]?.id;
  if (!outputId)
    throw new Error(`CameraPlan "${cameraPlanId}" has no outputs.`);
  return {
    episodeId: input.renderData.episodeId,
    ...explainCameraProgramFrame({
      program,
      outputId,
      frame: input.frame,
    }),
  };
}

export async function explainEpisodeCameraFrame(input: {
  episodeId: string;
  cameraPlanId?: string;
  outputId?: string;
  frame: number;
}) {
  return explainRenderDataCameraFrame({
    renderData: await getEpisodeRenderData(input.episodeId),
    cameraPlanId: input.cameraPlanId,
    outputId: input.outputId,
    frame: input.frame,
  });
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
