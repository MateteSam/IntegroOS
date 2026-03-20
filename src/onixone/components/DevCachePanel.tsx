import React, { useEffect, useState } from 'react';

const DevCachePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [stats, setStats] = useState<{ size: number; hits: number; misses: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [maxSize, setMaxSize] = useState<number | null>(null);

  const refreshMax = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const c = require('../services/hyphenateCache');
      if (c && typeof c.getCacheMaxSize === 'function') {
        setMaxSize(c.getCacheMaxSize());
      }
    } catch (e) {
      setMaxSize(null);
    }
  };

  const refresh = async () => {
    try {
      // dynamic import to avoid including dev code in prod bundles if tree-shaken
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cacheMod = require('../services/hyphenateCache');
      if (cacheMod && typeof cacheMod.cacheStats === 'function') {
        const s = cacheMod.cacheStats();
        setStats(s);
      } else {
        setStats(null);
      }
    } catch (e) {
      setStats(null);
    }
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { refreshMax(); }, []);

  const handlePersist = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const c = require('../services/hyphenateCache');
      if (c && typeof c.persistCacheImmediately === 'function') {
        c.persistCacheImmediately();
        setMessage('Persisted cache');
      } else setMessage('Persist not available');
    } catch (e) {
      setMessage('Persist failed');
    }
    refresh();
  };

  const handleClear = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cmod = require('../services/hyphenateCache');
      if (cmod && cmod.default && typeof cmod.default.clear === 'function') {
        cmod.default.clear();
        setMessage('Cache cleared');
      } else {
        setMessage('Clear not available');
      }
    } catch (e) {
      setMessage('Clear failed');
    }
    refresh();
    refreshMax();
  };

  const handlePrecompute = async () => {
    setLoading(true);
    try {
      const projectStr = window.localStorage.getItem('onixone_project');
      if (!projectStr) {
        setMessage('No project found in localStorage to precompute');
        setLoading(false);
        return;
      }
      const proj = JSON.parse(projectStr);
      const blocks = proj.storyBlocks || [];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const worker = require('../services/hyphenateWorker');
      if (worker && typeof worker.precomputeHyphenationForBlocks === 'function') {
        await worker.precomputeHyphenationForBlocks(blocks, proj.templateStyle?.styles?.bodyText?.fontSize || 11, proj.templateStyle?.fonts?.body || 'Times-Roman');
        setMessage('Precompute complete');
      } else setMessage('Precompute worker not available');
    } catch (e) {
      console.error(e);
      setMessage('Precompute failed');
    }
    setLoading(false);
    refresh();
    refreshMax();
  };

  const handleSetMaxSize = async () => {
    try {
      const n = Math.max(64, Math.floor(Number(maxSize || 0)));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const c = require('../services/hyphenateCache');
      if (c && typeof c.setCacheMaxSize === 'function') {
        const ok = c.setCacheMaxSize(n);
        setMessage(ok ? `Max size set to ${n}` : 'Failed to set size');
        refresh();
      }
    } catch (e) {
      setMessage('Failed to set cache size');
    }
    refreshMax();
  };

  return (
    <div className="fixed right-6 top-20 z-50 w-[420px] bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-slate-100">Dev: Hyphenation Cache</div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700">Refresh</button>
          <button onClick={onClose} className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700">Close</button>
        </div>
      </div>

      <div className="text-xs text-slate-300 mb-3">
        {stats ? (
          <div>
            <div>Size: <strong className="text-slate-100">{stats.size}</strong></div>
            <div>Hits: <strong className="text-slate-100">{stats.hits}</strong> — Misses: <strong className="text-slate-100">{stats.misses}</strong></div>
          </div>
        ) : (
          <div>No stats available</div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-xs text-slate-300 mb-2">LRU Capacity</div>
        <div className="flex gap-2">
          <input type="number" value={maxSize ?? ''} onChange={e => setMaxSize(Number(e.target.value))} className="w-28 px-2 py-1 rounded bg-slate-800 text-slate-200" />
          <button onClick={handleSetMaxSize} className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-500">Apply</button>
          <button onClick={refreshMax} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">Refresh</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handlePersist} className="flex-1 px-3 py-2 text-sm rounded bg-teal-600 hover:bg-teal-500">Persist</button>
        <button onClick={handleClear} className="flex-1 px-3 py-2 text-sm rounded bg-rose-600 hover:bg-rose-500">Clear</button>
        <button onClick={handlePrecompute} disabled={loading} className="flex-1 px-3 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-500">{loading ? 'Running...' : 'Precompute'}</button>
      </div>

      {message && <div className="mt-3 text-xs text-slate-300">{message}</div>}
    </div>
  );
};

export default DevCachePanel;
