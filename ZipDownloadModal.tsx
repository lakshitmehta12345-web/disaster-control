import React, { useState } from 'react';
import {
  Download,
  X,
  FileArchive,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  ExternalLink,
  Code,
} from 'lucide-react';
import { generateProjectZip, triggerDownloadBlob } from '../utils/zipExporter';

interface ZipDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipDownloadModal: React.FC<ZipDownloadModalProps> = ({ isOpen, onClose }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsCompiling(true);
    setDownloadCompleted(false);
    setProgressPercent(10);
    setStatusMessage('Packaging source files and algorithm engines...');

    try {
      const blob = await generateProjectZip((percent, currentFile) => {
        setProgressPercent(percent);
        setStatusMessage(currentFile);
      });

      triggerDownloadBlob(blob, 'rescuegrid-disaster-intelligence-platform.zip');
      setIsCompiling(false);
      setDownloadCompleted(true);
      setStatusMessage('Project ZIP ready and downloaded!');
    } catch (err) {
      console.error(err);
      // Fallback: direct download from pre-packaged public zip
      const link = document.createElement('a');
      link.href = '/rescuegrid-source.zip';
      link.download = 'rescuegrid-source.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsCompiling(false);
      setDownloadCompleted(true);
      setStatusMessage('Downloaded from server archive!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111C2E] border border-blue-600/70 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#172337] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <FileArchive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Download Project Source ZIP</h2>
              <p className="text-[11px] text-slate-400">Complete RESCUEGRID Disaster Management Ecosystem</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            As requested, you can download the entire full-stack project archive containing all modules, GIS Leaflet components, unit tests, predictive ML algorithms, and documentation.
          </p>

          {/* Archive Manifest Checklist */}
          <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Archive Contents:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>React 19, TypeScript, Vite &amp; Tailwind CSS configuration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Priority Scoring &amp; Duplicate Detection Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Criteria Capability Team Allocation &amp; Dynamic Routing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>XGBoost Demand Prediction &amp; Vision Damage Detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Haldwani, Uttarakhand 100+ scenario records &amp; Unit test suite</span>
              </li>
            </ul>
          </div>

          {/* Progress Bar (if compiling) */}
          {isCompiling && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{statusMessage}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {downloadCompleted && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
              <a
                href="/rescuegrid-source.zip"
                download="rescuegrid-source.zip"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleDownload}
            disabled={isCompiling}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition hover:scale-[1.01]"
          >
            <Download className="w-4 h-4" />
            <span>{isCompiling ? 'Generating Archive...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
