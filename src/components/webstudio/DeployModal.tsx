// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Deploy Modal
// One-click deploy dialog with Cloudflare Pages integration
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Globe, CheckCircle2, AlertCircle, Loader2, ExternalLink, Key, HardDrive, Cloud } from 'lucide-react';
import {
  type EditorState,
} from '../../lib/webstudio/editorEngine';
import {
  deployToCloudflare, exportAsZip, generateStaticHTML,
  isCloudflareConfigured, setCloudflareConfig, getCloudflareConfig,
  type DeployStatus, type DeployResult
} from '../../lib/webstudio/deployEngine';
import './DeployModal.css';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorState: EditorState;
  templateName: string;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose, editorState, templateName }) => {
  const [step, setStep] = useState<'choose' | 'config' | 'deploying' | 'done'>('choose');
  const [apiToken, setApiToken] = useState(getCloudflareConfig()?.apiToken || '');
  const [accountId, setAccountId] = useState(getCloudflareConfig()?.accountId || '');
  const [projectName, setProjectName] = useState(templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<DeployResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(isCloudflareConfigured() ? 'choose' : 'config');
      setResult(null);
      setDeployStatus('idle');
    }
  }, [isOpen]);

  const handleDeploy = async () => {
    if (apiToken && accountId) {
      setCloudflareConfig({ apiToken, accountId });
    }
    setStep('deploying');
    const res = await deployToCloudflare(editorState, projectName, (status, msg) => {
      setDeployStatus(status);
      setStatusMessage(msg);
    });
    setResult(res);
    setStep('done');
  };

  const handleExport = () => {
    exportAsZip(editorState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="deploy-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="deploy-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          onClick={e => e.stopPropagation()}>
          <button className="deploy-close" onClick={onClose}><X size={18} /></button>

          {step === 'choose' && (
            <div className="deploy-content">
              <div className="deploy-header">
                <Rocket size={28} className="deploy-header-icon" />
                <h2>Deploy Your Website</h2>
                <p>Choose how to publish your website to the world</p>
              </div>
              <div className="deploy-options">
                <button className="deploy-option primary" onClick={() => setStep(isCloudflareConfigured() ? 'deploying' : 'config')}>
                  <Cloud size={24} />
                  <div>
                    <strong>Deploy to Cloudflare Pages</strong>
                    <span>One-click global deployment with free SSL</span>
                  </div>
                  <ExternalLink size={16} />
                </button>
                <button className="deploy-option" onClick={handleExport}>
                  <HardDrive size={24} />
                  <div>
                    <strong>Download HTML</strong>
                    <span>Export as a static HTML file for any host</span>
                  </div>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'config' && (
            <div className="deploy-content">
              <div className="deploy-header">
                <Key size={28} className="deploy-header-icon" />
                <h2>Cloudflare Setup</h2>
                <p>Enter your Cloudflare credentials (saved locally)</p>
              </div>
              <div className="deploy-form">
                <label>
                  <span>API Token</span>
                  <input type="password" value={apiToken} onChange={e => setApiToken(e.target.value)} placeholder="Your Cloudflare API token" />
                </label>
                <label>
                  <span>Account ID</span>
                  <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="Your Cloudflare Account ID" />
                </label>
                <label>
                  <span>Project Name</span>
                  <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="my-awesome-site" />
                </label>
                <button className="deploy-submit" onClick={handleDeploy} disabled={!apiToken || !accountId}>
                  <Rocket size={16} /> Deploy Now
                </button>
              </div>
            </div>
          )}

          {step === 'deploying' && (
            <div className="deploy-content deploy-center">
              <Loader2 size={40} className="deploy-spinner" />
              <h2>Deploying...</h2>
              <p>{statusMessage || 'Preparing your website...'}</p>
              <div className="deploy-progress">
                {(['building', 'uploading', 'deploying'] as DeployStatus[]).map((s, i) => (
                  <div key={s} className={`deploy-progress-step ${deployStatus === s ? 'active' : ''} ${['building','uploading','deploying'].indexOf(deployStatus) > i ? 'done' : ''}`}>
                    <div className="deploy-progress-dot" />
                    <span>{s === 'building' ? 'Build' : s === 'uploading' ? 'Upload' : 'Deploy'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'done' && result && (
            <div className="deploy-content deploy-center">
              {result.status === 'live' ? (
                <>
                  <CheckCircle2 size={48} className="deploy-success-icon" />
                  <h2>Website is Live! 🎉</h2>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="deploy-live-url">
                    <Globe size={16} /> {result.url}
                  </a>
                  <button className="deploy-submit" onClick={onClose}>Done</button>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className="deploy-error-icon" />
                  <h2>Deployment Failed</h2>
                  <p className="deploy-error-msg">{result.error}</p>
                  <button className="deploy-submit" onClick={() => setStep('config')}>Try Again</button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
