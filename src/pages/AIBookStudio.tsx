import React from 'react';
import OnixApp from '@/onixone/App';
import '@/onixone/index.css';

const AIBookStudio = () => {
    return (
        <div className="w-full h-full min-h-screen bg-white text-slate-900 overflow-hidden relative isolate">
            <OnixApp />
        </div>
    );
};

export default AIBookStudio;