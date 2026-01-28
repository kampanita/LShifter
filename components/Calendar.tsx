import React, { useMemo } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { getDaysInMonth, getPaddingDays, formatDateKey, isSameDay } from '../helpers';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex-1 flex flex-col bg-[#050911] overflow-hidden select-none p-2 md:p-8">
      {/* PROFESSIONAL DARK PANEL */}
      <div className="flex-1 flex flex-col bg-[#0b121e] rounded-[1.2rem] md:rounded-[2rem] border border-[#1e293b] shadow-2xl overflow-hidden relative">

        {/* HEADER BAR */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#00a8ff] to-transparent opacity-50 z-20"></div>

        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 pt-4 md:pt-8 pb-2 md:pb-4 bg-[#0f172a] border-b border-[#1e293b] sticky top-0 z-40">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em]
                ${index >= 5 ? 'text-[#ff4757]' : 'text-slate-500'} 
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* DAYS GRID */}
        <div
          className="flex-1 grid grid-cols-7 relative overflow-y-auto hide-scrollbar z-10 p-1 md:p-3 gap-1 md:gap-2.5"
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="opacity-0" />
          ))}

          <AnimatePresence mode="popLayout">
            {days.map((date, index) => {
              const shift = getShiftForDate(date);
              const isToday = isSameDay(date, today);
              const dateKey = formatDateKey(date);
              const holiday = holidays[dateKey];
              const isHoliday = !!holiday;

              const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    relative flex flex-col items-center justify-center cursor-pointer transition-all duration-150 group
                    rounded-lg md:rounded-xl
                    min-h-[90px] md:min-h-0
                    /* BEZEL FRAME EFFECT - Inspired by the form fields */
                    bg-[#161d2a]
                    border-2
                    ${isToday ? 'border-[#00a8ff]' : (isHoliday ? 'border-rose-900/50' : 'border-[#2d3748]')}
                    shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)]
                    hover:bg-[#1c2538] hover:border-[#4b5563]
                    ${isWeekend ? 'bg-[#1a1c22]' : ''}
                    ${isHoliday ? 'bg-[#1f1619]' : ''}
                  `}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(date);
                  }}
                  onPointerEnter={() => handlePointerEnter(date)}
                >
                  {/* HOLIDAY RIBBON - 45 DEGREE ROTATED */}
                  {isHoliday && (
                    <div className="absolute top-0 right-0 w-12 md:w-16 h-12 md:h-16 overflow-hidden rounded-tr-lg pointer-events-none z-20">
                      <div className="absolute top-2 md:top-3 -right-5 md:-right-6 w-16 md:w-24 bg-[#ff4757] text-white text-[6px] md:text-[8px] font-black uppercase tracking-widest text-center py-0.5 md:py-1 rotate-45 shadow-lg border-y border-white/10">
                        {holiday.name}
                      </div>
                    </div>
                  )}

                  {/* DAY NUMBER */}
                  <div
                    className={`
                      absolute top-2.5 left-3 text-sm md:text-lg font-black transition-all z-10
                      ${isToday ? 'text-[#00a8ff]' : (isHoliday ? 'text-[#ff4757]' : (isWeekend ? 'text-slate-600' : 'text-slate-400'))}
                      opacity-80
                    `}
                  >
                    {date.getDate()}
                  </div>

                  {/* SHIFT CONTENT */}
                  <AnimatePresence mode="wait">
                    {shift ? (
                      <motion.div
                        key={shift.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-[88%] h-[78%] rounded-lg flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
                        style={{
                          backgroundColor: shift.color,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10"></div>
                        <span className="text-base md:text-3xl font-black text-white drop-shadow-md tracking-tighter">{shift.code}</span>
                        <div className="flex items-center space-x-1 mt-0.5 opacity-90">
                          <i className="fa-solid fa-clock text-[8px] md:text-[10px] text-white/80"></i>
                          <span className="text-[9px] md:text-[11px] text-white font-black">{shift.startTime}</span>
                        </div>
                      </motion.div>
                    ) : (
                      /* Hover Hint like the 'REGISTRAR QSO' button color but subtle */
                      <div className="w-full h-full opacity-0 group-hover:opacity-5 transition-opacity bg-[#00a8ff] rounded-lg" />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};