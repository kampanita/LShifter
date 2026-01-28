import React, { useMemo } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { getDaysInMonth, formatDateKey } from '../helpers';

interface Props {
    currentDate: Date;
    assignments: Record<string, DayAssignment>;
    shiftTypes: ShiftType[];
    holidays: Record<string, Holiday>;
}

export const StatisticsView: React.FC<Props> = ({ currentDate, assignments, shiftTypes, holidays }) => {
    const stats = useMemo(() => {
        const days = getDaysInMonth(currentDate);

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
                    const duration = shift.default_duration || 0;
                    const dayOfWeek = day.getDay();
                    const isHoliday = !!holidays[key];
                    const isSunday = dayOfWeek === 0;
                    const isSpecial = isHoliday || isSunday || dayOfWeek === 6; // Sunday, Holiday, Saturday

                    totalHours += duration;

                    if (isHoliday || isSunday) {
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
    }, [currentDate, assignments, shiftTypes, holidays]);

    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] min-h-0">
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Análisis de Datos</h2>
                        <p className="text-slate-500 font-medium capitalize">Resumen de {monthName}</p>
                    </div>

                    <div className="grid grid-cols-2 lg:flex items-center gap-3 md:gap-6 bg-white p-4 md:px-6 md:py-4 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="text-center md:text-left px-2">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Horas</span>
                            <span className="text-xl md:text-2xl font-black text-indigo-600 leading-none">{stats.totalHours.toFixed(1)}h</span>
                        </div>
                        <div className="hidden md:block w-px h-10 bg-slate-100"></div>
                        <div className="text-center md:text-left px-2">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Días Trabajados</span>
                            <span className="text-xl md:text-2xl font-black text-slate-800 leading-none">{stats.normalDaysCount + stats.specialDaysCount}</span>
                        </div>
                    </div>
                </div>

                {/* Main Breakdown Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* TABULATED DATA - List style */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                <i className="fa-solid fa-list-check mr-3 text-indigo-500"></i>
                                Resumen Tabulado
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Día</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jornadas</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Horas Totales</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="group">
                                            <td className="py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                    <span className="text-sm font-bold text-slate-700">Días Laborables Normales</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center text-sm font-black text-slate-800">{stats.normalDaysCount}</td>
                                            <td className="py-4 text-right text-sm font-black text-emerald-600">{stats.normalHours.toFixed(1)}h</td>
                                        </tr>
                                        <tr className="group">
                                            <td className="py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                                    <span className="text-sm font-bold text-slate-700">Dom. / Festivos / Especiales</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center text-sm font-black text-slate-800">{stats.specialDaysCount}</td>
                                            <td className="py-4 text-right text-sm font-black text-rose-600">{stats.specialHours.toFixed(1)}h</td>
                                        </tr>
                                        <tr className="bg-slate-50/50">
                                            <td className="py-4 px-2 text-xs font-black text-slate-400 uppercase">TOTAL MENSUAL</td>
                                            <td className="py-4 text-center text-sm font-black text-slate-900">{stats.normalDaysCount + stats.specialDaysCount}</td>
                                            <td className="py-4 text-right text-sm font-black text-indigo-600">{stats.totalHours.toFixed(1)}h</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* TABLE PER SHIFT TYPE */}
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                <i className="fa-solid fa-tags mr-3 text-indigo-500"></i>
                                Desglose por Turno
                            </h3>

                            <div className="space-y-4">
                                {shiftTypes.map(shift => {
                                    const shiftStat = stats.shiftStats[shift.id];
                                    if (!shiftStat || shiftStat.count === 0) return null;

                                    return (
                                        <div key={shift.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-2xl shadow-sm border-2 border-white flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: shift.color }}>
                                                    {shift.code}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">{shift.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {shiftStat.count} asignaciones
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-black text-slate-800">{shiftStat.hours.toFixed(1)}h</span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase">Acumulado</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Charts & Highlights Sidebar */}
                    <div className="space-y-6">

                        {/* Circular Chart Placeholder / Simple visualization */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
                            <h4 className="w-full text-left text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">Porcentaje de Jornada</h4>
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                                    <circle
                                        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * (stats.totalHours / 160))} // Assuming 160h is standard month
                                        className="text-indigo-500 transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800">{((stats.totalHours / 160) * 100).toFixed(0)}%</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Carga Laboral</span>
                                </div>
                            </div>
                        </div>

                        {/* PRESENCE CARD */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <i className="fa-solid fa-calendar-check text-6xl"></i>
                            </div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Presencia Mensual</h4>
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-4xl font-black leading-none">
                                        {(((stats.normalDaysCount + stats.specialDaysCount) / stats.totalDays) * 100).toFixed(0)}%
                                    </span>
                                    <p className="text-sm font-medium text-slate-400 mt-1">Días trabajados</p>
                                </div>
                                <div className="flex space-x-1 items-end h-10">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div key={i} className="w-1.5 bg-indigo-500/40 rounded-t-sm" style={{ height: `${30 + Math.random() * 70}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100/50">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-200/50 flex items-center justify-center text-amber-700">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                </div>
                                <span className="text-xs font-black text-amber-900 uppercase tracking-tighter">Nota Informativa</span>
                            </div>
                            <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
                                Los domingos y festivos registrados se contabilizan como <span className="text-amber-950 font-bold underline decoration-amber-300">Jornadas Especiales</span> a efectos de cálculo de horas extra o nocturnidad.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
