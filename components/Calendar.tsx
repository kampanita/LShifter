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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden select-none p-2 md:p-8">
      {/* MODERN GLASS CONTAINER */}
      <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden relative">

        {/* TOP DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-20"></div>

        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 pt-6 md:pt-10 pb-3 md:pb-5 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-50">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]
                ${index >= 5 ? 'text-rose-500' : 'text-slate-400'} 
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* DAYS GRID */}
        <div
          className="flex-1 grid grid-cols-7 relative overflow-y-auto hide-scrollbar z-10"
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="bg-slate-50/30 border-r border-b border-slate-50" />
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

              // Visual priority: Today > Holiday > Weekend > Normal
              let cellBg = 'bg-transparent';
              let textColors = 'text-slate-600';

              if (isToday) {
                cellBg = 'bg-indigo-50/50';
                textColors = 'text-indigo-600';
              } else if (isHoliday) {
                cellBg = 'bg-rose-50/60';
                textColors = 'text-rose-600';
              } else if (isWeekend) {
                cellBg = 'bg-amber-50/40'; // Distinct warm color for weekends
                textColors = 'text-amber-600/80';
              }

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group
                    m-1.5 md:m-2.5 rounded-2xl md:rounded-[1.8rem]
                    min-h-[85px] md:min-h-0
                    ${isToday ? 'bg-indigo-50/30' : (isHoliday ? 'bg-rose-50/40' : (isWeekend ? 'bg-slate-100/50' : 'bg-white'))}
                    /* EXTRUDED BEZEL EFFECT */
                    shadow-[
                      8px_8px_16px_rgba(0,0,0,0.06),
                      -8px_-8px_16px_rgba(255,255,255,0.9),
                      inset_0_0_0_1px_rgba(255,255,255,0.5)
                    ]
                    hover:shadow-[
                      12px_12px_24px_rgba(0,0,0,0.08),
                      -12px_-12px_24px_rgba(255,255,255,1),
                      inset_0_0_0_1px_rgba(79,70,229,0.1)
                    ]
                    active:shadow-[
                      inset_4px_4px_8px_rgba(0,0,0,0.05),
                      inset_-4px_-4px_8px_rgba(255,255,255,0.8)
                    ]
                    active:scale-[0.98]
                  `}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(date);
                  }}
                  onPointerEnter={() => handlePointerEnter(date)}
                >
                  {/* INNER BEZEL LINE */}
                  <div className="absolute inset-2 rounded-[1.2rem] border border-slate-100/50 pointer-events-none"></div>

                  {/* DAY NUMBER */}
                  <div
                    className={`
                      absolute top-4 left-5 text-xs md:text-sm font-black transition-all z-10
                      ${isToday ? 'text-indigo-600' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-slate-400' : 'text-slate-500'))}
                    `}
                  >
                    {date.getDate()}
                    {isToday && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1 shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>}
                  </div>

                  {/* HOLIDAY LABEL */}
                  {isHoliday && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-rose-500 rounded-lg shadow-lg shadow-rose-200 z-20">
                      <span className="text-[7px] md:text-[9px] font-black text-white uppercase whitespace-nowrap">
                        {holiday.name}
                      </span>
                    </div>
                  )}

                  {/* SHIFT CONTENT */}
                  <AnimatePresence mode="wait">
                    {shift ? (
                      <motion.div
                        key={shift.id}
                        initial={{ scale: 0.8, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-[82%] h-[72%] rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
                        style={{
                          backgroundColor: shift.color,
                          border: '3px solid white',
                          boxShadow: `0 10px 20px -5px ${shift.color}44`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <span className="text-sm md:text-2xl font-black text-white drop-shadow-md tracking-tighter">{shift.code}</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <i className="fa-solid fa-clock text-[7px] md:text-[9px] text-white/70"></i>
                          <span className="text-[8px] md:text-[10px] text-white font-black">{shift.startTime}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full opacity-0 group-hover:opacity-5 transition-opacity bg-indigo-500 rounded-2xl" />
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