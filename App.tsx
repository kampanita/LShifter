import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { ShiftPalette } from './components/ShiftPalette';
import { EditShiftModal } from './components/EditShiftModal';
import { DatePickerModal } from './components/DatePickerModal';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import './src/styles/themes.css';
import { ShiftManager } from './components/ShiftManager';
import { DatabaseCRUD } from './components/DatabaseCRUD';
import { TablesOverview } from './components/TablesOverview';
import { ShiftType, DayAssignment, Holiday } from './types';
import { storageService } from './services/storage';
import { formatDateKey } from './helpers';
import { supabase, signOut } from './src/data/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Dummy session generator for Guest Mode
const createGuestSession = (): Session => ({
  access_token: 'guest-token',
  refresh_token: 'guest-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'guest-user-local',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'guest@demo.local',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    last_sign_in_at: '',
    app_metadata: { provider: 'email' },
    user_metadata: {
      avatar_url: '',
      full_name: 'Guest User'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
});

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<'calendar' | 'db_profiles' | 'db_shift_types' | 'db_days_assignments' | 'db_holidays' | 'db_notes' | 'db_tables'>('calendar');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sunset'>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>({});
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Record<string, Holiday>>({});

  const [isPainting, setIsPainting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftType | null>(null); // For edit modal
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      const guestStored = localStorage.getItem('shifter_guest_mode');
      if (guestStored === 'true') {
        setSession(createGuestSession());
        setAuthLoading(false);
        return;
      }

      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      if (supabaseSession) {
        setSession(supabaseSession);
      }
      setAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('shifter_guest_mode') !== 'true') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Data and Resolve Profile when Session Changes
  useEffect(() => {
    if (session?.user) {
      const userId = session.user.id;

      // Fetch Shift Types from DB
      const fetchShifts = async () => {
        const { data, error } = await supabase.from('shift_types').select('*').order('name');
        if (data) {
          const mapped: ShiftType[] = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.name.charAt(0).toUpperCase(), // Using first char from name as code if not in DB
            color: s.color || '#4f46e5',
            startTime: s.default_start?.substring(0, 5) || '',
            endTime: s.default_end?.substring(0, 5) || ''
          }));
          setShiftTypes(mapped);
          if (mapped.length > 0 && !selectedShiftTypeId) {
            setSelectedShiftTypeId(mapped[0].id);
          }
        }
      };

      setAssignments(storageService.getAssignments(userId));
      fetchShifts();

      // Fetch Holidays from DB
      const fetchHolidays = async () => {
        const { data } = await supabase.from('holidays').select('*');
        if (data) {
          const holidayMap: Record<string, Holiday> = {};
          data.forEach((h: Holiday) => {
            holidayMap[h.date] = h;
          });
          setHolidays(holidayMap);
        }
      };

      fetchHolidays();

      // Resolve Profile ID for DB sync
      const resolveProfile = async () => {
        if (localStorage.getItem('shifter_guest_mode') === 'true') return;

        // Try to find existing profile
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (profiles) {
          setProfileId(profiles.id);
        } else {
          // Create a default profile if not found
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ user_id: userId, name: session.user.user_metadata?.full_name || 'My Profile' }])
            .select()
            .single();

          if (newProfile) setProfileId(newProfile.id);
        }
      };
      resolveProfile();
    } else {
      setShiftTypes([]);
      setAssignments({});
      setProfileId(null);
    }
  }, [session, currentView]); // Refresh when view changes back to calendar

  // Persist and apply theme
  useEffect(() => {
    const saved = localStorage.getItem('shifter_theme') as 'light' | 'dark' | 'sunset' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('shifter_theme', theme);
  }, [theme]);

  // Shift management is now handled by the Database Hub (CRUD)

  const handlePaint = useCallback((date: Date) => {
    if (!session?.user) return;
    const key = formatDateKey(date);

    setAssignments((prev) => {
      const newAssignment: DayAssignment = {
        dateStr: key,
        shiftTypeId: selectedShiftTypeId,
        note: prev[key]?.note
      };
      return { ...prev, [key]: newAssignment };
    });

    const newAssignment: DayAssignment = {
      dateStr: key,
      shiftTypeId: selectedShiftTypeId,
      note: assignments[key]?.note
    };
    storageService.saveAssignment(session.user.id, newAssignment);

    // Database Sync: Upsert to 'days_assignments'
    if (profileId && localStorage.getItem('shifter_guest_mode') !== 'true') {
      supabase.from('days_assignments').upsert({
        profile_id: profileId,
        date: key,
        shift_type_id: selectedShiftTypeId,
        note: assignments[key]?.note
      }, { onConflict: 'profile_id,date' }).then(({ error }) => {
        if (error) console.error('DB Sync Error:', error.message);
      });
    }
  }, [selectedShiftTypeId, assignments, session, profileId]);

  const handleSignOut = async () => {
    if (localStorage.getItem('shifter_guest_mode') === 'true') {
      localStorage.removeItem('shifter_guest_mode');
      setSession(null);
    } else {
      await signOut();
    }
    setIsMenuOpen(false);
  };

  const handleGuestLogin = () => {
    localStorage.setItem('shifter_guest_mode', 'true');
    setSession(createGuestSession());
  };

  const handleThemeChange = (t: 'light' | 'dark' | 'sunset') => {
    setTheme(t);
  };

  // --- RENDER ---

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <i className="fa-solid fa-circle-notch fa-spin text-indigo-600 text-2xl"></i>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onGuestLogin={handleGuestLogin} />;
  }

  const activeShiftColor = shiftTypes.find(s => s.id === selectedShiftTypeId)?.color || '';

  return (
    <div
      className="h-full flex flex-col bg-white overflow-hidden app"
      data-theme={theme}
      style={{
        cursor: selectedShiftTypeId ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='fill:${activeShiftColor.replace('#', '%23')} opacity:0.8;'><circle cx='16' cy='16' r='12'/></svg>") 16 16, pointer` : 'default'
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        session={session}
        currentView={currentView}
        onChangeView={setCurrentView}
        onSignOut={handleSignOut}
        theme={theme}
        onChangeTheme={handleThemeChange}
      />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">

        {/* VIEW: CALENDAR */}
        {currentView === 'calendar' && (
          <>
            {/* Header */}
            <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] z-30 relative shrink-0">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-10 h-10 -ml-2 mr-1 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <i className="fa-solid fa-bars text-lg"></i>
                </button>

                <button
                  onClick={() => setIsDatePickerOpen(true)}
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
              onEdit={() => {
                setCurrentView('db_shift_types');
              }}
            />
          </>
        )}


        {/* CRUD VIEWS with Navigation Header */}
        {[
          { id: 'db_profiles', table: 'profiles', title: 'Profiles Management' },
          { id: 'db_shift_types', table: 'shift_types', title: 'Shift Types (SQL)' },
          { id: 'db_days_assignments', table: 'days_assignments', title: 'Assignments Master' },
          { id: 'db_holidays', table: 'holidays', title: 'Holidays Table' },
          { id: 'db_notes', table: 'notes', title: 'Raw Notes' }
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

        {currentView === 'db_tables' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center shadow-sm z-30 relative shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 -ml-2 mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <i className="fa-solid fa-bars text-lg"></i>
              </button>
              <h1 className="text-lg font-bold text-slate-800">Database Hub</h1>
            </header>
            <TablesOverview onBack={() => setCurrentView('calendar')} userId={session.user.id} />
          </div>
        )}
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        currentDate={currentDate}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={setCurrentDate}
      />
    </div>
  );
};

export default App;
