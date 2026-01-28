import React, { useMemo, useState, useEffect } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { getDaysInMonth, formatDateKey } from '../helpers';

interface Props {
    currentDate: Date;
    assignments: Record<string, DayAssignment>;
    shiftTypes: ShiftType[];
    holidays: Record<string, Holiday>;
}

export const StatisticsView: React.FC<Props> = ({ currentDate: initialDate, assignments, shiftTypes, holidays }) => {
    const [viewDate, setViewDate] = useState(initialDate);
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

    // Sync if parent updates, but allow internal navigation
    useEffect(() => {
        setViewDate(initialDate);
    }, [initialDate]);

    const calculateStats = (days: Date[]) => {
        let totalHours = 0;
        let normalHours = 0;
        let specialHours = 0;
        let normalDaysCount = 0;
        let specialDaysCount = 0;
        let shiftStats: Record<string, { count: number; hours: number }> = {};

        days.forEach(day => {
            const key = formatDateKey(day);
            const assignment = assignments[key];

            if (assignment?.shiftTypeId) {
                const shift = shiftTypes.find(s => s.id === assignment.shiftTypeId);
                if (shift) {
                    const duration = Number(shift.default_duration) || 0;
                    const dayOfWeek = day.getDay();
                    const isHoliday = !!holidays[key];
                    const isSunday = dayOfWeek === 0;
                    // Note: User mentioned Sundays and Holidays count as special. Saturdays too based on prev code?
                    // Previous code: isHoliday || isSunday || dayOfWeek === 6

                    totalHours += duration;

                    if (isHoliday || isSunday || dayOfWeek === 6) {
                        specialHours += duration;
                        specialDaysCount++;
                    } else {
                        normalHours += duration;
                        normalDaysCount++;
                    }

                    if (!shiftStats[shift.id]) {
                        shiftStats[shift.id] = { count: 0, hours: 0 };
                    }
                    shiftStats[shift.id].count++;
                    shiftStats[shift.id].hours += duration;
                }
            }
        });

        return {
            totalHours,
            normalHours,
            specialHours,
            normalDaysCount,
            specialDaysCount,
            shiftStats,
            totalDays: days.length
        };
    };

    const stats = useMemo(() => {
        if (viewMode === 'month') {
            const days = getDaysInMonth(viewDate);
            return calculateStats(days);
        } else {
            // Year Mode
            let yearDays: Date[] = [];
            for (let m = 0; m < 12; m++) {
                const d = new Date(viewDate.getFullYear(), m, 1);
                yearDays = [...yearDays, ...getDaysInMonth(d)];
            }
            return calculateStats(yearDays);
        }
    }, [viewDate, viewMode, assignments, shiftTypes, holidays]);

    // Monthly breakdown for Year View
    const monthlyBreakdown = useMemo(() => {
        if (viewMode !== 'year') return [];
        const months = [];
        for (let m = 0; m < 12; m++) {
            const d = new Date(viewDate.getFullYear(), m, 1);
            const days = getDaysInMonth(d);
            const mStats = calculateStats(days);
            months.push({
                name: d.toLocaleString('es-ES', { month: 'long' }),
                stats: mStats
            });
        }
        return months;
    }, [viewDate, viewMode, assignments, shiftTypes, holidays]);

    const handlePrev = () => {
        if (viewMode === 'month') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() - 1, 0, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() + 1, 0, 1));
        }
    };

    const titleLabel = viewMode === 'month'
        ? viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
        : `Año ${viewDate.getFullYear()}`;

    // Calculate max potential hours for charts (approx)
    // Month: ~160h. Year: ~1920h.
    const maxHoursRef = viewMode === 'month' ? 160 : 1920;

    return (
        <div className="absolute inset-0 overflow-y-auto bg-[#F8FAFC]">
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                {/* Control Header */}
                <div className="bg-white rounded-[2rem] p-4 md:px-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setViewMode('year')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Anual
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={handlePrev} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <h2 className="text-xl font-black text-slate-800 capitalize min-w-[150px] text-center">
                            {titleLabel}
                        </h2>
                        <button onClick={handleNext} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* High Level Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Total Horas</span>
                        <span className="text-3xl font-black text-indigo-600">{stats.totalHours.toFixed(1)}</span>
                        <span className="text-xs font-bold text-slate-400 ml-1">h</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Jornadas Totales</span>
                        <span className="text-3xl font-black text-slate-800">{stats.normalDaysCount + stats.specialDaysCount}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Especiales / Festivos</span>
                        <span className="text-3xl font-black text-rose-500">{stats.specialDaysCount}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Horas Normales</span>
                        <span className="text-3xl font-black text-emerald-500">{stats.normalHours.toFixed(1)}</span>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Shift Counts */}
                    <div className="lg:col-span-2 space-y-6">
                        {viewMode === 'year' && (
                            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                    <i className="fa-solid fa-calendar-days mr-3 text-indigo-500"></i>
                                    Desglose Mensual
                                </h3>
                                <div className="space-y-1">
                                    {monthlyBreakdown.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <span className="text-sm font-bold text-slate-700 capitalize w-32">{m.name}</span>

                                            <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min((m.stats.totalHours / 180) * 100, 100)}%` }} // normalized to ~180h max
                                                ></div>
                                            </div>

                                            <div className="text-right w-24">
                                                <span className="block text-sm font-black text-slate-800">{m.stats.totalHours.toFixed(1)}h</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                <i className="fa-solid fa-tags mr-3 text-indigo-500"></i>
                                {viewMode === 'year' ? 'Acumulado por Tipo' : 'Desglose por Turno'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shiftTypes.map(shift => {
                                    const shiftStat = stats.shiftStats[shift.id];
                                    if (!shiftStat || shiftStat.count === 0) return null;

                                    return (
                                        <div key={shift.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: shift.color }}>
                                                    {shift.code}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">{shift.name}</h4>
                                                    <p className="text-[10px] text-slate-400">{shiftStat.count} asignaciones</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-slate-800">{shiftStat.hours.toFixed(1)}h</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Charts Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">% Carga Laboral ({viewMode === 'year' ? 'Anual' : 'Mensual'})</h4>
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                                    <circle
                                        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * (stats.totalHours / maxHoursRef))}
                                        className="text-indigo-500 transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800">{((stats.totalHours / maxHoursRef) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-4 px-4 font-medium">Basado en un estándar de {maxHoursRef} horas</p>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Resumen Ejecutivo</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                En este periodo has acumulado <strong className="text-white">{stats.totalHours.toFixed(1)} horas</strong> de trabajo,
                                con <strong className="text-emerald-400">{stats.normalDaysCount} jornadas estándar</strong> y <strong className="text-rose-400">{stats.specialDaysCount} jornadas especiales</strong>.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Detailed Table Stats */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                        <i className="fa-solid fa-table mr-3 text-indigo-500"></i>
                        Detalle Tabular
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Turno</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Asignaciones</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Horas Totales</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">% del Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {shiftTypes
                                    .filter(shift => stats.shiftStats[shift.id]?.count > 0)
                                    .sort((a, b) => (stats.shiftStats[b.id]?.hours || 0) - (stats.shiftStats[a.id]?.hours || 0))
                                    .map(shift => {
                                        const stat = stats.shiftStats[shift.id];
                                        const percentage = stats.totalHours > 0 ? (stat.hours / stats.totalHours) * 100 : 0;
                                        return (
                                            <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-sm" style={{ backgroundColor: shift.color }}>
                                                            {shift.code}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{shift.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-600">
                                                    {stat.count}
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-slate-800">
                                                    {stat.hours.toFixed(1)}h
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-400">
                                                    {percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                <tr className="bg-slate-50/50">
                                    <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-widest text-xs">Total</td>
                                    <td className="px-6 py-4 text-center font-black text-slate-800 text-xs">
                                        {Object.values(stats.shiftStats).reduce((acc, curr) => acc + curr.count, 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-indigo-600 text-lg">
                                        {stats.totalHours.toFixed(1)}h
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-400">100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
