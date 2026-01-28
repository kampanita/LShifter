import React, { useState, useEffect } from 'react';
import { supabase } from '../src/data/supabaseClient';

/**
 * DATABASE SCHEMA METADATA
 * This is the source of truth for the CRUD.
 * Defining types here ensures we send exactly what PostgreSQL expects.
 */
interface TableField {
    name: string;
    label: string;
    type: 'text' | 'date' | 'time' | 'boolean' | 'number' | 'uuid';
    required: boolean;
    defaultValue?: any;
    placeholder?: string;
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
        label: 'Profiles',
        icon: 'fa-user-circle',
        fields: [
            { name: 'user_id', label: 'User ID (Auth)', type: 'uuid', required: true, placeholder: 'UUID from Auth' },
            { name: 'name', label: 'Display Name', type: 'text', required: true, placeholder: 'John Doe' },
            { name: 'color', label: 'Brand Color', type: 'text', required: false, defaultValue: '#6B8E23', placeholder: '#HEX' },
        ]
    },
    shift_types: {
        name: 'shift_types',
        label: 'Shift Types',
        icon: 'fa-clock',
        fields: [
            { name: 'name', label: 'Shift Name', type: 'text', required: true, placeholder: 'Morning Shift' },
            { name: 'company', label: 'Company / Group', type: 'text', required: false },
            { name: 'color', label: 'Color', type: 'text', required: false, defaultValue: '#3B82F6' },
            { name: 'default_start', label: 'Start Time', type: 'time', required: false },
            { name: 'default_end', label: 'End Time', type: 'time', required: false },
            { name: 'default_duration', label: 'Duration (min)', type: 'number', required: false },
        ]
    },
    days_assignments: {
        name: 'days_assignments',
        label: 'Assignments',
        icon: 'fa-calendar-check',
        fields: [
            { name: 'profile_id', label: 'Profile ID', type: 'uuid', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'shift_type_id', label: 'Shift ID', type: 'uuid', required: false },
            { name: 'note', label: 'Daily Note', type: 'text', required: false },
            { name: 'is_holiday', label: 'Is Holiday?', type: 'boolean', required: false, defaultValue: false },
            { name: 'start_time', label: 'Override Start', type: 'time', required: false },
            { name: 'end_time', label: 'Override End', type: 'time', required: false },
        ]
    },
    holidays: {
        name: 'holidays',
        label: 'Holidays',
        icon: 'fa-umbrella-beach',
        fields: [
            { name: 'country_code', label: 'Country (2 chars)', type: 'text', required: true, placeholder: 'ES' },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'name', label: 'Holiday Name', type: 'text', required: false },
        ]
    },
    notes: {
        name: 'notes',
        label: 'Database Notes',
        icon: 'fa-clipboard',
        fields: [
            { name: 'day_id', label: 'Assignment ID', type: 'uuid', required: true },
            { name: 'content', label: 'Note Content', type: 'text', required: true },
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

    const tableDef = SCHEMA[tableName];

    // Helper to cast frontend strings to DB-ready values
    const castValue = (value: any, type: string, required: boolean) => {
        if (value === undefined || value === null || value === '') {
            return required ? (type === 'boolean' ? false : '') : null;
        }

        switch (type) {
            case 'number': return Number(value);
            case 'boolean': return value === 'true' || value === true;
            case 'time': return value; // 00:00:00 format is usually fine as string
            case 'date': return value; // YYYY-MM-DD format usually fine as string
            case 'uuid': return value.trim();
            default: return String(value).trim();
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setErrorNotice(null);
        try {
            const { data: res, error } = await supabase
                .from(tableName)
                .select('*')
                .order('id', { ascending: false }) // Use ID as fallback order
                .limit(100);

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
        if (!window.confirm('¿Eliminar este registro permanentemente?')) return;
        try {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err: any) {
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {};

        // Process all fields according to schema
        for (const field of tableDef.fields) {
            payload[field.name] = castValue(editingItem[field.name], field.type, field.required);
        }

        try {
            if (editingItem.id) {
                // UPDATE
                const { error } = await supabase.from(tableName).update(payload).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                // INSERT
                const { error } = await supabase.from(tableName).insert([payload]);
                if (error) throw error;
            }

            setIsFormOpen(false);
            fetchData();
        } catch (err: any) {
            alert(`Error al guardar: ${err.message}\n\nDetalle: ${err.details || 'Verifica los tipos de datos (UUIDs, fechas, etc)'}`);
        }
    };

    const openNew = () => {
        const newItem: any = {};
        tableDef.fields.forEach(f => {
            if (f.name === 'user_id' && userId) newItem[f.name] = userId;
            else newItem[f.name] = f.defaultValue ?? '';
        });
        setEditingItem(newItem);
        setIsFormOpen(true);
    };

    if (!tableDef) return <div className="p-10 text-center">Configuración no encontrada para {tableName}.</div>;

    return (
        <div className="flex-1 flex flex-col bg-[#F1F5F9] overflow-hidden">
            {/* LOCAL TOOLBAR */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fa-solid fa-table-list"></i>
                            <span>GRID</span>
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fa-solid fa-grip"></i>
                            <span>CARDS</span>
                        </button>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{tableName}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchData}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 border border-slate-100 transition-colors"
                    >
                        <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                    <button
                        onClick={openNew}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        <span>Insert New</span>
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {errorNotice && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                        <div className="flex items-center space-x-3 mb-1">
                            <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                            <h4 className="font-black text-red-800 text-sm uppercase">Database Connection Error</h4>
                        </div>
                        <p className="text-red-700 text-xs">{errorNotice}</p>
                    </div>
                )}

                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
                        <p className="font-black text-slate-400 text-xs tracking-widest uppercase">Loading Datatable...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                            <i className="fa-solid fa-database text-3xl text-slate-200"></i>
                        </div>
                        <h3 className="font-black text-slate-400 text-lg mb-2">Empty ResultSet</h3>
                        <p className="text-slate-400 text-sm mb-6">No records found in {tableName}.</p>
                        <button onClick={openNew} className="text-indigo-600 font-bold hover:underline">Insert your first row →</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* GRID VIEW */
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        {tableDef.fields.map(f => (
                                            <th key={f.name} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</th>
                                        ))}
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                                                        className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                                                    >
                                                        <i className="fa-solid fa-pen text-[10px]"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                                                    >
                                                        <i className="fa-solid fa-trash text-[10px]"></i>
                                                    </button>
                                                </div>
                                            </td>
                                            {tableDef.fields.map(f => (
                                                <td key={f.name} className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                    {f.type === 'boolean'
                                                        ? (item[f.name] ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">True</span> : <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">False</span>)
                                                        : String(item[f.name] ?? '--')}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-[10px] font-mono text-slate-300">
                                                {item.id.substring(0, 8)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* CARDS VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <i className={`fa-solid ${tableDef.icon}`}></i>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
                                        <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><i className="fa-solid fa-trash text-[10px]"></i></button>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {tableDef.fields.slice(0, 4).map(f => (
                                        <div key={f.name}>
                                            <label className="block text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">{f.label}</label>
                                            <p className="text-sm font-bold text-slate-700 truncate">
                                                {f.type === 'boolean' ? (item[f.name] ? 'YES' : 'NO') : String(item[f.name] ?? '--')}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between opacity-50">
                                    <span className="text-[10px] font-mono uppercase tracking-widest">{item.id.substring(0, 8)}</span>
                                    <span className="text-[10px] font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FORM MODAL (UNIVERSAL EDITOR) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <i className={`fa-solid ${tableDef.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">{editingItem.id ? 'Edit' : 'Insert'} {tableDef.label}</h3>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {tableDef.fields.map(f => (
                                <div key={f.name} className="space-y-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {f.label} {f.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {f.type === 'boolean' ? (
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, [f.name]: !editingItem[f.name] })}
                                                className={`w-14 h-8 rounded-full p-1 transition-colors ${editingItem[f.name] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${editingItem[f.name] ? 'translate-x-6' : ''}`}></div>
                                            </button>
                                            <span className="text-sm font-bold text-slate-600">{editingItem[f.name] ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                    ) : (
                                        <input
                                            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                                            required={f.required}
                                            placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                            value={editingItem[f.name] ?? ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, [f.name]: e.target.value })}
                                        />
                                    )}
                                    {f.type === 'uuid' && !editingItem[f.name] && !f.required && (
                                        <p className="text-[10px] text-slate-400 ml-1 italic">Opcional. Si se deja vacío se enviará como nulo.</p>
                                    )}
                                </div>
                            ))}
                        </form>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 bg-white border border-slate-200 text-slate-500 px-6 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                            >
                                Commit to DB
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
