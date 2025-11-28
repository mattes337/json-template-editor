import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  isValid: boolean;
}

export const TestDataEditor: React.FC<Props> = ({ value, onChange, isValid }) => {
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
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-700">Test Data Source</h3>
        {!isValid && (
          <span className="text-xs text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Invalid JSON
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={(val) => onChange(val || '')}
          theme="vs"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: 'line',
          }}
        />
      </div>
    </div>
  );
};