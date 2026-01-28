import React from 'react';
import { ShiftType } from '../types';

interface Props {
  shiftTypes: ShiftType[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: () => void;
}

export const ShiftPalette: React.FC<Props> = ({ shiftTypes, selectedId, onSelect, onEdit }) => {
  return (
    <div className="bg-white border-t border-slate-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
      <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {/* Eraser Tool */}
        <button
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all
            ${selectedId === null 
              ? 'border-indigo-600 bg-indigo-50 transform scale-105' 
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
          `}
        >
          <i className="fa-solid fa-eraser text-slate-500 text-xl"></i>
          <span className="text-[10px] text-slate-500 font-medium mt-1">Clear</span>
        </button>

        {/* Shift Types */}
        {shiftTypes.map((shift) => (
          <button
            key={shift.id}
            onClick={() => onSelect(shift.id)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 transition-all relative overflow-hidden
              ${selectedId === shift.id 
                ? 'border-indigo-600 transform scale-105 shadow-md' 
                : 'border-transparent opacity-90 hover:opacity-100'}
            `}
            style={{ backgroundColor: shift.color }}
          >
            <span className="text-lg font-bold text-white shadow-black drop-shadow-sm">{shift.code}</span>
            <span className="text-[10px] text-white opacity-90 truncate w-full text-center px-1">
              {shift.startTime}
            </span>
            {selectedId === shift.id && (
               <div className="absolute inset-0 border-2 border-white rounded-xl opacity-30"></div>
            )}
          </button>
        ))}

        {/* Add/Edit Button */}
        <div className="border-l border-slate-300 pl-4 h-10 flex items-center">
            <button
            onClick={onEdit}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition-colors"
            >
            <i className="fa-solid fa-pen"></i>
            </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-400 mt-1">
        {selectedId ? 'Tap or drag on dates to paint' : 'Tap dates to erase'}
      </div>
    </div>
  );
};