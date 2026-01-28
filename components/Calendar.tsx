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
    <div className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden select-none p-2 md:p-8">
      {/* CALENDAR BODY */}
      <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden relative">

        {/* TOP DECORATION - Smaller on mobile */}
        <div className="absolute top-0 left-0 right-0 h-3 md:h-4 bg-slate-100 flex justify-around items-center px-6 md:px-12 z-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-2 md:w-4 h-2 md:h-4 rounded-full bg-[#FDFCFB] shadow-inner border border-slate-200"></div>
          ))}
        </div>

        {/* WEEK HEADER - Reduced padding on mobile */}
        <div className="grid grid-cols-7 pt-6 md:pt-10 pb-2 md:pb-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]
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
                  min-h-[70px] md:min-h-0
                  ${cellBg}
                  hover:bg-white hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]
                `}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(date);
                }}
                onPointerEnter={() => handlePointerEnter(date)}
              >
                {/* DAY NUMBER - Smaller on mobile */}
                <div
                  className={`
                    absolute top-1.5 md:top-3 left-2 md:left-4 text-xs md:text-sm font-black transition-all z-10
                    ${isToday ? 'text-indigo-600 scale-110' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-amber-600/70' : 'text-slate-600'))}
                    ${shift ? 'opacity-40 group-hover:opacity-100' : ''}
                  `}
                >
                  {date.getDate()}
                  {isToday && <div className="w-1 h-1 bg-indigo-600 rounded-full mx-auto mt-0.5 animate-bounce"></div>}
                </div>

                {/* HOLIDAY RIBBON - Scaled for mobile */}
                {isHoliday && (
                  <div className="absolute top-0 right-0 overflow-hidden w-8 md:w-16 h-8 md:h-16 pointer-events-none">
                    <div className="absolute top-1 md:top-3 -right-4 md:-right-5 w-16 md:w-24 bg-rose-600 text-white text-[5px] md:text-[8px] font-black uppercase tracking-widest text-center py-0.5 md:py-1 rotate-45 shadow-[0_1px_2px_rgba(0,0,0,0.2)] border-b border-white/20">
                      {holiday.name?.substring(0, 8)}
                    </div>
                  </div>
                )}

                {/* SHIFT CONTENT - Responsive sizes */}
                {shift ? (
                  <div
                    className="w-[85%] h-[75%] rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-lg transform transition-transform group-hover:scale-105 active:scale-95 animate-scale-in relative overflow-hidden"
                    style={{ backgroundColor: shift.color, border: '2px md:border-3 solid white' }}
                  >
                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
                    <span className="text-sm md:text-2xl font-black text-white drop-shadow-md">{shift.code}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <i className="fa-solid fa-clock text-[6px] md:text-[8px] text-white/70"></i>
                      <span className="text-[7px] md:text-[9px] text-white font-bold tracking-tight">{shift.startTime}</span>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="w-full h-full opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500 rounded-xl md:rounded-2xl scale-90" />
                )}

                {/* TODAY PULSE */}
                {isToday && !shift && (
                  <div className="absolute inset-2 md:inset-4 rounded-xl md:rounded-3xl border md:border-2 border-indigo-200/50 animate-pulse border-dashed pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM PAGE CURVE EFFECT */}
        <div className="h-1 md:h-2 bg-gradient-to-b from-slate-200/10 to-transparent shrink-0"></div>
      </div>

      {/* SHADOW FOR 3D EFFECT */}
      <div className="h-2 md:h-4 mx-4 md:mx-8 bg-slate-200/10 rounded-full blur-xl -mt-1 md:-mt-2 shrink-0"></div>
    </div>
  );
};