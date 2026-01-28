import React from 'react';
import { Session } from '@supabase/supabase-js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  currentView: 'calendar' | 'admin' | 'db_profiles' | 'db_shift_types' | 'db_days_assignments' | 'db_holidays' | 'db_notes' | 'db_tables';
  onChangeView: (view: 'calendar' | 'admin' | 'db_profiles' | 'db_shift_types' | 'db_days_assignments' | 'db_holidays' | 'db_notes' | 'db_tables') => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  session,
  currentView,
  onChangeView,
  onSignOut
}) => {
  const userInitial = session.user.email?.charAt(0).toUpperCase() || 'U';
  const userName = session.user.user_metadata?.full_name || session.user.email;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 bg-indigo-600 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-white/30">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-lg truncate">{userName}</h2>
                <p className="text-xs text-indigo-200 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => { onChangeView('calendar'); onClose(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'calendar'
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <i className="fa-solid fa-calendar w-5 text-center"></i>
              <span>Calendar</span>
            </button>

            <button
              onClick={() => { onChangeView('admin'); onClose(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin'
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <i className="fa-solid fa-table-list w-5 text-center"></i>
              <span>Manage Shift Types</span>
            </button>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Database Management</p>

              <button
                onClick={() => { onChangeView('db_profiles'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_profiles' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fa-solid fa-users w-5 text-center text-xs"></i>
                <span className="text-sm">Profiles</span>
              </button>

              <button
                onClick={() => { onChangeView('db_shift_types'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_shift_types' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fa-solid fa-list w-5 text-center text-xs"></i>
                <span className="text-sm">Shift Types (SQL)</span>
              </button>

              <button
                onClick={() => { onChangeView('db_days_assignments'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_days_assignments' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fa-solid fa-calendar-check w-5 text-center text-xs"></i>
                <span className="text-sm">Assignments</span>
              </button>

              <button
                onClick={() => { onChangeView('db_holidays'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_holidays' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fa-solid fa-umbrella-beach w-5 text-center text-xs"></i>
                <span className="text-sm">Holidays</span>
              </button>

              <button
                onClick={() => { onChangeView('db_notes'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_notes' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fa-solid fa-sticky-note w-5 text-center text-xs"></i>
                <span className="text-sm">Notes Table</span>
              </button>

              <button
                onClick={() => { onChangeView('db_tables'); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors ${currentView === 'db_tables' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-table w-5 text-center text-xs"></i>
                <span className="text-sm">Tables (All)</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-medium"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Sign Out</span>
            </button>
            <p className="text-center text-[10px] text-slate-300 mt-4">
              Shifter PWA v1.1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
