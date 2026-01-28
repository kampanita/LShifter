import React, { useState, useEffect } from 'react';
import { supabase } from '../src/data/supabaseClient';
import { HolidaysImporter } from './HolidaysImporter';

/**
 * DATABASE SCHEMA METADATA
 * Focused on core management tables.
 */
interface TableField {
    name: string;
    label: string;
    type: 'text' | 'date' | 'time' | 'boolean' | 'number' | 'uuid' | 'color';
    required: boolean;
    defaultValue?: any;
    placeholder?: string;
    hiddenInView?: boolean;
    readOnly?: boolean;
}

interface TableDefinition {
    name: string;
    label: string;
    icon: string;
    fields: TableField[];
}

const SCHEMA: Record<string, TableDefinition> = {
    profiles: {
        name: 'profiles',
        label: 'User Profiles',
        icon: 'fa-user-circle',
        fields: [
            { name: 'user_id', label: 'Auth ID', type: 'uuid', required: true, hiddenInView: true },
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'color', label: 'Theme Color', type: 'color', required: false, defaultValue: '#6366f1' },
        ]
    },
    shift_types: {
        name: 'shift_types',
        label: 'Shift Types',
        icon: 'fa-clock',
        fields: [
            { name: 'name', label: 'Shift Name', type: 'text', required: true, placeholder: 'Morning' },
            { name: 'company', label: 'Company', type: 'text', required: false },
            { name: 'color', label: 'Color', type: 'color', required: false, defaultValue: '#10b981' },
            { name: 'default_start', label: 'Start Time', type: 'time', required: false },
            { name: 'default_end', label: 'End Time', type: 'time', required: false },
            { name: 'default_duration', label: 'Duration (Hours)', type: 'number', required: false, readOnly: true },
        ]
    },
    holidays: {
        name: 'holidays',
        label: 'Holidays',
        icon: 'fa-umbrella-beach',
        fields: [
            { name: 'country_code', label: 'Country', type: 'text', required: true, placeholder: 'ES' },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'name', label: 'Holiday Name', type: 'text', required: false },
        ]
    }
};

interface Props {
    tableName: string;
    title: string;
    userId?: string;
}

export const DatabaseCRUD: React.FC<Props> = ({ tableName, title, userId }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [errorNotice, setErrorNotice] = useState<string | null>(null);
    const [isImporterOpen, setIsImporterOpen] = useState(false);

    const tableDef = SCHEMA[tableName];

    const calculateDuration = (start: string, end: string): number | null => {
        if (!start || !end) return null;
        try {
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);
            let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
            if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight
            return Number((diffMinutes / 60).toFixed(2));
        } catch {
            return null;
        }
    };

    const castValue = (value: any, type: string, required: boolean) => {
        if (value === undefined || value === null || value === '') {
            return required ? (type === 'boolean' ? false : '') : null;
        }
        switch (type) {
            case 'number': return Number(value);
            case 'boolean': return value === 'true' || value === true;
            default: return String(value).trim();
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setErrorNotice(null);
        try {
            // First, get the profile_id for this user to filter accurately
            const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', userId).single();
            const pid = profile?.id;

            let query = supabase.from(tableName).select('*').limit(100);

            // Apply isolation if not the profiles table itself
            if (tableName !== 'profiles' && pid) {
                query = query.eq('profile_id', pid);
            } else if (tableName === 'profiles') {
                query = query.eq('user_id', userId);
            }

            const { data: res, error } = await query;
            if (error) throw error;
            setData(res || []);
        } catch (err: any) {
            setErrorNotice(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setIsFormOpen(false);
    }, [tableName]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Confirm deletion?')) return;
        try {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {};

        // Auto-calculate duration for shifts
        if (tableName === 'shift_types') {
            const duration = calculateDuration(editingItem.default_start, editingItem.default_end);
            editingItem.default_duration = duration;
        }

        for (const field of tableDef.fields) {
            payload[field.name] = castValue(editingItem[field.name], field.type, field.required);
        }

        try {
            // Get profile_id to ensure ownership
            const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', userId).single();
            const pid = profile?.id;

            if (tableName !== 'profiles' && pid) {
                payload.profile_id = pid;
            }

            if (editingItem.id) {
                const { error } = await supabase.from(tableName).update(payload).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(tableName).insert([payload]);
                if (error) throw error;
            }
            setIsFormOpen(false);
            fetchData();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleBulkImport = async (holidays: { date: string, name: string }[]) => {
        try {
            setLoading(true);
            const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', userId).single();
            const pid = profile?.id;

            const payload = holidays.map(h => ({
                date: h.date,
                name: h.name,
                country_code: 'ES',
                profile_id: pid
            }));

            const { error } = await supabase.from('holidays').insert(payload);
            if (error) throw error;

            fetchData();
        } catch (err: any) {
            alert("Bulk Import failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!tableDef) return <div className="p-10 text-center">Table {tableName} removed from Hub.</div>;

    return (
        <div className="flex-1 flex flex-col bg-[#F3F4F6] overflow-hidden">
            {/* TOOLBAR */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>GRID</button>
                        <button onClick={() => setViewMode('cards')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>CARDS</button>
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                    <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-slate-100"><i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i></button>

                    {tableName === 'holidays' && (
                        <button
                            onClick={() => setIsImporterOpen(true)}
                            className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                            <i className="fa-solid fa-cloud-arrow-down text-xs"></i>
                            <span>Importar Calendario Oficial</span>
                        </button>
                    )}

                    <button onClick={() => {
                        const newItem: any = {};
                        tableDef.fields.forEach(f => {
                            if (f.name === 'user_id' && userId) newItem[f.name] = userId;
                            else newItem[f.name] = f.defaultValue ?? '';
                        });
                        setEditingItem(newItem);
                        setIsFormOpen(true);
                    }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100">
                        <i className="fa-solid fa-plus text-xs"></i>
                        <span>New Entry</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {errorNotice && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 text-xs">{errorNotice}</div>}

                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30"><i className="fa-solid fa-spinner fa-spin text-4xl mb-2"></i><p className="text-xs font-bold uppercase tracking-widest">Synchronizing...</p></div>
                ) : viewMode === 'grid' ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                    {tableDef.fields.filter(f => !f.hiddenInView).map(f => <th key={f.name} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
                                                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><i className="fa-solid fa-trash text-[10px]"></i></button>
                                            </div>
                                        </td>
                                        {tableDef.fields.filter(f => !f.hiddenInView).map(f => (
                                            <td key={f.name} className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {f.type === 'color' ? <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: item[f.name] }}></div><span className="font-mono text-xs">{item[f.name]}</span></div> : String(item[f.name] ?? '--')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className={`fa-solid ${tableDef.icon}`}></i></div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className="fa-solid fa-pen text-[10px]"></i></button>
                                        <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><i className="fa-solid fa-trash text-[10px]"></i></button>
                                    </div>
                                </div>
                                {tableDef.fields.filter(f => !f.hiddenInView).slice(0, 5).map(f => (
                                    <div key={f.name} className="mb-3">
                                        <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">{f.label}</label>
                                        <div className="text-sm font-bold text-slate-700 truncate">{f.type === 'color' ? <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item[f.name] }}></div><span>{item[f.name]}</span></div> : String(item[f.name] ?? '--')}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{editingItem.id ? 'Edit Entry' : 'New Entry'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                            {tableDef.fields.map(f => (
                                <div key={f.name} className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                    {f.type === 'color' ? (
                                        <div className="flex items-center space-x-3">
                                            <input type="color" className="w-12 h-12 rounded-xl cursor-pointer" value={editingItem[f.name] || '#6366f1'} onChange={e => setEditingItem({ ...editingItem, [f.name]: e.target.value })} />
                                            <input type="text" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-mono text-xs" value={editingItem[f.name] || '#6366f1'} onChange={e => setEditingItem({ ...editingItem, [f.name]: e.target.value })} />
                                        </div>
                                    ) : (
                                        <input
                                            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                                            readOnly={f.readOnly}
                                            className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white outline-none transition-all ${f.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={editingItem[f.name] ?? ''}
                                            onChange={e => setEditingItem({ ...editingItem, [f.name]: e.target.value })}
                                        />
                                    )}
                                    {f.name === 'default_duration' && <p className="text-[10px] text-indigo-400 italic font-medium ml-1">Autocalculated upon save.</p>}
                                </div>
                            ))}
                        </form>
                        <div className="p-8 flex space-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 bg-slate-50 hover:bg-slate-100">Cancel</button>
                            <button type="submit" onClick={handleSubmit} className="flex-[1.5] px-6 py-4 rounded-2xl font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-100">Save Row</button>
                        </div>
                    </div>
                </div>
            )}

            {isImporterOpen && (
                <HolidaysImporter
                    onClose={() => setIsImporterOpen(false)}
                    onImport={handleBulkImport}
                />
            )}
        </div>
    );
};
