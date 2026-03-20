import { GoogleGenAI } from "@google/genai";

interface VideoResult {
    id: string;
    url: string;
    timestamp: number;
    prompt: string;
    status: 'ready' | 'pending';
}

interface ScenePrompt {
    sceneNumber: number;
    title: string;
    visualPrompt: string;
}

const SCENES: ScenePrompt[] = [
    {
        sceneNumber: 1,
        title: "Opening: The Institutional Shift",
        visualPrompt: "Cinematic tracking shot: Johannesburg skyline at dusk transitioning to modern corporate offices, university campus, and NGO field operations. Tech dashboards and data analytics screens visible in the foreground. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 2,
        title: "The Modern Challenge",
        visualPrompt: "Cinematic tracking shot: A dark, moody server room showing disconnected systems, chaotic wire meshes, and messy workflows. Overloaded teams silhouetted against glaring, outdated screens. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 3,
        title: "The StudioWorks Solution",
        visualPrompt: "Cinematic tracking shot: Diverse professional team collaborating calmly in a sleek, glass-walled office. Futuristic software dashboards and AI interfaces glowing on their screens. Professional media production equipment visible. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 4,
        title: "What We Deliver",
        visualPrompt: "Cinematic tracking shot: High-end, abstract representations of AI strategy, custom automation running, and enterprise web systems. Flowing digital data structures integrating seamlessly in mid-air. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 5,
        title: "Who We Serve",
        visualPrompt: "Cinematic tracking shot: Elegant boardroom discussion with focused NGO leadership and startup founders. Subtle reflections in dark glass tables. Calm, intelligent atmosphere. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 6,
        title: "Our Philosophy",
        visualPrompt: "Cinematic tracking shot: Extreme close-up of calm, focused leadership eyes, transitioning to disciplined technical execution hands typing on a mechanical keyboard. Masterfully shot in Dark, modern, premium cinematic style."
    },
    {
        sceneNumber: 7,
        title: "Closing Declaration",
        visualPrompt: "Cinematic tracking shot: Confident team walking forward in slow motion against a dark, dramatic modern architecture backdrop. Clean, subtle light flares. Masterfully shot in Dark, modern, premium cinematic style."
    }
];

export const getScenes = () => SCENES;

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (e: any) {
        const status = e.status || e.code || e.error?.code;
        const message = e.message || e.error?.message || "";
        const isRetryable = status === 500 || status === 503 || status === 429 || message.includes("INTERNAL") || message.includes("overloaded") || message.includes("Internal Server Error");

        if (retries > 0 && isRetryable) {
            console.warn(`Gemini API error (Status ${status}). Retrying in ${delay}ms...`, message);
            await new Promise(r => setTimeout(r, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw e;
    }
}

export const generateCinematicVideo = async (sceneNumber: number): Promise<VideoResult> => {
    return withRetry(async () => {
        // API KEY needs to come from the environment correctly.
        // Vite uses import.meta.env.VITE_GOOGLE_API_KEY
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("VITE_GOOGLE_API_KEY is missing from the environment.");
        }
        const ai = new GoogleGenAI({ apiKey });

        const scene = SCENES.find(s => s.sceneNumber === sceneNumber);
        if (!scene) throw new Error("Invalid scene number");

        const fullPrompt = scene.visualPrompt;

        try {
            console.log(`Starting video generation for scene ${sceneNumber}: ${scene.title}`);
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-generate-preview',
                prompt: fullPrompt,
                config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
            });

            console.log(`Operation for scene ${sceneNumber} ongoing... ID: ${operation.name}`);
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation.name || operation });
                console.log(`Checking operation for scene ${sceneNumber}... Status: ${operation.done ? "Done" : "Pending"}`);
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("No download link returned from API.");

            console.log(`Downloading generated video for scene ${sceneNumber}...`);
            const response = await fetch(`${downloadLink}&key=${apiKey}`);
            const blob = await response.blob();

            return {
                id: operation.name || Math.random().toString(),
                url: URL.createObjectURL(blob),
                timestamp: Date.now(),
                prompt: fullPrompt,
                status: 'ready'
            };
        } catch (e) {
            console.error(`Error generating video for scene ${sceneNumber}`, e);
            throw e;
        }
    });
};
