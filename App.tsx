import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Code2, Play, Layout, FileJson, GripVertical, PanelRightClose, PanelRightOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { TemplateEditor } from './components/TemplateEditor';
import { VariableTree } from './components/VariableTree';
import { TestDataEditor } from './components/TestDataEditor';
import { PreviewPane } from './components/PreviewPane';
import { INITIAL_TEMPLATE, INITIAL_TEST_DATA } from './constants';
import { compileTemplate, formatJson } from './services/engine';

function App() {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [template, setTemplate] = useState(INITIAL_TEMPLATE);
  const [testDataStr, setTestDataStr] = useState(JSON.stringify(INITIAL_TEST_DATA, null, 2));
  
  // Derived State
  const [parsedTestData, setParsedTestData] = useState<any>(INITIAL_TEST_DATA);
  const [isTestDataValid, setIsTestDataValid] = useState(true);
  const [compiledResult, setCompiledResult] = useState('');
  const [compileError, setCompileError] = useState<string | null>(null);

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Live parsing of Test Data
  useEffect(() => {
    try {
      const parsed = JSON.parse(testDataStr);
      setParsedTestData(parsed);
      setIsTestDataValid(true);
    } catch (e) {
      setIsTestDataValid(false);
    }
  }, [testDataStr]);

  // Real-time Compilation
  useEffect(() => {
    if (!isTestDataValid) return;
    try {
      const result = compileTemplate(template, parsedTestData);
      // Attempt to pretty print the result if it is valid JSON, otherwise show raw
      setCompiledResult(formatJson(result));
      setCompileError(null);
    } catch (e: any) {
      setCompileError(e.message);
    }
  }, [template, parsedTestData, isTestDataValid]);

  // Resizing Logic (Mouse & Touch)
  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); 
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent | TouchEvent) => {
    if (isResizing) {
      let clientX;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }
      
      const newWidth = window.innerWidth - clientX;
      if (newWidth > 200 && newWidth < window.innerWidth - 100) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      window.addEventListener("touchmove", resize);
      window.addEventListener("touchend", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-50 text-slate-900 font-sans ${isResizing ? 'cursor-col-resize select-none touch-none' : ''}`}>
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-600/20">
            <Code2 size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg tracking-tight text-slate-900">JSON Template Studio</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">Handlebars Powered</p>
          </div>
          <div className="sm:hidden">
             <h1 className="font-bold text-base tracking-tight text-slate-900">Template Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'edit' 
                  ? 'bg-white text-teal-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Layout size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'preview' 
                  ? 'bg-white text-teal-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Play size={16} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <button 
            onClick={toggleSidebar}
            className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors ${!isSidebarOpen ? 'bg-slate-100 text-slate-700' : ''}`}
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left/Center Pane */}
        <div className="flex-1 flex flex-col min-w-0 bg-white transition-[width] duration-300 ease-in-out">
          {mode === 'edit' ? (
             <TemplateEditor 
               value={template} 
               onChange={setTemplate} 
               dataContext={parsedTestData}
             />
          ) : (
             <PreviewPane content={compiledResult} error={compileError} />
          )}
        </div>

        {/* Resizer Handle */}
        {isSidebarOpen && (
          <div
            className={`w-3 sm:w-1 hover:w-3 sm:hover:w-1.5 -ml-1.5 sm:ml-0 transition-all cursor-col-resize hover:bg-teal-500 z-20 flex flex-col justify-center items-center group relative ${isResizing ? 'bg-teal-500 w-3 sm:w-1.5' : 'bg-transparent sm:bg-slate-200'}`}
            onMouseDown={startResizing}
            onTouchStart={startResizing}
          >
             {/* Visual grip indicator (hidden on mobile mostly, visible on hover desktop) */}
             <div className={`h-8 w-0.5 rounded transition-colors hidden sm:block ${isResizing ? 'bg-white/80' : 'bg-transparent group-hover:bg-white/50'}`}></div>
             
             {/* Collapse Button floating on the divider */}
             <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag start
                  toggleSidebar();
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-300 z-30 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                title="Collapse Sidebar"
             >
                <ChevronRight size={14} />
             </button>
          </div>
        )}

        {/* Right Sidebar */}
        {isSidebarOpen && (
          <div 
            ref={sidebarRef}
            style={{ width: sidebarWidth }} 
            className="bg-slate-50 flex flex-col border-l border-slate-200 shadow-sm shrink-0"
          >
            {mode === 'edit' ? (
              <div className="flex flex-col h-full bg-white">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center h-12">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <FileJson size={16} className="text-teal-600" />
                    <span className="truncate">Context Variables</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                   <p className="text-xs text-slate-500">
                    Drag items into the editor to insert.
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {isTestDataValid ? (
                    <VariableTree data={parsedTestData} />
                  ) : (
                    <div className="p-4 text-center text-red-500 text-sm">
                      Fix JSON syntax in Test Data to see variables.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // In Preview Mode, sidebar becomes Test Data Input
              <TestDataEditor 
                value={testDataStr} 
                onChange={setTestDataStr} 
                isValid={isTestDataValid}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 flex items-center px-4 text-[11px] text-slate-500 justify-between shrink-0 select-none">
        <div className="flex gap-4">
          <span className="font-mono hidden sm:inline">Schema Mode: Loose</span>
          <span className="font-mono hidden sm:inline">Engine: Handlebars 4.7.7</span>
          <span className="font-mono sm:hidden">HB 4.7.7</span>
        </div>
        <div className="flex gap-4">
           {isTestDataValid ? (
             <span className="text-emerald-600 font-medium flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               Data: Valid
             </span>
           ) : (
             <span className="text-red-600 font-medium flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
               Data: Invalid
             </span>
           )}
        </div>
      </footer>
    </div>
  );
}

export default App;