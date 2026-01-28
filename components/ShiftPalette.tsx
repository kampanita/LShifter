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
      <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar pb-1 px-2">
        {/* Navigation / Selection Tool */}
        <button
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all
            ${selectedId === null
              ? 'border-indigo-600 bg-white ring-4 ring-indigo-500/20 shadow-lg scale-110 z-10'
              : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 hover:opacity-100'}
          `}
        >
          <i className="fa-solid fa-arrow-pointer text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Navegar</span>
        </button>

        {/* Eraser Tool */}
        <button
          onClick={() => onSelect('eraser')}
          className={`
            flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all
            ${selectedId === 'eraser'
              ? 'border-rose-600 bg-white ring-4 ring-rose-500/20 shadow-lg scale-110 z-10'
              : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 hover:opacity-100'}
          `}
        >
          <i className="fa-solid fa-eraser text-lg text-rose-500/70"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Borrar</span>
        </button>

        <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>

        {/* Shift Types */}
        {shiftTypes.map((shift) => (
          <button
            key={shift.id}
            onClick={() => onSelect(shift.id)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all relative overflow-hidden active:scale-95
              ${selectedId === shift.id
                ? 'border-white ring-4 ring-indigo-500/30 transform scale-110 z-10 shadow-xl'
                : 'border-transparent opacity-70 hover:opacity-100'}
            `}
            style={{ backgroundColor: shift.color }}
          >
            <span className="text-lg font-black text-white drop-shadow-md">{shift.code}</span>
            <span className="text-[8px] text-white/90 font-bold truncate w-full text-center px-1">
              {shift.startTime}
            </span>
            {selectedId === shift.id && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </button>
        ))}

        <div className="w-px h-10 bg-slate-200 mx-2 shrink-0"></div>

        <button
          onClick={onEdit}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 border border-slate-100 transition-all shadow-sm active:scale-90"
          title="Editar Turnos"
        >
          <i className="fa-solid fa-sliders"></i>
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-1">
        {selectedId ? 'Tap or drag on dates to paint' : 'Tap dates to erase'}
      </div>
    </div>
  );
};