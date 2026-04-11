import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { rendersRoot, repoRoot } from './constants';
function sanitizeSegment(value) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}
export async function createRenderArtifactPaths(input) {
    const storagePrefix = path.posix.join(sanitizeSegment(input.episodeId), `${sanitizeSegment(input.jobId)}-${sanitizeSegment(input.profile)}`);
    const rootDir = path.join(rendersRoot, sanitizeSegment(input.episodeId), `${sanitizeSegment(input.jobId)}-${sanitizeSegment(input.profile)}`);
    await fsp.mkdir(rootDir, { recursive: true });
    const videoPath = path.join(rootDir, 'video.mp4');
    const posterPath = path.join(rootDir, 'poster.png');
    const metadataPath = path.join(rootDir, 'metadata.json');
    const logsPath = path.join(rootDir, 'logs.ndjson');
    return {
        storagePrefix,
        rootDir,
        videoPath,
        posterPath,
        metadataPath,
        logsPath,
        relativeVideoPath: path.relative(repoRoot, videoPath),
        relativePosterPath: path.relative(repoRoot, posterPath),
        relativeMetadataPath: path.relative(repoRoot, metadataPath),
        relativeLogsPath: path.relative(repoRoot, logsPath),
    };
}
export async function writeRenderMetadata(filePath, metadata) {
    await fsp.writeFile(filePath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}
export async function findLatestRenderArtifact(episodeId) {
    const episodeDir = path.join(rendersRoot, sanitizeSegment(episodeId));
    const entries = await fsp.readdir(episodeDir, { withFileTypes: true }).catch(() => []);
    const manifests = await Promise.all(entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
        const metadataPath = path.join(episodeDir, entry.name, 'metadata.json');
        const raw = await fsp.readFile(metadataPath, 'utf8').catch(() => null);
        if (!raw)
            return null;
        const metadata = JSON.parse(raw);
        metadata.artifact.videoPath = resolveArtifactPath(metadata.artifact.videoPath, metadata.artifact.videoUrl);
        metadata.artifact.posterPath = resolveArtifactPath(metadata.artifact.posterPath, metadata.artifact.posterUrl);
        metadata.artifact.metadataPath = resolveArtifactPath(metadata.artifact.metadataPath, metadata.artifact.metadataUrl);
        metadata.artifact.logsPath = resolveArtifactPath(metadata.artifact.logsPath, metadata.artifact.logsUrl);
        const stat = await fsp.stat(metadataPath);
        return { metadata, mtimeMs: stat.mtimeMs };
    }));
    const candidates = manifests.filter((entry) => Boolean(entry));
    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return candidates[0]?.metadata ?? null;
}
function resolveArtifactPath(filePath, preferredUrl) {
    if (preferredUrl)
        return preferredUrl;
    if (!filePath)
        return filePath;
    if (/^(?:https?:\/\/|r2:\/\/)/.test(filePath))
        return filePath;
    if (path.isAbsolute(filePath)) {
        if (fs.existsSync(filePath))
            return filePath;
        const outIndex = filePath.lastIndexOf(`${path.sep}out${path.sep}`);
        if (outIndex >= 0) {
            return path.join(repoRoot, filePath.slice(outIndex + 1));
        }
        return filePath;
    }
    const repoRelative = path.join(repoRoot, filePath);
    return repoRelative;
}
