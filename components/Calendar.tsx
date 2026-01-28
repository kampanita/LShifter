import React, { useMemo } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { getDaysInMonth, getPaddingDays, formatDateKey, isSameDay } from '../helpers';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

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

  // DEBUG: Log holidays
  React.useEffect(() => {
    console.log("🎄 CALENDAR - Holidays received:", holidays);
    console.log("🎄 CALENDAR - Holiday keys:", Object.keys(holidays));
    console.log("🎄 CALENDAR - Current month:", currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [holidays, currentDate]);

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [5, -5]);
  const rotateY = useTransform(x, [-500, 500], [-5, 5]);

  const springConfig = { damping: 20, stiffness: 100 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsPainting(false);
  };

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
    <div
      className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden select-none p-2 md:p-8 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D SCENE BACKGROUND - SUBTLE GRID */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* CALENDAR BODY - 3D CONTAINER */}
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className="flex-1 flex flex-col bg-white/70 backdrop-blur-xl rounded-[1.5rem] md:rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.7)] overflow-hidden relative border border-white/40"
      >
        {/* LIGHT REFLECTION EFFECT */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-white/10 z-30"></div>

        {/* TOP DECORATION - PREMIUM BEZEL */}
        <div className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-slate-50/50 backdrop-blur-md flex justify-around items-center px-6 md:px-12 z-20 border-b border-white/20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-1.5 md:w-3 h-1.5 md:h-3 rounded-full bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] border border-slate-200"></div>
          ))}
        </div>

        {/* WEEK HEADER */}
        <div
          className="grid grid-cols-7 pt-8 md:pt-12 pb-3 md:pb-5 bg-white/30 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50"
          style={{ transform: "translateZ(30px)" }}
        >
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`
                text-center text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em]
                ${index >= 5 ? 'text-rose-500/80' : 'text-slate-400'} 
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
          style={{
            gridAutoRows: '1fr',
          }}
        >
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="bg-slate-50/20 border-r border-b border-slate-100/30" />
          ))}

          <AnimatePresence mode="popLayout">
            {days.map((date, index) => {
              const shift = getShiftForDate(date);
              const isToday = isSameDay(date, today);
              const dateKey = formatDateKey(date);
              const holiday = holidays[dateKey];
              const isHoliday = !!holiday;

              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, scale: 0.9, z: -10 }}
                  animate={{ opacity: 1, scale: 1, z: 0 }}
                  transition={{ delay: (index % 7) * 0.02 + Math.floor(index / 7) * 0.01 }}
                  className={`
                    relative border-r border-b border-slate-100/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                    min-h-[75px] md:min-h-0
                    ${isToday ? 'bg-indigo-50/60' : (isHoliday ? 'bg-rose-50/40' : (isWeekend ? 'bg-slate-50/30' : 'bg-transparent'))}
                    hover:bg-white/80 hover:z-20 hover:scale-[1.02] hover:shadow-2xl
                  `}
                  style={{ transformStyle: "preserve-3d" }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(date);
                  }}
                  onPointerEnter={() => handlePointerEnter(date)}
                >
                  {/* DAY NUMBER */}
                  <div
                    className={`
                      absolute top-2 md:top-4 left-3 md:left-5 text-xs md:text-sm font-black transition-all z-10
                      ${isToday ? 'text-indigo-600' : (isHoliday ? 'text-rose-600' : (isWeekend ? 'text-slate-400' : 'text-slate-500'))}
                    `}
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {date.getDate()}
                    {isToday && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1 shadow-lg shadow-indigo-300"></motion.div>}
                  </div>

                  {/* HOLIDAY RIBBON */}
                  {isHoliday && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-0 right-0 overflow-hidden w-16 md:w-28 h-16 md:h-28 pointer-events-none z-20"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      <div className="absolute top-4 md:top-7 -right-8 md:-right-10 w-28 md:w-44 bg-gradient-to-r from-rose-500 to-rose-700 text-white text-[7px] md:text-[11px] font-black uppercase tracking-widest text-center py-1.5 md:py-2.5 rotate-45 shadow-xl border-y border-white/20">
                        {holiday.name}
                      </div>
                    </motion.div>
                  )}

                  {/* SHIFT CONTENT */}
                  <AnimatePresence mode="wait">
                    {shift ? (
                      <motion.div
                        key={shift.id}
                        initial={{ scale: 0, rotateY: 90, z: 0 }}
                        animate={{ scale: 1, rotateY: 0, z: 50 }}
                        exit={{ scale: 0, rotateY: -90, z: 0 }}
                        whileHover={{ scale: 1.08, z: 70 }}
                        className="w-[88%] h-[80%] rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] relative overflow-hidden active:scale-95 transition-all"
                        style={{
                          backgroundColor: shift.color,
                          border: '2px solid rgba(255,255,255,0.8)',
                          transformStyle: "preserve-3d"
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50"></div>
                        <span className="text-sm md:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tighter" style={{ transform: "translateZ(20px)" }}>{shift.code}</span>
                        <div className="flex items-center space-x-1.5 mt-1" style={{ transform: "translateZ(10px)" }}>
                          <i className="fa-solid fa-clock text-[7px] md:text-[10px] text-white/80"></i>
                          <span className="text-[8px] md:text-[11px] text-white font-black tracking-tight">{shift.startTime}</span>
                        </div>
                        {/* 3D SIDE SIDES - CSS Simulation */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/20" style={{ transform: "rotateY(90deg) translateZ(10px)" }}></div>
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/20" style={{ transform: "rotateY(-90deg) translateZ(10px)" }}></div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full opacity-0 group-hover:opacity-100 group-hover:bg-indigo-50/50 transition-all duration-300" />
                    )}
                  </AnimatePresence>

                  {/* GLOW EFFECT ON HOVER */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, transparent 70%)"></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* FOOTER SHADOW */}
      <div className="h-6 md:h-12 mx-12 md:mx-20 bg-black/5 rounded-full blur-3xl -mt-6 md:-mt-10 pointer-events-none"></div>
    </div>
  );
};