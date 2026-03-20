import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Compositor } from '@/lib/videoEngine/compositor';
import { Animator } from '@/lib/videoEngine/animator';
import type { Layer } from '@/lib/videoEngine/types';

interface VideoCanvasProps {
    layers: Layer[];
    duration: number;
    width: number;
    height: number;
    onTimeUpdate?: (t: number) => void;
    onReady?: (animator: Animator, canvas: HTMLCanvasElement) => void;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({
    layers, duration, width, height, onTimeUpdate, onReady
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const compositorRef = useRef<Compositor | null>(null);
    const animatorRef = useRef<Animator | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const compositor = new Compositor(canvas);
        compositorRef.current = compositor;

        const animator = new Animator(
            (animatedLayers, time) => {
                compositor.render(animatedLayers, time);
                onTimeUpdate?.(time);
            },
            () => { }
        );
        animatorRef.current = animator;
        animator.load(layers, duration);
        onReady?.(animator, canvas);

        return () => animator.destroy();
    }, []);

    // Reload when layers/duration change
    useEffect(() => {
        if (!animatorRef.current) return;
        const wasPlaying = animatorRef.current.isPlaying;
        animatorRef.current.load(layers, duration);
        if (wasPlaying) animatorRef.current.play();
    }, [layers, duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'auto',
            }}
        />
    );
};

export default VideoCanvas;
