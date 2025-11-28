import React from 'react';
import { UserFunction } from '../types';
import { Edit2, Trash2, Plus, Braces, GripVertical } from 'lucide-react';

interface Props {
  functions: UserFunction[];
  onEdit: (fn: UserFunction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const FunctionList: React.FC<Props> = ({ functions, onEdit, onDelete, onAdd }) => {
  const handleDragStart = (e: React.DragEvent, fn: UserFunction) => {
    // Generate JS Syntax: {{#js}} funcName(args) {{/js}}
    // Use arg names as placeholders
    const argList = fn.args.join(', ');
    const text = `{{#js}} ${fn.name}(${argList}) {{/js}}`;
    
    e.dataTransfer.setData('text/plain', text);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-white">
       <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200">
          <p className="text-xs text-slate-500">
           Drag functions into the editor.
         </p>
       </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {functions.map(fn => (
          <div 
            key={fn.id}
            className="group flex flex-col bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all select-none"
            draggable
            onDragStart={(e) => handleDragStart(e, fn)}
          >
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing">
                        <GripVertical size={14} />
                    </div>
                    <div className="bg-purple-100 p-1 rounded text-purple-600">
                        <Braces size={12} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate" title={fn.name}>
                        {fn.name}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(fn)}
                        className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded"
                        title="Edit Function"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button 
                        onClick={() => onDelete(fn.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Function"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <div className="px-3 pb-2 flex gap-1 flex-wrap">
                {fn.args.length > 0 ? (
                    fn.args.map(arg => (
                        <span key={arg} className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1 rounded">
                            {arg}
                        </span>
                    ))
                ) : (
                    <span className="text-[10px] text-slate-300 italic">no args</span>
                )}
            </div>
          </div>
        ))}
        {functions.length === 0 && (
            <div className="text-center p-6 text-slate-400 text-sm italic">
                No custom functions defined.
            </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-purple-400 hover:text-purple-700 text-slate-700 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
            <Plus size={16} />
            <span>New Function</span>
        </button>
      </div>
    </div>
  );
};