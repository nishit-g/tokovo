import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ensureBrowser } from '@remotion/renderer';
import { createRenderServiceError } from './errors';
import { outputRoot } from './constants';
import { getBrowserExecutable, getR2Config, getR2ConfigValidationError } from './env';
function commandExists(command, args = ['-version']) {
    const result = spawnSync(command, args, { stdio: 'ignore' });
    return result.status === 0;
}
async function canWriteOutputDirectory() {
    const testDir = path.join(outputRoot, '.doctor');
    await fs.mkdir(testDir, { recursive: true });
    const testFile = path.join(testDir, 'write-test.txt');
    await fs.writeFile(testFile, 'ok', 'utf8');
    await fs.unlink(testFile);
    return true;
}
export async function runRenderDoctor() {
    const checks = [];
    const nodeMajor = Number(process.versions.node.split('.')[0] ?? '0');
    checks.push({
        id: 'node',
        ok: nodeMajor >= 20,
        message: `Node ${process.versions.node} detected (${nodeMajor >= 20 ? 'supported' : 'unsupported'})`,
    });
    checks.push({
        id: 'ffmpeg',
        ok: commandExists('ffmpeg'),
        message: commandExists('ffmpeg') ? 'ffmpeg available' : 'ffmpeg missing from PATH',
    });
    checks.push({
        id: 'ffprobe',
        ok: commandExists('ffprobe'),
        message: commandExists('ffprobe') ? 'ffprobe available' : 'ffprobe missing from PATH',
    });
    try {
        const browserStatus = await ensureBrowser({
            browserExecutable: getBrowserExecutable(),
            chromeMode: 'headless-shell',
            logLevel: 'error',
        });
        checks.push({
            id: 'browser',
            ok: browserStatus.type !== 'no-browser',
            message: `Browser ready: ${browserStatus.type === 'no-browser' ? 'not available' : browserStatus.path}`,
        });
    }
    catch (error) {
        checks.push({
            id: 'browser',
            ok: false,
            message: error instanceof Error ? error.message : 'Browser check failed',
        });
    }
    try {
        await canWriteOutputDirectory();
        checks.push({
            id: 'output-dir',
            ok: true,
            message: `Output directory writable (${outputRoot})`,
        });
    }
    catch (error) {
        checks.push({
            id: 'output-dir',
            ok: false,
            message: error instanceof Error ? error.message : 'Output directory not writable',
        });
    }
    const r2ConfigValidationError = getR2ConfigValidationError();
    if (r2ConfigValidationError) {
        checks.push({
            id: 'artifact-storage',
            ok: false,
            message: r2ConfigValidationError,
        });
    }
    else {
        const r2Config = getR2Config();
        checks.push({
            id: 'artifact-storage',
            ok: true,
            message: r2Config
                ? `Artifact storage configured for R2 (${r2Config.bucket})`
                : 'Artifact storage using local filesystem',
        });
    }
    return {
        ok: checks.every((check) => check.ok),
        checks,
    };
}
export async function assertRenderPreflight() {
    const result = await runRenderDoctor();
    if (!result.ok) {
        const failedChecks = result.checks.filter((check) => !check.ok);
        const message = result.checks
            .filter((check) => !check.ok)
            .map((check) => `${check.id}: ${check.message}`)
            .join('\n');
        throw createRenderServiceError({
            code: 'RENDER_PREFLIGHT_FAILED',
            stage: 'preflight',
            message: `Render preflight failed\n${message}`,
            details: {
                failedChecks: failedChecks.map((check) => ({
                    id: check.id,
                    message: check.message,
                })),
            },
        });
    }
}
