import os from 'node:os';
import { getRenderMaxConcurrency } from './env';
function clampConcurrency(requested) {
    const envCap = getRenderMaxConcurrency();
    const cpuCap = Math.max(1, os.cpus().length);
    const maxAllowed = envCap ? Math.min(envCap, cpuCap) : cpuCap;
    return Math.max(1, Math.min(requested, maxAllowed));
}
export const RENDER_PROFILES = {
    'fast-preview': {
        id: 'fast-preview',
        label: 'Fast Preview',
        codec: 'h264',
        imageFormat: 'jpeg',
        audioCodec: 'aac',
        videoBitrate: '8M',
        x264Preset: 'veryfast',
        jpegQuality: 80,
        hardwareAcceleration: 'if-possible',
        chromiumGl: 'angle',
        timeoutInMilliseconds: 300000,
        concurrency: clampConcurrency(2),
        artifactSuffix: 'preview',
    },
    review: {
        id: 'review',
        label: 'Review',
        codec: 'h264',
        imageFormat: 'jpeg',
        audioCodec: 'aac',
        videoBitrate: '12M',
        x264Preset: 'medium',
        jpegQuality: 90,
        hardwareAcceleration: 'if-possible',
        chromiumGl: 'angle',
        timeoutInMilliseconds: 360000,
        concurrency: clampConcurrency(3),
        artifactSuffix: 'review',
    },
    release: {
        id: 'release',
        label: 'Release',
        codec: 'h264',
        imageFormat: 'png',
        audioCodec: 'aac',
        videoBitrate: '18M',
        x264Preset: 'slow',
        hardwareAcceleration: 'if-possible',
        chromiumGl: 'angle',
        timeoutInMilliseconds: 600000,
        concurrency: clampConcurrency(4),
        artifactSuffix: 'release',
    },
};
export function getRenderProfile(profileId) {
    return RENDER_PROFILES[profileId];
}
