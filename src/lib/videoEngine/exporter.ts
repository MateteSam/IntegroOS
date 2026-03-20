// ============================================================
// Video Engine — Robust Canvas-to-Video Exporter
// ============================================================

export type ExportFormat = 'webm' | 'mp4';

export interface ExportOptions {
    fps?: number;
    videoBitsPerSecond?: number;
    onProgress?: (p: number) => void;
}

/** Pick the best supported MIME type for the current browser */
function bestMimeType(): string {
    const candidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp8',
        'video/webm',
    ];
    for (const mime of candidates) {
        if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return 'video/webm';
}

/**
 * Records whatever is drawn on `canvas` for `duration` seconds.
 * The caller is responsible for driving the animation during this period.
 */
export async function exportCanvasToVideo(
    canvas: HTMLCanvasElement,
    duration: number,
    opts: ExportOptions = {}
): Promise<Blob> {
    const fps = opts.fps ?? 30;
    const bps = opts.videoBitsPerSecond ?? 8_000_000;
    const onProgress = opts.onProgress ?? (() => { });
    const mimeType = bestMimeType();

    if (typeof canvas.captureStream !== 'function') {
        throw new Error('Your browser does not support canvas.captureStream(). Please use Chrome or Edge.');
    }

    const stream = canvas.captureStream(fps);
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bps });
        } catch (e) {
            // Some browsers reject options — retry with just the type
            try {
                recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            } catch (e2) {
                reject(new Error('MediaRecorder not supported in this browser.'));
                return;
            }
        }

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onerror = (e: Event) => {
            reject(new Error('MediaRecorder error: ' + (e as any).error?.message));
        };

        recorder.onstop = () => {
            if (chunks.length === 0) {
                reject(new Error('Export produced an empty file. Try a shorter duration or restart the browser.'));
                return;
            }
            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            resolve(blob);
        };

        // Collect data every 500ms to ensure we get frames
        recorder.start(500);

        // Progress reporting
        const startMs = Date.now();
        const tick = () => {
            const elapsed = (Date.now() - startMs) / 1000;
            const p = Math.min(elapsed / duration, 0.99);
            onProgress(p);
            if (elapsed < duration) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        // Stop recording after the full duration + small buffer
        const stopTimer = setTimeout(() => {
            try {
                if (recorder.state !== 'inactive') recorder.stop();
            } catch (_) { /* already stopped */ }
            stream.getTracks().forEach(t => t.stop());
            onProgress(1);
        }, (duration + 0.5) * 1000);

        // Safety: if something goes wrong, don't hang forever
        const safetyTimer = setTimeout(() => {
            clearTimeout(stopTimer);
            try { if (recorder.state !== 'inactive') recorder.stop(); } catch (_) { }
            stream.getTracks().forEach(t => t.stop());
            reject(new Error('Export timed out. The animation may not have run during recording.'));
        }, (duration + 10) * 1000);

        recorder.onstop = () => {
            clearTimeout(safetyTimer);
            if (chunks.length === 0) {
                reject(new Error('Export produced an empty file — canvas may not be receiving draw calls during recording.'));
                return;
            }
            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            resolve(blob);
        };
    });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
