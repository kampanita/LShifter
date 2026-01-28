import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getRedirectUrl } from './src/data/supabaseClient';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { ShiftPalette } from './components/ShiftPalette';
import { MonthPicker } from './components/MonthPicker';
import './src/styles/themes.css';
import { DatabaseCRUD } from './components/DatabaseCRUD';
import { StatisticsView } from './components/StatisticsView';
import { ShiftType, DayAssignment, Holiday } from './types';
import { formatDateKey } from './helpers';
import { Session } from '@supabase/supabase-js';
import { BezelFrame, ShifterLogo } from './components/VisualEffects';
import { storageService } from './services/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Login3DBackground } from './components/Login3DBackground';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<'calendar' | 'stats' | 'db_profiles' | 'db_shift_types' | 'db_holidays'>('calendar');
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

  // Initial Load & Auth Resolution
  useEffect(() => {
    const resolveProfile = async () => {
      if (!session?.user || !userId) return;

      try {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'My Profile';

        const { data: profile, error } = await supabase
          .from('profiles')
          .upsert({ user_id: userId, name: fullName }, { onConflict: 'user_id' })
          .select()
          .single();

        if (profile) {
          console.log("✅ PROFILE RESOLVED:", profile.id);
          setProfileId(profile.id);
        }
      } catch (err) {
        console.error('💥 RESOLVE_PROFILE - Exception:', err);
      }
    };

    if (session && userId) {
      resolveProfile();
    } else {
      setShiftTypes(storageService.getShiftTypes('guest'));
    }
  }, [session, userId]);
  // Separate Effect: Trigger Data Fetch when ProfileID changes OR View changes (Refocus)
  useEffect(() => {
    if (profileId) {
      console.log("🔄 SYNCING DATA for Profile:", profileId);

      const fetchShifts = async () => {
        let { data: currentData } = await supabase.from('shift_types').select('*').or(`profile_id.eq.${profileId},profile_id.is.null`).order('name');

        let finalData = currentData || [];

        // SEED DEFAULT SHIFTS IF MISSING
        if (profileId) {
          // Default duration is in MINUTES for DB (480 = 8 hours)
          const defaults = [
            { name: 'Mañana', color: '#F59E0B', default_start: '06:00', default_end: '14:00', default_duration: 480, profile_id: profileId },
            { name: 'Tarde', color: '#10B981', default_start: '14:00', default_end: '22:00', default_duration: 480, profile_id: profileId },
            { name: 'Noche', color: '#3B82F6', default_start: '22:00', default_end: '06:00', default_duration: 480, profile_id: profileId },
          ];

          // Case insensitive check
          const existingNames = new Set(finalData.map((s: any) => s.name?.toLowerCase()));
          const toInsert = defaults.filter(d => !existingNames.has(d.name.toLowerCase()));

          if (toInsert.length > 0) {
            console.log("🌱 INSERTING Missing Defaults:", toInsert.map(d => d.name));
            const { data: inserted } = await supabase.from('shift_types').insert(toInsert).select();
            if (inserted) {
              finalData = [...finalData, ...inserted];
            }
          }
        }

        // Deduplicate by Name (Keep last or first? Keep DB existing preferred over recent insert if conflict, but here we just merge)
        const uniqueData = Array.from(new Map(finalData.map(item => [item.name, item])).values());

        // Map to App State (Domain = Hours)
        const mapped: ShiftType[] = uniqueData.map((s: any) => {
          // HEURISTIC: If duration > 30, assume Minutes. If < 30, assume Hours (Legacy Data).
          let durationHours = s.default_duration ? Number(s.default_duration) : 0;
          if (durationHours > 30) {
            durationHours = Number((durationHours / 60).toFixed(2));
          }

          return {
            id: s.id,
            name: s.name,
            code: s.name.charAt(0).toUpperCase(),
            color: s.color || '#4f46e5',
            startTime: s.default_start?.substring(0, 5) || '',
            endTime: s.default_end?.substring(0, 5) || '',
            default_duration: durationHours || undefined
          };
        }).sort((a, b) => a.name.localeCompare(b.name));

        setShiftTypes(mapped);
      };

      const fetchHolidays = async () => {
        const { data } = await supabase.from('holidays').select('*').or(`profile_id.eq.${profileId},profile_id.is.null`);
        if (data && data.length > 0) {
          const mapped: Record<string, Holiday> = {};
          data.forEach((h: any) => {
            if (!h.date) return;
            let dStr = typeof h.date === 'string' ? h.date.split(/[T ]/)[0] : formatDateKey(new Date(h.date));
            mapped[dStr] = { id: h.id, date: dStr, name: h.name || 'Festivo', country_code: h.country_code };
          });
          setHolidays(mapped);
        }
      };

      const fetchAssignments = async () => {
        const { data } = await supabase.from('days_assignments').select('*').eq('profile_id', profileId);
        if (data) {
          const mapped: Record<string, DayAssignment> = {};
          data.forEach((a: any) => {
            mapped[a.date] = { dateStr: a.date, shiftTypeId: a.shift_type_id, note: a.note };
          });
          setAssignments(mapped);
        }
      };

      fetchShifts();
      fetchHolidays();
      fetchAssignments();
    }
  }, [profileId, currentView]);

  const handlePaint = useCallback((date: Date) => {
    if (!session?.user || !selectedShiftTypeId) return;

    const key = formatDateKey(date);
    const isEraser = selectedShiftTypeId === 'eraser';
    const shiftToSet = isEraser ? null : selectedShiftTypeId;

    setAssignments((prev) => {
      const newAssignment: DayAssignment = {
        dateStr: key,
        shiftTypeId: shiftToSet,
        note: prev[key]?.note
      };
      return { ...prev, [key]: newAssignment };
    });

    // Database Sync - Using calculated values directly
    if (profileId && localStorage.getItem('shifter_guest_mode') !== 'true') {
      supabase.from('days_assignments').upsert({
        profile_id: profileId,
        date: key,
        shift_type_id: shiftToSet,
        note: assignments[key]?.note // Keep existing note if any
      }, { onConflict: 'profile_id,date' }).then(({ error }) => {
        if (error) {
          console.error('DB Sync Error:', error.message);
        } else {
          console.log(`✅ Persisted ${key} as ${shiftToSet}`);
        }
      });
    }

    // Backup to local storage
    const tempAssignment: DayAssignment = {
      dateStr: key,
      shiftTypeId: shiftToSet,
      note: assignments[key]?.note
    };
    storageService.saveAssignment(session.user.id, tempAssignment);

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
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC] px-4 relative overflow-hidden">
        <Login3DBackground />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_1px_1px_white] p-10 text-center space-y-8 border border-slate-100 relative z-10"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20"
            ></motion.div>
            <ShifterLogo className="w-24 h-24 relative" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Shifter</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Work Life In Sync</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: getRedirectUrl()
              }
            })}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-slate-50 transition-all p-4 rounded-2xl font-bold text-slate-700 shadow-sm overflow-hidden relative group"
          >
            <i className="fa-brands fa-google text-xl text-[#4285F4]"></i>
            <span>Continuar con Google</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#F1F5F9]" data-theme={theme}>
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

      <main className="flex-1 flex flex-col relative bg-[#F1F5F9] md:p-3 overflow-hidden">
        <BezelFrame className="flex-1">

          {currentView === 'calendar' && (
            <div className="absolute inset-0 flex flex-col">
              <header className="px-6 py-4 glass-morphism border-b border-slate-100 flex items-center justify-between z-30 shrink-0 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
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

              <div className="flex-1 overflow-hidden flex flex-col relative min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 flex flex-col min-h-0 relative">
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
                  </div>

                  <ShiftPalette
                    shiftTypes={shiftTypes}
                    selectedId={selectedShiftTypeId}
                    onSelect={setSelectedShiftTypeId}
                    onEdit={() => setCurrentView('db_shift_types')}
                  />
                </div>
              </div>
            </div>
          )}


          {currentView === 'stats' && (
            <div className="absolute inset-0 flex flex-col">
              <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center z-30 shrink-0">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-10 h-10 -ml-2 mr-4 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <i className="fa-solid fa-bars-staggered text-xl"></i>
                </button>
                <h1 className="text-xl font-bold text-slate-800">Estadísticas</h1>
              </header>
              <div className="flex-1 relative">
                <StatisticsView
                  currentDate={currentDate}
                  assignments={assignments}
                  shiftTypes={shiftTypes}
                  holidays={holidays}
                />
              </div>
            </div>
          )}

          {/* CRUD VIEWS with Navigation Header */}
          {[
            { id: 'db_profiles', table: 'profiles', title: 'Profiles Management' },
            { id: 'db_shift_types', table: 'shift_types', title: 'Shift Types' },
            { id: 'db_holidays', table: 'holidays', title: 'Holidays Table' },
          ].map((view) => currentView === view.id && (
            <div key={view.id} className="absolute inset-0 flex flex-col">
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
        </BezelFrame>
      </main>

      {
        isMonthPickerOpen && (
          <MonthPicker
            isOpen={isMonthPickerOpen}
            onClose={() => setIsMonthPickerOpen(false)}
            currentDate={currentDate}
            onChange={setCurrentDate}
          />
        )
      }
    </div >
  );
}

export default App;

