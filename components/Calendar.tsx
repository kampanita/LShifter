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
    <div className="flex-1 flex flex-col bg-[#F1F5F9] overflow-hidden select-none p-2 md:p-8">
      {/* PROFESSIONAL LIGHT PANEL WITH EXTRUDED FRAME LOOK */}
      <div className="flex-1 flex flex-col bg-[#E2E8F0] rounded-[1.2rem] md:rounded-[2rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative">

        {/* HEADER BAR */}
        <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 z-20"></div>

        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 pt-4 md:pt-8 pb-2 md:pb-4 bg-slate-100/80 backdrop-blur-md border-b border-slate-300/50 sticky top-0 z-40">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]
                ${index >= 5 ? 'text-rose-600' : 'text-slate-500'} 
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* DAYS GRID */}
        <div
          className="flex-1 grid grid-cols-7 relative overflow-y-auto hide-scrollbar z-10 p-2 md:p-4 gap-2 md:gap-4"
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
                  whileHover={{ zIndex: 30 }}
                  className={`
                    relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group
                    rounded-xl md:rounded-2xl
                    min-h-[90px] md:min-h-0
                    /* RECESSED BEZEL EFFECT - Professional and Clean */
                    ${isToday ? 'bg-indigo-50' : (isHoliday ? 'bg-rose-100/80' : (isWeekend ? 'bg-amber-100/70' : 'bg-white'))}
                    border-2
                    ${isToday ? 'border-indigo-400' : (isHoliday ? 'border-rose-300' : 'border-slate-300')}
                    shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)]
                    hover:border-indigo-300
                  `}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(date);
                  }}
                  onPointerEnter={() => handlePointerEnter(date)}
                >
                  {/* HOLIDAY RIBBON - 45 DEGREE ROTATED */}
                  {isHoliday && (
                    <div className="absolute top-0 right-0 w-12 md:w-20 h-12 md:h-20 overflow-hidden rounded-tr-xl pointer-events-none z-20">
                      <div className="absolute top-2 md:top-4 -right-5 md:-right-7 w-16 md:w-32 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[6px] md:text-[8px] font-black uppercase tracking-widest text-center py-0.5 md:py-1.5 rotate-45 shadow-md border-y border-white/20">
                        {holiday.name}
                      </div>
                    </div>
                  )}

                  {/* DAY NUMBER */}
                  <div
                    className={`
                      absolute top-3 left-4 text-xs md:text-sm font-black transition-all z-10
                      ${isToday ? 'text-indigo-600' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-amber-700' : 'text-slate-500'))}
                    `}
                  >
                    {date.getDate()}
                    {isToday && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1 shadow-sm"
                      />
                    )}
                  </div>

                  {/* SHIFT CONTENT */}
                  <AnimatePresence mode="wait">
                    {shift ? (
                      <motion.div
                        key={shift.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-[85%] h-[75%] rounded-lg md:rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
                        style={{
                          backgroundColor: shift.color,
                          border: '2px solid white'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                        <span className="text-sm md:text-2xl font-black text-white drop-shadow-sm tracking-tighter">{shift.code}</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <i className="fa-solid fa-clock text-[7px] md:text-[9px] text-white/80"></i>
                          <span className="text-[8px] md:text-[10px] text-white font-bold">{shift.startTime}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500 rounded-xl" />
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