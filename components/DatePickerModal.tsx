import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  currentDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export const DatePickerModal: React.FC<Props> = ({ isOpen, currentDate, onClose, onSelect }) => {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (isOpen) {
      setViewYear(currentDate.getFullYear());
    }
  }, [isOpen, currentDate]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[320px] p-6 animate-scale-in flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Year Selector */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setViewYear(y => y - 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <span className="text-2xl font-bold text-slate-800 tabular-nums tracking-tight select-none">
            {viewYear}
          </span>
          
          <button 
            onClick={() => setViewYear(y => y + 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {months.map((month, index) => {
            const isSelected = currentDate.getMonth() === index && currentDate.getFullYear() === viewYear;
            const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === viewYear;
            
            return (
              <button
                key={month}
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(viewYear);
                  newDate.setMonth(index);
                  newDate.setDate(1);
                  onSelect(newDate);
                  onClose();
                }}
                className={`
                  h-12 rounded-xl text-sm font-semibold transition-all duration-200 select-none
                  ${isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600'}
                  ${!isSelected && isCurrentMonth ? 'ring-2 ring-inset ring-indigo-100 text-indigo-600' : ''}
                `}
              >
                {month}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <button 
                onClick={onClose}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => {
                    onSelect(new Date());
                    onClose();
                }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
                Go to Today
            </button>
        </div>
      </div>
    </div>
  );
};