import React, { useState, useEffect } from 'react';
import { ShiftType } from '../types';
import { generateId } from '../helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: ShiftType) => void;
  editingShift?: ShiftType | null;
}

export const EditShiftModal: React.FC<Props> = ({ isOpen, onClose, onSave, editingShift }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (editingShift) {
      setName(editingShift.name);
      setCode(editingShift.code);
      setColor(editingShift.color);
      setStartTime(editingShift.startTime);
      setEndTime(editingShift.endTime);
    } else {
      resetForm();
    }
  }, [editingShift, isOpen]);

  const resetForm = () => {
    setName('');
    setCode('');
    setColor('#3b82f6');
    setStartTime('09:00');
    setEndTime('17:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingShift ? editingShift.id : generateId(),
      name,
      code,
      color,
      startTime,
      endTime
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          {editingShift ? 'Edit Shift' : 'New Shift Type'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Shift Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Morning Shift"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Code (Abbr)</label>
              <input
                required
                maxLength={3}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
              <div className="flex items-center h-[42px] border border-slate-300 rounded-lg px-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-8 cursor-pointer bg-transparent border-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              Save Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};