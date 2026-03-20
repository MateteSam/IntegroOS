import React, { useState, useRef, useEffect } from 'react';
import { getScenes, generateCinematicVideo } from '../../services/launchFilmService';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Loader2, Play, Download, Film, Music } from 'lucide-react';

interface SceneVideo {
    sceneNumber: number;
    title: string;
    visualPrompt: string;
    videoUrl?: string; // The URL.createObjectURL of the blobs
    status: 'pending' | 'generating' | 'ready' | 'error';
    error?: string;
}

export const LaunchFilmStudio: React.FC = () => {
    const [scenes, setScenes] = useState<SceneVideo[]>(() =>
        getScenes().map(s => ({ ...s, status: 'pending' }))
    );

    const [audioUrl, setAudioUrl] = useState<string>("ms-appdata:///local/WCCCS.mp3.mpeg"); // Default to the requested path, but let user change or we load from an input
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
    const [globalStatus, setGlobalStatus] = useState<'idle' | 'generating' | 'ready'>('idle');

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // If we have an audio URL from local file, we might need an input block since browsers block direct C:\ access.
        // We'll add a file input for the audio just in case the absolute path fails.
    }, []);

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioUrl(URL.createObjectURL(file));
        }
    };

    const generateAllScenes = async () => {
        setGlobalStatus('generating');

        // We will generate them sequentially to avoid rate limits
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            if (scene.status === 'ready') continue;

            try {
                updateSceneStatus(scene.sceneNumber, 'generating');
                const result = await generateCinematicVideo(scene.sceneNumber);

                setScenes(prev => prev.map(s =>
                    s.sceneNumber === scene.sceneNumber
                        ? { ...s, status: 'ready', videoUrl: result.url }
                        : s
                ));
            } catch (err: any) {
                setScenes(prev => prev.map(s =>
                    s.sceneNumber === scene.sceneNumber
                        ? { ...s, status: 'error', error: err.message || 'Generation failed' }
                        : s
                ));
                // Pause generation if one fails
                setGlobalStatus('idle');
                return;
            }
        }

        setGlobalStatus('ready');
    };

    const updateSceneStatus = (sceneNumber: number, status: SceneVideo['status'], error?: string) => {
        setScenes(prev => prev.map(s => s.sceneNumber === sceneNumber ? { ...s, status, error } : s));
    };

    const playSequence = () => {
        if (scenes.some(s => s.status !== 'ready')) {
            alert("Please wait for all scenes to generate before playing.");
            return;
        }

        if (audioRef.current && videoRef.current) {
            setIsPlaying(true);
            setCurrentSceneIndex(0);
            videoRef.current.src = scenes[0].videoUrl!;

            // Start both
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play error", e));
            videoRef.current.play().catch(e => console.error("Video play error", e));
        }
    };

    const handleVideoEnded = () => {
        if (currentSceneIndex < scenes.length - 1) {
            const nextIndex = currentSceneIndex + 1;
            setCurrentSceneIndex(nextIndex);
            if (videoRef.current) {
                videoRef.current.src = scenes[nextIndex].videoUrl!;
                videoRef.current.play().catch(e => console.error("Video play error", e));
            }
        } else {
            setIsPlaying(false);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }
    };

    const downloadAll = () => {
        scenes.forEach(scene => {
            if (scene.videoUrl) {
                const a = document.createElement('a');
                a.href = scene.videoUrl;
                a.download = `Scene_${scene.sceneNumber}_${scene.title.replace(/\s+/g, '_')}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">StudioWorks Launch Film Studio</h1>
                    <p className="text-muted-foreground mt-2">Generate and synchronize the 7-scene corporate launch film using Gemini Veo-3.1.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={generateAllScenes}
                        disabled={globalStatus === 'generating'}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {globalStatus === 'generating' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Film className="mr-2 h-4 w-4" /> Generate All Scenes</>}
                    </Button>
                    <Button
                        onClick={playSequence}
                        disabled={globalStatus !== 'ready' && scenes.some(s => s.status !== 'ready')}
                        variant="outline"
                    >
                        <Play className="mr-2 h-4 w-4" /> Play Film
                    </Button>
                    <Button
                        onClick={downloadAll}
                        disabled={globalStatus !== 'ready' && scenes.some(s => s.status !== 'ready')}
                        variant="secondary"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download Clips
                    </Button>
                </div>
            </div>

            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-indigo-400" />
                        Audio Track
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-400">Please provide the audio file: <code className="bg-slate-800 px-1 rounded">C:\Users\admin\Downloads\WCCCS.mp3.mpeg</code></p>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-900 file:text-indigo-300 hover:file:bg-indigo-800"
                    />
                    <audio ref={audioRef} src={audioUrl} controls className="w-full mt-2" />
                </CardContent>
            </Card>

            {isPlaying && (
                <Card className="bg-black border-slate-800 overflow-hidden">
                    <div className="aspect-video relative w-full flex items-center justify-center bg-black">
                        <video
                            ref={videoRef}
                            onEnded={handleVideoEnded}
                            className="w-full h-full object-cover"
                            controls={false}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm">
                            Scene {currentSceneIndex + 1}: {scenes[currentSceneIndex].title}
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenes.map((scene) => (
                    <Card key={scene.sceneNumber} className="border-slate-800">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">Scene {scene.sceneNumber}</CardTitle>
                                {scene.status === 'ready' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Ready</span>}
                                {scene.status === 'generating' && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Generating</span>}
                                {scene.status === 'error' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Error</span>}
                                {scene.status === 'pending' && <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{scene.title}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500 line-clamp-3 mb-4" title={scene.visualPrompt}>
                                {scene.visualPrompt}
                            </p>

                            {scene.videoUrl ? (
                                <div className="relative aspect-video rounded-md overflow-hidden bg-slate-100">
                                    <video src={scene.videoUrl} className="w-full h-full object-cover" controls preload="metadata" />
                                </div>
                            ) : (
                                <div className="relative aspect-video rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {scene.status === 'generating' ? (
                                        <div className="text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500">Generating Veo-3.1 Clip...</p>
                                            <p className="text-[10px] text-slate-400 max-w-[150px] mx-auto text-center mt-1">This takes ~2 minutes.</p>
                                        </div>
                                    ) : (
                                        <Film className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>
                            )}
                            {scene.error && (
                                <p className="text-xs text-red-500 mt-2">{scene.error}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
