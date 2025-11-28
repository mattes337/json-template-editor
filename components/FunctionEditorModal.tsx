import React, { useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { UserFunction } from '../types';
import { Play, Save, X, AlertCircle } from 'lucide-react';
import * as monaco from 'monaco-editor';

interface Props {
  isOpen: boolean;
  functionData: UserFunction | null;
  onClose: () => void;
  onSave: (fn: UserFunction) => void;
}

export const FunctionEditorModal: React.FC<Props> = ({ isOpen, functionData, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [argsStr, setArgsStr] = useState('');
  const [body, setBody] = useState('');
  
  // Testing state
  const [testArgValues, setTestArgValues] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (functionData) {
        setName(functionData.name);
        setArgsStr(functionData.args.join(', '));
        setBody(functionData.body);
        setTestArgValues(new Array(functionData.args.length).fill(''));
        setTestResult(null);
        setIsError(false);
      } else {
        setName('myFunction');
        setArgsStr('');
        setBody('return "Hello World";');
        setTestArgValues([]);
        setTestResult(null);
        setIsError(false);
      }
    }
  }, [isOpen, functionData]);

  // Update test arg slots when args string changes
  useEffect(() => {
    const count = argsStr.split(',').filter(s => s.trim()).length;
    setTestArgValues(prev => {
        const next = [...prev];
        if (count > next.length) {
            return [...next, ...new Array(count - next.length).fill('')];
        }
        return next.slice(0, count);
    });
  }, [argsStr]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    const args = argsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    onSave({
      id: functionData?.id || `fn_${Date.now()}`,
      name: name.trim(),
      args,
      body
    });
    onClose();
  };

  const handleRunTest = () => {
    const args = argsStr.split(',').map(s => s.trim()).filter(Boolean);
    try {
        // eslint-disable-next-line no-new-func
        const func = new Function(...args, body);
        
        // Parse test values (try to parse as JSON, else treat as string)
        const parsedArgs = testArgValues.map(val => {
            try {
                return JSON.parse(val);
            } catch {
                return val;
            }
        });

        const result = func(...parsedArgs);
        setTestResult(result === undefined ? 'undefined' : JSON.stringify(result, null, 2));
        setIsError(false);
    } catch (e: any) {
        setTestResult(e.message);
        setIsError(true);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
      // Small delay to ensure modal transition is done
      setTimeout(() => {
          editor.layout();
      }, 100);
      
      if (document.fonts) {
        document.fonts.ready.then(() => {
            monaco.editor.remeasureFonts();
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 shrink-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md">
                <Play size={16} />
            </span>
            {functionData ? 'Edit Function' : 'New Function'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left: Configuration */}
            <div className="w-1/3 border-r border-slate-200 p-6 overflow-y-auto flex flex-col gap-6 bg-slate-50/30">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Function Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                        placeholder="myHelper"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Arguments</label>
                    <input 
                        type="text" 
                        value={argsStr}
                        onChange={(e) => setArgsStr(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                        placeholder="arg1, arg2"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Comma separated parameter names.</p>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Play size={14} className="text-purple-600" />
                        Test Function
                    </label>
                    
                    <div className="space-y-3">
                        {argsStr.split(',').filter(s => s.trim()).map((argName, idx) => (
                            <div key={idx}>
                                <label className="text-[10px] font-mono text-slate-500 block mb-1">{argName.trim()}:</label>
                                <input 
                                    type="text"
                                    value={testArgValues[idx] || ''}
                                    onChange={(e) => {
                                        const newVals = [...testArgValues];
                                        newVals[idx] = e.target.value;
                                        setTestArgValues(newVals);
                                    }}
                                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-purple-400 focus:outline-none"
                                    placeholder="value (JSON or string)"
                                />
                            </div>
                        ))}
                        {argsStr.trim() === '' && (
                            <p className="text-xs text-slate-400 italic">No arguments to configure.</p>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleRunTest}
                        className="mt-4 w-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 py-1.5 rounded-md text-xs font-medium transition-colors"
                    >
                        Run Test
                    </button>

                    {testResult !== null && (
                        <div className={`mt-4 p-3 rounded-md text-xs font-mono whitespace-pre-wrap border ${isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {isError && <AlertCircle size={14} className="inline mr-1 mb-0.5" />}
                            {testResult}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Code Editor */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="h-10 border-b border-slate-100 flex items-center px-4 bg-white shrink-0">
                    <span className="text-xs font-mono text-slate-400">function body {'{ ... }'}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        value={body}
                        onChange={(val) => setBody(val || '')}
                        theme="vs"
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-slate-200 bg-slate-50 flex items-center justify-end px-6 gap-3 shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 rounded-lg transition-colors flex items-center gap-2"
            >
                <Save size={16} />
                Save Function
            </button>
        </div>
      </div>
    </div>
  );
};