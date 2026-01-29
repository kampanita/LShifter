import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  currentView: 'calendar' | 'stats' | 'db_profiles' | 'db_shift_types' | 'db_holidays';
  onChangeView: (view: 'calendar' | 'stats' | 'db_profiles' | 'db_shift_types' | 'db_holidays') => void;
  theme?: 'light' | 'dark' | 'sunset';
  onChangeTheme?: (t: 'light' | 'dark' | 'sunset') => void;
  onSignOut: () => void;
}

import { ThemeSwitcher } from '../src/components/ThemeSwitcher';
import { usePWAInstall } from '../src/hooks/usePWAInstall';

export const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  session,
  currentView,
  onChangeView,
  onSignOut,
  theme,
  onChangeTheme
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [dbTablesOpen, setDbTablesOpen] = useState(false);
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
                <p className="text-xs text-indigo-100 truncate">v0.0.6</p>
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
              <i className="fa-solid fa-calendar-days text-lg w-6 text-center"></i>
              <span className="font-bold">Calendario</span>
            </button>

            <button
              onClick={() => { onChangeView('stats'); onClose(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${currentView === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <i className="fa-solid fa-chart-line text-lg w-6 text-center"></i>
              <span className="font-bold">Análisis & Estadísticas</span>
            </button>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Settings & Data</p>

              <div className="space-y-1">
                <button
                  onClick={() => setDbTablesOpen(!dbTablesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-database text-xs"></i>
                    </div>
                    <span className="text-sm font-medium">Database Tables</span>
                  </span>
                  <i className={`fa-solid ${dbTablesOpen ? 'fa-chevron-down' : 'fa-chevron-right'} text-[10px] text-slate-300`}></i>
                </button>

                {dbTablesOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1 animate-fade-in">
                    <button onClick={() => { onChangeView('db_profiles'); onClose(); }} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs transition-colors ${currentView === 'db_profiles' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <i className="fa-solid fa-users w-4 text-center"></i>
                      <span>Profiles</span>
                    </button>
                    <button onClick={() => { onChangeView('db_shift_types'); onClose(); }} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs transition-colors ${currentView === 'db_shift_types' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <i className="fa-solid fa-tags w-4 text-center"></i>
                      <span>Shift Types</span>
                    </button>
                    <button onClick={() => { onChangeView('db_holidays'); onClose(); }} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs transition-colors ${currentView === 'db_holidays' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <i className="fa-solid fa-umbrella-beach w-4 text-center"></i>
                      <span>Holidays</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            {isInstallable && (
              <div className="mb-4 p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-100 flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="fa-solid fa-mobile-screen text-sm"></i>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">Modo App</span>
                </div>
                <p className="text-[10px] leading-relaxed text-indigo-100 font-medium">Instala Shifter para acceso offline y pantalla completa.</p>
                <button
                  onClick={install}
                  className="bg-white text-indigo-600 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                >
                  Instalar en el móvil
                </button>
              </div>
            )}

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-medium"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Cerrar Sesión</span>
            </button>
            <p className="text-center text-[10px] text-slate-300 mt-4">
              Shifter PWA v1.1.0
            </p>
          </div>
        </div>
        <div className="pt-4 pb-4 border-t border-slate-100 px-4">
          <p className="px-0 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Look & Feel</p>
          <div className="px-0 pb-2">
            <ThemeSwitcher current={theme ?? 'light'} onChange={onChangeTheme ?? (() => { })} />
          </div>
        </div>
      </div>
    </>
  );
};
