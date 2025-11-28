import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { generateTemplate } from '../services/geminiService';
import { Wand2, Loader2, Save } from 'lucide-react';
import * as monaco from 'monaco-editor';

interface Props {
  value: string;
  onChange: (val: string) => void;
  dataContext: Record<string, any>;
}

export const TemplateEditor: React.FC<Props> = ({ value, onChange, dataContext }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Configure JSON validation
    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
      enableSchemaRequest: false
    });

    // FIX: Remeasure fonts when they are loaded to prevent caret misalignment
    if (document.fonts) {
        document.fonts.ready.then(() => {
            monacoInstance.editor.remeasureFonts();
        });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text || !editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);

    if (target && target.position) {
      const position = target.position;
      editor.executeEdits('dnd', [{
        range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: text,
        forceMoveMarkers: true
      }]);
      editor.setPosition(position);
      editor.focus();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateTemplate(prompt, dataContext);
      if (editorRef.current) {
        editorRef.current.setValue(generated);
      } else {
        onChange(generated);
      }
      setShowPromptInput(false);
      setPrompt('');
    } catch (e) {
      alert("Failed to generate template. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="h-full flex flex-col relative bg-white"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <span className="text-sm font-bold text-slate-700">Editor</span>
        <div className="flex items-center gap-2">
           {showPromptInput ? (
             <div className="flex items-center gap-2 bg-white p-1 rounded-md border border-teal-500 shadow-sm animate-in fade-in slide-in-from-right-4 duration-200">
               <input 
                 type="text" 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Describe JSON needed..."
                 className="bg-transparent text-xs text-slate-800 focus:outline-none w-48 px-2 placeholder:text-slate-400"
                 onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
               />
               <button 
                disabled={isGenerating}
                onClick={handleGenerate}
                className="text-teal-600 hover:text-teal-700 p-1 rounded hover:bg-teal-50"
               >
                 {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
               </button>
             </div>
           ) : (
             <button 
               onClick={() => setShowPromptInput(true)}
               className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors px-3 py-1.5 rounded-md"
             >
               <Wand2 size={14} />
               <span>Ask AI</span>
             </button>
           )}
        </div>
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
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            formatOnPaste: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            lineNumbersMinChars: 4,
          }}
        />
      </div>
    </div>
  );
};