import React, { useMemo } from 'react';
import { ShiftType, DayAssignment, Holiday } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface Props {
    currentDate: Date;
    assignments: Record<string, DayAssignment>;
    shiftTypes: ShiftType[];
    holidays: Record<string, Holiday>;
}

export const StatisticsView: React.FC<Props> = ({ currentDate, assignments, shiftTypes, holidays }) => {
    const stats = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        let totalHours = 0;
        let shiftCounts: Record<string, number> = {};
        let holidayShifts = 0;
        let weekendShifts = 0;

        days.forEach(day => {
            const key = format(day, 'yyyy-MM-dd');
            const assignment = assignments[key];
            if (assignment?.shiftTypeId) {
                const shift = shiftTypes.find(s => s.id === assignment.shiftTypeId);
                if (shift) {
                    totalHours += shift.default_duration || 0;
                    shiftCounts[shift.id] = (shiftCounts[shift.id] || 0) + 1;

                    if (holidays[key]) holidayShifts++;
                    const dayOfWeek = day.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) weekendShifts++;
                }
            }
        });

        return { totalHours, shiftCounts, holidayShifts, weekendShifts, totalDays: days.length };
    }, [currentDate, assignments, shiftTypes, holidays]);

    return (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Análisis de Datos</h2>
                    <p className="text-slate-500 font-medium">Resumen estadístico de {format(currentDate, 'MMMM yyyy')}</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6">
                    <div className="text-center">
                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Horas</span>
                        <span className="text-2xl font-black text-indigo-600 leading-none">{stats.totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="text-center">
                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Turnos Realizados</span>
                        <span className="text-2xl font-black text-slate-800 leading-none">{Object.values(stats.shiftCounts).reduce((a, b) => a + b, 0)}</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Distribution Card */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center">
                        <i className="fa-solid fa-chart-pie mr-3 text-indigo-500"></i>
                        Distribución de Turnos
                    </h3>

                    <div className="flex-1 space-y-6">
                        {shiftTypes.map(shift => {
                            const count = stats.shiftCounts[shift.id] || 0;
                            const totalTurnos = Object.values(stats.shiftCounts).reduce((a, b) => a + b, 0);
                            const percentage = totalTurnos > 0 ? (count / totalTurnos) * 100 : 0;

                            if (count === 0) return null;

                            return (
                                <div key={shift.id} className="group">
                                    <div className="flex justify-between items-end mb-2 px-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-xl shadow-sm border-2 border-white flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: shift.color }}>
                                                {shift.code}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{shift.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-slate-800">{count} días</span>
                                            <span className="ml-2 text-xs font-bold text-slate-400">({percentage.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: shift.color,
                                                boxShadow: `0 0 15px ${shift.color}44`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}

                        {Object.keys(stats.shiftCounts).length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-300">
                                <i className="fa-solid fa-calendar-minus text-5xl mb-4"></i>
                                <p className="font-bold uppercase tracking-widest text-xs">Sin datos registrados este mes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Highlights Sidebar */}
                <div className="space-y-6">

                    {/* Working on Holidays */}
                    <div className="bg-rose-50 rounded-[2rem] p-6 border border-rose-100/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Días Especiales</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-4xl font-black text-rose-600 leading-none">{stats.holidayShifts}</span>
                                <p className="text-sm font-bold text-rose-800/60 mt-1">Sáb/Dom/Festivos</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
                                <i className="fa-solid fa-umbrella-beach text-xl"></i>
                            </div>
                        </div>
                    </div>

                    {/* Efficiency card */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className="fa-solid fa-bolt text-6xl"></i>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Presencia Mensual</h4>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-4xl font-black leading-none">
                                    {((Object.values(stats.shiftCounts).reduce((a, b) => a + b, 0) / stats.totalDays) * 100).toFixed(0)}%
                                </span>
                                <p className="text-sm font-medium text-slate-400 mt-1">Días activos</p>
                            </div>
                            <div className="h-12 w-24 flex items-end justify-between space-x-1 pb-1">
                                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                    <div key={i} className="w-2 bg-indigo-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <i className="fa-solid fa-circle-info"></i>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Las estadísticas se calculan en base a la <span className="text-slate-800 font-bold">duración por defecto</span> configurada en tus tipos de turno.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
