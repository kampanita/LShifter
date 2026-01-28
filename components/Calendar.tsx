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
    <div className="flex-1 flex flex-col bg-[#CBD5E1] overflow-hidden select-none p-2 md:p-8">
      {/* EXTRUSION BACKGROUND - DARKER TO MAKE WHITE POP */}
      <div className="flex-1 flex flex-col bg-slate-300/50 rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner overflow-hidden relative">

        {/* TOP DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent z-20"></div>

        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 pt-6 md:pt-10 pb-3 md:pb-5 bg-white/40 backdrop-blur-md sticky top-0 z-40 border-b border-slate-300/50 shadow-sm">
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
          className="flex-1 grid grid-cols-7 relative overflow-y-auto hide-scrollbar z-10 p-2 md:p-4"
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="m-2 md:m-3.5 opacity-0" />
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, zIndex: 30 }}
                  className={`
                    relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                    m-2 md:m-3.5 rounded-2xl md:rounded-[2.2rem]
                    min-h-[95px] md:min-h-0
                    ${isToday ? 'bg-white' : (isHoliday ? 'bg-rose-50' : (isWeekend ? 'bg-amber-100' : 'bg-white'))}
                    /* ULTRA EXTRUDED BEZEL EFFECT */
                    shadow-[
                      14px_14px_28px_rgba(0,0,0,0.15),
                      -10px_-10px_20px_rgba(255,255,255,0.9),
                      0_0_0_1px_rgba(0,0,0,0.08)
                    ]
                    hover:shadow-[
                      20px_20px_40px_rgba(0,0,0,0.2),
                      -12px_-12px_24px_rgba(255,255,255,1),
                      0_0_0_1px_rgba(79,70,229,0.3)
                    ]
                    active:shadow-[
                      inset_8px_8px_16px_rgba(0,0,0,0.15),
                      inset_-8px_-8px_16px_rgba(255,255,255,0.8)
                    ]
                    active:scale-[0.96]
                  `}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(date);
                  }}
                  onPointerEnter={() => handlePointerEnter(date)}
                >
                  {/* HOLIDAY RIBBON - 45 DEGREE ROTATED */}
                  {isHoliday && (
                    <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 overflow-hidden rounded-tr-[2.2rem] pointer-events-none z-20">
                      <div className="absolute top-4 md:top-6 -right-6 md:-right-8 w-24 md:w-36 bg-gradient-to-r from-rose-500 to-rose-700 text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest text-center py-1.5 md:py-2 rotate-45 shadow-lg border-y border-white/30">
                        {holiday.name}
                      </div>
                    </div>
                  )}

                  {/* DAY NUMBER */}
                  <div
                    className={`
                      absolute top-5 left-6 text-xs md:text-base font-black transition-all z-10
                      ${isToday ? 'text-indigo-600' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-amber-800' : 'text-slate-700'))}
                      drop-shadow-[0_1px_0_rgba(255,255,255,1)]
                    `}
                  >
                    {date.getDate()}
                    {isToday && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2 h-2 bg-indigo-600 rounded-full mx-auto mt-1.5 shadow-[0_0_10px_rgba(79,70,229,0.6)]"
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
                        className="w-[84%] h-[74%] rounded-2xl flex flex-col items-center justify-center shadow-xl relative overflow-hidden"
                        style={{
                          backgroundColor: shift.color,
                          border: '4px solid white',
                          boxShadow: `0 15px 30px -10px ${shift.color}88`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                        <span className="text-base md:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tighter">{shift.code}</span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <i className="fa-solid fa-clock text-[8px] md:text-[11px] text-white/80"></i>
                          <span className="text-[9px] md:text-[12px] text-white font-black tracking-tight">{shift.startTime}</span>
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