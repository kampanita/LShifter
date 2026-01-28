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
import { ShiftType, DayAssignment } from './types';
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
  const [currentView, setCurrentView] = useState<'calendar' | 'admin' | 'db_profiles' | 'db_shift_types' | 'db_days_assignments' | 'db_holidays' | 'db_notes' | 'db_tables'>('calendar');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sunset'>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>({});
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string | null>(null);

  const [isPainting, setIsPainting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftType | null>(null); // For edit modal
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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

  // 2. Load Data when Session Changes
  useEffect(() => {
    if (session?.user) {
      const userId = session.user.id;
      const loadedShifts = storageService.getShiftTypes(userId);
      setShiftTypes(loadedShifts);
      setAssignments(storageService.getAssignments(userId));

      if (loadedShifts.length > 0 && !selectedShiftTypeId) {
        setSelectedShiftTypeId(loadedShifts[0].id);
      }
    } else {
      setShiftTypes([]);
      setAssignments({});
    }
  }, [session]);

  // Persist and apply theme
  useEffect(() => {
    const saved = localStorage.getItem('shifter_theme') as 'light' | 'dark' | 'sunset' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('shifter_theme', theme);
  }, [theme]);

  // CRUD Operations
  const handleSaveShift = (shiftData: ShiftType) => {
    if (!session?.user) return;

    let updatedShifts;
    const exists = shiftTypes.find(s => s.id === shiftData.id);

    if (exists) {
      updatedShifts = shiftTypes.map(s => s.id === shiftData.id ? shiftData : s);
    } else {
      updatedShifts = [...shiftTypes, shiftData];
    }

    setShiftTypes(updatedShifts);
    storageService.saveShiftTypes(session.user.id, updatedShifts);

    // If we just created it, select it
    if (!exists) setSelectedShiftTypeId(shiftData.id);
  };

  const handleDeleteShift = (id: string) => {
    if (!session?.user) return;
    const updatedShifts = shiftTypes.filter(s => s.id !== id);
    setShiftTypes(updatedShifts);
    storageService.saveShiftTypes(session.user.id, updatedShifts);

    if (selectedShiftTypeId === id) {
      setSelectedShiftTypeId(null);
    }
  };

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
  }, [selectedShiftTypeId, assignments, session]);

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

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden app" data-theme={theme}>
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
                setEditingShift(null); // Create mode
                setIsModalOpen(true);
              }}
            />
          </>
        )}

        {/* VIEW: ADMIN / CRUD */}
        {currentView === 'admin' && (
          <>
            <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center shadow-sm z-30 relative shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 -ml-2 mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <i className="fa-solid fa-bars text-lg"></i>
              </button>
              <h1 className="text-lg font-bold text-slate-800">Manage Data</h1>
            </header>
            <ShiftManager
              shiftTypes={shiftTypes}
              onCreate={() => {
                setEditingShift(null);
                setIsModalOpen(true);
              }}
              onEdit={(shift) => {
                setEditingShift(shift);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteShift}
            />
          </>
        )}

        {currentView === 'db_profiles' && <DatabaseCRUD tableName="profiles" title="Profiles Management" />}
        {currentView === 'db_shift_types' && <DatabaseCRUD tableName="shift_types" title="Shift Types (Database)" />}
        {currentView === 'db_days_assignments' && <DatabaseCRUD tableName="days_assignments" title="Assignments Master" />}
        {currentView === 'db_holidays' && <DatabaseCRUD tableName="holidays" title="Holidays Table" />}
        {currentView === 'db_notes' && <DatabaseCRUD tableName="notes" title="Raw Notes" />}
        {currentView === 'db_tables' && <TablesOverview onBack={() => setCurrentView('calendar')} />}
      </div>

      {/* Modals are Global */}
      <EditShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
        editingShift={editingShift}
      />

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
