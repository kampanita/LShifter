import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentDate: Date;
    onChange: (date: Date) => void;
}

export const MonthPicker: React.FC<Props> = ({ isOpen, onClose, currentDate, onChange }) => {
    if (!isOpen) return null;

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in p-8">
                <h3 className="text-xl font-black text-slate-800 mb-6 text-center uppercase tracking-tighter">Seleccionar Fecha</h3>

                <div className="space-y-6">
                    {/* Year Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {years.map(y => (
                            <button
                                key={y}
                                onClick={() => onChange(new Date(y, currentDate.getMonth(), 1))}
                                className={`py-2 rounded-xl text-xs font-bold transition-all ${y === currentDate.getFullYear() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => {
                                    onChange(new Date(currentDate.getFullYear(), i, 1));
                                    onClose();
                                }}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === currentDate.getMonth() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {m.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};
