// ============================================================
// Video Engine — Core Types
// GPU-accelerated canvas-based motion graphics engine
// ============================================================

export type EasingType =
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'spring'
    | 'bounce'
    | 'elastic';

export type LayerType =
    | 'background'
    | 'text'
    | 'image'
    | 'shape'
    | 'particle'
    | 'video'
    | 'overlay';

export type BlendMode =
    | 'normal'
    | 'screen'
    | 'multiply'
    | 'overlay'
    | 'add';

export interface Keyframe {
    time: number; // seconds
    value: number | string | number[];
    easing: EasingType;
}

export interface AnimatableProps {
    x?: number;
    y?: number;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    skewX?: number;
    skewY?: number;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    blur?: number;
    glowRadius?: number;
    glowColor?: string;
    letterSpacing?: number;
}

export interface LayerKeyframes {
    x?: Keyframe[];
    y?: Keyframe[];
    opacity?: Keyframe[];
    scaleX?: Keyframe[];
    scaleY?: Keyframe[];
    rotation?: Keyframe[];
    fontSize?: Keyframe[];
    fill?: Keyframe[];
    blur?: Keyframe[];
    letterSpacing?: Keyframe[];
}

export interface TextLayerConfig {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: string;
    textAlign: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
    uppercase?: boolean;
    glowColor?: string;
    glowRadius?: number;
    stroke?: string;
    strokeWidth?: number;
    shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
}

export interface ShapeLayerConfig {
    shape: 'rect' | 'circle' | 'triangle' | 'line' | 'polygon';
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    width: number;
    height: number;
    rx?: number; // border radius
    opacity?: number;
}

export interface ParticleConfig {
    count: number;
    color: string | string[];
    size: number;
    speed: number;
    spread: number;
    lifetime: number;
    shape: 'circle' | 'star' | 'dot' | 'spark';
    gravity?: number;
    emitterX?: number;
    emitterY?: number;
}

export interface GradientConfig {
    type: 'linear' | 'radial' | 'animated';
    colors: string[];
    angle?: number;
    animationSpeed?: number; // for animated gradients
}

export interface BackgroundLayerConfig {
    type: 'solid' | 'gradient' | 'image' | 'video' | 'noise';
    fill?: string;
    gradient?: GradientConfig;
    imageUrl?: string;
    opacity?: number;
    blur?: number;
}

export interface VideoLayerConfig {
    src: string;
    volume?: number;
    loop?: boolean;
    startTime?: number;
}

export interface ImageLayerConfig {
    src: string;
    objectFit?: 'cover' | 'contain' | 'fill';
    filter?: string;
    borderRadius?: number;
}

export type LayerConfig =
    | TextLayerConfig
    | ShapeLayerConfig
    | ParticleConfig
    | BackgroundLayerConfig
    | VideoLayerConfig
    | ImageLayerConfig;

export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    config: LayerConfig;
    // Position & base transform
    x: number;
    y: number;
    width?: number;
    height?: number;
    opacity: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    // Timeline
    startTime: number; // seconds
    endTime: number;   // seconds
    // Animation
    keyframes: LayerKeyframes;
    blendMode?: BlendMode;
    // Flags
    visible: boolean;
    locked: boolean;
    selected?: boolean;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface CanvasConfig {
    width: number;
    height: number;
    fps: number;
    duration: number;
    backgroundColor: string;
}

export interface VideoProject {
    id: string;
    name: string;
    templateId: string;
    canvasConfig: CanvasConfig;
    layers: Layer[];
    audioTrack?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TemplateDefinition {
    id: string;
    name: string;
    category: 'corporate' | 'cinematic' | 'social' | 'trendy' | 'minimal' | 'celebration';
    description: string;
    aspectRatio: AspectRatio;
    duration: number;
    tags: string[];
    accent: string;
    thumbnailGradient: string[];
    thumbnailEmoji?: string;
    layers: Omit<Layer, 'id' | 'selected'>[];
    defaultText: Record<string, string>;
    defaultColors: Record<string, string>;
}

export interface RenderState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    fps: number;
    isExporting: boolean;
    exportProgress: number;
    selectedLayerId: string | null;
    hoveredLayerId: string | null;
}

export type EngineEvent =
    | { type: 'play' }
    | { type: 'pause' }
    | { type: 'seek'; time: number }
    | { type: 'selectLayer'; layerId: string | null }
    | { type: 'updateLayer'; layerId: string; changes: Partial<Layer> }
    | { type: 'exportStart' }
    | { type: 'exportProgress'; progress: number }
    | { type: 'exportComplete'; blob: Blob };
