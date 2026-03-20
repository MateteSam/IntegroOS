// ============================================================
// Video Engine — Animator (RAF-based frame loop)
// ============================================================
import type { Layer, RenderState, LayerKeyframes } from './types';
import { getKeyframeValue } from './easing';

type OnFrameCallback = (layers: Layer[], time: number) => void;
type OnStateChange = (state: Partial<RenderState>) => void;

export class Animator {
    private rafId: number | null = null;
    private startTimestamp: number | null = null;
    private pausedAt = 0;
    private duration = 0;
    private layers: Layer[] = [];
    private onFrame: OnFrameCallback;
    private onStateChange: OnStateChange;
    public currentTime = 0;
    public isPlaying = false;

    constructor(onFrame: OnFrameCallback, onStateChange: OnStateChange) {
        this.onFrame = onFrame;
        this.onStateChange = onStateChange;
    }

    load(layers: Layer[], duration: number) {
        this.layers = layers.map(l => ({ ...l }));
        this.duration = duration;
        this.currentTime = 0;
        this.pausedAt = 0;
        this.tick(0);
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.startTimestamp = null;
        this.onStateChange({ isPlaying: true });
        this.rafId = requestAnimationFrame(this.loop);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.pausedAt = this.currentTime;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.onStateChange({ isPlaying: false });
    }

    seek(time: number) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.pausedAt = this.currentTime;
        if (!this.isPlaying) this.tick(this.currentTime);
        this.onStateChange({ currentTime: this.currentTime });
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    private loop = (timestamp: number) => {
        if (!this.startTimestamp) this.startTimestamp = timestamp - this.pausedAt * 1000;
        const elapsed = (timestamp - this.startTimestamp) / 1000;

        if (elapsed >= this.duration) {
            // Loop back
            this.startTimestamp = timestamp;
            this.currentTime = 0;
        } else {
            this.currentTime = elapsed;
        }

        this.onStateChange({ currentTime: this.currentTime });
        this.tick(this.currentTime);

        if (this.isPlaying) {
            this.rafId = requestAnimationFrame(this.loop);
        }
    };

    private tick(time: number) {
        const animated = this.layers.map(layer => {
            if (!layer.visible) return layer;
            if (time < layer.startTime || time > layer.endTime) {
                return { ...layer, opacity: 0 };
            }
            const props = resolveKeyframes(layer, time);
            return { ...layer, ...props };
        });
        this.onFrame(animated, time);
    }
}

function resolveKeyframes(layer: Layer, time: number): Partial<Layer> {
    const kf = layer.keyframes as LayerKeyframes;
    const resolved: Partial<Layer> = {};

    if (kf.x?.length) resolved.x = getKeyframeValue(kf.x as any, time, layer.x);
    if (kf.y?.length) resolved.y = getKeyframeValue(kf.y as any, time, layer.y);
    if (kf.opacity?.length) resolved.opacity = getKeyframeValue(kf.opacity as any, time, layer.opacity);
    if (kf.scaleX?.length) resolved.scaleX = getKeyframeValue(kf.scaleX as any, time, layer.scaleX);
    if (kf.scaleY?.length) resolved.scaleY = getKeyframeValue(kf.scaleY as any, time, layer.scaleY);
    if (kf.rotation?.length) resolved.rotation = getKeyframeValue(kf.rotation as any, time, layer.rotation);

    return resolved;
}
