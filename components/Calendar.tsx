import React, { useMemo } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { getDaysInMonth, getPaddingDays, formatDateKey, isSameDay } from '../helpers';

interface Props {
  currentDate: Date;
  assignments: Record<string, DayAssignment>;
  shiftTypes: ShiftType[];
  holidays: Record<string, Holiday>;
  selectedShiftTypeId: string | null;
  onPaint: (date: Date) => void;
  isPainting: boolean;
  setIsPainting: (v: boolean) => void;
}

export const Calendar: React.FC<Props> = ({
  currentDate,
  assignments,
  shiftTypes,
  holidays,
  selectedShiftTypeId,
  onPaint,
  isPainting,
  setIsPainting,
}) => {
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const paddingDays = useMemo(() => getPaddingDays(currentDate), [currentDate]);

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();

  const handlePointerDown = (date: Date) => {
    setIsPainting(true);
    onPaint(date);
  };

  const handlePointerEnter = (date: Date) => {
    if (isPainting) {
      onPaint(date);
    }
  };

  const getShiftForDate = (date: Date) => {
    const key = formatDateKey(date);
    const assignment = assignments[key];
    if (assignment && assignment.shiftTypeId) {
      return shiftTypes.find((s) => s.id === assignment.shiftTypeId);
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden select-none p-4 md:p-8">
      {/* CALENDAR BODY */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden relative">

        {/* TOP DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-slate-100 flex justify-around items-center px-12 z-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-[#FDFCFB] shadow-inner border border-slate-200"></div>
          ))}
        </div>

        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 pt-10 pb-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[10px] font-black uppercase tracking-[0.2em]
                ${index >= 5 ? 'text-rose-400' : 'text-slate-400'} 
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* DAYS GRID */}
        <div
          className="flex-1 grid grid-cols-7 relative overflow-y-auto hide-scrollbar"
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="bg-slate-50/30 border-r border-b border-slate-50" />
          ))}

          {days.map((date) => {
            const shift = getShiftForDate(date);
            const isToday = isSameDay(date, today);
            const dateKey = formatDateKey(date);
            const holiday = holidays[dateKey];
            const isHoliday = !!holiday;

            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            let cellBg = 'bg-transparent';
            if (isToday) cellBg = 'bg-indigo-100/40';
            else if (isHoliday) cellBg = 'bg-rose-100/30';
            else if (isWeekend) cellBg = 'bg-rose-50';

            return (
              <div
                key={dateKey}
                className={`
                  relative border-r border-b border-slate-200/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group
                  min-h-[100px] md:min-h-0
                  ${cellBg}
                  hover:bg-white hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]
                `}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(date);
                }}
                onPointerEnter={() => handlePointerEnter(date)}
              >
                {/* DAY NUMBER */}
                <div
                  className={`
                    absolute top-3 left-4 text-sm font-black transition-all z-10
                    ${isToday ? 'text-indigo-600 scale-125' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-amber-600/70' : 'text-slate-600'))}
                    ${shift ? 'opacity-40 group-hover:opacity-100' : ''}
                  `}
                >
                  {date.getDate()}
                  {isToday && <div className="w-1 h-1 bg-indigo-600 rounded-full mx-auto mt-0.5 animate-bounce"></div>}
                </div>

                {/* HOLIDAY RIBBON */}
                {isHoliday && (
                  <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 pointer-events-none">
                    <div className="absolute top-3 -right-5 w-24 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b border-white/20">
                      {holiday.name?.substring(0, 12)}
                    </div>
                  </div>
                )}

                {/* SHIFT CONTENT */}
                {shift ? (
                  <div
                    className="w-[85%] h-[70%] rounded-2xl flex flex-col items-center justify-center shadow-[0_8px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transform transition-transform group-hover:scale-105 active:scale-95 animate-scale-in relative overflow-hidden"
                    style={{ backgroundColor: shift.color, border: '3px solid white' }}
                  >
                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
                    <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">{shift.code}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <i className="fa-solid fa-clock text-[8px] text-white/70"></i>
                      <span className="text-[9px] text-white font-bold tracking-tight">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="w-full h-full opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500 rounded-2xl scale-90" />
                )}

                {/* TODAY PULSE */}
                {isToday && !shift && (
                  <div className="absolute inset-4 rounded-3xl border-2 border-indigo-200/50 animate-pulse border-dashed pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM PAGE CURVE EFFECT */}
        <div className="h-2 bg-gradient-to-b from-slate-200/20 to-transparent shrink-0"></div>
      </div>

      {/* SHADOW FOR 3D EFFECT */}
      <div className="h-4 mx-8 bg-slate-200/20 rounded-full blur-xl -mt-2 shrink-0"></div>
    </div>
  );
};