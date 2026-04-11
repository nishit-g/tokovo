import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Config } from './env';
let cachedClient = null;
let cachedClientSignature = '';
const presignedGetUrlCache = new Map();
function withTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}
function getClient(config) {
    const signature = [
        config.endpoint,
        config.region,
        config.accessKeyId,
        config.bucket,
    ].join('|');
    if (cachedClient && cachedClientSignature === signature) {
        return cachedClient;
    }
    cachedClientSignature = signature;
    cachedClient = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });
    return cachedClient;
}
function createTarget(bucket, publicBaseUrl, objectKey) {
    return {
        objectKey,
        locator: `r2://${bucket}/${objectKey}`,
        publicUrl: publicBaseUrl
            ? new URL(objectKey, withTrailingSlash(publicBaseUrl)).toString()
            : null,
    };
}
export function createR2ArtifactUploadTargets(storagePrefix) {
    const config = getR2Config();
    if (!config)
        return null;
    const keyPrefix = config.keyPrefix
        ? path.posix.join(config.keyPrefix, storagePrefix)
        : storagePrefix;
    return {
        bucket: config.bucket,
        keyPrefix,
        video: createTarget(config.bucket, config.publicBaseUrl, path.posix.join(keyPrefix, 'video.mp4')),
        poster: createTarget(config.bucket, config.publicBaseUrl, path.posix.join(keyPrefix, 'poster.png')),
        metadata: createTarget(config.bucket, config.publicBaseUrl, path.posix.join(keyPrefix, 'metadata.json')),
        logs: createTarget(config.bucket, config.publicBaseUrl, path.posix.join(keyPrefix, 'logs.ndjson')),
    };
}
function parseR2Locator(locator) {
    if (!locator.startsWith('r2://'))
        return null;
    const remainder = locator.slice('r2://'.length);
    const slashIndex = remainder.indexOf('/');
    if (slashIndex <= 0)
        return null;
    return {
        bucket: remainder.slice(0, slashIndex),
        key: remainder.slice(slashIndex + 1),
    };
}
async function presignGetObject(locator, expiresInSeconds) {
    const parsed = parseR2Locator(locator);
    const config = getR2Config();
    if (!parsed || !config)
        return null;
    const cacheKey = `${locator}|${expiresInSeconds}`;
    const cached = presignedGetUrlCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAtMs - now > 60_000) {
        return cached.url;
    }
    const client = getClient(config);
    const url = await getSignedUrl(client, new GetObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
    }), { expiresIn: expiresInSeconds });
    presignedGetUrlCache.set(cacheKey, {
        url,
        expiresAtMs: now + expiresInSeconds * 1000,
    });
    return url;
}
export async function createPresignedArtifactUrls(artifact, expiresInSeconds = 3600) {
    return {
        videoUrl: await presignGetObject(artifact.videoPath, expiresInSeconds),
        posterUrl: await presignGetObject(artifact.posterPath, expiresInSeconds),
        metadataUrl: await presignGetObject(artifact.metadataPath, expiresInSeconds),
        logsUrl: await presignGetObject(artifact.logsPath, expiresInSeconds),
        expiresInSeconds,
    };
}
export async function createPresignedAssetUrlMap(assetSources, expiresInSeconds = 3600) {
    const uniqueSources = [...new Set(assetSources)].filter((src) => src.startsWith('r2://'));
    const entries = await Promise.all(uniqueSources.map(async (src) => {
        const url = await presignGetObject(src, expiresInSeconds);
        return url ? [src, url] : null;
    }));
    return Object.fromEntries(entries.filter((entry) => entry !== null));
}
async function uploadFile(config, input) {
    const client = getClient(config);
    await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: input.objectKey,
        Body: fs.createReadStream(input.filePath),
        ContentType: input.contentType,
    }));
}
export async function uploadRenderArtifactsToR2(input) {
    const config = getR2Config();
    if (!config) {
        throw new Error('R2 upload requested without a valid R2 configuration');
    }
    await uploadFile(config, {
        filePath: input.videoFilePath,
        objectKey: input.targets.video.objectKey,
        contentType: 'video/mp4',
    });
    await uploadFile(config, {
        filePath: input.posterFilePath,
        objectKey: input.targets.poster.objectKey,
        contentType: 'image/png',
    });
    await uploadFile(config, {
        filePath: input.logsFilePath,
        objectKey: input.targets.logs.objectKey,
        contentType: 'application/x-ndjson',
    });
    await uploadFile(config, {
        filePath: input.metadataFilePath,
        objectKey: input.targets.metadata.objectKey,
        contentType: 'application/json',
    });
}
