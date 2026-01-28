import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './src/data/supabaseClient';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { ShiftPalette } from './components/ShiftPalette';
import { MonthPicker } from './components/MonthPicker';
import './src/styles/themes.css';
import { DatabaseCRUD } from './components/DatabaseCRUD';
import { StatisticsView } from './components/StatisticsView';
import { ShiftType, DayAssignment, Holiday } from './types';
import { storageService } from './services/storage';
import { formatDateKey } from './helpers';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<'calendar' | 'stats' | 'db_profiles' | 'db_shift_types' | 'db_holidays' | 'db_tables'>('calendar');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sunset'>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>({});
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string | null>(null); // Null = Navigation Mode
  const [holidays, setHolidays] = useState<Record<string, Holiday>>({});

  const [isPainting, setIsPainting] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user?.id || null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Shift Types and Data from Supabase
  useEffect(() => {
    if (session) {
      const fetchShifts = async () => {
        const { data, error } = await supabase.from('shift_types').select('*').order('name');
        if (data) {
          const mapped: ShiftType[] = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.name.charAt(0).toUpperCase(),
            color: s.color || '#4f46e5',
            startTime: s.default_start?.substring(0, 5) || '',
            endTime: s.default_end?.substring(0, 5) || '',
            default_duration: s.default_duration
          }));
          setShiftTypes(mapped);
        }
      };

      const fetchHolidays = async () => {
        const { data } = await supabase.from('holidays').select('*');
        if (data) {
          const mapped: Record<string, Holiday> = {};
          data.forEach((h: any) => {
            mapped[h.date] = { date: h.date, name: h.name, country_code: h.country_code };
          });
          setHolidays(mapped);
        }
      };

      fetchShifts();
      fetchHolidays();

      // Resolve Profile ID for DB sync and Sync Meta
      const resolveProfile = async () => {
        if (localStorage.getItem('shifter_guest_mode') === 'true') return;

        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'My Profile';

        const { data: profile, error } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            name: fullName
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (profile) setProfileId(profile.id);
        else if (error) console.error('Profile sync error:', error.message);
      };
      resolveProfile();
    } else {
      setShiftTypes(storageService.getShiftTypes());
    }

    if (userId) {
      setAssignments(storageService.getAssignments(userId));
    }
  }, [session, userId, currentView]);

  const handlePaint = useCallback((date: Date) => {
    if (!session?.user || !selectedShiftTypeId) return;

    const key = formatDateKey(date);
    const isEraser = selectedShiftTypeId === 'eraser';

    setAssignments((prev) => {
      const newAssignment: DayAssignment = {
        dateStr: key,
        shiftTypeId: isEraser ? null : selectedShiftTypeId,
        note: prev[key]?.note
      };
      return { ...prev, [key]: newAssignment };
    });

    const newAssignment: DayAssignment = {
      dateStr: key,
      shiftTypeId: isEraser ? null : selectedShiftTypeId,
      note: assignments[key]?.note
    };
    storageService.saveAssignment(session.user.id, newAssignment);

    // Database Sync
    if (profileId && localStorage.getItem('shifter_guest_mode') !== 'true') {
      supabase.from('days_assignments').upsert({
        profile_id: profileId,
        date: key,
        shift_type_id: isEraser ? null : selectedShiftTypeId,
        note: assignments[key]?.note
      }, { onConflict: 'profile_id,date' }).then(({ error }) => {
        if (error) console.error('DB Sync Error:', error.message);
      });
    }
  }, [session, userId, profileId, selectedShiftTypeId, assignments]);

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'sunset')[] = ['light', 'dark', 'sunset'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    localStorage.setItem('shifter_theme', next);
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i></div>;

  if (!session) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center space-y-8 animate-scale-in">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-100">
            <i className="fa-solid fa-calendar-check text-4xl text-white"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Shifter</h1>
            <p className="text-slate-500 font-medium">Gestiona tu calendario laboral con estilo.</p>
          </div>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 transition-all p-4 rounded-2xl font-bold text-slate-700 shadow-sm overflow-hidden relative group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/listbox/google.svg" className="w-6 h-6" alt="Google" />
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#F1F5F9]" data-theme={theme}>
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        session={session}
        currentView={currentView}
        onChangeView={setCurrentView}
        theme={theme}
        onChangeTheme={setTheme}
        onSignOut={() => supabase.auth.signOut()}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white md:m-3 md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50">

        {currentView === 'calendar' && (
          <>
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-90"
                >
                  <i className="fa-solid fa-bars-staggered text-xl"></i>
                </button>
                <button
                  onClick={() => setIsMonthPickerOpen(true)}
                  className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h1>
                  <i className="fa-solid fa-caret-down text-slate-300 group-hover:text-indigo-600 text-xs"></i>
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </header>

            <Calendar
              currentDate={currentDate}
              assignments={assignments}
              shiftTypes={shiftTypes}
              holidays={holidays}
              selectedShiftTypeId={selectedShiftTypeId}
              onPaint={handlePaint}
              isPainting={isPainting}
              setIsPainting={setIsPainting}
            />

            <ShiftPalette
              shiftTypes={shiftTypes}
              selectedId={selectedShiftTypeId}
              onSelect={setSelectedShiftTypeId}
              onEdit={() => setCurrentView('db_shift_types')}
            />
          </>
        )}

        {currentView === 'stats' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center z-30 shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 -ml-2 mr-4 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
              >
                <i className="fa-solid fa-bars-staggered text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-slate-800">Estadísticas</h1>
            </header>
            <StatisticsView
              currentDate={currentDate}
              assignments={assignments}
              shiftTypes={shiftTypes}
              holidays={holidays}
            />
          </div>
        )}

        {/* CRUD VIEWS with Navigation Header */}
        {[
          { id: 'db_profiles', table: 'profiles', title: 'Profiles Management' },
          { id: 'db_shift_types', table: 'shift_types', title: 'Shift Types' },
          { id: 'db_holidays', table: 'holidays', title: 'Holidays Table' },
        ].map((view) => currentView === view.id && (
          <div key={view.id} className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center shadow-sm z-30 relative shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 -ml-2 mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <i className="fa-solid fa-bars text-lg"></i>
              </button>
              <h1 className="text-lg font-bold text-slate-800">{view.title}</h1>
            </header>
            <DatabaseCRUD tableName={view.table} title={view.title} userId={session.user.id} />
          </div>
        ))}
      </main>

      {isMonthPickerOpen && (
        <MonthPicker
          isOpen={isMonthPickerOpen}
          onClose={() => setIsMonthPickerOpen(false)}
          currentDate={currentDate}
          onChange={setCurrentDate}
        />
      )}
    </div>
  );
}

export default App;
