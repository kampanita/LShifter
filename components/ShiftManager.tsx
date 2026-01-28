import React from 'react';
import { ShiftType } from '../types';

interface Props {
  shiftTypes: ShiftType[];
  onEdit: (shift: ShiftType) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export const ShiftManager: React.FC<Props> = ({ shiftTypes, onEdit, onDelete, onCreate }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Shift Types</h2>
          <p className="text-sm text-slate-500">Manage your shift configurations</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-200"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Add New</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shiftTypes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                    No shift types found. Create one to get started.
                  </td>
                </tr>
              ) : (
                shiftTypes.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-sm"
                        style={{ backgroundColor: shift.color }}
                      >
                        <span className="text-white font-bold">{shift.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">{shift.name}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <i className="fa-regular fa-clock mr-1.5 opacity-70"></i>
                        {shift.startTime || '--:--'} - {shift.endTime || '--:--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(shift)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm(`Delete "${shift.name}"?`)) onDelete(shift.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
          <i className="fa-solid fa-circle-info mr-2"></i>
          <strong>Note:</strong> Editing a shift type will update its appearance on the calendar. Deleting a shift type will remove it from the selection palette, but historical days painted with it may lose their color/code context.
        </div>
      </div>
    </div>
  );
};