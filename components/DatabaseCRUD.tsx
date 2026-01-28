import React, { useState, useEffect } from 'react';
import { supabase } from '../src/data/supabaseClient';

interface Props {
    tableName: string;
    title: string;
}

export const DatabaseCRUD: React.FC<Props> = ({ tableName, title }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        const { data: result, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false }).limit(100);
        if (error) {
            console.error(`Error fetching ${tableName}:`, error);
        } else {
            setData(result || []);
            if (result && result.length > 0) {
                setColumns(Object.keys(result[0]));
            } else {
                // Fallback or fetch schema if empty? For now just try to guess from common fields or stay empty
                setColumns(['id']);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [tableName]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) alert(error.message);
        else fetchData();
    };

    const handleSave = async (id: string | null) => {
        const itemToSave = { ...newItem };
        delete itemToSave.id;
        delete itemToSave.created_at;
        delete itemToSave.updated_at;

        if (id) {
            const { error } = await supabase.from(tableName).update(itemToSave).eq('id', id);
            if (error) alert(error.message);
            else {
                setEditingId(null);
                fetchData();
            }
        } else {
            const { error } = await supabase.from(tableName).insert([itemToSave]);
            if (error) alert(error.message);
            else {
                setNewItem({});
                fetchData();
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, col: string) => {
        setNewItem({ ...newItem, [col]: e.target.value });
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-500">Database Table: {tableName}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => { setEditingId(null); setNewItem({}); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        aria-label="Add new item"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>New</span>
                    </button>
                    <button
                        onClick={() => fetchData()}
                        className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        aria-label="Refresh data"
                    >
                        <i className="fa-solid fa-sync"></i>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider">{col}</th>
                                ))}
                                <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Insert Row */}
                            <tr className="bg-indigo-50/30">
                                {columns.map(col => (
                                    <td key={col} className="px-4 py-2">
                                        {col === 'id' || col === 'created_at' || col === 'updated_at' ? (
                                            <span className="text-slate-400 italic text-[10px]">auto</span>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder={col}
                                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                value={newItem[col] || ''}
                                                onChange={(e) => handleInputChange(e, col)}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={() => handleSave(null)}
                                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>

                            {loading ? (
                                <tr><td colSpan={columns.length + 1} className="p-10 text-center"><i className="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={columns.length + 1} className="p-10 text-center text-slate-400">No records found.</td></tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        {columns.map(col => (
                                            <td key={col} className="px-4 py-2 truncate max-w-[200px]" title={item[col]}>
                                                {editingId === item.id && col !== 'id' && col !== 'created_at' && col !== 'updated_at' ? (
                                                    <input
                                                        type="text"
                                                        className="w-full px-2 py-1 border border-indigo-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                        value={newItem[col] ?? item[col] ?? ''}
                                                        onChange={(e) => handleInputChange(e, col)}
                                                    />
                                                ) : (
                                                    <span className={col === 'id' ? 'text-[10px] text-slate-400 font-mono' : ''}>
                                                        {String(item[col] ?? '')}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-4 py-2 text-right whitespace-nowrap">
                                            {editingId === item.id ? (
                                                <div className="space-x-2">
                                                    <button onClick={() => handleSave(item.id)} className="text-green-600 hover:text-green-800 font-bold" aria-label="Save">
                                                        <i className="fa-solid fa-check"></i> Save
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700" aria-label="Cancel edit">
                                                        <i className="fa-solid fa-times"></i> Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-x-2">
                                                    <button onClick={() => { setEditingId(item.id); setNewItem(item); }} className="text-indigo-600 hover:text-indigo-800" aria-label="Edit">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
