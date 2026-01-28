import React, { useState } from 'react';
import { DatabaseCRUD } from './DatabaseCRUD';

// Simple overview to access CRUD for all configured tables
export const TablesOverview: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  // Known tables in the current app
  const tableNames = ['profiles', 'shift_types', 'days_assignments', 'holidays', 'notes'];
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  if (selectedTable) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-2">
            <button onClick={() => setSelectedTable(null)} className="text-slate-600 hover:text-slate-800"><i className="fa-solid fa-arrow-left"></i> Back</button>
          </div>
          <div className="text-lg font-semibold">Table: {selectedTable}</div>
          <div />
        </div>
        <DatabaseCRUD tableName={selectedTable} title={`Table: ${selectedTable}`} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tables Management</h2>
          <p className="text-sm text-slate-500">CRUD for all database tables</p>
        </div>
        <button onClick={onBack} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Back to Main</button>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {tableNames.map((t) => (
          <div
            key={t}
            className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 flex flex-col justify-between"
            onClick={() => setSelectedTable(t)}
          >
            <div className="font-semibold text-slate-700">{t}</div>
            <div className="text-xs text-slate-500 mt-2">Open CRUD for this table</div>
          </div>
        ))}
      </div>
    </div>
  );
};
