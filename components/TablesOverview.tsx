import React, { useState } from 'react';
import { DatabaseCRUD } from './DatabaseCRUD';

const TABLE_META: Record<string, { label: string, desc: string, icon: string, color: string }> = {
  profiles: { label: 'User Profiles', desc: 'Sync and manage user display information from OAuth.', icon: 'fa-user-circle', color: 'bg-blue-500' },
  shift_types: { label: 'Shift Configurations', desc: 'Define names, colors, and autocalculated durations.', icon: 'fa-clock', color: 'bg-indigo-500' },
  holidays: { label: 'Public Holidays', desc: 'Reference table for national or local holidays.', icon: 'fa-umbrella-beach', color: 'bg-amber-500' },
};

export const TablesOverview: React.FC<{ onBack?: () => void, userId?: string }> = ({ onBack, userId }) => {
  const tableNames = Object.keys(TABLE_META);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  if (selectedTable) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <button
          onClick={() => setSelectedTable(null)}
          className="absolute top-6 left-6 z-[30] w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
          title="Back to Overview"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
        <DatabaseCRUD tableName={selectedTable} title={TABLE_META[selectedTable].label} userId={userId} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Grid of Tables */}
      <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {tableNames.map((t) => {
          const meta = TABLE_META[t];
          return (
            <div
              key={t}
              className="bg-white rounded-3xl border border-slate-100 p-6 cursor-pointer hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col items-start text-left"
              onClick={() => setSelectedTable(t)}
            >
              <div className={`w-14 h-14 ${meta.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${meta.color.split('-')[1]}-200/50 group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${meta.icon} text-2xl`}></i>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">{meta.label}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                {meta.desc}
              </p>
              <div className="mt-auto w-full flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{t} table</span>
                <i className="fa-solid fa-arrow-right text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
