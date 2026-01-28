import React, { useMemo } from 'react';
import { ShiftType, DayAssignment } from '../types';
import { getDaysInMonth, getPaddingDays, formatDateKey, isSameDay } from '../helpers';

interface Props {
  currentDate: Date;
  assignments: Record<string, DayAssignment>;
  shiftTypes: ShiftType[];
  selectedShiftTypeId: string | null;
  onPaint: (date: Date) => void;
  isPainting: boolean;
  setIsPainting: (v: boolean) => void;
}

export const Calendar: React.FC<Props> = ({
  currentDate,
  assignments,
  shiftTypes,
  selectedShiftTypeId,
  onPaint,
  isPainting,
  setIsPainting,
}) => {
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const paddingDays = useMemo(() => getPaddingDays(currentDate), [currentDate]);

  // Updated to start on Monday
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
    <div className="flex-1 flex flex-col bg-white overflow-hidden select-none">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {daysOfWeek.map((day, index) => (
          <div 
            key={day} 
            className={`
              py-2 text-center text-xs font-semibold uppercase tracking-wider
              ${index >= 5 ? 'text-indigo-400' : 'text-slate-500'} 
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 h-full relative"
           onPointerUp={() => setIsPainting(false)}
           onPointerLeave={() => setIsPainting(false)}
      >
        {/* Padding Days */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="bg-slate-50/50 border-r border-b border-slate-100" />
        ))}

        {/* Actual Days */}
        {days.map((date) => {
          const shift = getShiftForDate(date);
          const isToday = isSameDay(date, today);
          const dateKey = formatDateKey(date);
          const hasNote = assignments[dateKey]?.note;
          
          const dayOfWeek = date.getDay(); // 0 is Sun, 6 is Sat
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          // Background Logic: Today > Weekend > Weekday
          let bgClass = 'bg-white';
          if (isToday) bgClass = 'bg-indigo-50';
          else if (isWeekend) bgClass = 'bg-slate-50'; // Slightly darker for weekends

          return (
            <div
              key={dateKey}
              className={`
                relative border-r border-b border-slate-100 flex flex-col items-center justify-center cursor-pointer transition-colors duration-75
                ${bgClass}
                active:opacity-80
              `}
              onPointerDown={(e) => {
                e.preventDefault(); // Prevent scroll on touch
                handlePointerDown(date);
              }}
              onPointerEnter={() => handlePointerEnter(date)}
            >
              {/* Day Number */}
              <span
                className={`
                  absolute top-2 left-2 text-sm font-medium z-10
                  ${isToday ? 'text-indigo-600' : (isWeekend ? 'text-slate-500' : 'text-slate-400')}
                  ${shift ? 'text-white drop-shadow-md' : ''}
                `}
              >
                {date.getDate()}
              </span>

              {/* Note Indicator */}
              {hasNote && (
                 <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 border border-white z-10"></div>
              )}

              {/* Shift Content */}
              {shift ? (
                <div
                  className="absolute inset-1 rounded-lg flex flex-col items-center justify-center shadow-sm animate-pulse-once"
                  style={{ backgroundColor: shift.color }}
                >
                  <span className="text-xl font-bold text-white drop-shadow-md">{shift.code}</span>
                  <span className="text-[10px] text-white opacity-90 font-medium">
                    {shift.startTime}-{shift.endTime}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full hover:bg-slate-100/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};