import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  content: string;
  error: string | null;
}

export const PreviewPane: React.FC<Props> = ({ content, error }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // FIX: Remeasure fonts when they are loaded to prevent caret misalignment
    if (document.fonts) {
        document.fonts.ready.then(() => {
            monaco.editor.remeasureFonts();
        });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6">
        <span className="text-sm font-bold text-slate-700">Compile Result</span>
        {error ? (
          <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-md border border-red-100">
            <AlertTriangle size={14} />
            <span className="font-medium">Compilation Failed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <CheckCircle2 size={14} />
            <span className="font-medium">Valid Output</span>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="flex-1 bg-slate-50 p-6">
          <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-2 text-red-700 font-bold mb-3 border-b border-red-100 pb-2">
               <AlertTriangle size={16} />
               <h4>Error Details</h4>
             </div>
             <pre className="text-red-600 font-mono text-sm whitespace-pre-wrap font-medium">
               {error}
             </pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
           <Editor
            height="100%"
            defaultLanguage="json"
            value={content}
            theme="vs"
            onMount={handleEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              renderLineHighlight: 'line',
            }}
          />
        </div>
      )}
    </div>
  );
};