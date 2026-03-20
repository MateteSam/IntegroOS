// ============================================================
// Video Engine — Easing Functions
// ============================================================
import type { EasingType } from './types';

export function interpolate(
    from: number,
    to: number,
    t: number, // 0..1 normalized progress
    easing: EasingType = 'linear'
): number {
    const e = applyEasing(t, easing);
    return from + (to - from) * e;
}

export function applyEasing(t: number, easing: EasingType): number {
    t = Math.max(0, Math.min(1, t));
    switch (easing) {
        case 'linear': return t;
        case 'easeIn': return t * t * t;
        case 'easeOut': return 1 - Math.pow(1 - t, 3);
        case 'easeInOut': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        case 'spring': return springEasing(t);
        case 'bounce': return bounceEasing(t);
        case 'elastic': return elasticEasing(t);
        default: return t;
    }
}

function springEasing(t: number): number {
    const c4 = (2 * Math.PI) / 4.5;
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function bounceEasing(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
    if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
    t -= 2.625 / d1;
    return n1 * t * t + 0.984375;
}

function elasticEasing(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
}

/** Get the animated value at time `currentTime` from a keyframe array */
export function getKeyframeValue(
    keyframes: { time: number; value: number; easing: EasingType }[],
    currentTime: number,
    defaultValue: number
): number {
    if (!keyframes || keyframes.length === 0) return defaultValue;

    // Before first keyframe
    if (currentTime <= keyframes[0].time) return keyframes[0].value as number;
    // After last keyframe
    if (currentTime >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value as number;

    // Find the surrounding pair
    for (let i = 0; i < keyframes.length - 1; i++) {
        const kA = keyframes[i];
        const kB = keyframes[i + 1];
        if (currentTime >= kA.time && currentTime <= kB.time) {
            const t = (currentTime - kA.time) / (kB.time - kA.time);
            return interpolate(kA.value as number, kB.value as number, t, kA.easing);
        }
    }

    return defaultValue;
}
