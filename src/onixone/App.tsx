import React, { useState } from 'react';
import { ProjectData } from './types';
import NewProjectModal from './components/NewProjectModal';
import Dashboard from './components/Dashboard';
import ProjectWorkspace from './components/ProjectWorkspace';
import { analyzeStructure } from './services/aiService';
import { PageSize, TemplateStyle, StoryBlock, TEMPLATE_STYLES, PAGE_SIZES } from './types';
import { Loader2 } from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { ProjectHistoryService } from './services/projectHistory';

const DEFAULT_METADATA = { title: 'Untitled Project', authors: [], publisher: '', bisacCodes: [], keywords: [], language: 'eng' };

export default function App() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist login session across page refreshes
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try { return !!localStorage.getItem('onixone_user'); } catch { return false; }
  });
  const [userName, setUserName] = useState<string>(() => {
    try { return localStorage.getItem('onixone_user') || 'Creator'; } catch { return 'Creator'; }
  });

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleLoadProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await file.text();
      const data: ProjectData = JSON.parse(text);
      setProjectData(data);
      ProjectHistoryService.saveProject(data);
    } catch (e) {
      console.error("Failed to load project file", e);
      alert("Error: Could not read or parse the project file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportTextProject = async (storyBlocks: StoryBlock[], size: PageSize, template: TemplateStyle) => {
    setShowNewProjectModal(false);
    setIsLoading(true);
    // Create a skeleton ProjectData object to pass to the workspace
    const newProject: Partial<ProjectData> = {
      storyBlocks,
      templateStyle: template,
      pageSize: size,
      metadata: { title: 'Untitled Project', authors: ['Author Name'], publisher: '', bisacCodes: [], keywords: [], language: 'eng' },
    };
    // The useProject hook inside ProjectWorkspace will handle the full initialization
    console.warn("IMPORT SUCCESS", { blocks: storyBlocks.length, size, template });
    setProjectData({
      ...newProject,
      timestamp: Date.now()
    } as ProjectData);
    setIsLoading(false);
  };

  const handleCreateBlankProject = async (size: PageSize, pages: number) => {
    setShowNewProjectModal(false);
    setIsLoading(true);
    const newProject: Partial<ProjectData> = {
      storyBlocks: [],
      pageSize: size,
      templateStyle: TEMPLATE_STYLES[0],
      metadata: { ...DEFAULT_METADATA, title: 'Untitled Blank Project' },
      // Initialization will handle blank PDF generation via pageSize
    };
    setProjectData({
      ...newProject,
      timestamp: Date.now()
    } as ProjectData);
    ProjectHistoryService.saveProject(newProject as ProjectData);
    setIsLoading(false);
  };

  const handleBackToDashboard = () => {
    setProjectData(null);
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-16 h-16 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(name) => {
      try { localStorage.setItem('onixone_user', name); } catch { /* storage unavailable */ }
      setUserName(name);
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <ErrorBoundary>
      {projectData ? (
        <ProjectWorkspace
          key={projectData.timestamp}
          projectData={projectData}
          onBackToDashboard={handleBackToDashboard}
        />
      ) : (
        <>
          <Dashboard
            onNewProject={handleNewProject}
            onOpenProject={handleLoadProject}
            userName={userName}
          />
          {showNewProjectModal && (
            <NewProjectModal
              onImportText={handleImportTextProject}
              onCancel={() => setShowNewProjectModal(false)}
              onUploadPdf={async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsLoading(true);
                try {
                  const arrayBuf = await file.arrayBuffer();
                  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
                  const newProject: ProjectData = {
                    version: 1,
                    pdfBase64: base64,
                    storyBlocks: [],
                    annotations: [],
                    timestamp: Date.now(),
                    pageSize: { name: 'A4', widthPt: 595.28, heightPt: 841.89, label: 'A4 (210 x 297 mm)' },
                    templateStyle: TEMPLATE_STYLES[0],
                    metadata: { ...DEFAULT_METADATA, title: file.name.replace(/\.pdf$/i, '') },
                    settings: { marginMm: 20, bleedMm: 3.175, targetDpi: 300, cropMarkMm: 3.175, showCropMarks: true, columnCount: 1, gutterMm: 5 },
                  } as ProjectData;
                  setProjectData(newProject);
                  setShowNewProjectModal(false);
                } catch (err) {
                  console.error('Failed to import PDF:', err);
                  alert('Error: Could not import this PDF file.');
                } finally {
                  setIsLoading(false);
                }
              }}
              onCreateBlank={handleCreateBlankProject}
            />
          )}
        </>
      )}
    </ErrorBoundary>
  );
}